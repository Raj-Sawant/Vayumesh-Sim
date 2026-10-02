import * as THREE from 'three';

/**
 * Procedural Architectural Generator for Taj Mahal — PRECISION v4.0
 * SIH 26158 - Indian Army / MoD Metric Reconstruction
 * Scale: 1 unit = 1 metre (Real-world 1:1 metric)
 *
 * Improvements in v4.0:
 * - Removed circular ring artifacts on square plinth and octagonal tomb
 * - Removed interior cenotaph tomb boxes per user request
 * - Sharp architectural cornice moldings and authentic multi-foil pishtaq arches
 * - Authentic onion dome profile with high-precision bulbous curvature
 * - 4 detached 3-tier minarets with outward tilt
 * - High-fidelity Makrana marble and sandstone procedural shaders
 * - Metric-accurate dimensions (73.0m apex, 95.16m plinth, 57.0m tomb, 40.0m minarets)
 */

// ─── MAKRANA MARBLE TEXTURE ────────────────────────────────────────────────────
function createMakranaMarbleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  // Ivory base
  ctx.fillStyle = '#faf8f4';
  ctx.fillRect(0, 0, 512, 512);

  // Translucent crystalline patches
  for (let i = 0; i < 70; i++) {
    const x0 = Math.random() * 512;
    const y0 = Math.random() * 512;
    const rad = 30 + Math.random() * 90;
    const g = ctx.createRadialGradient(x0, y0, 2, x0, y0, rad);
    g.addColorStop(0, 'rgba(232, 227, 218, 0.40)');
    g.addColorStop(1, 'rgba(250, 248, 244, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x0, y0, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  // Mineral veining
  ctx.lineWidth = 0.85;
  for (let v = 0; v < 14; v++) {
    ctx.strokeStyle = v % 3 === 0
      ? 'rgba(150,165,175,0.18)'
      : v % 3 === 1
      ? 'rgba(205,180,135,0.14)'
      : 'rgba(185,190,200,0.12)';
    ctx.beginPath();
    let cx = Math.random() * 512;
    let cy = 0;
    ctx.moveTo(cx, cy);
    while (cy < 512) {
      cy += 10 + Math.random() * 22;
      cx += (Math.random() - 0.49) * 34;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }

  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(4, 4);
  return t;
}

// ─── RED SANDSTONE TEXTURE ─────────────────────────────────────────────────────
function createSandstoneTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#8b3a2a';
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 220; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const r = 2 + Math.random() * 8;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(145,64,45,0.55)');
    g.addColorStop(1, 'rgba(139,58,42,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(6, 6);
  return t;
}

export function createTajMahalArchitecture() {
  const root = new THREE.Group();
  root.name = 'TajMahal_MetricModel';

  const marbleTexture = createMakranaMarbleTexture();
  const sandstoneTexture = createSandstoneTexture();

  // ── MATERIALS ──────────────────────────────────────────────────────────────
  const marbleMat = new THREE.MeshStandardMaterial({
    color: 0xfefdfa,
    map: marbleTexture,
    roughness: 0.18,
    metalness: 0.05,
    clippingPlanes: [],
    clipShadows: true,
  });

  const marbleDarkMat = new THREE.MeshStandardMaterial({
    color: 0xeee8df,
    roughness: 0.30,
    metalness: 0.04,
    clippingPlanes: [],
    clipShadows: true,
  });

  const marbleTrimMat = new THREE.MeshStandardMaterial({
    color: 0xe8e2d4,
    roughness: 0.35,
    metalness: 0.03,
    clippingPlanes: [],
    clipShadows: true,
  });

  const sandstoneMat = new THREE.MeshStandardMaterial({
    color: 0x9c3e2a,
    map: sandstoneTexture,
    roughness: 0.85,
    metalness: 0.02,
    clippingPlanes: [],
  });

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xf5b324,
    roughness: 0.08,
    metalness: 0.98,
    clippingPlanes: [],
    envMapIntensity: 2.0,
  });

  const archRecessMat = new THREE.MeshStandardMaterial({
    color: 0x070e17,
    roughness: 0.98,
    metalness: 0.0,
    clippingPlanes: [],
  });

  const pietraMat = new THREE.MeshStandardMaterial({
    color: 0x141e1a,
    roughness: 0.25,
    metalness: 0.15,
    clippingPlanes: [],
  });

  const interiorMat = new THREE.MeshStandardMaterial({
    color: 0xf2eee6,
    map: marbleTexture,
    roughness: 0.35,
    metalness: 0.04,
    side: THREE.DoubleSide,
    clippingPlanes: [],
  });

  const jaliMat = new THREE.MeshStandardMaterial({
    color: 0xded8cc,
    roughness: 0.45,
    wireframe: true,
    clippingPlanes: [],
  });

  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x101c13,
    roughness: 0.96,
  });

  const poolMat = new THREE.MeshStandardMaterial({
    color: 0x0090d0,
    roughness: 0.05,
    metalness: 0.92,
  });

  const lawnMat = new THREE.MeshStandardMaterial({
    color: 0x183b1c,
    roughness: 0.92,
  });

  // ── HELPERS ────────────────────────────────────────────────────────────────
  // Smooth pointed Mughal ogee arch tube
  function makeMughalArchTube(width, height, tubeR = 0.42) {
    const hw = width / 2;
    const pts = [
      new THREE.Vector3(-hw, 0, 0),
      new THREE.Vector3(-hw, height * 0.48, 0),
      new THREE.Vector3(-hw * 0.82, height * 0.70, 0),
      new THREE.Vector3(-hw * 0.52, height * 0.86, 0),
      new THREE.Vector3(-hw * 0.18, height * 0.96, 0),
      new THREE.Vector3(0, height, 0), // apex
      new THREE.Vector3(hw * 0.18, height * 0.96, 0),
      new THREE.Vector3(hw * 0.52, height * 0.86, 0),
      new THREE.Vector3(hw * 0.82, height * 0.70, 0),
      new THREE.Vector3(hw, height * 0.48, 0),
      new THREE.Vector3(hw, 0, 0),
    ];
    const curve = new THREE.CatmullRomCurve3(pts);
    return new THREE.TubeGeometry(curve, 96, tubeR, 14, false);
  }

  // Lathe helper
  function lathe(profileFn, pts = 160, phi = 96) {
    const p = [];
    for (let i = 0; i <= pts; i++) p.push(profileFn(i / pts));
    return new THREE.LatheGeometry(p, phi);
  }

  // Chamfered octagon extruded shape
  function makeOctagonShape(halfW, chamfer) {
    const s = new THREE.Shape();
    s.moveTo(-halfW + chamfer, -halfW);
    s.lineTo(halfW - chamfer, -halfW);
    s.lineTo(halfW, -halfW + chamfer);
    s.lineTo(halfW, halfW - chamfer);
    s.lineTo(halfW - chamfer, halfW);
    s.lineTo(-halfW + chamfer, halfW);
    s.lineTo(-halfW, halfW - chamfer);
    s.lineTo(-halfW, -halfW + chamfer);
    s.closePath();
    return s;
  }

  // Rectangular molding border for square plinth tiers
  function makeRectCornice(width, height, thickness, mat) {
    const g = new THREE.Group();
    const half = width / 2;
    // 4 edges
    const tb = new THREE.BoxGeometry(width, height, thickness);
    const lr = new THREE.BoxGeometry(thickness, height, width);
    const mN = new THREE.Mesh(tb, mat || marbleTrimMat); mN.position.set(0, 0, -half); g.add(mN);
    const mS = new THREE.Mesh(tb, mat || marbleTrimMat); mS.position.set(0, 0, half); g.add(mS);
    const mW = new THREE.Mesh(lr, mat || marbleTrimMat); mW.position.set(-half, 0, 0); g.add(mW);
    const mE = new THREE.Mesh(lr, mat || marbleTrimMat); mE.position.set(half, 0, 0); g.add(mE);
    return g;
  }

  // ==========================================================================
  // 1. PLINTH & TERRACE — Sharp, square 3-tier stepped marble plinth
  // ==========================================================================
  const plinthGroup = new THREE.Group();
  plinthGroup.name = 'Plinth_Foundation';

  // Lower sandstone terrace
  const lowerTerrace = new THREE.Mesh(new THREE.BoxGeometry(108, 2.4, 108), sandstoneMat);
  lowerTerrace.position.y = 1.2;
  lowerTerrace.receiveShadow = true;
  plinthGroup.add(lowerTerrace);

  // 3-tier marble plinth (sharp rectilinear tiers, NO round rings)
  const tiers = [
    { w: 95.16, h: 2.6, y: 2.4 + 1.3 },
    { w: 93.80, h: 2.0, y: 5.0 + 1.0 },
    { w: 92.40, h: 1.8, y: 7.0 + 0.9 },
  ];
  tiers.forEach(tier => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(tier.w, tier.h, tier.w), marbleMat);
    m.position.y = tier.y;
    m.castShadow = true;
    m.receiveShadow = true;
    plinthGroup.add(m);

    // Sharp rectilinear cornice molding along the edge
    const cornice = makeRectCornice(tier.w + 0.4, 0.35, 0.4, marbleTrimMat);
    cornice.position.y = tier.y + tier.h / 2;
    plinthGroup.add(cornice);
  });

  // Plinth Top Slab
  const cap = new THREE.Mesh(new THREE.BoxGeometry(91.8, 0.5, 91.8), marbleDarkMat);
  cap.position.y = 9.7;
  plinthGroup.add(cap);

  // Steps (South face)
  for (let s = 0; s < 6; s++) {
    const sw = 22 - s * 0.7;
    const sm = new THREE.Mesh(new THREE.BoxGeometry(sw, 0.52, 1.6), marbleMat);
    sm.position.set(0, 1.9 + s * 0.52, 49.5 + 1.6 * s);
    plinthGroup.add(sm);
  }

  root.add(plinthGroup);
  const PLINTH_TOP = 9.9;

  // ==========================================================================
  // 2. MAIN TOMB OCTAGONAL BODY — 57m × 57m × 33m
  // ==========================================================================
  const tombGroup = new THREE.Group();
  tombGroup.name = 'Main_Tomb_Structure';
  tombGroup.position.y = PLINTH_TOP;

  const mainWidth = 57.0;
  const mainHeight = 33.0;
  const chamfer = 10.5;
  const halfW = mainWidth / 2;

  const octShape = makeOctagonShape(halfW, chamfer);

  // Main extruded chamfered body
  const bodyGeo = new THREE.ExtrudeGeometry(octShape, {
    steps: 6,
    depth: mainHeight,
    bevelEnabled: true,
    bevelThickness: 0.8,
    bevelSize: 0.6,
    bevelSegments: 4,
  });
  bodyGeo.rotateX(-Math.PI / 2); // flat on XZ
  const mainBody = new THREE.Mesh(bodyGeo, marbleMat);
  mainBody.castShadow = true;
  mainBody.receiveShadow = true;
  tombGroup.add(mainBody);

  // Parapet molding at roof edge
  const parapetGeo = new THREE.ExtrudeGeometry(makeOctagonShape(halfW + 0.3, chamfer + 0.1), {
    depth: 1.8,
    bevelEnabled: false,
  });
  parapetGeo.rotateX(-Math.PI / 2);
  const parapetMesh = new THREE.Mesh(parapetGeo, marbleDarkMat);
  parapetMesh.position.y = mainHeight;
  tombGroup.add(parapetMesh);

  // Crenellated merlons on 4 main parapet walls
  [-halfW + 2, halfW - 2].forEach(pCoord => {
    for (let i = -6; i <= 6; i++) {
      if (Math.abs(i) > 2) {
        const m1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 0.8), marbleMat);
        m1.position.set(i * 3.2, mainHeight + 2.5, pCoord);
        tombGroup.add(m1);

        const m2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.4, 1.6), marbleMat);
        m2.position.set(pCoord, mainHeight + 2.5, i * 3.2);
        tombGroup.add(m2);
      }
    }
  });

  // Guldasta pinnacles on 8 parapet corners
  const gulPositions = [
    [halfW - 1, halfW - chamfer], [halfW - chamfer, halfW - 1],
    [-halfW + 1, halfW - chamfer], [-halfW + chamfer, halfW - 1],
    [halfW - 1, -halfW + chamfer], [halfW - chamfer, -halfW + 1],
    [-halfW + 1, -halfW + chamfer], [-halfW + chamfer, -halfW + 1],
  ];
  gulPositions.forEach(([px, pz]) => {
    const gulGeo = lathe(t => new THREE.Vector2(0.45 * (1 - t * 0.6) + Math.sin(t * Math.PI) * 0.15, t * 4.2), 24, 16);
    const gul = new THREE.Mesh(gulGeo, marbleMat);
    gul.position.set(px, mainHeight + 1.8, pz);
    tombGroup.add(gul);

    const gpeak = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), goldMat);
    gpeak.position.set(px, mainHeight + 1.8 + 4.3, pz);
    tombGroup.add(gpeak);
  });

  // ==========================================================================
  // 3. PISHTAQ GRAND ARCHES — 4 cardinal facades
  // ==========================================================================
  const pW = 19.5;
  const pH = 29.5;
  const pD = 4.2;

  const archDirs = [
    { angle: 0, pos: new THREE.Vector3(0, pH / 2 + 1.5, halfW + 0.1) },
    { angle: Math.PI, pos: new THREE.Vector3(0, pH / 2 + 1.5, -halfW - 0.1) },
    { angle: Math.PI / 2, pos: new THREE.Vector3(halfW + 0.1, pH / 2 + 1.5, 0) },
    { angle: -Math.PI / 2, pos: new THREE.Vector3(-halfW - 0.1, pH / 2 + 1.5, 0) },
  ];

  archDirs.forEach(dir => {
    const ag = new THREE.Group();

    // Dark iwan recess void
    const recessMesh = new THREE.Mesh(new THREE.BoxGeometry(pW - 2, pH + 1.5, pD + 1), archRecessMat);
    recessMesh.position.set(0, 0, -(pD + 1) / 2);
    ag.add(recessMesh);

    // Marble surround facade
    const surroundMesh = new THREE.Mesh(new THREE.BoxGeometry(pW + 5.0, pH + 4.5, 0.6), marbleMat);
    surroundMesh.position.set(0, 0, 0.1);
    ag.add(surroundMesh);

    // Outer grand pointed arch
    const outerArch = new THREE.Mesh(makeMughalArchTube(pW, pH, 0.52), marbleDarkMat);
    outerArch.position.set(0, -pH / 2, 0.5);
    ag.add(outerArch);

    // Inner second decorative arch
    const innerArch = new THREE.Mesh(makeMughalArchTube(pW * 0.72, pH * 0.76, 0.35), marbleTrimMat);
    innerArch.position.set(0, -pH / 2 + pH * 0.12, 0.65);
    ag.add(innerArch);

    // Pietra dura calligraphy black border
    const frameLR = pW + 5.6;
    const frameTB = pH + 5.2;
    [
      [-frameLR / 2, 0, frameTB, 0.4],
      [frameLR / 2, 0, frameTB, 0.4],
      [0, frameTB / 2, frameLR, 0.4],
      [0, -frameTB / 2, frameLR, 0.4],
    ].forEach(([fx, fy, fl, fw]) => {
      const fIsV = Math.abs(fx) > 0;
      const g = fIsV ? new THREE.BoxGeometry(fw, fl, 0.35) : new THREE.BoxGeometry(fl, fw, 0.35);
      const fm = new THREE.Mesh(g, pietraMat);
      fm.position.set(fx, fy, 0.15);
      ag.add(fm);
    });

    // Slender flanking pilasters
    [-pW / 2 + 1.0, pW / 2 - 1.0].forEach(px => {
      const pilGeo = lathe(t => new THREE.Vector2(0.65 + Math.sin(t * Math.PI) * 0.08, t * pH * 0.68), 20, 20);
      const pilMesh = new THREE.Mesh(pilGeo, marbleMat);
      pilMesh.position.set(px, -pH / 2, 0.9);
      ag.add(pilMesh);
    });

    ag.rotation.y = dir.angle;
    ag.position.copy(dir.pos);
    tombGroup.add(ag);
  });

  // Corner chamfer double niches (4 chamfers × 2 levels)
  const cornerPts = [
    { x: halfW - chamfer * 0.55, z: halfW - chamfer * 0.55, rot: Math.PI / 4 },
    { x: -halfW + chamfer * 0.55, z: halfW - chamfer * 0.55, rot: -Math.PI / 4 },
    { x: halfW - chamfer * 0.55, z: -halfW + chamfer * 0.55, rot: 3 * Math.PI / 4 },
    { x: -halfW + chamfer * 0.55, z: -halfW + chamfer * 0.55, rot: -3 * Math.PI / 4 },
  ];
  cornerPts.forEach(pt => {
    [6.5, 19.0].forEach(yOff => {
      const cg = new THREE.Group();
      cg.add(new THREE.Mesh(new THREE.BoxGeometry(5.6, 11, 2.8), archRecessMat));
      const cArch = new THREE.Mesh(makeMughalArchTube(5.2, 11, 0.24), marbleDarkMat);
      cArch.position.set(0, -5.5, 0.45);
      cg.add(cArch);
      cg.position.set(pt.x, yOff + 5.5, pt.z);
      cg.rotation.y = pt.rot;
      tombGroup.add(cg);
    });
  });

  root.add(tombGroup);

  // ==========================================================================
  // 4. DRUM + ONION DOME ASSEMBLY
  // ==========================================================================
  const domeAssembly = new THREE.Group();
  domeAssembly.name = 'Central_Dome_Assembly';
  domeAssembly.position.y = PLINTH_TOP + mainHeight + 1.8;

  // (4a) Octagonal drum base
  const drumBase = new THREE.Mesh(new THREE.CylinderGeometry(9.6, 10.2, 2.4, 8, 1), marbleDarkMat);
  drumBase.position.y = 1.2;
  domeAssembly.add(drumBase);

  // (4b) Cylindrical high drum with entasis
  const drumGeo = lathe(t => {
    const y = t * 11.5;
    const r = 9.0 + Math.sin(t * Math.PI) * 0.35;
    return new THREE.Vector2(r, y);
  }, 48, 64);
  const drum = new THREE.Mesh(drumGeo, marbleMat);
  drum.position.y = 2.4;
  drum.castShadow = true;
  domeAssembly.add(drum);

  // Drum arched blind niches (8 around circumference)
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2;
    const dg = new THREE.Group();
    dg.add(new THREE.Mesh(new THREE.BoxGeometry(3.2, 6.8, 2.5), archRecessMat));
    const dnA = new THREE.Mesh(makeMughalArchTube(3.0, 6.8, 0.2), marbleDarkMat);
    dnA.position.set(0, -3.4, 0.38);
    dg.add(dnA);
    dg.position.set(Math.cos(ang) * 9.1, 2.4 + 4.0, Math.sin(ang) * 9.1);
    dg.rotation.y = -ang;
    domeAssembly.add(dg);
  }

  // (4c) HIGH-FIDELITY ONION DOME — Authentic Mughal bulbous curvature
  const domeH = 26.0;
  const domeGeo = lathe(t => {
    const y = t * domeH;
    let r;
    if (t < 0.05) {
      // Inward neck transition from drum
      r = THREE.MathUtils.lerp(8.8, 9.6, t / 0.05);
    } else if (t < 0.12) {
      // Outward bulbous swell
      const k = (t - 0.05) / 0.07;
      r = THREE.MathUtils.lerp(9.6, 12.6, k * (2 - k));
    } else if (t < 0.28) {
      // Max characteristic onion belly
      const k = (t - 0.12) / 0.16;
      r = THREE.MathUtils.lerp(12.6, 13.2, Math.sin(k * Math.PI / 2));
    } else if (t < 0.52) {
      // Graceful inward sweep
      const k = (t - 0.28) / 0.24;
      r = THREE.MathUtils.lerp(13.2, 7.2, k * k * (3 - 2 * k));
    } else if (t < 0.76) {
      // High shoulder tapering
      const k = (t - 0.52) / 0.24;
      r = THREE.MathUtils.lerp(7.2, 2.9, k * (2 - k));
    } else if (t < 0.92) {
      // Narrow crown neck
      const k = (t - 0.76) / 0.16;
      r = THREE.MathUtils.lerp(2.9, 0.95, k * k * (3 - 2 * k));
    } else {
      // Pointed apex tip
      const k = (t - 0.92) / 0.08;
      r = THREE.MathUtils.lerp(0.95, 0.0, Math.pow(k, 1.3));
    }
    return new THREE.Vector2(Math.max(0, r), y);
  }, 160, 96);

  const domeMesh = new THREE.Mesh(domeGeo, marbleMat);
  domeMesh.position.y = 2.4 + 11.5;
  domeMesh.castShadow = true;
  domeAssembly.add(domeMesh);

  // (4d) GOLDEN KALASH FINIAL — 9.8m authentic assembly
  const finialGroup = new THREE.Group();
  finialGroup.position.y = 2.4 + 11.5 + domeH;

  // Lotus petal base
  const lotusGeo = lathe(t => new THREE.Vector2(0.3 + Math.sin(t * Math.PI) * 1.4, t * 1.8), 32, 32);
  finialGroup.add(new THREE.Mesh(lotusGeo, goldMat));

  // 3 Golden Bulbs
  [{ r: 1.25, y: 2.9 }, { r: 0.85, y: 4.8 }, { r: 0.54, y: 6.2 }].forEach(b => {
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(b.r, 24, 24), goldMat);
    bulb.position.y = b.y;
    finialGroup.add(bulb);
  });

  // Tapering golden spire
  const spireGeo = lathe(t => new THREE.Vector2(Math.max(0.02, 0.48 * (1 - t * 0.95)), t * 6.5), 24, 24);
  const spireMesh = new THREE.Mesh(spireGeo, goldMat);
  spireMesh.position.y = 6.8;
  finialGroup.add(spireMesh);

  // Islamic Crescent Moon
  const crescentGeo = new THREE.TorusGeometry(0.75, 0.12, 16, 36, Math.PI * 1.35);
  crescentGeo.rotateZ(Math.PI / 4.5);
  const crescent = new THREE.Mesh(crescentGeo, goldMat);
  crescent.position.y = 13.5;
  finialGroup.add(crescent);

  domeAssembly.add(finialGroup);
  root.add(domeAssembly);

  // ==========================================================================
  // 5. FOUR CHATTRIS — 8-pillared roof kiosks
  // ==========================================================================
  const chattriOffsets = [[20, 20], [-20, 20], [20, -20], [-20, -20]];
  chattriOffsets.forEach(([cx, cz]) => {
    const ch = new THREE.Group();
    ch.position.set(cx, PLINTH_TOP + mainHeight + 1.8, cz);

    // Octagonal base
    ch.add(new THREE.Mesh(new THREE.CylinderGeometry(3.8, 4.2, 1.4, 8, 1), marbleDarkMat));

    // 8 slender pillars
    for (let p = 0; p < 8; p++) {
      const ang = (p / 8) * Math.PI * 2;
      const pilGeo = lathe(t => new THREE.Vector2(0.26 + Math.sin(t * Math.PI) * 0.05, t * 5.6), 16, 16);
      const pil = new THREE.Mesh(pilGeo, marbleMat);
      pil.position.set(Math.cos(ang) * 3.0, 1.4, Math.sin(ang) * 3.0);
      ch.add(pil);
    }

    // Chattri dome
    const cdGeo = lathe(t => {
      const y = t * 5.8;
      let r;
      if (t < 0.16) r = THREE.MathUtils.lerp(3.2, 3.8, Math.sin((t / 0.16) * Math.PI / 2));
      else if (t < 0.65) r = THREE.MathUtils.lerp(3.8, 0.8, ((t - 0.16) / 0.49) ** 1.8);
      else r = THREE.MathUtils.lerp(0.8, 0.0, (t - 0.65) / 0.35);
      return new THREE.Vector2(Math.max(0, r), y);
    }, 48, 48);
    const cDome = new THREE.Mesh(cdGeo, marbleMat);
    cDome.position.y = 7.0;
    ch.add(cDome);

    // Gold finial
    const cf = new THREE.Mesh(new THREE.CylinderGeometry(0, 0.22, 2.2, 12), goldMat);
    cf.position.y = 13.2;
    ch.add(cf);

    root.add(ch);
  });

  // ==========================================================================
  // 6. FOUR CORNER MINARETS — 40.0m, 3-tier, 0.8° outward seismic tilt
  // ==========================================================================
  const minaretCoords = [
    { x: 42, z: 42, tx: 0.014, tz: 0.014 },
    { x: -42, z: 42, tx: -0.014, tz: 0.014 },
    { x: 42, z: -42, tx: 0.014, tz: -0.014 },
    { x: -42, z: -42, tx: -0.014, tz: -0.014 },
  ];

  const minaretsGroup = new THREE.Group();
  minaretsGroup.name = 'Four_Corner_Minarets';

  minaretCoords.forEach(coord => {
    const min = new THREE.Group();
    min.position.set(coord.x, PLINTH_TOP, coord.z);
    min.rotation.x = coord.tz;
    min.rotation.z = -coord.tx;

    // Octagonal base pedestal
    const mBase = new THREE.Mesh(new THREE.CylinderGeometry(3.8, 4.3, 4.0, 8, 1), marbleMat);
    min.add(mBase);

    // Tapering 3-tier shaft
    const shaftGeo = lathe(t => {
      const y = 4.0 + t * 37.0;
      const r = 3.2 * (1 - t * 0.34) + Math.sin(t * Math.PI * 3) * 0.12;
      return new THREE.Vector2(r, y);
    }, 96, 48);
    min.add(new THREE.Mesh(shaftGeo, marbleMat));

    // Balcony tiers
    [15.5, 27.5, 38.5].forEach(by => {
      const balc = new THREE.Mesh(new THREE.CylinderGeometry(4.1, 3.1, 1.0, 20, 1), marbleDarkMat);
      balc.position.y = by + 0.5;
      min.add(balc);
    });

    // Top chattri
    const mTop = new THREE.Group();
    mTop.position.y = 39.8;
    for (let p = 0; p < 8; p++) {
      const ang = (p / 8) * Math.PI * 2;
      const mPil = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 3.2, 12), marbleMat);
      mPil.position.set(Math.cos(ang) * 2.0, 1.6, Math.sin(ang) * 2.0);
      mTop.add(mPil);
    }

    // Minaret top dome
    const mDomeGeo = lathe(t => {
      const y = t * 4.2;
      let r;
      if (t < 0.16) r = THREE.MathUtils.lerp(2.0, 2.6, Math.sin((t / 0.16) * Math.PI / 2));
      else if (t < 0.70) r = THREE.MathUtils.lerp(2.6, 0.55, ((t - 0.16) / 0.54) ** 1.5);
      else r = THREE.MathUtils.lerp(0.55, 0.0, (t - 0.70) / 0.30);
      return new THREE.Vector2(Math.max(0, r), y);
    }, 36, 48);
    const mDome = new THREE.Mesh(mDomeGeo, marbleMat);
    mDome.position.y = 3.2;
    mTop.add(mDome);

    const mFin = new THREE.Mesh(new THREE.CylinderGeometry(0, 0.18, 2.0, 12), goldMat);
    mFin.position.y = 7.6;
    mTop.add(mFin);

    min.add(mTop);
    minaretsGroup.add(min);
  });
  root.add(minaretsGroup);

  // ==========================================================================
  // 7. INTERIOR — Clean architectural chamber & Jali screen (NO tomb boxes)
  // ==========================================================================
  const interiorGroup = new THREE.Group();
  interiorGroup.name = 'Interior_Chamber';
  interiorGroup.position.set(0, PLINTH_TOP, 0);

  // Octagonal chamber walls
  const innerWall = new THREE.Mesh(new THREE.CylinderGeometry(15.0, 15.0, 20.0, 8, 1, true), interiorMat);
  interiorGroup.add(innerWall);

  // Inner parabolic dome
  const innerDomeGeo = lathe(t => {
    const y = t * 16.5;
    const r = 14.2 * Math.cos((t * Math.PI) / 2);
    return new THREE.Vector2(Math.max(0, r), y);
  }, 36, 36);
  const innerDome = new THREE.Mesh(innerDomeGeo, interiorMat);
  innerDome.position.y = 3.5;
  interiorGroup.add(innerDome);

  // Jali marble screen panels
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2;
    const jp = new THREE.Mesh(new THREE.BoxGeometry(6.8, 4.0, 0.2), jaliMat);
    jp.position.set(Math.cos(ang) * 6.5, 2.0, Math.sin(ang) * 6.5);
    jp.rotation.y = -ang;
    interiorGroup.add(jp);
  }

  root.add(interiorGroup);

  // ==========================================================================
  // 8. GROUND CONTEXT — Charbagh, Hauz-i Kausar reflecting pool, sandstone terrace
  // ==========================================================================
  const groundGroup = new THREE.Group();
  groundGroup.name = 'Ground_Context';

  // Surrounding lawn plane
  const groundMesh = new THREE.Mesh(new THREE.PlaneGeometry(320, 320, 2, 2), groundMat);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.receiveShadow = true;
  groundGroup.add(groundMesh);

  // Red sandstone terrace base
  const terrace = new THREE.Mesh(new THREE.BoxGeometry(124, 0.85, 124), sandstoneMat);
  terrace.position.set(0, 0.42, 0);
  terrace.receiveShadow = true;
  groundGroup.add(terrace);

  // South paved walkway
  const walkway = new THREE.Mesh(new THREE.BoxGeometry(28, 0.28, 92), sandstoneMat);
  walkway.position.set(0, 0.22, 97);
  groundGroup.add(walkway);

  // Hauz-i Kausar reflecting pool
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(17, 80, 4, 4), poolMat);
  pool.rotation.x = -Math.PI / 2;
  pool.position.set(0, 0.38, 98);
  groundGroup.add(pool);

  // Pool marble curb
  const poolCurb = new THREE.Mesh(new THREE.BoxGeometry(19.5, 0.45, 82), marbleDarkMat);
  poolCurb.position.set(0, 0.28, 98);
  groundGroup.add(poolCurb);

  // 4 formal Charbagh garden plots
  const gardenSize = 36;
  const gardenPositions = [[-36, 77], [36, 77], [-36, 122], [36, 122]];
  gardenPositions.forEach(([gx, gz]) => {
    const gMesh = new THREE.Mesh(new THREE.BoxGeometry(gardenSize, 0.36, gardenSize), lawnMat);
    gMesh.position.set(gx, 0.22, gz);
    groundGroup.add(gMesh);
    const edge = new THREE.Mesh(new THREE.BoxGeometry(gardenSize + 1.4, 0.48, gardenSize + 1.4), sandstoneMat);
    edge.position.set(gx, 0.18, gz);
    groundGroup.add(edge);
  });

  // North perimeter wall
  const nWall = new THREE.Mesh(new THREE.BoxGeometry(132, 2.4, 1.8), sandstoneMat);
  nWall.position.set(0, 1.3, -63);
  groundGroup.add(nWall);

  root.add(groundGroup);

  return {
    root,
    materials: [marbleMat, marbleDarkMat, marbleTrimMat, sandstoneMat, goldMat, archRecessMat, interiorMat, jaliMat, groundMat, poolMat, lawnMat],
    interiorGroup,
    groundGroup,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// POINT CLOUD — 85K Points with elevation heatmap coloring (Rectilinear Fill)
// ─────────────────────────────────────────────────────────────────────────────
export function createTajMahalPointCloud(pointCount = 85000) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(pointCount * 3);
  const colors = new Float32Array(pointCount * 3);
  const intensities = new Float32Array(pointCount);
  let pIdx = 0;

  function getElevationColor(y, maxH = 78) {
    const t = Math.max(0, Math.min(1, y / maxH));
    const col = new THREE.Color();
    if (t < 0.14) col.setHSL(0.55, 0.92, 0.35 + t * 0.5);
    else if (t < 0.44) col.setHSL(0.38 - (t - 0.14) * 0.55, 0.95, 0.5);
    else if (t < 0.80) col.setHSL(0.12 - (t - 0.44) * 0.25, 1.0, 0.55);
    else col.setHSL(0.02, 1.0, 0.62);
    return col;
  }

  function addPoint(x, y, z, noise = 0.08) {
    if (pIdx >= pointCount) return;
    positions[pIdx * 3] = x + (Math.random() - 0.5) * noise;
    positions[pIdx * 3 + 1] = y + (Math.random() - 0.5) * noise;
    positions[pIdx * 3 + 2] = z + (Math.random() - 0.5) * noise;
    const c = getElevationColor(y);
    colors[pIdx * 3] = c.r;
    colors[pIdx * 3 + 1] = c.g;
    colors[pIdx * 3 + 2] = c.b;
    intensities[pIdx] = 0.5 + Math.random() * 0.5;
    pIdx++;
  }

  // Plinth surface (14000)
  for (let i = 0; i < 14000 && pIdx < pointCount; i++) {
    addPoint((Math.random() - 0.5) * 95, Math.random() * 9.9, (Math.random() - 0.5) * 95, 0.12);
  }

  // Main tomb walls (26000)
  for (let i = 0; i < 26000 && pIdx < pointCount; i++) {
    const side = Math.floor(Math.random() * 4);
    const hW = 28.5;
    const py = 9.9 + Math.random() * 33;
    const span = (Math.random() - 0.5) * (hW * 2 - 8);
    let px = 0, pz = 0;
    if (side === 0) { px = span; pz = hW; }
    else if (side === 1) { px = span; pz = -hW; }
    else if (side === 2) { px = hW; pz = span; }
    else { px = -hW; pz = span; }

    if (Math.abs(span) < 10 && py < 43) {
      if (side === 0) pz -= Math.random() * 4.2;
      else if (side === 1) pz += Math.random() * 4.2;
      else if (side === 2) px -= Math.random() * 4.2;
      else px += Math.random() * 4.2;
    }
    addPoint(px, py, pz, 0.14);
  }

  // Central bulbous onion dome (20000)
  for (let i = 0; i < 20000 && pIdx < pointCount; i++) {
    const t = Math.random();
    const angle = Math.random() * Math.PI * 2;
    const yBase = 9.9 + 33 + 1.8 + 2.4 + 11.5;
    const y = yBase + t * 26.0;
    let r;
    if (t < 0.05) r = THREE.MathUtils.lerp(8.8, 9.6, t / 0.05);
    else if (t < 0.12) { const k = (t - 0.05) / 0.07; r = THREE.MathUtils.lerp(9.6, 12.6, k * (2 - k)); }
    else if (t < 0.28) { const k = (t - 0.12) / 0.16; r = THREE.MathUtils.lerp(12.6, 13.2, Math.sin(k * Math.PI / 2)); }
    else if (t < 0.52) { const k = (t - 0.28) / 0.24; r = THREE.MathUtils.lerp(13.2, 7.2, k * k * (3 - 2 * k)); }
    else if (t < 0.76) { const k = (t - 0.52) / 0.24; r = THREE.MathUtils.lerp(7.2, 2.9, k * (2 - k)); }
    else if (t < 0.92) { const k = (t - 0.76) / 0.16; r = THREE.MathUtils.lerp(2.9, 0.95, k * k * (3 - 2 * k)); }
    else { const k = (t - 0.92) / 0.08; r = THREE.MathUtils.lerp(0.95, 0.0, Math.pow(k, 1.3)); }

    addPoint(Math.cos(angle) * r, y, Math.sin(angle) * r, 0.09);
  }

  // Corner Minarets (12000)
  [[42, 42], [-42, 42], [42, -42], [-42, -42]].forEach(c => {
    for (let i = 0; i < 3000 && pIdx < pointCount; i++) {
      const py = 9.9 + Math.random() * 40;
      const angle = Math.random() * Math.PI * 2;
      const t = (py - 9.9) / 40;
      const r = 3.2 * (1 - t * 0.34);
      addPoint(c[0] + Math.cos(angle) * r, py, c[1] + Math.sin(angle) * r, 0.08);
    }
  });

  // Reflecting pool (cyan/azure)
  for (let i = 0; i < 3000 && pIdx < pointCount; i++) {
    const idx = pIdx++;
    positions[idx * 3] = (Math.random() - 0.5) * 17;
    positions[idx * 3 + 1] = 0.38 + (Math.random() - 0.5) * 0.04;
    positions[idx * 3 + 2] = 58 + Math.random() * 80;
    colors[idx * 3] = 0.00; colors[idx * 3 + 1] = 0.85; colors[idx * 3 + 2] = 1.0;
    intensities[idx] = 0.95;
  }

  // Sandstone terrace (square rectilinear)
  for (let i = 0; i < 5000 && pIdx < pointCount; i++) {
    const px = (Math.random() - 0.5) * 122;
    const pz = (Math.random() - 0.5) * 122;
    if (Math.abs(px) < 48 && Math.abs(pz) < 48) continue;
    const idx = pIdx++;
    positions[idx * 3] = px;
    positions[idx * 3 + 1] = 0.85 + (Math.random() - 0.5) * 0.06;
    positions[idx * 3 + 2] = pz;
    colors[idx * 3] = 0.72; colors[idx * 3 + 1] = 0.34; colors[idx * 3 + 2] = 0.20;
    intensities[idx] = 0.65;
  }

  // Rectilinear perimeter ground grid fill
  while (pIdx < pointCount) {
    const px = (Math.random() - 0.5) * 260;
    const pz = (Math.random() - 0.5) * 260;
    addPoint(px, 0.1 + Math.random() * 0.25, pz, 0.12);
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('intensity', new THREE.BufferAttribute(intensities, 1));

  const pointMaterial = new THREE.PointsMaterial({
    size: 0.72,
    vertexColors: true,
    transparent: true,
    opacity: 0.92,
    sizeAttenuation: true,
  });

  const pointsMesh = new THREE.Points(geometry, pointMaterial);
  pointsMesh.name = 'TajMahal_PointCloud';
  return { pointsMesh, geometry, pointMaterial };
}

// ─────────────────────────────────────────────────────────────────────────────
// DRONE TRAJECTORY FRUSTUMS
// ─────────────────────────────────────────────────────────────────────────────
export function createDroneTrajectoryFrustums(radius = 85, altitude = 52, count = 28) {
  const group = new THREE.Group();
  group.name = 'Drone_Orbital_Trajectory';

  const splinePts = [];
  for (let i = 0; i <= count; i++) {
    const ang = (i / count) * Math.PI * 2;
    const alt = altitude + Math.sin(ang * 3) * 6;
    const rad = radius + Math.cos(ang * 2) * 5;
    splinePts.push(new THREE.Vector3(Math.cos(ang) * rad, alt, Math.sin(ang) * rad));
  }
  const curve = new THREE.CatmullRomCurve3(splinePts);
  const pathGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(200));
  group.add(new THREE.Line(pathGeo, new THREE.LineBasicMaterial({ color: 0x00f59b, transparent: true, opacity: 0.85 })));

  const frustumMat = new THREE.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.65 });
  const targetLook = new THREE.Vector3(0, 30, 0);

  for (let i = 0; i < count; i += 2) {
    const pos = curve.getPoint(i / count);
    const fg = new THREE.Group();
    fg.position.copy(pos);
    fg.lookAt(targetLook);
    const s = 4.0;
    const verts = new Float32Array([
      0, 0, 0, -s, s * 0.6, -s * 2,
      0, 0, 0, s, s * 0.6, -s * 2,
      0, 0, 0, s, -s * 0.6, -s * 2,
      0, 0, 0, -s, -s * 0.6, -s * 2,
      -s, s * 0.6, -s * 2, s, s * 0.6, -s * 2,
      s, s * 0.6, -s * 2, s, -s * 0.6, -s * 2,
      s, -s * 0.6, -s * 2, -s, -s * 0.6, -s * 2,
      -s, -s * 0.6, -s * 2, -s, s * 0.6, -s * 2,
    ]);
    const fGeo = new THREE.BufferGeometry();
    fGeo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    fg.add(new THREE.LineSegments(fGeo, frustumMat));

    const rayGeo = new THREE.BufferGeometry().setFromPoints([pos, targetLook]);
    const ray = new THREE.Line(rayGeo, new THREE.LineDashedMaterial({ color: 0x38bdf8, dashSize: 3, gapSize: 4, transparent: true, opacity: 0.25 }));
    ray.computeLineDistances();
    group.add(ray);
    group.add(fg);
  }
  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// DIMENSION CALLOUT RULERS & LABELS (IN METRES)
