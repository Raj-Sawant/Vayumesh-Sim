import * as THREE from 'three';

/**
 * Tactical Military Surveillance Drone Generator (VayuMesh-X1 UAV)
 * High-tech carbon-fiber reconnaissance airframe with 4/6 rotors,
 * 3-axis gyro-stabilized optical gimbal, LiDAR rangefinder beam,
 * and military telemetry status beacons.
 */
export function createTacticalDrone() {
  const droneGroup = new THREE.Group();
  droneGroup.name = 'Tactical_UAV_VayuMeshX1';

  // Materials
  const carbonMat = new THREE.MeshStandardMaterial({
    color: 0x141820,
    roughness: 0.4,
    metalness: 0.8,
  });

  const militaryMat = new THREE.MeshStandardMaterial({
    color: 0x223028, // Defence tactical olive-drab / carbon
    roughness: 0.5,
    metalness: 0.4,
  });

  const rotorBladeMat = new THREE.MeshStandardMaterial({
    color: 0x05070a,
    roughness: 0.3,
    metalness: 0.9,
    transparent: true,
    opacity: 0.8,
  });

  const lensGlassMat = new THREE.MeshStandardMaterial({
    color: 0x00f59b,
    roughness: 0.1,
    metalness: 0.95,
    emissive: 0x004422,
  });

  const ledRedMat = new THREE.MeshBasicMaterial({ color: 0xff2244 });
  const ledGreenMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });

  // 1. Central Fuselage Airframe
  const fuselageGeo = new THREE.CylinderGeometry(1.4, 1.8, 0.7, 8);
  const fuselage = new THREE.Mesh(fuselageGeo, militaryMat);
  fuselage.castShadow = true;
  droneGroup.add(fuselage);

  // Carbon canopy shell
  const canopyGeo = new THREE.SphereGeometry(1.3, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const canopy = new THREE.Mesh(canopyGeo, carbonMat);
  canopy.position.y = 0.35;
  droneGroup.add(canopy);

  // Top GPS Mast / RTK Antenna
  const mastGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8);
  const mast = new THREE.Mesh(mastGeo, carbonMat);
  mast.position.set(0, 0.9, -0.4);
  droneGroup.add(mast);

  const rtkCap = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.15, 16), militaryMat);
  rtkCap.position.set(0, 1.25, -0.4);
  droneGroup.add(rtkCap);

  // 2. 4 Quadcopter Arms (Carbon Fiber Truss)
  const armRadius = 4.2;
  const rotorGroups = [];

  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2 + Math.PI / 4;
    const armGroup = new THREE.Group();
    armGroup.rotation.y = angle;

    // Carbon Tube
    const armGeo = new THREE.CylinderGeometry(0.12, 0.15, armRadius, 8);
    armGeo.rotateZ(Math.PI / 2);
    const armMesh = new THREE.Mesh(armGeo, carbonMat);
    armMesh.position.x = armRadius / 2;
    armGroup.add(armMesh);

    // Motor Bell
    const motorGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.6, 16);
    const motor = new THREE.Mesh(motorGeo, carbonMat);
    motor.position.set(armRadius, 0.25, 0);
    armGroup.add(motor);

    // Navigation LEDs under motor
    const ledMat = i % 2 === 0 ? ledGreenMat : ledRedMat;
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), ledMat);
    led.position.set(armRadius, -0.15, 0);
    armGroup.add(led);

    // Propeller assembly (2-blade or 3-blade)
    const propGroup = new THREE.Group();
    propGroup.position.set(armRadius, 0.6, 0);

    const bladeGeo = new THREE.BoxGeometry(3.6, 0.04, 0.35);
    const blade1 = new THREE.Mesh(bladeGeo, rotorBladeMat);
    propGroup.add(blade1);

    const blade2 = blade1.clone();
    blade2.rotation.y = Math.PI / 2;
    propGroup.add(blade2);

    armGroup.add(propGroup);
    rotorGroups.push(propGroup);

    droneGroup.add(armGroup);
  }

  // 3. Carbon Landing Skids
  for (let side = -1; side <= 1; side += 2) {
    const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.4, 8), carbonMat);
    leg1.position.set(side * 1.5, -0.6, 0.8);
    leg1.rotation.z = side * 0.3;
    leg1.rotation.x = -0.2;
    droneGroup.add(leg1);

    const leg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.4, 8), carbonMat);
    leg2.position.set(side * 1.5, -0.6, -0.8);
    leg2.rotation.z = side * 0.3;
    leg2.rotation.x = 0.2;
    droneGroup.add(leg2);

    const skid = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.8, 8), carbonMat);
    skid.position.set(side * 1.8, -1.2, 0);
    skid.rotation.x = Math.PI / 2;
    droneGroup.add(skid);
  }

  // 4. Gyro-Stabilized Optical Gimbal & Laser Rangefinder
  const gimbalGroup = new THREE.Group();
  gimbalGroup.position.set(0, -0.5, 0.6);

  const gimbalPitch = new THREE.Group();
  const cameraBall = new THREE.Mesh(new THREE.SphereGeometry(0.65, 24, 24), carbonMat);
  gimbalPitch.add(cameraBall);

  // Optical Recon Lens
  const lensRim = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.38, 0.3, 24), militaryMat);
  lensRim.rotation.x = Math.PI / 2;
  lensRim.position.z = 0.45;
  gimbalPitch.add(lensRim);

  const lensGlass = new THREE.Mesh(new THREE.CircleGeometry(0.3, 24), lensGlassMat);
  lensGlass.position.z = 0.61;
  gimbalPitch.add(lensGlass);

  // LiDAR Rangefinder aperture
  const lidarAperture = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.2), new THREE.MeshBasicMaterial({ color: 0x00e5ff }));
  lidarAperture.position.set(0.3, 0.2, 0.5);
  gimbalPitch.add(lidarAperture);

  gimbalGroup.add(gimbalPitch);
  droneGroup.add(gimbalGroup);

  // 5. Active Volumetric Laser Scanning Cone
  const coneGeo = new THREE.ConeGeometry(8, 24, 32, 1, true);
  coneGeo.rotateX(Math.PI);
  coneGeo.translate(0, -12, 0);
  const coneMat = new THREE.MeshBasicMaterial({
    color: 0x00f59b,
    transparent: true,
    opacity: 0.14,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const scanCone = new THREE.Mesh(coneGeo, coneMat);
  scanCone.position.set(0, -0.6, 0.6);
  droneGroup.add(scanCone);

  // Optical scanning ring at ground level removed per user request

  // Animation update method
  function update(delta, time) {
    // Spin rotor blades
    const spinSpeed = 35 * delta;
    rotorGroups.forEach((r, idx) => {
      r.rotation.y += idx % 2 === 0 ? spinSpeed : -spinSpeed;
    });

    // Slight hovering oscillation
    droneGroup.position.y += Math.sin(time * 3.5) * 0.005;
    droneGroup.rotation.z = Math.sin(time * 2.0) * 0.03;
    droneGroup.rotation.x = Math.cos(time * 1.8) * 0.02;

    // Scan cone pulse
    scanCone.material.opacity = 0.12 + Math.sin(time * 6.0) * 0.06;
  }

  return {
    droneGroup,
    rotorGroups,
    gimbalPitch,
    scanCone,
    update,
  };
}
