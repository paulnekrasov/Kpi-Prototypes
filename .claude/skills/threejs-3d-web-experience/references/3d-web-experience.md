# 3D Web Experience Patterns

Source: `sickn33/antigravity-awesome-skills` — immersive 3D web techniques.

---

## Full-Page Immersive Background

```js
// Make the canvas sit behind page content
renderer.domElement.style.cssText = `
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: -1;
  pointer-events: none;
`;
document.body.style.cssText = `
  margin: 0;
  overflow-x: hidden;
  background: #000;
`;
```

---

## Scroll-Driven Animation

### GSAP ScrollTrigger (recommended)
```js
import gsap           from 'https://cdn.jsdelivr.net/npm/gsap@3.12.2/index.js';
import ScrollTrigger  from 'https://cdn.jsdelivr.net/npm/gsap@3.12.2/ScrollTrigger.js';
gsap.registerPlugin(ScrollTrigger);

// Camera moves on scroll
gsap.to(camera.position, {
  z: 2,
  ease: 'none',
  scrollTrigger: {
    trigger:   '#section2',
    start:     'top bottom',
    end:       'top top',
    scrub:     1,           // smooth lag in seconds
  }
});

// Whole scene rotates
gsap.to(scene.rotation, {
  y: Math.PI * 2,
  ease: 'none',
  scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: true }
});
```

### Manual Scroll Progress
```js
let scrollY = 0;
window.addEventListener('scroll', () => { scrollY = window.scrollY; });

// In animate loop:
const progress = scrollY / (document.body.scrollHeight - innerHeight); // 0..1
camera.position.z = THREE.MathUtils.lerp(10, 2, progress);
scene.rotation.y  = progress * Math.PI * 2;
```

---

## Mouse Parallax / 3D Tilt

```js
const cursor = { x: 0, y: 0 };
window.addEventListener('mousemove', (e) => {
  cursor.x =  (e.clientX / innerWidth  - 0.5) * 2; // -1..1
  cursor.y = -(e.clientY / innerHeight - 0.5) * 2; // -1..1
});

// Smooth follow in animate loop:
const eased = new THREE.Vector2();
function animate() {
  eased.x += (cursor.x - eased.x) * 0.05;
  eased.y += (cursor.y - eased.y) * 0.05;

  scene.rotation.y = eased.x * 0.3;   // horizontal tilt
  scene.rotation.x = eased.y * 0.2;   // vertical tilt

  // Parallax layers (different speeds)
  bgGroup.position.x = eased.x * -0.5;
  fgGroup.position.x = eased.x *  0.5;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
```

---

## Anti-Gravity / Floating Objects (Noise-Driven)

```js
import { createNoise3D } from 'https://cdn.jsdelivr.net/npm/simplex-noise@4.0.1/dist/esm/simplex-noise.js';
const noise3D = createNoise3D();

// Store base positions once
objects.forEach((obj, i) => {
  obj.userData.base   = obj.position.clone();
  obj.userData.index  = i;
});

// In animate loop:
function floatObjects(time) {
  objects.forEach((obj) => {
    const { base, index: i } = obj.userData;
    const f = 0.4; // frequency
    obj.position.y = base.y + noise3D(base.x * f, base.z * f, time * 0.5 + i) * 0.4;
    obj.rotation.x = noise3D(i * 1.1, 0,       time * 0.2) * 0.4;
    obj.rotation.z = noise3D(0,        i * 1.3, time * 0.2) * 0.4;
  });
}
// floatObjects(clock.getElapsedTime()) in loop
```

---

## Particle System

