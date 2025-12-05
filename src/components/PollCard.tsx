
import React, { useState, useMemo, useEffect } from 'react';
import { Poll, PollOption, PollComment, ConsciousnessLayer, FuturePrediction } from '../types';
import { Share2, MessageCircle, AlertTriangle, Send, ThumbsUp, ThumbsDown, CornerDownRight, MessageSquare, Bookmark, Wand2, Activity, Check, X } from 'lucide-react';
import FluxVisualizer from './FluxVisualizer';
import ConsciousnessVisualizer from './ConsciousnessVisualizer';
import { api } from '../services/api';

// Consistent Palette for Options (Matches FluxVisualizer)
const THEME_COLORS = ['#00f3ff', '#bc13fe', '#0aff00', '#ff00ff'];

interface PollCardProps {
  poll: Poll;
  onVote: (pollId: string, optionId: string) => void;
  onAddComment?: (pollId: string, text: string) => void;
  onVoteComment?: (pollId: string, commentId: string, type: 'up' | 'down') => void;
  onReplyComment?: (pollId: string, parentCommentId: string, text: string) => void;
  isSaved?: boolean;
  onToggleSave?: (pollId: string) => void;
  onPredict?: (pollId: string) => Promise<FuturePrediction>;
  onAddConsciousnessEntry?: (pollId: string, text: string, intensity: number, layer: ConsciousnessLayer, emoji: string) => void;
  
  // Admin props
  isAdminView?: boolean;
  onApprove?: (pollId: string) => void;
  onReject?: (pollId: string) => void;
}

