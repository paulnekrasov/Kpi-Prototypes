# REF-04: Testing & Auditing Playbook

## Key Principle

> Automated tools catch approximately **30-40% of WCAG issues**.
> Manual keyboard + screen reader testing is mandatory for meaningful compliance.
> Use multiple automated tools -- no single tool catches everything.

---

## Automated Testing Tools

### axe-core / axe DevTools
- **What it catches:** ~57% of WCAG issues (highest coverage of automated tools)
- **Browser extension:** axe DevTools (Chrome Web Store)
- **CI integration via jest-axe:**

```js
// Install
// npm install --save-dev jest-axe @testing-library/react

import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@testing-library/react';
expect.extend(toHaveNoViolations);

test('LoginForm has no accessibility violations', async () => {
  const { container } = render(<LoginForm />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

- **CLI:** `axe https://example.com --tags wcag2a,wcag2aa,wcag22aa`
- **Rules reference:** https://dequeuniversity.com/rules/axe/

### WAVE (WebAIM)
- **Best for:** Designers, content authors, visual overlay on live pages
- **What it shows:** Errors (red), alerts (yellow), features (green), structural (blue), ARIA (purple)
- **Use for:** Initial design reviews, catching obvious issues without DevTools
- **Extension:** Available for Chrome and Firefox
- **Online tool:** https://wave.webaim.org

### Lighthouse (Google)
- **Built into Chrome DevTools** (Audits panel) and CI via `lighthouse-ci`
- **What it catches:** Subset of axe rules + performance/SEO + best practices
- **Accessibility score:** 0-100 weighted by impact
- **CI integration:**
```bash
npm install -g @lhci/cli
lhci autorun --config=lighthouserc.js
```

### Multi-Tool Strategy
Research shows combining 3+ tools provides the broadest automated coverage:
1. **axe** -- deepest rule set, best for CI
2. **WAVE** -- best visual overlay for human review
3. **Lighthouse** -- high-level score + CI gating

**Still cannot catch via automation:**
- Keyboard traps
- Incorrect focus order
- Meaningless or misleading labels
- Cognitive overload / reading complexity
- Dynamic content announcements
- Screen reader compatibility issues

---

## React Testing Library -- Accessibility-First Testing

### Query Priority (highest to lowest accessibility alignment)

```
getByRole          -- Preferred: uses ARIA role + accessible name
getByLabelText     -- For form fields
getByPlaceholderText -- Fallback for inputs without label
getByText          -- For non-interactive text
getByDisplayValue  -- For current form values
getByAltText       -- For images
getByTitle         -- Less accessible
getByTestId        -- Last resort (no a11y value)
```

### Role-Based Queries

```js
// Buttons
getByRole('button', { name: /submit/i })
getByRole('button', { name: 'Close' })

// Links
getByRole('link', { name: /learn more about pricing/i })

// Form fields
getByRole('textbox', { name: /email address/i })
getByRole('spinbutton', { name: /quantity/i })
getByRole('checkbox', { name: /agree to terms/i })
getByRole('combobox', { name: /country/i })

// Headings
getByRole('heading', { name: /checkout/i, level: 2 })

// Dialogs
getByRole('dialog', { name: /confirm delete/i })

// Tabs
getByRole('tab', { name: /settings/i })
getByRole('tabpanel', { name: /settings/i })

// Lists
getByRole('list')
getAllByRole('listitem')

// Tables
getByRole('table')
getAllByRole('row')
getAllByRole('cell')

// Alerts
getByRole('alert')        // live assertive
getByRole('status')       // live polite
```

### Testing Interactive Patterns

```js
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Modal focus management
test('dialog traps focus and closes on Escape', async () => {
  const user = userEvent.setup();
  render(<Modal />);

  await user.click(screen.getByRole('button', { name: /open/i }));
  const dialog = screen.getByRole('dialog');
  expect(dialog).toBeInTheDocument();

  // Focus should be inside dialog
  expect(dialog).toContainElement(document.activeElement);

  // Escape closes
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

  // Focus returns to trigger
  expect(screen.getByRole('button', { name: /open/i })).toHaveFocus();
});

// Tab pattern
test('tab keyboard navigation', async () => {
  const user = userEvent.setup();
  render(<Tabs />);

  const tabList = screen.getByRole('tablist');
  const tabs = within(tabList).getAllByRole('tab');

  // First tab selected by default
  expect(tabs[0]).toHaveAttribute('aria-selected', 'true');

  // Arrow right moves to next tab
  await user.click(tabs[0]);
  await user.keyboard('{ArrowRight}');
  expect(tabs[1]).toHaveFocus();
});

// Form error
test('shows accessible error message', async () => {
  const user = userEvent.setup();
  render(<LoginForm />);

  await user.click(screen.getByRole('button', { name: /sign in/i }));

  const emailInput = screen.getByRole('textbox', { name: /email/i });
  expect(emailInput).toHaveAttribute('aria-invalid', 'true');

  const errorMsg = screen.getByRole('alert');
  expect(errorMsg).toHaveTextContent(/email is required/i);
  expect(emailInput).toHaveAttribute('aria-describedby', errorMsg.id);
});
```

---

## Manual Testing Workflow

### Step 1 -- Keyboard-Only Pass

**Setup:** Unplug mouse / disable touchpad. Use Tab to navigate.

