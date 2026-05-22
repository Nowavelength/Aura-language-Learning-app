import { invoke, convertFileSrc } from "@tauri-apps/api/core";

// Define Voice Pack Interface
interface VoicePack {
  id: string;
  name: string;
  lang: string;
  modelName: string;
  modelUrl: string;
  configUrl: string;
  downloaded: boolean;
  downloading: boolean;
  progress: number;
}

const voicePacks: VoicePack[] = [
  {
    id: "en-amy",
    name: "English (US) - Amy",
    lang: "en",
    modelName: "en_US-amy-medium.onnx",
    modelUrl: "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/amy/medium/en_US-amy-medium.onnx",
    configUrl: "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/amy/medium/en_US-amy-medium.onnx.json",
    downloaded: false,
    downloading: false,
    progress: 0
  },
  {
    id: "es-claude",
    name: "Spanish (Mexico) - Claude (High Q)",
    lang: "es",
    modelName: "es_MX-claude-high.onnx",
    modelUrl: "https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_MX/claude/high/es_MX-claude-high.onnx",
    configUrl: "https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_MX/claude/high/es_MX-claude-high.onnx.json",
    downloaded: false,
    downloading: false,
    progress: 0
  },
  {
    id: "es-ald",
    name: "Spanish (Mexico) - Ald",
    lang: "es",
    modelName: "es_MX-ald-medium.onnx",
    modelUrl: "https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_MX/ald/medium/es_MX-ald-medium.onnx",
    configUrl: "https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_MX/ald/medium/es_MX-ald-medium.onnx.json",
    downloaded: false,
    downloading: false,
    progress: 0
  },
  {
    id: "es-davefx",
    name: "Spanish (Spain) - Davefx",
    lang: "es",
    modelName: "es_ES-davefx-medium.onnx",
    modelUrl: "https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_ES/davefx/medium/es_ES-davefx-medium.onnx",
    configUrl: "https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_ES/davefx/medium/es_ES-davefx-medium.onnx.json",
    downloaded: false,
    downloading: false,
    progress: 0
  },
  {
    id: "es-sharvard",
    name: "Spanish (Spain) - Sharvard",
    lang: "es",
    modelName: "es_ES-sharvard-medium.onnx",
    modelUrl: "https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_ES/sharvard/medium/es_ES-sharvard-medium.onnx",
    configUrl: "https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_ES/sharvard/medium/es_ES-sharvard-medium.onnx.json",
    downloaded: false,
    downloading: false,
    progress: 0
  },
  {
    id: "fr-gilles",
    name: "French (France) - Gilles (Low)",
    lang: "fr",
    modelName: "fr_FR-gilles-low.onnx",
    modelUrl: "https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/gilles/low/fr_FR-gilles-low.onnx",
    configUrl: "https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/gilles/low/fr_FR-gilles-low.onnx.json",
    downloaded: false,
    downloading: false,
    progress: 0
  },
  {
    id: "fr-siwis",
    name: "French (France) - Siwis (Medium)",
    lang: "fr",
    modelName: "fr_FR-siwis-medium.onnx",
    modelUrl: "https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/siwis/medium/fr_FR-siwis-medium.onnx",
    configUrl: "https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/siwis/medium/fr_FR-siwis-medium.onnx.json",
    downloaded: false,
    downloading: false,
    progress: 0
  },
  {
    id: "de-thorsten",
    name: "German (Germany) - Thorsten (Medium)",
    lang: "de",
    modelName: "de_DE-thorsten-medium.onnx",
    modelUrl: "https://huggingface.co/rhasspy/piper-voices/resolve/main/de/de_DE/thorsten/medium/de_DE-thorsten-medium.onnx",
    configUrl: "https://huggingface.co/rhasspy/piper-voices/resolve/main/de/de_DE/thorsten/medium/de_DE-thorsten-medium.onnx.json",
    downloaded: false,
    downloading: false,
    progress: 0
  },
  {
    id: "it-paola",
    name: "Italian (Italy) - Paola (Medium)",
    lang: "it",
    modelName: "it_IT-paola-medium.onnx",
    modelUrl: "https://huggingface.co/rhasspy/piper-voices/resolve/main/it/it_IT/paola/medium/it_IT-paola-medium.onnx",
    configUrl: "https://huggingface.co/rhasspy/piper-voices/resolve/main/it/it_IT/paola/medium/it_IT-paola-medium.onnx.json",
    downloaded: false,
    downloading: false,
    progress: 0
  }
];

// Offline translation modules (simulate offline capability for translation)
interface OfflineModule {
  id: string;
  name: string;
  size: string;
  downloaded: boolean;
  downloading: boolean;
  progress: number;
}

const offlineModules: OfflineModule[] = [
  { id: "trans-es", name: "Spanish Offline Translator", size: "45 MB", downloaded: true, downloading: false, progress: 0 },
  { id: "trans-fr", name: "French Offline Translator", size: "48 MB", downloaded: true, downloading: false, progress: 0 },
  { id: "trans-ja", name: "Japanese Offline Translator", size: "52 MB", downloaded: true, downloading: false, progress: 0 }
];

// State variables
let isPiperInstalled = false;
const currentAudio = new Audio();
currentAudio.crossOrigin = "anonymous";
let isAudioPlaying = false;
let activeTargetLanguage = "es";

// Web Audio API visualizer variables
let audioCtx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let sourceNode: MediaElementAudioSourceNode | null = null;
let activeVoiceName = "";

// TTS Caching layer
let lastSynthesizedText = "";
let lastSynthesizedVoiceId = "";
let playbackSpeed = 1.00;
let isAudioLoopActive = false;

// Elements
let ambientCanvas: HTMLCanvasElement;
let audioWaveCanvas: HTMLCanvasElement;
let learnBtn: HTMLButtonElement;
let textInput: HTMLTextAreaElement;
let translationText: HTMLParagraphElement;
let sourceSelect: HTMLSelectElement;
let targetSelect: HTMLSelectElement;
let voiceSelect: HTMLSelectElement;
let playBtn: HTMLButtonElement;
let nowPlayingLabel: HTMLSpanElement;
let voiceListContainer: HTMLDivElement;
let moduleListContainer: HTMLDivElement;
let piperStatusText: HTMLParagraphElement;
let installPiperBtn: HTMLButtonElement;
let commandPalette: HTMLDivElement;
let paletteSearch: HTMLInputElement;
let paletteItems: NodeListOf<HTMLDivElement>;
let progressContainer: HTMLDivElement;
let progressBar: HTMLDivElement;
let speedBadge: HTMLSpanElement;
let speedSlider: HTMLInputElement;
let speedDownBtn: HTMLButtonElement;
let speedUpBtn: HTMLButtonElement;
let toggleDownloadsBtn: HTMLButtonElement;
let charCountSpan: HTMLSpanElement;
let loopBtn: HTMLButtonElement;
let speedSelect: HTMLSelectElement;

// 3D Vocal Visualizer State
let vocal3dWrapper: HTMLDivElement;
let vocal3dCanvas: HTMLCanvasElement;
let rotX = -0.25;
let rotY = 0.45;
let isDragging3D = false;
let startDragX = 0;
let startDragY = 0;

