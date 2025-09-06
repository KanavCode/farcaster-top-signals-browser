// import React from 'react';
// import './PlexusBackground.css';

// export const PlexusBackground: React.FC = () => {
//   return (
//     <div className="plexus-background">
//       <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
//         <defs>
//           <pattern id="plexus-pattern" patternUnits="userSpaceOnUse" width="200" height="200">
//             <circle cx="10" cy="10" r="2" fill="#00c2ff">
//               <animateMotion dur="10s" repeatCount="indefinite" path="M0,0 L100,50 L50,100 L0,0 Z" />
//             </circle>
//             <circle cx="50" cy="50" r="2" fill="#00c2ff">
//                 <animateMotion dur="12s" repeatCount="indefinite" path="M20,20 L120,70 L70,120 L20,20 Z" />
//             </circle>
//              <circle cx="100" cy="100" r="2" fill="#a0a0a0">
//                 <animateMotion dur="15s" repeatCount="indefinite" path="M-10,-10 L90,40 L40,90 L-10,-10 Z" />
//             </circle>
//           </pattern>
//         </defs>
//         <rect width="100%" height="100%" fill="url(#plexus-pattern)" />
//       </svg>
//     </div>
//   );
// };


import React, { useRef, useEffect } from 'react';
import './PlexusBackground.css';

export const PlexusBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // --- Animation Logic ---
    const particles: Particle[] = [];
    const particleCount = Math.floor((canvas.width * canvas.height) / 20000);

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.vx = Math.random() * 1 - 0.5;
        this.vy = Math.random() * 1 - 0.5;
        this.radius = Math.random() * 1.5 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas!.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas!.height) this.vy *= -1;
      }

      draw() {
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx!.fillStyle = '#a0a0a0'; // Color of the nodes
        ctx!.fill();
      }
    }

    const init = () => {
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const connect = () => {
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            const opacity = 1 - distance / 120;
            ctx!.strokeStyle = `rgba(0, 194, 255, ${opacity})`; // Color of the lines
            ctx!.lineWidth = 0.5;
            ctx!.beginPath();
            ctx!.moveTo(particles[a].x, particles[a].y);
            ctx!.lineTo(particles[b].x, particles[b].y);
            ctx!.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx!.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      connect();
      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    // Cleanup function
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="plexus-background" />;
};