import type { FC, ReactNode, CSSProperties } from "react";
import { cn } from "@/utils/cn";

interface IconButtonProps {
  onClick: () => void;
  children: ReactNode;
  "aria-label": string;
  title?: string;
  isActive?: boolean;
  className?: string;
  style?: CSSProperties;
  type?: "button" | "submit" | "reset";
}

const IconButton: FC<IconButtonProps> = ({
  onClick,
  children,
  "aria-label": ariaLabel,
  title,
  isActive = false,
  className = "",
  style,
  type = "button",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        "p-2 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95",
        className,
      )}
      style={{
        background: isActive ? "var(--color-accent-light)" : "var(--color-overlay)",
        color: isActive ? "var(--color-accent)" : "var(--color-text-secondary)",
        ...style,
      }}
      aria-label={ariaLabel}
      title={title}
    >
      {children}
    </button>
  );
};

export default IconButton;
