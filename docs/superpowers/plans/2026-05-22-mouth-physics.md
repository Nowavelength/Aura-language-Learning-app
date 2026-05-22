# Mouth Physics View & Articulatory Coach Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a real-time, high-fidelity Mouth Physics View (Articulatory Speech Coach) that morphs anatomically and visualizes vocal tract acoustics in Tauri WebView2 at 60FPS.

**Architecture:** Create a dual-tabbed layout inside the Zen card. Tab 1 hosts the Breathing Pacer; Tab 2 hosts the Articulatory Coach. The articulatory coach morphs a 200x200 sagittal SVG in real-time using control point linear interpolation and simulates 27Hz myoelastic-aerodynamic trills alongside a 44-segment splined Pink Trombone waveguide canvas, automatically triggered by TTS playback phoneme analysis.

**Tech Stack:** Vanilla HTML5, CSS3 transitions, TypeScript, Web Audio API.

---

### Task 1: Tabbed Interface Markup & Structure

**Files:**
- Modify: `index.html` (lines 200-238)

- [ ] **Step 1: Polish `.zen-focus-card` with sliding tab button bar and panels**
  Replace lines 200 to 238 in `index.html` with:
  ```html
  <div class="bento-card zen-focus-card">
    <div class="card-header">
      <div class="zen-header-left">
        <h3>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="display:inline-block; vertical-align:middle; margin-right:6px;">
            <path d="M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9zm0 16a7 7 0 1 1 7-7 7 7 0 0 1-7 7z"/>
            <path d="M12 6a6 6 0 1 0 6 6 6 6 0 0 0-6-6zm0 10.5a4.5 4.5 0 1 1 4.5-4.5 4.5 4.5 0 0 1-4.5 4.5z"/>
          </svg>
          Zen Immersive Coach
        </h3>
      </div>
      
      <!-- Sliding Tab Bar -->
      <div class="zen-tab-bar">
        <button id="tab-btn-breathing" class="zen-tab-btn active" data-tab="breathing">Breathing</button>
        <button id="tab-btn-speech" class="zen-tab-btn" data-tab="speech">Mouth Physics</button>
      </div>

      <div class="soundscape-toggle-wrapper">
        <span class="soundscape-label">Ambient Soundscape</span>
        <button id="zen-sound-btn" class="toggle-switch-btn" title="Toggle serene background synthesizer tone">
          <span class="toggle-switch-handle"></span>
        </button>
      </div>
    </div>

    <!-- Panel 1: Breathing Coach (Active) -->
    <div class="zen-panel active" id="zen-panel-breathing" data-panel="breathing">
      <div class="zen-coach-workspace">
        <div class="breathing-circle-container">
          <div class="breathing-circle" id="breathing-circle">
            <div class="pulse-ring"></div>
            <span class="breathing-prompt" id="breathing-prompt">Inhale</span>
          </div>
        </div>

        <div class="zen-coach-details">
          <h4>Breathing Mastery Pacer</h4>
          <p class="zen-sub-guidance">Breathe in sync with the circle's rhythm. Clear your mind, focus on the phonetics, and speak during the exhale phase.</p>
          
          <div class="zen-quote-container">
            <span class="quote-symbol">“</span>
            <p id="zen-quote">El aprendizaje es un tesoro que seguirá a su dueño a todas partes.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel 2: Mouth Physics / Articulatory Coach (Hidden) -->
    <div class="zen-panel" id="zen-panel-speech" data-panel="speech">
      <div class="zen-coach-workspace speech-coach-workspace">
        <!-- Visual Workspace Container -->
        <div class="speech-visualizer-container">
          <!-- Sagittal Profile SVG View -->
          <div class="speech-view-active" id="speech-svg-wrapper">
            <svg id="sagittal-svg" viewBox="0 0 200 200" width="100%" height="100%">
              <!-- Static Palate, Ridge, back wall, and jaw -->
              <path id="svg-back-wall" d="M 18 50 Q 12 80 14 120 Q 16 150 18 165" class="sagittal-static-line" />
              <path id="svg-hard-palate" d="M 60 42 Q 90 30 120 30 Q 135 30 148 38" class="sagittal-static-line" />
              <path id="svg-alveolar" d="M 140 38 Q 148 34 155 38 Q 158 42 155 46" class="sagittal-static-line" />
              <path id="svg-jaw-outline" d="M 162 130 Q 160 155 140 165 Q 110 175 70 174 Q 40 173 25 162 Q 15 150 18 130" class="sagittal-static-line" />
              <path id="svg-nasal-cavity" d="M 30 10 Q 80 8 130 15 Q 145 18 155 28 Q 160 35 150 42 Q 120 48 70 46 Q 35 46 25 38 Q 18 30 30 10 Z" class="sagittal-nasal-line" />
              
              <!-- Morphing Velum -->
              <path id="svg-velum" d="M 60 42 Q 50 55 40 70 Q 32 88 28 105 Q 26 118 28 130" class="sagittal-morph-line" />
              
              <!-- Morphing Tongue -->
              <path id="svg-tongue" d="M 20 140 Q 40 135 70 128 Q 100 122 120 115 Q 138 108 148 105 Q 154 103 157 100 Q 155 96 152 95 Q 140 98 125 104 Q 100 112 70 118 Q 42 124 20 128 Z" class="sagittal-tongue" />
              <circle id="svg-tongue-tip-marker" cx="0" cy="0" r="4" class="hidden-marker" />
              
              <!-- Morphing Lips -->
              <path id="svg-lips" d="M 60 98 Q 80 90 100 90 Q 120 90 140 98 Q 130 112 100 114 Q 70 112 60 98 Z" class="sagittal-lips" />

              <!-- Symmetrical airflow glowing dots/vectors pulsing from glottis to lips -->
              <path id="svg-airflow-oral" d="M 22 125 Q 60 115 100 105 Q 140 95 170 95" class="airflow-vector" />
              <path id="svg-airflow-nasal" d="M 45 80 Q 80 40 120 38 Q 145 42 155 35" class="airflow-vector nasal" />
            </svg>
          </div>

          <!-- Acoustic Waveguide Canvas View -->
          <div class="speech-view-hidden" id="speech-waveguide-wrapper">
            <canvas id="waveguide-canvas"></canvas>
          </div>
          
          <!-- View switcher pill overlay -->
          <div class="speech-view-switcher">
            <button id="view-btn-sagittal" class="view-switch-btn active" data-view="sagittal">Sagittal View</button>
            <button id="view-btn-waveguide" class="view-switch-btn" data-view="waveguide">Acoustic Tube</button>
          </div>
        </div>

        <!-- Mechanics Info Bento Widget -->
        <div class="zen-coach-details speech-coach-details">
          <div class="phonetics-headline-row">
            <h4 id="speech-sound-title">Resting Vocal State</h4>
            <span class="phonetic-ipa-badge" id="speech-sound-ipa">/ə/</span>
          </div>
          <p class="zen-sub-guidance" id="speech-sound-desc">Breathe gently. When you play a translation, the speech coach will animate the exact muscle movements and sound wave parameters of spoken words in real time.</p>
          
          <div class="zen-quote-container speech-metrics-grid">
            <div class="metric-pill">
              <span class="metric-label">Airflow:</span>
              <span class="metric-value" id="metric-airflow">Oral Stream</span>
            </div>
            <div class="metric-pill">
              <span class="metric-label">Velum:</span>
              <span class="metric-value" id="metric-velum">Sealed (Oral)</span>
            </div>
            <div class="metric-pill">
              <span class="metric-label">Flutter:</span>
              <span class="metric-value" id="metric-flutter">Inactive</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  ```

