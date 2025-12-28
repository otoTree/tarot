"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface BrandStoryProps {
  content: {
    title: string;
    concept: string;
    rivers: {
      time: string;
      data: string;
      emotion: string;
    };
    cta: string;
  };
}

const RiverCard = ({ content, delay, icon }: { content: string; delay: number; icon: string }) => {
  const [title, body] = content.includes('：') 
    ? content.split('：') 
    : content.includes(': ') 
      ? content.split(': ') 
      : ["", content];
      
  const displayTitle = title || content;
  const displayBody = body || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ margin: "-10% 0px -10% 0px" }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className="group relative bg-white p-8 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-50 transition-all hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)]"
    >
      <div className="flex flex-col h-full gap-4">
        <div className="text-2xl">{icon}</div>
        <div>
          <h3 className="text-sm font-serif font-bold text-slate-900 uppercase tracking-wider mb-3">
            {displayTitle}
          </h3>
          <p className="text-sm text-slate-500 font-sans leading-relaxed">
            {displayBody}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export function BrandStory({ content }: BrandStoryProps) {
  return (
    <section className="relative w-full py-32 px-4 md:px-6 overflow-hidden bg-slate-50/50">
      <div className="max-w-6xl mx-auto space-y-20 relative z-10">
        
        {/* Title & Concept */}
        <div className="text-center space-y-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-serif font-medium uppercase tracking-tight text-slate-900"
          >
            {content.title}
          </motion.h2>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-3xl mx-auto relative pl-6 md:pl-0"
          >
            {/* Vertical Accent Line for Quote */}
            <div className="hidden md:block absolute left-0 top-2 bottom-2 w-px bg-slate-200" />
            
            <p className="text-xl md:text-2xl leading-relaxed text-slate-500 text-center md:text-left font-sans italic px-8">
              &ldquo;{content.concept}&rdquo;
            </p>
          </motion.div>
        </div>

        {/* Three Pillars Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <RiverCard 
            content={content.rivers.time} 
            delay={0.1} 
            icon="⏳"
          />
          <RiverCard 
            content={content.rivers.data} 
            delay={0.3} 
            icon="🔮"
          />
          <RiverCard 
            content={content.rivers.emotion} 
            delay={0.5} 
            icon="🌊"
          />
        </div>
      </div>
    </section>
  );
}
