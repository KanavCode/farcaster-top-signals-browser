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


import React, { useEffect, useRef } from 'react';
import './PlexusBackground.css';

export const PlexusBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Balanced particle settings
    const PARTICLE_COUNT = 60;      // Moderate number of particles
    const CONNECTION_DIST = 175;    // Balanced connection distance
    const PARTICLE_SIZE = 2;        // Moderate particle size
    const MOVEMENT_SPEED = 0.4;     // Balanced movement speed

    // Create particles
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * MOVEMENT_SPEED,
      vy: (Math.random() - 0.5) * MOVEMENT_SPEED
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, PARTICLE_SIZE, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 194, 255, 0.5)';
        ctx.fill();

        // Draw connections
        particles.forEach(p2 => {
          const dx = particle.x - p2.x;
          const dy = particle.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < CONNECTION_DIST) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 194, 255, ${0.25 * (1 - distance/CONNECTION_DIST)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => window.removeEventListener('resize', setCanvasSize);
  }, []);

  return <canvas ref={canvasRef} className="plexus-background" />;
};