import { useRef, useEffect, useState } from "react";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { TIMING } from "@/constants/app";
import { cn } from "@/utils/cn";
import { Icon } from "@/components/icons/Icon";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const [internalOpen, setInternalOpen] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      const id = window.setTimeout(() => setInternalOpen(true), 0);
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(() => setInternalOpen(false), TIMING.MODAL_CLOSE_FALLBACK_MS);
    return () => window.clearTimeout(id);
  }, [isOpen]);

  const closing = !isOpen && internalOpen;
  const isVisible = internalOpen;

  useLockBodyScroll(isVisible);

  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const handleTab = useFocusTrap(modalRef, isVisible);

  useEffect(() => {
    if (isOpen) closeButtonRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, onClose]);

  const handleAnimationEnd = () => {
    if (closing) {
      setInternalOpen(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/50 backdrop-blur-sm",
          closing ? "animate-backdrop-out" : "animate-backdrop",
        )}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleTab}
        onAnimationEnd={handleAnimationEnd}
        className={cn(
          "relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden app-card-surface",
          closing ? "animate-modal-out" : "animate-modal",
        )}
        style={{
          borderColor: "var(--color-card-border)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: "var(--color-card-border)" }}
        >
          <h2
            className="text-base font-semibold"
            style={{ color: "var(--color-text)" }}
          >
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg ui-hover-scale"
            style={{ color: "var(--color-text-secondary)" }}
            aria-label="Close"
          >
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
