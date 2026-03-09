import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Heart } from "lucide-react";
import { Avatar } from "./Avatar";
import type { User, Letter } from "@shared/schema";
import { format } from "date-fns";

interface MailboxProps {
  currentUser: User;
  users: User[];
  letters: Letter[];
  onSend: (toUserId: number | null, body: string) => void;
  isSending: boolean;
}

function PixelMailbox({ hasUnread }: { hasUnread: boolean }) {
  return (
    <svg width="32" height="28" viewBox="0 0 32 28" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated' }}>
      {/* Box body */}
      <rect x="2" y="8" width="28" height="18" rx="2" fill="#f9d0d8" stroke="#e07a8f" strokeWidth="2" />
      {/* Envelope flap */}
      <polygon points="2,8 16,18 30,8" fill="#f5b0c0" />
      {/* Envelope lines */}
      <line x1="2" y1="26" x2="14" y2="16" stroke="#e07a8f" strokeWidth="1.5" />
      <line x1="30" y1="26" x2="18" y2="16" stroke="#e07a8f" strokeWidth="1.5" />
      {/* Dot indicator */}
      {hasUnread && <circle cx="26" cy="5" r="5" fill="#e07a8f" stroke="#fff" strokeWidth="1.5" />}
    </svg>
  );
}

const LETTER_EMOJIS = ['+', '*', '^', '>', '<', '~'];

