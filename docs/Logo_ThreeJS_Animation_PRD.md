# PRD — Анімація логотипу у Three.js

*Документ вимог для Three.js-розробника*

**Скляний / кристалічний стиль · Два логотипи · Реальний WebGL рендер**

> Версія 3.0 | Березень 2026 | Статус: ACTIVE | Three.js r165+ | GSAP 3.x

---

## 1. Контекст та передумови

Компанія має два логотипи, що потребують інтерактивної WebGL-анімації преміального рівня у стилі «скляного / кристалічного матеріалу» (glass morphism). Кожен логотип — це дві D-подібні напівкруглі форми зі скошеними краями, які мають виглядати як напівпрозорі кристали з бевелом, спекулярним бліком і sweep-підсвіткою.

Three.js — це WebGL-рушій, що дозволяє створювати повноцінний 3D-рендеринг прямо у браузері, без плагінів. На відміну від SVG-анімацій або відео-файлів, Three.js-рішення є:

- **Інтерактивним:** реагує на hover миші, скрол, DeviceOrientation.
- **Адаптивним у реальному часі:** авторесайз за розміром контейнера без перерендеру.
- **Живим WebGL:** MeshPhysicalMaterial з реальним заломленням, Fresnel, envMap.
- **Легко інтегрованим:** один `<canvas>` тег або npm-пакет, нема відеофайлів, нема кодеків.

Базис: вже існує SVG-прототип (референс) із кольоровою системою, структурою (leftPiece / rightPiece), градієнтами та логікою анімації (micro-rotate + shine-sweep). Three.js-версія повинна відтворити і перевершити цей референс за рахунок реального 3D, фізичних матеріалів і живої інтерактивності.

### 1.1 Чому Three.js, а не SVG чи відео

| Параметр / Властивість | Значення | Пояснення |
|---|---|---|
| SVG animation | Градієнти, CSS, 2D | Референс. Легковагий, але без справжнього 3D, заломлення та інтерактивності |
| Blender → WebM | Відео файл, пасивний | Найвища якість рендеру, але: статичний, немає hover, великий файл, кодек |
| Three.js (WebGL) | Рендер у реальному часі, 3D | Повна інтерактивність, живе освітлення, envMap, Fresnel — рекомендовано |

### 1.2 Чому це важливо саме зараз

- Логотипи є ключовими елементами сайту — вони повинні бути на рівні з преміальними WebGL hero-секціями сучасного вебу.
- Three.js r165+ має WebGLRenderer з підтримкою physical transmission materials — саме те, що потрібно для скла.
- GSAP 3.x + Three.js — індустріальний стандарт для преміальних веб-анімацій (Apple, Awwwards-лауреати, Stripe).
- Один файл (bundle) розміром < 150 KB gzip покриває обидва логотипи — краще ніж два WebM по 2 MB кожен.

---

## 2. Критерії успіху

Проект вважається завершеним і прийнятим, якщо виконані **ВСІ** умови:

- Обидва логотипи рендеруються у WebGL: MeshPhysicalMaterial зі справжнім transmission (прозорість скла).
- Seamless loop-анімація: мікро-обертання + sweep-highlight у нескінченному циклі.
- Hover-реакція: при наведенні миші логотип реагує паралаксом або посиленням бліку (деталі в розділі 9).
- 60 fps стабільно на GPU середнього класу (GTX 1060 / RX 580 / Apple M1).
- Responsive: canvas автоматично підлаштовується до розміру контейнера через ResizeObserver.
- Pixel Ratio: підтримка devicePixelRatio до 2 (Retina) — crisp edges, не розмиті.
- Прозорий фон canvas: `alpha: true` у WebGLRenderer — логотип на будь-якому тлі сторінки.
- Розмір JS bundle (Three.js + логотип + GSAP) ≤ 150 KB gzip після tree-shaking.
- Graceful degradation: якщо WebGL недоступний — показати статичний SVG fallback.
- Інтеграція через один `npm install` або один `<script>` тег.
- Код структурований у класи (`LogoScene`, `LogoMaterial`, `LogoAnimation`) — легко читати та правити.

---

## 3. Цільова аудиторія

Безпосередній споживач deliverable — фронтенд-розробник, що інтегрує компонент. Кінцевий споживач — відвідувач сайту.

Після здачі фронтенд-розробник повинен вміти:

- Встановити через `npm install logo-animation` або підключити bundle через `<script src>`.
- Ініціалізувати через `new LogoScene({ container: '#logo-wrap', variant: 1 })`.
- Змінити базовий колір правкою одного рядка: `scene.setColor('#5269FF')`.
- Перемикати режими анімації: `scene.setMode('rotate' | 'shine' | 'both' | 'none')`.
- Зупинити/відновити анімацію: `scene.pause()` / `scene.resume()`.
- Зруйнувати WebGL-контекст при unmount: `scene.dispose()`.

---

## 4. Загальний опис рішення

