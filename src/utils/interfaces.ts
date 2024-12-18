// for api v4 transition:
// https://mozilla.github.io/addons-server/topics/api/v4_frozen/addons.html#v4-addon-detail-object
export interface IExtensionDeveloperInformation {
  extension_id: string;
  extension_name: string;
  developer_name: string;
  // effectively doing conversion twice, making undefined into null and then back
  // (in background and then in diff vis), review whether I really want to be doing this
  developer_website: string | undefined;
  developer_email: string | undefined;
  offered_by_name: string;
}

export interface IApiResponse {
  ignored_extension_ids: string[];
  matched_extension_data: IExtensionDeveloperInformation[];
  unmatched_extension_ids: string[];
}

export interface IChangelogEntry {
  timestamp: string;
  before: IExtensionDeveloperInformation;
  after: IExtensionDeveloperInformation;
}

export interface ILastUpdatedData {
  timestamp: string;
}

export interface ChangelogData {
  updatedData: IChangelogEntry[];
  newLength: number;
}
