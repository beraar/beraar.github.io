Thank you for the comprehensive answers. Based on your clarifications, I will now generate a detailed, stage-by-stage implementation prompt message.

---

# Implementation Prompt: "Record & Compare" Feature for Zabon

---

## Context Recovery Information

This implementation prompt describes the design and staged implementation of a "Record & Compare" feature for the Zabon language learning app.

**If context is lost at any point, provide this summary to the AI assistant:**

> "We are implementing a 'Record & Compare' feature for the Zabon language learning app (mobile-first, JSON-driven lessons, Web Speech API). The feature allows users to record themselves speaking a sentence or word from the lesson, then compare their recording to the original audio. We are following a staged implementation approach. The app's lessons are structured as ordered sets of individual sentences (scenario conversations) and word lists. Sentences are stored with 'kind': 'sentence' and have 'texts' and 'tokens' properties. Words are stored with 'kind': 'word'. The current workflow includes: selecting a target language, selecting bridge languages, and playing audio with text highlighting. We are adding recording functionality that appears after listening, with manual stop, countdown, visual indicator, and compare playback. Recordings are held in memory only. The 'Hide Text' challenge is a global setting in the lesson settings panel. The 'Record' button should fade in/out with the spoken text. The 'Compare' playback has a brief pause between original and recording, with the pause duration based on the user's speech speed setting. MediaRecorder fallback: hide the button if unsupported. We are at Stage [X] and need to continue."

---

## Overview

This feature enhances the existing lesson listening experience by adding an interactive "Listen, Then Speak" workflow. After the user hears a sentence or word with highlighting, they are invited to record themselves speaking the same phrase. They can then compare their recording to the original audio, enabling self-assessment and active pronunciation practice.

The implementation follows a staged approach, with each stage building upon the previous one. Each stage must be tested and approved before proceeding to the next.

---

## Files to Be Modified or Created

| File                           | Purpose                                              | Stage          |
| :----------------------------- | :--------------------------------------------------- | :------------- |
| `app.js`                       | Core application logic, UI rendering, event handling | All Stages     |
| `main.css`                     | Styling for new UI elements                          | Stages 1, 3, 6 |
| `index.html`                   | HTML structure for new controls (if needed)          | Stage 1        |
| _No new files are anticipated_ | -                                                    | -              |

---

# Suggested Opening Message for Stage 1 Chat

    "We are implementing the 'Record & Compare' feature for the Zabon language learning app. We are following a staged implementation plan. This is Stage 1: Core Recording Infrastructure. The goal is to establish the foundational audio recording capabilities with support detection, permission handling, start/stop, maximum duration guard, and a test harness. Please implement Stage 1 as specified. I will upload the current versions of app.js, index.html, and main.css. After implementation, I will run the tests (T1.1 through T1.8) and confirm before proceeding to Stage 2."

---

# Stage 1: Core Recording Infrastructure

**Goal:** Establish the foundational audio recording capabilities. No UI integration with lessons yet—just a test harness to verify recording works.

---

## Files to Upload

- `app.js` (current version)
- `index.html` (current version)
- `main.css` (current version)

---

## Implementation Requirements

### 1.1 Detect Browser Support

- Create a function `isMediaRecorderSupported()` that checks for:
  - `window.MediaRecorder` existence
  - `navigator.mediaDevices` and `getUserMedia` support
  - Return `true` only if all required APIs are available

### 1.2 Recording Class/Module

Create a self-contained recording manager with the following capabilities:

- **Request Microphone Access:** Prompt the user for microphone permission. Handle both "granted" and "denied" states gracefully.
- **Start Recording:** Begin capturing audio from the microphone.
- **Stop Recording:** Stop capturing and return the recorded audio as a `Blob` (WebM format recommended).
- **Get Recording State:** Return the current state (idle, recording, stopped, error).
- **Maximum Duration Guard:** Implement a safety limit to prevent excessively large blobs. If a recording exceeds **10 seconds** (or a defined maximum based on the original sentence length multiplied by a factor, e.g., 3x the original duration), automatically stop recording and notify the user.
- **Cleanup:** Release microphone resources when recording is complete or aborted.

