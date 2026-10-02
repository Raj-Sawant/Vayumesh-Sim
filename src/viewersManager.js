import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  createTajMahalArchitecture,
  createTajMahalPointCloud,
  createDroneTrajectoryFrustums,
  createTajMahalDimensions,
} from './tajMahalGeometry.js';
import {
  createHeatmapMaterial,
  createWireframeModel,
  probeMetricAtPoint,
} from './heatmapShader.js';
import { soundFx } from './audioEngine.js';

export class ViewersManager {
  constructor(containers) {
    // containers: { pointCloud: el, wireframe: el, heatmap: el }
    this.containers = containers;
    this.activeView = 'split';
    this.syncCameras = true;
    this.sliceValue = 0;
    this.measureMode = false;
    this.measurePoints = [];
    this.showDimensions = false; // Dimensions OFF by default so user can inspect details without clutter

    this.initScenes();
    this.setupEventListeners();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initScenes() {
    this.viewers = {};
    const viewerKeys = ['pointCloud', 'wireframe', 'heatmap'];

    viewerKeys.forEach(key => {
      const container = this.containers[key];
      if (!container) return;

      const width = container.clientWidth || 400;
      const height = container.clientHeight || 380;

      // Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x030712);
      scene.fog = new THREE.FogExp2(0x030712, 0.0028);

      // Camera
      const camera = new THREE.PerspectiveCamera(42, width / height, 0.5, 650);
      camera.position.set(82, 58, 112);

      // Renderer
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      renderer.localClippingEnabled = true;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;
      container.appendChild(renderer.domElement);

      // OrbitControls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.055;
      controls.maxPolarAngle = Math.PI / 2 - 0.01;
      controls.minDistance = 6;
      controls.maxDistance = 300;
      controls.target.set(0, 26, 0);

      // ── LIGHTING SETUP ──────────────────────────────────────────────────────
      const hemiLight = new THREE.HemisphereLight(0xd4e8ff, 0x142018, 0.75);
      scene.add(hemiLight);

      const dirLight = new THREE.DirectionalLight(0xfff5e6, 2.2);
      dirLight.position.set(65, 120, 90);
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 2048;
      dirLight.shadow.mapSize.height = 2048;
      dirLight.shadow.camera.near = 10;
      dirLight.shadow.camera.far = 350;
      dirLight.shadow.camera.left = -80;
      dirLight.shadow.camera.right = 80;
      dirLight.shadow.camera.top = 80;
      dirLight.shadow.camera.bottom = -80;
      dirLight.shadow.bias = -0.0003;
      scene.add(dirLight);

      const fillLight = new THREE.DirectionalLight(0x00c5e8, 0.6);
      fillLight.position.set(-55, 45, -65);
      scene.add(fillLight);

      const rimLight = new THREE.DirectionalLight(0xffd580, 0.45);
      rimLight.position.set(-30, 80, -50);
      scene.add(rimLight);

      const domeLight = new THREE.PointLight(0xfff8f0, 1.2, 120);
      domeLight.position.set(0, 80, 10);
      scene.add(domeLight);

      // Tactical Metric Grid on ground
      const grid = new THREE.GridHelper(200, 40, 0x00f59b, 0x0f1e2e);
      grid.position.y = 0.05;
      scene.add(grid);

      // Per-viewer Measurement Caliper Line
      const measureLineGeo = new THREE.BufferGeometry();
      const measureLineMat = new THREE.LineBasicMaterial({
        color: 0x00f59b,
        linewidth: 3,
        depthTest: false,
      });
      const measureLine = new THREE.Line(measureLineGeo, measureLineMat);
      scene.add(measureLine);

      this.viewers[key] = {
        key,
        container,
        scene,
        camera,
        renderer,
        controls,
        measureLine,
        measureLineGeo,
        width,
        height,
      };
    });

    // Setup specific content for each viewer
    this.setupPointCloudViewer();
    this.setupWireframeMeshViewer();
    this.setupHeatmapViewer();
    this.setupSyncControl();
  }

  // ---------------------------------------------------------------------------
  // 1. POINT CLOUD VIEWER SETUP (Dense 85K + UAV Trajectory + Dimensions)
  // ---------------------------------------------------------------------------
  setupPointCloudViewer() {
    const v = this.viewers.pointCloud;
    if (!v) return;

    const { pointsMesh, pointMaterial } = createTajMahalPointCloud(85000);
    v.scene.add(pointsMesh);
    v.pointCloudMesh = pointsMesh;
    v.pointMaterial = pointMaterial;

    const trajectory = createDroneTrajectoryFrustums(85, 52, 28);
    v.scene.add(trajectory);
    v.trajectory = trajectory;

    // Dimension mapping in Point Cloud viewer
    const dimensions = createTajMahalDimensions();
    dimensions.visible = this.showDimensions;
    v.scene.add(dimensions);
    v.dimensions = dimensions;
  }

  // ---------------------------------------------------------------------------
  // 2. WIREFRAME VIEWER SETUP (CAD Wireframe + Dimensions + Slicing)
  // ---------------------------------------------------------------------------
  setupWireframeMeshViewer() {
    const v = this.viewers.wireframe;
    if (!v) return;

    this.clipPlaneZ = new THREE.Plane(new THREE.Vector3(0, 0, -1), 100);

    const { root, interiorGroup } = createTajMahalArchitecture();
    root.updateMatrixWorld(true);
    v.interiorGroup = interiorGroup;

    const wireframe = createWireframeModel(root);
    v.scene.add(wireframe);
    v.wireframeRoot = wireframe;

    const occluderMat = new THREE.MeshBasicMaterial({
      color: 0x040914,
      transparent: true,
      opacity: 0.9,
      depthWrite: true,
      clippingPlanes: [this.clipPlaneZ],
    });

    const occluderRoot = root.clone();
    occluderRoot.traverse(child => {
      if (child.isMesh) {
        child.material = occluderMat;
      }
    });
    v.scene.add(occluderRoot);
    v.occluderRoot = occluderRoot;

    wireframe.traverse(child => {
      if (child.isLineSegments && child.material) {
        child.material.clippingPlanes = [this.clipPlaneZ];
      }
    });

    // Dimension mapping in Wireframe viewer
    const dimensions = createTajMahalDimensions();
    dimensions.visible = this.showDimensions;
    v.scene.add(dimensions);
    v.dimensions = dimensions;
  }

  // ---------------------------------------------------------------------------
  // 3. CONFIDENCE HEATMAP VIEWER SETUP (Shader Heatmap + Dimensions + Raycast)
  // ---------------------------------------------------------------------------
  setupHeatmapViewer() {
    const v = this.viewers.heatmap;
    if (!v) return;

    const { root, groundGroup } = createTajMahalArchitecture();
    v.heatmapRoot = root;

    const heatmapMat = createHeatmapMaterial();
    heatmapMat.clippingPlanes = [this.clipPlaneZ];
    v.heatmapMaterial = heatmapMat;

    root.traverse(child => {
      if (child.isMesh) {
        const inGroundGroup = child.parent && child.parent.name === 'Ground_Context';
        if (inGroundGroup) {
          const isWater = child.position.z > 50 && child.geometry.parameters && child.geometry.parameters.width < 30;
          const isLawn = child.material && child.material.color && child.material.color.getHex() === 0x183b1c;
          child.material = new THREE.MeshStandardMaterial({
            color: isWater ? 0x0090d0 : (isLawn ? 0x183b1c : 0x221c18),
            roughness: isWater ? 0.05 : 0.90,
            metalness: isWater ? 0.92 : 0.10,
          });
        } else {
          child.material = heatmapMat;
        }
      }
    });

    v.scene.add(root);

    // Dynamic Drone position indicator light
    const droneLight = new THREE.PointLight(0x00f59b, 2.2, 100);
    droneLight.position.set(65, 52, 65);
    v.scene.add(droneLight);
    v.droneLight = droneLight;

    const droneMarker = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.8),
      new THREE.MeshBasicMaterial({ color: 0x00f59b, wireframe: true })
    );
    droneMarker.position.copy(droneLight.position);
    v.scene.add(droneMarker);
    v.droneMarker = droneMarker;

