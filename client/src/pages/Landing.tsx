import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useCreateGarden } from "@/hooks/use-garden";
import { Loader2 } from "lucide-react";

function FallingPetal({ className }: { className: string }) {
  return (
    <div
      className={`fixed pointer-events-none z-0 ${className}`}
      style={{ left: `${Math.random() * 100}%` }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
        <ellipse cx="8" cy="8" rx="5" ry="7" fill="#f9b8c8" opacity="0.75" transform="rotate(-30 8 8)" />
      </svg>
    </div>
  );
}


function SceneSVG() {
  return (
    <svg viewBox="0 0 420 260" xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
      {/* Sky */}
      <rect width="420" height="260" fill="#c8e8f8" />
      {/* Sun */}
      <circle cx="360" cy="50" r="28" fill="#ffe87a" />
      <circle cx="360" cy="50" r="22" fill="#ffd44a" />
      {/* Sun rays */}
      {[0,45,90,135,180,225,270,315].map((a, i) => (
        <rect key={i} x="356" y="14" width="8" height="16" rx="3" fill="#ffe87a" opacity="0.6"
          transform={`rotate(${a} 360 50)`} />
      ))}
      {/* Cloud 1 — group opacity so bumps merge solid */}
      <g opacity="0.92">
        <circle cx="52"  cy="46" r="14" fill="white" />
        <circle cx="74"  cy="36" r="20" fill="white" />
        <circle cx="98"  cy="42" r="16" fill="white" />
        <circle cx="116" cy="48" r="11" fill="white" />
        <rect   x="38"   y="46" width="89" height="18" fill="white" />
      </g>
      {/* Cloud 2 — group opacity */}
      <g opacity="0.80">
        <circle cx="198" cy="42" r="13" fill="white" />
        <circle cx="220" cy="30" r="20" fill="white" />
        <circle cx="246" cy="37" r="16" fill="white" />
        <circle cx="264" cy="44" r="11" fill="white" />
        <rect   x="185"  y="42" width="90" height="18" fill="white" />
      </g>

      {/* Back hills */}
      <ellipse cx="90" cy="200" rx="140" ry="80" fill="#8ec48a" />
      <ellipse cx="340" cy="210" rx="130" ry="70" fill="#8ec48a" />
      {/* Ground */}
      <rect y="185" width="420" height="75" fill="#6daa62" />
      {/* Pixel grid on ground */}
      {[0,8,16,24,32,40,48].map(y => (
        <line key={y} x1="0" y1={185+y} x2="420" y2={185+y} stroke="#5c9652" strokeWidth="1" opacity="0.3" />
      ))}
      {/* Fence */}
      {[20,36,52,68,84,100,116,132,148,164,180,196,212,228,244,260,276,292,308,324,340,356,372,388,404].map(x => (
        <rect key={x} x={x} y="174" width="6" height="18" rx="2" fill="#9b7248" />
      ))}
      <rect y="178" width="420" height="4" rx="2" fill="#b8905e" />
      <rect y="186" width="420" height="3" rx="2" fill="#b8905e" />

      {/* Pixel flowers */}
      {/* Flower 1 */}
      <rect x="50" y="178" width="4" height="14" fill="#5daa52" />
      <circle cx="52" cy="176" r="7" fill="#f9bcd8" />
      <circle cx="52" cy="176" r="3" fill="#ffd44a" />

      {/* Flower 2 */}
      <rect x="88" y="175" width="4" height="16" fill="#5daa52" />
      <circle cx="90" cy="173" r="8" fill="#c8aaee" />
      <circle cx="90" cy="173" r="3.5" fill="#ffd44a" />

      {/* Flower 3 */}
      <rect x="150" y="177" width="4" height="14" fill="#5daa52" />
      {[0,60,120,180,240,300].map(a => (
        <ellipse key={a} cx={152} cy={175} rx="4" ry="7" fill="#f9d040"
          transform={`rotate(${a} 152 175)`} />
      ))}
      <circle cx="152" cy="175" r="3.5" fill="#e8703a" />

      {/* Flower 4 */}
      <rect x="290" y="176" width="4" height="15" fill="#5daa52" />
      <circle cx="292" cy="174" r="8" fill="#f9bcd8" />
      <circle cx="292" cy="174" r="3.5" fill="#ffd44a" />

      {/* Flower 5 */}
      <rect x="360" y="178" width="4" height="14" fill="#5daa52" />
      {[0,60,120,180,240,300].map(a => (
        <ellipse key={a} cx={362} cy={176} rx="4" ry="7" fill="#b8aaee"
          transform={`rotate(${a} 362 176)`} />
      ))}
      <circle cx="362" cy="176" r="3.5" fill="#f9d040" />

      {/* Little house */}
      <rect x="178" y="130" width="64" height="58" fill="#f5e8d8" />
      <polygon points="170,135 210,102 250,135" fill="#e88878" />
      <rect x="195" y="152" width="16" height="22" rx="2" fill="#9b7248" />
      <rect x="205" y="138" width="14" height="14" rx="2" fill="#b8e0f8" />
      {/* Window shine */}
      <rect x="207" y="140" width="4" height="3" fill="white" opacity="0.6" rx="1" />
      {/* Chimney */}
      <rect x="228" y="108" width="10" height="22" fill="#c8a888" />
      {/* Smoke puffs */}
      <circle cx="233" cy="104" r="4" fill="white" opacity="0.5" />
      <circle cx="237" cy="98" r="5" fill="white" opacity="0.4" />
      <circle cx="231" cy="94" r="3" fill="white" opacity="0.3" />
    </svg>
  );
}

export function Landing() {
  const [, setLocation] = useLocation();
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [gardenCreated, setGardenCreated] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const createGarden = useCreateGarden();

  const handleCreate = async () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    try {
      await createGarden.mutateAsync({ code, name: "Our Little Garden" });
      setGardenCreated(code);
    } catch (err) {
      console.error("Failed to create", err);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.length === 6) {
      setIsJoining(true);
      setTimeout(() => setLocation(`/join/${joinCode.toUpperCase()}`), 400);
    }
  };

  const handleCopy = () => {
    if (gardenCreated) {
      navigator.clipboard.writeText(gardenCreated);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-4"
      style={{ background: 'linear-gradient(180deg, #c8e8f8 0%, #c4ddc0 60%, #6daa62 100%)' }}>

      {/* Pixel petals falling */}
      <FallingPetal className="petal-1 top-0" />
      <FallingPetal className="petal-2 top-0" />
      <FallingPetal className="petal-3 top-0" />
      <FallingPetal className="petal-4 top-0" />
      <FallingPetal className="petal-5 top-0" />
      <FallingPetal className="petal-6 top-0" />

      {/* Scene at bottom */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <SceneSVG />
      </div>

      {/* Main card */}
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="pixel-panel-rose bg-[#fdf8f4] p-7 flex flex-col items-center gap-6">
          {/* Title */}
          <div className="text-center space-y-1">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="text-4xl mb-1 leading-none select-none"
            >
              <svg width="56" height="56" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated', display:'inline-block' }}>
                <rect x="26" y="10" width="4" height="32" fill="#6daa62" />
                <ellipse cx="28" cy="14" rx="9" ry="9" fill="#f9bcd8" />
                <ellipse cx="21" cy="22" rx="6" ry="6" fill="#f9d8e8" />
                <ellipse cx="35" cy="22" rx="6" ry="6" fill="#f9d8e8" />
                <circle cx="28" cy="18" r="4" fill="#ffd44a" />
                <ellipse cx="28" cy="38" rx="8" ry="4" fill="#8ec48a" opacity="0.5" />
              </svg>
            </motion.div>
            <h1 className="font-display text-3xl text-[#7a2e43] leading-tight">Our Little Garden</h1>
            <p className="font-sans text-sm text-[#9d6070]">a cozy garden for two</p>
          </div>

          {!gardenCreated ? (
            <>
              {/* Create */}
              <button
                onClick={handleCreate}
                disabled={createGarden.isPending}
                data-testid="button-create-garden"
                className="pixel-btn w-full py-3 font-display text-lg bg-[#e07a8f] text-white rounded-none hover:bg-[#d05a72] transition-colors"
                style={{ borderRadius: '4px' }}
              >
                {createGarden.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : "Start a New Garden"}
              </button>

              <div className="flex items-center w-full gap-3">
                <div className="flex-1 h-px bg-[#e8d0d8]" />
                <span className="font-display text-xs text-[#c09aaa]">or join one</span>
                <div className="flex-1 h-px bg-[#e8d0d8]" />
              </div>

              {/* Join */}
              <form onSubmit={handleJoin} className="w-full flex gap-2">
                <input
                  type="text"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                  placeholder="GARDEN CODE"
                  data-testid="input-garden-code"
                  className="flex-1 px-3 py-2 font-pixel text-base tracking-widest text-[#7a2e43] bg-[#fdf0f3] border-2 border-[#e8aabf] focus:outline-none focus:border-[#e07a8f] text-center uppercase placeholder:text-[#c0a0b0] placeholder:text-xs placeholder:tracking-normal placeholder:font-display"
                  style={{ borderRadius: '4px' }}
                />
                <button
                  type="submit"
                  disabled={joinCode.length !== 6 || isJoining}
                  data-testid="button-join-garden"
                  className="pixel-btn px-4 py-2 bg-[#8ec48a] text-white font-display text-sm disabled:opacity-50"
                  style={{ borderRadius: '4px' }}
                >
                  {isJoining ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join"}
                </button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full space-y-4"
            >
              <div className="pixel-panel-rose bg-[#fdf0f4] p-4 text-center space-y-2">
                <p className="font-display text-xs text-[#c09aaa]">your garden code is</p>
                <p className="font-pixel text-3xl text-[#7a2e43] tracking-widest">{gardenCreated}</p>
                <p className="font-sans text-xs text-[#c09aaa]">share this with your person</p>
                <button
                  onClick={handleCopy}
                  className="pixel-btn mt-1 px-4 py-1.5 bg-[#fae8ed] text-[#7a2e43] font-display text-xs border border-[#e8aabf]"
                  style={{ borderRadius: '4px' }}
                >
                  {copied ? "Copied!" : "Copy Code"}
                </button>
              </div>
              <button
                onClick={() => setLocation(`/join/${gardenCreated}`)}
                data-testid="button-enter-garden"
                className="pixel-btn w-full py-3 bg-[#e07a8f] text-white font-display text-base"
                style={{ borderRadius: '4px' }}
              >
                Enter My Garden
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
