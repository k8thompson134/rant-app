import { useRef, useState } from 'react';
import { RantEntry } from '../types';

function download(name: string, mime: string, body: string) {
  const url = URL.createObjectURL(new Blob([body], { type: mime }));
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

const csvCell = (v: string) => `"${v.replace(/"/g, '""')}"`;

export default function Data({ entries, onReplace }: { entries: RantEntry[]; onReplace: (e: RantEntry[]) => void }) {
  const file = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');

  const importFile = async (f: File) => {
    try {
      const parsed = JSON.parse(await f.text());
      if (!Array.isArray(parsed) || !parsed.every((e) => e && typeof e.id === 'string' && typeof e.text === 'string' && typeof e.timestamp === 'number' && Array.isArray(e.symptoms))) {
        throw new Error('not a RantTrack export');
      }
      const known = new Set(entries.map((e) => e.id));
      const fresh = (parsed as RantEntry[]).filter((e) => !known.has(e.id));
      onReplace([...fresh, ...entries].sort((a, b) => b.timestamp - a.timestamp));
      setMsg(`Imported ${fresh.length} new entries.`);
    } catch (e) {
      setMsg(`Import failed: ${String(e)}`);
    }
  };

  const exportCsv = () => {
    const rows = entries.map((e) => [new Date(e.timestamp).toISOString(), csvCell(e.symptoms.map((s) => s.symptom).join('; ')), csvCell(e.text)].join(','));
    download('ranttrack.csv', 'text/csv', ['timestamp,symptoms,text', ...rows].join('\n'));
  };

  return (
    <section>
      <p>{entries.length} entries stored in this browser. Nothing is sent anywhere.</p>
      <div className="row">
        <button onClick={() => download('ranttrack.json', 'application/json', JSON.stringify(entries, null, 2))} disabled={!entries.length}>Export JSON</button>
        <button onClick={exportCsv} disabled={!entries.length}>Export CSV</button>
        <button onClick={() => file.current?.click()}>Import JSON</button>
        <input ref={file} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importFile(e.target.files[0])} />
      </div>
      {msg && <p role="status">{msg}</p>}
      <button className="danger" disabled={!entries.length} onClick={() => confirm('Delete all entries from this browser?') && onReplace([])}>Delete all entries</button>
    </section>
  );
}
