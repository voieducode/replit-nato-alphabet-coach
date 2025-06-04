import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/hooks/use-language';

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
  const { translations } = useLanguage();
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
        <CardTitle className="text-sm font-medium">
          {translations.enterCustomWord}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          ref={inputRef}
          value={customWordInput}
          onChange={(e) => setCustomWordInput(e.target.value)}
          placeholder={translations.enterYourWordOrPhrase}
          className="w-full"
        />
        <Button
          onClick={handleCustomWord}
          className="w-full"
          disabled={!customWordInput.trim()}
        >
          {translations.useThisWord}
        </Button>
      </CardContent>
    </Card>
  );
}
