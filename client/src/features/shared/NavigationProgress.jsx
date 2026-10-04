import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Slim top bar on route changes (pathname / search). Skips the first paint.
 */
export function NavigationProgress() {
  const location = useLocation();
  const first = useRef(true);
  const [active, setActive] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }

    setActive(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setActive(false);
    }, 320);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [location.pathname, location.search, location.key]);

  if (!active) return null;

  return (
    <div
      className="pointer-events-none fixed left-0 right-0 top-0 z-[10000] h-0.5 overflow-hidden bg-sky-200/60"
      aria-hidden
    >
      <div className="route-nav-progress h-full w-full origin-left bg-sky-600" />
    </div>
  );
}
