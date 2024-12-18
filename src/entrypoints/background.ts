import * as _ from "lodash-es";
import {
  ALARM_INTERVAL_MIN,
  AMO_ADDON_LOOKUP_ENDPOINT,
  CHANGELOG_KEY,
  LAST_CHECK_KEY,
  PREVIOUS_API_DATA_KEY,
} from "@/utils/consts";
import {
  ChangelogData,
  IApiResponse,
  IChangelogEntry,
  IExtensionDeveloperInformation
} from "@/utils/interfaces";

/**
 * Sets up a daily alarm and listener, executes a
 * callback when (listener is) triggered.
 *
 * @param alarmInterval - Interval in minutes for the alarm.
 * @param alarmName - The name of the alarm to be created.
 * @param updateDeveloperData - Async callback to execute on alarm trigger.
 */
export function handleAlarms(
    alarmInterval: number,
    alarmName: string,
    updateDeveloperData: () => Promise<void>
) {
  // set an alarm to fire once per day (https://stackoverflow.com/a/44415814/4513452)
  browser.alarms.create(alarmName, { periodInMinutes: alarmInterval });

  // listen for the alarm and execute some action
  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === alarmName) {
      console.log("checking browser extensions for ownership changes...");
      updateDeveloperData();
    }
  });
}

/**
 * Fetches metadata for a list of installed extensions from AMO
 * API and categorizes them based on the response.
 *
 * @param installedExtensionIds - A list of extension IDs to look up.
 * @param apiEndpoint - The API endpoint for fetching extension data.
 * @returns An object containing categorized extension IDs and metadata.
 */
export async function extensionLookup(
    installedExtensionIds: string[],
    apiEndpoint: string,
): Promise<IApiResponse> {
  const failedExtensionIds = [];
  const successfulExtensionIds: IExtensionDeveloperInformation[] = [];
  const notFoundExtensionIds = [];

  // TODO: switch to AMO API v4 (which is frozen, v5 could technically change)
  //  https://mozilla.github.io/addons-server/topics/api/v4_frozen/addons.html#detail
  for (const extensionId of installedExtensionIds) {
    const response = await fetch(
      `${apiEndpoint}${extensionId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // TODO: add proper typing for AMO responses (see: ts-ignore below)
    const addonInfo = await response.json();

    if (response.status === 404) {
      notFoundExtensionIds.push(extensionId);
    } else if (response.status !== 200) {
      // TODO: add handling for lookups caused by
      //  different problems (e.g. rate limit, etc.)
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
        // @ts-ignore
        developer_name: addonInfo.authors.map(u => u.id).join(', '),
        developer_website: addonInfo.homepage?.url['en-US'],
        developer_email: addonInfo.support_email?.['en-US'],
        // TODO: potentially swap to ID (but that that point,
        //  should change schema altogether and break w chrome)
        // author display names as string list "(x,x,x)"
        // @ts-ignore
        offered_by_name: addonInfo.authors.map(u => u.name).join(', '),
      });
    }
  }
  return {
    ignored_extension_ids: failedExtensionIds,
    matched_extension_data: successfulExtensionIds,
    unmatched_extension_ids: notFoundExtensionIds,
  }
}

/**
 * Generates updated changelog based on the comparison of latest and
 * previously-retrieved API data, appends that to the existing changelog.
 *
 * @param currentApiData - The latest API response data.
 * @returns An object containing the updated changelog entries and the count of new entries.
 */
export async function handleChangelog(
    currentApiData: IApiResponse
): Promise<ChangelogData> {
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
  return {
    updatedData: [
      ...newChangelogData,
      ...changelogData,
    ],
    newLength: newChangelogData.length
  }
}

/**
 * Compares latest and previously-retrieved API data to generate
 * new changelog entries in scenarios which extension details have changed.
 *
 * @param previousApiData - The API data from the previous state.
 * @param currentApiData - The latest API data for comparison.
 * @returns An array of changelog entries for extensions with updated data.
 */
export function generateNewChangelogEntries(
  previousApiData: IApiResponse,
  currentApiData: IApiResponse
): IChangelogEntry[] {
  const timestamp = new Date().toISOString();
  const newChangelogEntries: IChangelogEntry[] = [];
  // create a map for quick lookup of current extension data by extension_id
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
    // proceed if we have a match in the current extension data
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

/**
 * Updates the browser action badge with the number of new
 * (not-yet-viewed/cleared) changelog entries.
 *
 * @param changelogLength - The number of new changelog entries to display on the badge.
 */
export function updateBadge(changelogLength: number) {
  let badgeText: string = "";
  if (changelogLength > 0) {
    badgeText = changelogLength.toString();
  }
  browser.action.setBadgeText({ text: badgeText });
}

/**
 * Updates local storage with the latest changelog,
 * API data, and the last check timestamp.
 *
 * @param updatedChangelog - The updated array of changelog entries.
 * @param changelogLength - The number of new changelog entries.
 * @param currentApiData - The latest API response data to store.
 */
export function updateStorage(
    updatedChangelog: IChangelogEntry[],
    changelogLength: number,
    currentApiData: IApiResponse
) {
  if (changelogLength > 0) {
    browser.storage.local.set({ [CHANGELOG_KEY]: updatedChangelog });
  }
  browser.storage.local.set({ [PREVIOUS_API_DATA_KEY]: currentApiData });
  browser.storage.local.set({
    [LAST_CHECK_KEY]: {
      timestamp: new Date().toISOString(),
    },
  });
}

export default defineBackground(() => {
  handleAlarms(ALARM_INTERVAL_MIN, "dailyExtensionAlarm", updateDeveloperData);

  async function updateDeveloperData() {
    const installedExtensionIds = (await browser.management.getAll()).map(
      (x) => x.id
    );
    const currentApiData: IApiResponse = await extensionLookup(
        installedExtensionIds,
        AMO_ADDON_LOOKUP_ENDPOINT
    );
    console.log("currentApiData: ", currentApiData);
    const changelogData: ChangelogData =
        await handleChangelog(currentApiData);
    updateBadge(changelogData.updatedData.length);
    updateStorage(
        changelogData.updatedData,
        changelogData.newLength,
        currentApiData
    );
  }

  updateDeveloperData();

})
