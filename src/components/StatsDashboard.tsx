import { useMemo } from "react";
import type { Stats } from "@/hooks/useTodos";
import { priorityConfig } from "@/constants/priorities";

interface StatsDashboardProps {
  stats: Stats;
}

interface CardDef {
  label: string;
  value: number;
  icon: React.ReactNode | null;
  color: string;
  urgent?: boolean;
  suffix?: string;
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats }) => {
  const cards = useMemo(
    () => [
      {
        label: "Total",
        value: stats.totalTodos,
        icon: (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5h6"
            />
          </svg>
        ),
        color: "var(--color-accent)",
      },
      {
        label: "Active",
        value: stats.activeTodos,
        icon: (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        ),
        color: "var(--color-text)",
      },
      {
        label: "Completed",
        value: stats.completedTodos,
        icon: (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
        color: "var(--color-success)",
      },
      {
        label: "Overdue",
        value: stats.overdueTodos,
        icon: (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
        color: "var(--color-danger)",
        urgent: stats.overdueTodos > 0,
      },
      {
        label: "Due Today",
        value: stats.dueTodayTodos,
        icon: (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        ),
        color: "var(--color-accent)",
      },
      {
        label: "🔥 Streak",
        value: stats.streakDays,
        icon: null,
        color: stats.streakDays > 0 ? priorityConfig.medium.color : "var(--color-text-secondary)",
        suffix: stats.streakDays === 1 ? "day" : "days",
      } satisfies CardDef,
      {
        label: "⚠ High Priority",
        value: stats.highPriorityActive,
        icon: null,
        color:
          stats.highPriorityActive > 0
            ? priorityConfig.high.color
            : "var(--color-text-secondary)",
      } satisfies CardDef,
    ],
    [stats],
  ) satisfies CardDef[];

  return (
    <div className="animate-fade-in-up">
      {/* Completion ring */}
      <div className="flex items-center justify-center mb-4">
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="var(--color-overlay)"
              strokeWidth="3"
            />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke={
                stats.completionRate === 100
                  ? "var(--color-success)"
                  : "var(--color-accent)"
              }
              strokeWidth="3"
              strokeDasharray={`${stats.completionRate} ${100 - stats.completionRate}`}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-lg font-bold"
              style={{ color: "var(--color-text)" }}
            >
              {stats.completionRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        {cards.map((card) => (
          <div
            key={card.label}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: "var(--color-overlay)",
              border: "1px solid var(--color-input-border)",
            }}
          >
            {card.icon && (
              <div className="shrink-0" style={{ color: card.color }}>
                {card.icon}
              </div>
            )}
            {!card.icon && (
              <span className="text-base shrink-0">
                {card.label.startsWith("🔥") ? "🔥" : "⚠"}
              </span>
            )}
            <div className="min-w-0">
              <p
                className="text-xs font-medium truncate"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {card.label.replace("🔥 ", "").replace("⚠ ", "")}
              </p>{" "}
              <p
                className="text-sm font-bold"
                style={{
                  color: card.urgent ? card.color : "var(--color-text)",
                }}
              >
                {card.value}
                {"suffix" in card && card.suffix ? ` ${card.suffix}` : ""}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsDashboard;
