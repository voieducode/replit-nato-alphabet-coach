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
      label: 'Ocean Blue',
      description: 'Clean and bright design',
      icon: Sun,
    },
    {
      value: 'dark' as const,
      label: 'Midnight Sky',
      description: 'Dark mode for low light',
      icon: Moon,
    },
    {
      value: 'rainbow' as const,
      label: 'Aurora',
      description: 'Vibrant and colorful',
      icon: Palette,
    },
    {
      value: 'nato' as const,
      label: 'Military Green',
      description: 'NATO-inspired tactical theme',
      icon: Shield,
    },
    {
      value: 'system' as const,
      label: 'Auto',
      description: 'Follows device setting',
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
      <DropdownMenuContent align="end" className="w-48">
        {themes.map((themeOption) => {
          const Icon = themeOption.icon;
          return (
            <DropdownMenuItem
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className={`flex items-start space-x-3 p-3 ${
                theme === themeOption.value ? 'bg-accent' : ''
              }`}
            >
              <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="font-medium">{themeOption.label}</span>
                <span className="text-xs text-muted-foreground">
                  {themeOption.description}
                </span>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
