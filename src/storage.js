const KEY = 'po-maker-v5-store';

export function loadStore() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveStore(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}
