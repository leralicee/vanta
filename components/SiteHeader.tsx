'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Clock from '@/components/Clock';
import { NAV, SITE } from '@/lib/content';

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  const go = useCallback((href: string) => {
    setOpen(false);
    const el = document.querySelector(href);
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      const first = overlayRef.current?.querySelector<HTMLElement>('a, button');
      first?.focus();
    } else {
      document.body.style.overflow = '';
      menuButtonRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        return;
      }
      if (e.key !== 'Tab') return;
      const nodes = overlayRef.current?.querySelectorAll<HTMLElement>('a, button');
      if (!nodes || nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-hud">
        <div className="mx-auto flex items-center justify-between px-5 py-4 sm:px-8">
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              go('#hero');
            }}
            className="font-display text-xl font-light tracking-brand text-platinum sm:text-2xl"
          >
            {SITE.name}
          </a>

          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-haspopup="dialog"
            className="label-mono gold-underline text-platinum transition-colors duration-slow ease-vanta hover:text-champagne"
          >
            Menu
          </button>

          <div className="hidden sm:block">
            <Clock />
          </div>
        </div>
        <div className="hairline mx-5 h-px opacity-60 sm:mx-8" />
      </header>

      <div
        ref={overlayRef}
        role="dialog"
        aria-modal="true"
        aria-label="Main navigation"
        aria-hidden={!open}
        className="fixed inset-0 z-nav flex flex-col bg-vanta transition-[clip-path] duration-slower ease-sweep"
        style={{
          clipPath: open ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)',
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        <div className="flex items-center justify-between px-5 py-4 sm:px-8">
          <span className="font-display text-xl font-light tracking-brand text-platinum sm:text-2xl">
            {SITE.name}
          </span>
          <button
            type="button"
            onClick={close}
            className="label-mono gold-underline text-platinum transition-colors duration-slow ease-vanta hover:text-champagne"
          >
            Close
          </button>
        </div>

        <nav className="flex flex-1 flex-col justify-center gap-2 px-5 sm:px-8">
          {NAV.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                go(link.href);
              }}
              className="group flex items-baseline gap-5 py-2"
            >
              <span className="label-mono w-8 text-steel transition-colors group-hover:text-champagne">
                {link.index}
              </span>
              <span className="gold-underline font-display text-[clamp(2.5rem,9vw,6rem)] font-light leading-none text-platinum transition-colors duration-slow ease-vanta group-hover:text-champagne">
                {link.label}
              </span>
            </a>
          ))}
        </nav>

        <div className="flex items-center justify-between px-5 pb-6 sm:px-8">
          <span className="label-mono">{SITE.reference}</span>
          <Clock />
        </div>
      </div>
    </>
  );
}
