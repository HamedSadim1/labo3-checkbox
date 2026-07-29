import { useState, useRef, useEffect } from "react";

const MAX_CHARS = 200;

interface AddTodoProps {
  onAdd: (text: string) => void;
}

const AddTodo: React.FC<AddTodoProps> = ({ onAdd }) => {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const charCount = text.length;
  const isOverLimit = charCount > MAX_CHARS;
  const isValid = text.trim().length > 0 && !isOverLimit;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onAdd(text.trim());
      setText("");
      inputRef.current?.focus();
    }
  };

  const counterColor =
    charCount === 0
      ? "text-white/40 dark:text-white/30"
      : isOverLimit
        ? "text-red-400 dark:text-red-400"
        : charCount > MAX_CHARS * 0.8
          ? "text-amber-300 dark:text-amber-400"
          : "text-white/50 dark:text-white/40";

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="relative">
        <div
          className="flex gap-2 p-1.5 rounded-xl border-2 transition-all duration-200"
          style={{
            borderColor: isOverLimit
              ? "var(--color-danger)"
              : "var(--color-input-border)",
            background: "var(--color-input-bg)",
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What needs to be done?"
            maxLength={MAX_CHARS}
            className="flex-1 px-4 py-2.5 bg-transparent rounded-lg focus:outline-none text-[var(--color-text)] placeholder-[var(--color-text-secondary)]"
            style={{ color: "var(--color-text)" }}
          />
          <button
            type="submit"
            disabled={!isValid}
            className="px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: isValid ? "var(--color-accent)" : "var(--color-input-border)",
              color: "#fff",
            }}
            onMouseEnter={(e) => {
              if (isValid)
                (e.currentTarget as HTMLButtonElement).style.background =
                  "var(--color-accent-hover)";
            }}
            onMouseLeave={(e) => {
              if (isValid)
                (e.currentTarget as HTMLButtonElement).style.background =
                  "var(--color-accent)";
            }}
          >
            Add
          </button>
        </div>

        {/* Character counter */}
        {charCount > 0 && (
          <div
            className={`absolute -bottom-5 right-1 text-xs font-medium ${counterColor} animate-fade-in-up`}
          >
            {charCount}/{MAX_CHARS}
          </div>
        )}
      </div>
    </form>
  );
};

export default AddTodo;
