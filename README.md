# 🌅 Aura Companion

A premium, local-first, offline-capable language learning and vocal synthesis desktop companion. Aura Companion is designed to provide a sensory-rich, highly focused environment for translating, speaking, and mastering new languages. It features a gorgeous **Sunny Mid-Century Modernist Pastel design**, responsive real-time audio visualization, offline high-quality speaker selection, and built-in mindfulness focus tools.

---

## 🎨 The Design Philosophy: Mid-Century Modernist Glassmorphism

Aura Companion breaks away from traditional clinical software interfaces, taking visual cues from warm mid-century poolside design, crisp organic color-blocking, and modern translucent glassmorphism.

*   **Scenic Backdrop:** A high-resolution modernist architectural pool scene, enriched with soft palm shadow overlays.
*   **Bento Grid Layout:** Fully responsive layout with sleek translucent glass bento cards:
    *   🌿 **Input Card (Mint Green):** Saturated deep forest headers layered over a crisp, frosted mint background.
    *   ☀️ **Output Card (Sunshine Yellow):** Rich mustard-olive fonts on a radiant pastel yellow base.
    *   🍑 **Download Center (Warm Coral):** Burnt sienna typography styled over a warm peach gradient.
    *   🟣 **Hero Banner (Lilac/Plum):** Elegant saturated lavender cards housing high-fidelity navigation and toggles.
*   **Interactive Control Row:** Bespoke rounded pill selector buttons (featuring custom SVGs for translation networks and globe icons), circular coral playback buttons, and responsive speed badge toggles.

---

## 🚀 Key Features & Architectural Highlights

### 1. Offline-First Vocal Synthesis & Multiple Spanish Speakers
Aura Companion supports zero-latency, high-fidelity offline voice models. It is equipped with four pre-cached, offline-ready Spanish voice models representing Spain and Latin American accents:
*   **Spanish (Mexico) - Claude (High Q):** High-quality, highly expressive Mexican accent (`es_MX-claude-high.onnx`).
*   **Spanish (Mexico) - Ald:** Medium-quality standard Mexican accent (`es_MX-ald-medium.onnx`).
*   **Spanish (Spain) - Davefx:** Standard Iberian/Castilian accent (`es_ES-davefx-medium.onnx`).
*   **Spanish (Spain) - Sharvard:** Standard Iberian/Castilian accent (`es_ES-sharvard-medium.onnx`).

### 2. Precise Event-Driven Playback Control
Audio states are perfectly synchronized with the underlying HTML5 audio engine:
*   **True Resumption:** Pausing and playing resumes playback **exactly from the millisecond you left off**, eliminating overlap or starting over from the beginning.
*   **Audio Graph Synchronization:** Audio contexts are asynchronously re-synchronized on play events, bypassing system interruptions or silent state rejection.
*   **Visualizer Cache-Busting:** Modifying translation text or switching speakers instantly resets cache registers to immediately synthesize and play the fresh text.

### 3. Expanded Focus Mode & Floating Vibe Deck
Toggling the Aesthetic Download Center (via the **Hero Toggle Button**, or **Ctrl + H** / **Ctrl + Shift + D**) initiates a fluid flex-grid transition. The side column contracts gracefully, stretching the primary workspace. While in **Expanded Mode**, a floating **Ambient Vibe Deck** slides in to let you morph the application across three premium design aesthetics:
1.  🌊 **Azure Breeze:** The default soothing mint-green pool theme.
2.  🌅 **Sunrise Glow:** A warm, sun-kissed peach, coral, and gold palette.
3.  🌴 **Midnight Palm:** A dark, twilight-cyber scheme featuring deep purples, lavenders, and neon accents.

### 4. Zen Focus Coach & Ocean Wave Synthesizer
Designed to reduce cognitive load during learning:
*   🧘‍♀️ **Breathing Pacer:** A beautiful bioluminescent ring that pulses in a calm 12-second cycle (4s Inhale, 4s Hold, 4s Exhale).
*   💭 **Motivating Affirmations:** Dynamically updates positive affirmations and focus quotes at the end of each exhale cycle.
*   🌊 **Binaural Ocean Soundscape:** Synthesizes realistic, peaceful ocean wave swells completely offline using the **native Web Audio API**. It leverages detuned low-frequency triangle oscillators (110Hz and 110.6Hz) to create a warm choral drone, modulated by a 12-second LFO sweep filter.

### 5. Multi-Way Synced Speed Controls
Adjust playback speeds from $0.5\times$ to $2.0\times$ with four fully synchronized input channels:
*   Interactive **Range Slider**
*   Polished **Dropdown Select**
*   Responsive **Visual Speed Badge**
*   **Keyboard Shortcuts:** `Shift + >` to speed up, `Shift + <` to slow down.

---

## 🛠️ Technology Stack

*   **Frontend:** HTML5 (Semantic Structure), Vanilla CSS (Custom Variable Tokens & Transitions), TypeScript (Vite Bundler).
*   **System Backend:** Tauri (Rust core, system-native OS windowing, WebView2 context bindings).
*   **Audio Engine:** HTML5 Web Audio API, Web Speech API integration, offline ONNX Runtime synthesis.

---

## 💻 Technical Setup & Development

To run, build, or customize the application locally, you will need **Node.js** and **Rust/Cargo** installed on your system.

### Installation
Clone the repository, navigate to the directory, and install dependencies:
```bash
npm install
```

### Run in Web Development Server
To preview the web frontend in your browser with hot module replacement (HMR):
```bash
npm run dev
```

### Run in Desktop Development Mode
To run the Tauri app in windowed developer mode with full system bindings:
```bash
npm run tauri dev
```

### Build Standalone Executables
To compile the production bundles and generate optimized native installers (`.exe` and NSIS setups):
```bash
npm run tauri build
```
The build artifacts will be generated in `src-tauri/target/release/`.

---

## 📦 Desktop Artifacts (Pre-Compiled)
For convenience, pre-compiled standalone versions are deployed directly onto your Desktop:
*   **`Aura Companion.exe`:** A portable standalone executable. Double-click to run instantly.
*   **`Aura Companion Setup.exe`:** Standard installer for permanent desktop shortcut integration.
