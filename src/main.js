import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createTacticalDrone } from './droneModel.js';
import { ViewersManager } from './viewersManager.js';
import { VideoTracker } from './videoTracker.js';
import { soundFx } from './audioEngine.js';

gsap.registerPlugin(ScrollTrigger);

// ─────────────────────────────────────────────────────────────────────────────
// 1. HERO DRONE SCENE WITH 3D "VAYUMESH" BACKDROP & HORIZONTAL PATROL FLIGHT
// ─────────────────────────────────────────────────────────────────────────────
function initHeroDroneScene() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const w = window.innerWidth;
  const h = window.innerHeight;
  const isMobile = w < 768;

  const scene = new THREE.Scene();
  scene.background = null;
  scene.fog = new THREE.FogExp2(0x030712, isMobile ? 0.016 : 0.008);

  const camera = new THREE.PerspectiveCamera(45, w / h, 0.5, 400);
  camera.position.set(0, isMobile ? 4 : 8, isMobile ? 22 : 34);
  camera.lookAt(0, isMobile ? 1 : 2, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: true, powerPreference: 'high-performance' });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = !isMobile;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  // ── LIGHTING ──────────────────────────────────────────────────────────────
  const hemi = new THREE.HemisphereLight(0x00e5ff, 0x060f1c, 0.8);
  scene.add(hemi);

  const sunLight = new THREE.DirectionalLight(0xffffff, 2.4);
  sunLight.position.set(25, 40, 30);
  if (!isMobile) sunLight.castShadow = true;
  scene.add(sunLight);

  const greenRim = new THREE.DirectionalLight(0x00f59b, 1.8);
  greenRim.position.set(-20, 10, 8);
  scene.add(greenRim);

  const cyanRim = new THREE.DirectionalLight(0x00e5ff, 1.4);
  cyanRim.position.set(20, 5, 12);
  scene.add(cyanRim);

  const fillLight = new THREE.PointLight(0x00f59b, 2.8, 60);
  fillLight.position.set(0, 4, 10);
  scene.add(fillLight);

  // ── STAR FIELD ─────────────────────────────────────────────────────────────
  const starGeo = new THREE.BufferGeometry();
  const starsCount = isMobile ? 600 : 1400;
  const starPos = new Float32Array(starsCount * 3);
  for (let i = 0; i < starsCount; i++) {
    starPos[i * 3]     = (Math.random() - 0.5) * 400;
    starPos[i * 3 + 1] = (Math.random() - 0.5) * 400;
    starPos[i * 3 + 2] = (Math.random() - 0.5) * 400;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({ color: 0x94a3b8, size: 0.45, transparent: true, opacity: 0.55 });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // ── TACTICAL DRONE ─────────────────────────────────────────────────────────
  const { droneGroup, update: updateDrone } = createTacticalDrone();
  droneGroup.position.set(0, isMobile ? 0.5 : 1.5, isMobile ? 5.0 : 8.0);
  droneGroup.scale.setScalar(isMobile ? 1.0 : 1.55);
  scene.add(droneGroup);

  // Entrance animation
  gsap.from(droneGroup.scale, { x: 0.1, y: 0.1, z: 0.1, duration: 1.4, ease: 'back.out(1.4)', delay: 0.2 });

  // Scroll parallax
  gsap.to(droneGroup.position, {
    y: 28, z: 2,
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1.4 },
  });
  gsap.to(camera.position, {
    y: 12, z: 18,
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 2 },
  });

  // Mouse parallax (desktop only)
  let mouseX = 0, mouseY = 0;
  if (!isMobile) {
    document.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });
  }

  window.addEventListener('resize', () => {
    const nw = window.innerWidth;
    const nh = window.innerHeight;
    camera.aspect = nw / nh;
    camera.updateProjectionMatrix();
    renderer.setSize(nw, nh);
  });

  let lastTime = 0;
  function heroAnimate(time) {
    requestAnimationFrame(heroAnimate);
    const delta = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;
    const t = time * 0.001;

    updateDrone(delta, t);

    // Drone horizontal patrol
    const patrolSpan = isMobile ? 3.5 : 8.5;
    const patrolSpeed = 0.72;
    const patrolX = Math.sin(t * patrolSpeed) * patrolSpan + mouseX * 1.5;
    const patrolY = (isMobile ? 0.5 : 1.6) + Math.sin(t * 1.6) * 0.45 - mouseY * 0.8;
    const bankZ = -Math.cos(t * patrolSpeed) * 0.14;
    const yawY  = -Math.cos(t * patrolSpeed) * 0.28 + mouseX * 0.25;
    const pitchX = Math.sin(t * 1.2) * 0.04 - mouseY * 0.1;

    droneGroup.position.x = patrolX;
    droneGroup.position.y = patrolY;
    droneGroup.rotation.z = bankZ;
    droneGroup.rotation.y = yawY;
    droneGroup.rotation.x = pitchX;

    stars.rotation.y += 0.00012;
    renderer.render(scene, camera);
  }
  requestAnimationFrame(heroAnimate);
}


