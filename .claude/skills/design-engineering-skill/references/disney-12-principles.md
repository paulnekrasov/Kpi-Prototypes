# Disney's 12 Animation Principles — UI Reference

A practical mapping of Disney's foundational animation principles (Johnston & Thomas, *The Illusion of Life*, 1981) to modern web UI and motion design. Load this file when the task involves any of the named principles, or when something about an animation feels "off" and you need a diagnostic framework.

---

## Quick Reference Table

| # | Principle | Web/UI Implementation |
|---|---|---|
| 1 | **Squash & Stretch** | `transform: scale()` — compress on press, stretch on fast movement, preserve volume |
| 2 | **Anticipation** | Brief counter-movement before main action; hover as anticipation for click |
| 3 | **Staging** | `z-index`, `opacity`, `blur` to direct one focal point at a time |
| 4 | **Straight Ahead / Pose to Pose** | CSS keyframes (pose-to-pose) vs. JS physics/springs (straight-ahead) |
| 5 | **Follow Through & Overlapping** | Container arrives first, children stagger; overshoot springs |
| 6 | **Slow In / Slow Out** | `ease-out` enter, `ease-in` exit, `ease-in-out` reposition — never `linear` |
| 7 | **Arc** | `offset-path`, combined X+Y transforms with different easings |
| 8 | **Secondary Action** | Shadows, icon color, glow, particles — supports primary, never competes |
| 9 | **Timing** | Speed = weight + emotion. Micro: 100–150ms. Standard: 200–300ms. Max: 600ms |
| 10 | **Exaggeration** | 2–5% for professional UI, 20–50% for celebrations — amplifies truth |
| 11 | **Solid Drawing** | Explicit `transform-origin`, volume preservation, `perspective` for 3D |
| 12 | **Appeal** | 60fps, GPU-only properties, custom easing, cohesive motion personality |

---

## 1. Squash & Stretch

The most important principle. Makes rigid objects feel alive by simulating how real materials deform under force — while preserving **apparent volume**.

**Volume preservation rule:** When scaleY decreases, scaleX must increase proportionally. Violate this and objects appear to grow or shrink rather than deform.

**Elasticity by context:**
- High (rubber, celebration): 30–50% deformation
- Medium (consumer UI, toggles): 5–15%
- Low (professional UI, buttons): 2–5%
- Micro-polish (almost invisible): 1–2% — prevents the dead, mechanical feel

```css
/* Button press — volume-preserving squash */
.button:active {
  transform: scale(0.97, 1.02);  /* Y down, X slightly up */
  transition: transform 100ms ease-out;
}

/* Rubber-band overscroll — stretch + narrow */
.list.overscrolled {
  transform: scaleY(1.03) scaleX(0.98);
}

/* Toggle thumb — squash as it hits the wall */
.toggle-thumb.hitting-end {
  transform: scaleX(1.15) scaleY(0.88);
}
```

**Common mistakes:**
1. `scale(0.95)` — uniform scaling, no volume preservation, feels flat
2. Snapping to extremes without easing — deformation must ease in/out
3. Over-application in professional UI — 2–5% is usually plenty
4. Forgetting secondary elements — if the card squashes, its shadow should too

**Heuristic:** 10% deformation for energetic motion, 2–3% for subtle polish. Should be *felt*, not consciously noticed.

---

## 2. Anticipation

Preparation for action. A brief counter-movement signals what's coming and builds tension for the payoff. Without it, actions feel abrupt.

```css
/* Dropdown — micro-compress before expanding */
@keyframes dropdown-open {
  0%   { transform: scaleY(0.97); opacity: 0.7; }
  100% { transform: scaleY(1);    opacity: 1; }
}

/* Button — slight pullback before nav launch */
@keyframes button-launch {
  0%   { transform: scale(1); }
  25%  { transform: scale(0.96); }   /* anticipation */
  100% { transform: scale(1.02); }   /* action */
}
```

**Hover IS anticipation.** A button that lifts on hover is anticipating a click. This is why hover states are so important — they're doing anticipation work before the interaction even happens.

**Timing:** 50–150ms counter-movement. Quick (50ms) = snappy. Longer (150ms) = builds more tension.

**When to use:** Dropdowns, menus, drag-start elevation, pull-to-refresh, loading spinners winding up, reveal animations.

---

## 3. Staging

Direct attention to what matters most. One clear focal point at a time. Everything else is subordinate or invisible.

```css
/* Focus the eye: dim background during modal */
.backdrop {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  transition: opacity 200ms ease-out;
}

/* Motion hierarchy: hero first, support after */
.hero    { animation-delay: 0ms; }
.support { animation-delay: 100ms; }
.cta     { animation-delay: 200ms; }
```

**UI staging rules:**
- One feedback element at a time — competing animations cancel each other out
- Error states demand full attention — dim or freeze everything else
- Success confirmations: unmistakable but not overwhelming
- Don't animate backgrounds while users are reading foreground content
- Use motion direction to guide the eye through a flow

