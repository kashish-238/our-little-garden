import { useRef, useState, useEffect } from "react";
import { Paintbrush, Eraser, Undo, Save, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DrawingStudioProps {
  onSave: (base64: string) => void;
  isSaving: boolean;
}

const COLORS = [
  "#2d3748", "#ef4444", "#f97316", "#f59e0b", "#84cc16", 
  "#10b981", "#06b6d4", "#3b82f6", "#8b5cf6", "#d946ef", "#f43f5e"
];

export function DrawingStudio({ onSave, isSaving }: DrawingStudioProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(4);
  const [tool, setTool] = useState<"brush" | "eraser">("brush");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Fill background with transparent or white initially
    ctx.fillStyle = "rgba(255,255,255,0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Smooth lines
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    ctx.beginPath();
    
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;
    
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color; // If eraser, draw white (or use globalCompositeOperation='destination-out' for true transparent)
    if (tool === "eraser") {
       ctx.globalCompositeOperation = "destination-out";
       ctx.lineWidth = size * 3;
       ctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
       ctx.globalCompositeOperation = "source-over";
       ctx.lineWidth = size;
       ctx.strokeStyle = color;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onSave(dataUrl);
    clearCanvas();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative bg-white rounded-2xl overflow-hidden shadow-inner border-2 border-border/50">
        <canvas
          ref={canvasRef}
          width={320}
          height={320}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-auto cursor-crosshair touch-none bg-[url('https://www.transparenttextures.com/patterns/paper.png')]"
          style={{ maxWidth: '320px' }}
        />
      </div>

      <div className="flex flex-col gap-3 p-4 glass-panel rounded-2xl">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setTool("brush")}
              className={cn("p-2 rounded-xl transition-all", tool === "brush" ? "bg-primary text-primary-foreground shadow-md" : "bg-white text-muted-foreground hover:bg-muted")}
            >
              <Paintbrush className="w-5 h-5" />
            </button>
            <button
              onClick={() => setTool("eraser")}
              className={cn("p-2 rounded-xl transition-all", tool === "eraser" ? "bg-primary text-primary-foreground shadow-md" : "bg-white text-muted-foreground hover:bg-muted")}
            >
              <Eraser className="w-5 h-5" />
            </button>
            <button
              onClick={clearCanvas}
              className="p-2 rounded-xl bg-white text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
          
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="rounded-full font-bold bg-amber-400 hover:bg-amber-500 text-amber-950 shadow-md shadow-amber-900/10"
          >
            {isSaving ? "Planting..." : <><Save className="w-4 h-4 mr-2" /> Plant Flower</>}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => { setColor(c); setTool("brush"); }}
              className={cn(
                "w-6 h-6 rounded-full transition-transform hover:scale-110",
                color === c && tool === "brush" ? "scale-125 shadow-sm ring-2 ring-offset-2 ring-primary" : "shadow-sm"
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
