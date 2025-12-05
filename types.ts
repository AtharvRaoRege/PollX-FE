
export interface PollOption {
  id: string;
  text: string;
  votes: number;
  archetypes?: { [key: string]: number }; // e.g., { 'Realist': 5, 'Dreamer': 2 }
}

export interface PollComment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: Date;
  likes: number; // Net score
  userVote?: 'up' | 'down'; // Current user's vote
  replies: PollComment[]; // Nested replies
}

export interface FuturePrediction {
  predictionText: string;
  predictedOptions: { text: string; percentage: number }[];
}

export type PollMode = 'standard' | 'consciousness';

export type ConsciousnessLayer = 'real' | 'hidden' | 'desired';

export interface ConsciousnessResponse {
  id: string;
  text: string; // 1-3 words
  intensity: number; // 0-100
  layer: ConsciousnessLayer;
  emoji: string;
  createdAt: Date;
}

export type PollStatus = 'pending' | 'approved' | 'rejected';

export interface Poll {
  id: string;
  mode?: PollMode; // Defaults to 'standard'
  question: string;
  description?: string;
  category: 'Moral' | 'Social' | 'Politics' | 'Tech' | 'Hypothetical' | 'Relationships' | 'Consciousness';
  options: PollOption[];
  consciousnessEntries?: ConsciousnessResponse[]; // For consciousness mode
  totalVotes: number;
  comments: PollComment[];
  createdAt: Date;
  authorId: string;
  isHot: boolean;
  isEdited?: boolean;
  userVoteId?: string;
  prediction?: FuturePrediction;
  status?: PollStatus;
}

export interface UserSettings {
  ghostMode: boolean; // Hides active status
  anonymousDefault: boolean; // Votes anonymously by default
  neonIntensity: number; // 0-100
  reduceMotion: boolean;
  notifications: boolean;
}

export type UserRole = 'user' | 'admin';

export interface UserProfile {
  id: string;
  username: string;
  xp: number;
  level: number;
  streak: number;
  identityTitle: string;
  identityDescription: string;
  tags: string[];
  votesCast: number;
  avatarUrl: string;
  savedPollIds: string[];
  settings: UserSettings;
  role: UserRole;
}

export interface GeneratedPersona {
  title: string;
  description: string;
  tags: string[];
  archetype: string;
}

export interface AppNotification {
  id: string;
  type: 'comment' | 'reply' | 'vote' | 'system' | 'mention';
  message: string;
  sender?: {
    _id: string;
    username: string;
    avatarUrl: string;
  };
  pollId?: string;
  read: boolean;
  createdAt: Date;
}

// --- ELECTION MODULE TYPES ---

export interface LeadershipProfile {
  personalitySummary: string;
  strengths: string[];
  weaknesses: string[];
  leadershipStyle: 'Visionary' | 'Strategic' | 'Aggressive' | 'Diplomatic' | 'Servant';
  agendaScore: number; // 0-100 alignment with public sentiment
}

export interface Candidate {
  id: string;
  userId: string;
  user?: UserProfile; // Populated
  partyAffiliation: string;
  manifesto: string;
  background: string;
  contactInfo: string;
  reasonForContesting: string;
  experience: string;
  electionId?: string;
  aiProfile?: LeadershipProfile;
  status: 'pending_review' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Election {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'ended' | 'paused';
  regions: string[];
  candidates?: string[]; // IDs
  createdBy: string;
  createdAt: string;
}
