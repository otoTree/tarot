"use client";

import React from 'react';
import { motion } from 'framer-motion';

const RiverCard = ({ content, delay, icon, title }: { content: string; delay: number; icon: string; title: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ margin: "-10% 0px -10% 0px" }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className="group relative bg-white/30 backdrop-blur-md p-10 rounded-2xl border border-white/40 shadow-sm transition-all duration-500 hover:bg-white/50 hover:shadow-lg hover:-translate-y-1 hover:border-white/60"
    >
      <div className="flex flex-col h-full gap-8">
        <div className="text-5xl opacity-80 font-serif filter drop-shadow-sm group-hover:scale-110 transition-transform duration-500">{icon}</div>
        <div className="space-y-4">
          <h3 className="text-xl font-heading font-medium text-slate-800 uppercase tracking-widest relative inline-block">
            {title}
            <span className="absolute -bottom-2 left-0 w-0 h-px bg-slate-800/20 group-hover:w-full transition-all duration-700 ease-out" />
          </h3>
          <p className="text-base text-slate-600/80 font-sans font-light leading-relaxed group-hover:text-slate-700 transition-colors">
            {content}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export function BrandStory() {
  return (
    <section className="relative w-full py-40 px-4 md:px-6 overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-black/5 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto space-y-32 relative z-10">
        
        {/* Manifesto Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-right md:text-left"
          >
            <h2 className="text-6xl md:text-8xl font-heading font-light tracking-tighter text-black leading-[0.9]">
              LUMIN <br />
              <span className="text-black/30 text-4xl md:text-6xl tracking-normal block mt-2">The Architecture of Fate</span>
            </h2>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative pl-8 border-l border-black/10"
          >
            <p className="text-lg md:text-xl leading-relaxed text-black/70 font-sans font-light">
              &ldquo;We do not predict. We reveal. Confusion is a lack of light. Clarity is a choice. Destiny is not a script. It is a current waiting to be seen. Lumin is the moment the lens clears. It is the power of the now.&rdquo;
            </p>
          </motion.div>
        </div>

        {/* Three Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-b border-black/5 divide-y md:divide-y-0 md:divide-x divide-black/5">
          <RiverCard 
            title="The Continuum"
            content="Fate is a sequence, not a surprise. We find the coherence in your history to reveal the inevitable logic of your tomorrow."
            delay={0.1} 
            icon="⏳"
          />
          <RiverCard 
            title="The Synthesis"
            content="Chaos is merely data waiting for a lens. We use the precision of AI to strip away the noise, leaving only the elegant geometry of your truth."
            delay={0.3} 
            icon="🔮"
          />
          <RiverCard 
            title="The Resolve"
            content="Energy follows intent. We anchor your drifting uncertainty, transforming the weight of the unknown into the momentum of the now."
            delay={0.5} 
            icon="🌊"
          />
        </div>
      </div>
    </section>
  );
}
