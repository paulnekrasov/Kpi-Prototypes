# Geometry & Materials

## Built-in Geometries

```js
new THREE.BoxGeometry(w, h, d, wSeg, hSeg, dSeg)
new THREE.SphereGeometry(r, widthSeg, heightSeg)
new THREE.PlaneGeometry(w, h, wSeg, hSeg)
new THREE.CylinderGeometry(rTop, rBot, h, radSeg, hSeg, openEnded)
new THREE.ConeGeometry(r, h, radSeg, hSeg, openEnded)
new THREE.TorusGeometry(r, tube, radSeg, tubeSeg)
new THREE.TorusKnotGeometry(r, tube, tubeSeg, radSeg, p, q)
new THREE.RingGeometry(innerR, outerR, thetaSeg, phiSeg)
new THREE.CircleGeometry(r, seg, thetaStart, thetaLen)
new THREE.IcosahedronGeometry(r, detail)
new THREE.OctahedronGeometry(r, detail)
new THREE.TetrahedronGeometry(r, detail)
new THREE.DodecahedronGeometry(r, detail)
new THREE.CapsuleGeometry(r, length, capSeg, radSeg)  // r152+ only — NOT in r128
new THREE.TubeGeometry(path, tubSeg, r, radSeg, closed)
new THREE.LatheGeometry(points, seg, phiStart, phiLen)
new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled, bevelSize, ... })
new THREE.ShapeGeometry(shape, curveSegments)
```

## Custom BufferGeometry

```js
const geo = new THREE.BufferGeometry();

const vertices = new Float32Array([
  // x,  y,  z
   0,  0,  0,
   1,  0,  0,
   0.5, 1, 0,
]);
geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
geo.setAttribute('normal',   new THREE.BufferAttribute(normals, 3));
geo.setAttribute('uv',       new THREE.BufferAttribute(uvs, 2));
geo.setIndex([0, 1, 2]);          // optional index buffer

geo.computeVertexNormals();       // auto-compute smooth normals
geo.computeBoundingSphere();      // required for frustum culling
geo.computeBoundingBox();         // required for .getCenter(), .getSize()
geo.center();                     // translate so centroid is at origin
```

## Instanced Mesh (GPU instancing — best for 100+ identical objects)

```js
const iMesh = new THREE.InstancedMesh(geo, mat, COUNT);
iMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // if updating each frame

const dummy = new THREE.Object3D();
for (let i = 0; i < COUNT; i++) {
  dummy.position.set(
    (Math.random() - 0.5) * 20,
    (Math.random() - 0.5) * 20,
    (Math.random() - 0.5) * 20
  );
  dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
  dummy.scale.setScalar(Math.random() * 0.5 + 0.5);
  dummy.updateMatrix();
  iMesh.setMatrixAt(i, dummy.matrix);
  iMesh.setColorAt(i, new THREE.Color().setHSL(i / COUNT, 0.8, 0.5));
}
iMesh.instanceMatrix.needsUpdate = true;
iMesh.instanceColor.needsUpdate  = true;
scene.add(iMesh);

// Update a single instance at runtime:
iMesh.getMatrixAt(i, dummy.matrix);
dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
// ...mutate dummy...
dummy.updateMatrix();
iMesh.setMatrixAt(i, dummy.matrix);
iMesh.instanceMatrix.needsUpdate = true;
```

## Merge Static Geometries

```js
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
const merged = mergeGeometries([geo1, geo2, geo3], false); // false = no groups
scene.add(new THREE.Mesh(merged, mat));
```

---

## Materials

### MeshBasicMaterial — unlit, fastest
```js
new THREE.MeshBasicMaterial({
  color: 0xff0000,
  map, alphaMap,
  wireframe: false,
  transparent: false, opacity: 1,
  side: THREE.FrontSide,   // DoubleSide | BackSide
})
```

### MeshStandardMaterial — PBR, recommended default
```js
new THREE.MeshStandardMaterial({
  color: 0xffffff,
  metalness: 0.0,    // 0 = dielectric, 1 = metal
  roughness: 0.5,    // 0 = mirror, 1 = matte
  map,               // albedo (SRGBColorSpace)
  normalMap,         // tangent-space normals
  normalScale: new THREE.Vector2(1, 1),
  roughnessMap, metalnessMap,
  aoMap, aoMapIntensity: 1,
  emissive: 0x000000, emissiveIntensity: 1, emissiveMap,
  envMap, envMapIntensity: 1,
  transparent: false, opacity: 1, alphaMap,
  side: THREE.FrontSide,
})
```

### MeshPhysicalMaterial — PBR + advanced optical effects
```js
new THREE.MeshPhysicalMaterial({
  // …all MeshStandardMaterial props, plus:
  clearcoat: 1.0,             // car paint, lacquered wood
  clearcoatRoughness: 0.1,
  clearcoatNormalMap,

  transmission: 1.0,          // glass / liquid
  ior: 1.5,                   // index of refraction (glass ≈ 1.5)
  thickness: 0.5,
  attenuationColor: 0xffffff,
  attenuationDistance: Infinity,

  sheen: 1.0,                 // fabric / velvet
  sheenRoughness: 0.5,
  sheenColor: 0xffffff,

  iridescence: 1.0,           // soap bubble, oil slick
  iridescenceIOR: 1.3,
  iridescenceThicknessRange: [100, 400],

  anisotropy: 1.0,            // brushed metal
  anisotropyRotation: 0,

  dispersion: 5,              // prismatic chromatic aberration (r165+)
})
// Note: transmission requires renderer.localClippingEnabled = true
```

### ShaderMaterial — custom GLSL
→ See `shaders-postprocessing.md`

### PointsMaterial — particles
```js
new THREE.PointsMaterial({
  size: 0.05,
  sizeAttenuation: true,  // perspective size falloff
  map, alphaMap,
  vertexColors: true,
  transparent: true,
  depthWrite: false,      // prevents sorting artifacts
  blending: THREE.AdditiveBlending, // for glowing particles
})
```

### LineBasicMaterial / LineDashedMaterial
```js
new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 1 })
// linewidth > 1 only on some GPUs (WebGL limitation)

new THREE.LineDashedMaterial({ color, dashSize: 3, gapSize: 1, scale: 1 })
// requires: line.computeLineDistances()
```

### Shared Material Properties
```js
mat.needsUpdate = true;   // required after changing side/transparent/alphaTest
mat.dispose();            // free GPU memory
mat.clone();              // deep copy
mat.visible = false;
mat.depthTest  = true;
mat.depthWrite = true;
mat.blending   = THREE.NormalBlending; // AdditiveBlending | SubtractiveBlending | MultiplyBlending
mat.polygonOffset = true; mat.polygonOffsetFactor = 1; // fix z-fighting
mat.alphaTest = 0.5;      // discard fragments below threshold (no transparent sort needed)
```
