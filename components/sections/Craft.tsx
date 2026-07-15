'use client';

import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useGsapContext } from '@/hooks/useGsapContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import SiteImage from '@/components/SiteImage';
import { CRAFT } from '@/lib/content';

const ACT = 1;
const FADE = 0.22;

export default function Craft() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  useGsapContext(sectionRef, (self) => {
    const q = self.selector;
    if (!q) return;
    const mm = gsap.matchMedia();

    mm.add('(min-width: 1024px)', () => {
      const stage = q('[data-stage]')[0] as HTMLElement | undefined;
      if (!stage) return;
      const figs = q('[data-fig]') as HTMLElement[];
      const zooms = q('[data-zoom]') as HTMLElement[];
      const bands = q('[data-band]') as HTMLElement[];
      const titles = q('[data-title]') as HTMLElement[];
      const lines = q('[data-line]') as HTMLElement[];
      const labels = q('[data-label]') as HTMLElement[];
      const indices = q('[data-idx]') as HTMLElement[];
      const fill = q('[data-progress]')[0] as HTMLElement | undefined;

      gsap.set(figs.slice(1), { autoAlpha: 0 });
      gsap.set(indices.slice(1), { autoAlpha: 0 });
      gsap.set(bands, { autoAlpha: 1, xPercent: -160 });
      gsap.set(titles.slice(1), { yPercent: 105 });
      gsap.set(lines.slice(1), { autoAlpha: 0 });
      gsap.set(labels.slice(1), { autoAlpha: 0 });

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: '+=260%',
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });

      CRAFT.forEach((_, i) => {
        const at = i * ACT;

        if (i > 0) {
          tl.to(figs[i - 1], { autoAlpha: 0, duration: FADE }, at - FADE / 2);
          tl.to(figs[i], { autoAlpha: 1, duration: FADE }, at - FADE / 2);
          tl.to(indices[i - 1], { autoAlpha: 0, duration: FADE }, at - FADE / 2);
          tl.to(indices[i], { autoAlpha: 1, duration: FADE }, at - FADE / 2);
        }

        tl.fromTo(zooms[i], { scale: 1.06 }, { scale: 1, duration: ACT }, at);
        tl.to(bands[i], { xPercent: 260, duration: 0.68 }, at + 0.16);

        tl.to(labels[i], { autoAlpha: 1, duration: 0.08, ease: 'power1.out' }, at + 0.02);
        tl.to(titles[i], { yPercent: 0, duration: 0.16, ease: 'power2.out' }, at + 0.03);
        tl.to(lines[i], { autoAlpha: 1, duration: 0.1 }, at + 0.1);

        if (i < CRAFT.length - 1) {
          tl.to(titles[i], { letterSpacing: '0.09em', autoAlpha: 0, duration: 0.12 }, at + 0.84);
          tl.to([lines[i], labels[i]], { autoAlpha: 0, duration: 0.09 }, at + 0.85);
        }
      });

      if (fill) {
        tl.fromTo(fill, { scaleY: 0 }, { scaleY: 1, duration: CRAFT.length * ACT }, 0);
      }
    });

    mm.add('(max-width: 1023.5px)', () => {
      (q('[data-mact]') as HTMLElement[]).forEach((act) => {
        const band = act.querySelector('[data-mband]');
        const title = act.querySelector('[data-mtitle]');
        if (!band || !title) return;
        gsap.fromTo(
          band,
          { xPercent: -160, autoAlpha: 1 },
          {
            xPercent: 260,
            duration: 1.7,
            ease: 'power2.inOut',
            scrollTrigger: { trigger: act, start: 'top 72%', once: true },
          },
        );
        gsap.from(title, {
          yPercent: 105,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: act, start: 'top 72%', once: true },
        });
      });
    });
  });

  if (reduced) {
    return (
      <section id="craft" aria-label="Craftsmanship">
        <StackedActs />
      </section>
    );
  }

  return (
    <section ref={sectionRef} id="craft" aria-label="Craftsmanship">
      <div data-stage className="hidden lg:block">
        <div className="relative mx-auto grid h-[100svh] w-full max-w-[110rem] grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-center gap-14 px-16 pb-10 pt-24">
          <div className="label-mono absolute left-8 top-24 inline-grid grid-cols-[auto_auto_auto] items-baseline text-champagne">
            <span>02 / Craft —&nbsp;</span>
            <span className="inline-grid">
              {CRAFT.map((panel) => (
                <span key={panel.index} data-idx className="[grid-area:1/1]">
                  {panel.index}
                </span>
              ))}
            </span>
            <span>&nbsp;· 03</span>
          </div>

          <div
            aria-hidden
            className="absolute left-8 top-1/2 h-[36svh] w-px -translate-y-1/2 bg-graphite"
          >
            <div data-progress className="h-full w-full origin-top bg-champagne" />
          </div>

          <div className="relative h-[26rem]">
            {CRAFT.map((panel) => (
              <div key={panel.index} className="absolute inset-0 flex flex-col justify-center">
                <span data-label className="label-mono block shrink-0 text-steel">
                  {panel.label}
                </span>
                <div className="mt-4 shrink-0 overflow-hidden">
                  <h2
                    data-title
                    className="font-display text-display-l font-light leading-tight text-platinum"
                  >
                    {panel.title}
                  </h2>
                </div>
                <p data-line className="mt-6 max-w-md shrink-0 font-display text-body text-steel">
                  {panel.line}
                </p>
              </div>
            ))}
          </div>

          <div className="relative h-[72svh] overflow-hidden border border-graphite/50">
            {CRAFT.map((panel) => (
              <figure key={panel.index} data-fig className="absolute inset-0 m-0">
                <div data-zoom className="absolute inset-0">
                  <SiteImage
                    image={panel.image}
                    className="h-full w-full"
                    sizes="(min-width: 1024px) 55vw, 100vw"
                  />
                </div>
                <div
                  data-band
                  aria-hidden
                  className="absolute -inset-y-[18%] left-0 w-[46%] opacity-0 mix-blend-screen blur-xl"
                  style={{
                    transform: 'rotate(13deg)',
                    background:
                      'linear-gradient(90deg, transparent, rgba(201,168,76,0.26) 42%, rgba(255,244,220,0.4) 50%, rgba(201,168,76,0.26) 58%, transparent)',
                  }}
                />
              </figure>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:hidden">
        <StackedActs interactive />
      </div>
    </section>
  );
}

function StackedActs({ interactive = false }: { interactive?: boolean }) {
  return (
    <div className="space-y-20 px-6 py-section sm:px-10">
      {CRAFT.map((panel) => (
        <article key={panel.index} data-mact={interactive ? '' : undefined}>
          <span className="label-mono text-champagne">
            02 / Craft — {panel.index} · 03
          </span>
          <figure className="relative mt-5 aspect-[4/3] overflow-hidden border border-graphite/50">
            <SiteImage image={panel.image} className="h-full w-full" sizes="100vw" />
            {interactive && (
              <div
                data-mband
                aria-hidden
                className="absolute -inset-y-[18%] left-0 w-[46%] opacity-0 mix-blend-screen blur-xl"
                style={{
                  transform: 'rotate(13deg)',
                  background:
                    'linear-gradient(90deg, transparent, rgba(201,168,76,0.26) 42%, rgba(255,244,220,0.4) 50%, rgba(201,168,76,0.26) 58%, transparent)',
                }}
              />
            )}
          </figure>
          <span className="label-mono mt-6 block text-steel">{panel.label}</span>
          <div className="overflow-hidden">
            <h2
              data-mtitle={interactive ? '' : undefined}
              className="mt-2 font-display text-display-l font-light leading-tight text-platinum"
            >
              {panel.title}
            </h2>
          </div>
          <p className="mt-4 max-w-md font-display text-body text-steel">{panel.line}</p>
        </article>
      ))}
    </div>
  );
}
