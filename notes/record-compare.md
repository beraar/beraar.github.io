Here is the revised, production-ready `record-compare.md`. It incorporates all the recommended fixes, removes the volume meter/control entirely, and is explicitly structured so that **each stage is 100% self-contained**.

You can copy any stage, paste it into a new chat along with your `app.js` and `main.css` files, and the AI will have all the exact context and insertion points needed to implement it without context drift.

---

# Record & Compare Feature Implementation Plan

## Project Context

**Zabon** is a language-learning web app (vanilla HTML/CSS/JS, no frameworks).

- `app.js` is a single IIFE containing all logic, state, and UI rendering.
- `main.css` is a mobile-first, language-agnostic design system using CSS variables.
- The app supports 7 languages. Content is displayed in stacked language cells (`.language-cell`) inside item columns (`.item-column`).
- **Goal:** Implement a "Record & Compare" feature allowing users to record their voice speaking a specific text and compare it to the original TTS.
- **Privacy Default:** The feature is **OFF by default** and must be opted-in via Settings.

---

## Stage 1: Settings Flag, UI Toggle & Feature Detection

**Branch:** `feature/record-compare-settings`
**Objective:** Add a settings toggle to enable/disable the feature, with browser feature detection. Default state is OFF (privacy-first).

### Files to Modify

- `app.js`
- `main.css`

### Context for New Chat

_You are modifying `app.js`. The settings are normalized in `normalizeSettings()`. The settings UI is rendered in `renderSettings()`, which appends sections to `elements.settingsBody`. The `UI_STRINGS` object is defined near the top of the file._

### Code Changes

**1. Add UI Strings (Inside the `UI_STRINGS` object in `app.js`)**

```javascript
// Add these keys inside the UI_STRINGS object:
recordCompareTitle: { en: "Record & Compare", th: "บันทึกและเปรียบเทียบ", fa: "ضبط و مقایسه", ar: "تسجيل ومقارنة", es: "Grabar y Comparar", zh: "录音与比较", ja: "録音と比較" },
recordCompareToggle: { en: "Record & Compare", th: "บันทึกและเปรียบเทียบ", fa: "ضبط و مقایسه", ar: "تسجيل ومقارنة", es: "Grabar y Comparar", zh: "录音与比较", ja: "録音と比較" },
recordCompareUnsupported: { en: "Recording not supported in this browser.", th: "เบราว์เซอร์นี้ไม่รองรับการบันทึก", fa: "ضبط در این مرورگر پشتیبانی نمی‌شود.", ar: "التسجيل غير مدعوم في هذا المتصفح.", es: "Grabación no soportada en este navegador.", zh: "此浏览器不支持录音。", ja: "このブラウザでは録音をサポートしていません。" },
```

**2. Add Feature Detection & Settings Flag (In `app.js`)**

```javascript
// Add this function anywhere at the top level of the IIFE:
function isRecordingSupported() {
  return !!(
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia &&
    window.MediaRecorder
  );
}

// Modify normalizeSettings() to include the flag (Default: false for privacy):
function normalizeSettings(saved) {
  const s = saved || {};
  return {
    // ... existing settings ...
    recordCompareEnabled:
      typeof s.recordCompareEnabled === "boolean"
        ? s.recordCompareEnabled
        : false, // Default OFF
  };
}

// In init(), after settings are loaded and applied, enforce feature detection:
// Find the line: applyDocumentLanguage(); and add this right below it:
if (!isRecordingSupported()) {
  state.settings.recordCompareEnabled = false;
}
```

**3. Update Settings UI (In `renderSettings()` in `app.js`)**

