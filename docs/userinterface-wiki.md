# User Interface Wiki — Design Engineering Principles
*Source: Raphael Salaja — userinterface.wiki*

A living collection of articles, patterns, and best practices for designing and building user interfaces. This reference captures the core principles from the wiki, distilled for use in code and design decisions.

---

## Great Animations Feel Natural

People love the Dynamic Island. It feels natural, almost like a living organism.

Changes in web apps often occur instantly, which makes the experience feel artificial and unfamiliar — nothing in the world around us disappears or appears instantly.

**Spring animations** are the primary tool for natural motion. Springs have natural overshoot and settle. Use them for interactions that should feel alive, organic, or physical.

```js
// Framer Motion — spring presets
{ type: "spring", duration: 0.5, bounce: 0.2 }   // standard
{ type: "spring", stiffness: 400, damping: 25 }   // snappy
{ type: "spring", duration: 0.45, bounce: 0 }     // smooth, no bounce
```

**Why CSS transitions feel different from springs:** CSS transitions have a fixed duration. Springs have natural physics — they can be interrupted, maintain velocity, and settle organically. Mobile apps feel better than web apps largely because they use springs for everything.

---

## Great Animations Are Fast

Fast animations improve perceived performance. A snappier spinner feels like it's working harder, even if load time is identical. A 180ms select animation feels more responsive than 400ms.

**Snappy animations feel responsive and connected to user actions.**

The best easing for this purpose is `ease-out`. It starts fast and slows down at the end — giving the impression of a quick response while maintaining a smooth transition.

Your animations should generally be shorter than 300ms.

```css
/* Responsive feel */
.element {
  transition: transform 200ms ease-out;
}
```

---

## Great Animations Have a Purpose

It's easy to start adding animations everywhere. Users become overwhelmed and animations lose their impact. Pace them through the experience — add them where they enrich information.

**Good uses of animation:**
- Indicate a change in state (App Store card expansion)
- Enter/exit animations for modals
- Explaining how something works (onboarding, data viz)

**Never animate keyboard-initiated actions.** These are repeated sometimes hundreds of times a day. An animation makes them feel slow and disconnected from user actions.

> Raycast has no animations and it feels right.

**Before adding an animation, consider:** How often will the user see it? The more frequent, the shorter or absent the animation should be.

---

## Great Animations Are Performant

If animations don't run at 60 frames per second, everything else becomes useless.

**Rule of thumb:** Animate with `transform` and `opacity` — they only trigger the composite rendering step. Animating `padding` or `margin` triggers all three (layout, paint, composite). Less work for the browser = smoother motion.

**Hardware-accelerated options (smooth even on a busy main thread):**
- CSS transitions/animations
- WAAPI (Web Animations API)

**Not hardware-accelerated (can drop frames if main thread is busy):**
- Framer Motion (uses `requestAnimationFrame`)
- Any JS-driven per-frame animation

```js
// WAAPI — hardware-accelerated, programmatic
element.animate(
  [{ transform: 'translateY(0)', opacity: 1 },
   { transform: 'translateY(-8px)', opacity: 0 }],
  { duration: 200, easing: 'ease-in', fill: 'forwards' }
);
```

---

## Great Animations Are Interruptible

Interruptibility helps animations feel more natural and responsive. It allows the user to change state mid-animation while maintaining a smooth transition.

**CSS transitions are interruptible.** CSS keyframe animations are not — they restart from zero when interrupted.

**Framer Motion's `animate` is always interruptible** — springs especially, because they maintain velocity.

```css
/* Interruptible — CSS transition */
.element {
  transition: transform 300ms ease-out;
}

/* NOT interruptible — keyframe animation */
.element.animating {
  animation: slide 300ms ease-out forwards;
}
```

---

## Great Animations Are Accessible

Some people experience motion sickness or distraction from animations. That's not the experience we want to build.

```css
/* Per-element — preferred approach */
.element {
  animation: bounce 0.2s;
}

@media (prefers-reduced-motion: reduce) {
  .element {
    animation: fade 0.2s; /* replace with opacity-only, not remove entirely */
  }
}
```

```jsx
// Framer Motion
import { useReducedMotion, motion } from "framer-motion";

export function Sidebar({ isOpen }) {
  const shouldReduceMotion = useReducedMotion();
  const closedX = shouldReduceMotion ? 0 : "-100%";

  return (
    <motion.div
      animate={{
        opacity: isOpen ? 1 : 0,
        x: isOpen ? 0 : closedX
      }}
    />
  );
}
```

**Guideline:** Don't just remove animations for reduced motion — replace directional/spatial motion with opacity fades. Maintain the state change communication, remove the vestibular trigger.

---

## Great Animations Feel Right (Cohesion)

