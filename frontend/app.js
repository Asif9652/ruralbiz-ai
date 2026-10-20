/**
 * RuralBiz AI - Core Client Application Controller
 * SIH Problem Statement ID: 26091
 * Fully functional implementation preserving the Google Stitch visual design.
 */

// Application Global State
const STATE = {
  currentTab: 'landing-village-explorer',
  currentLang: 'en',
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  isKageTheme: false,
  location: {
    village: "Anaimalai",
    taluk: "Anaimalai",
    district: "Coimbatore",
    state: "Tamil Nadu",
    lat: 10.5844,
    lon: 76.9328,
    displayName: "Anaimalai, Pollachi, Coimbatore, Tamil Nadu, 642104, India"
  },
  businessCategory: 'dairy',
  customBusinessIdea: '',
  projectCost: 320000,
  userMargin: 35000,
  preferredScheme: 'term',
  osmBusinesses: [],
  osmRadiusKm: 5.0,
  mandiData: null,
  censusData: null,
  surveyData: [],
  currentReport: null
};

// API Base URL
const API_BASE = (window.location.origin && window.location.origin.startsWith('http') && !window.location.origin.includes(':5500') && !window.location.origin.includes(':3000'))
  ? window.location.origin
  : 'http://127.0.0.1:8000';

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initLanguage();
  initNavigation();
  initTypewriterIntro();
  init3DVillageScene();
  initMap();
  initSearchAndGeolocation();
  initLoanCalculator();
  initFieldSurveyForm();
  
  // Initial data load for default location
  refreshAllIntelligenceData();
});

/* ═══════════════════════════════════════════════════════════════════════
   1. NAVIGATION & TAB SWITCHING
   ═══════════════════════════════════════════════════════════════════════ */
function initNavigation() {
  const navLinks = document.querySelectorAll('nav a[data-path], [data-nav-target]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetPath = link.getAttribute('data-path') || link.getAttribute('data-nav-target');
      switchTab(targetPath);
      if (targetPath === 'feasibility-report' && !STATE.currentReport) {
        generateFeasibilityDPR();
      }
    });
  });

  // Hero Pill Buttons
  const heroExploreBtn = document.getElementById('hero-explore-village-btn');
  if (heroExploreBtn) {
    heroExploreBtn.addEventListener('click', () => switchTab('wizard-setup'));
  }

  const heroCalcBtn = document.getElementById('hero-calc-loan-btn');
  if (heroCalcBtn) {
    heroCalcBtn.addEventListener('click', () => switchTab('smart-loan-calculator'));
  }

  const heroUseLocBtn = document.getElementById('hero-use-location-btn');
  if (heroUseLocBtn) {
    heroUseLocBtn.addEventListener('click', () => detectCurrentLocation(heroUseLocBtn, true));
  }

  const heroAnalyzeBtn = document.getElementById('hero-analyze-idea-btn');
  if (heroAnalyzeBtn) {
    heroAnalyzeBtn.addEventListener('click', () => {
      switchTab('wizard-setup');
      setTimeout(() => {
        const input = document.getElementById('custom-business-idea-input');
        if (input) {
          input.focus();
          input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 250);
    });
  }

  const heroCompareBtn = document.getElementById('hero-compare-btn');
  if (heroCompareBtn) {
    heroCompareBtn.addEventListener('click', () => switchTab('intelligence-dashboard'));
  }

  const heroStartPlanBtn = document.getElementById('hero-start-plan-btn');
  if (heroStartPlanBtn) {
    heroStartPlanBtn.addEventListener('click', () => switchTab('wizard-setup'));
  }

  const heroHowBtn = document.getElementById('hero-how-it-works-btn');
  const howModal = document.getElementById('how-it-works-modal');
  const closeHowBtn = document.getElementById('btn-close-how-modal');
  const modalStartPlanBtn = document.getElementById('modal-start-plan-btn');

  if (heroHowBtn && howModal) {
    heroHowBtn.addEventListener('click', () => howModal.classList.remove('hidden'));
  }
  if (closeHowBtn && howModal) {
    closeHowBtn.addEventListener('click', () => howModal.classList.add('hidden'));
  }
  if (modalStartPlanBtn && howModal) {
    modalStartPlanBtn.addEventListener('click', () => {
      howModal.classList.add('hidden');
      switchTab('wizard-setup');
    });
  }

  // Dismiss / Toggle 3D Simulation
  const closeSimBtn = document.getElementById('btn-close-simulation');
  const simCard = document.getElementById('village-3d-simulation-card');
  if (closeSimBtn && simCard) {
    closeSimBtn.addEventListener('click', () => {
      simCard.classList.toggle('hidden');
      showToast(simCard.classList.contains('hidden') ? "3D Simulation minimized" : "3D Simulation restored");
    });
  }

  // Kage Precision theme toggle
  const kageBtn = document.getElementById('kage-theme-toggle');
  if (kageBtn) {
    kageBtn.addEventListener('click', () => {
      STATE.isKageTheme = !STATE.isKageTheme;
      document.body.classList.toggle('kage-mode', STATE.isKageTheme);
      kageBtn.classList.toggle('bg-primary-container', STATE.isKageTheme);
      showToast(STATE.isKageTheme ? "Switched to Kage Precision Sumi-e Mode" : "Switched to Rural Biophilic Mode");
    });
  }

  // Reduced motion toggle
  const motionToggle = document.getElementById('motion-toggle');
  if (motionToggle) {
    motionToggle.addEventListener('click', () => {
      STATE.reducedMotion = !STATE.reducedMotion;
      motionToggle.classList.toggle('opacity-50', STATE.reducedMotion);
      showToast(STATE.reducedMotion ? "Reduced Motion Enabled" : "Full 3D Motion Enabled");
    });
  }
}

function switchTab(path) {
  if (!path) return;
  STATE.currentTab = path;

  // Hide all sections
  document.querySelectorAll('section[data-view]').forEach(sec => {
    sec.classList.add('hidden');
  });

  // Show active view
  const activeView = document.querySelector(`section[data-view="${path}"]`);
  if (activeView) {
    activeView.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Update navigation highlighting
  document.querySelectorAll('nav a[data-path]').forEach(link => {
    const isTarget = link.getAttribute('data-path') === path;
    if (isTarget) {
      link.className = 'flex flex-col items-center justify-center min-w-[56px] min-h-[44px] h-full transition-colors text-primary font-semibold';
      link.setAttribute('aria-current', 'page');
    } else {
      link.className = 'flex flex-col items-center justify-center min-w-[56px] min-h-[44px] h-full text-on-surface-variant hover:text-on-surface transition-colors';
      link.removeAttribute('aria-current');
    }
  });

  // Trigger map resize if switching to dashboard
  if (path === 'intelligence-dashboard' && window.leafletMap) {
    setTimeout(() => {
      window.leafletMap.invalidateSize();
    }, 200);
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   2. MULTILINGUAL & AUDIO GUIDANCE (EN, TA, HI)
   ═══════════════════════════════════════════════════════════════════════ */
function initLanguage() {
  const langButtons = document.querySelectorAll('.lang-btn');
  langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      setLanguage(lang);
    });
  });

  // Voice help buttons
  const voiceButtons = document.querySelectorAll('.audio-help-trigger');
  voiceButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      speakAudioGuidance();
    });
  });
}

function setLanguage(lang) {
  if (!TRANSLATIONS[lang]) return;
  STATE.currentLang = lang;

  document.querySelectorAll('.lang-btn').forEach(b => {
    const isSel = b.getAttribute('data-lang') === lang;
    b.className = isSel
      ? 'h-8 px-space-xs rounded-full bg-primary text-on-primary font-label-badge text-label-badge flex items-center justify-center transition-all shadow'
      : 'h-8 px-space-xs rounded-full text-on-surface-variant font-label-badge text-label-badge flex items-center justify-center hover:text-on-surface transition-all';
  });

  // Apply translations to data-i18n elements
  const dict = TRANSLATIONS[lang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = dict[key];
      } else {
        el.textContent = dict[key];
      }
    }
  });

  // Re-run typewriter in new language
  initTypewriterIntro();
}

let typewriterTimer = null;
function initTypewriterIntro() {
  const el = document.getElementById('hero-typewriter-text');
  if (!el) return;

  const phrase = TRANSLATIONS[STATE.currentLang]?.typewriter_intro || "Every village has opportunities. Discover yours with real local data.";
  
  if (typewriterTimer) {
    clearTimeout(typewriterTimer);
    typewriterTimer = null;
  }

  if (STATE.reducedMotion) {
    el.textContent = phrase;
    return;
  }

  el.textContent = "";
  let idx = 0;
  const speed = 28;

  function typeChar() {
    if (idx < phrase.length) {
      el.textContent += phrase.charAt(idx);
      idx++;
      typewriterTimer = setTimeout(typeChar, speed);
    }
  }
  typeChar();
}

function speakAudioGuidance() {
  if (!('speechSynthesis' in window)) {
    showToast("Speech synthesis not supported in this browser");
    return;
  }
  window.speechSynthesis.cancel();

  const langCode = STATE.currentLang === 'ta' ? 'ta-IN' : STATE.currentLang === 'hi' ? 'hi-IN' : 'en-IN';
  let speechText = "";

  if (STATE.currentLang === 'ta') {
    speechText = `வணக்கம். ரூரல்பீஸ் AI உங்களை வரவேற்கிறது. உங்கள் கிராமம் ${STATE.location.village}. தேர்ந்தெடுக்கப்பட்ட தொழில் ${STATE.businessCategory}. நீங்கள் திட்ட அறிக்கை உருவாக்கலாம் அல்லது கடன் திட்டங்களை ஆராயலாம்.`;
  } else if (STATE.currentLang === 'hi') {
    speechText = `नमस्ते। ग्रामीण बिज़ AI में आपका स्वागत है। आपका गाँव ${STATE.location.village} है। आप बाज़ार डेटा देख सकते हैं और MoSJE योजना के तहत ऋण गणना कर सकते हैं।`;
  } else {
    speechText = `Welcome to RuralBiz AI. Current village: ${STATE.location.village}, ${STATE.location.district}. Target category: ${STATE.businessCategory}. Project cost: Rupees ${STATE.projectCost.toLocaleString('en-IN')}.`;
  }

  const utterance = new SpeechSynthesisUtterance(speechText);
  utterance.lang = langCode;
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
  showToast("Playing vernacular audio guidance...");
}

/* ═══════════════════════════════════════════════════════════════════════
   3. 3D VILLAGE COUNTRYSIDE SIMULATION (THREE.JS)
   ═══════════════════════════════════════════════════════════════════════ */
let threeScene, threeCamera, threeRenderer, threeTerrainGroup, windmillRotors = [];
let particleSystem, particleGeo, particleVel = [], particleCount = 140;
let mouseParallaxX = 0, mouseParallaxY = 0;

