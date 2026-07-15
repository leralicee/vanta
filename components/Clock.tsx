'use client';

import { useEffect, useRef, useState } from 'react';

export default function Clock() {
  const [time, setTime] = useState<{ h: string; m: string; s: string } | null>(null);
  const raf = useRef<number>(0);

  useEffect(() => {
    let last = '';
    const tick = () => {
      const d = new Date();
      const stamp = `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
      if (stamp !== last) {
        last = stamp;
        setTime({
          h: String(d.getHours()).padStart(2, '0'),
          m: String(d.getMinutes()).padStart(2, '0'),
          s: String(d.getSeconds()).padStart(2, '0'),
        });
      }
      raf.current = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return (
    <span className="font-mono text-mono-data tracking-wide text-platinum" aria-label="Current time">
      {time ? (
        <>
          {time.h}
          <span className="text-steel">:</span>
          {time.m}
          <span className="text-steel">:</span>
          <span className="text-champagne">{time.s}</span>
        </>
      ) : (
        <span className="text-steel">--:--:--</span>
      )}
    </span>
  );
}
