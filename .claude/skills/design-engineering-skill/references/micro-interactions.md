# Micro-Interactions Reference

Load this file when working on small UI feedback moments: button states, toggles, checkboxes, form validation, loading indicators, badges, notification counts, or any "small but felt" interaction detail.

---

## Timing Reference

| Interaction | Duration | Easing | Notes |
|---|---|---|---|
| Hover enter | 0ms | — | Instant on |
| Hover leave | 150ms | ease-out | Ease off |
| Button press / tap | 100ms | ease-out | Immediate compression |
| Button release | 150ms | ease-out | Spring back |
| Toggle switch | 150–200ms | spring/elastic | Slight overshoot |
| Checkbox check | 150ms | ease-out | Stroke-dashoffset draw |
| Focus ring | 100ms | ease-out | Instant, then gentle |
| Tooltip show | 150ms | ease-out | Fast in |
| Tooltip hide | 100ms | ease-in | Faster out |
| Badge update | 200ms | elastic | Pop with bounce |
| Form error | 200ms | ease-out | Shake + color |
| Success confirm | 200–300ms | ease-out + spring | Pop then settle |
| Copy-to-clipboard | 150ms | ease-out | Icon swap with blur |
| Loading start | 200ms | ease-out | Spinner fade-in |

---

## Disney Principles Applied to Micro-Interactions

| Principle | Micro-interaction Pattern |
|---|---|
| Squash & Stretch | Button press compresses scaleY 0.95, badge bounces |
| Anticipation | Hover state prepares for click; drag element lifts before dragging |
| Staging | Active input clearly distinguished; error demands attention; one feedback at a time |
| Follow Through | Ripple expands past tap; toggle overshoots and settles; checkmark draws after fill |
| Slow In/Slow Out | 100ms ease-out = instant feel; ease-in hover-leave = graceful |
| Secondary Action | Icon changes with button state; shadow responds to elevation |
| Timing | 50–100ms instant; 100–200ms standard; 200–300ms max for micro |
| Exaggeration | Error shake: 3–5px (not 20); success scale: 1.05–1.1 (not 1.5) |
| Appeal | Consistent behavior across similar elements; volume-preserving squash |

---

## Button States

```css
.button {
  transition:
    transform 100ms ease-out,
    box-shadow 100ms ease-out,
    background-color 150ms ease;
}

/* Hover: lift, instant on / ease off */
.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  transition-duration: 0ms; /* snap to hover */
}

.button:not(:hover) {
  transition-duration: 150ms; /* ease back */
}

/* Press: compress (squash principle) */
.button:active {
  transform: translateY(0) scale(0.97);
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  transition-duration: 100ms;
}

/* Disabled: no animation */
.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  /* No hover or active states */
}
```

**Volume-preserving button press:**
```css
.button:active {
  transform: scale(0.97, 1.01); /* slightly taller when compressed */
}
```

---

## Toggle Switch

```css
/* Track */
.toggle {
  transition: background-color 200ms ease-out;
}

/* Thumb — spring overshoot on move */
.toggle-thumb {
  transition: transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toggle.on .toggle-thumb {
  transform: translateX(20px);
}

/* Squash as thumb hits the wall */
.toggle.transitioning .toggle-thumb {
  transform: translateX(20px) scaleX(1.15) scaleY(0.88);
}
```

**Framer Motion toggle:**
```tsx
<motion.div
  className="thumb"
  animate={{ x: isOn ? 20 : 0 }}
  transition={{ type: 'spring', stiffness: 500, damping: 28 }}
/>
```

---

## Checkbox

The checkmark should draw *after* the box fills — this is Follow Through.

```css
/* Box fill */
.checkbox-box {
  transition: background-color 120ms ease-out, border-color 120ms ease-out;
}

/* Checkmark draws via stroke animation */
.checkmark {
  stroke-dasharray: 20;
  stroke-dashoffset: 20;
  transition: stroke-dashoffset 180ms ease-out 60ms; /* 60ms delay = follow-through */
}

.checkbox:checked + .checkmark {
  stroke-dashoffset: 0;
}
```

---

## Icon State Swap (Copy → Check, etc.)