---

## 4. Straight Ahead vs. Pose to Pose

**Pose to Pose** (define start + end states, interpolate between): CSS transitions, CSS `@keyframes`, Framer Motion `animate`. **Use for:** predictable UI state changes, modal open/close, card reveals.

**Straight Ahead** (frame-by-frame, physics-driven, discovered organically): JS springs, `requestAnimationFrame`, particle systems. **Use for:** drag gestures, confetti, generative motion, anything that needs to feel truly alive.

| Scenario | Method |
|---|---|
| Modal open/close | Pose to Pose (CSS transition) |
| Drag + fling | Straight Ahead (spring physics) |
| Confetti/particles | Straight Ahead (randomized) |
| Loading spinner loop | Straight Ahead (CSS infinite) |
| Staggered list reveal | Pose to Pose (CSS keyframes + delays) |
| Spring with interruptibility | Straight Ahead (Framer Motion spring) |

**Rule:** Default to Pose to Pose for UI — predictable, performant. Use Straight Ahead when motion must feel physical, generative, or alive.

---

## 5. Follow Through & Overlapping Action

Real objects don't all stop simultaneously. Secondary parts (hair, shadows, child elements) continue moving after the primary object settles.

**Overlapping:** Different parts move at different rates — the container arrives before the content.

```css
/* Container → children cascade */
.card         { transition: transform 200ms ease-out; }
.card-header  { transition: transform 240ms ease-out 40ms; }
.card-body    { transition: transform 270ms ease-out 70ms; }
.card-actions { transition: transform 300ms ease-out 100ms; }
```

```tsx
/* Framer Motion — stagger children after parent lands */
<motion.div animate={{ y: 0 }} transition={{ duration: 0.25 }}>
  {items.map((item, i) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 + i * 0.04, duration: 0.22 }}
    />
  ))}
</motion.div>
```

**Overshoot = follow-through:** Spring animations that slightly overshoot their final position simulate the natural momentum of real objects settling.

