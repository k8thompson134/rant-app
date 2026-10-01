import { ExtractedSymptom, getSymptomColor } from '../types';
import { displayName } from '../utils/displayName';

export default function SymptomChip({ s }: { s: ExtractedSymptom }) {
  const detail = [s.severity, s.painDetails?.location, ...(s.painDetails?.qualifiers ?? [])].filter(Boolean).join(' · ');
  return (
    <span className="chip" style={{ borderColor: getSymptomColor(s.symptom) }}>
      <span className="chip-name">{displayName(s.symptom)}</span>
      {detail && <span className="chip-detail">{detail}</span>}
      {s.confidence !== undefined && <span className="chip-conf">{Math.round(s.confidence * 100)}%</span>}
    </span>
  );
}
