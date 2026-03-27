# REF-01: WCAG Standards Reference

## WCAG 2.2 -- Current Baseline (W3C Recommendation, ISO/IEC 40500:2025)

WCAG 2.2 is the current W3C Recommendation and primary compliance baseline.
It is backward-compatible with WCAG 2.0 and 2.1.

### POUR Principles

| Principle | Meaning |
|-----------|---------|
| **Perceivable** | Information and UI components must be presentable to users in ways they can perceive |
| **Operable** | UI components and navigation must be operable |
| **Understandable** | Information and operation of UI must be understandable |
| **Robust** | Content must be robust enough to be interpreted by a wide variety of user agents and ATs |

---

## WCAG 2.2 -- New Success Criteria (vs 2.1)

| SC | Level | Criterion | Key Rule |
|----|-------|-----------|----------|
| 2.4.11 | AA | Focus Not Obscured (Minimum) | Focused component not entirely hidden by sticky headers/footers |
| 2.4.12 | AAA | Focus Not Obscured (Enhanced) | Focused component not even partially obscured |
| 2.4.13 | AAA | Focus Appearance | Focus indicator area >= perimeter of unfocused component x 2px |
| 2.5.7 | AA | Dragging Movements | All dragging actions have a single-pointer alternative |
| 2.5.8 | AA | Target Size (Minimum) | Target size >= 24x24 CSS pixels (with exceptions) |
| 3.2.6 | A | Consistent Help | Help mechanisms in same relative order across pages |
| 3.3.7 | A | Redundant Entry | Info previously entered not re-requested unless essential |
| 3.3.8 | AA | Accessible Authentication (Minimum) | No cognitive function test required to authenticate |
| 3.3.9 | AAA | Accessible Authentication (Enhanced) | No cognitive test at any step |

---

## Essential WCAG 2.1 / 2.0 Criteria (AA -- Most Commonly Failed)

### Perceivable

| SC | Level | Rule |
|----|-------|------|
| 1.1.1 | A | All non-text content has text alternative (alt, aria-label, aria-labelledby) |
| 1.3.1 | A | Info and relationships conveyed through presentation are programmatically determinable |
| 1.3.2 | A | Meaningful reading/focus order preserved in DOM |
| 1.3.3 | A | Instructions don't rely solely on sensory characteristics (shape, color, location) |
| 1.3.4 | AA | Content not restricted to single display orientation (unless essential) |
| 1.3.5 | AA | Input purpose of form fields can be programmatically determined (autocomplete) |
| 1.4.1 | A | Color not used as the only visual means of conveying information |
| 1.4.3 | AA | Text contrast >= 4.5:1 (normal), >= 3:1 (large text >= 18pt / 14pt bold) |
| 1.4.4 | AA | Text can be resized up to 200% without loss of content or functionality |
| 1.4.10 | AA | Content reflows at 320 CSS pixel width without horizontal scrolling |
| 1.4.11 | AA | UI component and graphical object contrast >= 3:1 |
| 1.4.12 | AA | No loss of content when: line height >= 1.5x, paragraph spacing >= 2x, letter spacing >= 0.12em, word spacing >= 0.16em |
| 1.4.13 | AA | Content on hover/focus: dismissible, hoverable, persistent |

### Operable

| SC | Level | Rule |
|----|-------|------|
| 2.1.1 | A | All functionality available from keyboard |
| 2.1.2 | A | No keyboard trap |
| 2.4.1 | A | Skip blocks of repeated content (skip link) |
| 2.4.2 | A | Pages have descriptive titles |
| 2.4.3 | A | Focus order preserves meaning and operability |
| 2.4.4 | A | Link purpose determinable from link text or context |
| 2.4.6 | AA | Headings and labels are descriptive |
| 2.4.7 | AA | Keyboard focus indicator visible |
| 2.5.3 | A | Label in Name -- visible label text included in accessible name |

### Understandable

| SC | Level | Rule |
|----|-------|------|
| 3.1.1 | A | Language of page programmatically determined (`lang` attribute) |
| 3.2.1 | A | No context change on focus |
| 3.2.2 | A | No context change on input without prior warning |
| 3.3.1 | A | Input errors identified and described in text |
| 3.3.2 | A | Labels or instructions provided for user input |
| 3.3.3 | AA | Error suggestions provided when known |
| 3.3.4 | AA | Error prevention for legal/financial/data submissions |

### Robust

| SC | Level | Rule |
|----|-------|------|
| 4.1.1 | A | No duplicate IDs; valid HTML parsing |
| 4.1.2 | A | All UI components have name, role, value programmatically determinable |
| 4.1.3 | AA | Status messages programmatically determinable without focus (aria-live) |

---

## Contrast Requirements (Quick Reference)

| Text Type | Minimum AA | Enhanced AAA |
|-----------|-----------|--------------|
| Normal text (< 18pt / < 14pt bold) | 4.5:1 | 7:1 |
| Large text (>= 18pt or >= 14pt bold) | 3:1 | 4.5:1 |
| UI components / graphical objects | 3:1 | -- |
| Inactive / disabled components | No requirement | -- |
| Decorative / logo text | No requirement | -- |

**Target size (WCAG 2.5.8 AA):** Minimum 24x24 CSS pixels for all interactive targets.
Recommended best practice: 44x44 px (Apple HIG) or 48x48 dp (Material Design).

---

## WCAG 3.0 (Future -- Not Yet Compliant Baseline)

- Early-stage W3C Working Draft; not backward-compatible with 2.x
- New outcome-based, flexible conformance model with scoring
- Covers broader content types: browsers, authoring tools, XR
- **Do not use as current compliance baseline**

---

## Standards Hierarchy

```
ISO/IEC 40500:2025
    --- WCAG 2.2 (W3C Recommendation) -- Current web baseline
            --- WCAG 2.1 (backward-compatible)
                    --- WCAG 2.0 (backward-compatible)

EN 301 549 v3 (EU)  -- References WCAG 2.1/2.2 for web/mobile
Section 508 (US)    -- References WCAG 2.0/2.1 for federal ICT
```

---

## Tools for Contrast Checking
- **WebAIM Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **Colour Contrast Analyser (desktop app):** Pick colors from screen
- **axe DevTools:** Flags contrast failures in browser
- **Figma plugins:** Contrast, A11y Annotation Kit

---

## Sources
- WCAG 2.1: https://www.w3.org/TR/WCAG21/
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- WebAIM WCAG Checklist: https://webaim.org/standards/wcag/checklist
- EN 301 549: https://www.etsi.org/deliver/etsi_en/301500_302000/301549/