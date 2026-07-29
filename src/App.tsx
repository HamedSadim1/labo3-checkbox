import { useState, useMemo, useCallback } from "react";
import TodoList from "./components/TodoList";
import AddTodo from "./components/AddTodo";
import Sidebar from "./components/Sidebar";
import SearchBar from "./components/SearchBar";
import StatsDashboard from "./components/StatsDashboard";
import ConfettiEffect from "./components/Confetti";
import ExportImport from "./components/ExportImport";
import { useTodos } from "./hooks/useTodos";
import { useTheme } from "./context/ThemeContext";
import { useFilter, type Filter } from "./context/FilterContext";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { SoundEffects } from "./hooks/useSoundEffects";
import { useReminders } from "./hooks/useReminders";

const filters: { label: string; value: Filter }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
];

function App() {
  const {
    data,
    activeList,
    activeTodos,
    searchQuery,
    setSearchQuery,
    filterFn,
    stats,
    allCompletedInActiveList,
    addList,
    renameList,
    deleteList,
    setActiveList,
    reorderLists,
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
    toggleReminder,
    undoTodo,
    undoDelete,
    undoCompleted,
    undoClearCompleted,
    replaceData,
    importSuccess,
    setImportSuccess,
  } = useTodos();

  const { theme, toggleTheme } = useTheme();
  const { filter, setFilter } = useFilter();

  const [showStats, setShowStats] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [soundOn, setSoundOn] = useState(SoundEffects.getEnabled());

  // ── Reminders ──
  const { reminderState, requestPermission, permission } = useReminders(data.todos);

  // Filtered todos for current list
  const filteredTodos = useMemo(
    () => filterFn(activeTodos, filter),
    [filterFn, activeTodos, filter]
  );

  // ── Keyboard shortcuts ──
  useKeyboardShortcuts(
    {
      n: () => {
        SoundEffects.shortcut();
        const input = document.querySelector<HTMLInputElement>('input[placeholder="What needs to be done?"]');
        input?.focus();
      },
      "?": () => setShowShortcutsHelp((p) => !p),
      s: () => setShowStats((p) => !p),
      "/": () => {
        const searchInput = document.querySelector<HTMLInputElement>('input[placeholder="Search todos..."]');
        searchInput?.focus();
      },
      "ctrl+e": () => setShowExport((p) => !p),
      Escape: () => {
        setShowStats(false);
        setShowExport(false);
        setShowShortcutsHelp(false);
      },
    },
    true
  );

  // ── Import handler ──
  const handleImport = useCallback(
    (importedData: any) => {
      replaceData(importedData);
    },
    [replaceData]
  );

  // ── Sound toggle ──
  const handleSoundToggle = () => {
    const on = SoundEffects.toggle();
    setSoundOn(on);
  };

  const listCount = data.lists.length;

  return (
    <div
      className="min-h-screen flex transition-colors duration-300"
      style={{ background: "var(--color-bg)" }}
    >
      {/* Sidebar */}
      <Sidebar
        lists={data.lists}
        activeListId={data.activeListId}
        todos={data.todos}
        onSetActive={setActiveList}
        onAdd={addList}
        onRename={renameList}
        onDelete={deleteList}
        onReorder={reorderLists}
      />

      {/* Main content */}
      <div className="flex-1 flex items-start justify-center p-4 md:p-6 overflow-y-auto">
        <div className="w-full max-w-xl mt-4 md:mt-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-5 animate-fade-in-down">
            <div>
              <h1
                className="text-2xl md:text-3xl font-bold tracking-tight"
                style={{ color: "var(--color-text)" }}
              >
                {activeList.name}
              </h1>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
                {stats.totalTodos} todos across {listCount} {listCount === 1 ? "list" : "lists"}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1">
              {/* Notification bell badge */}
              <div className="relative">
                <button
                  onClick={() => {
                    if (permission === "default" || permission === "denied") {
                      requestPermission();
                    } else {
                      setShowStats((p) => !p);
                    }
                  }}
                  className="p-2 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                  style={{
                    background: reminderState.hasUrgent ? "var(--color-accent-light)" : "var(--color-overlay)",
                    color: reminderState.hasUrgent ? "var(--color-danger)" : "var(--color-text-secondary)",
                  }}
                  aria-label="Notifications"
                  title={permission === "granted" ? `${reminderState.overdue} overdue, ${reminderState.dueToday} due today` : "Enable notifications"}
                >
                  <svg className="w-4 h-4" fill={reminderState.hasUrgent ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
                {reminderState.hasUrgent && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full text-[9px] font-bold"
                    style={{ background: "var(--color-danger)", color: "#fff" }}
                  >
                    {reminderState.overdue + reminderState.dueToday}
                  </span>
                )}
              </div>

              {/* Sound toggle */}
              <button
                onClick={handleSoundToggle}
                className="p-2 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                style={{ background: "var(--color-overlay)", color: soundOn ? "var(--color-accent)" : "var(--color-text-secondary)" }}
                aria-label={soundOn ? "Mute sounds" : "Enable sounds"}
                title="Toggle sound effects"
              >
                {soundOn ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                )}
              </button>

              {/* Stats toggle */}
              <button
                onClick={() => setShowStats(!showStats)}
                className="p-2 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                style={{ background: showStats ? "var(--color-accent-light)" : "var(--color-overlay)", color: showStats ? "var(--color-accent)" : "var(--color-text-secondary)" }}
                aria-label="Toggle statistics"
                title="Statistics (S)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </button>

              {/* Export/Import */}
              <button
                onClick={() => setShowExport(true)}
                className="p-2 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                style={{ background: "var(--color-overlay)", color: "var(--color-text-secondary)" }}
                aria-label="Export or import data"
                title="Export/Import (Ctrl+E)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>

              {/* Help */}
              <button
                onClick={() => setShowShortcutsHelp(!showShortcutsHelp)}
                className="p-2 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                style={{ background: showShortcutsHelp ? "var(--color-accent-light)" : "var(--color-overlay)", color: showShortcutsHelp ? "var(--color-accent)" : "var(--color-text-secondary)" }}
                aria-label="Keyboard shortcuts help"
                title="Keyboard shortcuts (?)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                style={{ background: "var(--color-overlay)", color: "var(--color-text-secondary)" }}
                aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
              >
                {theme === "light" ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Shortcuts help panel */}
          {showShortcutsHelp && (
            <div
              className="mb-4 p-4 rounded-xl border animate-fade-in-down"
              style={{ background: "var(--color-card)", borderColor: "var(--color-card-border)", boxShadow: "0 4px 24px var(--color-shadow)" }}
            >
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "N", desc: "Focus add todo" },
                  { key: "S", desc: "Toggle stats" },
                  { key: "/", desc: "Focus search" },
                  { key: "?", desc: "Toggle this help" },
                  { key: "Ctrl+E", desc: "Export/Import" },
                  { key: "Escape", desc: "Close panels" },
                ].map((shortcut) => (
                  <div key={shortcut.key} className="flex items-center gap-2">
                    <kbd
                      className="px-1.5 py-0.5 text-[10px] font-medium rounded"
                      style={{ background: "var(--color-overlay)", color: "var(--color-text-secondary)", border: "1px solid var(--color-input-border)" }}
                    >
                      {shortcut.key}
                    </kbd>
                    <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                      {shortcut.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats panel */}
          {showStats && (
            <div
              className="mb-4 p-4 rounded-xl border animate-fade-in-up"
              style={{ background: "var(--color-card)", borderColor: "var(--color-card-border)", boxShadow: "0 4px 24px var(--color-shadow)" }}
            >
              <StatsDashboard stats={stats} />
            </div>
          )}

          {/* Card */}
          <div
            className="rounded-2xl shadow-lg border overflow-hidden transition-all duration-300 animate-fade-in-up"
            style={{
              background: "var(--color-card)",
              borderColor: "var(--color-card-border)",
              boxShadow: "0 4px 24px var(--color-shadow)",
            }}
          >
            <div className="p-5 md:p-6">
              {/* Search bar */}
              <div className="mb-4">
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
              </div>

              {/* Filter tabs */}
              <div
                className="flex gap-1 p-1 rounded-xl mb-4 transition-colors duration-200"
                style={{ background: "var(--color-overlay)" }}
              >
                {filters.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value)}
                    className="flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                    style={{
                      background: filter === f.value ? "var(--color-accent)" : "transparent",
                      color: filter === f.value ? "#fff" : "var(--color-text-secondary)",
                      boxShadow: filter === f.value ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
                    }}
                    onMouseEnter={(e) => {
                      if (filter !== f.value) (e.currentTarget as HTMLButtonElement).style.background = "var(--color-accent-light)";
                    }}
                    onMouseLeave={(e) => {
                      if (filter !== f.value) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Add todo */}
              <AddTodo
                onAdd={addTodo}
              />

              {/* Todo list */}
              <TodoList
                todos={activeTodos}
                filteredTodos={filteredTodos}
                filter={filter}
                lists={data.lists}
                activeListId={data.activeListId}
                searchQuery={searchQuery}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onEdit={editTodo}
                onUpdatePriority={updateTodoPriority}
                onUpdateDueDate={updateTodoDueDate}
                onMoveToList={moveTodo}
                onDuplicate={duplicateTodo}
                onToggleReminder={toggleReminder}
                onReorder={reorderTodos}
                onClearCompleted={clearCompleted}
              />
            </div>
          </div>

          {/* Footer */}
          <p
            className="text-center text-xs mt-5 animate-fade-in-up"
            style={{ color: "var(--color-text-secondary)", opacity: 0.6 }}
          >
            Double-click to edit &middot; Drag to reorder &middot; Swipe to delete &middot; Press <kbd className="px-1 rounded" style={{ background: "var(--color-overlay)" }}>?</kbd> for shortcuts
          </p>
        </div>
      </div>

      {/* Import success toast */}
      {importSuccess && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-toast-in">
          <div
            className="flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl border"
            style={{
              background: "var(--color-toast-bg)",
              color: "var(--color-toast-text)",
              borderColor: "rgba(255,255,255,0.1)",
            }}
          >
            <svg className="w-4 h-4" style={{ color: "var(--color-success)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm">Data imported successfully!</span>
            <button
              onClick={() => setImportSuccess(false)}
              className="text-sm font-semibold px-3 py-1 rounded-lg transition-all duration-200"
              style={{ color: "var(--color-text-secondary)", background: "rgba(255,255,255,0.08)" }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Undo clear completed toast */}
      {undoCompleted && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-toast-in">
          <div
            className="flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl border"
            style={{ background: "var(--color-toast-bg)", color: "var(--color-toast-text)", borderColor: "rgba(255,255,255,0.1)" }}
          >
            <svg className="w-4 h-4" style={{ color: "var(--color-accent)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="text-sm">
              Cleared {undoCompleted.length} completed {undoCompleted.length === 1 ? "todo" : "todos"}
            </span>
            <button
              onClick={undoClearCompleted}
              className="text-sm font-semibold px-3 py-1 rounded-lg transition-all duration-200 hover:scale-105"
              style={{ color: "var(--color-accent)", background: "rgba(255,255,255,0.08)" }}
            >
              Undo
            </button>
          </div>
        </div>
      )}

      {/* Undo delete toast */}
      {undoTodo && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-toast-in">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border"
            style={{ background: "var(--color-toast-bg)", color: "var(--color-toast-text)", borderColor: "rgba(255,255,255,0.1)" }}
          >
            <span className="text-sm">Todo deleted</span>
            <button
              onClick={undoDelete}
              className="text-sm font-semibold px-3 py-1 rounded-lg transition-all duration-200 hover:scale-105"
              style={{ color: "var(--color-accent)", background: "rgba(255,255,255,0.08)" }}
            >
              Undo
            </button>
          </div>
        </div>
      )}

      {/* Confetti */}
      <ConfettiEffect trigger={allCompletedInActiveList} onDone={() => {}} />

      {/* Export/Import modal */}
      {showExport && (
        <ExportImport
          data={data}
          onImport={handleImport}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
}

export default App;
