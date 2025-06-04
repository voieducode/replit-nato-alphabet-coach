import { useLanguage } from '@/hooks/use-language';

export function QuizHeader() {
  const { translations } = useLanguage();

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-primary mb-2">
        {translations.wordQuiz}
      </h2>
      <p className="text-gray-600 text-sm">
        {translations.wordQuizInstructions}
      </p>
    </div>
  );
}