```javascript
// Find the renderSettings() function. It currently looks like this:
// body.appendChild(renderSettingsLanguagesSection(lessonLangs));
// body.appendChild(renderRepeatSection());
// body.appendChild(renderSpeedSection());
// body.appendChild(renderFontSection());
// body.appendChild(renderVoicesSection());

// Replace it with this to insert the new Audio section above Voices:
function renderSettings() {
  const body = elements.settingsBody;
  body.innerHTML = "";
  const lessonLangs = currentLesson?.meta?.translations || registry.allCodes();

  body.appendChild(renderSettingsLanguagesSection(lessonLangs));
  body.appendChild(renderRepeatSection());
  body.appendChild(renderSpeedSection());
  body.appendChild(renderFontSection());

  // --- NEW: Audio Section ---
  body.appendChild(renderRecordCompareSection());

  body.appendChild(renderVoicesSection());
}

// Add this new function right below renderSettings():
function renderRecordCompareSection() {
  const section = document.createElement("div");
  section.className = "sheet-section";
  const title = document.createElement("h3");
  title.className = "sheet-section__title";
  title.textContent = t("recordCompareTitle");
  section.appendChild(title);

  const row = document.createElement("div");
  row.className = "sheet-field";

  const label = document.createElement("span");
  label.className = "voice-row__label";
  label.textContent = t("recordCompareToggle");

  const toggle = document.createElement("input");
  toggle.type = "checkbox";
  toggle.checked = state.settings.recordCompareEnabled;

  if (!isRecordingSupported()) {
    toggle.disabled = true;
    label.textContent += ` (${t("recordCompareUnsupported")})`;
    label.style.opacity = "0.6";
  } else {
    toggle.addEventListener("change", () => {
      state.settings.recordCompareEnabled = toggle.checked;
      saveState();
      renderCurrent(); // Re-render lesson to show/hide mic icons
    });
  }

  row.append(label, toggle);
  section.appendChild(row);
  return section;
}
```

**4. Add CSS (In `main.css`)**

```css
/* Add to the bottom of main.css */
.sheet-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}
.sheet-field input[type="checkbox"] {
  accent-color: var(--accent);
  width: 1.2rem;
  height: 1.2rem;
}
```

### Testing Plan

1. Open Settings. Verify "Record & Compare" section appears above "Voices".
2. Toggle it ON. Refresh page. Verify it stays ON.
3. Toggle it OFF. Refresh page. Verify it stays OFF.
4. (If testing in an unsupported browser/iframe) Verify toggle is disabled with unsupported message.

---

## Stage 2: Mic Icon Rendering in Lessons

**Branch:** `feature/record-compare-mic-icon`
**Objective:** Render a mic icon inside every visible language cell when the feature is enabled.

### Files to Modify

- `app.js`
- `main.css`

### Context for New Chat

_You are modifying `app.js`. The function `renderLanguageCell(item, code)` generates the HTML for each language text block. We need to append a mic button inside this cell. The global click handler is in `bindGlobalEvents()`._

### Code Changes

**1. Modify `renderLanguageCell()` (In `app.js`)**

```javascript
// Find the renderLanguageCell(item, code) function.
// At the very end of the function, right before `return cell;`, add this logic:

function renderLanguageCell(item, code) {
  // ... [existing code that builds the cell and text] ...

  // --- NEW: Append Mic Icon if feature is enabled ---
  if (state.settings.recordCompareEnabled && isRecordingSupported()) {
    const micBtn = document.createElement("button");
    micBtn.type = "button";
    micBtn.className = "record-mic";
    micBtn.innerHTML = "🎤";
    micBtn.dataset.action = "open-record-compare";
    micBtn.dataset.itemId = item.id;
    micBtn.dataset.lang = code;
    micBtn.setAttribute("aria-label", `Record ${code} pronunciation`);

    // Prevent the mic click from triggering the cell's speak-cell action
    micBtn.addEventListener("click", (e) => e.stopPropagation());

    cell.appendChild(micBtn);
  }

  return cell;
}
```

**2. Guard Lesson Playback Conflict (In `bindGlobalEvents` in `app.js`)**

```javascript
// Find the switch(action) statement inside the 'click' event listener in bindGlobalEvents().
// Find the case "speak-cell": block. Add a guard at the top of it:

case "speak-cell":
  // Prevent lesson playback if record panel is open
  if (typeof recordPanelState !== 'undefined' && recordPanelState.isOpen) return;
  startPlaybackFromCell(actionEl.dataset.itemId, actionEl.dataset.lang);
  break;
```

**3. Add CSS (In `main.css`)**

