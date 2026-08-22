import { useState, useEffect, useCallback } from 'react';
import { RemindBeforeMinutes, SnoozeMinutes, UserSettings } from '../types/settings';
import { getSettings, updateSettings } from '../services/settings-service';

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>({
    push: true,
    sound: true,
    vibrate: true,
    remindBefore: 15,
    snooze: 10,
    quietStart: '22:00',
    quietEnd: '07:00',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getSettings();
        setSettings(data);
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const toggleSetting = useCallback(async (key: 'push' | 'sound' | 'vibrate') => {
    setSettings((prev) => {
      const nextVal = !prev[key];
      updateSettings({ [key]: nextVal }).catch((err) => {
        console.error(`Failed to update setting ${key}:`, err);
        setSettings((r) => ({ ...r, [key]: !nextVal }));
      });
      return { ...prev, [key]: nextVal };
    });
  }, []);

  const setRemindBefore = useCallback(async (val: RemindBeforeMinutes) => {
    setSettings((prev) => ({ ...prev, remindBefore: val }));
    try {
      await updateSettings({ remindBefore: val });
    } catch (err) {
      console.error('Failed to update remindBefore:', err);
    }
  }, []);

  const setSnooze = useCallback(async (val: SnoozeMinutes) => {
    setSettings((prev) => ({ ...prev, snooze: val }));
    try {
      await updateSettings({ snooze: val });
    } catch (err) {
      console.error('Failed to update snooze:', err);
    }
  }, []);

  const setQuietHours = useCallback(async (quietStart: string, quietEnd: string) => {
    setSettings((prev) => ({ ...prev, quietStart, quietEnd }));
    try {
      await updateSettings({ quietStart, quietEnd });
    } catch (err) {
      console.error('Failed to update quiet hours:', err);
    }
  }, []);

  return {
    settings,
    isLoading,
    toggleSetting,
    setRemindBefore,
    setSnooze,
    setQuietHours,
  };
}
