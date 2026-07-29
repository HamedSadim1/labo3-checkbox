import { useState, useMemo, useCallback } from "react";
import TodoList from "@/components/TodoList";
import AddTodo from "@/components/AddTodo";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import StatsDashboard from "@/components/StatsDashboard";
import Modal from "@/components/Modal";
import ShortcutsHelp from "@/components/ShortcutsHelp";
import ConfettiEffect from "@/components/Confetti";
import ExportImport from "@/components/ExportImport";
import Header from "@/components/Header";
import HeaderActions from "@/components/HeaderActions";
import FilterTabs from "@/components/FilterTabs";
import Toast from "@/components/Toast";
import AppFooter from "@/components/AppFooter";
import { useTodos } from "@/hooks/useTodos";
import type { TodoData } from "@/types";
import { useTheme } from "@/hooks/useTheme";
import { useFilter, FILTER_OPTIONS } from "@/hooks/useFilter";
import { SHORTCUTS } from "@/constants/shortcuts";
import { PLACEHOLDERS } from "@/constants/app";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { SoundEffects } from "@/hooks/useSoundEffects";
import { useReminders } from "@/hooks/useReminders";

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
      [SHORTCUTS.ADD.key]: () => {
        SoundEffects.shortcut();
        const input = document.querySelector<HTMLInputElement>(`input[placeholder="${PLACEHOLDERS.ADD_TODO}"]`);
        input?.focus();
      },
      [SHORTCUTS.HELP.key]: () => setShowShortcutsHelp((p) => !p),
      [SHORTCUTS.STATS.key]: () => setShowStats((p) => !p),
      [SHORTCUTS.SEARCH.key]: () => {
        const searchInput = document.querySelector<HTMLInputElement>(`input[placeholder="${PLACEHOLDERS.SEARCH}"]`);
        searchInput?.focus();
      },
      [SHORTCUTS.EXPORT.key]: () => setShowExport((p) => !p),
      [SHORTCUTS.ESCAPE.key]: () => {
        setShowStats(false);
        setShowExport(false);
        setShowShortcutsHelp(false);
      },
    },
    true
  );

  // ── Import handler ──
  const handleImport = useCallback(
    (importedData: TodoData) => {
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
      <div className="flex-1 flex items-start justify-center p-4 md:p-6 pt-14 md:pt-6 overflow-y-auto">
        <div className="w-full max-w-xl mt-4 md:mt-8">
          {/* Header */}
          <Header
            title={activeList.name}
            subtitle={`${stats.totalTodos} todos across ${listCount} ${listCount === 1 ? "list" : "lists"}`}
          >
            <HeaderActions
              reminderState={reminderState}
              permission={permission}
              requestPermission={requestPermission}
              soundOn={soundOn}
              onSoundToggle={handleSoundToggle}
              showStats={showStats}
              onToggleStats={() => setShowStats((p) => !p)}
              showShortcutsHelp={showShortcutsHelp}
              onToggleShortcutsHelp={() => setShowShortcutsHelp((p) => !p)}
              onOpenExport={() => setShowExport(true)}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          </Header>

          {/* Stats modal */}
          <Modal
            isOpen={showStats}
            onClose={() => setShowStats(false)}
            title="Statistics"
          >
            <StatsDashboard stats={stats} />
          </Modal>

          {/* Shortcuts modal */}
          <Modal
            isOpen={showShortcutsHelp}
            onClose={() => setShowShortcutsHelp(false)}
            title="Keyboard shortcuts"
          >
            <ShortcutsHelp />
          </Modal>

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
              <FilterTabs
                options={FILTER_OPTIONS}
                value={filter}
                onChange={setFilter}
              />

              {/* Add todo */}
              <AddTodo onAdd={addTodo} />

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
          <AppFooter />
        </div>
      </div>

      {/* Import success toast */}
      <Toast
        isOpen={importSuccess}
        onClose={() => setImportSuccess(false)}
        icon={
          <svg className="w-4 h-4" style={{ color: "var(--color-success)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        }
        message="Data imported successfully!"
        action={
          <button
            onClick={() => setImportSuccess(false)}
            className="text-sm font-semibold px-3 py-1 rounded-lg transition-all duration-200"
            style={{ color: "var(--color-text-secondary)", background: "rgba(255,255,255,0.08)" }}
          >
            Dismiss
          </button>
        }
        className="bottom-20"
      />

      {/* Undo clear completed toast */}
      <Toast
        isOpen={!!undoCompleted}
        onClose={undoClearCompleted}
        icon={
          <svg className="w-4 h-4" style={{ color: "var(--color-accent)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        }
        message={`Cleared ${undoCompleted?.length ?? 0} completed ${undoCompleted?.length === 1 ? "todo" : "todos"}`}
        action={
          <button
            onClick={undoClearCompleted}
            className="text-sm font-semibold px-3 py-1 rounded-lg transition-all duration-200 hover:scale-105"
            style={{ color: "var(--color-accent)", background: "rgba(255,255,255,0.08)" }}
          >
            Undo
          </button>
        }
        className="bottom-20"
      />

      {/* Undo delete toast */}
      <Toast
        isOpen={!!undoTodo}
        onClose={undoDelete}
        message="Todo deleted"
        action={
          <button
            onClick={undoDelete}
            className="text-sm font-semibold px-3 py-1 rounded-lg transition-all duration-200 hover:scale-105"
            style={{ color: "var(--color-accent)", background: "rgba(255,255,255,0.08)" }}
          >
            Undo
          </button>
        }
        className="bottom-6"
        contentClassName="px-4 py-3"
      />

      {/* Confetti */}
      <ConfettiEffect trigger={allCompletedInActiveList} onDone={() => {}} />

      {/* Export/Import modal */}
      <ExportImport
        data={data}
        onImport={handleImport}
        onClose={() => setShowExport(false)}
        isOpen={showExport}
      />
    </div>
  );
}

export default App;
