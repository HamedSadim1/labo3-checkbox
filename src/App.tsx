import TodoList from "./components/TodoList";
import AddTodo from "./components/AddTodo";
import { useTodos } from "./hooks/useTodos";
import { useTheme } from "./context/ThemeContext";
import { useFilter, type Filter } from "./context/FilterContext";

const filters: { label: string; value: Filter }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
];

function App() {
  const { todos, addTodo, toggleTodo, deleteTodo, editTodo, clearCompleted, undoTodo, undoDelete } = useTodos();
  const { theme, toggleTheme } = useTheme();
  const { filter, setFilter } = useFilter();

  return (
    <div
      className="min-h-screen py-6 px-4 flex items-start justify-center transition-colors duration-300"
      style={{ background: "var(--color-bg)" }}
    >
      <div className="w-full max-w-lg mt-8 md:mt-16">
        {/* Header with theme toggle */}
        <div className="flex items-center justify-between mb-6 animate-fade-in-down">
          <h1
            className="text-3xl md:text-4xl font-bold tracking-tight"
            style={{ color: "var(--color-text)" }}
          >
            Todo App
          </h1>
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
            style={{
              background: "var(--color-overlay)",
              color: "var(--color-text-secondary)",
            }}
            aria-label={
              theme === "light" ? "Switch to dark mode" : "Switch to light mode"
            }
          >
            {theme === "light" ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl shadow-lg border overflow-hidden transition-all duration-300 animate-fade-in-up"
          style={{
            background: "var(--color-card)",
            borderColor: "var(--color-card-border)",
            boxShadow: `0 4px 24px var(--color-shadow)`,
          }}
        >
          <div className="p-5 md:p-6">
            {/* Filter tabs */}
            <div
              className="flex gap-1 p-1 rounded-xl mb-5 transition-colors duration-200"
              style={{ background: "var(--color-overlay)" }}
            >
              {filters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className="flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                  style={{
                    background:
                      filter === f.value ? "var(--color-accent)" : "transparent",
                    color:
                      filter === f.value
                        ? "#fff"
                        : "var(--color-text-secondary)",
                    boxShadow:
                      filter === f.value
                        ? "0 1px 3px rgba(0,0,0,0.12)"
                        : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (filter !== f.value)
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "var(--color-accent-light)";
                  }}
                  onMouseLeave={(e) => {
                    if (filter !== f.value)
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "transparent";
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Add todo */}
            <AddTodo onAdd={addTodo} />

            {/* Todo list */}
            <TodoList
              todos={todos}
              filter={filter}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              onEdit={editTodo}
              onClearCompleted={clearCompleted}
            />
          </div>
        </div>

        {/* Footer */}
        <p
          className="text-center text-xs mt-6 animate-fade-in-up"
          style={{ color: "var(--color-text-secondary)", opacity: 0.6 }}
        >
          Double-click a todo to edit &middot; Press Enter to save &middot;
          Escape to cancel
        </p>
      </div>

      {/* Undo toast */}
      {undoTodo && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-toast-in"
        >
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border"
            style={{
              background: "var(--color-toast-bg)",
              color: "var(--color-toast-text)",
              borderColor: "rgba(255,255,255,0.1)",
            }}
          >
            <span className="text-sm">Todo deleted</span>
            <button
              onClick={undoDelete}
              className="text-sm font-semibold px-3 py-1 rounded-lg transition-all duration-200 hover:scale-105"
              style={{
                color: "var(--color-accent)",
                background: "rgba(255,255,255,0.08)",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(255,255,255,0.15)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(255,255,255,0.08)")
              }
            >
              Undo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
