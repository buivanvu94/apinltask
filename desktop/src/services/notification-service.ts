import {
  isPermissionGranted,
  requestPermission,
  sendNotification as tauriSendNotification,
} from '@tauri-apps/plugin-notification';
import { UserSettings } from '../types/settings';
import { fmtTime, parseDate } from '../utils/date-format-utils';

function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export function playNotificationSound(): void {
  try {
    const AudioCtx = window.AudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880.0, ctx.currentTime + 0.1); // A5

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (err) {
    console.warn('Could not play notification chime:', err);
  }
}

export function isQuietHour(now: Date, startStr: string, endStr: string): boolean {
  const [startH, startM] = startStr.split(':').map(Number);
  const [endH, endM] = endStr.split(':').map(Number);

  const curMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (startMinutes <= endMinutes) {
    return curMinutes >= startMinutes && curMinutes < endMinutes;
  }
  // Spans midnight (e.g. 22:00 -> 07:00)
  return curMinutes >= startMinutes || curMinutes < endMinutes;
}

export async function sendDesktopNotification(
  title: string,
  body: string,
  settings: UserSettings
): Promise<void> {
  const now = new Date();

  // Check Quiet Hours
  if (isQuietHour(now, settings.quietStart, settings.quietEnd)) {
    return;
  }

  // Play Sound if enabled
  if (settings.sound) {
    playNotificationSound();
  }

  // Send Native Notification if push enabled
  if (settings.push && isTauri()) {
    try {
      let granted = await isPermissionGranted();
      if (!granted) {
        const permission = await requestPermission();
        granted = permission === 'granted';
      }

      if (granted) {
        tauriSendNotification({
          title,
          body,
        });
      }
    } catch (err) {
      console.warn('Native notification failed:', err);
    }
  }
}

export async function notifyTaskDue(taskTitle: string, dueAt: string | Date, settings: UserSettings): Promise<void> {
  const timeLabel = fmtTime(parseDate(dueAt));
  await sendDesktopNotification(
    'NLTASK - Nhắc nhở công việc',
    `${taskTitle} (Đến giờ: ${timeLabel})`,
    settings
  );
}
