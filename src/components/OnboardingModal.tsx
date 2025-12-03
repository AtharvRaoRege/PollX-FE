
import React, { useState, useEffect } from 'react';
import { Activity, Shield, User, ArrowRight, Zap, Brain, CheckCircle } from 'lucide-react';

interface OnboardingModalProps {
  onComplete: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [selectedMode, setSelectedMode] = useState<'ghost' | 'identity' | null>(null);
  const [calibrationVote, setCalibrationVote] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [archetype, setArchetype] = useState('');

  // Auto-advance processing step
  useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(() => {
        // Determine archetype based on vote
        if (calibrationVote === 'Hope') setArchetype('Optimist');
        else if (calibrationVote === 'Fear') setArchetype('Realist');
        else setArchetype('Stoic');
        setStep(4);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [step, calibrationVote]);

  const handleNext = () => {
    setStep(prev => prev + 1);
  };

  const handleModeSelect = (mode: 'ghost' | 'identity') => {
    setSelectedMode(mode);
  };

  const handleVote = (option: string) => {
    setCalibrationVote(option);
    setIsProcessing(true);
    setTimeout(() => {
        setIsProcessing(false);
        setStep(3);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="w-full max-w-lg p-6 relative">
        {/* Background Noise */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        
        {/* Step 0: Welcome */}
        {step === 0 && (
            <div className="text-center space-y-8 animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-surface-200 rounded-2xl mx-auto flex items-center justify-center border border-surface-300 shadow-[0_0_30px_rgba(0,243,255,0.2)]">
                    <Activity className="w-10 h-10 text-neon-blue animate-pulse" />
                </div>
                <div>
                    <h1 className="text-4xl font-display font-bold text-white mb-2 tracking-tight">POLL<span className="text-neon-blue">X</span></h1>
                    <p className="text-gray-400 font-mono text-sm uppercase tracking-widest">Collective Consciousness Interface</p>
                </div>
                <p className="text-gray-300 leading-relaxed max-w-md mx-auto">
                    Welcome to the feed. Here, your opinion isn't just a vote—it's a data point that shapes the global psyche.
                </p>
                <button 
                    onClick={handleNext}
                    className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-neon-blue hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                    Initialize System <ArrowRight size={18} />
                </button>
            </div>
        )}

        {/* Step 1: Modes */}
        {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-display font-bold text-white">Choose Your Protocol</h2>
                    <p className="text-gray-400 text-sm mt-2">How will you influence the data stream?</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => handleModeSelect('ghost')}
                        className={`p-6 rounded-2xl border transition-all text-left group relative overflow-hidden ${selectedMode === 'ghost' ? 'bg-surface-800 border-neon-purple' : 'bg-surface-100 border-surface-300 hover:border-gray-500'}`}
                    >
                        <Shield className={`w-8 h-8 mb-4 ${selectedMode === 'ghost' ? 'text-neon-purple' : 'text-gray-500'}`} />
                        <h3 className="text-lg font-bold text-white">Ghost Mode</h3>
                        <p className="text-xs text-gray-500 mt-2 leading-relaxed">Vote without a trace. No profile, no history. Pure raw data input.</p>
                        {selectedMode === 'ghost' && <div className="absolute top-2 right-2 w-2 h-2 bg-neon-purple rounded-full shadow-[0_0_10px_#bc13fe]"></div>}
                    </button>

                    <button 
                        onClick={() => handleModeSelect('identity')}
                        className={`p-6 rounded-2xl border transition-all text-left group relative overflow-hidden ${selectedMode === 'identity' ? 'bg-surface-800 border-neon-blue' : 'bg-surface-100 border-surface-300 hover:border-gray-500'}`}
                    >
                        <User className={`w-8 h-8 mb-4 ${selectedMode === 'identity' ? 'text-neon-blue' : 'text-gray-500'}`} />
                        <h3 className="text-lg font-bold text-white">Identity Mode</h3>
                        <p className="text-xs text-gray-500 mt-2 leading-relaxed">Build your psych profile. Track your evolution. Gain influence.</p>
                         {selectedMode === 'identity' && <div className="absolute top-2 right-2 w-2 h-2 bg-neon-blue rounded-full shadow-[0_0_10px_#00f3ff]"></div>}
                    </button>
                </div>

                <button 
                    onClick={handleNext}
                    disabled={!selectedMode}
                    className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-neon-green disabled:opacity-50 disabled:hover:bg-white transition-all flex items-center justify-center gap-2 mt-4"
                >
                    Confirm Protocol
                </button>
            </div>
        )}

        {/* Step 2: Calibration Vote */}
        {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-800 rounded-full border border-surface-700 mb-4">
                        <Zap size={12} className="text-yellow-400" />
                        <span className="text-[10px] font-mono uppercase tracking-widest text-gray-300">Calibration Signal</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white leading-tight">The Future is...</h2>
                </div>

                <div className="space-y-3">
                    {[
                        { label: 'Full of Possibility', val: 'Hope', color: 'border-neon-blue hover:bg-neon-blue/10' },
                        { label: 'A bit Terrifying', val: 'Fear', color: 'border-neon-purple hover:bg-neon-purple/10' },
                        { label: 'What we make it', val: 'Action', color: 'border-neon-green hover:bg-neon-green/10' }
                    ].map((opt) => (
                        <button
                            key={opt.val}
                            onClick={() => handleVote(opt.val)}
                            className={`w-full p-4 rounded-xl border-2 ${opt.color} bg-surface-100 text-left text-white font-bold transition-all hover:scale-[1.02] active:scale-95 flex justify-between items-center group`}
                        >
                            {opt.label}
                            <div className="w-4 h-4 rounded-full border-2 border-gray-600 group-hover:border-white transition-colors"></div>
                        </button>
                    ))}
                </div>
            </div>
        )}

        {/* Step 3: Processing */}
        {step === 3 && (
            <div className="text-center space-y-6 animate-in fade-in duration-500 py-12">
                 <div className="relative w-24 h-24 mx-auto">
                     <div className="absolute inset-0 border-4 border-surface-300 rounded-full"></div>
                     <div className="absolute inset-0 border-4 border-neon-blue rounded-full border-t-transparent animate-spin"></div>
                     <Brain className="absolute inset-0 m-auto text-white w-8 h-8 animate-pulse" />
                 </div>
                 <div>
                     <h2 className="text-xl font-bold text-white mb-2">Analyzing Response Pattern...</h2>
                     <p className="text-sm font-mono text-neon-blue">Generating Identity Tag</p>
                 </div>
                 <div className="w-64 h-1 bg-surface-800 mx-auto rounded-full overflow-hidden">
                     <div className="h-full bg-gradient-to-r from-neon-blue to-neon-purple animate-[slideUp_2s_ease-in-out_infinite]"></div>
                 </div>
            </div>
        )}

        {/* Step 4: Result */}
        {step === 4 && (
            <div className="text-center space-y-8 animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-gradient-to-br from-neon-blue to-neon-purple rounded-full mx-auto flex items-center justify-center shadow-[0_0_40px_rgba(188,19,254,0.4)]">
                    <CheckCircle className="w-10 h-10 text-white" />
                </div>
                
                <div>
                    <h2 className="text-3xl font-display font-bold text-white mb-2">Calibration Complete</h2>
                    <p className="text-gray-400">Your initial archetype has been assigned.</p>
                </div>

                <div className="py-4">
                    <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-white">
                        #{archetype}
                    </span>
                </div>

                <button 
                    onClick={onComplete}
                    className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-neon-blue hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] transition-all"
                >
                    Enter The Feed
                </button>
            </div>
        )}

        {/* Progress Dots */}
        {step < 3 && (
            <div className="flex justify-center gap-2 mt-8">
                {[0, 1, 2].map(i => (
                    <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-white' : 'bg-surface-700'}`}></div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingModal;
