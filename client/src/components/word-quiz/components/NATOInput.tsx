import type { WordMatchResult } from '@/lib/word-matching';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { cn } from '@/lib/utils';
import { useAutoResizeTextarea } from '../hooks/useAutoResizeTextarea';

interface NATOInputProps {
  userNATOInput: string;
  setUserNATOInput: (value: string) => void;
  showResult: boolean;
  isCompleted: boolean;
  matchResult: WordMatchResult | null;
}

export function NATOInput({
  userNATOInput,
  setUserNATOInput,
  showResult,
  isCompleted,
  matchResult,
}: NATOInputProps) {
  const textareaRef = useAutoResizeTextarea(userNATOInput);

  // Speech recognition for NATO input
  const {
    isListening,
    isProcessing,
    speechSupported,
    interimTranscript,
    error,
    startListening,
    stopListening,
    clearError,
  } = useSpeechRecognition(
    (transcript) => {
      setUserNATOInput(transcript);
    },
    {
      continuous: true,
      interimResults: true,
      autoRestart: true,
      confidenceThreshold: 0.5,
    }
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          Your NATO Alphabet Input
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={userNATOInput}
            onChange={(e) => setUserNATOInput(e.target.value)}
            placeholder={`Enter NATO words: "Alpha Bravo Charlie..."`}
            className={cn(
              'text-lg p-4 pr-12 resize-none overflow-hidden',
              isListening && 'border-blue-300 bg-blue-50',
              isProcessing && 'border-yellow-300 bg-yellow-50'
            )}
            style={{ minHeight: '60px', maxHeight: '200px' }}
            disabled={showResult && isCompleted}
          />

          {/* Speech Input Button */}
          {speechSupported && (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'absolute right-2 top-2 h-8 w-8 p-0',
                isListening ? 'text-red-600 bg-red-100' : 'text-gray-500'
              )}
              onClick={isListening ? stopListening : startListening}
              disabled={showResult && isCompleted}
            >
              🎤
            </Button>
          )}
        </div>

        {/* Speech Status */}
        {isListening && (
          <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded border">
            🎤 Listening... {interimTranscript && `(${interimTranscript})`}
          </div>
        )}

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded border">
            ⚠️ {error}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="ml-2"
            >
              ✕
            </Button>
          </div>
        )}

        {/* Real-time Score */}
        {matchResult && userNATOInput && !showResult && (
          <div className="text-sm text-center p-2 bg-gray-50 rounded">
            Live Score: {matchResult.correctCount}/{matchResult.totalCount} (
            {matchResult.percentage}%)
          </div>
        )}
      </CardContent>
    </Card>
  );
}
