import { TaskCategory } from '../types/task';

export interface CategoryInfo {
  key: TaskCategory;
  label: string;
  color: string;
  tint: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { key: 'work', label: 'Công việc', color: '#2563EB', tint: '#EFF4FF' },
  { key: 'personal', label: 'Cá nhân', color: '#7C3AED', tint: '#F5F0FF' },
  { key: 'study', label: 'Học tập', color: '#0D9488', tint: '#ECFDF9' },
  { key: 'health', label: 'Sức khỏe', color: '#E11D48', tint: '#FFF1F3' },
  { key: 'other', label: 'Khác', color: '#64748B', tint: '#F1F5F9' },
];

export function getCategoryInfo(category: TaskCategory): CategoryInfo {
  return CATEGORIES.find((c) => c.key === category) || CATEGORIES[4];
}
