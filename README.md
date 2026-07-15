# VANTA

> *Time, perfected. Then left alone.* — A luxury watch maison website. Obsessive precision, quiet power, timelessness. Every pixel deliberate.

A dark, mobile-first experience for a fictional watch maison. The brand thesis is **subtraction**: a near-perfect void from which a single object emerges, lit like a specimen.

## Stack

- **Next.js 14** (App Router) + **TypeScript** (strict, `no-explicit-any` enforced)
- **Tailwind CSS** — design tokens in `tailwind.config.ts`
- **Three.js** (raw, no R3F) — the WebGL watch, with deliberate `dispose()` discipline
- **GSAP + ScrollTrigger** — the movement self-draw and the pinned heritage timeline
- Custom **magnetic cursor** (rAF lerp toward `[data-magnetic]` targets)

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint     # eslint (no-any enforced)
npm run typecheck
```

## Design tokens

| Token | Hex | Role |
|---|---|---|
| `vanta` | `#0A0A0A` | the void, page base (~85% of any view) |
| `onyx` | `#141414` | raised surfaces, panels, cards |
| `graphite` | `#222222` | hairline borders, dividers |
| `platinum` | `#E8E8E8` | primary text, cold light on metal |
| `steel` | `#8A8A8A` | secondary text, mono labels |
| `champagne` | `#C9A84C` | **the only warm thing** — rationed to ~1 element per view |
| `gold-hi` / `gold-lo` | `#E3C977` / `#9A7B2E` | specular highlight / shadow of gold |

Type: **Cormorant** (display + editorial; Light 300 for the logotype) and **JetBrains Mono** (all specs, numbers, prices, clock, labels — `tabular-nums`), both self-hosted via `next/font`. Two faces only — "no excess" is a typographic rule here. Minimum transition **0.8s** (`duration-slow`/`duration-slower`, `ease-vanta`/`ease-sweep`).

## Sections

1. **Hero** — a single WebGL watch in the void; pointer rotates it in 3D with inertia; tagline reveals letter-by-letter (`components/sections/Hero.tsx`).
2. **Craft** — fullscreen scroll-snap panels, one detail per screen, title rises from behind the image.
3. **Collection** — three references, hover lifts the watch with a stretched shadow; specs/price always in monospace.
4. **Movement** — animated SVG schematic that self-draws on scroll, oscillating balance wheel; callouts positioned on desktop, listed below on mobile.
5. **Heritage** — pinned horizontal gold timeline that self-draws 1971→present (vertical list on mobile / reduced motion).
6. **Configure & Buy** — split screen; the WebGL watch reflects material choices live; the price counter eases to its new value.

Persistent: a fixed **HUD** (wordmark, MENU, live clock with gold seconds), a focus-trapped **full-screen overlay nav** (no hamburger), and the **magnetic cursor**.

## The WebGL watch

`hooks/useThreeWatch.ts` owns the React lifecycle (renderer, camera, pointer rotation, the rAF loop — paused off-screen and on tab-hide — and **complete disposal** of model, environment and renderer on unmount). The scene itself is built in `lib/watch-scene.ts` (`buildWatch`, `createStudioEnvironment`, `addLights`, `setWatchHands`), each returning its own `dispose()`. The watch is procedural (case, gold bezel, dial, indices, real-time hands); drop in a GLTF later by swapping `buildWatch`. If WebGL is unavailable, `WatchCanvas` falls back to a still image.

## Imagery

The hero and configurator watches are live WebGL — no image needed. The remaining
photography lives in `public/images/` and is rendered through `components/SiteImage.tsx`,
which lazy-loads each shot and falls back to a quiet matte panel if a file is missing.
Image paths and alt text are defined alongside the copy in `lib/content.ts`.

## Accessibility & motion

`prefers-reduced-motion` is honored everywhere: the WebGL watch renders a single static frame, the magnetic cursor disables (native cursor restored), scroll-snap and the heritage pin turn off, and a global CSS net (`app/globals.css`) zeroes any remaining animation. The clock keeps ticking — it is information, not decoration. The overlay nav is a focus-trapped dialog; specs and prices are never hidden behind hover; focus rings are champagne and visible.

## Architecture notes

- `hooks/useGsapContext.ts` — reduced-motion gate + scoped `gsap.context` lifecycle (Movement, Heritage).
- `hooks/useReducedMotion.ts` — the single motion gate; defaults to reduced until known.
- `lib/content.ts` — all copy, specs, configurator options and image references.
- WebGL initialises client-side only (mounted gate) to stay SSR-safe.
