import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Election } from '../../types';
import { Plus, Calendar, Map, Play, Pause, Square } from 'lucide-react';

const AdminElectionManager: React.FC = () => {
    const [elections, setElections] = useState<Election[]>([]);
    const [showCreate, setShowCreate] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        regions: '' // Comma separated
    });

    useEffect(() => {
        loadElections();
    }, []);

    const loadElections = async () => {
        try {
            const data = await api.getElections();
            setElections(data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleCreate = async () => {
        try {
            await api.createElection({
                ...formData,
                regions: formData.regions.split(',').map(r => r.trim())
            });
            setShowCreate(false);
            loadElections();
            setFormData({ title: '', description: '', startDate: '', endDate: '', regions: '' });
        } catch (e) {
            console.error(e);
        }
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            await api.updateElectionStatus(id, status);
            loadElections();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Election Events</h3>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="bg-neon-blue text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm hover:bg-white transition-colors"
                >
                    <Plus size={16} /> New Election
                </button>
            </div>

            {showCreate && (
                <div className="bg-surface-200 p-6 rounded-xl border border-surface-300 space-y-4 animate-in slide-in-from-top-4">
                    <input
                        type="text"
                        placeholder="Election Title (e.g. Global Council 2025)"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-surface-50 p-3 rounded-lg text-white border border-surface-300"
                    />
                    <textarea
                        placeholder="Description"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-surface-50 p-3 rounded-lg text-white border border-surface-300 h-24"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Start Date</label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full bg-surface-50 p-3 rounded-lg text-white border border-surface-300"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">End Date</label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                className="w-full bg-surface-50 p-3 rounded-lg text-white border border-surface-300"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Regions (Comma separated)</label>
                        <input
                            type="text"
                            placeholder="North, South, East, West"
                            value={formData.regions}
                            onChange={e => setFormData({ ...formData, regions: e.target.value })}
                            className="w-full bg-surface-50 p-3 rounded-lg text-white border border-surface-300"
                        />
                    </div>
                    <button
                        onClick={handleCreate}
                        className="w-full bg-neon-green text-black font-bold py-3 rounded-lg hover:bg-green-400"
                    >
                        Create Event
                    </button>
                </div>
            )}

            <div className="space-y-4">
                {elections.map(election => (
                    <div key={election.id} className="bg-surface-100 p-4 rounded-xl border border-surface-300 flex justify-between items-center">
                        <div>
                            <h4 className="font-bold text-white">{election.title}</h4>
                            <p className="text-xs text-gray-400">{new Date(election.startDate).toLocaleDateString()} - {new Date(election.endDate).toLocaleDateString()}</p>
                            <div className="flex gap-2 mt-2">
                                {election.regions.map(r => (
                                    <span key={r} className="text-[10px] bg-surface-200 px-2 py-1 rounded text-gray-300">{r}</span>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${election.status === 'active' ? 'bg-neon-green/10 text-neon-green' :
                                    election.status === 'upcoming' ? 'bg-yellow-500/10 text-yellow-500' :
                                        'bg-gray-500/10 text-gray-500'
                                }`}>
                                {election.status}
                            </span>

                            {election.status === 'upcoming' && (
                                <button onClick={() => handleStatusUpdate(election.id, 'active')} className="p-2 hover:bg-surface-200 rounded-full text-neon-green" title="Start">
                                    <Play size={16} />
                                </button>
                            )}
                            {election.status === 'active' && (
                                <button onClick={() => handleStatusUpdate(election.id, 'paused')} className="p-2 hover:bg-surface-200 rounded-full text-yellow-500" title="Pause">
                                    <Pause size={16} />
                                </button>
                            )}
                            {(election.status === 'active' || election.status === 'paused') && (
                                <button onClick={() => handleStatusUpdate(election.id, 'ended')} className="p-2 hover:bg-surface-200 rounded-full text-red-500" title="End">
                                    <Square size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminElectionManager;
