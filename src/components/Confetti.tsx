import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

interface ConfettiProps {
  trigger: boolean;
  onDone?: () => void;
}

const ConfettiEffect: React.FC<ConfettiProps> = ({ trigger, onDone }) => {
  const hasFired = useRef(false);

  useEffect(() => {
    if (trigger && !hasFired.current) {
      hasFired.current = true;

      // Fire confetti from both sides
      const duration = 2000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: ["#6366f1", "#ec4899", "#22c55e", "#f59e0b", "#3b82f6"],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: ["#6366f1", "#ec4899", "#22c55e", "#f59e0b", "#3b82f6"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        } else if (onDone) {
          onDone();
        }
      };

      // Big burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#ec4899", "#22c55e", "#f59e0b", "#3b82f6"],
      });

      frame();
    }
  }, [trigger, onDone]);

  // Reset when trigger becomes false
  useEffect(() => {
    if (!trigger) {
      hasFired.current = false;
    }
  }, [trigger]);

  return null; // No DOM element
};

export default ConfettiEffect;
