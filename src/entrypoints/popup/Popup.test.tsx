import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { fakeBrowser } from "wxt/testing";
import Popup from "./Popup";
import { CHANGELOG_KEY } from "@/utils/consts";
import { IChangelogEntry } from "@/utils/interfaces";

const mockChangelog: IChangelogEntry[] = [
  {
    timestamp: new Date().toISOString(),
    before: {
      extension_id: "test-extension",
      extension_name: "Test Extension",
      developer_name: "Old Developer",
      developer_website: "http://old.com",
      developer_email: "old@dev.com",
      offered_by_name: "Old Corp",
    },
    after: {
      extension_id: "test-extension",
      extension_name: "Test Extension",
      developer_name: "New Developer",
      developer_website: "http://new.com",
      developer_email: "new@dev.com",
      offered_by_name: "New Corp",
    },
  },
];

describe("Popup component", () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  it("should display the diff when changelog data is present", async () => {
    // Arrange
    await browser.storage.local.set({ [CHANGELOG_KEY]: mockChangelog });

    // Act
    render(<Popup />);

    // Assert
    expect(await screen.findByText("Before")).toBeInTheDocument();
    expect(await screen.findByText("After")).toBeInTheDocument();
    expect(screen.getByText(/Old Developer/)).toBeInTheDocument();
    expect(screen.getByText(/New Developer/)).toBeInTheDocument();
  });

  it('should clear the changelog when the clear button is clicked', async () => {
    // Arrange
    await browser.storage.local.set({ [CHANGELOG_KEY]: mockChangelog });
    render(<Popup />);
    expect(await screen.findByText("Before")).toBeInTheDocument();

    // Act
    const clearButton = screen.getByRole("button", { name: /CLEAR/i });
    fireEvent.click(clearButton);

    // Assert
    expect(await screen.findByText("No changes detected.")).toBeInTheDocument();
    const clearedChangelog = await browser.storage.local.get(CHANGELOG_KEY);
    expect(clearedChangelog[CHANGELOG_KEY]).toEqual([]);
  });
});
