import { useEffect, useRef } from "react";

export function useIntersectionObserver(
  action: () => void | Promise<void>,
  enabled = true,
  rootMargin = "200px",
) {
  const markerRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef(action);

  actionRef.current = action;

  useEffect(() => {
    if (!enabled) return;

    const el = markerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void actionRef.current();
        }
      },
      { rootMargin },
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [enabled, rootMargin]);

  return markerRef;
}