    // Dimension mapping in Heatmap viewer
    const dimensions = createTajMahalDimensions();
    dimensions.visible = this.showDimensions;
    v.scene.add(dimensions);
    v.dimensions = dimensions;

    this.setupHeatmapRaycaster(v);
  }

  setupHeatmapRaycaster(v) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (e) => {
      const rect = v.renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, v.camera);
      const intersects = raycaster.intersectObjects(v.heatmapRoot.children, true);

      const probeBox = document.getElementById('heatmap-probe-readout');
      if (intersects.length > 0 && probeBox) {
        const hit = intersects[0];
        const data = probeMetricAtPoint(hit.point);
        probeBox.innerHTML = `
          <div class="probe-item"><span class="lbl">WORLD XYZ:</span> <span class="val">[${data.coords.x}, ${data.coords.y}, ${data.coords.z}]m</span></div>
          <div class="probe-item"><span class="lbl">CONFIDENCE:</span> <span class="val val-green">${data.confidence}%</span></div>
          <div class="probe-item"><span class="lbl">EST. DEV:</span> <span class="val val-amber">${data.errorMm}mm</span></div>
          <div class="probe-item"><span class="lbl">GSD RES:</span> <span class="val">${data.gsd} cm/px</span></div>
          <div class="probe-item"><span class="lbl">STEREO RAYS:</span> <span class="val">${data.triangulationRays}</span></div>
        `;
        probeBox.style.display = 'block';
      }
    };

    v.renderer.domElement.addEventListener('mousemove', onPointerMove);
  }

  // ---------------------------------------------------------------------------
  // TOGGLE DIMENSIONS MATRIX IN ALL THREE VIEWERS
  // ---------------------------------------------------------------------------
  toggleDimensions(visible) {
    this.showDimensions = visible !== undefined ? visible : !this.showDimensions;
    Object.values(this.viewers).forEach(v => {
      if (v && v.dimensions) {
        v.dimensions.visible = this.showDimensions;
      }
    });
    return this.showDimensions;
  }

  // ---------------------------------------------------------------------------
  // SYNCHRONIZED CONTROLS ACROSS 3 VIEWERS
  // ---------------------------------------------------------------------------
  setupSyncControl() {
    this.isSyncing = false;
    const keys = ['pointCloud', 'wireframe', 'heatmap'];
    keys.forEach(sourceKey => {
      const source = this.viewers[sourceKey];
      if (!source) return;

      source.controls.addEventListener('change', () => {
        if (!this.syncCameras || this.isSyncing) return;
        this.isSyncing = true;
        try {
          keys.forEach(targetKey => {
            if (targetKey !== sourceKey) {
              const target = this.viewers[targetKey];
              if (target) {
                target.camera.position.copy(source.camera.position);
                target.camera.quaternion.copy(source.camera.quaternion);
                target.controls.target.copy(source.controls.target);
                target.controls.update();
              }
            }
          });
        } finally {
          this.isSyncing = false;
        }
      });
    });
  }

  // ---------------------------------------------------------------------------
  // INTERACTIVE SLICING & INTERNAL INSPECTION
  // ---------------------------------------------------------------------------
  setSliceProgress(val) {
    this.sliceValue = val;
    if (this.clipPlaneZ) {
      if (val <= 0.01) {
        this.clipPlaneZ.constant = 100;
      } else {
        const cutZ = THREE.MathUtils.lerp(55, 0.0, val);
        this.clipPlaneZ.constant = cutZ;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // POI QUICK JUMP (Smooth Camera Tween)
  // ---------------------------------------------------------------------------
  jumpToPOI(poiKey) {
    soundFx.playChirp();
    const poiPresets = {
      overview: {
        pos: new THREE.Vector3(90, 65, 120),
        target: new THREE.Vector3(0, 24, 0),
      },
      dome: {
        pos: new THREE.Vector3(18, 62, 34),
        target: new THREE.Vector3(0, 52, 0),
      },
      pishtaq: {
        pos: new THREE.Vector3(0, 24, 44),
        target: new THREE.Vector3(0, 22, 24),
      },
      minaret: {
        pos: new THREE.Vector3(-36, 42, 58),
        target: new THREE.Vector3(-41, 32, 41),
      },
      interior: {
        pos: new THREE.Vector3(0, 18, 22),
        target: new THREE.Vector3(0, 10, 0),
        slice: 0.95,
      },
      plinth: {
        pos: new THREE.Vector3(-55, 15, 68),
        target: new THREE.Vector3(-35, 7, 35),
      },
    };

    const targetPOI = poiPresets[poiKey] || poiPresets.overview;
    if (targetPOI.slice !== undefined) {
      this.setSliceProgress(targetPOI.slice);
      const slider = document.getElementById('slicing-slider');
      if (slider) slider.value = targetPOI.slice * 100;
    }

    Object.values(this.viewers).forEach(v => {
      if (!v) return;
      const startPos = v.camera.position.clone();
      const startTarget = v.controls.target.clone();
      let startTime = performance.now();
      const duration = 650;

      const animateCam = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(1, elapsed / duration);
        const ease = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        v.camera.position.lerpVectors(startPos, targetPOI.pos, ease);
        v.controls.target.lerpVectors(startTarget, targetPOI.target, ease);
        v.controls.update();

        if (progress < 1) {
          requestAnimationFrame(animateCam);
        }
      };
      requestAnimationFrame(animateCam);
    });
  }

  // ---------------------------------------------------------------------------
  // INTERACTIVE MEASUREMENT TOOL (Works in All 3 Viewers + Fullscreen)
  // ---------------------------------------------------------------------------
  toggleMeasurementTool(enabled) {
    this.measureMode = enabled;
    this.measurePoints = [];
    Object.values(this.viewers).forEach(v => {
      if (v && v.measureLine) {
        v.measureLine.geometry.setFromPoints([]);
      }
    });
    const readout = document.getElementById('measure-readout');
    if (readout) {
      readout.innerText = enabled ? 'CLICK POINT 1 ON ANY 3D MODEL (PC / WIREFRAME / HEATMAP)...' : 'MEASUREMENT TOOL OFF';
    }
  }

  handleMeasureClick(event, viewerKey) {
    if (!this.measureMode) return;
    const v = this.viewers[viewerKey];
    if (!v) return;

    const rect = v.renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, v.camera);
    const intersects = raycaster.intersectObjects(v.scene.children, true);

    if (intersects.length > 0) {
      const p = intersects[0].point;
      this.measurePoints.push(p);
      soundFx.playClick();

      const readout = document.getElementById('measure-readout');

      if (this.measurePoints.length === 1) {
        if (readout) readout.innerText = `POINT 1 ACQUIRED [${p.x.toFixed(1)}, ${p.y.toFixed(1)}, ${p.z.toFixed(1)}]m. CLICK POINT 2...`;
      } else if (this.measurePoints.length === 2) {
        const p1 = this.measurePoints[0];
        const p2 = this.measurePoints[1];
        const distance = p1.distanceTo(p2);

        // Update 3D measurement line across all viewers
        Object.values(this.viewers).forEach(viewer => {
          if (viewer && viewer.measureLine) {
            viewer.measureLine.geometry.setFromPoints([p1, p2]);
          }
        });

        soundFx.playLockOn();
        if (readout) {
          readout.innerHTML = `
            <span style="color:#00f59b; font-weight:700;">METRIC SPAN: ${distance.toFixed(2)} m</span> 
            (ΔX: ${Math.abs(p2.x - p1.x).toFixed(2)}m, ΔY: ${Math.abs(p2.y - p1.y).toFixed(2)}m, ΔZ: ${Math.abs(p2.z - p1.z).toFixed(2)}m)
          `;
        }
        this.measurePoints = [];
      }
    }
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.resize());

    ['pointCloud', 'wireframe', 'heatmap'].forEach(k => {
      const v = this.viewers[k];
      if (v) {
        v.renderer.domElement.addEventListener('click', (e) => this.handleMeasureClick(e, k));
      }
    });
  }

  resize() {
    Object.values(this.viewers).forEach(v => {
      if (!v || !v.container) return;
      const width = v.container.clientWidth || v.container.scrollWidth || v.container.offsetWidth;
      const height = v.container.clientHeight || v.container.scrollHeight || v.container.offsetHeight;
      if (width > 0 && height > 0) {
        v.camera.aspect = width / height;
        v.camera.updateProjectionMatrix();
        v.renderer.setSize(width, height);
      }
    });
  }

  animate(time) {
    requestAnimationFrame(this.animate);
    const t = time * 0.001;

    const vPc = this.viewers.pointCloud;
    if (vPc) {
      vPc.controls.update();
      vPc.renderer.render(vPc.scene, vPc.camera);
    }

    const vWf = this.viewers.wireframe;
    if (vWf) {
      vWf.controls.update();
      vWf.renderer.render(vWf.scene, vWf.camera);
    }

    const vHm = this.viewers.heatmap;
    if (vHm) {
      if (vHm.heatmapMaterial) {
        vHm.heatmapMaterial.uniforms.uTime.value = t;
        const dAngle = t * 0.3;
        const dX = Math.cos(dAngle) * 75;
        const dZ = Math.sin(dAngle) * 75;
        const dY = 52 + Math.sin(t * 0.8) * 8;
        vHm.droneLight.position.set(dX, dY, dZ);
        if (vHm.droneMarker) vHm.droneMarker.position.set(dX, dY, dZ);
        vHm.heatmapMaterial.uniforms.uDronePos.value.set(dX, dY, dZ);
      }
      vHm.controls.update();
      vHm.renderer.render(vHm.scene, vHm.camera);
    }
  }
}