```css
/* Add to the bottom of main.css */
.record-mic {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-inline-start: 0.5rem;
  padding: 0.25rem;
  min-width: 2rem;
  min-height: 2rem;
  border: none;
  background: transparent;
  font-size: 1rem;
  cursor: pointer;
  opacity: 0.5;
  border-radius: 50%;
  transition:
    opacity 0.2s,
    background-color 0.2s;
  vertical-align: middle;
}
.record-mic:hover {
  opacity: 1;
  background-color: rgba(127, 127, 127, 0.1);
}
.record-mic:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

### Testing Plan

1. Turn feature ON in Settings. Open a lesson. Verify a 🎤 icon appears at the end of every text cell.
2. Turn feature OFF. Refresh. Verify icons are gone.
3. Click a language cell -> TTS plays. Click the 🎤 icon -> TTS does _not_ play (event stopped).
4. Verify keyboard focus can reach the mic icons.

---

## Stage 3: Record Panel UI Structure & Accessibility

**Branch:** `feature/record-compare-panel-structure`
**Objective:** Create the full-screen overlay panel DOM, handle focus trapping, and manage opening/closing.

### Files to Modify

- `app.js`
- `main.css`

### Context for New Chat

_We are building the UI shell for the panel. It will be dynamically injected into `document.body`. We need to define the initial state object and the render/close functions._

### Code Changes

**1. Add State & Panel Functions (In `app.js`)**

```javascript
// Add this state object at the top level of the IIFE (near other state variables):
let recordPanelState = {
  isOpen: false,
  itemId: null,
  lang: null,
  text: "",
  recordingBlob: null,
  status: "idle", // 'idle' | 'recording' | 'recorded' | 'playback' | 'finished' | 'error'
  errorType: null,
  micElement: null,
};

