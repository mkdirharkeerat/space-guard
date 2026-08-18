import { useEffect, useRef } from 'react';

export default function DotGrid({
  className = '',
  dotSize = 1.5,
  gap = 28,
  baseColor = 'rgba(255, 255, 255, 0.08)',
  activeColor = 'rgba(59, 130, 246, 0.4)',
  proximity = 100,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let mouse = { x: -1000, y: -1000 };

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cols = Math.floor(canvas.width / gap);
      const rows = Math.floor(canvas.height / gap);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * gap + gap / 2;
          const y = j * gap + gap / 2;
          const dx = mouse.x - x;
          const dy = mouse.y - y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          ctx.beginPath();
          if (dist < proximity) {
            const scale = (1 - dist / proximity);
            ctx.fillStyle = activeColor;
            ctx.arc(x, y, dotSize + scale * 1.5, 0, Math.PI * 2);
          } else {
            ctx.fillStyle = baseColor;
            ctx.arc(x, y, dotSize, 0, Math.PI * 2);
          }
          ctx.fill();
        }
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [dotSize, gap, baseColor, activeColor, proximity]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 -z-10 ${className}`}
    />
  );
}
