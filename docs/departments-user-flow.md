# Admin CMS – Departments Management Flow

## 1. Purpose of the flow
Document how users manage **departments** in the Admin CMS, including:
- Opening the `Departments` category from the main admin navigation (role-gated).
- Viewing a list of departments and taking actions from that list.
- Direct department CRUD (add/edit/delete) by privileged roles.
- Moderator suggestion flows for adding/editing/deleting departments.
- Owner/Admin review of submitted suggestions (approve/decline/dismiss) with branching based on suggestion type.
- Inside department details: managing `department's info (section)` including create/edit/delete and shuffle mode.

## 2. Actors / roles
- **Owner** – Can access `Departments` and perform direct department CRUD and suggestion review.
- **Admin** – Same as Owner for this `Departments` flow (direct CRUD + suggestion review).
- **Moderator** – Can submit suggestions for adding/editing/deleting departments (and appears to have access to at least one `Check suggestions` entry point).
- **Media** – Appears in role-visibility conditions for the `Departments` category and for viewing department details; specific CRUD vs suggestion permissions are not fully consistent across nodes.
- **Other roles** – Not explicitly enumerated in the extracted nodes for `Departments` beyond the role conditions captured.

## 3. Main path
1. Open the `Departments` category (role-gated)
   - From the main admin page, transition to `Departments` hub (node `79:1302`).
   - Visibility condition shown on the board: `if user === admin/owner/moderator/media, this category is visible`.
2. View the list of departments
   - `Departments` hub leads to the `List of the departments` screen (node `83:3850`).
   - The list includes fields:
     - `Id`, `Title`, `Short info about the department`, `Photo related to the department`, `Head of the department (Tag TG)`, `Notes`, `Timestamp of the last post (approved post) related to this department`.
   - Available list actions (as stated on the board):
     - Can click `Add`, `Edit`, `Delete`, `Details`, `Suggestions`.
     - `Suggestions` is only visible to `roles owner, admin, moderator`.
3. Direct CRUD for departments (owner/admin)
   - `Departments` hub -> `Create a new department` (node `83:3535`) with condition `if user === owner/admin`.
   - Direct action outcome paths:
     - Confirm success routes to `A department is successfully added` (node `83:3538`) with connector `success (approve) & info is added in database` returning to `Departments` hub (`79:1302`).
     - Failure routes:
       - `failed (wrong captcha)` / `failed (wrong type/captcha or null)` routes back to the relevant operation node (validated via shared validation node `6:83`).
     - Decline routes:
       - There are connectors labeled `decline` leading back to `Departments` hub (`79:1302`).
   - `Departments` hub -> `Edit a department` (node `83:3536`) with condition `if user === owner/admin`.
   - Direct edit outcome paths:
     - Success: `A department is successfully edited` (node `83:3539`) -> `success (approve) & info is added in database` -> back to `79:1302`.
     - Failure: `failed (wrong captcha)` / `failed (wrong type/captcha or null)` from shared validation node `6:83` to the edit node.
     - Decline: `decline` connector back to `79:1302`.
   - `Departments` hub -> `Delete a department` (node `83:3537`) with condition `if user === owner/admin`.
   - Direct delete outcome paths:
     - Success: `A department is successfully deleted` (node `83:3540`) -> `success (approve) & info is added in database` -> back to `79:1302`.
     - Failure: `failed (wrong captcha)` / `failed (wrong type/captcha or null)` from shared validation node `6:83` to the delete node.
     - Decline: `decline` connector back to `79:1302`.