// Vibe Theme Configurations database
const vibeThemes: { [key: string]: { [key: string]: string | string[] } } = {
  azure: {
    "hero-bg": "linear-gradient(135deg, rgba(230, 200, 240, 0.65) 0%, rgba(245, 220, 250, 0.45) 100%)",
    "input-bg": "linear-gradient(135deg, rgba(200, 240, 225, 0.65) 0%, rgba(215, 245, 235, 0.45) 100%)",
    "output-bg": "linear-gradient(135deg, rgba(253, 243, 192, 0.75) 0%, rgba(254, 247, 215, 0.55) 100%)",
    "download-bg": "linear-gradient(135deg, rgba(255, 218, 200, 0.7) 0%, rgba(255, 235, 220, 0.5) 100%)",
    "vibe-caret": "#FF6F61",
    "vibe-input-text": "#1A3E35",
    "vibe-placeholder": "#7E9B92",
    "vibe-label-color": "#4C2665",
    "vibe-btn-text": "#4C2665",
    "vibe-active-bg": "#FF6F61",
    "vibe-active-shadow": "rgba(255, 111, 97, 0.25)",
    "zen-bg": "linear-gradient(135deg, rgba(255, 240, 245, 0.65) 0%, rgba(255, 225, 235, 0.45) 100%)",
    "zen-border": "rgba(255, 240, 245, 0.8)",
    "zen-text": "#5A2A42",
    "zen-muted": "#7A5366",
    "blob-colors": [
      "rgba(255, 111, 97, 0.13)",     // Peach
      "rgba(254, 189, 17, 0.08)",      // Gold
      "rgba(180, 150, 245, 0.08)",     // Lilac
      "rgba(46, 196, 182, 0.06)"       // Mint
    ],
    "blob-glow-colors": [
      "rgba(255, 111, 97, 0.03)",
      "rgba(254, 189, 17, 0.02)",
      "rgba(180, 150, 245, 0.02)",
      "rgba(46, 196, 182, 0.01)"
    ],
    "sine-colors": [
      "rgba(255, 111, 97, 0.16)",
      "rgba(254, 189, 17, 0.10)",
      "rgba(46, 196, 182, 0.08)"
    ],
    "visualizer-grad-1": "#FF8A7A",
    "visualizer-grad-2": "#FF6F61",
    "visualizer-grad-3": "#FEBD11",
    "backdrop-tint": "rgba(255, 255, 255, 0)"
  },
  sunrise: {
    "hero-bg": "linear-gradient(135deg, rgba(255, 230, 220, 0.75) 0%, rgba(255, 240, 230, 0.55) 100%)",
    "input-bg": "linear-gradient(135deg, rgba(255, 210, 190, 0.7) 0%, rgba(255, 225, 210, 0.5) 100%)",
    "output-bg": "linear-gradient(135deg, rgba(255, 245, 200, 0.75) 0%, rgba(255, 250, 220, 0.55) 100%)",
    "download-bg": "linear-gradient(135deg, rgba(255, 200, 180, 0.7) 0%, rgba(255, 220, 200, 0.5) 100%)",
    "vibe-caret": "#FE5F55",
    "vibe-input-text": "#592F1F",
    "vibe-placeholder": "#9E7667",
    "vibe-label-color": "#592F1F",
    "vibe-btn-text": "#592F1F",
    "vibe-active-bg": "#FE5F55",
    "vibe-active-shadow": "rgba(254, 95, 85, 0.3)",
    "zen-bg": "linear-gradient(135deg, rgba(255, 220, 200, 0.75) 0%, rgba(255, 235, 220, 0.55) 100%)",
    "zen-border": "rgba(255, 220, 200, 0.8)",
    "zen-text": "#592F1F",
    "zen-muted": "#8A5C4E",
    "blob-colors": [
      "rgba(255, 95, 85, 0.14)",       // Red/Orange coral
      "rgba(254, 189, 17, 0.12)",      // Deep Gold
      "rgba(255, 182, 193, 0.12)",     // Rosy Pink
      "rgba(255, 228, 181, 0.08)"      // Creamy Peach
    ],
    "blob-glow-colors": [
      "rgba(255, 95, 85, 0.03)",
      "rgba(254, 189, 17, 0.03)",
      "rgba(255, 182, 193, 0.02)",
      "rgba(255, 228, 181, 0.02)"
    ],
    "sine-colors": [
      "rgba(255, 95, 85, 0.20)",
      "rgba(254, 189, 17, 0.15)",
      "rgba(255, 182, 193, 0.12)"
    ],
    "visualizer-grad-1": "#FFB84D",
    "visualizer-grad-2": "#FF5F55",
    "visualizer-grad-3": "#FFD700",
    "backdrop-tint": "rgba(255, 110, 90, 0.07)"
  },
  midnight: {
    "hero-bg": "linear-gradient(135deg, rgba(30, 20, 50, 0.75) 0%, rgba(45, 30, 75, 0.55) 100%)",
    "input-bg": "linear-gradient(135deg, rgba(20, 35, 65, 0.7) 0%, rgba(30, 45, 85, 0.5) 100%)",
    "output-bg": "linear-gradient(135deg, rgba(40, 25, 60, 0.75) 0%, rgba(55, 35, 85, 0.55) 100%)",
    "download-bg": "linear-gradient(135deg, rgba(25, 20, 45, 0.7) 0%, rgba(35, 30, 65, 0.5) 100%)",
    "vibe-caret": "#B39DDB",
    "vibe-input-text": "#E0E6ED",
    "vibe-placeholder": "#8F9BB0",
    "vibe-label-color": "#D1C4E9",
    "vibe-btn-text": "#D1C4E9",
    "vibe-active-bg": "#7E57C2",
    "vibe-active-shadow": "rgba(126, 87, 194, 0.35)",
    "zen-bg": "linear-gradient(135deg, rgba(35, 25, 55, 0.75) 0%, rgba(50, 35, 75, 0.55) 100%)",
    "zen-border": "rgba(126, 87, 194, 0.4)",
    "zen-text": "#EDE7F6",
    "zen-muted": "#B39DDB",
    "blob-colors": [
      "rgba(103, 58, 183, 0.16)",      // Deep Violet
      "rgba(63, 81, 181, 0.12)",       // Indigo
      "rgba(0, 188, 212, 0.08)",       // Cyber Cyan
      "rgba(156, 39, 176, 0.08)"       // Magenta
    ],
    "blob-glow-colors": [
      "rgba(103, 58, 183, 0.04)",
      "rgba(63, 81, 181, 0.03)",
      "rgba(0, 188, 212, 0.02)",
      "rgba(156, 39, 176, 0.02)"
    ],
    "sine-colors": [
      "rgba(103, 58, 183, 0.22)",
      "rgba(63, 81, 181, 0.15)",
      "rgba(0, 188, 212, 0.10)"
    ],
    "visualizer-grad-1": "#B388FF",
    "visualizer-grad-2": "#7C4DFF",
    "visualizer-grad-3": "#00E5FF",
    "backdrop-tint": "rgba(20, 10, 40, 0.42)"
  }
};

let currentVibe = "azure";

// Document ready entrypoint
window.addEventListener("DOMContentLoaded", () => {
  initElements();
  setupAmbientCanvas();
  setupAudioVisualizerCanvas();
  checkSystemStatus();
  renderVoiceList();
  renderOfflineModulesList();
  setupEventHandlers();
  setupCommandPalette();
  initAudioEventListeners();

  // If app loads with downloads hidden (expanded coach mode), auto-start active coach loop
  const container = document.querySelector(".app-container");
  if (container && container.classList.contains("downloads-hidden")) {
    const tabSpeechBtn = document.getElementById("tab-btn-speech");
    if (tabSpeechBtn && tabSpeechBtn.classList.contains("active")) {
      if (speechLoopRequestId) cancelAnimationFrame(speechLoopRequestId);
      lastPhysicsTime = 0;
      speechLoopRequestId = requestAnimationFrame(runSpeechPhysicsLoop);
    } else {
      startBreathingCoach();
    }
  }
});

// Initialize Dom Selectors
function initElements() {
  ambientCanvas = document.getElementById("ambient-canvas") as HTMLCanvasElement;
  audioWaveCanvas = document.getElementById("audio-wave-canvas") as HTMLCanvasElement;
  learnBtn = document.getElementById("learn-btn") as HTMLButtonElement;
  textInput = document.getElementById("text-input") as HTMLTextAreaElement;
  translationText = document.getElementById("translation-text") as HTMLParagraphElement;
  sourceSelect = document.getElementById("source-lang-select") as HTMLSelectElement;
  targetSelect = document.getElementById("target-lang-select") as HTMLSelectElement;
  voiceSelect = document.getElementById("voice-select") as HTMLSelectElement;
  playBtn = document.getElementById("play-btn") as HTMLButtonElement;
  nowPlayingLabel = document.getElementById("now-playing-label") as HTMLSpanElement;
  voiceListContainer = document.getElementById("voice-download-list") as HTMLDivElement;
  moduleListContainer = document.getElementById("translation-download-list") as HTMLDivElement;
  piperStatusText = document.getElementById("piper-status-text") as HTMLParagraphElement;
  installPiperBtn = document.getElementById("install-piper-btn") as HTMLButtonElement;
  commandPalette = document.getElementById("command-palette") as HTMLDivElement;
  paletteSearch = document.getElementById("palette-search") as HTMLInputElement;
  progressContainer = document.querySelector(".playback-progress-container") as HTMLDivElement;
  progressBar = document.getElementById("playback-progress-bar") as HTMLDivElement;
  speedBadge = document.getElementById("speed-badge") as HTMLSpanElement;
  speedSlider = document.getElementById("speed-slider") as HTMLInputElement;
  speedDownBtn = document.getElementById("speed-down-btn") as HTMLButtonElement;
  speedUpBtn = document.getElementById("speed-up-btn") as HTMLButtonElement;
  toggleDownloadsBtn = document.getElementById("toggle-downloads-btn") as HTMLButtonElement;
  charCountSpan = document.getElementById("char-count") as HTMLSpanElement;
  loopBtn = document.getElementById("loop-btn") as HTMLButtonElement;
  speedSelect = document.getElementById("speed-select") as HTMLSelectElement;
  vocal3dWrapper = document.getElementById("speech-vocal3d-wrapper") as HTMLDivElement;
  vocal3dCanvas = document.getElementById("vocal3d-canvas") as HTMLCanvasElement;
}

// Lazy init audio context on user gesture
async function initAudioContext() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128; // 64 frequency bins
      
      sourceNode = audioCtx.createMediaElementSource(currentAudio);
      sourceNode.connect(analyser);
      analyser.connect(audioCtx.destination);
    } catch (e) {
      console.error("Web Audio API initialization failed:", e);
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    try {
      await audioCtx.resume();
    } catch (e) {
      console.error("Failed to resume AudioContext:", e);
    }
  }
}

// Single registration of global audio event listeners
function initAudioEventListeners() {
  currentAudio.addEventListener("play", () => {
    isAudioPlaying = true;
    togglePlayIcon(true);
    nowPlayingLabel.innerText = `Speaking: ${activeVoiceName}`;
    playBtn.disabled = false; // Re-enable so the user can pause it!
    currentAudio.playbackRate = playbackSpeed; // Apply speed settings to new audio
    startPlaybackArticulations();
  });

  currentAudio.addEventListener("pause", () => {
    isAudioPlaying = false;
    togglePlayIcon(false);
    if (currentAudio.currentTime > 0 && !currentAudio.ended) {
      nowPlayingLabel.innerText = "Paused";
    }
    stopPlaybackArticulations();
  });

  currentAudio.addEventListener("ended", () => {
    isAudioPlaying = false;
    togglePlayIcon(false);
    nowPlayingLabel.innerText = "Playback Completed";
    playBtn.disabled = false;
    if (progressBar) {
      progressBar.style.width = "0%";
    }
    stopPlaybackArticulations();
  });

  currentAudio.addEventListener("error", (e) => {
    isAudioPlaying = false;
    togglePlayIcon(false);
    nowPlayingLabel.innerText = "Audio Playback Error";
    playBtn.disabled = false;
    console.error("Audio playback error: ", e);
    if (progressBar) {
      progressBar.style.width = "0%";
    }
    stopPlaybackArticulations();
  });

  currentAudio.addEventListener("timeupdate", () => {
    if (currentAudio.duration && progressBar) {
      const percent = (currentAudio.currentTime / currentAudio.duration) * 100;
      progressBar.style.width = `${percent}%`;
    }
  });
}