```css
/* Overshoot spring via cubic-bezier */
.element {
  transition: transform 380ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

**UI patterns:**
- Modal opens → content fades in 50ms after container stops
- Notification arrives → badge updates 80ms later
- Toggle switches → checkmark draws with 40ms delay after box fill
- Dropdown opens → menu items stagger in after the container expands

---

## 6. Slow In / Slow Out

Natural objects accelerate from rest and decelerate before stopping. `linear` is the absence of this — it looks broken.

```css
:root {
  /* Enter: fast response, natural landing */
  --ease-out-standard: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --ease-out-strong:   cubic-bezier(0.19, 1, 0.22, 1);
  --ease-out-snappy:   cubic-bezier(0, 0, 0.2, 1);

  /* On-screen reposition */
  --ease-in-out-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in-out-strong:   cubic-bezier(0.77, 0, 0.175, 1);

  /* Exit: gentle departure, accelerates away */
  --ease-in-standard: cubic-bezier(0.4, 0, 1, 1);

  /* Delight: overshoot + settle */
  --ease-bounce:  cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-elastic: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

**Rule of thumb:**
- `ease-out` → element *arriving* (user needs fast confirmation)
- `ease-in` → element *leaving* (decisive, not jarring)
- `ease-in-out` → element *repositioning* on screen
- `ease-bounce` → celebrations, success states, joyful moments
- `linear` → progress bars, looping tickers only

---

## 7. Arc

Objects in nature follow curved paths. Straight horizontal/vertical motion is mechanical.

```css
/* Combined X+Y with different timing = natural arc */
@keyframes arc-enter {
  from {
    transform: translate(20px, 30px) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
}

/* True curved path with offset-path */
.notification-exit {
  offset-path: path('M 0 0 Q 60 -40 100 -80');
  animation: arc-out 350ms ease-in forwards;
}
@keyframes arc-out {
  from { offset-distance: 0%; opacity: 1; }
  to   { offset-distance: 100%; opacity: 0; }
}
```

**UI arc applications:**
- Dismissed notifications that arc upward-and-out (not just straight up)
- Drag elements that follow a parabolic arc on release
- Dropdown carets rotating through an arc (not flipping instantly)
- Items "thrown" to a cart or trash icon following a curved path

---

## 8. Secondary Action

Animations that support the primary action, adding richness without stealing focus.

```css
/* Shadow responds to button press (secondary to scale) */
.button {
  transition: transform 100ms ease-out, box-shadow 120ms ease-out;
}
.button:hover  { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.15); }
.button:active { transform: scale(0.97);      box-shadow: 0 1px 4px rgba(0,0,0,0.08); }

/* Icon rotates while button scales — subtle secondary */
.button:hover .icon {
  transform: rotate(12deg);
  transition: transform 200ms ease-out 30ms;
}
```

**Secondary action patterns:**
- Card lifts → shadow expands/blurs (depth secondary)
- Input focuses → label floats (label secondary to border)
- Success → confetti bursts (confetti secondary to checkmark)
- Like → radiates small hearts (hearts secondary to heart pop)
- Modal opens → backdrop blurs (blur secondary to modal entry)

**Warning:** If the user notices the secondary action more than the primary, it's wrong. Secondary = supporting actor, never lead.

---

## 9. Timing

Speed communicates weight, personality, and emotional tone.

| Context | Duration | Feel |
|---|---|---|
| Hover state | 100–150ms | Instant, responsive |
| Button tap feedback | 100ms | Tactile |
| Tooltip | 150ms | Quick, informative |
| Dropdown / menu | 150–250ms | Snappy, fluid |
| Modal / dialog | 200–300ms | Considered |
| Page transition | 300–500ms | Spatial |
| Success / reward | 400–700ms | Satisfying |
| Dramatic reveal | 500–900ms | Theatrical |

**Frequency rule:**
- 100+ times/day → no animation, or < 100ms barely perceptible
- Occasional → standard timing
- First-time / rare → can be more expressive

```css
:root {
  --t-instant:  100ms;
  --t-fast:     150ms;
  --t-standard: 250ms;
  --t-slow:     400ms;
  --t-dramatic: 650ms;
}
```

---

## 10. Exaggeration

Push motion beyond realistic to clarify intent and add expressiveness. Amplifies what's true — never invents.

| Context | Amount | Example |
|---|---|---|
| Enterprise B2B | 0–2% | Barely there |
| Standard product | 2–8% | Subtle but alive |
| Consumer / lifestyle | 8–15% | Noticeably expressive |
| Gaming / entertainment | 15–30% | Energetic |
| Celebration moments | 20–50% | Theatrical |

```css
/* UI hover — restrained exaggeration */
.card:hover { transform: translateY(-4px) scale(1.02); }

/* Celebration pop — deliberate exaggeration */
@keyframes success-pop {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.25); }  /* peak exaggeration */
  70%  { transform: scale(0.94); }  /* settle overshoot */
  100% { transform: scale(1); }
}
```

**Calibration notes:**
- Error shake: 3–5px horizontal movement (not 20px)
- Success scale: 1.05–1.15 (not 1.5)
- Hover lift: 2–6px (not 20px)

---

## 11. Solid Drawing

Objects must maintain consistent volume, mass, and dimensional logic throughout motion.

```css
/* Always set transform-origin explicitly */
.dropdown  { transform-origin: top center; }
.tooltip   { transform-origin: var(--radix-tooltip-content-transform-origin); }
.modal     { transform-origin: center center; }
.fab       { transform-origin: bottom right; }

/* 3D perspective for depth */
.card-3d {
  perspective: 1000px;
  transform-style: preserve-3d;
}

/* SVG: transform-box for predictable origin */
.svg-icon {
  transform-box: fill-box;
  transform-origin: center;
}
```

**Solid Drawing rules:**
- Never rely on the default `transform-origin: 50% 50%` for non-centered animations
- Dropdowns grow from their trigger edge, not their center
- Elements must not visually pass through their containers during animation
- Volume must be preserved during squash/stretch (see Principle 1)

---

## 12. Appeal

The quality that makes motion engaging, memorable, and cohesive. In UI: 60fps, purposeful easing, consistent motion language, brand personality.

**Motion personality by brand type:**

| Brand | Easing | Duration | Bounce |
|---|---|---|---|
| Playful / consumer | Springs, overshoot | 200–400ms | Yes |
| Professional / B2B | Smooth ease-out | 100–250ms | No |
| Luxurious / premium | Long ease-in-out | 300–600ms | No |
| Urgent / action | Fast ease-out | 80–150ms | No |
| Calm / wellness | Gentle ease | 400–800ms | Minimal |

**Appeal checklist:**
- [ ] 60fps verified in DevTools Performance tab
- [ ] Only `transform` and `opacity` animated
- [ ] Custom easing curves (not default `ease`)
- [ ] Every animation has a purpose — no decoration for decoration's sake
- [ ] Consistent motion language across all components
- [ ] `prefers-reduced-motion` respected everywhere

---

## Diagnostic: When an Animation Feels Wrong

| Symptom | Likely Violated Principle |
|---|---|
| Mechanical / robotic | Slow In/Slow Out — using `linear` |
| Pops in from nowhere | Anticipation + Squash/Stretch missing |
| Feels too heavy / slow | Timing — duration too long |
| Feels weightless / cheap | Squash/Stretch + Timing |
| Confusing what to look at | Staging — no hierarchy |
| Moving in straight lines | Arc |
| Everything stops at once | Follow Through / Overlapping |
| Flat, no depth | Solid Drawing + Secondary Action missing |
| Boring / forgettable | Appeal + Exaggeration too conservative |
| Jarring / unexpected | Anticipation missing |
| Too cartoony | Exaggeration overdone |
