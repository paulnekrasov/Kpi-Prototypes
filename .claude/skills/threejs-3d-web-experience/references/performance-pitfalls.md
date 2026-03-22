# Performance & Pitfalls

## Performance Checklist

### Renderer
```js
renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); // NEVER above 2
// For mobile: adaptive quality
const dpr = Math.min(devicePixelRatio, window.navigator.hardwareConcurrency > 4 ? 2 : 1);
```

### Geometry
```js
// Merge static meshes into one draw call
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
const merged = mergeGeometries([geo1, geo2, geo3]);

// Use InstancedMesh for repeated objects (100+)
// (See geometry-materials.md)

// Ensure bounding volumes exist (enables frustum culling)
geo.computeBoundingSphere();
geo.computeBoundingBox();
```

### LOD (Level of Detail)
```js
const lod = new THREE.LOD();
lod.addLevel(highDetailMesh, 0);    // used when distance < 10
lod.addLevel(midDetailMesh,  10);
lod.addLevel(lowDetailMesh,  30);
lod.addLevel(imposterMesh,   60);
scene.add(lod);

// MUST update in loop:
lod.update(camera);
```

### Textures
```js
// Use power-of-2 dimensions (256, 512, 1024, 2048) for mipmaps
// Cap at 2048×2048 for mobile

// Disable unnecessary mipmaps on UI textures
tex.generateMipmaps = false;
tex.minFilter       = THREE.LinearFilter;

// Use compressed textures in production (KTX2/Basis):
// ktx2Loader.load('texture.ktx2', ...)

// Share textures between materials
const sharedTex = tl.load('diffuse.jpg');
mat1.map = sharedTex;
mat2.map = sharedTex; // same GPU texture, no duplicate
```

### Draw Call Reduction
- 1 material + 1 geometry = 1 draw call
- Merge static geometry (see above)
- Use `InstancedMesh` for identical objects
- Avoid per-frame `scene.add()` / `scene.remove()`
- Use object pooling for spawned/destroyed objects

---

## Proper Disposal (Memory Leak Prevention)

```js
function disposeObject(obj) {
  obj.traverse(child => {
    // Geometry
    if (child.geometry) child.geometry.dispose();

    // Material(s)
    const materials = Array.isArray(child.material)
      ? child.material : [child.material];

    materials.forEach(mat => {
      if (!mat) return;
      // Dispose all textures
      ['map','normalMap','roughnessMap','metalnessMap','aoMap',
       'emissiveMap','alphaMap','envMap','lightMap'].forEach(key => {
        mat[key]?.dispose();
      });
      mat.dispose();
    });
  });
  obj.parent?.remove(obj);
}

// Render targets
rt.dispose();

// Textures
tex.dispose();

// Geometries
geo.dispose();
```

---

## Common Bugs Reference

| Symptom | Likely Cause | Fix |
|---|---|---|
| Black screen, no scene | No light + non-Basic material | Add `AmbientLight` or use `MeshBasicMaterial` |
| Texture appears washed out | Wrong colorSpace | Set `tex.colorSpace = THREE.SRGBColorSpace` for albedo |
| Texture appears too dark | Missing colorSpace | Same as above |
| No shadows appearing | castShadow/receiveShadow missing | Set on both light AND mesh |
| Shadow acne (striped shadows) | Shadow bias too high | Set `light.shadow.bias = -0.001` |
| Z-fighting (flickering surfaces) | Two coplanar surfaces | Add `polygonOffset: true, polygonOffsetFactor: 1` |
| Memory grows each frame | Forgetting dispose() | Call `geo.dispose(); mat.dispose(); tex.dispose()` |
| Controls drift / no damping | Missing `controls.update()` | Call every frame in animate loop |
| CORS error loading texture | file:// protocol | Use local dev server: `npx serve .` |
| `outputEncoding` deprecated warning | Pre-r152 code | Replace with `outputColorSpace = THREE.SRGBColorSpace` |
| `geometry.faces` undefined | Pre-r125 code | Use `BufferGeometry` — `Geometry` was removed |
| Bloom washes out entire scene | Threshold too low | Increase `bloomPass.threshold` or use selective bloom |
| Particles have square edges | No alphaMap | Use circular sprite texture (see 3d-web-experience.md) |
| Transparent objects sort wrong | depthWrite: true | Set `mat.depthWrite = false` for transparent/particle mats |
| CapsuleGeometry not found | Using r128 or earlier | Use `CylinderGeometry + SphereGeometry` instead |
| `THREE.CylinderBufferGeometry` gone | Pre-r125 code | Use `THREE.CylinderGeometry` (Buffer suffix removed) |
| Post-processing changes colours | Missing OutputPass | Add `new OutputPass()` as the last pass |
| InstancedMesh not updating | Forgot needsUpdate | Set `iMesh.instanceMatrix.needsUpdate = true` |
| Raycaster hits invisible object | `obj.visible = false` ignored | Filter hits: `hits.filter(h => h.object.visible)` |
| Camera goes underground | maxPolarAngle not set | `orbit.maxPolarAngle = Math.PI / 2` |

---

## Anti-Aliasing Strategy

| Scenario | Best Approach |
|---|---|
| No post-processing, desktop | `antialias: true` in WebGLRenderer |
| With EffectComposer | SMAAPass (before OutputPass) |
| High DPR screen (retina) | DPR ≥ 2 makes AA nearly unnecessary |
| Mobile / performance budget | FXAA (cheaper than SMAA) |
| Transparent geometry | `alphaTest = 0.5` avoids sorting artifacts |

---

## Mobile Performance Budget

```js
const isMobile = /Mobi|Android/i.test(navigator.userAgent);

if (isMobile) {
  renderer.setPixelRatio(1);           // force 1x on mobile
  shadowMapSize = 512;                  // smaller shadow map
  bloom.strength = 0;                   // skip bloom
  particleCount = 500;                  // fewer particles
}
```

---

## requestAnimationFrame Best Practices

```js
let animId;

function animate() {
  animId = requestAnimationFrame(animate);
  // ...
}
animate();

// Pause when tab is hidden (saves battery)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    cancelAnimationFrame(animId);
  } else {
    animate();
  }
});
```
