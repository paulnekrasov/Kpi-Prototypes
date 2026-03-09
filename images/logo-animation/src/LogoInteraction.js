import { Vector2, Vector3 } from 'three';

export class LogoInteraction {
  constructor({ canvas, motionGroup, enabled }) {
    this.canvas = canvas;
    this.motionGroup = motionGroup;
    this.enabled = enabled;
    this.pointer = new Vector2();
    this.targetRotation = new Vector3();
    this.parallaxIntensity = 0.08;

    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerLeave = this.handlePointerLeave.bind(this);

    this.attach();
  }

  attach() {
    if (!this.enabled) {
      return;
    }

    this.canvas.addEventListener('pointermove', this.handlePointerMove, { passive: true });
    this.canvas.addEventListener('pointerleave', this.handlePointerLeave, { passive: true });
  }

  detach() {
    this.canvas.removeEventListener('pointermove', this.handlePointerMove);
    this.canvas.removeEventListener('pointerleave', this.handlePointerLeave);
  }

  setEnabled(enabled) {
    if (this.enabled === enabled) {
      return;
    }

    this.enabled = enabled;
    this.detach();
    this.targetRotation.set(0, 0, 0);

    if (enabled) {
      this.attach();
    }
  }

  handlePointerMove(event) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = ((event.clientY - rect.top) / rect.height) * 2 - 1;

    this.targetRotation.x = -this.pointer.y * this.parallaxIntensity;
    this.targetRotation.y = this.pointer.x * this.parallaxIntensity;
  }

  handlePointerLeave() {
    this.targetRotation.set(0, 0, 0);
  }

  update(force = false) {
    const damping = force ? 1 : 0.08;
    this.motionGroup.rotation.x += (this.targetRotation.x - this.motionGroup.rotation.x) * damping;
    this.motionGroup.rotation.y += (this.targetRotation.y - this.motionGroup.rotation.y) * damping;
  }

  dispose() {
    this.detach();
  }
}
