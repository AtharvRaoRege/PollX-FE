import React, { useState, useEffect } from 'react';
import { Activity, Shield, User, ArrowRight, Zap, Sparkles, Target, Globe, Cpu, Heart } from 'lucide-react';

interface OnboardingModalProps {
  onComplete: () => void;
}

const TOPICS = [
    { id: 'tech', label: 'Technology', icon: <Cpu size={18} /> },
    { id: 'society', label: 'Society', icon: <Globe size={18} /> },
    { id: 'future', label: 'Future', icon: <Sparkles size={18} /> },
    { id: 'ethics', label: 'Ethics', icon: <Heart size={18} /> },
    { id: 'politics', label: 'Politics', icon: <Activity size={18} /> },
    { id: 'strategy', label: 'Strategy', icon: <Target size={18} /> },
];

const TypewriterText: React.FC<{ text: string; delay?: number; onComplete?: () => void }> = ({ text, delay = 50, onComplete }) => {
    const [displayed, setDisplayed] = useState('');
    
    useEffect(() => {
        let i = 0;
        const timer = setInterval(() => {
            setDisplayed(text.substring(0, i + 1));
            i++;
            if (i === text.length) {
                clearInterval(timer);
                if (onComplete) onComplete();
            }
        }, delay);
        return () => clearInterval(timer);
    }, [text, delay, onComplete]);

    return <span className="font-mono text-neon-blue">{displayed}<span className="animate-pulse">_</span></span>;
};

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [selectedMode, setSelectedMode] = useState<'ghost' | 'identity' | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Auto-advance processing step
  useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(() => {
        setStep(4);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleNext = () => {
    setStep(prev => prev + 1);
  };

  const handleModeSelect = (mode: 'ghost' | 'identity') => {
    setSelectedMode(mode);
  };

  const toggleTopic = (id: string) => {
      setSelectedTopics(prev => 
        prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
      );
  };

  const handleFinishCalibration = () => {
      setIsProcessing(true);
      setStep(3);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="w-full max-w-lg p-6 relative">
        {/* Background Noise */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        
        {/* Step 0: Welcome / Terminal Intro */}
        {step === 0 && (
            <div className="text-center space-y-8 animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-surface-200/50 rounded-full mx-auto flex items-center justify-center border border-neon-blue/30 shadow-[0_0_30px_rgba(0,243,255,0.15)] backdrop-blur-md">
                    <Activity className="w-10 h-10 text-neon-blue animate-pulse" />
                </div>
                <div>
                    <h1 className="text-4xl font-display font-bold text-white mb-4 tracking-tight">Welcome to PollX</h1>
                    <div className="bg-surface-100 p-4 rounded-xl border border-surface-300 font-mono text-sm text-left h-24 flex items-center">
                        <TypewriterText text="> Connecting to community... > finding topics... > You are online." delay={30} />
                    </div>
                </div>
                
                <button 
                    onClick={handleNext}
                    className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-neon-blue hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                    Get Started <ArrowRight size={18} />
                </button>
            </div>
        )}

        {/* Step 1: Modes (Refined) */}
        {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-display font-bold text-white">Choose Your Style</h2>
                    <p className="text-gray-400 text-sm mt-2">How do you want to participate?</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => handleModeSelect('ghost')}
                        className={`p-6 rounded-2xl border transition-all text-left group relative overflow-hidden ${selectedMode === 'ghost' ? 'bg-surface-800 border-neon-purple shadow-[0_0_15px_rgba(188,19,254,0.2)]' : 'bg-surface-100 border-surface-300 hover:border-gray-500'}`}
                    >
                        <Shield className={`w-8 h-8 mb-4 ${selectedMode === 'ghost' ? 'text-neon-purple' : 'text-gray-500'}`} />
                        <h3 className="text-lg font-bold text-white">Anonymous</h3>
                        <p className="text-xs text-gray-500 mt-2 leading-relaxed">Vote privately. No profile, no history. Just your opinion.</p>
                    </button>

                    <button 
                        onClick={() => handleModeSelect('identity')}
                        className={`p-6 rounded-2xl border transition-all text-left group relative overflow-hidden ${selectedMode === 'identity' ? 'bg-surface-800 border-neon-blue shadow-[0_0_15px_rgba(0,243,255,0.2)]' : 'bg-surface-100 border-surface-300 hover:border-gray-500'}`}
                    >
                        <User className={`w-8 h-8 mb-4 ${selectedMode === 'identity' ? 'text-neon-blue' : 'text-gray-500'}`} />
                        <h3 className="text-lg font-bold text-white">Public</h3>
                        <p className="text-xs text-gray-500 mt-2 leading-relaxed">Create a profile. Earn points. Build reputation.</p>
                    </button>
                </div>

                <button 
                    onClick={handleNext}
                    disabled={!selectedMode}
                    className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-neon-green disabled:opacity-50 disabled:hover:bg-white transition-all flex items-center justify-center gap-2 mt-4"
                >
                    Continue <ArrowRight size={18} />
                </button>
            </div>
        )}

        {/* Step 2: Topics (Replaces generic vote) */}
        {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                <div className="text-center">
                    <h2 className="text-2xl font-display font-bold text-white">Personalize Your Feed</h2>
                    <p className="text-gray-400 text-sm mt-2">Pick what you want to see.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {TOPICS.map((topic) => (
                        <button
                            key={topic.id}
                            onClick={() => toggleTopic(topic.id)}
                            className={`p-4 rounded-xl border transition-all flex items-center gap-3 ${selectedTopics.includes(topic.id) ? 'bg-surface-800 border-neon-blue text-white' : 'bg-surface-100 border-surface-300 text-gray-400 hover:border-gray-500'}`}
                        >
                            <span className={selectedTopics.includes(topic.id) ? 'text-neon-blue' : 'text-gray-500'}>{topic.icon}</span>
                            <span className="font-bold text-sm">{topic.label}</span>
                        </button>
                    ))}
                </div>

                <button 
                    onClick={handleFinishCalibration}
                    disabled={selectedTopics.length === 0}
                    className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-neon-blue disabled:opacity-50 disabled:hover:bg-white transition-all flex items-center justify-center gap-2 mt-4"
                >
                    Finish Setup <Zap size={18} />
                </button>
            </div>
        )}

        {/* Step 3: Processing Animation */}
        {step === 3 && (
            <div className="text-center space-y-6 animate-in fade-in duration-500 py-12">
                 <div className="relative w-32 h-32 mx-auto">
                     <div className="absolute inset-0 border-4 border-surface-300/30 rounded-full"></div>
                     <div className="absolute inset-0 border-4 border-t-neon-blue border-r-neon-purple border-b-neon-pink border-l-transparent rounded-full animate-spin"></div>
                     <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-neon-blue animate-pulse">
                        LOADING
                     </div>
                 </div>
                 <div>
                     <h2 className="text-xl font-bold text-white mb-2">Setting things up...</h2>
                     <p className="text-sm font-mono text-gray-500">Preparing your feed.</p>
                 </div>
            </div>
        )}

        {/* Step 4: Result */}
        {step === 4 && (
            <div className="text-center space-y-8 animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-gradient-to-br from-neon-green to-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-[0_0_40px_rgba(0,255,128,0.4)]">
                    <Zap className="w-10 h-10 text-white" />
                </div>
                
                <div>
                    <h2 className="text-3xl font-display font-bold text-white mb-2">You're All Set!</h2>
                    <p className="text-gray-400">Welcome to the community.</p>
                </div>

                <div className="bg-surface-100 p-4 rounded-xl border border-surface-300 max-w-xs mx-auto">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-2">Your Preferences</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        <span className="px-2 py-1 rounded bg-surface-200 text-xs font-mono text-white">{selectedMode === 'ghost' ? 'ANONYMOUS' : 'PUBLIC'}</span>
                        {selectedTopics.map(t => (
                            <span key={t} className="px-2 py-1 rounded bg-neon-blue/10 text-xs font-mono text-neon-blue">{t.toUpperCase()}</span>
                        ))}
                    </div>
                </div>

                <button 
                    onClick={onComplete}
                    className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-neon-green hover:shadow-[0_0_20px_rgba(0,255,128,0.4)] transition-all"
                >
                    Enter Feed
                </button>
            </div>
        )}

        {/* Progress Dots */}
        {step < 3 && (
            <div className="flex justify-center gap-2 mt-8">
                {[0, 1, 2].map(i => (
                    <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === step ? 'bg-white w-4' : 'bg-surface-700'}`}></div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingModal;
