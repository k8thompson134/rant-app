import { useMemo } from 'react';
import { RantEntry } from '../types';
import { getWeeklyCapsuleData } from '../utils/trendAnalysis';
import { startOfWeek } from '../utils/dateUtils';
import { displayName } from '../utils/displayName';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function intensityOpacity(val: number): number {
  if (val < 0) return 0;
  return 0.15 + (val / 10) * 0.85;
}

export default function WeeklyCapsule({ entries }: { entries: RantEntry[] }) {
  const data = useMemo(() => {
    const week = startOfWeek(new Date());
    return getWeeklyCapsuleData(entries, week);
  }, [entries]);

  if (data.length === 0) return null;

  return (
    <div className="capsule">
      <h2>This week</h2>
      <div className="capsule-grid">
        <div className="capsule-row capsule-header">
          <span className="capsule-label" />
          {DAYS.map((d, i) => <span key={i} className="capsule-cell capsule-day">{d}</span>)}
        </div>
        {data.map((row) => (
          <div key={row.symptom} className="capsule-row">
            <span className="capsule-label">{displayName(row.symptom)}</span>
            {row.dailyIntensities.map((val, i) => (
              <span
                key={i}
                className="capsule-cell"
                style={{
                  backgroundColor: val < 0 ? 'var(--panel2)' : row.color,
                  opacity: val < 0 ? 0.3 : intensityOpacity(val),
                }}
                title={val < 0 ? 'No data' : `Severity: ${val}/10`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
