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

export interface IAMOAuthor {
	id: number;
	name: string;
	url: string;
	username: string;
	picture_url?: string;
}

export interface IAMOAddonResponse {
	id: string;
	authors: IAMOAuthor[];
	name: string | { [locale: string]: string };
	default_locale: string;
	homepage?: string | { [locale: string]: string } | null;
	support_email?: string | { [locale: string]: string } | null;
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

export type LocalizedValue = (
	localizedString: Record<string, string> | undefined | null,
	defaultLocale?: string,
) => string | undefined | null;

export type LocalizedUrl = (
	localizedUrl:
		| { url: Record<string, string> }
		| Record<string, string>
		| undefined
		| null,
	defaultLocale?: string,
) => string | undefined | null;
