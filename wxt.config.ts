import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: "chrome",
  modules: ["@wxt-dev/module-react"],
  srcDir: "src",
  entrypointsDir: "entrypoints",
  manifestVersion: 3,
  manifest: {
    name: "extension ownership monitor",
    permissions: ["alarms", "management", "storage"],
    icons: {
      "16": "eom-logo16.png",
      "48": "eom-logo48.png",
      "128": "eom-logo128.png"
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
