import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useCreateUser } from "@/hooks/use-garden";
import { Avatar } from "@/components/Avatar";
import { Loader2, ArrowRight } from "lucide-react";

const AVATARS = ['bunny', 'fox', 'cat', 'bear'];
const COLORS = [
  { id: 'blush', bg: 'bg-[#E6B8B8]' },
  { id: 'sage', bg: 'bg-[#8FA286]' },
  { id: 'lavender', bg: 'bg-[#C3B8D9]' },
  { id: 'butter', bg: 'bg-[#F3E5AB]' },
  { id: 'sky', bg: 'bg-[#AEC6CF]' }
];

export function Join() {
  const [, params] = useRoute("/join/:code");
  const code = params?.code;
  const [, setLocation] = useLocation();
  
  const createUser = useCreateUser();
  
  const [name, setName] = useState("");
  const [avatarId, setAvatarId] = useState("bunny");
  const [color, setColor] = useState("blush");

  if (!code) {
    setLocation("/");
    return null;
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const user = await createUser.mutateAsync({
        code,
        data: { name, avatarId, color, role: "friend" }
      });
      
      // Save session
      localStorage.setItem("garden_session", JSON.stringify({
        gardenCode: code,
        userId: user.id
      }));

      setLocation(`/garden/${code}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-white rounded-[3rem] p-8 shadow-xl border-2 border-border/50"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl text-foreground mb-2">Who are you?</h1>
          <p className="text-muted-foreground font-sans">Choose your look for garden <strong className="text-accent">{code}</strong></p>
        </div>

        <form onSubmit={handleJoin} className="space-y-8">
          {/* Avatar Preview */}
          <div className="flex justify-center mb-8">
            <Avatar id={avatarId} color={color} size="xl" />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-foreground/70 uppercase tracking-wider ml-4">Your Name</label>
            <input
              type="text"
              required
              maxLength={20}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-6 py-4 rounded-full bg-muted/50 border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none text-lg font-bold transition-all text-center"
              placeholder="e.g. Maple"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-foreground/70 uppercase tracking-wider ml-4">Animal</label>
            <div className="flex justify-between gap-2 bg-muted/30 p-2 rounded-full">
              {AVATARS.map(id => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setAvatarId(id)}
                  className={`flex-1 aspect-square rounded-full flex items-center justify-center text-3xl transition-all ${avatarId === id ? 'bg-white shadow-md scale-110' : 'hover:bg-white/50 opacity-50 hover:opacity-100'}`}
                >
                  <Avatar id={id} color="blush" size="sm" className={avatarId !== id ? "bg-transparent border-transparent" : "scale-110"} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-foreground/70 uppercase tracking-wider ml-4">Color</label>
            <div className="flex justify-center gap-4">
              {COLORS.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  className={`w-10 h-10 rounded-full transition-all ${c.bg} ${color === c.id ? 'ring-4 ring-offset-4 ring-offset-white ring-primary scale-110 shadow-lg' : 'hover:scale-110 opacity-70 hover:opacity-100 shadow-sm'}`}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim() || createUser.isPending}
            className="w-full py-4 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-xl flex items-center justify-center gap-2 transition-all hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100 mt-4"
          >
            {createUser.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : "Enter Garden"}
            {!createUser.isPending && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
