import { useEffect, useRef } from "react";

export function useIntersectionObserver(
  action: () => Promise<void>,
  enabled = true,
  rootMargin = "200px",
) {
  const markerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const el = markerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) action();
      },
      {
        rootMargin,
      },
    );

    observer.observe(el);

    return () => observer.disconnect();
  });

  return markerRef;
}
