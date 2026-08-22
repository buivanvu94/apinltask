const { appTimezone } = require('../config/env-config');

function getZonedParts(date, timeZone) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = dtf.formatToParts(date).reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

function getTimezoneOffsetMs(date, timeZone) {
  const { year, month, day, hour, minute, second } = getZonedParts(date, timeZone);
  const asUtc = Date.UTC(year, month - 1, day, hour, minute, second);
  return asUtc - date.getTime();
}

function zonedDateToUtc(year, month, day, hour, minute, second, timeZone) {
  const guess = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  const offsetMs = getTimezoneOffsetMs(guess, timeZone);
  return new Date(guess.getTime() - offsetMs);
}

function startOfDay(date, timeZone = appTimezone) {
  const { year, month, day } = getZonedParts(date, timeZone);
  return zonedDateToUtc(year, month, day, 0, 0, 0, timeZone);
}

function addZonedDays(date, days, timeZone = appTimezone) {
  const { year, month, day, hour, minute, second } = getZonedParts(date, timeZone);
  // Step the plain calendar date at noon (DST-transition-safe), then re-derive
  // the UTC instant for that new date at the original time-of-day.
  const stepped = new Date(Date.UTC(year, month - 1, day + days, 12));
  return zonedDateToUtc(stepped.getUTCFullYear(), stepped.getUTCMonth() + 1, stepped.getUTCDate(), hour, minute, second, timeZone);
}

function getTodayRange(now = new Date(), timeZone = appTimezone) {
  const start = startOfDay(now, timeZone);
  const nextStart = addZonedDays(start, 1, timeZone);
  return { start, end: new Date(nextStart.getTime() - 1) };
}

function getWeekdayIndex(date, timeZone = appTimezone) {
  const { year, month, day } = getZonedParts(date, timeZone);
  const utcDay = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return (utcDay + 6) % 7;
}

function getWeekRange(now = new Date(), timeZone = appTimezone) {
  const weekdayIndex = getWeekdayIndex(now, timeZone);
  const todayStart = startOfDay(now, timeZone);
  const start = addZonedDays(todayStart, -weekdayIndex, timeZone);
  const end = addZonedDays(start, 7, timeZone);
  return { start, end };
}

function formatDateKey(date, timeZone = appTimezone) {
  const { year, month, day } = getZonedParts(date, timeZone);
  const pad = (n) => String(n).padStart(2, '0');
  return `${year}-${pad(month)}-${pad(day)}`;
}

module.exports = { getTodayRange, getWeekRange, getWeekdayIndex, formatDateKey, addZonedDays };
