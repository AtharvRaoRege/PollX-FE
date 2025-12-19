
import React, { useState } from 'react';
import { UserProfile, Poll } from '../../types';
import { Brain, TrendingUp, Shield, Zap, Lock } from 'lucide-react';
import { generateUserPersona } from '../../geminiService';
import BadgeList from './BadgeList';

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
    <div className="space-y-6 animate-slide-up">
      {/* Profile Header */}
      <div className="bg-surface-100 border border-surface-300 rounded-2xl p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-neon-purple/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative shrink-0">
                <div className="w-24 h-24 rounded-full bg-surface-200 border-2 border-neon-blue p-1 shadow-[0_0_20px_rgba(0,243,255,0.2)]">
                    <img src={user.avatarUrl} alt="User" className="w-full h-full rounded-full object-cover" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-surface-800 text-neon-blue text-[10px] font-bold px-2 py-1 rounded-full border border-neon-blue/30 shadow-lg">
                    LVL {user.level || 1}
                </div>
            </div>
            
            <div className="text-center sm:text-left flex-1 min-w-0">
                <h1 className="text-3xl font-display font-bold text-white tracking-tight break-words">{user.username}</h1>
                <p className="text-gray-400 text-sm mt-1">Member since {new Date(user.createdAt).getFullYear()}</p>
                
                {/* ID Tag */}
                <div className="mt-4 inline-flex items-center gap-2 bg-surface-200/30 px-3 py-1.5 rounded-lg border border-surface-300/50 backdrop-blur-sm">
                    <Brain size={14} className="text-neon-purple" />
                    <span className="text-xs font-mono text-gray-300 tracking-wide">{user.identityTitle || "Explorer"}</span>
                </div>
            </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface-100/80 border border-surface-300 rounded-2xl p-4 flex flex-col items-center justify-center hover:bg-surface-200/50 transition-colors">
            <div className="text-2xl font-bold text-white mb-1">{user.votesCast || 0}</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Votes</div>
        </div>
        <div className="bg-surface-100/80 border border-surface-300 rounded-2xl p-4 flex flex-col items-center justify-center hover:bg-surface-200/50 transition-colors relative overflow-hidden">
             <div className="absolute inset-0 bg-neon-green/5 blur-xl"></div>
            <div className="text-2xl font-bold text-neon-green mb-1 relative z-10">{user.streak || 0}</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest relative z-10">Streak</div>
        </div>
        <div className="bg-surface-100/80 border border-surface-300 rounded-2xl p-4 flex flex-col items-center justify-center hover:bg-surface-200/50 transition-colors relative overflow-hidden">
            <div className="absolute inset-0 bg-neon-pink/5 blur-xl"></div>
            <div className="text-2xl font-bold text-neon-pink mb-1 relative z-10">{user.xp || 0}</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest relative z-10">XP</div>
        </div>
      </div>

      {/* Badges Trophy Case */}
      <div className="bg-surface-100 border border-surface-300 rounded-2xl p-6 relative overflow-hidden">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Shield size={16} className="text-neon-blue" />
                Achievements
            </h3>
            <span className="text-[10px] font-mono text-gray-500 bg-surface-200 px-2 py-1 rounded">{(user.badges || []).length} UNLOCKED</span>
         </div>
         
         <BadgeList badges={user.badges || []} />
      </div>
    </div>
  );
};

export default ProfileView;
