import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: "chrome",
  modules: ["@wxt-dev/module-react"],
  srcDir: "src",
  entrypointsDir: "entrypoints",
  manifestVersion: 3,
  manifest: {
    name: "Under New Management",
    permissions: ["alarms", "management", "storage"],
    icons: {
      "16": "logo16.png",
      "48": "logo48.png",
      "128": "logo128.png"
    },
    action: {
      "default_popup": "popup/index.html"
    },
    vite: () => ({
      css: {
        // ensures PostCSS processes the CSS
        //
        postcss: "./postcss.config.js",
      },
    })
  },
});
