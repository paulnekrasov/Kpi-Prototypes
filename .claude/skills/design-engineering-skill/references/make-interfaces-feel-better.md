# Details That Make Interfaces Feel Better
*Source: Jakub Krehel — jakub.kr/writing/details-that-make-interfaces-feel-better*

A collection of small CSS and layout details that compound into a great interface. Each one is independently applicable — pick and apply the ones relevant to the current task.

---

## Text Wrapping

A quick way to improve how text behaves in your app is to use `text-wrap: balance`. It distributes text evenly across each line, avoiding orphaned words.

```css
/* Headings and short copy */
h1, h2, h3, .headline, .card-title {
  text-wrap: balance;
}

/* For longer body copy — uses a smarter but slower algorithm */
p, .description {
  text-wrap: pretty;
}
```

**Balance** prevents orphaned words — a single word hanging alone on the last line.
**Pretty** is similar but uses a different algorithm. Slightly slower, better for longer text.

---

## Concentric Border Radius

Concentric offset is a technique for a balanced visual look when nesting elements inside one another. It's one of the most important concepts that make interfaces feel great, and it often goes unnoticed.

**The formula:**

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

There's still a surprising number of apps that mismatch border radii. If you're not already doing this, start — it will make your interfaces feel much better.

**Apply everywhere elements nest:**
- Buttons containing icons
- Cards containing images or badges
- Modals containing content areas
- Inputs inside form containers
- Any `padding` + inner `border-radius` combination

---

## Animate Icons Contextually

Animating `opacity`, `scale`, and `blur` on icons when they are shown contextually makes the transition feel better and more responsive.

```tsx
/* Framer Motion — preferred for spring support */
<AnimatePresence mode="wait">
  {isCopied ? (
    <motion.span
      key="check"
      initial={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
      animate={{ opacity: 1, scale: 1,   filter: "blur(0px)" }}
      exit={{    opacity: 0, scale: 0.8, filter: "blur(4px)" }}
      transition={{ duration: 0.15 }}
    >
      <CheckIcon />
    </motion.span>
  ) : (
    <motion.span
      key="copy"
      initial={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
      animate={{ opacity: 1, scale: 1,   filter: "blur(0px)" }}
      exit={{    opacity: 0, scale: 0.8, filter: "blur(4px)" }}
      transition={{ duration: 0.15 }}
    >
      <CopyIcon />
    </motion.span>
  )}
</AnimatePresence>
```

```css
/* CSS-only alternative */
.icon {
  transition:
    opacity 150ms ease-out,
    scale 150ms ease-out,
    filter 150ms ease-out;
}
.icon.entering {
  opacity: 0;
  scale: 0.8;
  filter: blur(4px);
}
```

Framer Motion is preferred because it allows spring animations easily. The CSS approach works for simple cases.

---

## Make Text Crispy

On macOS, text rendering can sometimes appear heavier than intended. Setting `-webkit-font-smoothing: antialiased` makes text render slightly thinner and crisper — especially visible in dark mode and on light text.

```css
/* Apply globally to the layout */
html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

```jsx
/* Tailwind */
<body className="antialiased">
```

The best way to apply this is to add it to the entire layout so it applies to all text elements in your app.

---

## Use Tabular Numbers

If your numbers shift when they update, use `font-variant-numeric: tabular-nums`. It makes the digits equal width.

```css
.counter, .price, .timer, .stat {
  font-variant-numeric: tabular-nums;
}
```

```jsx
/* Tailwind */
<span className="tabular-nums">{count}</span>
```

**Keep in mind:** Some fonts such as Inter change the look of numerals when this property is used. Always preview on your actual typeface before shipping.

---

## Make Your Animations Interruptible

When it comes to interruptibility, CSS transitions and keyframe animations behave differently:

- **Transitions** interpolate toward the latest state and can be interrupted
- **Keyframe animations** run on a fixed timeline and don't retarget after they start

Users often change their intent mid-interaction. If animations aren't interruptible, the interface can feel broken.

```css
/* GOOD — interruptible CSS transition */
.element {
  transition: transform 250ms ease-out;
}