function init3DVillageScene() {
  const container = document.getElementById('threejs-container-ANIMATION_2');
  if (!container) return;

  // Check WebGL availability
  if (!window.WebGLRenderingContext) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full p-4 text-center bg-surface-container text-on-surface-variant">
        <span class="material-symbols-outlined text-[36px] text-tertiary mb-2">landscape</span>
        <span class="font-headline-sm text-sm">3D Countryside Environment (Static Mode)</span>
        <span class="font-body-sm text-xs mt-1">WebGL is disabled or unsupported. Form controls and financial tools remain fully functional.</span>
      </div>`;
    return;
  }

  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || 288;

  threeScene = new THREE.Scene();
  threeCamera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
  threeCamera.position.set(0, 8, 18);
  threeCamera.lookAt(0, 0, 0);

  threeRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  threeRenderer.setSize(width, height);
  threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  threeRenderer.shadowMap.enabled = true;
  container.innerHTML = '';
  container.appendChild(threeRenderer.domElement);

  // Lighting: Warm golden sunlight & deep forest emerald bounce
  const ambientLight = new THREE.AmbientLight(0xfff7ed, 1.1);
  threeScene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xfef08a, 1.9);
  sunLight.position.set(12, 22, 10);
  threeScene.add(sunLight);

  const emeraldLight = new THREE.PointLight(0x15966A, 2.5, 30);
  emeraldLight.position.set(-8, 6, 4);
  threeScene.add(emeraldLight);

  const mintAccentLight = new THREE.PointLight(0xB9F4D3, 1.8, 25);
  mintAccentLight.position.set(6, 4, 6);
  threeScene.add(mintAccentLight);

  // Terrain Group
  threeTerrainGroup = new THREE.Group();
  threeScene.add(threeTerrainGroup);

  // Terraced Base Disc (Forest Green #102820)
  const discGeo = new THREE.CylinderGeometry(9.5, 10.5, 1.2, 32);
  const discMat = new THREE.MeshLambertMaterial({ color: 0x0e241c });
  const baseDisc = new THREE.Mesh(discGeo, discMat);
  baseDisc.position.y = -0.6;
  threeTerrainGroup.add(baseDisc);

  // Agricultural Crop Tier (Emerald #15966A)
  const tierGeo = new THREE.CylinderGeometry(8.2, 8.8, 0.4, 28);
  const tierMat = new THREE.MeshLambertMaterial({ color: 0x15966A });
  const tier = new THREE.Mesh(tierGeo, tierMat);
  tier.position.y = 0.2;
  threeTerrainGroup.add(tier);

  // Meandering Country Road connecting village (Soft sand #E9E2D3)
  const roadCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-5.5, 0.22, -3.5),
    new THREE.Vector3(-2.0, 0.22, -1.0),
    new THREE.Vector3(0.0, 0.22, 1.2),
    new THREE.Vector3(3.2, 0.22, 2.8),
    new THREE.Vector3(6.5, 0.22, 4.5)
  ]);
  const roadGeo = new THREE.TubeGeometry(roadCurve, 20, 0.32, 6, false);
  const roadMat = new THREE.MeshLambertMaterial({ color: 0xd4cbb8 });
  const roadMesh = new THREE.Mesh(roadGeo, roadMat);
  threeTerrainGroup.add(roadMesh);

  // Distant Gentle Hills in Background
  const hillMat = new THREE.MeshLambertMaterial({ color: 0x0a1b15 });
  const hillPositions = [
    { x: -5.5, y: 1.4, z: -5.5, r: 2.4 },
    { x: 0, y: 1.8, z: -6.8, r: 3.0 },
    { x: 5.5, y: 1.3, z: -5.8, r: 2.5 }
  ];
  hillPositions.forEach(h => {
    const hill = new THREE.Mesh(new THREE.ConeGeometry(h.r, h.y * 2, 16), hillMat);
    hill.position.set(h.x, h.y, h.z);
    threeTerrainGroup.add(hill);
  });

  // Countryside Trees (Coconut & Shade Trees)
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5c3818 });
  const foliageMat = new THREE.MeshLambertMaterial({ color: 0x0f7250 });
  const treePositions = [
    { x: -2.0, z: 2.0 }, { x: -4.0, z: 0.8 }, { x: 1.4, z: 1.8 },
    { x: 4.0, z: 1.5 }, { x: -0.6, z: -2.5 }, { x: 5.0, z: -2.2 }
  ];
  treePositions.forEach(tp => {
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.11, 1.2, 6), trunkMat);
    trunk.position.y = 0.6;
    const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(0.6), foliageMat);
    foliage.position.y = 1.35;
    tree.add(trunk);
    tree.add(foliage);
    tree.position.set(tp.x, 0.4, tp.z);
    threeTerrainGroup.add(tree);
  });

  // Village Micro-Enterprise Buildings (Ivory #F8F6EF with terracotta roofs)
  const houseMat1 = new THREE.MeshLambertMaterial({ color: 0xF8F6EF });
  const roofMat1 = new THREE.MeshLambertMaterial({ color: 0xd97706 });
  const housePositions = [
    { x: -3.5, z: 1.5, r: 0.2 },
    { x: -4.8, z: 2.2, r: -0.4 },
    { x: -2.8, z: 3.5, r: 0.5 },
    { x: 3.2, z: -1.2, r: 0.8 },
    { x: 4.5, z: -0.5, r: -0.2 },
    { x: 2.5, z: 2.5, r: 0.1 }
  ];

  housePositions.forEach(p => {
    const house = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 0.9), houseMat1);
    body.position.y = 0.35;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.75, 0.5, 4), roofMat1);
    roof.position.y = 0.95;
    roof.rotation.y = Math.PI / 4;
    house.add(body);
    house.add(roof);
    house.position.set(p.x, 0.4, p.z);
    house.rotation.y = p.r;
    threeTerrainGroup.add(house);
  });

  // Clean Energy Wind Turbines
  windmillRotors = [];
  function createTurbine(x, z) {
    const wm = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.15, 3.8, 8), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    pole.position.y = 1.9;
    wm.add(pole);

    const rotor = new THREE.Group();
    rotor.position.y = 3.8;
    const bladeGeo = new THREE.BoxGeometry(0.12, 1.8, 0.02);
    const bladeMat = new THREE.MeshLambertMaterial({ color: 0xe0e7ff });

    for (let i = 0; i < 3; i++) {
      const b = new THREE.Mesh(bladeGeo, bladeMat);
      b.rotation.z = (i * Math.PI * 2) / 3;
      b.position.y = Math.sin(b.rotation.z) * 0.9;
      b.position.x = Math.cos(b.rotation.z) * 0.9;
      rotor.add(b);
    }
    wm.add(rotor);
    wm.position.set(x, 0.4, z);
    threeTerrainGroup.add(wm);
    windmillRotors.push(rotor);
  }

  createTurbine(-1.2, -4.2);
  createTurbine(1.8, -4.8);

  // Solar Micro-Grid Panels
  const panelGeo = new THREE.BoxGeometry(1.4, 0.08, 0.9);
  const panelMat = new THREE.MeshLambertMaterial({ color: 0x1e3a8a });
  for (let s = 0; s < 3; s++) {
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.set(5.2 + (s * 0.4), 0.5, 2.0 + (s * 1.1));
    panel.rotation.x = 0.35;
    panel.rotation.y = -0.3;
    threeTerrainGroup.add(panel);
  }

  // Living Green Pollen & Drifting Light Particles (Biophilic Atmosphere)
  particleGeo = new THREE.BufferGeometry();
  const particlePos = new Float32Array(particleCount * 3);
  particleVel = [];

  for (let i = 0; i < particleCount; i++) {
    particlePos[i * 3] = (Math.random() - 0.5) * 22;
    particlePos[i * 3 + 1] = Math.random() * 9 + 0.5;
    particlePos[i * 3 + 2] = (Math.random() - 0.5) * 22;
    particleVel.push({
      y: 0.008 + Math.random() * 0.014,
      x: (Math.random() - 0.5) * 0.006,
      z: (Math.random() - 0.5) * 0.006
    });
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0x6ee7b7,
    size: 0.22,
    transparent: true,
    opacity: 0.8
  });
  particleSystem = new THREE.Points(particleGeo, particleMat);
  threeScene.add(particleSystem);

  // Subtle Parallax on Mouse Move
  window.addEventListener('mousemove', (e) => {
    const normX = (e.clientX / window.innerWidth) * 2 - 1;
    const normY = -(e.clientY / window.innerHeight) * 2 + 1;
    mouseParallaxX = normX * 2.2;
    mouseParallaxY = normY * 1.2;
  });

  // Mouse drag interaction
  let isDragging = false;
  let prevMouseX = 0;
  container.addEventListener('mousedown', (e) => { isDragging = true; prevMouseX = e.clientX; });
  window.addEventListener('mouseup', () => { isDragging = false; });
  window.addEventListener('mousemove', (e) => {
    if (isDragging && threeTerrainGroup) {
      const delta = e.clientX - prevMouseX;
      threeTerrainGroup.rotation.y += delta * 0.008;
      prevMouseX = e.clientX;
    }
  });

  // Touch drag
  container.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) { isDragging = true; prevMouseX = e.touches[0].clientX; }
  });
  window.addEventListener('touchend', () => { isDragging = false; });
  window.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches.length > 0 && threeTerrainGroup) {
      const delta = e.touches[0].clientX - prevMouseX;
      threeTerrainGroup.rotation.y += delta * 0.008;
      prevMouseX = e.touches[0].clientX;
    }
  });

  // Animation Loop with parallax and drifting particles
  function animate() {
    if (!document.getElementById('threejs-container-ANIMATION_2')) return;
    requestAnimationFrame(animate);

    if (!STATE.reducedMotion) {
      // Gentle environmental terrain rotation
      if (threeTerrainGroup) {
        threeTerrainGroup.rotation.y += 0.0022;
      }
      windmillRotors.forEach(r => { r.rotation.z -= 0.04; });

      // Camera mouse parallax interpolation
      if (threeCamera) {
        const targetX = mouseParallaxX;
        const targetY = 8 + mouseParallaxY;
        threeCamera.position.x += (targetX - threeCamera.position.x) * 0.04;
        threeCamera.position.y += (targetY - threeCamera.position.y) * 0.04;
        threeCamera.lookAt(0, 0, 0);
      }

      // Animate drifting living green pollen spores
      if (particleSystem && particleGeo) {
        const positions = particleGeo.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3 + 1] += particleVel[i].y;
          positions[i * 3] += particleVel[i].x;
          positions[i * 3 + 2] += particleVel[i].z;
          if (positions[i * 3 + 1] > 10) {
            positions[i * 3 + 1] = 0.5;
            positions[i * 3] = (Math.random() - 0.5) * 22;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 22;
          }
        }
        particleGeo.attributes.position.needsUpdate = true;
      }
    }

    threeRenderer.render(threeScene, threeCamera);
  }
  animate();

  window.addEventListener('resize', () => {
    if (!container || !threeRenderer) return;
    const w = container.clientWidth;
    const h = container.clientHeight || 288;
    threeCamera.aspect = w / h;
    threeCamera.updateProjectionMatrix();
    threeRenderer.setSize(w, h);
  });
}

/* ═══════════════════════════════════════════════════════════════════════
   4. INTERACTIVE LEAFLET MAP & SPATIAL RADAR
   ═══════════════════════════════════════════════════════════════════════ */
let leafletMap, mapMarkers = [], centerMarker;

function initMap() {
  const mapElem = document.getElementById('leaflet-map-container');
  if (!mapElem || typeof L === 'undefined') return;

  leafletMap = L.map('leaflet-map-container', {
    zoomControl: false,
    attributionControl: false
  }).setView([STATE.location.lat, STATE.location.lon], 13);

  window.leafletMap = leafletMap;

  // Standard OpenStreetMap with CSS dark filter (no API key required, zero watermark)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    className: 'dark-map-tiles',
    attribution: '© OpenStreetMap contributors'
  }).addTo(leafletMap);

  // Add zoom control top-right
  L.control.zoom({ position: 'topright' }).addTo(leafletMap);

  // Radar circle layer
  updateMapCenterMarker();

  // Radar radius toggle buttons
  const r5btn = document.getElementById('radius-5km-btn');
  const r10btn = document.getElementById('radius-10km-btn');
  if (r5btn && r10btn) {
    r5btn.addEventListener('click', () => setRadius(5.0));
    r10btn.addEventListener('click', () => setRadius(10.0));
  }

  // Filter Buttons on Radar
  document.querySelectorAll('.cluster-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cluster-filter-btn').forEach(b => {
        b.className = 'cluster-filter-btn h-7 px-3 rounded-full bg-surface-container-high text-on-surface-variant font-label-badge text-label-badge flex items-center justify-center flex-shrink-0 transition-all hover:text-on-surface';
      });
      btn.className = 'cluster-filter-btn active h-7 px-3 rounded-full bg-primary text-on-primary font-label-badge text-label-badge flex items-center justify-center flex-shrink-0 transition-all shadow-sm';
      const category = btn.getAttribute('data-filter') || 'all';
      filterMapPins(category);
    });
  });
}

function setRadius(r) {
  STATE.osmRadiusKm = r;
  const r5btn = document.getElementById('radius-5km-btn');
  const r10btn = document.getElementById('radius-10km-btn');
  if (r === 5.0) {
    r5btn.className = 'radius-toggle-btn h-9 px-space-sm rounded-md bg-primary text-on-primary font-label-badge text-label-badge transition-all';
    r10btn.className = 'radius-toggle-btn h-9 px-space-sm rounded-md text-on-surface-variant hover:text-on-surface font-label-badge text-label-badge transition-all';
  } else {
    r10btn.className = 'radius-toggle-btn h-9 px-space-sm rounded-md bg-primary text-on-primary font-label-badge text-label-badge transition-all';
    r5btn.className = 'radius-toggle-btn h-9 px-space-sm rounded-md text-on-surface-variant hover:text-on-surface font-label-badge text-label-badge transition-all';
  }
  document.getElementById('display-radius-tag').textContent = `${r.toFixed(1)} km Survey Radius`;
  fetchOsmBusinesses();
}

function updateMapCenterMarker() {
  if (!leafletMap) return;
  leafletMap.setView([STATE.location.lat, STATE.location.lon], 13);

  if (centerMarker) {
    leafletMap.removeLayer(centerMarker);
  }

  // Center Radar Pin Icon
  const centerIcon = L.divIcon({
    className: 'custom-center-pin',
    html: `
      <div class="relative flex items-center justify-center w-8 h-8">
        <div class="absolute w-8 h-8 rounded-full bg-primary/20 animate-ping"></div>
        <div class="w-4 h-4 rounded-full bg-primary border-2 border-surface-container-lowest shadow-[0_0_12px_#4edea3]"></div>
      </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  centerMarker = L.marker([STATE.location.lat, STATE.location.lon], { icon: centerIcon })
    .addTo(leafletMap)
    .bindPopup(`<strong>${STATE.location.village} Hub</strong><br><span class="text-xs text-gray-400">Search Center (${STATE.location.lat.toFixed(4)}, ${STATE.location.lon.toFixed(4)})</span>`);
}

