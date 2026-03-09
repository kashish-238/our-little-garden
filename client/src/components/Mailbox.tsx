import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";
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

const STICKERS = [
  { sym: "♥", label: "heart" },
  { sym: "✿", label: "flower" },
  { sym: "★", label: "star" },
  { sym: "◆", label: "gem" },
  { sym: "☁", label: "cloud" },
  { sym: "✦", label: "sparkle" },
];

function PixelEnvelope({ unread }: { unread: boolean }) {
  return (
    <svg width="36" height="30" viewBox="0 0 36 30" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: "pixelated" }}>
      {/* Body */}
      <rect x="1" y="7" width="34" height="22" rx="3" fill="#fde8ed" stroke="#e07a8f" strokeWidth="2" />
      {/* Seal/fold lines */}
      <line x1="1" y1="29" x2="14" y2="17" stroke="#f5afc0" strokeWidth="1.5" />
      <line x1="35" y1="29" x2="22" y2="17" stroke="#f5afc0" strokeWidth="1.5" />
      {/* Flap */}
      <path d="M1 9 L18 20 L35 9" fill="#f9bcd8" stroke="#e07a8f" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Heart seal */}
      <path d="M16 13 Q18 11 20 13 Q22 11 24 13 Q24 16 18 19 Q12 16 12 13 Q14 11 16 13Z" fill="#e07a8f" />
      {/* Unread dot */}
      {unread && (
        <>
          <circle cx="30" cy="5" r="5" fill="#e07a8f" />
          <circle cx="30" cy="5" r="3" fill="#ff6b8a" />
        </>
      )}
    </svg>
  );
}

