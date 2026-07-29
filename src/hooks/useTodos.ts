import { useState, useEffect, useCallback, useRef, useMemo } from "react";

/* ── Types ── */

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

/* ──── Constants ──── */

const STORAGE_KEY = "labo3-todos-v2";
const LIST_COLORS = [
  "#6366f1", // indigo
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#3b82f6", // blue
  "#10b981", // emerald
  "#ef4444", // red
];

const defaultData: TodoData = {
  lists: [
    { id: "default", name: "My List", color: LIST_COLORS[0], createdAt: Date.now() - 86400000 },
    { id: "work", name: "Work", color: LIST_COLORS[7], createdAt: Date.now() },
  ],
  todos: [
    { id: 1, listId: "default", text: "Learn React", completed: true, priority: "high", dueDate: "2026-07-30", reminderEnabled: false, createdAt: Date.now() - 86400000 * 3, order: 0 },
    { id: 2, listId: "default", text: "Build a Todo App", completed: true, priority: "medium", dueDate: null, reminderEnabled: false, createdAt: Date.now() - 86400000 * 2, order: 1 },
    { id: 3, listId: "default", text: "Master Tailwind CSS", completed: false, priority: "medium", dueDate: "2026-08-05", reminderEnabled: true, createdAt: Date.now() - 86400000, order: 2 },
    { id: 4, listId: "default", text: "Deploy to production", completed: false, priority: "high", dueDate: "2026-07-28", reminderEnabled: true, createdAt: Date.now(), order: 3 },
    { id: 5, listId: "work", text: "Review pull requests", completed: false, priority: "low", dueDate: null, reminderEnabled: false, createdAt: Date.now() - 3600000, order: 0 },
    { id: 6, listId: "work", text: "Write documentation", completed: false, priority: "medium", dueDate: "2026-08-01", reminderEnabled: false, createdAt: Date.now() - 7200000, order: 1 },
  ],
  activeListId: "default",
};

/* ──── Hook ──── */

// Migrate old data to latest format – fills in missing fields
const migrateData = (raw: any): TodoData => {
  const lists: TodoListMeta[] = (raw.lists ?? []).map((l: any) => ({
    id: l.id,
    name: l.name,
    color: l.color ?? LIST_COLORS[0],
    createdAt: l.createdAt ?? Date.now(),
  }));
  const todos: TodoItem[] = (raw.todos ?? []).map((t: any, i: number) => ({
    id: t.id ?? Date.now() + i,
    listId: lists.some((l) => l.id === t.listId) ? t.listId : lists[0]?.id ?? "default",
    text: t.text ?? "",
    completed: t.completed ?? false,
    priority: ["low", "medium", "high"].includes(t.priority) ? t.priority : "medium",
    dueDate: t.dueDate ?? null,
    reminderEnabled: t.reminderEnabled ?? false,
    createdAt: t.createdAt ?? Date.now(),
    order: t.order ?? i,
  }));
  return {
    lists,
    todos,
    activeListId: lists.some((l) => l.id === raw.activeListId)
      ? raw.activeListId
      : lists[0]?.id ?? "default",
  };
};

