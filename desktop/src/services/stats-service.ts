import { apiClient } from './api-client';
import { WeekStats } from '../types/stats';

export async function getWeekStats(): Promise<WeekStats> {
  const response = await apiClient.get<WeekStats>('/stats/week');
  return response.data;
}
