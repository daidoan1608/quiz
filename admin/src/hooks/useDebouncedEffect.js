import { useEffect } from "react";

export const useDebouncedEffect = (effect, dependencies, delay = 400) => {
  useEffect(() => {
    const timeoutId = setTimeout(effect, delay);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, delay]);
};
