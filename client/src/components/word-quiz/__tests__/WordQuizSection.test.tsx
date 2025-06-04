import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import WordQuizSection from '../WordQuizSection';

// Mock all the hooks
vi.mock('../hooks/useWordQuiz', () => ({
  useWordQuiz: () => ({
    currentWord: { word: 'CAT', difficulty: 'easy' } as {
      word: string;
      difficulty: string;
    } | null,
    userNATOInput: '',
    setUserNATOInput: vi.fn(),
    customWordInput: '',
    setCustomWordInput: vi.fn(),
    isCustomMode: false,
    setIsCustomMode: vi.fn(),
    showResult: false,
    isCompleted: false,
    matchResult: null as any,
    setMatchResult: vi.fn(),
    generateNewWord: vi.fn(),
    useCustomWord: vi.fn(),
    checkAnswer: vi.fn(),
    retryCurrentWord: vi.fn(),
  }),
}));

vi.mock('../hooks/useQuizFeedback', () => ({
  useQuizFeedback: () => ({
    showResultFeedback: vi.fn(),
  }),
}));

vi.mock('../hooks/useRealTimeMatching', () => ({
  useRealTimeMatching: vi.fn(),
}));

// Mock the individual components
vi.mock('../components/QuizHeader', () => ({
  QuizHeader: () => <div data-testid="quiz-header">Quiz Header</div>,
}));

vi.mock('../components/WordDisplay', () => ({
  WordDisplay: ({
    currentWord,
    isCustomMode,
    matchResult,
    showResult,
  }: any) => (
    <div data-testid="word-display">
      Word: {currentWord?.word} | Custom: {isCustomMode ? 'Yes' : 'No'} | Show
      Result: {showResult ? 'Yes' : 'No'}
    </div>
  ),
}));

vi.mock('../components/NATOInput', () => ({
  NATOInput: ({
    userNATOInput,
    setUserNATOInput,
    showResult,
    isCompleted,
    matchResult,
  }: any) => (
    <div data-testid="nato-input">
      <input
        data-testid="nato-input-field"
        value={userNATOInput}
        onChange={(e) => setUserNATOInput(e.target.value)}
        disabled={showResult && isCompleted}
      />
      {matchResult && (
        <div data-testid="live-score">Score: {matchResult.percentage}%</div>
      )}
    </div>
  ),
}));

vi.mock('../components/QuizResults', () => ({
  QuizResults: ({ showResult, matchResult, isCompleted, currentWord }: any) => (
    <div data-testid="quiz-results">
      {showResult && (
        <div>
          Results for {currentWord?.word}: {matchResult?.percentage}% |
          Completed: {isCompleted ? 'Yes' : 'No'}
        </div>
      )}
    </div>
  ),
}));

vi.mock('../components/QuizActions', () => ({
  QuizActions: ({
    retryCurrentWord,
    checkAnswer,
    generateNewWord,
    setIsCustomMode,
    showResult,
    userNATOInput,
    isCompleted,
    isCustomMode,
  }: any) => (
    <div data-testid="quiz-actions">
      <button
        type="button"
        data-testid="check-answer-btn"
        onClick={checkAnswer}
        disabled={!userNATOInput}
      >
        Check Answer
      </button>
      <button type="button" data-testid="retry-btn" onClick={retryCurrentWord}>
        Retry
      </button>
      <button
        type="button"
        data-testid="new-word-btn"
        onClick={generateNewWord}
      >
        New Word
      </button>
      <button
        type="button"
        data-testid="custom-mode-btn"
        onClick={() => setIsCustomMode(!isCustomMode)}
      >
        {isCustomMode ? 'Exit Custom' : 'Custom Mode'}
      </button>
    </div>
  ),
}));

vi.mock('../components/CustomWordInput', () => ({
  CustomWordInput: ({
    isCustomMode,
    customWordInput,
    setCustomWordInput,
    useCustomWord,
  }: any) => (
    <div data-testid="custom-word-input">
      {isCustomMode && (
        <div>
          <input
            data-testid="custom-word-field"
            value={customWordInput}
            onChange={(e) => setCustomWordInput(e.target.value)}
            placeholder="Enter custom word"
          />
          <button
            type="button"
            data-testid="use-custom-word-btn"
            onClick={useCustomWord}
          >
            Use Custom Word
          </button>
        </div>
      )}
    </div>
  ),
}));

