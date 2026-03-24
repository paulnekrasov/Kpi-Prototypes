# Joy & Delight Animations Reference

Load this file when working on: success states, completion moments, achievement unlocks, rewards, confetti, celebrations, Easter eggs, onboarding milestones, "like" buttons, or any animation intended to spark happiness or pleasant surprise.

---

## Emotional Goal

Joy emerges from unexpected pleasures, playful movements, and moments that exceed expectations. Delight comes from animations that feel alive, responsive, and genuinely fun — not decorative noise.

The best delight animations are *earned*. They appear at meaningful moments (task complete, first achievement, streak milestone) and feel proportionate to the accomplishment.

---

## Disney Principles for Delight

| Principle | Joyful Implementation |
|---|---|
| Squash & Stretch | 30–40% on impact for celebrations; bouncy, elastic feel |
| Anticipation | 100–150ms pullback before pop-in; builds satisfying payoff |
| Staging | Dim surroundings; draw full focus to the celebration moment |
| Straight Ahead | Confetti, particles — randomized paths feel natural and exciting |
| Follow Through | Elements overshoot and settle; ribbons continue after main action |
| Slow In/Out | Asymmetric: quick start + slow landing = satisfying payoff |
| Arc | Parabolic confetti paths; curved trajectories feel more joyful |
| Secondary Action | Sparkles, radiating hearts, particle bursts amplify primary animation |
| Timing | Fast bursts 150–250ms (snappy/energetic); full celebrations 400–800ms |
| Exaggeration | 20–50% for theatrical moments; push beyond realistic |
| Solid Drawing | Maintain volume even in stretched/squashed delight states |
| Appeal | Round shapes, bright colors, spring physics, asymmetric timing |

---

## Timing Reference

| Element | Duration | Easing |
|---|---|---|
| Pop-in / success icon | 200–300ms | ease-out-back |
| Bounce settle | 300–500ms | spring |
| Confetti burst | 800–1200ms | ease-out |
| Full celebration sequence | 400–600ms total | ease-out-elastic |
| Radiating particles | 300–500ms | ease-out |
| Counter increment | 200ms per tick | ease-out |
| Achievement unlock | 500–800ms | spring + stagger |

---

## Joy-Specific Easing Curves

```css
:root {
  --joy-bounce:   cubic-bezier(0.34, 1.56, 0.64, 1);  /* overshoot + settle */
  --joy-pop:      cubic-bezier(0.175, 0.885, 0.32, 1.275); /* punchier pop */
  --joy-elastic:  cubic-bezier(0.68, -0.55, 0.265, 1.55);  /* spring-like */
  --joy-snappy:   cubic-bezier(0.22, 1, 0.36, 1);           /* fast, clean */
}
```

---

## Success / Completion State

### Checkmark pop
```tsx
// Scale from 0.6 → 1.2 (overshoot) → 1 (settle)
const checkVariants = {
  hidden:  { scale: 0, opacity: 0 },
  visible: {
    scale: [0.6, 1.2, 1],
    opacity: 1,
    transition: {
      duration: 0.4,
      times: [0, 0.6, 1],
      ease: 'easeOut',
    }
  }
};
```

### Success with secondary confetti
```tsx
// 1. Main: checkmark pops in (0–300ms)
// 2. Secondary: confetti bursts outward (100–800ms, overlapping)
// 3. Follow-through: particles fade out (600–1000ms)

const confettiParticles = Array.from({ length: 12 }, (_, i) => ({
  angle: (i / 12) * 360,
  distance: 40 + Math.random() * 30,
  delay: Math.random() * 100,
}));
```

### CSS success pop
```css
@keyframes success-pop {
  0%   { transform: scale(0); opacity: 0; }
  50%  { transform: scale(1.2); opacity: 1; }   /* overshoot */
  75%  { transform: scale(0.94); }               /* settle */
  100% { transform: scale(1); }
}

.success-icon {
  animation: success-pop 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
```

