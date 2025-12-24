import React, { useState, useEffect, useRef } from "react";
import { useChat } from "ai/react";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Send, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AIConfig } from "@/types/tarot";

interface ChatInterfaceProps {
  config: AIConfig;
  onClose?: () => void;
}

export function ChatInterface({ config, onClose }: ChatInterfaceProps) {
  const { selectedSpread, placedCards, isReading, startReading } = useStore();
  const [initialQuestion, setInitialQuestion] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, append, input, handleInputChange, handleSubmit, isLoading, setInput } = useChat({
    api: "/api/chat",
    body: {
      config,
      context: {
        spread: selectedSpread,
        cards: Object.values(placedCards),
        question: initialQuestion,
      },
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleStartReading = async (e: React.FormEvent) => {
    e.preventDefault();
    const question = input.trim();
    if (!question) return;

    setInitialQuestion(question);
    startReading();
    // Trigger the first AI response
    await append({
      role: "user",
      content: question,
    }, {
      body: {
        config,
        context: {
          spread: selectedSpread,
          cards: Object.values(placedCards),
          question: question,
        },
      },
    });
    setInput("");
  };

  const onSubmit = isReading ? handleSubmit : handleStartReading;

  // Chat View
  return (
    <div className="w-full h-full flex flex-col relative bg-white/50 backdrop-blur-sm rounded-3xl overflow-hidden">
      {/* Header - Minimal */}
      <div className="absolute top-4 right-4 z-50">
        <button 
            onClick={onClose}
            className="p-2 hover:bg-black/5 rounded-full transition-colors bg-white/50 backdrop-blur-sm"
          >
            <X className="w-4 h-4 opacity-50" />
          </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6 flex flex-col mask-image-gradient">
        <div className="w-full space-y-6 pb-4">
          {messages.map((m) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={m.id} 
              className="flex flex-col gap-2 w-full items-start"
            >
              <div className={cn(
                "py-2 text-sm leading-relaxed text-left max-w-none",
                m.role === "user" 
                  ? "text-black font-medium font-serif whitespace-pre-wrap" 
                  : "text-black/80 prose prose-neutral prose-sm prose-p:font-serif prose-headings:font-serif prose-headings:font-normal prose-strong:font-medium prose-a:text-black prose-a:underline prose-li:marker:text-black/40"
              )}>
                {m.role === "user" ? (
                  m.content
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {m.content}
                  </ReactMarkdown>
                )}
              </div>
            </motion.div>
          ))}
          {isLoading && (
             <div className="flex items-center gap-2 py-2">
               <span className="w-1.5 h-1.5 bg-black/40 rounded-full animate-bounce" />
               <span className="w-1.5 h-1.5 bg-black/40 rounded-full animate-bounce [animation-delay:0.2s]" />
               <span className="w-1.5 h-1.5 bg-black/40 rounded-full animate-bounce [animation-delay:0.4s]" />
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input - At Bottom */}
      <div className="p-6 pt-2">
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={onSubmit} 
          className="relative flex flex-col gap-2"
        >
          <div className="relative">
            <textarea
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
                }
              }}
              placeholder={isReading ? "Ask a follow-up..." : "Ask your question..."}
              className="w-full h-24 p-4 bg-white/80 backdrop-blur-md border border-black/10 rounded-2xl shadow-sm focus:outline-none focus:ring-1 focus:ring-black/20 resize-none text-sm font-light placeholder:text-black/40"
            />
            <Button 
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              className="absolute right-3 bottom-3 h-8 w-8 rounded-lg bg-black text-white hover:bg-black/80 shadow-md transition-all"
            >
              <Send className="w-3 h-3" />
            </Button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
