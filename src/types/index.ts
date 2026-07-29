/* ── Shared Types ── */

export type Priority = "low" | "medium" | "high";

export interface TodoItem {
  id: number;
  listId: string;
  text: string;
  completed: boolean;
  priority: Priority;
  dueDate: string | null; // ISO "YYYY-MM-DD"
  reminderEnabled: boolean; // whether to show browser notification
  createdAt: number;
  order: number;
}

export interface TodoListMeta {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export interface TodoData {
  lists: TodoListMeta[];
  todos: TodoItem[];
  activeListId: string;
}

export interface Stats {
  totalTodos: number;
  completedTodos: number;
  activeTodos: number;
  overdueTodos: number;
  dueTodayTodos: number;
  completionRate: number;
  highPriorityActive: number;
  streakDays: number;
}
