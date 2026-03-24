# Practical Animation Tips
*Source: Emil Kowalski — PRACTICAL-TIPS.md, animations.dev*

Detailed reference guide for common animation scenarios. Use as a checklist when implementing animations. Each section maps directly to a specific problem you'll encounter in production.

---

## Recording & Debugging

### Record Your Animations

When something feels off but you can't identify why, record the animation and play it back frame by frame. This reveals details invisible at normal speed. Use:
- Chrome DevTools → Performance tab → Record
- Slow motion in DevTools (0.1× / 0.25×) under the Animations panel
- Screen recording at 60fps, scrub frame-by-frame in QuickTime or VLC

### Fix Shaky Animations

Elements may shift by 1px at the start/end of CSS transform animations due to GPU/CPU rendering handoff.

**Fix:**

```css
.element {
  will-change: transform;
}
```

This tells the browser to keep the element on the GPU throughout the animation.

### Take Breaks

Don't code and ship animations in one sitting. Step away, return with fresh eyes. The best animations are reviewed and refined over days, not hours. What looks good at 2am looks different the next morning.

---

## Button & Click Feedback

### Scale Buttons on Press

Make interfaces feel responsive by adding subtle scale feedback:

```css
button:active {
  transform: scale(0.97);
}
```

This gives instant visual feedback that the interface is listening. The simplest micro-interaction there is.

### Don't Animate from scale(0)

Starting from `scale(0)` makes elements appear from nowhere — it feels unnatural and cheap.

**Bad:**

```css
.element {
  transform: scale(0);
}
.element.visible {
  transform: scale(1);
}
```

**Good:**

```css
.element {
  transform: scale(0.95);
  opacity: 0;
}
.element.visible {
  transform: scale(1);
  opacity: 1;
}
```

Elements should always have some visible shape, like a deflated balloon.

---

## Tooltips & Popovers

### Skip Animation on Subsequent Tooltips

First tooltip: delay + animation. Subsequent tooltips (while one is open): instant, no delay, no animation.

```css
.tooltip {
  transition:
    transform 125ms ease-out,
    opacity 125ms ease-out;
  transform-origin: var(--transform-origin);
}

.tooltip[data-starting-style],
.tooltip[data-ending-style] {
  opacity: 0;
  transform: scale(0.97);
}

/* Skip animation for subsequent tooltips in the same group */
.tooltip[data-instant] {
  transition-duration: 0ms;
}
```

Radix UI and Base UI support this pattern natively with the `data-instant` attribute.

### Make Animations Origin-Aware

Popovers should scale from their trigger, not from the element center.

```css
/* Default (wrong for most cases) */
.popover {
  transform-origin: center;
}

/* Correct — scale from trigger point */
.popover {
  transform-origin: var(--transform-origin);
}
```

**Radix UI:**

```css
.popover {
  transform-origin: var(--radix-dropdown-menu-content-transform-origin);
}
```

**Base UI:**

```css
.popover {
  transform-origin: var(--transform-origin);
}
```

---

## Speed & Timing

### Keep Animations Fast

A faster-spinning spinner makes the app seem to load faster even with identical load times. A 180ms select animation feels more responsive than 400ms.

**Rule:** UI animations should stay under 300ms.

### Don't Animate Keyboard Interactions

Arrow key navigation, keyboard shortcuts — these are repeated hundreds of times daily. Animation makes them feel slow and disconnected.

**Never animate:**
- List navigation with arrow keys
- Keyboard shortcut responses
- Tab/focus movements

### Be Careful with Frequently-Used Elements

A hover effect is nice, but if triggered multiple times a day, it may benefit from no animation at all.

**Guideline:** Use your own product daily. You'll discover which animations become annoying through repeated use.

---

## Hover States

### Fix Hover Flicker

When hover animation changes element position, the cursor may leave the element, causing a flicker loop.

**Problem:**

```css
.box:hover {
  transform: translateY(-20%);
}
```

The element moves up → cursor leaves → hover ends → element drops → cursor re-enters → loop.

**Solution:** Animate a child element instead:

```html
<div class="box">
  <div class="box-inner"></div>
</div>
```

```css
.box:hover .box-inner {
  transform: translateY(-20%);
}

.box-inner {
  transition: transform 200ms ease;
}
```

The parent's hover area stays stable while the child moves.

### Instant-on, Ease-off Hover

```css
.interactive {
  transition: transform 150ms ease-out;
}
.interactive:hover {
  transform: translateY(-2px);
  transition-duration: 0ms; /* snap to hover state */
}
```

Hover response must feel immediate. The ease-off on unhover prevents a jarring snap back.

### Disable Hover on Touch Devices

Touch devices don't have true hover. Accidental finger movement triggers unwanted hover states.

```css
@media (hover: hover) and (pointer: fine) {
  .card:hover {
    transform: scale(1.05);
  }
}
```

**Note:** Tailwind v4's `hover:` class automatically applies only when the device supports hover.

---

## Touch & Accessibility

### Ensure Appropriate Target Areas

Small buttons are hard to tap. Use a pseudo-element to create larger hit areas without changing layout.

**Minimum target:** 44px (Apple and WCAG recommendation)

```css
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
  /* Optionally add a z-index if needed */
}
```

Usage:

```jsx
<button className="icon-button">
  <BellIcon />
</button>
```

---

## Easing Selection

### Use ease-out for Enter/Exit

Elements entering or exiting should use `ease-out`. The fast start creates responsiveness.

```css
.dropdown {
  transition:
    transform 200ms ease-out,
    opacity 200ms ease-out;
}
```

`ease-in` starts slow — wrong for UI. Same duration feels slower because the movement is back-loaded.

### Use ease-in-out for On-Screen Movement

Elements already visible that need to move should use `ease-in-out`. Mimics natural acceleration/deceleration like a car.

```css
.slider-handle {
  transition: transform 250ms ease-in-out;
}
```

### Use Custom Easing Curves

Built-in CSS curves are usually too weak. Custom curves create more intentional motion.

**Resources:**
- [easings.co](https://easings.co/) — visual easing explorer
- Emil's course reference: `/learn/easing-curves`

---

## Visual Tricks

### Use Blur as a Fallback

When easing and timing adjustments don't solve the problem, add subtle blur to mask imperfections.

```css
.button-transition {
  transition:
    transform 150ms ease-out,
    filter 150ms ease-out;
}

.button-transition:active {
  transform: scale(0.97);
  filter: blur(2px);
}
```

Blur bridges visual gaps between states, tricking the eye into seeing smoother transitions. The two states blend instead of appearing as distinct objects.

**Performance note:** Keep blur under 20px, especially on Safari.

---

## Why Details Matter

> "All those unseen details combine to produce something that's just stunning, like a thousand barely audible voices all singing in tune."
> — Paul Graham, Hackers and Painters

Details that go unnoticed are good — users complete tasks without friction. Great interfaces enable users to achieve goals with ease, not to admire animations.
