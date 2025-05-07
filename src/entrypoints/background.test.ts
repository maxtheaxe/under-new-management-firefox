import { beforeEach, describe, expect, it } from "vitest";
import { fakeBrowser } from "wxt/testing";
import * as background from "./background";

describe("handleAlarms", () => {
    beforeEach(() => fakeBrowser.reset());

    it("should create an alarm on invocation", async () => {
        // Arrange
        const before = await browser.alarms.get("test");

        // Act
        background.handleAlarms(1, "test", async () => {});
        const after = await browser.alarms.get("test");

        // Assert
        expect(after).toBeDefined();
        expect(after.name).toBe("test");
        expect(after.periodInMinutes).toBe(1);
    });
});
