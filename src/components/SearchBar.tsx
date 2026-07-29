import { useState, useRef, useEffect } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search todos...",
}) => {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Ctrl+F or / to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === "/" || (e.key === "f" && (e.ctrlKey || e.metaKey))) && document.activeElement !== inputRef.current) {
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
      <svg
        className="w-4 h-4 ml-3 flex-shrink-0"
        style={{ color: value ? "var(--color-accent)" : "var(--color-text-secondary)" }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="flex-1 px-2 py-2 bg-transparent text-sm focus:outline-none"
        style={{ color: "var(--color-text)" }}
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
          className="mr-2 p-1 rounded-lg transition-all duration-200 hover:scale-110"
          style={{ color: "var(--color-text-secondary)" }}
          aria-label="Clear search"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Animated focus indicator */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300"
        style={{
          opacity: focused ? 1 : 0,
          boxShadow: `0 0 0 3px var(--color-accent-light)`,
        }}
      />
    </div>
  );
};

export default SearchBar;