4. Moderator suggestions for departments
   - `Departments` hub -> `Suggest a new department` (node `83:3057`) with condition `if user === moderator`.
   - Moderator suggestion submit outcomes:
     - Success:
       - `A new department is successfully suggested` (node `83:3061`)
       - followed by `success (suggested) & suggest is added to a database` returning to `Departments` hub (`79:1302`).
     - Failure:
       - `failed (wrong type/captcha or null)` or `failed (wrong captcha)` connectors from shared validation node `6:83` to the relevant suggestion node.
     - Decline:
       - `decline` connectors returning to `79:1302`.
   - `Departments` hub -> `Suggest an edit (department)` (node `83:3060`) with condition `if user === moderator`.
   - Outcome routing for edit suggestions:
     - Success: `An edit is successfully suggested` (node `83:3063`) -> `success (suggested) & suggest is added to a database` -> back to `79:1302`.
     - Failure: `failed (wrong captcha)` / `failed (wrong type/captcha or null)` from shared validation node `6:83` to the relevant suggestion node.
     - Decline: `decline` connectors returning to `79:1302`.
   - `Departments` hub -> `Suggest a department's deletion` (node `83:3058`) with condition `if user === moderator`.
   - Outcome routing for deletion suggestions:
     - Success: `A deletion is successfully suggested` (node `83:3064`) -> `success (suggested) & suggest is added to a database` -> back to `79:1302`.
     - Failure: connectors labeled `failed (wrong captcha)` to the deletion suggestion node.
     - Decline: `decline` connectors returning to `79:1302`.
5. Review suggestions (owner/admin) via `Check suggestions`
   - `Departments` hub -> `Check suggestions` (node `129:1492`) with condition `if user === owner/admin`.
   - In `Check suggestions`, the board branches by `suggest`:
     - If `suggest === deletion/adding a department` -> `Details about department` (node `129:1493`).
     - If `suggest === editing a department` -> `Details about department, old info is strikethrough` (node `129:1495`).
   - From the details nodes, outcomes:
     - Approve leads to success connectors:
       - `success (approve) & info is added/deleted in database` (returns to `Check suggestions`).
       - `success (approve) & info is edited in database` (returns to `Check suggestions`).
     - Decline/dismiss leads to connectors labeled:
       - `declined (closed a pop-up without an answer)`
       - `declined (dismissed a suggestion)`
       - all returning to `Check suggestions`.
   - Leaving `Check suggestions` back to the `Departments` hub:
     - `decline (back)` connector returns to `79:1302`.
6. Department details and `department's info (section)` management
   - `Departments` hub -> `Details about certain department` (node `83:3116`) with condition `if user === owner/admin/moderator/media`.
   - `Details about the certain department` (node `83:3124`) includes:
     - A list of sections related to the department (could be events, partners, etc.).
     - Buttons: `Create post`, `Edit post`, `Delete post`, `View more about the section`.
     - Buttons: `Shuffle`, `Edit department`, `Delete department` (visible only for `owner/admin/moderator` per the text).
   - Department's info (section) operations and their outcomes:
     - `department's info (section)` direct CRUD available from the details view with conditions and explicit nodes:
       - `Create a new department’s info` (node `92:1837`)
       - `Edit a department’s info` (node `92:1838`)
       - `Delete a department’s info` (node `92:1839`)
     - Confirmation/validation:
       - Failures are routed from shared validation node `6:83` as `failed (wrong captcha)` / `failed (wrong type/captcha or null)` to the corresponding operation nodes.
     - Cancel:
       - `cancel` connectors return back to the `Details about certain department` node (`83:3116`).
     - Success/approval:
       - Success nodes `A department’s info is successfully added/edited/deleted` lead to approval connectors that return to `83:3116`.
   - Shuffle mode:
     - `Button to change mode (to shuffle department’s info)` (node `129:1390`) is gated by `if user === owner/admin/moderator`.
     - `cancel (exit from the mode...)` returns to `83:3116`.
     - `success (if "submit" pressed)` -> `A department’s info is successfully shuffled` -> approval connector `success (approve) & info is changed in database` -> back to `83:3116`.

## 4. Branches and decision points
### Decision: Role-based visibility of the `Departments` category
- **Branch A – Allowed (category visible):**
  - Condition: `if user === admin/owner/moderator/media, this category is visible`.
- **Branch B – Not allowed:**
  - No connector shown for other roles; treated as not visible based on the captured rule.

### Decision: Which actions are available from the departments list
- **Branch A – Owner/Admin:**
  - Conditioned connectors from `Departments` hub to:
    - `Create a new department` (node `83:3535`)
    - `Edit a department` (node `83:3536`)
    - `Delete a department` (node `83:3537`)
  - `Check suggestions` path uses `if user === owner/admin` (node `129:1492`).
