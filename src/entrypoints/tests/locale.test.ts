import { describe, expect, it, vi } from "vitest"
import * as background from "@/entrypoints/background"
import { getLocaleUrl, getLocaleValue } from "@/utils/locales"

describe("getLocaleValue", () => {
  it("should use default locale when en-US is not available", async () => {
    // Arrange
    const data = {
      id: "dummy",
      default_locale: "es-ES",
      name: {
        "es-ES": "Español Extension",
        "fr-FR": "Extension Française",
      },
      authors: [{ id: "person" }],
      homepage: {
        url: {
          "es-ES": "https://ejemplo.com",
          "fr-FR": "https://exemple.com",
        },
      },
      support_email: {
        "es-ES": "soporte@ejemplo.com",
        "fr-FR": "support@exemple.com",
      },
    }

    const fakeFetch = (_url: unknown) => {
      return new Response(JSON.stringify(data))
    }

    vi.stubGlobal("fetch", fakeFetch)

    // Act
    const result = await background.extensionLookup(["dummy"], "")

    // Assert
    expect(result.matched_extension_data).toHaveLength(1)
    const extension = result.matched_extension_data[0]
    expect(extension.extension_name).toBe("Español Extension")
    expect(extension.developer_website).toBe("https://ejemplo.com")
    expect(extension.developer_email).toBe("soporte@ejemplo.com")
  })

  it("should prefer en-US over default locale", async () => {
    // Arrange
    const data = {
      id: "dummy",
      default_locale: "es-ES",
      name: {
        "en-US": "English Extension",
        "es-ES": "Español Extension",
      },
      authors: [{ id: "person" }],
      homepage: {
        url: {
          "en-US": "https://example.com",
          "es-ES": "https://ejemplo.com",
        },
      },
      support_email: {
        "en-US": "support@example.com",
        "es-ES": "soporte@ejemplo.com",
      },
    }

    const fakeFetch = (_url: unknown) => {
      return new Response(JSON.stringify(data))
    }

    vi.stubGlobal("fetch", fakeFetch)

    // Act
    const result = await background.extensionLookup(["dummy"], "")

    // Assert
    expect(result.matched_extension_data).toHaveLength(1)
    const extension = result.matched_extension_data[0]
    expect(extension.extension_name).toBe("English Extension")
    expect(extension.developer_website).toBe("https://example.com")
    expect(extension.developer_email).toBe("support@example.com")
  })

  it("should fallback to any locale when neither en-US nor default is available", async () => {
    // Arrange
    const data = {
      id: "dummy",
      default_locale: "es-ES", // Not available in name object
      name: {
        "fr-FR": "Extension Française",
      },
      authors: [{ id: "person" }],
      homepage: {
        url: {
          "fr-FR": "https://exemple.com",
        },
      },
    }

    const fakeFetch = (_url: unknown) => {
      return new Response(JSON.stringify(data))
    }

    vi.stubGlobal("fetch", fakeFetch)

    // Act
    const result = await background.extensionLookup(["dummy"], "")

    // Assert
    expect(result.matched_extension_data).toHaveLength(1)
    const extension = result.matched_extension_data[0]
    expect(extension.extension_name).toBe("Extension Française")
    expect(extension.developer_website).toBe("https://exemple.com")
  })

  it("should return en-US value when available", () => {
    const localizedObj = {
      "en-US": "English value",
      "es-ES": "Spanish value",
      "fr-FR": "French value",
    }

    expect(getLocaleValue(localizedObj)).toBe("English value")
  })

  it("should return default locale value when en-US is not available", () => {
    const localizedObj = {
      "es-ES": "Spanish value",
      "fr-FR": "French value",
    }

    expect(getLocaleValue(localizedObj, "es-ES")).toBe("Spanish value")
  })

  it("should return any available locale when neither en-US nor default is available", () => {
    const localizedObj = {
      "fr-FR": "French value",
      "de-DE": "German value",
    }

    expect(getLocaleValue(localizedObj, "es-ES")).toBe("French value")
  })

  it("should prefer en-US over default locale", () => {
    const localizedObj = {
      "en-US": "English value",
      "es-ES": "Spanish value",
    }

    expect(getLocaleValue(localizedObj, "es-ES")).toBe("English value")
  })

  it("should return undefined for null or undefined input", () => {
    expect(getLocaleValue(null)).toBeUndefined()
    expect(getLocaleValue(undefined)).toBeUndefined()
  })

  it("should return undefined for empty object", () => {
    expect(getLocaleValue({})).toBeUndefined()
  })

  it("should return undefined for non-object input", () => {
  expect(getLocaleValue("not an object" as unknown as Record<string, string> | null | undefined)).toBeUndefined()
  expect(getLocaleValue(123 as unknown as Record<string, string> | null | undefined)).toBeUndefined()
  })

  it("should handle case when default locale is undefined", () => {
    const localizedObj = {
      "fr-FR": "French value",
    }

    expect(getLocaleValue(localizedObj)).toBe("French value")
  })
})

describe("getLocalizedUrl", () => {
  it("should handle nested URL structure with en-US", () => {
    const urlObj = {
      url: {
        "en-US": "https://example.com/en",
        "es-ES": "https://example.com/es",
      },
    }

    expect(getLocaleUrl(urlObj)).toBe("https://example.com/en")
  })

  it("should handle nested URL structure with default locale", () => {
    const urlObj = {
      url: {
        "es-ES": "https://example.com/es",
        "fr-FR": "https://example.com/fr",
      },
    }

    expect(getLocaleUrl(urlObj, "es-ES")).toBe("https://example.com/es")
  })

  it("should handle direct localized object structure", () => {
    const urlObj = {
      "en-US": "https://example.com/en",
      "es-ES": "https://example.com/es",
    }

    expect(getLocaleUrl(urlObj)).toBe("https://example.com/en")
  })

  it("should return undefined for null or undefined input", () => {
    expect(getLocaleUrl(null)).toBeUndefined()
    expect(getLocaleUrl(undefined)).toBeUndefined()
  })

  it("should handle empty url object", () => {
    const urlObj = {
      url: {},
    }

    expect(getLocaleUrl(urlObj)).toBeUndefined()
  })

  it("should handle missing url property", () => {
    const urlObj = {}

    expect(getLocaleUrl(urlObj)).toBeUndefined()
  })

  it("should handle real-world Spanish language pack example", () => {
    // Based on the example from the issue
    const urlObj = {
      url: {
        "es-ES": "https://example.com/es",
        // No en-US available
      },
    }

    expect(getLocaleUrl(urlObj, "es-ES")).toBe("https://example.com/es")
  })
})
