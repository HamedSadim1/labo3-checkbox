import { useState, useEffect } from "react";
import type { FC, ReactNode } from "react";
import { TIMING } from "@/constants/app";
import { cn } from "@/utils/cn";

interface ToastProps {
  isOpen: boolean;
  onClose?: () => void;
  icon?: ReactNode;
  message: ReactNode;
  action?: ReactNode;
  className?: string;
  contentClassName?: string;
}

const Toast: FC<ToastProps> = ({
  isOpen,
  onClose,
  icon,
  message,
  action,
  className = "",
  contentClassName = "",
}) => {
  const [internalOpen, setInternalOpen] = useState(isOpen);
  // Capture the message at the time the toast opens so the exit animation
  // shows the same content even if the parent data changes
  const [snapshot, setSnapshot] = useState<ReactNode>(() => message);

  useEffect(() => {
    if (isOpen) {
      const id = window.setTimeout(() => {
        setSnapshot(message);
        setInternalOpen(true);
      }, 0);
      return () => window.clearTimeout(id);
    }
    if (internalOpen) {
      const id = window.setTimeout(() => {
        setInternalOpen(false);
        onClose?.();
      }, TIMING.MODAL_CLOSE_FALLBACK_MS);
      return () => window.clearTimeout(id);
    }
  }, [isOpen, internalOpen, onClose, message]);

  const closing = !isOpen && internalOpen;
  const isVisible = internalOpen;

  const handleAnimationEnd = () => {
    if (closing) {
      setInternalOpen(false);
      onClose?.();
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed left-1/2 -translate-x-1/2 z-50",
        closing ? "animate-toast-out" : "animate-toast-in",
        className,
      )}
      onAnimationEnd={handleAnimationEnd}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className={cn(
          "flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl border",
          contentClassName,
        )}
        style={{
          background: "var(--color-toast-bg)",
          color: "var(--color-toast-text)",
          borderColor: "rgba(255,255,255,0.1)",
        }}
      >
        {icon && <div className="shrink-0">{icon}</div>}
        <span className="text-sm">{snapshot}</span>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
};

export default Toast;
