
import React, { useState, useEffect } from 'react';
import { Poll, UserProfile, PollComment, ConsciousnessLayer, ConsciousnessResponse, FuturePrediction, AppNotification } from './types';
import PollCard from './src/components/PollCard';
import ProfileView from './src/components/ProfileView';
import CreatePoll from './src/components/CreatePoll';
import SettingsView from './src/components/SettingsView';
import AuthModal from './src/components/AuthModal';
import NotificationDropdown from './src/components/NotificationDropdown';
import OnboardingModal from './src/components/OnboardingModal';
import ElectionHub from './src/components/ElectionHub';
import { generatePollInsight, predictFutureTrend } from './geminiService';
import { api } from './src/services/api';
import {
    Home, User, PlusCircle, Activity, Globe, Menu,
    Hash, Bell, Bookmark, Settings, Search, Sparkles,
    LogOut, TrendingUp, Flame, Brain, AlertTriangle, Zap, LogIn, X,
    PanelLeft, Info, ShieldCheck, Flag
} from 'lucide-react';

// --- SEED DATA (Used for offline simulation) ---
// Note: Updated status to 'approved' for visibility
const SEED_POLLS: Poll[] = [
    {
        id: 'cp1',
        mode: 'consciousness',
        question: "How does the current state of the world make you feel?",
        description: "Contribute your raw emotion to the collective mind cloud.",
        category: 'Consciousness',
        options: [],
        consciousnessEntries: [
            { id: 'ce1', text: 'Anxious', intensity: 80, layer: 'real', emoji: '😰', createdAt: new Date() },
            { id: 'ce2', text: 'Hopeful', intensity: 40, layer: 'desired', emoji: '🌱', createdAt: new Date() },
            { id: 'ce3', text: 'Numb', intensity: 90, layer: 'hidden', emoji: '😶', createdAt: new Date() },
            { id: 'ce4', text: 'Electric', intensity: 75, layer: 'real', emoji: '⚡', createdAt: new Date() },
            { id: 'ce5', text: 'Lost', intensity: 60, layer: 'hidden', emoji: '🌫️', createdAt: new Date() },
        ],
        totalVotes: 1205,
        createdAt: new Date(),
        authorId: 'system',
        isHot: true,
        comments: [],
        status: 'approved'
    },
    {
        id: 'sp1',
        mode: 'standard',
        question: "Is AI art real art?",
        description: "The definition of creativity is evolving. Where do you stand?",
        category: 'Tech',
        options: [
            { id: 'o1', text: 'Yes, the prompt is the brush.', votes: 450, archetypes: { 'Visionary': 120, 'Technologist': 300 } },
            { id: 'o2', text: 'No, it lacks human soul.', votes: 320, archetypes: { 'Purist': 200, 'Humanist': 80 } },
            { id: 'o3', text: 'It is a new medium entirely.', votes: 580, archetypes: { 'Realist': 300, 'Futurist': 250 } }
        ],
        totalVotes: 1350,
        createdAt: new Date(),
        authorId: 'system',
        isHot: true,
        comments: [
            { id: 'c1', authorId: 'anon', authorName: 'PixelDaVinci', text: 'It is just a tool. The artist is still the human directing it.', createdAt: new Date(), likes: 24, replies: [] },
            { id: 'c2', authorId: 'anon', authorName: 'ArtSoul', text: 'But where is the suffering? Art requires struggle.', createdAt: new Date(), likes: 15, replies: [] }
        ],
        status: 'approved'
    },
    {
        id: 'ht1',
        mode: 'standard',
        question: "Pineapple on Pizza?",
        description: "The eternal culinary conflict.",
        category: 'Social',
        options: [
            { id: 'p1', text: 'Abomination', votes: 800, archetypes: { 'Traditionalist': 600 } },
            { id: 'p2', text: 'Delicious', votes: 650, archetypes: { 'Rebel': 400, 'Chaos Agent': 200 } }
        ],
        totalVotes: 1450,
        createdAt: new Date(),
        authorId: 'system',
        isHot: true, // Marked as hot take
        comments: [],
        status: 'approved'
    },
    {
        id: 'sp2',
        mode: 'standard',
        question: "Would you upload your consciousness to the cloud if it meant immortality?",
        description: "Leaving your biological body behind for eternal digital existence.",
        category: 'Hypothetical',
        options: [
            { id: 'u1', text: 'In a heartbeat.', votes: 210, archetypes: { 'Futurist': 150 } },
            { id: 'u2', text: 'Never. That is suicide.', votes: 480, archetypes: { 'Humanist': 300, 'Skeptic': 100 } },
            { id: 'u3', text: 'Only if I can disconnect.', votes: 300, archetypes: { 'Strategist': 200 } }
        ],
        totalVotes: 990,
        createdAt: new Date(),
        authorId: 'system',
        isHot: true,
        comments: [],
        status: 'approved'
    },
    {
        id: 'ht2',
        mode: 'standard',
        question: "Is social media a net positive for humanity?",
        description: "Connecting the world vs. destroying mental health.",
        category: 'Social',
        options: [
            { id: 'sm1', text: 'Net Positive', votes: 400, archetypes: { 'Optimist': 300 } },
            { id: 'sm2', text: 'Net Negative', votes: 420, archetypes: { 'Cynic': 300 } }
        ],
        totalVotes: 820,
        createdAt: new Date(),
        authorId: 'system',
        isHot: true,
        comments: [],
        status: 'approved'
    }
];

