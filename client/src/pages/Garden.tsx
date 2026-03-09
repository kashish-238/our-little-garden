import { useEffect, useState, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { useGardenState, useCreateFlower, useUpdateFlower, useCreateLetter } from "@/hooks/use-garden";
import { DrawingStudio } from "@/components/DrawingStudio";
import { DraggableFlower } from "@/components/DraggableFlower";
import { Mailbox } from "@/components/Mailbox";
import { Avatar } from "@/components/Avatar";
import { Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

function PixelGardenBg({ health }: { health: number }) {
  const sat = Math.max(30, health);
  const brightness = Math.max(78, health);
  return (
    <div className="absolute inset-0" style={{ filter: `saturate(${sat}%) brightness(${brightness}%)`, transition: 'filter 2s ease-in-out' }}>
      {/* Sky strip */}
      <div className="absolute inset-x-0 top-0 h-[30%]" style={{ background: 'linear-gradient(180deg, #c8e8f8 0%, #d8eecc 100%)' }} />
      {/* Grass */}
      <div className="absolute inset-x-0 bottom-0 top-[30%]" style={{ background: '#6daa62' }}>
        {/* Pixel grid */}
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 15px, rgba(0,0,0,0.15) 15px, rgba(0,0,0,0.15) 16px), repeating-linear-gradient(90deg, transparent, transparent 15px, rgba(0,0,0,0.15) 15px, rgba(0,0,0,0.15) 16px)'
          }} />
        {/* Darker ground patches */}
        {[10,28,52,74,88].map(l => (
          <div key={l} className="absolute h-4 rounded-full opacity-15"
            style={{ left: `${l}%`, bottom: `${(l % 3) * 10 + 5}%`, width: `${(l % 4 + 2) * 4}%`, background: '#3d7a38' }} />
        ))}
      </div>
      {/* Fence strip */}
      <div className="absolute left-0 right-0" style={{ top: '28%', height: '24px' }}>
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded" style={{ background: '#b8905e' }} />
        {Array.from({ length: 32 }).map((_, i) => (
          <div key={i} className="absolute top-0 bottom-0 w-1.5 rounded-sm" style={{ left: `${i * 3.2}%`, background: '#9b7248' }} />
        ))}
      </div>
      {/* Clouds — group opacity so overlaps merge into solid shapes */}
      <svg className="absolute top-0 left-0 w-full h-[30%] pointer-events-none" viewBox="0 0 800 200" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
        {/* Cloud 1 - left, large */}
        <g opacity="0.93">
          <circle cx="88"  cy="90" r="22" fill="white" />
          <circle cx="118" cy="74" r="32" fill="white" />
          <circle cx="152" cy="82" r="26" fill="white" />
          <circle cx="180" cy="90" r="18" fill="white" />
          <rect   x="66"   y="90" width="132" height="28" fill="white" />
        </g>
        {/* Cloud 2 - center-right, large */}
        <g opacity="0.88">
          <circle cx="490" cy="68" r="20" fill="white" />
          <circle cx="520" cy="52" r="34" fill="white" />
          <circle cx="558" cy="60" r="28" fill="white" />
          <circle cx="590" cy="68" r="20" fill="white" />
          <rect   x="470"  y="68" width="140" height="30" fill="white" />
        </g>
        {/* Cloud 3 - right, small */}
        <g opacity="0.68">
          <circle cx="690" cy="42" r="16" fill="white" />
          <circle cx="714" cy="30" r="22" fill="white" />
          <circle cx="740" cy="38" r="18" fill="white" />
          <rect   x="674"  y="42" width="84" height="20" fill="white" />
        </g>
      </svg>
    </div>
  );
}

