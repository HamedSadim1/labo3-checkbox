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
import TodoItem from "@/components/todos/TodoItem";
import type { TodoItem as TodoItemType, Priority, TodoListMeta } from "@/types";
import type { Filter } from "@/context/FilterContext";
import { SoundEffects } from "@/hooks/useSoundEffects";
import { Icon } from "@/components/icons/Icon";

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
        <Icon name="drag" className="w-5 h-5" />
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
        <Icon
          name={searchQuery ? "search" : filter === "completed" ? "clipboardCheck" : "clipboard"}
          className="w-14 h-14 mb-3"
          strokeWidth={1.5}
          style={{ color: "var(--color-empty-icon)" }}
        />

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
              className="text-xs font-medium px-3 py-1.5 rounded-lg ui-hover-scale-sm"
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
