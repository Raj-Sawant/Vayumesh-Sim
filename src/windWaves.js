import * as THREE from 'three';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Aerodynamic Wind Waves & Airflow Streamlines System
 * ─────────────────────────────────────────────────────────────────────────────
 * Simulates high-altitude atmospheric wind currents and aerodynamic airflow waves
 * flowing past the tactical drone in the hero section.
 *
 * Features:
 * - Multi-layered harmonic wind wave ribbons flowing smoothly across 3D space
 * - Sleek aerodynamic color gradients (tactical cyan -> emerald mint -> subtle aero glow)
 * - Flowing wind streak particles moving along the airflow velocity vectors
 * - Parallax and wind responsiveness to mouse and scroll
 * ─────────────────────────────────────────────────────────────────────────────
 */
export function createWindWaveSystem(isMobile = false) {
  const windGroup = new THREE.Group();
  windGroup.name = 'WindWaveSystem';

  // ── 1. WIND STREAMLINE RIBBONS ───────────────────────────────────────────
  const ribbonCount = isMobile ? 10 : 22;
  const segments = isMobile ? 48 : 80;
  const spanX = isMobile ? 38 : 55;

  const waveLines = [];

  // Color palette for wind streamlines
  const palette = [
    { color: new THREE.Color(0x00e5ff), opacity: 0.75 }, // Cyber cyan
    { color: new THREE.Color(0x00f59b), opacity: 0.65 }, // Emerald mint
    { color: new THREE.Color(0x67e8f9), opacity: 0.50 }, // Ice blue
    { color: new THREE.Color(0xa7f3d0), opacity: 0.40 }, // Soft aero green
    { color: new THREE.Color(0xffffff), opacity: 0.80 }, // Crisp white air streak
  ];

  for (let i = 0; i < ribbonCount; i++) {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array((segments + 1) * 3);
    const colors = new Float32Array((segments + 1) * 3);

    const chosenPal = palette[i % palette.length];
    const baseColor = chosenPal.color;

    // Height distribution: spread across the hero altitude behind the drone
    const baseY = (i / (ribbonCount - 1) - 0.5) * (isMobile ? 12 : 18) + (isMobile ? 1.5 : 2.5);
    // Depth: layered behind the drone (drone is at z ~ 5..8, waves at z ~ -2..-22)
    const baseZ = -2 - (i % 7) * 2.8 - Math.random() * 2.0;

    const speed = 0.8 + Math.random() * 1.4;
    const freq = 0.08 + Math.random() * 0.06;
    const amp = 0.6 + Math.random() * 1.2;
    const phase = Math.random() * Math.PI * 2;
    const secondaryAmp = amp * (0.3 + Math.random() * 0.3);
    const secondaryFreq = freq * (1.6 + Math.random() * 0.8);

    // Populate initial positions and vertex color gradient (fade at ends)
    for (let j = 0; j <= segments; j++) {
      const u = j / segments;
      const x = -spanX + u * 2 * spanX;
      positions[j * 3]     = x;
      positions[j * 3 + 1] = baseY;
      positions[j * 3 + 2] = baseZ;

      // Alpha falloff at edges for smooth aerodynamic vanish
      const edgeFactor = Math.sin(u * Math.PI); // 0 at edges, 1 in center
      const r = baseColor.r * edgeFactor;
      const g = baseColor.g * edgeFactor;
      const b = baseColor.b * edgeFactor;

      colors[j * 3]     = r;
      colors[j * 3 + 1] = g;
      colors[j * 3 + 2] = b;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: chosenPal.opacity * (isMobile ? 0.7 : 0.85),
      blending: THREE.AdditiveBlending,
      linewidth: 1,
    });

    const line = new THREE.Line(geo, mat);
    windGroup.add(line);

    waveLines.push({
      line,
      geo,
      positions,
      baseY,
      baseZ,
      speed,
      freq,
      amp,
      secondaryAmp,
      secondaryFreq,
      phase,
    });
  }

  // ── 2. TRANSLUCENT AERO WIND SHEETS (Silky Wave Ribbons) ──────────────────
  // Creates glowing, wavy aerodynamic flow ribbons that ripple smoothly
  const sheetCount = isMobile ? 2 : 4;
  const sheetMeshes = [];

  for (let s = 0; s < sheetCount; s++) {
    const sWidth = isMobile ? 65 : 95;
    const sHeight = 2.4 + s * 0.8;
    const sSegX = isMobile ? 32 : 54;
    const sSegY = 2;

    const sheetGeo = new THREE.PlaneGeometry(sWidth, sHeight, sSegX, sSegY);
    const sheetMat = new THREE.MeshBasicMaterial({
      color: s % 2 === 0 ? 0x00e5ff : 0x00f59b,
      transparent: true,
      opacity: isMobile ? 0.045 : 0.075,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const sheetMesh = new THREE.Mesh(sheetGeo, sheetMat);
    const sheetBaseY = (s - (sheetCount - 1) / 2) * 5.0 + 2.0;
    const sheetBaseZ = -8 - s * 4.5;
    sheetMesh.position.set(0, sheetBaseY, sheetBaseZ);
    sheetMesh.rotation.x = Math.PI * 0.08;

    windGroup.add(sheetMesh);

    sheetMeshes.push({
      mesh: sheetMesh,
      geo: sheetGeo,
      origPos: sheetGeo.attributes.position.array.slice(),
      baseY: sheetBaseY,
      baseZ: sheetBaseZ,
      speed: 1.1 + s * 0.35,
      freq: 0.07 + s * 0.02,
      phase: s * 1.5,
    });
  }

  // ── 3. AIRFLOW STREAK PARTICLES (High-Velocity Wind Vectors) ─────────────
  // Streaks of wind streaming horizontally through the wave field
  const particleCount = isMobile ? 60 : 160;
  const particleGeo = new THREE.BufferGeometry();
  const particlePos = new Float32Array(particleCount * 3);
  const particleSpeeds = new Float32Array(particleCount);
  const particleAlphas = new Float32Array(particleCount);
  const particleWaveIndices = new Int32Array(particleCount);

  for (let p = 0; p < particleCount; p++) {
    particlePos[p * 3]     = (Math.random() - 0.5) * spanX * 2;
    particlePos[p * 3 + 1] = (Math.random() - 0.5) * (isMobile ? 12 : 18) + 2.0;
    particlePos[p * 3 + 2] = -3 - Math.random() * 18;

    particleSpeeds[p] = 18 + Math.random() * 22; // rapid horizontal airflow velocity
    particleAlphas[p] = 0.3 + Math.random() * 0.65;
    particleWaveIndices[p] = p % ribbonCount;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

  const particleMat = new THREE.PointsMaterial({
    color: 0x00e5ff,
    size: isMobile ? 0.35 : 0.55,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particleSystem = new THREE.Points(particleGeo, particleMat);
  windGroup.add(particleSystem);

  // ── 4. UPDATE LOOP ────────────────────────────────────────────────────────
  function update(delta, time) {
    // A. Update streamline curves
    for (let i = 0; i < waveLines.length; i++) {
      const w = waveLines[i];
      const pos = w.positions;
      const t = time * w.speed + w.phase;

      for (let j = 0; j <= segments; j++) {
        const u = j / segments;
        const x = -spanX + u * 2 * spanX;

        // Harmonic traveling wind wave equation: primary + secondary harmonic wave
        const yOffset =
          Math.sin(x * w.freq - t) * w.amp +
          Math.cos(x * w.secondaryFreq + t * 0.7) * w.secondaryAmp;

        const zOffset =
          Math.sin(x * (w.freq * 0.8) - t * 0.8) * (w.amp * 0.7);

        pos[j * 3]     = x;
        pos[j * 3 + 1] = w.baseY + yOffset;
        pos[j * 3 + 2] = w.baseZ + zOffset;
      }

      w.geo.attributes.position.needsUpdate = true;
    }

    // B. Deform translucent wind sheet ribbons
    for (let s = 0; s < sheetMeshes.length; s++) {
      const sm = sheetMeshes[s];
      const posAttr = sm.geo.attributes.position;
      const posArr = posAttr.array;
      const orig = sm.origPos;
      const st = time * sm.speed + sm.phase;

      for (let k = 0; k < posArr.length; k += 3) {
        const ox = orig[k];
        const oy = orig[k + 1];
        // Vertical ripple
        posArr[k + 1] = oy + Math.sin(ox * sm.freq - st) * 0.9 + Math.cos(ox * 0.03 + st * 0.5) * 0.4;
        // Depth ripple
        posArr[k + 2] = orig[k + 2] + Math.sin(ox * (sm.freq * 0.7) - st * 0.8) * 0.8;
      }
      posAttr.needsUpdate = true;
    }

    // C. Stream high-velocity airflow particles along wind direction
    const pPos = particleGeo.attributes.position.array;
    for (let p = 0; p < particleCount; p++) {
      // Wind streams from left to right (downwind)
      pPos[p * 3] += particleSpeeds[p] * delta;

      // Wrap around when past span
      if (pPos[p * 3] > spanX) {
        pPos[p * 3] = -spanX;
        pPos[p * 3 + 1] = (Math.random() - 0.5) * (isMobile ? 12 : 18) + 2.0;
        pPos[p * 3 + 2] = -3 - Math.random() * 18;
      }

      // Ride the wave height subtly
      const curX = pPos[p * 3];
      pPos[p * 3 + 1] += Math.sin(curX * 0.12 - time * 2.0) * 0.04;
    }
    particleGeo.attributes.position.needsUpdate = true;
  }

  return {
    windGroup,
    update,
  };
}