export const useTodos = () => {
  const [data, setData] = useState<TodoData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const migrated = migrateData(parsed);
        if (migrated.lists.length > 0) return migrated;
      }
    } catch {
      // ignore
    }
    return defaultData;
  });

  const [importSuccess, setImportSuccess] = useState(false);
  const importSuccessTimeoutRef = useRef<number | null>(null);

  const [undoItem, setUndoItem] = useState<{ todo: TodoItem; listId: string } | null>(null);
  const undoTimeoutRef = useRef<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // ── Persist ──
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // ── Refs ──
  const dataRef = useRef(data);
  useEffect(() => { dataRef.current = data; }, [data]);

  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
      if (importSuccessTimeoutRef.current) clearTimeout(importSuccessTimeoutRef.current);
    };
  }, []);

  // ── Derived active list ──
  const activeList = data.lists.find((l) => l.id === data.activeListId) ?? data.lists[0];

  // ── Active todos (in the current list), sorted by order ──
  const activeTodos = useMemo(
    () =>
      data.todos
        .filter((t) => t.listId === data.activeListId)
        .sort((a, b) => a.order - b.order),
    [data.todos, data.activeListId]
  );

  // ── Filtered & searched todos ──
  const filterFn = useCallback(
    (todos: TodoItem[], filter: "all" | "active" | "completed") => {
      let result = todos;
      if (filter === "active") result = result.filter((t) => !t.completed);
      if (filter === "completed") result = result.filter((t) => t.completed);
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        result = result.filter((t) => t.text.toLowerCase().includes(q));
      }
      return result;
    },
    [searchQuery]
  );

  // ── Statistics ──
  const stats = useMemo((): Stats => {
    const allTodos = data.todos;
    const total = allTodos.length;
    const completed = allTodos.filter((t) => t.completed).length;
    const active = total - completed;
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const overdue = allTodos.filter((t) => !t.completed && t.dueDate && t.dueDate < today).length;
    const dueToday = allTodos.filter((t) => !t.completed && t.dueDate === today).length;
    const highPriorityActive = allTodos.filter((t) => !t.completed && t.priority === "high").length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Simple streak
    let streak = 0;
    const check = new Date();
    while (true) {
      const dayHasCompletion = allTodos.some((t) =>
        t.completed && Math.abs(t.createdAt - check.getTime()) < 86400000
      );
      if (dayHasCompletion) { streak++; check.setDate(check.getDate() - 1); }
      else break;
    }

    return { totalTodos: total, completedTodos: completed, activeTodos: active, overdueTodos: overdue, dueTodayTodos: dueToday, completionRate, highPriorityActive, streakDays: streak };
  }, [data.todos]);

  // ── List CRUD ──
  const addList = useCallback((name: string) => {
    const newList: TodoListMeta = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name,
      color: LIST_COLORS[dataRef.current.lists.length % LIST_COLORS.length],
      createdAt: Date.now(),
    };
    setData((prev) => ({ ...prev, lists: [...prev.lists, newList], activeListId: newList.id }));
  }, []);

  const renameList = useCallback((listId: string, name: string) => {
    setData((prev) => ({
      ...prev,
      lists: prev.lists.map((l) => (l.id === listId ? { ...l, name } : l)),
    }));
  }, []);

  const deleteList = useCallback((listId: string) => {
    setData((prev) => {
      const remaining = prev.lists.filter((l) => l.id !== listId);
      const newActive = prev.activeListId === listId ? (remaining[0]?.id ?? "default") : prev.activeListId;
      return {
        lists: remaining,
        todos: prev.todos.filter((t) => t.listId !== listId),
        activeListId: newActive,
      };
    });
  }, []);

  const setActiveList = useCallback((listId: string) => {
    setData((prev) => ({ ...prev, activeListId: listId }));
    setSearchQuery("");
  }, []);

  const reorderLists = useCallback((orderedIds: string[]) => {
    setData((prev) => {
      const listMap = new Map(prev.lists.map((l) => [l.id, l]));
      return { ...prev, lists: orderedIds.map((id) => listMap.get(id)!).filter(Boolean) };
    });
  }, []);

  // ── Todo CRUD ──
  const addTodo = useCallback((text: string, priority: Priority = "medium", dueDate: string | null = null, listId?: string) => {
    const targetListId = listId ?? dataRef.current.activeListId;
    const targetTodos = dataRef.current.todos.filter((t) => t.listId === targetListId);
    const maxOrder = targetTodos.length > 0 ? Math.max(...targetTodos.map((t) => t.order)) : -1;
    const newTodo: TodoItem = {
      id: Date.now(),
      listId: targetListId,
      text,
      completed: false,
      priority,
      dueDate,
      reminderEnabled: false,
      createdAt: Date.now(),
      order: maxOrder + 1,
    };
    setData((prev) => ({ ...prev, todos: [...prev.todos, newTodo] }));
  }, []);

  const toggleTodo = useCallback((id: number) => {
    setData((prev) => ({
      ...prev,
      todos: prev.todos.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    }));
  }, []);

  const deleteTodo = useCallback((id: number) => {
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    const todoToDelete = dataRef.current.todos.find((t) => t.id === id);
    if (!todoToDelete) return;
    setData((prev) => ({ ...prev, todos: prev.todos.filter((t) => t.id !== id) }));
    setUndoItem({ todo: todoToDelete, listId: todoToDelete.listId });
    undoTimeoutRef.current = window.setTimeout(() => {
      setUndoItem(null);
      undoTimeoutRef.current = null;
    }, 4000);
  }, []);

  const undoDelete = useCallback(() => {
    if (undoItem) {
      setData((prev) => {
        if (prev.todos.some((t) => t.id === undoItem.todo.id)) return prev;
        return { ...prev, todos: [...prev.todos, undoItem.todo] };
      });
      setUndoItem(null);
      if (undoTimeoutRef.current) { clearTimeout(undoTimeoutRef.current); undoTimeoutRef.current = null; }
    }
  }, [undoItem]);

  const editTodo = useCallback((id: number, newText: string) => {
    setData((prev) => ({
      ...prev,
      todos: prev.todos.map((t) => (t.id === id ? { ...t, text: newText } : t)),
    }));
  }, []);

  const updateTodoPriority = useCallback((id: number, priority: Priority) => {
    setData((prev) => ({
      ...prev,
      todos: prev.todos.map((t) => (t.id === id ? { ...t, priority } : t)),
    }));
  }, []);

  const updateTodoDueDate = useCallback((id: number, dueDate: string | null) => {
    setData((prev) => ({
      ...prev,
      todos: prev.todos.map((t) => (t.id === id ? { ...t, dueDate } : t)),
    }));
  }, []);

  const moveTodo = useCallback((todoId: number, targetListId: string) => {
    setData((prev) => {
      const targetTodos = prev.todos.filter((t) => t.listId === targetListId);
      const maxOrder = targetTodos.length > 0 ? Math.max(...targetTodos.map((t) => t.order)) : -1;
      return {
        ...prev,
        todos: prev.todos.map((t) =>
          t.id === todoId ? { ...t, listId: targetListId, order: maxOrder + 1 } : t
        ),
      };
    });
  }, []);

  const reorderTodos = useCallback((listId: string, orderedIds: number[]) => {
    setData((prev) => {
      const listTodos = prev.todos.filter((t) => t.listId === listId);
      const otherTodos = prev.todos.filter((t) => t.listId !== listId);
      const todoMap = new Map(listTodos.map((t) => [t.id, t]));
      const reordered = orderedIds
        .map((id, i) => {
          const todo = todoMap.get(id);
          return todo ? { ...todo, order: i } : null;
        })
        .filter((t): t is TodoItem => t !== null);
      return { ...prev, todos: [...otherTodos, ...reordered] };
    });
  }, []);

  const clearCompleted = useCallback(() => {
    setData((prev) => ({
      ...prev,
      todos: prev.todos.filter((t) => t.listId !== prev.activeListId || !t.completed),
    }));
  }, []);

  // Duplicate a todo
  const duplicateTodo = useCallback((id: number) => {
    const todo = dataRef.current.todos.find((t) => t.id === id);
    if (!todo) return;
    const targetTodos = dataRef.current.todos.filter((t) => t.listId === todo.listId);
    const maxOrder = targetTodos.length > 0 ? Math.max(...targetTodos.map((t) => t.order)) : -1;
    const newTodo: TodoItem = { ...todo, id: Date.now(), text: todo.text + " (copy)", order: maxOrder + 1, createdAt: Date.now() };
    setData((prev) => ({ ...prev, todos: [...prev.todos, newTodo] }));
  }, []);

  // Toggle reminder
  const toggleReminder = useCallback((id: number) => {
    setData((prev) => ({
      ...prev,
      todos: prev.todos.map((t) =>
        t.id === id ? { ...t, reminderEnabled: !t.reminderEnabled } : t
      ),
    }));
  }, []);

  // Bulk complete/uncomplete
  const bulkToggle = useCallback((ids: number[], completed: boolean) => {
    setData((prev) => ({
      ...prev,
      todos: prev.todos.map((t) => (ids.includes(t.id) ? { ...t, completed } : t)),
    }));
  }, []);

  // ── Check all completed (for confetti) ──
  const allCompletedInActiveList = useMemo(
    () => activeTodos.length > 0 && activeTodos.every((t) => t.completed),
    [activeTodos]
  );

  return {
    // Data
    data,
    activeList,
    activeTodos,
    searchQuery,
    setSearchQuery,
    filterFn,
    stats,
    allCompletedInActiveList,
    undoTodo: undoItem?.todo ?? null,
    undoDelete,

    // List operations
    addList,
    renameList,
    deleteList,
    setActiveList,
    reorderLists,

    // Todo operations
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    updateTodoPriority,
    updateTodoDueDate,
    moveTodo,
    reorderTodos,
    clearCompleted,
    duplicateTodo,
    bulkToggle,
    toggleReminder,
    undoItem,

    // Data management
    importSuccess,
    setImportSuccess,
    replaceData: useCallback((newData: TodoData) => {
      const migrated = migrateData(newData);

      // Reject imports with no lists — would crash the app
      if (migrated.lists.length === 0) return;

      // Clear any pending timeout
      if (importSuccessTimeoutRef.current) {
        clearTimeout(importSuccessTimeoutRef.current);
      }

      setData(migrated);
      setSearchQuery("");
      setImportSuccess(true);

      importSuccessTimeoutRef.current = window.setTimeout(() => {
        setImportSuccess(false);
        importSuccessTimeoutRef.current = null;
      }, 3000);
    }, []),
  };
};
