# Entrance & Exit Animation Patterns

Load this file when designing or debugging elements that appear or disappear — modals, toasts, list items, dropdowns, sidebars, page transitions, or any "coming into / leaving view" animation.

---

## Core Rules

**Entrances:** `ease-out` — fast start (feels responsive), gentle landing (feels natural).
**Exits:** `ease-in` — gentle start (no jarring snap), accelerating departure (decisive).
**Exits should be 20–30% faster than entrances.** Users are waiting to do the next thing.
**Never use pure fades alone.** Combine opacity with directional movement. A fade-only exit looks like a bug.

---

## Entrance Timing Table

| Element | Duration | Easing | Delay Pattern |
|---|---|---|---|
| Toast / alert | 150ms | ease-out | None |
| Tooltip | 150ms | ease-out | None |
| Dropdown / menu | 150–200ms | ease-out | None |
| Card / item | 200ms | ease-out | None |
| Modal | 250ms | ease-out | Content +50ms |
| Sidebar / drawer | 250–300ms | ease-out | None |
| List items (stagger) | 200ms each | ease-out | `index × 50ms` |
| Page section | 300ms | ease-out | `index × 100ms` |
| Hero content | 350–400ms | ease-out | `index × 150ms` |

## Exit Timing Table

| Element | Duration | Easing | Notes |
|---|---|---|---|
| Tooltip | 100ms | ease-in | Fastest exit |
| Dropdown / menu | 120–150ms | ease-in | Collapse upward |
| Toast / notification | 150ms | ease-in | Slide to origin |
| Modal | 180–200ms | ease-in | Content first, overlay last |
| Deleted list item | 200ms | ease-in | Collapse height after fade |
| Sidebar / drawer | 200–250ms | ease-in | Returns to edge |
| Page transition out | 200–300ms | ease-in | Then new page enters |

---

## Standard Patterns

### Fade + Rise (Most Common Enter)

```css
@keyframes enter-fade-rise {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.entering {
  animation: enter-fade-rise 250ms cubic-bezier(0, 0, 0.2, 1) forwards;
}
```

### Subtle Exit (Most Common Exit)

```css
@keyframes exit-fade-up {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-10px) scale(0.98);  /* -10px, NOT -100% */
  }
}

.exiting {
  animation: exit-fade-up 180ms cubic-bezier(0.4, 0, 1, 1) forwards;
}
```

### Framer Motion Standard

```tsx
// Reusable enter/exit motion config
const fadeRise = {
  initial: { opacity: 0, y: 10, scale: 0.98 },
  animate: { opacity: 1, y: 0,  scale: 1 },
  exit:    { opacity: 0, y: -8, scale: 0.98 },
};

const timings = {
  enter: { duration: 0.25, ease: [0, 0, 0.2, 1] },
  exit:  { duration: 0.18, ease: [0.4, 0, 1, 1] },
};

<AnimatePresence>
  {isVisible && (
    <motion.div
      key="element"
      {...fadeRise}
      transition={timings.enter}
    />
  )}
</AnimatePresence>
```

---

## Modal Patterns

### Enter
```tsx
// Scale from 0.96 (not 0) — never pop from nothing
initial={{ opacity: 0, scale: 0.96, y: 8 }}
animate={{ opacity: 1, scale: 1,    y: 0 }}
transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
```

### Exit
```tsx
exit={{ opacity: 0, scale: 0.97, y: -6 }}
// Exits faster, less Y movement
```

### Stagger: overlay → container → content
```tsx
// Backdrop fades in first
<motion.div className="backdrop"
  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
  transition={{ duration: 0.2 }}
/>

// Modal enters at same time or slightly after
<motion.div className="modal"
  initial={{ opacity: 0, scale: 0.96 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.25, delay: 0.05 }}
/>

// Content lags behind modal
<motion.div className="modal-content"
  initial={{ opacity: 0, y: 6 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2, delay: 0.12 }}
/>
```

---

## Toast / Notification Patterns

```tsx
// Toast enters from bottom-right, exits to origin
const toastVariants = {
  initial: { opacity: 0, y: 20, scale: 0.96 },
  animate: { opacity: 1, y: 0,  scale: 1 },
  exit:    { opacity: 0, y: 10, scale: 0.96 },
};

<AnimatePresence mode="popLayout">
  {toasts.map(toast => (
    <motion.div
      key={toast.id}
      layout
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
    />
  ))}
</AnimatePresence>
```

