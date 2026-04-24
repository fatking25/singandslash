import { LOCAL_STORAGE_KEY } from './constants.js';

const TOUCH_HAND_STORAGE_KEY = 'gyulablo-touch-hand';

function normalizeRecord(record) {
  if (!record || typeof record !== 'object') {
    return null;
  }

  const wave = Number(record.wave);
  const kills = Number(record.kills);
  const survivedMs = Number(record.survivedMs);

  if (
    Number.isNaN(wave) ||
    Number.isNaN(kills) ||
    Number.isNaN(survivedMs)
  ) {
    return null;
  }

  return {
    wave: Math.max(1, Math.floor(wave)),
    kills: Math.max(0, Math.floor(kills)),
    survivedMs: Math.max(0, Math.floor(survivedMs)),
  };
}

function normalizeTouchHand(value) {
  return value === 'right' ? 'right' : 'left';
}

export function loadBestRecord() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    return normalizeRecord(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveBestRecord(record) {
  if (typeof window === 'undefined') {
    return;
  }

  const normalized = normalizeRecord(record);

  if (!normalized) {
    return;
  }

  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(normalized));
}

export function loadTouchHandPreference() {
  if (typeof window === 'undefined') {
    return 'left';
  }

  try {
    return normalizeTouchHand(window.localStorage.getItem(TOUCH_HAND_STORAGE_KEY));
  } catch {
    return 'left';
  }
}

export function saveTouchHandPreference(value) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    TOUCH_HAND_STORAGE_KEY,
    normalizeTouchHand(value),
  );
}

export function isBetterRecord(nextRecord, currentRecord) {
  const next = normalizeRecord(nextRecord);
  const current = normalizeRecord(currentRecord);

  if (!next) {
    return false;
  }

  if (!current) {
    return true;
  }

  if (next.wave !== current.wave) {
    return next.wave > current.wave;
  }

  if (next.kills !== current.kills) {
    return next.kills > current.kills;
  }

  return next.survivedMs > current.survivedMs;
}
