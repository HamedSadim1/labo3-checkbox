import { useState, useEffect, useCallback, useRef } from "react";

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const STORAGE_KEY = "labo3-todos";

const defaultTodos: Todo[] = [
  { id: 1, text: "Learn React", completed: false },
  { id: 2, text: "Build a Todo App", completed: true },
  { id: 3, text: "Master Tailwind CSS", completed: false },
];

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return defaultTodos;
  });

  const [undoTodo, setUndoDelete] = useState<Todo | null>(null);
  const undoTimeoutRef = useRef<number | null>(null);

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  // Keep a ref to the latest todos for use in callbacks
  const todosRef = useRef(todos);
  useEffect(() => {
    todosRef.current = todos;
  }, [todos]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    };
  }, []);

  const addTodo = useCallback((text: string): void => {
    const newTodo: Todo = {
      id: Date.now(),
      text,
      completed: false,
    };
    setTodos((prev) => [...prev, newTodo]);
  }, []);

  const toggleTodo = useCallback((id: number): void => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []);

  const deleteTodo = useCallback((id: number): void => {
    // Cancel any pending undo
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }

    // Find the todo before removing (using ref to avoid stale closure)
    const todoToDelete = todosRef.current.find((t) => t.id === id);
    if (!todoToDelete) return;

    setTodos((prev) => prev.filter((t) => t.id !== id));

    setUndoDelete(todoToDelete);
    undoTimeoutRef.current = window.setTimeout(() => {
      setUndoDelete(null);
      undoTimeoutRef.current = null;
    }, 4000);
  }, []);

  const undoDelete = useCallback((): void => {
    if (undoTodo) {
      setTodos((prev) => {
        // Don't add if it was already re-added somehow
        if (prev.some((t) => t.id === undoTodo.id)) return prev;
        // Insert at the position it was before (at the end)
        return [...prev, undoTodo];
      });
      setUndoDelete(null);
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
        undoTimeoutRef.current = null;
      }
    }
  }, [undoTodo]);

  const editTodo = useCallback((id: number, newText: string): void => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, text: newText } : todo
      )
    );
  }, []);

  const clearCompleted = useCallback((): void => {
    setTodos((prev) => prev.filter((todo) => !todo.completed));
  }, []);

  return {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    clearCompleted,
    undoTodo,
    undoDelete,
  };
};
