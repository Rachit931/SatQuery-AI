'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const earthVertex = `varying vec2 vUv; varying vec3 vNormalW; varying vec3 vViewDir; void main(){vUv=uv;vec4 world=modelMatrix*vec4(position,1.);vNormalW=normalize(mat3(modelMatrix)*normal);vViewDir=normalize(cameraPosition-world.xyz);gl_Position=projectionMatrix*viewMatrix*world;}`;
const earthFragment = `uniform sampler2D dayMap;uniform sampler2D nightMap;uniform vec3 sunDirection;varying vec2 vUv;varying vec3 vNormalW;varying vec3 vViewDir;
void main(){vec3 n=normalize(vNormalW);float ndl=dot(n,normalize(sunDirection));float daylight=smoothstep(-.16,.3,ndl);vec3 day=texture2D(dayMap,vUv).rgb;day=pow(day,vec3(.94));float diffuse=.2+max(ndl,0.)*.95;float oceanHint=smoothstep(.16,.02,day.r-day.b);float spec=pow(max(dot(reflect(-normalize(sunDirection),n),vViewDir),0.),48.)*oceanHint*max(ndl,0.);vec3 night=texture2D(nightMap,vUv).rgb*1.28;vec3 color=mix(night,day*diffuse,daylight);color+=spec*vec3(.48,.62,.78);gl_FragColor=vec4(color,1.);}`;
const atmosphereVertex = `varying vec3 vNormalW;varying vec3 vViewDir;void main(){vec4 world=modelMatrix*vec4(position,1.);vNormalW=normalize(mat3(modelMatrix)*normal);vViewDir=normalize(cameraPosition-world.xyz);gl_Position=projectionMatrix*viewMatrix*world;}`;
const atmosphereFragment = `uniform vec3 sunDirection;varying vec3 vNormalW;varying vec3 vViewDir;void main(){float rim=pow(1.-abs(dot(normalize(vNormalW),normalize(vViewDir))),3.7);float sun=mix(.28,1.,smoothstep(-.15,.6,dot(normalize(vNormalW),normalize(sunDirection))));gl_FragColor=vec4(vec3(.16,.65,1.),rim*sun*.58);}`;
const sunriseVertex = `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const sunriseFragment = `varying vec2 vUv;void main(){vec2 p=vUv-.5;float halo=exp(-dot(p*vec2(2.15,2.8),p*vec2(2.15,2.8))*8.5);float core=exp(-dot(p*vec2(7.5,9.5),p*vec2(7.5,9.5))*18.);float streak=exp(-abs(p.y)*82.)*exp(-abs(p.x)*4.8);float upperRay=exp(-abs(p.y-p.x*.14)*34.)*exp(-abs(p.x)*6.5)*.16;float alpha=halo*.28+core*1.2+streak*.32+upperRay;vec3 icy=mix(vec3(.16,.52,1.),vec3(1.),clamp(core*1.8+streak*.7,0.,1.));gl_FragColor=vec4(icy,alpha);}`;
const EARTH_ROTATION_SECONDS = 60;
const SATELLITE_ORBIT_RADIANS_PER_SECOND = 0.286;

function makeSatellite() {
  const root = new THREE.Group(),
    matteBrown = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      metalness: 0.05,
      roughness: 0.85,
    }),
    ringMetal = new THREE.MeshStandardMaterial({
      color: 0x75818b,
      metalness: 0.88,
      roughness: 0.22,
    }),
    dark = new THREE.MeshStandardMaterial({
      color: 0x0b1015,
      metalness: 0.7,
      roughness: 0.44,
    }),
    panelMat = new THREE.MeshStandardMaterial({
      color: 0x071326,
      metalness: 0.48,
      roughness: 0.38,
      emissive: 0x020815,
    }),
    frameMat = new THREE.LineBasicMaterial({
      color: 0x506782,
      transparent: true,
      opacity: 0.72,
    });
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.29, 0.31, 0.92, 32),
    matteBrown,
  );
  body.rotation.z = Math.PI / 2;
  root.add(body);
  [-0.34, -0.08, 0.2, 0.38].forEach((x) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.305, 0.024, 8, 32),
      ringMetal,
    );
    ring.rotation.y = Math.PI / 2;
    ring.position.x = x;
    root.add(ring);
  });
  const aft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.23, 0.29, 0.18, 28),
    dark,
  );
  aft.rotation.z = Math.PI / 2;
  aft.position.x = 0.54;
  root.add(aft);
  [-0.16, 0.16].forEach((y) => {
    const detail = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.045, 0.08),
      ringMetal,
    );
    detail.position.set(0.05, y, 0.25);
    root.add(detail);
  });
  const dish = new THREE.Mesh(
    new THREE.SphereGeometry(0.47, 36, 16, 0, Math.PI * 2, 0, 0.58),
    new THREE.MeshStandardMaterial({
      color: 0x515c66,
      metalness: 0.76,
      roughness: 0.34,
      side: THREE.DoubleSide,
    }),
  );
  dish.scale.y = 0.32;
  dish.rotation.z = Math.PI / 2;
  dish.position.x = -0.62;
  root.add(dish);
  const feed = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 0.38, 10),
    ringMetal,
  );
  feed.rotation.z = Math.PI / 2;
  feed.position.x = -0.78;
  root.add(feed);
  const feedHead = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 8), dark);
  feedHead.position.x = -0.98;
  root.add(feedHead);
  [-1, 1].forEach((side) => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.62, 0.045), dark);
    arm.position.y = side * 0.55;
    root.add(arm);
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, 1.38, 0.026),
      panelMat,
    );
    panel.position.y = side * 1.48;
    root.add(panel);
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(panel.geometry),
      frameMat,
    );
    edges.position.copy(panel.position);
    root.add(edges);
    for (let c = -2; c <= 2; c++) {
      const line = new THREE.Mesh(
        new THREE.BoxGeometry(0.012, 1.34, 0.031),
        ringMetal,
      );
      line.position.set(c * 0.112, panel.position.y, 0);
      root.add(line);
    }
    for (let r = -1; r <= 1; r += 2) {
      const line = new THREE.Mesh(
        new THREE.BoxGeometry(0.56, 0.012, 0.031),
        ringMetal,
      );
      line.position.set(0, panel.position.y + r * 0.22, 0);
      root.add(line);
    }
  });
  root.scale.setScalar(0.62);
  return root;
}

function makeOrbit(radius: number, tilt: number, roll: number) {
  const group = new THREE.Group();
  const positions: number[] = [],
    colors: number[] = [];
  const coreBlue = new THREE.Color(0x599fcb),
    dimBlue = new THREE.Color(0x287bb5),
    curvePoints: THREE.Vector3[] = [];
  for (let i = 0; i <= 280; i++) {
    const a = (i / 280) * Math.PI * 2;
    positions.push(Math.cos(a) * radius, Math.sin(a) * radius, 0);
    curvePoints.push(
      new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0),
    );
    const color = dimBlue
      .clone()
      .lerp(coreBlue, 0.58 + 0.3 * Math.sin(a * 2.15));
    const intensity = 0.34 + 0.48 * Math.pow(0.5 + 0.5 * Math.cos(a - 0.42), 2);
    colors.push(color.r * intensity, color.g * intensity, color.b * intensity);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const line = new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.82,
      depthTest: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    }),
  );
  const path = new THREE.CatmullRomCurve3(
    curvePoints.slice(0, -1),
    true,
    'catmullrom',
    0.15,
  );
  const haloOuter = new THREE.Mesh(
    new THREE.TubeGeometry(path, 220, 0.026, 5, true),
    new THREE.MeshBasicMaterial({
      color: 0x287bb5,
      transparent: true,
      opacity: 0.035,
      depthTest: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    }),
  );
  const haloInner = new THREE.Mesh(
    new THREE.TubeGeometry(path, 220, 0.013, 5, true),
    new THREE.MeshBasicMaterial({
      color: 0x287bb5,
      transparent: true,
      opacity: 0.08,
      depthTest: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    }),
  );
  group.add(haloOuter, haloInner, line);
  group.rotation.set(tilt, 0.04, roll);
  return group;
}

const TRAIL_SEGMENTS = 70;
const TRAIL_ARC = 0.85;

function makeSatelliteTrail() {
  const group = new THREE.Group();

  const ribbonPositions = new Float32Array((TRAIL_SEGMENTS + 1) * 2 * 3);
  const ribbonColors = new Float32Array((TRAIL_SEGMENTS + 1) * 2 * 3);
  const ribbonIndices: number[] = [];

  for (let i = 0; i < TRAIL_SEGMENTS; i++) {
    const a = i * 2;
    const b = i * 2 + 1;
    const c = (i + 1) * 2;
    const d = (i + 1) * 2 + 1;
    ribbonIndices.push(a, b, c);
    ribbonIndices.push(b, d, c);
  }

  const ribbonGeo = new THREE.BufferGeometry();
  ribbonGeo.setAttribute('position', new THREE.BufferAttribute(ribbonPositions, 3));
  ribbonGeo.setAttribute('color', new THREE.BufferAttribute(ribbonColors, 3));
  ribbonGeo.setIndex(ribbonIndices);

  const ribbonMat = new THREE.MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthTest: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
  const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);

  const glowPositions = new Float32Array((TRAIL_SEGMENTS + 1) * 2 * 3);
  const glowColors = new Float32Array((TRAIL_SEGMENTS + 1) * 2 * 3);
  const glowGeo = new THREE.BufferGeometry();
  glowGeo.setAttribute('position', new THREE.BufferAttribute(glowPositions, 3));
  glowGeo.setAttribute('color', new THREE.BufferAttribute(glowColors, 3));
  glowGeo.setIndex(ribbonIndices);

  const glowMat = new THREE.MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending,
    depthTest: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
  const glowMesh = new THREE.Mesh(glowGeo, glowMat);

  const linePositions = new Float32Array((TRAIL_SEGMENTS + 1) * 3);
  const lineColors = new Float32Array((TRAIL_SEGMENTS + 1) * 3);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  lineGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

  const lineMat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending,
    depthTest: true,
    depthWrite: false,
    toneMapped: false,
  });
  const coreLine = new THREE.Line(lineGeo, lineMat);

  group.add(glowMesh, ribbonMesh, coreLine);

  const update = (currentPhase: number) => {
    const R = 2.78;
    for (let i = 0; i <= TRAIL_SEGMENTS; i++) {
      const u = i / TRAIL_SEGMENTS;
      const angle = currentPhase - u * TRAIL_ARC;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      const alpha = Math.pow(1 - u, 1.8);
      const wRibbon = 0.026 * Math.pow(1 - u, 1.2);
      const wGlow = 0.065 * Math.pow(1 - u, 1.4);

      const idx2 = i * 6;
      ribbonPositions[idx2] = (R - wRibbon) * cosA;
      ribbonPositions[idx2 + 1] = (R - wRibbon) * sinA;
      ribbonPositions[idx2 + 2] = 0;
      ribbonPositions[idx2 + 3] = (R + wRibbon) * cosA;
      ribbonPositions[idx2 + 4] = (R + wRibbon) * sinA;
      ribbonPositions[idx2 + 5] = 0;

      ribbonColors[idx2] = 0;
      ribbonColors[idx2 + 1] = alpha;
      ribbonColors[idx2 + 2] = alpha;
      ribbonColors[idx2 + 3] = 0;
      ribbonColors[idx2 + 4] = alpha;
      ribbonColors[idx2 + 5] = alpha;

      glowPositions[idx2] = (R - wGlow) * cosA;
      glowPositions[idx2 + 1] = (R - wGlow) * sinA;
      glowPositions[idx2 + 2] = 0;
      glowPositions[idx2 + 3] = (R + wGlow) * cosA;
      glowPositions[idx2 + 4] = (R + wGlow) * sinA;
      glowPositions[idx2 + 5] = 0;

      glowColors[idx2] = 0;
      glowColors[idx2 + 1] = alpha * 0.45;
      glowColors[idx2 + 2] = alpha * 0.45;
      glowColors[idx2 + 3] = 0;
      glowColors[idx2 + 4] = alpha * 0.45;
      glowColors[idx2 + 5] = alpha * 0.45;

      const idxLine = i * 3;
      linePositions[idxLine] = R * cosA;
      linePositions[idxLine + 1] = R * sinA;
      linePositions[idxLine + 2] = 0;

      lineColors[idxLine] = 0;
      lineColors[idxLine + 1] = alpha * 1.1;
      lineColors[idxLine + 2] = alpha * 1.1;
    }

    ribbonGeo.attributes.position.needsUpdate = true;
    ribbonGeo.attributes.color.needsUpdate = true;
    glowGeo.attributes.position.needsUpdate = true;
    glowGeo.attributes.color.needsUpdate = true;
    lineGeo.attributes.position.needsUpdate = true;
    lineGeo.attributes.color.needsUpdate = true;
  };

  const dispose = () => {
    ribbonGeo.dispose();
    ribbonMat.dispose();
    glowGeo.dispose();
    glowMat.dispose();
    lineGeo.dispose();
    lineMat.dispose();
  };

  return { group, update, dispose };
}

function makeTerrainLayer(
  baseY: number,
  color: number,
  z: number,
  phase: number,
) {
  const shape = new THREE.Shape(),
    ridge: THREE.Vector3[] = [];
  const count = 90;
  for (let i = 0; i <= count; i++) {
    const x = -8 + (i / count) * 16;
    const y =
      baseY +
      0.16 * Math.sin(x * 0.72 + phase) +
      0.08 * Math.sin(x * 2.7 + phase * 1.4) +
      0.035 * Math.sin(x * 7.3);
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
    ridge.push(new THREE.Vector3(x, y, z + 0.012));
  }
  shape.lineTo(8, -4);
  shape.lineTo(-8, -4);
  shape.closePath();
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 1,
    metalness: 0.04,
    transparent: true,
    opacity: 0,
    depthWrite: true,
  });
  const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
  mesh.position.z = z;
  const rimMat = new THREE.LineBasicMaterial({
    color: 0xb88a44,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const rim = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(ridge),
    rimMat,
  );
  return { mesh, material, rim, rimMat };
}

export default function SpaceScene() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const scene = new THREE.Scene(),
      camera = new THREE.PerspectiveCamera(
        38,
        innerWidth / innerHeight,
        0.1,
        100,
      );
    camera.position.z = 9;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    host.appendChild(renderer.domElement);
    const loader = new THREE.TextureLoader(),
      mobileAsset = innerWidth < 760;
    const day = loader.load(
      mobileAsset ? '/earth-day-2k.jpg' : '/earth-day-4k.jpg',
    );
    const night = loader.load(
      mobileAsset ? '/earth-night-2k.jpg' : '/earth-night-8k.jpg',
    );
    const clouds = loader.load(
      mobileAsset ? '/earth-clouds-2k.jpg' : '/earth-clouds-8k.jpg',
    );
    [day, night, clouds].forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    });
    const sunDirection = new THREE.Vector3(-1, 0.72, 1.4).normalize();
    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(2.23, 128, 128),
      new THREE.ShaderMaterial({
        vertexShader: earthVertex,
        fragmentShader: earthFragment,
        uniforms: {
          dayMap: { value: day },
          nightMap: { value: night },
          sunDirection: { value: sunDirection },
        },
      }),
    );
    earth.position.set(1.35, 0.1, 0);
    earth.rotation.set(0, -1.12, -0.12);
    scene.add(earth);
    const sunrise = new THREE.Mesh(
      new THREE.PlaneGeometry(3.8, 2.35),
      new THREE.ShaderMaterial({
        vertexShader: sunriseVertex,
        fragmentShader: sunriseFragment,
        transparent: true,
        depthTest: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    );
    sunrise.position.set(
      earth.position.x - 1.85,
      earth.position.y + 1.25,
      -0.38,
    );
    sunrise.renderOrder = -1;
    scene.add(sunrise);
    const cloudLayer = new THREE.Mesh(
      new THREE.SphereGeometry(2.245, 128, 128),
      new THREE.MeshPhongMaterial({
        color: 0xffffff,
        alphaMap: clouds,
        transparent: true,
        opacity: 0.48,
        depthWrite: false,
        blending: THREE.NormalBlending,
      }),
    );
    cloudLayer.position.copy(earth.position);
    cloudLayer.rotation.copy(earth.rotation);
    scene.add(cloudLayer);
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(2.285, 96, 96),
      new THREE.ShaderMaterial({
        vertexShader: atmosphereVertex,
        fragmentShader: atmosphereFragment,
        uniforms: { sunDirection: { value: sunDirection } },
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    );
    atmosphere.position.copy(earth.position);
    atmosphere.rotation.copy(earth.rotation);
    scene.add(atmosphere);
    const orbitA = makeOrbit(2.78, 1.23, -0.09),
      orbitB = makeOrbit(3.18, 1.34, 0.12),
      orbits = new THREE.Group();
    orbits.add(orbitA, orbitB);
    orbits.position.copy(earth.position);
    scene.add(orbits);
    const markerGeo = new THREE.SphereGeometry(0.018, 10, 10),
      markerMat = new THREE.MeshBasicMaterial({
        color: 0x599fcb,
        transparent: true,
        opacity: 0.28,
        toneMapped: false,
      }),
      markerA = new THREE.Mesh(markerGeo, markerMat),
      markerB = new THREE.Mesh(markerGeo, markerMat.clone());
    orbits.add(markerA, markerB);
    const footerCurve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(0.25, -2.35, 0.32),
        new THREE.Vector3(0.95, -2.08, 0.38),
        new THREE.Vector3(1.55, -1.92, 0.43),
        new THREE.Vector3(2.18, -1.63, 0.47),
      ],
      false,
      'catmullrom',
      0.6,
    );
    const footerTrailMat = new THREE.LineBasicMaterial({
      color: 0x5eaaff,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const footerTrail = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(footerCurve.getPoints(100)),
      footerTrailMat,
    );
    scene.add(footerTrail);
    const terrainBack = makeTerrainLayer(-2.12, 0x151a1d, -0.18, 0.4),
      terrainFront = makeTerrainLayer(-2.48, 0x090d10, 0.18, 2.1);
    scene.add(
      terrainBack.mesh,
      terrainBack.rim,
      terrainFront.mesh,
      terrainFront.rim,
    );
    const footerPointMat = new THREE.MeshBasicMaterial({
        color: 0xd8b978,
        transparent: true,
        opacity: 0,
        toneMapped: false,
      }),
      footerPointA = new THREE.Mesh(
        new THREE.SphereGeometry(0.026, 10, 10),
        footerPointMat,
      ),
      footerPointB = new THREE.Mesh(
        new THREE.SphereGeometry(0.018, 10, 10),
        footerPointMat.clone(),
      );
    footerPointA.position.copy(footerCurve.getPoint(0.34));
    footerPointB.position.copy(footerCurve.getPoint(0.7));
    scene.add(footerPointA, footerPointB);
    const satellite = makeSatellite();
    satellite.scale.setScalar(0.7);
    orbitA.add(satellite);
    const satelliteTrail = makeSatelliteTrail();
    orbitA.add(satelliteTrail.group);
    satelliteTrail.update(0);
    scene.add(new THREE.AmbientLight(0x8294bc, 1.15));
    const key = new THREE.DirectionalLight(0xffffff, 4.5);
    key.position.set(-5, 5, 6);
    scene.add(key);
    const warmRim = new THREE.PointLight(0xd8a85d, 0, 4.5, 2);
    warmRim.position.set(3, -0.95, 1.5);
    scene.add(warmRim);
    const starGeo = new THREE.BufferGeometry(),
      points = new Float32Array(2250);
    for (let i = 0; i < points.length; i += 3) {
      points[i] = (Math.random() - 0.5) * 24;
      points[i + 1] = (Math.random() - 0.5) * 14;
      points[i + 2] = -2 - Math.random() * 8;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(points, 3));
    const coolStars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({
        color: 0xaad2ff,
        size: 0.014,
        transparent: true,
        opacity: 0.8,
      }),
    );
    scene.add(coolStars);
    const warmStarGeo = new THREE.BufferGeometry(),
      warmPoints = new Float32Array(105);
    for (let i = 0; i < warmPoints.length; i += 3) {
      warmPoints[i] = (Math.random() - 0.5) * 20;
      warmPoints[i + 1] = (Math.random() - 0.5) * 12;
      warmPoints[i + 2] = -1.5 - Math.random() * 7;
    }
    warmStarGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(warmPoints, 3),
    );
    const warmStars = new THREE.Points(
      warmStarGeo,
      new THREE.PointsMaterial({
        color: 0xd8b978,
        size: 0.022,
        transparent: true,
        opacity: 0.52,
        toneMapped: false,
      }),
    );
    scene.add(warmStars);
    let frame = 0;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches,
      clock = new THREE.Clock();
    const updateScene = (progress: number) => {
      const mobile = innerWidth < 760,
        baseX = mobile ? 0.55 : 1.35,
        baseY = mobile ? -0.65 : 0.1;
      const heroExit = Math.min(progress / 0.24, 1);
      earth.position.set(baseX, baseY + heroExit * 7, 0);
      cloudLayer.position.copy(earth.position);
      atmosphere.position.copy(earth.position);
      orbits.position.copy(earth.position);
      orbits.scale.setScalar(mobile ? 0.76 : 1);
      sunrise.position.set(
        earth.position.x - (mobile ? 1.35 : 1.85),
        earth.position.y + (mobile ? 0.95 : 1.25),
        -0.38,
      );
      sunrise.scale.setScalar(mobile ? 0.9 : 1);
      coolStars.position.y = progress * 0.11;
      warmStars.position.y = progress * 0.18;
      const footerReveal = THREE.MathUtils.smoothstep(progress, 0.72, 0.94);
      footerTrailMat.opacity = footerReveal * 0.31;
      terrainBack.material.opacity = footerReveal * 0.96;
      terrainFront.material.opacity = footerReveal;
      terrainBack.rimMat.opacity = footerReveal * 0.16;
      terrainFront.rimMat.opacity = footerReveal * 0.08;
      (footerPointA.material as THREE.MeshBasicMaterial).opacity =
        footerReveal * 0.9;
      (footerPointB.material as THREE.MeshBasicMaterial).opacity =
        footerReveal * 0.65;
      warmRim.intensity = footerReveal * 1.25;
      if (reduced) {
        satellite.position.set(2.78, 0, 0);
        satellite.rotation.set(0, 0, Math.PI / 2);
      }
    };
    updateScene(0);
    gsap.registerPlugin(ScrollTrigger);
    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => updateScene(self.progress),
      onRefresh: (self) => updateScene(self.progress),
    });
    const revealTweens: gsap.core.Tween[] = [];
    if (!reduced) {
      gsap.set('.feature', { y: 30, opacity: 0 });
      document
        .querySelectorAll('.section-copy h2,.feature h3')
        .forEach((el) =>
          revealTweens.push(
            gsap.fromTo(
              el,
              { y: 24, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.65,
                ease: 'power2.out',
                scrollTrigger: { trigger: el, start: 'top 86%', once: true },
              },
            ),
          ),
        );
      ScrollTrigger.batch('.feature', {
        start: 'top 88%',
        once: true,
        onEnter: (batch) =>
          revealTweens.push(
            gsap.to(batch, {
              y: 0,
              opacity: 1,
              duration: 0.65,
              stagger: 0.12,
              ease: 'power2.out',
              clearProps: 'transform',
            }),
          ),
      });
    }
    const render = () => {
      const delta = Math.min(clock.getDelta(), 0.05);
      if (!reduced) {
        earth.rotation.y += (delta * Math.PI * 2) / EARTH_ROTATION_SECONDS;
        cloudLayer.rotation.y +=
          (delta * Math.PI * 2) / (EARTH_ROTATION_SECONDS * 0.88);
        const orbitPhase =
          clock.getElapsedTime() * SATELLITE_ORBIT_RADIANS_PER_SECOND;
        satellite.position.set(
          Math.cos(orbitPhase) * 2.78,
          Math.sin(orbitPhase) * 2.78,
          0,
        );
        satellite.rotation.set(0, 0, orbitPhase + Math.PI / 2);
        satelliteTrail.update(orbitPhase);
      }
      const t = reduced ? 0.13 : performance.now() * 0.000025;
      const p1 = orbitA.localToWorld(
        new THREE.Vector3(
          Math.cos(t * Math.PI * 2) * 2.78,
          Math.sin(t * Math.PI * 2) * 2.78,
          0,
        ),
      );
      const p2 = orbitB.localToWorld(
        new THREE.Vector3(
          Math.cos((t * 0.72 + 0.42) * Math.PI * 2) * 3.18,
          Math.sin((t * 0.72 + 0.42) * Math.PI * 2) * 3.18,
          0,
        ),
      );
      markerA.position.copy(orbits.worldToLocal(p1));
      markerB.position.copy(orbits.worldToLocal(p2));
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    render();
    const resize = () => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
      const mobile = innerWidth < 760;
      earth.scale.setScalar(mobile ? 0.76 : 1);
      cloudLayer.scale.copy(earth.scale);
      atmosphere.scale.copy(earth.scale);
      ScrollTrigger.refresh();
    };
    addEventListener('resize', resize);
    resize();
    return () => {
      trigger.kill();
      revealTweens.forEach((t) => {
        t.scrollTrigger?.kill();
        t.kill();
      });
      cancelAnimationFrame(frame);
      removeEventListener('resize', resize);
      satelliteTrail.dispose();
      [day, night, clouds].forEach((t) => t.dispose());
      renderer.dispose();
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          const m = o.material;
          (Array.isArray(m) ? m : [m]).forEach((x) => x.dispose());
        }
      });
      host.removeChild(renderer.domElement);
    };
  }, []);
  return <div ref={ref} className="space-canvas" aria-hidden="true" />;
}
