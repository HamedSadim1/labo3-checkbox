import type { FC } from "react";

const AppFooter: FC = () => {
  return (
    <footer
      className="text-center text-xs mt-5 animate-fade-in-up"
      style={{ color: "var(--color-text-secondary)", opacity: 0.6 }}
    >
      Double-click to edit &middot; Drag to reorder &middot; Swipe to delete &middot; Press{" "}
      <kbd className="px-1 rounded" style={{ background: "var(--color-overlay)" }}>
        ?
      </kbd>{" "}
      for shortcuts
    </footer>
  );
};

export default AppFooter;
