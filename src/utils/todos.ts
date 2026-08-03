import type { TodoItem } from "@/types";

/** Count total todos in the given list. */
export const getListCount = (todos: TodoItem[], listId: string): number =>
  todos.filter((t) => t.listId === listId).length;

/** Count active (incomplete) todos in the given list. */
export const getListActiveCount = (todos: TodoItem[], listId: string): number =>
  todos.filter((t) => t.listId === listId && !t.completed).length;
