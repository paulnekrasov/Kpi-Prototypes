# REF-06: Accessibility Anti-Patterns

## Principle

> If you're considering any of the patterns below, **stop**.
> Every anti-pattern here has a simple, native alternative.
> Bad ARIA and broken semantics cause more harm than no accessibility effort.

---

## Anti-Pattern 1: `<div>` / `<span>` as Interactive Element

**Why it fails:** Not in the tab order by default; no implicit role; no keyboard activation; screen readers announce it as generic container.

```html
<!-- WRONG -->
<div class="btn" onclick="submit()">Submit Order</div>
<span onclick="openMenu()">Menu</span>

<!-- CORRECT -- use native elements -->
<button type="button" onclick="submit()">Submit Order</button>
<button type="button" aria-haspopup="menu" aria-expanded="false" onclick="openMenu()">
  <span aria-hidden="true">Menu</span>
</button>

<!-- If you absolutely must use a div (rare legacy case) -->
<div role="button" tabindex="0"
     onkeydown="handleKey(event)"
     onclick="submit()">
  Submit Order
</div>
<!-- + JS: handle Enter and Space keys, manage focus visibility -->
```

**WCAG:** 4.1.2 (Name, Role, Value), 2.1.1 (Keyboard)

---

## Anti-Pattern 2: Removing Focus Outline Without Replacement

**Why it fails:** Keyboard users cannot see where focus is. This is one of the most widespread and harmful accessibility failures.

```css
/* WRONG -- destroys keyboard navigation entirely */
* { outline: none; }
button:focus { outline: 0; }
input:focus { outline: none; }

/* CORRECT -- replace with visible, high-contrast focus style */
:focus-visible {
  outline: 3px solid #005fcc;
  outline-offset: 2px;
  border-radius: 2px;
}

/* Remove only for mouse/touch, keep for keyboard */
:focus:not(:focus-visible) {
  outline: none;
}
```

**WCAG:** 2.4.7 (Focus Visible, AA), 2.4.11 (Focus Not Obscured, AA)

---

## Anti-Pattern 3: Color as the Only State Indicator

**Why it fails:** Approximately 8% of men and 0.5% of women have color vision deficiency. Fails completely in grayscale/high-contrast mode.

```html
<!-- WRONG -- only color differentiates required vs optional -->
<label style="color: red">Email *</label>
<input type="email" style="border-color: red" />
<p style="color: red">Please enter a valid email</p>

<!-- CORRECT -- color + icon + text label -->
<label>
  Email
  <span class="required" aria-label="required">*</span>
</label>
<input type="email" aria-invalid="true" aria-describedby="email-error" />
<p id="email-error" role="alert">
  <svg aria-hidden="true" class="icon-error">...</svg>
  Error: Please enter a valid email address
</p>
```

```css
/* Use border + background change, not just color */
.input-error {
  border: 2px solid #d93025;
  background: #fce8e6;
}
```

**WCAG:** 1.4.1 (Use of Color), 1.3.3 (Sensory Characteristics)

---

## Anti-Pattern 4: Placeholder as the Only Form Label

**Why it fails:** Placeholder disappears when user starts typing; not announced as label by all screen readers; fails contrast requirements; confuses users with cognitive disabilities.

```html
<!-- WRONG -->
<input type="email" placeholder="Email address" />

<!-- CORRECT -- visible label always -->
<div class="field">
  <label for="email">Email address</label>
  <input type="email" id="email" placeholder="you@example.com"
         autocomplete="email" />
</div>

<!-- If space is truly limited -- visually hidden label -->
<label for="search" class="sr-only">Search products</label>
<input type="search" id="search" placeholder="Search..." />
```

```css
/* Screen-reader-only utility class */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

**WCAG:** 3.3.2 (Labels or Instructions), 1.3.1 (Info and Relationships)

---

## Anti-Pattern 5: Fixed Pixel Font Sizes

**Why it fails:** Prevents low-vision users from scaling text. Browser default font size is 16px (1rem). Fixed px sizes override user preferences.

```css
/* WRONG */
body { font-size: 14px; }
h1   { font-size: 24px; }
.caption { font-size: 11px; }

