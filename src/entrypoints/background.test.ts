import { beforeEach, describe, expect, it, vi } from "vitest";
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

describe("extensionLookup", () => {
    beforeEach(() => fakeBrowser.reset());

    it("should not make any requests on an empty array", async () => {
        // Arrange
        const fakeFetch = () => {
            throw new Error("fetch() invoked");
        };

        vi.stubGlobal("fetch", fakeFetch);

        // Act
        const result = await background.extensionLookup([], "");

        // Assert
        expect(result.ignored_extension_ids).toHaveLength(0);
        expect(result.matched_extension_data).toHaveLength(0);
        expect(result.unmatched_extension_ids).toHaveLength(0);
    });

    it("should handle not found extensions", async () => {
        // Arrange
        const extensions = [
            Math.random().toString(36),
            Math.random().toString(36),
        ];

        const fakeFetch = (url_: unknown) => {
            let url: string;

            if (url_ instanceof URL) {
                url = url_.toString();
            } else if (typeof url_ !== "string") {
                throw "invalid fetch input";
            } else {
                url = url_;
            }

            if (url.includes(extensions[0])) {
                return new Response("{}", { status: 404 });
            }

            return new Response("{}", { status: 429 });
        };

        vi.stubGlobal("fetch", fakeFetch);

        // Act
        const result = await background.extensionLookup(extensions, "");

        // Assert
        expect(result.ignored_extension_ids).toHaveLength(1);
        expect(result.matched_extension_data).toHaveLength(0);
        expect(result.unmatched_extension_ids).toHaveLength(1);
        expect(result.unmatched_extension_ids[0]).toBe(extensions[0]);
        expect(result.ignored_extension_ids[0]).toBe(extensions[1]);
    });

    it("should return valid info on ok response", async () => {
        // Arrange
        const expected = [
            {
                id: "dummy",
                name: { "en-US": "dummy" },
                authors: [
                    { id: "person" },
                ],
            },
        ];

        const fakeFetch = (url_: unknown) => {
            let url: string;

            if (url_ instanceof URL) {
                url = url_.toString();
            } else if (typeof url_ !== "string") {
                throw "invalid fetch input";
            } else {
                url = url_;
            }

            const ext = expected.find((e) => url.includes(e.id));
            if (!ext) {
                throw "invalid request";
            }

            return new Response(JSON.stringify(ext));
        };

        vi.stubGlobal("fetch", fakeFetch);

        // Act
        const result = await background.extensionLookup(
            expected.map((e) => e.id),
            "",
        );

        // Assert
        expect(result.ignored_extension_ids).toHaveLength(0);
        expect(result.unmatched_extension_ids).toHaveLength(0);
        expect(result.matched_extension_data).toHaveLength(expected.length);

        for (const ext of expected) {
            const matching = result.matched_extension_data.find(
                (e) => e.extension_id === ext.id,
            );

            expect(matching).toBeDefined();
            expect(matching?.developer_name).toBe(ext.authors[0].id);
            expect(matching?.extension_name).toBe(ext.name["en-US"]);
        }
    });

    it("should handle a broken response", async () => {
        // Arrange
        const fakeFetch = (url_: unknown) => {
            return new Response("Bad Gateway", { status: 502 });
        };

        vi.stubGlobal("fetch", fakeFetch);

        // Act
        const result = await background.extensionLookup(["x"], "");

        // Assert
        expect(result.ignored_extension_ids).toHaveLength(1);
        expect(result.unmatched_extension_ids).toHaveLength(0);
        expect(result.matched_extension_data).toHaveLength(0);
    });

    it("should handle en-US locale missing", async () => {
        // Arrange
        const data = {
            id: "dummy",
            name: { "en-AU": "uoᴉsuǝʇxǝ" },
            authors: [
                { id: "person" },
            ],
        };

        const fakeFetch = (url_: unknown) => {
            return new Response(JSON.stringify(data));
        };

        vi.stubGlobal("fetch", fakeFetch);

        // Act
        const result = await background.extensionLookup(["dummy"], "");

        // Assert
        expect(result.ignored_extension_ids).toHaveLength(0);
        expect(result.unmatched_extension_ids).toHaveLength(0);
        expect(result.matched_extension_data).toHaveLength(1);
        expect(result.matched_extension_data[0].extension_name).toBe(
            data.name["en-AU"],
        );
    });

    it("should check that the response is for the right extension", async () => {
        // Arrange
        const data = {
            id: "different id",
            name: { "en-US": "dummy" },
            authors: [
                { id: "person" },
            ],
        };

        const fakeFetch = (url_: unknown) => {
            return new Response(JSON.stringify(data));
        };

        vi.stubGlobal("fetch", fakeFetch);

        // Act
        const result = await background.extensionLookup(["dummy"], "");

        // Assert
        expect(
            result.unmatched_extension_ids.length +
                result.ignored_extension_ids.length,
        ).toBe(1);
        expect(result.matched_extension_data).toHaveLength(0);
        expect(result.matched_extension_data?.[0]?.extension_id).not.toBe(
            data.id,
        );
    });
});

describe("handleChangelog", () => {
    it("should handle developer name changes", async () => {
        // Arrange
        const oldData = {
            ignored_extension_ids: [],
            matched_extension_data: [
                {
                    extension_id: "a",
                    extension_name: "dummy",
                    developer_name: "dummy",
                    offered_by_name: "dummy",
                },
            ],
            unmatched_extension_ids: [],
        };

        const newResponse = {
            ignored_extension_ids: [],
            matched_extension_data: [
                {
                    extension_id: "a",
                    extension_name: "dummy",
                    developer_name: "different",
                    offered_by_name: "dummy",
                    developer_website: undefined,
                    developer_email: undefined,
                },
            ],
            unmatched_extension_ids: [],
        };

        await browser.storage.local.set({
            [PREVIOUS_API_DATA_KEY]: oldData,
        });

        // Act
        const result = await background.handleChangelog(newResponse);

        // Assert
        expect(result.newLength).toBe(1);
        expect(result.updatedData[0].before.developer_name).toBe(
            oldData.matched_extension_data[0].developer_name,
        );
        expect(result.updatedData[0].after.developer_name).toBe(
            newResponse.matched_extension_data[0].developer_name,
        );
    });

    it("should ignore extensions with no changes", async () => {
        // Arrange
        const data = {
            ignored_extension_ids: [],
            matched_extension_data: [
                {
                    extension_id: "a",
                    extension_name: "dummy",
                    developer_name: "dummy",
                    offered_by_name: "dummy",
                    developer_website: undefined,
                    developer_email: undefined,
                },
            ],
            unmatched_extension_ids: [],
        };

        await browser.storage.local.set({
            [PREVIOUS_API_DATA_KEY]: data,
        });

        // Act
        const result = await background.handleChangelog(data);

        // Assert
        expect(result.newLength).toBe(0);
        expect(result.updatedData).toHaveLength(0);
    });
});