export function Mailbox({ currentUser, users, letters, onSend, isSending }: MailboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [body, setBody] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState('+');
  const [selectedRecipient, setSelectedRecipient] = useState<number | null>(null);

  const myLetters = letters
    .filter(l => l.toUserId === currentUser.id || l.toUserId === null)
    .sort((a, b) => new Date(b.sentAt!).getTime() - new Date(a.sentAt!).getTime());
  const unreadCount = myLetters.filter(l => !l.readAt).length;
  const otherUsers = users.filter(u => u.id !== currentUser.id);

  const handleSend = () => {
    if (!body.trim()) return;
    onSend(selectedRecipient, body);
    setBody("");
    setIsWriting(false);
    setSelectedRecipient(null);
    setSelectedEmoji('+');
  };

  return (
    <>
      {/* Floating mailbox button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        data-testid="button-open-mailbox"
        whileHover={{ scale: 1.08, rotate: -5 }}
        whileTap={{ scale: 0.92 }}
        className="fixed bottom-5 right-5 z-40 flex items-center justify-center"
        style={{
          width: 58,
          height: 58,
          background: '#f9d0d8',
          border: '3px solid #e07a8f',
          boxShadow: '4px 4px 0 #e07a8f',
          borderRadius: '4px',
        }}
      >
        <PixelMailbox hasUnread={unreadCount > 0} />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#e07a8f] border-2 border-white font-pixel text-[10px] text-white flex items-center justify-center"
            style={{ borderRadius: '3px' }}>
            {unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-50"
              onClick={() => { setIsOpen(false); setIsWriting(false); }}
            />

            {/* Panel */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed bottom-0 right-0 left-0 md:left-auto md:right-5 md:bottom-20 w-full md:w-[380px] h-[78vh] md:h-[540px] z-50 flex flex-col overflow-hidden"
              style={{
                background: '#fdf8f4',
                border: '3px solid #e8d0d8',
                boxShadow: '5px 5px 0 #e8d0d8',
                borderRadius: '4px 4px 0 0',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 shrink-0"
                style={{ background: '#fde8ed', borderBottom: '3px solid #e8d0d8' }}>
                <div className="flex items-center gap-2">
                  <PixelMailbox hasUnread={false} />
                  <span className="font-display text-lg text-[#7a2e43]">
                    {isWriting ? "Write a Letter" : "Mailbox"}
                  </span>
                </div>
                <button
                  onClick={() => { setIsOpen(false); setIsWriting(false); setBody(""); }}
                  data-testid="button-close-mailbox"
                  className="p-1.5 text-[#c09aaa]"
                  style={{ border: '2px solid #e8d0d8', borderRadius: '4px', background: '#fdf8f4' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto cute-scrollbar p-4">
                <AnimatePresence mode="wait">
                  {!isWriting ? (
                    <motion.div key="reading" initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -10, opacity: 0 }} className="flex flex-col gap-3">
                      {myLetters.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                          <motion.div animate={{ y: [0,-5,0] }} transition={{ duration: 2.5, repeat: Infinity }}>
                            <PixelMailbox hasUnread={false} />
                          </motion.div>
                          <p className="font-display text-sm text-[#c09aaa] text-center">No letters yet.<br/>Send something sweet!</p>
                        </div>
                      ) : (
                        myLetters.map(letter => {
                          const sender = users.find(u => u.id === letter.fromUserId);
                          return (
                            <div key={letter.id}
                              className="p-3 flex flex-col gap-2"
                              style={{ background: '#fdf0f4', border: '2px solid #e8d0d8', boxShadow: '2px 2px 0 #e8d0d8', borderRadius: '4px' }}>
                              <div className="flex items-center gap-2">
                                <Avatar id={sender?.avatarId || 'bunny'} color={sender?.color || 'blush'} size="sm" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-display text-xs text-[#7a2e43]">{sender?.name || 'Unknown'}</p>
                                  <p className="font-pixel text-[10px] text-[#c09aaa]">
                                    {format(new Date(letter.sentAt!), 'MMM d, h:mm a')}
                                  </p>
                                </div>
                                <span className="font-pixel text-base text-[#e07a8f]">{letter.emoji}</span>
                              </div>
                              <p className="font-sans text-sm text-[#7a2e43] leading-relaxed whitespace-pre-wrap pl-2"
                                style={{ borderLeft: '3px solid #f9d0d8' }}>
                                {letter.body}
                              </p>
                            </div>
                          );
                        })
                      )}
                    </motion.div>
                  ) : (
                    <motion.div key="writing" initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 10, opacity: 0 }} className="flex flex-col gap-4 h-full">
                      {/* To: selector */}
                      {otherUsers.length > 0 && (
                        <div>
                          <p className="font-display text-xs text-[#c09aaa] mb-1.5">To:</p>
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => setSelectedRecipient(null)}
                              className={`px-3 py-1 font-display text-xs ${selectedRecipient === null ? 'bg-[#e07a8f] text-white' : 'bg-[#fde8ed] text-[#9d6070]'}`}
                              style={{ border: '2px solid #e8d0d8', borderRadius: '4px' }}
                            >
                              Everyone
                            </button>
                            {otherUsers.map(u => (
                              <button
                                key={u.id}
                                onClick={() => setSelectedRecipient(u.id)}
                                className={`flex items-center gap-1.5 px-3 py-1 font-display text-xs ${selectedRecipient === u.id ? 'bg-[#e07a8f] text-white' : 'bg-[#fde8ed] text-[#9d6070]'}`}
                                style={{ border: '2px solid #e8d0d8', borderRadius: '4px' }}
                              >
                                <Avatar id={u.avatarId} color={u.color} size="sm" className="w-5 h-5" />
                                {u.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Emoji picker */}
                      <div>
                        <p className="font-display text-xs text-[#c09aaa] mb-1.5">Decoration:</p>
                        <div className="flex gap-2">
                          {LETTER_EMOJIS.map(em => (
                            <button
                              key={em}
                              onClick={() => setSelectedEmoji(em)}
                              className={`w-8 h-8 font-pixel text-sm flex items-center justify-center ${selectedEmoji === em ? 'bg-[#e07a8f] text-white' : 'bg-[#fde8ed] text-[#e07a8f]'}`}
                              style={{ border: '2px solid #e8d0d8', borderRadius: '4px' }}
                            >
                              {em}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Textarea */}
                      <div className="flex-1 relative">
                        <textarea
                          value={body}
                          onChange={e => setBody(e.target.value.slice(0, 500))}
                          placeholder="Write something sweet..."
                          data-testid="textarea-letter-body"
                          className="w-full h-full min-h-[140px] p-3 font-sans text-sm text-[#7a2e43] placeholder:text-[#c0a0b0] resize-none focus:outline-none"
                          style={{ background: '#fdf0f4', border: '2px solid #e8d0d8', borderRadius: '4px' }}
                        />
                        <span className="absolute bottom-2 right-2 font-pixel text-[10px] text-[#c09aaa]">{body.length}/500</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="p-4 shrink-0" style={{ background: '#fde8ed', borderTop: '3px solid #e8d0d8' }}>
                {!isWriting ? (
                  <button
                    onClick={() => setIsWriting(true)}
                    data-testid="button-write-letter"
                    className="w-full py-2.5 font-display text-sm text-white flex items-center justify-center gap-2"
                    style={{ background: '#e07a8f', border: '2px solid #c05070', boxShadow: '3px 3px 0 #c05070', borderRadius: '4px' }}
                  >
                    <Heart className="w-4 h-4" />
                    Write a Letter
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setIsWriting(false); setBody(""); }}
                      className="flex-1 py-2.5 font-display text-xs text-[#9d6070]"
                      style={{ background: '#fdf8f4', border: '2px solid #e8d0d8', boxShadow: '2px 2px 0 #e8d0d8', borderRadius: '4px' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={!body.trim() || isSending}
                      data-testid="button-send-letter"
                      className="flex-1 py-2.5 font-display text-sm text-white flex items-center justify-center gap-1.5 disabled:opacity-50"
                      style={{ background: '#8ec48a', border: '2px solid #6aa866', boxShadow: '3px 3px 0 #6aa866', borderRadius: '4px' }}
                    >
                      <Send className="w-3.5 h-3.5" />
                      {isSending ? "Sending..." : "Send"}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
