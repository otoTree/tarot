import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getTranslation } from "@/lib/i18n";
import { useStore } from "@/store/useStore";
import { Copy, Download, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";

interface QuoteShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: string;
  question: string;
}

export function QuoteShareModal({ open, onOpenChange, quote, question }: QuoteShareModalProps) {
  const { language } = useStore();
  const t = getTranslation(language);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [domain, setDomain] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDomain(window.location.host);
    }
  }, []);

  const generateText = () => {
    let text = `"${quote}"\n\n`;
    text += `— ${t.app?.title || "Lumin Tarot"}\n`;
    if (question) {
        text += `${t.question?.current || "Question"}: ${question}`;
    }
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
      const element = contentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // Match ShareModal
        useCORS: true,
        backgroundColor: '#fafaf9', // stone-50
        logging: false,
        windowWidth: window.innerWidth, // Ensure media queries match current view
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
      link.download = `tarot-quote-${Date.now()}.png`;
      link.click();
    } catch (err) {
      console.error("Failed to generate image:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 border-b border-black/5 bg-white/50 backdrop-blur-sm">
          <DialogTitle className="text-center font-serif text-lg font-normal">{t.share.quote_title}</DialogTitle>
        </DialogHeader>
        
        {/* Preview Container */}
        <div className="flex-1 overflow-y-auto p-6 bg-stone-100/50 flex items-center justify-center">
          <div 
            ref={contentRef}
            data-share-content 
            className="bg-[#fafaf9] p-8 md:p-12 rounded-xl shadow-sm border border-stone-200 space-y-8 w-full max-w-md mx-auto relative"
          >
            {/* Background Decoration - Moved to separate layer for overflow handling */}
            <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-black/5 to-transparent rounded-bl-full -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-black/5 to-transparent rounded-tr-full -ml-12 -mb-12" />
            </div>
            
            {/* Header */}
            <div className="text-center space-y-1">
              <h3 className="font-serif text-xl tracking-wide text-black/90">{t.app?.title || "Lumin Tarot"}</h3>
            </div>
            
            {/* Quote Content */}
            <div className="relative py-8 px-2">
                <div className="relative z-10 font-serif text-base md:text-lg leading-relaxed text-black/80 text-center px-6 italic break-words">
                    {quote}
                </div>
            </div>

            {/* Context/Footer */}
            <div className="border-t border-black/5 pt-6 text-center space-y-2">
                {question && (
                    <div className="text-xs text-black/40 font-medium tracking-wide uppercase px-4 break-words">
                        {question}
                    </div>
                )}
                <div className="text-[10px] text-black/30 pt-2 font-mono">
                    {domain}
                </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-white/50 backdrop-blur-sm border-t border-black/5 flex justify-end gap-2">
           <Button variant="outline" onClick={handleCopy} className="gap-2">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? t.share.copied : t.share.copy_text}
          </Button>
          <Button onClick={handleDownload} disabled={isGenerating} className="gap-2 bg-black text-white hover:bg-black/80">
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {t.share.save_image}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper icon component since it wasn't imported above but used in logic
function Check({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
