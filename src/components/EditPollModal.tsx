import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Poll } from '../../types';

interface EditPollModalProps {
    poll: Poll;
    isOpen: boolean;
    onClose: () => void;
    onSave: (pollId: string, updates: { question: string, options: string[] }) => Promise<void>;
}

const EditPollModal: React.FC<EditPollModalProps> = ({ poll, isOpen, onClose, onSave }) => {
    const [question, setQuestion] = useState(poll.question);
    const [options, setOptions] = useState<string[]>(poll.options?.map(o => o.text) || []);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setQuestion(poll.question);
            setOptions(poll.options?.map(o => o.text) || []);
        }
    }, [isOpen, poll]);

    if (!isOpen) return null;

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(poll.id, { question, options });
            onClose();
        } catch (error) {
            console.error(error);
            alert('Failed to update poll');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface-100 w-full max-w-lg rounded-2xl border border-surface-300 shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-surface-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Edit Signal</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Question
                        </label>
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className="w-full bg-surface-50 border border-surface-300 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-blue transition-colors"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Options
                        </label>
                        <div className="space-y-3">
                            {options.map((opt, idx) => (
                                <input
                                    key={idx}
                                    type="text"
                                    value={opt}
                                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                                    className="w-full bg-surface-50 border border-surface-300 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-blue transition-colors"
                                    required
                                />
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Note: Changing options may affect existing votes.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-400 hover:text-white font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 bg-neon-blue text-black font-bold rounded-xl hover:bg-neon-blue/90 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPollModal;
