import type { VoiceType } from '@/lib/voice-selector';
import { Copy, Info, Play, Square, X } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';
import { convertToNATO, natoAlphabet } from '@/lib/nato-alphabet';
import { getVoiceSettings } from '@/lib/voice-selector';

export default function ConverterSection() {
  const [inputText, setInputText] = useState('');
  const [showFullReference, setShowFullReference] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();
  const { translations } = useLanguage();

  const convertedText = convertToNATO(inputText);

  const handleCopy = async () => {
    const natoText = convertedText.map((item) => item.nato).join(' ');
    try {
      await navigator.clipboard.writeText(natoText);
      toast({
        title: translations.copied,
        description: 'NATO alphabet text copied to clipboard',
      });
    } catch (_error) {
      console.error('Failed to copy text: ', _error);
      toast({
        title: translations.copyFailed,
        description: 'Unable to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const handlePlay = () => {
    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const natoText = convertedText.map((item) => item.nato).join(', ');
    if (natoText && 'speechSynthesis' in window) {
      setIsPlaying(true);
      const utterance = new SpeechSynthesisUtterance(natoText);

      // Get voice preference from localStorage
      const voiceType = (localStorage.getItem('tts-voice') ||
        'female') as VoiceType;

      // Use the improved voice selection system
      const voiceSettings = getVoiceSettings(voiceType);

      // Apply voice and settings
      if (voiceSettings.voice) {
        utterance.voice = voiceSettings.voice;
      }
      utterance.rate = voiceSettings.rate;
      utterance.pitch = voiceSettings.pitch;
      utterance.volume = voiceSettings.volume;

      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      speechSynthesis.speak(utterance);
    } else {
      toast({
        title: translations.speechNotAvailable,
        description: 'Text-to-speech is not supported in your browser',
        variant: 'destructive',
      });
    }
  };

  const quickReferenceLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  return (
    <div className="p-4 space-y-6">
      {/* Text Input */}
      <div className="space-y-2">
        <label
          htmlFor="textInput"
          className="block text-sm font-medium text-gray-700"
        >
          {translations.enterText}
        </label>
        <div className="relative">
          <Textarea
            id="textInput"
            placeholder={translations.placeholder}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-hidden transition-colors resize-none h-32 text-base"
          />
          {inputText && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute bottom-3 right-3 p-2 text-gray-400 hover:text-gray-600"
              onClick={() => setInputText('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Conversion Result */}
      {convertedText.length > 0 && (
        <Card className="bg-gray-50 border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">
                {translations.natoAlphabet}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="text-primary hover:text-primary/80"
                onClick={handleCopy}
                aria-label="Copy NATO alphabet to clipboard"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            {/* NATO Output - Compact Pills */}
            <div className="flex flex-wrap gap-2">
              {/* Display converted NATO letters */}
              {convertedText.map((item, index) => (
                <Badge
                  // eslint-disable-next-line react/no-array-index-key
                  key={`${item.char}-${index}`}
                  variant="secondary"
                  className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                >
                  {item.nato}
                </Badge>
              ))}

              {/* Display numbers and special characters that were filtered out */}
              {inputText.split('').map((char, index) => {
                const upperChar = char.toUpperCase();
                // Only show characters that were filtered out (not letters or spaces)
                if (!/[A-Z ]/.test(upperChar)) {
                  return (
                    <Badge
                      // eslint-disable-next-line react/no-array-index-key
                      key={`special-${index}`}
                      variant="secondary"
                      className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                    >
                      {upperChar}
                    </Badge>
                  );
                }
                return null;
              })}
            </div>

            {/* Audio Control */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Button
                variant="ghost"
                className="flex items-center space-x-2 text-primary hover:text-primary/80"
                onClick={handlePlay}
              >
                {isPlaying ? (
                  <Square className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                <span className="font-medium">
                  {isPlaying
                    ? translations.stop
                    : translations.playPronunciation}
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Reference */}
      <Card className="quick-reference-card border-none shadow-material-lg">
        <CardContent className="p-4">
          <h3 className="quick-reference-label mb-3 flex items-center">
            <Info className="mr-2 h-4 w-4" />
            {translations.quickReference}
          </h3>
          <div className="quick-reference-table grid grid-cols-2 gap-2 text-sm">
            {(showFullReference
              ? Object.entries(natoAlphabet)
              : quickReferenceLetters.map((letter) => [
                  letter,
                  natoAlphabet[letter],
                ])
            ).map(([letter, nato]) => (
              <div key={letter} className="flex justify-between">
                <span className="font-mono font-semibold">{letter}</span>
                <span>{nato}</span>
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            className="mt-3 text-primary text-sm font-medium hover:text-primary/80 p-0 h-auto"
            onClick={() => setShowFullReference(!showFullReference)}
          >
            {showFullReference
              ? translations.showLess
              : translations.viewFullAlphabet}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