// 1. Ambient Cymatic wave simulation and Bioluminescent Organic Blobs
function setupAmbientCanvas() {
  const ctx = ambientCanvas.getContext("2d");
  if (!ctx) return;

  function resize() {
    ambientCanvas.width = window.innerWidth;
    ambientCanvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  // Bioluminescent organic morphing blobs - Warm poolside pastels
  interface Blob {
    phaseX: number;
    phaseY: number;
    phaseRadius: number;
    speedX: number;
    speedY: number;
    speedRadius: number;
    baseRadius: number;
    color: string;
    glowColor: string;
  }

  const blobs: Blob[] = [
    {
      phaseX: 0,
      phaseY: 2,
      phaseRadius: 0,
      speedX: 0.0012,
      speedY: 0.0018,
      speedRadius: 0.003,
      baseRadius: 380,
      color: "rgba(255, 111, 97, 0.13)",     // Sunset Peach/Coral
      glowColor: "rgba(255, 111, 97, 0.03)"
    },
    {
      phaseX: 3,
      phaseY: 0,
      phaseRadius: 1.5,
      speedX: 0.0015,
      speedY: 0.0011,
      speedRadius: 0.002,
      baseRadius: 450,
      color: "rgba(254, 189, 17, 0.08)",    // Warm Yellow/Gold
      glowColor: "rgba(254, 189, 17, 0.02)"
    },
    {
      phaseX: 1.5,
      phaseY: 4.5,
      phaseRadius: 3.1,
      speedX: 0.0008,
      speedY: 0.0014,
      speedRadius: 0.004,
      baseRadius: 320,
      color: "rgba(180, 150, 245, 0.08)",   // Soft Lavender/Lilac
      glowColor: "rgba(180, 150, 245, 0.02)"
    },
    {
      phaseX: 5,
      phaseY: 1,
      phaseRadius: 4.2,
      speedX: 0.0010,
      speedY: 0.0009,
      speedRadius: 0.0025,
      baseRadius: 400,
      color: "rgba(46, 196, 182, 0.06)",    // Soft Mint
      glowColor: "rgba(46, 196, 182, 0.01)"
    }
  ];

  let tick = 0;
  function draw() {
    tick += 0.003;
    const w = ambientCanvas.width;
    const h = ambientCanvas.height;
    ctx!.clearRect(0, 0, w, h);
    
    // Draw biological organic glowing light mesh
    ctx!.globalCompositeOperation = "screen";
    
    const activeBlobColors = vibeThemes[currentVibe]["blob-colors"] as string[];
    const activeBlobGlowColors = vibeThemes[currentVibe]["blob-glow-colors"] as string[];

    blobs.forEach((blob, index) => {
      const color = activeBlobColors[index % activeBlobColors.length];
      const glowColor = activeBlobGlowColors[index % activeBlobGlowColors.length];

      // Calculate morphing coordinate
      const cx = w * 0.5 + Math.sin(blob.phaseX) * (w * 0.35);
      const cy = h * 0.5 + Math.cos(blob.phaseY) * (h * 0.35);
      const r = blob.baseRadius + Math.sin(blob.phaseRadius) * (blob.baseRadius * 0.2);
      
      // Draw smooth radial lighting
      const grad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, color);
      grad.addColorStop(0.4, glowColor);
      grad.addColorStop(1, "transparent");
      
      ctx!.fillStyle = grad;
      ctx!.beginPath();
      ctx!.arc(cx, cy, r, 0, Math.PI * 2);
      ctx!.fill();
      
      // Update phases
      blob.phaseX += blob.speedX;
      blob.phaseY += blob.speedY;
      blob.phaseRadius += blob.speedRadius;
    });

    // Reset composite operation back to source-over for standard lines
    ctx!.globalCompositeOperation = "source-over";

    // Draw 3 layers of beautiful overlapping sine curves - Warm Sunset Tones
    const activeSineColors = vibeThemes[currentVibe]["sine-colors"] as string[];
    for (let layer = 0; layer < 3; layer++) {
      ctx!.beginPath();
      const speedMultiplier = 1.2 + layer * 0.25;
      
      ctx!.strokeStyle = activeSineColors[layer % activeSineColors.length];

      ctx!.lineWidth = layer === 0 ? 2 : 1.2;

      for (let x = 0; x < w; x += 5) {
        const angle = (x * 0.0025) + (tick * speedMultiplier) + layer;
        // Bioluminescence wave shape logic
        const y = (h * 0.5) 
          + Math.sin(angle) * 140 * Math.cos(angle * 0.5)
          + Math.sin(x * 0.006 - tick) * 40;
        
        if (x === 0) {
          ctx!.moveTo(x, y);
        } else {
          ctx!.lineTo(x, y);
        }
      }
      ctx!.stroke();
    }

    requestAnimationFrame(draw);
  }
  draw();
}

// 2. Symmetrical Audio Scrubber/Visualizer Waveform (Resting state & Pulsing playing state)
let visualizerTick = 0;
function setupAudioVisualizerCanvas() {
  const ctx = audioWaveCanvas.getContext("2d");
  if (!ctx) return;

  function resize() {
    if (audioWaveCanvas.parentElement) {
      audioWaveCanvas.width = audioWaveCanvas.parentElement.clientWidth;
      audioWaveCanvas.height = audioWaveCanvas.parentElement.clientHeight;
    }
  }
  
  if (typeof ResizeObserver !== 'undefined' && audioWaveCanvas.parentElement) {
    const observer = new ResizeObserver(() => {
      resize();
    });
    observer.observe(audioWaveCanvas.parentElement);
  } else {
    resize();
    window.addEventListener("resize", resize);
  }

  function draw() {
    ctx!.clearRect(0, 0, audioWaveCanvas.width, audioWaveCanvas.height);
    visualizerTick += isAudioPlaying ? 0.25 : 0.02;

    const width = audioWaveCanvas.width;
    const height = audioWaveCanvas.height;
    const midY = height / 2;

    // Draw horizontal timeline resting line
    ctx!.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx!.lineWidth = 1;
    ctx!.beginPath();
    ctx!.moveTo(0, midY);
    ctx!.lineTo(width, midY);
    ctx!.stroke();

    // Draw high-end modern audio bars/lines
    const barWidth = 3;
    const barGap = 3;
    const barCount = Math.floor(width / (barWidth + barGap));
    
    // Read dynamic frequency byte data if audio is playing and analyser is active
    let dataArray: Uint8Array | null = null;
    if (analyser && isAudioPlaying) {
      const bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);
    }

    for (let i = 0; i < barCount; i++) {
      const distanceFromCenter = Math.abs(i - barCount / 2) / (barCount / 2);
      const x = i * (barWidth + barGap);
      
      let barHeight = 2; // resting height minimum

      if (dataArray && isAudioPlaying) {
        // Symmetrical frequency mapping: bass in the center, treble at the outer edges
        const centerIndex = barCount / 2;
        const dist = Math.abs(i - centerIndex);
        // Map distance from center to frequency bin index
        const normalizedDist = dist / centerIndex;
        const binIndex = Math.floor(normalizedDist * (dataArray.length - 1));
        
        // Read byte value: 0 to 255
        const value = dataArray[binIndex];
        const percent = value / 255;
        
        // Symmetrical bell weight overlay so the edges taper off beautifully
        const bellWeight = Math.max(0, 1 - distanceFromCenter * 0.4);
        
        barHeight = Math.max(3, percent * height * 0.95 * bellWeight);
      } else {
        // Bell-shaped resting visualizer curve (pulsing sines)
        const amplitude = Math.max(0, 1 - distanceFromCenter);
        const noise = Math.sin(i * 0.15 + visualizerTick) * Math.cos(i * 0.05 + visualizerTick * 0.5);
        barHeight = Math.max(2, (amplitude * height * 0.25) * (0.7 + Math.abs(noise) * 0.3));
      }

      // Symmetrical Gradient for active visualizer bars (color synced to active vibe)
      if (isAudioPlaying) {
        const grad = ctx!.createLinearGradient(x, midY - barHeight / 2, x, midY + barHeight / 2);
        grad.addColorStop(0, vibeThemes[currentVibe]["visualizer-grad-1"] as string);
        grad.addColorStop(0.5, vibeThemes[currentVibe]["visualizer-grad-2"] as string);
        grad.addColorStop(1, vibeThemes[currentVibe]["visualizer-grad-3"] as string);
        ctx!.fillStyle = grad;
      } else {
        // Symmetrical subtle glow matched to active vibe colors when idle
        ctx!.fillStyle = currentVibe === "midnight"
          ? "rgba(179, 157, 219, 0.25)"
          : currentVibe === "sunrise"
            ? "rgba(254, 95, 85, 0.20)"
            : "rgba(255, 255, 255, 0.18)";
      }

      // Draw symmetrical bars
      ctx!.fillRect(x, midY - barHeight / 2, barWidth, barHeight);
    }

    requestAnimationFrame(draw);
  }
  draw();
}

// 3. System status & Piper.exe verify
async function checkSystemStatus() {
  try {
    isPiperInstalled = await invoke("is_piper_downloaded");
    updatePiperStatusUI();
    
    // Check if voice models are downloaded
    for (const voice of voicePacks) {
      voice.downloaded = await invoke("is_voice_downloaded", { modelName: voice.modelName });
    }
    renderVoiceList();
    updateVoicePicker();
  } catch (err) {
    console.error("Error verifying system status: ", err);
    piperStatusText.innerText = "Error checking engine";
  }
}

function updatePiperStatusUI() {
  if (isPiperInstalled) {
    piperStatusText.innerText = "Local Neural Engine Ready";
    piperStatusText.style.color = "var(--cyan)";
    installPiperBtn.classList.add("hidden");
  } else {
    piperStatusText.innerText = "Engine Not Installed (Offline Unavailable)";
    piperStatusText.style.color = "var(--text-muted)";
    installPiperBtn.classList.remove("hidden");
  }
}

