import {
  isPermissionGranted,
  requestPermission,
  sendNotification as tauriSendNotification,
} from '@tauri-apps/plugin-notification';
import { UserSettings } from '../types/settings';
import { fmtTime, parseDate } from '../utils/date-format-utils';


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
  if (settings.push) {
    let sent = false;
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
        sent = true;
      }
    } catch (err) {
      console.warn('Tauri native notification attempt failed:', err);
    }

    if (!sent && typeof window !== 'undefined' && 'Notification' in window) {
      try {
        if (Notification.permission === 'granted') {
          new Notification(title, { body });
        } else if (Notification.permission !== 'denied') {
          const perm = await Notification.requestPermission();
          if (perm === 'granted') {
            new Notification(title, { body });
          }
        }
      } catch (err) {
        console.warn('Web notification fallback failed:', err);
      }
    }
  }
}

export async function notifyTaskDue(
  taskTitle: string,
  dueAt: string | Date,
  settings: UserSettings,
  type: 'due' | 'pre' = 'due',
  remindMinutes?: number
): Promise<void> {
  const timeLabel = fmtTime(parseDate(dueAt));
  const title =
    type === 'pre'
      ? `NLTASK - Sắp đến hạn (${remindMinutes || 15} phút nữa)`
      : 'NLTASK - Đến giờ làm việc!';
  const body =
    type === 'pre'
      ? `${taskTitle} (Hạn: ${timeLabel})`
      : `${taskTitle} (Đến giờ: ${timeLabel})`;

  await sendDesktopNotification(title, body, settings);
}
