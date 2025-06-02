import { useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';

interface RTLWrapperProps {
  children: React.ReactNode;
}

export function RTLWrapper({ children }: RTLWrapperProps) {
  const { language, direction, isRTL } = useLanguage();

  useEffect(() => {
    // Update HTML document attributes
    const html = document.documentElement;
    html.lang = language;
    html.dir = direction;

    // Add/remove RTL class for additional styling if needed
    if (isRTL) {
      html.classList.add('rtl');
    } else {
      html.classList.remove('rtl');
    }
  }, [language, direction, isRTL]);

  return (
    <div
      className={`min-h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`}
      dir={direction}
    >
      {children}
    </div>
  );
}
