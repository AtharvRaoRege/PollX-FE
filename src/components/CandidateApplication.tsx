
import React, { useState } from 'react';
import { UserProfile, Candidate, LeadershipProfile } from '../../types';
import { evaluateCandidate } from '../../geminiService';
import { api } from '../services/api';
import { Brain, ChevronRight, CheckCircle, AlertTriangle, FileText, User } from 'lucide-react';

interface CandidateApplicationProps {
  user: UserProfile;
  onSuccess: () => void;
  onCancel: () => void;
}

const CandidateApplication: React.FC<CandidateApplicationProps> = ({ user, onSuccess, onCancel }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    partyAffiliation: '',
    manifesto: '',
    background: ''
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<LeadershipProfile | null>(null);

  const handleAnalyze = async () => {
    if (!formData.manifesto || !formData.background) return;
    setIsAnalyzing(true);
    setStep(2); // Move to Analysis UI

    // Simulate "Reading History" delay
    await new Promise(r => setTimeout(r, 2000));

    // Call AI Service
    const profile = await evaluateCandidate(
        user.username,
        formData.manifesto,
        formData.background,
        `Level ${user.level} Contributor. Known for ${user.tags?.join(', ')}`
    );

    setAiResult(profile);
    setIsAnalyzing(false);
    setStep(3); // Move to Review UI
  };

  const handleSubmit = async () => {
    if (!aiResult) return;
    try {
        await api.applyForCandidacy({
            ...formData,
            aiProfile: aiResult
        });
        onSuccess();
    } catch (e) {
        console.error("Submission failed", e);
    }
  };

  return (
    <div className="bg-surface-100 border border-surface-300 rounded-2xl overflow-hidden max-w-2xl mx-auto shadow-2xl animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-surface-200 to-surface-100 p-6 border-b border-surface-300 flex justify-between items-center">
        <div>
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                <User className="text-neon-blue" /> Candidate Registration
            </h2>
            <p className="text-xs text-gray-400 mt-1">MODULE 1: Profile Intelligence</p>
        </div>
        <div className="text-xs font-mono text-gray-500">
            Step {step} of 3
        </div>
      </div>

      <div className="p-6">
        
        {/* STEP 1: FORM */}
        {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
                <div>
                    <label className="block text-xs font-mono text-gray-500 uppercase mb-2">Party Affiliation</label>
                    <input 
                        type="text" 
                        placeholder="e.g. The Technocrats, Independent, Future Forward"
                        value={formData.partyAffiliation}
                        onChange={e => setFormData({...formData, partyAffiliation: e.target.value})}
                        className="w-full bg-surface-50 border border-surface-300 rounded-lg p-3 text-white focus:border-neon-blue outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-mono text-gray-500 uppercase mb-2">Manifesto / Reason for Contesting</label>
                    <textarea 
                        placeholder="Why should the collective trust you? What is your vision?"
                        value={formData.manifesto}
                        onChange={e => setFormData({...formData, manifesto: e.target.value})}
                        className="w-full h-32 bg-surface-50 border border-surface-300 rounded-lg p-3 text-white focus:border-neon-blue outline-none resize-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-mono text-gray-500 uppercase mb-2">Relevant Background</label>
                    <textarea 
                        placeholder="Experience, qualifications, or platform contributions..."
                        value={formData.background}
                        onChange={e => setFormData({...formData, background: e.target.value})}
                        className="w-full h-24 bg-surface-50 border border-surface-300 rounded-lg p-3 text-white focus:border-neon-blue outline-none resize-none"
                    />
                </div>

                <div className="pt-4 flex justify-between items-center">
                    <button onClick={onCancel} className="text-gray-500 hover:text-white text-sm">Cancel</button>
                    <button 
                        onClick={handleAnalyze}
                        disabled={!formData.manifesto || !formData.background}
                        className="bg-white text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-neon-blue transition-all disabled:opacity-50"
                    >
                        Analyze & Generate Profile <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        )}

        {/* STEP 2: AI PROCESSING */}
        {step === 2 && (
            <div className="py-12 text-center space-y-6">
                <div className="relative w-24 h-24 mx-auto">
                    <div className="absolute inset-0 border-4 border-surface-300 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-neon-purple rounded-full border-t-transparent animate-spin"></div>
                    <Brain className="absolute inset-0 m-auto text-white w-8 h-8 animate-pulse" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Analyzing Digital Footprint...</h3>
                    <p className="text-gray-400 text-sm mt-2 max-w-md mx-auto">
                        Evaluating consistency, engagement style, and leadership indicators based on your manifesto and activity history.
                    </p>
                </div>
                <div className="flex justify-center gap-2 text-xs font-mono text-neon-blue">
                    <span>[Sentiment Analysis]</span>
                    <span>[Agenda Check]</span>
                    <span>[Psych Profile]</span>
                </div>
            </div>
        )}

        {/* STEP 3: RESULT & CONFIRM */}
        {step === 3 && aiResult && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
                <div className="bg-black border border-neon-purple/50 rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-neon-purple text-white text-[10px] font-bold px-2 py-1 rounded-bl">AI GENERATED</div>
                    
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-2xl font-display font-bold text-white">{user.username}</h3>
                            <p className="text-sm text-neon-purple">{aiResult.leadershipStyle} Leader</p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-white">{aiResult.agendaScore}</div>
                            <div className="text-[10px] text-gray-500 uppercase">Agenda Score</div>
                        </div>
                    </div>

                    <p className="text-gray-300 text-sm italic mb-4">"{aiResult.personalitySummary}"</p>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-xs font-bold text-neon-green uppercase mb-2">Key Strengths</h4>
                            <ul className="space-y-1">
                                {aiResult.strengths.map(s => (
                                    <li key={s} className="text-xs text-gray-400 flex items-center gap-2">
                                        <CheckCircle size={10} className="text-neon-green" /> {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-red-500 uppercase mb-2">Weaknesses</h4>
                            <ul className="space-y-1">
                                {aiResult.weaknesses.map(w => (
                                    <li key={w} className="text-xs text-gray-400 flex items-center gap-2">
                                        <AlertTriangle size={10} className="text-red-500" /> {w}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button 
                        onClick={() => setStep(1)} 
                        className="flex-1 py-3 border border-surface-300 rounded-xl text-gray-400 hover:text-white transition-colors"
                    >
                        Edit Application
                    </button>
                    <button 
                        onClick={handleSubmit} 
                        className="flex-1 py-3 bg-neon-purple text-white font-bold rounded-xl hover:bg-purple-600 transition-colors shadow-[0_0_15px_rgba(188,19,254,0.4)]"
                    >
                        Submit Candidacy
                    </button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default CandidateApplication;
