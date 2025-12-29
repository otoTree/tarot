import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getTranslation } from "@/lib/i18n";
import { useStore } from "@/store/useStore";
import { Copy, Download, Loader2, Moon, Sun } from "lucide-react";
import html2canvas from "html2canvas";
import { cn } from "@/lib/utils";

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
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

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

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleDownload = async () => {
    if (!contentRef.current) return;
    setIsGenerating(true);
    
    try {
      const element = contentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // Match ShareModal
        useCORS: true,
        backgroundColor: theme === 'light' ? '#fafaf9' : '#000000', // stone-50 or black
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
            className={cn(
              "p-6 md:p-12 rounded-xl shadow-sm border space-y-5 md:space-y-8 w-full max-w-md mx-auto relative transition-colors duration-300",
              theme === 'light' 
                ? "bg-[#fafaf9] border-stone-200" 
                : "bg-zinc-950 border-zinc-800"
            )}
          >
            {/* Background Decoration - Moved to separate layer for overflow handling */}
            <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                <div className={cn(
                  "absolute top-0 right-0 w-32 h-32 bg-gradient-to-br rounded-bl-full -mr-16 -mt-16",
                  theme === 'light' ? "from-black/5 to-transparent" : "from-white/5 to-transparent"
                )} />
                <div className={cn(
                  "absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr rounded-tr-full -ml-12 -mb-12",
                  theme === 'light' ? "from-black/5 to-transparent" : "from-white/5 to-transparent"
                )} />
            </div>
            
            {/* Header */}
            <div className="text-center space-y-1">
              <h3 className={cn(
                "font-serif text-lg md:text-xl tracking-wide transition-colors",
                theme === 'light' ? "text-black/90" : "text-white/90"
              )}>{t.app?.title || "Lumin Tarot"}</h3>
            </div>
            
            {/* Quote Content */}
            <div className="relative py-4 md:py-8 px-2">
                <div className={cn(
                  "relative z-10 font-serif text-sm md:text-lg leading-relaxed text-center px-2 md:px-6 italic break-words transition-colors",
                  theme === 'light' ? "text-black/80" : "text-white/80"
                )}>
                    {quote}
                </div>
            </div>

            {/* Context/Footer */}
            <div className={cn(
              "border-t pt-6 text-center space-y-2 transition-colors",
              theme === 'light' ? "border-black/5" : "border-white/10"
            )}>
                {question && (
                    <div className={cn(
                      "text-[10px] md:text-xs font-medium tracking-wide uppercase px-4 break-words transition-colors",
                      theme === 'light' ? "text-black/40" : "text-white/40"
                    )}>
                        {question}
                    </div>
                )}
                <div className={cn(
                  "text-[10px] pt-2 font-mono transition-colors",
                  theme === 'light' ? "text-black/30" : "text-white/30"
                )}>
                    {domain}
                </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-white/50 backdrop-blur-sm border-t border-black/5 flex justify-between items-center">
           <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-black/60 hover:text-black">
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </Button>

           <div className="flex gap-2">
            <Button variant="outline" onClick={handleCopy} className="gap-2">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t.share.copied : t.share.copy_text}
            </Button>
            <Button onClick={handleDownload} disabled={isGenerating} className="gap-2 bg-black text-white hover:bg-black/80">
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {t.share.save_image}
            </Button>
           </div>
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
