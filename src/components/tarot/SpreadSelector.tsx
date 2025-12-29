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
    <div className="relative w-full aspect-[4/3] bg-slate-50/50 rounded-lg border border-slate-200 overflow-hidden pointer-events-none backdrop-blur-sm">
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:16px_16px]" />
      
      {positions.map((pos) => (
        <div
          key={pos.id}
          className="absolute w-[18%] h-[28%] border border-slate-200 rounded-[2px] shadow-sm bg-white/80"
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-400 font-mono">
            {pos.id}
          </div>
        </div>
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
      "text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-none border font-mono font-medium",
      color
    )}>
      {label}
    </span>
  );
};

const RecommendedBadge = ({ language }: { language: 'en' | 'zh' }) => {
  const t = getTranslation(language);
  return (
    <div className="absolute top-0 right-0 px-3 py-1 bg-amber-50 border-l border-b border-amber-200/50 backdrop-blur-sm">
      <div className="flex items-center gap-1.5">
        <Star className="w-3 h-3 text-amber-500 fill-amber-500/20" />
        <span className="text-[10px] font-mono tracking-widest text-amber-700 uppercase">{t.spreadSelector.recommended}</span>
      </div>
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
                  "group relative flex flex-col gap-4 p-0 rounded-none border text-left transition-all duration-300 overflow-hidden",
                  isSelected
                    ? "bg-white border-slate-300 ring-1 ring-slate-200 shadow-xl"
                    : "bg-white/60 border-slate-200/60 hover:border-slate-300 hover:bg-white/90 hover:shadow-lg"
                )}
              >
                {/* Background Noise - Removed to use global grain */}
                
                {/* Content Container */}
                <div className="p-6 relative z-10 flex flex-col gap-4">
                  {/* Recommended Badge */}
                  {spread.recommended && !isSelected && <RecommendedBadge language={language} />}

                  {/* Header */}
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h4 className={cn(
                          "font-heading text-xl tracking-wider uppercase",
                          isSelected ? "text-slate-900" : "text-slate-700 group-hover:text-slate-900"
                        )}>
                          {spread.name}
                        </h4>
                        <DifficultyBadge difficulty={spread.difficulty} language={language} />
                      </div>
                      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">
                        {`// ${spread.positions.length} ${t.spreadSelector.cards_count}`}
                      </p>
                    </div>
                  </div>

                  {/* Preview Area */}
                  <div className="w-full opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                    <SpreadPreview positions={spread.positions} />
                  </div>

                  {/* Tags */}
                  {spread.tags && spread.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {spread.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-1 bg-slate-100 text-slate-500 font-mono border border-slate-200"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Description */}
                  <div className="space-y-2 border-t border-slate-100 pt-4">
                    <p className="text-sm leading-relaxed text-slate-600 font-light font-sans">
                      {spread.description}
                    </p>
                    {spread.detail && (
                      <p className="text-xs leading-relaxed text-slate-400 line-clamp-2 font-mono">
                        &gt; {spread.detail}
                      </p>
                    )}
                  </div>
                </div>

                {/* Selection Indicator - Cyber Corners (Light Mode) */}
                {isSelected && (
                  <>
                    <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-slate-400" />
                    <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-slate-400" />
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-slate-400" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-slate-400" />
                  </>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
