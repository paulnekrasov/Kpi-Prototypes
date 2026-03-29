# REF-03: Platform Accessibility APIs

## iOS / macOS (UIAccessibility + SwiftUI)

### Core APIs

| API | Purpose |
|-----|---------|
| `UIAccessibility` protocol | Expose custom views to VoiceOver and Switch Control |
| `accessibilityLabel` | The name read by VoiceOver |
| `accessibilityHint` | Additional context for the action ("Double-tap to open") |
| `accessibilityValue` | Current value of a control (slider position, toggle state) |
| `accessibilityTraits` | Semantic role of element (button, link, header, image, etc.) |
| `accessibilityIdentifier` | Automation/testing ID (not announced) |
| `accessibilityActions` | Custom actions available via VoiceOver Actions menu |
| `UIAccessibilityIsVoiceOverRunning()` | Detect if VoiceOver is active |
| `UIAccessibilityPostNotification()` | Announce dynamic changes or refocus |

### Key UIAccessibilityTraits

```swift
.button          // Announces "button", activates on double-tap
.link            // Announces "link"
.header          // Navigation landmark for heading structure
.image           // Announces "image"
.selected        // Announces selection state
.notEnabled      // Announces "dimmed"
.adjustable      // Enables swipe-up/down to adjust value (sliders)
.updatesFrequently // Suppress intermediate VoiceOver announcements
.causesPageTurn  // For page-based content
```

### SwiftUI Accessibility Modifiers

```swift
// Label (name)
Text("").accessibilityLabel("Close dialog")

// Combined element (group children into one accessible element)
VStack {
    Image("avatar").accessibilityHidden(true)
    Text("Jane Doe")
    Text("Administrator")
}
.accessibilityElement(children: .combine)

// Custom action
Button("Menu") { }
.accessibilityAction(named: "Open settings") { openSettings() }

// Value for adjustable
Slider(value: $volume)
    .accessibilityValue("\(Int(volume * 100))%")

// Announce dynamic change
AccessibilityNotification.Announcement("Item added to cart").post()
// or UIKit:
UIAccessibility.post(notification: .announcement, argument: "Item added")

// Sort priority (when reading order doesn't match visual order)
Text("$99").accessibilityLabel("Price: 99 dollars").accessibilitySortPriority(2)
Text("Sale").accessibilitySortPriority(1)
```

### Dynamic Type

```swift
// SwiftUI -- automatic with standard Text styles
Text("Body").font(.body)             // Scales automatically
Text("Headline").font(.headline)

// Never fix font sizes in points for user-facing text
// Test with: Settings -> Accessibility -> Display & Text Size -> Larger Text
```

### VoiceOver Testing Gestures (iOS)
```
Right swipe        -> Next element
Left swipe         -> Previous element
Double tap         -> Activate focused element
Three-finger swipe -> Scroll
Two-finger tap     -> Stop/start speaking
Swipe Up/Down      -> Adjust value (on .adjustable trait)
Two-finger Z       -> Escape / dismiss
```

### VoiceOver Notifications (UIKit)
```swift
UIAccessibility.post(notification: .screenChanged, argument: viewToFocus)
// Use after navigation/modal: moves VoiceOver focus to specified element

UIAccessibility.post(notification: .layoutChanged, argument: viewToFocus)
// Use after partial UI update (e.g., error message appeared)

UIAccessibility.post(notification: .announcement, argument: "File uploaded")
// Announce without moving focus
```

### Apple HIG Accessibility Requirements
- Accessibility is an **App Store review criterion** -- apps can be rejected for inaccessibility
- Support VoiceOver, Switch Control, Reduce Motion, Increase Contrast, Bold Text
- All touch targets: minimum **44x44 pt**
- Support all Dynamic Type size categories including Accessibility sizes
- Respect `UIAccessibility.isReduceMotionEnabled` -- disable/reduce animations

---

## Android (AccessibilityNodeInfo + TalkBack)

### Core Concepts

| Concept | Description |
|---------|-------------|
| `AccessibilityNodeInfo` | Represents a view node as seen by accessibility services |
| `contentDescription` | Replaces visual label for AT (analogous to alt text / aria-label) |
| `importantForAccessibility` | `yes`, `no`, `noHideDescendants`, `auto` |
| `ViewCompat.setAccessibilityDelegate` | Customize accessibility info for custom views |
| `AccessibilityManager` | Check if accessibility service is running |
| `AccessibilityEvent` | Events dispatched to accessibility services |

### Essential Attributes (XML)
```xml
<!-- Content description for images/icons -->
<ImageButton
    android:contentDescription="@string/close_dialog"
    ... />

<!-- Decorative image -- hide from TalkBack -->
<ImageView
    android:importantForAccessibility="no"
    ... />

<!-- Group related items as single accessible unit -->
<LinearLayout
    android:focusable="true"
    android:contentDescription="Jane Doe, Administrator"
    android:importantForAccessibility="yes">
    <!-- children hidden from AT -->
</LinearLayout>
```

### Programmatic AccessibilityNodeInfo (Kotlin)
```kotlin
ViewCompat.setAccessibilityDelegate(view, object : AccessibilityDelegateCompat() {
    override fun onInitializeAccessibilityNodeInfo(
        host: View,
        info: AccessibilityNodeInfoCompat
    ) {
        super.onInitializeAccessibilityNodeInfo(host, info)
        info.roleDescription = "Slider"       // Override role
        info.stateDescription = "50 percent"  // Current value
        info.isCheckable = true
        info.isChecked = isSelected
        // Add custom action
        info.addAction(AccessibilityNodeInfoCompat.AccessibilityActionCompat(
            AccessibilityNodeInfoCompat.ACTION_CLICK, "Add to cart"
        ))
    }
})
```

