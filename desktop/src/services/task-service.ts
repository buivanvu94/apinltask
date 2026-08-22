import { apiClient } from './api-client';
import { Task, TaskInput, TaskSummary, UpdateTaskInput } from '../types/task';

export interface TaskQueryParams {
  scope?: 'overdue' | 'today' | 'upcoming' | 'all';
  category?: string;
}

export async function getTasks(params?: TaskQueryParams): Promise<Task[]> {
  const response = await apiClient.get<Task[]>('/tasks', { params });
  return response.data;
}

export async function getTaskSummary(): Promise<TaskSummary> {
  const response = await apiClient.get<TaskSummary>('/tasks/summary');
  return response.data;
}

export async function getTaskById(id: string): Promise<Task> {
  const response = await apiClient.get<Task>(`/tasks/${id}`);
  return response.data;
}

export async function createTask(input: TaskInput): Promise<Task> {
  const response = await apiClient.post<Task>('/tasks', input);
  return response.data;
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  const response = await apiClient.patch<Task>(`/tasks/${id}`, input);
  return response.data;
}

export async function toggleTask(id: string): Promise<Task> {
  const response = await apiClient.patch<Task>(`/tasks/${id}/toggle`);
  return response.data;
}

export async function deleteTask(id: string): Promise<void> {
  await apiClient.delete(`/tasks/${id}`);
}
