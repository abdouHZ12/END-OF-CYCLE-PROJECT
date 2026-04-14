"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { logout as logoutService } from "@/lib/logout";

export function useLogout() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const logout = React.useCallback(async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logoutService();
    } finally {
      // Always send user to login screen.
      router.replace("/auth");
      router.refresh();
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, router]);

  return { logout, isLoggingOut };
}
