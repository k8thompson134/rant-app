import { useCallback, useState } from 'react';
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
  const remove = useCallback((id: string) => commit(entries.filter((e) => e.id !== id)), [entries, commit]);
  const replaceAll = commit;

  return { entries, add, remove, replaceAll, warning };
}
