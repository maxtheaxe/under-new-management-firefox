import type { LocalizedUrl, LocalizedValue } from "@/utils/interfaces"

export const getLocaleValue: LocalizedValue = (
  localizedString,
  defaultLocale,
) => {
  if (
    !localizedString ||
    typeof localizedString !== "object" ||
    Array.isArray(localizedString)
  ) {
    return undefined
  }
  // we use en-US as the first locale
  if (localizedString["en-US"]) {
    return localizedString["en-US"]
  }
  // default locale is our second priority whatever it may be
  if (defaultLocale && localizedString[defaultLocale]) {
    return localizedString[defaultLocale]
  }
  // if we still havent found anything, at this point just return whatever pop ups first
  const locales = Object.keys(localizedString)
  if (locales.length > 0) {
    return localizedString[locales[0]]
  }
  return undefined
}

export const getLocaleUrl: LocalizedUrl = (
  localizedUrlObject,
  defaultLocale,
) => {
  if (!localizedUrlObject) {
    return undefined
  }

  // urls can apparently be nested. fascinating
  // i first went to the add-ons page to see what the addon object response is: https://mozilla.github.io/addons-server/topics/api/v4_frozen/addons.html#v4-addon-detail-object
  // as i scrolled, i found this:
  // "homepage (string|object|null) – The add-on homepage (See translated fields and Outgoing Links)."
  // "translated fields" led me to https://mozilla.github.io/addons-server/topics/api/v4_frozen/overview.html#v4-api-overview-translations
  // so something like homepage.url['en-US'] could totally be possible
  if ("url" in localizedUrlObject && localizedUrlObject.url) {
    // if we're dealing with strings just return as is
    if (typeof localizedUrlObject.url === "string") {
      return localizedUrlObject.url
    }

    // if it's an object though we fall back
    return getLocaleValue(localizedUrlObject.url, defaultLocale)
  }

  // if there's no url field assume we're just dealing w a localized string object
  if (
    typeof localizedUrlObject === "object" &&
    !("url" in localizedUrlObject)
  ) {
    return getLocaleValue(localizedUrlObject, defaultLocale)
  }
}