### 1.3 Test Harness (Temporary)

Add a hidden test panel accessible only via a debug flag (e.g., `?test=record` in the URL) or a console-accessible function:

- A "Start Recording" button
- A "Stop Recording" button
- A "Play Recording" button
- A display showing recording duration
- A display showing the size of the recorded blob

### 1.4 Error Handling

- Handle `NotAllowedError` (user denied permission) with a user-friendly message
- Handle `NotFoundError` (no microphone found) with a guidance message
- Handle `NotReadableError` (microphone in use by another application)
- Log all errors to the console for debugging

---

## Tests to Confirm

| Test     | Expected Result                                                                                | Pass/Fail |
| :------- | :--------------------------------------------------------------------------------------------- | :-------- |
| **T1.1** | `isMediaRecorderSupported()` returns `true` on a modern mobile browser with microphone access. | ☐         |
| **T1.2** | Request microphone permission displays the browser's permission dialog.                        | ☐         |
| **T1.3** | "Start Recording" begins capturing audio and shows a recording indicator.                      | ☐         |
| **T1.4** | "Stop Recording" stops capture and returns a valid `Blob` object.                              | ☐         |
| **T1.5** | "Play Recording" plays back the captured audio correctly.                                      | ☐         |
| **T1.6** | Recording automatically stops if the maximum duration is exceeded.                             | ☐         |
| **T1.7** | Denying microphone permission displays an appropriate message and does not crash.              | ☐         |
| **T1.8** | No memory leaks or hanging microphone streams after repeated start/stop cycles.                | ☐         |

---

## Context Recovery for Stage 1

> "We are implementing the 'Record & Compare' feature for Zabon. We have completed Stage 1: Core Recording Infrastructure. All tests T1.1 through T1.8 have passed. The recording manager is functional with support detection, permission handling, start/stop with manual control, maximum duration guard (10 seconds or 3x original), and a temporary test harness. Please proceed to Stage 2."

---

# Stage 2: Lesson UI Integration — Recording Controls (Revised)

**Goal:** Integrate the "Record" button into the lesson view with a timeout-based pause mechanism.

---

## Files to Upload

- `app.js` (Stage 1 complete)
- `main.css` (current version)
- `index.html` (current version)

---

## Implementation Requirements

### 2.1 Recording Button Placement

    Add a toggle switch labeled "Record & Compare Mode" to the lesson settings panel.

    Default state: ON.

    When ON: Playback pauses after each sentence/word, and the Record button appears.

    When OFF: Playback continues uninterrupted (current behavior).

    The toggle state is saved in localStorage (e.g., zabon.recordCompareMode).

### 2.2 Visual Indicator

    When "Record & Compare Mode" is ON, display a subtle indicator in the lesson view:

        A small microphone icon (🎤) or badge near the sentence counter

        A brief tooltip or label: "Record mode active"

### 2.3 Recording Button Placement

    The Record button (🎤) appears below each sentence or word item.

    The button appears immediately when playback pauses.

    The button is accompanied by a visible countdown timer (e.g., "⏱ 5s").

    The button and timer fade in together (300ms).

### 2.4 Countdown Timer Behavior

    The timer starts counting down immediately when playback pauses.

    The countdown is paused if the user taps or focuses on the Record button.

    The countdown resumes if the user moves away from the button.

    The countdown is configurable in settings (default: 5 seconds).

    If the timer expires, playback auto-continues.

### 2.5 "Skip" Button

    A small "Skip" button (⏭) appears next to the Record button.

    Tapping "Skip" immediately continues playback.

    The "Skip" button is subtle and does not distract from the primary Record action.

### 2.6 Recording States (Unchanged from Original Plan)

    Visible (Idle): Microphone icon, waiting for user action.

    Recording: Red indicator with pulse animation.

    Processing: Brief spinner while blob is prepared.

    Completed: Checkmark icon, Compare button appears.

