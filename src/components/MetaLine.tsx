import { RantEntry } from '../types';

export default function MetaLine({ metrics, activity }: Pick<RantEntry, 'metrics' | 'activity'>) {
  const parts: string[] = [];
  if (metrics?.mood !== undefined) parts.push(`Mood ${metrics.mood}/10`);
  if (metrics?.energy !== undefined) parts.push(`Energy ${metrics.energy}/10`);
  if (metrics?.stress !== undefined) parts.push(`Stress ${metrics.stress}/10`);
  if (metrics?.capacity !== undefined) parts.push(`Capacity ${metrics.capacity}/10`);
  if (metrics?.medication) parts.push(metrics.medication === 'taken' ? 'Meds taken' : 'Meds skipped');
  if (activity?.signals.length) parts.push(`Activity: ${activity.signals.slice(0, 3).join(', ')}${activity.intensity ? ` (${activity.intensity})` : ''}`);
  return parts.length ? <p className="muted meta">{parts.join(' · ')}</p> : null;
}
