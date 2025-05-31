import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConverterSection from "../converter-section";
import { LanguageProvider } from "../../contexts/LanguageContext";

const renderWithLanguage = (component: React.ReactElement) => {
  return render(<LanguageProvider>{component}</LanguageProvider>);
};

describe("ConverterSection", () => {
  it("should render input field and convert button", async () => {
    const user = userEvent.setup();
    renderWithLanguage(<ConverterSection />);

    expect(screen.getByPlaceholderText(/type your message here/i)).toBeInTheDocument();
    
    // Type some text to make the NATO Alphabet heading appear
    const input = screen.getByPlaceholderText(/type your message here/i);
    await user.type(input, "A");
    
    expect(screen.getByText(/nato alphabet/i)).toBeInTheDocument();
  });

  it("should convert text to NATO alphabet", async () => {
    const user = userEvent.setup();
    renderWithLanguage(<ConverterSection />);

    const input = screen.getByPlaceholderText(/type your message here/i);
    await user.type(input, "ABC");

    // Look for the conversion result section specifically
    expect(screen.getByText("NATO Alphabet")).toBeInTheDocument();
    
    // Check for badges within the conversion section - use container querying
    const conversionSection = screen.getByText("NATO Alphabet").closest(".rounded-lg");
    expect(conversionSection).toBeInTheDocument();
    
    // Use getAllByText and verify we have at least one of each in badges
    expect(screen.getAllByText("Alpha").some(el => 
      el.closest(".bg-blue-100")
    )).toBe(true);
    expect(screen.getAllByText("Bravo").some(el => 
      el.closest(".bg-blue-100")
    )).toBe(true);
    expect(screen.getAllByText("Charlie").some(el => 
      el.closest(".bg-blue-100")
    )).toBe(true);
  });

  it("should handle empty input", async () => {
    const user = userEvent.setup();
    renderWithLanguage(<ConverterSection />);

    const input = screen.getByPlaceholderText(/type your message here/i);
    await user.clear(input);

    // Should not show the NATO Alphabet conversion section
    expect(screen.queryByText(/nato alphabet/i)).not.toBeInTheDocument();
    
    // Quick Reference should still be visible, but no conversion badges
    expect(screen.getByText(/quick reference/i)).toBeInTheDocument();
  });

  it("should handle mixed case input", async () => {
    const user = userEvent.setup();
    renderWithLanguage(<ConverterSection />);

    const input = screen.getByPlaceholderText(/type your message here/i);
    await user.type(input, "aBc");

    // Check for NATO words in the conversion badges
    expect(screen.getAllByText("Alpha").some(el => 
      el.closest(".bg-blue-100")
    )).toBe(true);
    expect(screen.getAllByText("Bravo").some(el => 
      el.closest(".bg-blue-100")
    )).toBe(true);
    expect(screen.getAllByText("Charlie").some(el => 
      el.closest(".bg-blue-100")
    )).toBe(true);
  });

  it("should handle numbers and special characters", async () => {
    const user = userEvent.setup();
    renderWithLanguage(<ConverterSection />);

    const input = screen.getByPlaceholderText(/type your message here/i);
    await user.type(input, "A1!");

    // Check for NATO words and non-letters in the conversion badges
    expect(screen.getAllByText("Alpha").some(el => 
      el.closest(".bg-blue-100")
    )).toBe(true);
    expect(screen.getAllByText("1").some(el => 
      el.closest(".bg-blue-100")
    )).toBe(true);
    expect(screen.getAllByText("!").some(el => 
      el.closest(".bg-blue-100")
    )).toBe(true);
  });

  it("should show pronunciation buttons for NATO words", async () => {
    const user = userEvent.setup();
    renderWithLanguage(<ConverterSection />);

    const input = screen.getByPlaceholderText(/type your message here/i);
    await user.type(input, "A");

    // Should show play button for pronunciation
    const playButton = screen.getByRole("button", { name: /play/i });
    expect(playButton).toBeInTheDocument();
  });

  it("should copy NATO alphabet to clipboard", async () => {
    const user = userEvent.setup();

    // Mock clipboard API
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: mockWriteText,
      },
      writable: true,
    });

    renderWithLanguage(<ConverterSection />);

    const input = screen.getByPlaceholderText(/type your message here/i);
    await user.type(input, "ABC");

    const copyButton = screen.getByRole("button", { name: /copy nato alphabet to clipboard/i });
    await user.click(copyButton);

    expect(mockWriteText).toHaveBeenCalledWith(
      "Alpha Bravo Charlie"
    );
  });

  it("should show NATO alphabet reference", () => {
    renderWithLanguage(<ConverterSection />);

    expect(screen.getByText(/quick reference/i)).toBeInTheDocument();

    // Should show some NATO alphabet letters
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("Bravo")).toBeInTheDocument();
  });

  it("should expand full alphabet reference", async () => {
    const user = userEvent.setup();
    renderWithLanguage(<ConverterSection />);

    const expandButton = screen.getByText(/view full alphabet/i);
    await user.click(expandButton);

    // Should show more letters after expanding
    expect(screen.getByText("Z")).toBeInTheDocument();
    expect(screen.getByText("Zulu")).toBeInTheDocument();
  });
});
