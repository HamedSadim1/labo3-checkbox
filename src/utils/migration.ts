import { LIST_COLORS } from "@/constants/colors";
import type { Priority, TodoItem, TodoListMeta, TodoData } from "@/hooks/useTodos";

/**
 * Read a raw unknown value and return a typed Record or fallback.
 */
const asRecord = (val: unknown): Record<string, unknown> =>
  typeof val === "object" && val !== null
    ? (val as Record<string, unknown>)
    : ({} as Record<string, unknown>);

/**
 * Run-time check for valid priority values.
 */
const VALID_PRIORITIES: readonly string[] = ["low", "medium", "high"];

/**
 * Migrate data loaded from localStorage to the latest `TodoData` format.
 * Gracefully fills in missing fields so old saved data doesn't crash the app.
 */
export const migrateData = (raw: unknown): TodoData => {
  const rawData = asRecord(raw);
  const rawLists = Array.isArray(rawData.lists) ? rawData.lists : [];
  const rawTodos = Array.isArray(rawData.todos) ? rawData.todos : [];

  const lists: TodoListMeta[] = rawLists.map((l: unknown) => {
    const list = asRecord(l);
    return {
      id: String(list.id),
      name: String(list.name),
      color: typeof list.color === "string" ? list.color : LIST_COLORS[0],
      createdAt: typeof list.createdAt === "number" ? list.createdAt : Date.now(),
    };
  });

  const todos: TodoItem[] = rawTodos.map((t: unknown, i: number) => {
    const todo = asRecord(t);
    return {
      id: typeof todo.id === "number" ? todo.id : Date.now() + i,
      listId: lists.some((l) => l.id === todo.listId)
        ? String(todo.listId)
        : lists[0]?.id ?? "default",
      text: typeof todo.text === "string" ? todo.text : "",
      completed: typeof todo.completed === "boolean" ? todo.completed : false,
      priority:
        typeof todo.priority === "string" && VALID_PRIORITIES.includes(todo.priority)
          ? (todo.priority as Priority)
          : "medium",
      dueDate: typeof todo.dueDate === "string" ? todo.dueDate : null,
      reminderEnabled: typeof todo.reminderEnabled === "boolean" ? todo.reminderEnabled : false,
      createdAt: typeof todo.createdAt === "number" ? todo.createdAt : Date.now(),
      order: typeof todo.order === "number" ? todo.order : i,
    };
  });

  return {
    lists,
    todos,
    activeListId:
      typeof rawData.activeListId === "string" &&
      lists.some((l) => l.id === rawData.activeListId)
        ? rawData.activeListId
        : lists[0]?.id ?? "default",
  };
};
