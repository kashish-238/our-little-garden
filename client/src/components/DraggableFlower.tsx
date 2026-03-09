import { useState } from "react";
import { motion } from "framer-motion";
import type { Flower } from "@shared/schema";

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

    const containerRect = containerRef.current.getBoundingClientRect();
    const dropX = info.point.x;
    const dropY = info.point.y;

    if (
      dropX >= containerRect.left &&
      dropX <= containerRect.right &&
      dropY >= containerRect.top &&
      dropY <= containerRect.bottom
    ) {
      const xPercent = Math.round(((dropX - containerRect.left) / containerRect.width) * 100);
      const yPercent = Math.round(((dropY - containerRect.top) / containerRect.height) * 100);
      const safeX = Math.max(5, Math.min(93, xPercent));
      const safeY = Math.max(5, Math.min(93, yPercent));
      onDrop(flower.id, safeX, safeY);
    }
  };

  if (flower.inGarden) {
    return (
      <motion.div
        className="absolute origin-center z-10"
        style={{
          left: `${flower.x}%`,
          top: `${flower.y}%`,
          x: '-50%',
          y: '-50%',
          width: 80,
          height: 80,
          cursor: isDraggable ? 'grab' : 'default',
        }}
        drag={isDraggable}
        dragConstraints={containerRef}
        dragElastic={0.15}
        whileHover={isDraggable ? { scale: 1.12, filter: 'drop-shadow(3px 3px 0 rgba(0,0,0,0.2))' } : {}}
        whileDrag={{ scale: 1.22, zIndex: 50, filter: 'drop-shadow(4px 4px 0 rgba(0,0,0,0.25))' }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: parseFloat(flower.scale?.toString() || '1'),
          opacity: 1,
          rotate: flower.rotation || 0,
        }}
        transition={{ type: "spring", bounce: 0.55, duration: 0.5 }}
      >
        <img
          src={flower.imageUrl}
          alt="Flower"
          className="w-full h-full object-contain pointer-events-none"
          style={{ imageRendering: 'pixelated' }}
        />
      </motion.div>
    );
  }

  // Library view
  return (
    <motion.div
      className="relative cursor-grab active:cursor-grabbing z-20 flex items-center justify-center"
      style={{
        width: 64,
        height: 64,
        background: '#fde8ed',
        border: '2px solid #e8c0c8',
        boxShadow: '2px 2px 0 #e8c0c8',
        borderRadius: '4px',
        padding: 4,
      }}
      drag={isDraggable}
      dragSnapToOrigin
      whileHover={{ scale: 1.08, boxShadow: '3px 3px 0 #e07a8f' }}
      whileDrag={{ scale: 1.18, zIndex: 50, boxShadow: '4px 4px 0 #e07a8f' }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
    >
      <img
        src={flower.imageUrl}
        alt="Flower"
        className="w-full h-full object-contain pointer-events-none"
        style={{ imageRendering: 'pixelated' }}
      />
    </motion.div>
  );
}
