import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Election, Candidate } from '../../types';
import { Flag, Target, MessageSquare, CheckCircle, AlertTriangle } from 'lucide-react';

interface CampaignSetupProps {
    onSuccess: () => void;
}

const CampaignSetup: React.FC<CampaignSetupProps> = ({ onSuccess }) => {
    const [elections, setElections] = useState<Election[]>([]);
    const [selectedElection, setSelectedElection] = useState<string>('');
    const [formData, setFormData] = useState({
        symbol: '',
        promises: [''],
        keyIssues: ['']
    });

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadElections();
    }, []);

    const loadElections = async () => {
        try {
            const data = await api.getElections();
            // Filter for upcoming or active elections
            setElections(data.filter(e => e.status === 'upcoming' || e.status === 'active'));
        } catch (e) {
            console.error(e);
            setError('Failed to load elections');
        }
    };

    const handleArrayChange = (field: 'promises' | 'keyIssues', index: number, value: string) => {
        const newArray = [...formData[field]];
        newArray[index] = value;
        setFormData({ ...formData, [field]: newArray });
    };

    const addArrayItem = (field: 'promises' | 'keyIssues') => {
        setFormData({ ...formData, [field]: [...formData[field], ''] });
    };

    const handleSubmit = async () => {
        if (!selectedElection) {
            setError('Please select an election event.');
            return;
        }
        setError(null);
        try {
            await api.joinElection({
                electionId: selectedElection,
                symbol: formData.symbol,
                promises: formData.promises.filter(p => p.trim()),
                keyIssues: formData.keyIssues.filter(k => k.trim())
            });
            onSuccess();
        } catch (e: any) {
            console.error(e);
            setError(e.message || 'Failed to launch campaign. Please try again.');
        }
    };

    return (
        <div className="bg-surface-100 border border-surface-300 rounded-2xl p-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <Flag className="text-neon-green" /> Campaign Setup
            </h2>
            <p className="text-gray-400 mb-8">Launch your official election campaign.</p>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg mb-6 flex items-center gap-2">
                    <AlertTriangle size={18} />
                    {error}
                </div>
            )}

            <div className="space-y-6">
                {/* Election Selection */}
                <div>
                    <label className="block text-xs font-mono text-gray-500 uppercase mb-2">Select Election Event</label>
                    <div className="grid gap-3">
                        {elections.map(e => (
                            <div
                                key={e.id}
                                onClick={() => setSelectedElection(e.id)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedElection === e.id
                                    ? 'bg-neon-blue/10 border-neon-blue'
                                    : 'bg-surface-50 border-surface-300 hover:border-gray-500'
                                    }`}
                            >
                                <div className="flex justify-between items-center">
                                    <h4 className="font-bold text-white">{e.title}</h4>
                                    {selectedElection === e.id && <CheckCircle className="text-neon-blue" size={20} />}
                                </div>
                                <p className="text-xs text-gray-400 mt-1">{e.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Symbol */}
                <div>
                    <label className="block text-xs font-mono text-gray-500 uppercase mb-2">Campaign Symbol (Emoji)</label>
                    <input
                        type="text"
                        placeholder="e.g. 🚀, 🦁, 💡"
                        value={formData.symbol}
                        onChange={e => setFormData({ ...formData, symbol: e.target.value })}
                        className="w-full bg-surface-50 border border-surface-300 rounded-lg p-3 text-white focus:border-neon-blue outline-none text-2xl"
                    />
                </div>

                {/* Promises */}
                <div>
                    <label className="block text-xs font-mono text-gray-500 uppercase mb-2">Key Promises</label>
                    {formData.promises.map((promise, i) => (
                        <input
                            key={i}
                            type="text"
                            placeholder={`Promise #${i + 1}`}
                            value={promise}
                            onChange={e => handleArrayChange('promises', i, e.target.value)}
                            className="w-full bg-surface-50 border border-surface-300 rounded-lg p-3 text-white focus:border-neon-blue outline-none mb-2"
                        />
                    ))}
                    <button onClick={() => addArrayItem('promises')} className="text-xs text-neon-blue hover:text-white">+ Add Promise</button>
                </div>

                {/* Key Issues */}
                <div>
                    <label className="block text-xs font-mono text-gray-500 uppercase mb-2">Key Issues</label>
                    {formData.keyIssues.map((issue, i) => (
                        <input
                            key={i}
                            type="text"
                            placeholder={`Issue #${i + 1}`}
                            value={issue}
                            onChange={e => handleArrayChange('keyIssues', i, e.target.value)}
                            className="w-full bg-surface-50 border border-surface-300 rounded-lg p-3 text-white focus:border-neon-blue outline-none mb-2"
                        />
                    ))}
                    <button onClick={() => addArrayItem('keyIssues')} className="text-xs text-neon-blue hover:text-white">+ Add Issue</button>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={!selectedElection || !formData.symbol}
                    className="w-full bg-neon-green text-black font-bold py-4 rounded-xl hover:bg-green-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Launch Campaign
                </button>
            </div>
        </div>
    );
};

export default CampaignSetup;
