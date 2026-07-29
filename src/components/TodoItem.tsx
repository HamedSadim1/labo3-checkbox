import { useState, useRef, useEffect } from "react";
import type { Todo } from "../hooks/useTodos";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, newText: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggle,
  onDelete,
  onEdit,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [isEditing]);

  const handleDelete = () => {
    setIsExiting(true);
    setTimeout(() => onDelete(todo.id), 280);
  };

  const handleDoubleClick = () => {
    if (!todo.completed) {
      setEditText(todo.text);
      setIsEditing(true);
    }
  };

  const handleEditSubmit = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== todo.text) {
      onEdit(todo.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEditSubmit();
    } else if (e.key === "Escape") {
      setEditText(todo.text);
      setIsEditing(false);
    }
  };

  return (
    <li
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 group ${
        isExiting ? "animate-slide-out" : "animate-slide-in"
      }`}
      style={{
        background: todo.completed
          ? "var(--color-overlay)"
          : "transparent",
        borderColor: "var(--color-input-border)",
      }}
    >
      {/* Custom checkbox */}
      <button
        onClick={() => onToggle(todo.id)}
        className={`checkbox-custom ${todo.completed ? "checked" : ""}`}
        aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
      >
        {todo.completed && (
          <svg viewBox="0 0 24 24" fill="none">
            <path
              className="checkmark"
              d="M5 13l4 4L19 7"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        )}
      </button>

      {/* Todo text or edit input */}
      {isEditing ? (
        <input
          ref={editInputRef}
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleEditSubmit}
          onKeyDown={handleEditKeyDown}
          className="flex-1 px-3 py-1.5 rounded-lg border text-sm focus:outline-none"
          style={{
            color: "var(--color-text)",
            background: "var(--color-input-bg)",
            borderColor: "var(--color-accent)",
          }}
        />
      ) : (
        <span
          className={`flex-1 text-sm cursor-pointer ${
            todo.completed ? "line-through" : ""
          }`}
          style={{
            color: todo.completed
              ? "var(--color-text-secondary)"
              : "var(--color-text)",
          }}
          onDoubleClick={handleDoubleClick}
          title={todo.completed ? "" : "Double-click to edit"}
        >
          {todo.text}
        </span>
      )}

      {/* Delete button */}
      <button
        onClick={handleDelete}
        className="opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all duration-200 hover:scale-110"
        style={{ color: "var(--color-danger)" }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.background =
            "var(--color-accent-light)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.background =
            "transparent")
        }
        aria-label="Delete todo"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </li>
  );
};

export default TodoItem;
