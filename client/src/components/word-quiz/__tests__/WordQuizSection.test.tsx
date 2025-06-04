import type { ReactNode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/contexts/language-context';
import WordQuizSection from '../WordQuizSection';

// Mock external dependencies that are not core to the component behavior
vi.mock('@/hooks/use-speech-recognition', () => ({
  useSpeechRecognition: () => ({
    isListening: false,
    isProcessing: false,
    speechSupported: true,
    interimTranscript: '',
    error: null,
    startListening: vi.fn(),
    stopListening: vi.fn(),
    clearError: vi.fn(),
  }),
}));

// Test wrapper with providers
function TestWrapper({ children }: { children: ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>;
}

function renderWithProviders(component: ReactNode) {
  return render(component, { wrapper: TestWrapper });
}

describe('wordQuizSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('component rendering', () => {
    it('should render the word quiz section with all components', async () => {
      renderWithProviders(<WordQuizSection />);

      // Wait for initialization
      await waitFor(() => {
        expect(screen.getByText('Word Quiz')).toBeInTheDocument();
      });

      // Check for main components
      expect(screen.getByText('Your NATO Alphabet Input')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(
          'Enter NATO words: "Alpha Bravo Charlie..."'
        )
      ).toBeInTheDocument();
    });

    it('should show the current word display', async () => {
      renderWithProviders(<WordQuizSection />);

      await waitFor(() => {
        expect(screen.getByText('Word Quiz')).toBeInTheDocument();
      });

      // Should show a word (we can't predict which one, but there should be text)
      // Find any element with class font-mono and non-empty text
      const fontMonoEls = document.querySelectorAll('.font-mono');
      let found = false;
      fontMonoEls.forEach((el) => {
        if (el.textContent && el.textContent.trim().length > 0) {
          found = true;
        }
      });
      expect(found).toBe(true);
    });

    it('should render quiz action buttons', async () => {
      renderWithProviders(<WordQuizSection />);

      await waitFor(() => {
        expect(screen.getByText('Word Quiz')).toBeInTheDocument();
      });

      // Look for action buttons
      expect(
        screen.getByRole('button', { name: /check/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /new random word/i })
      ).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should allow user to input NATO words', async () => {
      renderWithProviders(<WordQuizSection />);

      await waitFor(() => {
        expect(screen.getByText('Word Quiz')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(
        'Enter NATO words: "Alpha Bravo Charlie..."'
      );

      fireEvent.change(textarea, { target: { value: 'Alpha Bravo Charlie' } });

      expect(textarea).toHaveValue('Alpha Bravo Charlie');
    });

    it('should allow generating a new word', async () => {
      renderWithProviders(<WordQuizSection />);

      await waitFor(() => {
        expect(screen.getByText('Word Quiz')).toBeInTheDocument();
      });

      const newWordButton = screen.getByRole('button', {
        name: /new random word/i,
      });

      // Should not crash when clicking new word
      expect(() => {
        fireEvent.click(newWordButton);
      }).not.toThrow();

      // Should still show the quiz
      expect(screen.getByText('Word Quiz')).toBeInTheDocument();
    });

    it('should handle check answer functionality', async () => {
      renderWithProviders(<WordQuizSection />);

      await waitFor(() => {
        expect(screen.getByText('Word Quiz')).toBeInTheDocument();
      });

      // Enable custom mode first
      const customModeButton = screen.getByRole('button', { name: /custom/i });
      fireEvent.click(customModeButton);

      // Set a custom word first for predictable testing
      const customWordInput = screen.getByPlaceholderText(
        'Enter your word or phrase...'
      );
      fireEvent.change(customWordInput, { target: { value: 'CAT' } });

      const useWordButton = screen.getByRole('button', {
        name: /use this word/i,
      });
      fireEvent.click(useWordButton);

      await waitFor(() => {
        const wordDisplay = document.querySelector('.font-mono');
        expect(wordDisplay?.textContent).toBe('CAT');
      });

      // Enter NATO input
      const textarea = screen.getByPlaceholderText(
        'Enter NATO words: "Alpha Bravo Charlie..."'
      );
      fireEvent.change(textarea, { target: { value: 'Charlie Alpha Tango' } });

      // Check answer - should not crash
      const checkButton = screen.getByRole('button', { name: /check/i });
      expect(() => {
        fireEvent.click(checkButton);
      }).not.toThrow();

      // Should show results (may take time for state update)
      await waitFor(
        () => {
          expect(screen.getByText(/perfect/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('should allow using custom words', async () => {
      renderWithProviders(<WordQuizSection />);

      await waitFor(() => {
        expect(screen.getByText('Word Quiz')).toBeInTheDocument();
      });

      // Enable custom mode first
      const customModeButton = screen.getByRole('button', { name: /custom/i });
      fireEvent.click(customModeButton);

      const customWordInput = screen.getByPlaceholderText(
        'Enter your word or phrase...'
      );
      fireEvent.change(customWordInput, { target: { value: 'HELLO' } });

      const useWordButton = screen.getByRole('button', {
        name: /use this word/i,
      });
      fireEvent.click(useWordButton);

      await waitFor(() => {
        const wordDisplay = document.querySelector('.font-mono');
        expect(wordDisplay?.textContent).toBe('HELLO');
      });
    });
  });

  describe('quiz flow', () => {
    it('should complete a full quiz cycle', async () => {
      renderWithProviders(<WordQuizSection />);

      await waitFor(() => {
        expect(screen.getByText('Word Quiz')).toBeInTheDocument();
      });

      // 1. Enable custom mode first
      const customModeButton = screen.getByRole('button', { name: /custom/i });
      fireEvent.click(customModeButton);

      // 2. Use a custom word for predictable testing
      const customWordInput = screen.getByPlaceholderText(
        'Enter your word or phrase...'
      );
      fireEvent.change(customWordInput, { target: { value: 'CAT' } });

      const useWordButton = screen.getByRole('button', {
        name: /use this word/i,
      });
      fireEvent.click(useWordButton);

      await waitFor(() => {
        const wordDisplay = document.querySelector('.font-mono');
        expect(wordDisplay?.textContent).toBe('CAT');
      });

      // 2. Enter NATO input
      const textarea = screen.getByPlaceholderText(
        'Enter NATO words: "Alpha Bravo Charlie..."'
      );
      fireEvent.change(textarea, { target: { value: 'Charlie Alpha Tango' } });

      // 3. Check answer
      const checkButton = screen.getByRole('button', { name: /check/i });
      fireEvent.click(checkButton);

      // 4. Should show results
      await waitFor(() => {
        expect(screen.getByText(/perfect/i)).toBeInTheDocument();
      });

      // 5. Should be able to retry
      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);

      // 6. Should reset to input state
      expect(textarea).toHaveValue('');
    });

    it('should show live scoring as user types', async () => {
      renderWithProviders(<WordQuizSection />);

      await waitFor(() => {
        expect(screen.getByText('Word Quiz')).toBeInTheDocument();
      });

      // Enable custom mode first
      const customModeButton = screen.getByRole('button', { name: /custom/i });
      fireEvent.click(customModeButton);

      // Use a custom word
      const customWordInput = screen.getByPlaceholderText(
        'Enter your word or phrase...'
      );
      fireEvent.change(customWordInput, { target: { value: 'CAT' } });

      const useWordButton = screen.getByRole('button', {
        name: /use this word/i,
      });
      fireEvent.click(useWordButton);

      await waitFor(() => {
        const wordDisplay = document.querySelector('.font-mono');
        expect(wordDisplay?.textContent).toBe('CAT');
      });

      // Start typing NATO input
      const textarea = screen.getByPlaceholderText(
        'Enter NATO words: "Alpha Bravo Charlie..."'
      );
      fireEvent.change(textarea, { target: { value: 'Charlie' } });

      // Should show live score (partial) - but don't assert on specific text
      // as it may vary based on implementation
      await waitFor(() => {
        expect(screen.getByText(/live score/i)).toBeInTheDocument();
      });
    });
  });

  describe('accessibility', () => {
    it('should have proper accessibility attributes', async () => {
      renderWithProviders(<WordQuizSection />);

      await waitFor(() => {
        expect(screen.getByText('Word Quiz')).toBeInTheDocument();
      });

      // Check for proper heading
      expect(
        screen.getByRole('heading', { name: 'Word Quiz' })
      ).toBeInTheDocument();

      // Check for proper form elements
      const textboxes = screen.getAllByRole('textbox');
      expect(textboxes.length).toBeGreaterThan(0);

      textboxes.forEach((textbox) => {
        expect(textbox).toHaveAttribute('placeholder');
      });

      // Check for proper buttons
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should be keyboard navigable', async () => {
      renderWithProviders(<WordQuizSection />);

      await waitFor(() => {
        expect(screen.getByText('Word Quiz')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(
        'Enter NATO words: "Alpha Bravo Charlie..."'
      );

      // Should be focusable
      textarea.focus();
      expect(document.activeElement).toBe(textarea);
    });
  });

  describe('error handling', () => {
    it('should handle empty input gracefully', async () => {
      renderWithProviders(<WordQuizSection />);

      await waitFor(() => {
        expect(screen.getByText('Word Quiz')).toBeInTheDocument();
      });

      // Try to check answer with empty input - should not crash
      const checkButton = screen.getByRole('button', { name: /check/i });
      expect(() => {
        fireEvent.click(checkButton);
      }).not.toThrow();

      // Should not crash and remain in input state
      expect(screen.getByText('Word Quiz')).toBeInTheDocument();
    });

    it('should handle invalid custom words gracefully', async () => {
      renderWithProviders(<WordQuizSection />);

      await waitFor(() => {
        expect(screen.getByText('Word Quiz')).toBeInTheDocument();
      });

      // Enable custom mode first
      const customModeButton = screen.getByRole('button', { name: /custom/i });
      fireEvent.click(customModeButton);

      const customWordInput = screen.getByPlaceholderText(
        'Enter your word or phrase...'
      );
      fireEvent.change(customWordInput, { target: { value: '@#$%' } });

      const useWordButton = screen.getByRole('button', {
        name: /use this word/i,
      });

      // Should not crash with invalid input
      expect(() => {
        fireEvent.click(useWordButton);
      }).not.toThrow();

      // Should handle invalid input gracefully
      expect(screen.getByText('Word Quiz')).toBeInTheDocument();
    });

    it('should handle rapid user interactions gracefully', async () => {
      renderWithProviders(<WordQuizSection />);

      await waitFor(() => {
        expect(screen.getByText('Word Quiz')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(
        'Enter NATO words: "Alpha Bravo Charlie..."'
      );
      const newWordButton = screen.getByRole('button', {
        name: /new random word/i,
      });

      // Rapid interactions should not crash
      expect(() => {
        fireEvent.change(textarea, { target: { value: 'Alpha' } });
        fireEvent.click(newWordButton);
        fireEvent.change(textarea, { target: { value: 'Bravo' } });
        fireEvent.click(newWordButton);
        fireEvent.change(textarea, { target: { value: 'Charlie' } });
      }).not.toThrow();
    });
  });

  describe('component stability', () => {
    it('should maintain state consistency across operations', async () => {
      renderWithProviders(<WordQuizSection />);

      await waitFor(() => {
        expect(screen.getByText('Word Quiz')).toBeInTheDocument();
      });

      // Enable custom mode first
      const customModeButton = screen.getByRole('button', { name: /custom/i });
      fireEvent.click(customModeButton);

      // Perform multiple operations to ensure component stability
      const customWordInput = screen.getByPlaceholderText(
        'Enter your word or phrase...'
      );
      const useWordButton = screen.getByRole('button', {
        name: /use this word/i,
      });
      const textarea = screen.getByPlaceholderText(
        'Enter NATO words: "Alpha Bravo Charlie..."'
      );

      // Set custom word
      fireEvent.change(customWordInput, { target: { value: 'TEST' } });
      fireEvent.click(useWordButton);

      // Input NATO
      fireEvent.change(textarea, {
        target: { value: 'Tango Echo Sierra Tango' },
      });

      // Check answer
      const checkButton = screen.getByRole('button', { name: /check/i });
      fireEvent.click(checkButton);

      // All operations should maintain component integrity
      expect(screen.getByText('Word Quiz')).toBeInTheDocument();
    });

    it('should handle multiple quiz sessions without issues', async () => {
      renderWithProviders(<WordQuizSection />);

      await waitFor(() => {
        expect(screen.getByText('Word Quiz')).toBeInTheDocument();
      });

      // Run multiple quiz sessions
      for (let i = 0; i < 3; i++) {
        // Enable custom mode first
        const customModeButton = screen.getByRole('button', {
          name: /custom/i,
        });
        fireEvent.click(customModeButton);

        const customWordInput = screen.getByPlaceholderText(
          'Enter your word or phrase...'
        );
        const useWordButton = screen.getByRole('button', {
          name: /use this word/i,
        });
        const textarea = screen.getByPlaceholderText(
          'Enter NATO words: "Alpha Bravo Charlie..."'
        );

        fireEvent.change(customWordInput, { target: { value: `WORD${i}` } });
        fireEvent.click(useWordButton);

        await waitFor(() => {
          const wordDisplay = document.querySelector('.font-mono');
          expect(wordDisplay?.textContent).toBe(`WORD${i}`);
        });

        fireEvent.change(textarea, {
          target: { value: 'Alpha Bravo Charlie' },
        });

        const checkButton = screen.getByRole('button', { name: /check/i });
        fireEvent.click(checkButton);

        // Wait for results and then retry
        await waitFor(
          () => {
            const retryButton = screen.getByRole('button', { name: /retry/i });
            fireEvent.click(retryButton);
          },
          { timeout: 2000 }
        );

        // After retry, click 'Custom Word' to start a new custom session
        const customModeButtonAgain = screen.getByRole('button', {
          name: /custom/i,
        });
        fireEvent.click(customModeButtonAgain);
      }

      // Component should still be functional
      expect(screen.getByText('Word Quiz')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle very long custom words', async () => {
      renderWithProviders(<WordQuizSection />);

      await waitFor(() => {
        expect(screen.getByText('Word Quiz')).toBeInTheDocument();
      });

      // Enable custom mode first
      const customModeButton = screen.getByRole('button', { name: /custom/i });
      fireEvent.click(customModeButton);

      const customWordInput = screen.getByPlaceholderText(
        'Enter your word or phrase...'
      );
      const longWord = 'ANTIDISESTABLISHMENTARIANISM';

      fireEvent.change(customWordInput, { target: { value: longWord } });

      const useWordButton = screen.getByRole('button', {
        name: /use this word/i,
      });

      // Should handle long words gracefully
      expect(() => {
        fireEvent.click(useWordButton);
      }).not.toThrow();

      await waitFor(() => {
        const wordDisplay = document.querySelector('.font-mono');
        expect(wordDisplay).toBeTruthy();
        expect(wordDisplay?.textContent).toBe(longWord);
      });
    });

    it('should handle words with spaces and special characters', async () => {
      renderWithProviders(<WordQuizSection />);

      await waitFor(() => {
        expect(screen.getByText('Word Quiz')).toBeInTheDocument();
      });

      // Enable custom mode first
      const customModeButton = screen.getByRole('button', { name: /custom/i });
      fireEvent.click(customModeButton);

      const customWordInput = screen.getByPlaceholderText(
        'Enter your word or phrase...'
      );
      fireEvent.change(customWordInput, { target: { value: 'HELLO WORLD' } });

      const useWordButton = screen.getByRole('button', {
        name: /use this word/i,
      });
      fireEvent.click(useWordButton);

      await waitFor(() => {
        const wordDisplay = document.querySelector('.font-mono');
        expect(wordDisplay?.textContent).toBe('HELLO WORLD');
      });
    });
  });
});
