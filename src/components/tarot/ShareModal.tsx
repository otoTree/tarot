import React, { useState, useRef } from "react";
import NextImage from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Message } from "ai";
import { PlacedCard, Spread } from "@/types/tarot";
import { getTranslation, getCard } from "@/lib/i18n";
import { useStore } from "@/store/useStore";
import { Copy, Check, Download, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMessages: Message[];
  placedCards: Record<string, PlacedCard>;
  spread: Spread | null;
  question: string;
}

export function ShareModal({ open, onOpenChange, selectedMessages, placedCards, spread, question }: ShareModalProps) {
  const { language } = useStore();
  const t = getTranslation(language);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const generateText = () => {
    let text = `${t.app?.title || "Lumin Tarot"} - ${t.hero?.subtitle || ""}\n\n`;
    text += `${t.question?.current || "Question"}: ${question}\n`;
    text += `${t.spreadSelector?.label || "Spread"}: ${spread?.name || ""}\n\n`;

    text += `[${t.share?.cards_list || "Cards"}]\n`;
    Object.values(placedCards).forEach((placed) => {
      const positionName = spread?.positions.find(p => p.id === placed.positionId)?.name || placed.positionId;
      const card = getCard(placed.card.id, language);
      const orientation = placed.isReversed ? (language === 'zh' ? '逆位' : 'Reversed') : (language === 'zh' ? '正位' : 'Upright');
      text += `${positionName}: ${card.name} (${orientation})\n`;
    });
    
    text += `\n[${t.share?.dialogue || "Dialogue"}]\n`;
    selectedMessages.forEach((msg) => {
      const role = msg.role === 'user' ? (language === 'zh' ? '问' : 'Q') : (language === 'zh' ? '答' : 'A');
      text += `${role}: ${msg.content}\n\n`;
    });

    return text;
  };

  const handleCopy = async () => {
    const text = generateText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownload = async () => {
    if (!contentRef.current) return;
    setIsGenerating(true);
    
    try {
      // Create a clone of the content to render it fully expanded (no scroll)
      const element = contentRef.current;
      
      // Temporarily expand height to capture full content
      // Note: Since it's inside a dialog with fixed height, modifying style directly might not work perfectly
      // if the parent constrains it. However, html2canvas often handles scrollable elements if configured right.
      // But for a sure shot, we often clone the node to an off-screen container.
      
      // Let's try rendering to a canvas with windowHeight option to ensure full capture
      const canvas = await html2canvas(element, {
        scale: 2, // Retina support
        useCORS: true,
        backgroundColor: '#fafaf9', // stone-50
        logging: false,
        onclone: (clonedDoc) => {
             // Find the cloned element
             const clonedElement = clonedDoc.querySelector('[data-share-content]') as HTMLElement;
             if (clonedElement) {
                 clonedElement.style.height = 'auto';
                 clonedElement.style.overflow = 'visible';
                 clonedElement.style.maxHeight = 'none';
             }
        }
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `tarot-reading-${Date.now()}.png`;
      link.click();
    } catch (err) {
      console.error("Failed to generate image:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>{t.share?.preview || "Share Preview"}</DialogTitle>
        </DialogHeader>
        
        {/* Preview Container - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 bg-stone-100/50">
          {/* Capture Target - We add an ID or Ref here */}
          <div 
            ref={contentRef} 
            data-share-content
            className="bg-[#fafaf9] p-8 rounded-xl shadow-sm border border-stone-200 space-y-8 max-w-2xl mx-auto"
          >
            {/* Header Section */}
            <div className="text-center space-y-2 border-b border-black/5 pb-6">
              <h3 className="font-serif text-2xl tracking-wide text-black/90">{t.app?.title}</h3>
              <p className="font-serif text-black/50 italic text-sm">{t.hero?.subtitle}</p>
            </div>
            
            {/* Question Section */}
            <div className="bg-white/50 p-6 rounded-lg border border-black/5 text-center space-y-2">
              <div className="text-xs uppercase tracking-widest text-black/40 font-medium">{t.question?.current}</div>
              <div className="font-serif text-lg text-black/80">{question}</div>
              <div className="text-xs text-black/40 pt-2">{t.spreadSelector?.label}: {spread?.name}</div>
            </div>

            {/* Cards Display - Visual */}
            <div className="space-y-4">
               <div className="text-center">
                   <h4 className="text-xs uppercase tracking-widest text-black/40 font-medium mb-4">{t.share?.cards_list}</h4>
               </div>
               
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 {Object.values(placedCards).map((placed) => {
                   const positionName = spread?.positions.find(p => p.id === placed.positionId)?.name || placed.positionId;
                   const card = getCard(placed.card.id, language);
                   return (
                     <div key={placed.positionId} className="flex flex-col items-center gap-2 p-3 bg-white rounded-lg border border-black/5 shadow-sm">
                       {/* Card Image Placeholder / Real Image */}
                       <div className="relative w-full aspect-[2/3] bg-stone-200 rounded overflow-hidden">
                           {placed.card.image ? (
                               <NextImage 
                                 src={placed.card.image} 
                                 alt={card.name}
                                 fill
                                 sizes="(max-width: 768px) 50vw, 33vw"
                                 className={cn(
                                     "object-cover transition-transform duration-500",
                                     placed.isReversed && "rotate-180"
                                 )}
                               />
                           ) : (
                               <div className="w-full h-full flex items-center justify-center text-black/20 text-xs p-2 text-center">
                                   {card.name}
                               </div>
                           )}
                           
                           {/* Overlay for Reversed Label if needed, but rotation is usually enough */}
                       </div>
                       
                       <div className="text-center space-y-0.5">
                           <div className="text-xs font-medium text-black/40 uppercase tracking-wider">{positionName}</div>
                           <div className="text-sm font-serif font-medium text-black/80">{card.name}</div>
                           <div className={cn("text-[10px] uppercase tracking-wider font-medium", placed.isReversed ? "text-amber-700/70" : "text-emerald-700/70")}>
                             {placed.isReversed ? (language === 'zh' ? '逆位' : 'Reversed') : (language === 'zh' ? '正位' : 'Upright')}
                           </div>
                       </div>
                     </div>
                   );
                 })}
               </div>
            </div>

            {/* Dialogue Section */}
            {selectedMessages.length > 0 && (
                <div className="space-y-6 pt-4 border-t border-black/5">
                  <div className="text-center">
                      <h4 className="text-xs uppercase tracking-widest text-black/40 font-medium">{t.share?.dialogue}</h4>
                  </div>
                  
                  <div className="space-y-6">
                    {selectedMessages.map((msg, idx) => (
                        <div key={idx} className="flex gap-4 text-sm leading-relaxed">
                        <div className="font-serif font-bold min-w-[1.5rem] text-black/30 pt-1 text-right">
                            {msg.role === 'user' ? (language === 'zh' ? '问' : 'Q') : (language === 'zh' ? '答' : 'A')}
                        </div>
                        <div className="flex-1 min-w-0">
                           {msg.role === 'user' ? (
                               <p className="whitespace-pre-wrap text-black/70">{msg.content}</p>
                           ) : (
                               <div className="prose prose-neutral prose-sm max-w-none text-black/70 prose-p:my-2 prose-headings:font-serif prose-headings:font-normal prose-strong:font-medium prose-strong:text-black/80 prose-ul:my-2 prose-li:my-0.5">
                                   <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                       {msg.content}
                                   </ReactMarkdown>
                               </div>
                           )}
                        </div>
                        </div>
                    ))}
                  </div>
                </div>
            )}
            
            {/* Footer / Watermark */}
            <div className="pt-8 text-center text-[10px] text-black/20 font-mono uppercase tracking-widest">
                Generated by Lumin Tarot
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-2 bg-white border-t">
           <Button variant="outline" onClick={() => onOpenChange(false)}>
             {t.share?.close || "Close"}
           </Button>
           <div className="flex gap-2">
               <Button variant="secondary" onClick={handleCopy} disabled={copied}>
                 {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                 {copied ? (t.share?.copied || "Copied!") : (t.share?.copy_text || "Copy Text")}
               </Button>
               <Button onClick={handleDownload} disabled={isGenerating}>
                 {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                 {t.share?.download_image || "Download Image"}
               </Button>
           </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
