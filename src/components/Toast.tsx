import type { FC, ReactNode } from "react";

interface ToastProps {
  icon?: ReactNode;
  message: ReactNode;
  action?: ReactNode;
  className?: string;
  contentClassName?: string;
}

const Toast: FC<ToastProps> = ({
  icon,
  message,
  action,
  className = "",
  contentClassName = "",
}) => {
  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 z-50 animate-toast-in ${className}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl border ${contentClassName}`}
        style={{
          background: "var(--color-toast-bg)",
          color: "var(--color-toast-text)",
          borderColor: "rgba(255,255,255,0.1)",
        }}
      >
        {icon && <div className="shrink-0">{icon}</div>}
        <span className="text-sm">{message}</span>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
};

export default Toast;
