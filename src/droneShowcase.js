import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createTacticalDrone } from './droneModel.js';

gsap.registerPlugin(ScrollTrigger);

/**
 * Creates procedural 3D extruded block letter geometry for 'VAYUMESH'
 * Gives ultra-crisp metallic 3D typography in the background of the drone horizontal scroll.
 */
function create3DLetterShape(char) {
  const s = new THREE.Shape();
  const w = 6.0;
  const h = 9.0;
  const t = 1.4; // stem thickness

  switch (char) {
    case 'V':
      s.moveTo(0, h);
      s.lineTo(t * 1.1, h);
      s.lineTo(w / 2, t * 0.8);
      s.lineTo(w - t * 1.1, h);
      s.lineTo(w, h);
      s.lineTo(w / 2 + t * 0.6, 0);
      s.lineTo(w / 2 - t * 0.6, 0);
      s.closePath();
      break;

    case 'A':
      s.moveTo(0, 0);
      s.lineTo(t, 0);
      s.lineTo(w / 2 - t * 0.3, h - t * 1.5);
      s.lineTo(w / 2 + t * 0.3, h - t * 1.5);
      s.lineTo(w - t, 0);
      s.lineTo(w, 0);
      s.lineTo(w / 2 + t * 0.8, h);
      s.lineTo(w / 2 - t * 0.8, h);
      s.closePath();

      // Inner hole
      const holeA = new THREE.Path();
      holeA.moveTo(w / 2, h - t * 2.8);
      holeA.lineTo(w / 2 + t * 0.7, t * 2.2);
      holeA.lineTo(w / 2 - t * 0.7, t * 2.2);
      holeA.closePath();
      s.holes.push(holeA);
      break;

    case 'Y':
      s.moveTo(0, h);
      s.lineTo(t * 1.1, h);
      s.lineTo(w / 2 - t * 0.3, h * 0.45);
      s.lineTo(w / 2 - t * 0.5, 0);
      s.lineTo(w / 2 + t * 0.5, 0);
      s.lineTo(w / 2 + t * 0.3, h * 0.45);
      s.lineTo(w - t * 1.1, h);
      s.lineTo(w, h);
      s.lineTo(w / 2 + t * 0.6, h * 0.42);
      s.lineTo(w / 2 - t * 0.6, h * 0.42);
      s.closePath();
      break;

    case 'U':
      s.moveTo(0, h);
      s.lineTo(t, h);
      s.lineTo(t, t * 1.8);
      s.quadraticCurveTo(t, t, w / 2, t);
      s.quadraticCurveTo(w - t, t, w - t, t * 1.8);
      s.lineTo(w - t, h);
      s.lineTo(w, h);
      s.lineTo(w, t * 1.8);
      s.quadraticCurveTo(w, 0, w / 2, 0);
      s.quadraticCurveTo(0, 0, 0, t * 1.8);
      s.closePath();
      break;

    case 'M':
      s.moveTo(0, 0);
      s.lineTo(t * 0.9, 0);
      s.lineTo(t * 0.9, h * 0.75);
      s.lineTo(w / 2 - t * 0.2, h * 0.15);
      s.lineTo(w / 2 + t * 0.2, h * 0.15);
      s.lineTo(w - t * 0.9, h * 0.75);
      s.lineTo(w - t * 0.9, 0);
      s.lineTo(w, 0);
      s.lineTo(w, h);
      s.lineTo(w - t * 1.2, h);
      s.lineTo(w / 2, h * 0.45);
      s.lineTo(t * 1.2, h);
      s.lineTo(0, h);
      s.closePath();
      break;

    case 'E':
      s.moveTo(0, 0);
      s.lineTo(w, 0);
      s.lineTo(w, t);
      s.lineTo(t, t);
      s.lineTo(t, h / 2 - t / 2);
      s.lineTo(w * 0.82, h / 2 - t / 2);
      s.lineTo(w * 0.82, h / 2 + t / 2);
      s.lineTo(t, h / 2 + t / 2);
      s.lineTo(t, h - t);
      s.lineTo(w, h - t);
      s.lineTo(w, h);
      s.lineTo(0, h);
      s.closePath();
      break;

    case 'S':
      s.moveTo(0, t * 1.2);
      s.lineTo(t, t * 1.2);
      s.quadraticCurveTo(t, t, w / 2, t);
      s.quadraticCurveTo(w - t, t, w - t, h * 0.32);
      s.quadraticCurveTo(w - t, h * 0.52, w / 2, h * 0.52);
      s.quadraticCurveTo(0, h * 0.52, 0, h * 0.80);
      s.quadraticCurveTo(0, h, w / 2, h);
      s.quadraticCurveTo(w, h, w, h - t * 1.2);
      s.lineTo(w - t, h - t * 1.2);
      s.quadraticCurveTo(w - t, h - t, w / 2, h - t);
      s.quadraticCurveTo(t, h - t, t, h * 0.80);
      s.quadraticCurveTo(t, h * 0.62, w / 2, h * 0.62);
      s.quadraticCurveTo(w, h * 0.62, w, h * 0.32);
      s.quadraticCurveTo(w, 0, w / 2, 0);
      s.quadraticCurveTo(0, 0, 0, t * 1.2);
      s.closePath();
      break;

    case 'H':
      s.moveTo(0, 0);
      s.lineTo(t, 0);
      s.lineTo(t, h / 2 - t / 2);
      s.lineTo(w - t, h / 2 - t / 2);
      s.lineTo(w - t, 0);
      s.lineTo(w, 0);
      s.lineTo(w, h);
      s.lineTo(w - t, h);
      s.lineTo(w - t, h / 2 + t / 2);
      s.lineTo(t, h / 2 + t / 2);
      s.lineTo(t, h);
      s.lineTo(0, h);
      s.closePath();
      break;

    default:
      s.moveTo(0, 0);
      s.lineTo(w, 0);
      s.lineTo(w, h);
      s.lineTo(0, h);
      s.closePath();
      break;
  }

  return { shape: s, width: w, height: h };
}

