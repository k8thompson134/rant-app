import { useCallback, useRef, useState } from 'react';
import { RantEntry } from './types';
import { loadEntries, saveEntries } from './storage';

export function useEntries() {
  const [initial] = useState(loadEntries);
  const [entries, setEntries] = useState<RantEntry[]>(initial.entries);
  const [warning, setWarning] = useState<string | undefined>(initial.error);

  const commit = useCallback((next: RantEntry[]) => {
    setEntries(next);
    const result = saveEntries(next);
    setWarning(result.ok ? undefined : result.error);
  }, []);

  const add = useCallback((entry: RantEntry) => commit([entry, ...entries]), [entries, commit]);
  const replaceAll = commit;
  const update = useCallback((entry: RantEntry) => commit(entries.map((e) => (e.id === entry.id ? entry : e))), [entries, commit]);

  const removed = useRef<{ entry: RantEntry; index: number } | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const removeWithUndo = useCallback((id: string) => {
    const index = entries.findIndex((e) => e.id === id);
    if (index === -1) return;
    removed.current = { entry: entries[index], index };
    setCanUndo(true);
    commit(entries.filter((e) => e.id !== id));
  }, [entries, commit]);
  const undo = useCallback(() => {
    if (!removed.current) return;
    const { entry, index } = removed.current;
    const next = [...entries];
    next.splice(Math.min(index, next.length), 0, entry);
    removed.current = null;
    setCanUndo(false);
    commit(next);
  }, [entries, commit]);
  const dismissUndo = useCallback(() => { removed.current = null; setCanUndo(false); }, []);

  return { entries, add, remove: removeWithUndo, update, replaceAll, warning, canUndo, undo, dismissUndo };
}
