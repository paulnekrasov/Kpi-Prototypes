# Admin CMS – Analytics Management Flow

## 1. Purpose of the flow
Document how Admin CMS users manage **Analytics**:
- Direct CRUD (create, edit, delete) for privileged roles.
- Suggestion-based changes (create, edit, deletion) for other roles.
- Owner/Admin/Moderator-style review of submitted suggestions (“Check suggestions”).
- Validation failures (wrong captcha/type/null) and cancel/decline paths.

## 2. Actors / roles
- **Owner** – Can access the analytics CRUD actions shown in the diagram and can review suggestions.
- **Admin** – Same as Owner for analytics CRUD/review.
- **Moderator** – Can access analytics CRUD actions shown in the diagram and can review suggestions.
- **Media** – Can submit suggestions (suggest new/edit/delete) and can also see “Check suggestions” (per diagram visibility conditions).
- **Analyst** – Diagram mentions `media/analyst` for suggestion visibility, and `admin/owner/moderator/analyst` for create/edit/delete visibility. The exact analyst permissions for *suggest vs direct* are unclear (see open questions).

## 3. Main path
1. **Open `Analytics` (list/category)**
   - From there, the diagram shows branching into:
     - Direct: `Create a new Analytics`, `Edit a Analytics`, `Delete a Analytics`
     - Suggestion: `Suggest a new Analytics`, `Suggest an edit`, `Suggest a Analytics deletion`
     - Review: `Check suggestions` (visible to certain roles)
2. **Direct CRUD (create/edit/delete)**
   - Navigate from `Analytics` → one of:
     - `Create a new Analytics`
     - `Edit a Analytics`
     - `Delete a Analytics`
   - Fill the inputs shown for Analytics and proceed:
     - `Cancel` returns to the relevant analytics details/list context (diagram shows cancel arrows returning back to the details node).
     - `Confirm` requires **captcha** verification.
   - Outcome:
     - Success → returns to the `Analytics` category (or the details context), with a success message:
       - `"A new Analytics is successfully added"`
       - `"A Analytics is successfully edited"`
       - `"A Analytics is successfully deleted"`
3. **Suggestion-based changes (create/edit/delete)**
   - Navigate from `Analytics` → one of:
     - `Suggest a new Analytics`
     - `Suggest an edit`
     - `Suggest a Analytics deletion`
   - Fill the suggestion inputs:
     - `Cancel` returns to the analytics details/list context.
     - `Suggest` proceeds to captcha verification.
   - Outcome:
     - Success → `"A new Analytics is successfully suggested"` / `"An edit is successfully suggested"` / `"A Analytics deletion is successfully suggested"`
     - The diagram indicates the suggestion is added to a database, and the flow routes back toward the `Analytics` area.
4. **Review suggestions (`Check suggestions`)**
   - Navigate from `Analytics` → `Check suggestions` (for roles that have visibility).
   - From `Check suggestions`:
     - For `suggest === deletion/adding` → go to `Details about Analytics`
     - For `suggest === editing` → go to `Details about Analytics (old info is strikethrough)`
   - Outcome from the details/review view:
     - Approve:
       - `success (approve) & info is added/deleted in database`
       - or `success (approve) & info is edited in database`
     - Decline:
       - `declined (closed a pop-up without an answer)`
       - or `declined (dismissed a suggestion)`
     - After approve/decline, the flow returns to `Check suggestions`.

## 4. Branches and decision points
### Decision: Which analytics sections are visible (role-based)
- **Direct CRUD screens visible** when:
  - `user === admin/owner/moderator/analyst` (diagram visibility connectors point to:
    - `Create a new Analytics`
    - `Edit a Analytics`
    - `Delete a Analytics`)
- **Suggestion screens visible** when:
  - `user === media/analyst` (diagram visibility connectors point to:
    - `Suggest a new Analytics`
    - `Suggest an edit`
    - `Suggest a Analytics deletion`)
- **Check suggestions visible** when:
  - `user === admin/owner/moderator/media` (diagram visibility connector points to `Check suggestions`)

### Decision: Suggestion type in `Check suggestions`
- **Branch A – `suggest === deletion/adding`:**
  - `Check suggestions` → `Details about Analytics` → (approve) updates DB with add/delete → back to `Check suggestions`
- **Branch B – `suggest === editing`:**
  - `Check suggestions` → `Details about Analytics (old info is strikethrough)` → (approve) updates DB with edit → back to `Check suggestions`
- **Decline paths (both branches):**
  - `declined (closed a pop-up without an answer)`
  - `declined (dismissed a suggestion)`
  - Both return to `Check suggestions`

### Decision: Validation outcomes (captcha / type/null)
- From the diagram’s shared “fail” label(s), the branches include:
  - `failed (wrong captcha)`
  - `failed (wrong type/captcha or null)`

## 5. Return loops / backtracking paths
- `Analytics` acts as the hub:
  - After create/edit/delete success messages, the diagram routes back toward the `Analytics` category context.
  - After suggestion submission success messages, the diagram indicates the suggestion is added to the database and routes back toward the analytics area.
- Suggestion review loop:
  - `Check suggestions` → `Details about Analytics` / `Details about Analytics (old info is strikethrough)` → approve/decline → back to `Check suggestions`.