const generateSimulatedVotes = (polls: Poll[]) => {
    return polls.map(poll => {
        if (poll.mode === 'consciousness') {
            if (Math.random() > 0.9 && poll.consciousnessEntries) {
                const words = ['Tired', 'Wired', 'Lost', 'Found', 'Angry', 'Peace', 'Numb', 'Fire'];
                const layers: ConsciousnessLayer[] = ['real', 'hidden', 'desired'];
                const newEntry: ConsciousnessResponse = {
                    id: `sim-${Date.now()}`,
                    text: words[Math.floor(Math.random() * words.length)],
                    intensity: Math.floor(Math.random() * 100),
                    layer: layers[Math.floor(Math.random() * layers.length)],
                    emoji: '🤖',
                    createdAt: new Date()
                };
                const newEntries = [...(poll.consciousnessEntries || []), newEntry].slice(-40);
                return { ...poll, consciousnessEntries: newEntries };
            }
            return poll;
        }

        if (Math.random() > 0.8 && poll.options?.length > 0) {
            const randomOptionIdx = Math.floor(Math.random() * poll.options.length);
            const newOptions = poll.options.map((opt, idx) => {
                if (idx === randomOptionIdx) {
                    const archetypes = opt.archetypes ? { ...opt.archetypes } : {};
                    const type = ['Realist', 'Dreamer', 'Skeptic', 'Optimist'][Math.floor(Math.random() * 4)];
                    archetypes[type] = (archetypes[type] || 0) + 1;
                    return { ...opt, votes: opt.votes + 1, archetypes };
                }
                return opt;
            });
            return {
                ...poll,
                options: newOptions,
                totalVotes: (poll.totalVotes || 0) + 1
            };
        }
        return poll;
    });
};

const GUEST_ACTION_LIMIT = 3;

