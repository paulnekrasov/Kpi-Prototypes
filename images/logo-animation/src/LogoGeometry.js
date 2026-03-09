import { Box3, ExtrudeGeometry, Group, Mesh, Vector3 } from 'three';

import { svgPathToShape } from './utils/svgPathToShape.js';

export function buildLogoGroup(config, materials) {
  const group = new Group();

  const leftShape = svgPathToShape(config.leftOuter);
  const rightShape = svgPathToShape(config.rightOuter);

  if (!leftShape || !rightShape) {
    throw new Error('Failed to parse the logo mark geometry.');
  }

  const leftGeometry = new ExtrudeGeometry(leftShape, config.extrude);
  const rightGeometry = new ExtrudeGeometry(rightShape, config.extrude);
  leftGeometry.computeVertexNormals();
  rightGeometry.computeVertexNormals();
  leftGeometry.computeBoundingBox();
  leftGeometry.computeBoundingSphere();
  rightGeometry.computeBoundingBox();
  rightGeometry.computeBoundingSphere();

  const leftMesh = new Mesh(leftGeometry, [
    materials.frontBack,
    materials.frontBack,
    materials.bevel,
  ]);
  const rightMesh = new Mesh(rightGeometry, [
    materials.rightFrontBack,
    materials.rightFrontBack,
    materials.bevel,
  ]);

  leftMesh.name = 'Logo_Left';
  rightMesh.name = 'Logo_Right';
  group.name = 'Logo_Group';
  group.add(leftMesh, rightMesh);

  const bounds = new Box3().setFromObject(group);
  const center = new Vector3();
  bounds.getCenter(center);

  leftMesh.position.set(-center.x, -center.y, -config.extrude.depth * 0.5);
  rightMesh.position.set(-center.x, -center.y, -config.extrude.depth * 0.5);

  group.scale.set(config.scale, -config.scale, config.scale);

  return group;
}

export function disposeLogoGroup(group) {
  group.traverse((child) => {
    if (!child.isMesh) {
      return;
    }

    child.geometry?.dispose();
  });
}
