import React, { useState } from 'react';
import { AndroidTroubleshoot } from '@/components/shared/speech';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  hasUserGesture,
  isAndroid,
  isSecureContext,
} from '../utils/android-detection';

interface MicrophoneTestSectionProps {
  speechSupported: boolean;
  isListening: boolean;
  showResult: boolean;
  error: string | null;
  testMicrophone: () => Promise<boolean>;
  clearError: () => void;
  startListening: () => void;
}

export function MicrophoneTestSection({
  speechSupported,
  isListening,
  showResult,
  error,
  testMicrophone,
  clearError,
  startListening,
}: MicrophoneTestSectionProps) {
  const { toast } = useToast();
  const [showAndroidTroubleshoot, setShowAndroidTroubleshoot] = useState(false);

  if (!speechSupported || isListening || showResult) {
    return null;
  }

  return (
    <>
      {/* Android Troubleshoot Component */}
      {(error || showAndroidTroubleshoot) && (
        <div className="mt-3">
          <AndroidTroubleshoot
            isAndroid={isAndroid()}
            isSecureContext={isSecureContext()}
            hasUserGesture={hasUserGesture()}
            onRetry={() => {
              clearError();
              setShowAndroidTroubleshoot(false);
              startListening();
            }}
            onDismiss={() => {
              setShowAndroidTroubleshoot(false);
            }}
          />
        </div>
      )}

      {/* Microphone Test Button */}
      <div className="mt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            const result = await testMicrophone();
            if (result) {
              // Microphone test passed, show a success toast
              toast({
                title: 'Microphone Test',
                description:
                  "Microphone test successful! You're ready to use voice input.",
                variant: 'default',
              });
              setShowAndroidTroubleshoot(false);
            } else {
              // Microphone test failed, show troubleshoot for Android users
              if (isAndroid()) {
                setShowAndroidTroubleshoot(true);
              }
            }
          }}
          className="text-xs"
        >
          Test Microphone
        </Button>
      </div>
    </>
  );
}