export function Garden() {
  const [, params] = useRoute("/garden/:code");
  const code = params?.code;
  const [, setLocation] = useLocation();
  const gardenRef = useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const sessionStr = localStorage.getItem("garden_session");
    if (!sessionStr) { if (code) setLocation(`/join/${code}`); else setLocation("/"); return; }
    try {
      const session = JSON.parse(sessionStr);
      if (session.gardenCode !== code) { setLocation(`/join/${code}`); return; }
      setCurrentUser({ id: session.userId });
    } catch { setLocation("/"); }
  }, [code, setLocation]);

  const { data: state, isLoading, error } = useGardenState(code || null);
  const createFlower = useCreateFlower();
  const updateFlower = useUpdateFlower();
  const createLetter = useCreateLetter();

  if (isLoading || !currentUser) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-4"
        style={{ background: 'linear-gradient(180deg, #c8e8f8 0%, #c4ddc0 60%, #6daa62 100%)' }}>
        <motion.div animate={{ y: [0,-8,0] }} transition={{ duration: 1.2, repeat: Infinity }}>
          <svg width="56" height="56" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated' }}>
            <rect x="26" y="16" width="4" height="24" fill="#6daa62" />
            <ellipse cx="28" cy="18" rx="8" ry="8" fill="#f9bcd8" />
            <circle cx="28" cy="21" r="3.5" fill="#ffd44a" />
          </svg>
        </motion.div>
        <p className="font-display text-[#7a2e43] text-sm">growing your garden...</p>
      </div>
    );
  }

  if (error || !state) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-background p-4 text-center">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <h2 className="font-display text-xl text-foreground">Garden not found</h2>
        <p className="text-sm text-muted-foreground">This garden might not exist anymore.</p>
        <button
          onClick={() => { localStorage.removeItem("garden_session"); setLocation("/"); }}
          className="pixel-btn px-6 py-2.5 bg-[#e07a8f] text-white font-display text-sm mt-2"
          style={{ borderRadius: '4px' }}>
          Start Fresh
        </button>
      </div>
    );
  }

  const myUser = state.users.find(u => u.id === currentUser.id);
  // Don't clear the session on user-not-found — the data might be briefly stale.
  // The 3s poll will bring in fresh data. Just show loading until the user appears.
  if (!myUser) return (
    <div className="h-screen w-full flex flex-col items-center justify-center gap-4"
      style={{ background: 'linear-gradient(180deg, #c8e8f8 0%, #c4ddc0 60%, #6daa62 100%)' }}>
      <motion.div animate={{ y: [0,-8,0] }} transition={{ duration: 1.2, repeat: Infinity }}>
        <svg width="56" height="56" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated' }}>
          <rect x="26" y="16" width="4" height="24" fill="#6daa62" />
          <ellipse cx="28" cy="18" rx="8" ry="8" fill="#f9bcd8" />
          <circle cx="28" cy="21" r="3.5" fill="#ffd44a" />
        </svg>
      </motion.div>
      <p className="font-display text-[#7a2e43] text-sm">finding your spot...</p>
    </div>
  );

  const handleSaveFlower = async (base64: string) => {
    if (!code) return;
    await createFlower.mutateAsync({
      code,
      data: {
        drawnBy: myUser.id,
        imageUrl: base64,
        inGarden: false,
        scale: (Math.random() * 0.4 + 0.8).toFixed(2),
        rotation: Math.floor(Math.random() * 30 - 15),
      },
    });
  };

  const handleDropFlower = async (flowerId: number, x: number, y: number) => {
    if (!code) return;
    await updateFlower.mutateAsync({ code, id: flowerId, data: { inGarden: true, x, y } });
  };

  const handleSendLetter = async (toUserId: number | null, body: string) => {
    if (!code) return;
    await createLetter.mutateAsync({
      code,
      data: {
        fromUserId: myUser.id,
        toUserId,
        body,
        emoji: ['>', '<', '+', '*', '^'][Math.floor(Math.random() * 5)],
      },
    });
  };

  const libraryFlowers = state.flowers.filter(f => !f.inGarden && f.drawnBy === myUser.id);
  const gardenFlowers  = state.flowers.filter(f => f.inGarden);

  return (
    <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden relative" style={{ fontFamily: 'var(--font-sans)' }}>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-40 flex items-center gap-3 px-4 py-2 md:py-3"
        style={{ background: 'rgba(253,248,244,0.92)', borderBottom: '3px solid #e8d0d8' }}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <svg width="22" height="22" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated', flexShrink: 0 }}>
            <rect x="26" y="16" width="4" height="28" fill="#6daa62" />
            <ellipse cx="28" cy="16" rx="9" ry="9" fill="#f9bcd8" />
            <circle cx="28" cy="19" r="4" fill="#ffd44a" />
          </svg>
          <span className="font-display text-[#7a2e43] text-base truncate">{state.garden.name}</span>
        </div>

        {/* Health bar */}
        <div className="hidden md:flex items-center gap-1.5">
          <span className="font-display text-[10px] text-[#c09aaa]">health</span>
          <div className="w-20 h-2.5 border-2 border-[#e8d0d8] bg-[#fde8ed] overflow-hidden" style={{ borderRadius: '2px' }}>
            <motion.div
              className="h-full"
              style={{ background: state.garden.healthScore > 60 ? '#8ec48a' : state.garden.healthScore > 30 ? '#f0d060' : '#e07a8f' }}
              animate={{ width: `${state.garden.healthScore}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        {/* Users */}
        <div className="flex items-center -space-x-2">
          {state.users.map(u => (
            <div key={u.id} className="relative"
              style={{ zIndex: u.id === myUser.id ? 10 : 1 }}>
              <Avatar id={u.avatarId} color={u.color} size="sm"
                className={u.id === myUser.id ? 'ring-2 ring-[#e07a8f] ring-offset-1 ring-offset-[#fdf8f4]' : ''} />
            </div>
          ))}
        </div>

        {/* Code */}
        <span className="font-pixel text-xs text-[#c09aaa] tracking-widest hidden sm:block">{code}</span>
      </div>

      {/* LEFT: Drawing Studio */}
      <div className="hidden md:flex w-[340px] shrink-0 flex-col pt-16 pb-4 px-4 gap-4 relative z-30"
        style={{ background: '#fdf4f6', borderRight: '3px solid #e8d0d8' }}>
        <p className="font-display text-sm text-[#c09aaa]">Drawing Studio</p>
        <DrawingStudio onSave={handleSaveFlower} isSaving={createFlower.isPending} />

        <div className="flex-1 flex flex-col min-h-0 mt-2">
          <p className="font-display text-xs text-[#c09aaa] mb-2">Your Flower Library</p>
          <div className="flex-1 min-h-0 overflow-y-auto cute-scrollbar p-2 flex flex-wrap content-start gap-2"
            style={{ background: '#fdf8fa', border: '2px solid #e8d0d8', borderRadius: '4px' }}>
            {libraryFlowers.length === 0 ? (
              <div className="w-full flex flex-col items-center justify-center py-8 gap-2">
                <motion.div animate={{ y: [0,-4,0] }} transition={{ duration: 2, repeat: Infinity }}>
                  <svg width="36" height="36" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated' }}>
                    <rect x="26" y="20" width="4" height="22" fill="#8ec48a" />
                    <ellipse cx="28" cy="22" rx="7" ry="7" fill="#e8d0d8" />
                    <circle cx="28" cy="25" r="3" fill="#fdf8fa" />
                  </svg>
                </motion.div>
                <p className="font-display text-[10px] text-[#c09aaa] text-center">Draw a flower to plant it!</p>
              </div>
            ) : (
              libraryFlowers.map(f => (
                <DraggableFlower key={f.id} flower={f} containerRef={gardenRef} onDrop={handleDropFlower} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* CENTER: The Garden */}
      <div className="flex-1 relative overflow-hidden pt-12 md:pt-0">
        <PixelGardenBg health={state.garden.healthScore} />
        <div ref={gardenRef} className="absolute inset-0 z-10" style={{ top: '40%' }}>
          {gardenFlowers.map(f => (
            <DraggableFlower
              key={f.id}
              flower={f}
              containerRef={gardenRef}
              onDrop={handleDropFlower}
              isDraggable={f.drawnBy === myUser.id}
            />
          ))}
          {gardenFlowers.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.p
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="font-display text-white text-shadow text-lg drop-shadow-md"
              >
                drag flowers here...
              </motion.p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: Drawing panel bottom drawer toggle (simplified) */}
      <div className="md:hidden absolute bottom-20 left-4 z-30">
        <details className="group">
          <summary
            className="pixel-btn list-none cursor-pointer px-4 py-2 font-display text-xs bg-[#fdf4f6] text-[#7a2e43]"
            style={{ borderRadius: '4px' }}
          >
            Drawing Studio
          </summary>
          <div className="absolute bottom-full mb-2 left-0 w-80 pixel-panel bg-[#fdf4f6] p-4 max-h-[60vh] overflow-y-auto cute-scrollbar">
            <DrawingStudio onSave={handleSaveFlower} isSaving={createFlower.isPending} />
          </div>
        </details>
      </div>

      {/* Mailbox */}
      <Mailbox
        currentUser={myUser}
        users={state.users}
        letters={state.letters}
        onSend={handleSendLetter}
        isSending={createLetter.isPending}
      />
    </div>
  );
}
