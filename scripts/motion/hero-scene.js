/**
 * Luminous intelligence. Adapted from ThreeUI Community Orbital Sphere's
 * BufferGeometry / Points and orbit scene. Copyright (c) 2026 Meng To, MIT.
 * https://github.com/MengTo/threeui/blob/68802d5428071ada5c20db8094b1649e6bb770ed/src/shaders/orbital-sphere/orbitalSphereRenderer.ts
 * Full licenses are embedded by build-company-motion.mjs.
 */
import * as THREE from 'three';
import { getHeroTimeline } from '../../company-motion-timeline.js';

const surface = `
  uniform float uTime;
  uniform float uGather;
  uniform float uAction;
  vec3 ribbon(float u, float v) {
    float radius = 2.0 + .18 * sin(u * 3.0 + .6);
    float width = .48 + .2 * sin(u + .8);
    float twist = u + .65;
    float r = radius + v * width * cos(twist);
    vec3 p = vec3(r * cos(u) * 1.14, r * sin(u) * .92, .48 * sin(u * 2.0) + v * width * sin(twist));
    p.x += .14 * sin(u * 2.0 + .2);
    p.y += .07 * sin(u * 4.0 + uTime * .35) * v;
    p.z += .065 * sin(u * 3.0 - uTime * .3) * v;
    return p;
  }
`;