// Update voice speaker dropdown list dynamically
function updateVoicePicker() {
  if (!voiceSelect) return;
  voiceSelect.innerHTML = "";

  const matchingVoices = voicePacks.filter(v => v.lang === activeTargetLanguage);

  if (matchingVoices.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.innerText = "No voices available";
    option.disabled = true;
    voiceSelect.appendChild(option);
    return;
  }

  matchingVoices.forEach(voice => {
    const option = document.createElement("option");
    option.value = voice.id;
    const statusLabel = voice.downloaded ? "Offline" : "Online Download Required";
    option.innerText = `${voice.name} (${statusLabel})`;
    voiceSelect.appendChild(option);
  });

  // Default selection: select the first downloaded voice, or fall back to the first voice in the list
  const firstDownloaded = matchingVoices.find(v => v.downloaded);
  if (firstDownloaded) {
    voiceSelect.value = firstDownloaded.id;
  } else if (matchingVoices.length > 0) {
    voiceSelect.value = matchingVoices[0].id;
  }
}

// 4. Render voice packs list with download buttons
function renderVoiceList() {
  voiceListContainer.innerHTML = "";
  
  voicePacks.forEach(voice => {
    const item = document.createElement("div");
    item.className = "voice-item";
    
    const mainRow = document.createElement("div");
    mainRow.className = "item-main-row";
    
    const details = document.createElement("div");
    details.className = "item-details";
    
    const h4 = document.createElement("h4");
    h4.innerText = voice.name;
    
    const p = document.createElement("p");
    p.innerText = voice.downloaded 
      ? "Fully Available Offline" 
      : voice.downloading 
        ? "Downloading voice pack..." 
        : "Click to download pack (medium quality)";
    
    details.appendChild(h4);
    details.appendChild(p);
    
    mainRow.appendChild(details);
    
    // Status/Action button
    if (!voice.downloaded && !voice.downloading) {
      const btn = document.createElement("button");
      btn.className = "download-small-btn";
      btn.innerText = "Download";
      btn.addEventListener("click", () => startVoiceDownload(voice));
      mainRow.appendChild(btn);
    } else if (voice.downloaded) {
      const indicator = document.createElement("span");
      indicator.innerText = "✓ Ready";
      indicator.style.color = "var(--cyan)";
      indicator.style.fontSize = "0.75rem";
      indicator.style.fontWeight = "600";
      mainRow.appendChild(indicator);
    }
    
    item.appendChild(mainRow);
    
    // Progress bar for active downloading
    if (voice.downloading) {
      const progressContainer = document.createElement("div");
      progressContainer.className = "progress-container";
      
      const barBg = document.createElement("div");
      barBg.className = "progress-bar-bg";
      
      const fill = document.createElement("div");
      fill.className = "progress-bar-fill";
      fill.style.width = `${voice.progress}%`;
      
      const percent = document.createElement("span");
      percent.className = "progress-percent";
      percent.innerText = `${voice.progress}%`;
      
      barBg.appendChild(fill);
      progressContainer.appendChild(barBg);
      progressContainer.appendChild(percent);
      item.appendChild(progressContainer);
    }
    
    voiceListContainer.appendChild(item);
  });
}

// Start voice pack download sequence
async function startVoiceDownload(voice: VoicePack) {
  voice.downloading = true;
  voice.progress = 5; // Starting indicator
  renderVoiceList();
  
  // Simulate incremental download speed internally since powershell completes in one block
  const progressInterval = setInterval(() => {
    if (voice.progress < 90) {
      voice.progress += Math.floor(Math.random() * 8) + 2;
      renderVoiceList();
    }
  }, 400);

  try {
    await invoke("download_voice", {
      modelName: voice.modelName,
      modelUrl: voice.modelUrl,
      configUrl: voice.configUrl
    });
    
    clearInterval(progressInterval);
    voice.progress = 100;
    voice.downloading = false;
    voice.downloaded = true;
    renderVoiceList();
    updateVoicePicker();
  } catch (err) {
    clearInterval(progressInterval);
    voice.downloading = false;
    voice.progress = 0;
    renderVoiceList();
    alert(`Failed to download voice pack: ${err}`);
  }
}

// 5. Render Offline translation modules list
function renderOfflineModulesList() {
  moduleListContainer.innerHTML = "";
  
  offlineModules.forEach(mod => {
    const item = document.createElement("div");
    item.className = "module-item";
    
    const mainRow = document.createElement("div");
    mainRow.className = "item-main-row";
    
    const details = document.createElement("div");
    details.className = "item-details";
    
    const h4 = document.createElement("h4");
    h4.innerText = mod.name;
    
    const p = document.createElement("p");
    p.innerText = mod.downloaded 
      ? `Cached locally (${mod.size})` 
      : mod.downloading 
        ? "Downloading translation dictionary..." 
        : `Download dictionary (${mod.size})`;
    
    details.appendChild(h4);
    details.appendChild(p);
    
    mainRow.appendChild(details);
    
    if (!mod.downloaded && !mod.downloading) {
      const btn = document.createElement("button");
      btn.className = "download-small-btn";
      btn.innerText = "Download";
      btn.addEventListener("click", () => startModuleDownload(mod));
      mainRow.appendChild(btn);
    } else if (mod.downloaded) {
      const indicator = document.createElement("span");
      indicator.innerText = "✓ Active";
      indicator.style.color = "var(--cyan)";
      indicator.style.fontSize = "0.75rem";
      indicator.style.fontWeight = "600";
      mainRow.appendChild(indicator);
    }
    
    item.appendChild(mainRow);
    
    if (mod.downloading) {
      const progressContainer = document.createElement("div");
      progressContainer.className = "progress-container";
      
      const barBg = document.createElement("div");
      barBg.className = "progress-bar-bg";
      
      const fill = document.createElement("div");
      fill.className = "progress-bar-fill";
      fill.style.width = `${mod.progress}%`;
      
      const percent = document.createElement("span");
      percent.className = "progress-percent";
      percent.innerText = `${mod.progress}%`;
      
      barBg.appendChild(fill);
      progressContainer.appendChild(barBg);
      progressContainer.appendChild(percent);
      item.appendChild(progressContainer);
    }
    
    moduleListContainer.appendChild(item);
  });
}

function startModuleDownload(mod: OfflineModule) {
  mod.downloading = true;
  mod.progress = 0;
  renderOfflineModulesList();
  
  const timer = setInterval(() => {
    if (mod.progress < 100) {
      mod.progress += Math.floor(Math.random() * 15) + 5;
      if (mod.progress >= 100) {
        mod.progress = 100;
        mod.downloading = false;
        mod.downloaded = true;
        clearInterval(timer);
      }
      renderOfflineModulesList();
    }
  }, 300);
}

// 6. Install Piper speech engine binary call
async function startPiperInstallation() {
  installPiperBtn.disabled = true;
  piperStatusText.innerText = "Downloading Piper Engine (70MB)...";
  
  try {
    await invoke("download_piper");
    isPiperInstalled = true;
    updatePiperStatusUI();
  } catch (err) {
    installPiperBtn.disabled = false;
    piperStatusText.innerText = "Installation failed";
    alert(`Failed to download and extract Piper.exe: ${err}`);
  }
}

// 7. Core Translation logic (Free MyMemory API online + simulated dictionary fallback offline)
async function performTranslation(text: string, src: string, target: string): Promise<string> {
  const isOnline = navigator.onLine;
  
  // If Target is same as source, skip
  if (src === target) return text;

  if (isOnline) {
    try {
      // Map 'auto' to 'autodetect' for MyMemory API
      const apiSrc = src === "auto" ? "autodetect" : src;
      const pair = `${apiSrc}|${target}`;
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${pair}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.responseData && data.responseData.translatedText) {
        return data.responseData.translatedText;
      }
    } catch (e) {
      console.warn("Online translation failed, falling back to local: ", e);
    }
  }

  // Offline / fallback translation (checks if matching offline module is active)
  const isModuleActive = offlineModules.find(m => m.id === `trans-${target}`)?.downloaded;
  if (!isModuleActive) {
    throw new Error("You are offline. Please download the offline translation module for this language first!");
  }

  // High-precision custom dictionary fallback for test strings
  const dict: { [key: string]: { [key: string]: string } } = {
    "es": {
      "hello": "hola", "good morning": "buenos días", "thank you": "gracias", 
      "master your aura": "domina tu aura", "welcome": "bienvenido", 
      "aura language companion": "compañero de idiomas aura"
    },
    "fr": {
      "hello": "bonjour", "good morning": "bonjour", "thank you": "merci",
      "master your aura": "maîtrisez votre aura", "welcome": "bienvenue",
      "aura language companion": "compagnon linguistique aura"
    },
    "ja": {
      "hello": "こんにちは (Konnichiwa)", "good morning": "おはようございます (Ohayou gozaimasu)",
      "thank you": "ありがとう (Arigatou)", "master your aura": "あなたのオーラをマスターする (Anata no ōra o masutā suru)",
      "welcome": "歓迎 (Kangei)"
    }
  };

  const cleanText = text.toLowerCase().trim();
  if (dict[target] && dict[target][cleanText]) {
    return dict[target][cleanText];
  }

  return `[Offline Translation]: ${text} (Simulated translation to ${target.toUpperCase()})`;
}

