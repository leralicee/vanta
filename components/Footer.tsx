import { FOOTER, SITE } from '@/lib/content';

export default function Footer() {
  return (
    <footer className="border-t border-graphite bg-vanta px-6 py-20 sm:px-10">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <span className="font-display text-2xl font-light tracking-brand text-platinum">
            {SITE.name}
          </span>
          <p className="mt-4 max-w-[16rem] font-display text-body text-steel">
            {SITE.tagline}
          </p>
        </div>

        {FOOTER.columns.map((col) => (
          <div key={col.label}>
            <span className="label-mono text-champagne">{col.label}</span>
            <ul className="mt-4 space-y-2.5">
              {col.items.map((item) => (
                <li key={item}>
                  <span className="gold-underline cursor-default font-mono text-mono-data text-steel transition-colors duration-slow hover:text-platinum">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-16 flex max-w-6xl items-center justify-between border-t border-graphite pt-6">
        <span className="label-mono">{SITE.reference}</span>
        <span className="label-mono">{FOOTER.closing}</span>
      </div>
    </footer>
  );
}
