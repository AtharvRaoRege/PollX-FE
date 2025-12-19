
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

            <div className="grid grid-cols-3 gap-3 md:gap-4 text-center w-full md:w-auto mt-6 md:mt-0">
                <div className="bg-surface-200/50 p-2 md:p-3 rounded-lg flex flex-col items-center justify-center min-w-[80px]">
                    <div className="text-lg md:text-xl font-bold text-white leading-tight">{user.votesCast || 0}</div>
                    <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider mt-1">Votes</div>
                </div>
                <div className="bg-surface-200/50 p-2 md:p-3 rounded-lg flex flex-col items-center justify-center min-w-[80px]">
                    <div className="text-lg md:text-xl font-bold text-neon-green leading-tight">{user.streak || 0}</div>
                    <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider mt-1">Streak</div>
                </div>
                <div className="bg-surface-200/50 p-2 md:p-3 rounded-lg flex flex-col items-center justify-center min-w-[80px]">
                    <div className="text-lg md:text-xl font-bold text-neon-pink leading-tight">{user.xp || 0}</div>
                    <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider mt-1">XP</div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