// 8. Speech synthesis call to Rust + Webview Asset play
async function speakTranslation() {
  const textToSpeak = translationText.innerText;
  
  if (!textToSpeak || textToSpeak.startsWith("Translated text")) return;
  
  // Find matching voice model from dynamic selection
  const voice = voicePacks.find(v => v.id === voiceSelect.value) || voicePacks.find(v => v.lang === activeTargetLanguage);
  
  if (!voice) {
    alert("Pronunciation voice pack not found for this language!");
    return;
  }
  
  if (!voice.downloaded) {
    alert(`Please download the offline voice pack: "${voice.name}" first in the Download Center!`);
    return;
  }
  
  if (!isPiperInstalled) {
    alert("Piper speech engine is not installed. Please click 'Install Engine' first!");
    return;
  }

  // Check caching layer: if text and voice match, replay instantly
  if (textToSpeak === lastSynthesizedText && voice.id === lastSynthesizedVoiceId && currentAudio.src) {
    playBtn.disabled = true;
    nowPlayingLabel.innerText = "Playing Cached Audio...";
    await initAudioContext();
    activeVoiceName = voice.name;
    currentAudio.currentTime = 0;
    currentAudio.play().catch(err => {
      console.warn("Cached playback failed, synthesising fresh:", err);
      synthesizeAndPlay(textToSpeak, voice);
    });
    return;
  }

  await synthesizeAndPlay(textToSpeak, voice);
}

// Separate helper for synthesis & playback
async function synthesizeAndPlay(textToSpeak: string, voice: VoicePack) {
  playBtn.disabled = true;
  nowPlayingLabel.innerText = "Synthesizing Audio...";
  
  try {
    const wavPath: string = await invoke("synthesize_speech", {
      text: textToSpeak,
      modelName: voice.modelName
    });

    // In Tauri 2, we load the file via tauri's asset protocol convertFileSrc
    const fileSrc = convertFileSrc(wavPath);
    
    // Store in cache
    lastSynthesizedText = textToSpeak;
    lastSynthesizedVoiceId = voice.id;
    
    // Stop currently playing audio
    currentAudio.pause();
    
    await initAudioContext();
    activeVoiceName = voice.name;
    // Append unique timestamp to bypass webview's asset cache for identical file paths
    currentAudio.src = `${fileSrc}?t=${Date.now()}`;
    currentAudio.load();
    currentAudio.play();
  } catch (err) {
    playBtn.disabled = false;
    nowPlayingLabel.innerText = "Synthesis Failed";
    alert(`Speech synthesis error: ${err}`);
  }
}

function syncPlaybackSpeedUI() {
  currentAudio.playbackRate = playbackSpeed;
  if (speedBadge) {
    speedBadge.innerText = `${playbackSpeed.toFixed(2)}x`;
  }
  if (speedSlider) {
    speedSlider.value = playbackSpeed.toString();
  }
  if (speedSelect) {
    const fixedVal = playbackSpeed.toFixed(2);
    let found = false;
    for (let i = 0; i < speedSelect.options.length; i++) {
      if (speedSelect.options[i].value === fixedVal) {
        speedSelect.value = fixedVal;
        found = true;
        break;
      }
    }
    if (!found) {
      let customOpt = speedSelect.querySelector("option[data-custom='true']") as HTMLOptionElement;
      if (!customOpt) {
        customOpt = document.createElement("option");
        customOpt.setAttribute("data-custom", "true");
        speedSelect.appendChild(customOpt);
      }
      customOpt.value = fixedVal;
      customOpt.innerText = `${fixedVal}x (Custom)`;
      speedSelect.value = fixedVal;
    } else {
      const customOpt = speedSelect.querySelector("option[data-custom='true']");
      if (customOpt) customOpt.remove();
    }
  }
}

function adjustPlaybackSpeed(delta: number) {
  playbackSpeed = Math.max(0.25, Math.min(3.00, playbackSpeed + delta));
  playbackSpeed = Math.round(playbackSpeed * 100) / 100;
  syncPlaybackSpeedUI();
}

function togglePlayIcon(playing: boolean) {
  const playIcon = document.getElementById("play-icon");
  const pauseIcon = document.getElementById("pause-icon");
  if (playing) {
    playIcon?.classList.add("hidden");
    pauseIcon?.classList.remove("hidden");
  } else {
    playIcon?.classList.remove("hidden");
    pauseIcon?.classList.add("hidden");
  }
}

// Setup Dom Events
function setupEventHandlers() {
  // Initialize dynamic voice picker selector
  updateVoicePicker();

  // Text Area Input Real-time Limit and Character Counter
  if (textInput) {
    textInput.addEventListener("input", () => {
      let text = textInput.value;
      if (text.length > 500) {
        text = text.substring(0, 500);
        textInput.value = text;
      }
      if (charCountSpan) {
        charCountSpan.innerText = text.length.toString();
      }
    });
  }

  // Target Language Selector change observer
  if (targetSelect) {
    targetSelect.addEventListener("change", () => {
      activeTargetLanguage = targetSelect.value;
      updateVoicePicker();
      // Clear cache on language change to prevent speaking old cached translations
      lastSynthesizedText = "";
      lastSynthesizedVoiceId = "";
    });
  }

  // Voice selector change observer: resets cache registers so the new voice is immediately synthesized
  if (voiceSelect) {
    voiceSelect.addEventListener("change", () => {
      lastSynthesizedText = "";
      lastSynthesizedVoiceId = "";
    });
  }

  // Toggle downloads button click observer
  if (toggleDownloadsBtn) {
    toggleDownloadsBtn.addEventListener("click", () => {
      toggleDownloadCenter();
    });
  }

  // Wire up Vibe pills controllers inside Hero Banner
  const vibeButtons = document.querySelectorAll(".vibe-btn");
  vibeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const vibe = btn.getAttribute("data-vibe");
      if (vibe) {
        switchAestheticVibe(vibe);
      }
    });
  });

  // Wire up Zen Soundscape button toggle
  const soundscapeBtn = document.getElementById("zen-sound-btn");
  if (soundscapeBtn) {
    soundscapeBtn.addEventListener("click", () => {
      toggleZenSoundscape();
    });
  }

  // Install Piper btn
  installPiperBtn.addEventListener("click", startPiperInstallation);

  // Start Learning Button
  learnBtn.addEventListener("click", async () => {
    const text = textInput.value.trim();
    if (!text) return;
    
    const src = sourceSelect.value;
    const target = targetSelect.value;
    activeTargetLanguage = target;

    learnBtn.innerText = "Translating...";
    learnBtn.disabled = true;
    translationText.innerText = "Performing high-precision translation...";

    try {
      const translated = await performTranslation(text, src, target);
      translationText.innerText = translated;
      translationText.classList.remove("placeholder-text");
      
      // Enable play button
      playBtn.disabled = false;
      nowPlayingLabel.innerText = "Speech Pronunciation Ready";
    } catch (err: any) {
      translationText.innerText = err.message || "Translation error occurred.";
      translationText.classList.add("placeholder-text");
      playBtn.disabled = true;
      nowPlayingLabel.innerText = "Idle";
    } finally {
      learnBtn.innerText = "Start Learning";
      learnBtn.disabled = false;
    }
  });

  // Play Button
  playBtn.addEventListener("click", async () => {
    const textToSpeak = translationText.innerText;
    const voiceId = voiceSelect.value;

    if (isAudioPlaying) {
      currentAudio.pause();
    } else {
      // Check if we can resume the existing audio
      const isSameTextAndVoice = textToSpeak === lastSynthesizedText && voiceId === lastSynthesizedVoiceId;
      const hasAudioLoaded = !!currentAudio.src;
      const isPausedMidStream = currentAudio.currentTime > 0 && !currentAudio.ended;

      if (isSameTextAndVoice && hasAudioLoaded && isPausedMidStream) {
        await initAudioContext();
        currentAudio.play().catch(err => {
          console.error("Resume failed, falling back to full synthesis:", err);
          speakTranslation();
        });
      } else {
        await speakTranslation();
      }
    }
  });

  // Offline status tracking
  window.addEventListener("online", updateNetworkUI);
  window.addEventListener("offline", updateNetworkUI);

  // Click on progress container to seek/scrub
  if (progressContainer) {
    progressContainer.addEventListener("click", (e) => {
      if (!currentAudio.duration || isNaN(currentAudio.duration)) return;
      const rect = progressContainer.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const percentage = clickX / width;
      currentAudio.currentTime = percentage * currentAudio.duration;
    });
  }

  // Loop button handler
  if (loopBtn) {
    loopBtn.addEventListener("click", () => {
      isAudioLoopActive = !isAudioLoopActive;
      loopBtn.classList.toggle("active", isAudioLoopActive);
      currentAudio.loop = isAudioLoopActive;
    });
  }

  // Speed badge reset click support
  if (speedBadge) {
    speedBadge.addEventListener("click", () => {
      adjustPlaybackSpeed(1.00 - playbackSpeed);
    });
  }

  // Speed slider drag support
  if (speedSlider) {
    speedSlider.addEventListener("input", () => {
      const val = parseFloat(speedSlider.value);
      playbackSpeed = val;
      syncPlaybackSpeedUI();
    });
  }

  // Speed select dropdown change support
  if (speedSelect) {
    speedSelect.addEventListener("change", () => {
      playbackSpeed = parseFloat(speedSelect.value);
      syncPlaybackSpeedUI();
    });
  }

  // Speed step down button click
  if (speedDownBtn) {
    speedDownBtn.addEventListener("click", () => {
      adjustPlaybackSpeed(-0.05);
    });
  }

  // Speed step up button click
  if (speedUpBtn) {
    speedUpBtn.addEventListener("click", () => {
      adjustPlaybackSpeed(0.05);
    });
  }

  // Keyboard shortcut listener for playback speed
  window.addEventListener("keydown", (e) => {
    // If user is focused on textbox or input, ignore shortcuts
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA")) {
      return;
    }

    if (e.shiftKey && (e.key === "<" || e.key === ",")) {
      e.preventDefault();
      adjustPlaybackSpeed(-0.05);
    }
    if (e.shiftKey && (e.key === ">" || e.key === ".")) {
      e.preventDefault();
      adjustPlaybackSpeed(0.05);
    }
  });

  // Wire up tabs inside Zen Focus panel (Breathing vs Mouth Physics)
  const tabBreathingBtn = document.getElementById("tab-btn-breathing");
  const tabSpeechBtn = document.getElementById("tab-btn-speech");
  const panelBreathing = document.getElementById("zen-panel-breathing");
  const panelSpeech = document.getElementById("zen-panel-speech");

  if (tabBreathingBtn && tabSpeechBtn && panelBreathing && panelSpeech) {
    tabBreathingBtn.addEventListener("click", () => {
      tabBreathingBtn.classList.add("active");
      tabSpeechBtn.classList.remove("active");
      panelBreathing.classList.add("active");
      panelSpeech.classList.remove("active");

      // Stop speech physics loop to save CPU
      if (speechLoopRequestId) {
        cancelAnimationFrame(speechLoopRequestId);
        speechLoopRequestId = null;
      }
      // Start breathing coach if downloads are hidden
      const container = document.querySelector(".app-container");
      if (container && container.classList.contains("downloads-hidden")) {
        startBreathingCoach();
      }
    });

    tabSpeechBtn.addEventListener("click", () => {
      tabSpeechBtn.classList.add("active");
      tabBreathingBtn.classList.remove("active");
      panelSpeech.classList.add("active");
      panelBreathing.classList.remove("active");

      // Stop breathing coach
      if (breathingInterval) {
        clearInterval(breathingInterval);
        breathingInterval = null;
      }
      // Start speech loop if downloads are hidden
      const container = document.querySelector(".app-container");
      if (container && container.classList.contains("downloads-hidden")) {
        if (speechLoopRequestId) cancelAnimationFrame(speechLoopRequestId);
        lastPhysicsTime = 0;
        speechLoopRequestId = requestAnimationFrame(runSpeechPhysicsLoop);
      }
    });
  }

  // Wire up view switcher button clicks for "Sagittal View", "Acoustic Tube", and "3D Vocal View"
  const viewSagittalBtn = document.getElementById("view-btn-sagittal");
  const viewWaveguideBtn = document.getElementById("view-btn-waveguide");
  const viewVocal3dBtn = document.getElementById("view-btn-vocal3d");
  const svgWrapper = document.getElementById("speech-svg-wrapper");
  const waveguideWrapper = document.getElementById("speech-waveguide-wrapper");

  if (viewSagittalBtn && viewWaveguideBtn && viewVocal3dBtn && svgWrapper && waveguideWrapper && vocal3dWrapper) {
    viewSagittalBtn.addEventListener("click", () => {
      viewSagittalBtn.classList.add("active");
      viewWaveguideBtn.classList.remove("active");
      viewVocal3dBtn.classList.remove("active");
      speechViewMode = "sagittal";
      svgWrapper.className = "speech-view-active";
      waveguideWrapper.className = "speech-view-hidden";
      vocal3dWrapper.className = "speech-view-hidden";
    });

    viewWaveguideBtn.addEventListener("click", () => {
      viewWaveguideBtn.classList.add("active");
      viewSagittalBtn.classList.remove("active");
      viewVocal3dBtn.classList.remove("active");
      speechViewMode = "waveguide";
      svgWrapper.className = "speech-view-hidden";
      waveguideWrapper.className = "speech-view-active";
      vocal3dWrapper.className = "speech-view-hidden";
    });

    viewVocal3dBtn.addEventListener("click", () => {
      viewVocal3dBtn.classList.add("active");
      viewSagittalBtn.classList.remove("active");
      viewWaveguideBtn.classList.remove("active");
      speechViewMode = "vocal3d";
      svgWrapper.className = "speech-view-hidden";
      waveguideWrapper.className = "speech-view-hidden";
      vocal3dWrapper.className = "speech-view-active";
    });
  }

  // Setup 3D rotation dragging events
  setupVocal3DCanvas();
}

