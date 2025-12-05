import React from 'react';
import { Candidate } from '../../types';
import { X, CheckCircle, AlertTriangle, Brain, Target, MessageSquare } from 'lucide-react';

interface CandidatePublicProfileProps {
    candidate: Candidate;
    onClose: () => void;
}

const CandidatePublicProfile: React.FC<CandidatePublicProfileProps> = ({ candidate, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-surface-100 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-surface-300 shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-white hover:text-black transition-colors z-10"
                >
                    <X size={20} />
                </button>

                {/* Header / Cover */}
                <div className="h-48 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 relative">
                    <div className="absolute -bottom-12 left-8 flex items-end gap-6">
                        <div className="w-32 h-32 bg-surface-200 rounded-full border-4 border-surface-100 shadow-xl overflow-hidden">
                            <img
                                src={candidate.user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${candidate.userId}`}
                                alt="Candidate"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="mb-4">
                            <h2 className="text-3xl font-display font-bold text-white flex items-center gap-3">
                                {candidate.user?.username}
                                {candidate.symbol && <span className="text-4xl">{candidate.symbol}</span>}
                            </h2>
                            <span className="bg-neon-blue/10 text-neon-blue px-3 py-1 rounded-full text-sm font-bold border border-neon-blue/30">
                                {candidate.partyAffiliation}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-16 p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: AI Profile */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-black/40 rounded-xl p-6 border border-surface-300">
                            <h3 className="text-neon-purple font-bold mb-4 flex items-center gap-2">
                                <Brain size={18} /> AI Leadership Analysis
                            </h3>

                            <div className="mb-4">
                                <span className="text-[10px] uppercase text-gray-500 font-bold">Archetype</span>
                                <p className="text-xl text-white font-display">{candidate.aiProfile?.leadershipStyle}</p>
                            </div>

                            <div className="mb-4">
                                <span className="text-[10px] uppercase text-gray-500 font-bold">Agenda Alignment</span>
                                <div className="w-full bg-surface-300 h-2 rounded-full mt-1">
                                    <div
                                        className="bg-neon-green h-full rounded-full"
                                        style={{ width: `${candidate.aiProfile?.agendaScore || 50}%` }}
                                    ></div>
                                </div>
                                <div className="text-right text-xs text-neon-green mt-1">{candidate.aiProfile?.agendaScore}% Match</div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <h4 className="text-xs font-bold text-white mb-2">Strengths</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {candidate.aiProfile?.strengths.map(s => (
                                            <span key={s} className="text-[10px] bg-surface-200 px-2 py-1 rounded text-gray-300 border border-surface-300">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-white mb-2">Weaknesses</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {candidate.aiProfile?.weaknesses.map(w => (
                                            <span key={w} className="text-[10px] bg-red-500/10 text-red-400 px-2 py-1 rounded border border-red-500/20">
                                                {w}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-surface-200/50 rounded-xl p-6">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-4">Experience</h4>
                            <p className="text-sm text-gray-300 leading-relaxed">
                                {candidate.experience}
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Manifesto & Campaign */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-4">Manifesto</h3>
                            <div className="bg-surface-50 p-6 rounded-xl border border-surface-300 text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {candidate.manifesto}
                            </div>
                        </div>

                        {candidate.promises && candidate.promises.length > 0 && (
                            <div>
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Target className="text-neon-blue" /> Key Promises
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {candidate.promises.map((promise, i) => (
                                        <div key={i} className="flex items-start gap-3 bg-surface-200/30 p-4 rounded-lg">
                                            <CheckCircle className="text-neon-green shrink-0 mt-1" size={16} />
                                            <p className="text-sm text-gray-200">{promise}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {candidate.keyIssues && candidate.keyIssues.length > 0 && (
                            <div>
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <AlertTriangle className="text-yellow-500" /> Key Issues
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {candidate.keyIssues.map((issue, i) => (
                                        <span key={i} className="px-4 py-2 bg-surface-200 rounded-lg text-sm text-white border border-surface-300">
                                            {issue}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidatePublicProfile;
