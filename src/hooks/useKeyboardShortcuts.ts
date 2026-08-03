import { useEffect, useCallback } from "react";

interface ShortcutMap {
  [key: string]: () => void;
}

export const useKeyboardShortcuts = (
  shortcuts: ShortcutMap,
  enabled: boolean = true
) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        // Allow Escape even in inputs
        if (e.key !== "Escape") return;
      }

      const key = e.key.toLowerCase();

      // Check for modifiers
      if (e.ctrlKey || e.metaKey) {
        const combo = `ctrl+${key}`;
        if (shortcuts[combo]) {
          e.preventDefault();
          shortcuts[combo]();
        }
        return;
      }

      if (shortcuts[key]) {
        e.preventDefault();
        shortcuts[key]();
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, enabled]);
};
