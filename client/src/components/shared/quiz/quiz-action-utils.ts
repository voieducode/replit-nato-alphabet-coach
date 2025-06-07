import type { QuizAction } from './QuizActionButtons';

/**
 * Helper function to create common quiz actions
 */
export function createQuizActions(
  handlers: {
    onSubmit?: () => void;
    onSkip?: () => void;
    onRetry?: () => void;
    onNext?: () => void;
    onRestart?: () => void;
    onHint?: () => void;
  },
  conditions: {
    canSubmit?: boolean;
    canSkip?: boolean;
    showRetry?: boolean;
    showNext?: boolean;
    showRestart?: boolean;
    showHint?: boolean;
    loading?: boolean;
  } = {}
): QuizAction[] {
  const actions: QuizAction[] = [];

  if (handlers.onSubmit && conditions.canSubmit !== false) {
    actions.push({
      id: 'submit',
      label: 'checkAnswer',
      onClick: handlers.onSubmit,
      variant: 'default',
      disabled: !conditions.canSubmit,
      loading: conditions.loading,
    });
  }

  if (handlers.onSkip && conditions.canSkip !== false) {
    actions.push({
      id: 'skip',
      label: 'skipQuestion',
      onClick: handlers.onSkip,
      variant: 'outline',
    });
  }

  if (handlers.onRetry && conditions.showRetry) {
    actions.push({
      id: 'retry',
      label: 'retry',
      onClick: handlers.onRetry,
      variant: 'outline',
    });
  }

  if (handlers.onNext && conditions.showNext) {
    actions.push({
      id: 'next',
      label: 'nextQuestion',
      onClick: handlers.onNext,
      variant: 'default',
    });
  }

  if (handlers.onRestart && conditions.showRestart) {
    actions.push({
      id: 'restart',
      label: 'restartQuiz',
      onClick: handlers.onRestart,
      variant: 'outline',
    });
  }

  if (handlers.onHint && conditions.showHint) {
    actions.push({
      id: 'hint',
      label: 'hint',
      onClick: handlers.onHint,
      variant: 'ghost',
    });
  }

  return actions;
}
