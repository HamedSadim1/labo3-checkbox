import type { FC } from "react";
import { SHORTCUTS } from "@/constants/shortcuts";

const ShortcutsHelp: FC = () => {
  return (
    <div className="grid grid-cols-2 gap-2">
      {Object.values(SHORTCUTS).map((shortcut) => (
        <div key={shortcut.key} className="flex items-center gap-2">
          <kbd
            className="px-1.5 py-0.5 text-[10px] font-medium rounded"
            style={{
              background: "var(--color-overlay)",
              color: "var(--color-text-secondary)",
              border: "1px solid var(--color-input-border)",
            }}
          >
            {shortcut.label}
          </kbd>
          <span
            className="text-xs"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {shortcut.description}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ShortcutsHelp;