describe('wordQuizSection', () => {
  let mockUseWordQuiz: any;
  let mockUseQuizFeedback: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Create fresh mock objects for each test
    mockUseWordQuiz = {
      currentWord: { word: 'CAT', difficulty: 'easy' },
      userNATOInput: '',
      setUserNATOInput: vi.fn(),
      customWordInput: '',
      setCustomWordInput: vi.fn(),
      isCustomMode: false,
      setIsCustomMode: vi.fn(),
      showResult: false,
      isCompleted: false,
      matchResult: null,
      setMatchResult: vi.fn(),
      generateNewWord: vi.fn(),
      useCustomWord: vi.fn(),
      checkAnswer: vi.fn(),
      retryCurrentWord: vi.fn(),
    };

    mockUseQuizFeedback = {
      showResultFeedback: vi.fn(),
    };

    // Update the mock implementations
    const { useWordQuiz } = await import('../hooks/useWordQuiz');
    const { useQuizFeedback } = await import('../hooks/useQuizFeedback');
    vi.mocked(useWordQuiz).mockReturnValue(mockUseWordQuiz);
    vi.mocked(useQuizFeedback).mockReturnValue(mockUseQuizFeedback);
  });

  describe('loading state', () => {
    it('should show loading state when currentWord is null', () => {
      mockUseWordQuiz.currentWord = null;

      render(<WordQuizSection />);

      expect(screen.getByText('Loading word quiz...')).toBeInTheDocument();
      expect(screen.getByRole('generic')).toHaveClass('animate-spin');
    });
  });

  describe('normal quiz flow (happy path)', () => {
    it('should render all quiz components when loaded', () => {
      render(<WordQuizSection />);

      expect(screen.getByTestId('quiz-header')).toBeInTheDocument();
      expect(screen.getByTestId('word-display')).toBeInTheDocument();
      expect(screen.getByTestId('nato-input')).toBeInTheDocument();
      expect(screen.getByTestId('quiz-results')).toBeInTheDocument();
      expect(screen.getByTestId('quiz-actions')).toBeInTheDocument();
      expect(screen.getByTestId('custom-word-input')).toBeInTheDocument();
    });

    it('should display current word information', () => {
      render(<WordQuizSection />);

      expect(screen.getByText(/Word: CAT/)).toBeInTheDocument();
      expect(screen.getByText(/Custom: No/)).toBeInTheDocument();
      expect(screen.getByText(/Show Result: No/)).toBeInTheDocument();
    });

    it('should handle NATO input typing', () => {
      render(<WordQuizSection />);

      const natoInput = screen.getByTestId('nato-input-field');
      fireEvent.change(natoInput, { target: { value: 'Charlie Alpha Tango' } });

      expect(mockUseWordQuiz.setUserNATOInput).toHaveBeenCalledWith(
        'Charlie Alpha Tango'
      );
    });

    it('should handle check answer button click', () => {
      mockUseWordQuiz.userNATOInput = 'Charlie Alpha Tango';
      mockUseWordQuiz.checkAnswer.mockReturnValue({
        score: 3,
        percentage: 100,
        correctCount: 3,
        totalCount: 3,
        matches: [],
      });

      render(<WordQuizSection />);

      const checkButton = screen.getByTestId('check-answer-btn');
      fireEvent.click(checkButton);

      expect(mockUseWordQuiz.checkAnswer).toHaveBeenCalled();
      expect(mockUseQuizFeedback.showResultFeedback).toHaveBeenCalledWith({
        score: 3,
        percentage: 100,
        correctCount: 3,
        totalCount: 3,
        matches: [],
      });
    });

    it('should not show feedback when checkAnswer returns null', () => {
      mockUseWordQuiz.userNATOInput = 'Charlie Alpha Tango';
      mockUseWordQuiz.checkAnswer.mockReturnValue(null);

      render(<WordQuizSection />);

      const checkButton = screen.getByTestId('check-answer-btn');
      fireEvent.click(checkButton);

      expect(mockUseWordQuiz.checkAnswer).toHaveBeenCalled();
      expect(mockUseQuizFeedback.showResultFeedback).not.toHaveBeenCalled();
    });

    it('should handle retry current word', () => {
      render(<WordQuizSection />);

      const retryButton = screen.getByTestId('retry-btn');
      fireEvent.click(retryButton);

      expect(mockUseWordQuiz.retryCurrentWord).toHaveBeenCalled();
    });

    it('should handle generate new word', () => {
      render(<WordQuizSection />);

      const newWordButton = screen.getByTestId('new-word-btn');
      fireEvent.click(newWordButton);

      expect(mockUseWordQuiz.generateNewWord).toHaveBeenCalled();
    });

    it('should show live score when match result is available', () => {
      mockUseWordQuiz.matchResult = {
        percentage: 67,
        score: 2,
        correctCount: 2,
        totalCount: 3,
        matches: [],
      };

      render(<WordQuizSection />);

      expect(screen.getByTestId('live-score')).toHaveTextContent('Score: 67%');
    });

    it('should show results when quiz is completed', () => {
      mockUseWordQuiz.showResult = true;
      mockUseWordQuiz.isCompleted = true;
      mockUseWordQuiz.matchResult = {
        percentage: 100,
        score: 3,
        correctCount: 3,
        totalCount: 3,
        matches: [],
      };

      render(<WordQuizSection />);

      expect(screen.getByText(/Results for CAT: 100%/)).toBeInTheDocument();
      expect(screen.getByText(/Completed: Yes/)).toBeInTheDocument();
    });
  });

  describe('custom word mode (happy path)', () => {
    it('should toggle custom mode', () => {
      render(<WordQuizSection />);

      const customModeButton = screen.getByTestId('custom-mode-btn');
      expect(customModeButton).toHaveTextContent('Custom Mode');

      fireEvent.click(customModeButton);

      expect(mockUseWordQuiz.setIsCustomMode).toHaveBeenCalledWith(true);
    });

    it('should show custom word input when in custom mode', () => {
      mockUseWordQuiz.isCustomMode = true;

      render(<WordQuizSection />);

      expect(screen.getByTestId('custom-word-field')).toBeInTheDocument();
      expect(screen.getByTestId('use-custom-word-btn')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Enter custom word')
      ).toBeInTheDocument();
    });

    it('should handle custom word input typing', () => {
      mockUseWordQuiz.isCustomMode = true;

      render(<WordQuizSection />);

      const customWordInput = screen.getByTestId('custom-word-field');
      fireEvent.change(customWordInput, { target: { value: 'HELLO' } });

      expect(mockUseWordQuiz.setCustomWordInput).toHaveBeenCalledWith('HELLO');
    });

    it('should handle use custom word button click', () => {
      mockUseWordQuiz.isCustomMode = true;
      mockUseWordQuiz.customWordInput = 'HELLO';

      render(<WordQuizSection />);

      const useCustomWordButton = screen.getByTestId('use-custom-word-btn');
      fireEvent.click(useCustomWordButton);

      expect(mockUseWordQuiz.useCustomWord).toHaveBeenCalled();
    });

    it('should show custom mode indicator in word display', () => {
      mockUseWordQuiz.isCustomMode = true;

      render(<WordQuizSection />);

      expect(screen.getByText(/Custom: Yes/)).toBeInTheDocument();
    });
  });

  describe('complete quiz workflow (integration)', () => {
    it('should complete a full quiz cycle', async () => {
      render(<WordQuizSection />);

      // 1. Initial state - word is loaded
      expect(screen.getByText(/Word: CAT/)).toBeInTheDocument();
      expect(screen.getByText(/Show Result: No/)).toBeInTheDocument();

      // 2. User types NATO input
      const natoInput = screen.getByTestId('nato-input-field');
      fireEvent.change(natoInput, { target: { value: 'Charlie Alpha Tango' } });
      expect(mockUseWordQuiz.setUserNATOInput).toHaveBeenCalledWith(
        'Charlie Alpha Tango'
      );

      // 3. Mock live scoring
      mockUseWordQuiz.matchResult = {
        percentage: 100,
        score: 3,
        correctCount: 3,
        totalCount: 3,
        matches: [],
      };
      render(<WordQuizSection />); // Re-render to show live score
      expect(screen.getByTestId('live-score')).toHaveTextContent('Score: 100%');

      // 4. User checks answer
      mockUseWordQuiz.checkAnswer.mockReturnValue({
        score: 3,
        percentage: 100,
        correctCount: 3,
        totalCount: 3,
        matches: [],
      });

      const checkButton = screen.getByTestId('check-answer-btn');
      fireEvent.click(checkButton);

      expect(mockUseWordQuiz.checkAnswer).toHaveBeenCalled();
      expect(mockUseQuizFeedback.showResultFeedback).toHaveBeenCalled();

      // 5. Results are shown
      mockUseWordQuiz.showResult = true;
      mockUseWordQuiz.isCompleted = true;
      render(<WordQuizSection />); // Re-render to show results
      expect(screen.getByText(/Results for CAT: 100%/)).toBeInTheDocument();

      // 6. User can retry or get new word
      const retryButton = screen.getByTestId('retry-btn');
      const newWordButton = screen.getByTestId('new-word-btn');

      expect(retryButton).toBeInTheDocument();
      expect(newWordButton).toBeInTheDocument();
    });

    it('should handle custom word workflow', async () => {
      render(<WordQuizSection />);

      // 1. Switch to custom mode
      const customModeButton = screen.getByTestId('custom-mode-btn');
      fireEvent.click(customModeButton);
      expect(mockUseWordQuiz.setIsCustomMode).toHaveBeenCalledWith(true);

      // 2. Mock custom mode state
      mockUseWordQuiz.isCustomMode = true;
      render(<WordQuizSection />);

      // 3. Enter custom word
      const customWordInput = screen.getByTestId('custom-word-field');
      fireEvent.change(customWordInput, { target: { value: 'HELLO' } });
      expect(mockUseWordQuiz.setCustomWordInput).toHaveBeenCalledWith('HELLO');

      // 4. Use custom word
      const useCustomWordButton = screen.getByTestId('use-custom-word-btn');
      fireEvent.click(useCustomWordButton);
      expect(mockUseWordQuiz.useCustomWord).toHaveBeenCalled();

      // 5. Continue with normal quiz flow
      const natoInput = screen.getByTestId('nato-input-field');
      fireEvent.change(natoInput, {
        target: { value: 'Hotel Echo Lima Lima Oscar' },
      });
      expect(mockUseWordQuiz.setUserNATOInput).toHaveBeenCalledWith(
        'Hotel Echo Lima Lima Oscar'
      );
    });
  });

  describe('real-time matching integration', () => {
    it('should call useRealTimeMatching with correct props', async () => {
      const { useRealTimeMatching } = await import(
        '../hooks/useRealTimeMatching'
      );

      render(<WordQuizSection />);

      expect(useRealTimeMatching).toHaveBeenCalledWith({
        currentWord: mockUseWordQuiz.currentWord,
        userNATOInput: mockUseWordQuiz.userNATOInput,
        showResult: mockUseWordQuiz.showResult,
        setMatchResult: mockUseWordQuiz.setMatchResult,
      });
    });
  });

  describe('component prop passing', () => {
    it('should pass correct props to WordDisplay', () => {
      mockUseWordQuiz.isCustomMode = true;
      mockUseWordQuiz.showResult = true;
      mockUseWordQuiz.matchResult = {
        percentage: 85,
        score: 2,
        correctCount: 2,
        totalCount: 3,
        matches: [],
      };

      render(<WordQuizSection />);

      expect(screen.getByText(/Word: CAT/)).toBeInTheDocument();
      expect(screen.getByText(/Custom: Yes/)).toBeInTheDocument();
      expect(screen.getByText(/Show Result: Yes/)).toBeInTheDocument();
    });

    it('should pass correct props to NATOInput', () => {
      mockUseWordQuiz.userNATOInput = 'Charlie Alpha';
      mockUseWordQuiz.showResult = true;
      mockUseWordQuiz.isCompleted = true;
      mockUseWordQuiz.matchResult = {
        percentage: 67,
        score: 2,
        correctCount: 2,
        totalCount: 3,
        matches: [],
      };

      render(<WordQuizSection />);

      const natoInput = screen.getByTestId('nato-input-field');
      expect(natoInput).toHaveValue('Charlie Alpha');
      expect(natoInput).toBeDisabled(); // Should be disabled when completed
      expect(screen.getByTestId('live-score')).toHaveTextContent('Score: 67%');
    });

    it('should pass correct props to QuizResults', () => {
      mockUseWordQuiz.showResult = true;
      mockUseWordQuiz.isCompleted = true;
      mockUseWordQuiz.matchResult = {
        percentage: 100,
        score: 3,
        correctCount: 3,
        totalCount: 3,
        matches: [],
      };

      render(<WordQuizSection />);

      expect(screen.getByText(/Results for CAT: 100%/)).toBeInTheDocument();
      expect(screen.getByText(/Completed: Yes/)).toBeInTheDocument();
    });
  });
});
