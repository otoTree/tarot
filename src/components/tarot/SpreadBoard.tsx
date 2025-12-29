import { useRef, useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { TarotCard } from "@/components/tarot/card";
import { CardDetailModal } from "@/components/tarot/CardDetailModal";
import { getCard } from "@/lib/i18n";
import { TarotCard as TarotCardType, Spread } from "@/types/tarot";

export function SpreadBoard() {
  const { selectedSpread, placedCards, language } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedCard, setSelectedCard] = useState<{ card: TarotCardType; isReversed: boolean } | null>(null);
  const [currentSpread, setCurrentSpread] = useState<Spread | null>(selectedSpread);

  useEffect(() => {
    if (selectedSpread) {
      fetch(`/api/spreads?lang=${language}`)
        .then(res => res.json())
        .then(spreads => {
          const match = spreads.find((s: Spread) => s.id === selectedSpread.id);
          if (match) setCurrentSpread(match);
        });
    }
  }, [selectedSpread, language]);

  if (!currentSpread) return null;

  const isSpreadComplete = currentSpread.positions.every(p => placedCards[p.id]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-[4/3] max-w-4xl mx-auto my-8"
    >
      {/* Background Pattern - Clean White */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-200 via-transparent to-transparent" />
      
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
              "absolute inset-0 border-2 border-dashed rounded-xl transition-all duration-500",
              placed 
                ? "border-transparent opacity-0" 
                : "border-slate-200 group-hover:border-slate-300 bg-slate-50/50 backdrop-blur-sm"
            )}>
              <div className="absolute inset-0 flex items-center justify-center text-center p-4">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-serif font-bold group-hover:text-slate-600 transition-colors">
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
                    isFlipped={isSpreadComplete}
                    isReversed={placed.isReversed}
                    onFlip={() => {
                        if (isSpreadComplete) {
                            setSelectedCard({ card: placed.card, isReversed: placed.isReversed });
                            if (navigator.vibrate) navigator.vibrate(5);
                        }
                    }}
                    draggable={false}
                    className={cn(
                        "w-full h-full !shadow-lg hover:!shadow-xl transition-shadow ring-1 ring-slate-900/5",
                        isSpreadComplete && "cursor-pointer"
                    )}
                  />
                  {/* Label below card */}
                  <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-48 text-center flex flex-col gap-1 items-center z-20 pointer-events-none">
                    <span className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold bg-white/90 backdrop-blur px-2 py-0.5 rounded-full shadow-sm border border-slate-100">
                        {pos.name}
                    </span>
                    {isSpreadComplete && (
                      <span className="text-xs font-serif text-slate-900 bg-white/95 backdrop-blur px-3 py-1 rounded-lg shadow-sm border border-slate-200 whitespace-nowrap">
                          {cardData?.name} {placed.isReversed && <span className="text-red-900/60 italic ml-1 text-[10px]">{language === 'zh' ? '(逆位)' : '(Rev.)'}</span>}
                      </span>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Card Detail Modal */}
      {selectedCard && (() => {
        const translatedCard = getCard(selectedCard.card.id, language);
        return (
          <CardDetailModal
            card={translatedCard}
            isReversed={selectedCard.isReversed}
            isOpen={!!selectedCard}
            onClose={() => setSelectedCard(null)}
            language={language}
          />
        );
      })()}
    </div>
  );
}
