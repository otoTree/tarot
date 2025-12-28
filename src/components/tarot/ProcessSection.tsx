"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useStore } from "@/store/useStore";

const steps = [
  {
    id: "I",
    title: "Focus",
    title_zh: "问心 · 择阵",
    description: "Center the mind. Choose your spread as an anchor. In the ocean of noise, define your singular truth and let the path emerge.",
    description_zh: "选择契合的牌阵，写下心中的困惑。意念聚焦之处，便是答案显影的起点。",
  },
  {
    id: "II",
    title: "Connection",
    title_zh: "抽牌 · 链接",
    description: "Part the mists. Align with the field. As fingers cross the threshold of the digital and the divine, your intent finds its place.",
    description_zh: "沉浸于数字仪式，跟随直觉抽取卡牌。在指尖的交互中，完成潜意识的投射。",
  },
  {
    id: "III",
    title: "Insight",
    title_zh: "洞见 · 解读",
    description: "The lens snaps. The truth is revealed. Decode the architecture of fate and find the inevitable logic within the light.",
    description_zh: "AI 即刻解码牌面符号，生成深度命运报告。拒绝模棱两可，提供理性的行动指引。",
  }
];

const FocusText = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0.1, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, filter: "blur(0px)" }}
      viewport={{ margin: "-20% 0px -20% 0px", amount: 0.5 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={cn("transition-all duration-700", className)}
    >
      {children}
    </motion.div>
  );
};

export function ProcessSection() {
  const { language } = useStore();

  return (
    <section className="relative w-full py-32 px-4 md:px-6 bg-[#fcfcfc] overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Left: Sticky Title/Concept */}
          <div className="md:col-span-4 relative">
            <div className="sticky top-32 space-y-8">
              <FocusText>
                <h2 className="text-4xl md:text-5xl font-serif text-black tracking-tight leading-tight">
                  {language === 'zh' ? <>溯流<br/>而上</> : <>LUMIN<br/>RITUAL</>}
                </h2>
              </FocusText>
              <div className="h-px w-12 bg-black/10" />
              <FocusText className="delay-100">
                <p className="text-sm md:text-base text-black/50 font-sans leading-relaxed max-w-xs font-light tracking-wide">
                  {language === 'zh' 
                    ? "三步，自无明走向澄明。数字时代的灵性洗礼，让潜意识于此照见。" 
                    : "Three steps, from obscurity to clarity. A digital ritual designed for the modern soul to witness the unseen."}
                </p>
              </FocusText>
            </div>
          </div>

          {/* Right: The Steps */}
          <div className="md:col-span-8 space-y-24">
            {steps.map((step) => (
              <div 
                key={step.id}
                className="group border-t border-black/5 pt-12 grid grid-cols-1 md:grid-cols-12 gap-8"
              >
                {/* Roman Numeral - Crystal/Glass Effect */}
                <div className="md:col-span-2 relative">
                  <motion.span 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 0.2, y: 0 }}
                    viewport={{ margin: "-10% 0px -10% 0px" }}
                    transition={{ duration: 0.8 }}
                    className="font-serif text-6xl md:text-7xl text-transparent bg-clip-text bg-gradient-to-br from-black/40 to-black/5 blur-[2px] select-none absolute -top-4 -left-2"
                  >
                    {step.id}
                  </motion.span>
                   <motion.span 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ margin: "-10% 0px -10% 0px" }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="relative font-serif text-4xl text-black/20 italic z-10 mix-blend-overlay"
                  >
                    {step.id}
                  </motion.span>
                </div>
                
                {/* Content with Focus Animation */}
                <div className="md:col-span-10 space-y-4">
                  <FocusText className="delay-200">
                    <h3 className={cn(
                      "text-2xl md:text-3xl font-serif text-black transition-colors duration-500",
                      language === 'zh' && "tracking-[0.2em]"
                    )}>
                      {language === 'zh' ? step.title_zh : step.title}
                    </h3>
                  </FocusText>
                  
                  <FocusText className="delay-300">
                    <p className="text-lg text-black/60 font-sans font-light leading-relaxed max-w-lg">
                      {language === 'zh' ? step.description_zh : step.description}
                    </p>
                  </FocusText>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