export function createHeroScene(container, { compact = false, dark = false } = {}) {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-4, 4, 3.4, -3.4, .1, 40);
  camera.position.set(0, 0, 10);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !compact, powerPreference: 'low-power' });
  const geometries = new Set(), materials = new Set();
  let disposed = false;
  try {
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute('aria-hidden', 'true');
    container.appendChild(renderer.domElement);
    const group = new THREE.Group();
    scene.add(group);
    const uniforms = {
      uTime: { value: 0 }, uGather: { value: 0 }, uAction: { value: 0 },
      uPixel: { value: 1 }, uDark: { value: dark ? 1 : 0 },
      uJade: { value: new THREE.Color() }, uBright: { value: new THREE.Color() }, uGold: { value: new THREE.Color() },
    };
    const keepGeometry = g => { geometries.add(g); return g; };
    const keepMaterial = m => { materials.add(m); return m; };
    const geometry = keepGeometry(new THREE.BufferGeometry());
    const count = compact ? 6500 : 20000;
    const positions = new Float32Array(count * 3), seeds = new Float32Array(count * 3);
    let seed = 6157;
    const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    for (let i = 0; i < count; i++) {
      positions[i * 3] = random() * Math.PI * 2;
      positions[i * 3 + 1] = random() * 2 - 1;
      positions[i * 3 + 2] = random();
      seeds[i * 3] = random(); seeds[i * 3 + 1] = random(); seeds[i * 3 + 2] = random();
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 3));
    const particleMaterial = keepMaterial(new THREE.ShaderMaterial({
      uniforms, transparent: true, depthWrite: false,
      vertexShader: `${surface}
        attribute vec3 aSeed; uniform float uPixel;
        varying float vLight; varying float vGold; varying float vAlpha;
        void main() {
          float u = position.x + uTime * (.10 + aSeed.x * .012);
          vec3 p = ribbon(u, position.y);
          float loose = (1.0 - uGather) * (.15 + aSeed.y * .68);
          float dust = step(.89, position.z);
          float spread = loose + dust * (.18 + aSeed.z * .65);
          p += vec3(cos(u * 2.0 + aSeed.y * 6.28), sin(u * 3.0 + aSeed.x * 6.28), sin(u + aSeed.z * 6.28)) * spread;
          p.x += dust * uAction * .45 * sin(uTime * .12 + aSeed.y * 6.28);
          p.z += (aSeed.x - .5) * .055;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = uPixel * (1.0 + aSeed.z * 1.5 + step(.985, aSeed.x) * 1.6);
          vLight = .38 + .62 * pow(.5 + .5 * sin(u * 2.0 - uTime * .72), 3.0);
          vGold = step(.935, aSeed.y);
          vAlpha = (1.0 - dust * .48) * (.4 + .6 * aSeed.z);
        }`,
      fragmentShader: `
        uniform vec3 uJade; uniform vec3 uBright; uniform vec3 uGold; uniform float uDark;
        varying float vLight; varying float vGold; varying float vAlpha;
        void main() {
          float r = length(gl_PointCoord - .5) * 2.0;
          if (r > 1.0) discard;
          float alpha = (1.0 - smoothstep(.15, 1.0, r)) * vAlpha;
          vec3 color = mix(mix(uJade, uBright, vLight), uGold, vGold * .8);
          gl_FragColor = vec4(color, alpha * mix(.82, .6, uDark));
          #include <colorspace_fragment>
        }`,
    }));
    const cloud = new THREE.Points(geometry, particleMaterial);
    cloud.frustumCulled = false; cloud.renderOrder = 2;
    group.add(cloud);

    // The shared translucent surface preserves a graceful silhouette between the points.
    const ribbonGeometry = keepGeometry(new THREE.BufferGeometry());
    const vertices = [], indices = [], rows = compact ? 120 : 200, columns = 12;
    for (let i = 0; i <= rows; i++) for (let j = 0; j <= columns; j++) vertices.push(i / rows * Math.PI * 2, j / columns * 2 - 1, 0);
    for (let i = 0; i < rows; i++) for (let j = 0; j < columns; j++) {
      const k = i * (columns + 1) + j;
      indices.push(k, k + 1, k + columns + 1, k + 1, k + columns + 2, k + columns + 1);
    }
    ribbonGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    ribbonGeometry.setIndex(indices);
    const silkMaterial = keepMaterial(new THREE.ShaderMaterial({
      uniforms, transparent: true, depthWrite: false, side: THREE.DoubleSide,
      vertexShader: `${surface}
        varying float vBand; varying float vAngle;
        void main() {
          float u = position.x + uTime * .105;
          vBand = position.y; vAngle = u;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(ribbon(u, position.y), 1.0);
        }`,
      fragmentShader: `
        uniform vec3 uJade; uniform vec3 uBright; uniform float uDark; uniform float uGather;
        varying float vBand; varying float vAngle;
        void main() {
          float edge = pow(abs(vBand), 9.0);
          float silk = pow(.5 + .5 * sin(vAngle * 2.0 - vBand * 1.6), 3.0);
          vec3 color = mix(uJade * .65, uBright, silk * .55 + edge * .35);
          float alpha = (.075 + .22 * silk + .35 * edge) * (.5 + .5 * uGather);
          gl_FragColor = vec4(color, alpha * mix(.85, 1.0, uDark));
          #include <colorspace_fragment>
        }`,
    }));
    const silk = new THREE.Mesh(ribbonGeometry, silkMaterial);
    silk.frustumCulled = false; silk.renderOrder = 1; group.add(silk);
    const orbitMaterials = [];
    for (let band = 0; band < 6; band++) {
      const points = [];
      for (let i = 0; i <= 180; i++) {
        const a = i / 180 * Math.PI * 2, r = 2.5 + band * .075;
        points.push(new THREE.Vector3(Math.cos(a) * r * 1.12, Math.sin(a) * r * .78, Math.sin(a * 2 + band * .15) * .52));
      }
      const g = keepGeometry(new THREE.BufferGeometry().setFromPoints(points));
      const m = keepMaterial(new THREE.LineBasicMaterial({ transparent: true, opacity: .075, depthWrite: false }));
      orbitMaterials.push(m);
      const line = new THREE.Line(g, m); line.rotation.z = band * .018; group.add(line);
    }
    function setTheme(value) {
      uniforms.uDark.value = value ? 1 : 0;
      uniforms.uJade.value.set(value ? '#21a78f' : '#075e52');
      uniforms.uBright.value.set(value ? '#8fe7c6' : '#42ab8b');
      uniforms.uGold.value.set(value ? '#f5d8a0' : '#a17a40');
      particleMaterial.blending = value ? THREE.AdditiveBlending : THREE.NormalBlending;
      particleMaterial.needsUpdate = true;
      orbitMaterials.forEach(m => { m.color.set(value ? '#75c5a6' : '#408973'); m.opacity = value ? .12 : .1; });
    }
    function resize() {
      const width = container.clientWidth, height = container.clientHeight;
      if (!width || !height) return;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, compact ? 1.25 : 1.7);
      renderer.setPixelRatio(pixelRatio); uniforms.uPixel.value = pixelRatio;
      const aspect = width / height;
      const d = Math.max(compact ? 2.7 : 3.05, (compact ? 3.15 : 3.55) / aspect);
      camera.left = -d * aspect; camera.right = d * aspect; camera.top = d; camera.bottom = -d;
      camera.updateProjectionMatrix(); renderer.setSize(width, height);
    }
    function render(time, pointer = { x: 0, y: 0 }, scroll = 0, narrative = getHeroTimeline(time)) {
      uniforms.uTime.value = time;
      uniforms.uGather.value = narrative.gather;
      uniforms.uAction.value = narrative.action;
      group.rotation.set(.32 + Math.sin(time * .12) * .07 + pointer.y * .2, -.34 + Math.sin(time * .1) * .12 + pointer.x * .26, -.34 + Math.sin(time * .085) * .055);
      group.position.y = Math.sin(time * .3) * .045 - scroll * .16;
      renderer.render(scene, camera);
    }
    function dispose() { release(); }
    setTheme(dark); resize();
    return { canvas: renderer.domElement, resize, render, setTheme, dispose };
  } catch (error) { release(); throw error; }
  function release() {
    if (disposed) return;
    disposed = true;
    geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose());
    renderer.dispose(); renderer.domElement.remove();
  }
}
