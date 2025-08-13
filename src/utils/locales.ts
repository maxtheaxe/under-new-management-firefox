export const getLocaleValue = (
  obj: Record<string, any>,
  field: string,
  defaultLocale: string
) => {
  // we use en-US as the first locale
  if (obj[field] && obj[field]["en-US"]) return obj[field]["en-US"]

  // default locale is our second priority whatever it may be
  if (obj[field] && obj[field][defaultLocale]) return obj[field][defaultLocale]

  // if we still havent found anything, at this point just return whatevers available first
  if (obj[field] && typeof obj[field] === "object") {
    const locales = Object.keys(obj[field])
    if (locales.length > 0) return obj[field][locales[0]]
  }

  return null
}
