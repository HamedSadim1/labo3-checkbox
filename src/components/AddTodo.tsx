import { useState, useRef, useEffect } from "react";
import type { Priority } from "../hooks/useTodos";
import { SoundEffects } from "../hooks/useSoundEffects";

const MAX_CHARS = 200;

interface AddTodoProps {
  onAdd: (text: string, priority: Priority, dueDate: string | null) => void;
}

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "#22c55e" },
  { value: "medium", label: "Med", color: "#f59e0b" },
  { value: "high", label: "High", color: "#ef4444" },
];

const AddTodo: React.FC<AddTodoProps> = ({ onAdd }) => {
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [showPriority, setShowPriority] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const charCount = text.length;
  const isOverLimit = charCount > MAX_CHARS;
  const isValid = text.trim().length > 0 && !isOverLimit;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onAdd(text.trim(), priority, dueDate || null);
      SoundEffects.add();
      setText("");
      setPriority("medium");
      setDueDate("");
      setShowPriority(false);
      setShowDate(false);
      inputRef.current?.focus();
    }
  };

  const counterColor =
    charCount === 0
      ? "text-white/40 dark:text-white/30"
      : isOverLimit
        ? "text-red-400"
        : charCount > MAX_CHARS * 0.8
          ? "text-amber-300"
          : "text-white/50 dark:text-white/40";

  const selectedPriority = priorities.find((p) => p.value === priority)!;

  return (
    <form onSubmit={handleSubmit} className="mb-5">
      {/* Input row */}
      <div
        className="flex gap-2 p-1.5 rounded-xl border-2 transition-all duration-200"
        style={{
          borderColor: isOverLimit
            ? "var(--color-danger)"
            : showPriority || showDate
              ? "var(--color-accent)"
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
          className="flex-1 px-4 py-2.5 bg-transparent rounded-lg focus:outline-none text-sm"
          style={{ color: "var(--color-text)" }}
        />

        {/* Priority quick button */}
        <button
          type="button"
          onClick={() => setShowPriority(!showPriority)}
          className="px-2 py-2 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105"
          style={{
            background: showPriority ? "var(--color-accent-light)" : "var(--color-overlay)",
            color: selectedPriority.color,
          }}
          title={`Priority: ${selectedPriority.label}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>

        {/* Date quick button */}
        <button
          type="button"
          onClick={() => setShowDate(!showDate)}
          className="px-2 py-2 rounded-lg transition-all duration-200 hover:scale-105"
          style={{
            background: showDate ? "var(--color-accent-light)" : "var(--color-overlay)",
            color: dueDate ? "var(--color-accent)" : "var(--color-text-secondary)",
          }}
          title="Set due date"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>

        {/* Submit button */}
        <button
          type="submit"
          disabled={!isValid}
          className="px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95"
          style={{
            background: isValid ? "var(--color-accent)" : "var(--color-input-border)",
            color: "#fff",
          }}
        >
          Add
        </button>
      </div>

      {/* Expanded options */}
      <div className="flex gap-2 mt-2 overflow-hidden transition-all duration-200" style={{ maxHeight: showPriority || showDate ? "60px" : "0", opacity: showPriority || showDate ? 1 : 0 }}>
        {/* Priority selector */}
        {showPriority && (
          <div className="flex gap-1 p-1 rounded-lg animate-fade-in-down" style={{ background: "var(--color-overlay)" }}>
            {priorities.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => { setPriority(p.value); setShowPriority(false); }}
                className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200"
                style={{
                  background: priority === p.value ? p.color + "22" : "transparent",
                  color: priority === p.value ? p.color : "var(--color-text-secondary)",
                  border: priority === p.value ? `1px solid ${p.color}44` : "1px solid transparent",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {/* Date picker */}
        {showDate && (
          <div className="animate-fade-in-down">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => { setDueDate(e.target.value); }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium focus:outline-none cursor-pointer"
              style={{
                background: "var(--color-overlay)",
                color: "var(--color-text)",
                border: "1px solid var(--color-input-border)",
              }}
            />
            {dueDate && (
              <button
                type="button"
                onClick={() => setDueDate("")}
                className="ml-1 px-2 py-1.5 rounded-lg text-xs transition-all duration-200"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Character counter */}
      {charCount > 0 && (
        <div className={`absolute -bottom-5 right-1 text-xs font-medium ${counterColor} animate-fade-in-up`} style={{ position: "relative", marginTop: "4px" }}>
          {charCount}/{MAX_CHARS}
        </div>
      )}
    </form>
  );
};

export default AddTodo;
