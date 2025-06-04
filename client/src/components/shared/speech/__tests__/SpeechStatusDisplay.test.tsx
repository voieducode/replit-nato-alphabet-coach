import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SpeechStatusDisplay } from '../SpeechStatusDisplay';
import { createSpeechStatusDisplayProps } from './speech-test-utils';

describe('speechStatusDisplay', () => {
  describe('basic rendering', () => {
    it('should not render when there is nothing to show', () => {
      const props = createSpeechStatusDisplayProps({
        isListening: false,
        isProcessing: false,
        error: null,
        interimTranscript: '',
      });

      const { container } = render(<SpeechStatusDisplay {...props} />);
      expect(container.firstChild).toBeNull();
    });

    it('should render when listening', () => {
      const props = createSpeechStatusDisplayProps({
        isListening: true,
      });

      render(<SpeechStatusDisplay {...props} />);

      const statusElement = screen.getByText(/Listening for NATO words/);
      expect(statusElement).toBeInTheDocument();
    });

    it('should render when there is an error', () => {
      const props = createSpeechStatusDisplayProps({
        error: 'Microphone access denied',
      });

      render(<SpeechStatusDisplay {...props} />);

      const errorElement = screen.getByText('Microphone access denied');
      expect(errorElement).toBeInTheDocument();
    });

    it('should render when there is interim transcript', () => {
      const props = createSpeechStatusDisplayProps({
        interimTranscript: 'alpha bravo',
        showInterimText: true,
      });

      render(<SpeechStatusDisplay {...props} />);

      const interimElement = screen.getByText('Hearing: "alpha bravo"');
      expect(interimElement).toBeInTheDocument();
    });
  });

  describe('error display', () => {
    it('should show error with close button', () => {
      const onClearError = vi.fn();
      const props = createSpeechStatusDisplayProps({
        error: 'Network error occurred',
        onClearError,
      });

      render(<SpeechStatusDisplay {...props} />);

      const errorText = screen.getByText('Network error occurred');
      const closeButton = screen.getByRole('button');
      const alertIcon = screen.getByRole('img', { name: /error icon/i });

      expect(errorText).toBeInTheDocument();
      expect(closeButton).toBeInTheDocument();
      expect(alertIcon).toBeInTheDocument();
    });

    it('should call onClearError when close button is clicked', () => {
      const onClearError = vi.fn();
      const props = createSpeechStatusDisplayProps({
        error: 'Test error',
        onClearError,
      });

      render(<SpeechStatusDisplay {...props} />);

      const closeButton = screen.getByRole('button');
      fireEvent.click(closeButton);

      expect(onClearError).toHaveBeenCalledTimes(1);
    });

    it('should have correct error styling', () => {
      const props = createSpeechStatusDisplayProps({
        error: 'Test error',
      });

      render(<SpeechStatusDisplay {...props} />);

      const errorContainer = screen.getByText('Test error').closest('div');
      expect(errorContainer).toHaveClass('text-red-600');
      expect(errorContainer).toHaveClass('bg-red-50');
      expect(errorContainer).toHaveClass('border-red-200');
    });
  });

  describe('listening state display', () => {
    it('should show listening state with animated dots', () => {
      const props = createSpeechStatusDisplayProps({
        isListening: true,
        error: null,
      });

      render(<SpeechStatusDisplay {...props} />);

      const listeningContainer = screen
        .getByText(/Listening for NATO words/)
        .closest('div');
      expect(listeningContainer).toHaveClass('text-blue-600');
      expect(listeningContainer).toHaveClass('bg-blue-50');
      expect(listeningContainer).toHaveClass('border-blue-200');

      // Check for animated dots
      const dots = listeningContainer?.querySelectorAll('.animate-pulse');
      expect(dots).toHaveLength(3);
    });

    it('should show processing state when processing', () => {
      const props = createSpeechStatusDisplayProps({
        isListening: true,
        isProcessing: true,
        error: null,
      });

      render(<SpeechStatusDisplay {...props} />);

      const processingText = screen.getByText('Processing speech...');
      expect(processingText).toBeInTheDocument();
    });

    it('should use custom natoInputListening translation', () => {
      const props = createSpeechStatusDisplayProps({
        isListening: true,
        isProcessing: false,
        error: null,
        translations: {
          startVoiceInput: 'Start',
          stopVoiceInput: 'Stop',
          natoInputListening: 'Custom listening message',
        },
      });

      render(<SpeechStatusDisplay {...props} />);

      const customMessage = screen.getByText('Custom listening message');
      expect(customMessage).toBeInTheDocument();
    });

    it('should fall back to default listening message', () => {
      const props = createSpeechStatusDisplayProps({
        isListening: true,
        isProcessing: false,
        error: null,
        translations: {
          startVoiceInput: 'Start',
          stopVoiceInput: 'Stop',
          // natoInputListening not provided
        },
      });

      render(<SpeechStatusDisplay {...props} />);

      const defaultMessage = screen.getByText(/Listening... \(Language:/);
      expect(defaultMessage).toBeInTheDocument();
    });

    it('should not show listening state when error is present', () => {
      const props = createSpeechStatusDisplayProps({
        isListening: true,
        error: 'Some error',
      });

      render(<SpeechStatusDisplay {...props} />);

      // Error should be shown
      const errorText = screen.getByText('Some error');
      expect(errorText).toBeInTheDocument();

      // Listening state should not be shown
      const listeningText = screen.queryByText(/Listening/);
      expect(listeningText).toBeNull();
    });
  });

  describe('interim transcript display', () => {
    it('should show interim transcript when available', () => {
      const props = createSpeechStatusDisplayProps({
        interimTranscript: 'charlie delta',
        showInterimText: true,
        error: null,
      });

      render(<SpeechStatusDisplay {...props} />);

      const interimText = screen.getByText('Hearing: "charlie delta"');
      expect(interimText).toBeInTheDocument();
      expect(interimText).toHaveClass('text-gray-500');
      expect(interimText).toHaveClass('italic');
    });

    it('should not show interim transcript when showInterimText is false', () => {
      const props = createSpeechStatusDisplayProps({
        interimTranscript: 'charlie delta',
        showInterimText: false,
        error: null,
      });

      render(<SpeechStatusDisplay {...props} />);

      const interimText = screen.queryByText('Hearing: "charlie delta"');
      expect(interimText).toBeNull();
    });

    it('should not show interim transcript when error is present', () => {
      const props = createSpeechStatusDisplayProps({
        interimTranscript: 'charlie delta',
        showInterimText: true,
        error: 'Test error',
      });

      render(<SpeechStatusDisplay {...props} />);

      // Error should be shown
      const errorText = screen.getByText('Test error');
      expect(errorText).toBeInTheDocument();

      // Interim transcript should not be shown
      const interimText = screen.queryByText('Hearing: "charlie delta"');
      expect(interimText).toBeNull();
    });

    it('should handle empty interim transcript', () => {
      const props = createSpeechStatusDisplayProps({
        interimTranscript: '',
        showInterimText: true,
        error: null,
      });

      render(<SpeechStatusDisplay {...props} />);

      const interimText = screen.queryByText(/Hearing:/);
      expect(interimText).toBeNull();
    });
  });

  describe('component layout and styling', () => {
    it('should have correct container classes', () => {
      const props = createSpeechStatusDisplayProps({
        isListening: true,
      });

      render(<SpeechStatusDisplay {...props} />);

      const container = screen
        .getByText(/Listening/)
        .closest('div')?.parentElement;
      expect(container).toHaveClass('mt-2');
      expect(container).toHaveClass('text-sm');
      expect(container).toHaveClass('space-y-2');
    });

    it('should apply custom className', () => {
      const props = createSpeechStatusDisplayProps({
        isListening: true,
        className: 'custom-status-class',
      });

      render(<SpeechStatusDisplay {...props} />);

      const container = screen
        .getByText(/Listening/)
        .closest('div')?.parentElement;
      expect(container).toHaveClass('custom-status-class');
    });

    it('should handle multiple states simultaneously', () => {
      const props = createSpeechStatusDisplayProps({
        isListening: true,
        isProcessing: true,
        interimTranscript: 'echo foxtrot',
        error: null,
        showInterimText: true,
      });

      render(<SpeechStatusDisplay {...props} />);

      // Should show processing state
      const processingText = screen.getByText('Processing speech...');
      expect(processingText).toBeInTheDocument();

      // Should show interim transcript
      const interimText = screen.getByText('Hearing: "echo foxtrot"');
      expect(interimText).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper semantic structure for error', () => {
      const props = createSpeechStatusDisplayProps({
        error: 'Accessibility test error',
      });

      render(<SpeechStatusDisplay {...props} />);

      const errorContainer = screen
        .getByText('Accessibility test error')
        .closest('div');
      expect(errorContainer).toHaveClass('flex');
      expect(errorContainer).toHaveClass('items-center');
      expect(errorContainer).toHaveClass('space-x-2');

      // Should have icon
      const icon = errorContainer?.querySelector('svg');
      expect(icon).toBeInTheDocument();

      // Should have close button
      const closeButton = screen.getByRole('button');
      expect(closeButton).toBeInTheDocument();
    });

    it('should have proper semantic structure for listening state', () => {
      const props = createSpeechStatusDisplayProps({
        isListening: true,
        error: null,
      });

      render(<SpeechStatusDisplay {...props} />);

      const listeningContainer = screen.getByText(/Listening/).closest('div');
      expect(listeningContainer).toHaveClass('flex');
      expect(listeningContainer).toHaveClass('items-center');
      expect(listeningContainer).toHaveClass('space-x-2');
    });

    it('should handle screen reader interactions', () => {
      const onClearError = vi.fn();
      const props = createSpeechStatusDisplayProps({
        error: 'Screen reader test',
        onClearError,
      });

      render(<SpeechStatusDisplay {...props} />);

      const closeButton = screen.getByRole('button');

      // Test keyboard interaction
      fireEvent.keyDown(closeButton, { key: 'Enter' });
      expect(onClearError).toHaveBeenCalledTimes(1);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle missing translations gracefully', () => {
      const props = createSpeechStatusDisplayProps({
        isListening: true,
        translations: {
          startVoiceInput: '',
          stopVoiceInput: '',
        },
      });

      render(<SpeechStatusDisplay {...props} />);

      // Should still render with fallback
      const fallbackMessage = screen.getByText(/Listening... \(Language:/);
      expect(fallbackMessage).toBeInTheDocument();
    });

    it('should handle undefined onClearError', () => {
      const props = createSpeechStatusDisplayProps({
        error: 'Test error',
        onClearError: undefined as any,
      });

      expect(() => {
        render(<SpeechStatusDisplay {...props} />);
      }).not.toThrow();

      const closeButton = screen.getByRole('button');
      expect(() => {
        fireEvent.click(closeButton);
      }).not.toThrow();
    });

    it('should handle very long error messages', () => {
      const longError =
        'This is a very long error message that should be handled gracefully by the component without breaking the layout or causing any issues with the user interface';
      const props = createSpeechStatusDisplayProps({
        error: longError,
      });

      render(<SpeechStatusDisplay {...props} />);

      const errorText = screen.getByText(longError);
      expect(errorText).toBeInTheDocument();
      expect(errorText).toHaveClass('flex-1');
    });

    it('should handle very long interim transcripts', () => {
      const longTranscript =
        'alpha bravo charlie delta echo foxtrot golf hotel india juliet kilo lima mike november oscar papa quebec romeo sierra tango uniform victor whiskey xray yankee zulu';
      const props = createSpeechStatusDisplayProps({
        interimTranscript: longTranscript,
        showInterimText: true,
        error: null,
      });

      render(<SpeechStatusDisplay {...props} />);

      const interimText = screen.getByText(`Hearing: "${longTranscript}"`);
      expect(interimText).toBeInTheDocument();
    });
  });

  describe('component lifecycle', () => {
    it('should handle rapid state changes', () => {
      const props = createSpeechStatusDisplayProps({
        isListening: false,
        error: null,
      });

      const { rerender } = render(<SpeechStatusDisplay {...props} />);

      // Start listening
      rerender(<SpeechStatusDisplay {...props} isListening={true} />);
      expect(screen.getByText(/Listening/)).toBeInTheDocument();

      // Add interim transcript
      rerender(
        <SpeechStatusDisplay
          {...props}
          isListening={true}
          interimTranscript="test"
        />
      );
      expect(screen.getByText('Hearing: "test"')).toBeInTheDocument();

      // Error occurs
      rerender(
        <SpeechStatusDisplay
          {...props}
          isListening={true}
          interimTranscript="test"
          error="Error!"
        />
      );
      expect(screen.getByText('Error!')).toBeInTheDocument();
      expect(screen.queryByText(/Listening/)).toBeNull();
      expect(screen.queryByText('Hearing: "test"')).toBeNull();

      // Clear error
      rerender(
        <SpeechStatusDisplay
          {...props}
          isListening={false}
          error={null}
          interimTranscript=""
        />
      );
      const { container } = render(
        <SpeechStatusDisplay
          {...props}
          isListening={false}
          error={null}
          interimTranscript=""
        />
      );
      expect(container.firstChild).toBeNull();
    });
  });
});
