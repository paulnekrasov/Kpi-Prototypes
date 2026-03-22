# Three.js Fundamentals

## Scene Graph

```js
const scene = new THREE.Scene();
scene.background  = new THREE.Color(0x111111);  // or CubeTexture / null
scene.environment = envMap;                      // IBL for all PBR materials
scene.fog         = new THREE.FogExp2(0x000010, 0.035); // exponential
// scene.fog      = new THREE.Fog(color, near, far);    // linear
```

## Camera Types

```js
// PerspectiveCamera — almost always the right choice
const cam = new THREE.PerspectiveCamera(
  75,               // fov (vertical, degrees)
  innerWidth / innerHeight, // aspect ratio
  0.1,              // near clipping plane
  1000              // far clipping plane
);

// OrthographicCamera — 2D, isometric, UI overlays
const half = 5;
const oCam = new THREE.OrthographicCamera(
  -half * aspect, half * aspect,  // left, right
  half, -half,                    // top, bottom
  0.1, 1000
);
// Update on resize:
oCam.left = -half * aspect; oCam.right = half * aspect;
oCam.updateProjectionMatrix();
```

## Object3D Hierarchy

```js
const group = new THREE.Group();
group.add(child1, child2);
scene.add(group);

// Transforms (always in local space)
obj.position.set(x, y, z);
obj.rotation.set(x, y, z);          // Euler, default order 'XYZ'
obj.rotation.order = 'YXZ';         // use for FPS-style camera
obj.quaternion.setFromEuler(euler);  // preferred for smooth interpolation
obj.scale.set(sx, sy, sz);
obj.scale.setScalar(2);             // uniform scale

// Visibility & layers
obj.visible = false;
obj.layers.enable(1);               // for selective rendering / bloom

// World-space helpers
obj.getWorldPosition(new THREE.Vector3());
obj.getWorldQuaternion(new THREE.Quaternion());
obj.getWorldScale(new THREE.Vector3());

// Traverse
group.traverse(child => {
  if (child.isMesh) child.castShadow = true;
});

// Remove and dispose
parent.remove(child);
child.geometry.dispose();
child.material.dispose();
```

## Coordinate System

- **Right-handed**: +X right, +Y up, +Z toward camera
- `scene.add(new THREE.AxesHelper(5))` — shows X(red) Y(green) Z(blue)

## Common Helpers

```js
scene.add(new THREE.AxesHelper(5));            // world axes
scene.add(new THREE.GridHelper(20, 20));        // ground grid
scene.add(new THREE.CameraHelper(light.shadow.camera)); // shadow frustum
scene.add(new THREE.DirectionalLightHelper(dirLight, 1));
scene.add(new THREE.PointLightHelper(pointLight, 0.5));
scene.add(new THREE.BoxHelper(mesh, 0xffff00)); // bounding box
scene.add(new THREE.ArrowHelper(dir, origin, length, color));

// Stats (FPS counter)
import Stats from 'three/addons/libs/stats.module.js';
const stats = new Stats(); document.body.appendChild(stats.dom);
// in animate loop: stats.update();

// GUI
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
const gui = new GUI();
gui.add(mesh.position, 'x', -5, 5).name('X');
gui.addColor(mat, 'color');
gui.add(mat, 'wireframe');
```

## MathUtils Quick Reference

```js
THREE.MathUtils.degToRad(deg)
THREE.MathUtils.radToDeg(rad)
THREE.MathUtils.lerp(x, y, t)
THREE.MathUtils.clamp(val, min, max)
THREE.MathUtils.mapLinear(x, a1, a2, b1, b2)
THREE.MathUtils.smoothstep(x, min, max)
THREE.MathUtils.randFloat(min, max)
THREE.MathUtils.randInt(min, max)
THREE.MathUtils.generateUUID()
```

## Vector3 / Vector2 Key Methods

```js
v.set(x, y, z)            v.clone()          v.copy(other)
v.add(v2)                 v.sub(v2)          v.multiply(v2)
v.multiplyScalar(s)       v.divideScalar(s)
v.length()                v.lengthSq()
v.normalize()             v.negate()
v.dot(v2)                 v.cross(v2)
v.lerp(v2, alpha)         v.distanceTo(v2)
v.applyMatrix4(mat)       v.applyQuaternion(q)
v.project(camera)         v.unproject(camera)
```

## Color

```js
new THREE.Color(r, g, b)    // 0..1 floats
new THREE.Color('#ff0000')
new THREE.Color(0xff0000)
c.setHSL(h, s, l)           // 0..1
c.lerp(other, t)
c.getHexString()            // 'ff0000'
```

## Quaternion Rotation

```js
const q = new THREE.Quaternion();
q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4);
q.setFromEuler(new THREE.Euler(x, y, z, 'YXZ'));
mesh.quaternion.slerp(q, 0.05); // smooth rotation in loop
```