### 2.7 Countdown Animation

    The countdown timer should have a smooth visual animation (numbers "pop" or scale).

    The timer should be clearly visible and readable.

### 2.8 Word-Level Behavior

    For word items, the same behavior applies: pause, Record button with timer, auto-continue.

    The timeout duration should be shorter for words (e.g., 3-4 seconds).

### 2.9 "Re-record" Workflow

    After recording and comparing, the user has two options:

        Continue (▶️) — resumes playback

        Re-record (🔄) — starts a new recording session for the same item

    The "Re-record" option appears after the Compare playback finishes.

---

## Revised Tests for Stage 2

Test Expected Result Pass/Fail
T2.1 The "Record & Compare Mode" toggle appears in the lesson settings panel, defaulting to ON. ☐
T2.2 When the toggle is ON, playback pauses after each sentence/word. ☐
T2.3 When the toggle is OFF, playback continues uninterrupted. ☐
T2.4 The toggle state is saved in localStorage and persists across sessions. ☐
T2.5 A subtle visual indicator (e.g., mic badge) appears in the lesson view when mode is ON. ☐
T2.6 The Record button and countdown timer appear immediately when playback pauses. ☐
T2.7 The countdown timer counts down and auto-continues when it expires. ☐
T2.8 The countdown is paused when the user taps or focuses on the Record button. ☐
T2.9 The countdown duration is configurable in settings (3s, 5s, 10s, 15s). ☐
T2.10 The "Skip" button immediately continues playback. ☐
T2.11 Tapping the Record button starts the recording process (countdown, then recording). ☐
T2.12 The red pulse animation and visual indicators work during recording. ☐
T2.13 After recording and comparing, "Continue" and "Re-record" options are available. ☐
T2.14 The timeout is shorter for word items (3-4 seconds). ☐
T2.15 The Record button is hidden if MediaRecorder is not supported. ☐

---

## Context Recovery for Stage 2

> "We are implementing the 'Record & Compare' feature for Zabon. The implementation includes a global 'Record & Compare Mode' toggle in the lesson settings panel (default ON). When active, playback pauses after each sentence/word with a visible countdown timer (default 5s, configurable). The user can Record, Skip, or let the timer expire to continue. The Record button appears below each item with a countdown and 'Skip' button. We have completed Stage 1. Please proceed to Stage 2 (Revised)."

---

# Stage 3: Compare Playback

**Goal:** Implement the "Compare" functionality that plays the original audio followed by the user's recording.

---

## Files to Upload

- `app.js` (Stage 2 complete)
- `main.css` (Stage 2 complete)
- `index.html` (current version)

---

## Implementation Requirements

### 3.1 "Compare" Button

- After recording is complete, the "Record" button transforms into a "Compare" button (▶️ icon or a "Compare" label).
- The "Compare" button should remain visible until the user navigates away from the item or starts a new recording.

### 3.2 Compare Playback Sequence

- When the user taps "Compare":
  1. **Play the original audio** (using the existing `SpeechSynthesis` playback with highlighting).
  2. **Pause** for a duration based on the user's speech speed setting:
     - Normal: 0.5 seconds
     - Slow: 0.75 seconds
     - Slower: 1.0 seconds
  3. **Play the user's recording** (using the recorded `Blob`).
  4. **Indicate which audio is playing** (e.g., a label showing "Original" or "Your recording").
  5. **Highlight** the text during original playback (reuse existing highlighting logic).

### 3.3 Separate Original Playback

- The user should be able to replay the **original audio separately** at any time, even without recording.
- This can be achieved by tapping the existing "Play" button on the sentence/item.

### 3.4 Audio Playback UI Controls

- During compare playback, show the same media controls as the main player:
  - ▶️ Play (if paused)
  - ⏹️ Stop
  - 📊 Progress bar (visual only, showing which audio is playing)

### 3.5 Compare State Management

- Store the recorded `Blob` in memory for the duration of the lesson session.
- When the user navigates to a different sentence, the recorded `Blob` for the previous sentence should be discarded to free memory.
- If the user navigates back to a sentence they previously recorded, the recording should **not** be retained (fresh recording required).

