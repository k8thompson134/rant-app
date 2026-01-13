/**
 * Custom Lemmas Context
 * Provides custom symptom word mappings to all components that need them.
 * Loads once on app start and refreshes when custom words are added/deleted.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getCustomLemmasMap } from '../database/customLemmaOps';

interface CustomLemmasContextType {
  /** Map of custom words to their symptom mappings */
  customLemmas: Record<string, string>;
  /** Whether the lemmas are still loading */
  isLoading: boolean;
  /** Refresh the custom lemmas (call after adding/deleting) */
  refreshLemmas: () => Promise<void>;
}

const CustomLemmasContext = createContext<CustomLemmasContextType | undefined>(undefined);

interface CustomLemmasProviderProps {
  children: ReactNode;
}

export function CustomLemmasProvider({ children }: CustomLemmasProviderProps) {
  const [customLemmas, setCustomLemmas] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  const refreshLemmas = useCallback(async () => {
    try {
      const lemmasMap = await getCustomLemmasMap();
      setCustomLemmas(lemmasMap);
    } catch (error) {
      console.error('Failed to load custom lemmas:', error);
      setCustomLemmas({});
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load custom lemmas on mount
  useEffect(() => {
    refreshLemmas();
  }, [refreshLemmas]);

  return (
    <CustomLemmasContext.Provider value={{ customLemmas, isLoading, refreshLemmas }}>
      {children}
    </CustomLemmasContext.Provider>
  );
}

/**
 * Hook to access custom lemmas
 * Returns the custom lemmas map and a refresh function
 */
export function useCustomLemmas(): CustomLemmasContextType {
  const context = useContext(CustomLemmasContext);
  if (context === undefined) {
    throw new Error('useCustomLemmas must be used within a CustomLemmasProvider');
  }
  return context;
}
