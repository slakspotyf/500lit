export const LOCK_USERNAME = "hassad";
export const LOCK_PASSWORD = "5420";
export const LOCK_USERNAME_DEFAULT = LOCK_USERNAME;
export const SESSION_KEY = "feuille-consommation-session-v1";

export type LockConfig = {
  username: string;
  passwordHash: string;
};

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase();
}

export function verifyLogin(username: string, password: string): boolean {
  return normalizeUsername(username) === LOCK_USERNAME && password === LOCK_PASSWORD;
}

export function hasSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1" || localStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function openSession(remember: boolean) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_KEY, "1");
  if (remember) localStorage.setItem(SESSION_KEY, "1");
  else localStorage.removeItem(SESSION_KEY);
}

export function closeSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);
}
