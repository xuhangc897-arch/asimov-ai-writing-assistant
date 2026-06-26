import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js";

(function initSpaceBackground() {
  const canvas = document.getElementById("spaceCanvas");

  if (!canvas) {
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 120);
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "low-power"
  });

  const mouse = new THREE.Vector2(0, 0);
  const driftTarget = new THREE.Vector2(0, 0);
  const particleCount = window.innerWidth < 720 ? 170 : 280;
  const palette = [
    new THREE.Color("#28f2ff"),
    new THREE.Color("#3277ff"),
    new THREE.Color("#9d4dff"),
    new THREE.Color("#ff3fd2")
  ];

  camera.position.z = 18;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const seeds = [];

  for (let i = 0; i < particleCount; i += 1) {
    const i3 = i * 3;
    const radius = 7 + Math.random() * 14;
    const angle = Math.random() * Math.PI * 2;
    const depth = (Math.random() - 0.5) * 22;
    const color = palette[Math.floor(Math.random() * palette.length)];

    positions[i3] = Math.cos(angle) * radius + (Math.random() - 0.5) * 8;
    positions[i3 + 1] = Math.sin(angle) * radius * 0.56 + (Math.random() - 0.5) * 8;
    positions[i3 + 2] = depth;

    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;

    seeds.push({
      baseX: positions[i3],
      baseY: positions[i3 + 1],
      baseZ: positions[i3 + 2],
      speed: 0.08 + Math.random() * 0.18,
      phase: Math.random() * Math.PI * 2,
      range: 0.12 + Math.random() * 0.38
    });
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const particleMaterial = new THREE.PointsMaterial({
    size: window.innerWidth < 720 ? 0.055 : 0.07,
    vertexColors: true,
    transparent: true,
    opacity: 0.86,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  const orbitGroup = new THREE.Group();
  const orbitMaterials = [
    new THREE.LineBasicMaterial({ color: 0x28f2ff, transparent: true, opacity: 0.18 }),
    new THREE.LineBasicMaterial({ color: 0x9d4dff, transparent: true, opacity: 0.16 }),
    new THREE.LineBasicMaterial({ color: 0xff3fd2, transparent: true, opacity: 0.12 })
  ];

  for (let i = 0; i < 3; i += 1) {
    const curve = new THREE.EllipseCurve(0, 0, 6.5 + i * 2.2, 2.4 + i * 0.72, 0, Math.PI * 2);
    const points = curve.getPoints(128).map((point) => new THREE.Vector3(point.x, point.y, -2 - i * 1.8));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.LineLoop(geometry, orbitMaterials[i]);
    line.rotation.x = 0.74 + i * 0.1;
    line.rotation.y = -0.24 + i * 0.2;
    line.rotation.z = i * 0.5;
    orbitGroup.add(line);
  }

  scene.add(orbitGroup);

  const streamGroup = new THREE.Group();
  const streamMaterial = new THREE.LineBasicMaterial({
    color: 0x28f2ff,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending
  });

  for (let i = 0; i < 18; i += 1) {
    const x = -12 + Math.random() * 24;
    const y = -7 + Math.random() * 14;
    const z = -8 + Math.random() * 10;
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x, y, z),
      new THREE.Vector3(x + 0.35 + Math.random() * 1.1, y - 1.2 - Math.random() * 2.2, z)
    ]);
    streamGroup.add(new THREE.Line(geometry, streamMaterial));
  }

  scene.add(streamGroup);

  function updateSize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    renderer.setSize(width, height, false);
    particleMaterial.size = width < 720 ? 0.055 : 0.07;
  }

  function handleMouseMove(event) {
    driftTarget.x = (event.clientX / window.innerWidth - 0.5) * 0.9;
    driftTarget.y = -(event.clientY / window.innerHeight - 0.5) * 0.7;
  }

  window.addEventListener("resize", updateSize);
  window.addEventListener("mousemove", handleMouseMove, { passive: true });

  renderer.setAnimationLoop((timeMs) => {
    const time = timeMs * 0.001;
    const positionAttr = particleGeometry.getAttribute("position");

    mouse.lerp(driftTarget, 0.035);

    for (let i = 0; i < particleCount; i += 1) {
      const i3 = i * 3;
      const seed = seeds[i];
      const pulse = Math.sin(time * seed.speed + seed.phase) * seed.range;

      positions[i3] = seed.baseX + pulse + mouse.x;
      positions[i3 + 1] = seed.baseY + Math.cos(time * seed.speed + seed.phase) * seed.range + mouse.y;
      positions[i3 + 2] = seed.baseZ + Math.sin(time * seed.speed * 0.6 + seed.phase) * 0.5;
    }

    positionAttr.needsUpdate = true;
    particles.rotation.y = time * 0.018 + mouse.x * 0.018;
    particles.rotation.x = mouse.y * 0.015;
    orbitGroup.rotation.z = time * 0.028;
    orbitGroup.rotation.y = Math.sin(time * 0.12) * 0.08 + mouse.x * 0.04;
    streamGroup.position.y = Math.sin(time * 0.24) * 0.26;
    streamGroup.rotation.z = -0.28 + Math.sin(time * 0.1) * 0.04;

    renderer.render(scene, camera);
  });
})();
