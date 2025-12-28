"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useStore } from "@/store/useStore";

// A selection of Major Arcana cards for the marquee
const CARDS = [
  { id: "major-0", src: "/cards/major-0.jpg", name: "The Fool", name_zh: "愚人" },
  { id: "major-1", src: "/cards/major-1.jpg", name: "The Magician", name_zh: "魔术师" },
  { id: "major-2", src: "/cards/major-2.jpg", name: "High Priestess", name_zh: "女祭司" },
  { id: "major-9", src: "/cards/major-9.jpg", name: "The Hermit", name_zh: "隐士" },
  { id: "major-19", src: "/cards/major-19.jpg", name: "The Sun", name_zh: "太阳" },
  { id: "major-18", src: "/cards/major-18.jpg", name: "The Moon", name_zh: "月亮" },
  { id: "major-17", src: "/cards/major-17.jpg", name: "The Star", name_zh: "星星" },
  { id: "major-10", src: "/cards/major-10.jpg", name: "Wheel of Fortune", name_zh: "命运之轮" },
];

export function ScrollingMarquee() {
  const { language } = useStore();

  return (
    <div className="relative w-full overflow-hidden bg-[#fcfcfc] py-16 border-y border-black/5">
      {/* Fade Gradients for smooth edges */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#fcfcfc] to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#fcfcfc] to-transparent z-10" />

      <div className="flex whitespace-nowrap">
        <motion.div 
          className="flex gap-12 px-12"
          animate={{ x: "-50%" }}
          transition={{ 
            duration: 40, // Slower for visual appreciation
            repeat: Infinity, 
            ease: "linear" 
          }}
        >
          {/* Double the array for seamless loop */}
          {[...CARDS, ...CARDS, ...CARDS].map((card, i) => (
            <div 
              key={`${card.id}-${i}`} 
              className="relative group flex flex-col items-center gap-4 cursor-default"
            >
              {/* Card Container */}
              <div className="relative w-32 md:w-40 aspect-[2/3.5] rounded-lg shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] transition-all duration-500 group-hover:-translate-y-4 group-hover:scale-110 group-hover:shadow-[0_20px_40px_-4px_rgba(0,0,0,0.2)] group-hover:z-10 bg-white border border-black/5">
                <Image
                  src={card.src}
                  alt={card.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 128px, 160px"
                />
                
                {/* Shine Effect Overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 pointer-events-none" />
              </div>

              {/* Minimal Label - Pills Style (from reference) */}
              <div className="flex flex-col items-center gap-2 opacity-60 group-hover:opacity-100 transition-all duration-500 group-hover:translate-y-2">
                {language === 'zh' ? (
                  <>
                    <span className="px-3 py-1 rounded-full bg-white border border-black/5 shadow-sm text-[10px] font-sans tracking-widest text-black">
                      {card.name_zh}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-black/5 text-[8px] uppercase tracking-[0.2em] font-serif text-black/40">
                      {card.name}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="px-3 py-1 rounded-full bg-white border border-black/5 shadow-sm text-[10px] font-serif tracking-widest text-black">
                      {card.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-black/5 text-[8px] uppercase tracking-[0.2em] font-sans text-black/40">
                      {card.name_zh}
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
