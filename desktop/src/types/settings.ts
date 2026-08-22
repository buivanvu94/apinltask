export type RemindBeforeMinutes = 0 | 5 | 15 | 30;
export type SnoozeMinutes = 5 | 10 | 15 | 20;

export interface UserSettings {
  id?: string;
  userId?: string;
  push: boolean;
  sound: boolean;
  vibrate: boolean;
  remindBefore: RemindBeforeMinutes;
  snooze: SnoozeMinutes;
  quietStart: string; // "HH:mm"
  quietEnd: string;   // "HH:mm"
}

export interface UpdateSettingsInput {
  push?: boolean;
  sound?: boolean;
  vibrate?: boolean;
  remindBefore?: RemindBeforeMinutes;
  snooze?: SnoozeMinutes;
  quietStart?: string;
  quietEnd?: string;
}
