'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export default function PriceCounter({ value, className = '' }: { value: number; className?: string }) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const currentRef = useRef(value);

  useEffect(() => {
    if (reduced) {
      currentRef.current = value;
      setDisplay(value);
      return;
    }
    const from = currentRef.current;
    const to = value;
    if (from === to) return;
    const duration = 1200;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = Math.round(from + (to - from) * eased);
      currentRef.current = v;
      setDisplay(v);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, reduced]);

  return (
    <span className={`font-mono tabular-nums ${className}`}>
      €{display.toLocaleString('en-US')}
    </span>
  );
}
