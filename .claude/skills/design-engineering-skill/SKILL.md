---
name: design-engineering-skill
description: Design engineering reference for building interfaces that feel alive, polished, and human. Use this skill proactively whenever the user is working on animations, micro-interactions, hover states, entrance/exit transitions, UI polish, easing curves, spring physics, delight moments, performance jank, or any "this feels off" UI problem. Also triggers on: "make it feel better", "add some life to it", "the animation feels wrong", "it's too stiff", "add micro-interactions", "make it more polished", "feels robotic", "animate the icon", "celebration/success state", "concentric radius", "squash and stretch", "Disney principles". Synthesizes Emil Kowalski, Jakub Krehel, Raphael Salaja, and Dylan Tarre.
---

# Design Engineering Skill

A unified reference for building interfaces that feel right — natural, fast, alive, and polished. Synthesized from Emil Kowalski (animations.dev), Jakub Krehel (jakub.kr), Raphael Salaja (userinterface.wiki), and Dylan Tarre's animation series.

---

## When to load reference files

Load on demand — don't load all files upfront:

| Task | Load |
|---|---|
| Choosing easing, duration, spring config | `references/web-animations.md` |
| Button states, toggles, checkboxes, icon swaps, form validation, loading | `references/micro-interactions.md` |
| Modal, toast, dropdown, sidebar, list add/remove, page transition | `references/entrance-exit-patterns.md` |
| Success states, confetti, like button, achievement unlock, onboarding | `references/joy-delight.md` |
| Choppy animation, frame drops, jank, Safari blur lag, layout thrashing | `references/performance-diagnosis.md` |
| Diagnosing "something feels off" using Disney vocabulary | `references/disney-12-principles.md` |
| Text wrapping, concentric radius, shadow vs. border, tabular nums, stagger | `references/make-interfaces-feel-better.md` |
| clip-path reveals, tabs transition, interruptibility, cohesion | `references/userinterface-wiki.md` |
| Practical tips for buttons, tooltips, hover flicker, blur trick | `references/web-animations/practical-tips.md` |

---

## Core Philosophy

> "The best animations are the ones you don't notice." — Emil Kowalski

**Animations communicate, not decorate.** Before adding motion, ask:
1. Is this solving a communication problem or a decoration problem?
2. How often will the user see this? (100+/day → no animation, or barely perceptible)
3. Does removing it break the interaction or just make it less visually interesting?

**Nothing in the world disappears instantly.** Changes that happen without transition feel artificial. Even 150ms of ease-out makes an interface feel grounded in reality.

---

## The Four Easing Questions (decide in 10 seconds)

```
Is the element entering or exiting the viewport?  → ease-out
Is it moving/morphing while already on screen?    → ease-in-out
Is it a hover or color change?                    → ease
Is it constant motion (ticker, progress bar)?     → linear
Default:                                          → ease-out
```

**Never use `ease-in` for UI** — the slow start delays visual feedback and makes the interface feel sluggish.

---

## Duration Quick Reference

| Element type | Duration |
|---|---|
| Hover state, button tap | 100–150ms |
| Tooltip, dropdown, menu | 150–250ms |
| Modal, drawer, sidebar | 200–300ms |
| Page transition | 250–350ms max |
| Success / delight | 300–600ms |

**Rules:**
- Stay under 300ms for standard UI
- Exits should be 20–30% faster than entrances (users are waiting to act)
- Larger elements animate slower than smaller ones
- Keyboard-initiated actions: never animate

---

## Performance Ground Rules

Only animate `transform` and `opacity`. These run on the GPU compositor thread — they skip layout and paint entirely.

```css
/* GPU-accelerated (smooth) */
.element { transform: translateY(-4px); }
.element { opacity: 0; }

/* Triggers layout (expensive — avoid animating) */
.element { top: -4px; }
.element { height: 0; }
.element { margin-top: -4px; }
```

For height/width reveals: use `clip-path: inset()` instead — GPU-accelerated, no layout shift.

Always add `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  .element { animation: none; transition: none; }
}
```

---

## Instant Wins (apply without reading references)

