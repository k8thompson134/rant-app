import { useEffect, useState } from 'react';
import { useEntries } from './useEntries';
import Rant from './components/Rant';
import History from './components/History';
import Insights from './components/Insights';
import Data from './components/Data';

const TABS = ['rant', 'history', 'insights', 'data'] as const;
type Tab = (typeof TABS)[number];

export default function App() {
  const [tab, setTab] = useState<Tab>('rant');
  const { entries, add, remove, update, replaceAll, warning, canUndo, undo, dismissUndo } = useEntries();
  const [large, setLarge] = useState(() => localStorage.getItem('ranttrack-large-text') === '1');
  useEffect(() => {
    document.body.classList.toggle('large', large);
    try { localStorage.setItem('ranttrack-large-text', large ? '1' : '0'); } catch { /* preference only */ }
  }, [large]);
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
          <button className="link" aria-pressed={large} onClick={() => setLarge(!large)}>{large ? 'Normal text' : 'Larger text'}</button>
        </div>
        <p className="tagline">Rant about how you feel. The symptoms get sorted for you. Everything stays in this browser.</p>
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
