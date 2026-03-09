import { Color, DoubleSide, MeshPhysicalMaterial } from 'three';

function buildPalette(hex) {
  const base = new Color(hex);
  const right = base.clone().lerp(new Color(0xffffff), 0.18);
  const bevel = base.clone().lerp(new Color(0xffffff), 0.5);
  const attenuation = base.clone().multiplyScalar(0.55);
  const emissive = base.clone().lerp(new Color(0x4466ff), 0.35);

  return { base, right, bevel, attenuation, emissive };
}

export function createLogoMaterials(baseHex = '#2135ff') {
  const palette = buildPalette(baseHex);

  const frontBack = new MeshPhysicalMaterial({
    color: palette.base,
    metalness: 0,
    roughness: 0.06,
    transmission: 0.84,
    thickness: 0.48,
    ior: 1.52,
    transparent: true,
    opacity: 0.92,
    clearcoat: 0.64,
    clearcoatRoughness: 0.03,
    reflectivity: 0.85,
    envMapIntensity: 2.15,
    side: DoubleSide,
    depthWrite: false,
    attenuationColor: palette.attenuation,
    attenuationDistance: 0.9,
  });

  const rightFrontBack = frontBack.clone();
  rightFrontBack.color.copy(palette.right);
  rightFrontBack.roughness = 0.07;
  rightFrontBack.transmission = 0.87;
  rightFrontBack.clearcoat = 0.55;
  rightFrontBack.envMapIntensity = 2.05;

  const bevel = new MeshPhysicalMaterial({
    color: palette.bevel,
    roughness: 0,
    metalness: 0.14,
    clearcoat: 1,
    clearcoatRoughness: 0,
    envMapIntensity: 3.25,
    transmission: 0.28,
    transparent: true,
    side: DoubleSide,
    depthWrite: false,
    emissive: palette.emissive,
    emissiveIntensity: 0.2,
  });

  return { frontBack, rightFrontBack, bevel };
}

export function updateLogoMaterialColors(materials, baseHex) {
  const palette = buildPalette(baseHex);

  materials.frontBack.color.copy(palette.base);
  materials.frontBack.attenuationColor.copy(palette.attenuation);

  materials.rightFrontBack.color.copy(palette.right);
  materials.rightFrontBack.attenuationColor.copy(palette.attenuation);

  materials.bevel.color.copy(palette.bevel);
  materials.bevel.emissive.copy(palette.emissive);
}

export function disposeLogoMaterials(materials) {
  Object.values(materials).forEach((material) => {
    material.dispose();
  });
}
