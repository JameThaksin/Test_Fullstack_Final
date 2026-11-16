// localStorage persistence. Every access is guarded: private windows or blocked
// storage must never break the exam, they only lose the saved progress.

const KEY = 'fullstack-exam-quest:v2';

export function loadState() {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveState(state) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function clearState() {
  try { window.localStorage.removeItem(KEY); } catch { /* ignore */ }
}