- **Branch B – Moderator:**
  - Conditioned connectors from `Departments` hub to:
    - `Suggest a new department` (node `83:3057`)
    - `Suggest an edit (department)` (node `83:3060`)
    - `Suggest a department’s deletion` (node `83:3058`)
  - `Suggestions` button is only visible to `owner/admin/moderator` per the list text.
  - There is also a `Check suggestions` connection conditioned by `if user === moderator` (node `83:3059`), which may represent a separate check-suggestions entry point.
- **Branch C – Media:**
  - `Details about certain department` is reachable with `if user === owner/admin/moderator/media`.
  - Additional role-conditions exist for department's info actions, but permission consistency is unclear (see ambiguities).

### Decision: Direct department CRUD outcome (owner/admin)
- **Branch A – Success + approve:**
  - Create:
    - `Create a new department` -> `A department is successfully added` -> `success (approve) & info is added in database` -> back to `79:1302`.
  - Edit:
    - `Edit a department` -> `A department is successfully edited` -> `success (approve) & info is added in database` -> back to `79:1302`.
  - Delete:
    - `Delete a department` -> `A department is successfully deleted` -> `success (approve) & info is added in database` -> back to `79:1302`.
- **Branch B – Cancel/decline:**
  - Explicit `decline` connectors return the user to `79:1302`.
- **Branch C – Validation failure:**
  - `failed (wrong captcha)` / `failed (wrong type/captcha or null)` connectors from shared validation node `6:83` route back to the relevant operation node.

### Decision: Moderator suggestion outcome
- **Branch A – Success (suggested added):**
  - Each suggestion type routes to a success box and then to:
    - `success (suggested) & suggest is added to a database` -> back to `79:1302`.
- **Branch B – Decline:**
  - `decline` connectors return to `79:1302`.
- **Branch C – Validation failure:**
  - `failed (wrong captcha)` / `failed (wrong type/captcha or null)` connectors from shared validation node `6:83` route back to the relevant suggestion node.

### Decision: Routing inside `Check suggestions` (department-level suggestions)
- If `suggest === deletion/adding a department` -> `Details about department` (node `129:1493`)
- If `suggest === editing a department` -> `Details about department, old info is strikethrough` (node `129:1495`)
- From details:
  - Approve: `success (approve)` connectors return to `Check suggestions` (`129:1492`)
  - Decline/dismiss: `declined (closed a pop-up without an answer)` and `declined (dismissed a suggestion)` return to `Check suggestions` (`129:1492`)
- Exit:
  - `decline (back)` returns to `79:1302`.

### Decision: Routing inside `Check suggestions` (department’s info (section) suggestions)
- If `suggest === editing a department’s info (section)` -> details node `130:1635` (named `Details about department, old info is strikethrough`)
- If `suggest === deletion/adding a department’s info (section)` -> details node `130:1634` (named `Details about department`)
- Approve:
  - `success (approve) & info is added/deleted in database` or `success (approve) & info is edited in database` -> back to `Check suggestions` (`129:1492`)
- Decline/dismiss:
  - `declined (closed a pop-up without an answer)` and `declined (dismissed a suggestion)` -> back to `Check suggestions`.

### Decision: Shuffle mode for department’s info (section)
- If user is `owner/admin/moderator`, show the shuffle-mode button (`129:1390`)
- Branches:
  - `cancel (exit from the mode...)` -> back to details (`83:3116`)
  - `success (if "submit" pressed)` -> shuffle success -> approval -> back to details (`83:3116`)

## 5. Return loops / backtracking paths
- **Departments hub loop:**
  - After direct CRUD success (create/edit/delete), the user returns to `Departments` hub (`79:1302`) via `success (approve) & info is added in database`.
  - After moderator suggestion success, the user returns to `79:1302` via `success (suggested) & suggest is added to a database`.
  - After `decline`, the user returns to `79:1302`.