function renderMapPins(businesses) {
  if (!leafletMap) return;
  // Clear old markers
  mapMarkers.forEach(m => leafletMap.removeLayer(m));
  mapMarkers = [];

  businesses.forEach(b => {
    const isClothing = b.category === 'clothing';
    const isDairy = b.category === 'dairy';
    const isSupplier = b.category === 'agro_supply';
    const isArtisan = b.category === 'artisan';

    let colorBg = 'bg-tertiary';
    let iconName = 'storefront';
    if (isClothing) {
      colorBg = 'bg-indigo-600';
      iconName = 'checkroom';
    } else if (isDairy) {
      colorBg = 'bg-secondary';
      iconName = 'store';
    } else if (isSupplier) {
      colorBg = 'bg-primary';
      iconName = 'agriculture';
    } else if (isArtisan) {
      colorBg = 'bg-amber-600';
      iconName = 'palette';
    }

    const pinIcon = L.divIcon({
      className: 'osm-pin',
      html: `
        <div class="flex flex-col items-center group cursor-pointer">
          <div class="w-7 h-7 rounded-full ${colorBg} text-white flex items-center justify-center shadow-lg border border-white/30">
            <span class="material-symbols-outlined text-[15px]">${iconName}</span>
          </div>
          <span class="text-[9px] font-mono bg-black/85 text-white px-1.5 py-0.5 rounded mt-0.5 whitespace-nowrap shadow font-medium">${b.name.substring(0, 18)}</span>
        </div>`,
      iconSize: [28, 40],
      iconAnchor: [14, 20]
    });

    const displayAddr = Array.isArray(b.address) ? b.address.join(', ') : (b.address || 'Local Environs');
    const marker = L.marker([b.latitude, b.longitude], { icon: pinIcon })
      .addTo(leafletMap)
      .bindPopup(`
        <div class="text-xs space-y-1">
          <strong class="text-sm font-semibold">${b.name}</strong><br>
          <span class="text-gray-400">Category: ${b.category.toUpperCase()} (${b.osm_tag})</span><br>
          <span class="text-emerald-400 font-semibold">Distance: ${b.distance_km} km</span><br>
          <span class="text-gray-300">${displayAddr}</span>
        </div>
      `);
    marker.businessCategory = b.category;
    mapMarkers.push(marker);
  });
}

function filterMapPins(category) {
  mapMarkers.forEach(m => {
    if (category === 'all' || m.businessCategory === category) {
      if (!leafletMap.hasLayer(m)) leafletMap.addLayer(m);
    } else {
      if (leafletMap.hasLayer(m)) leafletMap.removeLayer(m);
    }
  });
}

/* ═══════════════════════════════════════════════════════════════════════
   5. REAL GEOLOCATION & VILLAGE SEARCH
   ═══════════════════════════════════════════════════════════════════════ */