**Checklist:**
- [ ] Every interactive element reachable via Tab or arrow keys
- [ ] Focus indicator visible on every focused element
- [ ] No keyboard traps (Tab never gets stuck)
- [ ] Enter/Space activates buttons and links correctly
- [ ] Escape dismisses dialogs, menus, and tooltips
- [ ] Skip link appears on first Tab press and works correctly
- [ ] Modal: focus contained within; Escape closes; focus returns to trigger
- [ ] Dynamic content (errors, toasts, live regions) does not cause unexpected focus jumps
- [ ] Forms: all fields reachable; error messages are adjacent to fields; submission works

### Step 2 -- Screen Reader Pass

**Matrix:**

| Platform | Screen Reader | Browser |
|----------|--------------|---------|
| Windows | NVDA (free) | Firefox (best) or Chrome |
| Windows | JAWS (paid) | Chrome or Edge |
| macOS | VoiceOver (built-in) | Safari (best) or Chrome |
| iOS | VoiceOver (built-in) | Safari |
| Android | TalkBack (built-in) | Chrome |

**Checklist:**
- [ ] Page title read correctly on load
- [ ] Heading structure (H1, H2...) logical and navigable
- [ ] Landmark regions present (header, nav, main, footer)
- [ ] Skip link works
- [ ] All images: meaningful alt text or announced as decorative
- [ ] All buttons/links: clear purpose announced
- [ ] Form fields: labels announced before field
- [ ] Required fields announced
- [ ] Error messages announced when errors occur
- [ ] Modal: announced on open; focus trapped; title read
- [ ] Expanded/collapsed states announced (aria-expanded)
- [ ] Dynamic updates (loading, success, errors) announced via live regions
- [ ] Table headers associated with cells

### Step 3 -- Zoom and Reflow

- Zoom browser to **200%** -- no content lost, no horizontal scroll for text
- Zoom to **400%** -- test reflow (WCAG 1.4.10)
- Increase OS font size (Windows Display Settings, macOS Accessibility)
- Test **text spacing** overrides (line height, letter spacing) -- no content overlap

### Step 4 -- Color and Contrast Checks

- [ ] Contrast ratio >= 4.5:1 for normal text
- [ ] Contrast ratio >= 3:1 for large text and UI components
- [ ] Apply grayscale filter (OS accessibility or browser DevTools) -- all states distinguishable
- [ ] Error states use icon + text, not color alone
- [ ] Focus indicators have >= 3:1 contrast against adjacent area

---

## Audit Process (Full Site or Flow)

### Phase 1 -- Scope and Plan
```
1. Define scope: pages/screens, user flows, WCAG level (AA standard)
2. List assistive technologies to test (minimum: NVDA+Firefox, VoiceOver+Safari)
3. Identify user journeys: sign-up, checkout, account settings, etc.
4. Confirm regulatory requirements: ADA, EAA, Section 508
```

### Phase 2 -- Automated Baseline
```
1. Run axe DevTools on each page
2. Run WAVE for visual overlay
3. Run Lighthouse for overall score
4. Document: total violations, impacted SC codes, severity distribution
```

### Phase 3 -- Manual Checks
```
1. Keyboard-only traversal of each user flow
2. Screen reader traversal (NVDA + VoiceOver minimum)
3. Zoom/reflow testing at 200% and 400%
4. Color contrast audit (automated gaps + visual check)
5. Cognitive: reading level, timeout warnings, error recovery
```

### Phase 4 -- Issue Triage

Severity model:

| Level | Definition | Example |
|-------|-----------|---------|
| **Critical** | Blocks AT users completely | Keyboard trap, unlabeled button |
| **Serious** | Major barrier, workaround exists | Missing heading structure, poor contrast |
| **Moderate** | Impacts UX significantly | Missing error message, unclear link text |
| **Minor** | Best practice violation, low impact | Redundant alt text, verbose ARIA |

### Phase 5 -- Report Structure

```markdown
## Accessibility Audit Report: [Product/Page]
**Date:** YYYY-MM-DD
**WCAG Level:** AA
**Tools:** axe 4.x, WAVE, NVDA 20xx.x, VoiceOver (macOS xx)

### Executive Summary
- [Score / overall state]
- [Top 3 risks]

### Findings

#### Critical Issues
| # | Issue | Location | SC | Fix |
|---|-------|----------|----|-----|
| 1 | No keyboard access to dropdown | `/checkout` | 2.1.1 A | Add keyboard event handlers |

#### Serious / Moderate / Minor
[Same table format]

### Remediation Roadmap
- Sprint 1 (Critical): ...
- Sprint 2 (Serious): ...
- Sprint 3 (Moderate + Design system): ...

### Re-test Plan
[Date, scope, who]
```

### Phase 6 -- CI Integration
```yaml
# GitHub Actions example
- name: Run accessibility tests
  run: |
    npm run test -- --coverage
    npx lighthouse-ci autorun
  env:
    LHCI_TOKEN: ${{ secrets.LHCI_TOKEN }}
```

---

## Sources
- axe DevTools: https://chromewebstore.google.com/detail/axe-devtools/
- WAVE: https://wave.webaim.org
- Lighthouse CI: https://github.com/GoogleChrome/lighthouse-ci
- React Testing Library: https://testing-library.com/docs/
- jest-axe: https://github.com/nickcolley/jest-axe
- NVDA Guide for Sighted Testers: https://webaim.org/articles/nvda/
- Deque University: https://dequeuniversity.com