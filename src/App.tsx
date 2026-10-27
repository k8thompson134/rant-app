import { useEffect, useState } from 'react';
import { useEntries } from './useEntries';
import Rant from './components/Rant';
import History from './components/History';
import Insights from './components/Insights';
import Data from './components/Data';
import { calculateStreak } from './utils/streak';

const TABS = ['rant', 'history', 'insights', 'data'] as const;
type Tab = (typeof TABS)[number];

export default function App() {
  const [tab, setTab] = useState<Tab>('rant');
  const { entries, add, remove, update, replaceAll, warning, canUndo, undo, dismissUndo } = useEntries();
  const [large, setLarge] = useState(() => localStorage.getItem('ranttrack-large-text') === '1');
  const [dark, setDark] = useState(() => localStorage.getItem('ranttrack-theme') !== 'light');
  useEffect(() => {
    document.body.classList.toggle('large', large);
    try { localStorage.setItem('ranttrack-large-text', large ? '1' : '0'); } catch {}
  }, [large]);
  useEffect(() => {
    document.body.classList.toggle('light', !dark);
    try { localStorage.setItem('ranttrack-theme', dark ? 'dark' : 'light'); } catch {}
  }, [dark]);
  const streak = calculateStreak(entries);
  useEffect(() => {
    if (!canUndo) return;
    const t = setTimeout(dismissUndo, 8000);
    return () => clearTimeout(t);
  }, [canUndo, dismissUndo]);

  return (
    <div className="app">
      <header>
        <div className="title-row">
          <h1>RantTrack</h1>
          <span style={{ display: 'inline-flex', gap: '1rem' }}>
            <button className="link" aria-pressed={!dark} onClick={() => setDark(!dark)}>{dark ? 'Light mode' : 'Dark mode'}</button>
            <button className="link" aria-pressed={large} onClick={() => setLarge(!large)}>{large ? 'Normal text' : 'Larger text'}</button>
          </span>
        </div>
        <p className="tagline">Rant about how you feel. The symptoms get sorted for you. Everything stays in this browser.{streak > 1 && <span className="streak"> {streak}-day streak</span>}</p>
      </header>
      <nav role="tablist">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </nav>
      {warning && <div className="warning" role="alert">{warning} Export your data from the Data tab so nothing is lost.</div>}
      <main>
        {tab === 'rant' && <Rant onSave={add} />}
        {tab === 'history' && <History entries={entries} onDelete={remove} onUpdate={update} />}
        {tab === 'insights' && <Insights entries={entries} />}
        {tab === 'data' && <Data entries={entries} onReplace={replaceAll} />}
      </main>
      {canUndo && (
        <div className="toast" role="status">
          Entry deleted. <button className="link" onClick={undo}>Undo</button>
        </div>
      )}
    </div>
  );
}