function updateNetworkUI() {
  const dot = document.querySelector(".status-dot") as HTMLSpanElement;
  const text = document.querySelector(".status-text") as HTMLSpanElement;
  if (navigator.onLine) {
    dot.className = "status-dot online";
    text.innerText = "Online Mode";
  } else {
    dot.className = "status-dot offline";
    text.innerText = "Offline Mode";
  }
}

// 9. Custom Ctrl+K Command Palette Setup & Navigation
function setupCommandPalette() {
  commandPalette = document.getElementById("command-palette") as HTMLDivElement;
  paletteSearch = document.getElementById("palette-search") as HTMLInputElement;
  paletteItems = document.querySelectorAll(".palette-item") as NodeListOf<HTMLDivElement>;

  // Toggle command palette on Ctrl+K
  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "k") {
      e.preventDefault();
      togglePalette();
    }
    
    // Shortcut for toggle offline: Ctrl+Shift+O
    if (e.ctrlKey && e.shiftKey && e.key === "O") {
      e.preventDefault();
      toggleOfflineSimulation();
    }

    // Shortcut for toggle download center: Ctrl+Shift+D or Ctrl+H
    if ((e.ctrlKey && e.shiftKey && e.key === "D") || (e.ctrlKey && e.key === "h")) {
      e.preventDefault();
      toggleDownloadCenter();
    }
  });

  // Close command palette on click outside
  commandPalette.addEventListener("click", (e) => {
    if (e.target === commandPalette) {
      togglePalette();
    }
  });

  // Keyboard navigation inside palette
  let activeIndex = 0;
  
  paletteSearch.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      togglePalette();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = (activeIndex + 1) % paletteItems.length;
      updateActivePaletteItem();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = (activeIndex - 1 + paletteItems.length) % paletteItems.length;
      updateActivePaletteItem();
    } else if (e.key === "Enter") {
      e.preventDefault();
      triggerPaletteAction(paletteItems[activeIndex]);
    }
  });

  // Item click support
  paletteItems.forEach((item, index) => {
    item.addEventListener("click", () => {
      activeIndex = index;
      updateActivePaletteItem();
      triggerPaletteAction(item);
    });
  });

  function updateActivePaletteItem() {
    paletteItems.forEach((item, index) => {
      if (index === activeIndex) {
        item.classList.add("active");
        item.scrollIntoView({ block: "nearest" });
      } else {
        item.classList.remove("active");
      }
    });
  }

  function togglePalette() {
    if (commandPalette.classList.contains("hidden")) {
      commandPalette.classList.remove("hidden");
      paletteSearch.value = "";
      paletteSearch.focus();
      activeIndex = 0;
      updateActivePaletteItem();
    } else {
      commandPalette.classList.add("hidden");
      textInput.focus();
    }
  }

  function toggleOfflineSimulation() {
    // Modify onLine property simulation
    Object.defineProperty(navigator, 'onLine', {
      value: !navigator.onLine,
      configurable: true
    });
    updateNetworkUI();
    nowPlayingLabel.innerText = `Switched to ${navigator.onLine ? "ONLINE" : "OFFLINE"}`;
  }

  function triggerPaletteAction(item: HTMLDivElement) {
    const action = item.getAttribute("data-action");
    togglePalette(); // close first

    if (action === "toggle-offline") {
      toggleOfflineSimulation();
    } else if (action === "toggle-downloads") {
      toggleDownloadCenter();
    } else if (action === "open-downloads") {
      document.querySelector(".download-card")?.scrollIntoView({ behavior: "smooth" });
    } else if (action === "clear-input") {
      textInput.value = "";
      translationText.innerText = "Translated text will appear here...";
      translationText.classList.add("placeholder-text");
      playBtn.disabled = true;
    } else if (action === "switch-es") {
      targetSelect.value = "es";
    } else if (action === "switch-ja") {
      targetSelect.value = "ja";
    }
  }
}

// Toggle Aesthetic Download Center off/on and update UI buttons
function toggleDownloadCenter() {
  const container = document.querySelector(".app-container");
  if (!container) return;

  const isHidden = container.classList.toggle("downloads-hidden");

  if (isHidden) {
    // If expanded, check which tab is active and start the corresponding loop
    const tabSpeechBtn = document.getElementById("tab-btn-speech");
    if (tabSpeechBtn && tabSpeechBtn.classList.contains("active")) {
      if (speechLoopRequestId) cancelAnimationFrame(speechLoopRequestId);
      lastPhysicsTime = 0;
      speechLoopRequestId = requestAnimationFrame(runSpeechPhysicsLoop);
    } else {
      startBreathingCoach();
    }
  } else {
    // Stop Zen Audio Synthesizer immediately if closed to conserve sound waves
    if (isZenSoundActive) {
      toggleZenSoundscape();
    }
    // Clean breathing coach interval
    if (breathingInterval) {
      clearInterval(breathingInterval);
      breathingInterval = null;
    }
    // Stop speech physics loop
    if (speechLoopRequestId) {
      cancelAnimationFrame(speechLoopRequestId);
      speechLoopRequestId = null;
    }
  }

  if (toggleDownloadsBtn) {
    const btnText = toggleDownloadsBtn.querySelector(".btn-text");
    const svgIcon = toggleDownloadsBtn.querySelector("svg");
    
    if (btnText) {
      btnText.textContent = isHidden ? "Show Downloads" : "Hide Downloads";
    }
    
    if (svgIcon) {
      if (isHidden) {
        // Eye-slashed / Show icon
        svgIcon.innerHTML = `<path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0-4C7 3 2.73 6.11 1 10.5 2.73 14.89 7 18 12 18s9.27-3.11 11-7.5C21.27 6.11 17 3 12 3zm0 13c-3.04 0-5.5-2.46-5.5-5.5S8.96 5 12 5s5.5 2.46 5.5 5.5S15.04 16 12 16z"/>`;
        toggleDownloadsBtn.title = "Show Download Center (Ctrl+Shift+D or Ctrl+H)";
      } else {
        // Standard eye / Hide icon
        svgIcon.innerHTML = `<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>`;
        toggleDownloadsBtn.title = "Hide Download Center (Ctrl+Shift+D or Ctrl+H)";
      }
    }
  }
}

