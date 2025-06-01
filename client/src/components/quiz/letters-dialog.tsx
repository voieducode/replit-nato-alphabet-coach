import type { Translations } from '@/lib/i18n';
import type { ProgressType } from '@/types/progress';
import React, { memo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface LettersDialogProps {
  type: ProgressType | null;
  isOpen: boolean;
  onClose: () => void;
  letters: string[];
  translations: Translations;
}

export const LettersDialog = memo(
  ({ type, isOpen, onClose, letters, translations }: LettersDialogProps) => {
    const getTitle = () => {
      if (!type) {
        return '';
      }

      return `${translations[type]} ${translations.natoAlphabet}`;
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getTitle()}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {letters.map((letter) => (
              <div
                key={letter}
                className="p-2 text-center border rounded bg-gray-50"
              >
                {letter}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

// Add displayName for better debugging
LettersDialog.displayName = 'LettersDialog';