/* CORRECT -- relative units that scale with user preferences */
:root { font-size: 100%; } /* = user's browser default */
body  { font-size: 1rem; }    /* = 16px at default */
h1    { font-size: 1.5rem; }  /* = 24px at default */
h2    { font-size: 1.25rem; }
.caption { font-size: 0.875rem; } /* = 14px at default */

/* Minimum: never go below 0.75rem (12px equivalent) for any visible text */
```

**WCAG:** 1.4.4 (Resize Text), 1.4.12 (Text Spacing)

---

## Anti-Pattern 6: Icon-Only Buttons Without Accessible Names

**Why it fails:** Screen reader announces button as "button" or reads the Unicode symbol -- completely meaningless.

```html
<!-- WRONG -->
<button onclick="closeModal()">X</button>
<button onclick="deleteItem()"><svg>...</svg></button>

<!-- CORRECT -- aria-label provides the accessible name -->
<button onclick="closeModal()" aria-label="Close dialog">
  <svg aria-hidden="true" focusable="false">...</svg>
</button>

<!-- CORRECT -- visually hidden text (visible on focus, useful for branding) -->
<button onclick="deleteItem()">
  <svg aria-hidden="true" focusable="false">...</svg>
  <span class="sr-only">Delete item</span>
</button>

<!-- CORRECT -- tooltip pattern (icon + visible tooltip on hover/focus) -->
<button aria-label="Delete item" aria-describedby="delete-tooltip">
  <svg aria-hidden="true" focusable="false">...</svg>
</button>
<div role="tooltip" id="delete-tooltip">Delete item</div>
```

**WCAG:** 4.1.2 (Name, Role, Value), 2.5.3 (Label in Name)

---

## Anti-Pattern 7: Autoplaying Video or Audio

**Why it fails:** Startles/disorients users with vestibular disorders, cognitive disabilities, or who are using screen readers (audio conflicts). Violates user autonomy.

```html
<!-- WRONG -->
<video src="intro.mp4" autoplay></video>
<video src="hero.mp4" autoplay loop muted></video>

<!-- CORRECT -- no autoplay; user controls -->
<video src="intro.mp4" controls preload="metadata">
  <track kind="captions" src="captions.vtt" srclang="en" label="English" />
</video>

<!-- If decorative background video is necessary (muted, no audio) -->
<video src="bg.mp4" autoplay loop muted playsinline
       aria-hidden="true">
</video>
<!-- Respect prefers-reduced-motion for the video itself -->
```

```css
@media (prefers-reduced-motion: reduce) {
  video[autoplay] { display: none; }
  .animated { animation: none !important; transition: none !important; }
}
```

**WCAG:** 1.4.2 (Audio Control), 2.2.2 (Pause, Stop, Hide)

---

## Anti-Pattern 8: Overusing ARIA Instead of Fixing HTML

**Why it fails:** ARIA overrides native semantics -- incorrect ARIA creates worse experience than no ARIA. Brittle and hard to maintain.

```html
<!-- WRONG -- ARIA patching a div when a native element exists -->
<div role="button" tabindex="0" aria-label="Submit"
     aria-pressed="false" aria-disabled="false"
     aria-describedby="submit-desc">
  Submit
</div>

<!-- CORRECT -- native element, no ARIA needed -->
<button type="submit" aria-describedby="submit-desc">Submit</button>

<!-- WRONG -- heading using ARIA on a div -->
<div role="heading" aria-level="2">Section Title</div>

<!-- CORRECT -->
<h2>Section Title</h2>

<!-- WRONG -- landmark using ARIA on a div instead of element -->
<div role="navigation" aria-label="Main">...</div>

<!-- CORRECT -->
<nav aria-label="Main">...</nav>
```

**ARIA is appropriate for:**
- Custom widgets without native equivalents (e.g., tree view, complex combobox)
- Supplementing native semantics (`aria-expanded`, `aria-live`, `aria-describedby`)
- Icon-only controls that need `aria-label`

**WCAG:** 4.1.2 (Name, Role, Value)

---

## Anti-Pattern 9: `tabindex` > 0

**Why it fails:** Creates a custom tab order that overrides the natural DOM order. Confuses keyboard and AT users. Extremely hard to maintain.

```html
<!-- WRONG -- custom tab order nightmare -->
<button tabindex="3">First visually but third in DOM</button>
<input tabindex="1" />
<a tabindex="2" href="#">Link</a>