const App: React.FC = () => {
    // Added 'election' to view state
    const [view, setView] = useState<'feed' | 'profile' | 'explore' | 'saved' | 'settings' | 'moderation' | 'election'>('feed');
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Auth State
    const [user, setUser] = useState<UserProfile | null>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
    const [guestInteractionCount, setGuestInteractionCount] = useState(0);

    // Onboarding State
    const [showOnboarding, setShowOnboarding] = useState(false);

    // Data State
    const [polls, setPolls] = useState<Poll[]>([]);
    const [pendingPolls, setPendingPolls] = useState<Poll[]>([]); // For admin
    const [isLoadingPolls, setIsLoadingPolls] = useState(true);
    const [voteHistory, setVoteHistory] = useState<{ question: string, choice: string, category: string }[]>([]);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [showMobileSearch, setShowMobileSearch] = useState(false);

    // Sidebar State
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // UI State
    const [notification, setNotification] = useState<string | null>(null);

    // Notifications State
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);

    // 1. INITIALIZE DATA & AUTH
    useEffect(() => {
        const init = async () => {
            // A. Check Onboarding
            const hasOnboarded = localStorage.getItem('has_onboarded');
            if (!hasOnboarded) {
                setShowOnboarding(true);
            }

            // B. Restore Guest Count
            const storedGuestCount = localStorage.getItem('guest_interactions');
            if (storedGuestCount) {
                setGuestInteractionCount(parseInt(storedGuestCount, 10));
            }

            // C. Try to restore session
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const profile = await api.getProfile();
                    setUser(profile);
                } catch (e) {
                    console.warn("Session restore failed (Backend might be offline):", e);
                }
            }

            // D. Fetch Polls
            try {
                const serverPolls = await api.getPolls();
                if (serverPolls && serverPolls.length > 0) {
                    setPolls(serverPolls);
                } else {
                    setPolls(SEED_POLLS); // Fallback if DB empty
                }
            } catch (e) {
                console.warn("Backend unavailable. Running in offline simulation mode.");
                setPolls(SEED_POLLS);
            } finally {
                setIsLoadingPolls(false);
            }
        };
        init();
    }, []);

    // Fetch Notifications when user logs in
    useEffect(() => {
        if (user) {
            const fetchNotifs = async () => {
                try {
                    const data = await api.getNotifications();
                    setNotifications(data);
                } catch (e) {
                    console.warn("Failed to fetch notifications");
                }
            };
            fetchNotifs();
            // Poll for notifications every minute
            const interval = setInterval(fetchNotifs, 60000);
            return () => clearInterval(interval);
        } else {
            setNotifications([]);
        }
    }, [user]);

    // Fetch Pending Polls when entering moderation view
    useEffect(() => {
        if (view === 'moderation' && user?.role === 'admin') {
            const fetchPending = async () => {
                try {
                    const pending = await api.getPendingPolls();
                    setPendingPolls(pending);
                } catch (e) {
                    console.error("Failed to fetch pending polls", e);
                }
            };
            fetchPending();
        }
    }, [view, user]);

    // 2. LIVE SIMULATION ENGINE
    // Runs on top of real data to make the app feel alive
    useEffect(() => {
        const interval = setInterval(() => {
            setPolls(currentPolls => generateSimulatedVotes(currentPolls));
        }, 3000); // Slower interval for realism

        return () => clearInterval(interval);
    }, []);

    // Notification Timer
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // Auth Guard Helper
    const requireAuth = (action: () => void) => {
        if (user) {
            action();
        } else {
            setPendingAction(() => action);
            setShowAuthModal(true);
        }
    };

    // Guest Logic Helper
    const handleGuestAction = (action: () => void) => {
        if (user) {
            action();
            return;
        }

        if (guestInteractionCount < GUEST_ACTION_LIMIT) {
            const newCount = guestInteractionCount + 1;
            setGuestInteractionCount(newCount);
            localStorage.setItem('guest_interactions', newCount.toString());

            setNotification(`Guest Mode: ${GUEST_ACTION_LIMIT - newCount} free votes remaining.`);
            action();
        } else {
            setNotification("Guest limit reached. Please initialize identity.");
            setPendingAction(() => action);
            setShowAuthModal(true);
        }
    };

    const handleLogin = (loggedInUser: UserProfile) => {
        setUser(loggedInUser);
        setShowAuthModal(false);
        if (pendingAction) {
            pendingAction();
            setPendingAction(null);
        }
    };

    const handleSignup = (newUser: UserProfile) => {
        setUser(newUser);
        setShowAuthModal(false);
        if (pendingAction) {
            pendingAction();
            setPendingAction(null);
        }
    };

    const handleLogout = () => {
        api.logout();
        setUser(null);
        setVoteHistory([]);
        if (['profile', 'settings', 'saved', 'moderation', 'election'].includes(view)) {
            setView('feed');
        }
    };

    const handleMarkNotificationRead = async (id: string) => {
        try {
            await api.markNotificationRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (e) {
            console.error(e);
        }
    };

    const handleMarkAllNotificationsRead = async () => {
        try {
            await api.markAllNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (e) {
            console.error(e);
        }
    };

    const handleOnboardingComplete = () => {
        localStorage.setItem('has_onboarded', 'true');
        setShowOnboarding(false);
        setNotification("System Initialized. Identity Tag added.");
    };

    // --- ACTIONS ---

    const handleVote = async (pollId: string, optionId: string) => {
        handleGuestAction(async () => {
            try {
                // Optimistic UI Update
                setPolls(current => current.map(p => {
                    if (p.id === pollId) {
                        const newOptions = p.options?.map(o => o.id === optionId ? { ...o, votes: o.votes + 1 } : o) || [];
                        return { ...p, options: newOptions, totalVotes: (p.totalVotes || 0) + 1, userVoteId: optionId };
                    }
                    return p;
                }));

                // Record History locally for visualizer
                const targetPoll = polls.find(p => p.id === pollId);
                if (targetPoll) {
                    const optionText = targetPoll.options?.find(o => o.id === optionId)?.text || '';
                    setVoteHistory(prev => [...prev, {
                        question: targetPoll.question,
                        choice: optionText,
                        category: targetPoll.category
                    }]);
                }

                // Real API Call 
                if (user) {
                    try {
                        await api.vote(pollId, optionId);
                        // Update User stats locally (backend handles real stats)
                        setUser(prev => prev ? ({ ...prev, votesCast: prev.votesCast + 1, xp: prev.xp + 50 }) : null);
                    } catch (err) {
                        console.warn("API vote failed, keeping optimistic state");
                    }
                } else {
                    // Guest vote - don't hit backend protected route, just keep local state
                    console.log("Guest vote recorded locally.");
                }

            } catch (e) {
                console.error("Vote failed:", e);
            }
        });
    };

    const handleAddConsciousnessEntry = (pollId: string, text: string, intensity: number, layer: ConsciousnessLayer, emoji: string) => {
        handleGuestAction(async () => {
            try {
                // Optimistic Update
                const newEntry: ConsciousnessResponse = {
                    id: `temp-${Date.now()}`,
                    text, intensity, layer, emoji, createdAt: new Date()
                };

                setPolls(current => current.map(p => {
                    if (p.id === pollId) {
                        return { ...p, consciousnessEntries: [...(p.consciousnessEntries || []), newEntry], userVoteId: 'contributed' };
                    }
                    return p;
                }));

                if (user) {
                    try {
                        await api.addConsciousnessEntry(pollId, { text, intensity, layer, emoji });
                    } catch (err) {
                        console.warn("API entry failed, keeping optimistic state");
                    }
                }

            } catch (e) {
                console.error("Failed to add entry:", e);
            }
        });
    };

    const handleAddComment = (pollId: string, text: string) => {
        requireAuth(async () => {
            try {
                // Optimistic
                const tempComment: PollComment = {
                    id: `temp-${Date.now()}`,
                    authorId: user!.id,
                    authorName: user!.username,
                    text: text,
                    createdAt: new Date(),
                    likes: 0,
                    replies: []
                };

                setPolls(current => current.map(poll => {
                    if (poll.id === pollId) {
                        return { ...poll, comments: [tempComment, ...poll.comments] };
                    }
                    return poll;
                }));

                // Real API Call
                try {
                    const realComment = await api.addComment(pollId, text);
                    // Replace temp with real
                    setPolls(current => current.map(poll => {
                        if (poll.id === pollId) {
                            const updatedComments = poll.comments.map(c => c.id === tempComment.id ? realComment : c);
                            return { ...poll, comments: updatedComments };
                        }
                        return poll;
                    }));
                } catch (err) {
                    console.warn("API comment failed, keeping optimistic state");
                }

            } catch (e) {
                console.error("Comment failed:", e);
            }
        });
    };

    const handleReplyComment = (pollId: string, parentCommentId: string, text: string) => {
        requireAuth(async () => {
            // Optimistic UI logic...
            const newReply: PollComment = {
                id: `temp-r-${Date.now()}`,
                authorId: user!.id,
                authorName: user!.username,
                text: text,
                createdAt: new Date(),
                likes: 0,
                replies: []
            };

            // Recursive helper to update UI tree
            const addReplyRecursive = (comments: PollComment[]): PollComment[] => {
                return comments.map(c => {
                    if (c.id === parentCommentId) {
                        return { ...c, replies: [...(c.replies || []), newReply] };
                    }
                    if (c.replies && c.replies.length > 0) {
                        return { ...c, replies: addReplyRecursive(c.replies) };
                    }
                    return c;
                });
            };

            setPolls(current => current.map(poll => {
                if (poll.id !== pollId) return poll;
                return { ...poll, comments: addReplyRecursive(poll.comments) };
            }));

            // API Call
            try {
                await api.addComment(pollId, text, parentCommentId);
            } catch (err) {
                console.warn("API reply failed, keeping optimistic state");
            }
        });
    };

    const handleCommentVote = (pollId: string, commentId: string, type: 'up' | 'down') => {
        requireAuth(() => {
            // Local simulation only for comment votes in this MVP as backend endpoint wasn't requested explicitly
            // This keeps UI responsive
            const toggleVoteRecursive = (comments: PollComment[]): PollComment[] => {
                return comments.map(comment => {
                    if (comment.id === commentId) {
                        let newLikes = comment.likes;
                        let newUserVote = comment.userVote;

                        if (comment.userVote === type) {
                            newLikes = type === 'up' ? newLikes - 1 : newLikes + 1;
                            newUserVote = undefined;
                        } else {
                            if (comment.userVote === 'up') newLikes--;
                            if (comment.userVote === 'down') newLikes++;
                            newLikes = type === 'up' ? newLikes + 1 : newLikes - 1;
                            newUserVote = type;
                        }
                        return { ...comment, likes: newLikes, userVote: newUserVote };
                    }
                    if (comment.replies && comment.replies.length > 0) {
                        return { ...comment, replies: toggleVoteRecursive(comment.replies) };
                    }
                    return comment;
                });
            };

            setPolls(current => current.map(poll => {
                if (poll.id !== pollId) return poll;
                return { ...poll, comments: toggleVoteRecursive(poll.comments) };
            }));
        });
    };

    const handleToggleSave = (pollId: string) => {
        requireAuth(() => {
            setUser(prev => {
                if (!prev) return null;
                const currentSaved = prev.savedPollIds || [];
                if (currentSaved.includes(pollId)) {
                    return { ...prev, savedPollIds: currentSaved.filter(id => id !== pollId) };
                } else {
                    return { ...prev, savedPollIds: [...currentSaved, pollId] };
                }
            });
            // Note: Ideally persist this to backend User model
        });
    };

    const handleCreatePoll = async (pollData: Partial<Poll>) => {
        if (!user) return;

        try {
            await api.createPoll({
                question: pollData.question,
                category: pollData.category,
                options: pollData.options,
                mode: pollData.mode || 'standard', // Use passed mode
                description: pollData.description || '', // Use passed description
            });

            setShowCreateModal(false);
            setNotification("Poll submitted for moderation.");
        } catch (e) {
            console.error("Create poll failed:", e);
            // Fallback for offline simulation only
            const newPoll: Poll = {
                id: `local-${Date.now()}`,
                question: pollData.question || '',
                category: pollData.category || 'Social',
                options: pollData.options as any || [],
                mode: pollData.mode || 'standard',
                description: pollData.description || '',
                authorId: user.id,
                totalVotes: 0,
                comments: [],
                isHot: false,
                createdAt: new Date(),
                status: 'approved', // Auto approve local
                consciousnessEntries: [] // Initialize for safety
            };
            setPolls(prev => [newPoll, ...prev]);
            setShowCreateModal(false);
            setNotification("Poll created (Offline Mode)");
        }
    };

    const handleApprovePoll = async (pollId: string) => {
        try {
            await api.updatePollStatus(pollId, 'approved');
            // Remove from pending
            setPendingPolls(prev => prev.filter(p => p.id !== pollId));
            setNotification("Poll Approved");
        } catch (e) {
            console.error("Approval failed", e);
        }
    };

    const handleRejectPoll = async (pollId: string) => {
        try {
            await api.updatePollStatus(pollId, 'rejected');
            // Remove from pending
            setPendingPolls(prev => prev.filter(p => p.id !== pollId));
            setNotification("Poll Rejected");
        } catch (e) {
            console.error("Rejection failed", e);
        }
    };

    const handleProfileUpdate = (persona: any) => {
        setUser(prev => prev ? ({ ...prev, ...persona }) : null);
        // Note: Add api.updateProfile call here in future
    };

    const handleFuturePrediction = async (pollId: string): Promise<FuturePrediction> => {
        let result: FuturePrediction = { predictionText: '', predictedOptions: [] };
        if (!user) {
            setShowAuthModal(true);
            return result;
        }

        const poll = polls.find(p => p.id === pollId);
        if (!poll || poll.prediction) return { predictionText: '', predictedOptions: [] };

        try {
            result = await predictFutureTrend(poll.question, poll.options || []);
            setPolls(curr => curr.map(p => {
                if (p.id === pollId) {
                    return { ...p, prediction: result };
                }
                return p;
            }));
            return result;
        } catch (e) {
            console.error("Prediction failed", e);
            return { predictionText: "The future is cloudy.", predictedOptions: [] };
        }
    };

    const handleUpdateUser = (updates: Partial<UserProfile>) => {
        setUser(prev => prev ? ({ ...prev, ...updates }) : null);
    };

    // --- FILTERING LOGIC ---
    const filteredPolls = polls.filter(poll => {
        if (!searchQuery) return true;
        const lowerQuery = searchQuery.toLowerCase();

        const matchesQuestion = poll.question.toLowerCase().includes(lowerQuery);
        const matchesDescription = poll.description?.toLowerCase().includes(lowerQuery);
        const matchesCategory = poll.category.toLowerCase().includes(lowerQuery);
        const matchesOptions = poll.options?.some(opt => opt.text.toLowerCase().includes(lowerQuery));

        return matchesQuestion || matchesDescription || matchesCategory || matchesOptions;
    });

    const getHotTakes = () => {
        return filteredPolls.filter(p => p.isHot || (p.totalVotes || 0) > 1000).sort((a, b) => (b.totalVotes || 0) - (a.totalVotes || 0));
    };

    // --- NAVIGATION GUARDS ---
    const handleViewChange = (newView: typeof view) => {
        if (['profile', 'saved', 'settings', 'moderation', 'election'].includes(newView)) {
            requireAuth(() => setView(newView));
        } else {
            setView(newView);
        }
        // Close mobile search if navigating away
        setShowMobileSearch(false);
    };

    const handleOpenCreate = () => {
        requireAuth(() => setShowCreateModal(true));
    }

    return (
        <div className="min-h-screen bg-surface-900 text-white font-sans selection:bg-neon-blue selection:text-black flex flex-col relative">

            {/* --- HEADER --- */}
            <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-surface-200 w-full">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                    {/* Logo & Sidebar Toggle */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="hidden md:flex p-2 rounded-lg text-gray-400 hover:text-white hover:bg-surface-200 transition-all active:scale-95"
                            title="Toggle Sidebar"
                        >
                            <PanelLeft size={20} className={isSidebarOpen ? 'text-neon-blue' : ''} />
                        </button>

                        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setView('feed')}>
                            <div className="relative">
                                <div className="w-8 h-8 bg-gradient-to-tr from-neon-blue to-neon-purple rounded-md flex items-center justify-center transform group-hover:rotate-12 transition-transform">
                                    <Activity className="text-black w-5 h-5" />
                                </div>
                                <div className="absolute -inset-1 bg-neon-blue/30 blur opacity-0 group-hover:opacity-100 transition-opacity rounded-md"></div>
                            </div>
                            <span className="font-display font-bold text-xl tracking-tighter">POLL<span className="text-neon-blue">X</span></span>
                        </div>
                    </div>

                    {/* Search Bar (Desktop) */}
                    <div className="hidden md:flex flex-1 max-w-md mx-8">
                        <div className="relative w-full group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={16} className="text-gray-500 group-focus-within:text-neon-blue transition-colors" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search polls, tags, or people..."
                                className="w-full bg-surface-100 border border-surface-300 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue focus:shadow-[0_0_15px_rgba(0,243,255,0.2)] transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        {/* Mobile Search Toggle */}
                        <button
                            onClick={() => setShowMobileSearch(!showMobileSearch)}
                            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
                        >
                            {showMobileSearch ? <X size={20} /> : <Search size={20} />}
                        </button>

                        <button
                            onClick={handleOpenCreate}
                            className="md:hidden w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.3)] active:scale-95 transition-transform"
                        >
                            <PlusCircle size={24} />
                        </button>
                        <div className="hidden md:flex items-center gap-3">
                            <div className="relative">
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="w-10 h-10 rounded-full hover:bg-surface-200 flex items-center justify-center transition-colors relative"
                                >
                                    <Bell size={20} className={showNotifications ? 'text-neon-blue' : 'text-gray-400'} />
                                    {notifications.some(n => !n.read) && <span className="absolute top-2 right-2 w-2 h-2 bg-neon-pink rounded-full border-2 border-surface-900 animate-pulse"></span>}
                                </button>
                                {showNotifications && (
                                    <NotificationDropdown
                                        notifications={notifications}
                                        onMarkRead={handleMarkNotificationRead}
                                        onMarkAllRead={handleMarkAllNotificationsRead}
                                        onClose={() => setShowNotifications(false)}
                                    />
                                )}
                            </div>

                            {user ? (
                                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple p-[2px] cursor-pointer" onClick={() => setView('profile')}>
                                    <img src={user.avatarUrl} alt="Me" className="rounded-full w-full h-full object-cover border-2 border-black" />
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    {/* Guest Counter - Visible immediately now */}
                                    {guestInteractionCount < GUEST_ACTION_LIMIT && (
                                        <div className="text-xs text-gray-400 font-mono hidden lg:block mr-3">
                                            <span className="text-neon-blue font-bold">{GUEST_ACTION_LIMIT - guestInteractionCount}</span> guest votes left
                                        </div>
                                    )}
                                    <button
                                        onClick={() => setShowAuthModal(true)}
                                        className="px-4 py-2 bg-surface-200 hover:bg-white hover:text-black rounded-lg text-xs font-bold uppercase tracking-wide transition-all"
                                    >
                                        Connect ID
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Search Bar (Slide Down) */}
                {showMobileSearch && (
                    <div className="md:hidden border-t border-surface-200 bg-surface-100 p-4 animate-slide-up">
                        <div className="relative w-full group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={16} className="text-neon-blue" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                                placeholder="Search..."
                                className="w-full bg-surface-50 border border-surface-300 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-neon-blue transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* --- MAIN LAYOUT GRID --- */}
            <div className={`flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 grid gap-8 pt-6 pb-24 md:pb-6 transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] grid-cols-1 md:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr_300px]`}>

                {/* --- LEFT SIDEBAR (Desktop/Tablet) --- */}
                <aside className={`hidden md:flex flex-col sticky top-24 h-[calc(100vh-7rem)] justify-between overflow-hidden whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${isSidebarOpen ? 'w-[240px] opacity-100' : 'w-0 opacity-0'}`}>
                    <nav className="space-y-2">
                        <button
                            onClick={() => handleViewChange('feed')}
                            className={`flex items-center gap-4 w-full p-3 rounded-xl transition-all duration-200 group ${view === 'feed' ? 'bg-surface-200 text-white font-bold' : 'text-gray-400 hover:text-white hover:bg-surface-100'}`}
                        >
                            <Home size={22} className={view === 'feed' ? 'text-neon-blue' : 'group-hover:text-neon-blue transition-colors'} />
                            <span className="text-base">Home Feed</span>
                        </button>

                        <button
                            onClick={() => handleViewChange('explore')}
                            className={`flex items-center gap-4 w-full p-3 rounded-xl transition-all duration-200 group ${view === 'explore' ? 'bg-surface-200 text-white font-bold' : 'text-gray-400 hover:text-white hover:bg-surface-100'}`}
                        >
                            <Hash size={22} className={view === 'explore' ? 'text-neon-pink' : 'group-hover:text-neon-pink transition-colors'} />
                            <span className="text-base">Explore</span>
                        </button>

                        <button
                            onClick={() => handleViewChange('profile')}
                            className={`flex items-center gap-4 w-full p-3 rounded-xl transition-all duration-200 group ${view === 'profile' ? 'bg-surface-200 text-white font-bold' : 'text-gray-400 hover:text-white hover:bg-surface-100'}`}
                        >
                            <User size={22} className={view === 'profile' ? 'text-neon-purple' : 'group-hover:text-neon-purple transition-colors'} />
                            <span className="text-base">Identity</span>
                        </button>

                        <button
                            onClick={() => handleViewChange('saved')}
                            className={`flex items-center gap-4 w-full p-3 rounded-xl transition-all duration-200 group ${view === 'saved' ? 'bg-surface-200 text-white font-bold' : 'text-gray-400 hover:text-white hover:bg-surface-100'}`}
                        >
                            <Bookmark size={22} className={view === 'saved' ? 'text-neon-green' : 'group-hover:text-neon-green transition-colors'} />
                            <span className="text-base">Saved</span>
                        </button>

                        {/* NEW ELECTION MODULE LINK */}
                        <button
                            onClick={() => handleViewChange('election')}
                            className={`flex items-center gap-4 w-full p-3 rounded-xl transition-all duration-200 group ${view === 'election' ? 'bg-surface-200 text-white font-bold' : 'text-gray-400 hover:text-white hover:bg-surface-100'}`}
                        >
                            <Flag size={22} className={view === 'election' ? 'text-yellow-500' : 'group-hover:text-yellow-500 transition-colors'} />
                            <span className="text-base flex items-center gap-2">
                                Election
                                <span className="text-[9px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 px-1.5 rounded-full font-bold">BETA</span>
                            </span>
                        </button>

                        {user?.role === 'admin' && (
                            <button
                                onClick={() => handleViewChange('moderation')}
                                className={`flex items-center gap-4 w-full p-3 rounded-xl transition-all duration-200 group ${view === 'moderation' ? 'bg-surface-200 text-white font-bold' : 'text-gray-400 hover:text-white hover:bg-surface-100'}`}
                            >
                                <ShieldCheck size={22} className={view === 'moderation' ? 'text-yellow-400' : 'group-hover:text-yellow-400 transition-colors'} />
                                <span className="text-base">Moderation</span>
                            </button>
                        )}

                        <button
                            onClick={() => handleViewChange('settings')}
                            className={`flex items-center gap-4 w-full p-3 rounded-xl transition-all duration-200 group ${view === 'settings' ? 'bg-surface-200 text-white font-bold' : 'text-gray-400 hover:text-white hover:bg-surface-100'}`}
                        >
                            <Settings size={22} className={view === 'settings' ? 'text-gray-200' : 'group-hover:text-white transition-colors'} />
                            <span className="text-base">Settings</span>
                        </button>
                    </nav>

                    <div className="space-y-4">
                        <button
                            onClick={handleOpenCreate}
                            className="w-full py-3.5 bg-white text-black font-bold rounded-xl hover:bg-neon-blue hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2"
                        >
                            <PlusCircle size={20} />
                            <span>New Poll</span>
                        </button>

                        {/* Mini User Card */}
                        {user ? (
                            <div className="bg-surface-100 p-4 rounded-xl border border-surface-300 flex items-center gap-3 hover:border-surface-400 transition-colors cursor-pointer" onClick={() => setView('profile')}>
                                <img src={user.avatarUrl} alt="User" className="w-10 h-10 rounded-full bg-surface-300" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold truncate text-white">{user.username}</p>
                                    <p className="text-xs text-neon-blue truncate">{user.identityTitle}</p>
                                </div>
                                <LogOut size={16} className="text-gray-500 hover:text-red-500 transition-colors" onClick={(e) => { e.stopPropagation(); handleLogout(); }} />
                            </div>
                        ) : (
                            <div className="bg-surface-100 p-4 rounded-xl border border-surface-300 text-center">
                                <p className="text-xs text-gray-400 mb-3">Join the collective consciousness.</p>
                                <button onClick={() => setShowAuthModal(true)} className="w-full py-2 bg-surface-200 hover:bg-white hover:text-black rounded-lg text-xs font-bold uppercase transition-colors">
                                    Initialize
                                </button>
                            </div>
                        )}
                    </div>
                </aside>

                {/* --- MIDDLE COLUMN (CONTENT) --- */}
                <main className="w-full min-w-0">
                    {isLoadingPolls && view === 'feed' ? (
                        <div className="flex flex-col items-center justify-center h-64 space-y-4 animate-pulse">
                            <Activity className="text-neon-blue w-12 h-12" />
                            <p className="text-sm text-gray-500 font-mono">SYNCING WITH GLOBAL FEED...</p>
                        </div>
                    ) : (
                        <>
                            {view === 'feed' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {/* Trending Banner (Only show if not searching) */}
                                    {!searchQuery && (
                                        <div className="relative overflow-hidden rounded-2xl bg-surface-100 border border-surface-300 p-6 md:p-8 group hover:border-neon-blue/30 transition-all">
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-neon-pink/10 text-neon-pink border border-neon-pink/20 rounded-full text-[10px] font-bold tracking-wider uppercase">
                                                        <Flame size={12} fill="currentColor" /> Global Consensus
                                                    </span>
                                                    <span className="text-xs text-gray-400 font-mono">LIVE FEED</span>
                                                </div>
                                                <h2 className="text-2xl md:text-3xl font-display font-bold max-w-lg mb-2 leading-tight">
                                                    Is society becoming more empathetic or more detached?
                                                </h2>
                                                <p className="text-gray-400 text-sm">14,203 votes • <span className="text-neon-green">Trending now</span></p>
                                            </div>
                                            {/* Abstract graphic */}
                                            <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-neon-blue/10 to-transparent"></div>
                                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-neon-purple/20 blur-[60px] rounded-full"></div>
                                        </div>
                                    )}

                                    {/* Filter Tabs */}
                                    {!searchQuery && (
                                        <div className="sticky top-[4.5rem] z-30 bg-surface-900/80 backdrop-blur-md py-2 -mx-4 px-4 md:mx-0 md:px-0 flex items-center justify-between border-b border-surface-200/50 md:border-none md:bg-transparent md:backdrop-filter-none md:static">
                                            <h3 className="text-lg font-bold text-gray-200 flex items-center gap-2">
                                                <Globe className="w-4 h-4 text-neon-blue" />
                                                Live Feed
                                            </h3>
                                            <div className="flex gap-2">
                                                <button className="px-4 py-1.5 rounded-full bg-surface-200 text-white text-xs font-bold hover:bg-surface-300 transition-colors">Hot</button>
                                                <button className="px-4 py-1.5 rounded-full text-gray-500 hover:text-white hover:bg-surface-100 text-xs font-bold transition-colors">New</button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Search Results Header */}
                                    {searchQuery && (
                                        <div className="mb-4">
                                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                <Search className="w-5 h-5 text-neon-blue" />
                                                Results for "{searchQuery}"
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">Found {filteredPolls.length} matches in the collective data.</p>
                                        </div>
                                    )}

                                    <div className="space-y-6">
                                        {filteredPolls.length > 0 ? (
                                            filteredPolls.map(poll => (
                                                <PollCard
                                                    key={poll.id}
                                                    poll={poll}
                                                    onVote={handleVote}
                                                    onAddComment={handleAddComment}
                                                    onVoteComment={handleCommentVote}
                                                    onReplyComment={handleReplyComment}
                                                    isSaved={user?.savedPollIds?.includes(poll.id)}
                                                    onToggleSave={handleToggleSave}
                                                    onPredict={handleFuturePrediction}
                                                    onAddConsciousnessEntry={handleAddConsciousnessEntry}
                                                />
                                            ))
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-20 bg-surface-100 rounded-2xl border border-surface-300 border-dashed">
                                                <div className="w-16 h-16 bg-surface-200 rounded-full flex items-center justify-center mb-4">
                                                    <Search className="w-8 h-8 text-gray-500" />
                                                </div>
                                                <h3 className="text-lg font-bold text-white mb-2">Data Void Detected</h3>
                                                <p className="text-gray-400 text-sm text-center max-w-xs">
                                                    No collective thoughts match your query.
                                                    <br />Be the first to broadcast this topic.
                                                </p>
                                                <button
                                                    onClick={handleOpenCreate}
                                                    className="mt-6 text-neon-blue hover:text-white font-bold text-xs uppercase tracking-wider transition-colors"
                                                >
                                                    + Create New Signal
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {view === 'election' && (
                                <ElectionHub user={user} />
                            )}

                            {view === 'moderation' && user?.role === 'admin' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center gap-2 mb-6">
                                        <ShieldCheck className="text-yellow-400" />
                                        <h2 className="text-2xl font-bold">Moderation Queue</h2>
                                    </div>

                                    {pendingPolls.length === 0 ? (
                                        <div className="text-center py-20 bg-surface-100 rounded-2xl border border-surface-300">
                                            <p className="text-gray-400">All signals verified. Queue empty.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <p className="text-sm text-gray-500">Reviewing {pendingPolls.length} pending signals.</p>
                                            {pendingPolls.map(poll => (
                                                <PollCard
                                                    key={poll.id}
                                                    poll={poll}
                                                    onVote={handleVote}
                                                    isAdminView={true}
                                                    onApprove={handleApprovePoll}
                                                    onReject={handleRejectPoll}
                                                    // Disable standard interactions in preview
                                                    onAddComment={() => { }}
                                                    onVoteComment={() => { }}
                                                    onReplyComment={() => { }}
                                                    onPredict={async () => ({ predictionText: '', predictedOptions: [] })}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {view === 'profile' && user && (
                                <ProfileView
                                    user={user}
                                    voteHistory={voteHistory}
                                    onUpdateProfile={handleProfileUpdate}
                                />
                            )}

                            {view === 'explore' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                                    {!searchQuery && (
                                        <div className="relative rounded-2xl bg-gradient-to-r from-surface-100 to-black border border-surface-300 p-8 overflow-hidden">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-neon-pink/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                                            <div className="relative z-10">
                                                <h2 className="text-3xl font-display font-bold mb-2 flex items-center gap-3">
                                                    <Sparkles className="text-neon-pink" />
                                                    <span>Explore Dimensions</span>
                                                </h2>
                                                <p className="text-gray-400 max-w-lg">
                                                    Discover new perspectives and trending anomalies in the collective data stream.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* HOT TAKES SECTION */}
                                    <div className="space-y-6">
                                        {!searchQuery && (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                                                        <Flame className="text-red-500 w-5 h-5 animate-pulse" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-white leading-none">Hot Takes</h3>
                                                        <p className="text-xs text-red-400 font-mono mt-1">HIGH POLARIZATION DETECTED</p>
                                                    </div>
                                                </div>
                                                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-surface-200/50 rounded-full border border-surface-300">
                                                    <Activity size={14} className="text-neon-pink" />
                                                    <span className="text-[10px] font-bold text-gray-400">VOLATILITY INDEX: <span className="text-white">CRITICAL</span></span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Hot Takes Grid */}
                                        <div className="grid grid-cols-1 gap-6">
                                            {/* If user is searching, show standard filtered results. If exploring, show Hot Takes specially styled. */}
                                            {searchQuery ? (
                                                filteredPolls.map(poll => (
                                                    <PollCard
                                                        key={poll.id}
                                                        poll={poll}
                                                        onVote={handleVote}
                                                        onAddComment={handleAddComment}
                                                        onVoteComment={handleCommentVote}
                                                        onReplyComment={handleReplyComment}
                                                        isSaved={user?.savedPollIds?.includes(poll.id)}
                                                        onToggleSave={handleToggleSave}
                                                        onPredict={handleFuturePrediction}
                                                        onAddConsciousnessEntry={handleAddConsciousnessEntry}
                                                    />
                                                ))
                                            ) : (
                                                getHotTakes().map(poll => (
                                                    <div key={poll.id} className="relative group/hottake">
                                                        {/* Volatile Indicator Badge */}
                                                        <div className="absolute -top-3 -right-2 z-20 flex items-center gap-1 px-3 py-1 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)] border border-red-400 transform rotate-2 group-hover/hottake:scale-110 transition-transform">
                                                            <AlertTriangle size={10} /> Controversial
                                                        </div>
                                                        {/* Reuse PollCard but wrapper adds context */}
                                                        <div className="border-l-4 border-red-500/50 pl-0 relative">
                                                            {/* Visual "Heat" Glitch effect behind card */}
                                                            <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover/hottake:opacity-100 transition-opacity blur-xl"></div>
                                                            <PollCard
                                                                poll={poll}
                                                                onVote={handleVote}
                                                                onAddComment={handleAddComment}
                                                                onVoteComment={handleCommentVote}
                                                                onReplyComment={handleReplyComment}
                                                                isSaved={user?.savedPollIds?.includes(poll.id)}
                                                                onToggleSave={handleToggleSave}
                                                                onPredict={handleFuturePrediction}
                                                                onAddConsciousnessEntry={handleAddConsciousnessEntry}
                                                            />
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                            {/* Empty state for search in explore */}
                                            {searchQuery && filteredPolls.length === 0 && (
                                                <div className="flex flex-col items-center justify-center py-20 bg-surface-100 rounded-2xl border border-surface-300 border-dashed">
                                                    <div className="w-16 h-16 bg-surface-200 rounded-full flex items-center justify-center mb-4">
                                                        <Search className="w-8 h-8 text-gray-500" />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-white mb-2">No Anomalies Found</h3>
                                                    <p className="text-gray-400 text-sm text-center">
                                                        Your query returned no matches in the explore sector.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            )}

                            {view === 'saved' && user && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Bookmark className="text-neon-green" />
                                        <h2 className="text-2xl font-bold">Saved Collection</h2>
                                    </div>
                                    {filteredPolls.filter(p => user.savedPollIds?.includes(p.id)).length === 0 ? (
                                        <div className="text-center py-20 bg-surface-100 rounded-2xl border border-surface-300">
                                            <p className="text-gray-400">No matching saved polls found.</p>
                                            <button onClick={() => setView('feed')} className="text-neon-blue text-sm mt-2 hover:underline">Go to Feed</button>
                                        </div>
                                    ) : (
                                        filteredPolls.filter(p => user.savedPollIds?.includes(p.id)).map(poll => (
                                            <PollCard
                                                key={poll.id}
                                                poll={poll}
                                                onVote={handleVote}
                                                onAddComment={handleAddComment}
                                                onVoteComment={handleCommentVote}
                                                onReplyComment={handleReplyComment}
                                                isSaved={true}
                                                onToggleSave={handleToggleSave}
                                                onPredict={handleFuturePrediction}
                                                onAddConsciousnessEntry={handleAddConsciousnessEntry}
                                            />
                                        ))
                                    )}
                                </div>
                            )}

                            {view === 'settings' && user && (
                                <SettingsView user={user} onUpdateUser={handleUpdateUser} onLogout={handleLogout} />
                            )}
                        </>
                    )}
                </main>

                {/* --- RIGHT SIDEBAR (Desktop Only) --- */}
                <aside className="hidden lg:block w-[300px] space-y-6 sticky top-24 h-[calc(100vh-7rem)] overflow-y-auto custom-scrollbar pr-2">
                    {/* Collective Mindset Card */}
                    <div className="bg-surface-100 rounded-2xl border border-surface-300 p-5">
                        <div className="flex items-center gap-2 mb-4 text-neon-green">
                            <Activity size={18} />
                            <h3 className="font-display font-bold uppercase tracking-wider text-xs">Collective Mood</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs mb-2 text-gray-400">
                                    <span>Anxious</span>
                                    <span>Hopeful</span>
                                </div>
                                <div className="h-2 bg-surface-300 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-neon-purple to-neon-blue w-[72%]"></div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Global sentiment analysis indicates a 12% rise in technological optimism today.
                            </p>
                        </div>
                    </div>

                    {/* Trending Topics */}
                    <div className="bg-surface-100 rounded-2xl border border-surface-300 p-5">
                        <div className="flex items-center gap-2 mb-4 text-neon-pink">
                            <TrendingUp size={18} />
                            <h3 className="font-display font-bold uppercase tracking-wider text-xs">Trending Topics</h3>
                        </div>
                        <div className="space-y-4">
                            {['#AI_Rights', '#MarsColony', '#UniversalIncome', '#DigitalPrivacy', '#GeneticEditing'].map((tag, i) => (
                                <div key={i} className="flex justify-between items-center group cursor-pointer" onClick={() => setSearchQuery(tag)}>
                                    <span className="text-sm text-gray-300 group-hover:text-neon-blue transition-colors">{tag}</span>
                                    <span className="text-xs text-gray-500">{Math.floor(Math.random() * 50) + 1}k</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Links */}
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-gray-600 px-2">
                        <a href="#" className="hover:text-gray-400">About</a>
                        <a href="#" className="hover:text-gray-400">Privacy</a>
                        <a href="#" className="hover:text-gray-400">Terms</a>
                        <a href="#" className="hover:text-gray-400">API</a>
                        <span>© 2024 POLLX Inc.</span>
                    </div>
                </aside>
            </div>

            {/* --- MOBILE BOTTOM NAV --- */}
            <nav className="fixed bottom-0 w-full bg-surface-100/90 backdrop-blur-lg border-t border-surface-300 md:hidden z-40 pb-safe">
                <div className="flex justify-around items-center h-16">
                    <button
                        onClick={() => handleViewChange('feed')}
                        className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-colors ${view === 'feed' ? 'text-neon-blue' : 'text-gray-500'}`}
                    >
                        <Home size={22} />
                        <span className="text-[10px] font-bold">Feed</span>
                    </button>
                    <button
                        onClick={() => handleViewChange('explore')}
                        className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-colors ${view === 'explore' ? 'text-neon-pink' : 'text-gray-500'}`}
                    >
                        <Hash size={22} />
                        <span className="text-[10px] font-bold">Explore</span>
                    </button>
                    <button
                        onClick={() => handleViewChange('profile')}
                        className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-colors ${view === 'profile' ? 'text-neon-purple' : 'text-gray-500'}`}
                    >
                        <User size={22} />
                        <span className="text-[10px] font-bold">Identity</span>
                    </button>
                    <button
                        onClick={() => handleViewChange('settings')}
                        className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-colors ${view === 'settings' ? 'text-neon-green' : 'text-gray-500'}`}
                    >
                        <Settings size={22} />
                        <span className="text-[10px] font-bold">Settings</span>
                    </button>
                </div>
            </nav>

            {/* Notifications */}
            {notification && (
                <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-surface-100/90 backdrop-blur-lg border border-neon-blue/30 text-white px-6 py-3 rounded-full shadow-[0_0_20px_rgba(0,243,255,0.2)] z-50 flex items-center gap-2 animate-slide-up">
                    <Info size={18} className="text-neon-blue" />
                    <span className="text-sm font-medium">{notification}</span>
                </div>
            )}

            {/* Onboarding Modal */}
            {showOnboarding && (
                <OnboardingModal onComplete={handleOnboardingComplete} />
            )}

            {/* Auth Modal */}
            {showAuthModal && (
                <AuthModal
                    onLogin={handleLogin}
                    onSignup={handleSignup}
                    onClose={() => setShowAuthModal(false)}
                />
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <CreatePoll
                    onSubmit={handleCreatePoll}
                    onCancel={() => setShowCreateModal(false)}
                />
            )}
        </div>
    );
};

export default App;
