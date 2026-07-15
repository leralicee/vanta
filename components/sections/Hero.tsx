'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { useGsapContext } from '@/hooks/useGsapContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTickAudio } from '@/hooks/useTickAudio';
import HeroStageCanvas from '@/components/HeroStageCanvas';
import { createStageControl } from '@/hooks/useHeroStage';
import { GSAP_EASE } from '@/lib/motion';
import { HERO, SITE } from '@/lib/content';

const SWEEP_SPEED = 248;
const MINUIT_DELAY = 0.4;
const COLLAPSE_DUR = 0.45;
const WORLD_SPAN = 5.83;
const HAND_WORLD = 1.3;

function sweepDuration(): number {
  let dur = 2.9;
  for (let i = 0; i < 3; i++) {
    const endSec = ((Date.now() / 1000 + MINUIT_DELAY + dur + COLLAPSE_DUR * 0.5) % 60 + 60) % 60;
    const target = (endSec / 60) * 360;
    const total = 720 + ((target % 360) + 360) % 360;
    dur = total / SWEEP_SPEED;
  }
  return dur;
}

export default function Hero() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const stageWrapRef = useRef<HTMLDivElement>(null);
  const rotatorRef = useRef<HTMLDivElement>(null);
  const controlRef = useRef(createStageControl());
  const phaseRef = useRef<'minuit' | 'live'>('minuit');
  const usedLoupeRef = useRef(false);
  const lastSweepRef = useRef(0);
  const [hintVisible, setHintVisible] = useState(false);
  const { on: tickOn, toggle: toggleTick } = useTickAudio();

  useEffect(() => {
    if (reduced) return;
    const control = controlRef.current;
    const stageWrap = stageWrapRef.current;
    const fine = window.matchMedia('(pointer: fine)').matches;
    let holdTimer = 0;
    let holding = false;
    let sweeping = false;

    if (phaseRef.current === 'minuit') {
      control.reveal = 0;
      control.floatOn = true;
    }

    const fireSweep = () => {
      if (sweeping || phaseRef.current !== 'live') return;
      sweeping = true;
      lastSweepRef.current = performance.now();
      const run = { deg: -70 };
      gsap.timeline({
        onComplete: () => {
          sweeping = false;
        },
      })
        .to(control, { sweepPower: 0.7, duration: 0.5, ease: 'power2.in' }, 0)
        .to(
          run,
          {
            deg: 70,
            duration: 1.7,
            ease: 'power2.inOut',
            onUpdate: () => {
              control.sweepDeg = run.deg;
            },
          },
          0,
        )
        .to(control, { sweepPower: 0, duration: 0.6, ease: 'power2.out' }, 1.1);
    };

    const scheduler = window.setInterval(() => {
      if (
        phaseRef.current === 'live' &&
        !document.hidden &&
        !control.loupeOn &&
        control.scrollOut < 0.3 &&
        performance.now() - lastSweepRef.current > 7000
      ) {
        fireSweep();
      }
    }, 1000);

    const loupeAt = (clientX: number, clientY: number): boolean => {
      const canvas = stageWrap?.querySelector('canvas');
      if (!canvas) return false;
      const rect = canvas.getBoundingClientRect();
      const rx = (clientX - rect.left) / rect.width;
      const ry = (clientY - rect.top) / rect.height;
      const inside = Math.hypot(rx - 0.5, (ry - 0.454) * 1.25) < 0.3;
      if (inside) {
        control.loupeX = Math.min(Math.max(rx, 0), 1);
        control.loupeY = Math.min(Math.max(ry, 0), 1);
      }
      return inside;
    };

    const engage = (on: boolean) => {
      control.loupeOn = on;
      if (on) document.body.dataset.loupe = 'on';
      else delete document.body.dataset.loupe;
      if (on && !usedLoupeRef.current) {
        usedLoupeRef.current = true;
        setHintVisible(false);
      }
    };

    const onMove = (e: PointerEvent) => {
      control.pointerX = e.clientX / window.innerWidth - 0.5;
      control.pointerY = e.clientY / window.innerHeight - 0.5;
      if (phaseRef.current !== 'live') return;
      const inside = loupeAt(e.clientX, e.clientY);
      if (fine) engage(inside);
      else if (holding) engage(inside);
    };

    const onDown = (e: PointerEvent) => {
      if (phaseRef.current !== 'live') return;
      if ((e.target as HTMLElement | null)?.closest('a,button')) return;
      const inZone = loupeAt(e.clientX, e.clientY);
      if (fine) {
        if (inZone && performance.now() - lastSweepRef.current > 2200) fireSweep();
        return;
      }
      if (!inZone) return;
      holdTimer = window.setTimeout(() => {
        holding = true;
        engage(true);
      }, 220);
    };

    const onUp = () => {
      window.clearTimeout(holdTimer);
      if (holding) {
        holding = false;
        engage(false);
      }
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.clearInterval(scheduler);
      window.clearTimeout(holdTimer);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      delete document.body.dataset.loupe;
    };
  }, [reduced]);

  useGsapContext(sectionRef, () => {
    const control = controlRef.current;
    const rotator = rotatorRef.current;
    const stageWrap = stageWrapRef.current;
    if (!rotator || !stageWrap) return;

    const dur = sweepDuration();
    const total = dur * SWEEP_SPEED;
    const proxy = { deg: 0 };

    const tl = gsap.timeline({
      delay: MINUIT_DELAY,
      onComplete: () => {
        phaseRef.current = 'live';
        lastSweepRef.current = performance.now();
        window.setTimeout(() => {
          if (!usedLoupeRef.current) setHintVisible(true);
        }, 800);
      },
    });

    tl.set(rotator, { opacity: 1 });
    tl.to(
      proxy,
      {
        deg: total,
        duration: dur,
        ease: 'none',
        onUpdate: () => {
          rotator.style.transform = `rotate(${proxy.deg}deg)`;
          control.sweepDeg = Math.sin((proxy.deg * Math.PI) / 180) * 55;
          control.sweepPower = Math.min(1, proxy.deg / 90) * 0.85;
        },
      },
      0,
    );
    tl.to(control, { reveal: 1, duration: 1.5, ease: GSAP_EASE }, dur * 0.48);
    tl.to(
      rotator,
      {
        x: () => stageWrap.getBoundingClientRect().left + stageWrap.getBoundingClientRect().width / 2 - window.innerWidth / 2,
        y: () => stageWrap.getBoundingClientRect().top + stageWrap.getBoundingClientRect().height * 0.454 - window.innerHeight / 2,
        scale: () => {
          const rect = stageWrap.getBoundingClientRect();
          const handPx = (HAND_WORLD / WORLD_SPAN) * rect.height;
          const linePx = 0.58 * Math.max(window.innerWidth, window.innerHeight);
          return handPx / linePx;
        },
        duration: COLLAPSE_DUR,
        ease: 'power2.in',
      },
      dur,
    );
    tl.to(rotator, { autoAlpha: 0, duration: 0.18, ease: 'none' }, dur + COLLAPSE_DUR - 0.18);
    tl.to(control, { sweepPower: 0, duration: COLLAPSE_DUR, ease: 'none' }, dur);
    tl.from(
      '[data-reveal]',
      { opacity: 0, y: 16, duration: 1, ease: GSAP_EASE, stagger: 0.1 },
      dur * 0.62,
    );
    tl.from(
      '[data-tag-letter]',
      { opacity: 0, y: 10, filter: 'blur(6px)', duration: 0.9, ease: GSAP_EASE, stagger: 0.032 },
      dur * 0.55,
    );

    gsap
      .timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
          onUpdate: (self) => {
            control.scrollOut = self.progress;
          },
        },
      })
      .to(railRef.current, { yPercent: -12, opacity: 0.08, ease: 'none' }, 0)
      .to('p[aria-label]', { letterSpacing: '0.12em', ease: 'none' }, 0);

    const skip = (e: Event) => {
      if (phaseRef.current !== 'minuit') return;
      if (e.type === 'pointerdown' && (e.target as HTMLElement | null)?.closest('a,button')) return;
      tl.progress(1, false);
    };
    window.addEventListener('pointerdown', skip);
    window.addEventListener('keydown', skip);
    window.addEventListener('wheel', skip, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', skip);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('wheel', skip);
    };
  });

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-[100svh] overflow-hidden"
    >
      <div className="relative z-base mx-auto grid min-h-[100svh] w-full max-w-[110rem] grid-cols-1 items-center gap-4 px-6 pb-24 pt-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,620px)] lg:gap-6 lg:px-16 lg:pb-16">
        <div ref={railRef} className="order-2 text-center lg:order-1 lg:text-left">
          <span data-reveal className="label-mono block text-champagne">
            {SITE.kicker}
          </span>
          <h1
            data-reveal
            className="mt-6 font-display text-display-xl font-light tracking-brand text-platinum"
          >
            {SITE.name}
          </h1>
          <p
            className="mx-auto mt-7 max-w-md font-display text-display-m font-light text-platinum/90 lg:mx-0"
            aria-label={SITE.tagline}
          >
            {SITE.tagline.split(' ').map((word, wi) => (
              <span key={wi} aria-hidden>
                <span className="inline-block whitespace-nowrap">
                  {word.split('').map((ch, i) => (
                    <span key={i} data-tag-letter className="inline-block">
                      {ch}
                    </span>
                  ))}
                </span>{' '}
              </span>
            ))}
          </p>
          <dl
            data-reveal
            className="mt-12 flex flex-wrap items-baseline justify-center gap-x-10 gap-y-4 lg:justify-start"
          >
            {HERO.microdata.map((item) => (
              <div key={item.label}>
                <dt className="label-mono">{item.label}</dt>
                <dd className="mt-1.5 font-mono text-mono-data text-platinum">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div ref={stageWrapRef} className="relative order-1 lg:order-2">
          <HeroStageCanvas
            control={controlRef.current}
            className="mx-auto aspect-[4/5] w-[min(78vw,440px)] lg:w-[min(100%,calc((100svh-13rem)*0.8))]"
          />
          <span
            aria-hidden
            className={`label-mono pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap text-champagne/80 transition-opacity duration-slower ease-vanta ${
              hintVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {HERO.hint}
          </span>
        </div>
      </div>

      <a
        href="#craft"
        data-reveal
        onClick={(e) => {
          e.preventDefault();
          const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          document.getElementById('craft')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
        }}
        className="absolute bottom-7 left-1/2 z-base flex min-h-11 -translate-x-1/2 items-center"
      >
        <span className="label-mono">{HERO.scrollHint}</span>
      </a>

      {!reduced && (
        <button
          type="button"
          data-reveal
          onClick={toggleTick}
          aria-pressed={tickOn}
          className="absolute bottom-7 left-6 z-base flex min-h-11 items-center gap-2.5 sm:left-10"
        >
          <span
            aria-hidden
            className={`h-1 w-1 rounded-full transition-colors duration-slow ${
              tickOn ? 'bg-champagne' : 'bg-steel/40'
            }`}
          />
          <span className="label-mono">
            {HERO.sound.label} · {tickOn ? HERO.sound.on : HERO.sound.off}
          </span>
        </button>
      )}

      {!reduced && (
        <div aria-hidden className="pointer-events-none absolute inset-0 z-raised overflow-hidden">
          <div
            ref={rotatorRef}
            className="absolute inset-0 opacity-0 will-change-transform"
            style={{
              background:
                'conic-gradient(from -36deg at 50% 50%, transparent 0deg, rgba(201,168,76,0.05) 14deg, rgba(201,168,76,0.38) 35.6deg, transparent 36deg)',
            }}
          >
            <div
              className="absolute left-1/2 top-1/2 h-px w-[58vmax] origin-left"
              style={{
                transform: 'rotate(-90deg)',
                background:
                  'linear-gradient(90deg, rgba(227,201,119,0.9), rgba(201,168,76,0.55) 55%, rgba(201,168,76,0))',
              }}
            />
          </div>
        </div>
      )}
    </section>
  );
}
