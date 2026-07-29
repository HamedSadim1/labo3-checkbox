import type { FC } from "react";
import type { Theme } from "@/context/ThemeContext";
import IconButton from "@/components/IconButton";

interface ReminderState {
  hasUrgent: boolean;
  overdue: number;
  dueToday: number;
}

interface HeaderActionsProps {
  reminderState: ReminderState;
  permission: NotificationPermission;
  requestPermission: () => void;
  soundOn: boolean;
  onSoundToggle: () => void;
  showStats: boolean;
  onToggleStats: () => void;
  showShortcutsHelp: boolean;
  onToggleShortcutsHelp: () => void;
  onOpenExport: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

const HeaderActions: FC<HeaderActionsProps> = ({
  reminderState,
  permission,
  requestPermission,
  soundOn,
  onSoundToggle,
  showStats,
  onToggleStats,
  showShortcutsHelp,
  onToggleShortcutsHelp,
  onOpenExport,
  theme,
  onToggleTheme,
}) => {
  const handleNotificationClick = () => {
    if (permission === "default" || permission === "denied") {
      requestPermission();
    } else {
      onToggleStats();
    }
  };

  return (
    <>
      {/* Notification bell badge */}
      <div className="relative">
        <IconButton
          onClick={handleNotificationClick}
          style={{
            background: reminderState.hasUrgent ? "var(--color-accent-light)" : "var(--color-overlay)",
            color: reminderState.hasUrgent ? "var(--color-danger)" : "var(--color-text-secondary)",
          }}
          aria-label="Notifications"
          title={permission === "granted" ? `${reminderState.overdue} overdue, ${reminderState.dueToday} due today` : "Enable notifications"}
        >
          <svg className="w-4 h-4" fill={reminderState.hasUrgent ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </IconButton>
        {reminderState.hasUrgent && (
          <span
            className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full text-[9px] font-bold"
            style={{ background: "var(--color-danger)", color: "#fff" }}
          >
            {reminderState.overdue + reminderState.dueToday}
          </span>
        )}
      </div>

      {/* Sound toggle */}
      <IconButton
        onClick={onSoundToggle}
        style={{
          background: "var(--color-overlay)",
          color: soundOn ? "var(--color-accent)" : "var(--color-text-secondary)",
        }}
        aria-label={soundOn ? "Mute sounds" : "Enable sounds"}
        title="Toggle sound effects"
      >
        {soundOn ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        )}
      </IconButton>

      {/* Stats toggle */}
      <IconButton
        onClick={onToggleStats}
        isActive={showStats}
        aria-label="Toggle statistics"
        title="Statistics (S)"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </IconButton>

      {/* Export/Import */}
      <IconButton
        onClick={onOpenExport}
        aria-label="Export or import data"
        title="Export/Import (Ctrl+E)"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </IconButton>

      {/* Help */}
      <IconButton
        onClick={onToggleShortcutsHelp}
        isActive={showShortcutsHelp}
        aria-label="Keyboard shortcuts help"
        title="Keyboard shortcuts (?)"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </IconButton>

      {/* Theme toggle */}
      <IconButton
        onClick={onToggleTheme}
        aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      >
        {theme === "light" ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}
      </IconButton>
    </>
  );
};

export default HeaderActions;
