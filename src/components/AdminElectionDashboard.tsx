import React, { useEffect, useState } from 'react';
import { Candidate } from '../../types';
import { api } from '../services/api';
import { ShieldCheck, XCircle, CheckCircle, Clock, User } from 'lucide-react';

const AdminElectionDashboard: React.FC = () => {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCandidates = async () => {
        try {
            const data = await api.getAllCandidates();
            setCandidates(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCandidates();
    }, []);

    const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
        if (!confirm(`Are you sure you want to ${status} this candidate?`)) return;
        try {
            await api.updateCandidateStatus(id, status);
            setCandidates(prev => prev.map(c => c.id === id ? { ...c, status } : c));
        } catch (error) {
            alert('Failed to update status');
        }
    };

    if (loading) return <div className="text-center py-20 text-gray-500">Loading election data...</div>;

    return (
        <div className="space-y-8 animate-in fade-in">
            <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="text-neon-blue w-8 h-8" />
                <div>
                    <h2 className="text-2xl font-bold text-white">Election Control</h2>
                    <p className="text-gray-400">Manage candidate applications and election integrity.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {candidates.length === 0 ? (
                    <div className="text-center py-12 bg-surface-100 rounded-xl border border-surface-300 border-dashed">
                        <p className="text-gray-500">No candidate applications found.</p>
                    </div>
                ) : (
                    candidates.map(candidate => (
                        <div key={candidate.id} className="bg-surface-100 border border-surface-300 p-6 rounded-xl flex flex-col md:flex-row justify-between gap-6">
                            <div className="flex gap-4">
                                <div className="w-16 h-16 bg-surface-200 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                                    {candidate.user?.avatarUrl ? (
                                        <img src={candidate.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="text-gray-400" />
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-lg font-bold text-white">{candidate.user?.username || 'Unknown User'}</h3>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${candidate.status === 'approved' ? 'bg-neon-green/20 text-neon-green' :
                                                candidate.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                                                    'bg-yellow-500/20 text-yellow-500'
                                            }`}>
                                            {candidate.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <p className="text-neon-blue text-sm font-bold mb-2">{candidate.partyAffiliation}</p>

                                    <div className="space-y-2 text-sm text-gray-400">
                                        <p><span className="text-gray-500 uppercase text-xs font-bold">Manifesto:</span> {candidate.manifesto}</p>
                                        <p><span className="text-gray-500 uppercase text-xs font-bold">Background:</span> {candidate.background}</p>
                                        <p><span className="text-gray-500 uppercase text-xs font-bold">AI Profile:</span> {candidate.aiProfile?.leadershipStyle}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-row md:flex-col gap-2 justify-center shrink-0">
                                {candidate.status === 'pending_review' && (
                                    <>
                                        <button
                                            onClick={() => handleStatusUpdate(candidate.id, 'approved')}
                                            className="px-4 py-2 bg-neon-green/10 text-neon-green border border-neon-green/30 rounded-lg hover:bg-neon-green hover:text-black font-bold transition-all flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle size={16} /> Approve
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(candidate.id, 'rejected')}
                                            className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/30 rounded-lg hover:bg-red-500 hover:text-white font-bold transition-all flex items-center justify-center gap-2"
                                        >
                                            <XCircle size={16} /> Reject
                                        </button>
                                    </>
                                )}
                                {candidate.status !== 'pending_review' && (
                                    <button
                                        onClick={() => handleStatusUpdate(candidate.id, candidate.status === 'approved' ? 'rejected' : 'approved')}
                                        className="text-xs text-gray-500 hover:text-white underline"
                                    >
                                        Change Status
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminElectionDashboard;
