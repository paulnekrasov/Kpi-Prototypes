# Animation & Loaders

## AnimationMixer (GLTF clips)

```js
const mixer  = new THREE.AnimationMixer(model);
const action = mixer.clipAction(gltf.animations[0]);

// Playback
action.play();
action.pause();
action.stop();
action.reset().play();

// Config
action.loop               = THREE.LoopRepeat;   // LoopOnce | LoopPingPong
action.repetitions        = Infinity;
action.clampWhenFinished  = true;               // freeze on last frame
action.timeScale          = 1;                  // negative = reverse
action.weight             = 1;                  // for blending

// Events
mixer.addEventListener('finished', (e) => console.log('done', e.action._clip.name));

// MUST be called in animate loop:
const clock = new THREE.Clock();
function animate() {
  mixer.update(clock.getDelta());
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
```

## Crossfading Between Clips

```js
function crossFadeTo(from, to, duration = 0.5) {
  to.enabled = true;
  to.setEffectiveTimeScale(1);
  to.setEffectiveWeight(1);
  from.crossFadeTo(to, duration, true);
  to.play();
}
```

## Keyframe Animation (procedural)

```js
// Position track
const posKF = new THREE.VectorKeyframeTrack(
  '.position',          // property path (dot notation from mixer root)
  [0, 1, 2],            // keyframe times (seconds)
  [0,0,0,  0,2,0,  0,0,0] // flat xyz values
);

// Quaternion rotation track (use for smooth rotation — not Euler)
const rotKF = new THREE.QuaternionKeyframeTrack(
  '.quaternion',
  [0, 1],
  [0,0,0,1,  0,1,0,0]   // xyzw quaternion values
);

// Color track (for material)
const colorKF = new THREE.ColorKeyframeTrack(
  '.material.color',
  [0, 1, 2],
  [1,0,0,  0,1,0,  0,0,1]  // rgb
);

const clip   = new THREE.AnimationClip('myAnim', 2, [posKF, rotKF]);
const action = mixer.clipAction(clip);
action.play();
```

## Morph Targets

```js
// Geometry must have morphAttributes set
geo.morphAttributes.position = [targetPositions]; // array of BufferAttribute

mesh.morphTargetInfluences[0] = 0.5; // 0..1 blend
mesh.updateMorphTargets();
```

---

## GLTF / GLB Loader

```js
import { GLTFLoader }    from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader }   from 'three/addons/loaders/DRACOLoader.js';
import { KTX2Loader }    from 'three/addons/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

// DRACOLoader — for Draco-compressed geometry (smaller files)
const draco = new DRACOLoader();
draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
draco.preload(); // optional warm-up

// KTX2Loader — for compressed GPU textures
const ktx2 = new KTX2Loader();
ktx2.setTranscoderPath('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/basis/');
ktx2.detectSupport(renderer);

const loader = new GLTFLoader();
loader.setDRACOLoader(draco);
loader.setKTX2Loader(ktx2);
loader.setMeshoptDecoder(MeshoptDecoder);

loader.load(
  'model.glb',
  (gltf) => {
    const model = gltf.scene;

    // Shadows
    model.traverse(child => {
      if (child.isMesh) {
        child.castShadow    = true;
        child.receiveShadow = true;
        // Fix transparent sorting if needed:
        // child.material.depthWrite = true;
      }
    });

    // Center and scale
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);

    scene.add(model);

    // Animations
    if (gltf.animations.length) {
      const mixer = new THREE.AnimationMixer(model);
      gltf.animations.forEach(clip => mixer.clipAction(clip).play());
    }
  },
  (xhr)  => console.log(`${(xhr.loaded / xhr.total * 100).toFixed(0)}% loaded`),
  (err)  => console.error(err)
);
```

## Async / Promise Pattern

```js
const loadGLTF = (url) => new Promise((resolve, reject) =>
  new GLTFLoader().load(url, resolve, undefined, reject)
);

// Parallel load:
const [envGltf, propGltf] = await Promise.all([
  loadGLTF('env.glb'),
  loadGLTF('prop.glb'),
]);
```

## LoadingManager (multiple assets + progress UI)

```js
const manager = new THREE.LoadingManager(
  () => {
    // All assets loaded
    loadingScreen.style.display = 'none';
    startExperience();
  },
  (url, loaded, total) => {
    loadingBar.style.width = `${(loaded / total * 100)}%`;
  },
  (url) => console.error(`Error loading: ${url}`)
);

const texLoader  = new THREE.TextureLoader(manager);
const gltfLoader = new GLTFLoader(manager);
// Any loader that uses this manager will contribute to the progress
```

## Other Loaders

```js
import { OBJLoader }  from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader }  from 'three/addons/loaders/MTLLoader.js';
import { FBXLoader }  from 'three/addons/loaders/FBXLoader.js';
import { SVGLoader }  from 'three/addons/loaders/SVGLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { HDRCubeTextureLoader } from 'three/addons/loaders/HDRCubeTextureLoader.js';

// Font / TextGeometry
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
new FontLoader().load('helvetiker_regular.typeface.json', (font) => {
  const geo = new TextGeometry('Hello', {
    font,
    size:    1,
    height:  0.2,     // extrusion depth
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize:      0.02,
    bevelSegments:  5,
  });
  geo.center();
  scene.add(new THREE.Mesh(geo, mat));
});
```
