import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Send, X, Heart } from "lucide-react";
import { Avatar } from "./Avatar";
import { Button } from "./ui/button";
import type { User, Letter } from "@shared/routes";
import { format } from "date-fns";

interface MailboxProps {
  currentUser: User;
  users: User[];
  letters: Letter[];
  onSend: (toUserId: number | null, body: string) => void;
  isSending: boolean;
}

export function Mailbox({ currentUser, users, letters, onSend, isSending }: MailboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [body, setBody] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState<number | null>(null);

  const myLetters = letters.filter(l => l.toUserId === currentUser.id || l.toUserId === null).sort((a, b) => new Date(b.sentAt!).getTime() - new Date(a.sentAt!).getTime());
  const otherUsers = users.filter(u => u.id !== currentUser.id);

  const handleSend = () => {
    if (!body.trim()) return;
    onSend(selectedRecipient, body);
    setBody("");
    setIsWriting(false);
    setSelectedRecipient(null);
  };

  return (
    <>
      <motion.button
        className="fixed bottom-6 right-6 w-16 h-16 bg-amber-400 text-amber-950 rounded-full shadow-lg shadow-amber-900/20 flex items-center justify-center z-40 hover:bg-amber-300"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
      >
        <Mail className="w-8 h-8" />
        {myLetters.filter(l => !l.readAt).length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
            {myLetters.filter(l => !l.readAt).length}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 right-0 left-0 md:left-auto md:right-6 md:bottom-24 w-full md:w-[400px] h-[80vh] md:h-[600px] bg-[#fdfbf7] rounded-t-3xl md:rounded-3xl shadow-2xl border border-amber-900/10 z-50 flex flex-col overflow-hidden"
            >
              <div className="bg-amber-100/50 p-4 border-b border-amber-900/10 flex justify-between items-center shrink-0">
                <h3 className="font-display text-2xl text-amber-900 flex items-center gap-2">
                  <Mail className="w-6 h-6" /> 
                  {isWriting ? "Write a Letter" : "Mailbox"}
                </h3>
                <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-amber-900/10 text-amber-900">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 cute-scrollbar relative">
                <AnimatePresence mode="wait">
                  {!isWriting ? (
                    <motion.div
                      key="reading"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -20, opacity: 0 }}
                      className="flex flex-col gap-4"
                    >
                      {myLetters.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-4">
                          <Mail className="w-12 h-12 opacity-20" />
                          <p>Your mailbox is empty.<br/>Send a letter to a friend!</p>
                        </div>
                      ) : (
                        myLetters.map((letter) => {
                          const sender = users.find(u => u.id === letter.fromUserId);
                          return (
                            <div key={letter.id} className="bg-white p-4 rounded-2xl shadow-sm border border-border/50 relative group">
                              <div className="flex items-center gap-3 mb-2">
                                <Avatar id={sender?.avatarId || 'bunny'} color={sender?.color || 'blush'} size="sm" />
                                <div>
                                  <p className="font-bold text-sm">{sender?.name || 'Unknown'}</p>
                                  <p className="text-[11px] text-muted-foreground">{format(new Date(letter.sentAt!), 'MMM d, h:mm a')}</p>
                                </div>
                                <div className="ml-auto text-2xl">{letter.emoji}</div>
                              </div>
                              <p className="text-sm text-foreground/80 leading-relaxed font-sans whitespace-pre-wrap pl-12 border-l-2 border-primary/20">
                                {letter.body}
                              </p>
                            </div>
                          );
                        })
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="writing"
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 20, opacity: 0 }}
                      className="flex flex-col h-full gap-4"
                    >
                      {otherUsers.length > 0 && (
                        <div>
                          <label className="text-sm font-bold text-amber-900/70 mb-2 block">To:</label>
                          <div className="flex gap-2 overflow-x-auto pb-2 cute-scrollbar">
                            <button
                              onClick={() => setSelectedRecipient(null)}
                              className={`px-4 py-2 rounded-full text-sm transition-all ${selectedRecipient === null ? 'bg-primary text-white shadow-md' : 'bg-white border hover:bg-muted'}`}
                            >
                              Everyone
                            </button>
                            {otherUsers.map(u => (
                              <button
                                key={u.id}
                                onClick={() => setSelectedRecipient(u.id)}
                                className={`px-4 py-2 rounded-full text-sm transition-all flex items-center gap-2 ${selectedRecipient === u.id ? 'bg-primary text-white shadow-md' : 'bg-white border hover:bg-muted'}`}
                              >
                                <Avatar id={u.avatarId} color={u.color} size="sm" className="w-5 h-5 border" />
                                {u.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex-1 relative flex flex-col">
                        <textarea
                          value={body}
                          onChange={(e) => setBody(e.target.value.slice(0, 500))}
                          placeholder="Write something sweet..."
                          className="flex-1 w-full bg-white rounded-2xl border-2 border-amber-900/10 p-4 resize-none focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 text-foreground font-sans transition-all"
                        />
                        <div className="absolute bottom-4 right-4 text-xs text-muted-foreground font-bold">
                          {body.length}/500
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-4 bg-white border-t border-amber-900/10 shrink-0">
                {!isWriting ? (
                  <Button 
                    onClick={() => setIsWriting(true)} 
                    className="w-full rounded-full bg-primary hover:bg-primary/90 font-bold h-12 text-lg shadow-md"
                  >
                    <Heart className="w-5 h-5 mr-2" /> Write a Letter
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => { setIsWriting(false); setBody(""); }} 
                      className="flex-1 rounded-full border-2 h-12 font-bold"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSend} 
                      disabled={!body.trim() || isSending}
                      className="flex-1 rounded-full bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold h-12 shadow-md shadow-amber-900/10"
                    >
                      {isSending ? "Sending..." : <><Send className="w-4 h-4 mr-2" /> Send Letter</>}
                    </Button>
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
