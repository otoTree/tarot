"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ArrowRight, Sparkles } from "lucide-react";

export function DemoShowcase() {
  const { language } = useStore();
  const [activeStep, setActiveStep] = useState(0);

  // Auto-cycle through steps
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => {
        const next = (prev + 1) % 4;
        // Haptic feedback on step change
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(10);
        }
        return next;
      });
    }, 5000); // 5 seconds per step
    return () => clearInterval(timer);
  }, []);

  const steps = [
    { id: 0, label: language === 'zh' ? "选阵" : "Select" },
    { id: 1, label: language === 'zh' ? "提问" : "Ask" },
    { id: 2, label: language === 'zh' ? "抽牌" : "Draw" },
    { id: 3, label: language === 'zh' ? "解读" : "Reveal" },
  ];

  return (
    <section className="w-full py-32 px-4 bg-white overflow-hidden relative">
      {/* Background Texture - Clean White */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/subtle-white-feathers.png')]"></div>
      
      <div className="max-w-6xl mx-auto space-y-16 relative z-10">
        
        {/* Section Header */}
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-serif text-slate-900 tracking-tight">
            {language === 'zh' ? "真实体验" : "The Experience"}
          </h2>
          <p className="text-slate-500 font-serif italic max-w-lg mx-auto">
            {language === 'zh' 
              ? "从提问、择阵到洞察，沉浸式的灵性交互流。" 
              : "From inquiry, selection to insight, an immersive spiritual interface."}
          </p>
        </div>

        {/* Interactive Demo Container */}
        <div className="relative w-full max-w-4xl mx-auto aspect-[16/10] md:aspect-[16/9] bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col ring-1 ring-slate-900/5">
          
          {/* Mock Browser Header */}
          <div className="h-12 border-b border-slate-100 flex items-center px-4 gap-2 bg-white/80 backdrop-blur-sm">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-slate-200" />
              <div className="w-3 h-3 rounded-full bg-slate-200" />
              <div className="w-3 h-3 rounded-full bg-slate-200" />
            </div>
            <div className="flex-1 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-50 text-[10px] font-serif text-slate-400 tracking-widest uppercase border border-slate-100">
                <Sparkles className="w-3 h-3 text-slate-400" />
                LUMIN TAROT
              </div>
            </div>
            <div className="w-12" /> {/* Spacer */}
          </div>

          {/* Step Indicators */}
          <div className="absolute top-16 left-0 right-0 z-20 flex justify-center gap-2 pointer-events-none">
            {steps.map((step) => (
              <div 
                key={step.id}
                className={cn(
                  "h-1 rounded-full transition-all duration-500",
                  activeStep === step.id ? "w-8 bg-slate-900" : "w-2 bg-slate-200"
                )}
              />
            ))}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 relative overflow-hidden bg-white">
            <AnimatePresence mode="wait">
              
              {/* STEP 1: SELECT */}
              {activeStep === 0 && (
                <motion.div
                  key="step-select"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 flex flex-col items-center justify-center p-8"
                >
                  <div className="w-full max-w-2xl space-y-8">
                    <div className="text-center space-y-2">
                      <h3 className="text-2xl font-serif text-slate-900">
                        {language === 'zh' ? "选择牌阵" : "Choose Your Spread"}
                      </h3>
                      <p className="text-slate-500 text-sm font-serif">
                        {language === 'zh' ? "为你的问题寻找最合适的解读结构" : "Find the perfect structure for your inquiry"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Active Option */}
                      <div className="relative bg-white p-6 rounded-xl border-2 border-slate-900 shadow-lg flex flex-col gap-4 group cursor-pointer hover:shadow-xl transition-shadow">
                        <div className="flex justify-between items-start">
                          <span className="font-serif text-lg text-slate-900">
                            {language === 'zh' ? "时间之流" : "Time Flow"}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200 uppercase tracking-wider font-semibold">
                            {language === 'zh' ? "推荐" : "Recommended"}
                          </span>
                        </div>
                        <div className="flex gap-2 h-16 items-center justify-center py-2">
                           <div className="w-10 h-16 border border-slate-200 bg-slate-50 rounded-[4px]" />
                           <div className="w-10 h-16 border border-slate-200 bg-slate-50 rounded-[4px]" />
                           <div className="w-10 h-16 border border-slate-200 bg-slate-50 rounded-[4px]" />
                        </div>
                        <p className="text-xs text-slate-500 font-serif">
                          {language === 'zh' ? "洞察过去、现在与未来" : "Insight into Past, Present, Future"}
                        </p>
                        
                        {/* Cursor Simulation */}
                        <motion.div 
                          initial={{ opacity: 0, x: 20, y: 20 }}
                          animate={{ opacity: 1, x: 0, y: 0 }}
                          transition={{ delay: 0.5, duration: 0.5 }}
                          className="absolute bottom-2 right-2"
                        >
                          <div className="w-4 h-4 bg-slate-900 rounded-full opacity-20 animate-ping absolute" />
                          <svg className="w-6 h-6 text-slate-900 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M5.5 3.5l12 12-4.5 1-2.5 5.5-2.5-1 2.5-5.5-6.5-.5z" />
                          </svg>
                        </motion.div>
                      </div>

                      {/* Inactive Option */}
                      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col gap-4 opacity-60 hover:opacity-80 transition-opacity cursor-pointer">
                        <div className="flex justify-between items-start">
                          <span className="font-serif text-lg text-slate-900">
                            {language === 'zh' ? "单一洞察" : "Single Insight"}
                          </span>
                        </div>
                        <div className="flex gap-2 h-16 items-center justify-center opacity-50 py-2">
                           <div className="w-10 h-16 border border-slate-300 bg-white rounded-[4px]" />
                        </div>
                        <p className="text-xs text-slate-400 font-serif">
                          {language === 'zh' ? "快速获得核心指引" : "Quick core guidance"}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: ASK */}
              {activeStep === 1 && (
                <motion.div
                  key="step-ask"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-8"
                >
                  <div className="space-y-4 max-w-xl">
                    <h3 className="text-3xl md:text-4xl font-serif text-slate-900">
                      {language === 'zh' ? "心中默念你的问题" : "Focus on Your Question"}
                    </h3>
                    <p className="text-slate-500 font-serif italic">
                      {language === 'zh' ? "保持专注，将意念注入即将抽取的卡牌中" : "Hold the question in your mind as you prepare to draw"}
                    </p>
                  </div>

                  <div className="w-full max-w-md space-y-4">
                    <div className="w-full h-12 rounded-full border border-slate-200 flex items-center px-6 text-slate-900 font-serif text-sm bg-white shadow-sm relative overflow-hidden ring-1 ring-slate-100">
                      <motion.span
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2, delay: 0.5, ease: "linear" }}
                        className="whitespace-nowrap overflow-hidden inline-block text-slate-900"
                      >
                        {language === 'zh' ? "关于事业发展，我需要知道什么？" : "What should I know about my career?"}
                      </motion.span>
                      <span className="ml-1 animate-pulse border-r border-slate-400 h-4 inline-block align-middle" />
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-2">
                      {[
                        language === 'zh' ? "今日指引" : "Daily Guidance",
                        language === 'zh' ? "关系走向" : "Relationship Outcome",
                        language === 'zh' ? "阻碍是什么" : "What is blocking me?"
                      ].map((tag, i) => (
                        <motion.span 
                          key={i} 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 2.5 + i * 0.1 }}
                          className="px-3 py-1 rounded-full bg-slate-50 text-xs text-slate-500 font-serif border border-slate-100 hover:bg-slate-100 hover:border-slate-200 transition-colors cursor-pointer"
                        >
                          {tag}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 3 }}
                    className="pt-8"
                  >
                    <button className="px-8 py-3 bg-slate-900 text-white rounded-full font-serif tracking-widest text-xs uppercase flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                      {language === 'zh' ? "开始抽牌" : "Begin Drawing"}
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </motion.div>
                </motion.div>
              )}

              {/* STEP 3: DRAW */}
              {activeStep === 2 && (
                <motion.div
                  key="step-spread"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 flex items-center justify-center p-8"
                >
                  <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-3xl w-full">
                    {/* Card 1: Past */}
                    <motion.div 
                      initial={{ opacity: 0, y: 50, rotate: 0 }}
                      animate={{ opacity: 1, y: 0, rotate: -2 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                      className="flex flex-col items-center gap-4 group"
                    >
                      <div className="relative w-full aspect-[2/3.5] rounded-lg shadow-lg border border-slate-100 overflow-hidden bg-white translate-y-4">
                        <Image 
                          src={language === 'zh' ? "/cards/swords-king.jpg" : "/cards/pentacles-page.jpg"} 
                          alt="Past" fill className="object-cover" 
                        />
                      </div>
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-center space-y-1"
                      >
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                          {language === 'zh' ? "过去" : "PAST"}
                        </span>
                        <p className="text-xs md:text-sm font-serif text-slate-700">
                          {language === 'zh' ? "宝剑国王" : "Page of Pentacles"}
                        </p>
                      </motion.div>
                    </motion.div>

                    {/* Card 2: Present */}
                    <motion.div 
                      initial={{ opacity: 0, y: 50, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
                      className="flex flex-col items-center gap-4 group"
                    >
                      <div className="relative w-full aspect-[2/3.5] rounded-lg shadow-xl border border-slate-200 overflow-hidden bg-white -translate-y-4 z-10 ring-4 ring-slate-50">
                        <Image 
                          src={language === 'zh' ? "/cards/major-2.jpg" : "/cards/swords-9.jpg"} 
                          alt="Present" fill className={cn("object-cover", language === 'en' && "rotate-180")} 
                        />
                      </div>
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.0 }}
                        className="text-center space-y-1"
                      >
                        <span className="text-[10px] uppercase tracking-widest text-slate-900 font-bold">
                          {language === 'zh' ? "现在" : "PRESENT"}
                        </span>
                        <p className="text-xs md:text-sm font-serif text-slate-900 font-medium">
                          {language === 'zh' ? "女祭司 (逆)" : "Nine of Swords (Rev)"}
                        </p>
                      </motion.div>
                    </motion.div>

                    {/* Card 3: Future */}
                    <motion.div 
                      initial={{ opacity: 0, y: 50, rotate: 0 }}
                      animate={{ opacity: 1, y: 0, rotate: 2 }}
                      transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
                      className="flex flex-col items-center gap-4 group"
                    >
                      <div className="relative w-full aspect-[2/3.5] rounded-lg shadow-lg border border-slate-100 overflow-hidden bg-white translate-y-4">
                        <Image 
                          src={language === 'zh' ? "/cards/cups-1.jpg" : "/cards/wands-1.jpg"} 
                          alt="Future" fill className="object-cover" 
                        />
                      </div>
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        className="text-center space-y-1"
                      >
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                          {language === 'zh' ? "未来" : "FUTURE"}
                        </span>
                        <p className="text-xs md:text-sm font-serif text-slate-700">
                          {language === 'zh' ? "圣杯一" : "Ace of Wands"}
                        </p>
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: INSIGHT */}
              {activeStep === 3 && (
                <motion.div
                  key="step-insight"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 flex flex-col md:flex-row"
                >
                  {/* Left: Cards Context */}
                  <div className="hidden md:flex w-1/3 bg-slate-50 border-r border-slate-100 p-6 flex-col items-center justify-center gap-4">
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="relative w-32 aspect-[2/3.5] rounded-md shadow-md border border-slate-200 overflow-hidden rotate-[-2deg]"
                    >
                       <Image 
                          src={language === 'zh' ? "/cards/major-2.jpg" : "/cards/swords-9.jpg"} 
                          alt="Focus Card" fill className={cn("object-cover", language === 'en' && "rotate-180")} 
                        />
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-center"
                    >
                      <p className="text-xs font-serif text-slate-400">
                        {language === 'zh' ? "重点分析" : "Focus Card"}
                      </p>
                      <p className="text-sm font-serif text-slate-900">
                        {language === 'zh' ? "女祭司 (逆)" : "Nine of Swords (Rev)"}
                      </p>
                    </motion.div>
                  </div>

                  {/* Right: Text Content */}
                  <div className="flex-1 p-8 md:p-12 overflow-y-auto relative">
                    <div className="space-y-8">
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="space-y-2"
                      >
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Lumin Analysis</span>
                        <h3 className="text-2xl font-serif text-slate-900 leading-tight">
                          {language === 'zh' ? "剑沉入水底，杯中的月影开始圆满。" : "A seed from the past is breaking open, reaching for a new sun."}
                        </h3>
                      </motion.div>

                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: 48 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                        className="h-px bg-slate-200" 
                      />

                      <div className="space-y-6 text-sm md:text-base font-serif text-slate-600 leading-relaxed">
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.0 }}
                        >
                          {language === 'zh' 
                            ? "此刻，洞察深处的看似平静开始涌动。你或许被噪音与内在的直觉割裂，失去了清晰的桥梁。听见内心的牵引，放下对控制的执着，让信息的静默音符显形。"
                            : "The mist of worry that once clung to you is beginning to thin. Those sharp, midnight thoughts about adequacy or direction are losing their edge, softening into mere shadows."}
                        </motion.p>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 2.5 }} // Staggered delay for second paragraph
                        >
                          {language === 'zh'
                            ? "过去有一段时间，你或许依赖过一种锋利的、掌控性的力量。它像一把立于言语的尺，丈量着每一步的微光。然而逆位时，这种力量向内折返，可能带来了内心的紧绷。"
                            : "In the past, you planted a seed with careful hands—a skill learned, a foundation laid. It was solid, promising, but perhaps its full meaning was still asleep."}
                        </motion.p>
                      </div>

                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 3.5 }}
                        className="flex gap-2 pt-4"
                      >
                        <button className="px-4 py-2 bg-slate-50 rounded-full text-xs hover:bg-slate-100 transition-colors text-slate-500 font-serif border border-slate-100">
                          {language === 'zh' ? "追问..." : "Ask a follow-up..."}
                        </button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Navigation Dots (Manual Control) */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 z-20">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  activeStep === step.id ? "bg-slate-900 scale-125" : "bg-slate-300 hover:bg-slate-400"
                )}
                aria-label={`Go to step ${step.label}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
