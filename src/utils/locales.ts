import { LocalizedValue } from "@/utils/interfaces"

export const getLocaleValue: LocalizedValue = (
  localizedString,
  defaultLocale,
) => {
  if (!localizedString) {
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