function LetterCard({ letter, users }: { letter: Letter; users: User[] }) {
  const sender = users.find(u => u.id === letter.fromUserId);
  return (
    <motion.div
      initial={{ y: 8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex flex-col gap-2 p-3"
      style={{
        background: 'linear-gradient(135deg, #fff9fb 0%, #fdf0f5 100%)',
        border: '2px solid #f0c8d8',
        boxShadow: '3px 3px 0 #f0c8d8',
        borderRadius: '4px',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Avatar id={sender?.avatarId || "bunny"} color={sender?.color || "blush"} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="font-display text-xs text-[#7a2e43] leading-none">{sender?.name || "???"}</p>
          <p className="font-pixel text-[10px] text-[#c0a0b0] mt-0.5">{format(new Date(letter.sentAt!), "MMM d · h:mm a")}</p>
        </div>
        <span className="font-sans text-base leading-none select-none" style={{ color: '#e07a8f' }}>{letter.emoji}</span>
      </div>
      {/* Divider */}
      <div className="h-px" style={{ background: 'repeating-linear-gradient(90deg, #f0c8d8 0px, #f0c8d8 6px, transparent 6px, transparent 10px)' }} />
      {/* Body */}
      <p className="font-sans text-sm text-[#7a3050] leading-relaxed whitespace-pre-wrap">{letter.body}</p>
    </motion.div>
  );
}

export function Mailbox({ currentUser, users, letters, onSend, isSending }: MailboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [body, setBody] = useState("");
  const [sticker, setSticker] = useState("♥");
  const [recipient, setRecipient] = useState<number | null>(null);

  const myLetters = letters
    .filter(l => l.toUserId === currentUser.id || l.toUserId === null)
    .sort((a, b) => new Date(b.sentAt!).getTime() - new Date(a.sentAt!).getTime());
  const unreadCount = myLetters.filter(l => !l.readAt).length;
  const otherUsers = users.filter(u => u.id !== currentUser.id);

  const handleClose = () => { setIsOpen(false); setIsWriting(false); setBody(""); };

  const handleSend = () => {
    if (!body.trim()) return;
    onSend(recipient, body);
    setBody("");
    setIsWriting(false);
    setRecipient(null);
    setSticker("♥");
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        data-testid="button-open-mailbox"
        whileHover={{ scale: 1.1, rotate: -6 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-5 right-5 z-40 flex items-center justify-center"
        style={{
          width: 60, height: 60,
          background: 'linear-gradient(135deg, #fde8ed 0%, #f9bcd8 100%)',
          border: '3px solid #e07a8f',
          boxShadow: '4px 4px 0 #c05070',
          borderRadius: '8px',
        }}
      >
        <PixelEnvelope unread={unreadCount > 0} />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 w-5 h-5 font-pixel text-[11px] text-white flex items-center justify-center"
            style={{ background: '#e07a8f', border: '2px solid white', borderRadius: '3px' }}>
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
              className="fixed inset-0 z-50"
              style={{ background: 'rgba(122, 46, 67, 0.08)', backdropFilter: 'blur(2px)' }}
              onClick={handleClose}
            />

            {/* Panel */}
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", damping: 22, stiffness: 280 }}
              className="fixed bottom-0 right-0 left-0 md:left-auto md:right-5 md:bottom-24 w-full md:w-[380px] h-[80vh] md:h-[520px] z-50 flex flex-col overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, #fff9fb 0%, #fdf4f8 100%)',
                border: '3px solid #f0c8d8',
                boxShadow: '5px 5px 0 #e0a8c0, 0 8px 32px rgba(122,46,67,0.12)',
                borderRadius: '8px 8px 0 0',
              }}
            >
              {/* Cute top border decoration */}
              <div className="shrink-0 h-2" style={{
                background: 'repeating-linear-gradient(90deg, #f9bcd8 0px, #f9bcd8 12px, #c9dfc5 12px, #c9dfc5 24px, #d9d0ef 24px, #d9d0ef 36px, #f7e5a0 36px, #f7e5a0 48px)',
              }} />

              {/* Header */}
              <div className="shrink-0 flex items-center justify-between px-4 py-3"
                style={{ borderBottom: '2px dashed #f0c8d8' }}>
                <div className="flex items-center gap-2.5">
                  <PixelEnvelope unread={false} />
                  <div>
                    <h2 className="font-display text-lg text-[#7a2e43] leading-none">
                      {isWriting ? "Write a Letter" : "Mailbox"}
                    </h2>
                    {!isWriting && (
                      <p className="font-pixel text-[10px] text-[#c09aaa] mt-0.5">
                        {myLetters.length === 0 ? "no letters yet..." : `${myLetters.length} letter${myLetters.length !== 1 ? "s" : ""}`}
                      </p>
                    )}
                  </div>
                </div>
                <button onClick={handleClose} data-testid="button-close-mailbox"
                  className="w-8 h-8 flex items-center justify-center text-[#c09aaa] hover:text-[#e07a8f] transition-colors"
                  style={{ background: '#fde8ed', border: '2px solid #f0c8d8', borderRadius: '4px' }}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto cute-scrollbar px-4 py-3">
                <AnimatePresence mode="wait">
                  {!isWriting ? (
                    <motion.div key="inbox" initial={{ x: -12, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -12, opacity: 0 }} className="flex flex-col gap-3">
                      {myLetters.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-14 gap-4">
                          <motion.div animate={{ y: [0, -7, 0] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}>
                            <svg width="64" height="54" viewBox="0 0 36 30" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: "pixelated" }}>
                              <rect x="1" y="7" width="34" height="22" rx="3" fill="#fde8ed" stroke="#e8c0d0" strokeWidth="2" />
                              <line x1="1" y1="29" x2="14" y2="17" stroke="#f5d0e0" strokeWidth="1.5" />
                              <line x1="35" y1="29" x2="22" y2="17" stroke="#f5d0e0" strokeWidth="1.5" />
                              <path d="M1 9 L18 20 L35 9" fill="#f9d0e4" stroke="#e8c0d0" strokeWidth="1.5" strokeLinejoin="round" />
                              <path d="M16 13 Q18 11 20 13 Q22 11 24 13 Q24 16 18 19 Q12 16 12 13 Q14 11 16 13Z" fill="#e8c0d0" />
                            </svg>
                          </motion.div>
                          <div className="text-center space-y-1">
                            <p className="font-display text-sm text-[#c09aaa]">your mailbox is empty</p>
                            <p className="font-sans text-xs text-[#d0b0c0]">write something sweet to your person ♥</p>
                          </div>
                        </div>
                      ) : (
                        myLetters.map(l => <LetterCard key={l.id} letter={l} users={users} />)
                      )}
                    </motion.div>
                  ) : (
                    <motion.div key="compose" initial={{ x: 12, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 12, opacity: 0 }} className="flex flex-col gap-4 h-full">
                      {/* To: */}
                      {otherUsers.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="font-display text-xs text-[#c09aaa]">To:</p>
                          <div className="flex flex-wrap gap-2">
                            <button onClick={() => setRecipient(null)}
                              className="px-3 py-1.5 font-display text-xs transition-all"
                              style={{
                                background: recipient === null ? '#e07a8f' : '#fde8ed',
                                color: recipient === null ? 'white' : '#9d6070',
                                border: '2px solid #f0c8d8',
                                borderRadius: '4px',
                                boxShadow: recipient === null ? '2px 2px 0 #c05070' : '2px 2px 0 #f0c8d8',
                              }}>
                              Everyone ♥
                            </button>
                            {otherUsers.map(u => (
                              <button key={u.id} onClick={() => setRecipient(u.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 font-display text-xs transition-all"
                                style={{
                                  background: recipient === u.id ? '#e07a8f' : '#fde8ed',
                                  color: recipient === u.id ? 'white' : '#9d6070',
                                  border: '2px solid #f0c8d8',
                                  borderRadius: '4px',
                                  boxShadow: recipient === u.id ? '2px 2px 0 #c05070' : '2px 2px 0 #f0c8d8',
                                }}>
                                <Avatar id={u.avatarId} color={u.color} size="sm" className="w-5 h-5" />
                                {u.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Sticker pick */}
                      <div className="space-y-1.5">
                        <p className="font-display text-xs text-[#c09aaa]">Little decoration:</p>
                        <div className="flex gap-2 flex-wrap">
                          {STICKERS.map(s => (
                            <button key={s.sym} onClick={() => setSticker(s.sym)}
                              className="w-9 h-9 text-base font-sans flex items-center justify-center transition-all"
                              style={{
                                background: sticker === s.sym ? '#fde8ed' : '#fff9fb',
                                border: `2px solid ${sticker === s.sym ? '#e07a8f' : '#f0c8d8'}`,
                                boxShadow: sticker === s.sym ? '2px 2px 0 #e07a8f' : '2px 2px 0 #f0c8d8',
                                borderRadius: '4px',
                                color: '#e07a8f',
                                transform: sticker === s.sym ? 'scale(1.1)' : 'scale(1)',
                              }}>
                              {s.sym}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Paper texture textarea */}
                      <div className="flex-1 relative min-h-[130px]">
                        <div className="absolute inset-0 pointer-events-none" style={{
                          backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #f5d8e8 27px, #f5d8e8 28px)',
                          borderRadius: '4px',
                        }} />
                        <textarea
                          value={body}
                          onChange={e => setBody(e.target.value.slice(0, 500))}
                          placeholder={"Dear " + (otherUsers[0]?.name || "you") + ",\n\n"}
                          data-testid="textarea-letter-body"
                          className="relative w-full h-full min-h-[130px] p-3 pt-4 font-sans text-sm leading-7 text-[#7a2e43] placeholder:text-[#d0b0c0] resize-none focus:outline-none bg-transparent"
                          style={{
                            background: 'linear-gradient(135deg, #fff9fb 0%, #fdf4f8 100%)',
                            border: '2px solid #f0c8d8',
                            boxShadow: '2px 2px 0 #f0c8d8',
                            borderRadius: '4px',
                          }}
                        />
                        <span className="absolute bottom-2 right-2 font-pixel text-[10px] text-[#d0b0c0] pointer-events-none">{body.length}/500</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="shrink-0 px-4 py-3" style={{ borderTop: '2px dashed #f0c8d8', background: 'rgba(253,240,248,0.6)' }}>
                <AnimatePresence mode="wait">
                  {!isWriting ? (
                    <motion.button key="write-btn"
                      initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 6, opacity: 0 }}
                      onClick={() => setIsWriting(true)}
                      data-testid="button-write-letter"
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="w-full py-3 font-display text-sm text-white flex items-center justify-center gap-2"
                      style={{
                        background: 'linear-gradient(135deg, #e07a8f 0%, #d05070 100%)',
                        border: '2px solid #c05070',
                        boxShadow: '3px 3px 0 #c05070',
                        borderRadius: '4px',
                      }}>
                      <span className="text-base">✉</span>
                      Write a Sweet Letter
                    </motion.button>
                  ) : (
                    <motion.div key="compose-btns"
                      initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 6, opacity: 0 }}
                      className="flex gap-2">
                      <button onClick={() => { setIsWriting(false); setBody(""); }}
                        className="flex-1 py-2.5 font-display text-xs text-[#9d6070]"
                        style={{ background: '#fdf8fb', border: '2px solid #f0c8d8', boxShadow: '2px 2px 0 #f0c8d8', borderRadius: '4px' }}>
                        Cancel
                      </button>
                      <button onClick={handleSend}
                        disabled={!body.trim() || isSending}
                        data-testid="button-send-letter"
                        className="flex-1 py-2.5 font-display text-sm text-white flex items-center justify-center gap-1.5 disabled:opacity-50"
                        style={{ background: '#8ec48a', border: '2px solid #6aa866', boxShadow: '3px 3px 0 #6aa866', borderRadius: '4px' }}>
                        <Send className="w-3.5 h-3.5" />
                        {isSending ? "Sending..." : `Send ${sticker}`}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Cute bottom decoration */}
              <div className="shrink-0 h-2" style={{
                background: 'repeating-linear-gradient(90deg, #f7e5a0 0px, #f7e5a0 12px, #d9d0ef 12px, #d9d0ef 24px, #c9dfc5 24px, #c9dfc5 36px, #f9bcd8 36px, #f9bcd8 48px)',
              }} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
