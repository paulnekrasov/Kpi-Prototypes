---
name: design-engineering-skill
description: >
  The ultimate design engineering skill. Use this skill proactively whenever the user asks about animations, motion, easing, timing, duration, springs, transitions, animation performance, or UI polish. Also trigger whenever building, reviewing, or improving any frontend UI, component, or interactive interface — even if the user doesn't use the word "animation" or "design." Covers: micro-details that make interfaces feel better (text wrapping, concentric border radius, contextual icon animations, font smoothing, shadows, tabular numbers, optical alignment), animation philosophy and execution (spring physics, easing blueprints, clip-path, interruptibility, stagger, enter/exit patterns), practical tips (button press feedback, tooltip behavior, hover flicker fix, touch targets, blur as fallback), and broader UI quality principles. Trigger keywords: easing, ease-out, cubic-bezier, bounce, spring, keyframes, transform, opacity, fade, slide, scale, hover, microinteraction, Framer Motion, GSAP, CSS transitions, entrance/exit, page transitions, stagger, will-change, GPU, prefers-reduced-motion, modal, dropdown, tooltip, popover, drawer, gesture, drag, button feel, janky, smooth, polish, concentric, border-radius, text-wrap, tabular, font-smoothing, clip-path, shadow.
metadata:
  short-description: The ultimate design engineering skill — UI polish, animation mastery, and interaction quality in one file.
---

# The Ultimate Design Engineering Skill

Great interfaces rarely come from a single decision. They emerge from dozens of small, deliberate choices that compound into something that *feels* right. This skill consolidates expert knowledge into one reference:

1. **Micro-details** — CSS and layout subtleties that add polish (Jakub Krehel)
2. **Animation philosophy & execution** — purposeful motion that enhances without distracting (Emil Kowalski)
3. **Practical tips** — implementations for the most common animation scenarios
4. **Broader principles** — UI/UX quality patterns (userinterface.wiki)
5. **Disney's 12 Principles** — deep animation theory mapped to UI (Dylan Tarre)

## Reference Files

Load these on demand when the task calls for deeper theory or a specific domain. Do **not** load all of them — pick what's relevant.

| File | Load when… |
|---|---|
| `references/disney-12-principles.md` | User asks about squash/stretch, anticipation, arcs, follow-through, staging, or Disney principles by name |
| `references/entrance-exit-patterns.md` | Designing or debugging elements appearing/disappearing — modals, toasts, lists, page transitions |
| `references/micro-interactions.md` | Button states, toggles, checkboxes, badges, form validation, loading indicators |
| `references/joy-delight.md` | Celebrations, success states, achievements, rewards, confetti, Easter eggs |
| `references/performance-diagnosis.md` | Animation jank, frame drops, sluggish UI, battery drain, layout thrashing |

---

## When Reviewing Animations

When reviewing existing animation code, always use a markdown table — never a "Before/After" list:

| Before | After |
|---|---|
| `transform: scale(0)` | `transform: scale(0.95)` |
| `animation: fadeIn 400ms ease-in` | `animation: fadeIn 200ms ease-out` |
| No reduced motion support | `@media (prefers-reduced-motion: reduce) {...}` |

---

## Part 1: Micro-Details That Make Interfaces Feel Better

### Text Wrapping

Use `text-wrap: balance` for headings and short copy. It distributes text evenly across lines, preventing orphaned words.

```css
h1, h2, h3, .headline {
  text-wrap: balance;
}
/* For longer body copy — slightly slower but smarter */
p {
  text-wrap: pretty;
}
```

### Concentric Border Radius

When nesting elements, the outer radius must equal the inner radius plus the padding. Mismatched radii are one of the most common signs of an unpolished interface.

```
outer_radius = inner_radius + padding
```

```css
.card {
  border-radius: 20px;
  padding: 8px;
}
.card-inner {
  border-radius: 12px; /* 20 - 8 = 12 */
}
```

Apply everywhere elements are nested: buttons with icons, cards with images, modals with content.

