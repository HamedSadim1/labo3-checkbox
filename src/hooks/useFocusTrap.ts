import { useCallback } from "react";

/**
 * Keeps keyboard focus inside the provided container while `isActive` is true.
 * Returns a keydown handler to attach to the container.
 */
export const useFocusTrap = (
  containerRef: React.RefObject<HTMLElement | null>,
  isActive: boolean
) => {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isActive || e.key !== "Tab" || !containerRef.current) return;

      const focusable = Array.from(
        containerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true");

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [isActive, containerRef]
  );

  return handleKeyDown;
};
