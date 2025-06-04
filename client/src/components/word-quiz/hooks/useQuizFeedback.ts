import type { WordMatchResult } from '@/lib/word-matching';
import { useToast } from '@/hooks/use-toast';

export function useQuizFeedback() {
  const { toast } = useToast();

  const showResultFeedback = (result: WordMatchResult) => {
    if (result.percentage === 100) {
      toast({
        title: '🎉 Perfect!',
        description: 'All NATO words are correct!',
      });
    } else if (result.percentage >= 80) {
      toast({
        title: 'Great Job!',
        description: `${result.percentage}% correct. Excellent work!`,
      });
    } else if (result.percentage >= 50) {
      toast({
        title: 'Good Effort!',
        description: `${result.percentage}% correct. Keep practicing!`,
      });
    } else {
      toast({
        title: 'Keep Practicing!',
        description: `${result.percentage}% correct. You'll get better with practice!`,
      });
    }
  };

  return { showResultFeedback };
}
