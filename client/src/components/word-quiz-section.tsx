import { CustomWordInput } from './word-quiz/components/CustomWordInput';
import { NATOInput } from './word-quiz/components/NATOInput';
import { QuizActions } from './word-quiz/components/QuizActions';
import { QuizHeader } from './word-quiz/components/QuizHeader';
import { QuizResults } from './word-quiz/components/QuizResults';
import { WordDisplay } from './word-quiz/components/WordDisplay';
import { useQuizFeedback } from './word-quiz/hooks/useQuizFeedback';
import { useRealTimeMatching } from './word-quiz/hooks/useRealTimeMatching';
import { useWordQuiz } from './word-quiz/hooks/useWordQuiz';

export default function WordQuizSection() {
  const quiz = useWordQuiz();
  const { showResultFeedback } = useQuizFeedback();

  // Real-time matching as user types
  useRealTimeMatching({
    currentWord: quiz.currentWord,
    userNATOInput: quiz.userNATOInput,
    showResult: quiz.showResult,
    setMatchResult: quiz.setMatchResult,
  });

  const handleCheckAnswer = () => {
    const result = quiz.checkAnswer();
    if (result) {
      showResultFeedback(result);
    }
  };

  if (!quiz.currentWord) {
    return (
      <div className="p-4 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading word quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <QuizHeader />

      <WordDisplay
        currentWord={quiz.currentWord}
        isCustomMode={quiz.isCustomMode}
        matchResult={quiz.matchResult}
        showResult={quiz.showResult}
      />

      <NATOInput
        userNATOInput={quiz.userNATOInput}
        setUserNATOInput={quiz.setUserNATOInput}
        showResult={quiz.showResult}
        isCompleted={quiz.isCompleted}
        matchResult={quiz.matchResult}
      />

      <QuizResults
        showResult={quiz.showResult}
        matchResult={quiz.matchResult}
        isCompleted={quiz.isCompleted}
        currentWord={quiz.currentWord}
      />

      <QuizActions
        retryCurrentWord={quiz.retryCurrentWord}
        checkAnswer={handleCheckAnswer}
        generateNewWord={quiz.generateNewWord}
        setIsCustomMode={quiz.setIsCustomMode}
        showResult={quiz.showResult}
        userNATOInput={quiz.userNATOInput}
        isCompleted={quiz.isCompleted}
        isCustomMode={quiz.isCustomMode}
      />

      <CustomWordInput
        isCustomMode={quiz.isCustomMode}
        customWordInput={quiz.customWordInput}
        setCustomWordInput={quiz.setCustomWordInput}
        handleCustomWord={quiz.handleCustomWord}
      />
    </div>
  );
}
