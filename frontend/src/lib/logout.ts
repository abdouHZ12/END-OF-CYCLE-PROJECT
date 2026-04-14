import { apiPost } from "@/lib/api";

const AUTH_STORAGE_PREFIX = "naftal.";
const AUTH_STORAGE_KEYS = [
  "naftal.accessToken",
  "naftal.refreshToken",
  "naftal.employee",
] as const;

function clearAuthStorage() {
  if (typeof window === "undefined") return;

  for (const key of AUTH_STORAGE_KEYS) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }

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

export async function logout(): Promise<void> {
  if (typeof window === "undefined") return;

  const refreshToken = window.localStorage.getItem("naftal.refreshToken");

  if (refreshToken) {
    try {
      await apiPost<{ message: string }>("/api/auth/signout", { refreshToken });
    } catch {
      // ignore: token may already be invalid/expired or API unreachable
    }
  }

  clearAuthStorage();
}
