import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface CustomWordInputProps {
  isCustomMode: boolean;
  customWordInput: string;
  setCustomWordInput: (value: string) => void;
  handleCustomWord: () => void;
}

export function CustomWordInput({
  isCustomMode,
  customWordInput,
  setCustomWordInput,
  handleCustomWord,
}: CustomWordInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when component mounts (custom mode activated)
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isCustomMode) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Enter Custom Word</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          ref={inputRef}
          value={customWordInput}
          onChange={(e) => setCustomWordInput(e.target.value)}
          placeholder="Enter your word or phrase..."
          className="w-full"
        />
        <Button
          onClick={handleCustomWord}
          className="w-full"
          disabled={!customWordInput.trim()}
        >
          Use This Word
        </Button>
      </CardContent>
    </Card>
  );
}
