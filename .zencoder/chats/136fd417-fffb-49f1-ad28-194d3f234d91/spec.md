# Technical Specification: Enhanced Login Toast Notification

## Technical Context

- **Platform**: React Native (mobile application)
- **Primary Dependencies**:
  - React Navigation (for screen navigation)
  - React Native (core UI framework)
  - React Native Vector Icons (Ionicons and MaterialIcons)
  - React Native Animated API (for animations)
  - AsyncStorage (for token storage)

- **Current Architecture**:
  - LocationHeader.js: Contains login-required action handlers
  - CustomToast.js: Reusable toast component with animations
  - Screen1: Login screen (destination for unauthenticated users)

---

## Technical Implementation Brief

### Key Technical Decisions

1. **Leverage Existing CustomToast**: The CustomToast component already has:
   - Top positioning (top: 60)
   - Slide-down animation (translateY)
   - Fade animation
   - Shadow and elevation styling
   - **No modifications needed** - just pass appropriate props

2. **Toast Variant for Login**: Create a variant style option in CustomToast to differentiate login prompts:
   - Different icon (e.g., Ionicons "information-circle" or "alert-circle" instead of checkmark)
   - Optional different color scheme (can use existing green or switch to orange/amber for info)
   - Reuse existing styling structure

3. **Duration Adjustment**: Set toast duration to 1000ms (1 second) for login prompts

4. **Navigation Timing**: 
   - Toast displays for 1000ms
   - Navigation occurs in setTimeout callback after toast starts dismissing animation
   - Dismissal animation is 300ms, so navigation happens at ~1300ms total
   - **OR** navigate immediately after 1000ms (before dismissal animation) for faster UX

5. **Consistency Pattern**: Apply same behavior across all login-required actions (Profile, Address, etc.)

---

## Source Code Structure

```
src/
├── helperComponent/
│   ├── LocationHeader.js (modify: handleProfilePress, handleAddressPress)
│   ├── CustomToast.js (modify: add variant support)
│   └── [other helpers]
├── screens/
│   └── Screen1.js (destination for login)
└── [other files]
```

---

## Contracts

### CustomToast.js Changes

**Input Props**:
- `visible`: boolean (unchanged)
- `message`: string (unchanged)
- `duration`: number, default 1000ms (changed from 500ms default)
- `onHide`: function (unchanged)
- `type`: string, values: "success" | "info" (NEW) - determines icon and optional color
- `variant`: "default" | "login" (NEW, optional) - styling variant for login prompts

**Behavior**:
- When type="info", display info icon (e.g., Ionicons "information-circle")
- When variant="login", use clean styling suitable for authentication messages
- Maintain existing animation behavior

### LocationHeader.js Changes

**In handleProfilePress() and handleAddressPress()**:
- Modify CustomToast props:
  - Set `duration={1000}` explicitly
  - Add `type="info"` or `variant="login"`
  - Keep existing message and callbacks

**Navigation Flow**:
- Toast appears (0ms)
- Toast animations complete and starts dismissing (1000ms)
- Navigate to Screen1 at 1000ms or slightly after (aligned with toast dismissal)

---

## Delivery Phases

### Phase 1: CustomToast Enhancement
**Deliverable**: Enhanced CustomToast with variant support
- Add `type` prop support for different icons
- Maintain backward compatibility (existing components unaffected)
- Add optional styling for login variant
- Test with different icon types

### Phase 2: LocationHeader Integration  
**Deliverable**: Apply enhanced toast to login-required actions
- Update handleProfilePress() to use new toast props
- Update handleAddressPress() to use new toast props
- Ensure 1000ms duration and proper navigation timing
- Test navigation flow

### Phase 3: Testing & Verification
**Deliverable**: Validated implementation across scenarios
- Test on both Android and iOS (if available)
- Verify toast displays correctly
- Verify auto-dismiss timing (1 second)
- Verify navigation to Screen1
- No console errors

---

## Verification Strategy

### Testing Approach

1. **Manual Testing** (primary method):
   - Run app and test from LocationHeader screen
   - Tap Profile icon without login token
   - Observe: Toast appears at top, displays for ~1 second, then navigates to Screen1
   - Tap Address without login token
   - Observe same behavior
   - Verify no console errors in React Native debugger

2. **Lint & Type Check**:
   - Run: `npm run lint` (if available)
   - Run: `npm run typecheck` (if TypeScript project)
   - Ensure no new warnings introduced

3. **Code Review Checklist**:
   - ✅ CustomToast accepts new props without breaking existing usage
   - ✅ Toast duration is exactly 1000ms
   - ✅ Navigation timing aligns with toast dismissal
   - ✅ No token check required (existing pattern maintained)
   - ✅ Works on both Android and iOS (test on available platform)

### Helper Artifacts

- **Manual Test Script**: Execute these steps:
  1. Launch app and navigate to LocationHeader screen
  2. Ensure no login token (clear AsyncStorage)
  3. Tap Profile icon → verify toast + navigation
  4. Return from login screen
  5. Tap Address → verify same behavior
  6. Check console for any errors/warnings

### Verification Commands

```bash
# Check for lint errors (if available)
npm run lint

# Check for type errors (if TypeScript)
npm run typecheck

# Run tests (if available)
npm test
```

---

## Dependencies Check

- ✅ React Navigation - already in use
- ✅ React Native - already in use
- ✅ React Native Vector Icons - already in use (Ionicons available)
- ✅ Animated API - already in use in CustomToast
- ✅ No new external dependencies required
