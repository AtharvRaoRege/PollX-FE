
import React, { useRef, useEffect, useState } from 'react';
import { ConsciousnessResponse, ConsciousnessLayer } from '../types';
import { Sparkles, Eye, EyeOff, Star, Send, X } from 'lucide-react';

interface ConsciousnessVisualizerProps {
  entries: ConsciousnessResponse[];
  onAddEntry: (text: string, intensity: number, layer: ConsciousnessLayer, emoji: string) => void;
  userHasContributed: boolean;
}

// Particle class for the living cloud
class WordParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  text: string;
  size: number;
  color: string;
  layer: ConsciousnessLayer;
  intensity: number;
  alpha: number;
  targetAlpha: number;

  constructor(w: number, h: number, entry: ConsciousnessResponse) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.text = entry.text;
    this.layer = entry.layer;
    this.intensity = entry.intensity;
    
    // Size based on intensity + randomness
    this.size = 12 + (entry.intensity / 5) + (Math.random() * 5);
    
    // Velocity based on intensity (higher intensity = faster movement)
    const speed = 0.2 + (entry.intensity / 200);
    const angle = Math.random() * Math.PI * 2;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    // Visual styles based on layer
    this.alpha = 0;
    this.targetAlpha = 0.8;
    
    if (this.layer === 'real') this.color = '#00f3ff'; // Neon Blue
    else if (this.layer === 'hidden') this.color = '#bc13fe'; // Purple/Ghostly
    else this.color = '#0aff00'; // Green/Glowing
  }

  update(w: number, h: number) {
    this.x += this.vx;
    this.y += this.vy;

    // Bounce off walls
    if (this.x < 0 || this.x > w) this.vx *= -1;
    if (this.y < 0 || this.y > h) this.vy *= -1;

    // Fade in
    if (this.alpha < this.targetAlpha) this.alpha += 0.02;

    // Jitter based on intensity
    if (this.intensity > 70) {
        this.x += (Math.random() - 0.5) * 0.5;
        this.y += (Math.random() - 0.5) * 0.5;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.font = `${this.layer === 'real' ? 'bold' : 'normal'} ${this.size}px "Space Grotesk"`;
    ctx.fillStyle = this.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Layer effects
    if (this.layer === 'desired') {
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
    } else if (this.layer === 'hidden') {
        ctx.filter = 'blur(1px)';
    }

    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

const ConsciousnessVisualizer: React.FC<ConsciousnessVisualizerProps> = ({ entries, onAddEntry, userHasContributed }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Input State
  const [text, setText] = useState('');
  const [intensity, setIntensity] = useState(50);
  const [layer, setLayer] = useState<ConsciousnessLayer>('real');
  const [emoji, setEmoji] = useState('😐');
  const [showInput, setShowInput] = useState(!userHasContributed);
  const [echoData, setEchoData] = useState<{matchPercent: number, text: string} | null>(null);

  // Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
        if(containerRef.current && canvas) {
            canvas.width = containerRef.current.clientWidth;
            canvas.height = 400; // Fixed height
        }
    };
    resize();
    window.addEventListener('resize', resize);

    const particles: WordParticle[] = entries.map(e => new WordParticle(canvas.width, canvas.height, e));

    let animationId: number;
    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Background Pulse
        const time = Date.now() * 0.001;
        const pulse = Math.sin(time) * 0.1 + 0.1;
        ctx.fillStyle = `rgba(188, 19, 254, ${pulse * 0.05})`; // Subtle purple BG pulse
        ctx.fillRect(0,0, canvas.width, canvas.height);

        particles.forEach(p => {
            p.update(canvas.width, canvas.height);
            p.draw(ctx);
        });
        
        // Connections
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        for(let i=0; i<particles.length; i++) {
            for(let j=i+1; j<particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 100 && particles[i].text === particles[j].text) {
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
        cancelAnimationFrame(animationId);
    };
  }, [entries]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    // Calculate Echo (Resonance)
    const matches = entries.filter(ent => ent.text.toLowerCase().includes(text.toLowerCase()) || text.toLowerCase().includes(ent.text.toLowerCase()));
    const percent = entries.length > 0 ? Math.round((matches.length / entries.length) * 100) : 0;
    
    setEchoData({ matchPercent: percent, text });
    onAddEntry(text, intensity, layer, emoji);
    setShowInput(false);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-black border border-surface-300 group hover:border-neon-purple/50 transition-colors" ref={containerRef}>
      
      {/* Background USP Text */}
      <div className="absolute top-4 left-0 w-full text-center pointer-events-none z-10">
        <p className="text-[10px] md:text-xs font-mono uppercase tracking-[0.2em] text-neon-purple/60 animate-pulse">
            This is not a poll. It is a mirror.
        </p>
      </div>

      <canvas ref={canvasRef} className="block w-full h-[400px]" />

      {/* Input Overlay */}
      {showInput && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-20 animate-in fade-in">
           <form onSubmit={handleSubmit} className="w-full max-w-md bg-surface-100 border border-surface-300 p-6 rounded-2xl shadow-2xl relative overflow-hidden">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-neon-blue/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2"></div>

                <h3 className="text-xl font-display font-bold text-white mb-6 text-center">Contribute to the Cloud</h3>
                
                {/* Layer Selector */}
                <div className="flex justify-center gap-2 mb-6">
                    <button type="button" onClick={() => setLayer('real')} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border transition-all ${layer === 'real' ? 'bg-neon-blue/10 border-neon-blue text-neon-blue' : 'border-surface-300 text-gray-500 hover:text-white'}`}>
                        <Eye size={14} /> Real Self
                    </button>
                    <button type="button" onClick={() => setLayer('hidden')} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border transition-all ${layer === 'hidden' ? 'bg-neon-purple/10 border-neon-purple text-neon-purple' : 'border-surface-300 text-gray-500 hover:text-white'}`}>
                        <EyeOff size={14} /> Hidden Self
                    </button>
                    <button type="button" onClick={() => setLayer('desired')} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border transition-all ${layer === 'desired' ? 'bg-neon-green/10 border-neon-green text-neon-green' : 'border-surface-300 text-gray-500 hover:text-white'}`}>
                        <Star size={14} /> Desired Self
                    </button>
                </div>

                {/* Text Input */}
                <div className="mb-4">
                    <label className="text-xs text-gray-400 font-mono uppercase mb-1 block">Your Feeling (1-3 Words)</label>
                    <input 
                        type="text" 
                        value={text} 
                        onChange={e => setText(e.target.value)} 
                        maxLength={20}
                        placeholder="e.g. Hopeful, Drowning, Electric"
                        className="w-full bg-surface-50 border border-surface-300 rounded-lg p-3 text-white focus:border-neon-purple focus:outline-none transition-colors"
                    />
                </div>

                {/* Intensity Slider */}
                <div className="mb-6">
                    <div className="flex justify-between text-xs text-gray-400 font-mono uppercase mb-2">
                        <span>Intensity</span>
                        <span>{intensity}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={intensity} 
                        onChange={e => setIntensity(Number(e.target.value))}
                        className="w-full h-2 bg-surface-300 rounded-lg appearance-none cursor-pointer accent-neon-purple"
                    />
                </div>
                
                {/* Submit */}
                <button type="submit" disabled={!text.trim()} className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-neon-purple hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    <Send size={16} /> Broadcast Emotion
                </button>
           </form>
        </div>
      )}

      {/* Personality Echo (Post Submission) */}
      {echoData && !showInput && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <div className="bg-black/80 backdrop-blur-md p-6 rounded-2xl border border-neon-blue/30 text-center animate-in zoom-in-95 pointer-events-auto max-w-sm mx-4">
                <button onClick={() => setEchoData(null)} className="absolute top-2 right-2 text-gray-500 hover:text-white"><X size={16}/></button>
                <h4 className="text-neon-blue font-bold uppercase tracking-wider text-sm mb-2">Personality Echo</h4>
                <p className="text-white text-lg font-display mb-1">
                    You resonate with <span className="text-3xl font-bold text-neon-purple">{echoData.matchPercent}%</span>
                </p>
                <p className="text-gray-400 text-sm">
                    of the collective mind who also feel <span className="text-white italic">"{echoData.text}"</span>.
                </p>
                <div className="mt-4 pt-4 border-t border-surface-300">
                    <p className="text-xs text-gray-500">Your emotion has been added to the living structure.</p>
                </div>
            </div>
        </div>
      )}

      {/* Re-enter button */}
      {!showInput && !echoData && (
          <button 
            onClick={() => setShowInput(true)} 
            className="absolute bottom-4 right-4 bg-surface-900/80 backdrop-blur text-white px-4 py-2 rounded-full text-xs font-bold border border-surface-300 hover:border-neon-blue transition-all z-20"
          >
              + Add Layer
          </button>
      )}
    </div>
  );
};

export default ConsciousnessVisualizer;
