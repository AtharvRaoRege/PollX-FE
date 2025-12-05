
import React, { useState } from 'react';
import { Poll, PollMode } from '../../types';
import { Plus, X, Brain, List } from 'lucide-react';

interface CreatePollProps {
    onSubmit: (poll: Partial<Poll>) => void;
    onCancel: () => void;
}

const CreatePoll: React.FC<CreatePollProps> = ({ onSubmit, onCancel }) => {
    const [mode, setMode] = useState<PollMode>('standard');
    const [question, setQuestion] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<Poll['category']>('Social');
    const [options, setOptions] = useState(['', '']);
    const [tags, setTags] = useState('');

    const handleAddOption = () => {
        if (options.length < 4) setOptions([...options, '']);
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!question) return;
        if (mode === 'standard' && options.some(o => !o.trim())) return;

        onSubmit({
            question,
            description,
            category,
            mode,
            options: mode === 'standard' ? options.filter(o => o.trim()) : [], // Send raw strings
            tags: tags.split(' ').filter(t => t.startsWith('#') && t.length > 1)
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-surface-100 border border-surface-300 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-surface-200 flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-display font-bold text-white">Broadcast Thought</h2>
                    <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                    {/* Mode Selection */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setMode('standard')}
                            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${mode === 'standard'
                                ? 'bg-neon-blue/10 border-neon-blue text-white'
                                : 'bg-surface-50 border-surface-300 text-gray-500 hover:border-gray-400'
                                }`}
                        >
                            <List size={24} className={mode === 'standard' ? 'text-neon-blue' : ''} />
                            <span className="text-xs font-bold uppercase tracking-wider">Standard Poll</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setMode('consciousness');
                                setCategory('Consciousness');
                            }}
                            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${mode === 'consciousness'
                                ? 'bg-neon-purple/10 border-neon-purple text-white'
                                : 'bg-surface-50 border-surface-300 text-gray-500 hover:border-gray-400'
                                }`}
                        >
                            <Brain size={24} className={mode === 'consciousness' ? 'text-neon-purple' : ''} />
                            <span className="text-xs font-bold uppercase tracking-wider">Consciousness</span>
                        </button>
                    </div>

                    <div>
                        <label className="block text-xs font-mono text-gray-500 mb-1 uppercase">Query</label>
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder={mode === 'standard' ? "e.g., Is AI art real art?" : "e.g., How does the future feel?"}
                            className="w-full bg-surface-50 border border-surface-300 rounded-lg p-3 text-white focus:outline-none focus:border-neon-blue transition-colors"
                            maxLength={140}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-mono text-gray-500 mb-1 uppercase">Context (Optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add context or elaboration..."
                            className="w-full bg-surface-50 border border-surface-300 rounded-lg p-3 text-white focus:outline-none focus:border-neon-blue transition-colors h-20 resize-none text-sm"
                            maxLength={280}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-mono text-gray-500 mb-1 uppercase">Channel</label>
                        <div className="flex flex-wrap gap-2">
                            {['Moral', 'Social', 'Politics', 'Tech', 'Hypothetical', 'Relationships', 'Consciousness'].map((cat) => (
                                <button
                                    type="button"
                                    key={cat}
                                    onClick={() => setCategory(cat as any)}
                                    className={`px-3 py-1 rounded text-xs font-bold border transition-all ${category === cat
                                        ? 'bg-neon-blue text-black border-neon-blue'
                                        : 'bg-transparent text-gray-400 border-surface-300 hover:border-gray-400'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {mode === 'standard' && (
                        <div className="animate-slide-up">
                            <label className="block text-xs font-mono text-gray-500 mb-2 uppercase">Variables</label>
                            <div className="space-y-3">
                                {options.map((opt, idx) => (
                                    <input
                                        key={idx}
                                        type="text"
                                        value={opt}
                                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                                        placeholder={`Option ${idx + 1}`}
                                        className="w-full bg-surface-50 border border-surface-300 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-neon-purple transition-colors"
                                    />
                                ))}
                            </div>
                            {options.length < 4 && (
                                <button
                                    type="button"
                                    onClick={handleAddOption}
                                    className="mt-3 text-xs text-neon-blue hover:text-white flex items-center gap-1"
                                >
                                    <Plus size={14} /> Add Variable
                                </button>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-mono text-gray-500 mb-1 uppercase">Hashtags (Optional)</label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="#Future #AI #Ethics (space separated)"
                            className="w-full bg-surface-50 border border-surface-300 rounded-lg p-3 text-white focus:outline-none focus:border-neon-blue transition-colors text-sm"
                        />
                    </div>

                    <button
                        type="submit"
                        className={`w-full text-black font-bold py-4 rounded-xl transition-all shadow-lg ${mode === 'standard'
                            ? 'bg-white hover:bg-neon-green hover:shadow-[0_0_20px_rgba(10,255,0,0.4)]'
                            : 'bg-neon-purple text-white hover:bg-purple-600 hover:shadow-[0_0_20px_rgba(188,19,254,0.4)]'
                            }`}
                    >
                        {mode === 'standard' ? 'INITIATE POLL' : 'OPEN MIND CLOUD'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreatePoll;