---

## Dropdown / Menu Patterns

```css
/* Scale from top — anticipation built into easing */
.dropdown {
  transform-origin: top center;
  animation: dropdown-enter 180ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes dropdown-enter {
  from { transform: scaleY(0.94) scaleX(0.97); opacity: 0; }
  to   { transform: scaleY(1)    scaleX(1);    opacity: 1; }
}

/* Exit: collapse upward */
.dropdown.exiting {
  animation: dropdown-exit 130ms cubic-bezier(0.4, 0, 1, 1) forwards;
}

@keyframes dropdown-exit {
  from { transform: scaleY(1) scaleX(1); opacity: 1; }
  to   { transform: scaleY(0.94) scaleX(0.97); opacity: 0; }
}
```

---

## List Item Add / Remove

### Adding items
```tsx
<motion.li
  initial={{ opacity: 0, height: 0, y: -10 }}
  animate={{ opacity: 1, height: 'auto', y: 0 }}
  transition={{
    height: { duration: 0.2 },
    opacity: { duration: 0.15, delay: 0.05 },
    y: { duration: 0.2 }
  }}
/>
```

### Removing items (collapse pattern)
```tsx
<motion.li
  exit={{
    opacity: 0,
    height: 0,
    marginBottom: 0,
    transition: {
      opacity: { duration: 0.15 },            // fade first
      height:  { duration: 0.2, delay: 0.1 }, // then collapse
    }
  }}
/>
```

**Always use `<AnimatePresence mode="popLayout">` for list mutations** — this handles layout reflow while siblings animate.

---

## Stagger Patterns

### Formula
```
delay = index × stepMs
cap total sequence at 500ms
limit to 5–7 items max before user-initiated action
```

### CSS stagger (lightweight)
```css
.item { animation: enter-fade-rise 200ms ease-out backwards; }
.item:nth-child(1) { animation-delay: 0ms; }
.item:nth-child(2) { animation-delay: 50ms; }
.item:nth-child(3) { animation-delay: 100ms; }
.item:nth-child(4) { animation-delay: 150ms; }
.item:nth-child(5) { animation-delay: 200ms; }
/* Stop here — beyond 5 the last item waits too long */
```

### Framer Motion stagger (flexible)
```tsx
const listVariants = {
  animate: {
    transition: { staggerChildren: 0.05, delayChildren: 0.1 }
  }
};
const itemVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22 } },
};

<motion.ul variants={listVariants} initial="initial" animate="animate">
  {items.map(item => (
    <motion.li key={item.id} variants={itemVariants} />
  ))}
</motion.ul>
```

### Stagger order rules
- Lead with most important element
- Background → container → content → actions
- Exit in reverse order (last-in, first-out) or all at once
- Hero word-split stagger: 80ms between words, 60ms between characters

---

## Page Transition Patterns

```tsx
// Outgoing page exits, then incoming page enters
<AnimatePresence mode="wait">
  <motion.div
    key={pathname}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0  }}
    exit={{    opacity: 0, x: -20 }}
    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
  />
</AnimatePresence>
```

**Page transition rules:**
- Match direction to navigation hierarchy (forward → slide left, back → slide right)
- Use `mode="wait"` for clean sequential transitions
- Use `mode="popLayout"` when transitioning between sibling routes
- Duration: 250–350ms max — page transitions already feel slow to users
- Avoid transitions for keyboard navigation (Cmd+K, shortcuts)

---

## Collapse / Accordion Patterns

Height animations are expensive. Use `clip-path` or max-height alternatives when possible.

```tsx
// Option A: clip-path (GPU-accelerated, recommended)
<motion.div
  animate={{ clipPath: isOpen ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)' }}
  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
/>

// Option B: height with Framer Motion (handles auto-height)
<motion.div
  animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
  transition={{ duration: 0.25 }}
  style={{ overflow: 'hidden' }}
/>
```

---

## Direction Logic

Elements should exit toward logical destinations:
- Deleted items → fall downward (gravity)
- Dismissed modals → shrink to trigger (origin-aware)
- Sidebars → slide to their edge (back where they came from)
- Notifications → slide toward their stack position
- Closed dropdowns → collapse toward trigger

**The rule:** An element should return the way it came, or toward where it "belongs."