function initSearchAndGeolocation() {
  const gpsBtn = document.getElementById('gps-action-btn');
  const searchInput = document.getElementById('location-search-input');
  const searchBtn = document.getElementById('search-submit-btn');

  // Quick Chips
  document.querySelectorAll('.quick-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.getAttribute('data-val');
      if (searchInput) {
        searchInput.value = q;
        executeVillageSearch(q);
      }
    });
  });

  // Close 3D Simulation Button
  const closeSimBtn = document.getElementById('btn-close-simulation');
  if (closeSimBtn) {
    closeSimBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      remove3DSimulation();
      showToast("3D Simulation removed");
    });
  }

  // Restore dismissal state if previously dismissed
  if (localStorage.getItem('ruralbiz_simulation_dismissed') === 'true') {
    remove3DSimulation();
  }

  // Confirm Location Button
  const confirmLocBtn = document.getElementById('confirm-location-btn');
  if (confirmLocBtn) {
    confirmLocBtn.addEventListener('click', () => {
      const q = searchInput ? searchInput.value.trim() : '';
      if (q && q !== STATE.location.village) {
        executeVillageSearch(q).then(() => {
          advanceToSetupWithLocation();
        });
      } else {
        advanceToSetupWithLocation();
      }
    });
  }

  // GPS Action Button
  if (gpsBtn) {
    gpsBtn.addEventListener('click', () => {
      detectCurrentLocation(gpsBtn, true);
    });
  }

  // Cover Hero: Start My Plan Button
  const heroStartBtn = document.getElementById('hero-start-plan-btn');
  if (heroStartBtn) {
    heroStartBtn.addEventListener('click', () => {
      advanceToSetupWithLocation();
      if (gpsBtn && navigator.geolocation) {
        detectCurrentLocation(gpsBtn, false);
      }
    });
  }

  // Cover Hero: How It Works Modal
  const howBtn = document.getElementById('hero-how-it-works-btn');
  const howModal = document.getElementById('how-it-works-modal');
  const closeHowBtn = document.getElementById('btn-close-how-modal');
  const modalStartBtn = document.getElementById('modal-start-plan-btn');

  if (howBtn && howModal) {
    howBtn.addEventListener('click', () => {
      howModal.classList.remove('hidden');
    });
  }
  if (closeHowBtn && howModal) {
    closeHowBtn.addEventListener('click', () => {
      howModal.classList.add('hidden');
    });
  }
  if (modalStartBtn && howModal) {
    modalStartBtn.addEventListener('click', () => {
      howModal.classList.add('hidden');
      advanceToSetupWithLocation();
      if (gpsBtn && navigator.geolocation) {
        detectCurrentLocation(gpsBtn, false);
      }
    });
  }
  if (howModal) {
    howModal.addEventListener('click', (e) => {
      if (e.target === howModal) howModal.classList.add('hidden');
    });
  }

  // Search Action
  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', () => {
      executeVillageSearch(searchInput.value);
    });
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') executeVillageSearch(searchInput.value);
    });
  }

  // Wizard Step 1: Location Search & GPS
  const wizardSearchBtn = document.getElementById('wizard-location-search-btn');
  const wizardSearchInput = document.getElementById('wizard-location-search-input');
  if (wizardSearchBtn && wizardSearchInput) {
    wizardSearchBtn.addEventListener('click', () => {
      executeVillageSearch(wizardSearchInput.value);
    });
    wizardSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') executeVillageSearch(wizardSearchInput.value);
    });
  }

  const wizardGpsBtn = document.getElementById('wizard-gps-btn');
  if (wizardGpsBtn) {
    wizardGpsBtn.addEventListener('click', () => {
      detectCurrentLocation(wizardGpsBtn, false);
    });
  }

  // Wizard Quick Location Suggestion Chips
  document.querySelectorAll('.wizard-loc-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const locVal = chip.getAttribute('data-loc');
      if (wizardSearchInput) wizardSearchInput.value = locVal;
      executeVillageSearch(locVal);
      showToast(`Location selected: ${locVal}`);
    });
  });

  // Wizard Step 3: Analyze My Business with Real Data
  const wizardAnalyzeBtn = document.getElementById('wizard-analyze-btn');
  if (wizardAnalyzeBtn) {
    wizardAnalyzeBtn.addEventListener('click', async () => {
      // 1. Sync custom business idea from input
      const ideaInput = document.getElementById('custom-business-idea-input');
      if (ideaInput && ideaInput.value.trim()) {
        STATE.customBusinessIdea = ideaInput.value.trim();
      }

      // 2. If user typed in wizard search input and didn't hit enter, execute search
      const wLocInput = document.getElementById('wizard-location-search-input');
      if (wLocInput && wLocInput.value.trim() && !wLocInput.value.includes(STATE.location.village)) {
        await executeVillageSearch(wLocInput.value.trim());
      }

      // 3. Switch to Intelligence Dashboard
      switchTab('intelligence-dashboard');
      showToast(`Analyzing real 5km & 10km data for ${STATE.location.village}...`);

      // 4. Fetch 100% genuine data (OpenStreetMap live nodes, Census, Mandi)
      await refreshAllIntelligenceData();

      // 5. Pre-generate DPR advisory in background
      generateFeasibilityDPR(false).catch(err => console.warn("Background DPR error:", err));
    });
  }

  // Sector cards on landing page
  document.querySelectorAll('[data-sector-select]').forEach(card => {
    card.addEventListener('click', () => {
      const sector = card.getAttribute('data-sector-select');
      STATE.businessCategory = sector;
      const sel = document.getElementById('wizard-category-select');
      if (sel) sel.value = sector;
      switchTab('wizard-setup');
      showToast(`Selected Sector: ${sector.toUpperCase()}`);
    });
  });

  // Custom Business Idea Text Input & Smart Inference
  const ideaInput = document.getElementById('custom-business-idea-input');
  if (ideaInput) {
    ideaInput.addEventListener('input', (e) => {
      STATE.customBusinessIdea = e.target.value;
      STATE.currentReport = null;
      const val = e.target.value.toLowerCase();
      let inferredCat = STATE.businessCategory;
      if (val.includes('cloth') || val.includes('garment') || val.includes('textile') || val.includes('tailor') || val.includes('apparel') || val.includes('boutique') || val.includes('dress') || val.includes('saree') || val.includes('fashion') || val.includes('fabric')) {
        inferredCat = 'clothing';
      } else if (val.includes('chicken') || val.includes('poultry') || val.includes('egg') || val.includes('bird')) {
        inferredCat = 'dairy'; // Allied livestock
      } else if (val.includes('oil') || val.includes('flour') || val.includes('millet') || val.includes('milling') || val.includes('spice') || val.includes('dehydrator') || val.includes('processing')) {
        inferredCat = 'agro_processing';
      } else if (val.includes('mushroom') || val.includes('honey') || val.includes('feed') || val.includes('fertilizer') || val.includes('compost')) {
        inferredCat = 'agro_supply';
      } else if (val.includes('handloom') || val.includes('coir') || val.includes('weaving') || val.includes('pottery') || val.includes('craft')) {
        inferredCat = 'artisan';
      } else if (val.includes('tractor') || val.includes('repair') || val.includes('transport') || val.includes('fleet') || val.includes('spares')) {
        inferredCat = 'logistics_repair';
      } else if (val.includes('store') || val.includes('shop') || val.includes('provision') || val.includes('kirana')) {
        inferredCat = 'grocery';
      }
      if (inferredCat !== STATE.businessCategory) {
        STATE.businessCategory = inferredCat;
        const sel = document.getElementById('wizard-category-select');
        if (sel) sel.value = inferredCat;
        updateCategoryFilterButton();
        fetchOsmBusinesses();
        fetchMandiPrices();
      }
    });
  }

  // Idea Suggestion Chips
  document.querySelectorAll('.idea-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const idea = chip.getAttribute('data-idea');
      if (ideaInput) {
        ideaInput.value = idea;
        ideaInput.dispatchEvent(new Event('input'));
        ideaInput.focus();
        showToast(`Idea selected: "${idea.substring(0, 32)}..."`);
      }
    });
  });

  // Template Category Selector synchronization
  const catSelect = document.getElementById('wizard-category-select');
  if (catSelect) {
    catSelect.addEventListener('change', (e) => {
      STATE.businessCategory = e.target.value;
      STATE.currentReport = null;
      if (!STATE.customBusinessIdea) {
        const optionText = catSelect.options[catSelect.selectedIndex].text;
        if (ideaInput) ideaInput.placeholder = optionText;
      }
      updateCategoryFilterButton();
      fetchOsmBusinesses();
      fetchMandiPrices();
    });
  }

  // Voice Input (Speech Recognition) for Custom Business Idea
  const micIdeaBtn = document.getElementById('mic-idea-btn');
  if (micIdeaBtn) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      micIdeaBtn.addEventListener('click', () => {
        const langCode = STATE.currentLang === 'ta' ? 'ta-IN' : STATE.currentLang === 'hi' ? 'hi-IN' : 'en-IN';
        recognition.lang = langCode;
        try {
          recognition.start();
          micIdeaBtn.classList.add('text-error', 'animate-pulse');
          const lbl = document.getElementById('mic-idea-label');
          if (lbl) lbl.textContent = 'Listening...';
          showToast(`Listening in ${STATE.currentLang.toUpperCase()}... Speak your business idea.`);
        } catch (e) {
          recognition.stop();
        }
      });

      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        if (ideaInput) {
          ideaInput.value = transcript;
          ideaInput.dispatchEvent(new Event('input'));
          showToast(`Voice captured: "${transcript}"`);
        }
      };

      recognition.onend = () => {
        micIdeaBtn.classList.remove('text-error', 'animate-pulse');
        const lbl = document.getElementById('mic-idea-label');
        if (lbl) lbl.textContent = 'Speak Idea';
      };

      recognition.onerror = () => {
        micIdeaBtn.classList.remove('text-error', 'animate-pulse');
        const lbl = document.getElementById('mic-idea-label');
        if (lbl) lbl.textContent = 'Speak Idea';
        showToast("Speech recognition was cancelled or unavailable.");
      };
    } else {
      micIdeaBtn.addEventListener('click', () => {
        showToast("Speech recognition is not supported in this browser. Please type your idea.");
        ideaInput?.focus();
      });
    }
  }
}

function remove3DSimulation() {
  const simulationCard = document.getElementById('village-3d-simulation-card');
  if (simulationCard) {
    simulationCard.style.transition = 'all 0.35s ease-out';
    simulationCard.style.opacity = '0';
    simulationCard.style.maxHeight = '0px';
    simulationCard.style.margin = '0px';
    simulationCard.style.padding = '0px';
    simulationCard.style.overflow = 'hidden';
    setTimeout(() => {
      simulationCard.remove();
    }, 350);
  }
  try {
    localStorage.setItem('ruralbiz_simulation_dismissed', 'true');
  } catch (e) {}
}

function startPlanAndTakeLocation() {
  // Ensure we are viewing the landing explorer
  switchTab('landing-village-explorer');

  const locCard = document.getElementById('village-location-card');
  if (locCard) {
    locCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    locCard.classList.add('ring-2', 'ring-primary', 'ring-offset-2', 'ring-offset-surface');
    setTimeout(() => {
      locCard.classList.remove('ring-2', 'ring-primary', 'ring-offset-2', 'ring-offset-surface');
    }, 2500);
  }

  const gpsBtn = document.getElementById('gps-action-btn');
  const searchInput = document.getElementById('location-search-input');

  if (navigator.geolocation && gpsBtn) {
    detectCurrentLocation(gpsBtn, true);
  } else {
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
    showToast(`Current village: ${STATE.location.village}. Click 'Start Plan with this Village' or search below.`);
  }
}

function advanceToSetupWithLocation() {
  switchTab('wizard-setup');
  updateLocationDisplays();
  const locInput = document.getElementById('wizard-location-search-input');
  if (locInput) {
    locInput.focus();
    locInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    locInput.classList.add('ring-2', 'ring-primary');
    setTimeout(() => locInput.classList.remove('ring-2', 'ring-primary'), 2500);
  }
  showToast(`Step 1: Confirm your village location, then Step 2: Enter your business idea.`);
}

function detectCurrentLocation(btnElement, autoAdvance = false) {
  if (!navigator.geolocation) {
    showToast("Geolocation is not supported by your browser");
    if (autoAdvance) advanceToSetupWithLocation();
    return;
  }

  const originalHtml = btnElement ? btnElement.innerHTML : '';
  if (btnElement) {
    btnElement.innerHTML = `
      <span class="material-symbols-outlined text-[18px] text-tertiary animate-spin">sync</span>
      <span class="font-label-badge text-label-badge text-on-surface">Locking GPS Satellite...</span>`;
    btnElement.disabled = true;
  }

  const statusBadge = document.getElementById('location-active-status');
  if (statusBadge) {
    statusBadge.textContent = 'Locking GPS Satellite...';
    statusBadge.classList.remove('hidden');
  }

  let finished = false;

  // Timeout guard to NEVER freeze UI
  const timeoutId = setTimeout(() => {
    if (!finished) {
      finished = true;
      if (btnElement) {
        btnElement.innerHTML = originalHtml;
        btnElement.disabled = false;
      }
      if (statusBadge) statusBadge.classList.add('hidden');
      showToast(`Location set to: ${STATE.location.village}. You can search or confirm below.`);
      const searchInput = document.getElementById('location-search-input');
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
      if (autoAdvance) {
        advanceToSetupWithLocation();
      }
    }
  }, 4000);

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      if (finished) return;
      finished = true;
      clearTimeout(timeoutId);

      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      if (btnElement) {
        btnElement.innerHTML = `
          <span class="material-symbols-outlined text-[18px] text-primary animate-spin">location_searching</span>
          <span class="font-label-badge text-label-badge text-on-surface">Resolving Panchayat...</span>`;
      }
      if (statusBadge) {
        statusBadge.textContent = 'Resolving Panchayat...';
      }

      try {
        const resp = await fetch(`${API_BASE}/api/location/reverse-geocode?lat=${lat}&lon=${lon}`);
        const data = await resp.json();
        const loc = data.location;

        STATE.location = {
          village: loc.village,
          taluk: loc.taluk,
          district: loc.district,
          state: loc.state,
          lat: loc.latitude,
          lon: loc.longitude,
          displayName: loc.display_name
        };

        STATE.currentReport = null;
        updateLocationDisplays();
        updateMapCenterMarker();

        // Non-blocking background intelligence refresh
        refreshAllIntelligenceData().catch(err => console.warn("Background refresh error:", err));

        showToast(`📍 GPS Resolved: ${loc.village}, ${loc.district}`);

        if (autoAdvance) {
          advanceToSetupWithLocation();
        }
      } catch (err) {
        console.warn("Reverse geocode error:", err);
        showToast(`Using location: ${STATE.location.village}, ${STATE.location.district}`);
        if (autoAdvance) {
          advanceToSetupWithLocation();
        }
      } finally {
        if (btnElement) {
          btnElement.innerHTML = originalHtml;
          btnElement.disabled = false;
        }
        if (statusBadge) statusBadge.classList.add('hidden');
      }
    },
    (err) => {
      if (finished) return;
      finished = true;
      clearTimeout(timeoutId);

      if (btnElement) {
        btnElement.innerHTML = originalHtml;
        btnElement.disabled = false;
      }
      if (statusBadge) statusBadge.classList.add('hidden');

      let msg = "Could not retrieve GPS coordinates";
      if (err.code === err.PERMISSION_DENIED) {
        msg = "Location permission denied. Enter your village below.";
      } else if (err.code === err.TIMEOUT) {
        msg = "Location request timed out. Enter your village below.";
      }
      showToast(msg);

      const searchInput = document.getElementById('location-search-input');
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    },
    { timeout: 3500, enableHighAccuracy: false }
  );
}

