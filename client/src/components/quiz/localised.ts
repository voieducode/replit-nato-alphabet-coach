import type { Translations } from '@/lib/i18n';

export function localizedQuestionCount(
  translations: Translations,
  currentQuestionIndex: number,
  totalQuestions: number
): React.ReactNode {
  return translations.questionCount
    .replace('{current}', String(currentQuestionIndex))
    .replace('{total}', String(totalQuestions));
}
