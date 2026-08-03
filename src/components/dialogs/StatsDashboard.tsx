import { useMemo } from "react";
import type { Stats } from "@/types";
import { priorityConfig } from "@/constants/priorities";
import { CompletionRing, Icon } from "@/components/icons/Icon";

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
          <Icon name="clipboard" className="w-4 h-4" />
        ),
        color: "var(--color-accent)",
      },
      {
        label: "Active",
        value: stats.activeTodos,
        icon: (
          <Icon name="inbox" className="w-4 h-4" />
        ),
        color: "var(--color-text)",
      },
      {
        label: "Completed",
        value: stats.completedTodos,
        icon: (
          <Icon name="check" className="w-4 h-4" />
        ),
        color: "var(--color-success)",
      },
      {
        label: "Overdue",
        value: stats.overdueTodos,
        icon: (
          <Icon name="warning" className="w-4 h-4" />
        ),
        color: "var(--color-danger)",
        urgent: stats.overdueTodos > 0,
      },
      {
        label: "Due Today",
        value: stats.dueTodayTodos,
        icon: (
          <Icon name="calendar" className="w-4 h-4" />
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
          <CompletionRing
            percentage={stats.completionRate}
            className="w-20 h-20 -rotate-90"
          />
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
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl ui-hover-scale-sm"
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
