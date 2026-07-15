'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const PULL_RADIUS = 150;

export default function MagneticCursor() {
  const reduced = useReducedMotion();
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const ring = ringRef.current;
    if (!ring) return;

    document.body.dataset.magneticCursor = 'on';

    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const pos = { ...pointer };
    let scale = 1;
    let scaleTarget = 1;
    let gold = 0;

    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    type Pull = { x: number; y: number; strength: number };
    const nearestPull = (): Pull | null => {
      const targets = document.querySelectorAll<HTMLElement>('[data-magnetic]');
      let best: Pull | null = null;
      targets.forEach((t) => {
        const r = t.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const d = Math.hypot(pointer.x - cx, pointer.y - cy);
        if (d < PULL_RADIUS) {
          const strength = 1 - d / PULL_RADIUS;
          if (best === null || strength > best.strength) best = { x: cx, y: cy, strength };
        }
      });
      return best;
    };

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const pull = nearestPull();
      let tx = pointer.x;
      let ty = pointer.y;
      if (pull) {
        tx = pointer.x + (pull.x - pointer.x) * pull.strength * 0.55;
        ty = pointer.y + (pull.y - pointer.y) * pull.strength * 0.55;
        scaleTarget = 1 + pull.strength * 1.6;
        gold += (1 - gold) * 0.15;
      } else {
        scaleTarget = 1;
        gold += (0 - gold) * 0.15;
      }
      pos.x += (tx - pos.x) * 0.18;
      pos.y += (ty - pos.y) * 0.18;
      scale += (scaleTarget - scale) * 0.15;
      ring.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%) scale(${scale})`;
      ring.style.borderColor = gold > 0.5 ? '#C9A84C' : '#E8E8E8';
      ring.style.opacity = String(0.4 + gold * 0.6);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      delete document.body.dataset.magneticCursor;
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <div
      ref={ringRef}
      aria-hidden
      className="magnetic-ring pointer-events-none fixed left-0 top-0 z-cursor h-8 w-8 rounded-full border border-platinum"
      style={{ willChange: 'transform' }}
    />
  );
}
