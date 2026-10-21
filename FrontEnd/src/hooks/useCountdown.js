import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Cooldown timer for OTP resend links.
 *
 * Usage:
 *   const { secondsLeft, isRunning, start, reset } = useCountdown();
 *   start(30);   // begins (or restarts) a 30 second countdown
 *   reset();     // back to idle
 *
 * One shared interval ticks only while a countdown is active, so a screen full
 * of timers costs nothing when nothing is running.
 */
const computeRemaining = (deadline) => {
  if (!deadline) return 0;
  return Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
};

export default function useCountdown(initialSeconds = 0) {
  const deadlineRef = useRef(null);
  const [secondsLeft, setSecondsLeft] = useState(() =>
    initialSeconds > 0 ? Math.floor(initialSeconds) : 0
  );

  const stop = useCallback(() => {
    deadlineRef.current = null;
    setSecondsLeft(0);
  }, []);

  const start = useCallback((seconds) => {
    const total = Math.max(0, Math.floor(Number(seconds) || 0));
    if (!total) {
      deadlineRef.current = null;
      setSecondsLeft(0);
      return;
    }
    deadlineRef.current = Date.now() + total * 1000;
    setSecondsLeft(total);
  }, []);

  const reset = stop;

  useEffect(() => {
    if (secondsLeft <= 0 || !deadlineRef.current) return undefined;
    const id = setInterval(() => {
      const remaining = computeRemaining(deadlineRef.current);
      setSecondsLeft(remaining);
      if (remaining <= 0) deadlineRef.current = null;
    }, 250);
    return () => clearInterval(id);
  }, [secondsLeft]);

  useEffect(() => () => {
    deadlineRef.current = null;
  }, []);

  return { secondsLeft, isRunning: secondsLeft > 0, start, reset, stop };
}