**1. Button press feedback:**
```css
button:active { transform: scale(0.97); transition: transform 100ms ease-out; }
```

**2. Don't animate from `scale(0)` — use `scale(0.95)` + `opacity: 0`:**
```css
/* Bad: pops from nowhere */     transform: scale(0)
/* Good: deflates, then expands */ transform: scale(0.95); opacity: 0;
```

**3. Concentric border radius:**
```
outer_radius = inner_radius + padding
/* Card with 8px padding → inner element gets border-radius: (card-radius - 8px) */
```

**4. Hover: instant on, ease off:**
```css
.button:hover { transition-duration: 0ms; }    /* snap to hover state */
.button        { transition: transform 150ms ease-out; } /* ease back on leave */
```

**5. Text rendering:**
```css
html { -webkit-font-smoothing: antialiased; }
h1, h2, h3 { text-wrap: balance; }
.counter, .price { font-variant-numeric: tabular-nums; }
```

**6. Shadows over borders (light mode depth):**
```css
.card {
  box-shadow:
    0px 0px 0px 1px rgba(0,0,0,0.06),
    0px 1px 2px -1px rgba(0,0,0,0.06),
    0px 2px 4px 0px rgba(0,0,0,0.04);
}
```

**7. Icon state swap (copy → check):**
```tsx
<AnimatePresence mode="wait">
  <motion.span
    key={state}
    initial={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}
    animate={{ opacity: 1, scale: 1,   filter: 'blur(0px)' }}
    exit={{    opacity: 0, scale: 0.8, filter: 'blur(4px)' }}
    transition={{ duration: 0.15 }}
  />
</AnimatePresence>
```

---

## "Something Feels Wrong" Diagnostic

If an animation feels off but you can't name why, find the symptom below and load the referenced file for the fix.

| Symptom | Likely cause | Load |
|---|---|---|
| Mechanical / robotic | `linear` easing — use `ease-out` | `web-animations.md` |
| Pops in from nowhere | Scale starts at 0, no opacity | `entrance-exit-patterns.md` |
| Feels slow / heavy | Duration too long | `web-animations.md` |
| Confusing focal point | Competing animations (staging issue) | `disney-12-principles.md` |
| Hover flicker loop | Animating parent that moves cursor off it | `web-animations/practical-tips.md` |
| Popover scales from center | Wrong `transform-origin` | `web-animations/practical-tips.md` |
| Everything stops at once | Missing stagger / follow-through | `disney-12-principles.md` |
| Choppy / frame drops | Animating layout properties | `performance-diagnosis.md` |
| Shaky 1px shift | Missing `will-change: transform` | `performance-diagnosis.md` |
| Too cartoony | Exaggeration overdone (> 10% for product UI) | `disney-12-principles.md` |
| Blur lags (especially Safari) | `filter: blur()` > 20px | `performance-diagnosis.md` |

---

## Spring vs. CSS: When to Choose

**CSS transitions** — prefer for standard UI open/close, hover, focus. Off the main thread. Interruptible.

**Springs (Framer Motion)** — prefer when the interaction should feel alive, physical, or maintain velocity on interruption. Drag gestures, toggles, Dynamic Island–style animations.

```js
// Spring presets (Framer Motion)
{ type: "spring", duration: 0.5, bounce: 0.2 }   // standard spring
{ type: "spring", stiffness: 400, damping: 25 }   // snappy
{ type: "spring", duration: 0.45, bounce: 0 }     // smooth, no overshoot
```

Avoid bounce in most professional UI contexts. Use bounce (0.1–0.3) for toggles, drag interactions, delight moments.

---

## Review Format

When reviewing an animation, always use a table:

| Before | After |
|---|---|
| `transform: scale(0)` | `transform: scale(0.95); opacity: 0` |
| `animation: fadeIn 400ms ease-in` | `animation: fadeIn 200ms ease-out` |
| No `prefers-reduced-motion` | `@media (prefers-reduced-motion: reduce) {...}` |
| `border: 1px solid rgba(0,0,0,0.1)` | `box-shadow: 0px 0px 0px 1px rgba(0,0,0,0.06), ...` |
