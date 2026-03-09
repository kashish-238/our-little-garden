import { useRef, useState, useEffect, useCallback } from "react";
import { Paintbrush, Eraser, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface DrawingStudioProps {
  onSave: (base64: string) => void;
  isSaving: boolean;
}

const PALETTE = [
  "#fdf8f4", "#f9bcd8", "#f07a9a", "#e87040",
  "#f0d060", "#8ec48a", "#4aaa5a", "#7ac8e0",
  "#4890c0", "#c0a8e8", "#8058b8", "#c09090",
  "#905848", "#303030", "#ffffff", "#f5d8a0",
];

export function DrawingStudio({ onSave, isSaving }: DrawingStudioProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState<{x:number,y:number}|null>(null);
  const [color, setColor] = useState(PALETTE[1]);
  const [size, setSize] = useState(5);
  const [tool, setTool] = useState<"brush" | "eraser">("brush");
  const [history, setHistory] = useState<ImageData[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: ((e as React.MouseEvent).clientX - rect.left) * scaleX,
      y: ((e as React.MouseEvent).clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Save state for undo
    setHistory(prev => [...prev.slice(-19), ctx.getImageData(0, 0, canvas.width, canvas.height)]);
    setIsDrawing(true);
    const pos = getPos(e, canvas);
    setLastPos(pos);
    // Draw a dot at start
    ctx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, (tool === "eraser" ? size * 2.5 : size) / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !lastPos) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
    ctx.strokeStyle = tool === "eraser" ? "rgba(0,0,0,1)" : color;
    ctx.lineWidth = tool === "eraser" ? size * 2.5 : size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setLastPos(pos);
  };

  const stopDrawing = () => { setIsDrawing(false); setLastPos(null); };

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHistory([]);
  }, []);

  const undo = useCallback(() => {
    if (history.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const prev = history[history.length - 1];
    ctx.putImageData(prev, 0, 0);
    setHistory(h => h.slice(0, -1));
  }, [history]);

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onSave(dataUrl);
    clearCanvas();
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Canvas */}
      <div style={{
        border: '3px solid #e8d0d8', boxShadow: '3px 3px 0 #e8d0d8', borderRadius: '4px', overflow: 'hidden',
        backgroundImage: 'repeating-conic-gradient(#e8d8dc 0% 25%, #fdf8fa 0% 50%)',
        backgroundSize: '16px 16px',
      }}>
        <canvas
          ref={canvasRef}
          width={280}
          height={200}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-auto touch-none"
          style={{ cursor: tool === "eraser" ? "cell" : "crosshair", display: 'block', imageRendering: 'pixelated' }}
        />
      </div>

      {/* Toolbar */}
      <div style={{ border: '3px solid #e8d0d8', boxShadow: '3px 3px 0 #e8d0d8', borderRadius: '4px', background: '#fdf8f4', padding: '10px' }}>
        {/* Tools row */}
        <div className="flex items-center gap-2 mb-3">
          {/* Brush */}
          <button
            onClick={() => setTool("brush")}
            data-testid="button-tool-brush"
            className={cn("p-1.5 transition-all font-display text-xs flex items-center gap-1",
              tool === "brush"
                ? "bg-[#e07a8f] text-white"
                : "bg-[#fde8ed] text-[#9d6070]")}
            style={{ border: '2px solid #e8d0d8', borderRadius: '4px' }}
          >
            <Paintbrush className="w-3.5 h-3.5" />
          </button>

          {/* Eraser */}
          <button
            onClick={() => setTool("eraser")}
            data-testid="button-tool-eraser"
            className={cn("p-1.5 transition-all",
              tool === "eraser"
                ? "bg-[#8ec48a] text-white"
                : "bg-[#e8f5e4] text-[#5a8a56]")}
            style={{ border: '2px solid #a3be99', borderRadius: '4px' }}
          >
            <Eraser className="w-3.5 h-3.5" />
          </button>

          {/* Undo */}
          <button
            onClick={undo}
            disabled={history.length === 0}
            data-testid="button-undo"
            className="p-1.5 bg-[#fdf0f8] text-[#b070a0] disabled:opacity-40"
            style={{ border: '2px solid #e0b8d8', borderRadius: '4px' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 7v6h6" />
              <path d="M3 13a9 9 0 1 0 3-6.3L3 10" />
            </svg>
          </button>

          {/* Clear */}
          <button
            onClick={clearCanvas}
            data-testid="button-clear"
            className="p-1.5 bg-[#fde8ed] text-[#e07a8f]"
            style={{ border: '2px solid #e8c0c8', borderRadius: '4px' }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Brush size */}
          <div className="flex items-center gap-1 ml-auto">
            {[3, 6, 10, 16].map(s => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={cn("flex items-center justify-center w-6 h-6 rounded-full transition-all",
                  size === s ? "bg-[#e07a8f] border-2 border-[#c05070]" : "bg-[#fde8ed] border-2 border-[#e8d0d8]"
                )}
              >
                <div
                  className="rounded-full bg-current"
                  style={{ width: `${Math.min(s * 0.6 + 2, 12)}px`, height: `${Math.min(s * 0.6 + 2, 12)}px`,
                    background: size === s ? 'white' : color }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Palette */}
        <div className="grid grid-cols-8 gap-1 mb-3">
          {PALETTE.map(c => (
            <button
              key={c}
              onClick={() => { setColor(c); setTool("brush"); }}
              className={cn("w-full aspect-square transition-transform",
                color === c && tool === "brush" ? "scale-125 z-10 relative" : "hover:scale-110"
              )}
              style={{
                backgroundColor: c,
                border: color === c && tool === "brush" ? '2px solid #2c1a24' : '1.5px solid rgba(0,0,0,0.15)',
                borderRadius: '2px',
                boxShadow: color === c && tool === "brush" ? '2px 2px 0 rgba(0,0,0,0.2)' : '1px 1px 0 rgba(0,0,0,0.1)',
              }}
            />
          ))}
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          data-testid="button-plant-flower"
          className="w-full py-2 font-display text-sm text-white disabled:opacity-60 flex items-center justify-center gap-2"
          style={{
            background: '#8ec48a',
            border: '2px solid #6aa866',
            boxShadow: '3px 3px 0 #6aa866',
            borderRadius: '4px',
          }}
        >
          {isSaving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Planting...</>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated' }}>
                <rect x="26" y="20" width="4" height="24" fill="white" />
                <ellipse cx="28" cy="20" rx="8" ry="8" fill="white" opacity="0.8" />
                <circle cx="28" cy="23" r="3.5" fill="#ffd44a" />
              </svg>
              Plant This Flower
            </>
          )}
        </button>
      </div>
    </div>
  );
}
