# Animation Performance Diagnosis

Load this file when: animations are janky, frames are dropping, the UI feels sluggish during transitions, battery drain is spiking on mobile, or you need to debug why an animation isn't smooth.

---

## Problem Indicators

- Frame rate drops below 60fps (visible stuttering)
- UI feels "sticky" or choppy during scroll or transition
- DevTools shows long frames (>16ms) in Performance tab
- Animation lags behind user input
- Battery drain spikes on mobile during animations
- Forced reflows / layout thrashing warnings

---

## The 16ms Budget

At 60fps, the browser has **16ms per frame** to execute all JavaScript, style recalculations, layout, paint, and composite. Animations that exceed this budget drop frames.

**Compositor thread (free):** `transform`, `opacity` — these skip layout and paint entirely, running on the GPU.

**Paint thread (costly):** `background-color`, `border`, `box-shadow`, `filter` (some) — these require repainting.

**Layout thread (most costly):** `width`, `height`, `top`, `left`, `margin`, `padding` — these force full layout recalculation, reflow, and repaint of surrounding elements.

---

## Quick Diagnosis Checklist

```
[ ] Open DevTools → Performance tab → Record animation → Check for long frames
[ ] Are you animating transform + opacity ONLY? (or something else?)
[ ] How many simultaneous animations are running? (keep under 3–4 heavy ones)
[ ] Is will-change applied? (hint to browser to promote layer early)
[ ] Are animations paused when tab is hidden? (visibilitychange event)
[ ] Is layout thrashing occurring? (read DOM → write DOM → read DOM in loop)
[ ] Have you tested on lowest-spec target device with CPU throttling on?
[ ] Are off-screen elements still animating? (Intersection Observer)
[ ] Is Framer Motion running on main thread when CSS could handle it?
```

---

## Fix By Symptom

### Symptom: Choppy / janky motion

**Diagnosis:** Animating expensive CSS properties.

```css
/* ❌ Triggers layout (full reflow) */
.element:hover { top: -4px; margin-top: -4px; }

/* ✅ GPU-only (compositor) */
.element:hover { transform: translateY(-4px); }
```

**Fix:** Replace `top`/`left`/`margin`/`width`/`height` with `transform` equivalents:

| Avoid | Use instead |
|---|---|
| `top: Xpx` | `transform: translateY(Xpx)` |
| `left: Xpx` | `transform: translateX(Xpx)` |
| `width: Xpx` (for grow) | `transform: scaleX(ratio)` |
| `height: Xpx` (for reveal) | `clip-path: inset(0 0 X% 0)` |
| `margin-top: -Xpx` | `transform: translateY(-Xpx)` |

---

### Symptom: Shaky / jittery 1px shift at start or end

**Diagnosis:** GPU/CPU rendering handoff — element wasn't on a compositor layer before animation started.

```css
/* ✅ Tell browser to keep this on GPU throughout */
.animated-element {
  will-change: transform;
}
```

**Remove `will-change` after animation ends** — it uses memory and can cause its own issues if applied to many elements permanently.

```js
element.addEventListener('animationend', () => {
  element.style.willChange = 'auto';
});
```

---

### Symptom: Too many things moving at once — CPU spike

**Diagnosis:** Concurrent heavy animations overloading the main thread.

**Fix: Stagger** — offset start times by 50–100ms to spread CPU load:

```css
.item-1 { animation-delay: 0ms; }
.item-2 { animation-delay: 50ms; }
.item-3 { animation-delay: 100ms; }
```

**Fix: Reduce simultaneous count** — keep heavy concurrent animations to 3–4 max.

**Fix: Switch from JS to CSS** — CSS animations run on the compositor thread and don't compete with JavaScript:

```css
/* ✅ Off main thread */
.spinner { animation: spin 600ms linear infinite; }

/* ❌ On main thread (Framer Motion uses rAF) */
<motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity }} />
```

---

### Symptom: Animation drops frames only when other JS is running

**Diagnosis:** JS-driven animation (Framer Motion, GSAP with JS driver) is blocked by main thread work.

**Fix:** Use CSS animations or WAAPI for anything that must remain smooth under load:

```js
// WAAPI — hardware-accelerated, off main thread
element.animate(
  [
    { transform: 'translateY(0)', opacity: 1 },
    { transform: 'translateY(-10px)', opacity: 0 },
  ],
  { duration: 200, easing: 'ease-out', fill: 'forwards' }
);
```