### Animate Icons Contextually

When icons swap states (copy → check, play → pause), animate `opacity`, `scale`, and `blur` together. This makes the transition feel intentional, not abrupt.

```tsx
<AnimatePresence mode="wait">
  {isCopied ? (
    <motion.span
      key="check"
      initial={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
      transition={{ duration: 0.15 }}
    >
      <CheckIcon />
    </motion.span>
  ) : (
    <motion.span key="copy" /* same pattern */>
      <CopyIcon />
    </motion.span>
  )}
</AnimatePresence>
```

```css
/* CSS-only alternative */
.icon {
  transition: opacity 150ms ease-out, scale 150ms ease-out, filter 150ms ease-out;
}
```

### Font Smoothing (macOS)

On macOS, text can appear heavier than intended. Antialiasing makes it crispy.

```css
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```
```jsx
// Tailwind
<body className="antialiased">
```

### Tabular Numbers

For any number that updates dynamically — counters, timers, prices — use tabular nums so digits don't shift width as values change.

```css
.number, .price, .counter, .timer {
  font-variant-numeric: tabular-nums;
}
```
```jsx
// Tailwind
<span className="tabular-nums">{count}</span>
```

Note: Some fonts (like Inter) visually change numerals when this is applied. Always preview.

### Shadows Instead of Borders

For cards, inputs, and containers in light mode, layered `box-shadow` creates more depth and adapts better to varied backgrounds.

```css
.card {
  box-shadow:
    0px 0px 0px 1px rgba(0, 0, 0, 0.06),
    0px 1px 2px -1px rgba(0, 0, 0, 0.06),
    0px 2px 4px 0px rgba(0, 0, 0, 0.04);
  transition: box-shadow 200ms ease-out;
}
.card:hover {
  box-shadow:
    0px 0px 0px 1px rgba(0, 0, 0, 0.08),
    0px 1px 2px -1px rgba(0, 0, 0, 0.08),
    0px 2px 4px 0px rgba(0, 0, 0, 0.06);
}
```

Shadows use transparency so they adapt to any background color. Solid borders don't.

### Image Depth Outlines

A 1px outline at ~10% opacity adds a subtle visual edge and depth to images.

```css
.image {
  outline: 1px solid rgba(0, 0, 0, 0.1);
  outline-offset: -1px;
}
.dark .image {
  outline-color: rgba(255, 255, 255, 0.1);
}
```

### Optical Alignment

Geometric center ≠ visual center. When a button has an icon + label, the icon side usually needs slightly less padding to *look* balanced.

```css
/* Geometric */
.button { padding: 8px 12px; }

/* Optical — trailing icon, reduce trailing side slightly */
.button-with-trailing-icon { padding: 8px 10px 8px 12px; }
```

Fix in the SVG source when possible. For inline corrections, use small `margin` adjustments.

---

## Part 2: Animation Philosophy

### The Core Philosophy

> "The best animations are the ones you don't notice." — Emil Kowalski

Animation should be **invisible**. When done right, users don't notice animation — they notice the interface *feels good*. If someone says "nice animation," you've probably overdone it.

Purpose-check every animation:
- Does it communicate a state change?
- Does it guide attention?
- Does it respond to a user action?
- Does it reduce cognitive load?

If none of the above: remove it.

### Quick Start Decision Tree

```
Is the element entering or exiting?       → ease-out
Is an on-screen element moving/morphing?  → ease-in-out
Is this a hover or color transition?      → ease
Is this constant-speed motion?            → linear
Will users see this 100+ times daily?     → don't animate it
```

### Timing Reference

| Element Type | Duration |
|---|---|
| Micro-interactions (hover, press, toggle) | 100–150ms |
| Standard UI (tooltips, dropdowns) | 150–250ms |
| Modals, drawers, panels | 200–300ms |
| Complex orchestrations (page transitions) | 400–600ms max |
| Exit animations | ~20% shorter than entrance |
| Stagger delay between items | 30–60ms |

