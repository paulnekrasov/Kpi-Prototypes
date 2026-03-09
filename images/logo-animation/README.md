# Logo Animation

Standalone Three.js logo mark preview built from the icon paths in `../Logo.svg`.

## Scripts

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`

## Notes

- The demo keeps the canvas transparent so the mark can be checked on light, dark, and checker surfaces.
- Motion is reduced automatically when `prefers-reduced-motion: reduce` is enabled.
- WebGL failure falls back to a static SVG mark.

## React / Next.js Adapter

Keep the scene imperative and wrap it with a thin client component.

```tsx
import dynamic from "next/dynamic";

const LogoMarkCanvas = dynamic(
  () => import("./LogoMarkCanvas").then((mod) => mod.LogoMarkCanvas),
  { ssr: false }
);
```

```tsx
"use client";

import { useEffect, useRef } from "react";
import { LogoScene } from "./src/LogoScene";

export function LogoMarkCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new LogoScene({ container: containerRef.current });
    scene.init();

    return () => scene.dispose();
  }, []);

  return <div ref={containerRef} style={{ width: 320, height: 320 }} />;
}
```
