"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import Image from "next/image";
import { TarotCard as TarotCardType } from "@/types/tarot";
import { cn } from "@/lib/utils";

interface TarotCardProps {
  card: TarotCardType;
  isFlipped?: boolean;
  isReversed?: boolean;
  onFlip?: () => void;
  className?: string;
  draggable?: boolean;
}

export const TarotCard = ({
  card,
  isFlipped = false,
  isReversed = false,
  onFlip,
  className,
  draggable = true,
}: TarotCardProps) => {
  const [hovered, setHovered] = useState(false);
  
  // Motion values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(0, { stiffness: 300, damping: 30 });
  const rotateY = useSpring(0, { stiffness: 300, damping: 30 });
  const scale = useSpring(1, { stiffness: 300, damping: 30 });

  useEffect(() => {
    scale.set(hovered ? 1.05 : 1);
  }, [hovered, scale]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hovered) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const moveX = (e.clientX - centerX) / 10;
    const moveY = (e.clientY - centerY) / 10;
    
    rotateX.set(-moveY);
    rotateY.set(moveX);
  };

  const handleHoverStart = () => {
    setHovered(true);
  };

  const handleHoverEnd = () => {
    setHovered(false);
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      drag={draggable}
      dragConstraints={draggable ? { top: 0, left: 0, right: 0, bottom: 0 } : undefined}
      dragElastic={draggable ? 0.6 : 0}
      style={{
        x,
        y,
        rotateX,
        rotateY,
        scale,
        rotateZ: isReversed ? 180 : 0,
        perspective: 1000,
        transformStyle: "preserve-3d",
      }}
      className={cn(
        "relative w-56 h-96 select-none transition-shadow duration-500",
        draggable ? "cursor-pointer" : onFlip ? "cursor-pointer" : "cursor-default",
        hovered ? "eastern-shadow" : "shadow-sm",
        className
      )}
      onClick={onFlip}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        className="w-full h-full relative preserve-3d"
      >
        {/* Card Back (Visible when not flipped) */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden rounded-xl border border-black/[0.06] bg-white flex items-center justify-center overflow-hidden"
          style={{ transform: "translateZ(1px)" }}
        >
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')]" />
          
          <div className="w-[88%] h-[94%] border border-black/[0.08] rounded-lg flex flex-col items-center justify-center bg-zinc-50/30 relative">
             <div className="absolute inset-4 border border-black/[0.03] rounded-sm" />
             
             <div className="w-16 h-16 rounded-full border border-black/10 flex items-center justify-center relative">
                <div className="w-12 h-12 rounded-full border border-black/5" />
                <div className="absolute w-full h-px bg-black/[0.05] rotate-45" />
                <div className="absolute w-full h-px bg-black/[0.05] -rotate-45" />
             </div>
             
             <div className="absolute bottom-10 text-[8px] tracking-[0.4em] uppercase text-black/20 font-sans">
               Lumin Divine
             </div>
          </div>
          
          {/* Decorative corners */}
          <div className="absolute top-6 left-6 w-3 h-3 border-t border-l border-black/20" />
          <div className="absolute top-6 right-6 w-3 h-3 border-t border-r border-black/20" />
          <div className="absolute bottom-6 left-6 w-3 h-3 border-b border-l border-black/20" />
          <div className="absolute bottom-6 right-6 w-3 h-3 border-b border-r border-black/20" />
        </div>

        {/* Card Front (Visible when flipped) */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden rounded-xl border border-black/[0.08] bg-white flex flex-col items-center justify-center overflow-hidden"
          style={{ transform: "rotateY(180deg) translateZ(1px)" }}
        >
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')]" z-index="20" />
          
          <div className="relative w-full h-full">
             {card.image ? (
               <Image 
                 src={card.image} 
                 alt={card.name} 
                 fill 
                 className="object-cover"
                 sizes="(max-width: 768px) 100vw, 224px"
                 priority={true}
               />
             ) : (
               <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-50 p-4 text-center">
                 <span className="text-4xl font-serif italic text-black/80 mb-2">{card.value}</span>
                 <span className="text-sm font-serif text-black/60">{card.name}</span>
               </div>
             )}
          </div>

          {/* Optional: Subtle overlay for texture or aging effect */}
          <div className="absolute inset-0 bg-amber-50/10 pointer-events-none mix-blend-multiply" />
        </div>
      </motion.div>
    </motion.div>
  );
};
