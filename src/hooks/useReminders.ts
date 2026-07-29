import { useState, useEffect, useCallback, useRef } from "react";
import type { TodoItem } from "./useTodos";

const STORAGE_KEY_NOTIFIED = "labo3-notified-todos";
const CHECK_INTERVAL = 60000; // Check every minute

interface ReminderState {
  permission: NotificationPermission;
  dueToday: number;
  overdue: number;
  hasUrgent: boolean;
}

// Load set of already-notified todo IDs
const loadNotified = (): Set<number> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFIED);
    if (raw) return new Set(JSON.parse(raw));
  } catch { /* ignore */ }
  return new Set();
};

const saveNotified = (set: Set<number>) => {
  localStorage.setItem(STORAGE_KEY_NOTIFIED, JSON.stringify([...set]));
};

export const useReminders = (todos: TodoItem[]) => {
  const [permission, setPermission] = useState<NotificationPermission>(
    "Notification" in window ? Notification.permission : "denied"
  );
  const notifiedRef = useRef<Set<number>>(loadNotified());
  const intervalRef = useRef<number | null>(null);
  const prevTodosRef = useRef<TodoItem[]>(todos);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return;
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch {
      // Fallback for older browsers
      Notification.requestPermission((result) => setPermission(result));
    }
  }, []);

  // Show a browser notification
  const showNotification = useCallback(
    (title: string, body: string, tag?: string) => {
      if (!("Notification" in window) || Notification.permission !== "granted") return;
      try {
        new Notification(title, {
          body,
          tag: tag ?? "todo-reminder",
          icon: "/favicon.png",
        });
      } catch {
        // Silently fail
      }
    },
    []
  );

  // Check for due/overdue items and show notifications
  const checkReminders = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);

    const dueTodayUnnotified: TodoItem[] = [];
    const overdueUnnotified: TodoItem[] = [];

    todos.forEach((todo) => {
      if (todo.completed || !todo.dueDate || !todo.reminderEnabled) return;
      if (notifiedRef.current.has(todo.id)) return;

      if (todo.dueDate === today) {
        dueTodayUnnotified.push(todo);
      } else if (todo.dueDate < today) {
        overdueUnnotified.push(todo);
      }
    });

    // Show notifications
    if (dueTodayUnnotified.length > 0) {
      const titles = dueTodayUnnotified.map((t) => `• ${t.text}`).join("\n");
      showNotification(
        `📅 Due today (${dueTodayUnnotified.length})`,
        titles,
        "due-today"
      );
      dueTodayUnnotified.forEach((t) => notifiedRef.current.add(t.id));
    }

    if (overdueUnnotified.length > 0) {
      const titles = overdueUnnotified.map((t) => `• ${t.text}`).join("\n");
      showNotification(
        `⚠ Overdue (${overdueUnnotified.length})`,
        titles,
        "overdue"
      );
      overdueUnnotified.forEach((t) => notifiedRef.current.add(t.id));
    }

    saveNotified(notifiedRef.current);
  }, [todos, showNotification]);

  // On mount: request permission, check reminders
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      requestPermission();
    }

    // Check on mount (with small delay so everything is loaded)
    const initialTimeout = setTimeout(() => {
      checkReminders();
    }, 1500);

    // Periodic check
    intervalRef.current = window.setInterval(checkReminders, CHECK_INTERVAL);

    return () => {
      clearTimeout(initialTimeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track previous todos to detect newly added ones
  useEffect(() => {
    prevTodosRef.current = todos;
  }, [todos]);

  // Count due/overdue items
  const today = new Date().toISOString().slice(0, 10);
  const dueToday = todos.filter(
    (t) => !t.completed && t.dueDate === today && t.reminderEnabled
  ).length;
  const overdue = todos.filter(
    (t) =>
      !t.completed &&
      t.dueDate !== null &&
      t.dueDate < today &&
      t.reminderEnabled
  ).length;

  const reminderState: ReminderState = {
    permission,
    dueToday,
    overdue,
    hasUrgent: dueToday > 0 || overdue > 0,
  };

  // Mark a specific todo as notified (so it doesn't re-notify)
  const markNotified = useCallback((todoId: number) => {
    notifiedRef.current.add(todoId);
    saveNotified(notifiedRef.current);
  }, []);

  // Clear all notified history
  const clearNotifiedHistory = useCallback(() => {
    notifiedRef.current = new Set();
    saveNotified(notifiedRef.current);
  }, []);

  return {
    reminderState,
    permission,
    requestPermission,
    showNotification,
    markNotified,
    clearNotifiedHistory,
    checkReminders,
  };
};
