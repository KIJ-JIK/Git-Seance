'use client';

import { useEffect, useRef, useState } from 'react';

const TOTAL_FRAMES = 144;
const FRAME_PATH_PREFIX = '/assets/aurix/exploded-frames/ezgif-frame-';

interface DynamicGhostBackgroundProps {
  isSummoning?: boolean;
  opacity?: number;
}

export default function DynamicGhostBackground({
  isSummoning = false,
  opacity = 0.55,
}: DynamicGhostBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameIndexRef = useRef<number>(1);
  const directionRef = useRef<number>(1);
  const [loadedCount, setLoadedCount] = useState<number>(0);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Preload frames incrementally
  useEffect(() => {
    let isCancelled = false;
    const images: HTMLImageElement[] = [];

    // Preload first frame immediately for instant display
    const firstImg = new Image();
    firstImg.src = `${FRAME_PATH_PREFIX}001.jpg`;
    firstImg.onload = () => {
      if (!isCancelled) {
        images[1] = firstImg;
        setLoadedCount(1);
      }
    };

    // Preload remaining frames
    for (let i = 2; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const paddedIndex = String(i).padStart(3, '0');
      img.src = `${FRAME_PATH_PREFIX}${paddedIndex}.jpg`;
      img.onload = () => {
        if (!isCancelled) {
          images[i] = img;
          setLoadedCount((c) => c + 1);
        }
      };
      images[i] = img;
    }

    imagesRef.current = images;

    return () => {
      isCancelled = true;
    };
  }, []);

  // Render loop using Canvas for peak performance and zero DOM thrashing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle canvas resize to maintain sharp aspect ratio
    const updateCanvasSize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Frame rate target: 24 FPS in ambient mode, 36 FPS when summoning
    const targetFps = isSummoning ? 36 : 24;
    const interval = 1000 / targetFps;

    const render = (time: number) => {
      if (time - lastTimeRef.current >= interval) {
        lastTimeRef.current = time;

        const currentIdx = Math.floor(frameIndexRef.current);
        const img = imagesRef.current[currentIdx];

        if (img && img.complete && img.naturalWidth > 0) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw image to cover canvas (like object-fit: cover)
          const imgAspect = img.naturalWidth / img.naturalHeight;
          const canvasAspect = canvas.width / canvas.height;

          let drawWidth = canvas.width;
          let drawHeight = canvas.height;
          let offsetX = 0;
          let offsetY = 0;

          if (canvasAspect > imgAspect) {
            drawHeight = canvas.width / imgAspect;
            offsetY = (canvas.height - drawHeight) / 2;
          } else {
            drawWidth = canvas.height * imgAspect;
            offsetX = (canvas.width - drawWidth) / 2;
          }

          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        }

        // Frame advancement logic
        if (isSummoning) {
          // Rush to frame 144 when summoning
          if (frameIndexRef.current < TOTAL_FRAMES) {
            frameIndexRef.current = Math.min(TOTAL_FRAMES, frameIndexRef.current + 2);
          }
        } else {
          // Ambient ping-pong or continuous loop
          frameIndexRef.current += directionRef.current * 0.75;
          if (frameIndexRef.current >= TOTAL_FRAMES) {
            frameIndexRef.current = TOTAL_FRAMES;
            directionRef.current = -1;
          } else if (frameIndexRef.current <= 1) {
            frameIndexRef.current = 1;
            directionRef.current = 1;
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [isSummoning]);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden select-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {/* Dynamic Hardware/Ghost Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover transition-opacity duration-1000"
        style={{
          opacity: loadedCount > 0 ? opacity : 0,
          filter: 'contrast(1.08) brightness(0.9)',
        }}
      />

      {/* Atmospheric Vignette & Vignette Mask for High Contrast Readability */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(10, 10, 15, 0.4) 0%, rgba(10, 10, 15, 0.75) 60%, rgba(10, 10, 15, 0.95) 100%)',
        }}
      />

      {/* Top and Bottom Fog/Scanline Gradient Bleed */}
      <div
        className="absolute inset-x-0 top-0 h-40"
        style={{
          background: 'linear-gradient(to bottom, rgba(10, 10, 15, 0.9), transparent)',
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-40"
        style={{
          background: 'linear-gradient(to top, rgba(10, 10, 15, 0.95), transparent)',
        }}
      />
    </div>
  );
}
