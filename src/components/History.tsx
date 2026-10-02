import { useState } from 'react';
import { RantEntry } from '../types';
import { analyze } from '../nlp/analyze';
import SymptomChip from './SymptomChip';
import MetaLine from './MetaLine';

interface Props {
  entries: RantEntry[];
  onDelete: (id: string) => void;
  onUpdate: (e: RantEntry) => void;
}

function EntryCard({ e, onDelete, onUpdate }: { e: RantEntry } & Omit<Props, 'entries'>) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(e.text);

  const saveEdit = () => {
    const result = analyze(text);
    onUpdate({ ...e, text, symptoms: result.symptoms, functionalCapacity: result.functionalCapacity, metrics: result.metrics, activity: result.activity });
    setEditing(false);
  };

  const dropSymptom = (i: number) => onUpdate({ ...e, symptoms: e.symptoms.filter((_, j) => j !== i) });

  return (
    <article className="entry">
      <time>{new Date(e.timestamp).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</time>
      {editing ? (
        <>
          <textarea className="edit-text" rows={4} value={text} onChange={(ev) => setText(ev.target.value)} aria-label="Edit entry text" />
          <p className="muted">Saving re-detects symptoms from the new text.</p>
          <div className="row">
            <button className="primary" onClick={saveEdit} disabled={!text.trim()}>Save changes</button>
            <button onClick={() => { setText(e.text); setEditing(false); }}>Cancel</button>
          </div>
        </>
      ) : (
        <>
          <p>{e.text}</p>
          <div className="chips">
            {e.symptoms.map((s, i) => (
              <span key={s.symptom + i} className="chip-wrap">
                <SymptomChip s={s} />
                <button className="chip-x" aria-label={`Remove ${s.symptom.replace(/_/g, ' ')}`} onClick={() => dropSymptom(i)}>×</button>
              </span>
            ))}
          </div>
          <MetaLine metrics={e.metrics} activity={e.activity} />
          <div className="row">
            <button className="link" onClick={() => setEditing(true)}>Edit</button>
            <button className="link" onClick={() => onDelete(e.id)}>Delete</button>
          </div>
        </>
      )}
    </article>
  );
}

export default function History({ entries, onDelete, onUpdate }: Props) {
  if (entries.length === 0) return <p className="muted">No entries yet.</p>;
  const byDay = new Map<string, RantEntry[]>();
  for (const e of entries) {
    const day = new Date(e.timestamp).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    byDay.set(day, [...(byDay.get(day) ?? []), e]);
  }
  return (
    <section>
      {[...byDay].map(([day, list]) => (
        <div key={day} className="day">
          <h2>{day}</h2>
          {list.map((e) => <EntryCard key={e.id} e={e} onDelete={onDelete} onUpdate={onUpdate} />)}
        </div>
      ))}
    </section>
  );
}
