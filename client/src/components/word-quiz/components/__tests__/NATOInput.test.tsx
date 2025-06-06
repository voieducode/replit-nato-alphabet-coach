import type { ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/contexts/language-context';
import { NATOInput } from '../NATOInput';

// Only mock external dependencies that are necessary
vi.mock('@/hooks/use-speech-recognition', () => ({
  // eslint-disable-next-line react-hooks-extra/no-unnecessary-use-prefix
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

describe('nATOInput', () => {
  const defaultProps = {
    userNATOInput: '',
    setUserNATOInput: vi.fn(),
    showResult: false,
    isCompleted: false,
    matchResult: null,
    isCustomMode: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('should render the component with correct elements', () => {
      renderWithProviders(<NATOInput {...defaultProps} />);

      expect(screen.getByText('Your NATO Alphabet Input')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(
          'Enter NATO words: "Alpha Bravo Charlie..."'
        )
      ).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument(); // Microphone button
    });

    it('should display current user input', () => {
      const props = { ...defaultProps, userNATOInput: 'Alpha Bravo Charlie' };
      renderWithProviders(<NATOInput {...props} />);

      const textarea = screen.getByDisplayValue('Alpha Bravo Charlie');
      expect(textarea).toBeInTheDocument();
    });

    it('should show microphone button when speech is supported', () => {
      renderWithProviders(<NATOInput {...defaultProps} />);

      const micButton = screen.getByRole('button');
      expect(micButton.querySelector('svg')).toBeInTheDocument();
      expect(micButton).not.toBeDisabled();
    });
  });

  describe('textarea input handling', () => {
    it('should call setUserNATOInput when textarea value changes', () => {
      const setUserNATOInput = vi.fn();
      const props = { ...defaultProps, setUserNATOInput };

      renderWithProviders(<NATOInput {...props} />);

      const textarea = screen.getByPlaceholderText(
        'Enter NATO words: "Alpha Bravo Charlie..."'
      );
      fireEvent.change(textarea, { target: { value: 'Delta Echo Foxtrot' } });

      expect(setUserNATOInput).toHaveBeenCalledWith('Delta Echo Foxtrot');
    });

    it('should disable textarea when quiz is completed and showing results', () => {
      const props = {
        ...defaultProps,
        showResult: true,
        isCompleted: true,
      };

      renderWithProviders(<NATOInput {...props} />);

      const textarea = screen.getByPlaceholderText(
        'Enter NATO words: "Alpha Bravo Charlie..."'
      );
      expect(textarea).toBeDisabled();
    });

    it('should not disable textarea when showing results but not completed', () => {
      const props = {
        ...defaultProps,
        showResult: true,
        isCompleted: false,
      };

      renderWithProviders(<NATOInput {...props} />);

      const textarea = screen.getByPlaceholderText(
        'Enter NATO words: "Alpha Bravo Charlie..."'
      );
      expect(textarea).not.toBeDisabled();
    });
  });

  describe('live score display', () => {
    it('should show live score when match result is available and not showing final result', () => {
      const matchResult = {
        correctCount: 2,
        totalCount: 3,
        percentage: 67,
        score: 2,
        matches: [],
      };
      const props = {
        ...defaultProps,
        userNATOInput: 'Alpha Bravo Wrong',
        matchResult,
        showResult: false,
      };

      renderWithProviders(<NATOInput {...props} />);

      expect(screen.getByText('Live Score: 2/3 (67%)')).toBeInTheDocument();
    });

    it('should not show live score when input is empty', () => {
      const matchResult = {
        correctCount: 0,
        totalCount: 3,
        percentage: 0,
        score: 0,
        matches: [],
      };
      const props = {
        ...defaultProps,
        userNATOInput: '',
        matchResult,
        showResult: false,
      };

      renderWithProviders(<NATOInput {...props} />);

      expect(screen.queryByText(/Live Score:/)).not.toBeInTheDocument();
    });

    it('should not show live score when showing final result', () => {
      const matchResult = {
        correctCount: 3,
        totalCount: 3,
        percentage: 100,
        score: 3,
        matches: [],
      };
      const props = {
        ...defaultProps,
        userNATOInput: 'Alpha Bravo Charlie',
        matchResult,
        showResult: true,
      };

      renderWithProviders(<NATOInput {...props} />);

      expect(screen.queryByText(/Live Score:/)).not.toBeInTheDocument();
    });
  });

  describe('accessibility and user experience', () => {
    it('should have proper textarea attributes', () => {
      renderWithProviders(<NATOInput {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute(
        'placeholder',
        'Enter NATO words: "Alpha Bravo Charlie..."'
      );
      expect(textarea).toHaveClass('w-full');
    });

    it('should handle empty input gracefully', () => {
      const props = { ...defaultProps, userNATOInput: '' };
      renderWithProviders(<NATOInput {...props} />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('');
      expect(screen.queryByText(/Live Score:/)).not.toBeInTheDocument();
    });

    it('should show appropriate styling based on state', () => {
      const props = {
        ...defaultProps,
        showResult: true,
        isCompleted: true,
      };

      renderWithProviders(<NATOInput {...props} />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();
    });

    it('should handle long input text', () => {
      const longInput =
        'Alpha Bravo Charlie Delta Echo Foxtrot Golf Hotel India Juliet Kilo Lima Mike November Oscar Papa Quebec Romeo Sierra Tango Uniform Victor Whiskey X-ray Yankee Zulu';
      const setUserNATOInput = vi.fn();
      const props = {
        ...defaultProps,
        setUserNATOInput,
        userNATOInput: longInput,
      };

      renderWithProviders(<NATOInput {...props} />);

      const textarea = screen.getByDisplayValue(longInput);
      expect(textarea).toBeInTheDocument();

      // Test that changes still work with long text
      fireEvent.change(textarea, { target: { value: `${longInput} Extra` } });
      expect(setUserNATOInput).toHaveBeenCalledWith(`${longInput} Extra`);
    });
  });

  describe('custom mode behavior', () => {
    it('should render normally when isCustomMode is false', () => {
      const props = { ...defaultProps, isCustomMode: false };
      renderWithProviders(<NATOInput {...props} />);

      expect(screen.getByText('Your NATO Alphabet Input')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(
          'Enter NATO words: "Alpha Bravo Charlie..."'
        )
      ).toBeInTheDocument();
    });

    it('should render normally when isCustomMode is true', () => {
      const props = { ...defaultProps, isCustomMode: true };
      renderWithProviders(<NATOInput {...props} />);

      expect(screen.getByText('Your NATO Alphabet Input')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(
          'Enter NATO words: "Alpha Bravo Charlie..."'
        )
      ).toBeInTheDocument();
    });

    it('should handle input changes in custom mode', () => {
      const setUserNATOInput = vi.fn();
      const props = {
        ...defaultProps,
        setUserNATOInput,
        isCustomMode: true,
      };

      renderWithProviders(<NATOInput {...props} />);

      const textarea = screen.getByPlaceholderText(
        'Enter NATO words: "Alpha Bravo Charlie..."'
      );
      fireEvent.change(textarea, { target: { value: 'Custom Input' } });

      expect(setUserNATOInput).toHaveBeenCalledWith('Custom Input');
    });

    it('should show live score in custom mode when match result is available', () => {
      const matchResult = {
        correctCount: 2,
        totalCount: 4,
        percentage: 50,
        score: 2,
        matches: [],
      };
      const props = {
        ...defaultProps,
        userNATOInput: 'Alpha Bravo Wrong Wrong',
        matchResult,
        showResult: false,
        isCustomMode: true,
      };

      renderWithProviders(<NATOInput {...props} />);

      expect(screen.getByText('Live Score: 2/4 (50%)')).toBeInTheDocument();
    });
  });

  describe('component integration', () => {
    it('should work with various match result combinations', () => {
      const testCases = [
        {
          matchResult: {
            correctCount: 0,
            totalCount: 3,
            percentage: 0,
            score: 0,
            matches: [],
          },
          input: 'Wrong Wrong Wrong',
          expectedScore: 'Live Score: 0/3 (0%)',
        },
        {
          matchResult: {
            correctCount: 1,
            totalCount: 3,
            percentage: 33,
            score: 1,
            matches: [],
          },
          input: 'Alpha Wrong Wrong',
          expectedScore: 'Live Score: 1/3 (33%)',
        },
        {
          matchResult: {
            correctCount: 3,
            totalCount: 3,
            percentage: 100,
            score: 3,
            matches: [],
          },
          input: 'Alpha Bravo Charlie',
          expectedScore: 'Live Score: 3/3 (100%)',
        },
      ];

      testCases.forEach(({ matchResult, input, expectedScore }) => {
        const props = {
          ...defaultProps,
          userNATOInput: input,
          matchResult,
          showResult: false,
        };

        const { unmount } = renderWithProviders(<NATOInput {...props} />);

        if (input) {
          expect(screen.getByText(expectedScore)).toBeInTheDocument();
        } else {
          expect(screen.queryByText(/Live Score:/)).not.toBeInTheDocument();
        }

        unmount();
      });
    });

    it('should handle state transitions properly', () => {
      const setUserNATOInput = vi.fn();
      const initialProps = {
        ...defaultProps,
        setUserNATOInput,
        userNATOInput: '',
        showResult: false,
        isCompleted: false,
      };

      const { rerender } = renderWithProviders(<NATOInput {...initialProps} />);

      // Initial state - input enabled
      const textarea = screen.getByRole('textbox');
      expect(textarea).not.toBeDisabled();

      // User types
      fireEvent.change(textarea, { target: { value: 'Alpha' } });
      expect(setUserNATOInput).toHaveBeenCalledWith('Alpha');

      // Show results but not completed - input still enabled
      const showingResultsProps = {
        ...initialProps,
        userNATOInput: 'Alpha',
        showResult: true,
        isCompleted: false,
      };
      rerender(<NATOInput {...showingResultsProps} />);
      expect(textarea).not.toBeDisabled();

      // Completed quiz - input disabled
      const completedProps = {
        ...initialProps,
        userNATOInput: 'Alpha',
        showResult: true,
        isCompleted: true,
      };
      rerender(<NATOInput {...completedProps} />);
      expect(textarea).toBeDisabled();
    });
  });
});
