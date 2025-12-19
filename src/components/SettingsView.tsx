
import React, { useState } from 'react';
import { UserProfile, UserSettings } from '../../types';
import {
  Shield, Eye, EyeOff, Zap, Bell, Monitor,
  Save, RefreshCw, Trash2, Smartphone, CheckCircle, LogOut
} from 'lucide-react';

interface SettingsViewProps {
  user: UserProfile;
  onUpdateUser: (updates: Partial<UserProfile>) => void;
  onLogout: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ user, onUpdateUser, onLogout }) => {
  const [username, setUsername] = useState(user.username);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [settings, setSettings] = useState<UserSettings>(user.settings);
  const [isSaved, setIsSaved] = useState(false);

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setIsSaved(false);
  };

  const handleSave = () => {
    onUpdateUser({
      username,
      avatarUrl,
      settings
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-display font-bold text-white mb-2 flex items-center gap-3">
            <RefreshCw className={`text-neon-blue ${isSaved ? 'animate-spin' : ''}`} />
            Settings
          </h2>
          <p className="text-gray-400">Manage your account and preferences.</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all text-sm font-bold uppercase tracking-wider"
        >
          <LogOut size={16} /> Log Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* IDENTITY PROTOCOL */}
        <div className="bg-surface-100 border border-surface-300 rounded-2xl p-6 relative overflow-hidden group hover:border-neon-blue/30 transition-colors">
          <div className="flex items-center gap-2 mb-6 text-neon-blue">
            <Monitor size={20} />
            <h3 className="font-bold uppercase tracking-widest text-sm">Profile</h3>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-mono text-gray-500 mb-2 uppercase">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-surface-50 border border-surface-300 rounded-lg p-3 text-white focus:outline-none focus:border-neon-blue transition-colors font-display tracking-wide"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-500 mb-2 uppercase">Profile Picture URL</label>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-200 border-2 border-surface-300 overflow-hidden shrink-0">
                  <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="flex-1 bg-surface-50 border border-surface-300 rounded-lg p-3 text-white text-xs focus:outline-none focus:border-neon-blue transition-colors font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* PRIVACY SHIELD */}
        <div className="bg-surface-100 border border-surface-300 rounded-2xl p-6 relative overflow-hidden group hover:border-neon-purple/30 transition-colors">
          <div className="flex items-center gap-2 mb-6 text-neon-purple">
            <Shield size={20} />
            <h3 className="font-bold uppercase tracking-widest text-sm">Privacy</h3>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium flex items-center gap-2">
                  Incognito Mode <span className="text-[10px] bg-surface-200 text-gray-400 px-1.5 py-0.5 rounded border border-surface-400">BETA</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">Hide active status and voting timestamps.</p>
              </div>
              <button
                onClick={() => handleSettingChange('ghostMode', !settings.ghostMode)}
                className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${settings.ghostMode ? 'bg-neon-purple' : 'bg-surface-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${settings.ghostMode ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Default to Anonymous</p>
                <p className="text-xs text-gray-500 mt-1">Always mask identity on new polls.</p>
              </div>
              <button
                onClick={() => handleSettingChange('anonymousDefault', !settings.anonymousDefault)}
                className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${settings.anonymousDefault ? 'bg-neon-purple' : 'bg-surface-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${settings.anonymousDefault ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Save Action */}
      <div className="mt-8 flex justify-end pb-20 md:pb-0">
        <button
          onClick={handleSave}
          className={`
            fixed bottom-6 right-6 z-50 shadow-2xl
            md:static md:shadow-none md:transform-none
            flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all
            ${isSaved
              ? 'bg-neon-green text-black scale-105'
              : 'bg-white text-black hover:bg-neon-blue hover:scale-105'
            }
          `}
        >
          {isSaved ? <CheckCircle size={20} /> : <Save size={20} />}
          {isSaved ? 'SAVED' : 'SAVE CHANGES'}
        </button>
      </div>
    </div>
  );
};

export default SettingsView;
