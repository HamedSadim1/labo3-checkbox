/* ─── Storage keys ─── */
export const STORAGE_KEYS = {
  TODOS: "labo3-todos-v2",
  NOTIFIED: "labo3-notified-todos",
  THEME: "theme",
} as const;

/* ─── Timing / Duration (milliseconds) ─── */
export const TIMING = {
  /** How long the undo toast is shown after deleting a todo */
  UNDO_DELETE_MS: 4000,
  /** How long the undo toast is shown after clearing completed */
  UNDO_CLEAR_MS: 4000,
  /** How long the import-success toast is shown */
  IMPORT_SUCCESS_MS: 3000,
  /** How long the "Copied!" feedback is shown */
  COPIED_FEEDBACK_MS: 2000,
  /** Confetti animation duration */
  CONFETTI_DURATION_MS: 2000,
  /** Delay before the item is actually removed after pressing delete */
  DELETE_ANIMATION_MS: 280,
  /** Fallback timeout before unmounting the modal during exit animation */
  MODAL_CLOSE_FALLBACK_MS: 350,
  /** Delay before the first reminder check on mount */
  REMINDERS_INITIAL_DELAY_MS: 1500,
  /** Interval between reminder checks */
  REMINDERS_CHECK_INTERVAL_MS: 60000,
  /** Milliseconds per day (for date arithmetic) */
  MS_PER_DAY: 86400000,
  /** Show due date in short format if <= this many days away */
  DUE_DATE_SHORT_DAYS: 7,
} as const;

/* ─── Swipe / touch thresholds (pixels) ─── */
export const SWIPE = {
  /** Minimum offset before triggering delete on touchend */
  DELETE_THRESHOLD: -50,
  /** Maximum swipe offset (clamp) */
  MAX_OFFSET: -80,
  /** Offset at which the "Delete" label appears */
  LABEL_SHOW: -20,
} as const;

/* ─── Max character limits ─── */
export const LIMITS = {
  /** Maximum characters for a todo text */
  TODO_TEXT: 200,
} as const;

/* ─── Placeholder strings ─── */
export const PLACEHOLDERS = {
  /** Main add-todo input */
  ADD_TODO: "What needs to be done?",
  /** Search input */
  SEARCH: "Search todos...",
  /** Import textarea hint */
  IMPORT_JSON: "...or paste JSON here",
  /** Add-list input */
  LIST_NAME: "List name...",
} as const;

/* ─── Notification icon path ─── */
export const NOTIFICATION_ICON_PATH = "/favicon.png";

/* ─── Confetti configuration ─── */
export const CONFETTI = {
  PARTICLE_COUNT_PER_FRAME: 3,
  BURST_PARTICLE_COUNT: 100,
  SPREAD: 55,
  BURST_SPREAD: 70,
  ORIGIN_Y: 0.6,
  COLORS: ["#6366f1", "#ec4899", "#22c55e", "#f59e0b", "#3b82f6"] as const,
  LEFT_ANGLE: 60,
  RIGHT_ANGLE: 120,
} as const;
