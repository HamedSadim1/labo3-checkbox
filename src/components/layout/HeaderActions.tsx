import type { FC } from "react";
import type { Theme } from "@/context/ThemeContext";
import IconButton from "@/components/ui/IconButton";
import { Icon } from "@/components/icons/Icon";

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
          <Icon name="bell" className="w-4 h-4" fill={reminderState.hasUrgent ? "currentColor" : "none"} />
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
          <Icon name="volume" className="w-4 h-4" />
        ) : (
          <Icon name="volumeOff" className="w-4 h-4" />
        )}
      </IconButton>

      {/* Stats toggle */}
      <IconButton
        onClick={onToggleStats}
        isActive={showStats}
        aria-label="Toggle statistics"
        title="Statistics (S)"
      >
        <Icon name="chart" className="w-4 h-4" />
      </IconButton>

      {/* Export/Import */}
      <IconButton
        onClick={onOpenExport}
        aria-label="Export or import data"
        title="Export/Import (Ctrl+E)"
      >
        <Icon name="download" className="w-4 h-4" />
      </IconButton>

      {/* Help */}
      <IconButton
        onClick={onToggleShortcutsHelp}
        isActive={showShortcutsHelp}
        aria-label="Keyboard shortcuts help"
        title="Keyboard shortcuts (?)"
      >
        <Icon name="help" className="w-4 h-4" />
      </IconButton>

      {/* Theme toggle */}
      <IconButton
        onClick={onToggleTheme}
        aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      >
        {theme === "light" ? (
          <Icon name="moon" className="w-4 h-4" />
        ) : (
          <Icon name="sun" className="w-4 h-4" />
        )}
      </IconButton>
    </>
  );
};

export default HeaderActions;
