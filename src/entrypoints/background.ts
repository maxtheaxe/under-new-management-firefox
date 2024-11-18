import * as _ from "lodash-es";
import {
  ALARM_INTERVAL_MIN,
  CHANGELOG_KEY,
  LAST_CHECK_KEY,
  PREVIOUS_API_DATA_KEY,
  RED_BADGE_COLOR,
} from "../utils/consts";
import {IApiResponse, IChangelogEntry, IExtensionDeveloperInformation} from "../utils/interfaces";

export default defineBackground(() => {
  // Set an alarm to fire every hour
  browser.alarms.create("hourlyAlarm", { periodInMinutes: ALARM_INTERVAL_MIN });

  // (browser.action ?? browser.browserAction).setBadgeBackgroundColor({ color: RED_BADGE_COLOR });

  // Listen for the alarm and execute some action
  browser.alarms.onAlarm.addListener(() => {
    updateDeveloperData();
  });

  async function updateDeveloperData() {
    const installedExtensionIds = (await browser.management.getAll()).map(
      (x) => x.id
    );

    const failedExtensionIds = [];
    const successfulExtensionIds: IExtensionDeveloperInformation[] = [];
    const notFoundExtensionIds = [];

    for (const extensionId of installedExtensionIds) {
      const response = await fetch(
        `https://addons.mozilla.org/api/v5/addons/addon/${extensionId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const addonInfo = await response.json();

      if (response.status === 404) {
        notFoundExtensionIds.push(extensionId);
      } else if (response.status !== 200) {
        failedExtensionIds.push(extensionId);
      } else {
        // build author name strings
        // (sticking with save format of upstream chrome extension)
        // TODO: is this the best format for storing names? do we (I) want
        //  to diverge from the chrome version in storage format?
        // TODO: handle other locales
        successfulExtensionIds.push({
          extension_id: addonInfo.id, // use AMO id instead of local id
          extension_name: addonInfo.name['en-US'],
          // author IDs as string list "(x,x,x)"
          developer_name: addonInfo.authors.map(u => u.id).join(', '),
          developer_website: addonInfo.homepage?.url['en-US'],
          developer_email: addonInfo.support_email?.['en-US'],
          // author display names as string list "(x,x,x)"
          offered_by_name: addonInfo.authors.map(u => u.name).join(', '),
        });

      }
    }

    const currentApiData: IApiResponse = {
      ignored_extension_ids: failedExtensionIds,
      matched_extension_data: successfulExtensionIds,
      unmatched_extension_ids: notFoundExtensionIds,
    };

    console.log("currentApiData: ", currentApiData);

    const previousApiData: IApiResponse = (
      await browser.storage.local.get(PREVIOUS_API_DATA_KEY)
    )[PREVIOUS_API_DATA_KEY] ?? {
      unmatched_extension_ids: [],
      ignored_extension_ids: [],
      matched_extension_data: [],
    };

    const changelogData: IChangelogEntry[] =
      (await browser.storage.local.get(CHANGELOG_KEY))[CHANGELOG_KEY] ?? [];

    const newChangelogData = generateNewChangelogEntries(
      previousApiData,
      currentApiData
    );

    const updatedChangelogData: IChangelogEntry[] = [
      ...newChangelogData,
      ...changelogData,
    ];

    let badgeText: string = "";
    if (updatedChangelogData.length > 0) {
      badgeText = updatedChangelogData.length.toString();
    }

    if (newChangelogData.length > 0) {
      browser.storage.local.set({ [CHANGELOG_KEY]: updatedChangelogData });
    }

    browser.browserAction.setBadgeText({ text: badgeText });

    browser.storage.local.set({ [PREVIOUS_API_DATA_KEY]: currentApiData });

    browser.storage.local.set({
      [LAST_CHECK_KEY]: {
        timestamp: new Date().toISOString(),
      },
    });
  }

  function generateNewChangelogEntries(
    previousApiData: IApiResponse,
    currentApiData: IApiResponse
  ): IChangelogEntry[] {
    const timestamp = new Date().toISOString();

    const newChangelogEntries: IChangelogEntry[] = [];

    // Create a Map for quick lookup of current extension data by extension_id
    const currentExtensionsMap = new Map(
      currentApiData.matched_extension_data.map((extension) => [
        extension.extension_id,
        extension,
      ])
    );

    for (const previousExtensionData of previousApiData.matched_extension_data) {
      const currentExtensionData = currentExtensionsMap.get(
        previousExtensionData.extension_id
      );

      console.log(previousExtensionData, currentExtensionData);

      // Proceed if we have a match in the current extension data
      if (
        currentExtensionData &&
        !_.isEqual(previousExtensionData, currentExtensionData)
      ) {
        newChangelogEntries.push({
          timestamp,
          before: previousExtensionData,
          after: currentExtensionData,
        });
      }
    }

    return newChangelogEntries;
  }

  updateDeveloperData();

})