- Cancel loops:
  - `Cancel` and some decline/cancel connectors route back to the previous analytics details/list context (specific targets are shown as cancel arrows from the edit/delete/suggestion details back to the details node).

## 6. Exceptions / edge cases
- **Wrong captcha**
  - Diagram includes `failed (wrong captcha)` as a distinct failure outcome.
- **Wrong type / null**
  - Diagram includes `failed (wrong type/captcha or null)`.
- **Decline vs dismiss**
  - In review details, decline includes:
    - `declined (closed a pop-up without an answer)`
    - `declined (dismissed a suggestion)`
- **Suggestion cooldown**
  - The diagram contains a cooldown component for suggestions:
    - `Cooldown "Wait (minutes) minutes (seconds) seconds"`
    - Remark: `Cooldown for a new suggestion is 1.5 minute`
  - Connectors indicate cooldown-related decline behavior when the user presses a `suggest`-type action (with role `media` mentioned in the condition).

## 7. Repeated or duplicated logic
- **CRUD success/failed/cancel patterns**
  - `Create a new Analytics`, `Edit a Analytics`, `Delete a Analytics` share a repeated structure:
    - Inputs
    - Confirm (captcha)
    - Success messages (`added/edited/deleted`)
    - Failure messages (`wrong captcha` / `wrong type/captcha or null`)
    - Cancel routing back.
- **Suggestion patterns**
  - `Suggest a new Analytics`, `Suggest an edit`, `Suggest a Analytics deletion` follow the same overall pattern:
    - Suggest inputs
    - Captcha verification
    - Success message indicating the suggestion was submitted
    - “Suggestion added to database” routing.
- **Review patterns**
  - `Check suggestions` → details view → approve vs decline returns to the review list.

## 8. Ambiguities / contradictions
- **Analyst permissions vs role labels**
  - The diagram mentions `media/analyst` for suggestion visibility, but the connectors for “Suggest deletion” and “Suggest an edit” explicitly mention `user === media`.
  - At the same time, direct CRUD visibility appears to include `analyst` (`admin/owner/moderator/analyst`).
  - This makes it unclear whether `analyst` can:
    - directly create/edit/delete,
    - and/or must still submit via suggestions,
    - and/or is treated the same as `media` for suggestion submit behavior.
- **Inconsistent/duplicated labeling in input blocks**
  - One inputs text is labeled like `Inputs/dropdowns for document’s:` but describes Analytics inputs (same field set).
  - This is likely a labeling artifact in the FigJam export; the functional intent is not explicitly clarified in the diagram.

## 9. Clean node-to-node flow map
- `Analytics` → `Create a new Analytics` (role-gated)
- `Analytics` → `Edit a Analytics` (role-gated)
- `Analytics` → `Delete a Analytics` (role-gated)
- `Analytics` → `Suggest a new Analytics` (role-gated)
- `Analytics` → `Suggest an edit` (role-gated)
- `Analytics` → `Suggest a Analytics deletion` (role-gated)
- `Analytics` → `Check suggestions` (role-gated)
- `Create a new Analytics` → `"A new Analytics is successfully added"`
- `Edit a Analytics` → `"A Analytics is successfully edited"`
- `Delete a Analytics` → `"A Analytics is successfully deleted"`
- `Suggest a new Analytics` → `"A new Analytics is successfully suggested"`
- `Suggest an edit` → `"An edit is successfully suggested"`
- `Suggest a Analytics deletion` → `"A Analytics deletion is successfully suggested"`
- `Check suggestions` → `Details about Analytics` (if `suggest === deletion/adding`)
- `Check suggestions` → `Details about Analytics (old info is strikethrough)` (if `suggest === editing`)
- `Details about Analytics` (approve) → DB add/delete success → back to `Check suggestions`
- `Details about Analytics (old info is strikethrough)` (approve) → DB edit success → back to `Check suggestions`
- Failure nodes:
  - `failed (wrong captcha)` → back to the relevant form state (diagram shows failure connectors leading into failure outcomes)
  - `failed (wrong type/captcha or null)` → back to the relevant form state

## 10. Open questions for human review
- What is the intended permission set for **`analyst`**?
  - Can `analyst` submit suggestions (like `media/analyst`) or only direct CRUD?
  - When the diagram says `media/analyst` visible, do all connectors actually allow `analyst` to perform the action, or only `media`?
- For the input blocks:
  - Is `Timestamp when it was posted (approved post)` editable for create/edit, or only for viewing?
  - Is `Timestamp when it was created` editable, or derived from server?
- In `Check suggestions`:
  - Does approve require captcha verification (not explicitly shown in the extracted analytics snippet), or is captcha handled only during suggestion submission/direct CRUD confirm?

## 11. Raw interpretation notes
- The analytics flow is represented as a “section” with distinct shapes for:
  - `Analytics` (hub/list/category)
  - Direct CRUD forms
  - Suggestion submission forms
  - `Check suggestions` review loop
- Role-based access is derived from explicit “visibility” connectors like:
  - `if user === admin/owner/moderator/analyst`
  - `if user === media/analyst`
  - `if user === admin/owner/moderator/media`
- Some details (like analytics list filtering/search) are not present in the extracted analytics CRUD snippet; the flow focuses on CRUD/suggest/review states rather than list filtering behaviors.