Розробити JavaScript-модуль (ES Module + UMD build) з двома конфігураціями логотипів. Архітектура — клас `LogoScene`, що інкапсулює Three.js сцену, матеріали, освітлення та анімацію.

**Структура проекту:**

```
logo-animation/
├── src/
│   ├── index.js              // публічний API (export LogoScene)
│   ├── LogoScene.js          // головний клас: init, animate, dispose
│   ├── LogoGeometry.js       // ExtrudeGeometry з SVG PathData
│   ├── LogoMaterial.js       // MeshPhysicalMaterial + shader patching
│   ├── LogoLighting.js       // система освітлення (HDRI envMap + lights)
│   ├── LogoAnimation.js      // GSAP timeline: rotate + shine
│   ├── LogoInteraction.js    // hover parallax + device orientation
│   ├── PostProcessing.js     // EffectComposer + UnrealBloomPass
│   ├── configs/
│   │   ├── logo1.config.js   // геометрія + кольори логотипу №1
│   │   └── logo2.config.js   // геометрія + кольори логотипу №2
│   └── utils/
│       ├── svgPathToShape.js // SVG PathData → THREE.Shape
│       └── detectWebGL.js    // перевірка підтримки WebGL
├── dist/
│   ├── logo-animation.esm.js // ES Module
│   └── logo-animation.umd.js // UMD (CDN)
└── demo/
    └── index.html            // demo сторінка
```

---

## 5. Залежності та налаштування середовища

### 5.1 Залежності (npm)

| Параметр / Властивість | Значення | Пояснення |
|---|---|---|
| `three` | `^0.165.0` | Основний WebGL-рушій. ОБОВ'ЯЗКОВО r165+ для нових фіч physical material |
| `gsap` | `^3.12.5` | Анімаційний рушій. Плавні tweens, timeline, easing-криві |
| `three/examples/jsm/...` | bundled | Postprocessing, loaders, controls — з того ж пакету three |
| `@types/three` | dev | TypeScript типи (опційно, але рекомендовано) |
| `vite` | dev | Bundler: tree-shaking Three.js до мінімуму, HMR для розробки |

> ⚠️ **НЕ використовувати** three.js версії < r155 — у них відсутній `MeshPhysicalMaterial.transmission` з коректним IOR. **НЕ імпортувати весь THREE** — тільки named imports для tree-shaking.

### 5.2 Правильний імпорт (tree-shaking)

```js
// ✅ ПРАВИЛЬНО — тільки те, що потрібно
import {
  WebGLRenderer, Scene, PerspectiveCamera,
  MeshPhysicalMaterial, ExtrudeGeometry,
  DirectionalLight, PointLight, AmbientLight,
  Group, Mesh, Shape, Path,
  PMREMGenerator, ACESFilmicToneMapping,
  Vector2, Vector3, Color, Clock
} from 'three';

// ❌ НЕПРАВИЛЬНО — імпортує всі 600 KB
import * as THREE from 'three';
```

### 5.3 Renderer налаштування

```js
const renderer = new WebGLRenderer({
  canvas: canvasElement,
  antialias: true,          // MSAA 4x для crisp edges
  alpha: true,              // прозорий фон canvas
  powerPreference: 'high-performance',
  precision: 'highp',       // float32 для точних матеріалів
  stencil: false,           // не потрібен — економить пам'ять
  depth: true,
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.toneMapping = ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.outputColorSpace = SRGBColorSpace;
renderer.shadowMap.enabled = false; // тіні не потрібні для логотипу
```

---

## 6. Камера та сцена

### 6.1 Камера

```js
const camera = new PerspectiveCamera(
  35,                                          // FOV: вузький — мінімум перспективних спотворень
  container.clientWidth / container.clientHeight, // aspect
  0.1,                                         // near
  100                                          // far
);
camera.position.set(0, 0, 5.5); // відстань: логотип займає ~80% кадру
camera.lookAt(0, 0, 0);
```

> 💡 FOV 35° — «компресована» перспектива, що нагадує ортографічну. Не використовувати FOV > 50 — буде неприємне barrel distortion для логотипу.

### 6.2 Scene

```js
const scene = new Scene();
scene.background = null; // прозорий фон (alpha: true у renderer)
```

### 6.3 ResizeObserver (responsive)

```js
const resizeObserver = new ResizeObserver(() => {
  const w = container.clientWidth;
  const h = container.clientHeight;
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  composer?.setSize(w, h); // оновити postprocessing
});
resizeObserver.observe(container);
```

---

## 7. Специфікація геометрії

### 7.1 Підхід: SVG PathData → THREE.Shape → ExtrudeGeometry

Форми логотипу визначені як SVG path-дані у конфіг-файлах. Функція `svgPathToShape()` парсить ці рядки у `THREE.Shape` об'єкти, з яких потім будується `ExtrudeGeometry`. Це точний, контрольований підхід — геометрія живе у коді, не в зовнішніх `.glb` файлах.