- **Check suggestions loop:**
  - `Check suggestions` (node `129:1492`) -> details view (depending on `suggest` type) -> approve/decline/dismiss -> back to `Check suggestions` (`129:1492`).
  - `decline (back)` exits `Check suggestions` to `79:1302`.
- **Department details loop:**
  - From `Details about certain department` (`83:3116`) -> department’s info CRUD operations -> cancel or approve -> back to `83:3116`.
  - Shuffle mode cancel/approve returns to `83:3116`.

## 6. Exceptions / edge cases
- **Captcha failures:**
  - Failures are explicitly modeled via connectors labeled:
    - `failed (wrong captcha)`
    - `failed (wrong type/captcha or null)`
  - The failure routing uses shared validation node `6:83` and returns to the relevant operation/suggestion node.
- **Closed pop-up without explicit decision:**
  - In suggestion review, connectors include:
    - `declined (closed a pop-up without an answer)` leading back to `Check suggestions`.
- **Dismissed suggestion:**
  - Connectors include:
    - `declined (dismissed a suggestion)` leading back to `Check suggestions`.
- **Decline / cancel:**
  - Explicit `decline`, `cancel`, and `decline (back)` connectors return the user to the appropriate hub/details node instead of applying changes.

## 7. Repeated or duplicated logic
- **CRUD and suggestion patterns repeat:**
  - Direct CRUD uses a repeated structure:
    - action node -> success node -> approve connector back to hub
    - failures from shared validation -> back to the action node
    - decline -> back to hub
  - Moderator suggestions repeat:
    - suggest node -> success (suggested) -> suggest-added connector back to hub
    - failures from shared validation -> back to suggest node
    - decline -> back to hub
- **Suggestion review pattern repeats:**
  - `Check suggestions` routes to a details view based on `suggest` type.
  - Both approve and decline/dismiss route back to `Check suggestions`.
- **Department’s info section CRUD repeats:**
  - Create/edit/delete info nodes mirror the department-level CRUD structure (captcha failures, cancel returning to details, success nodes, approval success back to details).

## 8. Ambiguities / contradictions
- **Media permissions appear broader than expected:**
  - `Departments` category visibility includes `media` (`if user === admin/owner/moderator/media, this category is visible`).
  - `Details about certain department` is reachable for `owner/admin/moderator/media`.
  - Some connectors for `department’s info` actions also mention `if user === media`, which makes permission boundaries unclear. This may conflict with expectations from other flows.
- **Deletion suggestion success label is generic:**
  - The deletion suggestion success node is labeled `A deletion is successfully suggested` (does not explicitly say `department`).
  - The flow still routes from `Suggest a department’s deletion` to this success node, but the label itself is not explicit; treat mapping as board-connection inferred.
- **Details view naming reused across suggestion types:**
  - `Check suggestions` branches into nodes named `Details about department` even when `suggest` refers to `department’s info (section)`.
  - It is unclear from naming alone whether the same UI is reused or whether the section context is implied elsewhere.
- **Multiple `Check suggestions` entry points:**
  - There are `Check suggestions` nodes connected with `if user === owner/admin` and also nodes connected with `if user === moderator`.
  - The extracted snippet shows both; it is ambiguous whether they differ by suggestion type (department vs department’s info section) or represent different UI states.