**Never animate for more than 1 second.** If it takes longer, it's a loading screen, not an animation.

**Never animate keyboard-initiated actions.** Raycast has no animations — users open it hundreds of times daily.

**Marketing vs. Product:** Marketing allows longer, more elaborate durations. Product UI must be fast and purposeful.

---

## Part 3: The Easing Blueprint

### ease-out (Most Common)

Use for **user-initiated interactions**: dropdowns, modals, tooltips, any element entering or exiting the screen. Fast start → instant, responsive feeling.

```css
:root {
  --ease-out-quad:  cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --ease-out-cubic: cubic-bezier(0.215, 0.61, 0.355, 1);
  --ease-out-quart: cubic-bezier(0.165, 0.84, 0.44, 1);
  --ease-out-quint: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-out-expo:  cubic-bezier(0.19, 1, 0.22, 1);
  --ease-out-circ:  cubic-bezier(0.075, 0.82, 0.165, 1);
}
```

### ease-in-out (For On-Screen Movement)

Use when **elements already visible need to move**. Mimics natural motion — accelerate, then decelerate.

```css
:root {
  --ease-in-out-quad:  cubic-bezier(0.455, 0.03, 0.515, 0.955);
  --ease-in-out-cubic: cubic-bezier(0.645, 0.045, 0.355, 1);
  --ease-in-out-quart: cubic-bezier(0.77, 0, 0.175, 1);
  --ease-in-out-quint: cubic-bezier(0.86, 0, 0.07, 1);
  --ease-in-out-expo:  cubic-bezier(1, 0, 0, 1);
  --ease-in-out-circ:  cubic-bezier(0.785, 0.135, 0.15, 0.86);
}
```

### ease (For Hover & Color Transitions)

Elegant for gentle state changes. Asymmetrical curve — faster start, slower end.

```css
transition: background-color 150ms ease;
```

### Avoid: ease-in

Makes UI feel sluggish. The slow start delays feedback — the opposite of what interactions need.

### Avoid: linear (for UI)

Only for: marquees/tickers, hold-to-delete progress indicators. Linear feels robotic and unnatural.

### Paired Elements Rule

Elements that animate together must use the **same easing and duration**. Modal + overlay. Tooltip + arrow. Drawer + backdrop. If they move as a unit, they must feel like a unit.

```css
.modal   { transition: transform 200ms ease-out; }
.overlay { transition: opacity  200ms ease-out; }
```

### Spring Physics

Springs feel more natural because they simulate real physics — no fixed duration, maintain velocity when interrupted.

```js
// Duration + bounce (recommended — easier to reason about)
{ type: "spring", duration: 0.5, bounce: 0.2 }

// Traditional physics (more complex)
{ type: "spring", mass: 1, stiffness: 100, damping: 10 }

// Snappy (buttons, toggles)
{ type: "spring", stiffness: 600, damping: 30 }

// Gentle (modals, overlays)
{ type: "spring", duration: 0.45, bounce: 0 }
```

**Bounce guidelines:** Avoid bounce in most UI. Use for drag-to-dismiss and playful interactions only. Keep it subtle (0.1–0.3).

Springs are ideal for gestures that can be interrupted mid-animation.

---

## Part 4: Enter & Exit Patterns

### Standard Enter: Fade + Rise

```tsx
initial={{ opacity: 0, y: 8 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
```

### Standard Exit: More Subtle Than Enter

```tsx
// NOT exit={{ y: "calc(-100% - 4px)" }} — too dramatic
exit={{ opacity: 0, y: -12 }}
```

Exit elements don't need the same drama. Use `-8px` to `-16px`, not full container height.

### Never Animate from scale(0)

```css
/* BAD — pops from nothing */
.element { transform: scale(0); }

/* GOOD — already has visible shape */
.element {
  transform: scale(0.95);
  opacity: 0;
}
.element.visible {
  transform: scale(1);
  opacity: 1;
}
```

