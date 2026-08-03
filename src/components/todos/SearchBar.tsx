import { useState, useRef, useEffect } from "react";

import { PLACEHOLDERS } from "@/constants/app";
import { Icon } from "@/components/icons/Icon";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = PLACEHOLDERS.SEARCH,
}) => {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Ctrl+F or / to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        (e.key === "/" || (e.key === "f" && (e.ctrlKey || e.metaKey))) &&
        document.activeElement !== inputRef.current
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div
      className="relative flex items-center rounded-xl border-2 transition-all duration-200"
      style={{
        borderColor: focused ? "var(--color-accent)" : "var(--color-input-border)",
        background: "var(--color-input-bg)",
      }}
    >
      {/* Search icon */}
      <Icon
        name="search"
        className="w-5 h-5 ml-3 shrink-0"
        style={{
          color: value || focused ? "var(--color-accent)" : "var(--color-text-secondary)",
        }}
      />

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="flex-1 min-w-0 pl-3 pr-2 py-2.5 bg-transparent text-sm focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0"
        style={{ color: "var(--color-text)", outline: "none" }}
      />

      {/* Shortcut hint */}
      {!value && !focused && (
        <kbd
          className="mr-3 px-1.5 py-0.5 text-[10px] font-medium rounded hidden sm:block"
          style={{
            color: "var(--color-text-secondary)",
            background: "var(--color-overlay)",
            border: "1px solid var(--color-input-border)",
          }}
        >
          /
        </kbd>
      )}

      {/* Clear button */}
      {value && (
        <button
          onClick={() => onChange("")}
          className="mr-2 p-1 rounded-lg ui-hover-scale"
          style={{ color: "var(--color-text-secondary)" }}
          aria-label="Clear search"
        >
          <Icon name="close" className="w-3.5 h-3.5" />
        </button>
      )}

    </div>
  );
};

export default SearchBar;