---

## Tests to Confirm

| Test      | Expected Result                                                                                              | Pass/Fail |
| :-------- | :----------------------------------------------------------------------------------------------------------- | :-------- |
| **T3.1**  | After recording, the "Record" button transforms into a "Compare" button.                                     | ☐         |
| **T3.2**  | Tapping "Compare" plays the **original audio** first.                                                        | ☐         |
| **T3.3**  | There is a **pause** between original and user recording (0.5s for Normal, 0.75s for Slow, 1.0s for Slower). | ☐         |
| **T3.4**  | The **user's recording** plays after the pause.                                                              | ☐         |
| **T3.5**  | A label shows "Original" during original playback and "Your recording" during user playback.                 | ☐         |
| **T3.6**  | The original audio **highlighting** works during compare playback.                                           | ☐         |
| **T3.7**  | Tapping the existing "Play" button replays the **original audio** separately.                                | ☐         |
| **T3.8**  | Recorded blobs are **discarded** from memory when navigating to a different item.                            | ☐         |
| **T3.9**  | The "Compare" button remains visible until the user navigates away or starts a new recording.                | ☐         |
| **T3.10** | The compare playback can be **stopped** mid-sequence by tapping the Stop button.                             | ☐         |

---

## Context Recovery for Stage 3

> "We are implementing the 'Record & Compare' feature for Zabon. We have completed Stage 3: Compare Playback. All tests T3.1 through T3.10 have passed. The 'Compare' button appears after recording and plays original audio with highlighting, pauses based on speech speed setting, then plays the user's recording. Recordings are discarded when navigating between items. Please proceed to Stage 4."

---

# Stage 4: Lesson Settings — "Hide Text" Challenge Toggle

**Goal:** Add a global setting in the lesson settings panel to hide the text during the recording challenge.

---

## Files to Upload

- `app.js` (Stage 3 complete)
- `main.css` (current version)
- `index.html` (current version)

---

## Implementation Requirements

### 4.1 Settings Panel Addition

- Add a new control to the existing lesson settings panel (the panel accessed via the ⚙ icon in the bottom bar).
- The control should be a **toggle switch** labeled "Hide Text Challenge" or similar.
- The toggle state should be saved in `localStorage` (e.g., `zabon.hideTextChallenge`) so it persists across sessions.

### 4.2 Behavior When Toggle is Active (Text Hidden)

- When the user plays audio for a sentence or word, the **text is hidden**.
- The user must rely on listening alone to understand the phrase.
- A hint or placeholder (e.g., "···" or a subtle visual block) should indicate where the text would be.
- When the user taps "Record" and completes the recording, or when they tap the existing "Play" button, the text can be temporarily revealed.

### 4.3 Behavior When Toggle is Inactive

- Text is displayed as normal (current behavior).
- The "Record" button appears after audio playback as before.

### 4.4 "Reveal" Button (Optional Enhancement)

- When the text is hidden, a small "Hint" or "Reveal" button should be available.
- Tapping this button temporarily shows the text for the current item.
- The text remains visible until the user interacts with another item or dismisses it.

### 4.5 Visual State for Hidden Text

- The hidden text area should have a subtle visual treatment:
  - A dashed border or blurred text effect
  - A small lock or eye icon indicating the text is hidden
  - The number of words (e.g., "4 words") displayed as a placeholder

---

## Tests to Confirm