Like a deflated balloon — it always has some shape. Never disappears completely.

### Modals

```tsx
initial={{ opacity: 0, scale: 0.96 }}
animate={{ opacity: 1, scale: 1 }}
exit={{ opacity: 0, scale: 0.96 }}
transition={{ type: "spring", duration: 0.45, bounce: 0 }}
```

### Origin-Aware Popovers & Dropdowns

Popovers must scale from their trigger point, not from the element center.

```css
/* Radix UI */
.popover {
  transform-origin: var(--radix-dropdown-menu-content-transform-origin);
}

/* Base UI */
.popover {
  transform-origin: var(--transform-origin);
}
```

### Stagger

```tsx
// Framer Motion
<motion.ul
  initial="hidden"
  animate="visible"
  variants={{
    visible: { transition: { staggerChildren: 0.04 } },
  }}
>
  {items.map(item => (
    <motion.li
      variants={{
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0 },
      }}
    />
  ))}
</motion.ul>
```

```css
/* CSS stagger */
.item { animation: fadeInUp 200ms ease-out backwards; }
.item:nth-child(1) { animation-delay: 0ms; }
.item:nth-child(2) { animation-delay: 40ms; }
.item:nth-child(3) { animation-delay: 80ms; }
/* Stop at 5–7 items. Last item waits too long beyond that. */
```

- Lead with the most important element
- Background → container → content → actions
- Exit in reverse order, or all at once
- Keep stagger groups to 3–7 items max

### Split & Stagger Hero Sections

For page headers, animate sections individually — not one big block:

```tsx
<motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
  <Headline />
</motion.div>
<motion.div /* delay: 0.1 */>
  <Description />
</motion.div>
<motion.div /* delay: 0.2 */>
  <CTAButtons />
</motion.div>
```

For headings, split into individual word `<span>` elements with ~80ms stagger.

---

## Part 5: Clip-Path Animations

`clip-path` is hardware-accelerated, causes zero layout shift, and enables creative effects impossible with height/width animations.

### Image Reveal

```css
.image-reveal {
  clip-path: inset(0 0 100% 0);
  animation: reveal 0.8s cubic-bezier(0.77, 0, 0.175, 1) forwards;
}

@keyframes reveal {
  to { clip-path: inset(0 0 0 0); }
}
```

Trigger on scroll with `IntersectionObserver` or Framer Motion's `useInView`.

### Seamless Tab Transitions

Instead of animating `color` (never seamless), overlay a duplicated active tab list and animate `clip-path` to reveal only the active tab:

```css
.tabs-overlay {
  clip-path: inset(0px 75% 0px 0% round 17px);
  transition: clip-path 200ms var(--ease-out-smooth);
}
```

### Theme Switch Animation

```css
.new-theme-layer {
  clip-path: inset(0 0 100% 0);
  animation: revealTheme 0.6s cubic-bezier(0.77, 0, 0.175, 1) forwards;
}
@keyframes revealTheme {
  to { clip-path: inset(0 0 0 0); }
}
```

### Comparison Slider

Overlay two images. Animate `clip-path: inset(0 X% 0 0)` based on drag position. GPU-accelerated, no extra DOM elements needed.

### Scroll Progress Line

```tsx
const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
const clipPathY = useTransform(scrollYProgress, [0, 1], ["100%", "0%"]);
const motionClipPath = useMotionTemplate`inset(0 0 ${clipPathY} 0)`;

<motion.div style={{ clipPath: motionClipPath }} />
```

---

## Part 6: Practical Tips (Common Scenarios)

| Scenario | Solution |
|---|---|
| Make buttons feel responsive | `transform: scale(0.97)` on `:active` |
| Element appears from nowhere | Start `scale(0.95)` not `scale(0)` |
| Shaky/jittery animations | Add `will-change: transform` |
| Hover causes flicker | Animate the child, not the parent |
| Popover scales from wrong point | Set `transform-origin` to trigger |
| Sequential tooltips feel slow | Skip delay/animation after first tooltip |
| Small buttons hard to tap | 44px minimum hit area via pseudo-element |
| Something still feels off | Add subtle blur (under 20px) to mask it |
| Hover triggers on mobile | `@media (hover: hover) and (pointer: fine)` |