---

### Task 2: Tab Bar & Speech Coach Panel Styling

**Files:**
- Modify: `src/styles.css` (appended to end)

- [ ] **Step 1: Add style selectors for sliding tabs, panels, SVG anatomy, and canvas**
  Append these styles to `src/styles.css`:
  ```css
  /* Speech Coach Sliding Tab Deck */
  .zen-tab-bar {
    display: flex;
    background: rgba(255, 255, 255, 0.45);
    border: 1px solid rgba(255, 255, 255, 0.6);
    border-radius: 16px;
    padding: 0.25rem;
    gap: 0.15rem;
    margin-right: auto;
    margin-left: 1.5rem;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.02);
  }

  .zen-tab-btn {
    background: transparent;
    border: none;
    border-radius: 12px;
    color: var(--zen-text, #5A2A42);
    font-family: var(--font-inter);
    font-size: 0.72rem;
    font-weight: 700;
    padding: 0.35rem 0.85rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .zen-tab-btn:hover {
    background: rgba(255, 255, 255, 0.4);
  }

  .zen-tab-btn.active {
    background: var(--vibe-active-bg, #FF6F61);
    color: #FFFFFF !important;
    box-shadow: 0 2px 6px var(--vibe-active-shadow, rgba(255, 111, 97, 0.2));
  }

  /* Dual Panel Control */
  .zen-panel {
    display: none;
    opacity: 0;
    transform: translateY(8px);
    width: 100%;
    flex: 1;
    transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .zen-panel.active {
    display: flex;
    opacity: 1;
    transform: translateY(0);
  }

  .speech-coach-workspace {
    gap: 2.25rem !important;
  }

  /* Visual Container Workspace */
  .speech-visualizer-container {
    flex: 0 0 220px;
    height: 220px;
    background: rgba(255, 255, 255, 0.55);
    border: 1px solid rgba(255, 255, 255, 0.65);
    border-radius: 20px;
    box-shadow: 
      0 8px 24px rgba(92, 92, 111, 0.05),
      inset 0 1px 3px rgba(0, 0, 0, 0.01);
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .speech-view-active {
    width: 100%;
    height: 100%;
    display: block;
    opacity: 1;
    transition: opacity 0.4s ease;
  }

  .speech-view-hidden {
    width: 100%;
    height: 100%;
    display: none;
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  #waveguide-canvas {
    width: 100%;
    height: 100%;
    display: block;
  }

  /* View Switcher pill overlay */
  .speech-view-switcher {
    position: absolute;
    bottom: 0.65rem;
    display: flex;
    background: rgba(255, 255, 255, 0.65);
    border: 1px solid rgba(255, 255, 255, 0.85);
    border-radius: 14px;
    padding: 0.15rem;
    gap: 0.1rem;
    backdrop-filter: blur(8px);
    z-index: 10;
    box-shadow: 0 3px 8px rgba(0,0,0,0.03);
  }

  .view-switch-btn {
    background: transparent;
    border: none;
    border-radius: 10px;
    font-family: var(--font-inter);
    font-size: 0.62rem;
    font-weight: 800;
    color: var(--zen-muted, #7A5366);
    padding: 0.25rem 0.65rem;
    cursor: pointer;
    transition: all 0.25s ease;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .view-switch-btn.active {
    background: rgba(255, 255, 255, 0.95);
    color: var(--vibe-active-bg, #FF6F61);
    box-shadow: 0 2px 4px rgba(0,0,0,0.04);
  }

  /* Sagittal SVG Anatomy Styling */
  .sagittal-static-line {
    fill: none;
    stroke: var(--zen-text, #5A2A42);
    stroke-width: 2.5;
    stroke-linecap: round;
    opacity: 0.85;
  }

  .sagittal-nasal-line {
    fill: rgba(46, 196, 182, 0.04);
    stroke: var(--zen-muted, #7A5366);
    stroke-width: 1.25;
    stroke-dasharray: 4,4;
    stroke-linecap: round;
    opacity: 0.6;
  }

  .sagittal-morph-line {
    fill: none;
    stroke: var(--vibe-active-bg, #FF6F61);
    stroke-width: 2.25;
    stroke-linecap: round;
    transition: stroke 0.6s ease;
  }

  .sagittal-tongue {
    fill: rgba(255, 111, 97, 0.12);
    stroke: #FF6F61;
    stroke-width: 2.75;
    stroke-linecap: round;
  }

  .sagittal-lips {
    fill: rgba(255, 95, 85, 0.16);
    stroke: #FE5F55;
    stroke-width: 2.5;
    stroke-linecap: round;
  }

  .hidden-marker {
    display: none;
    fill: #2EC4B6;
    stroke: #FFFFFF;
    stroke-width: 1.5;
    box-shadow: 0 0 8px #2EC4B6;
  }

  .hidden-marker.active {
    display: block;
  }

  /* Airflow vectors glowing pulses */
  .airflow-vector {
    fill: none;
    stroke: #FFA07A;
    stroke-width: 2.25;
    stroke-linecap: round;
    stroke-dasharray: 6, 18;
    opacity: 0;
    pointer-events: none;
  }

  .airflow-vector.nasal {
    stroke: #2EC4B6;
  }

  .airflow-vector.active {
    opacity: 0.85;
    animation: airflowPulse 1.2s linear infinite;
  }

  @keyframes airflowPulse {
    0% {
      stroke-dashoffset: 0;
    }
    100% {
      stroke-dashoffset: -24;
    }
  }

  /* Mechanics Info Widgets */
  .speech-coach-details {
    align-self: center;
  }

  .phonetics-headline-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .phonetic-ipa-badge {
    background: rgba(255, 111, 97, 0.15);
    border: 1px solid rgba(255, 111, 97, 0.25);
    border-radius: 8px;
    padding: 0.15rem 0.55rem;
    font-size: 0.82rem;
    font-weight: 700;
    color: #FF6F61;
    font-family: var(--font-inter);
  }

  .speech-metrics-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.65rem;
    padding: 0.65rem !important;
  }

  .metric-pill {
    background: rgba(255, 255, 255, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.6);
    border-radius: 10px;
    padding: 0.4rem 0.55rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.15rem;
  }

  .metric-label {
    font-size: 0.58rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 800;
    color: var(--zen-muted, #7A5366);
  }

  .metric-value {
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--zen-text, #5A2A42);
    text-align: center;
  }
  ```

