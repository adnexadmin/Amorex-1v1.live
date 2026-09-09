import React, { useEffect, useRef } from 'react';
import { VideoFilterType } from '../../types';

interface RomanticOverlaysLayerProps {
  filterType: VideoFilterType;
  intensity: number; // 0 - 100
  enabled?: boolean;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  maxOpacity: number;
  type: 'heart' | 'petal' | 'sparkle' | 'bokeh' | 'candle-ember';
  color: string;
}

export const RomanticOverlaysLayer: React.FC<RomanticOverlaysLayerProps> = ({
  filterType,
  intensity,
  enabled = true,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!enabled || filterType === 'none' || filterType === 'sepia' || filterType === 'vintage-noir') {
      // Clear canvas if filter has no particles
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = canvas.parentElement.clientHeight;
      }
    };

    window.addEventListener('resize', handleResize);

    // Determine particle count based on intensity
    const factor = Math.max(0.2, intensity / 100);
    const particleCount = Math.floor(24 * factor);

    const particles: Particle[] = [];

    const getParticleConfig = (type: VideoFilterType) => {
      switch (type) {
        case 'heart-aura':
        case 'romantic':
          return {
            type: 'heart' as const,
            colors: ['rgba(255, 23, 68, ', 'rgba(255, 46, 147, ', 'rgba(255, 105, 180, ', 'rgba(255, 182, 193, '],
            speedY: -0.7,
            speedX: 0.35
          };
        case 'sparkle-glow':
          return {
            type: 'sparkle' as const,
            colors: ['rgba(255, 215, 0, ', 'rgba(255, 255, 255, ', 'rgba(244, 114, 182, ', 'rgba(192, 132, 252, '],
            speedY: -0.45,
            speedX: 0.25
          };
        case 'vintage-love':
          return {
            type: 'bokeh' as const,
            colors: ['rgba(251, 191, 36, ', 'rgba(245, 158, 11, ', 'rgba(244, 63, 94, ', 'rgba(253, 230, 138, '],
            speedY: -0.5,
            speedX: 0.2
          };
        case 'cherry-blossom':
          return {
            type: 'petal' as const,
            colors: ['rgba(255, 192, 203, ', 'rgba(255, 182, 193, ', 'rgba(254, 215, 226, '],
            speedY: 0.75, // Petals drift down
            speedX: 0.5
          };
        case 'candlelight':
          return {
            type: 'candle-ember' as const,
            colors: ['rgba(251, 146, 60, ', 'rgba(245, 158, 11, ', 'rgba(253, 230, 138, '],
            speedY: -0.8,
            speedX: 0.2
          };
        case 'dreamy':
          return {
            type: 'sparkle' as const,
            colors: ['rgba(192, 132, 252, ', 'rgba(232, 121, 249, ', 'rgba(255, 255, 255, '],
            speedY: -0.4,
            speedX: 0.2
          };
        case 'golden-hour':
          return {
            type: 'bokeh' as const,
            colors: ['rgba(251, 191, 36, ', 'rgba(245, 158, 11, ', 'rgba(254, 240, 138, '],
            speedY: -0.45,
            speedX: 0.25
          };
        case 'beauty-mode':
        case 'soft-glow':
        default:
          return {
            type: 'sparkle' as const,
            colors: ['rgba(255, 255, 255, ', 'rgba(255, 182, 193, ', 'rgba(255, 215, 0, '],
            speedY: -0.5,
            speedX: 0.2
          };
      }
    };

    const config = getParticleConfig(filterType);

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 8 + 6,
        speedY: config.speedY * (0.6 + Math.random() * 0.8),
        speedX: (Math.random() - 0.5) * config.speedX,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.03,
        opacity: Math.random() * 0.5 + 0.2,
        maxOpacity: (Math.random() * 0.4 + 0.3) * factor,
        type: config.type,
        color: config.colors[Math.floor(Math.random() * config.colors.length)]
      });
    }

    const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.beginPath();
      const s = size / 16;
      ctx.moveTo(0, s * -4);
      ctx.bezierCurveTo(s * 5, s * -10, s * 10, s * -2, 0, s * 8);
      ctx.bezierCurveTo(s * -10, s * -2, s * -5, s * -10, 0, s * -4);
      ctx.fillStyle = `${color}${alpha})`;
      ctx.shadowColor = `${color}0.8)`;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
    };

    const drawPetal = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rot: number, color: string, alpha: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.9, size * 0.4, Math.PI / 4, 0, 2 * Math.PI);
      ctx.fillStyle = `${color}${alpha})`;
      ctx.shadowColor = `${color}0.6)`;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.restore();
    };

    const drawSparkle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rot: number, color: string, alpha: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.beginPath();
      // 4-pointed diamond star
      const r = size * 0.75;
      ctx.moveTo(0, -r);
      ctx.quadraticCurveTo(0, 0, r, 0);
      ctx.quadraticCurveTo(0, 0, 0, r);
      ctx.quadraticCurveTo(0, 0, -r, 0);
      ctx.quadraticCurveTo(0, 0, 0, -r);
      ctx.fillStyle = `${color}${alpha})`;
      ctx.shadowColor = `${color}0.9)`;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();
    };

    const drawBokeh = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha: number) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, size * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `${color}${alpha * 0.5})`;
      ctx.shadowColor = `${color}0.5)`;
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.restore();
    };

    let candleFlickerPhase = 0;
    let auraPhase = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Heart Aura pulsating romantic vignette
      if (filterType === 'heart-aura') {
        auraPhase += 0.035;
        const auraPulse = Math.sin(auraPhase) * 0.04;
        const grad = ctx.createRadialGradient(
          width / 2,
          height / 2,
          width * 0.15,
          width / 2,
          height / 2,
          width * 0.65
        );
        const auraAlpha = Math.max(0.05, 0.16 * factor + auraPulse);
        grad.addColorStop(0, 'rgba(255, 46, 147, 0)');
        grad.addColorStop(0.7, `rgba(255, 23, 68, ${auraAlpha * 0.6})`);
        grad.addColorStop(1, `rgba(225, 29, 72, ${auraAlpha})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

      // Candlelight subtle ambient breathing flicker vignette
      if (filterType === 'candlelight') {
        candleFlickerPhase += 0.05;
        const flicker = Math.sin(candleFlickerPhase) * 0.03 + Math.cos(candleFlickerPhase * 1.7) * 0.02;
        const grad = ctx.createRadialGradient(
          width / 2,
          height / 2,
          width * 0.2,
          width / 2,
          height / 2,
          width * 0.7
        );
        const candleAlpha = Math.max(0.04, 0.12 * factor + flicker);
        grad.addColorStop(0, 'rgba(251, 146, 60, 0)');
        grad.addColorStop(1, `rgba(217, 119, 6, ${candleAlpha})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

      // Vintage Love gentle warm amber film vignette
      if (filterType === 'vintage-love') {
        auraPhase += 0.02;
        const subtleGrain = Math.sin(auraPhase * 3) * 0.015;
        const grad = ctx.createRadialGradient(
          width / 2,
          height / 2,
          width * 0.25,
          width / 2,
          height / 2,
          width * 0.75
        );
        const vintageAlpha = Math.max(0.04, 0.14 * factor + subtleGrain);
        grad.addColorStop(0, 'rgba(251, 191, 36, 0)');
        grad.addColorStop(1, `rgba(180, 83, 9, ${vintageAlpha})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

      // Render each romantic particle
      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.y * 0.02) * 0.3;
        p.rotation += p.rotationSpeed;

        // Wrap around boundaries
        if (config.speedY < 0 && p.y < -30) {
          p.y = height + 20;
          p.x = Math.random() * width;
        } else if (config.speedY > 0 && p.y > height + 30) {
          p.y = -20;
          p.x = Math.random() * width;
        }

        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        switch (p.type) {
          case 'heart':
            drawHeart(ctx, p.x, p.y, p.size, p.color, p.maxOpacity);
            break;
          case 'petal':
            drawPetal(ctx, p.x, p.y, p.size, p.rotation, p.color, p.maxOpacity);
            break;
          case 'sparkle':
            drawSparkle(ctx, p.x, p.y, p.size, p.rotation, p.color, p.maxOpacity);
            break;
          case 'bokeh':
          case 'candle-ember':
            drawBokeh(ctx, p.x, p.y, p.size, p.color, p.maxOpacity);
            break;
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [filterType, intensity, enabled]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 z-10 w-full h-full ${className}`}
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
