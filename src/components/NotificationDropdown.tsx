
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
    <div className="absolute top-full right-0 mt-2 w-80 bg-surface-100 border border-surface-300 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
       <div className="p-3 border-b border-surface-200 flex justify-between items-center bg-surface-200/50">
           <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Notifications</span>
           {notifications.some(n => !n.read) && (
               <button onClick={onMarkAllRead} className="text-[10px] text-neon-blue hover:text-white flex items-center gap-1 transition-colors">
                   <Check size={12} /> Mark all read
               </button>
           )}
       </div>
       
       <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
           {notifications.length === 0 ? (
               <div className="p-8 text-center text-gray-500 text-xs italic">
                   No new signals.
               </div>
           ) : (
               notifications.map(notif => (
                   <div 
                        key={notif.id} 
                        onClick={() => onMarkRead(notif.id)}
                        className={`p-3 border-b border-surface-200/50 hover:bg-surface-200 transition-colors cursor-pointer flex gap-3 ${!notif.read ? 'bg-surface-200/30' : ''}`}
                   >
                       <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${!notif.read ? 'bg-neon-blue/10 text-neon-blue' : 'bg-surface-300 text-gray-400'}`}>
                           {notif.type === 'comment' && <MessageCircle size={14} />}
                           {notif.type === 'reply' && <CornerDownRight size={14} />}
                           {notif.type === 'vote' && <Vote size={14} />}
                           {notif.type === 'system' && <BellRing size={14} />}
                           {notif.type === 'mention' && <AtSign size={14} />}
                       </div>
                       <div className="flex-1 min-w-0">
                           <p className="text-xs text-white leading-tight">
                               <span className="font-bold text-gray-300">{notif.sender?.username || 'System'}</span> {notif.message}
                           </p>
                           <p className="text-[10px] text-gray-500 mt-1">
                               {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </p>
                       </div>
                       {!notif.read && (
                           <div className="w-2 h-2 rounded-full bg-neon-blue mt-2 flex-shrink-0"></div>
                       )}
                   </div>
               ))
           )}
       </div>
    </div>
  );
};

export default NotificationDropdown;
