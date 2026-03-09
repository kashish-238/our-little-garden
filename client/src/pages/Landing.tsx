import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useCreateGarden } from "@/hooks/use-garden";
import { Leaf, ArrowRight, Loader2 } from "lucide-react";

export function Landing() {
  const [, setLocation] = useLocation();
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const createGarden = useCreateGarden();

  // hero scenic mountain landscape
  const heroImage = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&h=1080&fit=crop";

  const handleCreate = async () => {
    // Generate random 6 char alphanumeric code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    try {
      await createGarden.mutateAsync({ code, name: "A New Garden" });
      setLocation(`/join/${code}`);
    } catch (err) {
      console.error("Failed to create", err);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.length === 6) {
      setIsJoining(true);
      setTimeout(() => setLocation(`/join/${joinCode.toUpperCase()}`), 500);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/30 rounded-full blur-[100px]" />
        <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-destructive/20 rounded-full blur-[80px]" />
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center bg-white/60 backdrop-blur-xl p-8 rounded-[3rem] shadow-2xl border border-white/50"
      >
        <div className="space-y-8 text-center md:text-left">
          <div>
            <motion.div 
              initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}
              className="inline-flex items-center justify-center p-3 bg-primary/20 text-primary rounded-2xl mb-4"
            >
              <Leaf className="w-8 h-8" />
            </motion.div>
            <h1 className="text-5xl md:text-6xl text-foreground mb-4">Our Little Garden</h1>
            <p className="text-xl text-muted-foreground font-sans max-w-md mx-auto md:mx-0">
              A cozy, collaborative space to draw flowers and write letters with someone special.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleCreate}
              disabled={createGarden.isPending}
              className="w-full md:w-auto px-8 py-4 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-lg transition-all hover:scale-105 hover:shadow-lg shadow-primary/30 flex items-center justify-center"
            >
              {createGarden.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : "Start a New Garden"}
            </button>

            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink-0 mx-4 text-muted-foreground font-semibold text-sm uppercase tracking-wider">or</span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            <form onSubmit={handleJoin} className="relative max-w-sm mx-auto md:mx-0">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                placeholder="Enter 6-letter code"
                className="w-full pl-6 pr-14 py-4 rounded-full border-2 border-border bg-white/80 focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/20 text-lg tracking-[0.2em] font-bold text-center uppercase transition-all placeholder:tracking-normal placeholder:font-normal"
              />
              <button
                type="submit"
                disabled={joinCode.length !== 6 || isJoining}
                className="absolute right-2 top-2 bottom-2 aspect-square rounded-full bg-accent text-accent-foreground flex items-center justify-center hover:bg-accent/90 disabled:opacity-50 disabled:hover:bg-accent transition-all"
              >
                {isJoining ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
          </div>
        </div>

        <div className="hidden md:block">
          <motion.div 
            className="w-full aspect-square rounded-[3rem] overflow-hidden shadow-2xl relative"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <img src={heroImage} alt="Garden landscape" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 to-transparent mix-blend-overlay"></div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