## 9. Clean node-to-node flow map
- `Main page` -> `Departments` hub (`79:1302`)
- `Departments` hub (`79:1302`) -> `List of the departments` (`83:3850`)
- `List of the departments` -> `Create a new department` (`83:3535`) if `user === owner/admin`
- `Create a new department` (`83:3535`) -> `A department is successfully added` (`83:3538`) -> `success (approve) & info is added in database` -> `Departments` hub (`79:1302`)
- `List of the departments` -> `Edit a department` (`83:3536`) if `user === owner/admin`
- `Edit a department` (`83:3536`) -> `A department is successfully edited` (`83:3539`) -> `success (approve) & info is added in database` -> `Departments` hub (`79:1302`)
- `List of the departments` -> `Delete a department` (`83:3537`) if `user === owner/admin`
- `Delete a department` (`83:3537`) -> `A department is successfully deleted` (`83:3540`) -> `success (approve) & info is added in database` -> `Departments` hub (`79:1302`)
- `Departments` hub (`79:1302`) -> `Suggest a new department` (`83:3057`) if `user === moderator`
- `Suggest a new department` (`83:3057`) -> `A new department is successfully suggested` (`83:3061`) -> `success (suggested) & suggest is added to a database` -> `Departments` hub (`79:1302`)
- `Departments` hub (`79:1302`) -> `Suggest an edit (department)` (`83:3060`) if `user === moderator`
- `Suggest an edit (department)` (`83:3060`) -> `An edit is successfully suggested` (`83:3063`) -> `success (suggested) & suggest is added to a database` -> `Departments` hub (`79:1302`)
- `Departments` hub (`79:1302`) -> `Suggest a department’s deletion` (`83:3058`) if `user === moderator`
- `Suggest a department’s deletion` (`83:3058`) -> `A deletion is successfully suggested` (`83:3064`) -> `success (suggested) & suggest is added to a database` -> `Departments` hub (`79:1302`)
- `Departments` hub (`79:1302`) -> `Check suggestions` (`129:1492`) if `user === owner/admin`
- `Check suggestions` (`129:1492`) -> `Details about department` (`129:1493`) if `suggest === deletion/adding a department`
- `Check suggestions` (`129:1492`) -> `Details about department, old info is strikethrough` (`129:1495`) if `suggest === editing a department`
- Approve/decline/dismiss in those details -> `Check suggestions` (`129:1492`) (with `success (approve)` / `declined (...)` connectors)
- `Check suggestions` (`129:1492`) -> `decline (back)` -> `Departments` hub (`79:1302`)
- `Departments` hub (`79:1302`) -> `Details about certain department` (`83:3116`) if `user === owner/admin/moderator/media`
- From `Details about certain department` (`83:3116`):
  - `Create a new department’s info` (`92:1837`) / `Edit a department’s info` (`92:1838`) / `Delete a department’s info` (`92:1839`) -> success + approval -> return to `83:3116`
  - `Button to change mode (to shuffle department’s info)` (`129:1390`) -> `A department’s info is successfully shuffled` (`129:1419`) -> approval -> return to `83:3116`

## 10. Open questions for human review
- Confirm exact **media** permissions inside `Departments`:
  - The board shows media can see the category and reach details, but also references media in other department’s info connectors.
- When a user hits **captcha failure** or **wrong type/captcha or null**, does the form preserve entered values or does it reset?
- There are multiple `Check suggestions` nodes (some gated by `owner/admin` and some by `moderator`); which one is the canonical review UI for department suggestions vs department’s info suggestions?
- For deletion suggestions, the success label is generic (`A deletion is successfully suggested`); confirm that this label is always understood as a *department deletion* suggestion in the UI.
- For `department’s info (section)` suggestions, the details nodes are named similarly to department-level details; confirm whether the same UI component is reused and whether the “section” context is explicit to the user.

## 11. Raw interpretation notes
- Extracted directly from the FigJam dump around node `6:83`, which includes a shared validation hub (`6:83`) feeding multiple module failures labeled:
  - `failed (wrong captcha)` and `failed (wrong type/captcha or null)`.
- Key departments nodes identified in the dump:
  - `Departments` hub (`79:1302`)
  - `List of the departments` (`83:3850`)
  - Direct CRUD nodes: `Create a new department` (`83:3535`), `Edit a department` (`83:3536`), `Delete a department` (`83:3537`)
  - Moderator suggestion nodes: `Suggest a new department` (`83:3057`), `Suggest an edit (department)` (`83:3060`), `Suggest a department’s deletion` (`83:3058`)
  - Suggestion review routing nodes:
    - `Check suggestions` (`129:1492`)
    - `Details about department` (`129:1493` / `129:1495`)
  - Department details:
    - `Details about certain department` (`83:3116`)
  - Department’s info section:
    - `department’s info` CRUD nodes (`92:1837`/`92:1838`/`92:1839`) and shuffle mode (`129:1390`/`129:1419`).
- Normalized curly quotes from the dump to straight quotes where necessary to keep the Markdown clean.
