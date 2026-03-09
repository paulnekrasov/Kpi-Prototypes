import gsap from 'gsap';
import { Vector3 } from 'three';

export class LogoAnimation {
  constructor({ motionGroup, shineLight }) {
    this.motionGroup = motionGroup;
    this.shineLight = shineLight;
    this.mode = 'both';
    this.baseTilt = -Math.PI / 12;
    this.rotAmount = Math.PI / 60;

    this.rotateLoop = gsap.timeline({
      paused: true,
      repeat: -1,
      yoyo: true,
      defaults: { duration: 2.8, ease: 'sine.inOut' },
    });

    this.shineLoop = gsap.timeline({
      paused: true,
      repeat: -1,
      repeatDelay: 1.2,
    });

    this.initTimelines();
  }

  initTimelines() {
    const shineStart = new Vector3(-4.2, 1.6, 2.1);
    const shinePeak = new Vector3(0.2, 0.45, 2.65);
    const shineEnd = new Vector3(4.2, -1.1, 2.1);

    this.motionGroup.rotation.z = this.baseTilt;
    this.motionGroup.position.set(0, 0, 0);
    this.shineLight.position.copy(shineStart);
    this.shineLight.intensity = 0;

    this.rotateLoop
      .to(this.motionGroup.rotation, { z: this.baseTilt + this.rotAmount })
      .to(this.motionGroup.position, { x: 0.08, y: 0.06 }, '<');

    this.shineLoop
      .to(this.shineLight.position, {
        x: shinePeak.x,
        y: shinePeak.y,
        z: shinePeak.z,
        duration: 0.9,
        ease: 'power2.in',
      })
      .to(this.shineLight, {
        intensity: 4.25,
        duration: 0.9,
        ease: 'power2.in',
      }, '<')
      .to(this.shineLight.position, {
        x: shineEnd.x,
        y: shineEnd.y,
        z: shineEnd.z,
        duration: 0.9,
        ease: 'power2.out',
      })
      .to(this.shineLight, {
        intensity: 0,
        duration: 0.9,
        ease: 'power2.out',
      }, '<')
      .set(this.shineLight.position, {
        x: shineStart.x,
        y: shineStart.y,
        z: shineStart.z,
      })
      .set(this.shineLight, { intensity: 0 });
  }

  setMode(mode) {
    this.mode = mode;

    if (mode === 'none') {
      this.pause();
      return;
    }

    if (mode === 'rotate') {
      this.rotateLoop.play();
      this.shineLoop.pause(0);
      this.shineLight.intensity = 0;
      return;
    }

    if (mode === 'shine') {
      this.rotateLoop.pause(0);
      this.motionGroup.rotation.z = this.baseTilt;
      this.motionGroup.position.set(0, 0, 0);
      this.shineLoop.play();
      return;
    }

    this.rotateLoop.play();
    this.shineLoop.play();
  }

  pause() {
    this.rotateLoop.pause();
    this.shineLoop.pause();
    this.shineLight.intensity = 0;
  }

  resume() {
    this.setMode(this.mode);
  }

  dispose() {
    this.rotateLoop.kill();
    this.shineLoop.kill();
    this.shineLight.intensity = 0;
  }
}
