import type { ButtonHTMLAttributes, FC } from "react";
import { cn } from "@/utils/cn";

interface ToastActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: "accent" | "muted";
  hoverScale?: boolean;
}

const ToastAction: FC<ToastActionProps> = ({
  tone = "accent",
  hoverScale = true,
  className,
  children,
  type = "button",
  ...props
}) => (
  <button
    {...props}
    type={type}
    className={cn(
      "text-sm font-semibold px-3 py-1 rounded-lg ui-transition",
      hoverScale && "ui-hover-scale-sm",
      className,
    )}
    style={{
      color:
        tone === "accent"
          ? "var(--color-accent)"
          : "var(--color-text-secondary)",
      background: "rgba(255,255,255,0.08)",
      ...props.style,
    }}
  >
    {children}
  </button>
);

export default ToastAction;