### Announce Dynamic Changes (Kotlin)
```kotlin
// Polite announcement (waits for current speech to finish)
view.announceForAccessibility("3 results loaded")

// Focused announcement (like layoutChanged)
ViewCompat.performAccessibilityAction(
    newContent,
    AccessibilityNodeInfoCompat.ACTION_ACCESSIBILITY_FOCUS,
    null
)
```

### TalkBack Testing Gestures (Android)
```
Right swipe        -> Next element
Left swipe         -> Previous element
Double tap         -> Activate focused element
Swipe right-down   -> Open TalkBack menu
Two-finger tap     -> Pause/resume speech
Three-finger tap   -> Open TalkBack context menu
```

### Android Accessibility Checklist
- Every `ImageView`/`ImageButton` has `contentDescription` or `importantForAccessibility="no"`
- Every `EditText` paired with visible `TextView` label or `android:hint` plus `labelFor`
- `focusable="true"` on custom interactive views
- Touch targets >= **48x48 dp**
- Test focus order with: Settings -> Accessibility -> TalkBack -> Settings -> Developer settings -> Highlight focused item
- Error messages programmatically associated with fields

---

## Windows (UI Automation + UIA)

### UI Automation Overview

Microsoft UI Automation (UIA) is the modern accessibility framework for Windows.
It maps framework-specific elements (WPF, Win32, WinForms, HTML, WinUI) to a
unified tree of `AutomationElement` objects with standard properties and patterns.

### Key UIA Properties

| Property | Description |
|----------|-------------|
| `Name` | Accessible name (like aria-label) |
| `ControlType` | Role: Button, Edit, CheckBox, ListItem, etc. |
| `IsEnabled` | Whether the control is interactive |
| `IsKeyboardFocusable` | Whether element can receive keyboard focus |
| `LabeledBy` | References the label element |
| `HelpText` | Equivalent to aria-describedby |
| `LocalizedControlType` | Human-readable type string |
| `AutomationId` | Testing ID (not announced) |

### UIA Control Patterns

| Pattern | Description |
|---------|-------------|
| `InvokePattern` | Buttons -- trigger an action |
| `TogglePattern` | Checkboxes, toggle buttons |
| `SelectionPattern` | Listboxes, tab bars |
| `ScrollPattern` | Scrollable containers |
| `ExpandCollapsePattern` | Trees, accordions, combos |
| `GridPattern` | Grid/table controls |
| `TextPattern` | Text content (read/navigate) |
| `ValuePattern` | Input controls (get/set value) |
| `RangeValuePattern` | Sliders, progress bars |

### WPF Accessibility (XAML)
```xml
<!-- Accessible name -->
<Button AutomationProperties.Name="Close dialog">X</Button>

<!-- Label association -->
<Label Target="{Binding ElementName=emailInput}">Email</Label>
<TextBox x:Name="emailInput" />

<!-- Describe with helper text -->
<TextBox AutomationProperties.HelpText="Enter your work email address" />

<!-- Decorative image -->
<Image AutomationProperties.AccessibilityView="Raw" />

<!-- Live region equivalent (WPF 4.7.1+) -->
<TextBlock AutomationProperties.LiveSetting="Polite"
           x:Name="statusMsg">Ready</TextBlock>
```

### Keyboard Accessibility Checklist (Windows)
- All controls reachable with Tab / Shift+Tab
- Arrow keys navigate within composite controls (listbox, menu, toolbar)
- Enter activates the focused button/link/menuitem
- Space toggles checkboxes and activates buttons
- Escape dismisses dialogs/menus and returns focus to trigger
- Access keys (Alt+letter) provided for main commands
- Focus visible at all times -- system focus rectangle or custom equivalent
- Focus order matches visual/logical reading order

### Narrator Testing
- Windows key + Ctrl + Enter -- Start/stop Narrator
- Caps Lock + D -- Read current item
- Caps Lock + F -- Read focus
- Tab / Shift+Tab -- Navigate interactive elements
- Caps Lock + Left/Right -- Navigate by character

---

## Screen Reader Quick Reference (Web)

### NVDA (Windows) -- Key Commands

| Action | Command |
|--------|---------|
| Start/stop NVDA | Ctrl+Alt+N |
| Browse mode (read page) | NVDA+Space to toggle |
| Focus mode (interact with form) | Auto on form fields |
| Next/prev heading | H / Shift+H |
| Next/prev landmark | D / Shift+D |
| Next/prev link | K / Shift+K |
| Next/prev form field | F / Shift+F |
| Next/prev table | T / Shift+T |
| Activate link/button | Enter |
| Stop reading | Ctrl |
| Read from here | NVDA+Down |

### VoiceOver macOS -- Key Commands

| Action | Command |
|--------|---------|
| Start/stop VoiceOver | Cmd+F5 |
| VO key (modifier) | Ctrl+Option |
| Next/prev element | VO+Right / VO+Left |
| Interact with element | VO+Shift+Down |
| Stop interacting | VO+Shift+Up |
| Next heading | VO+Cmd+H |
| Open rotor | VO+U |
| Activate | VO+Space |

---

## Sources
- Apple UIAccessibility: https://developer.apple.com/accessibility/ios/
- Apple HIG Accessibility: https://developer.apple.com/design/human-interface-guidelines/accessibility
- Android Accessibility: https://developer.android.com/guide/topics/ui/accessibility
- Microsoft UI Automation: https://learn.microsoft.com/en-us/dotnet/framework/ui-automation/
- Windows Accessibility Checklist: https://learn.microsoft.com/en-us/windows/apps/design/accessibility/accessibility-checklist
- NVDA Tutorial: https://webaim.org/articles/nvda/