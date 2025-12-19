import React from 'react';
import { Award, Zap, Star, Shield, Flame, Target, Trophy } from 'lucide-react';

interface BadgeListProps {
  badges: string[];
}

interface BadgeDef {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const BADGE_DEFINITIONS: Record<string, BadgeDef> = {
  // VOTING
  'voter_1': {
    id: 'voter_1',
    label: 'Citizen',
    description: 'Cast 10 votes',
    icon: <Star size={20} />,
    color: 'text-amber-600 border-amber-600/30 bg-amber-600/10' // Bronze
  },
  'voter_2': {
    id: 'voter_2',
    label: 'Activist',
    description: 'Cast 50 votes',
    icon: <Star size={20} />,
    color: 'text-gray-300 border-gray-300/30 bg-gray-300/10' // Silver
  },
  'voter_3': {
    id: 'voter_3',
    label: 'Revolutionary',
    description: 'Cast 100 votes',
    icon: <Star size={20} />,
    color: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10' // Gold
  },

  // STREAK
  'streak_1': {
    id: 'streak_1',
    label: 'Heating Up',
    description: '3 day streak',
    icon: <Flame size={20} />,
    color: 'text-orange-400 border-orange-400/30 bg-orange-400/10'
  },
  'streak_2': {
    id: 'streak_2',
    label: 'On Fire',
    description: '7 day streak',
    icon: <Zap size={20} />,
    color: 'text-red-500 border-red-500/30 bg-red-500/10'
  },
  'streak_3': {
    id: 'streak_3',
    label: 'Unstoppable',
    description: '30 day streak',
    icon: <Trophy size={20} />,
    color: 'text-neon-purple border-neon-purple/30 bg-neon-purple/10'
  },

  // MISC
  'veteran_1': {
    id: 'veteran_1',
    label: 'Early Adopter',
    description: 'Joined early',
    icon: <Shield size={20} />,
    color: 'text-neon-blue border-neon-blue/30 bg-neon-blue/10'
  }
};

const BadgeList: React.FC<BadgeListProps> = ({ badges }) => {
  if (!badges || badges.length === 0) {
    return (
      <div className="bg-surface-100/50 rounded-xl p-6 text-center border border-surface-200 border-dashed">
        <Award className="w-8 h-8 text-gray-600 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">No badges earned yet.</p>
        <p className="text-gray-600 text-xs mt-1">Vote and participate to unlock.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {badges.map(badgeId => {
        const def = BADGE_DEFINITIONS[badgeId];
        if (!def) return null;

        return (
          <div 
            key={badgeId} 
            className={`
                group relative p-4 rounded-xl border border-white/5 bg-white/[0.02] 
                hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300
                flex flex-col items-center text-center gap-3
            `}
          >
            {/* Glow Effect */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl ${def.color.replace('text-', 'bg-')}`}></div>

            <div className={`relative p-3 rounded-full bg-surface-900 border border-surface-700 shadow-xl group-hover:scale-110 transition-transform duration-300`}>
              <div className={def.color.split(' ')[0]}>{def.icon}</div>
            </div>
            
            <div className="relative z-10">
              <div className="font-bold text-xs text-gray-200 uppercase tracking-wider mb-1">{def.label}</div>
              <div className="text-[10px] text-gray-500 leading-tight">{def.description}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BadgeList;