---

### Task 3: Articulatory Morphing Engine implementation

**Files:**
- Modify: `src/main.ts` (inserted into middle section, e.g. line 1634)

- [ ] **Step 1: Set up state variables and morph targets in `src/main.ts`**
  Insert these constants and weight definitions before the breathing loop section in `src/main.ts`:
  ```typescript
  // ============================================================================
  // MOUTH PHYSICS ARTICULATORY COORDINATES & PARAMETERS
  // ============================================================================

  // Canonical paths in SVG 200x200 space
  const SHAPE_VELUM_RAISED = "M 60 42 Q 50 55 40 70 Q 32 88 28 105 Q 26 118 28 130";
  const SHAPE_VELUM_LOWERED = "M 60 42 Q 48 58 36 75 Q 26 92 24 110 Q 23 122 26 132";

  const SHAPE_TONGUE_NEUTRAL = "M 20 140 Q 40 135 70 128 Q 100 122 120 115 Q 138 108 148 105 Q 154 103 157 100 Q 155 96 152 95 Q 140 98 125 104 Q 100 112 70 118 Q 42 124 20 128 Z";
  const SHAPE_TONGUE_FRONT_I = "M 20 150 Q 42 145 68 136 Q 92 126 112 110 Q 128 96 138 78 Q 142 70 148 64 Q 152 60 155 62 Q 157 66 154 72 Q 146 84 136 98 Q 118 118 96 132 Q 72 146 42 154 Q 28 157 20 156 Z";
  const SHAPE_TONGUE_BACK_U = "M 20 148 Q 38 148 58 145 Q 78 140 92 130 Q 104 118 108 102 Q 110 88 108 76 Q 106 66 102 62 Q 96 58 90 62 Q 84 70 82 82 Q 80 96 76 108 Q 68 124 52 136 Q 38 144 20 148 Z";
  const SHAPE_TONGUE_TRILL_CONTACT = "M 20 145 Q 42 140 68 133 Q 95 124 118 114 Q 135 106 145 96 Q 150 88 152 82 Q 154 76 155 72 Q 156 68 155 66 Q 152 64 148 66 Q 144 68 140 74 Q 134 82 130 90 Q 120 104 105 112 Q 88 122 64 130 Q 44 136 20 140 Z";

  const SHAPE_LIPS_NEUTRAL = "M 60 98 Q 80 90 100 90 Q 120 90 140 98 Q 130 112 100 114 Q 70 112 60 98 Z";
  const SHAPE_LIPS_SPREAD_I = "M 44 36 Q 66 30 100 30 Q 134 30 156 36 Q 134 42 100 42 Q 66 42 44 36 Z";
  const SHAPE_LIPS_ROUNDED_U = "M 75 90 Q 85 75 100 75 Q 115 75 125 90 Q 115 105 100 105 Q 85 105 75 90 Z";

  // Pre-compiled numeric coordinates for fast, placeholder-free lerps
  const COMP_VELUM_RAISED = parsePath(SHAPE_VELUM_RAISED);
  const COMP_VELUM_LOWERED = parsePath(SHAPE_VELUM_LOWERED);

  const COMP_TONGUE_NEUTRAL = parsePath(SHAPE_TONGUE_NEUTRAL);
  const COMP_TONGUE_FRONT_I = parsePath(SHAPE_TONGUE_FRONT_I);
  const COMP_TONGUE_BACK_U = parsePath(SHAPE_TONGUE_BACK_U);
  const COMP_TONGUE_TRILL_CONTACT = parsePath(SHAPE_TONGUE_TRILL_CONTACT);

  const COMP_LIPS_NEUTRAL = parsePath(SHAPE_LIPS_NEUTRAL);
  const COMP_LIPS_SPREAD_I = parsePath(SHAPE_LIPS_SPREAD_I);
  const COMP_LIPS_ROUNDED_U = parsePath(SHAPE_LIPS_ROUNDED_U);

  // Template command strings for reconstruction
  const TEMPLATE_VELUM = SHAPE_VELUM_RAISED;
  const TEMPLATE_TONGUE = SHAPE_TONGUE_NEUTRAL;
  const TEMPLATE_LIPS = SHAPE_LIPS_NEUTRAL;

  interface ArticulatoryWeights {
    JA: number;   // Jaw Opening [0=closed, 1=max open]
    TBH: number;  // Tongue Body Height [0=low, 1=high]
    TBB: number;  // Tongue Body Backness [0=front, 1=back]
    TTE: number;  // Tongue Tip Elevation [0=low, 1=alveolar contact]
    VEL: number;  // Velum Opening [0=sealed, 1=fully dropped]
    LIR: number;  // Lip Rounding [0=spread, 1=fully rounded]
  }

  // Active phoneme targets
  const SPEECH_TARGETS: Record<string, { weights: ArticulatoryWeights; title: string; ipa: string; desc: string }> = {
    "schwa": {
      weights: { JA: 0.20, TBH: 0.10, TBB: 0.10, TTE: 0.05, VEL: 0.00, LIR: 0.50 },
      title: "Schwa Vowel",
      ipa: "/ə/",
      desc: "Central, relaxed vowel. Glottis open, tongue body low/neutral, jaw open slightly, lips at resting envelope."
    },
    "i": {
      weights: { JA: 0.05, TBH: 0.95, TBB: 0.00, TTE: 0.10, VEL: 0.00, LIR: 0.00 },
      title: "High-Front Vowel",
      ipa: "/i/",
      desc: "Palatal constriction: Tongue body high and pushed forward towards the hard palate, spread lip aperture."
    },
    "u": {
      weights: { JA: 0.08, TBH: 0.85, TBB: 0.90, TTE: 0.05, VEL: 0.00, LIR: 1.00 },
      title: "High-Back Rounded Vowel",
      ipa: "/u/",
      desc: "Velar constriction: Tongue body elevated towards soft palate, lips projected forward in a tight rounding."
    },
    "a": {
      weights: { JA: 0.75, TBH: 0.00, TBB: 0.45, TTE: 0.00, VEL: 0.00, LIR: 0.40 },
      title: "Open Back Vowel",
      ipa: "/a/",
      desc: "Maximal oral resonance: Jaw highly lowered, tongue base depressed into pharynx, lips unrounded."
    },
    "nasal_o": {
      weights: { JA: 0.40, TBH: 0.35, TBB: 0.70, TTE: 0.05, VEL: 0.85, LIR: 0.85 },
      title: "Nasalized Rounded Vowel",
      ipa: "/ɔ̃/",
      desc: "French Nasality: Velum lowered. Airflow splits between the oral cavity and nasal passages. Lips rounded."
    },
    "nasal_a": {
      weights: { JA: 0.65, TBH: 0.05, TBB: 0.65, TTE: 0.00, VEL: 0.88, LIR: 0.30 },
      title: "Nasalized Open Vowel",
      ipa: "/ɑ̃/",
      desc: "French open nasal. Low-back tongue position, velopharyngeal port fully dilated to resonate nasal passage."
    },
    "nasal_e": {
      weights: { JA: 0.30, TBH: 0.60, TBB: 0.15, TTE: 0.05, VEL: 0.82, LIR: 0.10 },
      title: "Nasalized Spread Vowel",
      ipa: "/ɛ̃/",
      desc: "French front nasal. Tongue body fronted, velum dropped to divert substantial acoustic energy nasally."
    },
    "trill": {
      weights: { JA: 0.15, TBH: 0.40, TBB: 0.20, TTE: 0.95, VEL: 0.00, LIR: 0.40 },
      title: "Alveolar Trill (Rolled R)",
      ipa: "/r/",
      desc: "Spanish Alveolar Trill: Rapid 27Hz vibration of the tongue tip against the alveolar ridge from aerodynamic pulses."
    }
  };

  // Live rendering loop engine state registers
  let speechViewMode: "sagittal" | "waveguide" = "sagittal";
  let activeSpeechTargetKey = "schwa";
  
  // Weights registers for smooth 60fps easing
  const currentWeights: ArticulatoryWeights = { JA: 0.20, TBH: 0.10, TBB: 0.10, TTE: 0.05, VEL: 0.00, LIR: 0.50 };
  const targetWeights: ArticulatoryWeights = { JA: 0.20, TBH: 0.10, TBB: 0.10, TTE: 0.05, VEL: 0.00, LIR: 0.50 };

  // Trill simulation registers
  let isTrilling = false;
  let trillAge = 0;
  let globalSpeechTime = 0;
  let speechLoopRequestId: number | null = null;
  ```