---

## "Like" / Heart Button

```tsx
// 1. Scale down on press (anticipation)
// 2. Scale up past 1.0 (exaggeration)
// 3. Settle to 1.0 (follow-through)
// 4. Radiating small hearts (secondary action)

<motion.button
  whileTap={{ scale: 0.85 }}
  onClick={handleLike}
>
  <motion.span
    animate={isLiked ? {
      scale: [1, 0.85, 1.3, 1],
      transition: { duration: 0.35, times: [0, 0.15, 0.5, 1] }
    } : {}}
  >
    <HeartIcon filled={isLiked} />
  </motion.span>
</motion.button>
```

---

## Achievement / Unlock

Staged sequence — build anticipation, then deliver.

```tsx
// Stage 1: Anticipation (subtle background pulse, 0–200ms)
// Stage 2: Badge enters from below with bounce (200–500ms)
// Stage 3: Trophy icon pops with overshoot (350–600ms)
// Stage 4: Title + description stagger in (500–700ms)
// Stage 5: Particle burst (400–900ms, overlapping with 3+4)

const achievementSequence = {
  badge:       { delay: 0.2,  duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
  icon:        { delay: 0.35, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] },
  title:       { delay: 0.5,  duration: 0.25 },
  description: { delay: 0.6,  duration: 0.25 },
  particles:   { delay: 0.4,  duration: 0.5 },
};
```

---

## Confetti System

```tsx
// Simple confetti burst
function ConfettiParticle({ angle, color }) {
  const rad = (angle * Math.PI) / 180;
  const distance = 60 + Math.random() * 40;

  return (
    <motion.div
      style={{
        position: 'absolute',
        width: 8, height: 8,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
        backgroundColor: color,
      }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{
        x: Math.cos(rad) * distance,
        y: Math.sin(rad) * distance - 20, /* arc upward */
        opacity: 0,
        scale: 0.5,
        rotate: Math.random() * 360,
      }}
      transition={{
        duration: 0.8 + Math.random() * 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: Math.random() * 0.1,
      }}
    />
  );
}

const confettiColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
```

---

## Number Counter / Score Increment

```tsx
// Animate number from old → new value
function AnimatedCount({ value }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, latest => Math.round(latest));

  useEffect(() => {
    animate(count, value, {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    });
  }, [value]);

  return <motion.span>{rounded}</motion.span>;
}
```

For tabular numbers to not shift: `font-variant-numeric: tabular-nums`.

---

## Onboarding Step Completion

```tsx
// Each completed step gets a mini-celebration
const stepComplete = {
  initial: { scale: 1, backgroundColor: 'var(--color-empty)' },
  complete: {
    scale: [1, 1.15, 1],
    backgroundColor: 'var(--color-success)',
    transition: {
      scale: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] },
      backgroundColor: { duration: 0.2 },
    }
  }
};
```

---

## When to Use Delight Animations

**Yes:**
- Task completion / form submit success
- First-time milestones (first post, first purchase, first streak)
- Achievement unlock
- Streak / goal met
- Easter eggs (discoverable, never in the way)
- Positive feedback (like, save, share)
- Onboarding step complete

**No:**
- Repeated actions users do dozens of times per day
- Destructive actions (delete, cancel, remove)
- Error states — these need clarity, not celebration
- Loading states that the user is waiting through
- Navigation and wayfinding

---

## Accessibility for Delight

Joyful animations can be more intense than standard UI, which makes accessibility even more important.

```css
@media (prefers-reduced-motion: reduce) {
  /* Replace motion with instant state change + subtle fade */
  .celebration { animation: fade-in 200ms ease-out; }
  .confetti    { display: none; }
  .success-pop { animation: none; transform: scale(1); opacity: 1; }
}
```

For particles and confetti: always hide entirely under reduced motion. For success icons: use a simple fade instead of the pop. Keep the emotional payoff through color change + icon, even without motion.
