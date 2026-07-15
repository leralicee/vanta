'use client';

import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useGsapContext } from '@/hooks/useGsapContext';
import SiteImage from '@/components/SiteImage';
import { MOVEMENT } from '@/lib/content';
import { GSAP_EASE } from '@/lib/motion';

const LABELS = [
  { key: 'Balance', top: '24%', left: '82%', align: 'left' as const },
  { key: 'Jewels', top: '70%', left: '80%', align: 'left' as const },
  { key: 'Reserve', top: '24%', left: '4%', align: 'right' as const },
  { key: 'Components', top: '74%', left: '6%', align: 'right' as const },
  { key: 'Tolerance', top: '94%', left: '50%', align: 'center' as const },
];

export default function Movement() {
  const sectionRef = useRef<HTMLElement>(null);
  const diagramRef = useRef<HTMLDivElement>(null);

  useGsapContext(sectionRef, () => {

    gsap.set('.draw', { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.to('.draw', {
      strokeDashoffset: 0,
      duration: 1.6,
      ease: GSAP_EASE,
      stagger: 0.06,
      scrollTrigger: { trigger: diagramRef.current, start: 'top 72%' },
    });

    gsap.from('.mv-label', {
      opacity: 0,
      y: 10,
      duration: 1,
      ease: GSAP_EASE,
      stagger: 0.12,
      delay: 0.4,
      scrollTrigger: { trigger: diagramRef.current, start: 'top 65%' },
    });

    gsap.to('.balance', {
      rotation: 9,
      transformOrigin: 'center',
      duration: 0.42,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    });
  });

  return (
    <section ref={sectionRef} id="movement" aria-label="The movement" className="relative bg-vanta px-6 py-section sm:px-10">
      <header className="mx-auto mb-12 max-w-4xl text-center">
        <span className="label-mono text-champagne">04 — Movement</span>
        <h2 className="mt-4 font-mono text-display-m font-medium tracking-wide text-platinum">
          {MOVEMENT.caliber}
        </h2>
        <p className="mx-auto mt-5 max-w-xl font-display text-body text-steel">{MOVEMENT.line}</p>
      </header>

      <div ref={diagramRef} className="relative mx-auto aspect-[4/3] w-full max-w-4xl">
        <div aria-hidden className="absolute inset-0 opacity-20 blur-sm">
          <SiteImage image={MOVEMENT.backplate} className="h-full w-full" sizes="100vw" />
        </div>
        <div aria-hidden className="absolute inset-0 bg-vanta/55" />

        <MovementDiagram />

        {LABELS.map((l) => {
          const callout = MOVEMENT.callouts.find((c) => c.label === l.key);
          if (!callout) return null;
          return (
            <div
              key={l.key}
              className="mv-label absolute hidden -translate-y-1/2 lg:block"
              style={{
                top: l.top,
                left: l.left,
                transform:
                  l.align === 'right'
                    ? 'translate(-100%, -50%)'
                    : l.align === 'center'
                      ? 'translate(-50%, -50%)'
                      : 'translateY(-50%)',
              }}
            >
              <span className="block whitespace-nowrap bg-vanta px-2 py-0.5 font-mono text-mono-data text-platinum">
                <span className="text-champagne">{callout.value}</span>
              </span>
              <span className="label-mono block bg-vanta px-2 pb-0.5">{callout.label}</span>
            </div>
          );
        })}
      </div>

      <dl className="mx-auto mt-10 grid max-w-md grid-cols-2 gap-x-8 gap-y-5 lg:hidden">
        {MOVEMENT.callouts.map((c) => (
          <div key={c.label} className="flex flex-col border-l border-graphite pl-4">
            <dt className="label-mono">{c.label}</dt>
            <dd className="mt-1 font-mono text-mono-data text-champagne">{c.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function MovementDiagram() {
  const stroke = { fill: 'none', strokeWidth: 1.2, vectorEffect: 'non-scaling-stroke' as const };
  const platinum = '#8A8A8A';
  const gold = '#C9A84C';
  return (
    <svg
      viewBox="0 0 800 600"
      aria-hidden
      className="relative h-full w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <circle className="draw" cx="400" cy="300" r="240" stroke={platinum} {...stroke} pathLength={1} />
      <circle className="draw" cx="400" cy="300" r="214" stroke={platinum} opacity={0.5} {...stroke} pathLength={1} />

      <circle className="draw" cx="250" cy="300" r="92" stroke={platinum} {...stroke} pathLength={1} />
      <circle className="draw" cx="250" cy="300" r="66" stroke={platinum} opacity={0.6} {...stroke} pathLength={1} />
      <circle className="draw" cx="250" cy="300" r="40" stroke={platinum} opacity={0.4} {...stroke} pathLength={1} />

      <circle className="draw" cx="400" cy="300" r="58" stroke={platinum} {...stroke} pathLength={1} />
      <line className="draw" x1="342" y1="300" x2="458" y2="300" stroke={platinum} {...stroke} pathLength={1} />
      <line className="draw" x1="400" y1="242" x2="400" y2="358" stroke={platinum} {...stroke} pathLength={1} />

      <circle className="draw" cx="470" cy="190" r="30" stroke={platinum} {...stroke} pathLength={1} />
      <circle className="draw" cx="330" cy="430" r="34" stroke={platinum} {...stroke} pathLength={1} />

      <circle className="draw" cx="500" cy="380" r="22" stroke={platinum} {...stroke} pathLength={1} />

      <g className="balance" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
        <circle className="draw" cx="575" cy="300" r="84" stroke={gold} {...stroke} pathLength={1} />
        <circle className="draw" cx="575" cy="300" r="68" stroke={gold} opacity={0.5} {...stroke} pathLength={1} />
        <line className="draw" x1="491" y1="300" x2="659" y2="300" stroke={gold} {...stroke} pathLength={1} />
        <line className="draw" x1="575" y1="216" x2="575" y2="384" stroke={gold} {...stroke} pathLength={1} />
      </g>

      {[
        [250, 300],
        [400, 300],
        [575, 300],
        [500, 380],
        [470, 190],
        [330, 430],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5" fill={gold} />
      ))}

      <line className="draw" x1="640" y1="240" x2="720" y2="180" stroke={platinum} opacity={0.5} {...stroke} pathLength={1} />
      <line className="draw" x1="500" y1="380" x2="700" y2="430" stroke={platinum} opacity={0.5} {...stroke} pathLength={1} />
      <line className="draw" x1="160" y1="250" x2="80" y2="180" stroke={platinum} opacity={0.5} {...stroke} pathLength={1} />
      <line className="draw" x1="300" y1="430" x2="120" y2="450" stroke={platinum} opacity={0.5} {...stroke} pathLength={1} />
    </svg>
  );
}
