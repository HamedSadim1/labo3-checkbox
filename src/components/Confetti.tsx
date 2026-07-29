import { useEffect, useRef } from "react";
import { TIMING, CONFETTI } from "@/constants/app";
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
      const duration = TIMING.CONFETTI_DURATION_MS;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: CONFETTI.PARTICLE_COUNT_PER_FRAME,
          angle: CONFETTI.LEFT_ANGLE,
          spread: CONFETTI.SPREAD,
          origin: { x: 0, y: CONFETTI.ORIGIN_Y },
          colors: [...CONFETTI.COLORS],
        });
        confetti({
          particleCount: CONFETTI.PARTICLE_COUNT_PER_FRAME,
          angle: CONFETTI.RIGHT_ANGLE,
          spread: CONFETTI.SPREAD,
          origin: { x: 1, y: CONFETTI.ORIGIN_Y },
          colors: [...CONFETTI.COLORS],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        } else if (onDone) {
          onDone();
        }
      };

      // Big burst
      confetti({
        particleCount: CONFETTI.BURST_PARTICLE_COUNT,
        spread: CONFETTI.BURST_SPREAD,
        origin: { y: CONFETTI.ORIGIN_Y },
        colors: [...CONFETTI.COLORS],
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
