# Known Issues

Living doc for bugs and rough edges we know about but have not fixed yet. Use a GitHub issue for anything you plan to work on soon; this file is for longer-lived "we know, just not yet" items that don't need per-item tracking overhead.

## Mobile

### iOS keyboard over-lifts the log wear sheet on notes focus

**Severity:** cosmetic. The notes field is usable; surrounding context gets pushed off screen.

**Surface:** `apps/mobile/components/log-wear-sheet.tsx`, iOS only.

**What happens:** when the user taps into the Notes input in the log wear sheet, the iOS keyboard rises and the sheet rises with it, overshooting so that the fields above the notes input (date presets, occasion chips, date label) scroll out of view. The user can type fine but loses context about what they are editing.

**What we tried (none landed clean):**
- Stock RN `KeyboardAvoidingView` with `automaticallyAdjustKeyboardInsets` on the inner `ScrollView`. Functional, but the sheet lifted far higher than needed.
- Dropping the `KeyboardAvoidingView` and relying on `automaticallyAdjustKeyboardInsets` alone. Regressed to the original bug: keyboard covers the notes input.
- Replacing the hand-rolled sheet with `@gorhom/bottom-sheet` using `enableDynamicSizing` + `keyboardBehavior="interactive"`. Sheet barely moved with the keyboard.
- Switching gorhom to fixed snap points (65% / 92%) + `keyboardBehavior="extend"`. No meaningful improvement on device.

**Likely fix direction:** physical-device tuning of gorhom snap points against real viewport heights; or switching to `react-native-true-sheet` (exposes finer keyboard-offset control); or writing custom keyboard-offset math with `react-native-keyboard-controller` per-frame hooks.

Deferred until a polish pass on the mobile UX layer.
