export type StoredEmployee = {
  id: number;
  name: string;
  username: string;
  roles: string[];
};

const AUTH_STORAGE_PREFIX = 'naftal.';

export const AUTH_STORAGE_KEYS = {
  accessToken: 'naftal.accessToken',
  refreshToken: 'naftal.refreshToken',
  employee: 'naftal.employee',
} as const;

function safeJsonParse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function normalizeStoredEmployee(raw: unknown): StoredEmployee | null {
  if (!raw || typeof raw !== 'object') return null;

  const obj = raw as Record<string, unknown>;

  const id = typeof obj.id === 'number' ? obj.id : Number.parseInt(String(obj.id), 10);
  if (!Number.isFinite(id)) return null;

  const roles = Array.isArray(obj.roles)
    ? (obj.roles as string[])
    : typeof obj.role === 'string' && obj.role.length
      ? [obj.role]
      : [];

  return {
    id,
    name: String(obj.name ?? ''),
    username: String(obj.username ?? ''),
    roles,
  };
}

export function getStoredEmployee(): StoredEmployee | null {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEYS.employee);
  if (!raw) return null;

  return normalizeStoredEmployee(safeJsonParse(raw));
}

export function getStoredEmployeeId(): number | null {
  return getStoredEmployee()?.id ?? null;
}

export function getStoredPrimaryRole(): string | null {
  return getStoredEmployee()?.roles?.[0] ?? null;
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(AUTH_STORAGE_KEYS.accessToken);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken);
}

export function setAuthSession(input: {
  accessToken: string;
  refreshToken: string;
  employee: unknown;
}): void {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(AUTH_STORAGE_KEYS.accessToken, input.accessToken);
  window.localStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, input.refreshToken);
  window.localStorage.setItem(AUTH_STORAGE_KEYS.employee, JSON.stringify(input.employee));
}

export function clearAuthStorage(): void {
  if (typeof window === 'undefined') return;

  const directKeys = Object.values(AUTH_STORAGE_KEYS);
  for (const key of directKeys) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }

  // Also clear any other naftal.* keys (defensive cleanup)
  try {
    for (let i = window.localStorage.length - 1; i >= 0; i -= 1) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(AUTH_STORAGE_PREFIX)) {
        window.localStorage.removeItem(key);
      }
    }
  } catch {
    // ignore
  }
}
