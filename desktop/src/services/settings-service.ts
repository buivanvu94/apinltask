import { apiClient } from './api-client';
import { UpdateSettingsInput, UserSettings } from '../types/settings';

export async function getSettings(): Promise<UserSettings> {
  const response = await apiClient.get<UserSettings>('/settings');
  return response.data;
}

export async function updateSettings(input: UpdateSettingsInput): Promise<UserSettings> {
  const response = await apiClient.patch<UserSettings>('/settings', input);
  return response.data;
}
