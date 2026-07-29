interface FilterTabsProps<T extends string> {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}

function FilterTabs<T extends string>({ options, value, onChange }: FilterTabsProps<T>) {
  return (
    <div
      className="flex gap-1 p-1 rounded-xl mb-4 transition-colors duration-200"
      style={{ background: "var(--color-overlay)" }}
    >
      {options.map((tab) => {
        const isActive = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            aria-pressed={isActive}
            className="flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 bg-transparent hover:bg-[var(--color-accent-light)]"
            style={
              isActive
                ? {
                    background: "var(--color-accent)",
                    color: "#fff",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                  }
                : { color: "var(--color-text-secondary)" }
            }
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default FilterTabs;
