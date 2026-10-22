// Geometry from the approved LAN Cloud AI visual concept V2.
// This module has no DOM or WebGL dependency; it also supplies the static fallback.
export const SCENE_IDS = Object.freeze(['home', 'solutions', 'practice', 'academy', 'mvp', 'fde', 'ledger', 'contact', 'sitemap', '404']);
export const UTILITY_SCENES = Object.freeze(['contact', 'sitemap', '404']);
const TAU = Math.PI * 2;
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const plus = (a, b) => a.map((v, i) => v + b[i]);
function random(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function sphere(rng, radius = 1) { const y = rng() * 2 - 1, a = rng() * TAU, s = Math.sqrt(1 - y * y); return [Math.cos(a) * s * radius, y * radius, Math.sin(a) * s * radius]; }
function jitter(rng, radius) { return sphere(rng, radius * Math.pow(rng(), .4)); }
function segment(a, b, rng, fuzz = .025) { return plus(mix(a, b, rng()), jitter(rng, fuzz)); }
function circle(cx, cy, cz, radius, squash = 1, tilt = 0) { const points = []; for (let i = 0; i <= 100; i++) { const a = i / 100 * TAU; points.push([cx + Math.cos(a) * radius, cy + Math.sin(a) * radius * squash, cz + Math.sin(a) * radius * tilt]); } return points; }
function shape(id) {
  const edges = [], nodes = [];
  const connect = (a, b) => edges.push([a, b]);
  const path = (p) => p.slice(1).forEach((v, i) => connect(p[i], v));
  if (id === 'home') {
    for (let axis = 0; axis < 3; axis++) for (let a = -1; a <= 1; a += .5) for (let b = -1; b <= 1; b += .5) { const p = [a, b, -1], q = [a, b, 1]; if (axis === 0) { [p[0], p[2]] = [p[2], p[0]]; [q[0], q[2]] = [q[2], q[0]]; } if (axis === 1) { [p[1], p[2]] = [p[2], p[1]]; [q[1], q[2]] = [q[2], q[1]]; } connect(p, q); }
    for (let j = 0; j < 6; j++) { const a = j / 6 * TAU; const p = [2.1 * Math.cos(a), 1.55 * Math.sin(a), .65 * Math.sin(a * 2)]; nodes.push(p); connect([0, 0, 0], p); }
    path(circle(0, 0, 0, 2.15, .72, .4));
    return { edges, sample(i, n, rng) { const a = rng() * TAU; if (i % 10 < 6) { const p = segment(...edges[Math.floor(rng() * 75)], rng, .035); return { to: p, gather: p.map(v => v * .8), phase: i % 3 }; } const node = nodes[i % 6], p = plus(node, jitter(rng, .24)); return { to: p, gather: sphere(rng, .7), phase: i % 3 }; } };
  }
  if (id === 'solutions') {
    const centers = [[-1.8, -.35, .15], [0, .5, -.2], [1.8, -.35, .1]];
    centers.forEach((c, k) => { path(circle(...c, .82, .65, k === 1 ? .75 : -.6)); path(circle(...c, .62, 1, .25)); });
    return { edges, sample(i, n, rng) { const k = i % 3, c = centers[k], a = rng() * TAU, b = rng() * TAU, r = .73 + .12 * Math.cos(b); const p = plus(c, [r * Math.cos(a), r * Math.sin(a) * .73 + .11 * Math.sin(b), r * Math.sin(a) * (k === 1 ? .8 : -.5)]); return { to: i % 7 === 0 ? plus(c, jitter(rng, .24)) : p, gather: plus(c.map(v => v * .65), jitter(rng, .35)), phase: k }; } };
  }
  if (id === 'practice') {
    const corners = [[0, 1.9, 0], [0, -1.9, 0], [2.05, 0, 0], [-2.05, 0, 0], [0, 0, 1.7], [0, 0, -1.7]];
    for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) if (!(i % 2 === 0 && j === i + 1)) connect(corners[i], corners[j]);
    for (let s = .5; s < 1; s += .25) edges.slice(0, 12).forEach(([a, b]) => connect(a.map(v => v * s), b.map(v => v * s)));
    return { edges, sample(i, n, rng) { let p = sphere(rng); const m = Math.abs(p[0]) + Math.abs(p[1]) + Math.abs(p[2]); p = p.map((v, j) => v / m * (j === 2 ? 1.7 : 2.05)); if (i % 5 === 0) p = p.map(v => v * (.5 + .4 * rng())); return { to: p, gather: p.map(v => v * .56), phase: i % 4 }; } };
  }
  if (id === 'academy') {
    const branch = (from, angle, length, depth, z) => { const to = [from[0] + Math.sin(angle) * length, from[1] + Math.cos(angle) * length, z]; connect(from, to); if (depth > 0) { branch(to, angle - .61, length * .69, depth - 1, z + .2); branch(to, angle + .61, length * .69, depth - 1, z - .24); } else nodes.push(to); };
    branch([0, -1.65, 0], 0, 1.25, 4, 0);
    return { edges, sample(i, n, rng) { const leaf = i % 5 === 0, idx = Math.floor(rng() * (leaf ? nodes.length : edges.length)); const p = leaf ? plus(nodes[idx], jitter(rng, .17)) : segment(...edges[idx], rng, .06); return { to: p, gather: plus([0, -1.2, 0], jitter(rng, .42)), phase: Math.min(3, Math.floor((p[1] + 1.6) / .8)) }; } };
  }
  if (id === 'mvp') {
    const gates = [];
    for (let k = 0; k < 3; k++) { const x = (k - 1) * 1.72, z = (k - 1) * -.55, p = [[x - .59, -1.3, z], [x - .59, 1.3, z], [x + .59, 1.3, z], [x + .59, -1.3, z]]; const e = [[p[0], p[1]], [p[1], p[2]], [p[2], p[3]], [p[3], p[0]]]; gates.push(e); e.forEach(e => connect(...e)); p.forEach(v => connect(v, plus(v, [0, 0, -.2]))); path(circle(x, 0, z, .31, 1, 0)); }
    return { edges, sample(i, n, rng) { const k = i % 3, e = gates[k], p = segment(...e[Math.floor(rng() * 4)], rng, .09); return { to: p, gather: plus([(k - 1) * 1.2, -1.3, (k - 1) * -.3], jitter(rng, .28)), phase: k }; } };
  }
  if (id === 'fde') {
    const counts = [4, 10, 7], layers = [];
    counts.forEach((count, k) => { const ring = []; for (let j = 0; j < count; j++) { const a = j / count * TAU; const p = [1.7 * Math.cos(a), (k - 1) * 1.3 + Math.sin(a) * .26, Math.sin(a) * .95]; nodes.push(p); ring.push(p); } layers.push(ring); ring.forEach((p, j) => connect(p, ring[(j + 1) % count])); });
    layers.slice(0, 2).forEach((ring, k) => ring.forEach((p, j) => connect(p, layers[k + 1][Math.floor(j / ring.length * layers[k + 1].length)])));
    return { edges, mainNodes: counts, sample(i, n, rng) { const k = i % 3, ring = layers[k], p = i % 5 === 0 ? segment(...edges[Math.floor(rng() * edges.length)], rng, .018) : plus(ring[Math.floor(rng() * ring.length)], jitter(rng, .14)); return { to: p, gather: plus([0, (k - 1) * .55, 0], jitter(rng, .4)), phase: k }; } };
  }
  if (id === 'ledger') {
    path(circle(0, 0, 0, 2, .66, .48)); path(circle(0, 0, 0, 1.78, .66, .48));
    const receipts = [];
    for (let j = 0; j < 10; j++) { const a = j / 10 * TAU, c = [2.02 * Math.cos(a), 1.35 * Math.sin(a), .97 * Math.sin(a)]; const p = [[c[0] - .14, c[1] - .22, c[2]], [c[0] - .14, c[1] + .22, c[2]], [c[0] + .14, c[1] + .22, c[2]], [c[0] + .14, c[1] - .22, c[2]]]; receipts.push(p); path([...p, p[0]]); }
    return { edges, sample(i, n, rng) { const a = rng() * TAU, r = 1.84 + rng() * .2; let p = [r * Math.cos(a), r * Math.sin(a) * .66, r * Math.sin(a) * .48]; if (i % 3 === 0) { const rect = receipts[i % 10]; p = mix(mix(rect[0], rect[1], rng()), mix(rect[3], rect[2], rng()), rng()); } return { to: plus(p, jitter(rng, .028)), gather: [rng() * 1.1 - .55, (i % 5 - 2) * .12, rng() * .7 - .35], phase: i % 3 }; } };
  }
  if (id === 'contact') {
    for (let k = 0; k < 3; k++) { const p = []; for (let j = 0; j <= 60; j++) { const t = j / 60; p.push([-1.65 + t * 3.3, Math.sin(t * Math.PI) * (.4 + k * .15), Math.sin(t * Math.PI) * (k - 1) * .3]); } path(p); }
    path(circle(-1.65, 0, 0, .43, 1, 0)); path(circle(1.65, 0, 0, .43, 1, 0));
    return { edges, sample(i, n, rng) { const side = i % 2 ? 1 : -1, p = i % 4 ? plus([side * 1.65, 0, 0], sphere(rng, .32 + rng() * .14)) : segment(...edges[Math.floor(rng() * 180)], rng, .025); return { to: p, gather: plus([side * 1.65, 0, 0], jitter(rng, .27)), phase: 0 }; } };
  }
  if (id === 'sitemap') {
    nodes.push([0, 0, 0]); for (let j = 0; j < 4; j++) { const a = j / 4 * TAU + Math.PI / 4, p = [1.3 * Math.cos(a), .93 * Math.sin(a), .2 * Math.sin(a)]; nodes.push(p); connect(nodes[0], p); for (let k = 0; k < 3; k++) { const b = a + (k - 1) * .33, q = [2.25 * Math.cos(b), 1.5 * Math.sin(b), (k - 1) * .25]; nodes.push(q); connect(p, q); } }
    return { edges, sample(i, n, rng) { const p = i % 4 === 0 ? segment(...edges[Math.floor(rng() * edges.length)], rng, .02) : plus(nodes[Math.floor(rng() * nodes.length)], jitter(rng, .11)); return { to: p, gather: jitter(rng, .55), phase: i % 3 }; } };
  }
  path(circle(0, 0, 0, 1.9, .65, .35)); path(circle(0, 0, 0, 2, .65, .35));
  return { edges, sample(i, n, rng) { const a = rng() * TAU, r = 1.9 + rng() * .08; const p = i % 6 === 0 ? plus([1.9, 0, 0], sphere(rng, .25)) : [r * Math.cos(a), r * Math.sin(a) * .65, r * Math.sin(a) * .35]; return { to: p, gather: i % 6 === 0 ? plus([2.5, .9, 0], jitter(rng, .22)) : p, phase: 0 }; } };
}

export function buildHeroShape(id, count = 15000) {
  const COUNT = Math.max(1, Math.min(15000, Math.floor(count)));
  const spec = shape(id), rng = random(41 + SCENE_IDS.indexOf(id) * 137);
  const from = new Float32Array(COUNT * 3), gather = new Float32Array(COUNT * 3), to = new Float32Array(COUNT * 3), meta = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    const target = spec.sample(i, COUNT, rng), spread = sphere(rng, 2.6 + rng() * 4.2);
    // The opening keeps a recognizable nucleus while the outer field rushes inward.
    const start = i % 5 === 0 ? plus(target.to, jitter(rng, .32)) : [spread[0], spread[1] * .58, spread[2] * .5];
    from.set(start, i * 3); gather.set(target.gather, i * 3); to.set(target.to, i * 3);
    meta.set([.8 + Math.pow(rng(), 5) * 3.3, target.phase, rng()], i * 3);
  }
  return { from, gather, to, meta, edges: spec.edges, mainNodes: spec.mainNodes };
}

