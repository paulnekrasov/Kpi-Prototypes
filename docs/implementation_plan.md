# Roles Dashboard Refactoring Plan

This plan details the steps to completely rebuild the roles dashboard using **coss UI components** while integrating the existing [styles/tokens.css](file:///c:/Users/Asus/OneDrive/Desktop/prototypes/styles/tokens.css) colors and applying **design engineering** principles to make the UI feel alive and responsive.
## Key Concepts from the Conversation

This is a dev team chat (in Ukrainian) discussing an **authentication flow design issue**. Here are the core insights:

---

### 🔐 The Problem: Password Visibility Bug / Design Question

Dmytro flagged that **passwords are being displayed in the UI**, arguing this feature shouldn't exist at all — a valid security concern.

---

### 🏗️ Current Architecture (as explained by Kheng)

The system has a **two-tier password model**:

| State | Behavior |
|---|---|
| Auto-generated password (user hasn't changed it) | Password **is visible** in the UI |
| User-set password | Password is **never shown** |

**The intended flow:**
1. Admin creates a user → specifies email + role
2. System auto-generates a password
3. On **first login**, a popup prompts the user to change the password ("Hey, want to set your own password?")

---

### ⚡ The Design Debate

**Dmytro's proposed improvement:** Instead of setting a real temporary password that the user then replaces, use a `requireChangePassword` **flag** that triggers on first login — skipping the need to expose any password at all.

**Kheng's counter:** The initial password is necessary so the user can actually authenticate (email + password login) before being prompted to change it.

**Resolution:** Both agree the `requireChangePassword` flag can still be added on top — to **force** the password change and remove the option to skip the prompt, making the first-login password-change mandatory rather than optional.

---

### 💡 Core Insight

The team is converging on a standard **"temporary credential → forced rotation"** pattern:
- Temporary auto-generated password enables first login
- A mandatory flag (`requireChangePassword`) removes the ability to bypass the password update
- Once changed, the password is never exposed again

This eliminates the security smell of displaying auto-generated passwords in the UI, while keeping the flow functional.

## Proposed Changes

### User Review Required

> [!IMPORTANT]
> - **Sidebar Integration:** The [RolesPage](file:///c:/Users/Asus/OneDrive/Desktop/prototypes/admin-panel/owner-admin-moderator/roles-page.tsx#50-178) will be wrapped in the standard `<Sidebar>` layout natively within the page (since there is no shared layout file here).
> - **Role-Based Flow (RBAC):** We will implement the flow from [docs/roles-user-flow-normalized.md](file:///c:/Users/Asus/OneDrive/Desktop/prototypes/docs/roles-user-flow-normalized.md):
>   - **Owner/Admin**: Have direct access to "Add Member", "Edit", "Delete", and "Check Suggestions".
>   - **Moderator**: Limited to "Suggest Member", "Suggest Edit", and "Suggest Deletion". No direct DB mutations.
>   - To test this UI locally, we will introduce a mock `currentUserRole` state at the top of the page that allows swapping between Owner, Admin, and Moderator views.

### 1. Install coss UI Components

We will fetch the required components from the coss UI library using their CLI as specified in the coss references.
- Run `pnpm dlx shadcn@latest add @coss/table @coss/badge @coss/pagination` via the CLI.
- Note: We will **not** install the input component from coss; we will use the existing `<InputGroup>` from `@components/ui/InputGroup.tsx`.

### 2. Component Adaptation (Tokens & Design Engineering)

We will modify the downloaded components to use the strict CSS variables from [styles/tokens.css](file:///c:/Users/Asus/OneDrive/Desktop/prototypes/styles/tokens.css) and implement the animation rules from the design-engineering skill.

- **Colors & depth:** Use only `tokens.css` CSS variables for colors/backgrounds/borders and prefer tokenized shadows over solid borders for depth.
- **Motion rules:** Honor `prefers-reduced-motion`; animate only compositor-friendly props (`transform`, `opacity`); use interruptible CSS transitions (no layout-property animations, no `linear` easing for interactive UI).

#### [MODIFY] [components/ui/badge.tsx](file:///c:/Users/Asus/OneDrive/Desktop/prototypes/components/ui/badge.tsx) (coss)
- Ensure background, text, and border colors are mapped to CSS variables (e.g., `var(--color-brand)`, `var(--text-on-accent)`) instead of raw tailwind colors to preserve the design system tokens.
- Add micro-animations (e.g. `active:scale-[0.97]` with `ease-out`) for interactive moments where applicable (hover snap instantly; exit eases off; transform-only).
- Ensure variants align with `destructive`, `brand`, `warning`, `info` as in [tokens.css](file:///c:/Users/Asus/OneDrive/Desktop/prototypes/styles/tokens.css).

#### [MODIFY] Use existing [components/ui/InputGroup.tsx](file:///c:/Users/Asus/OneDrive/Desktop/prototypes/components/ui/InputGroup.tsx)
- Refactor the search field in the dashboard to use the existing `InputGroup` component.
- The `InputGroup` already supports proper a11y, hints, and [tokens.css](file:///c:/Users/Asus/OneDrive/Desktop/prototypes/styles/tokens.css) styles natively. No coss input needed.

#### [MODIFY] `components/ui/table.tsx` (coss)
- Map table surface colors to `var(--bg-subtle)` and borders to `var(--border-subtle-plus)`.
- Prefer shadows over solid borders for any "depth" effect (use `var(--shadow-*)`).
- Use correct semantic imports: `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`.
- Empty state: Always render an explicit empty-state row with `colSpan` matching visible columns as per coss guidelines.

#### [MODIFY] [components/ui/pagination.tsx](file:///c:/Users/Asus/OneDrive/Desktop/prototypes/components/ui/pagination.tsx) (coss)
- Adapt the pagination item components (`PaginationLink`, `PaginationPrevious`) to match token styles.
- Add interaction physics: `active:scale-[0.97]` for snappier feedback (transform-only, interruptible transitions) and ensure motion is softened under `prefers-reduced-motion`.

### 3. Dashboard Integration

#### [MODIFY] [admin-panel/owner-admin-moderator/roles-page.tsx](file:///c:/Users/Asus/OneDrive/Desktop/prototypes/admin-panel/owner-admin-moderator/roles-page.tsx)
- **Sidebar & Layout:** Wrap the entire page in a flex container `div` and prepend the `<Sidebar>` component (using mock navigation links like Main Page, Roles, etc.).
- **Header & Tabs:**
  - Header with large "Roles" title and member count subheading.
  - Implement a `Tabs` (or grouped buttons) for "Members" (active) and "Suggestions" (with a badge count).
- **Action Bar:**
  - **Search:** Integrate existing `<InputGroup>` for search ("Search by name, ID, or email...").
  - **Filter:** Add a "Filter" button with an icon.
  - **Add Member:** Add a primary "Add member" button.
- **Roles Table UI Details:**
  - **Columns:** ID, Name & Surname, Roles, Gmail, Password, Notes, Created, Actions.
  - **Roles Badges:** Use specific colors for roles (e.g., Owner=warning/amber, Admin=info/blue, Moderator=purple) mapped securely to [tokens.css](file:///c:/Users/Asus/OneDrive/Desktop/prototypes/styles/tokens.css).
  - **Sensitive Fields:** Gmail and Password should be initially masked (e.g. `••••••••`).
    - An inline "eye" icon button allows toggling visibility.
    - **Password Logic:** Use a temporary-credential + forced-rotation model: auto-generated (temporary) passwords may be shown only during the first-login rotation window when `requireChangePassword` applies, while user-set passwords are never revealed (the eye icon must be hidden). After the user rotates the password, the app must stop exposing it entirely, and the `requireChangePassword` flag should make the password change mandatory (no “skip” path).
  - **Actions:** Icon-only buttons for Edit (pencil) and Delete (trash) per row.
- **RBAC UI Logic:** Read the `currentUserRole` (mocked state).
  - Hide "Add Member" and show "Suggest Member" if `Moderator`.
  - Disable or hide row-level "Edit"/"Delete" and replace with "Suggest Edit"/"Suggest Deletion" for `Moderator`.
  - Only render the "Suggestions" tab if `Owner` or `Admin`.
- **Component Replacements:** Replace the current internal `<Table>`, `<Badge>`, and `<Pagination>` imports with their new coss UI equivalents.
- **Micro-interactions:** Enhance the list transitions so they feel "alive" using the design engineering skill (snap instantly on hover, 150ms ease-out on leave, `active:scale-[0.97]`), while honoring `prefers-reduced-motion` and animating only `transform`/`opacity`.

## Verification Plan

### Automated Tests
- Run TS type checking to ensure props and imports are correct (`npx tsc --noEmit`).
- Verify no linting errors are introduced.

### Manual Verification
- Render the local server and visit the Roles page.
- Test micro-interactions:
  - Hover over buttons/rows: should feel instant.
  - Leave hover: should ease out (150ms).
  - Click/active states: should squish/scale to 0.97.
  - With `prefers-reduced-motion` enabled: hover/press motion is disabled or softened (opacity-only), no layout-property animation.
  - Focus inputs: verify focus ring aligns with [(--focus-ring)](file:///c:/Users/Asus/OneDrive/Desktop/prototypes/admin-panel/owner-admin-moderator/roles-data.ts#16-27).
- Ensure dark mode / light mode colors map purely to the [tokens.css](file:///c:/Users/Asus/OneDrive/Desktop/prototypes/styles/tokens.css) CSS variables instead of ad-hoc tailwind colors.
