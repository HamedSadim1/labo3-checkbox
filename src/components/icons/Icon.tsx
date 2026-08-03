import type { SVGProps } from "react";

export type IconName =
  | "bell"
  | "calendar"
  | "chart"
  | "check"
  | "clipboard"
  | "clipboardCheck"
  | "chevronUp"
  | "close"
  | "download"
  | "drag"
  | "edit"
  | "dotsVertical"
  | "help"
  | "inbox"
  | "menu"
  | "moon"
  | "plus"
  | "search"
  | "sun"
  | "trash"
  | "upload"
  | "volume"
  | "volumeOff"
  | "warning";

type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  name: IconName;
};

interface IconDefinition {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  children: React.ReactNode;
}

const ICON_DEFINITIONS: Record<IconName, IconDefinition> = {
  bell: {
    children: (
      <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    ),
  },
  calendar: {
    children: (
      <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    ),
  },
  chart: {
    children: (
      <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    ),
  },
  check: {
    children: <path d="M5 13l4 4L19 7" fill="none" />,
  },
  clipboard: {
    children: (
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5h6" />
    ),
  },
  clipboardCheck: {
    children: (
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5h6m-6 4l2 2 4-4" />
    ),
  },
  chevronUp: {
    children: <path d="M5 15l7-7 7 7" />,
  },
  close: {
    children: <path d="M6 18L18 6M6 6l12 12" />,
  },
  dotsVertical: {
    children: <path d="M12 5v.01M12 12v.01M12 19v.01" />,
  },
  download: {
    children: (
      <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    ),
  },
  drag: {
    fill: "currentColor",
    stroke: "none",
    children: <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />,
  },
  edit: {
    children: (
      <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.5-9.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 8.5-8.5z" />
    ),
  },
  help: {
    children: (
      <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  inbox: {
    children: (
      <path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    ),
  },
  menu: {
    children: <path d="M4 6h16M4 12h16M4 18h16" />,
  },
  moon: {
    children: (
      <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    ),
  },
  plus: {
    children: <path d="M12 4v16m8-8H4" />,
  },
  search: {
    children: <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
  },
  sun: {
    children: (
      <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    ),
  },
  trash: {
    children: (
      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    ),
  },
  upload: {
    children: (
      <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    ),
  },
  volume: {
    children: (
      <path d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    ),
  },
  volumeOff: {
    children: (
      <>
        <path d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        <path d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
      </>
    ),
  },
  warning: {
    children: <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  },
};

export const Icon = ({ name, ...props }: IconProps) => {
  const definition = ICON_DEFINITIONS[name];
  const { fill, stroke, strokeWidth, ...svgProps } = props;

  return (
    <svg
      {...svgProps}
      fill={fill ?? definition.fill ?? "none"}
      stroke={stroke ?? definition.stroke ?? "currentColor"}
      strokeWidth={strokeWidth ?? definition.strokeWidth ?? 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden={svgProps["aria-label"] ? undefined : true}
    >
      {definition.children}
    </svg>
  );
};

interface CompletionRingProps {
  percentage: number;
  className?: string;
}

export const CompletionRing = ({ percentage, className }: CompletionRingProps) => (
  <svg className={className} viewBox="0 0 36 36" aria-hidden="true">
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
      stroke={percentage === 100 ? "var(--color-success)" : "var(--color-accent)"}
      strokeWidth="3"
      strokeDasharray={`${percentage} ${100 - percentage}`}
      strokeLinecap="round"
      className="transition-all duration-1000 ease-out"
    />
  </svg>
);
