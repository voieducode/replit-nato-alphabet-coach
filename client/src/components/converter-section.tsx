import { useState } from "react";
import { Copy, X, Play, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { natoAlphabet, convertToNATO } from "@/lib/nato-alphabet";

export default function ConverterSection() {
  const [inputText, setInputText] = useState("");
  const [showFullReference, setShowFullReference] = useState(false);
  const { toast } = useToast();

  const convertedText = convertToNATO(inputText);

  const handleCopy = async () => {
    const natoText = convertedText.map(item => item.nato).join(" ");
    try {
      await navigator.clipboard.writeText(natoText);
      toast({
        title: "Copied!",
        description: "NATO alphabet text copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handlePlay = () => {
    // Text-to-speech functionality
    const natoText = convertedText.map(item => item.nato).join(", ");
    if (natoText && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(natoText);
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "Speech not available",
        description: "Text-to-speech is not supported in your browser",
        variant: "destructive",
      });
    }
  };

  const quickReferenceLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  return (
    <div className="p-4 space-y-6">
      {/* Text Input */}
      <div className="space-y-2">
        <label htmlFor="textInput" className="block text-sm font-medium text-gray-700">
          Enter text to convert:
        </label>
        <div className="relative">
          <Textarea
            id="textInput"
            placeholder="Type your message here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors resize-none h-32 text-base"
          />
          {inputText && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute bottom-3 right-3 p-2 text-gray-400 hover:text-gray-600"
              onClick={() => setInputText("")}
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
              <h3 className="font-semibold text-gray-800">NATO Alphabet:</h3>
              <Button
                variant="ghost"
                size="icon"
                className="text-primary hover:text-primary/80"
                onClick={handleCopy}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            
            {/* NATO Output */}
            <div className="space-y-2">
              {convertedText.map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 bg-white rounded border">
                  <span className="font-mono text-lg font-semibold text-primary w-8 text-center">
                    {item.char}
                  </span>
                  <span className="text-gray-600">→</span>
                  <span className="font-medium">{item.nato}</span>
                </div>
              ))}
            </div>
            
            {/* Audio Control */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Button
                variant="ghost"
                className="flex items-center space-x-2 text-primary hover:text-primary/80"
                onClick={handlePlay}
              >
                <Play className="h-4 w-4" />
                <span className="font-medium">Play Pronunciation</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Reference */}
      <Card className="bg-blue-50 border border-blue-100">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
            <Info className="mr-2 h-4 w-4" />
            Quick Reference
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {(showFullReference ? Object.entries(natoAlphabet) : quickReferenceLetters.map(letter => [letter, natoAlphabet[letter]])).map(([letter, nato]) => (
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
            {showFullReference ? "Show Less" : "View Full Alphabet →"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
