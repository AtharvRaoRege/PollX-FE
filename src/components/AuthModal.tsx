
import React, { useState, useEffect } from 'react';
import { X, Brain, Fingerprint, Lock, ArrowRight, Activity, Zap, Shield, AlertCircle } from 'lucide-react';
import { UserProfile } from '../../types';
import { api } from '../services/api';

interface AuthModalProps {
    onLogin: (user: UserProfile) => void;
    onSignup: (user: UserProfile) => void;
    onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onLogin, onSignup, onClose }) => {
    const [mode, setMode] = useState<'login' | 'signup'>('signup');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');

    // Animation States
    const [isAnimating, setIsAnimating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [loadingText, setLoadingText] = useState('Initializing...');

    useEffect(() => {
        if (isAnimating) {
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + (Math.random() * 5); // Random increments
                });
            }, 100);
            return () => clearInterval(interval);
        }
    }, [isAnimating]);

    useEffect(() => {
        if (progress < 30) setLoadingText('Establishing Neural Link...');
        else if (progress < 60) setLoadingText('Encrypting Identity Protocol...');
        else if (progress < 90) setLoadingText('Allocating Memory Blocks...');
        else setLoadingText('Sync Complete.');
    }, [progress]);

    useEffect(() => {
        if (progress === 100) {
            executeAuth();
        }
    }, [progress]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email || !password) return;
        if (mode === 'signup' && !username) return;

        setIsAnimating(true);
    };

    const executeAuth = async () => {
        try {
            if (mode === 'signup') {
                const user = await api.signup(username, email, password);
                onSignup(user);
            } else {
                const user = await api.login(email, password);
                onLogin(user);
            }
        } catch (err: any) {
            console.error("Auth failed", err);
            // Show the actual error message from the backend or network
            setError(err.message || "Connection failed. Credentials rejected.");
            setIsAnimating(false);
            setProgress(0);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-surface-100 border border-surface-300 w-full max-w-md rounded-2xl shadow-[0_0_50px_rgba(0,243,255,0.1)] overflow-hidden relative">

                {/* Decorative Grid */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink"></div>

                {/* Close Button */}
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-20">
                    <X size={24} />
                </button>

                <div className="p-8 relative z-10">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-surface-200 rounded-xl mb-4 border border-surface-300 shadow-inner group">
                            <Brain className={`w-6 h-6 text-neon-blue ${isAnimating ? 'animate-pulse' : ''}`} />
                        </div>
                        <h2 className="text-2xl font-display font-bold text-white tracking-tight">
                            {mode === 'login' ? 'Resume Session' : 'Initialize Identity'}
                        </h2>
                        <p className="text-xs text-gray-500 uppercase tracking-widest mt-2">
                            Connect to the Collective Consciousness
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-xs text-red-500">
                            <AlertCircle size={14} />
                            {error}
                        </div>
                    )}

                    {/* Animation Overlay */}
                    {isAnimating ? (
                        <div className="py-8 text-center space-y-6 animate-in fade-in zoom-in-95">
                            <div className="w-full bg-surface-300 h-1 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-neon-blue transition-all duration-100 ease-linear shadow-[0_0_10px_#00f3ff]"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <div>
                                <p className="text-neon-blue font-mono text-sm animate-pulse">{loadingText}</p>
                                <p className="text-gray-500 text-xs font-mono mt-1">{Math.floor(progress)}%</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {mode === 'signup' && (
                                <div className="group">
                                    <label className="block text-xs font-mono text-gray-500 mb-1.5 ml-1 uppercase">Archetype Alias</label>
                                    <div className="relative">
                                        <Fingerprint className="absolute left-3 top-3 text-gray-500 w-4 h-4 group-focus-within:text-neon-pink transition-colors" />
                                        <input
                                            type="text"
                                            required
                                            placeholder="Username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full bg-surface-50 border border-surface-300 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-neon-pink focus:ring-1 focus:ring-neon-pink transition-all"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="group">
                                <label className="block text-xs font-mono text-gray-500 mb-1.5 ml-1 uppercase">Neural ID (Email)</label>
                                <div className="relative">
                                    <Activity className="absolute left-3 top-3 text-gray-500 w-4 h-4 group-focus-within:text-neon-blue transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-surface-50 border border-surface-300 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all"
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-xs font-mono text-gray-500 mb-1.5 ml-1 uppercase">Passcode</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 text-gray-500 w-4 h-4 group-focus-within:text-neon-purple transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-surface-50 border border-surface-300 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-neon-purple focus:ring-1 focus:ring-neon-purple transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-neon-blue hover:scale-[1.02] active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 mt-4 group"
                            >
                                {mode === 'login' ? 'Access System' : 'Create Link'}
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>
                    )}

                    {/* Footer Toggle */}
                    {!isAnimating && (
                        <div className="mt-6 text-center pt-4 border-t border-surface-200">
                            <p className="text-sm text-gray-400">
                                {mode === 'login' ? "New to the collective?" : "Already linked?"}
                                <button
                                    onClick={() => {
                                        setMode(mode === 'login' ? 'signup' : 'login');
                                        setError('');
                                    }}
                                    className="ml-2 text-white font-bold hover:text-neon-blue transition-colors hover:underline"
                                >
                                    {mode === 'login' ? 'Initialize' : 'Resume'}
                                </button>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