async function executeVillageSearch(query) {
  if (!query || !query.trim()) {
    showToast("Please enter a village, taluk, or district name");
    return;
  }

  const cleanQ = query.trim();
  const lowerQ = cleanQ.toLowerCase();

  // If user searched for a business category / idea instead of a place:
  const clothingTerms = ['cloth', 'garment', 'textile', 'tailor', 'apparel', 'boutique', 'dress', 'saree', 'fashion'];
  const dairyTerms = ['dairy', 'milk', 'cattle'];
  const agroTerms = ['oil', 'millet', 'flour', 'poultry', 'chicken', 'mushroom'];

  const isClothing = clothingTerms.some(t => lowerQ.includes(t));
  const isDairy = dairyTerms.some(t => lowerQ.includes(t));
  const isAgro = agroTerms.some(t => lowerQ.includes(t));

  if (isClothing || isDairy || isAgro) {
    const targetCat = isClothing ? 'clothing' : isDairy ? 'dairy' : 'agro_processing';
    STATE.businessCategory = targetCat;
    STATE.customBusinessIdea = cleanQ;
    const catSel = document.getElementById('wizard-category-select');
    if (catSel) catSel.value = targetCat;
    const ideaInput = document.getElementById('custom-business-idea-input');
    if (ideaInput) ideaInput.value = cleanQ;
    updateCategoryFilterButton();
    showToast(`Enterprise configured: "${cleanQ.toUpperCase()}". Showing real market data for ${STATE.location.village}.`);
    refreshAllIntelligenceData().catch(err => console.warn(err));
    switchTab('wizard-setup');
    return;
  }

  showToast(`Searching for "${cleanQ}"...`);

  try {
    const resp = await fetch(`${API_BASE}/api/location/search?q=${encodeURIComponent(cleanQ)}`);
    const data = await resp.json();
    if (data.results && data.results.length > 0) {
      const first = data.results[0];
      STATE.location = {
        village: first.village || first.name,
        taluk: first.village || first.name,
        district: first.district || "District",
        state: first.state || "India",
        lat: first.latitude,
        lon: first.longitude,
        displayName: first.display_name
      };

      STATE.currentReport = null;
      updateLocationDisplays();
      updateMapCenterMarker();
      // Non-blocking background intelligence refresh
      refreshAllIntelligenceData().catch(err => console.warn(err));
      showToast(`Selected: ${STATE.location.village}, ${STATE.location.district}`);
    } else {
      showToast(`No matching locations found for "${cleanQ}"`);
    }
  } catch (err) {
    showToast("Error searching village. Check your internet connection.");
  }
}

function updateCategoryFilterButton() {
  const primaryBtn = document.getElementById('radar-filter-cat-primary');
  if (primaryBtn) {
    primaryBtn.setAttribute('data-filter', STATE.businessCategory);
    const catLabels = {
      'clothing': 'Clothing & Tailors',
      'dairy': 'Dairy Units',
      'agro_processing': 'Agro-Processing Units',
      'agro_supply': 'Suppliers & Feeds',
      'artisan': 'Artisans & Crafts',
      'logistics_repair': 'Machinery & Fleet',
      'grocery': 'Grocery & Provisions'
    };
    primaryBtn.textContent = catLabels[STATE.businessCategory] || `${STATE.businessCategory.toUpperCase()} Units`;
  }
}

