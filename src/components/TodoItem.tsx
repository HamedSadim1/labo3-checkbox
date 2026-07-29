import { useState, useRef, useEffect, useCallback } from "react";
import type { TodoItem as TodoItemType, Priority, TodoListMeta } from "../hooks/useTodos";
import { SoundEffects } from "../hooks/useSoundEffects";

interface TodoItemProps {
  todo: TodoItemType;
  lists: TodoListMeta[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, newText: string) => void;
  onUpdatePriority: (id: number, priority: Priority) => void;
  onUpdateDueDate: (id: number, dueDate: string | null) => void;
  onToggleReminder: (id: number) => void;
  onMoveToList: (todoId: number, listId: string) => void;
  onDuplicate: (id: number) => void;
}

const priorityConfig: Record<Priority, { color: string; bg: string; label: string }> = {
  low: { color: "#22c55e", bg: "rgba(34, 197, 94, 0.12)", label: "Low" },
  medium: { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.12)", label: "Med" },
  high: { color: "#ef4444", bg: "rgba(239, 68, 68, 0.12)", label: "High" },
};

const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  lists,
  onToggle,
  onDelete,
  onEdit,
  onUpdatePriority,
  onUpdateDueDate,
  onToggleReminder,
  onMoveToList,
  onDuplicate,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [showActions, setShowActions] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);
  const touchStartX = useRef(0);
  const itemRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (isEditing) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [isEditing]);

  // ── Touch swipe handlers ──
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsSwiping(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const deltaX = e.touches[0].clientX - touchStartX.current;
    if (deltaX < 0) {
      setSwipeOffset(Math.max(deltaX, -80));
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsSwiping(false);
    if (swipeOffset < -50) {
      handleDelete();
    }
    setSwipeOffset(0);
  }, [swipeOffset]);

  const handleDelete = () => {
    setIsExiting(true);
    SoundEffects.delete();
    setTimeout(() => onDelete(todo.id), 280);
  };

  const handleToggle = () => {
    if (todo.completed) {
      SoundEffects.uncomplete();
    } else {
      SoundEffects.complete();
    }
    onToggle(todo.id);
  };

  const handleDoubleClick = () => {
    if (!todo.completed) {
      setEditText(todo.text);
      setIsEditing(true);
      SoundEffects.edit();
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
    if (e.key === "Enter") handleEditSubmit();
    else if (e.key === "Escape") {
      setEditText(todo.text);
      setIsEditing(false);
    }
  };

  // Due date display
  const getDueDateInfo = () => {
    if (!todo.dueDate) return null;
    const today = new Date().toISOString().slice(0, 10);
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const due = new Date(todo.dueDate + "T00:00:00");

    if (todo.dueDate < today) return { text: `Overdue (${todo.dueDate})`, urgent: true };
    if (todo.dueDate === today) return { text: "Due today", urgent: true };
    if (todo.dueDate === tomorrow) return { text: "Due tomorrow", urgent: false };

    const days = Math.ceil((due.getTime() - Date.now()) / 86400000);
    if (days <= 3) return { text: `Due in ${days} days`, urgent: false };
    return { text: todo.dueDate, urgent: false };
  };

  const dueInfo = getDueDateInfo();
  const priorityInfo = priorityConfig[todo.priority];

  return (
    <li
      ref={itemRef}
      className={`flex items-center gap-2 p-3 rounded-xl border transition-all duration-200 group ${
        isExiting ? "animate-slide-out" : "animate-slide-in"
      } ${isSwiping ? "" : ""}`}
      style={{
        background: todo.completed
          ? "var(--color-overlay)"
          : "transparent",
        borderColor: "var(--color-input-border)",
        transform: `translateX(${swipeOffset}px)`,
        transition: isSwiping ? "none" : "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        opacity: todo.completed ? 0.7 : 1,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Swipe delete indicator */}
      {swipeOffset < -20 && (
        <div
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold"
          style={{ color: "var(--color-danger)" }}
        >
          Delete
        </div>
      )}

      {/* Custom checkbox */}
      <button
        onClick={handleToggle}
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

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Priority badge + Due date */}
        <div className="flex items-center gap-1.5 mb-0.5">
          {!todo.completed && (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
              style={{
                color: priorityInfo.color,
                background: priorityInfo.bg,
              }}
            >
              {priorityInfo.label}
            </span>
          )}

          {dueInfo && !todo.completed && (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
              style={{
                color: dueInfo.urgent ? "var(--color-danger)" : "var(--color-text-secondary)",
                background: dueInfo.urgent ? "rgba(239, 68, 68, 0.1)" : "var(--color-overlay)",
              }}
            >
              {/* Bell icon when reminder is enabled */}
              {todo.reminderEnabled && (
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24" style={{ color: dueInfo.urgent ? "var(--color-danger)" : "var(--color-accent)" }}>
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                </svg>
              )}
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {dueInfo.text}
            </span>
          )}
          
          {/* List badge (if viewing all lists) */}
          {lists.length > 1 && (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
              style={{
                color: "var(--color-text-secondary)",
                background: "var(--color-overlay)",
              }}
            >
              {lists.find((l) => l.id === todo.listId)?.name ?? "Unknown"}
            </span>
          )}
        </div>

        {/* Todo text or edit input */}
        {isEditing ? (
          <input
            ref={editInputRef}
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleEditSubmit}
            onKeyDown={handleEditKeyDown}
            className="w-full px-3 py-1.5 rounded-lg border text-sm focus:outline-none"
            style={{
              color: "var(--color-text)",
              background: "var(--color-input-bg)",
              borderColor: "var(--color-accent)",
            }}
          />
        ) : (
          <span
            className={`text-sm cursor-pointer block break-words ${
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
      </div>

      {/* Action buttons */}
      <div className={`flex items-center gap-0.5 transition-all duration-200 ${showActions || window.innerWidth > 768 ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
        {/* More actions dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
            style={{ color: "var(--color-text-secondary)" }}
            aria-label="More actions"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
            </svg>
          </button>

          {/* Dropdown menu */}
          {showActions && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
              <div
                className="absolute right-0 bottom-full mb-1 z-20 w-44 rounded-xl border shadow-xl overflow-hidden animate-fade-in-up"
                style={{
                  background: "var(--color-card)",
                  borderColor: "var(--color-card-border)",
                }}
              >
                {/* Change priority */}
                <div className="p-2 border-b" style={{ borderColor: "var(--color-card-border)" }}>
                  <p className="text-[10px] font-medium mb-1 px-2" style={{ color: "var(--color-text-secondary)" }}>Priority</p>
                  <div className="flex gap-1">
                    {(Object.entries(priorityConfig) as [Priority, typeof priorityConfig.low][]).map(([key, cfg]) => (
                      <button
                        key={key}
                        onClick={() => { onUpdatePriority(todo.id, key); setShowActions(false); }}
                        className="flex-1 px-2 py-1 rounded text-[10px] font-semibold transition-all duration-200"
                        style={{
                          background: todo.priority === key ? cfg.bg : "transparent",
                          color: cfg.color,
                          border: todo.priority === key ? `1px solid ${cfg.color}44` : "1px solid transparent",
                        }}
                      >
                        {cfg.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Set due date */}
                <div className="p-2 border-b" style={{ borderColor: "var(--color-card-border)" }}>
                  <p className="text-[10px] font-medium mb-1 px-2" style={{ color: "var(--color-text-secondary)" }}>Due Date</p>
                  <div className="flex gap-1">
                    <input
                      type="date"
                      value={todo.dueDate ?? ""}
                      onChange={(e) => { onUpdateDueDate(todo.id, e.target.value || null); setShowActions(false); }}
                      className="flex-1 px-2 py-1 rounded text-xs focus:outline-none"
                      style={{ background: "var(--color-input-bg)", color: "var(--color-text)", border: "1px solid var(--color-input-border)" }}
                    />
                    {todo.dueDate && (
                      <button
                        onClick={() => { onToggleReminder(todo.id); setShowActions(false); }}
                        className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
                          todo.reminderEnabled ? "ring-2" : ""
                        }`}
                        style={{
                          background: todo.reminderEnabled ? "var(--color-accent-light)" : "var(--color-overlay)",
                          color: todo.reminderEnabled ? "var(--color-accent)" : "var(--color-text-secondary)",
                        }}
                        title={todo.reminderEnabled ? "Notifications enabled" : "Enable notifications"}
                      >
                        <svg className="w-3.5 h-3.5" fill={todo.reminderEnabled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {todo.reminderEnabled && todo.dueDate && (
                    <p className="text-[9px] mt-1 px-1" style={{ color: "var(--color-accent)" }}>
                      🔔 Notification enabled
                    </p>
                  )}
                </div>

                {/* Move to list */}
                {lists.length > 1 && (
                  <div className="p-2 border-b" style={{ borderColor: "var(--color-card-border)" }}>
                    <p className="text-[10px] font-medium mb-1 px-2" style={{ color: "var(--color-text-secondary)" }}>Move to</p>
                    {lists.filter((l) => l.id !== todo.listId).map((list) => (
                      <button
                        key={list.id}
                        onClick={() => { onMoveToList(todo.id, list.id); setShowActions(false); }}
                        className="w-full text-left px-2 py-1.5 rounded text-xs transition-all duration-200"
                        style={{ color: "var(--color-text)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-overlay)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        → {list.name}
                      </button>
                    ))}
                  </div>
                )}

                {/* Duplicate */}
                <button
                  onClick={() => { onDuplicate(todo.id); setShowActions(false); }}
                  className="w-full text-left px-4 py-2 text-xs transition-all duration-200"
                  style={{ color: "var(--color-text)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-overlay)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  Duplicate
                </button>
              </div>
            </>
          )}
        </div>

        {/* Delete button */}
        <button
          onClick={handleDelete}
          className="p-2 rounded-lg transition-all duration-200 hover:scale-110 hover:bg-red-500/10"
          style={{ color: "var(--color-danger)" }}
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
      </div>
    </li>
  );
};

export default TodoItem;
