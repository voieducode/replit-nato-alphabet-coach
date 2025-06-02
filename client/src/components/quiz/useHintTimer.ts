import { useEffect, useState } from 'react';

export function useHintTimer(isActive: boolean, showResult: boolean) {
  const [showHint, setShowHint] = useState(false);
  const [hintTimer, setHintTimer] = useState(0);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isActive && !showResult) {
      intervalId = setInterval(() => {
        setHintTimer((timer) => {
          if (timer >= 5 && !showHint) {
            setShowHint(true);
          }
          return timer + 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [isActive, showResult, showHint]);

  const resetHint = () => {
    setShowHint(false);
    setHintTimer(0);
  };

  return { showHint, setShowHint, hintTimer, setHintTimer, resetHint };
}
