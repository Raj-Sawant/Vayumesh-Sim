import * as THREE from 'three';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Minimal Procedural 3D Cloud System inspired by Spline 3D Design Aesthetics
 * ─────────────────────────────────────────────────────────────────────────────
 * Constructs smooth, organic, minimal cumulus cloud clusters positioned along
 * 3D CatmullRom Spline curves (THREE.CatmullRomCurve3).
 *
 * Each cloud has:
 * - Iconic Spline "soft clay / matte puff" tactile shading
 * - Spline-driven drift paths with natural smooth curvatures
 * - Organic gentle floating / bobbing dynamics
 * - Realistic depth layering (near, midground behind drone, distant horizon)
 * ─────────────────────────────────────────────────────────────────────────────
 */
export function createSplineCloudSystem(isMobile = false) {
  const cloudGroup = new THREE.Group();
  cloudGroup.name = 'SplineCloudSystem';

  // ── 1. MATERIALS (Spline Matte Clay Aesthetic) ───────────────────────────
  // Soft, diffuse, low-roughness matte finish with subtle subsurface/ambient tint
  const nearCloudMat = new THREE.MeshStandardMaterial({
    color: 0xf3f6fa,
    roughness: 0.78,
    metalness: 0.02,
    transparent: true,
    opacity: 0.92,
    emissive: 0x0c1a2d,
    emissiveIntensity: 0.22,
  });

  const midCloudMat = new THREE.MeshStandardMaterial({
    color: 0xd9e3ef,
    roughness: 0.84,
    metalness: 0.02,
    transparent: true,
    opacity: 0.85,
    emissive: 0x06111f,
    emissiveIntensity: 0.18,
  });

  const distantCloudMat = new THREE.MeshStandardMaterial({
    color: 0x7c94ae,
    roughness: 0.90,
    metalness: 0.0,
    transparent: true,
    opacity: 0.55,
    emissive: 0x030812,
    emissiveIntensity: 0.12,
  });

  // Reusable low/mid poly sphere geometries for ultra-smooth 60fps performance
  const sphereGeo = new THREE.SphereGeometry(1, isMobile ? 14 : 22, isMobile ? 12 : 18);

  /**
   * Builds an individual stylized cloud cluster using a 3D spline backbone
   * and overlapping soft puffs.
   */
  function buildCloudCluster(material, baseScale = 1.0, seed = 0) {
    const cluster = new THREE.Group();

    // Define 5-7 puff centers along a smooth horizontal Spline curve
    // to give each cloud an organic, aerodynamic, minimal silhouette
    const puffOffsets = [
      { x: -1.8, y: -0.2, z: 0.0,  r: 1.15, sy: 0.82 },
      { x: -0.9, y: 0.35, z: 0.2,  r: 1.55, sy: 0.88 },
      { x: 0.1,  y: 0.65, z: -0.1, r: 1.85, sy: 0.90 }, // central peak
      { x: 1.1,  y: 0.30, z: 0.15, r: 1.45, sy: 0.86 },
      { x: 1.9,  y: -0.15, z: -0.1, r: 1.10, sy: 0.80 },
      // Underside fill puffs (flattens base for classic cumulus look)
      { x: -0.4, y: -0.35, z: 0.3,  r: 1.25, sy: 0.70 },
      { x: 0.6,  y: -0.30, z: -0.2, r: 1.20, sy: 0.72 },
    ];

    puffOffsets.forEach((cfg) => {
      const puff = new THREE.Mesh(sphereGeo, material);
      puff.position.set(
        cfg.x * baseScale,
        cfg.y * baseScale,
        cfg.z * baseScale
      );
      puff.scale.set(
        cfg.r * baseScale,
        cfg.r * cfg.sy * baseScale,
        cfg.r * baseScale * 0.92
      );
      cluster.add(puff);
    });

    return cluster;
  }

  // ── 2. CLOUD CONFIGURATIONS & 3D SPLINE DRIFT TRAJECTORIES ───────────────
  // Place clouds at varying depths behind the drone (drone is at z = 5-8)
  const cloudConfigs = isMobile
    ? [
        { z: -8,  y: 2.5, scale: 1.2, speed: 0.020, mat: nearCloudMat,    offset: 0.10 },
        { z: -15, y: 6.0, scale: 1.5, speed: 0.014, mat: midCloudMat,     offset: 0.60 },
        { z: -22, y: 1.5, scale: 1.9, speed: 0.009, mat: distantCloudMat, offset: 0.35 },
      ]
    : [
        // Layer 1: Crisp near clouds right behind drone's horizontal patrol span
        { z: -7,  y: 2.2, scale: 1.15, speed: 0.022, mat: nearCloudMat,    offset: 0.08 },
        { z: -11, y: 5.8, scale: 1.45, speed: 0.018, mat: nearCloudMat,    offset: 0.42 },
        // Layer 2: Midground clouds with gentle volume and soft ambient rim
        { z: -16, y: -0.5, scale: 1.85, speed: 0.014, mat: midCloudMat,     offset: 0.75 },
        { z: -20, y: 7.5, scale: 2.10, speed: 0.011, mat: midCloudMat,     offset: 0.22 },
        // Layer 3: Distant vast horizon clouds drifting smoothly
        { z: -26, y: 3.2, scale: 2.60, speed: 0.008, mat: distantCloudMat, offset: 0.88 },
        { z: -32, y: 7.0, scale: 3.10, speed: 0.005, mat: distantCloudMat, offset: 0.55 },
      ];

  const cloudItems = [];

  cloudConfigs.forEach((cfg, idx) => {
    const cloudMesh = buildCloudCluster(cfg.mat, cfg.scale, idx);

    // Build a 3D CatmullRom Spline trajectory across the sky
    const spanX = 58;
    const dy = Math.sin(idx * 1.8) * 3.0;
    const dz = Math.cos(idx * 2.2) * 3.5;

    // Spline curve points creating a gentle organic glide across the hero space
    const splinePoints = [
      new THREE.Vector3(-spanX, cfg.y - dy * 0.4, cfg.z - dz * 0.8),
      new THREE.Vector3(-spanX * 0.33, cfg.y + dy, cfg.z + dz * 0.4),
      new THREE.Vector3(spanX * 0.33, cfg.y - dy * 0.6, cfg.z - dz * 0.3),
      new THREE.Vector3(spanX, cfg.y + dy * 0.5, cfg.z + dz * 0.7),
    ];

    const splineCurve = new THREE.CatmullRomCurve3(splinePoints);
    splineCurve.curveType = 'centripetal';

    cloudGroup.add(cloudMesh);

    cloudItems.push({
      mesh: cloudMesh,
      spline: splineCurve,
      speed: cfg.speed,
      progress: cfg.offset,
      baseY: cfg.y,
      scale: cfg.scale,
      index: idx,
    });
  });

  // ── 3. ANIMATION LOOP UPDATE ─────────────────────────────────────────────
  function update(delta, time) {
    cloudItems.forEach((c) => {
      // Progress along CatmullRom spline path
      c.progress = (c.progress + delta * c.speed) % 1.0;
      const pt = c.spline.getPointAt(c.progress);

      // Smooth organic breathing bobbing and gentle sway
      const bob = Math.sin(time * 0.85 + c.index * 1.3) * (0.32 * c.scale);
      const sway = Math.cos(time * 0.55 + c.index * 1.1) * 0.025;
      const tilt = Math.sin(time * 0.40 + c.index * 0.9) * 0.02;

      c.mesh.position.set(pt.x, pt.y + bob, pt.z);
      c.mesh.rotation.z = sway;
      c.mesh.rotation.y = tilt;
    });
  }

  return {
    cloudGroup,
    update,
    cloudItems,
  };
}