<!-- CORRECT -- fix DOM order instead -->
<!-- Reorder elements in the HTML to match visual/logical reading order -->
<input />         <!-- tab stop 1 -->
<a href="#">Link</a>  <!-- tab stop 2 -->
<button>Button</button> <!-- tab stop 3 -->

<!-- tabindex="0" is OK: makes non-focusable element focusable -->
<!-- tabindex="-1" is OK: programmatic focus only (dialogs, alerts) -->
```

**WCAG:** 2.4.3 (Focus Order)

---

## Anti-Pattern 10: `aria-hidden="true"` on Focusable Elements

**Why it fails:** Element is invisible to AT but still receives keyboard focus -- keyboard users Tab to an invisible element.

```html
<!-- WRONG -->
<button aria-hidden="true" onclick="openHelp()">?</button>
<a href="/skip" aria-hidden="true">Skip to content</a>

<!-- CORRECT -- if element should be hidden from AT, also remove from tab order -->
<button aria-hidden="true" tabindex="-1" onclick="openHelp()">?</button>

<!-- OR -- remove aria-hidden and provide a proper label instead -->
<button aria-label="Get help">?</button>
```

**WCAG:** 4.1.2 (Name, Role, Value), 2.1.1 (Keyboard)

---

## Anti-Pattern 11: Hover-Only Interactions

**Why it fails:** Touch devices have no hover state. Keyboard users cannot trigger hover. Motor impairment users struggle with precise hovering.

```html
<!-- WRONG -- tooltip only on hover -->
<span class="tooltip-trigger">
  Help
  <span class="tooltip">Only visible on :hover</span>
</span>

<!-- CORRECT -- trigger on both hover AND focus -->
<span class="tooltip-trigger">
  <button aria-describedby="help-tip">Help</button>
  <span role="tooltip" id="help-tip">Additional information...</span>
</span>
```

```css
/* Show on hover AND focus */
.tooltip-trigger:hover .tooltip,
.tooltip-trigger:focus-within .tooltip {
  display: block;
}
/* Also: make tooltip hoverable (WCAG 1.4.13) */
.tooltip { pointer-events: auto; }
```

**WCAG:** 1.4.13 (Content on Hover or Focus), 2.1.1 (Keyboard)

---

## Anti-Pattern 12: Tables Used for Layout

**Why it fails:** Screen readers announce table structure -- row count, column count, headers -- for layout tables, creating confusing noise.

```html
<!-- WRONG -- table for visual column layout -->
<table>
  <tr>
    <td>Nav content</td>
    <td>Main content</td>
    <td>Sidebar</td>
  </tr>
</table>

<!-- CORRECT -- CSS layout (flexbox/grid) -->
<div class="layout">
  <nav>Nav content</nav>
  <main>Main content</main>
  <aside>Sidebar</aside>
</div>

<!-- CORRECT -- data tables with proper headers -->
<table>
  <caption>Quarterly Sales</caption>
  <thead>
    <tr>
      <th scope="col">Quarter</th>
      <th scope="col">Revenue</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Q1 2025</th>
      <td>$1.2M</td>
    </tr>
  </tbody>
</table>
```

**WCAG:** 1.3.1 (Info and Relationships)

---

## Summary Cheat Sheet

| Anti-Pattern | Fix in One Line |
|-------------|----------------|
| `<div>` as button | Use `<button>` |
| `outline: none` | Use `:focus-visible` with contrast ring |
| Color-only state | Add icon + text |
| Placeholder as label | Add visible `<label>` |
| Fixed `px` fonts | Use `rem`/`em` |
| Icon button without label | Add `aria-label` |
| Autoplay media | Remove autoplay; add controls |
| ARIA overuse | Use native HTML element |
| `tabindex > 0` | Fix DOM order |
| `aria-hidden` on focusable | Also add `tabindex="-1"` |
| Hover-only interaction | Trigger on `:focus-within` too |
| Layout table | Use CSS flexbox/grid |