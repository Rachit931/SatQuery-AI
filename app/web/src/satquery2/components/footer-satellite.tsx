'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Creates the realistic 3D satellite matching the reference design:
 * - Cylindrical hull with terracotta/copper segments and titanium rings
 * - Aperture hood / optics sensor at front
 * - Solar panel array with metallic frame and solar cell grid
 * - Rear thruster / aft section
 */
function buildSatelliteModel(): THREE.Group {
  const root = new THREE.Group();

  // Materials
  const copperMat = new THREE.MeshStandardMaterial({
    color: 0x9e481b,
    metalness: 0.35,
    roughness: 0.45,
  });

  const titaniumMat = new THREE.MeshStandardMaterial({
    color: 0x828f9d,
    metalness: 0.88,
    roughness: 0.22,
  });

  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x090e14,
    metalness: 0.72,
    roughness: 0.38,
  });

  const apertureInnerMat = new THREE.MeshStandardMaterial({
    color: 0x03060a,
    metalness: 0.9,
    roughness: 0.2,
  });

  const goldOpticMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    metalness: 0.92,
    roughness: 0.15,
  });

  const solarPanelMat = new THREE.MeshStandardMaterial({
    color: 0x0b1b36,
    metalness: 0.55,
    roughness: 0.25,
    emissive: 0x030c1d,
    emissiveIntensity: 0.4,
  });

  const solarCellLineMat = new THREE.LineBasicMaterial({
    color: 0x4d7599,
    transparent: true,
    opacity: 0.75,
  });

  // 1. Central Cylindrical Hull (horizontal orientation along X axis)
  const mainBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.38, 0.40, 1.25, 36),
    copperMat
  );
  mainBody.rotation.z = Math.PI / 2;
  root.add(mainBody);

  // 2. Titanium Ribs / Ring Bands around cylinder
  const ringPositions = [-0.52, -0.26, 0, 0.26, 0.52];
  ringPositions.forEach((xPos) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.405, 0.024, 10, 36),
      titaniumMat
    );
    ring.rotation.y = Math.PI / 2;
    ring.position.x = xPos;
    root.add(ring);
  });

  // 3. Front Optics Aperture Cowl (wide open sensor hood facing -X)
  const apertureHood = new THREE.Mesh(
    new THREE.CylinderGeometry(0.39, 0.54, 0.45, 36, 1, true),
    titaniumMat
  );
  apertureHood.rotation.z = Math.PI / 2;
  apertureHood.position.x = -0.84;
  root.add(apertureHood);

  // Inner dark cavity of aperture
  const apertureInner = new THREE.Mesh(
    new THREE.CylinderGeometry(0.36, 0.51, 0.43, 36, 1, true),
    apertureInnerMat
  );
  apertureInner.rotation.z = Math.PI / 2;
  apertureInner.position.x = -0.84;
  root.add(apertureInner);

  // Optical sensor core inside the aperture
  const sensorCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5),
    goldOpticMat
  );
  sensorCore.rotation.z = -Math.PI / 2;
  sensorCore.position.x = -0.66;
  root.add(sensorCore);

  // Front rim ring
  const frontRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.54, 0.022, 10, 36),
    darkMat
  );
  frontRim.rotation.y = Math.PI / 2;
  frontRim.position.x = -1.06;
  root.add(frontRim);

  // 4. Rear Aft Service Module & Thruster (+X side)
  const rearSection = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.38, 0.28, 32),
    darkMat
  );
  rearSection.rotation.z = Math.PI / 2;
  rearSection.position.x = 0.76;
  root.add(rearSection);

  const thrusterNozzle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.28, 0.22, 24, 1, true),
    titaniumMat
  );
  thrusterNozzle.rotation.z = Math.PI / 2;
  thrusterNozzle.position.x = 0.98;
  root.add(thrusterNozzle);

  // 5. Equipment boxes & antenna mounts on body
  [-0.2, 0.2].forEach((yOff) => {
    const avionicsBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.08, 0.16),
      titaniumMat
    );
    avionicsBox.position.set(0.08, yOff, 0.36);
    root.add(avionicsBox);
  });

  // 6. High-Gain Dish Antenna
  const dish = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 28, 14, 0, Math.PI * 2, 0, 0.6),
    titaniumMat
  );
  dish.scale.y = 0.35;
  dish.rotation.z = Math.PI / 3;
  dish.rotation.y = -Math.PI / 4;
  dish.position.set(0.48, 0.42, -0.28);
  root.add(dish);

  // 7. Solar Panels Array (Realistic dual-wing or single large angled wing like reference)
  const makeSolarWing = (sideSign: number) => {
    const wingGroup = new THREE.Group();

    // Strut / Boom connecting to satellite
    const boom = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.032, 0.85, 12),
      titaniumMat
    );
    boom.position.y = 0.42;
    wingGroup.add(boom);

    // Solar Panel Slab
    const panelWidth = 0.88;
    const panelLength = 1.95;
    const panelThickness = 0.038;

    const panelMesh = new THREE.Mesh(
      new THREE.BoxGeometry(panelWidth, panelLength, panelThickness),
      solarPanelMat
    );
    panelMesh.position.y = 1.62;
    wingGroup.add(panelMesh);

    // Silver border frame
    const frameGeo = new THREE.EdgesGeometry(panelMesh.geometry);
    const frame = new THREE.LineSegments(frameGeo, solarCellLineMat);
    frame.position.copy(panelMesh.position);
    wingGroup.add(frame);

    // Solar Cell Grid Lines (vertical & horizontal cell dividers)
    [-0.3, -0.1, 0.1, 0.3].forEach((xLine) => {
      const lineMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.015, panelLength * 0.96, panelThickness * 1.25),
        titaniumMat
      );
      lineMesh.position.set(xLine, panelMesh.position.y, 0);
      wingGroup.add(lineMesh);
    });

    [-0.65, -0.32, 0, 0.32, 0.65].forEach((yLine) => {
      const lineMesh = new THREE.Mesh(
        new THREE.BoxGeometry(panelWidth * 0.96, 0.015, panelThickness * 1.25),
        titaniumMat
      );
      lineMesh.position.set(0, panelMesh.position.y + yLine, 0);
      wingGroup.add(lineMesh);
    });

    wingGroup.position.set(0.12, sideSign * 0.32, 0);
    wingGroup.rotation.z = sideSign > 0 ? 0.35 : -0.35;
    wingGroup.rotation.x = 0.25;

    return wingGroup;
  };

  // Primary large solar panel array
  const topWing = makeSolarWing(1);
  root.add(topWing);

  // Counterbalance / secondary solar array panel pointing down
  const bottomWing = makeSolarWing(-1);
  bottomWing.scale.set(0.72, 0.72, 0.72);
  root.add(bottomWing);

  return root;
}

