import { TaskRepeat } from '../types/task';

export interface RepeatInfo {
  key: TaskRepeat;
  label: string;
}

export const REPEATS: RepeatInfo[] = [
  { key: 'none', label: 'Không lặp lại' },
  { key: 'daily', label: 'Hàng ngày' },
  { key: 'weekly', label: 'Hàng tuần' },
];

export function getRepeatInfo(repeat: TaskRepeat): RepeatInfo {
  return REPEATS.find((r) => r.key === repeat) || REPEATS[0];
}
