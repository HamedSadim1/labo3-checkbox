import { useState, useMemo, useCallback } from "react";
import TodoList from "@/components/todos/TodoList";
import AddTodo from "@/components/todos/AddTodo";
import Sidebar from "@/components/layout/Sidebar";
import SearchBar from "@/components/todos/SearchBar";
import StatsDashboard from "@/components/dialogs/StatsDashboard";
import Modal from "@/components/ui/Modal";
import ShortcutsHelp from "@/components/dialogs/ShortcutsHelp";
import ConfettiEffect from "@/components/ui/Confetti";
import ExportImport from "@/components/dialogs/ExportImport";
import Header from "@/components/layout/Header";
import HeaderActions from "@/components/layout/HeaderActions";
import FilterTabs from "@/components/todos/FilterTabs";
import Toast from "@/components/ui/Toast";
import ToastAction from "@/components/ui/ToastAction";
import AppFooter from "@/components/layout/AppFooter";
import { useTodos } from "@/hooks/useTodos";
import type { TodoData } from "@/types";
import { useTheme } from "@/hooks/useTheme";
import { useFilter, FILTER_OPTIONS } from "@/hooks/useFilter";
import { SHORTCUTS } from "@/constants/shortcuts";
import { PLACEHOLDERS } from "@/constants/app";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { SoundEffects } from "@/hooks/useSoundEffects";
import { useReminders } from "@/hooks/useReminders";
import { Icon } from "@/components/icons/Icon";

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
          <Icon name="check" className="w-4 h-4" style={{ color: "var(--color-success)" }} />
        }
        message="Data imported successfully!"
        action={
          <ToastAction
            tone="muted"
            hoverScale={false}
            onClick={() => setImportSuccess(false)}
          >
            Dismiss
          </ToastAction>
        }
        className="bottom-20"
      />

      {/* Undo clear completed toast */}
      <Toast
        isOpen={!!undoCompleted}
        onClose={undoClearCompleted}
        icon={
          <Icon name="trash" className="w-4 h-4" style={{ color: "var(--color-accent)" }} />
        }
        message={`Cleared ${undoCompleted?.length ?? 0} completed ${undoCompleted?.length === 1 ? "todo" : "todos"}`}
        action={
          <ToastAction onClick={undoClearCompleted}>Undo</ToastAction>
        }
        className="bottom-20"
      />

      {/* Undo delete toast */}
      <Toast
        isOpen={!!undoTodo}
        onClose={undoDelete}
        message="Todo deleted"
        action={
          <ToastAction onClick={undoDelete}>Undo</ToastAction>
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
