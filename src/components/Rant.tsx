import { useEffect, useMemo, useRef, useState } from 'react';
import { analyze } from '../nlp/analyze';
import { RantEntry } from '../types';
import SymptomChip from './SymptomChip';
import MetaLine from './MetaLine';

type Recognition = {
  continuous: boolean; interimResults: boolean; lang: string;
  start(): void; stop(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
};

const SR = (window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition });
const Recognizer = SR.SpeechRecognition ?? SR.webkitSpeechRecognition;

const EXAMPLES = [
  "Exhausted and foggy today. Headache behind my eyes, about a 6 out of 10.",
  "Crashed after walking the dog yesterday. Legs feel like lead, no nausea though.",
  "Heart racing when I stood up, dizzy, then night sweats again.",
];

export default function Rant({ onSave }: { onSave: (e: RantEntry) => void }) {
  const [text, setText] = useState('');
  const [listening, setListening] = useState(false);
  const [saved, setSaved] = useState(false);
  const rec = useRef<Recognition | null>(null);

  const result = useMemo(() => (text.trim() ? analyze(text) : null), [text]);

  useEffect(() => () => rec.current?.stop(), []);

  const toggleVoice = () => {
    if (!Recognizer) return;
    if (listening) { rec.current?.stop(); return; }
    const r = new Recognizer();
    r.continuous = true; r.interimResults = false; r.lang = 'en-US';
    r.onresult = (e) => {
      const said = Array.from(e.results).map((x) => x[0].transcript).join(' ');
      setText((prev) => (prev ? prev + ' ' : '') + said);
    };
    r.onend = () => setListening(false);
    rec.current = r;
    r.start();
    setListening(true);
  };

  const save = () => {
    if (!result) return;
    onSave({ id: crypto.randomUUID(), text, timestamp: Date.now(), symptoms: result.symptoms, functionalCapacity: result.functionalCapacity, metrics: result.metrics, activity: result.activity });
    setText('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <section>
      <label htmlFor="rant" className="sr">How are you feeling?</label>
      <textarea id="rant" rows={6} value={text} onChange={(e) => setText(e.target.value)} placeholder="Type or speak. Messy is fine." />
      <div className="row">
        {Recognizer && (
          <button onClick={toggleVoice} aria-pressed={listening}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
            </svg>
            {listening ? 'Stop listening' : 'Speak'}
          </button>
        )}
        <button className="primary" onClick={save} disabled={!result || result.symptoms.length === 0}>Save entry</button>
        {saved && <span className="ok" role="status">Saved</span>}
      </div>
      {!text && (
        <div className="examples">
          <p>Try an example:</p>
          {EXAMPLES.map((ex) => <button key={ex} className="example" onClick={() => setText(ex)}>{ex}</button>)}
        </div>
      )}
      {result && (
        <div className="result">
          <h2>Detected</h2>
          {result.symptoms.length === 0 ? <p className="muted">Nothing detected yet.</p> : (
            <div className="chips">{result.symptoms.map((s, i) => <SymptomChip key={s.symptom + i} s={s} />)}</div>
          )}
          <MetaLine metrics={result.metrics} activity={result.activity} />
        </div>
      )}
    </section>
  );
}
