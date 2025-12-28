"use client";

import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { SpreadPosition, Spread } from "@/types/tarot";
import { getTranslation } from "@/lib/i18n";
import { useState, useEffect } from "react";
import { Star } from "lucide-react";

const SpreadPreview = ({ positions }: { positions: SpreadPosition[] }) => {
  return (
    <div className="relative w-full aspect-[4/3] bg-black/[0.02] rounded-md border border-black/5 overflow-hidden pointer-events-none">
      {positions.map((pos) => (
        <div
          key={pos.id}
          className="absolute w-[18%] h-[28%] bg-white border border-black/10 shadow-sm rounded-[2px]"
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </div>
  );
};

const DifficultyBadge = ({ difficulty, language }: { difficulty?: 'beginner' | 'easy' | 'medium' | 'advanced', language: 'en' | 'zh' }) => {
  if (!difficulty) return null;

  const t = getTranslation(language);

  const config = {
    beginner: { label: t.spreadSelector.difficulty.beginner, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    easy: { label: t.spreadSelector.difficulty.easy, color: "bg-blue-50 text-blue-700 border-blue-200" },
    medium: { label: t.spreadSelector.difficulty.medium, color: "bg-amber-50 text-amber-700 border-amber-200" },
    advanced: { label: t.spreadSelector.difficulty.advanced, color: "bg-purple-50 text-purple-700 border-purple-200" },
  };

  const { label, color } = config[difficulty];

  return (
    <span className={cn(
      "text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border font-medium",
      color
    )}>
      {label}
    </span>
  );
};

const RecommendedBadge = ({ language }: { language: 'en' | 'zh' }) => {
  const t = getTranslation(language);
  return (
    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full border border-amber-200/50">
      <Star className="w-3 h-3 text-amber-600 fill-amber-600" />
      <span className="text-[10px] font-semibold text-amber-800">{t.spreadSelector.recommended}</span>
    </div>
  );
};

export function SpreadSelector() {
  const { selectedSpread, selectSpread, language } = useStore();
  const t = getTranslation(language);
  const [spreads, setSpreads] = useState<Spread[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    const fetchSpreads = async () => {
      try {
        const res = await fetch(`/api/spreads?lang=${language}`);
        if (res.ok) {
          const data = await res.json();
          setSpreads(data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchSpreads();
  }, [language]);

  const handleSelect = (spread: Spread) => {
    if (isSelecting) return;
    setIsSelecting(true);

    setTimeout(() => {
      selectSpread(spread);
      setIsSelecting(false);
    }, 200);
  };

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="w-full min-h-full max-w-5xl mx-auto px-4 py-12 flex flex-col justify-center">
        <div className="text-center mb-10">
          <h3 className="text-sm uppercase tracking-[0.2em] text-black/40 font-semibold mb-2">
            {t.spreadSelector.label}
          </h3>
          <p className="text-2xl font-serif text-black/80">
            {t.spreadSelector.title}
          </p>
          <p className="text-sm text-black/50 mt-2 max-w-md mx-auto">
            {t.spreadSelector.description_hint}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {spreads.map((spread) => {
            const isSelected = selectedSpread?.id === spread.id;

            return (
              <motion.button
                key={spread.id}
                onClick={() => handleSelect(spread)}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "group relative flex flex-col gap-4 p-6 rounded-2xl border text-left transition-all duration-300",
                  isSelected
                    ? "bg-white/95 border-black/30 shadow-xl shadow-black/[0.05] ring-2 ring-black/10"
                    : "bg-white/60 border-black/10 hover:bg-white/90 hover:border-black/20 hover:shadow-lg hover:shadow-black/[0.03]"
                )}
              >
                {/* Recommended Badge */}
                {spread.recommended && !isSelected && <RecommendedBadge language={language} />}

                {/* Header */}
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className={cn(
                        "font-serif text-xl tracking-wide",
                        isSelected ? "text-black" : "text-black/80 group-hover:text-black"
                      )}>
                        {spread.name}
                      </h4>
                      <DifficultyBadge difficulty={spread.difficulty} language={language} />
                    </div>
                    <p className="text-[10px] uppercase tracking-wider text-black/30 font-medium">
                      {spread.positions.length} {t.spreadSelector.cards_count}
                    </p>
                  </div>
                </div>

                {/* Preview Area */}
                <div className="w-full opacity-70 group-hover:opacity-100 transition-opacity">
                  <SpreadPreview positions={spread.positions} />
                </div>

                {/* Tags */}
                {spread.tags && spread.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {spread.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-1 rounded-full bg-black/5 text-black/60 font-medium border border-black/10"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Description */}
                <div className="space-y-2">
                  <p className="text-sm leading-relaxed text-black/70 font-medium">
                    {spread.description}
                  </p>
                  {spread.detail && (
                    <p className="text-xs leading-relaxed text-black/50 line-clamp-2">
                      {spread.detail}
                    </p>
                  )}
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                  <motion.div
                    layoutId="selection-indicator"
                    className="absolute inset-0 border-2 border-black/20 rounded-2xl pointer-events-none"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