### Button Press Feedback

```css
button:active {
  transform: scale(0.97);
  transition-duration: 0ms; /* immediate */
}
button:not(:active) {
  transition: transform 150ms ease-out;
}
```

### Hover Flicker Fix

When hover moves the element, the cursor leaves, causing flicker. Animate the child instead.

```html
<div class="card">
  <div class="card-inner"></div>
</div>
```
```css
.card:hover .card-inner {
  transform: translateY(-4px);
}
.card-inner {
  transition: transform 200ms ease-out;
}
```

### Tooltip Instant-Follow

```css
.tooltip {
  transition: transform 125ms ease-out, opacity 125ms ease-out;
  transform-origin: var(--transform-origin);
}
.tooltip[data-starting-style],
.tooltip[data-ending-style] {
  opacity: 0;
  transform: scale(0.97);
}
/* Skip animation for subsequent tooltips */
.tooltip[data-instant] {
  transition-duration: 0ms;
}
```

Radix UI and Base UI both support `data-instant` natively.

### Touch Target Size

```css
/* Minimum 44px tap target without changing layout */
.icon-button {
  position: relative;
}
.icon-button::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-height: 44px;
  min-width: 44px;
  z-index: 9999;
}
```

### Blur as a Transition Aid

When easing and timing still feel off, blur bridges the visual gap between states.

```tsx
initial={{ opacity: 0, filter: "blur(2px)" }}
animate={{ opacity: 1, filter: "blur(0px)" }}
exit={{ opacity: 0, filter: "blur(2px)" }}
```

Keep blur under 20px — especially on Safari. Blur is expensive.

### Disable Hover on Touch Devices

```css
@media (hover: hover) and (pointer: fine) {
  .card:hover {
    transform: scale(1.05);
  }
}
```

Tailwind v4's `hover:` utility applies this automatically.

---

## Part 7: Performance

### The Golden Rule

Only animate `transform` and `opacity`. These skip layout and paint, running entirely on the GPU compositor thread.

**Never animate:**
- `padding`, `margin`, `height`, `width` — triggers full layout reflow
- `blur` above 20px — expensive, especially Safari
- `background-color` without a composited layer strategy

### CSS vs. JavaScript Animations

- **CSS transitions/animations:** Run off main thread. Best for simple, predetermined, non-dynamic animations.
- **Framer Motion / React Spring:** Use `requestAnimationFrame`. Best for dynamic, interruptible, physics-based animations. Can drop frames when main thread is busy.
- **WAAPI:** Hardware-accelerated. Best when you want JS control with CSS-level performance.

```jsx
// Framer Motion — hardware accelerated (transform as string)
<motion.div animate={{ transform: "translateX(100px)" }} />

// NOT hardware accelerated (but more readable)
<motion.div animate={{ x: 100 }} />
```

### will-change

```css
/* Apply before animation, remove after */
.pre-animate {
  will-change: transform;
}
/* Never leave permanently */
```

### Interruptibility

CSS transitions are interruptible. CSS `@keyframes` are not — they restart from zero.

Use **transitions** for interaction states. Use **`@keyframes`** only for staged one-shot sequences (page load, entrance animations).

Framer Motion's `animate` is always interruptible. Springs maintain velocity when interrupted — a major UX advantage for gestures.

---

## Part 8: Accessibility

### prefers-reduced-motion (Required — No Exceptions)

Every animated element needs its own media query. No `!important` — just disable cleanly.

```css
.modal {
  animation: fadeIn 200ms ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .modal {
    animation: none;
  }
}
```

```jsx
// Framer Motion
import { useReducedMotion } from "framer-motion";

function Component() {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    />
  );
}
```

