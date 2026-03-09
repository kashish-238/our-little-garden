import { useEffect, useState, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { useGardenState, useCreateFlower, useUpdateFlower, useCreateLetter } from "@/hooks/use-garden";
import { DrawingStudio } from "@/components/DrawingStudio";
import { DraggableFlower } from "@/components/DraggableFlower";
import { Mailbox } from "@/components/Mailbox";
import { Avatar } from "@/components/Avatar";
import { Loader2, Users, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export function Garden() {
  const [, params] = useRoute("/garden/:code");
  const code = params?.code;
  const [, setLocation] = useLocation();
  const gardenRef = useRef<HTMLDivElement>(null);
  
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Fetch session
  useEffect(() => {
    const sessionStr = localStorage.getItem("garden_session");
    if (!sessionStr) {
      if (code) setLocation(`/join/${code}`);
      else setLocation("/");
      return;
    }
    
    try {
      const session = JSON.parse(sessionStr);
      if (session.gardenCode !== code) {
        setLocation(`/join/${code}`);
        return;
      }
      setCurrentUser({ id: session.userId });
    } catch {
      setLocation("/");
    }
  }, [code, setLocation]);

  const { data: state, isLoading, error } = useGardenState(code || null);
  const createFlower = useCreateFlower();
  const updateFlower = useUpdateFlower();
  const createLetter = useCreateLetter();

  if (isLoading || !currentUser) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !state) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-center p-4">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Garden Not Found</h2>
        <p className="text-muted-foreground mb-6">This garden might not exist or the link is broken.</p>
        <button onClick={() => setLocation("/")} className="px-6 py-3 bg-primary text-white rounded-full font-bold hover:bg-primary/90">
          Go Home
        </button>
      </div>
    );
  }

  const myUser = state.users.find(u => u.id === currentUser.id);
  
  // If somehow user is in session but not in DB anymore (deleted garden)
  if (!myUser && !isLoading) {
    localStorage.removeItem("garden_session");
    setLocation(`/join/${code}`);
    return null;
  }

  const handleSaveFlower = async (base64: string) => {
    if (!code || !myUser) return;
    await createFlower.mutateAsync({
      code,
      data: {
        drawnBy: myUser.id,
        imageUrl: base64,
        inGarden: false, // Starts in library
        scale: (Math.random() * 0.4 + 0.8).toFixed(2), // 0.8x to 1.2x
        rotation: Math.floor(Math.random() * 30 - 15) // -15 to +15 deg
      }
    });
  };

  const handleDropFlower = async (flowerId: number, x: number, y: number) => {
    if (!code) return;
    await updateFlower.mutateAsync({
      code,
      id: flowerId,
      data: { inGarden: true, x, y }
    });
  };

  const handleSendLetter = async (toUserId: number | null, body: string) => {
    if (!code || !myUser) return;
    await createLetter.mutateAsync({
      code,
      data: {
        fromUserId: myUser.id,
        toUserId,
        body,
        emoji: ['💌', '🌻', '✨', '💖', '🌿'][Math.floor(Math.random() * 5)]
      }
    });
  };

  const libraryFlowers = state.flowers.filter(f => !f.inGarden && f.drawnBy === myUser.id);
  const gardenFlowers = state.flowers.filter(f => f.inGarden);
  
  // Calculate garden health desaturation
  const healthFilter = `saturate(${Math.max(30, state.garden.healthScore)}%) brightness(${Math.max(80, state.garden.healthScore)}%)`;

  return (
    <div className="h-screen w-full bg-background flex flex-col md:flex-row overflow-hidden font-sans relative">
      {/* Top Bar (Mobile) / Absolute Header */}
      <div className="absolute top-4 left-4 z-40 glass-panel rounded-full px-4 py-2 flex items-center gap-3">
        <h1 className="font-display text-xl text-primary">{state.garden.name}</h1>
        <div className="w-1 h-4 bg-border rounded" />
        <div className="flex -space-x-2">
          {state.users.map(u => (
            <Avatar 
              key={u.id} 
              id={u.avatarId} 
              color={u.color} 
              size="sm" 
              className={`w-8 h-8 ${u.id === myUser.id ? 'ring-2 ring-primary z-10' : ''}`} 
            />
          ))}
        </div>
      </div>

      {/* Left Panel: Drawing Studio */}
      <div className="w-full md:w-[380px] h-1/2 md:h-full shrink-0 flex flex-col p-4 pt-20 md:pt-4 z-30 relative border-b md:border-b-0 md:border-r border-border/50 bg-white/40">
        <h2 className="font-display text-xl mb-4 text-foreground/80 pl-2">Drawing Studio</h2>
        <DrawingStudio onSave={handleSaveFlower} isSaving={createFlower.isPending} />
        
        <div className="mt-6 flex-1 flex flex-col min-h-0">
          <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-2 pl-2">Your Flowers</h3>
          <div className="flex-1 overflow-y-auto cute-scrollbar p-2 bg-white/50 rounded-2xl border-2 border-border/30 shadow-inner flex flex-wrap content-start gap-2">
            {libraryFlowers.length === 0 ? (
              <p className="w-full text-center text-sm text-muted-foreground py-8">
                Draw a flower to start planting!
              </p>
            ) : (
              libraryFlowers.map(f => (
                <DraggableFlower 
                  key={f.id} 
                  flower={f} 
                  containerRef={gardenRef} 
                  onDrop={handleDropFlower} 
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Center Panel: The Garden */}
      <div 
        className="flex-1 relative overflow-hidden bg-[#eaf2e3]"
        style={{ filter: healthFilter, transition: 'filter 1s ease-in-out' }}
      >
        {/* Grass texture background */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#d4e4c8] to-transparent" />
        
        {/* The droppable area */}
        <div ref={gardenRef} className="absolute inset-4 rounded-3xl z-10">
          {gardenFlowers.map(f => (
            <DraggableFlower 
              key={f.id} 
              flower={f} 
              containerRef={gardenRef} 
              onDrop={handleDropFlower}
              isDraggable={f.drawnBy === myUser.id} // Only drag own flowers once planted
            />
          ))}
          
          {gardenFlowers.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-primary/40 font-display text-3xl md:text-5xl rotate-[-5deg]">
                Drag flowers here...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mailbox Component */}
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
