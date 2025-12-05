import React, { useState, useEffect } from 'react';
import { Poll } from '../../types';
import { api } from '../services/api';
import PollCard from './PollCard';
import EditPollModal from './EditPollModal';
import { Trash2, Edit2, Plus, AlertCircle } from 'lucide-react';

interface PollManagementProps {
    user: any;
    onOpenCreate: () => void;
}

const PollManagement: React.FC<PollManagementProps> = ({ user, onOpenCreate }) => {
    const [myPolls, setMyPolls] = useState<Poll[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingPoll, setEditingPoll] = useState<Poll | null>(null);

    const fetchMyPolls = async () => {
        try {
            setLoading(true);
            const data = await api.getMyPolls();
            setMyPolls(data);
        } catch (err) {
            setError('Failed to load your polls.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyPolls();
    }, []);

    const handleDelete = async (pollId: string) => {
        if (!confirm('Are you sure you want to delete this poll? This action cannot be undone.')) return;
        try {
            await api.deletePoll(pollId);
            setMyPolls(prev => prev.filter(p => p.id !== pollId));
        } catch (err) {
            alert('Failed to delete poll');
        }
    };

    const handleEdit = (poll: Poll) => {
        setEditingPoll(poll);
    };

    const handleSaveEdit = async (pollId: string, updates: { question: string, options: string[] }) => {
        try {
            const updatedPoll = await api.updatePoll(pollId, updates);
            setMyPolls(prev => prev.map(p => p.id === pollId ? { ...p, ...updatedPoll } : p));
            setEditingPoll(null);
        } catch (err) {
            throw err;
        }
    };

    if (loading) return <div className="text-center py-20 text-gray-500">Loading your signals...</div>;

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-display font-bold text-white mb-2">My Signals</h2>
                    <p className="text-gray-400">Manage your contributions to the collective consciousness.</p>
                </div>
                <button
                    onClick={onOpenCreate}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-neon-blue text-black font-bold rounded-xl hover:bg-neon-blue/90 transition-all shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:shadow-[0_0_30px_rgba(0,243,255,0.5)]"
                >
                    <Plus size={20} />
                    Create New
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-2">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {myPolls.length === 0 ? (
                <div className="text-center py-20 bg-surface-100 rounded-2xl border border-surface-300 border-dashed">
                    <div className="w-16 h-16 bg-surface-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Edit2 className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Signals Yet</h3>
                    <p className="text-gray-400 max-w-md mx-auto mb-6">
                        You haven't created any polls yet. Start a conversation and see what the world thinks.
                    </p>
                    <button
                        onClick={onOpenCreate}
                        className="text-neon-blue hover:text-white font-bold uppercase tracking-wider text-sm"
                    >
                        Create Your First Poll
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {myPolls.map(poll => (
                        <PollCard
                            key={poll.id}
                            poll={poll}
                            onVote={() => { }}
                            onAddComment={() => { }}
                            onVoteComment={() => { }}
                            onReplyComment={() => { }}
                            isSaved={false}
                            onToggleSave={() => { }}
                            onAddConsciousnessEntry={() => { }}

                            // Management Props
                            isOwner={true}
                            onDelete={() => handleDelete(poll.id)}
                            onEdit={() => handleEdit(poll)}
                        />
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            {editingPoll && (
                <EditPollModal
                    poll={editingPoll}
                    isOpen={!!editingPoll}
                    onClose={() => setEditingPoll(null)}
                    onSave={handleSaveEdit}
                />
            )}
        </div>
    );
};

export default PollManagement;
