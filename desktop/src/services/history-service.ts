import { apiClient } from './api-client';
import { HistoryResponse } from '../types/task';

export async function getHistory(search?: string): Promise<HistoryResponse> {
  const response = await apiClient.get<HistoryResponse>('/history', {
    params: search ? { search } : undefined,
  });
  return response.data;
}