### 7.2 Конфіг-файл геометрії (logo1.config.js)

```js
// src/configs/logo1.config.js
export const LOGO_1_CONFIG = {
  // SVG path для зовнішнього контуру лівої деталі
  // Наближення за SVG-референсом. Точна геометрія уточнюється по брендбуку.
  leftOuter: 'M 190,100 A 300,300 0 0,0 190,700 L 140,640 A 240,240 0 0,1 140,160 Z',

  // SVG path для внутрішнього вирізу (якщо є hollow center)
  leftInner: null, // null = суцільна деталь без вирізу

  // SVG path для правої (меншої) деталі
  rightOuter: 'M 210,200 A 200,200 0 0,1 210,600 L 260,540 A 140,140 0 0,0 260,260 Z',
  rightInner: null,

  // Параметри витискання
  extrude: {
    depth: 18,            // глибина витискання (у SVG units)
    bevelEnabled: true,
    bevelThickness: 6,    // товщина бевелу (скошений край)
    bevelSize: 4,         // розмір скосу
    bevelOffset: 0,
    bevelSegments: 8,     // плавні сегменти бевелу
    curveSegments: 64,    // сегменти кривих — плавні D-форми
  },

  // Масштаб: SVG units → Three.js units (нормалізація)
  scale: 0.005,           // 800 SVG units → 4 Three.js units
  centerOffset: [0, 0, 0], // зсув центру для pivot
};
```

### 7.3 Функція svgPathToShape()

```js
// src/utils/svgPathToShape.js
import { Shape, Path } from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';

export function svgPathToShape(pathData) {
  const loader = new SVGLoader();
  const paths = loader.parse(`<svg><path d='${pathData}'/></svg>`).paths;
  return SVGLoader.createShapes(paths[0])[0]; // THREE.Shape
}
```

> 💡 SVGLoader входить у `three/examples/jsm` — не потрібна додаткова залежність. Він коректно обробляє arc-команди (`A`), які використовуються у D-подібних формах логотипу.

### 7.4 Побудова мешів

```js
// src/LogoGeometry.js
import { ExtrudeGeometry, Mesh, Group } from 'three';
import { svgPathToShape } from './utils/svgPathToShape.js';

export function buildLogoGroup(config, materials) {
  const group = new Group();

  // Ліва деталь
  const leftShape = svgPathToShape(config.leftOuter);
  const leftGeo = new ExtrudeGeometry(leftShape, config.extrude);
  leftGeo.computeVertexNormals(); // ОБОВ'ЯЗКОВО для правильного освітлення
  const leftMesh = new Mesh(leftGeo, materials.left);
  leftMesh.name = 'Logo_Left';

  // Права деталь
  const rightShape = svgPathToShape(config.rightOuter);
  const rightGeo = new ExtrudeGeometry(rightShape, config.extrude);
  rightGeo.computeVertexNormals();
  const rightMesh = new Mesh(rightGeo, materials.right);
  rightMesh.name = 'Logo_Right';

  group.add(leftMesh, rightMesh);
  group.name = 'Logo_Group';

  // Масштаб та центрування
  group.scale.setScalar(config.scale);

  // Базовий нахил −15° по осі Z (як у SVG-референсі)
  group.rotation.z = -Math.PI / 12; // −15° у радіанах

  return group;
}
```

---

## 8. Специфікація матеріалів

### 8.1 MeshPhysicalMaterial — основа

`MeshPhysicalMaterial` — найбільш фізично коректний матеріал у Three.js. Підтримує `transmission` (пропускання світла крізь скло), `IOR` (Index of Refraction), `Clearcoat`, `Sheen` та Fresnel. Саме він дає «живе» скло.

### 8.2 Параметри матеріалу для Logo_Left

