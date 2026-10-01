import { useState } from 'react';
import { useEntries } from './useEntries';
import Rant from './components/Rant';
import History from './components/History';
import Insights from './components/Insights';
import Data from './components/Data';

const TABS = ['rant', 'history', 'insights', 'data'] as const;
type Tab = (typeof TABS)[number];

export default function App() {
  const [tab, setTab] = useState<Tab>('rant');
  const { entries, add, remove, replaceAll, warning } = useEntries();

  return (
    <div className="app">
      <header>
        <h1>RantTrack</h1>
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
        {tab === 'history' && <History entries={entries} onDelete={remove} />}
        {tab === 'insights' && <Insights entries={entries} />}
        {tab === 'data' && <Data entries={entries} onReplace={replaceAll} />}
      </main>
    </div>
  );
}
