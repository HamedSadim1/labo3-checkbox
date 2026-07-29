import TodoItem from "./TodoItem";
import type { Todo } from "../hooks/useTodos";
import type { Filter } from "../context/FilterContext";

interface TodoListProps {
  todos: Todo[];
  filter: Filter;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, newText: string) => void;
  onClearCompleted: () => void;
}

const TodoList: React.FC<TodoListProps> = ({
  todos,
  filter,
  onToggle,
  onDelete,
  onEdit,
  onClearCompleted,
}) => {
  // Apply filter
  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.completed).length;
  const activeCount = totalCount - completedCount;
  const hasCompleted = completedCount > 0;

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="animate-fade-in-down">
          <div className="flex justify-between items-center mb-1.5">
            <span
              className="text-xs font-medium"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {completedCount}/{totalCount} completed
            </span>
            <span
              className="text-xs font-medium"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {activeCount} {activeCount === 1 ? "item" : "items"} left
            </span>
          </div>
          <div
            className="w-full h-2 rounded-full overflow-hidden"
            style={{ background: "var(--color-overlay)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${(completedCount / totalCount) * 100}%`,
                background: "var(--color-accent)",
                transition: "width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            />
          </div>
        </div>
      )}

      {/* Todo list or empty state */}
      {filteredTodos.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 px-6 rounded-xl border-2 border-dashed animate-fade-in-up"
          style={{
            borderColor: "var(--color-input-border)",
            background: "var(--color-overlay)",
          }}
        >
          {/* Empty state icon */}
          <svg
            className="w-16 h-16 mb-4"
            style={{ color: "var(--color-empty-icon)" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {filter === "completed" ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5h6m-6 4l2 2 4-4"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5h6"
              />
            )}
          </svg>

          <p
            className="text-base font-medium mb-1"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {filter === "all" && "No todos yet"}
            {filter === "active" && "All done! 🎉"}
            {filter === "completed" && "No completed todos"}
          </p>
          <p
            className="text-sm"
            style={{ color: "var(--color-text-secondary)", opacity: 0.7 }}
          >
            {filter === "all" && "Add one above to get started!"}
            {filter === "active" && "Nothing left to do"}
            {filter === "completed" &&
              "Complete some todos to see them here"}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {filteredTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={onToggle}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </ul>
      )}

      {/* Footer with clear completed */}
      {totalCount > 0 && (
        <div
          className="flex items-center justify-between pt-2 border-t"
          style={{ borderColor: "var(--color-input-border)" }}
        >
          <span
            className="text-xs"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {activeCount} {activeCount === 1 ? "item" : "items"} left
          </span>

          {hasCompleted && (
            <button
              onClick={onClearCompleted}
              className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-105"
              style={{
                color: "var(--color-text-secondary)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color =
                  "var(--color-danger)";
                (e.currentTarget as HTMLButtonElement).style.background =
                  "var(--color-accent-light)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color =
                  "var(--color-text-secondary)";
                (e.currentTarget as HTMLButtonElement).style.background =
                  "transparent";
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