| Параметр / Властивість | Значення | Пояснення |
|---|---|---|
| `color` | `0x5269FF` | Базовий колір (#5269FF — середньо-синій, відповідає SVG-референсу) |
| `metalness` | `0.0` | Не метал |
| `roughness` | `0.05` | Майже дзеркало — мінімальна шорсткість поверхні |
| `transmission` | `0.82` | 82% пропускання світла — напівпрозоре скло |
| `thickness` | `0.5` | Товщина матеріалу для розрахунку заломлення |
| `ior` | `1.52` | Індекс заломлення: crown glass (найбільш реалістичний для 'кришталю') |
| `transparent` | `true` | ОБОВ'ЯЗКОВО для transmission |
| `opacity` | `0.92` | Загальна непрозорість (додатково до transmission) |
| `clearcoat` | `0.6` | Лакове покриття — другий шар specular highlight |
| `clearcoatRoughness` | `0.03` | Гладкий лак |
| `reflectivity` | `0.85` | Сила відбиття оточення (envMap) |
| `envMapIntensity` | `2.2` | Інтенсивність відображення HDRI envMap — ключ до 'живого' скла |
| `side` | `THREE.DoubleSide` | Обидві сторони видимі — важливо для прозорого скла |
| `depthWrite` | `false` | Вимкнути запис у depth buffer — коректна прозорість |
| `attenuationColor` | `0x2244FF` | Колір поглинання світла всередині скла — синюватий відтінок |
| `attenuationDistance` | `0.8` | Дистанція поглинання — скло стає темнішим у товщих ділянках |

### 8.3 Параметри матеріалу для Logo_Right

Ідентичний Mat_Left, але з відмінностями для візуального розділення деталей:

| Параметр / Властивість | Значення | Пояснення |
|---|---|---|
| `color` | `0x7083FF` | Світліший синій (права деталь — менша, виглядає легшою) |
| `roughness` | `0.06` | Мінімально більша шорсткість |
| `transmission` | `0.85` | Трохи прозоріша |
| `clearcoat` | `0.5` | Трохи менш виражений clearcoat |
| `envMapIntensity` | `2.0` | Трохи менш відбивальна |
| Решта | = Mat_Left | Однакові параметри |

### 8.4 Матеріал бевелу (окремий material slot)

`ExtrudeGeometry` автоматично створює 3 групи faces: front (0), back (1), side/bevel (2). Призначити масив матеріалів:

```js
const meshLeft = new Mesh(leftGeo, [
  materialFront,  // group 0: передня поверхня
  materialBack,   // group 1: задня поверхня (ідентична front)
  materialBevel,  // group 2: бевел (скошений край — яскравіший)
]);

// Mat_Bevel: яскравий край
const materialBevel = new MeshPhysicalMaterial({
  color: 0xAABBFF,              // світло-блакитний
  roughness: 0.0,               // ідеальне дзеркало
  metalness: 0.15,
  clearcoat: 1.0,               // максимальний clearcoat
  clearcoatRoughness: 0.0,
  envMapIntensity: 3.5,         // сильне відбиття HDRI на краю
  transmission: 0.3,            // напівпрозорий
  emissive: new Color(0x4466FF),
  emissiveIntensity: 0.25,      // тонке самосвітіння краю
});
```

### 8.5 envMap (Environment Map) — КРИТИЧНО для скла

Без `envMap` `MeshPhysicalMaterial` виглядатиме як сірий пластик. `envMap` — це текстура оточення, що відбивається у склі та формує specular highlights.

```js
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { PMREMGenerator } from 'three';

const pmremGenerator = new PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

const rgbeLoader = new RGBELoader();
rgbeLoader.load('./assets/studio_small.hdr', (texture) => {
  const envMap = pmremGenerator.fromEquirectangular(texture).texture;
  scene.environment = envMap; // застосувати до всієї сцени
  texture.dispose();
  pmremGenerator.dispose();
});
```

> 💡 Рекомендована HDR-текстура: `'studio_small_09_1k.hdr'` з poly.haven (безкоштовна, CC0). Розмір: 512×256 px для логотипу — достатньо. Не використовувати 4K HDR — зайва вага.

> ⚠️ Без `scene.environment` матеріал transmission **НЕ буде** виглядати як скло. Це найпоширеніша помилка при роботі з MeshPhysicalMaterial.

---

## 9. Специфікація освітлення

Three.js логотип отримує три реальних джерела світла поверх HDRI envMap. Разом вони формують specular highlights, depth та glass refraction ефект.

### 9.1 AmbientLight — фонове

```js
const ambient = new AmbientLight(0xB4BEFF, 0.4);
// Колір: холодний блакитний. Intensity: 0.4 — м'який fill
scene.add(ambient);
```

### 9.2 DirectionalLight — головний specular (Key Light)

```js
const keyLight = new DirectionalLight(0xDCE6FF, 2.5);
keyLight.position.set(-3.0, 4.0, 3.5);
keyLight.name = 'LIGHT_Key';
scene.add(keyLight);
// Колір: холодний біло-блакитний (#DCE6FF)
// Intensity: 2.5 — яскравий specular highlight на бевелі
// Позиція: зліва-зверху (як у SVG-референсі edge specular)
```

### 9.3 PointLight — sweep-highlight (анімований)

```js
const shineLight = new PointLight(0xFFFFFF, 0.0, 8.0);
// Intensity: 0.0 — початково вимкнений
// Distance: 8 — радіус впливу
// Decay: за замовчуванням 2 (фізично коректний)
shineLight.position.set(-3.5, 2.0, 2.0);
shineLight.name = 'LIGHT_Shine';
scene.add(shineLight);
// GSAP анімує position та intensity для sweep-ефекту
```

### 9.4 DirectionalLight — Rim Light

```js
const rimLight = new DirectionalLight(0xC8D2FF, 1.0);
rimLight.position.set(0.5, -2.0, -2.0);
rimLight.name = 'LIGHT_Rim';
scene.add(rimLight);
// Контрове підсвічування ззаду — обідковий блик
```

---

## 10. Специфікація анімації

### 10.1 Архітектура анімації

Анімація побудована на GSAP 3.x (GreenSock Animation Platform). Два незалежних `Timeline` об'єкти запускаються одночасно та цикляться нескінченно (`repeat: -1`, `yoyo: true`):

- **Timeline «rotateLoop»** — мікро-обертання `Logo_Group`.
- **Timeline «shineLoop»** — переміщення `shineLight` (PointLight) + зміна intensity.

> 💡 GSAP обирається над `requestAnimationFrame` вручну через: точне управління easing-кривими, підтримку `pause/resume/kill`, готовий `repeat/yoyo`, легку інтеграцію з hover-реакціями.

### 10.2 Timeline «rotateLoop» — мікро-обертання

```js
import gsap from 'gsap';

// Базовий нахил −15° вже встановлений на group.rotation.z
// BASE_TILT = -Math.PI / 12 (−15°)
// ROT_AMOUNT = Math.PI / 60 (±3°)

const rotateLoop = gsap.timeline({
  repeat: -1,
  yoyo: true,         // маятник: туди-назад
  ease: 'sine.inOut', // плавний маятниковий рух
  defaults: { duration: 2.5 },
});

rotateLoop
  .to(logoGroup.rotation, {
    z: BASE_TILT + ROT_AMOUNT, // −15° + 3° = −12°
    ease: 'sine.inOut',
  })
  .to(logoGroup.position, {
    x: 0.02, y: 0.03,  // паралакс-зсув (2–3%)
    ease: 'sine.inOut',
  }, '<'); // '<' = одночасно з попереднім tween
```

### 10.3 Timeline «shineLoop» — sweep-блиск

```js
const SHINE_START = new Vector3(-3.5, 2.0, 2.0);
const SHINE_PEAK  = new Vector3( 0.5, 1.0, 2.5); // центр логотипу
const SHINE_END   = new Vector3( 3.5, 0.0, 2.0);

const shineLoop = gsap.timeline({ repeat: -1, repeatDelay: 1.2 });
// repeatDelay: 1.2s — пауза між проходами (аналог SVG 60%→100% паузи)

shineLoop
  // Фаза 1: вхід (світло рухається ліворуч → центр, вмикається)
  .to(shineLight.position, {
    x: SHINE_PEAK.x, y: SHINE_PEAK.y, z: SHINE_PEAK.z,
    duration: 0.9,
    ease: 'power2.in',
  })
  .to(shineLight, {
    intensity: 4.5, // максимум яскравості
    duration: 0.9,
    ease: 'power2.in',
  }, '<')

  // Фаза 2: вихід (центр → правий край, вимикається)
  .to(shineLight.position, {
    x: SHINE_END.x, y: SHINE_END.y, z: SHINE_END.z,
    duration: 0.9,
    ease: 'power2.out',
  })
  .to(shineLight, {
    intensity: 0.0,
    duration: 0.9,
    ease: 'power2.out',
  }, '<')

  // Повернення до start (миттєво, поза кадром)
  .set(shineLight.position, { x: SHINE_START.x, y: SHINE_START.y, z: SHINE_START.z });
```

### 10.4 Render Loop

```js
const clock = new Clock();

function animate() {
  animationFrameId = requestAnimationFrame(animate);
  const delta = clock.getDelta();

  // GSAP оновлюється автоматично (gsap.ticker)
  // Тут можна додати дрібну sinusoidal анімацію поверх GSAP:
  const t = clock.getElapsedTime();
  logoGroup.position.y += Math.sin(t * 0.4) * 0.0003; // мікро-флоат по Y

  composer.render(); // postprocessing pipeline
  // або: renderer.render(scene, camera) якщо немає постобробки
}

animate();
```

### 10.5 API режимів анімації

```js
// Клас LogoAnimation експортує методи для зовнішнього керування:
setMode(mode) {
  if (mode === 'none')   { rotateLoop.pause(); shineLoop.pause(); }
  if (mode === 'rotate') { rotateLoop.play();  shineLoop.pause(); }
  if (mode === 'shine')  { rotateLoop.pause(); shineLoop.play();  }
  if (mode === 'both')   { rotateLoop.play();  shineLoop.play();  }
}
```

---

## 11. Інтерактивність

### 11.1 Mouse Parallax (hover)

При русі миші над canvas логотип злегка нахиляється у напрямку курсору. Це підсилює ілюзію 3D-об'єму та живого матеріалу.

```js
const mouse = new Vector2();
const TARGET_ROT = new Vector3();
const PARALLAX_INTENSITY = 0.08; // радіан — максимальний нахил

canvas.addEventListener('mousemove', (e) => {
  // Нормалізовані координати від -1 до +1
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width)  * 2 - 1;
  mouse.y = ((e.clientY - rect.top)  / rect.height) * 2 - 1;
});

// У render loop (кожен кадр):
TARGET_ROT.x = -mouse.y * PARALLAX_INTENSITY;
TARGET_ROT.y =  mouse.x * PARALLAX_INTENSITY;

// Плавне наближення (lerp) — не стрибки:
logoGroup.rotation.x += (TARGET_ROT.x - logoGroup.rotation.x) * 0.05;
logoGroup.rotation.y += (TARGET_ROT.y - logoGroup.rotation.y) * 0.05;
```

> 💡 Lerp-коефіцієнт `0.05` = дуже плавний відгук. Збільшити до `0.1` для більш чуйного слідкування, зменшити до `0.03` для більш «важкого», інертного відчуття.

### 11.2 Mouse Leave — reset

```js
canvas.addEventListener('mouseleave', () => {
  // Плавне повернення до базового положення
  gsap.to(logoGroup.rotation, {
    x: 0, y: 0, duration: 1.5, ease: 'elastic.out(1, 0.5)',
  });
});
```

### 11.3 DeviceOrientation (мобільні)

```js
window.addEventListener('deviceorientation', (e) => {
  if (!e.beta || !e.gamma) return;
  // beta: −180/180 (нахил вперед/назад), gamma: −90/90 (нахил ліво/право)
  const tiltX = (e.beta  / 180) * PARALLAX_INTENSITY;
  const tiltY = (e.gamma / 90)  * PARALLAX_INTENSITY;
  TARGET_ROT.x = Math.max(-0.15, Math.min(0.15, tiltX));
  TARGET_ROT.y = Math.max(-0.15, Math.min(0.15, tiltY));
});
```

### 11.4 Visibility API — пауза при прихованій вкладці

```js
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    gsap.globalTimeline.pause();
    renderer.setAnimationLoop(null);
  } else {
    gsap.globalTimeline.resume();
    animate();
  }
});
```

---

## 12. Постобробка (Post-Processing)

### 12.1 EffectComposer pipeline

```js
import { EffectComposer }  from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass }      from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass }      from 'three/examples/jsm/postprocessing/OutputPass.js';

const composer = new EffectComposer(renderer);

// Pass 1: рендеринг сцени
composer.addPass(new RenderPass(scene, camera));

// Pass 2: Bloom (тонке свічення бліків)
const bloomPass = new UnrealBloomPass(
  new Vector2(container.clientWidth, container.clientHeight),
  0.25,  // strength  — сила bloom (тонка, не неонова)
  0.5,   // radius    — розмір свічення
  0.88   // threshold — поріг: тільки дуже яскраві пікселі
);
composer.addPass(bloomPass);

// Pass 3: фінальний output (tone mapping + color space)
composer.addPass(new OutputPass());
```

### 12.2 Параметри Bloom

| Параметр / Властивість | Значення | Пояснення |
|---|---|---|
| `strength` | `0.25` | Сила свічення. НЕ перевищувати `0.4` — інакше 'неоновий' ефект |
| `radius` | `0.50` | Розмір ореолу навколо бліків |
| `threshold` | `0.88` | Поріг яскравості. `0.88` = тільки найяскравіші 12% пікселів |

> 💡 `UnrealBloomPass` може впливати на прозорість фону (alpha). Якщо alpha canvas пошкоджений — замінити на `ShaderPass` з кастомним bloom shader або використати `@pmndrs/postprocessing` пакет.

---

## 13. Публічний API класу LogoScene

### 13.1 Ініціалізація

```js
import { LogoScene } from 'logo-animation';

const scene = new LogoScene({
  container:   document.querySelector('#logo-wrap'),
  variant:     1,           // 1 або 2 (логотип №1 або №2)
  mode:        'both',      // 'rotate' | 'shine' | 'both' | 'none'
  hdrPath:     '/assets/studio_small.hdr',
  interactive: true,        // mouse parallax + device orientation
});

await scene.init(); // асинхронне завантаження HDR
```

### 13.2 Методи

| Метод | Тип | Пояснення |
|---|---|---|
| `scene.init()` | `Promise<void>` | Ініціалізація: renderer, scene, lights, geometry, animation |
| `scene.setMode(mode)` | `void` | Перемикання режиму: `'rotate'` \| `'shine'` \| `'both'` \| `'none'` |
| `scene.setColor(hex)` | `void` | Змінити базовий колір: `scene.setColor('#FF6633')` |
| `scene.pause()` | `void` | Призупинити всю анімацію (GSAP + RAF) |
| `scene.resume()` | `void` | Відновити анімацію |
| `scene.resize()` | `void` | Примусово оновити розмір (якщо ResizeObserver не спрацював) |
| `scene.screenshot()` | `string` | Повертає data URL PNG поточного кадру |
| `scene.dispose()` | `void` | **КРИТИЧНО:** знищити WebGL-контекст, зупинити RAF, прибрати listeners |

> ⚠️ `scene.dispose()` **ОБОВ'ЯЗКОВО** викликати при unmount компонента (React `useEffect` cleanup, Vue `onUnmounted`). Без цього — memory leak WebGL context.

### 13.3 Приклад React-інтеграції

```jsx
import { useEffect, useRef } from 'react';
import { LogoScene } from 'logo-animation';

export function LogoWidget({ variant = 1 }) {
  const containerRef = useRef(null);
  const sceneRef     = useRef(null);

  useEffect(() => {
    const scene = new LogoScene({
      container: containerRef.current,
      variant,
      mode:    'both',
      hdrPath: '/assets/studio_small.hdr',
    });
    sceneRef.current = scene;
    scene.init();
    return () => scene.dispose(); // cleanup при unmount
  }, [variant]);

  return <div ref={containerRef} style={{ width: 200, height: 200 }} />;
}
```

---

## 14. Graceful Degradation (WebGL fallback)

```js
// src/utils/detectWebGL.js
export function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    );
  } catch (e) { return false; }
}

// У LogoScene.init():
if (!isWebGLAvailable()) {
  // Показати статичний SVG fallback
  container.innerHTML = `<img src='/logo_${variant}_fallback.svg'
    style='width:100%;height:100%;' alt='Logo' />`;
  return;
}
```

Статичний SVG-файл для fallback — це просто один кадр із SVG-прототипу (референсний SVG). Без анімації, але форма та кольори ідентичні.

---

## 15. Вимоги до продуктивності

### 15.1 Цільові метрики

| Параметр / Властивість | Значення | Пояснення |
|---|---|---|
| Frame Rate | 60 fps stable | На GPU: GTX 1060 / RX 580 / Apple M1 та вище |
| Frame Rate (mobile) | ≥ 30 fps | На мобільних GPU: Adreno 640 / Apple A14 |
| JS Bundle (gzip) | ≤ 150 KB | Three.js tree-shaking + GSAP + логотип-код |
| HDR Texture | ≤ 150 KB (1K .hdr) | 512×256 px, enough for logo |
| Memory (GPU) | ≤ 64 MB VRAM | Для двох одночасних логотипів на сторінці |
| First Paint | ≤ 300 ms | До першого відрендереного кадру після `init()` |
| Init (JS parse+exec) | ≤ 100 ms | Cold start на desktop (Core i5 / M1) |

### 15.2 Оптимізаційні правила

- **Pixel Ratio максимум 2:** `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))` — уникнути 3x на Pro-дисплеях.
- **Dispose невикористаних ресурсів:** `geometry.dispose()`, `material.dispose()`, `texture.dispose()` у `scene.dispose()`.
- **Кількість полігонів:** `curveSegments ≤ 64`, `bevelSegments ≤ 8` — достатньо для crisp curves.
- **Одна HDR текстура на всі instance:** завантажити один раз, передати як параметр у конфіг.
- **Throttle mousemove:** якщо parallax викликає drop fps — throttle до 30 Hz (кожні 33ms).
- **Не використовувати shadow maps:** логотип не потребує тіней. `renderer.shadowMap.enabled = false`.
- **На мобільних:** автоматично вимкнути bloom (перевірити `/Mobi/i.test(navigator.userAgent)`).

---

## 16. Обсяг роботи (Scope)

### 16.1 Що входить у скоуп

- Повний JS-модуль `logo-animation` з усіма класами (`LogoScene`, `LogoGeometry`, `LogoMaterial`, `LogoLighting`, `LogoAnimation`, `LogoInteraction`, `PostProcessing`).
- Два конфіг-файли: `logo1.config.js` та `logo2.config.js`.
- Два SVG fallback файли: `logo_1_fallback.svg` та `logo_2_fallback.svg`.
- HDR-текстура оточення: `studio_small_1k.hdr` (або посилання на Poly Haven).
- Demo-сторінка: `demo/index.html` з обома логотипами та UI для перемикання режимів.
- `README.md`: інструкція з установки, API опис, приклади для React/Vue/Vanilla JS.
- Тестування у Chrome, Firefox, Safari, Edge (desktop + mobile).

### 16.2 Що НЕ входить у скоуп

- Backend або SSR (Next.js ISR, Nuxt) — тільки клієнтський код.
- Тест у IE11 або старих браузерах без WebGL2.
- Particle systems, fluid simulation, complex shader effects поза специфікацією.
- CSS-анімація або SVG-анімація як основне рішення — тільки Three.js WebGL.
- Звукові ефекти.
- Темна/світла тема — один варіант кольорів.
- Власний GLSL-шейдер для матеріалу (якщо MeshPhysicalMaterial достатній).

---

## 17. Відкриті питання

**Питання 1: Точна геометрія Логотипу №2 у вигляді SVG path-даних?**

Рішення: Надати SVG-файл або path-рядки до початку роботи над `logo2.config.js`. Якщо недоступно — художник будує наближення та документує коментарем `// APPROXIMATION`.

**Питання 2: Де хоститься HDR-файл (bundle vs CDN)?**

Рішення: За замовчуванням — у `/public/assets/` проекту. Якщо критичний LCP — перенести на CDN із `preload` link. Альтернатива: використати `THREE.RoomEnvironment` (синтетичне середовище, без `.hdr` файлу, +0 KB).

**Питання 3: Чи потрібна підтримка WebGL1 (Safari < 15, Firefox Android)?**

Рішення: `MeshPhysicalMaterial.transmission` потребує WebGL2. Для WebGL1 — fallback на статичний SVG. Частка WebGL1-only браузерів < 2% (2026).

**Питання 4: Чи можуть два логотипи відображатись на одній сторінці одночасно?**

Рішення: Так — кожен instance `LogoScene` створює окремий `WebGLRenderer` та canvas. Два renderer на сторінці — норма, але треба обережно з VRAM. Якщо потрібен shared renderer — передбачити `SharedRendererContext` (опційно).

**Питання 5: Яка поведінка на тачскрінах без миші?**

Рішення: `DeviceOrientation` (розділ 11.3) замінює mouse parallax на мобільних. Якщо `DeviceOrientation` недоступний (десктоп без mouse) — анімація просто loop без parallax.

---

## 18. Ризики та мітигація

**Ризик 1: MeshPhysicalMaterial.transmission виглядає «матовим» або сірим.**

Мітигація: Перевірити, що `scene.environment` встановлена (не null). Перевірити `renderer.outputColorSpace = SRGBColorSpace`. Перевірити `transparent: true` на матеріалі. Перевірити `depthWrite: false`.

**Ризик 2: Bloom Pass руйнує alpha-канал canvas (прозорий фон стає білим).**

Мітигація: Замінити `UnrealBloomPass` на `SelectiveBloomPass` або використати `@pmndrs/postprocessing` з `BloomEffect` (підтримує alpha). Альтернатива: рендерити bloom в offscreen canvas, зливати через CSS `mix-blend-mode`.

**Ризик 3: Низький FPS на мобільних через transmission material.**

Мітигація: На мобільних автоматично знижувати якість: вимкнути bloom, зменшити `pixelRatio` до 1, спростити матеріал (замінити `transmission` на `opacity 0.7` + `envMap`).

**Ризик 4: SVG PathData для D-форм некоректно парситься SVGLoader.**

Мітигація: Протестувати `svgPathToShape()` з реальними path-рядками логотипу на ранньому етапі. Альтернатива: вручну побудувати `THREE.Shape` через `QuadraticBezierCurve3` / `CubicBezierCurve3`.

**Ризик 5: Memory leak при hot reload або SPA навігації (React/Vue).**

Мітигація: `scene.dispose()` ОБОВ'ЯЗКОВО у cleanup-функції. Додати до `dispose()`: `renderer.forceContextLoss()`, `renderer.dispose()`, `resizeObserver.disconnect()`.

---

## 19. Стильові обмеження

> Преміальний, мінімальний, елегантний рух. Логотип — тихий підпис бренду, а не центр уваги.

- **Bloom** — ледь помітний (`strength ≤ 0.3`). НЕ неоновий, НЕ «cyberpunk» ефект.
- **Паралакс** — тонкий (`PARALLAX_INTENSITY ≤ 0.1 rad`). Має відчуватись як вага скла, а не гімнастика.
- Жодного тексту, частинок, trails, lens flare, додаткових геометрій понад форми логотипу.
- Колірна система — холодний синьо-кристалічний діапазон. Ніяких теплих тонів, ніяких випадкових кольорів.
- Кадр завжди чистий: `scene.background = null`, прозорий canvas — логотип живе на тлі сторінки.

---

## 20. Чек-ліст здачі

Перед фінальною здачею розробник підтверджує кожен пункт:

- [ ] `src/` повністю реалізований: всі 8 класів/модулів із розділу 4
- [ ] `dist/logo-animation.esm.js` та `dist/logo-animation.umd.js` зібрані
- [ ] Розмір ESM bundle ≤ 150 KB gzip (перевірити `vite build --report`)
- [ ] `demo/index.html`: обидва логотипи, UI-перемикач режимів
- [ ] `MeshPhysicalMaterial.transmission` виглядає як скло (не сірий пластик)
- [ ] 60 fps у Chrome Desktop DevTools Performance profiler
- [ ] Seamless loop: немає стрибка у мікро-обертанні та shine
- [ ] Mouse parallax працює плавно (lerp, без стрибків)
- [ ] canvas alpha: прозорий фон на білій та темній сторінці
- [ ] `scene.dispose()` не лишає memory leak (перевірити у Chrome Memory profiler)
- [ ] WebGL fallback: показує SVG якщо WebGL недоступний
- [ ] Мобільний тест: iPhone Safari + Android Chrome, ≥ 30 fps
- [ ] `README.md`: npm install, API table, React/Vue приклади

---

*PRD — Анімація логотипу у Three.js · v3.0 · Березень 2026*

*Внутрішній документ · Three.js r165+ · GSAP 3.x · MeshPhysicalMaterial + Transmission*
