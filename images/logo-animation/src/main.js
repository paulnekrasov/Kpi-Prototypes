import './styles.css';

import { LogoScene } from './LogoScene.js';

const container = document.getElementById('logo-wrap');

if (!container) {
  throw new Error('Logo container element with id "logo-wrap" was not found.');
}

const scene = new LogoScene({
  container,
  mode: 'both',
  interactive: true,
  transparent: true,
  quality: 'auto',
});

window.addEventListener('beforeunload', () => {
  scene.dispose();
});

scene.init().catch((error) => {
  console.error(error);
});
