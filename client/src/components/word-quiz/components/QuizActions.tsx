import type { QuizAction } from '@/components/shared/quiz';

import { Dice6, Edit3, RotateCcw } from 'lucide-react';

import { useMemo } from 'react';
import { QuizActionButtons } from '@/components/shared/quiz';
import { useLanguage } from '@/hooks/use-language';

interface QuizActionsProps {
  retryCurrentWord: () => void;
  checkAnswer: () => void;
  generateNewWord: () => void;
  setIsCustomMode: (mode: boolean) => void;
  showResult: boolean;
  userNATOInput: string;
  isCompleted: boolean;
  isCustomMode: boolean;
}

export function QuizActions({
  retryCurrentWord,
  checkAnswer,
  generateNewWord,
  setIsCustomMode,
  showResult,
  userNATOInput,
  isCompleted,
  isCustomMode,
}: QuizActionsProps) {
  const { translations } = useLanguage();

  const actions = useMemo((): QuizAction[][] => {
    // First row: Retry and Check Answer
    const firstRowActions: QuizAction[] = [
      {
        id: 'retry',
        label: 'retry',
        onClick: retryCurrentWord,
        variant: 'outline',
        icon: RotateCcw,
      },
      {
        id: 'check',
        label: 'checkAnswer',
        onClick: checkAnswer,
        variant: 'default',
        disabled: !userNATOInput.trim() || (showResult && isCompleted),
      },
    ];

    // Second row: Generate New Word and Custom Mode
    const secondRowActions: QuizAction[] = [
      {
        id: 'generate',
        label: 'newRandomWord',
        onClick: generateNewWord,
        variant: 'outline',
        icon: Dice6,
      },
      {
        id: 'custom',
        label: isCustomMode ? 'cancelCustom' : 'customWord',
        onClick: () => setIsCustomMode(!isCustomMode),
        variant: 'outline',
        icon: Edit3,
      },
    ];

    return [firstRowActions, secondRowActions];
  }, [
    retryCurrentWord,
    checkAnswer,
    generateNewWord,
    setIsCustomMode,
    userNATOInput,
    showResult,
    isCompleted,
    isCustomMode,
    translations,
  ]);

  return (
    <div className="space-y-3">
      {actions.map((rowActions, index) => (
        <QuizActionButtons
          key={`row-${index}`}
          actions={rowActions}
          translations={translations}
          layout={{
            columns: 2,
            gap: 'md',
            buttonWidth: 'full',
          }}
        />
      ))}
    </div>
  );
}
