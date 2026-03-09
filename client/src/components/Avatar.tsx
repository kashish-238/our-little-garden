import { cn } from "@/lib/utils";

const COLOR_PALETTES: Record<string, { bg: string; ear: string; face: string; cheek: string }> = {
  blush:    { bg: "#f9d0d8", ear: "#f5afc0", face: "#fde8ed", cheek: "#f7a8be" },
  sage:     { bg: "#c9dfc5", ear: "#a8c9a2", face: "#e2f0df", cheek: "#a8c9a2" },
  lavender: { bg: "#d9d0ef", ear: "#c3b5e8", face: "#ece8f8", cheek: "#c3b5e8" },
  butter:   { bg: "#f7e5a0", ear: "#f0d060", face: "#fdf4d0", cheek: "#f0d060" },
  sky:      { bg: "#b8dce8", ear: "#8cc8dc", face: "#d8eef5", cheek: "#8cc8dc" },
};

function BunnyFace({ pal }: { pal: typeof COLOR_PALETTES.blush }) {
  return (
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated' }}>
      {/* Ears */}
      <rect x="16" y="4" width="8" height="18" rx="4" fill={pal.ear} />
      <rect x="40" y="4" width="8" height="18" rx="4" fill={pal.ear} />
      <rect x="18" y="6" width="4" height="12" rx="2" fill={pal.face} />
      <rect x="42" y="6" width="4" height="12" rx="2" fill={pal.face} />
      {/* Head */}
      <ellipse cx="32" cy="40" rx="22" ry="20" fill={pal.bg} />
      {/* Eyes */}
      <ellipse cx="24" cy="36" rx="4" ry="5" fill="#fff" />
      <ellipse cx="40" cy="36" rx="4" ry="5" fill="#fff" />
      <circle cx="25" cy="37" r="2.5" fill="#2c1a24" />
      <circle cx="41" cy="37" r="2.5" fill="#2c1a24" />
      <circle cx="26" cy="36" r="1" fill="#fff" />
      <circle cx="42" cy="36" r="1" fill="#fff" />
      {/* Nose */}
      <ellipse cx="32" cy="44" rx="3" ry="2" fill="#f5829e" />
      {/* Cheeks */}
      <ellipse cx="18" cy="43" rx="5" ry="3" fill={pal.cheek} opacity="0.6" />
      <ellipse cx="46" cy="43" rx="5" ry="3" fill={pal.cheek} opacity="0.6" />
      {/* Mouth */}
      <path d="M28 47 Q32 51 36 47" stroke="#f5829e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function FoxFace({ pal }: { pal: typeof COLOR_PALETTES.blush }) {
  return (
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated' }}>
      {/* Ears (triangular) */}
      <polygon points="14,22 20,4 30,22" fill={pal.ear} />
      <polygon points="34,22 44,4 50,22" fill={pal.ear} />
      <polygon points="17,20 20,8 28,20" fill={pal.face} />
      <polygon points="36,20 44,8 47,20" fill={pal.face} />
      {/* Head */}
      <ellipse cx="32" cy="40" rx="22" ry="20" fill={pal.bg} />
      {/* Muzzle */}
      <ellipse cx="32" cy="46" rx="10" ry="7" fill={pal.face} />
      {/* Eyes */}
      <ellipse cx="24" cy="37" rx="4" ry="4" fill="#fff" />
      <ellipse cx="40" cy="37" rx="4" ry="4" fill="#fff" />
      <circle cx="25" cy="38" r="2.5" fill="#2c1a24" />
      <circle cx="41" cy="38" r="2.5" fill="#2c1a24" />
      <circle cx="26" cy="37" r="1" fill="#fff" />
      <circle cx="42" cy="37" r="1" fill="#fff" />
      {/* Nose */}
      <ellipse cx="32" cy="44" rx="3" ry="2.5" fill="#2c1a24" />
      {/* Cheeks */}
      <ellipse cx="17" cy="43" rx="4" ry="3" fill={pal.cheek} opacity="0.55" />
      <ellipse cx="47" cy="43" rx="4" ry="3" fill={pal.cheek} opacity="0.55" />
      {/* Mouth */}
      <path d="M28 47 Q32 51 36 47" stroke="#2c1a24" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function CatFace({ pal }: { pal: typeof COLOR_PALETTES.blush }) {
  return (
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated' }}>
      {/* Ears */}
      <polygon points="14,26 18,6 28,24" fill={pal.ear} />
      <polygon points="36,24 46,6 50,26" fill={pal.ear} />
      <polygon points="16,24 18,10 26,24" fill={pal.face} />
      <polygon points="38,24 46,10 48,24" fill={pal.face} />
      {/* Head */}
      <ellipse cx="32" cy="40" rx="22" ry="20" fill={pal.bg} />
      {/* Eyes (cat-like) */}
      <ellipse cx="24" cy="37" rx="5" ry="4" fill="#fff" />
      <ellipse cx="40" cy="37" rx="5" ry="4" fill="#fff" />
      <ellipse cx="25" cy="37" rx="2" ry="3.5" fill="#2c1a24" />
      <ellipse cx="41" cy="37" rx="2" ry="3.5" fill="#2c1a24" />
      <circle cx="25" cy="36" r="1" fill="#fff" />
      <circle cx="41" cy="36" r="1" fill="#fff" />
      {/* Nose */}
      <polygon points="32,43 29,46 35,46" fill="#f5829e" />
      {/* Whiskers */}
      <line x1="10" y1="44" x2="25" y2="46" stroke="#aaa" strokeWidth="1" />
      <line x1="10" y1="47" x2="25" y2="47" stroke="#aaa" strokeWidth="1" />
      <line x1="39" y1="46" x2="54" y2="44" stroke="#aaa" strokeWidth="1" />
      <line x1="39" y1="47" x2="54" y2="47" stroke="#aaa" strokeWidth="1" />
      {/* Cheeks */}
      <ellipse cx="18" cy="44" rx="4" ry="3" fill={pal.cheek} opacity="0.55" />
      <ellipse cx="46" cy="44" rx="4" ry="3" fill={pal.cheek} opacity="0.55" />
      {/* Mouth */}
      <path d="M29 47 Q32 51 35 47" stroke="#f5829e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function BearFace({ pal }: { pal: typeof COLOR_PALETTES.blush }) {
  return (
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated' }}>
      {/* Round ears */}
      <circle cx="16" cy="22" r="10" fill={pal.ear} />
      <circle cx="48" cy="22" r="10" fill={pal.ear} />
      <circle cx="16" cy="22" r="6" fill={pal.face} />
      <circle cx="48" cy="22" r="6" fill={pal.face} />
      {/* Head */}
      <ellipse cx="32" cy="40" rx="22" ry="20" fill={pal.bg} />
      {/* Muzzle */}
      <ellipse cx="32" cy="47" rx="11" ry="8" fill={pal.face} />
      {/* Eyes */}
      <ellipse cx="24" cy="37" rx="4" ry="4" fill="#fff" />
      <ellipse cx="40" cy="37" rx="4" ry="4" fill="#fff" />
      <circle cx="25" cy="38" r="2.5" fill="#2c1a24" />
      <circle cx="41" cy="38" r="2.5" fill="#2c1a24" />
      <circle cx="26" cy="37" r="1" fill="#fff" />
      <circle cx="42" cy="37" r="1" fill="#fff" />
      {/* Nose */}
      <ellipse cx="32" cy="44" rx="4" ry="3" fill="#2c1a24" />
      {/* Cheeks */}
      <ellipse cx="17" cy="44" rx="4" ry="3" fill={pal.cheek} opacity="0.55" />
      <ellipse cx="47" cy="44" rx="4" ry="3" fill={pal.cheek} opacity="0.55" />
      {/* Mouth */}
      <path d="M28 48 Q32 53 36 48" stroke="#2c1a24" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

const FACE_MAP: Record<string, (pal: typeof COLOR_PALETTES.blush) => JSX.Element> = {
  bunny: (p) => <BunnyFace pal={p} />,
  fox:   (p) => <FoxFace   pal={p} />,
  cat:   (p) => <CatFace   pal={p} />,
  bear:  (p) => <BearFace  pal={p} />,
};

const SIZE_MAP = {
  sm:  "w-9 h-9",
  md:  "w-14 h-14",
  lg:  "w-20 h-20",
  xl:  "w-28 h-28",
};

interface AvatarProps {
  id: string;
  color: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}

export function Avatar({ id, color, size = "md", className, onClick, selected }: AvatarProps) {
  const pal = COLOR_PALETTES[color] || COLOR_PALETTES.blush;
  const face = FACE_MAP[id] || FACE_MAP.bunny;

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative flex-shrink-0 rounded-md overflow-hidden transition-all duration-200",
        SIZE_MAP[size],
        onClick && "cursor-pointer hover:scale-110",
        selected && "ring-4 ring-offset-2 ring-offset-background ring-primary scale-110",
        className
      )}
      style={{ background: pal.bg }}
    >
      {face(pal)}
      {selected && (
        <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full border-2 border-white flex items-center justify-center">
          <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
}
