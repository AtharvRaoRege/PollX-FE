
import React, { useRef, useEffect, useState } from 'react';
import { Poll } from '../types';

interface FluxVisualizerProps {
  poll: Poll;
}

// Particle Class for Soul Mode
class SoulParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  archetype: string;
  originalX: number;
  originalY: number;

  constructor(w: number, h: number, archetype: string, color: string) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.originalX = this.x;
    this.originalY = this.y;
    
    // Random velocity
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    
    this.size = Math.random() * 3 + 2;
    this.color = color;
    this.archetype = archetype;
  }

  update(w: number, h: number, mouseX: number, mouseY: number) {
    this.x += this.vx;
    this.y += this.vy;

    // Boundary wrap
    if (this.x < 0) this.x = w;
    if (this.x > w) this.x = 0;
    if (this.y < 0) this.y = h;
    if (this.y > h) this.y = 0;

    // Mouse interaction (repel/attract)
    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 100) {
      const force = (100 - dist) / 100;
      this.x -= (dx / dist) * force * 2;
      this.y -= (dy / dist) * force * 2;
    }
  }

  draw(ctx: CanvasRenderingContext2D, isHovered: boolean) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = isHovered ? 1 : 0.6;
    ctx.fill();
    
    // Glow effect
    if (Math.random() > 0.95) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
    } else {
        ctx.shadowBlur = 0;
    }
  }
}

const FluxVisualizer: React.FC<FluxVisualizerProps> = ({ poll }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredArchetype, setHoveredArchetype] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize handling
    const resize = () => {
        if (containerRef.current && canvas) {
            canvas.width = containerRef.current.clientWidth;
            canvas.height = containerRef.current.clientHeight;
        }
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize Particles based on Poll Data
    const particles: SoulParticle[] = [];
    const colors = ['#00f3ff', '#bc13fe', '#0aff00', '#ff00ff']; // Neon palette

    poll.options.forEach((opt, idx) => {
        const color = colors[idx % colors.length];
        
        // Add particles for votes
        const particleCount = Math.min(opt.votes, 50); // Cap for performance
        for(let i=0; i<particleCount; i++) {
            // Assign random archetype if data is missing, or grab from poll data
            let arch = 'Anonymous';
            if (opt.archetypes) {
                const keys = Object.keys(opt.archetypes);
                if (keys.length > 0) arch = keys[Math.floor(Math.random() * keys.length)];
            }
            particles.push(new SoulParticle(canvas.width, canvas.height, arch, color));
        }
    });

    // Animation Loop
    let animationId: number;
    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;

        // Find hovered particle
        let found = null;
        for (const p of particles) {
             const dx = mouseX - p.x;
             const dy = mouseY - p.y;
             if (Math.sqrt(dx*dx + dy*dy) < 20) {
                 found = p.archetype;
                 break;
             }
        }
        setHoveredArchetype(found);
    };
    canvas.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Dark background with slight trail
        ctx.fillStyle = 'rgba(5, 5, 5, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            p.update(canvas.width, canvas.height, mouseX, mouseY);
            p.draw(ctx, hoveredArchetype === p.archetype);
        });

        // Connection lines between similar archetypes
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        
        // Draw lines (optimized: only close neighbors)
        for (let i = 0; i < particles.length; i+=2) {
             for (let j = i + 1; j < particles.length; j+=5) {
                 const dx = particles[i].x - particles[j].x;
                 const dy = particles[i].y - particles[j].y;
                 const dist = Math.sqrt(dx*dx + dy*dy);
                 if (dist < 60) {
                     ctx.beginPath();
                     ctx.moveTo(particles[i].x, particles[i].y);
                     ctx.lineTo(particles[j].x, particles[j].y);
                     ctx.stroke();
                 }
             }
        }

        animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
        window.removeEventListener('resize', resize);
        canvas.removeEventListener('mousemove', handleMouseMove);
        cancelAnimationFrame(animationId);
    };
  }, [poll]);

  return (
    <div ref={containerRef} className="w-full h-full relative group cursor-crosshair">
       <canvas ref={canvasRef} className="block" />
       
       {/* Overlay HUD */}
       <div className="absolute top-4 left-4 pointer-events-none">
          <h4 className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Flux Mode</h4>
          <p className="text-xs text-neon-blue font-bold">Live Soul Visualization</p>
       </div>

       {/* Archetype Tooltip */}
       {hoveredArchetype && (
           <div 
             className="absolute pointer-events-none bg-black/80 backdrop-blur border border-neon-purple px-3 py-1 rounded text-xs text-white shadow-xl z-50 animate-in zoom-in duration-75"
             style={{ 
                 left: '50%', 
                 top: '50%', 
                 transform: 'translate(-50%, -50%)' 
             }}
           >
               <span className="text-gray-400">Voter Identity:</span> <span className="font-bold text-neon-pink">{hoveredArchetype}</span>
           </div>
       )}
    </div>
  );
};

export default FluxVisualizer;