/**
 * Creates glowing cyan/blue orbital track curves around the satellite
 */
function buildOrbitalCurves(): THREE.Group {
  const group = new THREE.Group();

  // Create 2 glowing elliptical orbital curves
  const createOrbitCurve = (radiusX: number, radiusY: number, tiltZ: number, tiltX: number, opacity: number) => {
    const points: THREE.Vector3[] = [];
    const segments = 180;

    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const x = Math.cos(theta) * radiusX;
      const y = Math.sin(theta) * radiusY;
      points.push(new THREE.Vector3(x, y, 0));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    // Gradient vertex colors for fading out behind
    const colors: number[] = [];
    const colorCyan = new THREE.Color(0x38bdf8);
    const colorElectric = new THREE.Color(0x00e5ff);

    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const factor = (Math.sin(theta + 0.5) + 1) * 0.5; // brighter on near side
      const col = colorCyan.clone().lerp(colorElectric, factor);
      colors.push(col.r, col.g, col.b);
    }

    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const line = new THREE.Line(geometry, lineMat);
    line.rotation.z = tiltZ;
    line.rotation.x = tiltX;

    return line;
  };

  // Inner primary bright orbit curve
  const orbit1 = createOrbitCurve(3.4, 1.35, -0.42, 1.12, 0.85);
  // Outer secondary softer orbit curve
  const orbit2 = createOrbitCurve(4.2, 1.65, -0.36, 1.18, 0.45);

  group.add(orbit1, orbit2);
  return group;
}

export default function FooterSatellite() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 460;
    let height = container.clientHeight || 340;

    // 1. Scene setup
    const scene = new THREE.Scene();

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.3, 7.6);

    // 3. Renderer with antialiasing and alpha transparency
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 4. Lighting
    // Ambient space light
    const ambientLight = new THREE.AmbientLight(0x182844, 1.2);
    scene.add(ambientLight);

    // Main key sunlight (warm white from top-left)
    const sunLight = new THREE.DirectionalLight(0xfff5e6, 2.8);
    sunLight.position.set(-6, 8, 5);
    scene.add(sunLight);

    // Cyan electric rim light from bottom-right (matching space atmosphere glow)
    const cyanRimLight = new THREE.DirectionalLight(0x00e5ff, 2.2);
    cyanRimLight.position.set(7, -4, -2);
    scene.add(cyanRimLight);

    // Soft fill blue light from front
    const fillLight = new THREE.PointLight(0x38bdf8, 1.4, 20);
    fillLight.position.set(1, 2, 4);
    scene.add(fillLight);

    // 5. Build and add Satellite model
    const satellite = buildSatelliteModel();
    satellite.scale.setScalar(1.05);
    // Initial pose: angled gracefully like in the reference
    satellite.rotation.set(-0.25, 0.45, 0.28);
    scene.add(satellite);

    // 6. Build and add Orbital Curves
    const orbits = buildOrbitalCurves();
    orbits.position.set(0.15, -0.2, -0.4);
    scene.add(orbits);

    // 7. Interactive subtle mouse parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetMouseX = Math.max(-1, Math.min(1, x));
      targetMouseY = Math.max(-1, Math.min(1, y));
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 8. Animation Loop (Smooth 8–12 second floating cycle)
    let animationFrameId: number;
    let isVisible = true;
    const clock = new THREE.Clock();

    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerp
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Gentle vertical floating (approx 9.5s sine cycle)
      const floatY = Math.sin(elapsedTime * 0.66) * 0.16;
      // Very gentle lateral drift (approx 12s cycle)
      const floatX = Math.cos(elapsedTime * 0.48) * 0.08;

      satellite.position.y = floatY + mouseY * 0.2;
      satellite.position.x = floatX + mouseX * 0.25;

      // Slow gentle rotation / breathing
      satellite.rotation.x = -0.25 + Math.sin(elapsedTime * 0.52) * 0.06 - mouseY * 0.15;
      satellite.rotation.y = 0.45 + Math.cos(elapsedTime * 0.38) * 0.08 + mouseX * 0.22;
      satellite.rotation.z = 0.28 + Math.sin(elapsedTime * 0.42) * 0.04;

      // Slowly rotate orbital curves
      orbits.rotation.z = -0.15 + Math.sin(elapsedTime * 0.25) * 0.03;
      orbits.rotation.y = Math.cos(elapsedTime * 0.3) * 0.04;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // 9. Intersection Observer (pause rendering when footer is scrolled off screen)
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // 10. Resize handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 460;
      height = container.clientHeight || 340;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      renderer.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="footer-satellite-canvas-wrap"
      aria-hidden="true"
    />
  );
}
