import React, { useState } from "react";
import { motion, PanInfo } from "framer-motion";
import { useStore } from "@/store/useStore";
import { getTranslation } from "@/lib/i18n";

export function InteractiveDeck() {
  const { placedCards, placeCard, selectedSpread, deck, language } = useStore();
  const t = getTranslation(language);
  const [isHovered, setIsHovered] = useState(false);

  // If spread is full, hide deck? Or just disable.
  const isFull = selectedSpread && Object.keys(placedCards).length >= selectedSpread.positions.length;

  if (isFull) return null;

  const handleDragEnd = (index: number, info: PanInfo) => {
    // Find if dropped on a slot
    const elements = document.elementsFromPoint(info.point.x, info.point.y);
    const slotElement = elements.find((el) => el.id.startsWith("slot-"));
    
    if (slotElement) {
      const slotId = slotElement.id.replace("slot-", "");
      
      // Check if slot is already filled
      if (!placedCards[slotId]) {
        // Get the specific card from the deck
        const cardToPlace = deck[index];
        if (cardToPlace) {
           placeCard(cardToPlace.card, slotId, cardToPlace.isReversed);
        }
      }
    }
  };

  // Only render a subset for performance and visual clarity
  // Since deck is shuffled, taking the first N is effectively random cards
  const visibleCards = deck.slice(0, 24);

  return (
    <div 
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-end justify-center h-48 w-full max-w-4xl perspective-1000 pointer-events-none"
    >
      <div 
        className="relative w-full h-full flex items-center justify-center pointer-events-auto"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {visibleCards.map((_, index) => {
            // Calculate position in fan
            const total = visibleCards.length;
            const center = (total - 1) / 2;
            const offset = index - center;
            
            // Fan logic
            const rotate = offset * 2; // Degrees
            const x = offset * 15; // Horizontal spacing
            const y = Math.abs(offset) * 2; // Arch effect

            return (
              <motion.div
                key={deck[index].card.id} // Use stable ID from actual card
                drag
                dragSnapToOrigin
                whileDrag={{ scale: 1.1, zIndex: 100 }}
                onDragEnd={(_, info) => handleDragEnd(index, info)}
                initial={false}
                animate={{
                    rotate: isHovered ? rotate : 0,
                    x: isHovered ? x : 0,
                    y: isHovered ? y : index * -0.5, // Stack effect when not hovered
                    zIndex: index
                }}
                className="absolute w-28 h-48 bg-white rounded-lg shadow-lg border border-black/10 cursor-grab active:cursor-grabbing hover:-translate-y-4 transition-colors"
                style={{
                    transformOrigin: "bottom center",
                }}
              >
                 {/* Card Back Design */}
                 <div className="absolute inset-1 border border-black/5 rounded flex items-center justify-center bg-zinc-50">
                    <div className="w-8 h-8 rounded-full border border-black/5 opacity-50" />
                 </div>
              </motion.div>
            );
        })}
         
         {/* Hint Text */}
         <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-center pointer-events-none">
             <p className="text-[10px] uppercase tracking-widest text-black/40 bg-white/80 px-3 py-1 rounded-full backdrop-blur">
                 {t.deck.drag_instruction}
             </p>
         </div>
      </div>
    </div>
  );
}