### GPU Points (best for 1k–100k particles)
```js
const COUNT  = 8000;
const geo    = new THREE.BufferGeometry();
const pos    = new Float32Array(COUNT * 3);
const colors = new Float32Array(COUNT * 3);
const sizes  = new Float32Array(COUNT);
const c      = new THREE.Color();

for (let i = 0; i < COUNT; i++) {
  pos[i*3]   = (Math.random() - 0.5) * 20;
  pos[i*3+1] = (Math.random() - 0.5) * 20;
  pos[i*3+2] = (Math.random() - 0.5) * 20;
  c.setHSL(i / COUNT, 0.8, 0.5);
  colors[i*3] = c.r; colors[i*3+1] = c.g; colors[i*3+2] = c.b;
  sizes[i]    = Math.random() * 0.05 + 0.01;
}
geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

const mat = new THREE.PointsMaterial({
  size:            0.04,
  sizeAttenuation: true,
  vertexColors:    true,
  transparent:     true,
  alphaMap:        circleTexture,  // soft circular sprite
  depthWrite:      false,          // prevents sorting artifacts
  blending:        THREE.AdditiveBlending, // glowing / fire look
});
const particles = new THREE.Points(geo, mat);
scene.add(particles);

// Animate: drift upward, wrap
function updateParticles() {
  const pa = geo.attributes.position.array;
  for (let i = 0; i < COUNT; i++) {
    pa[i*3+1] += 0.002;
    if (pa[i*3+1] > 10) pa[i*3+1] = -10;
  }
  geo.attributes.position.needsUpdate = true;
}
```

### Circle Sprite Texture (no external file)
```js
function makeCircleTexture(size = 64) {
  const canvas  = document.createElement('canvas');
  canvas.width  = canvas.height = size;
  const ctx     = canvas.getContext('2d');
  const grad    = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  grad.addColorStop(0,   'rgba(255,255,255,1)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0.5)');
  grad.addColorStop(1,   'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}
const circleTexture = makeCircleTexture();
```

---

## Click-to-Explode / Radial Impulse

```js
window.addEventListener('click', () => {
  const origin = new THREE.Vector3(0, 0, 0);
  objects.forEach(obj => {
    const dir = obj.position.clone().sub(origin).normalize();
    obj.userData.vel = dir.multiplyScalar(Math.random() * 0.5 + 0.2);
  });
});

// In animate loop:
objects.forEach(obj => {
  if (obj.userData.vel) {
    obj.position.add(obj.userData.vel);
    obj.userData.vel.multiplyScalar(0.92); // damping
    if (obj.userData.vel.length() < 0.002) delete obj.userData.vel;
  }
});
```

---

## Sky & Atmosphere

```js
import { Sky } from 'three/addons/objects/Sky.js';

const sky = new Sky();
sky.scale.setScalar(450000);
scene.add(sky);

const { uniforms } = sky.material;
uniforms['turbidity'].value        = 10;
uniforms['rayleigh'].value         = 3;
uniforms['mieCoefficient'].value   = 0.005;
uniforms['mieDirectionalG'].value  = 0.7;

const sun = new THREE.Vector3();
const elevation = 2;     // degrees above horizon
const azimuth   = 180;
const phi   = THREE.MathUtils.degToRad(90 - elevation);
const theta = THREE.MathUtils.degToRad(azimuth);
sun.setFromSphericalCoords(1, phi, theta);
uniforms['sunPosition'].value.copy(sun);

// Update sun direction for directional light to match:
dirLight.position.copy(sun);
```

---

## Mirror / Reflection Plane

```js
import { Reflector } from 'three/addons/objects/Reflector.js';

const mirror = new Reflector(new THREE.PlaneGeometry(20, 20), {
  clipBias:      0.003,
  textureWidth:  innerWidth  * renderer.getPixelRatio(),
  textureHeight: innerHeight * renderer.getPixelRatio(),
  color:         0x889999,
});
mirror.rotation.x = -Math.PI / 2;
scene.add(mirror);
```

---

## Water Surface

```js
import { Water } from 'three/addons/objects/Water.js';

const water = new Water(new THREE.PlaneGeometry(100, 100), {
  textureWidth:  512,
  textureHeight: 512,
  waterNormals:  new THREE.TextureLoader().load('waternormals.jpg', (t) => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
  }),
  sunDirection: new THREE.Vector3(0, 1, 0),
  sunColor: 0xffffff,
  waterColor: 0x001e0f,
  distortionScale: 3.7,
  fog: scene.fog !== undefined,
});
water.rotation.x = -Math.PI / 2;
scene.add(water);

// In loop:
water.material.uniforms['time'].value += 1.0 / 60.0;
```

---

## Smooth Color Palette Animation (HSL cycling)

```js
// Animate background / fog color through HSL hue
let hue = 0;
function animate() {
  hue = (hue + 0.001) % 1;
  renderer.setClearColor(new THREE.Color().setHSL(hue, 0.8, 0.05));
  scene.fog.color.setHSL(hue, 0.8, 0.05);
}
```
