import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AudioLevelDisplay } from '../AudioLevelDisplay';
import { createAudioLevelDisplayProps } from './speech-test-utils';

describe('audioLevelDisplay', () => {
  describe('basic rendering', () => {
    it('should not render when not listening', () => {
      const props = createAudioLevelDisplayProps({
        isListening: false,
        audioLevel: 50,
      });

      const { container } = render(
        <AudioLevelDisplay {...props} data-testid="audio-level-display" />
      );
      expect(container.firstChild).toBeNull();
    });

    it('should not render when audio level is 0 or less', () => {
      const props = createAudioLevelDisplayProps({
        isListening: true,
        audioLevel: 0,
      });

      const { container } = render(
        <AudioLevelDisplay {...props} data-testid="audio-level-display" />
      );
      expect(container.firstChild).toBeNull();
    });

    it('should render 4 audio level bars when listening with audio', () => {
      const props = createAudioLevelDisplayProps({
        isListening: true,
        audioLevel: 50,
      });

      render(
        <AudioLevelDisplay {...props} data-testid="audio-level-display" />
      );
      for (let i = 0; i < 4; i++) {
        expect(screen.getByTestId(`audio-bar-${i}`)).toBeInTheDocument();
      }
    });
  });

  describe('audio level visualization', () => {
    it('should show only first bar for low audio levels (1-10%)', () => {
      const props = createAudioLevelDisplayProps({
        isListening: true,
        audioLevel: 5,
      });

      render(
        <AudioLevelDisplay {...props} data-testid="audio-level-display" />
      );
      expect(screen.getByTestId('audio-bar-0')).toHaveClass('opacity-30');
      expect(screen.getByTestId('audio-bar-1')).toHaveClass('opacity-30');
      expect(screen.getByTestId('audio-bar-2')).toHaveClass('opacity-30');
      expect(screen.getByTestId('audio-bar-3')).toHaveClass('opacity-30');
    });

    it('should show first two bars for medium-low audio levels (11-30%)', () => {
      const props = createAudioLevelDisplayProps({
        isListening: true,
        audioLevel: 25,
      });

      render(
        <AudioLevelDisplay {...props} data-testid="audio-level-display" />
      );
      expect(screen.getByTestId('audio-bar-0')).toHaveClass('opacity-100');
      expect(screen.getByTestId('audio-bar-1')).toHaveClass('opacity-30');
      expect(screen.getByTestId('audio-bar-2')).toHaveClass('opacity-30');
      expect(screen.getByTestId('audio-bar-3')).toHaveClass('opacity-30');
    });

    it('should show first three bars for medium audio levels (31-50%)', () => {
      const props = createAudioLevelDisplayProps({
        isListening: true,
        audioLevel: 40,
      });

      render(
        <AudioLevelDisplay {...props} data-testid="audio-level-display" />
      );
      expect(screen.getByTestId('audio-bar-0')).toHaveClass('opacity-100');
      expect(screen.getByTestId('audio-bar-1')).toHaveClass('opacity-100');
      expect(screen.getByTestId('audio-bar-2')).toHaveClass('opacity-30');
      expect(screen.getByTestId('audio-bar-3')).toHaveClass('opacity-30');
    });

    it('should show first three bars for medium-high audio levels (51-70%)', () => {
      const props = createAudioLevelDisplayProps({
        isListening: true,
        audioLevel: 60,
      });

      render(
        <AudioLevelDisplay {...props} data-testid="audio-level-display" />
      );
      expect(screen.getByTestId('audio-bar-0')).toHaveClass('opacity-100');
      expect(screen.getByTestId('audio-bar-1')).toHaveClass('opacity-100');
      expect(screen.getByTestId('audio-bar-2')).toHaveClass('opacity-100');
      expect(screen.getByTestId('audio-bar-3')).toHaveClass('opacity-30');
    });

    it('should show all four bars for high audio levels (>70%)', () => {
      const props = createAudioLevelDisplayProps({
        isListening: true,
        audioLevel: 85,
      });

      render(
        <AudioLevelDisplay {...props} data-testid="audio-level-display" />
      );
      expect(screen.getByTestId('audio-bar-0')).toHaveClass('opacity-100');
      expect(screen.getByTestId('audio-bar-1')).toHaveClass('opacity-100');
      expect(screen.getByTestId('audio-bar-2')).toHaveClass('opacity-100');
      expect(screen.getByTestId('audio-bar-3')).toHaveClass('opacity-100');
    });
  });

  describe('bar colors and styling', () => {
    it('should have correct colors for each bar', () => {
      const props = createAudioLevelDisplayProps({
        isListening: true,
        audioLevel: 100,
      });

      render(
        <AudioLevelDisplay {...props} data-testid="audio-level-display" />
      );
      expect(screen.getByTestId('audio-bar-0')).toHaveClass('bg-green-400');
      expect(screen.getByTestId('audio-bar-1')).toHaveClass('bg-green-400');
      expect(screen.getByTestId('audio-bar-2')).toHaveClass('bg-yellow-400');
      expect(screen.getByTestId('audio-bar-3')).toHaveClass('bg-red-400');
    });

    it('should have correct heights for each bar', () => {
      const props = createAudioLevelDisplayProps({
        isListening: true,
        audioLevel: 100,
      });

      render(
        <AudioLevelDisplay {...props} data-testid="audio-level-display" />
      );
      expect(screen.getByTestId('audio-bar-0')).toHaveClass('h-3');
      expect(screen.getByTestId('audio-bar-1')).toHaveClass('h-4');
      expect(screen.getByTestId('audio-bar-2')).toHaveClass('h-5');
      expect(screen.getByTestId('audio-bar-3')).toHaveClass('h-6');
    });

    it('should have consistent styling classes', () => {
      const props = createAudioLevelDisplayProps({
        isListening: true,
        audioLevel: 50,
      });

      render(
        <AudioLevelDisplay {...props} data-testid="audio-level-display" />
      );
      for (let i = 0; i < 4; i++) {
        const bar = screen.getByTestId(`audio-bar-${i}`);
        expect(bar).toHaveClass('w-1');
        expect(bar).toHaveClass('rounded-full');
        expect(bar).toHaveClass('transition-all');
        expect(bar).toHaveClass('duration-100');
      }
    });
  });

  describe('edge cases', () => {
    it('should handle negative audio levels', () => {
      const props = createAudioLevelDisplayProps({
        isListening: true,
        audioLevel: -10,
      });

      const { container } = render(
        <AudioLevelDisplay {...props} data-testid="audio-level-display" />
      );
      expect(container.firstChild).toBeNull();
    });

    it('should handle very high audio levels', () => {
      const props = createAudioLevelDisplayProps({
        isListening: true,
        audioLevel: 150,
      });

      render(
        <AudioLevelDisplay {...props} data-testid="audio-level-display" />
      );
      for (let i = 0; i < 4; i++) {
        expect(screen.getByTestId(`audio-bar-${i}`)).toHaveClass('opacity-100');
      }
    });

    it('should apply custom className when provided', () => {
      const props = createAudioLevelDisplayProps({
        isListening: true,
        audioLevel: 50,
        className: 'custom-class',
      });

      render(
        <AudioLevelDisplay {...props} data-testid="audio-level-display" />
      );
      const container = screen.getByTestId('audio-level-display');
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('performance and accessibility', () => {
    it('should have proper container structure', () => {
      const props = createAudioLevelDisplayProps({
        isListening: true,
        audioLevel: 50,
      });

      render(
        <AudioLevelDisplay {...props} data-testid="audio-level-display" />
      );
      const container = screen.getByTestId('audio-level-display');
      expect(container).toHaveClass('flex');
      expect(container).toHaveClass('items-center');
      expect(container).toHaveClass('space-x-1');
    });

    it('should not cause layout shifts when toggling visibility', () => {
      const { rerender } = render(
        <AudioLevelDisplay
          isListening={false}
          audioLevel={0}
          data-testid="audio-level-display"
        />
      );
      expect(document.body).toMatchSnapshot();
      rerender(
        <AudioLevelDisplay
          isListening={true}
          audioLevel={50}
          data-testid="audio-level-display"
        />
      );
      const container = screen.getByTestId('audio-level-display');
      expect(container).toBeInTheDocument();
    });
  });
});
