# Lighting & Textures

## Light Types

```js
// AmbientLight — uniform, shadowless fill
const ambient = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambient);

// DirectionalLight — parallel rays (sun), supports shadows
const dir = new THREE.DirectionalLight(0xffffff, 1.0);
dir.position.set(5, 10, 5);
dir.castShadow = true;
dir.shadow.mapSize.set(2048, 2048);        // higher = sharper shadows
dir.shadow.camera.near = 0.1;
dir.shadow.camera.far  = 100;
dir.shadow.camera.left = dir.shadow.camera.bottom = -20;
dir.shadow.camera.right = dir.shadow.camera.top   =  20;
dir.shadow.bias = -0.001;                  // fixes shadow acne
dir.shadow.normalBias = 0.05;             // for thin geometry
scene.add(dir, dir.target);               // target is an Object3D

// PointLight — omnidirectional bulb
const point = new THREE.PointLight(
  0xff8800,  // color
  2,         // intensity
  20,        // distance (0 = infinite)
  2          // decay (physically correct = 2)
);
point.castShadow = true;

// SpotLight — cone of light
const spot = new THREE.SpotLight(
  0xffffff,       // color
  1,              // intensity
  30,             // distance
  Math.PI / 6,    // angle (cone half-angle)
  0.2,            // penumbra (soft edge, 0..1)
  2               // decay
);
spot.castShadow = true;
spot.shadow.mapSize.set(1024, 1024);
scene.add(spot, spot.target);

// HemisphereLight — sky/ground gradient, no shadow
const hemi = new THREE.HemisphereLight(
  0x87ceeb,  // sky color
  0x8b7355,  // ground color
  0.6        // intensity
);
scene.add(hemi);

// RectAreaLight — rectangular emitter (no shadow, studio/window)
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { RectAreaLightHelper }      from 'three/addons/helpers/RectAreaLightHelper.js';
RectAreaLightUniformsLib.init();          // call once at startup
const rect = new THREE.RectAreaLight(0xffffff, 5, 4, 4);
rect.position.set(0, 3, 3);
rect.lookAt(0, 0, 0);
scene.add(rect, new RectAreaLightHelper(rect));
```

## Shadows Setup Checklist

```js
// 1. Enable on renderer (done in boilerplate)
renderer.shadowMap.enabled = true;
renderer.shadowMap.type    = THREE.PCFSoftShadowMap;

// 2. Enable on light
dirLight.castShadow = true;

// 3. Enable on each mesh
mesh.castShadow    = true;
mesh.receiveShadow = true;

// 4. Size the shadow camera frustum tight around the scene
// (too large = blurry shadows)
```

## IBL / HDRI Environment Lighting

```js
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

const pmrem = new THREE.PMREMGenerator(renderer);
pmrem.compileEquirectangularShader(); // warm up shader

new RGBELoader().load('env.hdr', (hdr) => {
  const envMap = pmrem.fromEquirectangular(hdr).texture;
  scene.environment = envMap;  // PBR materials sample this automatically
  scene.background  = envMap;  // optional: show as sky
  hdr.dispose();
  pmrem.dispose();
});
```

---

## Texture Loading

```js
const tl  = new THREE.TextureLoader();
const tex = tl.load(
  'diffuse.jpg',
  (t)   => console.log('loaded', t),
  (xhr) => console.log(xhr.loaded / xhr.total * 100 + '%'),
  (err) => console.error(err)
);
```

## Texture Configuration

```js
// Color space — CRITICAL
tex.colorSpace = THREE.SRGBColorSpace;        // albedo, emissive
// tex.colorSpace = THREE.LinearSRGBColorSpace; // normals, roughness, metalness, ao

// Wrapping
tex.wrapS = tex.wrapT = THREE.RepeatWrapping; // ClampToEdgeWrapping | MirroredRepeatWrapping
tex.repeat.set(4, 4);
tex.offset.set(0, 0);

// Filtering
tex.generateMipmaps = true;                   // default true
tex.minFilter       = THREE.LinearMipmapLinearFilter;
tex.magFilter       = THREE.LinearFilter;
tex.anisotropy      = renderer.capabilities.getMaxAnisotropy(); // up to 16x
```

## PBR Texture Map Reference

| Material property | colorSpace | Description |
|---|---|---|
| `map` | `SRGBColorSpace` | Albedo / diffuse colour |
| `normalMap` | `LinearSRGBColorSpace` | Tangent-space normals (RGB) |
| `roughnessMap` | `LinearSRGBColorSpace` | Roughness channel (G) |
| `metalnessMap` | `LinearSRGBColorSpace` | Metalness channel (B) |
| `aoMap` | `LinearSRGBColorSpace` | Ambient occlusion (R) |
| `emissiveMap` | `SRGBColorSpace` | Self-illumination |
| `alphaMap` | `LinearSRGBColorSpace` | Alpha / cutout (R) |
| `displacementMap` | `LinearSRGBColorSpace` | Vertex offset — needs segments |
| `envMap` | `SRGBColorSpace` | Manual environment reflection |

> **Note**: `aoMap` requires a second UV set — `geo.setAttribute('uv2', geo.attributes.uv)` (r140 and below), or `geo.setAttribute('uv1', ...)` in r152+.

## Canvas Texture (Dynamic / Text)

```js
const canvas = document.createElement('canvas');
canvas.width  = 512;
canvas.height = 256;
const ctx = canvas.getContext('2d');

ctx.fillStyle = '#000';
ctx.fillRect(0, 0, 512, 256);
ctx.fillStyle = '#fff';
ctx.font      = 'bold 64px sans-serif';
ctx.textAlign = 'center';
ctx.fillText('Hello 3D', 256, 150);

const canvasTex = new THREE.CanvasTexture(canvas);
// Update after drawing: canvasTex.needsUpdate = true;
```

## Video Texture

```js
const video  = document.createElement('video');
video.src    = 'clip.mp4';
video.loop   = video.muted = true;
video.play();
const vidTex = new THREE.VideoTexture(video);
vidTex.colorSpace = THREE.SRGBColorSpace;
mat.map = vidTex;
// VideoTexture auto-updates each frame — no needsUpdate needed
```

## Render Target (off-screen rendering)

```js
const rt = new THREE.WebGLRenderTarget(512, 512, {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  format:    THREE.RGBAFormat,
  type:      THREE.HalfFloatType, // HDR-capable
});

// Render a secondary scene to the target:
renderer.setRenderTarget(rt);
renderer.render(secondaryScene, secondaryCamera);
renderer.setRenderTarget(null); // restore default

// Use rt.texture as any regular texture on a material
screenMesh.material.map = rt.texture;
```
