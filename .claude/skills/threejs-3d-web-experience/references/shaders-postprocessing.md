# Shaders & Post-Processing

## ShaderMaterial Template

```js
const mat = new THREE.ShaderMaterial({
  uniforms: {
    uTime:       { value: 0.0 },
    uColor:      { value: new THREE.Color(0x00aaff) },
    uTexture:    { value: someTexture },
    uResolution: { value: new THREE.Vector2(innerWidth, innerHeight) },
    uMouse:      { value: new THREE.Vector2(0.5, 0.5) },
  },
  vertexShader: /* glsl */`
    uniform float uTime;
    varying vec2  vUv;
    varying vec3  vNormal;
    varying vec3  vWorldPos;

    void main() {
      vUv      = uv;
      vNormal  = normalize(normalMatrix * normal);
      vec4 wp  = modelMatrix * vec4(position, 1.0);
      vWorldPos = wp.xyz;
      gl_Position = projectionMatrix * viewMatrix * wp;
    }
  `,
  fragmentShader: /* glsl */`
    precision highp float;
    uniform float uTime;
    uniform vec3  uColor;
    varying vec2  vUv;
    varying vec3  vNormal;

    void main() {
      vec3 col  = uColor;
      col      += vNormal * 0.3;
      col      *= 0.5 + 0.5 * sin(uTime + vUv.x * 6.2832);
      gl_FragColor = vec4(col, 1.0);
    }
  `,
  transparent: false,
  side:        THREE.FrontSide,
  depthWrite:  true,
  wireframe:   false,
});

// In animate loop:
mat.uniforms.uTime.value = clock.getElapsedTime();
```

## RawShaderMaterial (no built-in uniforms/attributes injected)

```js
new THREE.RawShaderMaterial({
  uniforms: { ... },
  vertexShader: `
    attribute vec3 position;
    attribute vec2 uv;
    uniform mat4 projectionMatrix;
    uniform mat4 modelViewMatrix;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    precision mediump float;
    varying vec2 vUv;
    void main() { gl_FragColor = vec4(vUv, 0.0, 1.0); }
  `,
})
```

## Injecting Into Built-in Materials (onBeforeCompile)

```js
const mat = new THREE.MeshStandardMaterial({ color: 0xffffff });
mat.onBeforeCompile = (shader) => {
  // Inject a new uniform
  shader.uniforms.uTime = { value: 0 };

  // Inject at the top of vertex shader
  shader.vertexShader = `uniform float uTime;\n` + shader.vertexShader;

  // Replace a chunk
  shader.vertexShader = shader.vertexShader.replace(
    '#include <begin_vertex>',
    `#include <begin_vertex>
     transformed.y += sin(position.x * 5.0 + uTime) * 0.3;`
  );

  mat.userData.shader = shader; // store reference for update
};

// In animate loop:
if (mat.userData.shader) {
  mat.userData.shader.uniforms.uTime.value = clock.getElapsedTime();
}
```

## GLSL Utility Functions

### Simplex Noise 2D
```glsl
// Paste this above main() in your shader
vec3 mod289v3(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289v4(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289v4(((x*34.)+10.)*x);}
float snoise(vec2 v){
  const vec4 C=vec4(.211324865,.366025404,-.577350269,.024390244);
  vec2 i=floor(v+dot(v,C.yy));
  vec2 x0=v-i+dot(i,C.xx);
  vec2 i1=(x0.x>x0.y)?vec2(1,0):vec2(0,1);
  vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1;
  i=mod289v3(vec3(i,0)).xy;
  vec3 p=permute(permute(i.y+vec3(0,i1.y,1))+i.x+vec3(0,i1.x,1));
  vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);
  m=m*m*m*m;
  vec3 x=2.*fract(p*C.www)-1.;
  vec3 h=abs(x)-.5;
  vec3 ox=floor(x+.5);
  vec3 a0=x-ox;
  m*=1.79284291-.85373473*(a0*a0+h*h);
  vec3 g;
  g.x=a0.x*x0.x+h.x*x0.y;
  g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.*dot(m,g);
}
```

### Fresnel Rim Effect
```glsl
// In fragment shader (needs vNormal varying from vertex)
vec3 viewDir = normalize(cameraPosition - vWorldPos); // needs vWorldPos varying
float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0);
vec3 finalColor = mix(baseColor, rimColor, fresnel);
```

### Color Utilities
```glsl
vec3 hsl2rgb(vec3 c){
  vec3 rgb=clamp(abs(mod(c.x*6.+vec3(0,4,2),6.)-3.)-1.,0.,1.);
  return c.z+c.y*(rgb-.5)*(1.-abs(2.*c.z-1.));
}

// Remap value
float remap(float v,float inMin,float inMax,float outMin,float outMax){
  return outMin+(v-inMin)/(inMax-inMin)*(outMax-outMin);
}
```

---

## Post-Processing (EffectComposer)

### Setup
```js
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass }     from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass }     from 'three/addons/postprocessing/OutputPass.js';

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
// …add effect passes here…
composer.addPass(new OutputPass()); // ALWAYS last — handles tone mapping + colorspace

// Replace renderer.render() in loop:
// renderer.render(scene, camera);  ← remove this
composer.render();

// Resize:
composer.setSize(innerWidth, innerHeight);
```

### Unreal Bloom
```js
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const bloom = new UnrealBloomPass(
  new THREE.Vector2(innerWidth, innerHeight),
  1.5,   // strength
  0.4,   // radius
  0.85   // threshold (luminance cutoff)
);
composer.addPass(bloom);
// Control at runtime:
bloom.strength = 2.0;
bloom.threshold = 0.3;
```

### SMAA Antialiasing (recommended over MSAA with postprocessing)
```js
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
// Add before OutputPass:
composer.addPass(new SMAAPass(innerWidth * renderer.getPixelRatio(),
                               innerHeight * renderer.getPixelRatio()));
```

### FXAA (cheaper, slightly lower quality)
```js
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader }  from 'three/addons/shaders/FXAAShader.js';
const fxaa = new ShaderPass(FXAAShader);
fxaa.material.uniforms['resolution'].value.set(
  1 / (innerWidth  * renderer.getPixelRatio()),
  1 / (innerHeight * renderer.getPixelRatio())
);
composer.addPass(fxaa);
```

### Custom ShaderPass (e.g. Vignette)
```js
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

const vignettePass = new ShaderPass({
  uniforms: {
    tDiffuse:  { value: null },    // auto-wired by EffectComposer
    uStrength: { value: 0.8 },
    uOffset:   { value: 1.2 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uStrength;
    uniform float uOffset;
    varying vec2 vUv;
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      float d = distance(vUv, vec2(0.5));
      color.rgb *= smoothstep(uOffset, uOffset - uStrength, d);
      gl_FragColor = color;
    }
  `
});
composer.addPass(vignettePass);
```

### Selective Bloom (layers trick)
```js
const BLOOM_SCENE = 1;
// Mark meshes that should glow:
glowMesh.layers.enable(BLOOM_SCENE);

// Render bloom only on layer 1, then composite:
// (See three.js example: webgl_postprocessing_unreal_bloom_selective)
```

### Available Built-in Passes
```
RenderPass, OutputPass, UnrealBloomPass, SMAAPass, SSAOPass,
SSRPass, BokehPass (DOF), GlitchPass, FilmPass (grain/scanlines),
HalftonePass, DotScreenPass, AfterimagePass, OutlinePass
```
