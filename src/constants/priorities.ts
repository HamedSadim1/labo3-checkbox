import type { Priority } from "@/hooks/useTodos";

export const priorityConfig: Record<
  Priority,
  { color: string; bg: string; label: string }
> = {
  low: { color: "#22c55e", bg: "rgba(34, 197, 94, 0.12)", label: "Low" },
  medium: { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.12)", label: "Med" },
  high: { color: "#ef4444", bg: "rgba(239, 68, 68, 0.12)", label: "High" },
};
