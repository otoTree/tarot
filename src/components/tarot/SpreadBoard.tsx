import { useRef } from "react";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { TarotCard } from "@/components/tarot/card";
import { getSpread, getCard } from "@/lib/i18n";

export function SpreadBoard() {
  const { selectedSpread, placedCards, language } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const currentSpread = selectedSpread ? getSpread(selectedSpread.id, language) : null;

  if (!currentSpread) return null;

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-[4/3] max-w-4xl mx-auto bg-white/30 backdrop-blur-sm rounded-3xl overflow-hidden my-8"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black via-transparent to-transparent" />
      
      {/* Slots */}
      {currentSpread.positions.map((pos) => {
        const placed = placedCards[pos.id];
        const cardData = placed ? getCard(placed.card.id, language) : null;
        
        return (
          <div
            key={pos.id}
            id={`slot-${pos.id}`}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center group"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              width: "140px", 
              height: "240px", 
            }}
          >
            {/* Slot Marker */}
            <div className={cn(
              "absolute inset-0 border-2 border-dashed rounded-xl transition-all duration-300",
              placed 
                ? "border-transparent opacity-0" 
                : "border-black/10 group-hover:border-black/20 bg-white/20"
            )}>
              <div className="absolute inset-0 flex items-center justify-center text-center p-4">
                <span className="text-[10px] uppercase tracking-widest text-black/30 font-semibold">
                  {pos.name}
                </span>
              </div>
            </div>

            {/* Placed Card */}
            <AnimatePresence>
              {placed && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative z-10 w-full h-full"
                >
                  <TarotCard 
                    card={placed.card} 
                    isFlipped={true}
                    isReversed={placed.isReversed}
                    className={cn(
                        "w-full h-full !shadow-md hover:!shadow-lg transition-shadow"
                    )}
                  />
                  {/* Label below card */}
                  <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-48 text-center flex flex-col gap-1 items-center z-20 pointer-events-none">
                    <span className="text-[9px] uppercase tracking-widest text-black/40 font-semibold bg-white/90 backdrop-blur px-2 py-0.5 rounded-full shadow-sm border border-black/5">
                        {pos.name}
                    </span>
                    <span className="text-xs font-serif text-black/80 bg-white/90 backdrop-blur px-3 py-1 rounded-lg shadow-sm border border-black/5 whitespace-nowrap">
                        {cardData?.name} {placed.isReversed && <span className="text-red-900/60 italic ml-1 text-[10px]">{language === 'zh' ? '(逆位)' : '(Rev.)'}</span>}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
