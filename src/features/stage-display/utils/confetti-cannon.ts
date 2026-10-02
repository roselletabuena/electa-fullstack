/**
 * Lightweight 60fps HTML5 Canvas particle & confetti explosion engine.
 * Renders metallic gold, silver, cyan, and copper ribbons for stage winner announcements.
 */

interface Particle {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  decay: number;
}

const LUXURY_PALETTE = [
  "#F59E0B", // Amber Gold
  "#FBBF24", // Light Gold
  "#FEF08A", // Pale Gold
  "#06B6D4", // Neon Cyan
  "#22D3EE", // Electric Cyan
  "#E2E8F0", // Platinum Silver
  "#CBD5E1", // Metallic Slate
  "#FB923C", // Copper Bronze
];

export class ConfettiCannon {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private particles: Particle[] = [];
  private animationFrameId: number | null = null;
  private isRunning = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.resize();
  }

  public resize(): void {
    if (typeof window === "undefined") return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  public fire(particleCount = 180): void {
    if (!this.ctx) return;
    this.resize();

    const originX = this.canvas.width / 2;
    const originY = this.canvas.height * 0.4;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 16 + 6;
      const color = LUXURY_PALETTE[Math.floor(Math.random() * LUXURY_PALETTE.length)] ?? "#F59E0B";

      this.particles.push({
        x: originX,
        y: originY,
        w: Math.random() * 10 + 6,
        h: Math.random() * 6 + 4,
        color,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 8, // strong upward thrust
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 15,
        opacity: 1,
        decay: Math.random() * 0.008 + 0.004,
      });
    }

    if (!this.isRunning) {
      this.isRunning = true;
      this.animate();
    }
  }

  private animate = (): void => {
    if (!this.ctx) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      if (!p) continue;

      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.vx *= 0.985; // air resistance
      p.rotation += p.rotationSpeed;
      p.opacity -= p.decay;

      if (p.opacity <= 0 || p.y > this.canvas.height + 50) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = Math.max(0, p.opacity);
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animationFrameId = requestAnimationFrame(this.animate);
    } else {
      this.isRunning = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  };

  public stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.particles = [];
    this.isRunning = false;
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}
