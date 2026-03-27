# REF-02: WAI-ARIA Patterns Reference

## Core ARIA Principle

> **ARIA augments but does not replace semantic HTML.**
> Use the correct native element first. Apply ARIA only to fill unavoidable semantic gaps.
> Bad ARIA is worse than no ARIA.

Priority order:
1. Native HTML element (`<button>`, `<input>`, `<nav>`)
2. Native HTML + ARIA attribute (`<button aria-pressed="true">`)
3. Custom element + full ARIA role + keyboard handling (last resort)

---

## ARIA Roles -- Common Widget Roles

| Role | Used For | Required Children |
|------|----------|-------------------|
| `button` | Clickable action element | -- |
| `checkbox` | Toggle state control | -- |
| `dialog` | Modal/non-modal dialog | -- |
| `alertdialog` | Dialog requiring immediate response | -- |
| `alert` | Live urgent announcement | -- |
| `status` | Non-urgent live announcement | -- |
| `tab` | Tab in a tablist | -- |
| `tablist` | Container for tabs | `tab` |
| `tabpanel` | Content area for a tab | -- |
| `menu` | Popup menu | `menuitem` |
| `menubar` | Persistent menu bar | `menuitem` |
| `menuitem` | Item in a menu | -- |
| `combobox` | Input + listbox combination | `listbox` |
| `listbox` | Select-like list | `option` |
| `option` | Item in a listbox | -- |
| `grid` | Interactive table/spreadsheet | `row` |
| `row` | Row in grid/table | `cell`/`gridcell` |
| `tree` | Hierarchical list | `treeitem` |
| `treeitem` | Item in a tree | -- |
| `tooltip` | Contextual help popup | -- |
| `progressbar` | Progress indicator | -- |
| `slider` | Range input widget | -- |
| `spinbutton` | Numeric stepper | -- |
| `switch` | On/off toggle | -- |
| `region` | Landmark -- significant section with label | -- |
| `banner` | Landmark -- page header (`<header>`) | -- |
| `navigation` | Landmark -- nav (`<nav>`) | -- |
| `main` | Landmark -- main content (`<main>`) | -- |
| `complementary` | Landmark -- aside (`<aside>`) | -- |
| `contentinfo` | Landmark -- page footer (`<footer>`) | -- |
| `search` | Landmark -- search region | -- |
| `form` | Landmark -- form region with label | -- |

---

## Essential ARIA States & Properties

### Naming & Description
```html
aria-label="Close dialog"                  <!-- direct string label -->
aria-labelledby="heading-id"               <!-- reference visible element -->
aria-describedby="hint-id error-id"        <!-- supplemental description -->
```

### Interactive States
```html
aria-expanded="true|false"                 <!-- toggle: accordion, menu, combobox -->
aria-pressed="true|false|mixed"            <!-- toggle button -->
aria-checked="true|false|mixed"            <!-- checkbox, switch -->
aria-selected="true|false"                 <!-- option, tab, treeitem -->
aria-disabled="true"                       <!-- visually and semantically disabled -->
aria-hidden="true"                         <!-- remove from AT entirely -->
aria-invalid="true|false|grammar|spelling" <!-- form field error state -->
aria-required="true"                       <!-- required field -->
aria-busy="true|false"                     <!-- loading state -->
aria-current="page|step|date|..."          <!-- current item in a set -->
```

### Relationships
```html
aria-controls="panel-id"                   <!-- element controls another -->
aria-owns="child-id"                       <!-- virtual parent-child in DOM -->
aria-haspopup="true|menu|listbox|tree|grid|dialog" <!-- triggers popup -->
aria-activedescendant="focused-child-id"   <!-- composite widget focus -->
aria-live="polite|assertive|off"           <!-- dynamic content announcements -->
aria-atomic="true|false"                   <!-- announce whole region or changes only -->
aria-relevant="additions|removals|text|all"<!-- what changes to announce -->
aria-roledescription="Slide"               <!-- override default role announcement -->
aria-setsize="10" aria-posinset="3"        <!-- position within a set -->
aria-level="2"                             <!-- heading level for custom headings -->
aria-valuemin/max/now/text                 <!-- for sliders, spinbuttons, progressbars -->
```

---

## Widget Keyboard Interaction Patterns (WAI-ARIA APG)

### Dialog / Modal
```
Tab          -> Move focus to next focusable element (cycle within dialog)
Shift+Tab    -> Move focus to previous focusable element (cycle within dialog)
Escape       -> Close dialog; return focus to trigger element
```
```html
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-desc">
  <h2 id="dialog-title">Confirm Delete</h2>
  <p id="dialog-desc">This action cannot be undone.</p>
  <!-- focusable content -->
  <button>Cancel</button>
  <button>Delete</button>
</div>
```

