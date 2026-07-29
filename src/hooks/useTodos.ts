import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { LIST_COLORS } from "@/constants/colors";
import { STORAGE_KEYS, TIMING } from "@/constants/app";
import { migrateData } from "@/utils/migration";
import { generateId } from "@/utils/id";
import { defaultData } from "@/data/defaultData";

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


export const useTodos = () => {
  const [data, setData] = useState<TodoData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TODOS);
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
  const [undoCompleted, setUndoCompleted] = useState<TodoItem[] | null>(null);
  const undoTimeoutRef = useRef<number | null>(null);
  const undoCompletedTimeoutRef = useRef<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // ── Persist ──
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(data));
  }, [data]);

  // ── Refs ──
  const dataRef = useRef(data);
  useEffect(() => { dataRef.current = data; }, [data]);

  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
      if (undoCompletedTimeoutRef.current) clearTimeout(undoCompletedTimeoutRef.current);
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
        t.completed && Math.abs(t.createdAt - check.getTime()) < TIMING.MS_PER_DAY
      );
      if (dayHasCompletion) { streak++; check.setDate(check.getDate() - 1); }
      else break;
    }

    return { totalTodos: total, completedTodos: completed, activeTodos: active, overdueTodos: overdue, dueTodayTodos: dueToday, completionRate, highPriorityActive, streakDays: streak };
  }, [data.todos]);

  // ── List CRUD ──
  const addList = useCallback((name: string) => {
    const newList: TodoListMeta = {
      id: generateId(),
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
    }, TIMING.UNDO_DELETE_MS);
  }, []);

  const undoClearCompleted = useCallback(() => {
    if (undoCompleted) {
      setData((prev) => {
        // Don't add todos that already exist
        const existingIds = new Set(prev.todos.map((t) => t.id));
        const toRestore = undoCompleted.filter((t) => !existingIds.has(t.id));
        if (toRestore.length === 0) return prev;
        return { ...prev, todos: [...prev.todos, ...toRestore] };
      });
      setUndoCompleted(null);
      if (undoCompletedTimeoutRef.current) {
        clearTimeout(undoCompletedTimeoutRef.current);
        undoCompletedTimeoutRef.current = null;
      }
    }
  }, [undoCompleted]);

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
    const completedToRemove = dataRef.current.todos.filter(
      (t) => t.listId === dataRef.current.activeListId && t.completed
    );
    if (completedToRemove.length === 0) return;

    // Clear any pending timeout
    if (undoCompletedTimeoutRef.current) {
      clearTimeout(undoCompletedTimeoutRef.current);
    }

    setUndoCompleted(completedToRemove);
    undoCompletedTimeoutRef.current = window.setTimeout(() => {
      setUndoCompleted(null);
      undoCompletedTimeoutRef.current = null;
    }, TIMING.UNDO_CLEAR_MS);

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
    undoCompleted,
    undoClearCompleted,

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
      }, TIMING.IMPORT_SUCCESS_MS);
    }, []),
  };
};
