import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAutoResizeTextarea } from '../useAutoResizeTextarea';

// Mock useRef and useEffect for more controlled testing
const mockUseRef = vi.fn();
const mockUseEffect = vi.fn();

vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useRef: mockUseRef,
    useEffect: mockUseEffect,
  };
});

describe('useAutoResizeTextarea', () => {
  let mockTextarea: HTMLTextAreaElement;
  let mockRef: { current: HTMLTextAreaElement | null };

  beforeEach(() => {
    vi.clearAllMocks();

    // Create a mock textarea element
    mockTextarea = {
      style: { height: '' },
      scrollHeight: 100,
    } as HTMLTextAreaElement;

    // Create a mock ref
    mockRef = { current: null };

    // Setup useRef mock
    mockUseRef.mockReturnValue(mockRef);

    // Setup useEffect mock to call the effect function immediately
    mockUseEffect.mockImplementation((fn) => fn());
  });

  describe('basic functionality', () => {
    it('should return a ref object', () => {
      const { result } = renderHook(() => useAutoResizeTextarea(''));

      expect(result.current).toBe(mockRef);
      expect(mockUseRef).toHaveBeenCalledWith(null);
    });

    it('should call useEffect with value dependency', () => {
      const testValue = 'test value';
      renderHook(() => useAutoResizeTextarea(testValue));

      expect(mockUseEffect).toHaveBeenCalledWith(expect.any(Function), [
        testValue,
      ]);
    });

    it('should resize textarea when ref is available', () => {
      // Set up textarea in ref
      mockRef.current = mockTextarea;

      Object.defineProperty(mockTextarea, 'scrollHeight', {
        get: () => 80,
        configurable: true,
      });

      renderHook(() => useAutoResizeTextarea('some text'));

      expect(mockTextarea.style.height).toBe('auto'); // First set to auto
      expect(mockTextarea.style.height).toBe('80px'); // Then set to calculated height
    });

    it('should respect minimum height constraint', () => {
      mockRef.current = mockTextarea;

      Object.defineProperty(mockTextarea, 'scrollHeight', {
        get: () => 30, // Below minimum of 60
        configurable: true,
      });

      renderHook(() => useAutoResizeTextarea('a'));

      expect(mockTextarea.style.height).toBe('60px');
    });

    it('should respect maximum height constraint', () => {
      mockRef.current = mockTextarea;

      Object.defineProperty(mockTextarea, 'scrollHeight', {
        get: () => 300, // Above maximum of 200
        configurable: true,
      });

      renderHook(() => useAutoResizeTextarea('very long text'));

      expect(mockTextarea.style.height).toBe('200px');
    });

    it('should handle normal height within bounds', () => {
      mockRef.current = mockTextarea;

      Object.defineProperty(mockTextarea, 'scrollHeight', {
        get: () => 120, // Within bounds
        configurable: true,
      });

      renderHook(() => useAutoResizeTextarea('normal text'));

      expect(mockTextarea.style.height).toBe('120px');
    });

    it('should not crash when ref current is null', () => {
      mockRef.current = null;

      expect(() => {
        renderHook(() => useAutoResizeTextarea('test'));
      }).not.toThrow();
    });

    it('should set height to auto before measuring scrollHeight', () => {
      mockRef.current = mockTextarea;
      let heightWhenScrollHeightRead = '';

      Object.defineProperty(mockTextarea, 'scrollHeight', {
        get: () => {
          heightWhenScrollHeightRead = mockTextarea.style.height;
          return 100;
        },
        configurable: true,
      });

      renderHook(() => useAutoResizeTextarea('test'));

      expect(heightWhenScrollHeightRead).toBe('auto');
    });
  });

  describe('edge cases', () => {
    it('should handle zero scrollHeight', () => {
      mockRef.current = mockTextarea;

      Object.defineProperty(mockTextarea, 'scrollHeight', {
        get: () => 0,
        configurable: true,
      });

      renderHook(() => useAutoResizeTextarea('test'));

      expect(mockTextarea.style.height).toBe('60px'); // Should use minimum
    });

    it('should handle negative scrollHeight', () => {
      mockRef.current = mockTextarea;

      Object.defineProperty(mockTextarea, 'scrollHeight', {
        get: () => -10,
        configurable: true,
      });

      renderHook(() => useAutoResizeTextarea('test'));

      expect(mockTextarea.style.height).toBe('60px'); // Should use minimum
    });

    it('should handle scrollHeight exactly at minimum boundary', () => {
      mockRef.current = mockTextarea;

      Object.defineProperty(mockTextarea, 'scrollHeight', {
        get: () => 60, // Exactly at minimum
        configurable: true,
      });

      renderHook(() => useAutoResizeTextarea('test'));

      expect(mockTextarea.style.height).toBe('60px');
    });

    it('should handle scrollHeight exactly at maximum boundary', () => {
      mockRef.current = mockTextarea;

      Object.defineProperty(mockTextarea, 'scrollHeight', {
        get: () => 200, // Exactly at maximum
        configurable: true,
      });

      renderHook(() => useAutoResizeTextarea('test'));

      expect(mockTextarea.style.height).toBe('200px');
    });

    it('should handle empty string value', () => {
      mockRef.current = mockTextarea;

      Object.defineProperty(mockTextarea, 'scrollHeight', {
        get: () => 60,
        configurable: true,
      });

      renderHook(() => useAutoResizeTextarea(''));

      expect(mockTextarea.style.height).toBe('60px');
    });

    it('should handle very long text values', () => {
      mockRef.current = mockTextarea;

      Object.defineProperty(mockTextarea, 'scrollHeight', {
        get: () => 500, // Very large
        configurable: true,
      });

      const longText = 'a'.repeat(1000);
      renderHook(() => useAutoResizeTextarea(longText));

      expect(mockTextarea.style.height).toBe('200px'); // Capped at maximum
    });

    it('should handle special characters', () => {
      mockRef.current = mockTextarea;

      Object.defineProperty(mockTextarea, 'scrollHeight', {
        get: () => 90,
        configurable: true,
      });

      renderHook(() =>
        useAutoResizeTextarea('🎉 Special chars: àáâã & émojis 🚀')
      );

      expect(mockTextarea.style.height).toBe('90px');
    });
  });

  describe('integration behavior', () => {
    it('should call effect function when value changes', () => {
      const { rerender } = renderHook(
        ({ value }) => useAutoResizeTextarea(value),
        { initialProps: { value: 'initial' } }
      );

      expect(mockUseEffect).toHaveBeenCalledWith(expect.any(Function), [
        'initial',
      ]);

      rerender({ value: 'changed' });

      expect(mockUseEffect).toHaveBeenCalledWith(expect.any(Function), [
        'changed',
      ]);
    });

    it('should maintain consistent ref across renders', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useAutoResizeTextarea(value),
        { initialProps: { value: 'initial' } }
      );

      const firstRef = result.current;

      rerender({ value: 'changed' });

      const secondRef = result.current;

      expect(firstRef).toBe(secondRef);
    });
  });
});
