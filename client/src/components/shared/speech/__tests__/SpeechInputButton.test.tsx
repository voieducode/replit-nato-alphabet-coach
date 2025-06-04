import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SpeechInputButton } from '../SpeechInputButton';
import { createSpeechInputButtonProps } from './speech-test-utils';

describe('speechInputButton', () => {
  describe('basic rendering', () => {
    it('should not render when speech is not supported', () => {
      const props = createSpeechInputButtonProps({
        speechSupported: false,
      });

      const { container } = render(<SpeechInputButton {...props} />);
      expect(container.firstChild).toBeNull();
    });

    it('should render microphone button when speech is supported', () => {
      const props = createSpeechInputButtonProps({
        speechSupported: true,
      });

      render(<SpeechInputButton {...props} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Start Voice Input');
    });

    it('should show Mic icon when not listening', () => {
      const props = createSpeechInputButtonProps({
        isListening: false,
      });

      render(<SpeechInputButton {...props} />);

      const button = screen.getByRole('button');
      const icon = button.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should show MicOff icon when listening', () => {
      const props = createSpeechInputButtonProps({
        isListening: true,
      });

      render(<SpeechInputButton {...props} />);

      const button = screen.getByRole('button');
      const icon = button.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Stop Voice Input');
    });
  });

  describe('audio level display integration', () => {
    it('should show audio level display when listening with audio', () => {
      const props = createSpeechInputButtonProps({
        isListening: true,
        audioLevel: 50,
      });

      render(<SpeechInputButton {...props} />);
      // There should be 4 audio bars rendered inside the audio level display
      const audioLevel = screen.getByTestId('audio-level-display');
      const bars = audioLevel.querySelectorAll('.w-1');
      expect(bars.length).toBe(4);
    });

    it('should not show audio level display when not listening', () => {
      const props = createSpeechInputButtonProps({
        isListening: false,
        audioLevel: 50,
      });

      render(<SpeechInputButton {...props} />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      // Audio level display should not be present
      expect(screen.queryByTestId('audio-level-display')).toBeNull();
    });

    it('should not show audio level display when audio level is 0', () => {
      const props = createSpeechInputButtonProps({
        isListening: true,
        audioLevel: 0,
      });

      render(<SpeechInputButton {...props} />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      // Audio level display should not be present
      expect(screen.queryByTestId('audio-level-display')).toBeNull();
    });
  });

  describe('button states and styling', () => {
    it('should have correct styling when not listening', () => {
      const props = createSpeechInputButtonProps({
        isListening: false,
        isProcessing: false,
      });

      render(<SpeechInputButton {...props} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-gray-500');
      expect(button).toHaveClass('hover:text-gray-700');
    });

    it('should have correct styling when listening', () => {
      const props = createSpeechInputButtonProps({
        isListening: true,
        isProcessing: false,
      });

      render(<SpeechInputButton {...props} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-red-600');
      expect(button).toHaveClass('bg-red-100');
      expect(button).toHaveClass('hover:bg-red-200');
    });

    it('should have correct styling when processing', () => {
      const props = createSpeechInputButtonProps({
        isListening: false,
        isProcessing: true,
      });

      render(<SpeechInputButton {...props} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-yellow-600');
      expect(button).toHaveClass('bg-yellow-100');
    });

    it('should be disabled when disabled prop is true', () => {
      const props = createSpeechInputButtonProps({
        disabled: true,
      });

      render(<SpeechInputButton {...props} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should not be disabled by default', () => {
      const props = createSpeechInputButtonProps({
        disabled: false,
      });

      render(<SpeechInputButton {...props} />);

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });
  });

  describe('button interactions', () => {
    it('should call onToggle when clicked', () => {
      const onToggle = vi.fn();
      const props = createSpeechInputButtonProps({
        onToggle,
      });

      render(<SpeechInputButton {...props} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('should not call onToggle when disabled and clicked', () => {
      const onToggle = vi.fn();
      const props = createSpeechInputButtonProps({
        onToggle,
        disabled: true,
      });

      render(<SpeechInputButton {...props} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(onToggle).not.toHaveBeenCalled();
    });

    it('should handle keyboard interactions', () => {
      const onToggle = vi.fn();
      const props = createSpeechInputButtonProps({
        onToggle,
      });

      render(<SpeechInputButton {...props} />);
      const button = screen.getByRole('button');
      // Fire keyDown for Enter and Space
      fireEvent.keyDown(button, { key: 'Enter' });
      fireEvent.keyDown(button, { key: ' ' });
      expect(onToggle).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have proper aria-label for start voice input', () => {
      const props = createSpeechInputButtonProps({
        isListening: false,
        translations: {
          startVoiceInput: 'Custom Start Voice',
          stopVoiceInput: 'Custom Stop Voice',
        },
      });

      render(<SpeechInputButton {...props} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Custom Start Voice');
    });

    it('should have proper aria-label for stop voice input', () => {
      const props = createSpeechInputButtonProps({
        isListening: true,
        translations: {
          startVoiceInput: 'Custom Start Voice',
          stopVoiceInput: 'Custom Stop Voice',
        },
      });

      render(<SpeechInputButton {...props} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Custom Stop Voice');
    });

    it('should have proper button attributes', () => {
      const props = createSpeechInputButtonProps();

      render(<SpeechInputButton {...props} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
      expect(button).toHaveClass('h-8', 'w-8', 'p-0');
    });
  });

  describe('positioning and layout', () => {
    it('should have correct positioning classes', () => {
      const props = createSpeechInputButtonProps();
      render(<SpeechInputButton {...props} />);
      const container = screen.getByTestId('speech-input-button-container');
      expect(container).toHaveClass('absolute');
      expect(container).toHaveClass('right-2');
      expect(container).toHaveClass('top-1/2');
      expect(container).toHaveClass('transform');
      expect(container).toHaveClass('-translate-y-1/2');
      expect(container).toHaveClass('flex');
      expect(container).toHaveClass('items-center');
      expect(container).toHaveClass('space-x-1');
    });

    it('should apply custom className when provided', () => {
      const props = createSpeechInputButtonProps({
        className: 'custom-positioning',
      });
      render(<SpeechInputButton {...props} />);
      const container = screen.getByTestId('speech-input-button-container');
      expect(container).toHaveClass('custom-positioning');
    });
  });

  describe('component integration', () => {
    it('should work with all states combinations', () => {
      const testCases = [
        { isListening: false, isProcessing: false, audioLevel: 0 },
        { isListening: true, isProcessing: false, audioLevel: 50 },
        { isListening: false, isProcessing: true, audioLevel: 0 },
        { isListening: true, isProcessing: true, audioLevel: 75 },
      ];

      testCases.forEach((state) => {
        const props = createSpeechInputButtonProps(state);
        const { unmount } = render(<SpeechInputButton {...props} />);

        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();

        // Verify button is accessible
        expect(button).toHaveAttribute('aria-label');

        unmount();
      });
    });

    it('should handle rapid state changes', () => {
      const onToggle = vi.fn();
      const props = createSpeechInputButtonProps({ onToggle });

      const { rerender } = render(<SpeechInputButton {...props} />);

      // Start listening
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(onToggle).toHaveBeenCalledTimes(1);

      // Update to listening state
      rerender(
        <SpeechInputButton {...props} isListening={true} audioLevel={30} />
      );

      const updatedButton = screen.getByRole('button');
      expect(updatedButton).toHaveClass('text-red-600');

      // Stop listening
      fireEvent.click(updatedButton);
      expect(onToggle).toHaveBeenCalledTimes(2);
    });
  });

  describe('error handling', () => {
    it('should handle missing translations gracefully', () => {
      const props = createSpeechInputButtonProps({
        translations: {
          startVoiceInput: '',
          stopVoiceInput: '',
        },
      });

      render(<SpeechInputButton {...props} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', '');
    });

    it('should handle undefined onToggle gracefully', () => {
      const props = createSpeechInputButtonProps({
        onToggle: undefined as any,
      });

      expect(() => {
        render(<SpeechInputButton {...props} />);
      }).not.toThrow();
    });
  });
});
