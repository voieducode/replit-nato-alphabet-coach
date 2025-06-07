import { Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AudioControlButtonProps {
  onSpeak: () => void;
  className?: string;
  disabled?: boolean;
}

export function AudioControlButton({
  onSpeak,
  className,
  disabled = false,
}: AudioControlButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onSpeak}
      className={className}
      disabled={disabled}
    >
      <Volume2 className="h-4 w-4" />
    </Button>
  );
}