// ============================================================================
// 1. Aesthetic Vibe Themes Swapper
// ============================================================================
function switchAestheticVibe(vibeId: string) {
  if (!vibeThemes[vibeId]) return;
  currentVibe = vibeId;
  
  const buttons = document.querySelectorAll(".vibe-btn");
  buttons.forEach(btn => {
    const dataVibe = btn.getAttribute("data-vibe");
    btn.classList.toggle("active", dataVibe === vibeId);
  });

  const themeVars = vibeThemes[vibeId];
  const root = document.documentElement;

  Object.keys(themeVars).forEach(key => {
    if (key === "blob-colors" || key === "blob-glow-colors" || key === "sine-colors") return;
    if (typeof themeVars[key] === "string") {
      root.style.setProperty(`--${key}`, themeVars[key] as string);
    }
  });

  let tintOverlay = document.getElementById("vibe-tint-overlay");
  if (!tintOverlay) {
    tintOverlay = document.createElement("div");
    tintOverlay.id = "vibe-tint-overlay";
    tintOverlay.style.position = "absolute";
    tintOverlay.style.top = "0";
    tintOverlay.style.left = "0";
    tintOverlay.style.width = "100%";
    tintOverlay.style.height = "100%";
    tintOverlay.style.zIndex = "1";
    tintOverlay.style.pointerEvents = "none";
    tintOverlay.style.transition = "background 1s ease";
    document.body.appendChild(tintOverlay);
  }
  tintOverlay.style.background = themeVars["backdrop-tint"] as string;

  root.style.setProperty("--breathing-grad", `linear-gradient(135deg, ${themeVars["visualizer-grad-1"]} 0%, ${themeVars["visualizer-grad-2"]} 100%)`);
  root.style.setProperty("--breathing-shadow", `${themeVars["visualizer-grad-2"]}40`);
  root.style.setProperty("--breathing-shadow-glow", `${themeVars["visualizer-grad-2"]}80`);
}

// ============================================================================
// 2. Web Audio API Serene Offline Synthesizer
// ============================================================================
let zenAudioCtx: AudioContext | null = null;
let osc1: OscillatorNode | null = null;
let osc2: OscillatorNode | null = null;
let lfo: OscillatorNode | null = null;
let filter: BiquadFilterNode | null = null;
let zenGainNode: GainNode | null = null;
let isZenSoundActive = false;

async function toggleZenSoundscape() {
  const soundBtn = document.getElementById("zen-sound-btn");
  if (!soundBtn) return;
  isZenSoundActive = !isZenSoundActive;
  soundBtn.classList.toggle("active", isZenSoundActive);
  if (isZenSoundActive) {
    await startZenSynth();
  } else {
    stopZenSynth();
  }
}

async function startZenSynth() {
  try {
    if (!zenAudioCtx) {
      zenAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (zenAudioCtx.state === "suspended") {
      await zenAudioCtx.resume();
    }
    stopZenSynth();

    osc1 = zenAudioCtx.createOscillator();
    osc2 = zenAudioCtx.createOscillator();
    lfo = zenAudioCtx.createOscillator();
    filter = zenAudioCtx.createBiquadFilter();
    zenGainNode = zenAudioCtx.createGain();

    osc1.type = "triangle";
    osc1.frequency.setValueAtTime(110, zenAudioCtx.currentTime); // A2 chord
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(110.6, zenAudioCtx.currentTime);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(450, zenAudioCtx.currentTime);
    filter.Q.setValueAtTime(3.5, zenAudioCtx.currentTime);

    lfo.frequency.setValueAtTime(0.083, zenAudioCtx.currentTime); // 12s sweep
    const lfoGain = zenAudioCtx.createGain();
    lfoGain.gain.setValueAtTime(180, zenAudioCtx.currentTime);

    zenGainNode.gain.setValueAtTime(0, zenAudioCtx.currentTime);
    zenGainNode.gain.linearRampToValueAtTime(0.38, zenAudioCtx.currentTime + 2.0);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(zenGainNode);
    zenGainNode.connect(zenAudioCtx.destination);

    osc1.start();
    osc2.start();
    lfo.start();
  } catch (err) {
    console.error("Zen synth failed: ", err);
  }
}

function stopZenSynth() {
  if (zenGainNode && zenAudioCtx) {
    try {
      const current = zenAudioCtx.currentTime;
      zenGainNode.gain.cancelScheduledValues(current);
      zenGainNode.gain.setValueAtTime(zenGainNode.gain.value, current);
      zenGainNode.gain.linearRampToValueAtTime(0, current + 1.0);
    } catch (e) {}
  }
  setTimeout(() => {
    if (!isZenSoundActive) {
      if (osc1) { try { osc1.stop(); } catch(e){} osc1 = null; }
      if (osc2) { try { osc2.stop(); } catch(e){} osc2 = null; }
      if (lfo) { try { lfo.stop(); } catch(e){} lfo = null; }
      if (filter) { filter = null; }
    }
  }, 1100);
}

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

// Helper routines for parsing and linear interpolating
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
    title: "Resting State",
    ipa: "/ə/",
    desc: "Breathe gently. When you play a translation, the speech coach will animate the exact muscle movements and sound wave parameters of spoken words in real time."
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
let speechViewMode: "sagittal" | "waveguide" | "vocal3d" = "sagittal";
let activeSpeechTargetKey = "schwa";

// Weights registers for smooth 60fps easing
const currentWeights: ArticulatoryWeights = { JA: 0.20, TBH: 0.10, TBB: 0.10, TTE: 0.05, VEL: 0.00, LIR: 0.50 };
const targetWeights: ArticulatoryWeights = { JA: 0.20, TBH: 0.10, TBB: 0.10, TTE: 0.05, VEL: 0.00, LIR: 0.50 };

// Trill simulation registers
let isTrilling = false;
let trillAge = 0;
let globalSpeechTime = 0;
let speechLoopRequestId: number | null = null;
let speechPlaybackInterval: any = null;

function triggerActivePhonetics(targetKey: string) {
  if (!SPEECH_TARGETS[targetKey]) return;
  const spec = SPEECH_TARGETS[targetKey];
  activeSpeechTargetKey = targetKey;

  // Copy target weights
  targetWeights.JA = spec.weights.JA;
  targetWeights.TBH = spec.weights.TBH;
  targetWeights.TBB = spec.weights.TBB;
  targetWeights.TTE = spec.weights.TTE;
  targetWeights.VEL = spec.weights.VEL;
  targetWeights.LIR = spec.weights.LIR;

  const wasTrilling = isTrilling;
  isTrilling = (targetKey === "trill");
  if (isTrilling && !wasTrilling) {
    trillAge = 0;
  }

  // Update DOM details panel
  const titleEl = document.getElementById("speech-sound-title");
  const ipaEl = document.getElementById("speech-sound-ipa");
  const descEl = document.getElementById("speech-sound-desc");

  if (titleEl) titleEl.innerText = spec.title;
  if (ipaEl) ipaEl.innerText = spec.ipa;
  if (descEl) descEl.innerText = spec.desc;
}

function startPlaybackArticulations() {
  if (speechPlaybackInterval) {
    clearInterval(speechPlaybackInterval);
    speechPlaybackInterval = null;
  }

  let phonemes: string[] = ["schwa", "i", "a", "u", "schwa"];
  const lang = activeTargetLanguage.toLowerCase();
  if (lang.startsWith("es")) {
    phonemes = ["schwa", "trill", "a", "schwa"];
  } else if (lang.startsWith("fr")) {
    phonemes = ["schwa", "nasal_o", "nasal_a", "schwa"];
  } else if (lang.startsWith("ja")) {
    phonemes = ["schwa", "i", "u", "a", "schwa"];
  }

  let index = 0;
  // Immediately trigger the first phoneme
  triggerActivePhonetics(phonemes[index]);

  speechPlaybackInterval = setInterval(() => {
    index = (index + 1) % phonemes.length;
    triggerActivePhonetics(phonemes[index]);
  }, 450);
}

function stopPlaybackArticulations() {
  if (speechPlaybackInterval) {
    clearInterval(speechPlaybackInterval);
    speechPlaybackInterval = null;
  }
  triggerActivePhonetics("schwa");
}

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
  } else if (speechViewMode === "vocal3d") {
    renderVocal3DCanvas();
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
  let lipsIndex = 0;
  const finalLipsPath = TEMPLATE_LIPS.replace(/-?[\d.]+/g, () => finalLipsCoords[lipsIndex++].toFixed(2));
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

  let tongueIndex = 0;
  const finalTonguePath = TEMPLATE_TONGUE.replace(/-?[\d.]+/g, () => finalTongueCoords[tongueIndex++].toFixed(2));
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

/*
function _pointsToSmoothPath(p: [number, number][], alpha = 0.5): string {
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
*/

function renderWaveguideCanvas() {
  const canvas = document.getElementById("waveguide-canvas") as HTMLCanvasElement;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const parent = canvas.parentElement;
  if (!parent) return;
  const rect = parent.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;

  // Auto-adjust scale for high DPI
  const dpr = window.devicePixelRatio || 1;
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

  // Paint colored slices directly for dynamic airflow speed hotspots
  const numSteps = 80;
  const stepX = w / numSteps;
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

// 3D Vocal Visualizer setup and rendering functions
function setupVocal3DCanvas() {
  const canvas = vocal3dCanvas;
  if (!canvas) return;

  canvas.addEventListener("mousedown", (e: MouseEvent) => {
    isDragging3D = true;
    startDragX = e.clientX;
    startDragY = e.clientY;
  });

  window.addEventListener("mousemove", (e: MouseEvent) => {
    if (!isDragging3D) return;
    const dx = e.clientX - startDragX;
    const dy = e.clientY - startDragY;
    startDragX = e.clientX;
    startDragY = e.clientY;

    rotY += dx * 0.01;
    rotX += dy * 0.01;
    rotX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, rotX));
  });

  window.addEventListener("mouseup", () => {
    isDragging3D = false;
  });
}

