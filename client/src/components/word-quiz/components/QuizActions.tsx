import { Dice6, Edit3, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  return (
    <>
      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={retryCurrentWord} variant="outline" className="w-full">
          <RotateCcw className="h-4 w-4 mr-2" />
          Retry
        </Button>
        <Button
          onClick={checkAnswer}
          className="w-full"
          disabled={!userNATOInput.trim() || (showResult && isCompleted)}
        >
          Check Answer
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button onClick={generateNewWord} variant="outline" className="w-full">
          <Dice6 className="h-4 w-4 mr-2" />
          New Random Word
        </Button>
        <Button
          onClick={() => setIsCustomMode(!isCustomMode)}
          variant="outline"
          className="w-full"
        >
          <Edit3 className="h-4 w-4 mr-2" />
          {isCustomMode ? 'Cancel Custom' : 'Custom Word'}
        </Button>
      </div>
    </>
  );
}