- [ ] **Step 2: Implement coordinate parsing and lerp functions**
  Insert these exact helper routines in `src/main.ts`:
  ```typescript
  function parsePath(d: string): number[] {
    const matches = d.match(/-?[\d.]+/g);
    return matches ? matches.map(Number) : [];
  }

  function lerpPath(aNumeric: number[], bNumeric: number[], t: number, template: string): string {
    const interp = aNumeric.map((v, i) => {
      const targetVal = bNumeric[i] !== undefined ? bNumeric[i] : v;
      return v + (targetVal - v) * t;
    });
    let index = 0;
    return template.replace(/-?[\d.]+/g, () => {
      if (interp[index] !== undefined) {
        return interp[index++].toFixed(2);
      }
      return "0";
    });
  }
  ```

---

### Task 4: 27Hz Myoelastic Trill Physics & Main Speech Render Loop

**Files:**
- Modify: `src/main.ts` (inserted below coordinate helpers)

- [ ] **Step 1: Write the 27Hz Asymmetric Flutter Oscillator**
  Add these equations to `src/main.ts`:
  ```typescript
  // Spanish trill tongue-tip flutter math model
  const TRILL_FREQUENCY_HZ = 27;           
  const TRILL_AMPLITUDE    = 0.42;         
  const DUTY_CYCLE         = 0.38;         
  const contactThreshold   = Math.cos(Math.PI * DUTY_CYCLE); // ≈ 0.51

  function getTrillTTE(time: number, age: number): number {
    const omega = 2 * Math.PI * TRILL_FREQUENCY_HZ;
    const phase = omega * time;
    const raw = Math.sin(phase);
    
    // Asymmetric clipping: clip values above threshold to represent airtight seal contact
    const shaped = raw > contactThreshold 
      ? 1.0 
      : (raw - (-1)) / (contactThreshold - (-1)); // map [-1, threshold] -> [0, 1]
    
    const envelope = Math.min(1.0, age / 0.08); // 80ms soft onset ramp
    const oscillation = shaped * TRILL_AMPLITUDE * envelope;
    
    // Rest TTE target is near alveolar ridge (0.95), modulate symmetrically
    return Math.max(0, Math.min(1.0, 0.95 - (TRILL_AMPLITUDE * 0.5) + oscillation));
  }

  function getTrillTurbulence(time: number): number {
    const phase = 2 * Math.PI * TRILL_FREQUENCY_HZ * time;
    const vel = Math.cos(phase); // velocity indicator
    return Math.max(0, vel) ** 2; // squared burst during release
  }
  ```

