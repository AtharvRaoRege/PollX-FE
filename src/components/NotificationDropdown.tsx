
import React from 'react';
import { AppNotification } from '../../types';
import { MessageCircle, CornerDownRight, Vote, BellRing, Check, AtSign } from 'lucide-react';

interface NotificationDropdownProps {
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ notifications, onMarkRead, onMarkAllRead, onClose }) => {
  return (
    <div className="absolute top-full right-0 mt-2 w-80 md:w-96 bg-surface-100/90 backdrop-blur-xl border border-surface-300 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-top-2 z-50 ring-1 ring-white/10">
       <div className="p-4 border-b border-surface-200/50 flex justify-between items-center bg-white/5">
           <span className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
               <BellRing size={14} className="text-neon-blue" />
               Signals
           </span>
           {notifications.some(n => !n.read) && (
               <button onClick={onMarkAllRead} className="px-2 py-1 rounded-md bg-neon-blue/10 border border-neon-blue/30 text-neon-blue text-[10px] uppercase font-bold hover:bg-neon-blue hover:text-black transition-all flex items-center gap-1">
                   <Check size={12} /> Mark read
               </button>
           )}
       </div>
       
       <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
           {notifications.length === 0 ? (
               <div className="p-12 text-center flex flex-col items-center justify-center text-gray-500">
                   <div className="w-12 h-12 rounded-full bg-surface-200/50 flex items-center justify-center mb-3">
                       <BellRing size={20} className="text-gray-600" />
                   </div>
                   <p className="text-xs font-mono uppercase tracking-widest">No new signals</p>
                   <p className="text-[10px] text-gray-600 mt-1">You are all caught up.</p>
               </div>
           ) : (
               notifications.map(notif => (
                   <div 
                        key={notif.id} 
                        onClick={() => onMarkRead(notif.id)}
                        className={`p-4 border-b border-surface-200/30 hover:bg-white/5 transition-all cursor-pointer flex gap-4 group relative overflow-hidden ${!notif.read ? 'bg-neon-blue/5' : ''}`}
                   >
                        {/* Unread Indicator Line */}
                        {!notif.read && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-neon-blue shadow-[0_0_10px_rgba(0,243,255,0.5)]"></div>
                        )}

                       <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${!notif.read ? 'bg-surface-200 border-neon-blue/30 text-neon-blue' : 'bg-surface-200/50 border-transparent text-gray-400 group-hover:border-surface-300 group-hover:text-gray-200'}`}>
                           {notif.type === 'comment' && <MessageCircle size={18} />}
                           {notif.type === 'reply' && <CornerDownRight size={18} />}
                           {notif.type === 'vote' && <Vote size={18} />}
                           {notif.type === 'system' && <BellRing size={18} />}
                           {notif.type === 'mention' && <AtSign size={18} />}
                       </div>
                       
                       <div className="flex-1 min-w-0 z-10">
                           <p className="text-sm text-gray-300 leading-snug group-hover:text-white transition-colors">
                               <span className="font-bold text-white">{notif.sender?.username || 'System'}</span> {notif.message}
                           </p>
                           <p className="text-[10px] text-gray-500 mt-1.5 font-mono">
                               {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </p>
                       </div>
                   </div>
               ))
           )}
       </div>
    </div>
  );
};

export default NotificationDropdown;
