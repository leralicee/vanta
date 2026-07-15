'use client';

import SiteImage from '@/components/SiteImage';
import { COLLECTION, type CollectionModel } from '@/lib/content';

export default function Collection() {
  return (
    <section id="collection" aria-label="The collection" className="bg-onyx px-6 py-section sm:px-10">
      <header className="mx-auto mb-16 max-w-6xl">
        <span className="label-mono text-champagne">02 — Collection</span>
        <h2 className="mt-4 max-w-2xl font-display text-display-l font-light text-platinum">
          Three references. We do not make many.
        </h2>
      </header>

      <ul className="mx-auto grid max-w-6xl grid-cols-1 gap-px overflow-hidden border border-graphite md:grid-cols-3">
        {COLLECTION.map((model) => (
          <ModelCard key={model.reference} model={model} />
        ))}
      </ul>
    </section>
  );
}

function ModelCard({ model }: { model: CollectionModel }) {
  return (
    <li className="bg-vanta">
      <article
        tabIndex={0}
        className="group flex h-full cursor-pointer flex-col p-7 outline-none transition-colors duration-slow ease-vanta focus-visible:bg-onyx sm:p-9"
      >
        <div className="relative mb-8 flex aspect-[4/5] items-center justify-center">
          <div
            aria-hidden
            className="absolute bottom-6 left-1/2 h-6 w-2/3 -translate-x-1/2 transition-all duration-slow ease-vanta group-hover:w-[88%] group-hover:opacity-50 group-focus-visible:w-[88%]"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.8), transparent 72%)',
              opacity: 0.7,
              filter: 'blur(6px)',
            }}
          />
          <div className="relative h-full w-full transition-transform duration-slow ease-vanta will-change-transform group-hover:-translate-y-4 group-hover:scale-[1.04] group-focus-visible:-translate-y-4">
            <SiteImage image={model.image} className="h-full w-full" sizes="(max-width:768px) 100vw, 33vw" />
          </div>
        </div>

        <div className="flex items-baseline justify-between">
          <h3 className="font-display text-3xl font-light text-platinum">
            VANTA {model.name}
          </h3>
          <span className="label-mono">{model.reference}</span>
        </div>
        <p className="mt-2 font-display text-body italic text-steel">{model.note}</p>

        <div className="hairline my-6 h-px opacity-60" />

        <dl className="space-y-2.5">
          {model.specs.map((spec) => (
            <div key={spec.label} className="flex items-baseline justify-between gap-4">
              <dt className="label-mono">{spec.label}</dt>
              <dd className="font-mono text-mono-data text-platinum/90">{spec.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-7 flex items-center justify-between">
          <span className="gold-underline font-mono text-mono-data text-steel transition-colors duration-slow group-hover:text-champagne group-focus-visible:text-champagne">
            Enquire
          </span>
          <span className="font-mono text-xl tracking-wide text-champagne">{model.price}</span>
        </div>
      </article>
    </li>
  );
}
