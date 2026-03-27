# REF-07: Accessible Component Patterns

## Forms

### Complete Accessible Form (React)

```tsx
import { useId, useState } from 'react';

interface FieldProps {
  label: string;
  type?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  autoComplete?: string;
  value: string;
  onChange: (v: string) => void;
}

function FormField({ label, type = 'text', required, hint, error, autoComplete, value, onChange }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`field ${error ? 'field--error' : ''}`}>
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true" className="required"> *</span>}
      </label>

      {hint && <p id={hintId} className="field__hint">{hint}</p>}

      <input
        id={id}
        type={type}
        required={required}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        autoComplete={autoComplete}
        value={value}
        onChange={e => onChange(e.target.value)}
      />

      {error && (
        <p id={errorId} role="alert" className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}
```

### Form with Live Error Summary

```tsx
function Form() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate(formData);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // Move focus to error summary so AT announces it
      errorSummaryRef.current?.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {Object.keys(errors).length > 0 && (
        <div
          ref={errorSummaryRef}
          tabIndex={-1}
          role="alert"
          aria-labelledby="error-heading"
          className="error-summary"
        >
          <h2 id="error-heading">There are {Object.keys(errors).length} errors</h2>
          <ul>
            {Object.entries(errors).map(([field, msg]) => (
              <li key={field}>
                <a href={`#${field}`}>{msg}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* fields... */}
    </form>
  );
}
```

---

## Modal / Dialog

### Accessible Modal (React) with Focus Trap

```tsx
import { useEffect, useRef } from 'react';

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function Modal({ isOpen, onClose, title, children }: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  // Focus first focusable element on open
  useEffect(() => {
    if (isOpen) {
      const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      firstFocusable?.focus();
    }
  }, [isOpen]);

  // Focus trap + Escape to close
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key !== 'Tab') return;

    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="modal-overlay" onClick={onClose} aria-hidden="true" />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={handleKeyDown}
        className="modal"
      >
        <h2 id={titleId}>{title}</h2>
        {children}
        <button onClick={onClose} aria-label="Close dialog">X</button>
      </div>
    </>
  );
}
```

---

## Tabs

### Accessible Tabs (React)

```tsx
function Tabs({ items }: { items: { id: string; label: string; content: React.ReactNode }[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let next = index;
    if (e.key === 'ArrowRight') next = (index + 1) % items.length;
    else if (e.key === 'ArrowLeft') next = (index - 1 + items.length) % items.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = items.length - 1;
    else return;

    e.preventDefault();
    setActiveIndex(next);
    document.getElementById(`tab-${items[next].id}`)?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label="Content sections">
        {items.map((item, i) => (
          <button
            key={item.id}
            id={`tab-${item.id}`}
            role="tab"
            aria-selected={i === activeIndex}
            aria-controls={`panel-${item.id}`}
            tabIndex={i === activeIndex ? 0 : -1}
            onClick={() => setActiveIndex(i)}
            onKeyDown={e => handleKeyDown(e, i)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {items.map((item, i) => (
        <div
          key={item.id}
          id={`panel-${item.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${item.id}`}
          hidden={i !== activeIndex}
          tabIndex={0}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
```

---

## Accordion

### Accessible Accordion (React)

```tsx
function Accordion({ items }: { items: { id: string; title: string; content: React.ReactNode }[] }) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setOpenIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="accordion">
      {items.map(item => {
        const isOpen = openIds.has(item.id);
        return (
          <div key={item.id} className="accordion__item">
            <h3>
              <button
                aria-expanded={isOpen}
                aria-controls={`panel-${item.id}`}
                id={`header-${item.id}`}
                onClick={() => toggle(item.id)}
                className="accordion__trigger"
              >
                {item.title}
                <span aria-hidden="true">{isOpen ? 'up' : 'down'}</span>
              </button>
            </h3>
            <div
              id={`panel-${item.id}`}
              role="region"
              aria-labelledby={`header-${item.id}`}
              hidden={!isOpen}
              className="accordion__panel"
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

---

## Dropdown Menu

### Accessible Action Menu (React)

```tsx
function ActionMenu({ label, items }: {
  label: string;
  items: { id: string; label: string; action: () => void }[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const menuRef = useRef<HTMLUListElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const close = () => { setIsOpen(false); setActiveIndex(-1); buttonRef.current?.focus(); };

  const handleButtonKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(true);
      setActiveIndex(0);
    }
  };

  const handleMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, items.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)); }
    if (e.key === 'Home') { e.preventDefault(); setActiveIndex(0); }
    if (e.key === 'End') { e.preventDefault(); setActiveIndex(items.length - 1); }
    if (e.key === 'Tab') close();
  };

  useEffect(() => {
    if (isOpen && activeIndex >= 0) {
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]')[activeIndex]?.focus();
    }
  }, [isOpen, activeIndex]);

  return (
    <div className="menu-container" onKeyDown={handleMenuKeyDown}>
      <button
        ref={buttonRef}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen(o => !o)}
        onKeyDown={handleButtonKeyDown}
      >
        {label}
      </button>

      {isOpen && (
        <ul ref={menuRef} id={menuId} role="menu" aria-label={label}>
          {items.map(item => (
            <li key={item.id} role="none">
              <button
                role="menuitem"
                onClick={() => { item.action(); close(); }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## Combobox / Autocomplete

### Accessible Combobox (React)

```tsx
function Combobox({ label, options }: { label: string; options: string[] }) {
  const [value, setValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputId = useId();
  const listboxId = useId();

  const filtered = options.filter(o => o.toLowerCase().includes(value.toLowerCase()));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIsOpen(true); setActiveIndex(i => Math.min(i + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && activeIndex >= 0) { setValue(filtered[activeIndex]); setIsOpen(false); }
    if (e.key === 'Escape') { setIsOpen(false); setActiveIndex(-1); }
  };

  return (
    <div className="combobox">
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={activeIndex >= 0 ? `opt-${activeIndex}` : undefined}
        value={value}
        onChange={e => { setValue(e.target.value); setIsOpen(true); setActiveIndex(-1); }}
        onKeyDown={handleKeyDown}
      />
      {isOpen && filtered.length > 0 && (
        <ul id={listboxId} role="listbox" aria-label={label}>
          {filtered.map((opt, i) => (
            <li
              key={opt}
              id={`opt-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              onClick={() => { setValue(opt); setIsOpen(false); }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## Toast / Live Notification

```tsx
function Toast({ message, type = 'info' }: { message: string; type?: 'info' | 'error' | 'success' }) {
  return (
    // role="alert" is assertive; role="status" is polite
    // Use assertive only for errors requiring immediate attention
    <div
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={`toast toast--${type}`}
    >
      {message}
    </div>
  );
}

// Usage: inject into pre-existing live region (already in DOM)
// The live region container must exist BEFORE content is injected
function LiveRegionContainer() {
  const [message, setMessage] = useState('');
  return (
    <div aria-live="polite" aria-atomic="true" className="sr-live-region">
      {message}
    </div>
  );
}
```

---

## Skip Link

```tsx
// Place as first element in <body>
function SkipLink() {
  return (
    <a href="#main-content" className="skip-link">
      Skip to main content
    </a>
  );
}
```

```css
.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  background: #000;
  color: #fff;
  padding: 0.5rem 1rem;
  z-index: 9999;
  text-decoration: none;
}
/* Visible on focus */
.skip-link:focus {
  top: 0;
}
```

---

## Data Table

```tsx
function DataTable({ caption, headers, rows }: {
  caption: string;
  headers: string[];
  rows: (string | number)[][];
}) {
  return (
    <div role="region" aria-label={caption} style={{ overflowX: 'auto' }}>
      <table>
        <caption>{caption}</caption>
        <thead>
          <tr>
            {headers.map(h => <th key={h} scope="col">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                j === 0
                  ? <th key={j} scope="row">{cell}</th>
                  : <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## SwiftUI Accessible Component (iOS)

```swift
// Accessible toggle button
struct FavoriteButton: View {
    @State private var isFavorite = false

    var body: some View {
        Button(action: { isFavorite.toggle() }) {
            Image(systemName: isFavorite ? "heart.fill" : "heart")
                .foregroundColor(isFavorite ? .red : .gray)
        }
        .accessibilityLabel(isFavorite ? "Remove from favorites" : "Add to favorites")
        .accessibilityAddTraits(.isButton)
    }
}

// Accessible form field
struct AccessibleTextField: View {
    let label: String
    let hint: String?
    @Binding var text: String
    let error: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .font(.caption)
                .foregroundColor(.secondary)

            TextField(label, text: $text)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .accessibilityLabel(label)
                .accessibilityHint(hint ?? "")
                .accessibilityValue(text.isEmpty ? "Empty" : text)

            if let error {
                Text(error)
                    .foregroundColor(.red)
                    .font(.caption)
                    .accessibilityLabel("Error: \(error)")
            }
        }
        .accessibilityElement(children: .combine)
    }
}
```

---

## CSS Utility Classes (Accessibility Helpers)

```css
/* Visually hidden but accessible to screen readers */
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

/* Focusable version (for skip links) */
.sr-only:focus,
.sr-only:active {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}

/* High-contrast focus ring */
:focus-visible {
  outline: 3px solid var(--color-focus, #005fcc);
  outline-offset: 2px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* High contrast mode support */
@media (prefers-contrast: more) {
  :focus-visible {
    outline: 4px solid ButtonText;
  }
}
```