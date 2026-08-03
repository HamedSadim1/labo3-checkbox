import { useState, useRef, useEffect, useCallback } from "react";
import type {
  TodoItem as TodoItemType,
  Priority,
  TodoListMeta,
} from "@/types";
import { SoundEffects } from "@/hooks/useSoundEffects";
import { PRIORITY_OPTIONS, priorityConfig } from "@/constants/priorities";
import { TIMING, SWIPE } from "@/constants/app";
import { formatDueInfo } from "@/utils/date";
import { cn } from "@/utils/cn";
import { Icon } from "@/components/icons/Icon";

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
  const itemRef = useRef<HTMLDivElement>(null);

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
      setSwipeOffset(Math.max(deltaX, SWIPE.MAX_OFFSET));
    }
  }, []);

  const handleDelete = useCallback(() => {
    setIsExiting(true);
    SoundEffects.delete();
    setTimeout(() => onDelete(todo.id), TIMING.DELETE_ANIMATION_MS);
  }, [onDelete, todo.id]);

  const handleTouchEnd = useCallback(() => {
    setIsSwiping(false);
    if (swipeOffset < SWIPE.DELETE_THRESHOLD) {
      handleDelete();
    }
    setSwipeOffset(0);
  }, [swipeOffset, handleDelete]);

  const handleToggle = () => {
    if (todo.completed) {
      SoundEffects.uncomplete();
    } else {
      SoundEffects.complete();
    }
    onToggle(todo.id);
  };

  const handleEditStart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setEditText(todo.text);
    setIsEditing(true);
    SoundEffects.edit();
  };

  const handleItemClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // A double-click should not toggle the todo twice.
    if (e.detail > 1) return;
    handleToggle();
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

  const dueInfo = formatDueInfo(todo.dueDate);
  const priorityInfo = priorityConfig[todo.priority];
  const currentList = lists.find((l) => l.id === todo.listId);
  const showMetadata = !todo.completed || lists.length > 1;

  const actionButtons = (
    <>
      {/* Edit button */}
      <button
        onClick={handleEditStart}
        className="p-3 rounded-lg ui-hover-scale hover:bg-indigo-500/10"
        style={{ color: "var(--color-accent)" }}
        aria-label="Edit todo"
        title="Edit todo"
      >
        <Icon name="edit" className="w-4 h-4" />
      </button>

      {/* More actions dropdown */}
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowActions(!showActions);
          }}
          className="p-3 rounded-lg ui-hover-scale"
          style={{ color: "var(--color-text-secondary)" }}
          aria-label="More actions"
        >
          <Icon name="dotsVertical" className="w-4 h-4" />
        </button>

        {/* Dropdown menu */}
        {showActions && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(false);
              }}
            />
            <div
              className="absolute right-0 bottom-full mb-1 z-20 w-44 rounded-xl border shadow-xl overflow-hidden animate-fade-in-up"
              style={{
                background: "var(--color-card)",
                borderColor: "var(--color-card-border)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Change priority */}
              <div
                className="p-2 border-b"
                style={{ borderColor: "var(--color-card-border)" }}
              >
                <p
                  className="text-[10px] font-medium mb-1 px-2"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Priority
                </p>
                <div className="flex gap-1">
                  {PRIORITY_OPTIONS.map(({ value, label, color }) => {
                    const isSelected = todo.priority === value;
                    return (
                      <button
                        key={value}
                        onClick={() => {
                          onUpdatePriority(todo.id, value);
                          setShowActions(false);
                        }}
                        className="flex-1 px-3 py-2 rounded text-[10px] font-semibold transition-all duration-200"
                        style={{
                          background: isSelected
                            ? priorityConfig[value].bg
                            : "transparent",
                          color,
                          border: isSelected
                            ? `1px solid ${color}44`
                            : "1px solid transparent",
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Set due date */}
              <div
                className="p-2 border-b"
                style={{ borderColor: "var(--color-card-border)" }}
              >
                <p
                  className="text-[10px] font-medium mb-1 px-2"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Due Date
                </p>
                <div className="flex gap-1">
                  <input
                    type="date"
                    value={todo.dueDate ?? ""}
                    onChange={(e) => {
                      onUpdateDueDate(todo.id, e.target.value || null);
                      setShowActions(false);
                    }}
                    className="flex-1 px-2 py-1 rounded text-xs focus:outline-none"
                    style={{
                      background: "var(--color-input-bg)",
                      color: "var(--color-text)",
                      border: "1px solid var(--color-input-border)",
                    }}
                  />
                  {todo.dueDate && (
                    <button
                      onClick={() => {
                        onToggleReminder(todo.id);
                        setShowActions(false);
                      }}
                      className={cn(
                        "px-3 py-2 rounded text-xs font-medium transition-all duration-200",
                        todo.reminderEnabled && "ring-2",
                      )}
                      style={{
                        background: todo.reminderEnabled
                          ? "var(--color-accent-light)"
                          : "var(--color-overlay)",
                        color: todo.reminderEnabled
                          ? "var(--color-accent)"
                          : "var(--color-text-secondary)",
                      }}
                      title={
                        todo.reminderEnabled
                          ? "Notifications enabled"
                          : "Enable notifications"
                      }
                    >
                      <Icon
                        name="bell"
                        className="w-3.5 h-3.5"
                        fill={todo.reminderEnabled ? "currentColor" : "none"}
                      />
                    </button>
                  )}
                </div>
                {todo.reminderEnabled && todo.dueDate && (
                  <p
                    className="text-[9px] mt-1 px-1"
                    style={{ color: "var(--color-accent)" }}
                  >
                    🔔 Notification enabled
                  </p>
                )}
              </div>

              {/* Move to list */}
              {lists.length > 1 && (
                <div
                  className="p-2 border-b"
                  style={{ borderColor: "var(--color-card-border)" }}
                >
                  <p
                    className="text-[10px] font-medium mb-1 px-2"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Move to
                  </p>
                  {lists
                    .filter((l) => l.id !== todo.listId)
                    .map((list) => (
                      <button
                        key={list.id}
                        onClick={() => {
                          onMoveToList(todo.id, list.id);
                          setShowActions(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded text-xs transition-all duration-200"
                        style={{ color: "var(--color-text)" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "var(--color-overlay)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        → {list.name}
                      </button>
                    ))}
                </div>
              )}

              {/* Duplicate */}
              <button
                onClick={() => {
                  onDuplicate(todo.id);
                  setShowActions(false);
                }}
                className="w-full text-left px-4 py-3 text-xs transition-all duration-200"
                style={{ color: "var(--color-text)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--color-overlay)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                Duplicate
              </button>
            </div>
          </>
        )}
      </div>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDelete();
        }}
        className="p-3 rounded-lg ui-hover-scale hover:bg-red-500/10"
        style={{ color: "var(--color-danger)" }}
        aria-label="Delete todo"
      >
        <Icon name="trash" className="w-4 h-4" />
      </button>
    </>
  );

  return (
    <div
      ref={itemRef}
      className={cn(
        "relative flex flex-col md:flex-row gap-2 md:gap-3 p-3 md:p-4 rounded-xl border transition-all duration-200 group",
        isExiting ? "animate-slide-out" : "animate-slide-in",
        !isEditing && "cursor-pointer hover:bg-black/5",
      )}
      style={{
        background: todo.completed ? "var(--color-overlay)" : "transparent",
        borderColor: "var(--color-input-border)",
        transform: `translateX(${swipeOffset}px)`,
        transition: isSwiping
          ? "none"
          : "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        opacity: todo.completed ? 0.7 : 1,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={!isEditing ? handleItemClick : undefined}
    >
      {/* Swipe delete indicator */}
      {swipeOffset < SWIPE.LABEL_SHOW && (
        <div
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold"
          style={{ color: "var(--color-danger)" }}
        >
          Delete
        </div>
      )}

      {/* Top row: checkbox + content + desktop actions */}
      <div className="flex items-start md:items-center gap-2 md:gap-3 w-full">
        {/* Custom checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}
          className={cn("checkbox-custom p-1.5", todo.completed && "checked")}
          aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
        >
          {todo.completed && (
            <Icon
              name="check"
              className="w-4 h-4"
              stroke="white"
              strokeWidth={3}
            />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Todo text or edit input */}
          {isEditing ? (
            <input
              ref={editInputRef}
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleEditSubmit}
              onKeyDown={handleEditKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-3 py-1.5 rounded-lg border text-sm focus:outline-none"
              style={{
                color: "var(--color-text)",
                background: "var(--color-input-bg)",
                borderColor: "var(--color-accent)",
              }}
            />
          ) : (
            <span
              className={cn(
                "w-full text-base md:text-sm leading-snug cursor-pointer block break-words whitespace-normal",
                todo.completed && "line-through",
              )}
              style={{
                color: todo.completed
                  ? "var(--color-text-secondary)"
                  : "var(--color-text)",
              }}

            >
              {todo.text}
            </span>
          )}

          {/* Metadata row */}
          {!isEditing && showMetadata && (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {/* Priority badge (active only) */}
              {!todo.completed && (
                <span
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{
                    color: priorityInfo.color,
                    background: priorityInfo.bg,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: priorityInfo.color }}
                  />
                  {priorityInfo.label}
                </span>
              )}

              {/* Due date badge (active only) */}
              {!todo.completed && dueInfo && (
                <span
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    color: dueInfo.urgent
                      ? "var(--color-danger)"
                      : "var(--color-text-secondary)",
                    background: dueInfo.urgent
                      ? "rgba(239, 68, 68, 0.1)"
                      : "var(--color-overlay)",
                  }}
                >
                  <Icon name="calendar" className="w-3.5 h-3.5" />
                  {dueInfo.text}
                  {todo.reminderEnabled && (
                    <Icon
                      name="bell"
                      className="w-3 h-3"
                      fill="currentColor"
                      stroke="none"
                      style={{
                        color: dueInfo.urgent
                          ? "var(--color-danger)"
                          : "var(--color-accent)",
                      }}
                    />
                  )}
                </span>
              )}

              {/* List badge (if viewing all lists) */}
              {lists.length > 1 && (
                <span
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium truncate max-w-[120px]"
                  style={{
                    color: "var(--color-text-secondary)",
                    background: "var(--color-overlay)",
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      background:
                        currentList?.color ?? "var(--color-text-secondary)",
                    }}
                  />
                  {currentList?.name ?? "Unknown"}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Desktop actions */}
        <div
          className={cn(
            "hidden md:flex items-center gap-1 transition-all duration-200",
            showActions ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
        >
          {actionButtons}
        </div>
      </div>

      {/* Mobile actions */}
      <div
        className="flex md:hidden items-center justify-end gap-2 mt-2"
        onClick={(e) => e.stopPropagation()}
      >
        {actionButtons}
      </div>
    </div>
  );
};

export default TodoItem;