The easing and duration of animations should fit the vibe of the whole product. Sonner's toast animation is a bit slower than usual and uses `ease` rather than `ease-out` to feel more elegant — it fits the library's name, its toast design, its page design.

**Take time to review your animations.** Review your work the next day with fresh eyes — you'll notice imperfections you didn't see before.

**Cohesion checklist:**
- All animations in the product use the same physics system
- Easing curves are consistent across similar element types
- Duration scales feel proportional (small elements faster, large elements slower)
- Exit animations mirror their entrance direction

---

## The Magic of clip-path

`clip-path` is hardware-accelerated, causes zero layout shift, and enables effects that `height`, `width`, or `overflow: hidden` can't match.

**The basics:**
```css
/* inset(top right bottom left) */
clip-path: inset(0 0 100% 0); /* fully hidden */
clip-path: inset(0 0 0 0);    /* fully visible */
clip-path: inset(0 0 0 0 round 8px); /* with border radius */
```

Content outside the clip region is hidden. Content inside is visible. Layout is unaffected — the element still occupies space.

### Image Reveal

```css
.image-reveal {
  clip-path: inset(0 0 100% 0);
  animation: reveal 1s cubic-bezier(0.77, 0, 0.175, 1) forwards;
}

@keyframes reveal {
  to { clip-path: inset(0 0 0 0); }
}
```

Prefer `clip-path` over height animation for reveals:
- Hardware-accelerated (compositor only)
- No layout shift while revealing
- Works with any content inside

### Tabs Transition (Seamless Color Change)

Overlay a duplicated tab list with active styles. Animate `clip-path` to reveal only the active tab from the overlay. Result: seamless transition without awkward color interpolation.

```css
/* The overlay list — shows active tab styles */
.tabs-overlay {
  transition: clip-path 200ms cubic-bezier(0.22, 1, 0.36, 1);
  /* JS updates this: */
  clip-path: inset(0px 75% 0px 0% round 17px);
}
```

```js
// Update on tab click
const { offsetLeft, offsetWidth } = activeTabElement;
const clipLeft  = (offsetLeft / container.offsetWidth * 100).toFixed();
const clipRight = (100 - (offsetLeft + offsetWidth) / container.offsetWidth * 100).toFixed();
container.style.clipPath = `inset(0 ${clipRight}% 0 ${clipLeft}% round 17px)`;
```

### Comparison Slider

Overlay two images. Animate `clip-path: inset(0 X% 0 0)` based on drag position. GPU-accelerated, no extra DOM elements.

### Theme Switch

```css
.new-theme-overlay {
  clip-path: inset(0 0 100% 0);
  animation: revealTheme 0.6s cubic-bezier(0.77, 0, 0.175, 1) forwards;
}
@keyframes revealTheme {
  to { clip-path: inset(0 0 0 0); }
}
```

### Scroll Progress Line

```tsx
const { scrollYProgress } = useScroll({
  target: containerRef,
  offset: ["start end", "end end"],
});

const clipPathY = useTransform(scrollYProgress, [0, 1], ["100%", "0%"]);
const motionClipPath = useMotionTemplate`inset(0 0 ${clipPathY} 0)`;

<motion.div style={{ clipPath: motionClipPath }} />
```

---

## Good vs Great Animations

### What separates them

**Good animation:** Technically correct, noticeable, serves a purpose.

**Great animation:**
- Feels inevitable — you couldn't imagine it any other way
- Disappears into the experience
- Cohesive with everything around it
- Interruptible
- Accessible

### Clip path is everywhere once you know it

After learning `clip-path`, you'll start seeing it used in: Vercel's security page, Stripe's tabs, Tuple's comparison sliders, Raycast's UI demos.

### You Don't Need Animations

> "The best animations are the ones you don't notice." — Emil Kowalski

Before adding motion:
1. Is this solving a communication problem or a decoration problem?
2. How often will users see this?
3. Does removing it break the interaction or just make it less visually interesting?

If the answer to 3 is "just less interesting" — reconsider. Invisible restraint is a design skill.

---

## 7 Practical Tips (Quick Reference)

These come from Emil Kowalski's "7 Practical Animation Tips" article — full patterns in `references/web-animations/practical-tips.md`.

1. **Scale buttons on press** — `transform: scale(0.97)` on `:active`
2. **Don't animate from `scale(0)`** — start at 0.93+ for natural feel
3. **Don't delay subsequent tooltips** — use `data-instant` for tooltip groups
4. **Choose the right easing** — `ease-out` for enter/exit; never `ease-in` for UI
5. **Make animations origin-aware** — popovers scale from their trigger, not center
6. **Keep animations fast** — under 300ms; perceived performance matters more than real speed
7. **Use blur when nothing else works** — `filter: blur(2px)` bridges awkward state transitions