- Disable **all** animations — including opacity and color changes
- Replace autoplaying videos with a play button
- This is not optional

---

## Part 9: Broader Principles

### Every Action Needs Feedback

The interface should acknowledge every user action immediately. Submitting a form → loading state. Copying → check icon. Deleting → visual removal. A subtle `scale(0.97)` on press costs nothing and makes everything feel 10× more responsive.

### Instant-On Hover, Ease-Off Unhover

```css
.interactive {
  transition: transform 150ms ease-out;
}
.interactive:hover {
  transform: translateY(-2px);
  transition-duration: 0ms; /* snap to hover state */
}
```

Never the reverse. Hover should feel instant; release should ease.

### Consistent Motion Direction

Pick a direction convention and never break it. If modals enter from below, they exit to below. If dropdowns open downward, they close downward. Inconsistency makes interfaces feel chaotic and broken.

### The "Would I Notice If It Were Gone?" Test

Before shipping any animation: if a user wouldn't notice its absence, reconsider. The best interactions are *felt*, not seen.

### Don't Animate What's Seen Hundreds of Times

An animation that delights on first interaction becomes friction by the hundredth. Reduce or eliminate animations on: repeated keyboard actions, dense list interactions, elements used constantly throughout the day.

### Use Radix UI / Base UI for Primitives

These libraries handle accessibility, keyboard navigation, and animation primitives (transform-origin CSS vars, data-instant for tooltips) correctly out of the box. Prefer them over hand-rolling dialog, dropdown, tooltip, and select.

### Take Breaks Before Shipping Animations

Don't code and ship animations in one sitting. The best animations are reviewed with fresh eyes the next day. Imperfections invisible at 2am become obvious after sleep.

### When NOT to Animate

- Form validation errors (use color/icon/text — speed matters)
- Critical error states (never delay bad news)
- Content the user is actively reading
- High-frequency live data (timers, charts, live counters)
- Keyboard-driven actions used repeatedly per session

---

## Quick Reference Checklist

Before shipping any UI component:

**Layout & Polish**
- [ ] Headings use `text-wrap: balance`
- [ ] Nested elements use concentric border radius (`outer = inner + padding`)
- [ ] Dynamic numbers use `tabular-nums`
- [ ] Body uses `-webkit-font-smoothing: antialiased` globally
- [ ] Cards/inputs use layered `box-shadow`, not solid borders (light mode)
- [ ] Images have `outline: 1px solid rgba(0,0,0,0.1); outline-offset: -1px`
- [ ] Icon/label alignment is optical, not purely geometric

**Animation**
- [ ] Interactions stay under 300ms; complex sequences under 600ms
- [ ] Exits are shorter/more subtle than enters
- [ ] Easing uses `ease-out` for enter, `ease-in-out` for on-screen movement (custom curves preferred)
- [ ] No `linear` or `ease-in` on UI elements
- [ ] Interactions use CSS `transition` (interruptible), not `@keyframes`
- [ ] Nothing animates from `scale(0)` — start at 0.93+
- [ ] Popovers/dropdowns use `transform-origin` from trigger
- [ ] Only `transform` and `opacity` are animated (no `width`/`height`/`margin`)
- [ ] Paired elements share easing and duration
- [ ] `prefers-reduced-motion` is respected on every animated element

**Behavior**
- [ ] Every user action has immediate visual feedback
- [ ] Buttons have `scale(0.97)` on `:active`
- [ ] Hover states snap on, ease off
- [ ] Subsequent tooltips appear instantly without animation
- [ ] Keyboard actions have no animation
- [ ] Touch targets are minimum 44px
- [ ] Hover effects are disabled on touch devices

---

> *"All those unseen details combine to produce something that's just stunning, like a thousand barely audible voices all singing in tune."* — Paul Graham

*Sources: Jakub Krehel · Emil Kowalski (animations.dev) · userinterface.wiki · Dylan Tarre (animation-principles)*
