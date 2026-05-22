### OUTPUT 1: MINIMALIST SVG PATH COORDINATES (2D/2.5D sagittal view)

- **Static vocal tract outlines (hard palate, teeth, jaw, nasal channel)** – Example path:  
  ```svg
  d="M28 118 Q40 78 82 58 Q118 42 152 56 Q170 66 178 92 Q182 112 172 132 Q156 164 114 176 Q72 184 44 166 Q24 152 20 132 Q18 124 28 118 Z"
  ```  
  (This semicircular curve traces the hard palate/pharynx, jaw and closes back at the uvula.)  
- **Alveolar ridge (teeth)** – Example:  
  ```svg
  d="M118 62 Q132 66 142 74"
  ```  
  (A small arch representing the teeth/alveolar ridge.)  
- **Nasal cavity channel** – Example:  
  ```svg
  d="M74 54 C80 46 88 42 98 42 L110 54 L100 62"
  ```  
  (Quadratic/line curve for the nasal passage behind the palate.)  

- **Velum (soft palate) raised vs. lowered** – Example “d” for soft palate:  
  - Raised (nasal closure):  
    ```svg
    d="M156 64 Q148 90 142 110"
    ```  
  - Lowered (open nasal):  
    ```svg
    d="M156 64 Q148 110 142 150"
    ```  
  (The lower lip‐like curve at the back of the mouth moves down to open the nasal port.)  

- **Tongue shapes (sagittal profile)** – Example `d=` for tongue midsagittal outline:  
  - Neutral (/ə/) – e.g. mid‐position:  
    ```svg
    d="M40 160 Q70 130 110 120 Q150 115 180 130"
    ```  
  - High-front (/i/) – tongue up and forward:  
    ```svg
    d="M40 150 Q70 100 110 70 Q150 60 180 80"
    ```  
  - High-back (/u/ unrounded) – tongue up and back:  
    ```svg
    d="M40 150 Q70 100 100 90 Q130 100 180 130"
    ```  
  - Alveolar contact (/r/) – tip raised at ridge:  
    ```svg
    d="M40 160 Q70 120 110 110 Q140 108 180 130"
    ```  

- **Lips (frontal profile)** – Example `d=` for lip shape (in sagittal view):  
  - Spread/flat – wide lips:  
    ```svg
    d="M60 180 Q70 170 80 170 L120 170 Q130 170 140 180"
    ```  
  - Neutral – relaxed lips:  
    ```svg
    d="M65 180 Q70 175 80 175 L120 175 Q130 175 135 180"
    ```  
  - Rounded (pursed) – protruded lips:  
    ```svg
    d="M70 180 Q75 172 85 170 L115 170 Q125 172 130 180"
    ```  

- **Morphing/interpolation** – To animate between shapes, ensure each path has the same sequence of commands (same number of points).  Then use CSS or JS to interpolate the “d” strings.  For example, one can use CSS `<animate attributeName="d">` or JavaScript libraries (like Flubber or D3) to generate intermediate path points.  As shown by Perry 2025, SVG path morphing uses a solver to create smooth transitions between two `d` values【60†L39-L44】.  In JS you might do:  
  ```js
  const interp = flubber.interpolate(path1, path2);
  // then for t from 0→1: path.setAttribute('d', interp(t));
  ```  
  This yields a smooth warp between shapes【60†L39-L44】【60†L133-L140】 (CSS animations or SVG `<animate>` tags can likewise transition the `d` attribute if command counts match).  

### OUTPUT 2: 3D THREE.JS PARAMETRIC DEFORMATION MAP

```json
{
  "Spanish /r/ (alveolar trill)":   { "JA": 0.2, "TBH": 0.6, "TBB": 0.3, "TTE": 0.9, "VEL": 0.0, "LIR": 0.1, "LIP": 0.2 },
  "French /ɔ̃/ (nasal vowel)":     { "JA": 0.6, "TBH": 0.5, "TBB": 0.8, "TTE": 0.1, "VEL": 1.0, "LIR": 0.8, "LIP": 0.9 },
  "Japanese /u/ (high back)":      { "JA": 0.1, "TBH": 1.0, "TBB": 1.0, "TTE": 0.0, "VEL": 0.0, "LIR": 0.0, "LIP": 0.0 },
  "English /a/ (low front)":       { "JA": 0.9, "TBH": 0.0, "TBB": 0.5, "TTE": 0.0, "VEL": 0.0, "LIR": 0.0, "LIP": 0.0 },
  "English /i/ (high front)":      { "JA": 0.1, "TBH": 1.0, "TBB": 0.0, "TTE": 0.7, "VEL": 0.0, "LIR": 0.0, "LIP": 0.0 }
}
```

- **Parameter definitions:**  (JA = jaw opening, TBH = tongue-body height, TBB = tongue-body backness, TTE = tongue-tip elevation, VEL = velum opening, LIR = lip rounding, LIP = lip protrusion.)  

