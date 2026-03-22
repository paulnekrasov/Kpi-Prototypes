---
name: threejs-3d-web-experience
description: >
  Ultimate Three.js + immersive 3D web experience skill. Use this skill for ANY
  request involving Three.js or 3D on the web — scenes, animations, shaders,
  particles, GLTF models, post-processing, scroll-driven experiences, interactive
  3D UIs, procedural geometry, or full immersive 3D web apps. Trigger keywords:
  "three.js", "3D scene", "WebGL", "GLSL", "shader", "3D animation", "particle
  system", "GLTF", "GLB", "3D background", "immersive web", "3D portfolio",
  "3D hero section", "scroll animation 3D", "anti-gravity effect", "floating 3D
  objects", "3D landing page", "WebGL effect", "three fiber", "R3F". Always
  consult this skill before writing any Three.js code — even for simple requests.
---

# Three.js & 3D Web Experience

Merged from `cloudai-x/threejs-skills` (10 modules) + `sickn33/antigravity-awesome-skills` (3d-web-experience).

---

## Workflow: What to Do First

1. **Read the relevant reference files** based on what the user is building (table below)
2. **Use the correct CDN pattern** for the environment (vanilla vs. Claude artifact vs. React)
3. **Start from the canonical boilerplate**, never from scratch
4. **Layer in features** one reference file at a time

### Which Reference Files to Load

| User asks for… | Load these references |
|---|---|
| Basic scene / "just show something 3D" | `fundamentals.md` |
| Custom shapes, procedural geometry | `geometry-materials.md` |
| Lighting, shadows, PBR textures | `lighting-textures.md` |
| Loading `.glb` / `.gltf` models, animations | `animation-loaders.md` |
| Custom shaders, GLSL, visual effects | `shaders-postprocessing.md` |
| Click, hover, drag, camera controls | `interaction-controls.md` |
| Scroll-driven, particles, floating, parallax, landing page | `3d-web-experience.md` |
| Performance issues, memory leaks, weird bugs | `performance-pitfalls.md` |
| **Full immersive experience** | Load **all** references |

---

## CDN Patterns by Environment

### Vanilla HTML (r160 — production default)
```html
<script type="importmap">
{ "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"
}}
</script>
<script type="module">
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
</script>
```

### Claude Artifact / CodePen (r128 — Cloudflare CDN)
```html
<!-- r128 is the version available on cdnjs.cloudflare.com -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script type="module">
import { OrbitControls } from 'https://unpkg.com/three@0.128.0/examples/jsm/controls/OrbitControls.js';
</script>
```
> ⚠️ On r128: **never use `THREE.CapsuleGeometry`** (added r142). Use CylinderGeometry + SphereGeometry instead.

### React Three Fiber
```bash
npm install three @react-three/fiber @react-three/drei
```
→ See `references/interaction-controls.md` for R3F patterns.

---

## Canonical Boilerplate

Every Three.js project starts here. Adapt as needed.

```js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- Core ---
const scene    = new THREE.Scene();
const camera   = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); // never above 2
renderer.shadowMap.enabled   = true;
renderer.shadowMap.type      = THREE.PCFSoftShadowMap;
renderer.toneMapping         = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace    = THREE.SRGBColorSpace; // r152+ (was outputEncoding)
document.body.appendChild(renderer.domElement);

camera.position.set(0, 1.5, 5);

// --- Controls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// --- Resize ---
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
});

// --- Loop ---
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta   = clock.getDelta();       // use for mixer.update(delta)
  const elapsed = clock.getElapsedTime(); // use for uniforms.uTime.value
  controls.update();
  renderer.render(scene, camera);
}
animate();
```

---

## Non-Negotiable Rules

These apply to every Three.js project, no exceptions:

1. **Always cap pixel ratio** at 2: `Math.min(devicePixelRatio, 2)`
2. **Always use `outputColorSpace = THREE.SRGBColorSpace`** — `outputEncoding` is deprecated since r152
3. **Always dispose** geometry, materials and textures when removing objects
4. **Always call `controls.update()`** inside the animation loop when `enableDamping = true`
5. **Always set `colorSpace = THREE.SRGBColorSpace`** on albedo/emissive textures; leave linear for normal/roughness/metalness maps
6. **Always set `castShadow` and `receiveShadow`** on both the light AND the mesh
7. **Never render above the compositing layer** — use `renderer.domElement` z-index for overlay UIs
8. **Check `needsUpdate = true`** after modifying geometry attributes or material uniforms live

---

## Quick Decisions

**Which material?**
- No lighting needed → `MeshBasicMaterial`
- Default lit scene → `MeshStandardMaterial` (PBR)
- Glass / liquid / iridescent → `MeshPhysicalMaterial`
- Custom effect / animated → `ShaderMaterial`
- Particles → `PointsMaterial`

**Which camera?**
- Most scenes → `PerspectiveCamera(75, aspect, 0.1, 1000)`
- 2D / isometric / UI → `OrthographicCamera`

**Which light setup?**
- Fast start → `AmbientLight(0xffffff, 0.5)` + `DirectionalLight(0xffffff, 1)`
- Realistic PBR → `RGBELoader` HDRI as `scene.environment`
- Moody/dramatic → `PointLight` + `HemisphereLight` with no ambient

---

## Reference Files

> Read these when working in the relevant domain. Each is self-contained.

| File | Contents |
|---|---|
| [`references/fundamentals.md`](references/fundamentals.md) | Scene, camera types, Object3D hierarchy, coordinate system, helpers |
| [`references/geometry-materials.md`](references/geometry-materials.md) | All built-in geometries, BufferGeometry, instancing, all material types |
| [`references/lighting-textures.md`](references/lighting-textures.md) | All light types, shadows, IBL/HDRI, texture loading, PBR maps, render targets |
| [`references/animation-loaders.md`](references/animation-loaders.md) | AnimationMixer, keyframe tracks, morph targets, GLTF/Draco/KTX2 loading |
| [`references/shaders-postprocessing.md`](references/shaders-postprocessing.md) | ShaderMaterial, GLSL patterns, noise, EffectComposer, bloom, custom passes |
| [`references/interaction-controls.md`](references/interaction-controls.md) | Raycasting, OrbitControls, DragControls, R3F quick reference |
| [`references/3d-web-experience.md`](references/3d-web-experience.md) | Scroll-driven animation, particles, anti-gravity floating, mouse parallax, immersive backgrounds |
| [`references/performance-pitfalls.md`](references/performance-pitfalls.md) | Optimization checklist, dispose patterns, LOD, common bugs table |
