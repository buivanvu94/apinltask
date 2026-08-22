const MAPS = {
  category: {
    work: 'WORK',
    personal: 'PERSONAL',
    study: 'STUDY',
    health: 'HEALTH',
    other: 'OTHER',
  },
  priority: {
    low: 'LOW',
    medium: 'MEDIUM',
    high: 'HIGH',
  },
  repeat: {
    none: 'NONE',
    daily: 'DAILY',
    weekly: 'WEEKLY',
  },
};

const REVERSE_MAPS = Object.fromEntries(
  Object.entries(MAPS).map(([kind, map]) => [
    kind,
    Object.fromEntries(Object.entries(map).map(([key, value]) => [value, key])),
  ])
);

function toDbEnum(kind, value) {
  const mapped = MAPS[kind]?.[value];
  if (!mapped) {
    throw new Error(`Invalid ${kind} value: ${value}`);
  }
  return mapped;
}

function fromDbEnum(kind, value) {
  const mapped = REVERSE_MAPS[kind]?.[value];
  if (!mapped) {
    throw new Error(`Invalid ${kind} db value: ${value}`);
  }
  return mapped;
}

module.exports = { toDbEnum, fromDbEnum };
