 # Admin CMS – Roles & Members Management Flow

 ## 1. Purpose of the flow

 Document how admins and moderators manage **members and their roles** inside the Admin CMS, including:
 - Access to the `Roles` section from the main admin page.
 - Direct member CRUD (create, edit, delete) by privileged roles.
 - Suggestion-based changes (create, edit, delete) by moderators.
 - Review and approval of suggestions.
 - Validation failures (captcha/type/null) and cancel/decline paths.

 ## 2. Actors / roles

 - **Owner** – Full administrative rights; can access `Roles` and perform direct member operations and review suggestions.
 - **Admin** – Same capabilities as Owner in the `Roles` context (direct operations and suggestion review).
 - **Moderator** – Can **suggest** member-related changes (create, edit, delete) but cannot apply them directly.
 - **Media** – Mentioned elsewhere in the board but **does not have access** to the `Roles` section (no connector from `Main page` to `Roles` for `media`).
 - **Other roles (External, Internal, HR, Analytics, Support, etc.)** – Defined near the role conditions, but **not shown as having access** to the `Roles` section in this fragment.

 ## 3. Main path

 1. **Admin/Owner logs in and reaches `Main page`**
    - From `Authorization page` → successful auth → `Main page`.
 2. **Open `Roles` section**
    - From `Main page` → `Roles` (`if user === admin/owner/moderator`).
    - On entry, user sees a **list of users** (members) with fields:
      - Id, Name & Surname, Role (or roles), Gmail (hidden by default, can be shown), Password (hidden by default unless auto-generated), Notes, Timestamp when created (approved creation).
      - List can be filtered by: Role, Name & Surname, Id, subset of roles, and creation timestamp.
      - Available actions: `Show` (gmail/password), `Add`, `Edit`, `Delete`, `Suggestions` (the last visible only to Owner/Admin).
 3. **Create a new member (direct)** – Owner/Admin
    - From `Roles` → `Create a new member` (`if user === owner/admin`).
    - Screen shows inputs:
      - Name & Surname, Role(s), Gmail, auto-generated Password (editable), Notes, `Cancel` and `Confirm` buttons.
      - On `Confirm`, user must complete a **captcha** (easy calculations).
 4. **Edit a member (direct)** – Owner/Admin
    - From `Roles` → `Edit a member` (`if user === owner/admin`).
    - Inputs similar to creation, but:
      - Password visibility depends on whether it was auto-generated; “old” info is placed near inputs.
    - `Cancel` / `Confirm` with captcha verification on confirm.
 5. **Delete a member (direct)** – Owner/Admin
    - From `Roles` → `Delete a member` (`if user === owner/admin`).
    - Presumably a confirmation UI with `Cancel` / `Confirm` and captcha on confirm.
 6. **Suggestion-based flows (moderator)**
    - From `Roles`:
      - `Suggest a new member` (`if user === moderator`).
      - `Suggest an edit` (`if user === moderator`).
      - `Suggest a member deletion` (`if user === moderator`).
    - Corresponding success states:
      - `"A new member is successfully suggested"`.
      - `"An edit is successfully suggested"`.
      - `"A member deletion is successfully suggested"`.
    - All suggestion success nodes loop back to `Roles` and mark that a suggestion has been added to the database.
 7. **Check and review suggestions**
    - From `Roles` → `Check suggestions` (`if user === owner/admin`).
    - From `Check suggestions`:
      - To `Details about member` (if suggestion is create/delete).
      - To `Details about member (old info is strikethrough)` (if suggestion is edit).
    - Each details view allows:
      - Approve (affects DB – add/edit/delete member).
      - Decline (close without decision).
      - Dismiss suggestion.
    - On any outcome, flow returns to `Check suggestions` and then back to `Roles`.
 8. **Return to `Roles` after operations**
    - After successful direct operations (`"A new member is successfully added"`, `"A member is successfully edited"`, `"A member is successfully deleted"`):
      - Connectors lead back to `Roles` with updated data.
    - After suggestion approvals/declines:
      - Connectors from details views → `Check suggestions` → `Roles`.

 ## 4. Branches and decision points

 ### Decision: Access to `Roles` section from `Main page`
 - **Branch A – Allowed:**
   - Condition: `if user === admin/owner/moderator`.
   - Transition: `Main page` → `Roles`.
 - **Branch B – Not allowed:**
   - Other roles (media, external, etc.) **do not have a connector** to `Roles`; they stay in their respective sections.

 ### Decision: Who can perform direct member operations
 - **Branch A – Owner/Admin:**
   - Can go from `Roles` to:
     - `Create a new member`.
     - `Edit a member`.
     - `Delete a member`.
     - `Check suggestions`.
 - **Branch B – Moderator:**
   - Cannot access direct CRUD screens.
   - Can go from `Roles` to:
     - `Suggest a new member`.
     - `Suggest an edit`.
     - `Suggest a member deletion`.

 ### Decision: Outcome of member creation/edit/deletion (direct)
 For `Create a new member`, `Edit a member`, `Delete a member`:
 - **Branch A – Confirm + valid captcha / valid data:**
   - `Create a new member` → `"A new member is successfully added"` → back to `Roles` (DB updated).
   - `Edit a member` → `"A member is successfully edited"` → back to `Roles`.
   - `Delete a member` → `"A member is successfully deleted"` → back to `Roles`.
 - **Branch B – Cancel:**
   - `Cancel` leads back from each form to `Roles` without changing DB.
 - **Branch C – Validation fail (wrong captcha/type/null):**
   - Connectors from a shared `6:83` node (validation result) lead back from failure to each operation screen:
     - `failed (wrong captcha)` or `failed (wrong type/captcha or null)` returning to the same form.

 ### Decision: Suggestion vs direct change (moderator/owner/admin)
 - **Branch A – Moderator suggestions:**
   - `Suggest a new member` / `Suggest an edit` / `Suggest a member deletion` → corresponding `"successfully suggested"` nodes → back to `Roles`, with suggestion stored.
 - **Branch B – Owner/Admin direct change:**
   - Uses direct create/edit/delete screens, not suggestion nodes.

 ### Decision: Handling a suggestion in `Check suggestions`
 - **Branches from `Check suggestions` to details:**
   - If `suggest === deletion/adding` → `Details about member`.
   - If `suggest === editing` → `Details about member (old info is strikethrough)`.
 - **Branches from details views:**
   - **Approve:** updates DB (add/edit/delete) and returns to `Check suggestions` then `Roles`.
   - **Decline (closed pop-up without answer):** returns to `Check suggestions`.
   - **Decline (dismissed suggestion):** returns to `Check suggestions`.

 ## 5. Return loops / backtracking paths

 - **Roles page as hub:**
   - `Roles` ↔ all member management actions; almost every path eventually loops back to `Roles`.
 - **Decline/cancel loops from forms back to `Roles`:**
   - `Create a new member` → `decline` → `Roles`.
   - `Edit a member` → `decline` → `Roles`.
   - `Delete a member` → `decline` → `Roles`.
   - `Suggest a new member` / `Suggest an edit` / `Suggest a member deletion` → `decline` → `Roles`.
 - **Suggestion review loops:**
   - `Check suggestions` → `Details about member` / `Details about member (old info is strikethrough)` → **approve/decline/dismiss** → back to `Check suggestions` → `Roles`.
 - **Success-state loops:**
   - All `"successfully added/edited/deleted"` and `"successfully suggested"` nodes route back to `Roles`, carrying DB changes or stored suggestions.

 ## 6. Exceptions / edge cases

 - **Captcha failures:**
   - For both direct CRUD and suggestion flows, `failed (wrong captcha)` paths exist and return the user to the same form rather than discarding the action.
 - **Wrong type/null inputs:**
   - `failed (wrong type/captcha or null)` paths also return to the originating form, indicating server-side or validation rejection.
 - **Closing pop-ups without explicit decision:**
   - In suggestion details views, closing a pop-up without pressing `Approve` or `Decline` is treated as a distinct path (`closed a pop-up without an answer`) but still loops back to `Check suggestions`.
 - **Dismissed suggestions:**
   - Explicit dismissal is modeled separately from generic decline, but functionally loops back into `Check suggestions`.

 ## 7. Repeated or duplicated logic

 - **Create/Edit/Delete patterns:**
   - Member CRUD and document CRUD share nearly identical structural patterns (fields, captcha, success nodes, back loops), but this section only covers the **member**-focused `Roles` flow.
 - **Suggestion handling pattern:**
   - `Suggest new`, `Suggest edit`, `Suggest deletion` for members all:
     - Go to a corresponding `"successfully suggested"` node.
     - Then route back to `Roles` with a note that the suggestion is added to the database.
 - **Approval flows:**
   - Approving a suggestion for **create**, **edit**, or **delete** always:
     - Moves from a `Details` node → DB update → back to `Check suggestions` → `Roles`.
   - This logic is repeated explicitly for each operation rather than abstracted.

 ## 8. Clean node-to-node flow map

 - `Authorization page` → `Main page` (successful auth).
 - `Main page` → `Roles` (if user is admin/owner/moderator).
 - `Roles` → `Create a new member` (if user is owner/admin).
 - `Roles` → `Edit a member` (if user is owner/admin).
 - `Roles` → `Delete a member` (if user is owner/admin).
 - `Roles` → `Suggest a new member` (if user is moderator).
 - `Roles` → `Suggest an edit` (if user is moderator).
 - `Roles` → `Suggest a member deletion` (if user is moderator).
 - `Roles` → `Check suggestions` (if user is owner/admin).
 - `Create a new member` → `"A new member is successfully added"` (on confirm + valid captcha).
 - `Edit a member` → `"A member is successfully edited"` (on confirm + valid captcha).
 - `Delete a member` → `"A member is successfully deleted"` (on confirm + valid captcha).
 - `Suggest a new member` → `"A new member is successfully suggested"`.
 - `Suggest an edit` → `"An edit is successfully suggested"`.
 - `Suggest a member deletion` → `"A member deletion is successfully suggested"`.
 - All `"successfully added/edited/deleted"` nodes → `Roles`.
 - All `"successfully suggested"` nodes → `Roles` (suggestion stored in DB).
 - `Check suggestions` → `Details about member` (if suggestion is creation/deletion).
 - `Check suggestions` → `Details about member (old info is strikethrough)` (if suggestion is edit).
 - `Details about member` / `Details about member (old info is strikethrough)` → `Check suggestions` (after approve/decline/dismiss).
 - `Check suggestions` → `Roles` (back).
 - Failure nodes (`failed (wrong captcha)` / `failed (wrong type/captcha or null)`) → originating forms (`Create/Edit/Delete/Suggest` screens).
 - Any `decline`/`cancel` from forms or details → the preceding list/suggestions hub (`Roles` or `Check suggestions`), then back to `Roles`.

 ## 9. Open questions for human review

 - Should **Moderators** be able to see the `Suggestions` list, or only Owners/Admins?
 - Are **External/Internal/HR/Analytics/Support** roles deliberately prevented from accessing the `Roles` section, or is this just missing from the current board?
 - After a **captcha failure**, should the system preserve all previously entered form data, or is some reset expected?
 - Is there any **rate limiting / cooldown** for member-related suggestions (similar cooldowns exist for other sections like events and analytics)?
 - How are **multiple roles per member** handled in the UI (single select vs multi-select) and in filtering?

 ## 11. Raw interpretation notes

 - The `Roles` area is drawn as one of several vertical sections branching from the `Main page` (alongside Documentation, Departments, Student Associations, Partners, Recruitment, Support, etc.).
 - Connectors related to validation (`6:83`) are shared with other parts of the Admin CMS, which makes the diagram visually dense; however, the labeling around member flows is still readable.
 - The suggestion system for members mirrors the patterns used in other modules (documents, events, departments), which suggests a **shared architectural pattern** rather than independent design.
 - Some role boxes (`If role is “Media”`, `If role is “External”`, etc.) sit near but are not directly wired into the `Roles` box in the visible excerpt; their exact effect on this flow is therefore uncertain and has been treated cautiously.