export function create3DVayumeshText() {
  const textGroup = new THREE.Group();
  textGroup.name = '3D_VAYUMESH_Typography';

  const letters = ['V', 'A', 'Y', 'U', 'M', 'E', 'S', 'H'];
  const spacing = 1.4;
  const extrudeDepth = 2.4;

  const letterMat = new THREE.MeshStandardMaterial({
    color: 0x0f1c2e,
    roughness: 0.28,
    metalness: 0.88,
    emissive: 0x031220,
    emissiveIntensity: 0.3,
  });

  const edgeMat = new THREE.LineBasicMaterial({
    color: 0x00f59b,
    transparent: true,
    opacity: 0.85,
  });

  const extrudeSettings = {
    steps: 2,
    depth: extrudeDepth,
    bevelEnabled: true,
    bevelThickness: 0.45,
    bevelSize: 0.35,
    bevelSegments: 4,
  };

  let currentX = 0;
  const letterMeshes = [];

  letters.forEach(char => {
    const { shape, width, height } = create3DLetterShape(char);
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const mesh = new THREE.Mesh(geo, letterMat);
    mesh.position.set(currentX, -height / 2, -extrudeDepth / 2);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Glowing edge wireframe for that high-tech military cyber aesthetic
    const edgeGeo = new THREE.EdgesGeometry(geo, 15);
    const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
    mesh.add(edgeLines);

    textGroup.add(mesh);
    letterMeshes.push(mesh);
    currentX += width + spacing;
  });

  // Center the whole group around origin
  const totalWidth = currentX - spacing;
  textGroup.position.set(-totalWidth / 2, 0, -18); // positioned in 3D background behind drone

  return { textGroup, totalWidth, letterMeshes };
}

/**
 * Initializes the full Horizontal Drone Showcase Section with 3D VAYUMESH Backdrop
 */
