
import React, { useEffect, useState } from 'react';
import { Candidate, UserProfile } from '../../types';
import { api } from '../services/api';
import CandidateApplication from './CandidateApplication';
import { ShieldCheck, Users, Vote, Lock, AlertCircle, Clock } from 'lucide-react';

interface ElectionHubProps {
    user: UserProfile | null;
}

const ElectionHub: React.FC<ElectionHubProps> = ({ user }) => {
    const [myCandidacy, setMyCandidacy] = useState<Candidate | null>(null);
    const [viewState, setViewState] = useState<'dashboard' | 'apply'>('dashboard');
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            Promise.all([
                api.getMyCandidacy(),
                api.getCandidates() // Mock or real depending on backend state
            ]).then(([me, all]) => {
                setMyCandidacy(me);
                setCandidates(all);
                setLoading(false);
            }).catch(() => setLoading(false));
        }
    }, [user]);

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
                <Lock className="w-12 h-12 text-gray-600" />
                <h2 className="text-xl font-bold text-white">Election Module Locked</h2>
                <p className="text-gray-400">You must be logged in to participate in the democratic process.</p>
            </div>
        );
    }

    if (viewState === 'apply') {
        return (
            <CandidateApplication
                user={user}
                onSuccess={() => {
                    setViewState('dashboard');
                    // Refresh data
                    api.getMyCandidacy().then(setMyCandidacy);
                }}
                onCancel={() => setViewState('dashboard')}
            />
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in">
            {/* Hero Section */}
            <div className="relative rounded-2xl bg-gradient-to-r from-surface-100 to-surface-50 border border-surface-300 p-8 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2 text-yellow-500">
                        <ShieldCheck size={20} />
                        <span className="font-mono text-xs font-bold uppercase tracking-widest">Election Cycle 2024</span>
                    </div>
                    <h1 className="text-3xl font-display font-bold text-white mb-4">Governance Module</h1>
                    <p className="text-gray-400 max-w-xl">
                        Apply for leadership, review automated candidate profiles, and cast your vote for the future of the platform.
                        AI analysis ensures transparency in candidate capabilities.
                    </p>
                </div>
            </div>

            {/* My Candidacy Status */}
            <div className="bg-surface-100 border border-surface-300 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Your Status</h3>

                {loading ? (
                    <div className="animate-pulse h-10 bg-surface-200 rounded"></div>
                ) : myCandidacy ? (
                    <div className="flex items-center justify-between bg-surface-200/50 p-4 rounded-lg border border-surface-300">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-surface-300 rounded-full flex items-center justify-center">
                                <Users className="text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white">{myCandidacy.partyAffiliation || 'Independent'}</h4>
                                <p className="text-xs text-gray-400">Application Date: {new Date(myCandidacy.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {myCandidacy.status === 'pending_review' && (
                                <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 rounded-full text-xs font-bold flex items-center gap-1">
                                    <Clock size={12} /> Under Review
                                </span>
                            )}
                            {myCandidacy.status === 'approved' && (
                                <span className="px-3 py-1 bg-neon-green/10 text-neon-green border border-neon-green/30 rounded-full text-xs font-bold flex items-center gap-1">
                                    <ShieldCheck size={12} /> Approved Candidate
                                </span>
                            )}
                            {myCandidacy.status === 'rejected' && (
                                <span className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/30 rounded-full text-xs font-bold flex items-center gap-1">
                                    <AlertCircle size={12} /> Application Rejected
                                </span>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <p className="text-gray-400 mb-4">You have not applied for candidacy in this cycle.</p>
                        <button
                            onClick={() => setViewState('apply')}
                            className="bg-white text-black px-6 py-2 rounded-lg font-bold hover:bg-neon-blue transition-colors"
                        >
                            Apply for Leadership
                        </button>
                    </div>
                )}
            </div>

            {/* Candidate Pool Preview */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Candidate Pool</h3>
                    <span className="text-xs text-gray-500 font-mono">{candidates.length} Qualified</span>
                </div>

                {candidates.length === 0 ? (
                    <div className="text-center py-12 bg-surface-100 rounded-xl border border-surface-300 border-dashed">
                        <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500">No approved candidates yet. Be the first.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {candidates.map(cand => (
                            <div key={cand.id} className="bg-surface-100 border border-surface-300 p-5 rounded-xl hover:border-neon-blue/30 transition-colors">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-surface-300 rounded-full"></div> {/* Placeholder avatar */}
                                    <div>
                                        <h4 className="font-bold text-white">{cand.user?.username || 'Unknown'}</h4>
                                        <span className="text-xs text-neon-blue">{cand.partyAffiliation}</span>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Leadership Style</span>
                                    <p className="text-sm text-white font-mono">{cand.aiProfile?.leadershipStyle || 'Unknown'}</p>
                                </div>
                                <button className="w-full py-2 border border-surface-300 rounded-lg text-xs font-bold text-gray-300 hover:text-white hover:bg-surface-200 transition-colors">
                                    View Full Profile
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ElectionHub;