### Tabs
```
Tab          -> Move focus into tablist (to active tab), then into tabpanel
Left/Right   -> Move between tabs (auto-activate or manual)
Home/End     -> First/last tab
```
```html
<div role="tablist" aria-label="Account Settings">
  <button role="tab" aria-selected="true" aria-controls="panel-profile" id="tab-profile">Profile</button>
  <button role="tab" aria-selected="false" aria-controls="panel-security" id="tab-security" tabindex="-1">Security</button>
</div>
<div role="tabpanel" id="panel-profile" aria-labelledby="tab-profile">...</div>
<div role="tabpanel" id="panel-security" aria-labelledby="tab-security" hidden>...</div>
```

### Menu / Dropdown Menu
```
Enter/Space  -> Open menu; activate focused item
Escape       -> Close menu; return focus to trigger
Up/Down      -> Navigate between menu items
Home/End     -> First/last menu item
Tab          -> Close menu (do NOT move focus through menu items)
```
```html
<button aria-haspopup="menu" aria-expanded="false" aria-controls="my-menu">Options</button>
<ul role="menu" id="my-menu">
  <li role="menuitem">Edit</li>
  <li role="menuitem">Delete</li>
</ul>
```

### Accordion
```
Enter/Space  -> Toggle panel open/close
Tab          -> Move to next interactive element
```
```html
<button aria-expanded="true" aria-controls="section1-panel" id="section1-header">
  Section 1
</button>
<div id="section1-panel" role="region" aria-labelledby="section1-header">
  <!-- content -->
</div>
```

### Combobox / Autocomplete
```
Down Arrow   -> Open listbox / move to first option
Up Arrow     -> Move to last option (when listbox open)
Enter        -> Select focused option
Escape       -> Dismiss listbox; restore input value
```
```html
<label for="country-input">Country</label>
<input type="text" id="country-input" role="combobox"
       aria-autocomplete="list" aria-expanded="false"
       aria-controls="country-listbox" aria-activedescendant="" />
<ul id="country-listbox" role="listbox">
  <li role="option" id="opt-ua">Ukraine</li>
</ul>
```

### Listbox (single/multi-select)
```
Up/Down      -> Move focus between options
Space        -> Select (multi) / activate (single)
Shift+Up/Down -> Extend selection (multi)
Home/End     -> First/last option
Type char    -> Jump to option starting with that character
```

### Tree
```
Right Arrow  -> Expand node; if expanded, move to first child
Left Arrow   -> Collapse node; if collapsed, move to parent
Up/Down      -> Move between visible nodes
Enter        -> Activate node
```

### Slider
```
Right/Up Arrow  -> Increase value by one step
Left/Down Arrow -> Decrease value by one step
Home/End        -> Min/max value
Page Up/Down    -> Larger increment
```
```html
<div role="slider" aria-valuemin="0" aria-valuemax="100"
     aria-valuenow="50" aria-valuetext="50%"
     aria-label="Volume" tabindex="0"></div>
```

---

## Live Regions

```html
<!-- Polite: wait for user to finish current task before announcing -->
<div aria-live="polite" aria-atomic="true">
  3 results found
</div>

<!-- Assertive: interrupt immediately (use sparingly -- errors, critical alerts) -->
<div role="alert" aria-live="assertive">
  Session expired. Please log in again.
</div>

<!-- Status: non-urgent, polite equivalent with implicit role -->
<div role="status">
  Changes saved.
</div>
```

**Rules for live regions:**
- Inject content dynamically **after** the region is already in the DOM
- Keep announcements brief and meaningful
- `role="alert"` implies `aria-live="assertive"` and `aria-atomic="true"`
- Do not use live regions for content that already receives focus

---

## ARIA Anti-Patterns

| Anti-Pattern | Problem | Fix |
|-------------|---------|-----|
| `role="button"` on `<div>` without `tabindex` and keyboard handlers | Not keyboard accessible | Use `<button>` |
| `aria-label` on non-interactive container | Pollutes the accessible tree | Remove or use `<section>` with heading |
| `aria-hidden="true"` on focusable element | Element invisible to AT but still tab-stops | Remove tabindex or move element |
| Nested `aria-live` regions | Unpredictable announcement behavior | One live region per distinct update area |
| `aria-required` without visible indicator | Users don't know field is required | Add visible asterisk + legend |
| `aria-describedby` pointing to hidden element | No description read | Ensure referenced element is visible |
| Using ARIA roles without corresponding keyboard support | Role promises behavior that doesn't exist | Implement full keyboard pattern |

---

## Sources
- WAI-ARIA 1.2 Spec: https://www.w3.org/TR/wai-aria-1.2/
- ARIA Authoring Practices Guide (APG): https://www.w3.org/WAI/ARIA/apg/
- WAI-ARIA Overview: https://www.w3.org/WAI/standards-guidelines/aria/