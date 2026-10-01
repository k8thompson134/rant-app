import { ExtractedSymptom, SYMPTOM_DISPLAY_NAMES, getSymptomColor } from '../types';

export default function SymptomChip({ s }: { s: ExtractedSymptom }) {
  const name = SYMPTOM_DISPLAY_NAMES[s.symptom] ?? s.symptom.replace(/_/g, ' ');
  const detail = [s.severity, s.painDetails?.location, ...(s.painDetails?.qualifiers ?? [])].filter(Boolean).join(' · ');
  return (
    <span className="chip" style={{ borderColor: getSymptomColor(s.symptom) }}>
      <span className="chip-name">{name}</span>
      {detail && <span className="chip-detail">{detail}</span>}
      {s.confidence !== undefined && <span className="chip-conf">{Math.round(s.confidence * 100)}%</span>}
    </span>
  );
}
