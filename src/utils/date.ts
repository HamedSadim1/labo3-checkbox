import { TIMING } from "@/constants/app";

export interface DueInfo {
  text: string;
  urgent: boolean;
}

export const formatDueInfo = (dueDate: string | null): DueInfo | null => {
  if (!dueDate) return null;

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const tomorrow = new Date(now.getTime() + TIMING.MS_PER_DAY).toISOString().slice(0, 10);

  if (dueDate < today) return { text: "Overdue", urgent: true };
  if (dueDate === today) return { text: "Today", urgent: true };
  if (dueDate === tomorrow) return { text: "Tomorrow", urgent: false };

  const due = new Date(`${dueDate}T00:00:00`);
  const days = Math.ceil((due.getTime() - now.getTime()) / TIMING.MS_PER_DAY);
  if (days <= TIMING.DUE_DATE_SHORT_DAYS) return { text: `in ${days}d`, urgent: false };

  return {
    text: due.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    urgent: false,
  };
};