- [ ] **Step 2: Write the Primary Speech 60FPS Morph & Physics loop**
  Add the continuous animation render function `runSpeechPhysicsLoop` to `src/main.ts`:
  ```typescript
  let lastPhysicsTime = 0;

  function runSpeechPhysicsLoop(timestamp: number) {
    if (!lastPhysicsTime) lastPhysicsTime = timestamp;
    const delta = (timestamp - lastPhysicsTime) / 1000;
    lastPhysicsTime = timestamp;

    globalSpeechTime += delta;
    if (isTrilling) {
      trillAge += delta;
    }

    // 1. Continuously interpolate articulatory weights at natural speeds (t = 12% per frame ≈ 120ms total)
    const lerpSpeed = 0.12; 
    currentWeights.JA += (targetWeights.JA - currentWeights.JA) * lerpSpeed;
    currentWeights.TBH += (targetWeights.TBH - currentWeights.TBH) * lerpSpeed;
    currentWeights.TBB += (targetWeights.TBB - currentWeights.TBB) * lerpSpeed;
    currentWeights.VEL += (targetWeights.VEL - currentWeights.VEL) * lerpSpeed;
    currentWeights.LIR += (targetWeights.LIR - currentWeights.LIR) * lerpSpeed;

    // Apply live 27Hz oscillation to TTE weight if trill is active
    if (isTrilling) {
      currentWeights.TTE = getTrillTTE(globalSpeechTime, trillAge);
    } else {
      currentWeights.TTE += (targetWeights.TTE - currentWeights.TTE) * lerpSpeed;
    }

    // 2. Drive sagittal SVG morphs
    renderSagittalSVG();

    // 3. Drive Acoustic Waveguide Canvas
    if (speechViewMode === "waveguide") {
      renderWaveguideCanvas();
    }

    // 4. Update dynamic UI metadata
    updatePhoneticMetrics();

    speechLoopRequestId = requestAnimationFrame(runSpeechPhysicsLoop);
  }

  function renderSagittalSVG() {
    // A. Velum Morphing (Raised to Lowered)
    const velumPath = lerpPath(COMP_VELUM_RAISED, COMP_VELUM_LOWERED, currentWeights.VEL, TEMPLATE_VELUM);
    document.getElementById("svg-velum")?.setAttribute("d", velumPath);

    // B. Lips Morphing (Neutral -> Spread -> Rounded)
    let lipTargetCoords = COMP_LIPS_NEUTRAL;
    let lipTargetT = 0;
    if (currentWeights.LIR > 0.5) {
      lipTargetCoords = COMP_LIPS_ROUNDED_U;
      lipTargetT = (currentWeights.LIR - 0.5) * 2;
    } else {
      lipTargetCoords = COMP_LIPS_SPREAD_I;
      lipTargetT = (0.5 - currentWeights.LIR) * 2;
    }
    const interpLipsCoords = COMP_LIPS_NEUTRAL.map((v, i) => v + (lipTargetCoords[i] - v) * lipTargetT);
    // Displace entire lips vertically based on Jaw Open weight (JA)
    const jawYOffset = currentWeights.JA * 8;
    const finalLipsCoords = interpLipsCoords.map((val, i) => (i % 2 === 1) ? val + jawYOffset : val);
    const finalLipsPath = TEMPLATE_LIPS.replace(/-?[\d.]+/g, () => {
      let index = 0;
      return () => finalLipsCoords[index++].toFixed(2);
    }());
    document.getElementById("svg-lips")?.setAttribute("d", finalLipsPath);

    // C. Tongue Morphing (Neutral -> Front /i/ -> Back /u/ -> Alveolar Trill Contact)
    // First: Blend height (TBH) and backness (TBB)
    let tongueBaseCoords = COMP_TONGUE_NEUTRAL;
    let tongueBaseT = 0;
    if (currentWeights.TBB > 0.5) {
      tongueBaseCoords = COMP_TONGUE_BACK_U;
      tongueBaseT = (currentWeights.TBB - 0.5) * 2;
    } else {
      tongueBaseCoords = COMP_TONGUE_FRONT_I;
      tongueBaseT = (0.5 - currentWeights.TBB) * 2;
    }
    let interpTongue = COMP_TONGUE_NEUTRAL.map((v, i) => v + (tongueBaseCoords[i] - v) * tongueBaseT);

    // Second: Blend tongue tip elevation (TTE) into the alveolar trill profile
    interpTongue = interpTongue.map((v, i) => v + (COMP_TONGUE_TRILL_CONTACT[i] - v) * currentWeights.TTE);

    // Third: Displace lower tongue points downwards by Jaw Open weight (JA)
    const jawOffset = currentWeights.JA * 6;
    const finalTongueCoords = interpTongue.map((val, i) => {
      // Lower tongue segments are indices near bottom outline
      if (i % 2 === 1 && i >= 18) {
        return val + jawOffset;
      }
      return val;
    });

    const finalTonguePath = TEMPLATE_TONGUE.replace(/-?[\d.]+/g, () => {
      let index = 0;
      return () => finalTongueCoords[index++].toFixed(2);
    }());
    document.getElementById("svg-tongue")?.setAttribute("d", finalTonguePath);

    // D. Update tongue tip contact dot indicator during trill closure instants
    const tipMarker = document.getElementById("svg-tongue-tip-marker");
    if (tipMarker) {
      if (isTrilling && currentWeights.TTE > 0.90) {
        tipMarker.classList.add("active");
        tipMarker.setAttribute("cx", "148");
        tipMarker.setAttribute("cy", "42");
      } else {
        tipMarker.classList.remove("active");
      }
    }

    // E. Drive Airflow lines pulse glow intensity and display based on velocities
    const oralAir = document.getElementById("svg-airflow-oral");
    const nasalAir = document.getElementById("svg-airflow-nasal");
    const airflowActive = isAudioPlaying || (breathingInterval && breathingPhase === 2);
    
    if (oralAir) {
      if (airflowActive && currentWeights.VEL < 0.6) {
        oralAir.classList.add("active");
        const baseSpeed = isTrilling ? 2 + getTrillTurbulence(globalSpeechTime) * 8 : 4;
        oralAir.style.animationDuration = `${0.6 / baseSpeed}s`;
      } else {
        oralAir.classList.remove("active");
      }
    }

    if (nasalAir) {
      if (airflowActive && currentWeights.VEL > 0.2) {
        nasalAir.classList.add("active");
      } else {
        nasalAir.classList.remove("active");
      }
    }
  }

  function updatePhoneticMetrics() {
    const metricAirflow = document.getElementById("metric-airflow");
    const metricVelum = document.getElementById("metric-velum");
    const metricFlutter = document.getElementById("metric-flutter");

    if (metricAirflow) {
      if (!isAudioPlaying) {
        metricAirflow.innerText = "Resting State";
      } else if (currentWeights.VEL > 0.6) {
        metricAirflow.innerText = "Nasal Split";
      } else {
        metricAirflow.innerText = "Oral Stream";
      }
    }

    if (metricVelum) {
      if (currentWeights.VEL > 0.6) {
        metricVelum.innerText = `Open (${Math.round(currentWeights.VEL * 100)}%)`;
        metricVelum.style.color = "var(--teal-accent)";
      } else {
        metricVelum.innerText = "Sealed (Oral)";
        metricVelum.style.color = "inherit";
      }
    }

    if (metricFlutter) {
      if (isTrilling) {
        const hertz = Math.round(25 + Math.sin(globalSpeechTime * 10) * 2);
        metricFlutter.innerText = `Active (${hertz}Hz)`;
        metricFlutter.style.color = "var(--coral)";
      } else {
        metricFlutter.innerText = "Inactive";
        metricFlutter.style.color = "inherit";
      }
    }
  }
  ```

