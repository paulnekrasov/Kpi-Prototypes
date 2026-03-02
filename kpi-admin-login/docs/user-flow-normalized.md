# Admin CMS and auth user flow

## 1. Purpose of the flow
The flow outlines a Content Management System (CMS) for managing different operational entities: Departments, Sections, Documents, and Posts. It details how users view entity details, propose edits or deletions, and how administrators review, edit, or approve those suggestions before finalizing the database update.

## 2. Actors / roles
* **Media users:** Can view details and submit suggestions for edits or deletions, but cannot commit direct changes.
* **Owner / Admin / Moderator:** Can view details, directly edit or delete entities, review pending suggestions in a queue, and approve or decline those suggestions.

## 3. Main path
1. Details about [Entity]
   * User views the active entity (Department, Section, Document, or Post).
   * Leads to selecting a context action (Suggest Edit, Suggest Deletion, Edit, Delete).
   * Visible condition: Accessible options depend on user role permissions.

2. Action Form
   * User completes the specific change form and completes a Captcha calculation.
   * Leads to Submission evaluation.
   * Visible condition: Captcha must be accurate and fields correctly typed.

3. Submission
   * For Admins: Direct changes hit the database, leading to a success screen ("successfully edited/deleted").
   * For Media users: A suggestion is created (success screen) and pushed to the review queue.

4. Check suggestions
   * Admin enters the review queue of pending suggestions.
   * Leads to a unified Review View ("Details about [Entity], old info is strikethrough").

5. Approval Action
   * Admin chooses to approve, decline, or adjust the suggestion.
   * Leads to a final database change or the discarding of the suggestion.

## 4. Branches and decision points
### Decision: Role Access Check
* **Branch A (user === media):** Constrained to "Suggest an edit" or "Suggest a deletion" paths.
* **Branch B (user === owner/admin/moderator):** Unlocked access to direct "Edit", "Delete", and the "Check suggestions" administrative pipeline.

### Decision: Admin Review Action (in "Check suggestions")
* **Branch A (Approve):** Suggestion is accepted, generating a permanent DB update.
* **Branch B (Decline):** Suggestion is rejected, clearing it from the queue.
* **Branch C (Edit before approving):** Admin intercedes to tweak the suggestion before confirming it.

### Decision: Destructive / Batch Actions
* **Branch A (Proceed):** Action continues after a confirmation modal ("Are you sure you want to do it?"), executing the change (e.g., "A department's info is successfully shuffled").
* **Branch B (Cancel):** Backs out to the previous state.

## 5. Return loops / backtracking paths
* From **Action Form** → loops back to the exact same **Action Form** following a validation failure (explicitly drawn with an orange arrow labeled "failed (wrong type/captcha or null)").
* From **Action Form** → returns cleanly to **Details about [Entity]** when the user hits "Cancel" (shown via red or grey dotted lines).

## 6. Exceptions / edge cases
* **Failed Captcha or Invalid Input:** Form submission is instantly blocked and bounces the user back to the open form with their inputs preserved for correction.
* **Confirmation Prompts:** Risky logic (deleting, shuffling data models) trips a hard "Are you sure?" modal safeguard before processing.

## 7. Repeated or duplicated logic
* **Entity Action Blocks:** The entire branching pattern for Suggest Edit, Suggest Deletion, Edit, and Delete is visually identical and duplicated point-for-point across the four primary entities (Departments, Sections, Documents, Posts).
* **Review View:** The mechanism of showing "old info is strikethrough" to compare edits is re-used for every object review.

## 8. Ambiguities / contradictions
* **Ambiguity:** Centralized vs. Decentralized Queue
* **Why unclear:** Lines spanning all four entity types' "Suggest" paths converge visually into "Check suggestions" blocks. It isn't completely obvious if this is one massive global inbox for the whole CMS, or four separated queues.
* **Most likely reading:** It represents a centralized admin dashboard where all incoming suggestions wait, perhaps sorted by tabs or lists.
* **Alternative reading:** "Check suggestions" is functionally duplicated per-entity page.

* **Ambiguity:** Strikethrough view for pure deletions
* **Why unclear:** The label "old info is strikethrough" is uniformly described for taking action on suggestions, including *deletion* suggestions.
* **Most likely reading:** Resolving a deletion suggestion simply shows the entire entity's text struck through to emphasize total removal.

* **Ambiguity:** Developer scribble notes
* **Why unclear:** Fragments of text like "Бар Ані" and "Не чіпати" (Do not touch) hover in the margins.
* **Most likely reading:** These are internal development or engineering reminders rather than deliberate user-facing product logic.

## 9. Clean node-to-node flow map
### Media User Path
* Details about [Entity] → Suggest Edit / Suggest Deletion
* Suggest Edit / Deletion form → Verification (Captcha)
* Verification (Failed) → Suggest Edit / Deletion form (loop)
* Verification (Passed) → Success Screen ("An edit is successfully suggested")
* Success Screen → [Silently routed to Admin Queue]

### Admin Direct Path
* Details about [Entity] → Edit / Delete / Shuffle mode
* Edit / Delete form → Verification (Captcha)
* Verification (Failed) → Edit / Delete form (loop)
* Verification (Passed) → Success Screen
* Shuffle Action → "Are you sure?" Modal → Success Screen

### Admin Review Path
* Check suggestions (Queue view) → Review view ("old info is strikethrough")
* Review view → Approve / Decline / Edit
* Approve → Update Database
* Decline → Purged from Queue

## 10. Open questions for human review
* Does the CMS need a single unified queue for all suggestions, or should admins review them separated by module (e.g. only reviewing Department edits)?
* Are Media users actively notified of declines, or do deleted suggestions silently disappear from the queue?
* Is the Captcha strictly required for authenticated Admins performing direct edits, or was that just mapped universally for form submissions?
* If someone suggests deleting a whole department, does the review screen actually need a "strikethrough" diff view, or just a simple accept/reject prompt?

## 11. Raw interpretation notes
* The board is exceptionally symmetrical, which makes extracting the core repeated logic very straightforward. However, the center of the canvas is visually crowded because paths for `owner / admin / moderator` permissions are merged into a single graphical node before blooming out again to specific forms.
* The deliberate coloring of arrows (orange for rejection loops, grey dotted for cancelbacks) offers excellent structural clarity about the negative paths.
* Translated Ukrainian margin notes were scoped out as developer comments rather than functional nodes.
