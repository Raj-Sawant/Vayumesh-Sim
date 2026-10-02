import * as THREE from 'three';

/**
 * Photogrammetry Reconstruction Uncertainty & Confidence Heatmap Material
 * Implements SIH 26158 metric error analysis
 * Color Palette:
 * - Cyan/Green (<1-3mm): High confidence (>95%), low reprojection error (<0.35px)
 * - Yellow (5-12mm): Nominal tolerance (~85%), multi-camera intersection
 * - Orange (15-25mm): Moderate uncertainty, acute angle
 * - Red (>25mm): Critical occlusion / shadow / blind spots
 */

export function createHeatmapMaterial() {
  const customShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uConfidenceThreshold: { value: 0.95 },
      uDronePos: { value: new THREE.Vector3(60, 50, 60) },
      uMode: { value: 0 }, // 0: Confidence Heatmap, 1: Surface Normal Zebra, 2: Depth Variance
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      varying vec3 vNormal;
      varying float vConfidence;

      uniform vec3 uDronePos;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;

        // Multi-ray photogrammetry confidence simulation
        vec3 toDrone = normalize(uDronePos - worldPos.xyz);
        vec3 worldNorm = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
        float dotAngle = dot(worldNorm, toDrone);
        float heightFactor = clamp(worldPos.y / 73.0, 0.0, 1.0);

        // Undercut & sky visibility factor
        float skyVisibility = clamp(worldNorm.y * 0.5 + 0.5, 0.0, 1.0);

        // Distance attenuation from survey center
        float distFromCenter = length(worldPos.xz);
        float centerCoverage = 1.0 - clamp(distFromCenter / 120.0, 0.0, 0.45);

        // Combined photogrammetric confidence
        float conf = 0.18 + 0.38 * clamp(dotAngle * 0.5 + 0.5, 0.0, 1.0) 
                          + 0.26 * skyVisibility 
                          + 0.14 * heightFactor * centerCoverage;

        // Subtle procedural high-frequency texture noise
        float noise = fract(sin(dot(worldPos.xz, vec2(12.9898, 78.233))) * 43758.5453);
        conf += (noise - 0.5) * 0.08;
        vConfidence = clamp(conf, 0.06, 0.98);

        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      varying vec3 vWorldPosition;
      varying vec3 vNormal;
      varying float vConfidence;

      uniform float uTime;
      uniform int uMode;

      // Vivid 5-stop Colormap: Red (0.0) -> Orange (0.35) -> Yellow (0.65) -> Green (0.85) -> Cyan (1.0)
      vec3 getHeatmapColor(float conf) {
        vec3 cRed    = vec3(0.96, 0.12, 0.18); // high error (>25mm) / blind spots
        vec3 cOrange = vec3(1.00, 0.48, 0.05); // moderate error (~15mm)
        vec3 cYellow = vec3(0.98, 0.88, 0.08); // nominal tolerance (~8mm)
        vec3 cGreen  = vec3(0.00, 0.96, 0.52); // high confidence (<3mm)
        vec3 cCyan   = vec3(0.00, 0.90, 1.00); // pristine survey (<1mm)

        if (conf > 0.86) {
          float t = (conf - 0.86) / 0.14;
          return mix(cGreen, cCyan, clamp(t, 0.0, 1.0));
        } else if (conf > 0.62) {
          float t = (conf - 0.62) / 0.24;
          return mix(cYellow, cGreen, clamp(t, 0.0, 1.0));
        } else if (conf > 0.38) {
          float t = (conf - 0.38) / 0.24;
          return mix(cOrange, cYellow, clamp(t, 0.0, 1.0));
        } else {
          float t = conf / 0.38;
          return mix(cRed, cOrange, clamp(t, 0.0, 1.0));
        }
      }

      void main() {
        if (uMode == 0) {
          vec3 baseCol = getHeatmapColor(vConfidence);

          // Half-Lambert architectural shading so 3D curves & geometry pop in full relief
          vec3 sunDir = normalize(vec3(0.55, 0.85, 0.65));
          float NdotL = max(0.0, dot(vNormal, sunDir));
          float diffuse = 0.45 + 0.55 * NdotL;

          // Secondary tactical cyan ambient fill
          vec3 fillDir = normalize(vec3(-0.6, 0.3, -0.5));
          float fillNdotL = max(0.0, dot(vNormal, fillDir));
          vec3 litCol = baseCol * (diffuse + fillNdotL * 0.20);

          float dist = distance(cameraPosition, vWorldPosition);
          float distScale = clamp(dist / 50.0, 0.2, 3.0);

          // Subtle topographic contour rings every 5 meters, dynamically scaling based on zoom
          float elevMod = fract(vWorldPosition.y / 5.0);
          if (elevMod < 0.02 * distScale || elevMod > (1.0 - 0.02 * distScale)) {
            litCol *= 0.72; // crisp darker contour ring
          }

          // Subtle dynamic laser pulse sweep
          float sweep = sin(vWorldPosition.y * 0.12 - uTime * 2.2);
          if (sweep > 0.96) {
            litCol += vec3(0.12, 0.18, 0.15);
          }

          gl_FragColor = vec4(litCol, 1.0);
        } else if (uMode == 1) {
          // Surface Normal direction mode
          gl_FragColor = vec4(abs(vNormal) * 0.9 + 0.1, 1.0);
        } else {
          // Error variance
          float v = 1.0 - vConfidence;
          gl_FragColor = vec4(v * 1.2, v * 0.3, v * 0.6, 1.0);
        }
      }
    `,
    clippingPlanes: [],
  });

  return customShaderMaterial;
}

/**
 * Creates pure CAD Topological Wireframe Model
 * Returns pure line segments that display all architectural facets, curves, and plinths
 */
export function createWireframeModel(sourceRoot) {
  const wireRoot = new THREE.Group();
  wireRoot.name = 'CAD_Wireframe_Root';

  // Primary structural wireframe — bright tactical green for planar surfaces
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x00f59b,
    transparent: true,
    opacity: 0.92,
    depthTest: true,
  });

  // Cyan for curved geometry — domes, arches, drums, minarets
  const curveMat = new THREE.LineBasicMaterial({
    color: 0x00e0ff,
    transparent: true,
    opacity: 0.82,
    depthTest: true,
  });

  // Gold for finials and decorative gold elements
  const goldLineMat = new THREE.LineBasicMaterial({
    color: 0xfbbf24,
    transparent: true,
    opacity: 0.78,
    depthTest: true,
  });

  sourceRoot.updateMatrixWorld(true);

  sourceRoot.traverse(child => {
    if (child.isMesh && child.geometry) {
      try {
        let wireGeo;
        let mat = lineMat;

        const type = child.geometry.type || '';
        const isCurved = type.includes('Lathe') ||
                         type.includes('Tube') ||
                         type.includes('Cylinder') ||
                         type.includes('Torus') ||
                         type.includes('Sphere') ||
                         type.includes('Octahedron');

        // Detect gold elements by material color
        const matColor = child.material && child.material.color ? child.material.color.getHex() : 0;
        const isGold = matColor === 0xf0a820 || matColor === 0xfbbf24;

        if (isGold) {
          // 8° threshold — finials have fine detail but keep fps good
          wireGeo = new THREE.EdgesGeometry(child.geometry, 8);
          mat = goldLineMat;
        } else if (isCurved) {
          // 4° threshold — tighter to show dome and arch curves beautifully
          wireGeo = new THREE.EdgesGeometry(child.geometry, 4);
          mat = curveMat;
        } else {
          // Sharp architectural boundaries (box/extrude shapes)
          wireGeo = new THREE.EdgesGeometry(child.geometry, 12);
        }

        const line = new THREE.LineSegments(wireGeo, mat);
        line.applyMatrix4(child.matrixWorld);
        wireRoot.add(line);
      } catch (e) {
        // ignore degenerate geometry
      }
    }
  });

  return wireRoot;
}

/**
 * Simulates Metric Probe readout at a raycasted coordinate
 */
export function probeMetricAtPoint(point) {
  const x = point.x;
  const y = point.y;
  const z = point.z;

  const distFromCenter = Math.sqrt(x * x + z * z);
  let confidence = 98.4;
  let errorMm = 1.1;
  let reprojectionErrPx = 0.38;
  let gsd = 1.14; // cm/px

  // Higher confidence on open marble surfaces
  if (y > 40 && distFromCenter < 15) {
    // Upper dome
    confidence = 99.4;
    errorMm = 0.7;
    reprojectionErrPx = 0.28;
    gsd = 0.92;
  } else if (y < 8) {
    // Plinth platform
    confidence = 98.8;
    errorMm = 1.2;
    reprojectionErrPx = 0.42;
    gsd = 1.20;
  } else if (distFromCenter > 38 && y > 20) {
    // Minaret upper tiers
    confidence = 97.9;
    errorMm = 1.8;
    reprojectionErrPx = 0.49;
    gsd = 1.35;
  } else {
    // Facades & Pishtaqs
    confidence = 98.6;
    errorMm = 1.4;
    reprojectionErrPx = 0.44;
    gsd = 1.12;
  }

  return {
    coords: { x: x.toFixed(2), y: y.toFixed(2), z: z.toFixed(2) },
    confidence: confidence.toFixed(1) + '%',
    errorMm: errorMm.toFixed(2) + ' mm',
    reprojectionError: reprojectionErrPx.toFixed(2) + ' px',
    gsd: gsd.toFixed(2) + ' cm/px',
    triangulationRays: Math.floor(14 + Math.random() * 8),
  };
}
