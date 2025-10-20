import { useEffect, useRef } from "react";

export default function Background() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number }[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const numParticles = 120;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();

    const particles = particlesRef.current;
    particles.length = 0;

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
      });
    }

    // Draw torch-light as soft radial gradient ellipse
    const drawTorchLight = (x: number, y: number, width: number, height: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);

      // radial gradient to mimic torch light
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, width);
      gradient.addColorStop(0, "rgba(139,92,246,0.25)"); // strong purple
      gradient.addColorStop(0.3, "rgba(59,130,246,0.08)"); // soft blue
      gradient.addColorStop(1, "rgba(17,24,39,0)"); // fade to dark

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(0, 0, width, height, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const draw = () => {
      // Dark background
      ctx.fillStyle = "rgb(17,24,39)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Torch-light gradients at the same positions
      drawTorchLight(350, canvas.height - 250, 500, 600, -0.3); // bottom-left
      drawTorchLight(canvas.width - 300, 150, 500, 600, 0); // top-right

      // Draw particles
      for (const p of particles) {
        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = Math.max(150 - dist, 0) / 150;

        p.vx += (dx / dist) * force * -0.02;
        p.vy += (dy / dist) * force * -0.02;

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        const particleGradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 5);
        particleGradient.addColorStop(0, "rgba(255,255,255,0.2)");
        particleGradient.addColorStop(1, "rgba(255,255,255,0.05)");

        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = particleGradient;
        ctx.fill();
      }

      requestAnimationFrame(draw);
    };

    draw();

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full z-[-1]"
    />
  );
}
