import {
  ACESFilmicToneMapping,
  Box3,
  Clock,
  Group,
  PMREMGenerator,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

import fallbackUrl from './assets/logo-mark-fallback.svg';
import { LogoAnimation } from './LogoAnimation.js';
import { buildLogoGroup, disposeLogoGroup } from './LogoGeometry.js';
import { LogoInteraction } from './LogoInteraction.js';
import { setupLighting, disposeLights } from './LogoLighting.js';
import {
  createLogoMaterials,
  disposeLogoMaterials,
  updateLogoMaterialColors,
} from './LogoMaterial.js';
import { LOGO_1_CONFIG } from './configs/logo1.config.js';
import { isWebGLAvailable } from './utils/detectWebGL.js';

export class LogoScene {
  constructor({
    container,
    mode = 'both',
    interactive = true,
    transparent = true,
    quality = 'auto',
  }) {
    this.container = container;
    this.mode = mode;
    this.interactive = interactive;
    this.transparent = transparent;
    this.quality = quality;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.materials = null;
    this.lights = null;
    this.logoGroup = null;
    this.floatGroup = null;
    this.animation = null;
    this.interaction = null;
    this.resizeObserver = null;
    this.environmentMap = null;
    this.fallbackNode = null;
    this.clock = new Clock();
    this.rafId = 0;
    this.userPaused = false;
    this.visibilityPaused = false;
    this.disposed = false;
    this.initialized = false;

    this.logoBounds = null;
    this.logoRadius = 0;

    this.isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    this.reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');

    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleReducedMotionChange = this.handleReducedMotionChange.bind(this);
  }

  async init() {
    if (this.disposed || this.initialized) {
      return;
    }

    if (!isWebGLAvailable()) {
      this.renderFallback();
      return;
    }

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(35, 1, 0.1, 100);
    this.camera.position.set(0, 0, 8.25);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new WebGLRenderer({
      alpha: this.transparent,
      antialias: !this.isCoarsePointer,
      powerPreference: 'high-performance',
    });
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.setClearAlpha(0);
    this.renderer.setPixelRatio(this.getPixelRatio());
    this.container.replaceChildren(this.renderer.domElement);

    const pmremGenerator = new PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();
    this.environmentMap = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = this.environmentMap;
    pmremGenerator.dispose();

    this.materials = createLogoMaterials();
    this.logoGroup = buildLogoGroup(LOGO_1_CONFIG, this.materials);
    this.floatGroup = new Group();
    this.floatGroup.name = 'Logo_Float_Group';
    this.floatGroup.add(this.logoGroup);
    this.scene.add(this.floatGroup);

    const bounds = new Box3().setFromObject(this.floatGroup);
    const size = new Vector3();
    bounds.getSize(size);
    const maxDimension = Math.max(size.x, size.y);
    this.logoBounds = bounds;
    this.logoRadius = (maxDimension || 1) * 0.5;

    this.lights = setupLighting(this.scene);
    this.animation = new LogoAnimation({
      motionGroup: this.logoGroup,
      shineLight: this.lights.shineLight,
    });
    this.interaction = new LogoInteraction({
      canvas: this.renderer.domElement,
      motionGroup: this.logoGroup,
      enabled: this.interactive && !this.isCoarsePointer && !this.reducedMotionMedia.matches,
    });

    this.resizeObserver = new ResizeObserver(() => {
      this.resize();
    });
    this.resizeObserver.observe(this.container);

    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    this.subscribeReducedMotion();

    this.initialized = true;
    this.resize();
    this.setMode(this.mode);
    this.renderOnce();
    this.start();
  }

  updateCameraForAspect(aspect) {
    if (!this.camera || !this.logoRadius) {
      return;
    }

    const fovRadians = (this.camera.fov * Math.PI) / 180;
    const halfFovY = Math.tan(fovRadians / 2);
    const halfFovX = halfFovY * aspect;
    const limitingHalfFov = Math.min(halfFovX, halfFovY) || halfFovY;

    if (limitingHalfFov <= 0) {
      return;
    }

    const distance = (this.logoRadius * 1.2) / limitingHalfFov;
    this.camera.position.set(0, 0, distance);
    this.camera.lookAt(0, 0, 0);
  }

  getPixelRatio() {
    if (this.quality === 'low') {
      return 1;
    }

    if (this.quality === 'high') {
      return Math.min(window.devicePixelRatio, 2);
    }

    return this.isCoarsePointer ? 1 : Math.min(window.devicePixelRatio, 2);
  }

  subscribeReducedMotion() {
    if (typeof this.reducedMotionMedia.addEventListener === 'function') {
      this.reducedMotionMedia.addEventListener('change', this.handleReducedMotionChange);
      return;
    }

    this.reducedMotionMedia.addListener(this.handleReducedMotionChange);
  }

  unsubscribeReducedMotion() {
    if (typeof this.reducedMotionMedia.removeEventListener === 'function') {
      this.reducedMotionMedia.removeEventListener('change', this.handleReducedMotionChange);
      return;
    }

    this.reducedMotionMedia.removeListener(this.handleReducedMotionChange);
  }

  handleReducedMotionChange() {
    if (!this.initialized) {
      return;
    }

    this.interaction?.setEnabled(this.interactive && !this.isCoarsePointer && !this.reducedMotionMedia.matches);
    this.animation?.setMode(this.reducedMotionMedia.matches ? 'none' : this.mode);
    this.renderOnce();
  }

  handleVisibilityChange() {
    if (!this.initialized || this.userPaused) {
      return;
    }

    if (document.hidden) {
      this.visibilityPaused = true;
      this.stop();
      this.animation?.pause();
      return;
    }

    if (this.visibilityPaused) {
      this.visibilityPaused = false;
      this.animation?.resume();
      this.start();
    }
  }

  renderFallback() {
    const fallbackImage = document.createElement('img');
    fallbackImage.src = fallbackUrl;
    fallbackImage.alt = 'Logo mark fallback';
    fallbackImage.loading = 'eager';
    fallbackImage.decoding = 'async';
    fallbackImage.style.width = '100%';
    fallbackImage.style.height = '100%';
    fallbackImage.style.objectFit = 'contain';
    fallbackImage.style.display = 'block';
    this.fallbackNode = fallbackImage;
    this.container.replaceChildren(fallbackImage);
  }

  start() {
    if (!this.initialized || this.disposed || this.rafId) {
      return;
    }

    this.clock.getDelta();
    const renderFrame = () => {
      this.rafId = window.requestAnimationFrame(renderFrame);
      this.render();
    };
    this.rafId = window.requestAnimationFrame(renderFrame);
  }

  stop() {
    if (!this.rafId) {
      return;
    }

    window.cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }

  render() {
    if (!this.renderer || !this.scene || !this.camera) {
      return;
    }

    const elapsed = this.clock.getElapsedTime();

    if (this.floatGroup) {
      const floatOffset = this.reducedMotionMedia.matches ? 0 : Math.sin(elapsed * 0.45) * 0.08;
      this.floatGroup.position.y = floatOffset;
    }

    this.interaction?.update();
    this.renderer.render(this.scene, this.camera);
  }

  renderOnce() {
    if (!this.renderer || !this.scene || !this.camera) {
      return;
    }

    this.interaction?.update(true);
    this.renderer.render(this.scene, this.camera);
  }

  setMode(mode) {
    this.mode = mode;
    this.animation?.setMode(this.reducedMotionMedia.matches ? 'none' : mode);
    this.renderOnce();
  }

  setColor(hex) {
    if (!this.materials) {
      return;
    }

    updateLogoMaterialColors(this.materials, hex);
    this.renderOnce();
  }

  pause() {
    this.userPaused = true;
    this.stop();
    this.animation?.pause();
    this.renderOnce();
  }

  resume() {
    this.userPaused = false;
    this.animation?.resume();
    if (!document.hidden) {
      this.start();
    }
  }

  resize() {
    if (!this.renderer || !this.camera) {
      return;
    }

    const width = Math.max(this.container.clientWidth, 1);
    const height = Math.max(this.container.clientHeight, 1);

    this.renderer.setPixelRatio(this.getPixelRatio());
    this.renderer.setSize(width, height, false);
    const aspect = width / height;
    this.camera.aspect = aspect;
    this.updateCameraForAspect(aspect);
    this.camera.updateProjectionMatrix();
    this.renderOnce();
  }

  dispose() {
    if (this.disposed) {
      return;
    }

    this.disposed = true;
    this.stop();
    this.unsubscribeReducedMotion();
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    this.resizeObserver?.disconnect();
    this.interaction?.dispose();
    this.animation?.dispose();

    if (this.logoGroup) {
      disposeLogoGroup(this.logoGroup);
    }

    if (this.lights && this.scene) {
      disposeLights(this.scene, this.lights);
    }

    if (this.environmentMap) {
      this.environmentMap.dispose();
      this.environmentMap = null;
    }

    if (this.materials) {
      disposeLogoMaterials(this.materials);
      this.materials = null;
    }

    if (this.scene && this.floatGroup) {
      this.scene.remove(this.floatGroup);
    }

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
      this.renderer.domElement.remove();
      this.renderer = null;
    }

    if (this.fallbackNode) {
      this.fallbackNode.remove();
      this.fallbackNode = null;
    }

    this.container.replaceChildren();
    this.scene = null;
    this.camera = null;
    this.logoGroup = null;
    this.floatGroup = null;
    this.lights = null;
    this.animation = null;
    this.interaction = null;
    this.initialized = false;
  }
}
