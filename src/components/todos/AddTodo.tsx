import { useState, useRef, useEffect } from "react";
import type { Priority } from "@/types";
import { LIMITS, PLACEHOLDERS } from "@/constants/app";
import { SoundEffects } from "@/hooks/useSoundEffects";
import { PRIORITY_OPTIONS } from "@/constants/priorities";
import { cn } from "@/utils/cn";
import { Icon } from "@/components/icons/Icon";

interface AddTodoProps {
  onAdd: (text: string, priority: Priority, dueDate: string | null) => void;
}

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
  const isOverLimit = charCount > LIMITS.TODO_TEXT;
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
        : charCount > LIMITS.TODO_TEXT * 0.8
          ? "text-amber-300"
          : "text-white/50 dark:text-white/40";

  const selectedPriority = PRIORITY_OPTIONS.find((p) => p.value === priority)!;

  return (
    <form onSubmit={handleSubmit} className="mb-5">
      {/* Input row */}
      <div
        className="flex flex-wrap md:flex-nowrap gap-2 p-1.5 rounded-xl border-2 transition-all duration-200"
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
          placeholder={PLACEHOLDERS.ADD_TODO}
          maxLength={LIMITS.TODO_TEXT}
          className="flex-1 px-4 py-2.5 bg-transparent rounded-lg focus:outline-none text-sm"
          style={{ color: "var(--color-text)" }}
        />

        {/* Priority quick button */}
        <button
          type="button"
          onClick={() => setShowPriority(!showPriority)}
          className="px-2 py-2 rounded-lg text-xs font-medium ui-hover-scale-sm"
          style={{
            background: showPriority ? "var(--color-accent-light)" : "var(--color-overlay)",
            color: selectedPriority.color,
          }}
          title={`Priority: ${selectedPriority.label}`}
        >
          <Icon name="chevronUp" className="w-4 h-4" />
        </button>

        {/* Date quick button */}
        <button
          type="button"
          onClick={() => setShowDate(!showDate)}
          className="px-2 py-2 rounded-lg ui-hover-scale-sm"
          style={{
            background: showDate ? "var(--color-accent-light)" : "var(--color-overlay)",
            color: dueDate ? "var(--color-accent)" : "var(--color-text-secondary)",
          }}
          title="Set due date"
        >
          <Icon name="calendar" className="w-4 h-4" />
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
            {PRIORITY_OPTIONS.map((p) => (
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
                className="ml-1 px-2 py-1.5 rounded-lg text-xs ui-transition"
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
        <div className={cn("text-xs font-medium animate-fade-in-up", counterColor)} style={{ marginTop: "4px", textAlign: "right" }}>
          {charCount}/{LIMITS.TODO_TEXT}
        </div>
      )}
    </form>
  );
};

export default AddTodo;
