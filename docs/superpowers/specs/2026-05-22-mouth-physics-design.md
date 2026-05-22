# Spec: Premium Togglable Mouth Physics Articulatory & Acoustic Waveguide Speech Coach

This specification details the architecture, design, and implementation of the **Mouth Physics View** (Articulatory Speech Coach) integrated as a premium togglable panel inside the **Zen Immersive Coach** card in the Aura Companion desktop application.

---

## 1. Goal Description

Provide a stunning, real-time, high-fidelity visual representation of speech articulation and vocal tract acoustics inside the desktop dashboard.

### Key Objectives
* **Anatomical Sagittal SVG Morphing**: A 2D sagittal vocal tract profile that morphs smoothly and continuously at native physiological speeds (80–120ms) between vowels and consonants.
* **Physics-Based Trill Oscillation**: An asymmetric 27Hz myoelastic-aerodynamic oscillator to animate the Spanish alveolar trill (/r/) tip contact and turbulent airflow bursts.
* **Acoustic Waveguide spline visualizer**: A 44-segment Kelly-Lochbaum waveguide area function splined cylinder, glowing dynamically according to constriction and airflow velocity.
* **Togglable Dual-Tab Interface**: Seamlessly togglable between the Breathing Pacer and the Articulatory Coach via a premium glassmorphic sliding tab bar.
* **Synchronized Speech Playback**: Integration with translations to morph the visual tract in sync with played audio.

---

## 2. Anatomical SVG Anchors (200x200 viewBox)

The mid-sagittal profile uses consistent anchor curves built with cubic/quadratic Bézier points:

* **Palate/Alveolar Ridge**: `d="M 60 42 Q 90 30 120 30 Q 135 30 148 38"` (palate), and bump: `d="M 140 38 Q 148 34 155 38 Q 158 42 155 46"`
* **Velum Raised**: `d="M 60 42 Q 50 55 40 70 Q 32 88 28 105 Q 26 118 28 130"`
* **Velum Lowered**: `d="M 60 42 Q 48 58 36 75 Q 26 92 24 110 Q 23 122 26 132"`
* **Jaw Lower Outer**: `d="M 162 130 Q 160 155 140 165 Q 110 175 70 174 Q 40 173 25 162 Q 15 150 18 130"`
* **Tongue Shapes (Lerp Compatible)**:
  * *Neutral*: `d="M 20 140 Q 40 135 70 128 Q 100 122 120 115 Q 138 108 148 105 Q 154 103 157 100 Q 155 96 152 95 Q 140 98 125 104 Q 100 112 70 118 Q 42 124 20 128 Z"`
  * *High-Front /i/*: `d="M 20 150 Q 42 145 68 136 Q 92 126 112 110 Q 128 96 138 78 Q 142 70 148 64 Q 152 60 155 62 Q 157 66 154 72 Q 146 84 136 98 Q 118 118 96 132 Q 72 146 42 154 Q 28 157 20 156 Z"`
  * *High-Back /u/*: `d="M 20 148 Q 38 148 58 145 Q 78 140 92 130 Q 104 118 108 102 Q 110 88 108 76 Q 106 66 102 62 Q 96 58 90 62 Q 84 70 82 82 Q 80 96 76 108 Q 68 124 52 136 Q 38 144 20 148 Z"`
  * *Rolled R Contact*: `d="M 20 145 Q 42 140 68 133 Q 95 124 118 114 Q 135 106 145 96 Q 150 88 152 82 Q 154 76 155 72 Q 156 68 155 66 Q 152 64 148 66 Q 144 68 140 74 Q 134 82 130 90 Q 120 104 105 112 Q 88 122 64 130 Q 44 136 20 140 Z"`
* **Lips (Lerp Compatible)**:
  * *Spread /i/*: `d="M 44 36 Q 66 30 100 30 Q 134 30 156 36 Q 134 42 100 42 Q 66 42 44 36 Z"`
  * *Neutral*: `d="M 60 98 Q 80 90 100 90 Q 120 90 140 98 Q 130 112 100 114 Q 70 112 60 98 Z"`

---

## 3. Real-Time Math & Physics Equations

### A. Coordinate Lerp Morpher
To slide between path states at 60FPS:
```typescript
function parsePath(d: string): number[] {
  return d.match(/-?[\d.]+/g)!.map(Number);
}

function lerpPath(aNumeric: number[], bNumeric: number[], t: number, template: string): string {
  const interp = aNumeric.map((v, i) => v + (bNumeric[i] - v) * t);
  let index = 0;
  return template.replace(/-?[\d.]+/g, () => interp[index++].toFixed(2));
}
```

### B. 27Hz Spanish Trill Oscillator
```typescript
const TRILL_FREQ = 27; // Hz
const DUTY_CYCLE = 0.38; // 38% airtight closure phase
const contactThreshold = Math.cos(Math.PI * DUTY_CYCLE);

function trillTTE(time: number, age: number): number {
  const phase = 2 * Math.PI * TRILL_FREQ * time;
  const raw = Math.sin(phase);
  const shaped = raw > contactThreshold ? 1.0 : (raw - (-1)) / (contactThreshold - (-1));
  const envelope = Math.min(1.0, age / 0.08); // 80ms ramp
  return Math.max(0, Math.min(1, 0.95 - 0.225 + shaped * 0.45 * envelope));
}
```

### C. Catmull-Rom Cubic Spline for Acoustic Tube
Symmetrically plots 44 cylinders and converts to a smooth bezier path:
```typescript
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

---

## 4. Proposed File Modifications

### A. Markup changes in `index.html`
* Inject `.zen-tab-bar` containing tab buttons inside the card header of `.zen-focus-card`.
* Wrap the breathing elements in `.zen-panel[data-panel="breathing"]`.
* Append the new `.zen-panel[data-panel="speech"]` container:
  * Incorporate SVG mid-sagittal canvas workframe.
  * Incorporate a secondary toggler for view mode: "Articulatory Profile" vs. "Acoustic Tube".
  * Create a canvas container for Pink Trombone-style waveguide splines.
  * Add the real-time description panel showing phonetic details.

### B. Styling changes in `src/styles.css`
* Glassmorphic sliding tab bar selectors.
* CSS animations for airflow vectors and turbulence bursts.
* Crossfade transitions for panels.

### C. Script logic changes in `src/main.ts`
* Port all coordinates and lerp interpolation algorithms.
* Bind the transcription target word triggers to mouth physics states.
* Synchronize active morph targets with TTS play timeline states.

---

## 5. Verification Plan

* Build successfully using `npm run build`.
* Validate that switching tabs operates smoothly at 60FPS.
* Verify morphing is continuous, elastic, and free of jumpy transitions.