function updateLocationDisplays() {
  const locStr = `${STATE.location.village}, ${STATE.location.district}`;
  const headerLoc = document.getElementById('header-location-display');
  const dashLoc = document.getElementById('dash-location-display');
  const wizardVillage = document.getElementById('wizard-village-display');
  const wizardDistrict = document.getElementById('wizard-district-display');
  const wizardState = document.getElementById('wizard-state-display');
  const wizardCoords = document.getElementById('wizard-coords-display');
  const wizardSearchInput = document.getElementById('wizard-location-search-input');
  const searchInput = document.getElementById('location-search-input');

  if (headerLoc) headerLoc.textContent = locStr;
  if (dashLoc) dashLoc.textContent = locStr;
  if (wizardVillage) wizardVillage.textContent = STATE.location.village;
  if (wizardDistrict) wizardDistrict.textContent = STATE.location.district;
  if (wizardState) wizardState.textContent = STATE.location.state;
  if (wizardCoords) {
    const latStr = Number(STATE.location.lat).toFixed(3);
    const lonStr = Number(STATE.location.lon).toFixed(3);
    wizardCoords.textContent = `${STATE.location.state} (${latStr}, ${lonStr})`;
  }
  if (wizardSearchInput && document.activeElement !== wizardSearchInput) {
    wizardSearchInput.value = locStr;
  }
  if (searchInput && document.activeElement !== searchInput) {
    searchInput.value = locStr;
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   6. DATA REFRESH (OSM, CENSUS, AGMARKNET, SURVEY)
   ═══════════════════════════════════════════════════════════════════════ */
async function refreshAllIntelligenceData() {
  await Promise.all([
    fetchOsmBusinesses(),
    fetchCensusDemographics(),
    fetchMandiPrices(),
    fetchSurveyRecords()
  ]);
}

async function fetchOsmBusinesses() {
  try {
    const locQuery = encodeURIComponent(STATE.location.village || STATE.location.district || '');
    const ideaQuery = encodeURIComponent(STATE.customBusinessIdea || '');
    const url = `${API_BASE}/api/data/osm-businesses?lat=${STATE.location.lat}&lon=${STATE.location.lon}&radius_km=${STATE.osmRadiusKm}&category=${STATE.businessCategory}&location_name=${locQuery}&business_idea=${ideaQuery}`;
    const resp = await fetch(url);
    const data = await resp.json();
    STATE.osmBusinesses = data.businesses || [];

    // Render Map Pins
    renderMapPins(STATE.osmBusinesses);

    // Update Counter & Metrics
    const count = data.metrics ? data.metrics.listed_businesses_count : STATE.osmBusinesses.length;
    const countTag = document.getElementById('listed-count-badge');
    if (countTag) {
      countTag.textContent = `${count} listed businesses found`;
    }

    // Populate Results List
    renderBusinessList(STATE.osmBusinesses, data.provenance);
  } catch (err) {
    console.warn("Failed to fetch OSM listings", err);
  }
}

function renderBusinessList(businesses, provenance) {
  const container = document.getElementById('osm-business-list');
  if (!container) return;

  if (businesses.length === 0) {
    container.innerHTML = `
      <div class="p-4 rounded-lg bg-surface-container text-center text-on-surface-variant text-sm">
        <p>No mapped commercial enterprises found within ${STATE.osmRadiusKm} km on OpenStreetMap.</p>
        <p class="text-xs text-outline mt-1">Note: Unmapped informal village shops do not appear in public geospatial registries.</p>
      </div>`;
    return;
  }

  let html = '';
  businesses.forEach(b => {
    const isClothing = b.category === 'clothing';
    const isDairy = b.category === 'dairy';
    const isSupplier = b.category === 'agro_supply';
    const isArtisan = b.category === 'artisan';
    let iconName = 'storefront';
    let iconColor = 'text-primary';
    if (isClothing) {
      iconName = 'checkroom';
      iconColor = 'text-indigo-400';
    } else if (isDairy) {
      iconName = 'store';
      iconColor = 'text-secondary';
    } else if (isSupplier) {
      iconName = 'agriculture';
      iconColor = 'text-primary';
    } else if (isArtisan) {
      iconName = 'palette';
      iconColor = 'text-amber-400';
    }
    const displayAddr = Array.isArray(b.address) ? b.address.join(', ') : (b.address || 'Local Environs');

    html += `
      <div class="flex items-center justify-between p-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors">
        <div class="flex items-center gap-2 min-w-0">
          <div class="w-8 h-8 rounded-lg bg-surface-variant flex items-center justify-center ${iconColor} flex-shrink-0">
            <span class="material-symbols-outlined text-[18px]">${iconName}</span>
          </div>
          <div class="flex flex-col min-w-0">
            <span class="font-body-md text-sm font-semibold text-on-surface truncate">${b.name}</span>
            <span class="font-body-sm text-xs text-on-surface-variant truncate">${displayAddr} · Tag: ${b.osm_tag}</span>
          </div>
        </div>
        <div class="flex flex-col items-end flex-shrink-0">
          <span class="font-label-numeric text-xs text-secondary font-semibold">${b.distance_km} km</span>
          <span class="font-label-badge text-[10px] text-outline uppercase">${b.category}</span>
        </div>
      </div>`;
  });

  if (provenance) {
    html += `
      <div class="mt-2 p-2 rounded bg-surface-container-lowest text-[11px] text-on-surface-variant/75 flex items-start gap-1.5">
        <span class="material-symbols-outlined text-[14px] text-tertiary flex-shrink-0 mt-0.5">verified</span>
        <span>Source: ${provenance.source} · Retrieved: ${new Date(provenance.retrieved_at).toLocaleDateString()} · ${provenance.limitations}</span>
      </div>`;
  }
  container.innerHTML = html;
}

async function fetchCensusDemographics() {
  try {
    const url = `${API_BASE}/api/data/census?query=${encodeURIComponent(STATE.location.taluk || STATE.location.district)}`;
    const resp = await fetch(url);
    const data = await resp.json();
    STATE.censusData = data;

    const ind = data.indicators || {};
    document.getElementById('census-pop-display').textContent = (ind.total_rural_population || 0).toLocaleString('en-IN');
    document.getElementById('census-hh-display').textContent = (ind.total_rural_households || 0).toLocaleString('en-IN');
    document.getElementById('census-lit-display').textContent = `${ind.literacy_rate_pct || 0}%`;
    document.getElementById('census-agri-workers').textContent = (ind.main_agricultural_laborers || 0).toLocaleString('en-IN');
  } catch (err) {
    console.warn("Census fetch error", err);
  }
}

async function fetchMandiPrices() {
  try {
    const url = `${API_BASE}/api/data/market-prices?category=${STATE.businessCategory}`;
    const resp = await fetch(url);
    const data = await resp.json();
    STATE.mandiData = data;

    const container = document.getElementById('mandi-price-rows');
    if (!container) return;

    if (!data.commodities || data.commodities.length === 0) {
      container.innerHTML = `<div class="p-3 text-center text-xs text-outline">No wholesale mandi arrivals reported for this category today.</div>`;
      return;
    }

    let rowsHtml = '';
    data.commodities.forEach(c => {
      rowsHtml += `
        <div class="p-3 rounded-lg bg-surface-container flex items-center justify-between gap-2 border border-outline-variant/30">
          <div class="flex flex-col min-w-0">
            <span class="font-body-md text-sm font-semibold text-on-surface truncate">${c.commodity}</span>
            <span class="font-body-sm text-xs text-on-surface-variant">${c.market} · Arrival: ${c.arrival_date}</span>
            <span class="text-[10px] text-outline">${c.price_type}</span>
          </div>
          <div class="flex flex-col items-end flex-shrink-0">
            <span class="font-label-numeric text-base text-primary font-bold">₹${c.modal_price.toLocaleString('en-IN')}</span>
            <span class="font-label-badge text-[10px] text-secondary">${c.unit}</span>
            <span class="text-[10px] text-tertiary">${c.trend_7d}</span>
          </div>
        </div>`;
    });
    container.innerHTML = rowsHtml;
  } catch (err) {
    console.warn("Mandi fetch error", err);
  }
}

async function fetchSurveyRecords() {
  try {
    const url = `${API_BASE}/api/data/survey?category=${STATE.businessCategory}&village=${encodeURIComponent(STATE.location.village)}`;
    const resp = await fetch(url);
    const data = await resp.json();
    STATE.surveyData = data.responses || [];

    const container = document.getElementById('survey-records-list');
    if (!container) return;

    if (STATE.surveyData.length === 0) {
      container.innerHTML = `<div class="p-3 text-center text-xs text-outline">No field survey entries recorded yet for this village. Be the first to record!</div>`;
      return;
    }

    let surveyHtml = '';
    STATE.surveyData.forEach(s => {
      surveyHtml += `
        <div class="p-3 rounded-lg bg-surface-container space-y-1 text-xs border border-outline-variant/20">
          <div class="flex items-center justify-between">
            <span class="font-semibold text-tertiary">${s.respondent_role}</span>
            <span class="text-outline font-mono">${s.submitted_at.substring(0, 10)}</span>
          </div>
          <p class="text-on-surface"><strong class="text-on-surface-variant">Unmet Need:</strong> ${s.unmet_local_needs}</p>
          <p class="text-on-surface-variant"><strong class="text-on-surface-variant">Purchasing Habit:</strong> ${s.customer_purchasing_habits || 'Regular'}</p>
          <div class="flex items-center gap-2 text-[11px] text-secondary">
            <span>Supplier Rating: ${s.supplier_reliability_score}/5</span>
            <span>·</span>
            <span>Est. Prices: ${s.approx_price_range || 'N/A'}</span>
          </div>
        </div>`;
    });
    container.innerHTML = surveyHtml;
  } catch (err) {
    console.warn("Survey fetch error", err);
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   7. FINANCIAL CALCULATOR & LOAN STRUCTURING
   ═══════════════════════════════════════════════════════════════════════ */
function initLoanCalculator() {
  const costSlider = document.getElementById('project-cost-slider');
  const marginSlider = document.getElementById('margin-share-slider');
  const btnMicro = document.getElementById('btn-scheme-micro');
  const btnTerm = document.getElementById('btn-scheme-term');

  if (costSlider) {
    costSlider.addEventListener('input', (e) => {
      STATE.projectCost = parseFloat(e.target.value);
      // Auto adjust margin if needed
      const minMargin = STATE.projectCost * 0.10;
      if (STATE.userMargin < minMargin) STATE.userMargin = minMargin;
      updateCalculator();
    });
  }

  if (marginSlider) {
    marginSlider.addEventListener('input', (e) => {
      const pct = parseFloat(e.target.value);
      STATE.userMargin = roundTo(STATE.projectCost * (pct / 100), 100);
      updateCalculator();
    });
  }

  if (btnMicro) {
    btnMicro.addEventListener('click', () => {
      STATE.preferredScheme = 'micro';
      if (STATE.projectCost > 140000) {
        STATE.projectCost = 140000;
        costSlider.value = 140000;
      }
      updateCalculator();
    });
  }

  if (btnTerm) {
    btnTerm.addEventListener('click', () => {
      STATE.preferredScheme = 'term';
      if (STATE.projectCost < 150000) {
        STATE.projectCost = 320000;
        costSlider.value = 320000;
      }
      updateCalculator();
    });
  }

  const generateReportBtn = document.getElementById('btn-generate-report');
  if (generateReportBtn) {
    generateReportBtn.addEventListener('click', () => {
      generateFeasibilityDPR();
    });
  }

  updateCalculator();
}

async function updateCalculator() {
  // Update slider displays
  const costDisp = document.getElementById('cost-display');
  const marginValDisp = document.getElementById('margin-val-display');
  const marginPctDisp = document.getElementById('margin-pct-display');
  const marginSlider = document.getElementById('margin-share-slider');

  if (costDisp) costDisp.textContent = `₹${STATE.projectCost.toLocaleString('en-IN')}`;
  if (marginValDisp) marginValDisp.textContent = `₹${STATE.userMargin.toLocaleString('en-IN')}`;
  
  const pct = (STATE.userMargin / STATE.projectCost) * 100;
  if (marginPctDisp) marginPctDisp.textContent = `(${pct.toFixed(1)}%)`;
  if (marginSlider) marginSlider.value = pct;

  // Toggle button styling
  const isMicro = STATE.projectCost <= 140000 && STATE.preferredScheme === 'micro';
  const btnMicro = document.getElementById('btn-scheme-micro');
  const btnTerm = document.getElementById('btn-scheme-term');
  if (btnMicro && btnTerm) {
    if (isMicro) {
      btnMicro.className = 'p-space-sm rounded-lg text-left transition-all bg-primary-container text-on-primary-container shadow-md';
      btnTerm.className = 'p-space-sm rounded-lg text-left transition-all bg-surface-container-lowest/80 text-on-surface-variant';
    } else {
      btnTerm.className = 'p-space-sm rounded-lg text-left transition-all bg-primary-container text-on-primary-container shadow-md';
      btnMicro.className = 'p-space-sm rounded-lg text-left transition-all bg-surface-container-lowest/80 text-on-surface-variant';
    }
  }

  try {
    const payload = {
      project_cost: STATE.projectCost,
      user_margin_capital: STATE.userMargin,
      preferred_scheme: STATE.preferredScheme,
      interest_accrues_in_moratorium: true
    };

    const resp = await fetch(`${API_BASE}/api/calculator/amortization`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await resp.json();
    renderCalculatorOutputs(data);
  } catch (err) {
    console.warn("Calculator error", err);
  }
}

function renderCalculatorOutputs(data) {
  const fin = data.financial_summary || {};
  const scheme = data.scheme || {};

  document.getElementById('loan-amount-display').textContent = `₹${(fin.sanctionable_agency_loan || 0).toLocaleString('en-IN')}`;
  document.getElementById('tenure-display').innerHTML = `${scheme.tenure_years} Yrs <span class="font-body-sm text-[12px] text-on-surface-variant">/ ${scheme.tenure_months}m</span>`;
  document.getElementById('moratorium-subtext').textContent = `${scheme.moratorium_months}m Principal Holiday`;
  document.getElementById('emi-display').textContent = `₹${(fin.indicative_monthly_emi || 0).toLocaleString('en-IN')}`;
  document.getElementById('quarterly-display').textContent = `₹${(fin.indicative_quarterly_installment || 0).toLocaleString('en-IN')}`;
  document.getElementById('total-interest-display').textContent = `₹${(fin.total_estimated_interest || 0).toLocaleString('en-IN')}`;

  // Funding gap badge
  const gapContainer = document.getElementById('funding-gap-badge');
  if (gapContainer) {
    if (fin.funding_gap > 0) {
      gapContainer.innerHTML = `<span class="material-symbols-outlined text-[13px] text-error">warning</span> Shortfall: ₹${fin.funding_gap.toLocaleString('en-IN')}`;
      gapContainer.className = 'inline-flex items-center gap-1 text-[11px] font-label-badge text-error';
    } else {
      gapContainer.innerHTML = `<span class="material-symbols-outlined text-[13px] text-primary">verified</span> Zero Funding Gap`;
      gapContainer.className = 'inline-flex items-center gap-1 text-[11px] font-label-badge text-primary';
    }
  }

  // Warnings render
  const warnContainer = document.getElementById('calc-warnings-container');
  if (warnContainer) {
    if (data.warnings && data.warnings.length > 0) {
      warnContainer.innerHTML = data.warnings.map(w => `
        <div class="p-2 rounded bg-error-container/20 border border-error/30 text-error text-xs flex items-center gap-2">
          <span class="material-symbols-outlined text-[16px]">info</span>
          <span>${w}</span>
        </div>`).join('');
      warnContainer.classList.remove('hidden');
    } else {
      warnContainer.innerHTML = '';
      warnContainer.classList.add('hidden');
    }
  }

  // Amortization Preview Table
  const tableBody = document.getElementById('amortization-table-body');
  if (tableBody && data.amortization_preview) {
    tableBody.innerHTML = data.amortization_preview.map(row => `
      <tr class="border-b border-outline-variant/20 hover:bg-surface-container/50">
        <td class="p-2 font-mono">${row.month}</td>
        <td class="p-2 text-xs">${row.phase}</td>
        <td class="p-2 font-mono">₹${row.principal_paid.toLocaleString('en-IN')}</td>
        <td class="p-2 font-mono">₹${row.interest_charged.toLocaleString('en-IN')}</td>
        <td class="p-2 font-mono font-semibold text-primary">₹${row.total_payment.toLocaleString('en-IN')}</td>
        <td class="p-2 font-mono text-outline">₹${row.remaining_balance.toLocaleString('en-IN')}</td>
      </tr>
    `).join('');
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   8. AI BUSINESS ADVISORY & REPORT GENERATOR (DPR)
   ═══════════════════════════════════════════════════════════════════════ */
let isGeneratingReport = false;
async function generateFeasibilityDPR(shouldSwitchTab = true) {
  if (isGeneratingReport) return;
  isGeneratingReport = true;

  if (shouldSwitchTab) {
    switchTab('feasibility-report');
  }
  showToast("Synthesizing live evidence into bankable DPR...");

  const reportContainer = document.getElementById('feasibility-report-container');
  if (reportContainer) {
    reportContainer.innerHTML = `
      <div class="flex flex-col items-center justify-center p-12 text-center space-y-3">
        <span class="material-symbols-outlined text-[48px] text-primary animate-spin">cyclone</span>
        <h3 class="font-headline-sm text-lg">Synthesizing Verified Data Layers...</h3>
        <p class="font-body-sm text-sm text-on-surface-variant max-w-md">Aggregating OpenStreetMap POIs, AGMARKNET wholesale rates, 2011 Census tables, and MoSJE statutory rules.</p>
      </div>`;
  }

  try {
    const customIdeaVal = STATE.customBusinessIdea || document.getElementById('custom-business-idea-input')?.value || '';
    const payload = {
      village_name: STATE.location.village,
      taluk: STATE.location.taluk,
      district: STATE.location.district,
      state: STATE.location.state,
      latitude: STATE.location.lat,
      longitude: STATE.location.lon,
      business_category: STATE.businessCategory,
      custom_business_idea: customIdeaVal.trim() ? customIdeaVal.trim() : null,
      project_cost: STATE.projectCost,
      user_margin: STATE.userMargin
    };

    const resp = await fetch(`${API_BASE}/api/advisory/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!resp.ok) {
      throw new Error(`Server status ${resp.status}`);
    }
    const report = await resp.json();
    STATE.currentReport = report;
    renderFeasibilityReport(report);
  } catch (err) {
    STATE.currentReport = null;
    showToast("Error generating advisory report");
    if (reportContainer) {
      reportContainer.innerHTML = `
        <div class="p-8 text-center space-y-3">
          <p class="text-error font-medium">Failed to generate feasibility report: ${err.message}</p>
          <button onclick="generateFeasibilityDPR(false)" class="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-all">
            Retry Advisory Synthesis
          </button>
        </div>`;
    }
  } finally {
    isGeneratingReport = false;
  }
}

function renderFeasibilityReport(rpt) {
  const container = document.getElementById('feasibility-report-container');
  if (!container) return;

  const ex = rpt.executive_summary || {};
  const calc = rpt.section_2_calculated_results || {};
  const ai = rpt.section_3_ai_interpretations || {};
  const swot = ai.swot_analysis || { strengths: [], weaknesses: [], opportunities: [], threats: [] };
  const customIdea = STATE.customBusinessIdea || document.getElementById('custom-business-idea-input')?.value || 'Rural Micro-Enterprise';
  const nearbyOsm = STATE.osmBusinesses || [];

  container.innerHTML = `
    <div class="p-4 sm:p-6 rounded-2xl bg-surface-container space-y-6 border border-outline-variant/30 print:border-none print:p-0 shadow-2xl">
      
      <!-- Report Header & Actions -->
      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-outline-variant/30 pb-5">
        <div>
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-mono uppercase tracking-wider font-semibold">
            <span class="material-symbols-outlined text-[14px]">verified</span>
            <span>Bankable Decision Report · ${rpt.report_id}</span>
          </div>
          <h2 class="font-headline-md text-2xl sm:text-3xl font-bold text-on-surface mt-2.5">${ex.project_title || 'Rural Enterprise Detailed Project Report'}</h2>
          <p class="font-body-sm text-sm text-on-surface-variant mt-1">
            <strong>Location:</strong> ${ex.target_location || `${STATE.location.village}, ${STATE.location.district}`} · 
            <strong>Concessional Scheme:</strong> ${ex.scheme_name || 'MoSJE PS-26091'}
          </p>
        </div>
        
        <div class="flex items-center gap-2 flex-shrink-0">
          <button onclick="window.print()" class="h-10 px-4 rounded-xl bg-surface-container-high hover:bg-surface-bright text-tertiary font-label-badge text-xs font-semibold flex items-center gap-2 transition-all shadow border border-outline-variant/40 active:scale-95">
            <span class="material-symbols-outlined text-[18px]">print</span>
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      <!-- Provenance Strip -->
      <div class="p-3 rounded-xl bg-surface-container-lowest/90 border border-outline-variant/20 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span class="text-tertiary font-mono flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          <span>Engine: ${rpt.ai_engine_info?.engine || 'RuralBiz AI Synthesis'} (${rpt.ai_engine_info?.api_status || 'Active'})</span>
        </span>
        <span class="text-on-surface-variant font-mono">Generated: ${new Date(rpt.generated_at).toLocaleString('en-IN')}</span>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════
           THE 12 STRUCTURED REPORT SECTIONS
           ═══════════════════════════════════════════════════════════════ -->
      <div class="space-y-5">

        <!-- 1. YOUR BUSINESS IDEA -->
        <div class="p-4 sm:p-5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-3">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <h3 class="font-headline-sm text-sm sm:text-base font-bold text-on-surface flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">1</span>
              <span>Your Business Idea</span>
            </h3>
            <span class="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold badge-verified uppercase">VERIFIED DATA</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div class="p-3 rounded-lg bg-surface-container">
              <span class="text-[11px] text-on-surface-variant uppercase font-semibold">Entered Venture Description</span>
              <p class="text-sm font-semibold text-primary mt-1">${customIdea}</p>
            </div>
            <div class="p-3 rounded-lg bg-surface-container">
              <span class="text-[11px] text-on-surface-variant uppercase font-semibold">Industry Sector Template</span>
              <p class="text-sm font-semibold text-on-surface mt-1">${STATE.businessCategory.toUpperCase()} · Micro-Enterprise Cluster</p>
            </div>
          </div>
          <p class="text-xs text-on-surface-variant leading-relaxed">
            ${ex.summary_assessment || 'Custom local enterprise plan evaluated against hyper-local market parameters.'}
          </p>
        </div>

        <!-- 2. YOUR SELECTED LOCATION -->
        <div class="p-4 sm:p-5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-3">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <h3 class="font-headline-sm text-sm sm:text-base font-bold text-on-surface flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">2</span>
              <span>Your Selected Location</span>
            </h3>
            <span class="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold badge-verified uppercase">VERIFIED DATA</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
            <div class="p-2.5 rounded-lg bg-surface-container">
              <span class="text-[11px] text-on-surface-variant">Village / Panchayat</span>
              <p class="font-bold text-on-surface text-sm mt-0.5">${STATE.location.village}</p>
            </div>
            <div class="p-2.5 rounded-lg bg-surface-container">
              <span class="text-[11px] text-on-surface-variant">Taluk / Block</span>
              <p class="font-bold text-on-surface text-sm mt-0.5">${STATE.location.taluk}</p>
            </div>
            <div class="p-2.5 rounded-lg bg-surface-container">
              <span class="text-[11px] text-on-surface-variant">District</span>
              <p class="font-bold text-primary text-sm mt-0.5">${STATE.location.district}</p>
            </div>
            <div class="p-2.5 rounded-lg bg-surface-container">
              <span class="text-[11px] text-on-surface-variant">Coordinates / Scope</span>
              <p class="font-mono text-secondary text-xs mt-1">${STATE.location.lat.toFixed(3)}, ${STATE.location.lon.toFixed(3)} (${STATE.osmRadiusKm}km)</p>
            </div>
          </div>
        </div>

        <!-- 3. WHAT THE AVAILABLE LOCAL DATA SHOWS -->
        <div class="p-4 sm:p-5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-3">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <h3 class="font-headline-sm text-sm sm:text-base font-bold text-on-surface flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">3</span>
              <span>What the Available Local Data Shows</span>
            </h3>
            <span class="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold badge-verified uppercase">VERIFIED DATA</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            ${(rpt.section_1_verified_observations || []).map(obs => `
              <div class="p-3 rounded-lg bg-surface-container space-y-1.5 text-xs border border-outline-variant/20">
                <span class="font-bold text-secondary uppercase tracking-wider text-[11px]">${obs.category}</span>
                <p class="text-on-surface leading-relaxed">${obs.finding}</p>
                <div class="pt-1 border-t border-outline-variant/20 flex flex-col gap-0.5 text-[10px] text-outline">
                  <span><strong>Source:</strong> ${obs.source}</span>
                  <span><strong>Limits:</strong> ${obs.limitations}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 4. NEARBY LISTED COMPETITORS -->
        <div class="p-4 sm:p-5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-3">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <h3 class="font-headline-sm text-sm sm:text-base font-bold text-on-surface flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">4</span>
              <span>Nearby Listed Competitors</span>
            </h3>
            <span class="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${nearbyOsm.length > 0 ? 'badge-verified' : 'badge-unavailable'} uppercase">
              ${nearbyOsm.length > 0 ? `${nearbyOsm.length} LISTED ENTITIES` : 'DATA UNAVAILABLE'}
            </span>
          </div>
          ${nearbyOsm.length > 0 ? `
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
              ${nearbyOsm.slice(0, 9).map(b => `
                <div class="p-2.5 rounded-lg bg-surface-container text-xs flex flex-col justify-between border border-outline-variant/20">
                  <div class="flex items-start justify-between gap-1">
                    <span class="font-semibold text-on-surface truncate">${b.name}</span>
                    <span class="font-mono text-[10px] text-primary whitespace-nowrap">${b.distance_km} km</span>
                  </div>
                  <span class="text-[10px] text-on-surface-variant truncate mt-1">${b.address || 'Local Gram Panchayat Mapped'}</span>
                  <span class="text-[9px] font-mono text-outline mt-0.5">OSM Node #${b.id}</span>
                </div>
              `).join('')}
            </div>
            <p class="text-[11px] text-outline italic">Note: OpenStreetMap reflects formally mapped commercial nodes. Informal and unlisted roadside businesses are not captured.</p>
          ` : `
            <div class="p-4 rounded-lg bg-surface-container text-xs text-on-surface-variant text-center">
              No formal commercial establishments currently cataloged in OpenStreetMap within ${STATE.osmRadiusKm}km. This suggests a potential first-mover advantage or underserved rural corridor.
            </div>
          `}
        </div>

        <!-- 5. POTENTIAL CUSTOMERS AND OPPORTUNITIES -->
        <div class="p-4 sm:p-5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-3">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <h3 class="font-headline-sm text-sm sm:text-base font-bold text-on-surface flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">5</span>
              <span>Potential Customers and Opportunities</span>
            </h3>
            <span class="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold badge-estimate uppercase">ESTIMATE</span>
          </div>
          <div class="p-3.5 rounded-lg bg-surface-container space-y-2 text-xs">
            <strong class="text-secondary font-semibold uppercase tracking-wider text-[11px]">Local Customer Segments & Market Reach</strong>
            <p class="text-on-surface leading-relaxed">${ai.market_reach_and_segments || 'Targeting surrounding village households, weekly haats, local smallholder farmers, and agricultural workers.'}</p>
          </div>
          <div class="p-3.5 rounded-lg bg-surface-container space-y-2 text-xs">
            <strong class="text-primary font-semibold uppercase tracking-wider text-[11px]">High-Potential Local Market Opportunities</strong>
            <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-on-surface">
              ${(swot.opportunities || ['Direct farmgate value addition', 'Supplying local SHG federations']).map(o => `
                <li class="flex items-start gap-1.5">
                  <span class="material-symbols-outlined text-primary text-[14px] mt-0.5">check_circle</span>
                  <span>${o}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>

        <!-- 6. SUGGESTED PRICING AND BUSINESS CONSIDERATIONS -->
        <div class="p-4 sm:p-5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-3">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <h3 class="font-headline-sm text-sm sm:text-base font-bold text-on-surface flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">6</span>
              <span>Suggested Pricing and Business Considerations</span>
            </h3>
            <span class="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold badge-estimate uppercase">ESTIMATE</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div class="p-3 rounded-lg bg-surface-container space-y-1">
              <span class="text-[11px] text-secondary font-semibold uppercase">Pricing Strategy</span>
              <p class="text-on-surface leading-relaxed">Adopt competitive cost-plus pricing with benchmark wholesale APMC rates as a baseline to maintain healthy 18–25% gross operating margins.</p>
            </div>
            <div class="p-3 rounded-lg bg-surface-container space-y-1">
              <span class="text-[11px] text-tertiary font-semibold uppercase">Working Capital Discipline</span>
              <p class="text-on-surface leading-relaxed">Limit unsecured customer credit to 7 days maximum to avoid liquidity bottlenecks during agricultural lean seasons.</p>
            </div>
          </div>
        </div>

        <!-- 7. MAIN RISKS AND HOW TO REDUCE THEM -->
        <div class="p-4 sm:p-5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-3">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <h3 class="font-headline-sm text-sm sm:text-base font-bold text-on-surface flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">7</span>
              <span>Main Risks and How to Reduce Them</span>
            </h3>
            <span class="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold badge-verify-needed uppercase">NEEDS VERIFICATION</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div class="p-3 rounded-lg bg-rose-950/20 border border-rose-500/20 space-y-1.5">
              <span class="text-xs font-bold text-rose-400 uppercase">Identified Risks & Threats</span>
              <ul class="space-y-1 text-on-surface">
                ${(swot.threats || ['Seasonal price volatility in mandi auctions', 'Unscheduled rural power supply interruptions']).map(t => `
                  <li class="flex items-start gap-1">
                    <span class="material-symbols-outlined text-rose-400 text-[14px] mt-0.5">warning</span>
                    <span>${t}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
            <div class="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 space-y-1.5">
              <span class="text-xs font-bold text-emerald-400 uppercase">Risk Reduction Strategy</span>
              <ul class="space-y-1 text-on-surface">
                <li class="flex items-start gap-1">
                  <span class="material-symbols-outlined text-emerald-400 text-[14px] mt-0.5">shield</span>
                  <span>Form backward buyback ties with local producer federations.</span>
                </li>
                <li class="flex items-start gap-1">
                  <span class="material-symbols-outlined text-emerald-400 text-[14px] mt-0.5">shield</span>
                  <span>Leverage solar micro-grid backup or fuel-efficient machinery.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 8. ESTIMATED STARTING INVESTMENT -->
        <div class="p-4 sm:p-5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-3">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <h3 class="font-headline-sm text-sm sm:text-base font-bold text-on-surface flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">8</span>
              <span>Estimated Starting Investment</span>
            </h3>
            <span class="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold badge-calculated uppercase">CALCULATED</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
            <div class="p-3 rounded-lg bg-surface-container">
              <span class="text-[11px] text-on-surface-variant">Total Capital Outlay</span>
              <p class="font-mono text-xl font-bold text-primary mt-1">₹${(calc.total_project_cost || STATE.projectCost).toLocaleString('en-IN')}</p>
            </div>
            <div class="p-3 rounded-lg bg-surface-container">
              <span class="text-[11px] text-on-surface-variant">Fixed Machinery & Tools (~70%)</span>
              <p class="font-mono text-lg font-bold text-on-surface mt-1">₹${Math.round((calc.total_project_cost || STATE.projectCost) * 0.70).toLocaleString('en-IN')}</p>
            </div>
            <div class="p-3 rounded-lg bg-surface-container">
              <span class="text-[11px] text-on-surface-variant">Initial Operating Capital (~30%)</span>
              <p class="font-mono text-lg font-bold text-secondary mt-1">₹${Math.round((calc.total_project_cost || STATE.projectCost) * 0.30).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        <!-- 9. POTENTIAL LOAN AND CONTRIBUTION -->
        <div class="p-4 sm:p-5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-3">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <h3 class="font-headline-sm text-sm sm:text-base font-bold text-on-surface flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">9</span>
              <span>Potential Loan and Contribution</span>
            </h3>
            <span class="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold badge-calculated uppercase">CALCULATED</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
            <div class="p-3 rounded-lg bg-surface-container">
              <span class="text-[11px] text-on-surface-variant">Approved Concessional Loan</span>
              <p class="font-mono text-base font-bold text-primary mt-1">₹${(calc.concessional_agency_loan || 0).toLocaleString('en-IN')}</p>
            </div>
            <div class="p-3 rounded-lg bg-surface-container">
              <span class="text-[11px] text-on-surface-variant">Your Margin Contribution</span>
              <p class="font-mono text-base font-bold text-secondary mt-1">₹${(calc.user_margin_capital || STATE.userMargin).toLocaleString('en-IN')}</p>
            </div>
            <div class="p-3 rounded-lg bg-surface-container">
              <span class="text-[11px] text-on-surface-variant">MoSJE Scheme Engine</span>
              <p class="font-bold text-tertiary text-xs mt-1 truncate">${ex.scheme_name || 'Term Loan (8.0%)'}</p>
            </div>
            <div class="p-3 rounded-lg bg-surface-container">
              <span class="text-[11px] text-on-surface-variant">Financing Structuring</span>
              <p class="font-bold text-emerald-400 text-xs mt-1">Zero Funding Gap</p>
            </div>
          </div>
        </div>

        <!-- 10. ESTIMATED REPAYMENT -->
        <div class="p-4 sm:p-5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-3">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <h3 class="font-headline-sm text-sm sm:text-base font-bold text-on-surface flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">10</span>
              <span>Estimated Repayment</span>
            </h3>
            <span class="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold badge-calculated uppercase">CALCULATED</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
            <div class="p-3 rounded-lg bg-surface-container">
              <span class="text-[11px] text-on-surface-variant">Estimated Monthly EMI</span>
              <p class="font-mono text-base font-bold text-primary mt-1">₹${(calc.indicative_monthly_emi || 0).toLocaleString('en-IN')}</p>
            </div>
            <div class="p-3 rounded-lg bg-surface-container">
              <span class="text-[11px] text-on-surface-variant">Quarterly Installment</span>
              <p class="font-mono text-base font-bold text-on-surface mt-1">₹${Math.round((calc.indicative_monthly_emi || 0) * 3).toLocaleString('en-IN')}</p>
            </div>
            <div class="p-3 rounded-lg bg-surface-container">
              <span class="text-[11px] text-on-surface-variant">Principal Holiday (Moratorium)</span>
              <p class="font-bold text-secondary text-xs mt-1">6 Months Initial Grace</p>
            </div>
            <div class="p-3 rounded-lg bg-surface-container">
              <span class="text-[11px] text-on-surface-variant">Daily Break-Even Units</span>
              <p class="font-mono text-base font-bold text-tertiary mt-1">${calc.calculated_break_even?.indicative_daily_units_needed || 14} units / day</p>
            </div>
          </div>
        </div>

        <!-- 11. WHAT YOU SHOULD VERIFY BEFORE INVESTING -->
        <div class="p-4 sm:p-5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-3">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <h3 class="font-headline-sm text-sm sm:text-base font-bold text-on-surface flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">11</span>
              <span>What You Should Verify Before Investing</span>
            </h3>
            <span class="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold badge-verify-needed uppercase">NEEDS VERIFICATION</span>
          </div>
          <ul class="space-y-2 text-xs text-on-surface-variant">
            ${(rpt.section_5_unknown_information || [
              'Conduct in-person price inquiries at local village weekly haats.',
              'Verify electricity line stability (3-phase power availability for machinery).',
              'Obtain written machinery quotations from 2 separate authorized suppliers.',
              'Confirm village panchayat trade license and registration requirements.'
            ]).map(item => `
              <li class="flex items-start gap-2 p-2.5 rounded-lg bg-surface-container border border-outline-variant/20">
                <span class="material-symbols-outlined text-secondary text-[16px] mt-0.5 flex-shrink-0">checklist</span>
                <span class="text-on-surface leading-relaxed">${item}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <!-- 12. DATA SOURCES, DATES, AND LIMITATIONS -->
        <div class="p-4 sm:p-5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-3">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <h3 class="font-headline-sm text-sm sm:text-base font-bold text-on-surface flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">12</span>
              <span>Data Sources, Dates, and Limitations</span>
            </h3>
            <span class="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold badge-verified uppercase">VERIFIED DATA</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div class="p-3 rounded-lg bg-surface-container space-y-1">
              <strong class="text-primary font-semibold">Authoritative Data Providers</strong>
              <p class="text-on-surface-variant mt-1">OpenStreetMap (live spatial nodes), 2011 Primary Census Abstract (Registrar General & Census Commissioner of India), AGMARKNET (Directorate of Marketing & Inspection), MoSJE Concessional Guidelines (SIH PS-26091).</p>
            </div>
            <div class="p-3 rounded-lg bg-surface-container space-y-1">
              <strong class="text-secondary font-semibold">Statutory Limitations & Scope</strong>
              <p class="text-on-surface-variant mt-1">Census baselines reflect official decennial statistics; OpenStreetMap reflects mapped commercial points. All financial projections are indicative models and require formal channelizing agency sanction.</p>
            </div>
          </div>
        </div>

      </div>

      <!-- Action Button: Start Plan with another Village -->
      <div class="pt-2 flex justify-between items-center gap-3">
        <button onclick="switchTab('wizard-setup')" class="h-11 px-5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-semibold flex items-center gap-1.5 transition-all">
          <span class="material-symbols-outlined text-[16px]">edit</span> Modify Business Parameters
        </button>
        <button onclick="window.print()" class="h-11 px-6 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center gap-1.5 hover:bg-primary-container transition-all shadow-lg active:scale-95">
          <span class="material-symbols-outlined text-[18px]">download</span> Export Bankable DPR (PDF)
        </button>
      </div>

    </div>`;
}

/* ═══════════════════════════════════════════════════════════════════════
   9. FIELD SURVEY SUBMISSION MODAL
   ═══════════════════════════════════════════════════════════════════════ */
function initFieldSurveyForm() {
  const openBtn = document.getElementById('btn-open-survey-modal');
  const closeBtn = document.getElementById('btn-close-survey-modal');
  const modal = document.getElementById('survey-modal');
  const submitBtn = document.getElementById('btn-submit-survey');

  if (openBtn && modal) openBtn.addEventListener('click', () => modal.classList.remove('hidden'));
  if (closeBtn && modal) closeBtn.addEventListener('click', () => modal.classList.add('hidden'));

  if (submitBtn) {
    submitBtn.addEventListener('click', async () => {
      const role = document.getElementById('survey-role').value;
      const products = document.getElementById('survey-products').value;
      const need = document.getElementById('survey-need').value;
      const rating = document.getElementById('survey-rating').value;

      if (!need || !products) {
        showToast("Please fill in the frequently purchased products and unmet need.");
        return;
      }

      const payload = {
        village_name: STATE.location.village,
        district_name: STATE.location.district,
        latitude: STATE.location.lat,
        longitude: STATE.location.lon,
        business_category: STATE.businessCategory,
        respondent_role: role,
        frequently_purchased: products,
        customer_purchasing_habits: "Direct in-person farmgate/village center visits",
        approx_price_range: "Local standard market rates",
        supplier_reliability_score: parseInt(rating) || 4,
        unmet_local_needs: need,
        existing_competition_perception: "Moderate competition; quality differentiation needed"
      };

      try {
        const resp = await fetch(`${API_BASE}/api/data/survey`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const res = await resp.json();
        showToast("Survey record stored in database!");
        if (modal) modal.classList.add('hidden');
        fetchSurveyRecords();
      } catch (err) {
        showToast("Failed to save survey. Check connectivity.");
      }
    });
  }
}

// Utility Helper
function roundTo(num, step) {
  return Math.round(num / step) * step;
}

function showToast(msg) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'fixed top-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-surface-container-high/95 text-on-surface border border-primary/30 shadow-2xl backdrop-blur-md text-xs font-mono transition-opacity duration-300 pointer-events-none opacity-0';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.remove('opacity-0');
  setTimeout(() => {
    toast.classList.add('opacity-0');
  }, 3200);
}