export function initDroneHorizontalShowcase() {
  const canvas = document.getElementById('drone-showcase-canvas');
  const section = document.getElementById('drone-showcase-section');
  const track = document.getElementById('drone-showcase-track');

  if (!canvas || !section || !track) return;

  const width = window.innerWidth;
  const height = window.innerHeight;

  // 3D Scene
  const scene = new THREE.Scene();
  scene.background = null;
  scene.fog = new THREE.FogExp2(0x040811, 0.012);

  const camera = new THREE.PerspectiveCamera(40, width / height, 0.5, 300);
  camera.position.set(0, 4, 30);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  // ── LIGHTING ──────────────────────────────────────────────────────────────
  const hemi = new THREE.HemisphereLight(0x00e5ff, 0x050c18, 1.2);
  scene.add(hemi);

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
  keyLight.position.set(25, 35, 30);
  keyLight.castShadow = true;
  scene.add(keyLight);

  const greenRimLight = new THREE.PointLight(0x00f59b, 4.0, 70);
  greenRimLight.position.set(-18, 10, -5);
  scene.add(greenRimLight);

  const cyanRimLight = new THREE.PointLight(0x00e5ff, 3.5, 60);
  cyanRimLight.position.set(18, -6, 5);
  scene.add(cyanRimLight);

  // Background 3D 'VAYUMESH' text (ONLY FOR THIS SECTION)
  const { textGroup, totalWidth: textWidth } = create3DVayumeshText();
  scene.add(textGroup);

  // Tactical UAV Drone
  const { droneGroup, gimbalPitch, update: updateDrone } = createTacticalDrone();
  droneGroup.position.set(0, 0, 0);
  droneGroup.scale.setScalar(1.55);
  scene.add(droneGroup);

  // Ground Grid
  const grid = new THREE.GridHelper(100, 30, 0x00f59b, 0x0d1f30);
  grid.position.y = -7;
  scene.add(grid);

  // ── GSAP HORIZONTAL SCROLL & 3D DRONE FLIGHT CHOREOGRAPHY ────────────────
  const totalTrackWidth = track.scrollWidth;
  const viewportWidth = window.innerWidth;
  const scrollDistance = totalTrackWidth - viewportWidth;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => '+=' + (scrollDistance + 800),
      pin: true,
      scrub: 1.2,
      anticipatePin: 1,
    },
  });

  // 1. Move HTML track horizontally
  tl.to(track, {
    x: () => -scrollDistance,
    ease: 'none',
  }, 0);

  // 2. Parallax 3D VAYUMESH text across the background
  tl.to(textGroup.position, {
    x: -textWidth / 2 + 18,
    z: -14,
    ease: 'none',
  }, 0);

  // 3. Choreograph Drone flight poses across the 5 stations
  // Station 1: Airframe (Intro angle) -> Station 2: Optical Gimbal (Close tilt)
  tl.to(droneGroup.position, { x: 3.5, y: -0.5, z: 4, ease: 'power1.inOut' }, 0.0)
    .to(droneGroup.rotation, { x: 0.15, y: -Math.PI * 0.45, z: 0.08, ease: 'power1.inOut' }, 0.0);

  // Station 2 -> Station 3: LiDAR Rangefinder inspection (High angle look-down)
  tl.to(droneGroup.position, { x: -2.5, y: 1.2, z: 2, ease: 'power1.inOut' }, 0.25)
    .to(droneGroup.rotation, { x: 0.35, y: Math.PI * 0.35, z: -0.15, ease: 'power1.inOut' }, 0.25);

  // Station 3 -> Station 4: Edge AI Compute & Quad ESC (Underbody inspection)
  tl.to(droneGroup.position, { x: 3.0, y: -1.0, z: 5, ease: 'power1.inOut' }, 0.50)
    .to(droneGroup.rotation, { x: -0.45, y: -Math.PI * 0.85, z: 0.22, ease: 'power1.inOut' }, 0.50);

  // Station 4 -> Station 5: Full Military Flight Posture & High Speed Exit
  tl.to(droneGroup.position, { x: 0, y: 0.5, z: 0, ease: 'power1.inOut' }, 0.75)
    .to(droneGroup.rotation, { x: 0.12, y: Math.PI * 2.05, z: 0.05, ease: 'power1.inOut' }, 0.75);

  // Subtle floating text tilt
  tl.to(textGroup.rotation, {
    y: 0.12,
    x: -0.04,
    ease: 'none',
  }, 0);

  // Resize handler
  window.addEventListener('resize', () => {
    const nw = window.innerWidth;
    const nh = window.innerHeight;
    camera.aspect = nw / nh;
    camera.updateProjectionMatrix();
    renderer.setSize(nw, nh);
  });

  // Animation Loop
  let lastTime = 0;
  function animate(time) {
    requestAnimationFrame(animate);
    const delta = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;
    const t = time * 0.001;

    updateDrone(delta, t);

    // Subtle floating breathing effect on 3D text
    textGroup.position.y = Math.sin(t * 1.5) * 0.35;

    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);
}