// Add these functions anywhere at the top level:
function renderRecordComparePanel(itemId, lang, micElement) {
  if (recordPanelState.isOpen) closeRecordPanel();

  const item = dataService.getItem(itemId);
  if (!item) return;

  const text = dataService.getText(item, lang);
  if (!text) return;

  recordPanelState = {
    isOpen: true,
    itemId,
    lang,
    text,
    recordingBlob: null,
    status: "idle",
    errorType: null,
    micElement: micElement,
  };

  // Pause any active lesson playback to prevent audio conflict
  if (typeof stopPlayback === "function") stopPlayback();

  const panel = document.createElement("div");
  panel.className = "record-panel";
  panel.id = "record-panel-root";
  panel.innerHTML = `
    <div class="record-panel__backdrop" data-action="close-record-panel"></div>
    <div class="record-panel__container" role="dialog" aria-label="${t("recordCompareTitle")}" aria-modal="true">
      <div class="record-panel__header">
        <h3 class="record-panel__title">${t("recordCompareTitle")}</h3>
        <button type="button" class="icon-button" data-action="close-record-panel" aria-label="Close">✕</button>
      </div>
      <div class="record-panel__body">
        <div class="record-panel__text" data-action="play-original-tts" dir="${registry.dir(lang)}" lang="${registry.bcp47(lang)}">
          ${text}
        </div>
        <div class="record-panel__instruction" aria-live="polite" aria-atomic="true">
          Compare your speech. Tap to record.
        </div>
        <button type="button" class="record-panel__button" data-action="toggle-record">
          🎤 Record
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(panel);
  updateRecordPanelUI();

  // Focus management
  const closeBtn = panel.querySelector('[data-action="close-record-panel"]');
  if (closeBtn) closeBtn.focus();
}

function closeRecordPanel() {
  const panel = document.getElementById("record-panel-root");
  if (panel) panel.remove();

  // Cleanup media
  if (typeof cleanupRecording === "function") cleanupRecording();
  if (typeof cleanupPlayback === "function") cleanupPlayback();

  const micElement = recordPanelState.micElement;

  // Reset state
  recordPanelState = {
    isOpen: false,
    itemId: null,
    lang: null,
    text: "",
    recordingBlob: null,
    status: "idle",
    errorType: null,
    micElement: null,
  };

  // Return focus
  if (micElement && typeof micElement.focus === "function") {
    micElement.focus();
  }
}

function updateRecordPanelUI() {
  const panel = document.getElementById("record-panel-root");
  if (!panel) return;

  const instruction = panel.querySelector(".record-panel__instruction");
  const button = panel.querySelector('[data-action="toggle-record"]');
  const textEl = panel.querySelector(".record-panel__text");

  if (!instruction || !button) return;

  // Map states to UI
  const uiMap = {
    idle: {
      text: "Compare your speech. Tap to record.",
      btn: "🎤 Record",
      disabled: false,
    },
    recording: {
      text: "Recording... Tap to stop.",
      btn: "⏹ Stop",
      disabled: false,
    },
    recorded: {
      text: "Recording complete. Tap to listen.",
      btn: "▶️ Listen",
      disabled: false,
    },
    playback: {
      text: "Playing original... Now your recording...",
      btn: "▶️ Playing...",
      disabled: true,
    },
    finished: {
      text: "Done. Tap to record again.",
      btn: "🎤 Record",
      disabled: false,
    },
    error: {
      text: t(recordPanelState.errorType || "recordCompareUnsupported"),
      btn: "🎤 Retry",
      disabled: false,
    },
  };

  const current = uiMap[recordPanelState.status] || uiMap.idle;
  instruction.textContent = current.text;
  button.textContent = current.btn;
  button.disabled = current.disabled;

  // Disable text clicking during playback
  if (textEl) {
    textEl.classList.toggle(
      "record-panel__text--disabled",
      recordPanelState.status === "playback",
    );
  }
}
```

**2. Add Global Event Handlers (In `bindGlobalEvents` in `app.js`)**

```javascript
// Inside the switch(action) in the click listener, add these cases:
case "open-record-compare":
  renderRecordComparePanel(actionEl.dataset.itemId, actionEl.dataset.lang, actionEl);
  break;
case "close-record-panel":
  closeRecordPanel();
  break;
case "toggle-record":
  if (typeof handleRecordPanelButtonClick === 'function') handleRecordPanelButtonClick();
  break;
case "play-original-tts":
  if (recordPanelState.status !== "playback" && recordPanelState.lang) {
    mediaService.speakText(recordPanelState.text, recordPanelState.lang);
  }
  break;

// Inside the keydown listener in bindGlobalEvents, add Escape handling:
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && recordPanelState.isOpen) {
    closeRecordPanel();
  }
  // ... existing Enter/Space logic ...
});
```

**3. Add CSS (In `main.css`)**

```css
/* Add to the bottom of main.css */
.record-panel {
  position: fixed;
  inset: 0;
  z-index: 100; /* Above settings sheet (60) */
  display: flex;
  align-items: center;
  justify-content: center;
}
.record-panel__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
}
.record-panel__container {
  position: relative;
  max-width: 480px;
  width: 90%;
  max-height: 80vh;
  padding: 1.5rem;
  background: var(--surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow);
  overflow-y: auto;
  z-index: 1;
}
.record-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.record-panel__title {
  margin: 0;
  font-size: 1.2rem;
}
.record-panel__text {
  padding: 1rem;
  margin: 0.5rem 0 1rem 0;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  font-size: 1.1rem;
  cursor: pointer;
  line-height: 1.6;
}
.record-panel__text:hover:not(.record-panel__text--disabled) {
  border-color: var(--accent);
}
.record-panel__text--disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
.record-panel__instruction {
  color: var(--muted);
  margin: 0.5rem 0 1.5rem 0;
  text-align: center;
  min-height: 2.5rem;
  font-size: 1rem;
}
.record-panel__button {
  display: block;
  width: 100%;
  min-height: 3.5rem;
  padding: 0.75rem;
  font-size: 1.2rem;
  border: 2px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--surface);
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s;
}
.record-panel__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.record-panel__button:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}
```

### Testing Plan

1. Click a mic icon. Panel opens. Focus is on the Close (✕) button.
2. Click the text -> TTS plays.
3. Press `Escape` or click backdrop -> Panel closes, focus returns to the mic icon.
4. Verify panel is above all other UI elements (z-index 100).

---

## Stage 4: Panel State Management & UI Flow

**Branch:** `feature/record-compare-panel-state`
**Objective:** Implement the strict state machine to control UI transitions and button clicks.

### Files to Modify

- `app.js`

### Context for New Chat

_We are wiring up the logic for the "Record/Stop/Listen" button. The UI updates via `updateRecordPanelUI()`. We need to define valid state transitions to prevent UI bugs._

### Code Changes

**1. Add State Machine Logic (In `app.js`)**

```javascript
// Add these constants and functions at the top level:
const RECORD_STATES = {
  IDLE: "idle",
  RECORDING: "recording",
  RECORDED: "recorded",
  PLAYBACK: "playback",
  FINISHED: "finished",
  ERROR: "error",
};

function setRecordPanelState(newState, errorType = null) {
  // Define valid transitions
  const validTransitions = {
    [RECORD_STATES.IDLE]: [RECORD_STATES.RECORDING, RECORD_STATES.ERROR],
    [RECORD_STATES.RECORDING]: [RECORD_STATES.RECORDED, RECORD_STATES.ERROR],
    [RECORD_STATES.RECORDED]: [
      RECORD_STATES.PLAYBACK,
      RECORD_STATES.IDLE,
      RECORD_STATES.ERROR,
    ],
    [RECORD_STATES.PLAYBACK]: [
      RECORD_STATES.FINISHED,
      RECORD_STATES.ERROR,
      RECORD_STATES.IDLE,
    ], // IDLE added for panel close
    [RECORD_STATES.FINISHED]: [
      RECORD_STATES.IDLE,
      RECORD_STATES.RECORDING,
      RECORD_STATES.ERROR,
    ],
    [RECORD_STATES.ERROR]: [RECORD_STATES.IDLE, RECORD_STATES.RECORDING],
  };

  const allowed = validTransitions[recordPanelState.status] || [];
  if (!allowed.includes(newState) && newState !== recordPanelState.status) {
    console.warn(
      `Invalid state transition: ${recordPanelState.status} → ${newState}`,
    );
    return;
  }

  recordPanelState.status = newState;
  if (errorType) recordPanelState.errorType = errorType;
  updateRecordPanelUI();
}

function handleRecordPanelButtonClick() {
  try {
    switch (recordPanelState.status) {
      case RECORD_STATES.IDLE:
      case RECORD_STATES.FINISHED:
      case RECORD_STATES.ERROR:
        if (isRecordingSupported()) {
          if (typeof startRecording === "function") startRecording();
        } else {
          setRecordPanelState(RECORD_STATES.ERROR, "recordCompareUnsupported");
        }
        break;
      case RECORD_STATES.RECORDING:
        if (typeof stopRecording === "function") stopRecording();
        break;
      case RECORD_STATES.RECORDED:
        if (typeof startPlayback === "function") startPlayback();
        break;
      default:
        break;
    }
  } catch (error) {
    console.error("Record panel error:", error);
    setRecordPanelState(RECORD_STATES.ERROR, "recordCompareUnsupported");
  }
}
```

### Testing Plan

1. Open panel. State is `idle`. Button says "Record".
2. Click Record. (Will fail in next stages, but state should attempt to change).
3. Verify console doesn't throw errors for invalid transitions.
4. Verify clicking the text while in `idle` state plays TTS.

---

## Stage 5: Audio Capture Implementation

**Branch:** `feature/record-compare-audio-capture`
**Objective:** Implement microphone access, `MediaRecorder` logic, and proper cleanup.

### Files to Modify

- `app.js`
- `main.css`

### Context for New Chat

_We are implementing the actual browser recording APIs. We need to handle permissions, MIME types, and stream cleanup._

### Code Changes

**1. Add Recording Functions (In `app.js`)**

```javascript
// Add these variables and functions at the top level:
let mediaRecorder = null;
let recordedChunks = [];
let mediaStream = null;
let recordingTimer = null;

function getBestMimeType() {
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return "";
}

async function startRecording() {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    const audioTrack = mediaStream.getAudioTracks()[0];
    if (!audioTrack) throw new Error("No audio track");

    mediaRecorder = new MediaRecorder(mediaStream, {
      mimeType: getBestMimeType(),
    });
    recordedChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) recordedChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const mimeType = mediaRecorder.mimeType || "audio/webm";
      const blob = new Blob(recordedChunks, { type: mimeType });
      recordPanelState.recordingBlob = blob;
      setRecordPanelState(RECORD_STATES.RECORDED);
      cleanupRecording(); // Clean up streams, keep blob
    };

    mediaRecorder.onerror = () => {
      setRecordPanelState(RECORD_STATES.ERROR, "recordCompareUnsupported");
      cleanupRecording();
    };

    mediaRecorder.start(100);
    setRecordPanelState(RECORD_STATES.RECORDING);

    // 60-second safety timeout
    recordingTimer = setTimeout(() => {
      if (recordPanelState.status === RECORD_STATES.RECORDING) {
        stopRecording();
      }
    }, 60000);
  } catch (error) {
    console.error("Recording start error:", error);
    cleanupRecording();
    setRecordPanelState(RECORD_STATES.ERROR, "recordCompareUnsupported");
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
  }
  cleanupRecording();
}

function cleanupRecording() {
  if (recordingTimer) {
    clearTimeout(recordingTimer);
    recordingTimer = null;
  }
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }
  mediaRecorder = null;
}
```

**2. Add CSS for Recording State (In `main.css`)**

```css
/* Add to main.css */
.record-panel__button.recording {
  border-color: var(--danger);
  color: var(--danger);
  animation: pulse-recording 1.5s infinite;
}
@keyframes pulse-recording {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}
```

_Note: In `updateRecordPanelUI()` from Stage 3, add this line inside the function to apply the CSS class:_

```javascript
// Inside updateRecordPanelUI(), after setting button.textContent:
button.classList.toggle(
  "recording",
  recordPanelState.status === RECORD_STATES.RECORDING,
);
```

### Testing Plan

1. Click Record. Browser prompts for mic permission. Allow.
2. Button changes to "Stop" and pulses red.
3. Speak for 3 seconds. Click Stop.
4. Button changes to "Listen". State is `recorded`.
5. Deny permission -> Error state shows.
6. Verify mic indicator in browser tab turns off after stopping.

---

## Stage 6: Playback Sequence & Memory Management

**Branch:** `feature/record-compare-playback`
**Objective:** Implement the TTS -> Pause -> User Recording playback sequence, and fix blob lifecycle.

### Files to Modify

- `app.js`

### Context for New Chat

_We are chaining the original TTS and the user's recorded audio. Crucially, we must NOT destroy the recorded blob after the first playback, allowing the user to re-listen or re-record._

### Code Changes

**1. Add Playback Functions (In `app.js`)**

```javascript
// Add these variables and functions at the top level:
let playbackAudio = null;

function startPlayback() {
  setRecordPanelState(RECORD_STATES.PLAYBACK);
  const { text, lang, recordingBlob } = recordPanelState;

  if (!recordingBlob) {
    setRecordPanelState(RECORD_STATES.ERROR, "recordCompareUnsupported");
    return;
  }

  // Step 1: Play original TTS
  mediaService.speakText(text, lang, {
    onEnd: () => {
      // Step 2: 500ms pause, then play user recording
      setTimeout(() => playUserRecording(recordingBlob), 500);
    },
    onError: () => {
      // Fallback: if TTS fails, still play user recording
      setTimeout(() => playUserRecording(recordingBlob), 500);
    },
  });
}

function playUserRecording(blob) {
  try {
    const audioUrl = URL.createObjectURL(blob);
    playbackAudio = new Audio(audioUrl);

    playbackAudio.onended = () => {
      URL.revokeObjectURL(audioUrl); // Clean up temporary URL
      cleanupPlayback();
      setRecordPanelState(RECORD_STATES.FINISHED);
    };

    playbackAudio.onerror = () => {
      URL.revokeObjectURL(audioUrl);
      cleanupPlayback();
      setRecordPanelState(RECORD_STATES.ERROR, "recordCompareUnsupported");
    };

    playbackAudio.play();
  } catch (error) {
    console.error("Playback error:", error);
    cleanupPlayback();
    setRecordPanelState(RECORD_STATES.ERROR, "recordCompareUnsupported");
  }
}

function cleanupPlayback() {
  if (playbackAudio) {
    playbackAudio.pause();
    playbackAudio.src = ""; // Releases memory
    playbackAudio = null;
  }
  // NOTE: Do NOT nullify recordPanelState.recordingBlob here!
  // The blob must survive so the user can click "Listen" again or re-record.
}
```

**2. Update `closeRecordPanel()` (In `app.js`)**

```javascript
// Find the closeRecordPanel() function from Stage 3.
// Ensure it explicitly clears the blob when the panel is fully closed:

function closeRecordPanel() {
  // ... existing DOM removal and state reset ...

  // Ensure blob is cleared from memory when panel closes
  if (recordPanelState.recordingBlob) {
    recordPanelState.recordingBlob = null;
  }

  // ... rest of existing close logic ...
}
```

### Testing Plan

1. Record a sentence. Stop. Click "Listen".
2. Verify original TTS plays first.
3. Verify 500ms pause, then user recording plays.
4. After playback finishes, button says "Record" (State: `finished`).
5. Click "Listen" again (if you temporarily change state back to `recorded` in dev tools, or just click Record to overwrite). _Correction: In `finished` state, clicking the button triggers `startRecording()`. This is correct._
6. Close panel. Verify no memory leaks in Chrome DevTools (Memory tab).

---

## Stage 7: Polish, Edge Cases & Integration

**Branch:** `feature/record-compare-polish`
**Objective:** Handle iOS Safari quirks, dark mode, and final integration checks.

### Files to Modify

- `app.js`
- `main.css`

### Context for New Chat

_Final polish. iOS Safari requires user gestures for audio playback and has quirks with MediaRecorder. We also need to ensure dark mode colors are correct._

### Code Changes

**1. iOS Safari Audio Quirk (In `playUserRecording` in `app.js`)**

```javascript
// Find the playUserRecording(blob) function from Stage 6.
// Modify the Audio creation to include playsInline for iOS:

function playUserRecording(blob) {
  try {
    const audioUrl = URL.createObjectURL(blob);
    playbackAudio = new Audio(audioUrl);
    playbackAudio.playsInline = true; // Crucial for iOS Safari
    playbackAudio.preload = "auto";

    // ... rest of existing onended/onerror/play logic ...
```

**2. Dark Mode Verification (In `main.css`)**

```css
/* Add to main.css. The existing CSS variables should handle most of it, 
   but we need to ensure the recording red color is visible in dark mode. */

:root[data-theme="dark"] .record-panel__button.recording {
  border-color: #ff6666;
  color: #ff6666;
}

:root[data-theme="dark"] .record-panel__container {
  background: var(--surface);
  border: 1px solid var(--line);
}
```

**3. Error Recovery (In `handleRecordPanelButtonClick` in `app.js`)**

```javascript
// If the user hits an error state, allow them to retry by clicking the button.
// In handleRecordPanelButtonClick(), ensure the ERROR case routes to startRecording:

case RECORD_STATES.ERROR:
  // Reset to idle first to allow clean transition to recording
  recordPanelState.status = RECORD_STATES.IDLE;
  if (isRecordingSupported()) {
    startRecording();
  }
  break;
```

### Testing Plan

1. **iOS Safari:** Test recording and playback on an actual iPhone/iPad. Verify audio plays without requiring the screen to be unlocked or going to fullscreen.
2. **Dark Mode:** Toggle to Dark Mode. Open panel. Verify text, borders, and the red recording pulse are clearly visible.
3. **Error Recovery:** Deny mic permission. Click the "Retry" button. Verify it prompts for permission again or shows the error cleanly.
4. **Integration:** Open a lesson. Play lesson TTS. Open Record panel. Verify lesson TTS stops. Close panel. Verify lesson TTS doesn't auto-resume (clean state).

---

## Summary of Architecture Decisions

1. **Privacy First:** Feature is OFF by default. No background recording.
2. **Memory Safety:** Blobs are kept alive during the panel session for re-listening, but strictly revoked when the panel closes. Object URLs are cleaned up immediately after audio playback.
3. **Playback Isolation:** Opening the panel halts the main lesson playback engine to prevent audio overlap and state corruption.
4. **State Machine:** Strict transition map prevents UI desync (e.g., trying to stop when not recording).
