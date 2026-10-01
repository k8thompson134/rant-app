import { useMemo, useState } from 'react';
import { RantEntry, SYMPTOM_DISPLAY_NAMES } from '../types';
import { TimePeriod } from '../types/insights';
import { calculateSymptomFrequency, filterEntriesByDateRange, getMonthSummary } from '../utils/trendAnalysis';
import { getDateRangeForPeriod } from '../utils/dateUtils';

const PERIODS: TimePeriod[] = ['7d', '30d', '90d', 'all'];

export default function Insights({ entries }: { entries: RantEntry[] }) {
  const [period, setPeriod] = useState<TimePeriod>('30d');

  const { freq, summary, count } = useMemo(() => {
    const range = getDateRangeForPeriod(period);
    const inRange = filterEntriesByDateRange(entries, range);
    return { freq: calculateSymptomFrequency(inRange).slice(0, 10), summary: getMonthSummary(inRange, new Date()), count: inRange.length };
  }, [entries, period]);

  return (
    <section>
      <div className="row">
        {PERIODS.map((p) => <button key={p} className={p === period ? 'active' : ''} onClick={() => setPeriod(p)}>{p}</button>)}
      </div>
      {count === 0 ? <p className="muted">No entries in this period.</p> : (
        <>
          <div className="stats">
            <div><strong>{count}</strong><span>entries</span></div>
            <div><strong>{summary.goodDays}</strong><span>good days</span></div>
            <div><strong>{summary.moderateDays}</strong><span>moderate days</span></div>
            <div><strong>{summary.roughDays}</strong><span>rough days</span></div>
          </div>
          <h2>Most frequent</h2>
          <ul className="bars">
            {freq.map((f) => (
              <li key={f.symptom}>
                <span className="bar-label">{SYMPTOM_DISPLAY_NAMES[f.symptom] ?? f.symptom.replace(/_/g, ' ')}</span>
                <span className="bar-track"><span className="bar-fill" style={{ width: `${f.percentage}%`, background: f.color }} /></span>
                <span className="bar-n">{f.count}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
