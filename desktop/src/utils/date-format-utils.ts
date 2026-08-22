export const WEEKDAY_FULL = [
  'Chủ Nhật',
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
];

export function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function parseDate(d: string | Date): Date {
  return typeof d === 'string' ? new Date(d) : d;
}

export function fmtTime(d: string | Date): string {
  const date = parseDate(d);
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

export function fmtDateShort(d: string | Date): string {
  const date = parseDate(d);
  return `${date.getDate()} Th${date.getMonth() + 1}`;
}

export function fmtDateFull(d: string | Date): string {
  const date = parseDate(d);
  return `${WEEKDAY_FULL[date.getDay()]}, ${date.getDate()} Tháng ${date.getMonth() + 1}`;
}

export function humanize(ms: number): string {
  const abs = Math.abs(ms);
  const days = Math.floor(abs / 86400000);
  const hours = Math.floor((abs % 86400000) / 3600000);
  const mins = Math.floor((abs % 3600000) / 60000);

  if (days >= 1) {
    return `${days} ngày${hours > 0 ? ` ${hours} giờ` : ''}`;
  }
  if (hours >= 1) {
    return `${hours} giờ${mins > 0 ? ` ${mins} phút` : ''}`;
  }
  return `${mins} phút`;
}
