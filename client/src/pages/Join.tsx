import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useCreateUser } from "@/hooks/use-garden";
import { Avatar } from "@/components/Avatar";
import { Loader2 } from "lucide-react";

const AVATARS = ['bunny', 'fox', 'cat', 'bear'];
const AVATAR_LABELS: Record<string, string> = {
  bunny: 'Bunny', fox: 'Fox', cat: 'Kitty', bear: 'Bear',
};

const COLORS = [
  { id: 'blush',    hex: '#f9d0d8', label: 'Blush'  },
  { id: 'sage',     hex: '#c9dfc5', label: 'Sage'   },
  { id: 'lavender', hex: '#d9d0ef', label: 'Lavender' },
  { id: 'butter',   hex: '#f7e5a0', label: 'Butter' },
  { id: 'sky',      hex: '#b8dce8', label: 'Sky'    },
];

export function Join() {
  const [, params] = useRoute("/join/:code");
  const code = params?.code;
  const [, setLocation] = useLocation();

  const createUser = useCreateUser();

  const [name, setName]       = useState("");
  const [avatarId, setAvatarId] = useState("bunny");
  const [color, setColor]     = useState("blush");

  if (!code) { setLocation("/"); return null; }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const user = await createUser.mutateAsync({
        code,
        data: { name: name.trim(), avatarId, color, role: "friend" },
      });
      localStorage.setItem("garden_session", JSON.stringify({ gardenCode: code, userId: user.id }));
      setLocation(`/garden/${code}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(180deg, #f9eef3 0%, #e8f5e4 100%)' }}>
      <motion.div
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="w-full max-w-sm"
      >
        <div className="pixel-panel-rose bg-[#fdf8f4] p-7 flex flex-col items-center gap-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="font-display text-2xl text-[#7a2e43]">Who are you?</h1>
            <p className="font-sans text-xs text-[#c09aaa] mt-1">
              garden <span className="font-pixel tracking-widest text-[#e07a8f]">{code}</span>
            </p>
          </div>

          <form onSubmit={handleJoin} className="w-full flex flex-col gap-5">
            {/* Avatar preview */}
            <div className="flex justify-center">
              <motion.div
                key={avatarId + color}
                initial={{ scale: 0.75, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Avatar id={avatarId} color={color} size="xl" />
              </motion.div>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="font-display text-xs text-[#c09aaa]">your name</label>
              <input
                type="text"
                required
                maxLength={12}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Maple"
                data-testid="input-name"
                className="w-full px-3 py-2.5 font-display text-base text-[#7a2e43] bg-[#fdf0f3] border-2 border-[#e8aabf] focus:outline-none focus:border-[#e07a8f] text-center placeholder:text-[#d0a8b8] placeholder:text-sm"
                style={{ borderRadius: '4px' }}
              />
            </div>

            {/* Avatar pick */}
            <div className="space-y-1.5">
              <label className="font-display text-xs text-[#c09aaa]">your animal</label>
              <div className="grid grid-cols-4 gap-2">
                {AVATARS.map(id => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setAvatarId(id)}
                    data-testid={`button-avatar-${id}`}
                    className={`flex flex-col items-center gap-1 p-2 transition-all ${
                      avatarId === id
                        ? 'pixel-panel-rose bg-[#fde8ed]'
                        : 'border-2 border-transparent hover:border-[#e8d0d8] bg-[#fdf8f4]'
                    }`}
                    style={{ borderRadius: '4px' }}
                  >
                    <Avatar id={id} color={color} size="md" />
                    <span className="font-display text-[10px] text-[#9d6070]">{AVATAR_LABELS[id]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color pick */}
            <div className="space-y-1.5">
              <label className="font-display text-xs text-[#c09aaa]">your color</label>
              <div className="flex justify-center gap-3">
                {COLORS.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColor(c.id)}
                    data-testid={`button-color-${c.id}`}
                    title={c.label}
                    className={`w-9 h-9 transition-all ${
                      color === c.id
                        ? 'ring-2 ring-[#e07a8f] ring-offset-2 ring-offset-[#fdf8f4]'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.hex, borderRadius: '4px', border: '2px solid rgba(0,0,0,0.12)' }}
                  />
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!name.trim() || createUser.isPending}
              data-testid="button-enter-garden"
              className="pixel-btn w-full py-3 bg-[#e07a8f] text-white font-display text-lg disabled:opacity-50"
              style={{ borderRadius: '4px' }}
            >
              {createUser.isPending
                ? <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                : "Enter the Garden"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
