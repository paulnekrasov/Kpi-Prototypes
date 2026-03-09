import { AmbientLight, DirectionalLight, PointLight } from 'three';

export function setupLighting(scene) {
  const ambient = new AmbientLight(0xb4beff, 0.38);
  const keyLight = new DirectionalLight(0xdce6ff, 2.5);
  const rimLight = new DirectionalLight(0xc8d2ff, 1);
  const shineLight = new PointLight(0xffffff, 0, 8);

  keyLight.position.set(-3, 4, 3.5);
  keyLight.name = 'LIGHT_Key';

  rimLight.position.set(0.5, -2, -2);
  rimLight.name = 'LIGHT_Rim';

  shineLight.position.set(-3.5, 2, 2);
  shineLight.name = 'LIGHT_Shine';

  scene.add(ambient, keyLight, rimLight, shineLight);

  return { ambient, keyLight, rimLight, shineLight };
}

export function disposeLights(scene, lights) {
  Object.values(lights).forEach((light) => {
    scene.remove(light);
  });
}
