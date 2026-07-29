import { useCallback } from "react";
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TodoItem from "@/components/TodoItem";
import type { TodoItem as TodoItemType, Priority, TodoListMeta } from "@/hooks/useTodos";
import type { Filter } from "@/context/FilterContext";
import { SoundEffects } from "@/hooks/useSoundEffects";

interface TodoListProps {
  todos: TodoItemType[];
  filteredTodos: TodoItemType[];
  filter: Filter;
  lists: TodoListMeta[];
  activeListId: string;
  searchQuery: string;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, newText: string) => void;
  onUpdatePriority: (id: number, priority: Priority) => void;
  onUpdateDueDate: (id: number, dueDate: string | null) => void;
  onMoveToList: (todoId: number, listId: string) => void;
  onDuplicate: (id: number) => void;
  onToggleReminder: (id: number) => void;
  onReorder: (listId: string, orderedIds: number[]) => void;
  onClearCompleted: () => void;
}

interface SortableItemProps {
  todo: TodoItemType;
  lists: TodoListMeta[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, newText: string) => void;
  onUpdatePriority: (id: number, priority: Priority) => void;
  onUpdateDueDate: (id: number, dueDate: string | null) => void;
  onMoveToList: (todoId: number, listId: string) => void;
  onDuplicate: (id: number) => void;
  onToggleReminder: (id: number) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({
  todo,
  lists,
  onToggle,
  onDelete,
  onEdit,
  onUpdatePriority,
  onUpdateDueDate,
  onMoveToList,
  onDuplicate,
  onToggleReminder,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute -left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity duration-200 cursor-grab active:cursor-grabbing z-10 bg-transparent p-3 -m-3 rounded touch-manipulation"
        style={{ color: "var(--color-text-secondary)" }}
        aria-label="Drag to reorder"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
        </svg>
      </button>

      <TodoItem
        todo={todo}
        lists={lists}
        onToggle={onToggle}
        onDelete={onDelete}
        onEdit={onEdit}
        onUpdatePriority={onUpdatePriority}
        onUpdateDueDate={onUpdateDueDate}
        onMoveToList={onMoveToList}
        onDuplicate={onDuplicate}
        onToggleReminder={onToggleReminder}
      />
    </div>
  );
};

const TodoList: React.FC<TodoListProps> = ({
  todos,
  filteredTodos,
  filter,
  lists,
  activeListId,
  searchQuery,
  onToggle,
  onDelete,
  onEdit,
  onUpdatePriority,
  onUpdateDueDate,
  onMoveToList,
  onDuplicate,
  onToggleReminder,
  onReorder,
  onClearCompleted,
}) => {
  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.completed).length;
  const activeCount = totalCount - completedCount;
  const hasCompleted = completedCount > 0;

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const ids = filteredTodos.map((t) => t.id);
      const activeId = Number(active.id);
      const overId = Number(over.id);
      const oldIndex = ids.indexOf(activeId);
      const newIndex = ids.indexOf(overId);

      if (oldIndex === -1 || newIndex === -1) return;

      const newIds = arrayMove(ids, oldIndex, newIndex);
      onReorder(activeListId, newIds);
    },
    [filteredTodos, activeListId, onReorder]
  );

  // ── Empty state ──
  if (filteredTodos.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-14 px-6 rounded-xl border-2 border-dashed animate-fade-in-up"
        style={{ borderColor: "var(--color-input-border)", background: "var(--color-overlay)" }}
      >
        {/* Dynamic empty state icon */}
        <svg className="w-14 h-14 mb-3" style={{ color: "var(--color-empty-icon)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {searchQuery ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          ) : filter === "completed" ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5h6m-6 4l2 2 4-4" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5h6" />
          )}
        </svg>

        <p className="text-base font-medium mb-1" style={{ color: "var(--color-text-secondary)" }}>
          {searchQuery ? "No results found" : filter === "all" ? "No todos yet" : filter === "active" ? "All done! " : "No completed todos"}
        </p>
        <p className="text-sm text-center" style={{ color: "var(--color-text-secondary)", opacity: 0.7 }}>
          {searchQuery ? `No todos match "${searchQuery}"` : filter === "all" ? "Add one above to get started!" : filter === "active" ? "Nothing left to do" : "Complete some todos to see them here"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="animate-fade-in-down">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
              {completedCount}/{totalCount} completed
            </span>
            <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
              {activeCount} {activeCount === 1 ? "item" : "items"} left
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-overlay)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
                background: completedCount === totalCount ? "var(--color-success)" : "var(--color-accent)",
                transition: "width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.5s ease",
              }}
            />
          </div>
        </div>
      )}

      {/* Todo list with drag & drop */}
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredTodos.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-1.5">
            {filteredTodos.map((todo) => (
              <SortableItem
                key={todo.id}
                todo={todo}
                lists={lists}
                onToggle={onToggle}
                onDelete={onDelete}
                onEdit={onEdit}
                onUpdatePriority={onUpdatePriority}
                onUpdateDueDate={onUpdateDueDate}
                onMoveToList={onMoveToList}
                onDuplicate={onDuplicate}
                onToggleReminder={onToggleReminder}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {/* Footer */}
      {totalCount > 0 && (
        <div
          className="flex items-center justify-between pt-2 border-t"
          style={{ borderColor: "var(--color-input-border)" }}
        >
          <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
            {activeCount} {activeCount === 1 ? "item" : "items"} left
          </span>

          {hasCompleted && (
            <button
              onClick={() => { onClearCompleted(); SoundEffects.clear(); }}
              className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-105"
              style={{ color: "var(--color-text-secondary)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "var(--color-danger)";
                (e.currentTarget as HTMLButtonElement).style.background = "var(--color-accent-light)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text-secondary)";
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              }}
            >
              Clear completed ({completedCount})
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TodoList;