| Test      | Expected Result                                                                        | Pass/Fail |
| :-------- | :------------------------------------------------------------------------------------- | :-------- |
| **T4.1**  | The "Hide Text Challenge" toggle appears in the lesson settings panel.                 | ☐         |
| **T4.2**  | The toggle state is saved in `localStorage` and persists across sessions.              | ☐         |
| **T4.3**  | When the toggle is active, text for sentences and words is **hidden** during playback. | ☐         |
| **T4.4**  | A visual placeholder (e.g., "···" or blurred text) appears where the text would be.    | ☐         |
| **T4.5**  | The word count or item length is displayed as a placeholder hint.                      | ☐         |
| **T4.6**  | Tapping the existing "Play" button temporarily **reveals** the text.                   | ☐         |
| **T4.7**  | Tapping "Record" temporarily **reveals** the text during recording.                    | ☐         |
| **T4.8**  | The "Reveal" button (if implemented) temporarily shows the text.                       | ☐         |
| **T4.9**  | When the toggle is inactive, text is displayed normally.                               | ☐         |
| **T4.10** | The toggle works correctly for both sentence and word items.                           | ☐         |

---

## Context Recovery for Stage 4

> "We are implementing the 'Record & Compare' feature for Zabon. We have completed Stage 4: Lesson Settings — 'Hide Text' Challenge Toggle. All tests T4.1 through T4.10 have passed. The toggle appears in the lesson settings panel, persists across sessions, and hides text when active with placeholder indicators. Text is temporarily revealed during playback or recording. Please proceed to Stage 5."

---

# Stage 5: UI Polish — Fade In/Out and Animation Refinements

**Goal:** Refine the visual experience of the recording controls with smooth animations and context-aware behavior.

---

## Files to Upload

- `app.js` (Stage 4 complete)
- `main.css` (Stage 4 complete)
- `index.html` (current version)

---

## Implementation Requirements

### 5.1 Smooth Fade Transitions

- The "Record" button should **fade in** over 300ms after audio playback finishes.
- The "Record" button should **fade out** over 300ms when:
  - The user navigates to a different item
  - A new audio playback starts
  - The user dismisses the lesson

### 5.2 Recording Indicator Animation

- When recording is active, show a **pulsing red circle** next to or as part of the recording button.
- The pulse animation should be subtle (not distracting) and use a CSS animation.

### 5.3 Countdown Animation

- The 3-second countdown should have a smooth **scale/zoom** animation.
- Each number should appear to "pop" slightly.
- The countdown should be centered and visually prominent.

### 5.4 "Compare" Button Transition

- The transition from "Record" to "Compare" button should be smooth.
- The icon should change from 🎤 to ▶️ (or a "Compare" label) with a subtle fade.

### 5.5 Mobile-Friendly Touch Targets

- Ensure all interactive elements (Record, Compare, Play, Stop) have a minimum touch target size of **44px × 44px**.
- Buttons should have adequate spacing to avoid accidental taps.

### 5.6 Loading/Processing State

- When the recording is being saved or prepared for playback, show a brief **spinner** or "Processing..." state.
- This state should last no more than 500ms (it should be very fast).

### 5.7 Theme and Font Mode Compatibility

- All new UI elements should respect the user's selected **theme** (light/dark/auto) and **font mode** (modern/traditional).
- Colors should use CSS variables (e.g., `var(--accent)`, `var(--surface)`) rather than hard-coded values.

---

## Tests to Confirm

| Test      | Expected Result                                                              | Pass/Fail |
| :-------- | :--------------------------------------------------------------------------- | :-------- |
| **T5.1**  | The "Record" button fades in smoothly (300ms) after audio playback finishes. | ☐         |
| **T5.2**  | The "Record" button fades out smoothly (300ms) when navigating away.         | ☐         |
| **T5.3**  | A **pulsing red circle** is visible during recording.                        | ☐         |
| **T5.4**  | The countdown has a smooth **scale/zoom** animation.                         | ☐         |
| **T5.5**  | The "Record" to "Compare" transition is smooth and subtle.                   | ☐         |
| **T5.6**  | All touch targets are at least **44px × 44px**.                              | ☐         |
| **T5.7**  | A "Processing..." state appears briefly when recording is saved.             | ☐         |
| **T5.8**  | New UI elements respect **dark mode** color variables.                       | ☐         |
| **T5.9**  | New UI elements respect **font mode** (modern/traditional) variables.        | ☐         |
| **T5.10** | The interface remains responsive and usable on small screens (320px width).  | ☐         |

---

## Context Recovery for Stage 5

