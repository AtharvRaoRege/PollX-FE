
import React, { useState } from 'react';
import { Poll, PollMode } from '../../types';
import { Plus, X, Sparkles, TrendingUp, ArrowRight } from 'lucide-react';

interface CreatePollProps {
    onSubmit: (poll: Partial<Poll>) => void;
    onCancel: () => void;
}

const TRENDING_TOPICS = [
    { id: 'ai', label: 'Artificial Intelligence', category: 'Tech' },
    { id: 'remote', label: 'Remote Work', category: 'Social' },
    { id: 'climate', label: 'Climate Change', category: 'Moral' },
    { id: 'crypto', label: 'Crypto Future', category: 'Tech' },
    { id: 'dating', label: 'Modern Dating', category: 'Relationships' },
];

const CreatePoll: React.FC<CreatePollProps> = ({ onSubmit, onCancel }) => {
    // Simplified State
    const [question, setQuestion] = useState('');
    const [category, setCategory] = useState<Poll['category']>('Social');
    const [options, setOptions] = useState(['', '']);
    const [allowCustomAnswers, setAllowCustomAnswers] = useState(false); // Maps to 'consciousness' mode
    
    // Optional / Advanced
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');

    const handleAddOption = () => {
        if (options.length < 4) setOptions([...options, '']);
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleTrendClick = (topic: typeof TRENDING_TOPICS[0]) => {
        setQuestion(`What do you think about ${topic.label}?`);
        setCategory(topic.category as any);
        setTags(`#${topic.label.replace(' ', '')}`);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!question) return;
        
        // Validation for standard mode
        if (!allowCustomAnswers && options.some(o => !o.trim())) return;

        const mode: PollMode = allowCustomAnswers ? 'consciousness' : 'standard';

        onSubmit({
            question,
            description,
            category,
            mode,
            options: !allowCustomAnswers ? options.filter(o => o.trim()) : [],
            tags: tags.split(' ').filter(t => t.startsWith('#') && t.length > 1)
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-surface-100 border border-surface-300 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-6 border-b border-surface-200 flex justify-between items-center bg-surface-50/50">
                    <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                        <Sparkles size={18} className="text-neon-blue" />
                        Create Poll
                    </h2>
                    <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors bg-surface-200 rounded-full p-1">
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto custom-scrollbar flex-1">
                    {/* Trending Section */}
                    <div className="px-6 pt-6 pb-2">
                        <div className="flex items-center gap-2 mb-3">
                            <TrendingUp size={14} className="text-neon-pink" />
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Trending Now</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {TRENDING_TOPICS.map(topic => (
                                <button
                                    key={topic.id}
                                    onClick={() => handleTrendClick(topic)}
                                    type="button"
                                    className="px-3 py-1.5 bg-surface-200 hover:bg-surface-300 border border-surface-300 rounded-full text-xs text-gray-300 transition-colors"
                                >
                                    {topic.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        
                        {/* Main Input */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Question</label>
                            <input
                                type="text"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="Ask the community anything..."
                                className="w-full bg-transparent border-b-2 border-surface-300 py-2 text-xl md:text-2xl font-bold text-white placeholder-gray-600 focus:outline-none focus:border-neon-blue transition-colors"
                                maxLength={140}
                                autoFocus
                            />
                        </div>

                        {/* Toggle Mode */}
                        <div className="bg-surface-50 rounded-xl p-4 border border-surface-200 flex items-center justify-between">
                            <div>
                                <div className="text-sm font-bold text-gray-200">Open-Ended Responses</div>
                                <div className="text-xs text-gray-500">Allow users to type their own answers instead of voting.</div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setAllowCustomAnswers(!allowCustomAnswers)}
                                className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${allowCustomAnswers ? 'bg-neon-purple' : 'bg-surface-300'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${allowCustomAnswers ? 'left-7' : 'left-1'}`}></div>
                            </button>
                        </div>

                        {/* Options Input (Only visible if NOT custom answers) */}
                        {!allowCustomAnswers && (
                            <div className="space-y-3 animate-in slide-in-from-top-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Options</label>
                                {options.map((opt, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <div className="w-8 h-10 flex items-center justify-center text-gray-600 font-mono text-xs">{idx + 1}</div>
                                        <input
                                            type="text"
                                            value={opt}
                                            onChange={(e) => handleOptionChange(idx, e.target.value)}
                                            placeholder={`Option ${idx + 1}`}
                                            className="flex-1 bg-surface-50 border border-surface-300 rounded-lg px-4 text-sm text-white focus:outline-none focus:border-neon-blue transition-colors"
                                        />
                                    </div>
                                ))}
                                {options.length < 4 && (
                                    <button
                                        type="button"
                                        onClick={handleAddOption}
                                        className="ml-10 text-xs text-neon-blue font-bold hover:text-white flex items-center gap-1"
                                    >
                                        <Plus size={14} /> Add Option
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Category Pucks */}
                        <div>
                             <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Topic</label>
                             <div className="flex flex-wrap gap-2">
                                {['Social', 'Tech', 'Politics', 'Moral', 'Fun'].map((cat) => (
                                    <button
                                        type="button"
                                        key={cat}
                                        onClick={() => setCategory(cat as any)}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${category === cat
                                            ? 'bg-white text-black border-white'
                                            : 'bg-surface-50 text-gray-400 border-surface-300 hover:border-gray-400'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                             </div>
                        </div>

                        {/* Advanced Toggle */}
                        <div className="pt-2">
                            <button 
                                type="button"
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="text-xs text-gray-500 hover:text-white underline decoration-dashed underline-offset-4"
                            >
                                {showAdvanced ? 'Hide Options' : 'Add Context or Tags'}
                            </button>
                        </div>

                        {showAdvanced && (
                            <div className="space-y-4 animate-in fade-in bg-surface-50 p-4 rounded-xl border border-surface-200">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Context</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Add more details..."
                                        className="w-full bg-surface-100 border border-surface-300 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-neon-blue h-20 resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Tags</label>
                                    <input
                                        type="text"
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                        placeholder="#tag1 #tag2"
                                        className="w-full bg-surface-100 border border-surface-300 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-neon-blue"
                                    />
                                </div>
                            </div>
                        )}
                        
                    </form>
                </div>

                {/* Footer Action */}
                <div className="p-6 border-t border-surface-200 bg-surface-50/50">
                    <button
                        onClick={handleSubmit}
                        className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-neon-blue hover:scale-[1.02] transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                        Launch Poll <ArrowRight size={18} />
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CreatePoll;
