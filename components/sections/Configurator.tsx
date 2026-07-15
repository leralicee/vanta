'use client';

import { useMemo, useState } from 'react';
import WatchCanvas from '@/components/WatchCanvas';
import PriceCounter from '@/components/PriceCounter';
import { CONFIG, CONFIG_BASE_PRICE, type ConfigGroup } from '@/lib/content';
import type { StrapKind } from '@/lib/watch-scene';

type Selection = Record<ConfigGroup['key'], string>;

const DEFAULTS: Selection = { case: 'steel', dial: 'noir', strap: 'alligator' };

export default function Configurator() {
  const [sel, setSel] = useState<Selection>(DEFAULTS);

  const optionOf = (group: ConfigGroup) =>
    group.options.find((o) => o.id === sel[group.key]) ?? group.options[0];

  const price = useMemo(() => {
    return CONFIG.reduce((sum, group) => sum + optionOf(group).delta, CONFIG_BASE_PRICE);
  }, [sel]);

  const config = useMemo(() => {
    const caseOpt = CONFIG[0].options.find((o) => o.id === sel.case) ?? CONFIG[0].options[0];
    const dialOpt = CONFIG[1].options.find((o) => o.id === sel.dial) ?? CONFIG[1].options[0];
    return {
      caseColor: caseOpt.swatch,
      dialColor: dialOpt.swatch,
      caseRoughness: sel.case === 'platinum' ? 0.4 : 0.26,
      strap: true,
      strapKind: (sel.strap as StrapKind) ?? 'alligator',
    };
  }, [sel]);

  return (
    <section id="configure" aria-label="Configure and acquire" className="border-t border-graphite bg-vanta">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="relative flex min-h-[60svh] items-center justify-center bg-vanta lg:sticky lg:top-0 lg:h-screen">
          <WatchCanvas config={config} className="aspect-square w-[min(80vw,520px)]" />
          <span className="label-mono absolute bottom-8 left-1/2 -translate-x-1/2 text-steel">
            Drag to rotate
          </span>
        </div>

        <div className="flex flex-col justify-center gap-10 border-graphite px-6 py-section sm:px-12 lg:border-l">
          <header>
            <span className="label-mono text-champagne">06 — Configure</span>
            <h2 className="mt-4 font-display text-display-l font-light text-platinum">
              Make it the only one.
            </h2>
          </header>

          {CONFIG.map((group) => (
            <fieldset key={group.key}>
              <legend className="label-mono mb-4 text-steel">{group.label}</legend>
              <div role="radiogroup" aria-label={group.label} className="flex flex-wrap gap-3">
                {group.options.map((opt) => {
                  const active = sel[group.key] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setSel((s) => ({ ...s, [group.key]: opt.id }))}
                      className={`flex cursor-pointer items-center gap-3 border px-4 py-3 transition-colors duration-slow ease-vanta ${
                        active
                          ? 'border-champagne text-platinum'
                          : 'border-graphite text-steel hover:border-steel'
                      }`}
                    >
                      <span
                        aria-hidden
                        className="h-4 w-4 rounded-full border border-white/10"
                        style={{ backgroundColor: opt.swatch }}
                      />
                      <span className="font-mono text-mono-data">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}

          <div className="mt-2 border-t border-graphite pt-8">
            <div className="flex items-baseline justify-between">
              <span className="label-mono">Total</span>
              <PriceCounter value={price} className="text-3xl text-champagne" />
            </div>
            <button
              type="button"
              className="mt-6 w-full cursor-pointer border border-champagne px-8 py-4 font-mono text-mono-label uppercase tracking-wide text-champagne transition-colors duration-slow ease-vanta hover:bg-champagne hover:text-vanta"
            >
              Acquire
            </button>
            <p className="mt-4 font-mono text-[0.7rem] leading-relaxed text-steel">
              Each piece is made to order. Allow sixteen weeks. A specialist will confirm every detail.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