- **Spanish /r/** – This trill is an *oral* sound, so `VEL=0` (velum raised)【71†L193-L194】.  The tongue tip is high and active (`TTE≈1.0`), touching the ridge, with moderately closed jaw (`JA≈0.2`) and mid tongue body (`TBH≈0.6`).  Lips are mostly neutral (`LIR≈0.1`, `LIP≈0.2`).  

- **French nasal /ɔ̃/** – Nasal vowels have a *lowered velum* (`VEL=1.0`) allowing airflow into the nose【48†L41-L43】.  Here the jaw is mid-open (`JA≈0.6`), tongue body is back (`TBB≈0.8`) and mid-height (`TBH≈0.5`) as in [ɔ], tongue tip low (`TTE≈0.1`), and lips highly rounded/protruded (`LIR≈0.8`, `LIP≈0.9`) like an [ɔ].  

- **Japanese /u/** – The Japanese /u/ is a high back *unrounded* vowel.  Thus the jaw is closed (`JA≈0.1`), tongue body very high and back (`TBH=1.0, TBB=1.0`), tongue tip neutral (`TTE=0`), velum closed (`VEL=0`), and lips unrounded (`LIR=0`) and unprotruded (`LIP=0`).  

- **English /a/** – Low front [a]: jaw fully open (`JA≈0.9`), tongue body low (`TBH=0`), somewhat central (`TBB=0.5`), tip low (`TTE=0`), velum closed (`VEL=0`), lips neutral (`LIR=0`, `LIP=0`).  

- **English /i/** – High front [i]: jaw nearly closed (`JA=0.1`), tongue body very high (`TBH=1.0`), front (`TBB=0`), tip moderately raised (`TTE=0.7`), velum closed, lips unrounded and spread (`LIR=0`, `LIP=0`).  

- **Trill oscillation formula:**  To simulate the 24–30 Hz tongue-tip flutter for the Spanish /r/, we modulate the TTE parameter with a sine wave.  For example:  

  \[
    TTE(t) = TTE_{base} + A \sin(2\pi f t), 
    \quad f \approx 28\text{ Hz},
  \]  

  with an amplitude \(A\) chosen so the tip moves around the alveolar target.  This models the periodic tongue vibration seen in trills (research notes ~25–30 Hz oscillation)【69†L205-L212】【71†L193-L194】.  

### OUTPUT 3: WAVEGUIDE AREA FUNCTIONS (Pink Trombone style)

```json
{
  "/i/":      [0.8,0.8,0.8,0.8,0.8,0.8,0.8, 1.1,1.1,1.1,1.1,1.1, 1.2,1.2,1.2,1.2,1.2,1.2,1.2,1.2,1.2,
              0.8,0.8,0.8,0.8,0.8,0.8,0.8,0.8,0.8,0.8, 1.1, 1.3,1.3,1.3, 1.0,1.0,1.0,1.0, 0.8,0.8,0.8,0.8,0.8],
  "/a/":      [1.0,1.0,1.0,1.0,1.0,1.0,1.0, 1.5,1.5,1.5,1.5,1.5,
              1.8,1.8,1.8,1.8,1.8,1.8,1.8,1.8,1.8,1.8,1.8,1.8,1.8,1.8,
              2.0,2.0,2.0,2.0,2.0, 1.5, 1.3,1.3,1.3, 1.1,1.1,1.1,1.1, 1.1,1.1,1.1,1.1,1.1],
  "/r/contact": [0.8,0.8,0.8,0.8,0.8,0.8,0.8, 1.0,1.0,1.0,1.0,1.0,
              1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,
              1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0, 
              0.4, 0.0, 0.2,0.2,0.8,0.8,0.8,0.8, 1.0,1.0,1.0,1.0,1.0]
}
```

- **Interpretation:**  Each array lists 44 diameters (evenly spaced from glottis→lips).  For example, “/i/” has a small glottal end (0.8), mid‐tract (~1.1–1.3) and very narrow front (0.8) reflecting the high front vowel shape.  The “/a/” array is much larger (up to 2.0) indicating an open low vowel.  The “/r/contact” array has a near-zero diameter at segments corresponding to the alveolar constriction (index ~32 set to 0) to model contact, with wider sections elsewhere.  

- **UI mapping:**  These diameters can be plotted directly as a smooth curve or volume outline.  For instance, one can draw a tube whose local radius (half the diameter) at each segment yields a fluid volume shape from glottis to lips.  This is analogous to the Pink Trombone UI (which displays a cylindrical vocal tract)【48†L48-L50】【73†L18-L23】.  By connecting the cross‐sectional points (or by plotting diameter vs. position), the UI can render a smooth area profile (e.g. via a spline or soft blob), creating a visually appealing throat‐mouth shape.  In practice, you could use Canvas or WebGL to draw the tract outline by plotting each slice’s diameter and smoothly connecting them, giving an intuitive 1D area‐function visualization【48†L48-L50】.  

**Sources:** Standard articulatory theory and modeling (Story 2005 and related) underpins these shapes and area functions【48†L48-L50】【71†L193-L194】, and modern WebGL/JS tools (e.g. Flubber or Three.js morph targets) enable the interpolation and animation as described【60†L39-L44】【48†L41-L43】.