Combine opacity + scale + blur for a clean contextual transition. This is the "animate icons contextually" pattern.

```tsx
<AnimatePresence mode="wait">
  {isCopied ? (
    <motion.span
      key="check"
      initial={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}
      animate={{ opacity: 1, scale: 1,   filter: 'blur(0px)' }}
      exit={{    opacity: 0, scale: 0.8, filter: 'blur(4px)' }}
      transition={{ duration: 0.15 }}
    >
      <CheckIcon />
    </motion.span>
  ) : (
    <motion.span
      key="copy"
      initial={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}
      animate={{ opacity: 1, scale: 1,   filter: 'blur(0px)' }}
      exit={{    opacity: 0, scale: 0.8, filter: 'blur(4px)' }}
      transition={{ duration: 0.15 }}
    >
      <CopyIcon />
    </motion.span>
  )}
</AnimatePresence>
```

---

## Form Validation

### Error state (shake)
```css
@keyframes error-shake {
  0%, 100% { transform: translateX(0); }
  20%       { transform: translateX(-4px); }
  40%       { transform: translateX(4px); }
  60%       { transform: translateX(-3px); }
  80%       { transform: translateX(3px); }
}

.input.error {
  animation: error-shake 300ms ease-out;
  border-color: var(--color-error);
  transition: border-color 150ms ease-out;
}
```

**Shake rules:** 3–5px movement. Never 20px. Red border change with 150ms ease. Error message slides in with 150ms ease-out from above.

### Floating label (focus)
```css
.label {
  transform-origin: left center;
  transition: transform 150ms ease-out, color 150ms ease-out;
}

.input:focus ~ .label,
.input:not(:placeholder-shown) ~ .label {
  transform: translateY(-18px) scale(0.82);
  color: var(--color-primary);
}
```

---

## Loading Indicators

### Spinner
```css
/* Fast spin = perceived faster loading */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin 600ms linear infinite;
  /* Linear OK here — continuous rotation, not interactive */
}
```

### Skeleton shimmer
```css
@keyframes shimmer {
  from { background-position: -200% 0; }
  to   { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    rgba(0,0,0,0.06) 25%,
    rgba(0,0,0,0.10) 50%,
    rgba(0,0,0,0.06) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
```

### Pulse (simple)
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

.loading {
  animation: pulse 1.5s ease-in-out infinite;
}
```

**Loading rules:**
- Spinner over skeleton for unknown content
- Skeleton for known layout (text, images, cards)
- Pulse for simple placeholder indicators
- Faster spinner spin = faster perceived loading
- Fade in the spinner (150ms) — don't just pop it

---

## Badge / Count Update

```tsx
// Number change with elastic pop
<AnimatePresence mode="wait">
  <motion.span
    key={count}
    initial={{ scale: 0.6, opacity: 0 }}
    animate={{ scale: 1,   opacity: 1 }}
    exit={{    scale: 0.6, opacity: 0 }}
    transition={{ type: 'spring', stiffness: 600, damping: 20 }}
  >
    {count}
  </motion.span>
</AnimatePresence>
```

---

## Ripple Effect (Material-style)

```css
.button {
  position: relative;
  overflow: hidden;
}

.ripple {
  position: absolute;
  border-radius: 50%;
  transform: scale(0);
  animation: ripple-expand 400ms ease-out forwards;
  background: rgba(255,255,255,0.3);
}

@keyframes ripple-expand {
  to {
    transform: scale(4);
    opacity: 0;
  }
}
```

Ripple follows Through principle — it continues expanding past the tap point after the button is released.

---

## Micro-Interaction Best Practices

1. **Every interactive element needs feedback** — silence feels broken
2. **Disabled states: no hover/active animation** — reduced opacity only
3. **One feedback at a time** — don't stack competing micro-animations
4. **Don't animate on every change** — filter for meaningful updates (avoid rapid-fire badge increments)
5. **Functionality must work without animation** — never hide state behind motion
6. **Respect `prefers-reduced-motion`** — provide instant state changes as fallback
7. **Test at 2× speed** — if it still feels right, the timing is correct
8. **Hover = instant on, ease off** — always, without exception
