export type TaskCategory = 'work' | 'personal' | 'study' | 'health' | 'other';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskRepeat = 'none' | 'daily' | 'weekly';

export interface Task {
  id: string;
  userId?: string;
  title: string;
  desc?: string | null;
  category: TaskCategory;
  priority: TaskPriority;
  repeat: TaskRepeat;
  location?: string | null;
  dueAt: string; // ISO string from backend
  completed: boolean;
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskSummary {
  todayTotalCount: number;
  todayCompletedCount: number;
  overdueCount: number;
  upcomingCount: number;
}

export interface TaskHistoryItem {
  id: string;
  title: string;
  category: TaskCategory;
  completedAt: string;
  dateKey: string;
}

export interface HistoryResponse {
  totalCount: number;
  items: TaskHistoryItem[];
}

export interface TaskInput {
  title: string;
  desc?: string;
  category: TaskCategory;
  priority: TaskPriority;
  repeat: TaskRepeat;
  location?: string;
  dueAt: string; // ISO string
}

export interface UpdateTaskInput {
  title?: string;
  desc?: string;
  category?: TaskCategory;
  priority?: TaskPriority;
  repeat?: TaskRepeat;
  location?: string;
  dueAt?: string;
}
