import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NATOInput } from '../NATOInput';

// Mock dependencies
const mockUseAutoResizeTextarea = vi.fn();
const mockUseSpeechRecognition = {
  isListening: false,
  isProcessing: false,
  speechSupported: true,
  interimTranscript: '',
  error: null,
  startListening: vi.fn(),
  stopListening: vi.fn(),
  clearError: vi.fn(),
};

vi.mock('../../hooks/useAutoResizeTextarea', () => ({
  useAutoResizeTextarea: mockUseAutoResizeTextarea,
}));

vi.mock('@/hooks/use-speech-recognition', () => ({
  useSpeechRecognition: vi.fn(),
}));

describe('nATOInput', () => {
  const defaultProps = {
    userNATOInput: '',
    setUserNATOInput: vi.fn(),
    showResult: false,
    isCompleted: false,
    matchResult: null,
  };

  let mockRef: { current: HTMLTextAreaElement | null };
  let speechRecognitionCallback: (transcript: string) => void;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock the ref
    mockRef = { current: null };
    mockUseAutoResizeTextarea.mockReturnValue(mockRef);

    // Mock useSpeechRecognition and capture the callback
    const mockUseSpeechRecognitionImpl = vi
      .fn()
      .mockImplementation((callback, config) => {
        speechRecognitionCallback = callback;
        return mockUseSpeechRecognition;
      });
    vi.mocked(
      require('@/hooks/use-speech-recognition').useSpeechRecognition
    ).mockImplementation(mockUseSpeechRecognitionImpl);
  });

  describe('basic rendering', () => {
    it('should render the component with correct elements', () => {
      render(<NATOInput {...defaultProps} />);

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
      render(<NATOInput {...props} />);

      const textarea = screen.getByDisplayValue('Alpha Bravo Charlie');
      expect(textarea).toBeInTheDocument();
    });

    it('should show microphone button when speech is supported', () => {
      render(<NATOInput {...defaultProps} />);

      const micButton = screen.getByRole('button');
      expect(micButton).toHaveTextContent('🎤');
      expect(micButton).not.toBeDisabled();
    });

    it('should not show microphone button when speech is not supported', () => {
      const mockUseSpeechRecognitionUnsupported = {
        ...mockUseSpeechRecognition,
        speechSupported: false,
      };
      vi.mocked(
        require('@/hooks/use-speech-recognition').useSpeechRecognition
      ).mockReturnValue(mockUseSpeechRecognitionUnsupported);

      render(<NATOInput {...defaultProps} />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('textarea input handling', () => {
    it('should call setUserNATOInput when textarea value changes', () => {
      const setUserNATOInput = vi.fn();
      const props = { ...defaultProps, setUserNATOInput };

      render(<NATOInput {...props} />);

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

      render(<NATOInput {...props} />);

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

      render(<NATOInput {...props} />);

      const textarea = screen.getByPlaceholderText(
        'Enter NATO words: "Alpha Bravo Charlie..."'
      );
      expect(textarea).not.toBeDisabled();
    });
  });

  describe('speech recognition - spacing functionality', () => {
    it('should append dictated text to empty input without adding space', () => {
      const setUserNATOInput = vi.fn();
      const props = { ...defaultProps, userNATOInput: '', setUserNATOInput };

      render(<NATOInput {...props} />);

      // Simulate speech recognition callback
      speechRecognitionCallback('Alpha');

      expect(setUserNATOInput).toHaveBeenCalledWith('Alpha');
    });

    it('should add space before dictated text when input does not end with space', () => {
      const setUserNATOInput = vi.fn();
      const props = {
        ...defaultProps,
        userNATOInput: 'Alpha',
        setUserNATOInput,
      };

      render(<NATOInput {...props} />);

      // Simulate speech recognition callback
      speechRecognitionCallback('Bravo');

      expect(setUserNATOInput).toHaveBeenCalledWith('Alpha Bravo');
    });

    it('should not add duplicate space when input already ends with space', () => {
      const setUserNATOInput = vi.fn();
      const props = {
        ...defaultProps,
        userNATOInput: 'Alpha ',
        setUserNATOInput,
      };

      render(<NATOInput {...props} />);

      // Simulate speech recognition callback
      speechRecognitionCallback('Bravo');

      expect(setUserNATOInput).toHaveBeenCalledWith('Alpha Bravo');
    });

    it('should handle multiple words in single dictation', () => {
      const setUserNATOInput = vi.fn();
      const props = {
        ...defaultProps,
        userNATOInput: 'Alpha',
        setUserNATOInput,
      };

      render(<NATOInput {...props} />);

      // Simulate speech recognition callback with multiple words
      speechRecognitionCallback('Bravo Charlie');

      expect(setUserNATOInput).toHaveBeenCalledWith('Alpha Bravo Charlie');
    });

    it('should handle dictation with leading/trailing spaces', () => {
      const setUserNATOInput = vi.fn();
      const props = {
        ...defaultProps,
        userNATOInput: 'Alpha',
        setUserNATOInput,
      };

      render(<NATOInput {...props} />);

      // Simulate speech recognition callback with spaces
      speechRecognitionCallback(' Bravo Charlie ');

      expect(setUserNATOInput).toHaveBeenCalledWith('Alpha  Bravo Charlie ');
    });

    it('should handle consecutive dictation sessions', () => {
      const setUserNATOInput = vi.fn();
      let currentInput = 'Alpha';
      const props = { ...defaultProps, setUserNATOInput };

      const { rerender } = render(
        <NATOInput {...props} userNATOInput={currentInput} />
      );

      // First dictation
      speechRecognitionCallback('Bravo');
      expect(setUserNATOInput).toHaveBeenCalledWith('Alpha Bravo');

      // Update the input and re-render
      currentInput = 'Alpha Bravo';
      rerender(<NATOInput {...props} userNATOInput={currentInput} />);

      // Second dictation
      speechRecognitionCallback('Charlie');
      expect(setUserNATOInput).toHaveBeenLastCalledWith('Alpha Bravo Charlie');
    });
  });

  describe('speech recognition UI states', () => {
    it('should show listening state when speech recognition is active', () => {
      const mockListening = {
        ...mockUseSpeechRecognition,
        isListening: true,
        interimTranscript: 'Alpha',
      };
      vi.mocked(
        require('@/hooks/use-speech-recognition').useSpeechRecognition
      ).mockReturnValue(mockListening);

      render(<NATOInput {...defaultProps} />);

      expect(screen.getByText(/🎤 Listening.../)).toBeInTheDocument();
      expect(screen.getByText(/\(Alpha\)/)).toBeInTheDocument();

      const textarea = screen.getByPlaceholderText(
        'Enter NATO words: "Alpha Bravo Charlie..."'
      );
      expect(textarea).toHaveClass('border-blue-300', 'bg-blue-50');
    });

    it('should show processing state', () => {
      const mockProcessing = {
        ...mockUseSpeechRecognition,
        isProcessing: true,
      };
      vi.mocked(
        require('@/hooks/use-speech-recognition').useSpeechRecognition
      ).mockReturnValue(mockProcessing);

      render(<NATOInput {...defaultProps} />);

      const textarea = screen.getByPlaceholderText(
        'Enter NATO words: "Alpha Bravo Charlie..."'
      );
      expect(textarea).toHaveClass('border-yellow-300', 'bg-yellow-50');
    });

    it('should show error state with clear button', () => {
      const clearError = vi.fn();
      const mockError = {
        ...mockUseSpeechRecognition,
        error: 'Microphone access denied',
        clearError,
      };
      vi.mocked(
        require('@/hooks/use-speech-recognition').useSpeechRecognition
      ).mockReturnValue(mockError);

      render(<NATOInput {...defaultProps} />);

      expect(
        screen.getByText(/⚠️ Microphone access denied/)
      ).toBeInTheDocument();

      const clearButton = screen.getByText('✕');
      fireEvent.click(clearButton);
      expect(clearError).toHaveBeenCalled();
    });

    it('should change microphone button appearance when listening', () => {
      const mockListening = {
        ...mockUseSpeechRecognition,
        isListening: true,
      };
      vi.mocked(
        require('@/hooks/use-speech-recognition').useSpeechRecognition
      ).mockReturnValue(mockListening);

      render(<NATOInput {...defaultProps} />);

      const micButton = screen.getByRole('button');
      expect(micButton).toHaveClass('text-red-600', 'bg-red-100');
    });
  });

  describe('speech recognition button interactions', () => {
    it('should start listening when microphone button is clicked', () => {
      const startListening = vi.fn();
      const mockSpeech = {
        ...mockUseSpeechRecognition,
        startListening,
      };
      vi.mocked(
        require('@/hooks/use-speech-recognition').useSpeechRecognition
      ).mockReturnValue(mockSpeech);

      render(<NATOInput {...defaultProps} />);

      const micButton = screen.getByRole('button');
      fireEvent.click(micButton);

      expect(startListening).toHaveBeenCalled();
    });

    it('should stop listening when microphone button is clicked while listening', () => {
      const stopListening = vi.fn();
      const mockSpeech = {
        ...mockUseSpeechRecognition,
        isListening: true,
        stopListening,
      };
      vi.mocked(
        require('@/hooks/use-speech-recognition').useSpeechRecognition
      ).mockReturnValue(mockSpeech);

      render(<NATOInput {...defaultProps} />);

      const micButton = screen.getByRole('button');
      fireEvent.click(micButton);

      expect(stopListening).toHaveBeenCalled();
    });

    it('should disable microphone button when quiz is completed', () => {
      const props = {
        ...defaultProps,
        showResult: true,
        isCompleted: true,
      };

      render(<NATOInput {...props} />);

      const micButton = screen.getByRole('button');
      expect(micButton).toBeDisabled();
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

      render(<NATOInput {...props} />);

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

      render(<NATOInput {...props} />);

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

      render(<NATOInput {...props} />);

      expect(screen.queryByText(/Live Score:/)).not.toBeInTheDocument();
    });
  });

  describe('accessibility and edge cases', () => {
    it('should handle rapid speech recognition callbacks', () => {
      const setUserNATOInput = vi.fn();
      const props = {
        ...defaultProps,
        userNATOInput: 'Alpha',
        setUserNATOInput,
      };

      render(<NATOInput {...props} />);

      // Simulate rapid callbacks
      speechRecognitionCallback('Bravo');
      speechRecognitionCallback('Charlie');

      expect(setUserNATOInput).toHaveBeenCalledTimes(2);
      expect(setUserNATOInput).toHaveBeenNthCalledWith(1, 'Alpha Bravo');
      expect(setUserNATOInput).toHaveBeenNthCalledWith(2, 'Alpha Charlie');
    });

    it('should handle empty transcript', () => {
      const setUserNATOInput = vi.fn();
      const props = {
        ...defaultProps,
        userNATOInput: 'Alpha',
        setUserNATOInput,
      };

      render(<NATOInput {...props} />);

      speechRecognitionCallback('');

      expect(setUserNATOInput).toHaveBeenCalledWith('Alpha ');
    });

    it('should handle special characters in transcript', () => {
      const setUserNATOInput = vi.fn();
      const props = {
        ...defaultProps,
        userNATOInput: 'Alpha',
        setUserNATOInput,
      };

      render(<NATOInput {...props} />);

      speechRecognitionCallback('Bravo-Charlie');

      expect(setUserNATOInput).toHaveBeenCalledWith('Alpha Bravo-Charlie');
    });

    it('should call useAutoResizeTextarea with current input', () => {
      const props = { ...defaultProps, userNATOInput: 'Alpha Bravo Charlie' };

      render(<NATOInput {...props} />);

      expect(mockUseAutoResizeTextarea).toHaveBeenCalledWith(
        'Alpha Bravo Charlie'
      );
    });
  });

  describe('speech recognition configuration', () => {
    it('should configure speech recognition with correct options', () => {
      const mockUseSpeechRecognitionImpl = vi
        .fn()
        .mockReturnValue(mockUseSpeechRecognition);
      vi.mocked(
        require('@/hooks/use-speech-recognition').useSpeechRecognition
      ).mockImplementation(mockUseSpeechRecognitionImpl);

      render(<NATOInput {...defaultProps} />);

      expect(mockUseSpeechRecognitionImpl).toHaveBeenCalledWith(
        expect.any(Function),
        {
          continuous: true,
          interimResults: true,
          autoRestart: true,
          confidenceThreshold: 0.5,
        }
      );
    });
  });
});
