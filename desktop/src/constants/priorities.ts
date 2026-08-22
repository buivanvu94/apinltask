import { TaskPriority } from '../types/task';

export interface PriorityInfo {
  key: TaskPriority;
  label: string;
  color: string;
  bg: string;
}

export const PRIORITIES: PriorityInfo[] = [
  { key: 'low', label: 'Thấp', color: '#16A34A', bg: '#DCFCE7' },
  { key: 'medium', label: 'Trung bình', color: '#D97706', bg: '#FEF3C7' },
  { key: 'high', label: 'Cao', color: '#DC2626', bg: '#FEE2E2' },
];

export function getPriorityInfo(priority: TaskPriority): PriorityInfo {
  return PRIORITIES.find((p) => p.key === priority) || PRIORITIES[1];
}
