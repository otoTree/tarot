"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useStore } from "@/store/useStore";
import { getTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { ArrowDown, Sparkles } from "lucide-react";
import { useRef } from "react";

export function Hero({ onStart }: { onStart: () => void }) {
  const { language } = useStore();
  const t = getTranslation(language);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div ref={containerRef} className="relative flex flex-col items-center justify-center min-h-[90vh] w-full overflow-hidden">
      
      {/* Ambient Prismatic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-gradient-to-r from-rose-100/30 to-indigo-100/30 blur-[120px] rounded-full mix-blend-multiply" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-r from-emerald-100/30 to-sky-100/30 blur-[120px] rounded-full mix-blend-multiply" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[50%] h-[50%] bg-amber-50/40 blur-[100px] rounded-full mix-blend-multiply" />
      </div>

      <motion.div 
        style={{ y, opacity }}
        className="relative z-10 flex flex-col items-center text-center px-4 space-y-12 max-w-5xl"
      >
        {/* Brand Label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-emerald-700/60" />
          <span className="text-xs font-serif tracking-[0.3em] text-emerald-900/60 uppercase">
            Est. 2025
          </span>
          <Sparkles className="w-4 h-4 text-emerald-700/60" />
        </motion.div>

        {/* Main Title - Craft Style */}
        <div className="space-y-6">
          <motion.h1
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-8xl lg:text-9xl xl:text-[10rem] leading-tight font-heading font-normal tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-neutral-900 to-neutral-500 hover:to-neutral-800 transition-all duration-700 cursor-default select-none relative group whitespace-nowrap z-20 py-4 px-2"
          >
            {language === 'zh' ? "流明塔罗" : "LUMIN TAROT"}
            
            {/* Light Scan Effect */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/80 to-transparent -skew-x-12 translate-x-[-100%] group-hover:animate-shine pointer-events-none mix-blend-overlay" />
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="h-px w-24 bg-gradient-to-r from-transparent via-black/10 to-transparent mx-auto"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="text-xl md:text-3xl font-serif text-[#1A1A1A] font-medium tracking-wide max-w-2xl mx-auto"
          >
            &ldquo;{language === 'zh' ? "看清流向，即是掌控命运的开端" : "See the flow, master the fate."}&rdquo;
          </motion.p>
        </div>

        {/* Subtitle / Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="text-sm md:text-base text-black/40 font-sans max-w-lg leading-relaxed tracking-wide"
        >
          {t.hero.subtitle}
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="pt-8"
        >
          <Button 
            onClick={onStart}
            variant="outline" 
            size="lg"
            className="rounded-full px-10 py-7 border-emerald-900/10 bg-white/50 hover:bg-emerald-50/50 hover:border-emerald-900/20 text-emerald-950 transition-all duration-500 backdrop-blur-sm group shadow-sm"
          >
            <span className="font-serif tracking-widest text-sm uppercase mr-3">{t.hero.cta}</span>
            <ArrowDown className="w-4 h-4 opacity-50 group-hover:translate-y-1 transition-transform" />
          </Button>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-widest text-black/20 font-sans">{t.hero.scroll_to_discover}</span>
        <div className="w-px h-12 bg-gradient-to-b from-black/20 to-transparent" />
      </motion.div>
    </div>
  );
}