// Internal Hook for Mention Logic
const useMentionLogic = (
    text: string, 
    setText: (t: string) => void
) => {
    const [suggestions, setSuggestions] = useState<{id: string, username: string, avatarUrl: string}[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [cursorPosition, setCursorPosition] = useState(0);

    // Basic regex to find if last word is starting with @
    useEffect(() => {
        const lastWordMatch = text.slice(0, cursorPosition).match(/@(\w*)$/);
        
        if (lastWordMatch) {
            const query = lastWordMatch[1];
            api.searchUsers(query).then(users => {
                setSuggestions(users);
                setShowSuggestions(users.length > 0);
            });
        } else {
            setShowSuggestions(false);
        }
    }, [text, cursorPosition]);

    const selectUser = (username: string) => {
        const beforeMention = text.slice(0, cursorPosition).replace(/@(\w*)$/, '');
        const afterMention = text.slice(cursorPosition);
        const newText = `${beforeMention}@${username} ${afterMention}`;
        setText(newText);
        setShowSuggestions(false);
    };

    return { suggestions, showSuggestions, selectUser, setCursorPosition };
};

// Recursive Comment Item Component
const CommentItem: React.FC<{
  comment: PollComment;
  pollId: string;
  onVote?: (pollId: string, commentId: string, type: 'up' | 'down') => void;
  onReply?: (pollId: string, parentCommentId: string, text: string) => void;
  depth?: number;
}> = ({ comment, pollId, onVote, onReply, depth = 0 }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  
  // Mention Logic
  const { suggestions, showSuggestions, selectUser, setCursorPosition } = useMentionLogic(replyText, setReplyText);

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !onReply) return;
    onReply(pollId, comment.id, replyText);
    setReplyText('');
    setIsReplying(false);
  };

  return (
    <div className={`flex flex-col ${depth > 0 ? 'mt-3 animate-slide-up' : 'mt-4'}`}>
      <div className={`bg-surface-50 p-3 rounded-lg border border-surface-200 relative ${depth > 0 ? 'border-l-2 border-l-neon-blue/30' : ''}`}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold ${comment.authorId === 'anon' ? 'text-gray-500' : 'text-neon-purple'}`}>
              {comment.authorName}
            </span>
            <span className="text-[10px] text-gray-600">
              {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-300 mb-3 leading-relaxed">
            {/* Simple parsing for mentions in display */}
            {comment.text.split(/(@\w+)/).map((part, i) => 
                part.startsWith('@') 
                ? <span key={i} className="text-neon-blue font-bold">{part}</span> 
                : <span key={i}>{part}</span>
            )}
        </p>
        
        {/* Actions */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onVote && onVote(pollId, comment.id, 'up')}
            className={`flex items-center gap-1 text-xs transition-colors ${comment.userVote === 'up' ? 'text-neon-blue' : 'text-gray-500 hover:text-white'}`}
          >
            <ThumbsUp size={14} />
          </button>
          <span className={`text-xs font-mono font-bold ${comment.likes > 0 ? 'text-neon-blue' : comment.likes < 0 ? 'text-red-500' : 'text-gray-500'}`}>
            {comment.likes}
          </span>
          <button 
            onClick={() => onVote && onVote(pollId, comment.id, 'down')}
            className={`flex items-center gap-1 text-xs transition-colors ${comment.userVote === 'down' ? 'text-red-500' : 'text-gray-500 hover:text-white'}`}
          >
            <ThumbsDown size={14} />
          </button>
          
          <button 
            onClick={() => setIsReplying(!isReplying)}
            className={`ml-auto text-xs flex items-center gap-1 transition-colors ${isReplying ? 'text-neon-blue' : 'text-gray-600 hover:text-white'}`}
          >
            <CornerDownRight size={12} /> {isReplying ? 'Cancel' : 'Reply'}
          </button>
        </div>

        {/* Reply Input */}
        {isReplying && (
           <form onSubmit={handleReplySubmit} className="mt-3 flex gap-2 animate-slide-up relative">
              {showSuggestions && (
                  <div className="absolute bottom-full left-0 mb-2 w-full bg-surface-200 border border-surface-300 rounded-lg shadow-xl overflow-hidden z-50">
                      {suggestions.map(u => (
                          <div 
                            key={u.id} 
                            onClick={() => selectUser(u.username)}
                            className="p-2 flex items-center gap-2 hover:bg-neon-blue/20 cursor-pointer"
                          >
                              <img src={u.avatarUrl} alt="" className="w-6 h-6 rounded-full bg-black" />
                              <span className="text-xs text-white">{u.username}</span>
                          </div>
                      ))}
                  </div>
              )}
              <input
                  type="text"
                  value={replyText}
                  onChange={(e) => {
                      setReplyText(e.target.value);
                      setCursorPosition(e.target.selectionStart || 0);
                  }}
                  onKeyUp={(e) => setCursorPosition(e.currentTarget.selectionStart || 0)}
                  onClick={(e) => setCursorPosition(e.currentTarget.selectionStart || 0)}
                  placeholder={`Reply to ${comment.authorName}...`}
                  autoFocus
                  className="flex-1 bg-surface-100 border border-surface-300 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-neon-blue transition-colors"
              />
              <button 
                  type="submit" 
                  disabled={!replyText.trim()}
                  className="bg-surface-200 hover:bg-neon-blue hover:text-black disabled:opacity-50 text-white p-1.5 rounded transition-all"
              >
                  <Send size={14} />
              </button>
           </form>
        )}
      </div>

      {/* Recursive Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="pl-4 border-l border-surface-200/20 ml-2 space-y-3">
          {comment.replies.map(reply => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              pollId={pollId} 
              onVote={onVote} 
              onReply={onReply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const PollCard: React.FC<PollCardProps> = ({ 
  poll, 
  onVote, 
  onAddComment, 
  onVoteComment, 
  onReplyComment,
  isSaved,
  onToggleSave,
  onPredict,
  onAddConsciousnessEntry,
  isAdminView,
  onApprove,
  onReject
}) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [viewMode, setViewMode] = useState<'standard' | 'flux'>('standard');
  const [isPredicting, setIsPredicting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Mention Logic for Main Comment Input
  const { suggestions, showSuggestions, selectUser, setCursorPosition } = useMentionLogic(newComment, setNewComment);

  // Determine dominant color based on winner
  const { dominantColor, totalVotes } = useMemo(() => {
    const total = poll.options?.reduce((acc, curr) => acc + curr.votes, 0) || 0;
    
    let winnerIdx = 0;
    let maxVotes = -1;
    
    poll.options?.forEach((opt, idx) => {
        if (opt.votes > maxVotes) {
            maxVotes = opt.votes;
            winnerIdx = idx;
        }
    });

    // If no votes, default to a neutral gray/blue, else use the winner's theme color
    const color = total > 0 ? THEME_COLORS[winnerIdx % THEME_COLORS.length] : '#333333';
    return { dominantColor: color, totalVotes: total };
  }, [poll]);

  const handleVote = (optionId: string) => {
    if (poll.userVoteId) return;
    onVote(poll.id, optionId);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !onAddComment) return;
    onAddComment(poll.id, newComment);
    setNewComment('');
  };

  const handlePredict = async () => {
    if (!onPredict || poll.prediction) return;
    setIsPredicting(true);
    await onPredict(poll.id);
    setIsPredicting(false);
  }
  
  const countComments = (comments: PollComment[]): number => {
    return comments?.reduce((acc, comment) => acc + 1 + countComments(comment.replies || []), 0) || 0;
  };
  
  const totalComments = countComments(poll.comments);

  // --- ADMIN OVERLAY ---
  const AdminControls = () => {
    if (!isAdminView) return null;
    return (
      <div className="absolute top-0 right-0 z-50 p-4 flex gap-2">
         <button 
           onClick={() => onApprove && onApprove(poll.id)}
           className="bg-neon-green text-black px-3 py-1 rounded font-bold text-xs flex items-center gap-1 hover:scale-105 transition-transform"
         >
            <Check size={14} /> Approve
         </button>
         <button 
           onClick={() => onReject && onReject(poll.id)}
           className="bg-red-500 text-white px-3 py-1 rounded font-bold text-xs flex items-center gap-1 hover:scale-105 transition-transform"
         >
            <X size={14} /> Reject
         </button>
      </div>
    );
  };

 // --- RENDER FOR CONSCIOUSNESS MODE ---
if (poll.mode === 'consciousness') {
  return (
      <div className={`bg-black border ${isAdminView ? 'border-yellow-500' : 'border-neon-purple/50'} rounded-xl p-4 sm:p-6 mb-6 relative overflow-hidden group shadow-[0_0_30px_rgba(188,19,254,0.1)] hover:scale-[1.02] transition-all duration-500`}>
          {isAdminView && <div className="absolute inset-0 border-2 border-yellow-500 pointer-events-none rounded-xl z-40"></div>}
          <AdminControls />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4 relative z-10">
              <span className="px-2 py-1 bg-neon-purple/20 text-xs font-mono tracking-widest uppercase text-neon-purple rounded border border-neon-purple/30">
              Collective Consciousness
              </span>
              <span className="flex items-center text-neon-blue text-xs font-bold animate-pulse">
                  <Activity size={12} className="mr-1" />
                  LIVE SIGNAL
              </span>
          </div>

          <h3 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-white mb-2 leading-tight relative z-10 text-center px-2">
              {poll.question}
          </h3>
          {poll.description && (
              <p className="text-gray-400 text-sm mb-6 text-center relative z-10 px-2">{poll.description}</p>
          )}

          <div className="mb-6 relative z-10">
              <ConsciousnessVisualizer 
                  entries={poll.consciousnessEntries || []}
                  onAddEntry={(text, intensity, layer, emoji) => onAddConsciousnessEntry && onAddConsciousnessEntry(poll.id, text, intensity, layer, emoji)}
                  userHasContributed={!!poll.userVoteId}
              />
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 text-gray-500 text-sm border-t border-surface-800 pt-4 relative z-10">
              <span className="font-mono text-xs">{(poll.consciousnessEntries?.length || 0)} minds connected</span>
              <div className="flex space-x-4">
                   <button 
                      onClick={() => setShowComments(!showComments)}
                      className={`flex items-center gap-1 transition-colors ${showComments ? 'text-neon-purple' : 'hover:text-white'}`}
                  >
                      <MessageCircle size={18} />
                  </button>
                  <button className="hover:text-white transition-colors"><Share2 size={18} /></button>
              </div>
          </div>

           {/* Comments Section (Duplicate logic from standard poll) */}
           {showComments && (
              <div className="mt-6 border-t border-surface-800 pt-4 animate-slide-up relative z-10">
                   <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {poll.comments.length === 0 ? (
                          <p className="text-center text-gray-600 text-xs italic">The collective is silent.</p>
                      ) : (
                          <div className="space-y-1">
                              {poll.comments.map(comment => (
                                  <CommentItem 
                                      key={comment.id} 
                                      comment={comment} 
                                      pollId={poll.id} 
                                      onVote={onVoteComment} 
                                      onReply={onReplyComment}
                                  />
                              ))}
                          </div>
                      )}
                  </div>
              </div>
           )}
      </div>
  );
}

  // --- RENDER FOR STANDARD MODE ---
  return (
    <div 
        className={`bg-surface-100 border rounded-xl p-6 mb-6 relative overflow-hidden group transition-all duration-500 hover:scale-[1.02]`}
        style={{
            borderColor: isHovered && totalVotes > 0 ? dominantColor : '#333',
            boxShadow: isHovered && totalVotes > 0 ? `0 0 25px ${dominantColor}30` : 'none'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
    >
      {/* "Poison" Spread Background Effect */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-700 ease-in-out"
        style={{
            opacity: totalVotes > 0 ? 0.15 : 0,
            background: `radial-gradient(circle at 50% 120%, ${dominantColor}, transparent 70%)`
        }}
      />

      {isAdminView && <div className="absolute inset-0 border-2 border-yellow-500 pointer-events-none rounded-xl z-40"></div>}
      <AdminControls />
      
      {/* Category Tag */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <span className="px-2 py-1 bg-surface-200/80 backdrop-blur text-xs font-mono tracking-widest uppercase text-white rounded border border-surface-300">
          {poll.category}
        </span>
        {poll.isHot && (
            <span className="flex items-center text-neon-pink text-xs font-bold animate-pulse">
                <span className="w-2 h-2 bg-neon-pink rounded-full mr-2"></span>
                LIVE
            </span>
        )}
      </div>

      {/* Question */}
      <h3 className="text-xl md:text-2xl font-display font-bold text-white mb-2 leading-tight relative z-10 text-shadow-sm">
        {poll.question}
      </h3>
      {poll.description && (
        <p className="text-gray-400 text-sm mb-6 relative z-10">{poll.description}</p>
      )}

      {/* Visualization or Voting Buttons */}
      <div className="mb-6 relative z-10">
        {viewMode === 'flux' && poll.userVoteId ? (
             <div className="h-64 w-full bg-black rounded-lg border border-surface-300 relative overflow-hidden mb-4">
                 <button 
                    onClick={() => setViewMode('standard')}
                    className="absolute top-2 right-2 z-20 text-xs bg-surface-900/80 px-2 py-1 rounded text-white hover:text-neon-blue border border-surface-700"
                 >
                    Close Flux
                 </button>
                 <FluxVisualizer poll={poll} />
             </div>
        ) : !poll.userVoteId ? (
          <div className="grid grid-cols-1 gap-3">
            {poll.options?.map((option, idx) => (
              <button
                key={option.id}
                onClick={() => handleVote(option.id)}
                className="w-full text-left p-4 rounded-lg border border-surface-300 hover:bg-surface-200 transition-all duration-300 group/btn relative overflow-hidden"
                style={{
                    // Use a subtle hint of the color on hover for voting buttons
                    borderColor: 'rgba(51, 51, 51, 1)',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = THEME_COLORS[idx % THEME_COLORS.length];
                    e.currentTarget.style.boxShadow = `0 0 10px ${THEME_COLORS[idx % THEME_COLORS.length]}20`;
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(51, 51, 51, 1)';
                    e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="relative z-10 flex justify-between items-center">
                    <span className="font-medium text-gray-200 group-hover/btn:text-white">{option.text}</span>
                    <span className="text-xs text-gray-500 opacity-0 group-hover/btn:opacity-100 transition-opacity">VOTE</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="animate-slide-up relative space-y-4">
            {/* Future Prediction Overlay */}
            {poll.prediction && (
                 <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center p-6 text-center animate-in fade-in h-full">
                      <h4 className="text-neon-purple font-bold uppercase tracking-widest text-sm mb-2">Future Echo (2029)</h4>
                      <p className="text-white text-lg font-display mb-4 leading-relaxed">"{poll.prediction.predictionText}"</p>
                      <div className="w-full space-y-2">
                          {poll.prediction.predictedOptions?.map(opt => (
                              <div key={opt.text} className="flex justify-between text-xs text-gray-400">
                                  <span>{opt.text}</span>
                                  <span>{opt.percentage}%</span>
                              </div>
                          ))}
                      </div>
                 </div>
            )}

            {/* CSS Progress Bars */}
            {poll.options?.map((opt, idx) => {
                const percent = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                const isSelected = poll.userVoteId === opt.id;
                const barColor = THEME_COLORS[idx % THEME_COLORS.length];
                
                return (
                    <div key={opt.id} className="w-full">
                        <div className="flex justify-between items-end mb-1">
                            <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                                {opt.text} {isSelected && <span className="text-xs text-gray-500 ml-1">(You)</span>}
                            </span>
                            <span className="text-sm font-bold font-mono text-white">{percent}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-surface-300 rounded-full overflow-hidden relative">
                            <div 
                                className="h-full rounded-full transition-all duration-700 ease-out"
                                style={{ 
                                    width: `${percent}%`,
                                    backgroundColor: barColor,
                                    border: isSelected ? '2px solid white' : 'none'
                                }}
                            ></div>
                        </div>
                    </div>
                )
            })}
          </div>
        )}
      </div>

      {/* Footer / Meta */}
      <div className="flex justify-between items-center text-gray-500 text-sm border-t border-surface-200/50 pt-4 relative z-10">
        <div className="flex items-center space-x-1">
            <span className="font-mono text-xs">{totalVotes.toLocaleString()} votes</span>
            {poll.userVoteId && <span className="text-neon-green ml-2">• Voted</span>}
        </div>
        
        <div className="flex space-x-4 items-center">
            {poll.userVoteId && (
                <>
                    <button 
                        onClick={() => setViewMode('flux')}
                        className="text-xs font-mono uppercase hover:text-neon-purple transition-colors flex items-center gap-1"
                        title="View Soul Particles"
                    >
                        <Activity size={14} /> Flux
                    </button>
                    <button 
                        onClick={handlePredict}
                        disabled={isPredicting || !!poll.prediction}
                        className={`text-xs font-mono uppercase transition-colors flex items-center gap-1 ${poll.prediction ? 'text-neon-purple' : 'hover:text-neon-blue'}`}
                        title="Predict Future"
                    >
                        <Wand2 size={14} className={isPredicting ? 'animate-spin' : ''} /> {poll.prediction ? 'Predicted' : 'Echo'}
                    </button>
                </>
            )}

            <div className="h-4 w-[1px] bg-surface-300 mx-2"></div>

            <button 
                onClick={() => setShowComments(!showComments)}
                className={`flex items-center gap-1 transition-colors ${showComments ? 'text-neon-blue' : 'hover:text-white'}`}
            >
                <MessageCircle size={18} />
                <span className="text-xs font-mono">{totalComments}</span>
            </button>
            
            <button 
                onClick={() => onToggleSave && onToggleSave(poll.id)}
                className={`transition-colors ${isSaved ? 'text-neon-green' : 'hover:text-white'}`}
                title={isSaved ? "Unsave" : "Save"}
            >
                <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
            </button>

            <button className="hover:text-white transition-colors"><Share2 size={18} /></button>
            <button className="hover:text-red-500 transition-colors"><AlertTriangle size={18} /></button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-6 border-t border-surface-200/50 pt-4 animate-slide-up relative z-10">
            <h4 className="text-sm font-bold text-gray-300 mb-4 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare size={14}/> Discussion
            </h4>
            
            {/* Add Comment with Mention Support */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2 mb-6 relative">
                {showSuggestions && (
                    <div className="absolute bottom-full left-0 mb-2 w-full max-w-[200px] bg-surface-200 border border-surface-300 rounded-lg shadow-xl overflow-hidden z-50">
                        {suggestions.map(u => (
                            <div 
                                key={u.id} 
                                onClick={() => selectUser(u.username)}
                                className="p-2 flex items-center gap-2 hover:bg-neon-blue/20 cursor-pointer"
                            >
                                <img src={u.avatarUrl} alt="" className="w-6 h-6 rounded-full bg-black" />
                                <span className="text-xs text-white">{u.username}</span>
                            </div>
                        ))}
                    </div>
                )}
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => {
                        setNewComment(e.target.value);
                        setCursorPosition(e.target.selectionStart || 0);
                    }}
                    onKeyUp={(e) => setCursorPosition(e.currentTarget.selectionStart || 0)}
                    onClick={(e) => setCursorPosition(e.currentTarget.selectionStart || 0)}
                    placeholder="Add to the noise..."
                    className="flex-1 bg-surface-50 border border-surface-300 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-neon-blue transition-colors"
                />
                <button 
                    type="submit" 
                    disabled={!newComment.trim()}
                    className="bg-surface-200 hover:bg-neon-blue hover:text-black disabled:opacity-50 disabled:hover:bg-surface-200 disabled:hover:text-white text-white p-2 rounded-lg transition-all"
                >
                    <Send size={18} />
                </button>
            </form>

            {/* Comment List */}
            <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {poll.comments.length === 0 ? (
                    <p className="text-center text-gray-600 text-xs italic">Be the first to break the silence.</p>
                ) : (
                    <div className="space-y-1">
                        {poll.comments?.map(comment => (
                            <CommentItem 
                                key={comment.id} 
                                comment={comment} 
                                pollId={poll.id} 
                                onVote={onVoteComment} 
                                onReply={onReplyComment}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default PollCard;
