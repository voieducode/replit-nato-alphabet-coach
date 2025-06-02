import { useEffect, useRef, useState } from 'react';

export function useQuizTimer(
  isActive: boolean,
  isQuizComplete: boolean,
  showResult: boolean,
  quizSet: unknown
) {
  const [currentTime, setCurrentTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const prevQuizSetRef = useRef(quizSet);

  // Timer effect
  useEffect(() => {
    if (isActive && !isQuizComplete && !showResult) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, isQuizComplete, showResult]);

  // Reset timer when quiz set changes
  useEffect(() => {
    if (prevQuizSetRef.current !== quizSet) {
      prevQuizSetRef.current = quizSet;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setCurrentTime(0);
    }
  }, [quizSet]);

  return { currentTime, setCurrentTime };
}
