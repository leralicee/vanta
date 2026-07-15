'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useGsapContext } from '@/hooks/useGsapContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { HERITAGE } from '@/lib/content';

export default function Heritage() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [isLarge, setIsLarge] = useState(false);
  useEffect(() => {
    const q = window.matchMedia('(min-width: 1024px)');
    setIsLarge(q.matches);
    const onChange = (e: MediaQueryListEvent) => setIsLarge(e.matches);
    q.addEventListener('change', onChange);
    return () => q.removeEventListener('change', onChange);
  }, []);

  const horizontal = !reduced && isLarge;

  useGsapContext(
    sectionRef,
    () => {
      const fill = fillRef.current;
      if (!fill) return;
      const count = HERITAGE.length;

      gsap.set(fill, { scaleX: 0, transformOrigin: 'left center' });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: () => `+=${window.innerHeight * 2.6}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress;
          gsap.set(fill, { scaleX: p });
          nodeRefs.current.forEach((node, i) => {
            if (!node) return;
            const threshold = i / (count - 1);
            node.dataset.active = p >= threshold - 0.03 ? 'true' : 'false';
          });
        },
      });
    },
    [isLarge],
  );

  if (!horizontal) {
    return (
      <section id="heritage" aria-label="Heritage" className="bg-vanta px-6 py-section sm:px-10">
        <Header />
        <ol className="mx-auto mt-12 max-w-2xl border-l border-graphite">
          {HERITAGE.map((e) => (
            <li key={e.year} className="relative py-6 pl-8">
              <span className="absolute left-[-5px] top-8 h-2.5 w-2.5 rounded-full bg-champagne" />
              <span className="font-mono text-mono-data text-champagne">{e.year}</span>
              <h3 className="mt-1 font-display text-display-m font-light text-platinum">{e.title}</h3>
              <p className="mt-1 max-w-md font-display text-body text-steel">{e.line}</p>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="heritage"
      aria-label="Heritage"
      className="relative h-[100svh] overflow-hidden bg-vanta"
    >
      <div className="absolute left-6 top-24 sm:left-10">
        <Header compact />
      </div>

      <div className="flex h-full items-center">
        <div className="relative mx-auto w-full max-w-6xl px-10">
          <div className="hairline absolute left-10 right-10 top-1/2 h-px -translate-y-1/2" />
          <div
            ref={fillRef}
            className="absolute left-10 right-10 top-1/2 h-px -translate-y-1/2 bg-gold-sheen"
            style={{ boxShadow: '0 0 12px rgba(201,168,76,0.6)' }}
          />

          <div className="relative h-[60vh]">
            {HERITAGE.map((entry, i) => {
              const left = `${(i / (HERITAGE.length - 1)) * 100}%`;
              const above = i % 2 === 0;
              return (
                <div
                  key={entry.year}
                  ref={(el) => {
                    nodeRefs.current[i] = el;
                  }}
                  data-active="false"
                  className="group absolute top-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
                  style={{ left }}
                >
                  <span className="block h-3 w-3 rounded-full border border-steel bg-vanta transition-all duration-slow ease-vanta group-data-[active=true]:border-champagne group-data-[active=true]:bg-champagne group-data-[active=true]:shadow-[0_0_14px_rgba(201,168,76,0.8)]" />

                  <div
                    className={`absolute left-1/2 w-44 -translate-x-1/2 opacity-40 transition-all duration-slow ease-vanta group-data-[active=true]:opacity-100 ${
                      above ? 'bottom-7' : 'top-7'
                    }`}
                  >
                    <span className="font-mono text-lg tracking-wide text-champagne">{entry.year}</span>
                    <h3 className="mt-1 font-display text-lg font-light leading-tight text-platinum">
                      {entry.title}
                    </h3>
                    <p className="mt-1 font-display text-sm text-steel">{entry.line}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <span className="label-mono absolute bottom-8 left-1/2 -translate-x-1/2 text-steel">
        Scroll · 1971 — Present
      </span>
    </section>
  );
}

function Header({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? '' : 'mx-auto max-w-2xl'}>
      <span className="label-mono text-champagne">05 — Heritage</span>
      {!compact && (
        <h2 className="mt-4 font-display text-display-l font-light text-platinum">
          Fifty years. The bench has not moved.
        </h2>
      )}
    </div>
  );
}