This was the fix Vercel used when their shared layout animation dropped frames during page loads — switched from Framer Motion to CSS, which moved the animation off the CPU entirely.

---

### Symptom: Off-screen elements slowing scroll

**Diagnosis:** Animating elements that aren't visible.

```js
// ✅ Pause animation when not in viewport
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const el = entry.target;
    if (entry.isIntersecting) {
      el.style.animationPlayState = 'running';
    } else {
      el.style.animationPlayState = 'paused';
    }
  });
});

document.querySelectorAll('.animated').forEach(el => observer.observe(el));
```

---

### Symptom: Blur filter causes lag (especially Safari)

**Diagnosis:** `filter: blur()` above ~20px is expensive, especially on Safari which doesn't GPU-accelerate it as well.

```css
/* ✅ Keep blur subtle */
.backdrop { backdrop-filter: blur(8px); }      /* Prefer backdrop-filter */
.element  { filter: blur(2px); }               /* Keep under 20px */

/* ❌ Avoid */
.element  { filter: blur(40px); }
```

---

### Symptom: Layout thrashing (forced reflow)

**Diagnosis:** Reading layout properties (offsetHeight, getBoundingClientRect) *after* writing styles forces the browser to recalculate layout immediately.

```js
// ❌ Read → write → read → write = thrashing
items.forEach(item => {
  const height = item.offsetHeight; // read (forces reflow)
  item.style.height = height + 'px'; // write
});

// ✅ Batch reads, then batch writes
const heights = items.map(item => item.offsetHeight); // all reads
items.forEach((item, i) => { item.style.height = heights[i] + 'px'; }); // all writes
```

**Framer Motion in React:** Avoid setting styles in render — use refs and `useLayoutEffect` for direct DOM measurement.

---

### Symptom: React re-renders on every animation frame

**Diagnosis:** Animation state stored in React state (`useState`) triggers a re-render on every frame.

```tsx
// ❌ Re-renders every frame
const [x, setX] = useState(0);
useEffect(() => {
  requestAnimationFrame(() => setX(x + 1));
});

// ✅ Framer Motion values don't cause re-renders
const x = useMotionValue(0);
useEffect(() => {
  animate(x, 100, { duration: 0.5 });
}, []);
```

---

## Performance Testing Protocol

1. **DevTools Performance tab** → Record 3–5 seconds of the animation → Look for red frames (>16ms)
2. **CPU throttling** → Set to 4× slowdown (simulates mid-range mobile)
3. **Network throttling** → Ensure animation doesn't depend on network timing
4. **Layers panel** → Check which elements are promoted to GPU layers (`will-change`, `transform: translateZ(0)`)
5. **Rendering panel** → Enable "Paint flashing" → Anything green during animation shouldn't be
6. **Test on actual device** — DevTools throttling is an approximation, not a substitute

---

## will-change Guidelines

```css
/* ✅ Apply right before animation starts */
.pre-animation {
  will-change: transform, opacity;
}

/* ✅ Remove after animation ends */
.post-animation {
  will-change: auto;
}

/* ❌ Never do this globally */
* { will-change: transform; } /* Destroys memory, causes repaints */

/* ❌ Don't apply to more than ~10 elements at once */
```

`will-change` is not magic — it costs GPU memory and compositing overhead. Use it surgically, remove it when done.

---

## Mobile-Specific

- Test on real devices at 60fps — CPU throttling in DevTools is not equivalent
- Disable hover effects on touch devices (`@media (hover: hover) and (pointer: fine)`)
- Reduce motion intensity on mobile (shorter durations, smaller transforms)
- Avoid `backdrop-filter: blur()` on older Android (poor support, expensive)
- `filter: blur()` on Safari: keep under 20px, prefer `backdrop-filter`
- Avoid animating during scroll — scroll is already expensive

---

## Reducing Complexity Progressively

```js
// Detect low-end device (rough heuristic)
const isLowEnd = navigator.hardwareConcurrency <= 4 || !window.matchMedia('(min-resolution: 2dppx)').matches;

// Reduce animation on low-end
const duration = isLowEnd ? 0 : 250;
const ease = isLowEnd ? 'linear' : 'cubic-bezier(0.22, 1, 0.36, 1)';
```

Or simply respect `prefers-reduced-motion`, which covers most cases:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
