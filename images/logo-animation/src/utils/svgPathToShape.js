import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';

const loader = new SVGLoader();

export function svgPathToShape(pathData) {
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg"><path d="${pathData}"/></svg>`;
  const { paths } = loader.parse(svgString);

  if (paths.length === 0) {
    return null;
  }

  const shapes = SVGLoader.createShapes(paths[0]);
  return shapes[0] ?? null;
}