function renderVocal3DCanvas() {
  const canvas = vocal3dCanvas;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const parent = canvas.parentElement;
  if (!parent) return;
  const rect = parent.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const w = rect.width;
  const h = rect.height;
  ctx.clearRect(0, 0, w, h);

  const centerX = w / 2;
  const centerY = h / 2 + 10;

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

  for (let i = 0; i < 44; i++) {
    waveguideDiameters[i] += (baseSource[i] - waveguideDiameters[i]) * 0.12;
  }

  // 1. Draw glowing 3D perspective floor grid
  ctx.strokeStyle = varColorToRGB("--zen-text", "0.08");
  ctx.lineWidth = 1.0;
  const gridY = 55;
  for (let gz = -100; gz <= 100; gz += 20) {
    ctx.beginPath();
    for (let gx = -120; gx <= 120; gx += 5) {
      const x1 = gx * Math.cos(rotY) - gz * Math.sin(rotY);
      const z1 = gx * Math.sin(rotY) + gz * Math.cos(rotY);
      const y1 = gridY;
      const x2 = x1;
      const y2 = y1 * Math.cos(rotX) - z1 * Math.sin(rotX);
      const z2 = y1 * Math.sin(rotX) + z1 * Math.cos(rotX);

      const perspective = 250 / (250 + z2);
      const px = centerX + x2 * perspective * 2.2;
      const py = centerY + y2 * perspective * 2.2;

      if (gx === -120) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  for (let gx = -120; gx <= 120; gx += 30) {
    ctx.beginPath();
    for (let gz = -100; gz <= 100; gz += 5) {
      const x1 = gx * Math.cos(rotY) - gz * Math.sin(rotY);
      const z1 = gx * Math.sin(rotY) + gz * Math.cos(rotY);
      const y1 = gridY;
      const x2 = x1;
      const y2 = y1 * Math.cos(rotX) - z1 * Math.sin(rotX);
      const z2 = y1 * Math.sin(rotX) + z1 * Math.cos(rotX);

      const perspective = 250 / (250 + z2);
      const px = centerX + x2 * perspective * 2.2;
      const py = centerY + y2 * perspective * 2.2;

      if (gz === -100) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  // 2. Generate 3D vertices of the vocal tract tube
  const slices = 22; 
  const radialSegments = 12;
  const vertices: {x: number, y: number, z: number, px: number, py: number, pz: number, projX: number, projY: number}[] = [];

  for (let s = 0; s < slices; s++) {
    const i = Math.floor((s / (slices - 1)) * 43);
    const t = s / (slices - 1);
    const angle = t * Math.PI / 2;

    const cx = -35 + 75 * Math.sin(angle);
    const cy = 25 - 55 * Math.cos(angle);
    const cz = 0;

    const tx = 75 * Math.cos(angle);
    const ty = 55 * Math.sin(angle);
    const len = Math.sqrt(tx*tx + ty*ty);
    const nx = -ty / len;
    const ny = tx / len;

    const rad = waveguideDiameters[i] * 12.0;

    for (let r = 0; r < radialSegments; r++) {
      const phi = (r / radialSegments) * Math.PI * 2;
      
      let morphRad = rad;
      if (phi > Math.PI && phi < Math.PI * 2) {
        const tonguePush = Math.sin(phi - Math.PI) * (currentWeights.TBH * 6.0 + currentWeights.TTE * 5.0);
        morphRad = Math.max(2.0, rad - tonguePush);
      }

      const px = cx + morphRad * Math.cos(phi) * nx;
      const py = cy + morphRad * Math.cos(phi) * ny;
      const pz = cz + morphRad * Math.sin(phi);

      const x1 = px * Math.cos(rotY) - pz * Math.sin(rotY);
      const z1 = px * Math.sin(rotY) + pz * Math.cos(rotY);
      const x2 = x1;
      const y2 = py * Math.cos(rotX) - z1 * Math.sin(rotX);
      const z2 = py * Math.sin(rotX) + z1 * Math.cos(rotX);

      const perspective = 250 / (250 + z2);
      const projX = centerX + x2 * perspective * 2.2;
      const projY = centerY + y2 * perspective * 2.2;

      vertices.push({ x: px, y: py, z: pz, px: x2, py: y2, pz: z2, projX, projY });
    }
  }

  // 3. Draw grid lines (along the length of the tube)
  ctx.lineWidth = 1.2;
  const baseColor = currentVibe === "sunrise" ? [255, 111, 97] : currentVibe === "midnight" ? [0, 229, 255] : [0, 180, 216];
  for (let r = 0; r < radialSegments; r++) {
    const angleRatio = r / radialSegments;
    const isTongueSide = angleRatio > 0.45 && angleRatio < 0.95;
    ctx.strokeStyle = `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${isTongueSide ? 0.35 : 0.18})`;
    ctx.beginPath();
    for (let s = 0; s < slices; s++) {
      const idx = s * radialSegments + r;
      const v = vertices[idx];
      if (s === 0) ctx.moveTo(v.projX, v.projY);
      else ctx.lineTo(v.projX, v.projY);
    }
    ctx.stroke();
  }

  // 4. Draw circular rings at each slice
  for (let s = 0; s < slices; s++) {
    const isMainRing = s % 3 === 0 || s === slices - 1;
    ctx.lineWidth = isMainRing ? 1.5 : 0.8;
    ctx.strokeStyle = `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${isMainRing ? 0.45 : 0.12})`;
    ctx.beginPath();
    for (let r = 0; r <= radialSegments; r++) {
      const idx = s * radialSegments + (r % radialSegments);
      const v = vertices[idx];
      if (r === 0) ctx.moveTo(v.projX, v.projY);
      else ctx.lineTo(v.projX, v.projY);
    }
    ctx.stroke();
    
    if (s === 0 || s === slices - 1) {
      ctx.fillStyle = `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, 0.05)`;
      ctx.fill();
    }
  }

  // 5. Draw flowing pressure waves inside if sound is playing
  if (isAudioPlaying) {
    const pulsePhase = globalSpeechTime * 20;
    ctx.lineWidth = 1.0;
    ctx.strokeStyle = varColorToRGB("--vibe-active-bg", "0.6");
    for (let wIdx = 0; wIdx < 5; wIdx++) {
      const wavePos = ((pulsePhase + wIdx * 4) % slices);
      const sFloor = Math.floor(wavePos);
      const sCeil = Math.ceil(wavePos) % slices;
      const ratio = wavePos - sFloor;

      ctx.beginPath();
      for (let r = 0; r <= radialSegments; r++) {
        const idx1 = sFloor * radialSegments + (r % radialSegments);
        const idx2 = sCeil * radialSegments + (r % radialSegments);
        const v1 = vertices[idx1];
        const v2 = vertices[idx2];
        const px = v1.projX + (v2.projX - v1.projX) * ratio;
        const py = v1.projY + (v2.projY - v1.projY) * ratio;
        if (r === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  }

  // 6. Draw interactive orbital helper UI
  ctx.strokeStyle = varColorToRGB("--zen-text", "0.2");
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  const indicatorX = w - 40;
  const indicatorY = 40;
  ctx.arc(indicatorX, indicatorY, 20, 0, Math.PI * 2);
  ctx.stroke();
  
  ctx.beginPath();
  const needleX = indicatorX + Math.sin(rotY) * 20;
  const needleY = indicatorY + Math.cos(rotY) * Math.sin(rotX) * 20;
  ctx.moveTo(indicatorX, indicatorY);
  ctx.lineTo(needleX, needleY);
  ctx.stroke();
  ctx.fillStyle = varColorToRGB("--zen-text", "0.4");
  ctx.font = "8px monospace";
  ctx.fillText("3D ROTATE", indicatorX - 25, indicatorY + 32);
}

// ============================================================================
// 3. Zen Breathing Coach Pacer Loop
// ============================================================================
let breathingInterval: any = null;
let breathingPhase = 0;

function startBreathingCoach() {
  const circle = document.getElementById("breathing-circle");
  const prompt = document.getElementById("breathing-prompt");
  if (!circle || !prompt) return;
  if (breathingInterval) clearInterval(breathingInterval);

  function updateBreathingCycle() {
    if (breathingPhase === 0) {
      circle!.className = "breathing-circle inhale";
      prompt!.innerText = "Inhale";
      breathingPhase = 1;
    } else if (breathingPhase === 1) {
      circle!.className = "breathing-circle hold";
      prompt!.innerText = "Hold";
      breathingPhase = 2;
    } else {
      circle!.className = "breathing-circle exhale";
      prompt!.innerText = "Exhale & Speak";
      breathingPhase = 0;
      updateZenAffirmation();
    }
  }
  breathingPhase = 0;
  updateBreathingCycle();
  breathingInterval = setInterval(updateBreathingCycle, 4000);
}

const zenAffirmations = [
  "El aprendizaje es un tesoro que seguirá a su dueño a todas partes.",
  "La paciencia es amarga, pero su fruto es dulce.",
  "Paso a paso se llega lejos.",
  "Clear your mind, focus on the tone, and repeat with intention.",
  "La práctica hace al maestro.",
  "Escucha la melodía del idioma y déjala fluir.",
  "Con calma y constancia, dominarás tu aura."
];

function updateZenAffirmation() {
  const quoteEl = document.getElementById("zen-quote");
  if (quoteEl) {
    quoteEl.innerText = zenAffirmations[Math.floor(Math.random() * zenAffirmations.length)];
  }
}
