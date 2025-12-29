"use client";

import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { SpreadSelector } from "@/components/tarot/SpreadSelector";
import { QuestionInput } from "@/components/tarot/QuestionInput";
import { SpreadBoard } from "@/components/tarot/SpreadBoard";
import { InteractiveDeck } from "@/components/tarot/InteractiveDeck";
import { ChatInterface } from "@/components/tarot/ChatInterface";
import { ArrowLeft, RefreshCw, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTranslation } from "@/lib/i18n";
import { UserMenu } from "@/components/auth/UserMenu";
import { Hero } from "@/components/tarot/Hero";
import { BrandStory } from "@/components/BrandStory";
import { ProcessSection } from "@/components/tarot/ProcessSection";
import { DemoShowcase } from "@/components/tarot/DemoShowcase";
import { ScrollingMarquee } from "@/components/tarot/ScrollingMarquee";
import { PricingSection } from "@/components/tarot/PricingSection";

export default function Home() {
  const { selectedSpread, placedCards, resetReading, clearSpread, isReading, language, setLanguage, currentQuestion } = useStore();
  const t = getTranslation(language);
  const [hasStarted, setHasStarted] = useState(false);

  const isFull = selectedSpread 
    ? Object.keys(placedCards).length >= selectedSpread.positions.length 
    : false;

  React.useEffect(() => {
    document.title = t.app.title;
  }, [t]);

  // Auto-start if a spread is selected (e.g. from history)
  React.useEffect(() => {
    if (selectedSpread) {
      setHasStarted(true);
    }
  }, [selectedSpread]);

  return (
    <main className="min-h-screen bg-[#fcfcfc] text-black font-sans overflow-hidden selection:bg-black/5 relative">
      {/* Header */}
      <nav className="fixed top-0 w-full z-40 flex justify-between items-center px-8 py-6">
        <h1 className="text-sm tracking-[0.3em] uppercase font-serif font-semibold">{t.app.title}</h1>
        <div className="flex gap-4 items-center">
          <button 
            onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
            className="hidden md:flex p-2 hover:bg-black/5 rounded-full transition-colors items-center gap-2"
            title={t.app.lang_switch}
          >
            <Globe className="h-4 w-4 opacity-50" />
            <span className="text-xs font-serif opacity-50">{language === 'en' ? 'ZH' : 'EN'}</span>
          </button>
          {selectedSpread && (
            <>
              <button 
                onClick={clearSpread}
                className="hidden md:block p-2 hover:bg-black/5 rounded-full transition-colors"
                title={language === 'zh' ? '返回选择' : 'Back to Selection'}
              >
                <ArrowLeft className="h-4 w-4 opacity-50" />
              </button>
              <button 
                onClick={resetReading}
                className="hidden md:block p-2 hover:bg-black/5 rounded-full transition-colors"
                title={t.app.reset}
              >
                <RefreshCw className="h-4 w-4 opacity-50" />
              </button>
            </>
          )}
          <UserMenu />
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative w-full h-[100dvh] pt-24 pb-8 px-4 flex flex-col items-center overflow-y-auto">
        
        <AnimatePresence>
          {!hasStarted ? (
             <motion.div
                key="hero"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full flex-1 flex flex-col items-center justify-center gap-24"
             >
                <div className="w-full">
                  <Hero onStart={() => setHasStarted(true)} />
                </div>
                <ScrollingMarquee />
                <ProcessSection />
                <DemoShowcase />
                <BrandStory />
                <PricingSection />
             </motion.div>
          ) : !selectedSpread ? (
            <motion.div 
              key="selector"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 w-full relative overflow-hidden"
            >
              <SpreadSelector />
            </motion.div>
          ) : !currentQuestion ? (
            <motion.div
              key="question"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 w-full flex items-center justify-center"
            >
              <QuestionInput />
            </motion.div>
          ) : (
            <motion.div
              key="board"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn(
                "w-full h-full relative transition-all duration-500 ease-in-out",
                isFull ? "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start lg:items-center px-0 lg:px-12 max-w-[1600px] mx-auto" : "flex flex-col items-center justify-center"
              )}
            >
               {/* Spread Board Area */}
               <div className={cn(
                 "w-full transition-all duration-500 flex flex-col items-center justify-center",
                 isFull ? "h-auto lg:h-full" : ""
               )}>
                  {/* Question Display */}
                  {!isFull && currentQuestion && (
                     <div className="mb-4 text-center px-4 animate-in fade-in slide-in-from-top-4 duration-700">
                        <p className="text-xs uppercase tracking-widest text-black/30 mb-2">
                           {t.question.current}
                        </p>
                        <h3 className="text-xl md:text-2xl font-serif text-black/60 italic">
                           &ldquo;{currentQuestion}&rdquo;
                        </h3>
                     </div>
                  )}

                  <SpreadBoard />
                  
                  {/* Deck (only if not full and not reading) */}
                  {!isFull && !isReading && <InteractiveDeck />}
               </div>

               {/* Chat Interface (When Full) */}
               <AnimatePresence>
                {isFull && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="w-full h-[600px] lg:h-full lg:max-h-[80vh]"
                  >
                    <ChatInterface onClose={resetReading} />
                  </motion.div>
                )}
               </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
