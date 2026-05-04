"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { apiGet, apiPatch } from "@/lib/api";
import { getStoredEmployeeId } from "@/lib/authStorage"; // ← add this

export type Notification = {
  id: number;
  type: "NEW_PENDING_DOCUMENT" | "DOCUMENT_APPROVED" | "DOCUMENT_REJECTED" | "DOCUMENT_EXPIRING";
  message: string;
  read: boolean;
  metadata?: { documentId?: number; docType?: string };
  createdAt: string;
};

export function useNotifications(pollInterval = 30_000) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchNotifications = async () => {
      const employeeId = getStoredEmployeeId(); // ← use this everywhere
      if (!employeeId) return;
      try {
        const data = await apiGet<Notification[]>(`/api/notifications/${employeeId}`);
        if (cancelled) return;
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.read).length);
      } catch {
        // silently fail
      }
    };

    fetchNotifications();
    intervalRef.current = setInterval(fetchNotifications, pollInterval);

    return () => {
      cancelled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pollInterval]);

  const markOneAsRead = useCallback(async (notificationId: number) => {
    const employeeId = getStoredEmployeeId(); // ← use this everywhere
    if (!employeeId) return;
    try {
      await apiPatch(`/api/notifications/${employeeId}/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  }, []);

  const markAllAsRead = useCallback(async () => {
    const employeeId = getStoredEmployeeId(); // ← use this everywhere
    if (!employeeId) return;
    try {
      await apiPatch(`/api/notifications/${employeeId}/read-all`);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  }, []);

  return { notifications, unreadCount, markOneAsRead, markAllAsRead };
}