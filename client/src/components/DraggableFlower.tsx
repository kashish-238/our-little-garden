import { useState } from "react";
import { motion } from "framer-motion";
import type { Flower } from "@shared/routes";

interface DraggableFlowerProps {
  flower: Flower;
  containerRef: React.RefObject<HTMLDivElement>;
  onDrop: (flowerId: number, x: number, y: number) => void;
  isDraggable?: boolean;
}

export function DraggableFlower({ flower, containerRef, onDrop, isDraggable = true }: DraggableFlowerProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    if (!containerRef.current || !isDraggable) return;

    // Check if dropped inside the garden container
    const containerRect = containerRef.current.getBoundingClientRect();
    const dropX = info.point.x;
    const dropY = info.point.y;

    if (
      dropX >= containerRect.left &&
      dropX <= containerRect.right &&
      dropY >= containerRect.top &&
      dropY <= containerRect.bottom
    ) {
      // Calculate percentage position
      const xPercent = Math.round(((dropX - containerRect.left) / containerRect.width) * 100);
      const yPercent = Math.round(((dropY - containerRect.top) / containerRect.height) * 100);
      
      // Keep within bounds somewhat
      const safeX = Math.max(5, Math.min(95, xPercent));
      const safeY = Math.max(5, Math.min(95, yPercent));
      
      onDrop(flower.id, safeX, safeY);
    }
  };

  if (flower.inGarden) {
    // Rendered absolutely inside the garden
    return (
      <motion.div
        className="absolute w-24 h-24 origin-center cursor-grab active:cursor-grabbing z-10"
        style={{ 
          left: `${flower.x}%`, 
          top: `${flower.y}%`,
          x: '-50%',
          y: '-50%'
        }}
        drag={isDraggable}
        dragConstraints={containerRef}
        dragElastic={0.2}
        whileHover={isDraggable ? { scale: 1.1, rotate: flower.rotation || 0 + 5 } : {}}
        whileDrag={{ scale: 1.2, zIndex: 50, rotate: 10 }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: parseFloat(flower.scale?.toString() || '1'), opacity: 1, rotate: flower.rotation || 0 }}
        transition={{ type: "spring", bounce: 0.5 }}
      >
        <img 
          src={flower.imageUrl} 
          alt="Flower" 
          className="w-full h-full object-contain filter drop-shadow-md pointer-events-none"
        />
      </motion.div>
    );
  }

  // Rendered in the library (relative)
  return (
    <motion.div
      className="relative w-20 h-20 bg-white/50 rounded-xl p-2 cursor-grab active:cursor-grabbing hover:bg-white/80 transition-colors z-20"
      drag={isDraggable}
      dragSnapToOrigin={true} // Snaps back if not dropped in garden
      whileHover={{ scale: 1.05 }}
      whileDrag={{ scale: 1.2, zIndex: 50 }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      layoutId={`flower-${flower.id}`}
    >
      <img 
        src={flower.imageUrl} 
        alt="Flower" 
        className="w-full h-full object-contain filter drop-shadow-sm pointer-events-none"
      />
    </motion.div>
  );
}
