import { useEffect } from 'react';

export const useExamCountdown = ({
  endTimeRef,
  handleSubmitRef,
  isDraftReady,
  setTimeLeft,
  timeLeft,
}) => {
  useEffect(() => {
    if (timeLeft === null || !endTimeRef.current || !isDraftReady) return;

    const timerId = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.floor((endTimeRef.current - Date.now()) / 1000)
      );
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timerId);
        handleSubmitRef.current?.();
      }
    }, 1000);

    return () => clearInterval(timerId);
  }, [endTimeRef, handleSubmitRef, isDraftReady, setTimeLeft, timeLeft]);
};
