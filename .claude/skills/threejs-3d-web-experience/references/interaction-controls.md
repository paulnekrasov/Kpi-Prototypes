# Interaction & Controls

## Raycasting

```js
const raycaster = new THREE.Raycaster();
const pointer   = new THREE.Vector2();

window.addEventListener('pointermove', (e) => {
  pointer.x =  (e.clientX / innerWidth)  * 2 - 1;
  pointer.y = -(e.clientY / innerHeight) * 2 + 1;
});

// In animate loop:
raycaster.setFromCamera(pointer, camera);
const hits = raycaster.intersectObjects(scene.children, true); // recursive = true

if (hits.length > 0) {
  const hit = hits[0];  // nearest intersection
  hit.object;           // THREE.Mesh
  hit.point;            // THREE.Vector3 — world position on surface
  hit.face.normal;      // surface normal (local space)
  hit.uv;               // THREE.Vector2 — UV at hit
  hit.distance;         // float — distance from ray origin
  hit.instanceId;       // for InstancedMesh — which instance
}

// Raycast only specific objects (faster):
raycaster.intersectObjects([mesh1, mesh2]);

// Click events:
window.addEventListener('click', () => {
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(clickables, true);
  if (hits.length > 0) handleClick(hits[0]);
});
```

## Hover Effect Pattern

```js
let hovered = null;

function checkHover() {
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(interactables, true);
  const next  = hits.length > 0 ? hits[0].object : null;

  if (next !== hovered) {
    if (hovered) hovered.material.emissiveIntensity = 0; // unhover
    if (next)    next.material.emissiveIntensity    = 1; // hover
    hovered = next;
    document.body.style.cursor = hovered ? 'pointer' : 'default';
  }
}
// Call checkHover() inside the animate loop
```

---

## Camera Controls

```js
import { OrbitControls }       from 'three/addons/controls/OrbitControls.js';
import { FlyControls }         from 'three/addons/controls/FlyControls.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { TrackballControls }   from 'three/addons/controls/TrackballControls.js';
import { MapControls }         from 'three/addons/controls/MapControls.js';

// OrbitControls — most common
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableDamping   = true;   // MUST call orbit.update() in loop
orbit.dampingFactor   = 0.05;
orbit.enableZoom      = true;
orbit.enablePan       = true;
orbit.minDistance     = 1;
orbit.maxDistance     = 100;
orbit.minPolarAngle   = 0;
orbit.maxPolarAngle   = Math.PI / 2;   // prevent below ground
orbit.autoRotate      = true;
orbit.autoRotateSpeed = 0.5;
orbit.target.set(0, 1, 0);            // look-at point
orbit.update();                         // call once after changing target

// PointerLockControls — FPS game
document.addEventListener('click', () => fpsCam.lock());
fpsCam.addEventListener('lock',   () => blocker.style.display = 'none');
fpsCam.addEventListener('unlock', () => blocker.style.display = 'flex');
// Movement: fpsCam.moveForward(speed * delta);
//           fpsCam.moveRight(speed * delta);
```

## Drag Controls

```js
import { DragControls } from 'three/addons/controls/DragControls.js';

const drag = new DragControls(draggableObjects, camera, renderer.domElement);

// Disable orbit while dragging
drag.addEventListener('dragstart', () => orbit.enabled = false);
drag.addEventListener('dragend',   () => orbit.enabled = true);

drag.addEventListener('drag', (e) => {
  // Constrain to y=0 plane
  e.object.position.y = 0;
});
```

## Transform Controls (move/rotate/scale gizmo)

```js
import { TransformControls } from 'three/addons/controls/TransformControls.js';

const tc = new TransformControls(camera, renderer.domElement);
tc.attach(mesh);
scene.add(tc);

tc.setMode('translate'); // 'rotate' | 'scale'
tc.setSpace('world');    // 'local'

tc.addEventListener('dragging-changed', (e) => {
  orbit.enabled = !e.value;
});
```

---

## React Three Fiber (R3F) Quick Reference

### Setup
```jsx
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Float, Text, useGLTF } from '@react-three/drei';

export default function App() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 2, 5], fov: 75 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} castShadow />
      <Scene />
      <OrbitControls enableDamping />
      <Environment preset="city" />  {/* or files="env.hdr" */}
    </Canvas>
  );
}
```

### Core Hooks
```jsx
// useFrame — runs every frame
function Spinner() {
  const ref = useRef();
  useFrame((state, delta) => {
    ref.current.rotation.y += delta;
    // state.clock.elapsedTime
    // state.camera, state.scene, state.gl (renderer)
  });
  return <mesh ref={ref}><boxGeometry /><meshStandardMaterial /></mesh>;
}

// useThree — access Three.js internals
function MyComponent() {
  const { camera, gl, scene, size } = useThree();
  // ...
}
```

### GLTF in R3F
```jsx
function Model({ url }) {
  const { scene, animations } = useGLTF(url);
  const { actions } = useAnimations(animations, scene);
  useEffect(() => actions['Idle']?.play(), [actions]);
  return <primitive object={scene} />;
}
useGLTF.preload('/model.glb'); // preload outside component
```

### Float / Hover Animations (Drei)
```jsx
import { Float, MeshDistortMaterial, MeshWobbleMaterial } from '@react-three/drei';

<Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
  <mesh>
    <icosahedronGeometry args={[1, 4]} />
    <MeshDistortMaterial distort={0.4} speed={2} color="#8844ee" />
  </mesh>
</Float>
```

### Physics (Rapier)
```jsx
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';

<Physics gravity={[0, -9.81, 0]}>
  <RigidBody type="dynamic">
    <mesh><sphereGeometry /><meshStandardMaterial /></mesh>
  </RigidBody>
  <RigidBody type="fixed">
    <mesh rotation-x={-Math.PI/2}><planeGeometry args={[20,20]} /></mesh>
  </RigidBody>
</Physics>
```
