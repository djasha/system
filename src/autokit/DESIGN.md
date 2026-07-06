# AutoKit Labs — design rules and rationale

Read this before designing anything AutoKit. The system exists so that a new
bundle's complete visual identity — funnel, store assets, and the documents
inside the bundle — is a **mechanical step measured in hours, not a design
project**. Target cadence: at least one new bundle through the pipeline per
week.

> Drafted 2026-07-04 from the approved v4 direction (warm-paper, real product
> mockups) after the earlier neon-SaaS system was rejected. If a canonical
> DESIGN doc exists elsewhere (Google Docs), replace this file with it.

## 1. Identity

**Warm-paper playful-premium.** A boxed kit you'd enjoy unpacking: cream paper
surfaces, chunky toy-like components, hard offset shadows, one loud display
face. Personality comes from real product mockups (terminal, phone chat,
printed guides), custom stroke icons, and the mascot — never from neon
gradients, glassmorphism, dark-SaaS clichés, or stock 3D blobs. If it looks
like a template, it's wrong ("AI slop" is the failure mode this replaced).

## 2. Tokens (`tokens/tokens.css`)

- **Surfaces** `--bg / --bg-2 / --card / --line / --line-2 / --shadow` — warm
  paper, light + dark via `[data-theme="dark"]`.
- **Ink** `--ink / --ink-2 / --ink-3` — warm near-black steps; `--ink-3` is
  the lightest text allowed on `--bg` (4.6:1).
- **Accent layer** `--accent / --accent-text / --accent-deep / --accent-soft /
  --btn-bg / --btn-edge` — the ONLY layer bundle themes override.
- **Fixed semantics** — amber = bonus/extra, `--live` green = alive/status,
  `--term` = terminal panels. These never change per bundle.
- **Type** — Bricolage Grotesque 700–800 (display, carries the personality),
  Archivo 400–700 (body, stays calm), Fragment Mono (uppercase tracked meta).

**The contrast rule:** bright accents are for fills, strokes, and icons only.
Any colored TEXT uses the `-text` variant, WCAG-checked (≥4.5:1) on `--bg`
and `--card`, in both light and dark. No exceptions, no eyeballing.

## 3. Per-bundle theming (`tokens/themes/`)

- One class per bundle on `<body>`: `bundle-openclaw` (lobster red),
  `bundle-hermes` (messenger amber), `bundle-botbento` (bento teal, proposed),
  `bundle-vault` (vault plum, proposed).
- A theme overrides the accent layer only. If a theme wants to touch surfaces
  or ink, the core tokens are wrong — fix them for everyone or don't.
- **Never fork components per bundle.** Same catalog, different accent.
- **Lobby the lobster appears ONLY on OpenClaw bundles.** Enforced in theme
  CSS (`.mascot-lobby` display gate). Other bundles get their own mark
  (Hermes: winged bolt), never a recolored lobster.
- New bundle = copy `themes/_template.css`, fill six variables + dark block,
  verify contrast, preview in `components/catalog.html`. That's the whole
  design step for a new product.

## 4. Motion (`motion/gsap-recipes.js`)

- **CSS owns** ambient loops (marquee, mascot bob, pulse dots) and all hovers.
- **GSAP owns** entrances, scroll choreography, pointer effects — created only
  inside `gsap.matchMedia('(prefers-reduced-motion: no-preference)')`.
- Reduced motion is respected at **three layers**: CSS media block, GSAP
  matchMedia, static fallbacks for JS-composed states.
- Pages work with JavaScript off — hidden states sit behind the `.js` class
  gate, so no-JS users see the complete page.
- Reveals are `once: true`; content never re-hides. Pointer recipes gate on
  `(pointer:fine)`. Transforms and opacity only.

## 5. Buyer-facing copy

Competence is the persuasion channel. See the published voice entry
(`autokit-funnel-copy`) for the full ruleset with examples:

1. No income guarantees — promise a working agent, never revenue.
2. No fake urgency, scarcity, or testimonials. Real constraints stated plainly.
3. Name real risks and failure modes — "every silent failure named".
4. Refund terms in plain words next to every price.
5. Emoji are personality accents in copy only — never UI iconography (use the
   catalog icon set).
6. Every prompt artifact carries the review-step footer: the human decides.

## 6. In-bundle artifacts (`product-artifacts/`)

The design system extends INSIDE the bundle — buyers judge the purchase by
page 1 of the PDF, not the funnel. Print templates (prompt card A5 landscape,
guide cover A4 portrait) share the same tokens and type. Covers state
verified time/result numbers and a version + "commands verified" date that
must match the guide contents.

## 7. Weekly bundle checklist

For each new bundle through the pipeline:

1. `tokens/themes/<bundle>.css` from `_template.css` — accent + dark block,
   contrast verified (minutes).
2. Bundle mark (not a mascot unless it earns one; lobster stays OpenClaw's).
3. Funnel: clone the current best funnel skeleton, swap theme class, mark,
   copy, part cards, and pricing. Checkout links stay `PLACEHOLDER` until the
   hosted checkout URL is approved.
4. Artifacts: covers + prompt cards from the templates, footer versions set.
5. QA gates: no-JS pass, reduced-motion pass, dark-mode pass, `-text`
   contrast pass, copy rules pass (§5).
6. Publish the theme (and any new components) to system.djasha.me via PR.