> "We are implementing the 'Record & Compare' feature for Zabon. We have completed Stage 5: UI Polish — Fade In/Out and Animation Refinements. All tests T5.1 through T5.10 have passed. The UI has smooth transitions, responsive touch targets, and respects theme/font settings. Please proceed to Stage 6."

---

# Stage 6: End-to-End Workflow Validation & Edge Case Handling

**Goal:** Validate the complete "Listen, Then Speak" workflow and handle edge cases.

---

## Files to Upload

- `app.js` (Stage 5 complete)
- `main.css` (Stage 5 complete)
- `index.html` (current version)

---

## Implementation Requirements

### 6.1 Complete Workflow Validation

Test the full user journey end-to-end:

1. User opens a lesson.
2. User selects target and bridge languages.
3. User taps a sentence to hear it (with highlighting).
4. The "Record" button fades in.
5. User taps "Record" → 3-second countdown → recording starts.
6. User speaks the sentence.
7. User taps "Stop" → recording ends.
8. The "Compare" button appears.
9. User taps "Compare" → original audio plays with highlighting → pause → user's recording plays.
10. User hears the difference and can decide to re-record.

### 6.2 Error Recovery

- **No Microphone Available:** "Record" button is hidden, and a subtle message in the lesson view explains that recording is unavailable.
- **Permission Denied:** If the user denies microphone permission, show a friendly message explaining that recording is required for this feature, with a "Try Again" button to request permission again.
- **Recording Timeout:** If the user records for too long (exceeds the maximum duration guard), automatically stop and notify the user.

### 6.3 Edge Cases

- **No Audio:** What if the user taps "Record" before ever playing the audio? (The "Record" button should not be visible until after audio playback, so this should not occur.)
- **Multiple Recordings:** If the user records, compares, then records again, the previous recording should be discarded.
- **Navigating Away:** If the user navigates away from a sentence while recording, the recording should be discarded and the button should reset.
- **Lesson End:** When the user reaches the end of the lesson, the recording controls should not cause errors.

### 6.4 Performance

- Recording and playback should be smooth with no noticeable lag.
- Memory usage should remain stable (recordings are held in memory only, never persisted).
- No memory leaks after repeated recording/comparing cycles.

### 6.5 Accessibility

- All recording controls should have appropriate ARIA labels.
- The recording state should be announced to screen readers (e.g., "Recording started," "Recording stopped").
- Visual indicators (color, icons) should be supplemented with text labels where possible.

---

## Tests to Confirm

| Test      | Expected Result                                                                                     | Pass/Fail |
| :-------- | :-------------------------------------------------------------------------------------------------- | :-------- |
| **T6.1**  | The complete "Listen, Then Speak" workflow works end-to-end without errors.                         | ☐         |
| **T6.2**  | If the user denies microphone permission, a friendly message is shown with a "Try Again" button.    | ☐         |
| **T6.3**  | Recording automatically stops if the maximum duration is exceeded, with a notification to the user. | ☐         |
| **T6.4**  | If the user records, compares, then records again, the previous recording is discarded.             | ☐         |
| **T6.5**  | Navigating away from a sentence during recording discards the recording and resets the button.      | ☐         |
| **T6.6**  | The lesson ends gracefully with no errors related to recording controls.                            | ☐         |
| **T6.7**  | Recording and playback are smooth with no noticeable lag.                                           | ☐         |
| **T6.8**  | Memory usage remains stable after repeated recording/comparing cycles.                              | ☐         |
| **T6.9**  | All recording controls have appropriate **ARIA labels**.                                            | ☐         |
| **T6.10** | Recording state changes are announced to **screen readers**.                                        | ☐         |
| **T6.11** | Visual indicators are supplemented with **text labels** where possible.                             | ☐         |

---

## Context Recovery for Stage 6

> "We are implementing the 'Record & Compare' feature for Zabon. We have completed Stage 6: End-to-End Workflow Validation & Edge Case Handling. All tests T6.1 through T6.11 have passed. The feature is complete and ready for final review. Please proceed to the final integration and testing phase."