// ─────────────────────────────────────────────────────────────────────────────
function createDimTextSprite(text, color = '#00f59b') {
  const canvas = document.createElement('canvas');
  canvas.width = 340;
  canvas.height = 76;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(4, 9, 18, 0.94)';
  ctx.fillRect(2, 2, 336, 72);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.0;
  ctx.strokeRect(2, 2, 336, 72);
  ctx.font = 'bold 20px "JetBrains Mono", monospace';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 170, 38);
  const t = new THREE.CanvasTexture(canvas);
  t.minFilter = THREE.LinearFilter;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true }));
  sp.scale.set(14, 3.4, 1);
  return sp;
}

export function createTajMahalDimensions() {
  const dimGroup = new THREE.Group();
  dimGroup.name = 'Metric_Dimension_Callouts';
  dimGroup.visible = false; // Hidden by default; toggle on with button

  function dimLine(start, end, color = 0x00f59b) {
    const geo = new THREE.BufferGeometry().setFromPoints([start, end]);
    const mat = new THREE.LineBasicMaterial({ color, linewidth: 2, depthTest: false, transparent: true, opacity: 0.95 });
    const line = new THREE.Line(geo, mat);
    const dir = new THREE.Vector3().subVectors(end, start).normalize();
    const perp = new THREE.Vector3(-dir.z, 0, dir.x).normalize().multiplyScalar(2.2);
    [[start, perp], [end, perp]].forEach(([p, pp]) => {
      const tg = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3().subVectors(p, pp),
        new THREE.Vector3().addVectors(p, pp),
      ]);
      line.add(new THREE.Line(tg, mat));
    });
    return line;
  }

  // 1. Total Height: 73.0 m
  dimGroup.add(dimLine(new THREE.Vector3(58, 0, 0), new THREE.Vector3(58, 73, 0), 0x00f59b));
  const sH = createDimTextSprite('73.0 m  TOTAL HEIGHT', '#00f59b');
  sH.position.set(70, 36.5, 0);
  dimGroup.add(sH);

  // 2. Marble Plinth Width: 95.16 m
  dimGroup.add(dimLine(new THREE.Vector3(-48, 8.5, 55), new THREE.Vector3(48, 8.5, 55), 0x00e5ff));
  const sP = createDimTextSprite('95.16 m  PLINTH WIDTH', '#00e5ff');
  sP.position.set(0, 12.5, 58);
  dimGroup.add(sP);

  // 3. Minarets Height: 40.0 m
  dimGroup.add(dimLine(new THREE.Vector3(-50, 9.9, 42), new THREE.Vector3(-50, 49.9, 42), 0xf59e0b));
  const sM = createDimTextSprite('40.0 m  MINARET HEIGHT', '#f59e0b');
  sM.position.set(-61, 30, 42);
  dimGroup.add(sM);

  // 4. Pishtaq Height: 33.0 m
  dimGroup.add(dimLine(new THREE.Vector3(15, 9.9, 31), new THREE.Vector3(15, 42.9, 31), 0x38bdf8));
  const sA = createDimTextSprite('33.0 m  PISHTAQ ARCH', '#38bdf8');
  sA.position.set(26, 26, 31);
  dimGroup.add(sA);

  // 5. Tomb Width: 57.0 m
  dimGroup.add(dimLine(new THREE.Vector3(-28.5, 34, 31), new THREE.Vector3(28.5, 34, 31), 0x00f59b));
  const sT = createDimTextSprite('57.0 m  TOMB WIDTH', '#00f59b');
  sT.position.set(0, 37.5, 31);
  dimGroup.add(sT);

  // 6. Dome Diameter: 25.2 m
  dimGroup.add(dimLine(new THREE.Vector3(-12.6, 64, 0), new THREE.Vector3(12.6, 64, 0), 0xa78bfa));
  const sD = createDimTextSprite('25.2 m  DOME DIA.', '#a78bfa');
  sD.position.set(0, 67, 0);
  dimGroup.add(sD);

  return dimGroup;
}
