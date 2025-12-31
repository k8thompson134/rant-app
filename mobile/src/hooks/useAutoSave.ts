/**
 * useAutoSave hook
 * Automatically saves draft entries to the database with debouncing
 * Critical for ME/CFS users who may lose focus or crash
 */

import { useEffect, useRef, useState } from 'react';
import { saveDraftEntry } from '../database/operations';
import type { ExtractedSymptom } from '../types';

interface UseAutoSaveOptions {
  enabled: boolean;
  interval: number; // milliseconds
  onSave?: (draftId: string) => void;
  onError?: (error: Error) => void;
}

interface UseAutoSaveReturn {
  lastSaved: Date | null;
  isSaving: boolean;
  saveDraft: () => Promise<void>;
  error: Error | null;
}

/**
 * Hook for auto-saving draft entries
 *
 * @param text - The rant text to save
 * @param symptoms - Extracted symptoms (optional)
 * @param options - Configuration options
 * @returns Object with save status and manual save function
 *
 * @example
 * const { lastSaved, isSaving } = useAutoSave(text, symptoms, {
 *   enabled: true,
 *   interval: 5000,
 * });
 */
export function useAutoSave(
  text: string,
  symptoms: ExtractedSymptom[] = [],
  options: UseAutoSaveOptions
): UseAutoSaveReturn {
  const { enabled, interval, onSave, onError } = options;

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousTextRef = useRef<string>('');

  /**
   * Manual save function
   */
  const saveDraft = async () => {
    // Don't save empty text
    if (!text.trim()) {
      return;
    }

    // Don't save if text hasn't changed
    if (text === previousTextRef.current) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const draftId = await saveDraftEntry(text, symptoms);

      previousTextRef.current = text;
      setLastSaved(new Date());

      if (onSave) {
        onSave(draftId);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save draft');
      setError(error);
      console.error('Auto-save failed:', error);

      if (onError) {
        onError(error);
      }
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Auto-save effect
   * Debounces saves based on the interval option
   */
  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Don't save if text is empty or hasn't changed
    if (!text.trim() || text === previousTextRef.current) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set up new timeout for auto-save
    timeoutRef.current = setTimeout(() => {
      saveDraft();
    }, interval);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, symptoms, enabled, interval]);

  /**
   * Save on unmount if there are unsaved changes
   */
  useEffect(() => {
    return () => {
      if (enabled && text.trim() && text !== previousTextRef.current) {
        // Fire-and-forget save on unmount
        saveDraftEntry(text, symptoms).catch(console.error);
      }
    };
  }, []);

  return {
    lastSaved,
    isSaving,
    saveDraft,
    error,
  };
}