// ─────────────────────────────────────────────────────────────────────────────
// 2. VIDEO SECTION — Drone footage player + canvas tracking overlay
// ─────────────────────────────────────────────────────────────────────────────
function initVideoSection() {
  const videoEl = document.getElementById('drone-video');
  const overlayCanvas = document.getElementById('video-canvas-overlay');

  if (!videoEl || !overlayCanvas) return;

  const tracker = new VideoTracker(videoEl, overlayCanvas);

  // HUD telemetry counters
  const hudAlt = document.getElementById('hud-altitude');
  const hudDist = document.getElementById('hud-distance');
  const hudSat = document.getElementById('hud-satellites');
  const hudKeypoints = document.getElementById('hud-keypoints');
  const hudTime = document.getElementById('hud-time');

  let baseAlt = 48.2;
  let baseDist = 0;

  function updateTelemetry() {
    if (!videoEl.paused) {
      baseAlt += (Math.random() - 0.5) * 0.3;
      baseDist = (videoEl.currentTime * 2.8).toFixed(1);
    }
    if (hudAlt) hudAlt.textContent = baseAlt.toFixed(1) + 'm';
    if (hudDist) hudDist.textContent = baseDist + 'm';
    if (hudSat) hudSat.textContent = 14 + Math.floor(Math.sin(Date.now() / 8000) * 2);
    if (hudKeypoints) hudKeypoints.textContent = tracker.keypoints.length;
    if (hudTime && !videoEl.paused) {
      const ct = videoEl.currentTime;
      const mins = Math.floor(ct / 60).toString().padStart(2, '0');
      const secs = Math.floor(ct % 60).toString().padStart(2, '0');
      hudTime.textContent = `${mins}:${secs}`;
    }
  }

  setInterval(updateTelemetry, 200);

  function overlayLoop(ts) {
    requestAnimationFrame(overlayLoop);
    const rect = videoEl.getBoundingClientRect();
    if (overlayCanvas.width !== Math.floor(rect.width) || overlayCanvas.height !== Math.floor(rect.height)) {
      overlayCanvas.width = Math.floor(rect.width);
      overlayCanvas.height = Math.floor(rect.height);
    }
    tracker.render(ts);
  }
  requestAnimationFrame(overlayLoop);

  // Play button
  const playBtn = document.getElementById('play-btn');
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      soundFx.init();
      if (videoEl.paused) {
        videoEl.play();
        playBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
        soundFx.playChirp();
      } else {
        videoEl.pause();
        playBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>`;
      }
    });
  }

  // Progress bar
  const progressBar = document.getElementById('video-progress');
  const progressFill = document.getElementById('video-progress-fill');
  if (progressBar && progressFill) {
    videoEl.addEventListener('timeupdate', () => {
      const pct = (videoEl.currentTime / (videoEl.duration || 1)) * 100;
      progressFill.style.width = pct + '%';
    });
    progressBar.addEventListener('click', (e) => {
      const rect = progressBar.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      videoEl.currentTime = pct * videoEl.duration;
    });
  }

  // Sound toggle
  const soundBtn = document.getElementById('sound-btn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      const on = soundFx.toggle();
      soundBtn.classList.toggle('active', on);
    });
  }

  // Tracking toggles
  const trackBtn = document.getElementById('track-kp-btn');
  const vecBtn = document.getElementById('track-vec-btn');
  if (trackBtn) {
    trackBtn.addEventListener('click', () => {
      tracker.showKeypoints = !tracker.showKeypoints;
      trackBtn.classList.toggle('active', tracker.showKeypoints);
    });
  }
  if (vecBtn) {
    vecBtn.addEventListener('click', () => {
      tracker.showVectors = !tracker.showVectors;
      vecBtn.classList.toggle('active', tracker.showVectors);
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. THREE-VIEWER INITIALIZATION (Point Cloud · CAD Wireframe · Confidence Heatmap)
// ─────────────────────────────────────────────────────────────────────────────
function initViewers() {
  const pcContainer = document.getElementById('viewer-pointcloud');
  const wfContainer = document.getElementById('viewer-wireframe');
  const hmContainer = document.getElementById('viewer-heatmap');

  if (!pcContainer || !wfContainer || !hmContainer) return;

  const viewersManager = new ViewersManager({
    pointCloud: pcContainer,
    wireframe: wfContainer,
    heatmap: hmContainer,
  });

  window.__vayumesh_viewers = viewersManager;

  // Slicing Slider
  const slicingSlider = document.getElementById('slicing-slider');
  if (slicingSlider) {
    slicingSlider.addEventListener('input', (e) => {
      viewersManager.setSliceProgress(Number(e.target.value) / 100);
    });
  }

  // POI Quick Jump Buttons
  document.querySelectorAll('[data-poi]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-poi]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      viewersManager.jumpToPOI(btn.dataset.poi);
    });
  });

  // Dimension Matrix Toggle Button (Works across all 3 viewers!)
  const dimToggleBtn = document.getElementById('dim-toggle-btn');
  if (dimToggleBtn) {
    dimToggleBtn.addEventListener('click', () => {
      const isVisible = viewersManager.toggleDimensions();
      dimToggleBtn.classList.toggle('active', isVisible);
      soundFx.init();
      soundFx.playClick();
    });
  }

  // Measurement Tool Toggle
  const measureBtn = document.getElementById('measure-btn');
  if (measureBtn) {
    measureBtn.addEventListener('click', () => {
      const isActive = measureBtn.classList.toggle('active');
      viewersManager.toggleMeasurementTool(isActive);
      soundFx.init();
      if (isActive) soundFx.playLaserSweep();
    });
  }

  // Camera Sync Toggle
  const syncBtn = document.getElementById('sync-cam-btn');
  if (syncBtn) {
    syncBtn.addEventListener('click', () => {
      viewersManager.syncCameras = !viewersManager.syncCameras;
      syncBtn.classList.toggle('active', viewersManager.syncCameras);
      soundFx.init();
      soundFx.playClick();
    });
  }

  // Heatmap Mode Switcher
  document.querySelectorAll('[data-heatmode]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-heatmode]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const v = viewersManager.viewers.heatmap;
      if (v && v.heatmapMaterial) {
        v.heatmapMaterial.uniforms.uMode.value = Number(btn.dataset.heatmode);
      }
      soundFx.init();
      soundFx.playClick();
    });
  });

  // Point Cloud size control
  const pcSizeSlider = document.getElementById('pc-size-slider');
  if (pcSizeSlider) {
    pcSizeSlider.addEventListener('input', (e) => {
      const v = viewersManager.viewers.pointCloud;
      if (v && v.pointMaterial) {
        v.pointMaterial.size = Number(e.target.value) / 10;
      }
    });
  }

  // Fullscreen Panel Handler (Embeds complete HUD Toolbar as overlay in Fullscreen)
  const toolbar = document.querySelector('.viewers-toolbar');
  const toolbarHome = document.getElementById('toolbar-home');

  async function toggleFullscreen(panel) {
    soundFx.init();
    const btn = panel.querySelector('.fullscreen-btn');
    const isCurrentlyFs = document.fullscreenElement === panel || panel.classList.contains('is-fullscreen');

    if (isCurrentlyFs) {
      if (document.fullscreenElement) {
        try { await document.exitFullscreen(); } catch (e) {}
      }
      panel.classList.remove('is-fullscreen');
      if (btn) btn.textContent = '⛶';
      document.body.style.overflow = '';
      if (toolbar && toolbarHome) {
        toolbarHome.appendChild(toolbar);
      }
      soundFx.playClick();
    } else {
      soundFx.playLockOn();
      if (btn) btn.textContent = '⊡';

      // Move toolbar into panel BEFORE requesting fullscreen so it's included
      if (toolbar) {
        panel.appendChild(toolbar);
      }

      try {
        if (panel.requestFullscreen) {
          await panel.requestFullscreen();
        } else if (panel.webkitRequestFullscreen) {
          await panel.webkitRequestFullscreen();
        } else {
          panel.classList.add('is-fullscreen');
          document.body.style.overflow = 'hidden';
        }
      } catch (err) {
        panel.classList.add('is-fullscreen');
        document.body.style.overflow = 'hidden';
      }
    }

    viewersManager.resize();
    setTimeout(() => viewersManager.resize(), 80);
    setTimeout(() => viewersManager.resize(), 250);
    setTimeout(() => viewersManager.resize(), 500);
  }

  document.addEventListener('fullscreenchange', () => {
    const fsEl = document.fullscreenElement;
    if (!fsEl) {
      // Exited fullscreen — restore toolbar to its home
      document.querySelectorAll('.viewer-panel').forEach(p => {
        p.classList.remove('is-fullscreen');
        const btn = p.querySelector('.fullscreen-btn');
        if (btn) btn.textContent = '⛶';
      });
      document.body.style.overflow = '';
      if (toolbar && toolbarHome) {
        toolbarHome.appendChild(toolbar);
      }
    } else {
      // Entered fullscreen
      const panel = fsEl.closest('.viewer-panel') || fsEl;
      if (panel) {
        panel.classList.add('is-fullscreen');
        const btn = panel.querySelector('.fullscreen-btn');
        if (btn) btn.textContent = '⊡';
        // Ensure toolbar is inside the fullscreen panel
        if (toolbar && !panel.contains(toolbar)) {
          panel.appendChild(toolbar);
        }
      }
    }
    viewersManager.resize();
    setTimeout(() => viewersManager.resize(), 80);
    setTimeout(() => viewersManager.resize(), 300);
  });

  document.querySelectorAll('.fullscreen-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetId = btn.dataset.target;
      // target is now the .viewer-panel itself
      const panel = targetId ? document.getElementById(targetId) : btn.closest('.viewer-panel');
      if (panel) toggleFullscreen(panel);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const fsPanel = document.querySelector('.viewer-panel.is-fullscreen');
      if (fsPanel) toggleFullscreen(fsPanel);
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. SCROLL ANIMATIONS (GSAP ScrollTrigger)
// ─────────────────────────────────────────────────────────────────────────────
function initScrollAnimations() {
  gsap.from('.hero-title .word', {
    y: 80,
    opacity: 0,
    stagger: 0.12,
    duration: 0.95,
    ease: 'power3.out',
    delay: 0.5,
  });

  gsap.from('.hero-subtitle', {
    y: 40,
    opacity: 0,
    duration: 0.9,
    ease: 'power2.out',
    delay: 1.1,
  });

  gsap.from('.hero-badges', {
    y: 40,
    opacity: 0,
    duration: 0.8,
    ease: 'power2.out',
    delay: 1.4,
  });

  gsap.from('.hero-stats .stat', {
    y: 50,
    opacity: 0,
    stagger: 0.1,
    duration: 0.7,
    ease: 'back.out(1.4)',
    delay: 1.7,
  });

  gsap.from('#video-section .section-heading', {
    y: 60,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '#video-section',
      start: 'top 80%',
    },
  });

  gsap.from('.video-wrapper', {
    y: 80,
    opacity: 0,
    scale: 0.95,
    duration: 1.2,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '#video-section',
      start: 'top 75%',
    },
  });

  gsap.from('.viewer-panel', {
    y: 80,
    opacity: 0,
    stagger: 0.15,
    duration: 1.0,
    ease: 'power3.out',
    clearProps: 'transform',
    scrollTrigger: {
      trigger: '#viewers-section',
      start: 'top 80%',
    },
  });

  // Pipeline steps stagger
  gsap.from('.pipeline-card', {
    y: 60,
    opacity: 0,
    stagger: 0.1,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '#pipeline-section',
      start: 'top 80%',
    },
  });

  // Stats counter animation
  document.querySelectorAll('.counter-stat').forEach(el => {
    const target = parseFloat(el.dataset.target || 0);
    const suffix = el.dataset.suffix || '';
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 2.2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true,
      },
      onUpdate() {
        el.textContent = obj.val.toFixed(decimals) + suffix;
      },
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. NAVIGATION & MISC HUD
// ─────────────────────────────────────────────────────────────────────────────
function initNavAndHUD() {
  const nav = document.getElementById('main-nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    });
  }

  // Hamburger mobile menu
  const hamburger = document.getElementById('nav-hamburger');
  const navLinks = document.getElementById('nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      hamburger.classList.toggle('is-open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    // Close on nav link click (mobile)
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        hamburger.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  const loader = document.getElementById('loading-screen');
  if (loader) {
    let pct = 0;
    const fill = loader.querySelector('.loader-fill');
    const pctEl = loader.querySelector('.loader-pct');
    const interval = setInterval(() => {
      pct += Math.floor(Math.random() * 15 + 5);
      if (pct >= 100) {
        pct = 100;
        clearInterval(interval);
        setTimeout(() => {
          gsap.to(loader, {
            opacity: 0,
            duration: 0.6,
            ease: 'power2.in',
            onComplete() { loader.style.display = 'none'; },
          });
        }, 300);
      }
      if (fill) fill.style.width = pct + '%';
      if (pctEl) pctEl.textContent = pct + '%';
    }, 70);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BOOT
// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavAndHUD();
  initHeroDroneScene();
  initVideoSection();
  initViewers();
  initScrollAnimations();
});