---

### Task 5: Kelly-Lochbaum Acoustic Waveguide & Canvas Renderer

**Files:**
- Modify: `src/main.ts` (inserted below Speech Physics loop)

- [ ] **Step 1: Write spline math and color mapping**
  Add waveguide logic to `src/main.ts`:
  ```typescript
  // VOCAL TRACT ACOUSTIC DIAMETERS
  // 44 cylindrical diameters (cm) from posterior (glottis, index 0) to anterior (lips, index 43)
  const AREA_FUNCTIONS: Record<string, Float32Array> = {
    "schwa": new Float32Array([
      1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5,
      1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5,
      1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5,
      1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5
    ]),
    "i": new Float32Array([
      2.0, 2.0, 1.8, 1.6, 1.5, 1.6, 1.8, 2.0, 2.2, 2.4, 2.6, 2.8,
      3.0, 3.2, 3.4, 3.4, 3.2, 3.0, 2.8, 2.5, 2.0, 1.5, 1.1, 0.8,
      0.6, 0.5, 0.4, 0.35, 0.35, 0.4, 0.6, 0.8, 1.0, 1.2, 1.3, 1.4,
      1.5, 1.6, 1.7, 1.8, 1.9, 2.0, 2.1, 2.2
    ]),
    "a": new Float32Array([
      0.8, 0.9, 1.0, 1.2, 1.4, 1.4, 1.3, 1.2, 1.2, 1.3, 1.5, 1.8,
      2.2, 2.6, 3.0, 3.4, 3.6, 3.8, 4.0, 4.2, 4.3, 4.4, 4.4, 4.3,
      4.2, 4.0, 3.8, 3.5, 3.2, 3.0, 2.8, 2.5, 2.2, 2.0, 1.8, 1.6,
      1.4, 1.4, 1.5, 1.6, 1.8, 2.0, 2.2, 2.4
    ]),
    "u": new Float32Array([
      1.5, 1.6, 1.7, 1.8, 1.9, 2.0, 2.1, 2.2, 2.2, 2.1, 1.9, 1.7,
      1.5, 1.4, 1.3, 1.2, 1.1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7,
      1.8, 1.9, 2.0, 1.9, 1.7, 1.5, 1.2, 1.0, 0.8, 0.6, 0.5, 0.5,
      0.6, 0.7, 0.8, 0.7, 0.5, 0.4, 0.35, 0.3
    ]),
    "trill_contact": new Float32Array([
      1.8, 1.8, 1.8, 1.7, 1.6, 1.6, 1.7, 1.8, 2.0, 2.2, 2.4, 2.6,
      2.8, 2.9, 3.0, 3.0, 2.9, 2.8, 2.6, 2.4, 2.2, 2.0, 1.8, 1.6,
      1.4, 1.2, 1.1, 1.0, 1.0, 1.1, 1.2, 1.4, 1.6, 1.8, 1.9, 2.0,
      2.0, 1.8, 1.2, 0.4, 0.0, 0.0, 0.2, 0.8
    ]),
    "trill_open": new Float32Array([
      1.8, 1.8, 1.8, 1.7, 1.6, 1.6, 1.7, 1.8, 2.0, 2.2, 2.4, 2.6,
      2.8, 2.9, 3.0, 3.0, 2.9, 2.8, 2.6, 2.4, 2.2, 2.0, 1.8, 1.6,
      1.4, 1.2, 1.1, 1.0, 1.0, 1.1, 1.2, 1.4, 1.6, 1.8, 1.9, 2.0,
      2.0, 1.8, 1.4, 1.0, 0.8, 0.7, 0.9, 1.4
    ])
  };

  const waveguideDiameters = new Float32Array(44).fill(1.5);

  function velocityToColor(diameter: number, maxD = 4.0, minD = 0.05): string {
    const constriction = 1 - Math.max(0, Math.min(1.0, (diameter - minD) / (maxD - minD)));
    const activeCoral = currentVibe === "midnight" ? [180, 130, 255] : [255, 111, 97];
    const activeTeal = currentVibe === "midnight" ? [0, 229, 255] : [46, 196, 182];

    const r = Math.round(activeTeal[0] + constriction * (activeCoral[0] - activeTeal[0]));
    const g = Math.round(activeTeal[1] + constriction * (activeCoral[1] - activeTeal[1]));
    const b = Math.round(activeTeal[2] + constriction * (activeCoral[2] - activeTeal[2]));
    
    return `rgba(${r}, ${g}, ${b}, ${0.12 + constriction * 0.45})`;
  }

  function pointsToSmoothPath(p: [number, number][], alpha = 0.5): string {
    let d = `M ${p[0][0]} ${p[0][1]}`;
    for (let i = 0; i < p.length - 1; i++) {
      const p0 = p[Math.max(0, i - 1)];
      const p1 = p[i];
      const p2 = p[i + 1];
      const p3 = p[Math.min(p.length - 1, i + 2)];
      const cp1x = p1[0] + (p2[0] - p0[0]) * alpha / 3;
      const cp1y = p1[1] + (p2[1] - p0[1]) * alpha / 3;
      const cp2x = p2[0] - (p3[0] - p1[0]) * alpha / 3;
      const cp2y = p2[1] - (p3[1] - p1[1]) * alpha / 3;
      d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2[0]} ${p2[1]}`;
    }
    return d;
  }
  ```

- [ ] **Step 2: Write waveguide Canvas drawing method**
  Add the canvas rendering function `renderWaveguideCanvas` to `src/main.ts`:
  ```typescript
  function renderWaveguideCanvas() {
    const canvas = document.getElementById("waveguide-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Auto-adjust scale for high DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement!.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    ctx.clearRect(0, 0, w, h);

    // 1. Synthesise current diameters by blending targets
    const targetKey = activeSpeechTargetKey;
    let baseSource = AREA_FUNCTIONS[targetKey] || AREA_FUNCTIONS["schwa"];
    if (targetKey === "trill") {
      const blend = (currentWeights.TTE - 0.5) * 2.0;
      const clamped = Math.max(0, Math.min(1.0, blend));
      const contact = AREA_FUNCTIONS["trill_contact"];
      const open = AREA_FUNCTIONS["trill_open"];
      baseSource = new Float32Array(44);
      for (let i = 0; i < 44; i++) {
        baseSource[i] = open[i] + (contact[i] - open[i]) * clamped;
      }
    }

    // Smoothly ease diameter array
    for (let i = 0; i < 44; i++) {
      waveguideDiameters[i] += (baseSource[i] - waveguideDiameters[i]) * 0.12;
    }

    // 2. Draw splined waveguide walls
    const midY = h / 2;
    const xStep = w / 43;
    const upperPoints: [number, number][] = [];
    const lowerPoints: [number, number][] = [];

    for (let i = 0; i < 44; i++) {
      const x = i * xStep;
      const diameter = waveguideDiameters[i];
      const halfH = (diameter / 4.0) * (h * 0.42); // clamp visual scale to 4cm max
      upperPoints.push([x, midY - halfH]);
      lowerPoints.push([x, midY + halfH]);
    }

    // Convert splines to continuous canvas shapes
    const upperSpline = pointsToSmoothPath(upperPoints);
    const lowerSpline = pointsToSmoothPath(lowerPoints);

    // 3. Paint filled interior using colored sections to illustrate airflow velocity
    ctx.beginPath();
    ctx.moveTo(upperPoints[0][0], upperPoints[0][1]);
    
    // Draw upper spline contour onto canvas
    let dIndex = 0;
    const numSteps = 80;
    const stepX = w / numSteps;

    // Paint colored slices directly for dynamic airflow speed hotspots
    for (let s = 0; s < numSteps; s++) {
      const xStart = s * stepX;
      const xEnd = (s + 1) * stepX;
      const sliceIdx = Math.floor((s / numSteps) * 44);
      const diam = waveguideDiameters[Math.min(43, sliceIdx)];
      
      const halfHStart = (waveguideDiameters[Math.min(43, sliceIdx)] / 4.0) * (h * 0.42);
      const halfHEnd = (waveguideDiameters[Math.min(43, Math.floor(((s+1)/numSteps)*44))] / 4.0) * (h * 0.42);

      ctx.fillStyle = velocityToColor(diam);
      ctx.beginPath();
      ctx.moveTo(xStart, midY - halfHStart);
      ctx.lineTo(xEnd, midY - halfHEnd);
      ctx.lineTo(xEnd, midY + halfHEnd);
      ctx.lineTo(xStart, midY + halfHStart);
      ctx.closePath();
      ctx.fill();
    }

    // 4. Draw crisp outer wall lines
    ctx.strokeStyle = varColorToRGB("--zen-text", "0.75");
    ctx.lineWidth = 2.5;

    // Render upper wall line
    ctx.beginPath();
    upperPoints.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p[0], p[1]);
      else ctx.lineTo(p[0], p[1]);
    });
    ctx.stroke();

    // Render lower wall line
    ctx.beginPath();
    lowerPoints.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p[0], p[1]);
      else ctx.lineTo(p[0], p[1]);
    });
    ctx.stroke();

    // 5. Draw flowing pressure waves inside if sound is playing
    if (isAudioPlaying) {
      ctx.strokeStyle = varColorToRGB("--vibe-active-bg", "0.35");
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      
      const pulsePhase = globalSpeechTime * 15;
      for (let x = 0; x < w; x += 4) {
        const sliceIdx = Math.floor((x / w) * 44);
        const diam = waveguideDiameters[Math.min(43, sliceIdx)];
        const halfH = (diam / 4.0) * (h * 0.42);
        const wave = Math.sin(x * 0.08 - pulsePhase) * Math.cos(x * 0.02) * (halfH * 0.5);
        
        if (x === 0) ctx.moveTo(x, midY + wave);
        else ctx.lineTo(x, midY + wave);
      }
      ctx.stroke();
    }
  }

  // Quick helper to read custom vibe properties in canvas drawing
  function varColorToRGB(varName: string, opacity: string): string {
    const color = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    if (color.startsWith("#")) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return `rgba(90, 42, 66, ${opacity})`;
  }
  ```

---

### Task 6: Toggles, Event Wiring, and Real-Time Speech Integration

**Files:**
- Modify: `src/main.ts` (inserted inside window event initializers)

- [ ] **Step 1: Wire up tab swappers and view switchers**
  Add these event registrations to `initElements` / `setupEventHandlers` in `src/main.ts`:
  ```typescript
  // Tab Swapper Buttons
  const tabBreathing = document.getElementById("tab-btn-breathing");
  const tabSpeech = document.getElementById("tab-btn-speech");
  const panelBreathing = document.getElementById("zen-panel-breathing");
  const panelSpeech = document.getElementById("zen-panel-speech");

  if (tabBreathing && tabSpeech && panelBreathing && panelSpeech) {
    tabBreathing.addEventListener("click", () => {
      tabBreathing.classList.add("active");
      tabSpeech.classList.remove("active");
      panelBreathing.classList.add("active");
      panelSpeech.classList.remove("active");
      
      // Stop speech loop to save performance when hidden
      if (speechLoopRequestId) {
        cancelAnimationFrame(speechLoopRequestId);
        speechLoopRequestId = null;
      }
    });

    tabSpeech.addEventListener("click", () => {
      tabSpeech.classList.add("active");
      tabBreathing.classList.remove("active");
      panelSpeech.classList.add("active");
      panelBreathing.classList.remove("active");

      // Start continuous physics engine
      if (!speechLoopRequestId) {
        lastPhysicsTime = 0;
        speechLoopRequestId = requestAnimationFrame(runSpeechPhysicsLoop);
      }
    });
  }

  // View switch buttons (Sagittal vs Acoustic Tube)
  const viewSagittal = document.getElementById("view-btn-sagittal");
  const viewWaveguide = document.getElementById("view-btn-waveguide");
  const svgWrapper = document.getElementById("speech-svg-wrapper");
  const waveguideWrapper = document.getElementById("speech-waveguide-wrapper");

  if (viewSagittal && viewWaveguide && svgWrapper && waveguideWrapper) {
    viewSagittal.addEventListener("click", () => {
      viewSagittal.classList.add("active");
      viewWaveguide.classList.remove("active");
      svgWrapper.style.display = "block";
      svgWrapper.style.opacity = "1";
      waveguideWrapper.style.display = "none";
      waveguideWrapper.style.opacity = "0";
      speechViewMode = "sagittal";
    });

    viewWaveguide.addEventListener("click", () => {
      viewWaveguide.classList.add("active");
      viewSagittal.classList.remove("active");
      waveguideWrapper.style.display = "block";
      waveguideWrapper.style.opacity = "1";
      svgWrapper.style.display = "none";
      svgWrapper.style.opacity = "0";
      speechViewMode = "waveguide";
    });
  }
  ```

- [ ] **Step 2: Bind TTS Audio Lifecycle to Speech Target triggers**
  Hook into speech playback events in `src/main.ts` so active states change dynamically during spoken speech.
  Add these functions to `src/main.ts` and call them within `currentAudio` audio lifecycle callbacks:
  ```typescript
  let speechAnimationTimer: any = null;

  function triggerActivePhonetics(targetKey: string) {
    const config = SPEECH_TARGETS[targetKey];
    if (!config) return;

    activeSpeechTargetKey = targetKey;
    isTrilling = (targetKey === "trill");
    if (isTrilling) {
      trillAge = 0;
    }

    // Set targets for physics loop easing
    Object.assign(targetWeights, config.weights);

    // Update text content
    const titleEl = document.getElementById("speech-sound-title");
    const ipaEl = document.getElementById("speech-sound-ipa");
    const descEl = document.getElementById("speech-sound-desc");

    if (titleEl) titleEl.innerText = config.title;
    if (ipaEl) ipaEl.innerText = config.ipa;
    if (descEl) descEl.innerText = config.desc;
  }

  // Analyzes translated text and schedules dynamic target changes during speech playback
  function startPlaybackArticulations() {
    if (speechAnimationTimer) clearInterval(speechAnimationTimer);
    
    const text = translationText.innerText.toLowerCase();
    
    // Choose sequences based on target phonemes
    const sequence: string[] = [];
    
    if (activeTargetLanguage === "es" && (text.includes("r") || text.includes("rr"))) {
      sequence.push("schwa", "trill", "a", "schwa");
    } else if (activeTargetLanguage === "fr" && (text.includes("on") || text.includes("an") || text.includes("en") || text.includes("in"))) {
      sequence.push("schwa", "nasal_o", "nasal_a", "schwa");
    } else if (activeTargetLanguage === "ja") {
      sequence.push("schwa", "i", "u", "a", "schwa");
    } else {
      // General vowels loop
      sequence.push("schwa", "i", "a", "u", "schwa");
    }

    let step = 0;
    triggerActivePhonetics(sequence[0]);

    // Fast transitions to match spoken time
    speechAnimationTimer = setInterval(() => {
      step = (step + 1) % sequence.length;
      triggerActivePhonetics(sequence[step]);
      
      // Stop cycle if playback stops
      if (!isAudioPlaying) {
        clearInterval(speechAnimationTimer);
        triggerActivePhonetics("schwa");
      }
    }, 450); // change target every 450ms during active speech
  }
  ```

  Wire `startPlaybackArticulations()` inside the `currentAudio.addEventListener("play", ...)` block in `initAudioEventListeners()`:
  ```typescript
  currentAudio.addEventListener("play", () => {
    isAudioPlaying = true;
    togglePlayIcon(true);
    nowPlayingLabel.innerText = `Speaking: ${activeVoiceName}`;
    playBtn.disabled = false; 
    currentAudio.playbackRate = playbackSpeed; 
    
    // Fire articulatory animation triggers
    startPlaybackArticulations();
  });
  ```

  And inside the `"ended"` and `"pause"` and `"error"` event listeners, trigger resting state reset:
  ```typescript
  if (speechAnimationTimer) {
    clearInterval(speechAnimationTimer);
  }
  triggerActivePhonetics("schwa");
  ```
