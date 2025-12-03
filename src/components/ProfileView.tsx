
import React, { useState } from 'react';
import { UserProfile, Poll } from '../../types';
import { Brain, TrendingUp, Shield, Zap, Lock } from 'lucide-react';
import { generateUserPersona } from '../../geminiService';

interface ProfileViewProps {
  user: UserProfile;
  voteHistory: { question: string; choice: string; category: string }[];
  onUpdateProfile: (persona: any) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, voteHistory, onUpdateProfile }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    // Simulate slight delay for dramatic effect if API is fast
    const minTime = new Promise(resolve => setTimeout(resolve, 1500));
    const analysisPromise = generateUserPersona(voteHistory);
    
    const [_, persona] = await Promise.all([minTime, analysisPromise]);
    
    onUpdateProfile({
        identityTitle: persona.title,
        identityDescription: persona.description,
        tags: persona.tags
    });
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header Card */}
      <div className="bg-surface-100 border border-surface-300 rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-neon-purple/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-surface-200 border-2 border-neon-blue p-1">
                    <img src={user.avatarUrl} alt="User" className="w-full h-full rounded-full object-cover grayscale hover:grayscale-0 transition-all" />
                </div>
                <div>
                    <h1 className="text-3xl font-display font-bold text-white tracking-tight">{user.username}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-mono bg-neon-blue/20 text-neon-blue px-2 py-0.5 rounded">LVL {user.level || 1}</span>
                        <span className="text-gray-400 text-sm">Member since 2024</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-surface-200/50 p-3 rounded-lg">
                    <div className="text-xl font-bold text-white">{user.votesCast || 0}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Votes</div>
                </div>
                <div className="bg-surface-200/50 p-3 rounded-lg">
                    <div className="text-xl font-bold text-neon-green">{user.streak || 0}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Streak</div>
                </div>
                <div className="bg-surface-200/50 p-3 rounded-lg">
                    <div className="text-xl font-bold text-neon-pink">{user.xp || 0}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">XP</div>
                </div>
            </div>
        </div>
      </div>

      {/* Identity Engine */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-black border border-neon-blue/50 shadow-[0_0_20px_rgba(0,243,255,0.1)] rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
             {/* Scanlines effect */}
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
             
             <div>
                <div className="flex items-center gap-2 mb-4 text-neon-blue">
                    <Brain className="w-5 h-5" />
                    <h2 className="font-display font-bold uppercase tracking-widest">Psyche Profile</h2>
                </div>
                
                <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{user.identityTitle || 'Unanalyzed'}</h3>
                    <p className="text-gray-400 leading-relaxed text-sm">
                        {user.identityDescription || 'Not enough data to construct a profile.'}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                    {user.tags?.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-surface-800 border border-surface-700 rounded-full text-xs text-gray-300">
                            {tag}
                        </span>
                    ))}
                </div>
             </div>

             <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing || voteHistory.length < 3}
                className={`w-full py-3 rounded-lg font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-all
                ${isAnalyzing 
                    ? 'bg-surface-300 text-gray-500 cursor-wait' 
                    : 'bg-neon-blue text-black hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]'
                }`}
             >
                {isAnalyzing ? (
                    <>Processing Neural Net...</>
                ) : voteHistory.length < 3 ? (
                    <>Vote 3x to Unlock Analysis <Lock className="w-4 h-4"/></>
                ) : (
                    <>Update Analysis <Zap className="w-4 h-4 fill-current"/></>
                )}
             </button>
        </div>

        {/* Stats & Badges */}
        <div className="space-y-6">
             <div className="bg-surface-100 border border-surface-300 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4 text-neon-pink">
                    <TrendingUp className="w-5 h-5" />
                    <h2 className="font-display font-bold uppercase tracking-widest">Alignment</h2>
                </div>
                
                {/* Mock Alignment Chart */}
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-xs mb-1 text-gray-400">
                            <span>Logic</span>
                            <span>Emotion</span>
                        </div>
                        <div className="h-2 bg-surface-300 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 w-[65%]"></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-xs mb-1 text-gray-400">
                            <span>Individual</span>
                            <span>Collective</span>
                        </div>
                        <div className="h-2 bg-surface-300 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-green-400 to-blue-500 w-[40%]"></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-xs mb-1 text-gray-400">
                            <span>Chaos</span>
                            <span>Order</span>
                        </div>
                        <div className="h-2 bg-surface-300 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 w-[80%]"></div>
                        </div>
                    </div>
                </div>
             </div>

             <div className="bg-surface-100 border border-surface-300 rounded-2xl p-6">
                 <div className="flex items-center gap-2 mb-4 text-gray-400">
                    <Shield className="w-5 h-5" />
                    <h2 className="font-display font-bold uppercase tracking-widest">Privacy Mode</h2>
                </div>
                <div className="flex items-center justify-between p-3 bg-surface-200 rounded-lg">
                    <span className="text-sm text-gray-300">Public Profile</span>
                    <div className="w-10 h-5 bg-neon-green rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-3 h-3 bg-black rounded-full shadow-md"></div>
                    </div>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
