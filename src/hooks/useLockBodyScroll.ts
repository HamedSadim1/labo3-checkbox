import { useEffect } from "react";

let activeLocks = 0;
let originalOverflow = "";
let originalPosition = "";
let originalTop = "";
let originalWidth = "";
let originalScrollY = 0;

/**
 * Locks the document body scroll while `isLocked` is true.
 * Restores the original styles and scroll position when the last lock is released.
 * Safe to use from multiple components at the same time.
 */
export const useLockBodyScroll = (isLocked: boolean) => {
  useEffect(() => {
    if (!isLocked) return;

    if (activeLocks === 0) {
      originalOverflow = document.body.style.overflow;
      originalPosition = document.body.style.position;
      originalTop = document.body.style.top;
      originalWidth = document.body.style.width;
      originalScrollY = window.scrollY;

      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${originalScrollY}px`;
      document.body.style.width = "100%";
    }

    activeLocks++;

    return () => {
      activeLocks--;

      if (activeLocks === 0) {
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
        document.body.style.top = originalTop;
        document.body.style.width = originalWidth;
        window.scrollTo(0, originalScrollY);
      }
    };
  }, [isLocked]);
};
