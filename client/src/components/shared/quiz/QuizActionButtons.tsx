import type { LucideIcon } from 'lucide-react';
import type { Translations } from '@/lib/i18n';
import React, { memo } from 'react';
import { Button } from '@/components/ui/button';

export interface QuizAction {
  /**
   * Unique identifier for the action
   */
  id: string;
  /**
   * Button label (will be translated)
   */
  label: string;
  /**
   * Action handler
   */
  onClick: () => void;
  /**
   * Button variant
   */
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary';
  /**
   * Icon component
   */
  icon?: LucideIcon;
  /**
   * Whether button is disabled
   */
  disabled?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Button size
   */
  size?: 'sm' | 'default' | 'lg';
  /**
   * Accessibility label
   */
  'aria-label'?: string;
  /**
   * Show loading state
   */
  loading?: boolean;
}

export interface QuizActionButtonsProps {
  /**
   * Array of actions to render
   */
  actions: QuizAction[];
  /**
   * Translations object
   */
  translations: Translations;
  /**
   * Layout configuration
   */
  layout?: {
    /**
     * Number of columns in grid
     */
    columns?: 1 | 2 | 3 | 4;
    /**
     * Gap between buttons
     */
    gap?: 'sm' | 'md' | 'lg';
    /**
     * Button width
     */
    buttonWidth?: 'auto' | 'full';
  };
  /**
   * Additional CSS classes for container
   */
  className?: string;
}

const GAP_CLASSES = {
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-4',
};

const COLUMN_CLASSES = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
};

/**
 * Shared quiz action buttons component that provides consistent
 * button layouts and behavior across different quiz types
 */
export const QuizActionButtons = memo(
  ({
    actions,
    translations,
    layout = {},
    className = '',
  }: QuizActionButtonsProps) => {
    const { columns = 2, gap = 'md', buttonWidth = 'full' } = layout;

    const containerClasses = [
      'grid',
      COLUMN_CLASSES[columns],
      GAP_CLASSES[gap],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const buttonWidthClass = buttonWidth === 'full' ? 'w-full' : '';

    return (
      <div className={containerClasses}>
        {actions.map((action) => {
          const {
            id,
            label,
            onClick,
            variant = 'default',
            icon: Icon,
            disabled = false,
            className: actionClassName = '',
            size = 'default',
            loading = false,
            'aria-label': ariaLabel,
          } = action;

          const translatedLabel = (translations as any)[label] || label;
          const buttonClasses = [buttonWidthClass, actionClassName]
            .filter(Boolean)
            .join(' ');

          return (
            <Button
              key={id}
              onClick={onClick}
              variant={variant}
              size={size}
              disabled={disabled || loading}
              className={buttonClasses}
              aria-label={ariaLabel || translatedLabel}
            >
              {Icon && <Icon className="h-4 w-4 mr-2" />}
              {loading ? (
                <span className="flex items-center">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                  {translatedLabel}
                </span>
              ) : (
                translatedLabel
              )}
            </Button>
          );
        })}
      </div>
    );
  }
);

// Add displayName for better debugging
QuizActionButtons.displayName = 'QuizActionButtons';
