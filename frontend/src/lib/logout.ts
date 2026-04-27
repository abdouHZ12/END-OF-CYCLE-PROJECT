import { apiPost } from "@/lib/api";
import { clearAuthStorage, getRefreshToken } from "@/lib/authStorage";

export async function logout(): Promise<void> {
  if (typeof window === "undefined") return;

  const refreshToken = getRefreshToken();

  if (refreshToken) {
    try {
      await apiPost<{ message: string }>("/api/auth/signout", { refreshToken });
    } catch {
      // ignore: token may already be invalid/expired or API unreachable
    }
  }

  clearAuthStorage();
}
