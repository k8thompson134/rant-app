import { RantEntry } from '../types';
import SymptomChip from './SymptomChip';

export default function History({ entries, onDelete }: { entries: RantEntry[]; onDelete: (id: string) => void }) {
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
          {list.map((e) => (
            <article key={e.id} className="entry">
              <time>{new Date(e.timestamp).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</time>
              <p>{e.text}</p>
              <div className="chips">{e.symptoms.map((s, i) => <SymptomChip key={s.symptom + i} s={s} />)}</div>
              <button className="link" onClick={() => onDelete(e.id)}>Delete</button>
            </article>
          ))}
        </div>
      ))}
    </section>
  );
}