/* BAD for interactions — not interruptible */
.element.animating {
  animation: slideIn 250ms ease-out forwards;
}
```

**Rule of thumb:**
- CSS transitions → great for interactions (hover, toggle, open/close)
- CSS keyframe animations → better for staged sequences that run once (page load, entrance)

On iOS, interruptibility is quite prevalent for this very reason — every animation can be reversed mid-flight.

---

## Split and Stagger Entering Elements

Enter animations often combine `opacity`, `blur`, and `translateY`. It helps to break animated components into smaller chunks and animate them individually instead of animating a big block at once.

```tsx
<div className="animate-enter" style={{ "--stagger": 1 }}>
  <Title />
</div>
<div className="animate-enter" style={{ "--stagger": 2 }}>
  <Description />
</div>
<div className="animate-enter" style={{ "--stagger": 3 }}>
  <Buttons />
</div>
```

```css
@keyframes enter {
  from {
    transform: translateY(8px);
    filter: blur(5px);
    opacity: 0;
  }
}

.animate-enter {
  animation: enter 800ms cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  animation-delay: calc(var(--delay, 0ms) * var(--stagger, 0));
}

.animate-enter-individual-title {
  --delay: 80ms;
}
```

For headings, split the title into individual `<span>` elements — each span containing a word — and animate them individually with an ~80ms delay between them. The description remains a single block and the buttons are also animated individually rather than their entire container.

---

## Make Exit Animations Subtle

Exit animations usually work better when they're more subtle than enter animations.

```tsx
/* Subtle exit — fixed small value */
exit={{
  opacity: 0,
  y: "-12px",      /* not "calc(-100% - 4px)" */
  filter: "blur(4px)",
}}
transition={{ type: "spring", duration: 0.45, bounce: 0 }}
```

Exiting elements don't need the same amount of movement and attention as entering elements. Some subtle motion should still remain to indicate the direction — don't remove the animation completely.

In the "full" mode, the exit y value is `calc(-100% - 4px)` which is the height of the container plus the padding. In the "subtle" mode, use a fixed value of `-12px`. By doing this, the exit animation becomes much softer and less jarring.

---

## Align Optically, Not Geometrically

Aligning items geometrically works great most of the time, but there are instances where it just looks off. When that happens, align items optically instead.

For example, when a button has both text and an icon, it is better to have a slightly smaller padding on the side of the icon to optically align the content.

```css
/* Geometric */
.button { padding: 8px 12px; }

/* Optical — trailing icon needs slightly less padding on that side */
.button-with-trailing-icon {
  padding: 8px 10px 8px 12px;
}
```

This often happens with icons. While a lot of icon packs already account for this, there are shapes that need to be optically aligned. Fix it by adding `margin` or `padding` depending on the container. For icons, the best way to fix it is in the SVG itself, so no additional `margin` or `padding` needs to be added.

---

## Use Shadows Instead of Borders

Instead of borders, I often prefer to use a subtle `box-shadow` that adds more depth to the element. The difference is only noticeable in light mode.

```css
.card {
  box-shadow:
    0px 0px 0px 1px rgba(0, 0, 0, 0.06),
    0px 1px 2px -1px rgba(0, 0, 0, 0.06),
    0px 2px 4px 0px rgba(0, 0, 0, 0.04);
  transition: box-shadow 200ms ease-out;
}

/* Hover state — same shadow, slightly darker */
.card:hover {
  box-shadow:
    0px 0px 0px 1px rgba(0, 0, 0, 0.08),
    0px 1px 2px -1px rgba(0, 0, 0, 0.08),
    0px 2px 4px 0px rgba(0, 0, 0, 0.06);
}
```

Shadows are versatile and adapt well to any background since they use transparency. Borders with solid colors don't work well when used on backgrounds other than the ones they were designed for. This also helps with images — a solid border color looks off on top of a photo, but a transparent shadow adapts naturally.

---

## Add Outline to Images

A visual tweak that adds a 1px black or white (depending on mode) outline with 10% opacity to images. This creates a sense of depth and a somewhat consistent outline around the element.

```css
.image-with-depth {
  outline: 1px solid rgba(0, 0, 0, 0.1);
  outline-offset: -1px; /* sits inside the element, not outside */
}

.dark .image-with-depth {
  outline-color: rgba(255, 255, 255, 0.1);
}
```

Use mostly in design systems where other elements also use borders for visual consistency.
