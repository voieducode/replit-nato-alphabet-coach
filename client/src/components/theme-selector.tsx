import { Monitor, Moon, Palette, Shield, Sun } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/hooks/use-language';
import { useTheme } from '@/hooks/use-theme';

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const { translations: _translations } = useLanguage();

  const themes = [
    {
      value: 'light' as const,
      label: 'Light',
      icon: Sun,
    },
    {
      value: 'dark' as const,
      label: 'Dark',
      icon: Moon,
    },
    {
      value: 'rainbow' as const,
      label: 'Rainbow',
      icon: Palette,
    },
    {
      value: 'nato' as const,
      label: 'NATO',
      icon: Shield,
    },
    {
      value: 'system' as const,
      label: 'System',
      icon: Monitor,
    },
  ];

  const currentTheme = themes.find((t) => t.value === theme);
  const CurrentIcon = currentTheme?.icon || Monitor;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3"
          aria-label="Select theme"
        >
          <CurrentIcon className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">{currentTheme?.label}</span>
          <span className="sm:hidden">Theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {themes.map((themeOption) => {
          const Icon = themeOption.icon;
          return (
            <DropdownMenuItem
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className={`flex items-center space-x-2 ${
                theme === themeOption.value ? 'bg-accent' : ''
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{themeOption.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