---

# Stage 7: Final Integration and User Acceptance Testing

**Goal:** Integrate the feature with the rest of the app and prepare for production release.

---

## Files to Upload

- `app.js` (Stage 6 complete)
- `main.css` (Stage 6 complete)
- `index.html` (final version)

---

## Implementation Requirements

### 7.1 Integration with Existing Features

- Ensure "Record & Compare" works seamlessly with:
  - Existing playback controls (Play, Pause, Stop)
  - Theme and font mode settings
  - Language selection (target and bridge languages)
  - Lesson navigation (Next Up, Category browsing)
  - Flashcard and Quiz exercises (the recording feature should not interfere with these)

### 7.2 Performance Testing

- Test on a range of mobile devices:
  - iOS (Safari)
  - Android (Chrome)
  - Android (Firefox)
- Verify recording quality and playback are acceptable.
- Check memory usage during extended lesson sessions.

### 7.3 User Acceptance Testing (UAT)

- Conduct testing with real users to gather feedback on:
  - Ease of use (is the "Record" button discoverable?)
  - Effectiveness (does the compare feature help with pronunciation?)
  - Satisfaction (is the feature engaging and useful?)

### 7.4 Documentation

- Update `README.md` or user documentation to mention the new "Record & Compare" feature.
- Add inline code comments for future maintainability.

### 7.5 Release Checklist

- All tests across all stages pass.
- Feature works on the minimum supported browser versions.
- No regressions in existing functionality.
- Performance meets acceptable thresholds.
- UAT feedback has been incorporated (if applicable).

---

## Tests to Confirm

| Test      | Expected Result                                                                     | Pass/Fail |
| :-------- | :---------------------------------------------------------------------------------- | :-------- |
| **T7.1**  | "Record & Compare" works alongside existing playback controls without interference. | ☐         |
| **T7.2**  | The feature respects theme and font mode settings.                                  | ☐         |
| **T7.3**  | The feature works correctly with all target and bridge language selections.         | ☐         |
| **T7.4**  | Lesson navigation (Next Up, Category browsing) does not cause recording errors.     | ☐         |
| **T7.5**  | Flashcard and Quiz exercises are unaffected by the new feature.                     | ☐         |
| **T7.6**  | The feature works on **iOS Safari** with acceptable recording quality.              | ☐         |
| **T7.7**  | The feature works on **Android Chrome** with acceptable recording quality.          | ☐         |
| **T7.8**  | Memory usage remains stable over extended lesson sessions (20+ sentences).          | ☐         |
| **T7.9**  | UAT feedback has been collected and incorporated (if applicable).                   | ☐         |
| **T7.10** | Documentation is updated to reflect the new feature.                                | ☐         |

---

## Completion

Once all tests across all stages are confirmed passing, the "Record & Compare" feature is ready for production release.

---

## Summary of Implementation Stages

| Stage       | Focus                                               | Tests        |
| :---------- | :-------------------------------------------------- | :----------- |
| **Stage 1** | Core Recording Infrastructure                       | T1.1 - T1.8  |
| **Stage 2** | Lesson UI Integration — Recording Controls          | T2.1 - T2.12 |
| **Stage 3** | Compare Playback                                    | T3.1 - T3.10 |
| **Stage 4** | Lesson Settings — "Hide Text" Challenge Toggle      | T4.1 - T4.10 |
| **Stage 5** | UI Polish — Fade In/Out and Animation Refinements   | T5.1 - T5.10 |
| **Stage 6** | End-to-End Workflow Validation & Edge Case Handling | T6.1 - T6.11 |
| **Stage 7** | Final Integration and User Acceptance Testing       | T7.1 - T7.10 |

---

## Important Note

This prompt contains **no code**. It is a design and implementation guide to be used by a developer (or an AI assistant with coding capabilities) to implement the "Record & Compare" feature. Each stage should be completed, tested, and approved before proceeding to the next. If context is lost at any point, refer to the "Context Recovery Information" section at the beginning of this document to re-establish the implementation state.
