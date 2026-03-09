import { cn } from "@/lib/utils";

const AVATAR_EMOJIS: Record<string, string> = {
  bunny: "🐰",
  fox: "🦊",
  cat: "🐱",
  bear: "🐻"
};

const COLOR_MAP: Record<string, string> = {
  blush: "bg-[#E6B8B8] text-rose-900 border-[#D28A8A]",
  sage: "bg-[#8FA286] text-emerald-950 border-[#7a8c72]",
  lavender: "bg-[#C3B8D9] text-indigo-950 border-[#a99bc4]",
  butter: "bg-[#F3E5AB] text-amber-950 border-[#e3d391]",
  sky: "bg-[#AEC6CF] text-sky-950 border-[#95b2bc]"
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
  const emoji = AVATAR_EMOJIS[id] || "🌱";
  const colorClass = COLOR_MAP[color] || COLOR_MAP.blush;
  
  const sizeClasses = {
    sm: "w-10 h-10 text-xl border-2",
    md: "w-14 h-14 text-3xl border-[3px]",
    lg: "w-20 h-20 text-4xl border-4",
    xl: "w-28 h-28 text-6xl border-4"
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative rounded-full flex items-center justify-center cursor-default transition-all duration-300",
        colorClass,
        sizeClasses[size],
        onClick && "cursor-pointer hover:scale-110 hover:-translate-y-1 shadow-lg",
        selected && "ring-4 ring-offset-4 ring-offset-background ring-amber-400 scale-110 shadow-xl",
        !selected && onClick && "hover:shadow-xl",
        className
      )}
    >
      <span className="drop-shadow-sm select-none">{emoji}</span>
      {selected && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
}
