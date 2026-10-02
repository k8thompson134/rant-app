import { useState } from 'react';
import { RantEntry } from '../types';

const FIELDS = [['mood', 'Mood'], ['energy', 'Energy'], ['stress', 'Stress']] as const;
type Key = (typeof FIELDS)[number][0];

export default function CheckIn({ onSave }: { onSave: (e: RantEntry) => void }) {
  const [vals, setVals] = useState<Record<Key, number>>({ mood: 5, energy: 5, stress: 5 });
  const [saved, setSaved] = useState(false);

  const save = () => {
    const text = `Check-in: mood ${vals.mood}, energy ${vals.energy}, stress ${vals.stress}`;
    onSave({ id: crypto.randomUUID(), text, timestamp: Date.now(), symptoms: [], metrics: { ...vals } });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="checkin">
      <h2>Quick check-in</h2>
      <div className="sliders">
        {FIELDS.map(([k, label]) => (
          <label key={k}>
            <span>{label}</span>
            <input type="range" min={1} max={10} value={vals[k]} onChange={(e) => setVals({ ...vals, [k]: Number(e.target.value) })} />
            <span>{vals[k]}</span>
          </label>
        ))}
      </div>
      <div className="row">
        <button onClick={save}>Log check-in</button>
        {saved && <span className="ok" role="status">Saved</span>}
      </div>
    </div>
  );
}
