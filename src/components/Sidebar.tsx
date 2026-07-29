import { useState, useRef, useEffect } from "react";
import type { TodoListMeta, TodoItem } from "../hooks/useTodos";

interface SidebarProps {
  lists: TodoListMeta[];
  activeListId: string;
  todos: TodoItem[];
  onSetActive: (id: string) => void;
  onAdd: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
}

// ── Standalone sidebar content component ──
interface SidebarContentProps extends SidebarProps {
  onCloseMobile?: () => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({
  lists,
  activeListId,
  todos,
  onSetActive,
  onAdd,
  onRename,
  onDelete,
  onReorder,
  onCloseMobile,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const addInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const draggedRef = useRef<string | null>(null);

  useEffect(() => {
    if (isAdding) addInputRef.current?.focus();
  }, [isAdding]);

  useEffect(() => {
    if (editingId) editInputRef.current?.focus();
  }, [editingId]);

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (trimmed) {
      onAdd(trimmed);
      setNewName("");
      setIsAdding(false);
    }
  };

  const handleRename = () => {
    const trimmed = editName.trim();
    if (trimmed && editingId) {
      onRename(editingId, trimmed);
      setEditingId(null);
    }
  };

  const getListCount = (listId: string) => todos.filter((t) => t.listId === listId).length;
  const getListActiveCount = (listId: string) => todos.filter((t) => t.listId === listId && !t.completed).length;

  const handleDragStart = (id: string) => { draggedRef.current = id; };
  const handleDragOver = (e: React.DragEvent, id: string) => { e.preventDefault(); setDragOverId(id); };
  const handleDragLeave = () => setDragOverId(null);

  const handleDrop = (targetId: string) => {
    const sourceId = draggedRef.current;
    if (!sourceId || sourceId === targetId) return;
    const ids = lists.map((l) => l.id);
    const srcIdx = ids.indexOf(sourceId);
    const tgtIdx = ids.indexOf(targetId);
    ids.splice(srcIdx, 1);
    ids.splice(tgtIdx, 0, sourceId);
    onReorder(ids);
    setDragOverId(null);
    draggedRef.current = null;
  };

  const handleSelect = (listId: string) => {
    onSetActive(listId);
    onCloseMobile?.();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="p-4 border-b flex items-center justify-between"
        style={{ borderColor: "var(--color-card-border)" }}
      >
        <h2 className="text-sm font-bold tracking-tight" style={{ color: "var(--color-text)" }}>
          Lists
        </h2>
        <button
          onClick={() => setIsAdding(true)}
          className="p-1.5 rounded-lg transition-all duration-200 hover:scale-110"
          style={{ color: "var(--color-accent)" }}
          aria-label="Add list"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Add list input */}
      {isAdding && (
        <div className="p-3 border-b animate-fade-in-down" style={{ borderColor: "var(--color-card-border)" }}>
          <input
            ref={addInputRef}
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") { setIsAdding(false); setNewName(""); }
            }}
            onBlur={() => { if (!newName.trim()) { setIsAdding(false); setNewName(""); } }}
            placeholder="List name..."
            className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none"
            style={{ background: "var(--color-input-bg)", color: "var(--color-text)", border: "1px solid var(--color-input-border)" }}
          />
        </div>
      )}

      {/* List items */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {lists.map((list) => {
          const isActive = list.id === activeListId;
          const count = getListCount(list.id);
          const activeCount = getListActiveCount(list.id);
          const isDragOver = dragOverId === list.id;

          return (
            <div
              key={list.id}
              draggable
              onDragStart={() => handleDragStart(list.id)}
              onDragOver={(e) => handleDragOver(e, list.id)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(list.id)}
              onClick={() => handleSelect(list.id)}
              className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${isDragOver ? "scale-[1.02]" : ""}`}
              style={{ background: isActive ? "var(--color-accent-light)" : "transparent" }}
              onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "var(--color-overlay)"; }}
              onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              {/* Color dot */}
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform duration-200"
                style={{ background: list.color, transform: isActive ? "scale(1.3)" : "scale(1)" }}
              />

              {/* Name */}
              <div className="flex-1 min-w-0">
                {editingId === list.id ? (
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename();
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    onBlur={handleRename}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-2 py-0.5 text-sm rounded focus:outline-none"
                    style={{ background: "var(--color-input-bg)", color: "var(--color-text)", border: "1px solid var(--color-accent)" }}
                  />
                ) : (
                  <span
                    className="text-sm font-medium truncate block"
                    style={{ color: isActive ? "var(--color-accent)" : "var(--color-text)" }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setEditingId(list.id);
                      setEditName(list.name);
                    }}
                  >
                    {list.name}
                  </span>
                )}
              </div>

              {/* Count */}
              <span
                className="text-xs font-medium px-1.5 py-0.5 rounded-md flex-shrink-0"
                style={{
                  background: isActive ? "var(--color-accent)" : "var(--color-overlay)",
                  color: isActive ? "#fff" : "var(--color-text-secondary)",
                }}
              >
                {activeCount > 0 ? activeCount : count}
              </span>

              {/* Delete */}
              {lists.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(list.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all duration-200 hover:scale-110"
                  style={{ color: "var(--color-danger)" }}
                  aria-label={`Delete ${list.name}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t" style={{ borderColor: "var(--color-card-border)" }}>
        <p className="text-[10px] text-center" style={{ color: "var(--color-text-secondary)", opacity: 0.5 }}>
          Double-click to rename &middot; Drag to reorder
        </p>
      </div>
    </div>
  );
};

// ── Main sidebar component ──
const Sidebar: React.FC<SidebarProps> = (props) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed top-4 left-4 z-50 p-2 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 md:hidden"
        style={{ background: "var(--color-overlay)", color: "var(--color-text-secondary)" }}
        aria-label={isCollapsed ? "Show sidebar" : "Hide sidebar"}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isCollapsed ? "M4 6h16M4 12h16M4 18h16" : "M6 18L18 6M6 6l12 12"} />
        </svg>
      </button>

      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col w-64 flex-shrink-0 border-r h-full"
        style={{ background: "var(--color-card)", borderColor: "var(--color-card-border)" }}
      >
        <SidebarContent {...props} />
      </aside>

      {/* Mobile sidebar overlay */}
      {!isCollapsed && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setIsCollapsed(true)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <aside
            className="relative w-72 h-full border-r overflow-y-auto animate-slide-in"
            style={{ background: "var(--color-card)", borderColor: "var(--color-card-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent {...props} onCloseMobile={() => setIsCollapsed(true)} />
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
