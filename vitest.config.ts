import { defineConfig } from "vitest/config";
import { WxtVitest } from "wxt/testing";

export default defineConfig({
    plugins: [WxtVitest()],
    test: {
        environment: "jsdom",
        setupFiles: "./vitest.setup.ts",
    }
});
