import React, { useState, useEffect, useRef } from "react";
import { useChat } from "ai/react";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowUp, X, Loader2, Share2, Quote } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuthStore } from "@/store/useAuthStore";
import { AuthModal } from "@/components/auth/AuthModal";
import { Checkbox } from "@/components/ui/checkbox";
import { ShareModal } from "./ShareModal";
import { QuoteShareModal } from "./QuoteShareModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getTranslation } from "@/lib/i18n";

interface ChatInterfaceProps {
  onClose?: () => void;
}

export function ChatInterface({ onClose }: ChatInterfaceProps) {
  const { selectedSpread, placedCards, isReading, startReading, sessionId, language, chatHistory, currentQuestion, setQuestion, isLoadingHistory } = useStore();
  const t = getTranslation(language);
  const { user } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLoginReminder, setShowLoginReminder] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const lastProcessedMessageId = useRef<string | null>(null);

  // Quote Share State
  const [selectedText, setSelectedText] = useState("");
  const [quoteToShare, setQuoteToShare] = useState("");
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  // Share & Selection State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<Set<string>>(new Set());
  const [showShareModal, setShowShareModal] = useState(false);

  const { messages, append, input, handleInputChange, handleSubmit, isLoading, setInput, setMessages } = useChat({
    api: "/api/chat",
    body: {
      sessionId,
      context: {
        spread: selectedSpread,
        cards: Object.values(placedCards),
        question: currentQuestion,
      },
    },
    initialMessages: chatHistory,
  });

  // Clear suggestions when loading starts
  useEffect(() => {
    if (isLoading) {
      setSuggestedQuestions([]);
    }
  }, [isLoading]);

  // Fetch suggestions when AI finishes responding
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!isLoading && messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.role === 'assistant' && lastMessage.id !== lastProcessedMessageId.current) {
          lastProcessedMessageId.current = lastMessage.id;
          try {
            const response = await fetch('/api/chat/suggestions', {
              method: 'POST',
              body: JSON.stringify({
                messages: messages,
                context: {
                  spread: selectedSpread,
                  cards: Object.values(placedCards),
                  question: currentQuestion,
                }
              })
            });
            const data = await response.json();
            if (data.questions && Array.isArray(data.questions)) {
              setSuggestedQuestions(data.questions);
            }
          } catch (error) {
            console.error('Failed to fetch suggestions:', error);
          }
        }
      }
    };

    fetchSuggestions();
  }, [isLoading, messages, selectedSpread, placedCards, currentQuestion]);

  // Handle Text Selection
  useEffect(() => {
    const updateSelection = () => {
      const selection = window.getSelection();
      
      if (!selection || selection.isCollapsed) {
        setSelectedText("");
        return;
      }

      const text = selection.toString().trim();
      
      if (!text) {
        setSelectedText("");
        return;
      }

      // Handle cases where range count is 0
      if (selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      
      // Check if selection is within chat container
      if (chatContainerRef.current && chatContainerRef.current.contains(range.commonAncestorContainer)) {
        const rect = range.getBoundingClientRect();
        
        if (rect.width > 0 && rect.height > 0) {
            setSelectedText(text);
        }
      } else if (chatContainerRef.current) {
        // Optional: Allow selection if it intersects with the container
        const containerRect = chatContainerRef.current.getBoundingClientRect();
        const rect = range.getBoundingClientRect();
        
        const intersects = !(rect.right < containerRect.left || 
                           rect.left > containerRect.right || 
                           rect.bottom < containerRect.top || 
                           rect.top > containerRect.bottom);
        
        if (intersects && rect.width > 0 && rect.height > 0) {
            setSelectedText(text);
        } else {
            setSelectedText("");
        }
      }
    };

    // Debounce selection change to avoid excessive updates on mobile
    let timeoutId: NodeJS.Timeout;
    const handleSelectionChange = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateSelection, 100);
    };

    document.addEventListener("mouseup", updateSelection);
    document.addEventListener("keyup", updateSelection); 
    document.addEventListener("selectionchange", handleSelectionChange);
    document.addEventListener("touchend", () => setTimeout(updateSelection, 100)); // Delay for mobile selection stability

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mouseup", updateSelection);
      document.removeEventListener("keyup", updateSelection);
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.removeEventListener("touchend", updateSelection);
    };
  }, []);

  // Auto-start reading when component mounts if not already reading
  useEffect(() => {
    if (!isReading && currentQuestion && messages.length === 0) {
      if (!user) {
        setShowLoginReminder(true);
        return;
      }

      startReading();
      append({
        role: "user",
        content: currentQuestion,
      }, {
        body: {
          context: {
            spread: selectedSpread,
            cards: Object.values(placedCards),
            question: currentQuestion,
          },
        },
      });
    }
  }, [isReading, currentQuestion, messages.length, user, startReading, append, selectedSpread, placedCards]);

  // Sync chat history when it changes (e.g. loading a session)
  useEffect(() => {
    if (chatHistory) {
        setMessages(chatHistory);
    }
  }, [chatHistory, setMessages]);

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

    if (!user) {
        setShowLoginReminder(true);
        return;
    }

    setQuestion(question);
    startReading();
    // Trigger the first AI response
    await append({
      role: "user",
      content: question,
    }, {
      body: {
        context: {
          spread: selectedSpread,
          cards: Object.values(placedCards),
          question: question,
        },
      },
    });
    setInput("");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    if (!user) {
        e.preventDefault();
        setShowLoginReminder(true);
        return;
    }
    return isReading ? handleSubmit(e) : handleStartReading(e);
  };

  const handleSuggestionClick = async (question: string) => {
    if (!user) {
        setShowLoginReminder(true);
        return;
    }
    
    setSuggestedQuestions([]);
    setQuestion(question);
    
    await append({
      role: "user",
      content: question,
    }, {
      body: {
        context: {
          spread: selectedSpread,
          cards: Object.values(placedCards),
          question: question,
        },
      },
    });
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedMessageIds(new Set());
  };

  const toggleMessageSelection = (id: string) => {
    const newSelected = new Set(selectedMessageIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedMessageIds(newSelected);
  };

  // Chat View
  return (
    <div className="w-full h-full flex flex-col relative bg-white/50 backdrop-blur-sm rounded-3xl overflow-hidden">
      {/* Header - Minimal */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        {isSelectionMode ? (
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm border border-black/5">
              <Button variant="ghost" size="sm" onClick={() => setIsSelectionMode(false)} className="h-7 text-xs px-2">
                {t.chat.cancel_select || "Cancel"}
              </Button>
              <div className="w-[1px] h-4 bg-black/10" />
              <Button 
                size="sm" 
                onClick={() => setShowShareModal(true)} 
                disabled={selectedMessageIds.size === 0}
                className="h-7 text-xs px-3 bg-black text-white hover:bg-black/80"
              >
                {t.chat.confirm_share || "Share"} ({selectedMessageIds.size})
              </Button>
            </div>
        ) : (
            <div className="flex items-center gap-2">
              {selectedText && (
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm border border-black/5 animate-in fade-in zoom-in duration-200">
                   <Button
                     size="sm"
                     onMouseDown={(e) => e.preventDefault()}
                     onClick={() => {
                       setQuoteToShare(selectedText);
                       setShowQuoteModal(true);
                       window.getSelection()?.removeAllRanges();
                     }}
                     className="h-7 text-xs px-3 bg-black text-white hover:bg-black/80 gap-2"
                   >
                     <Quote className="w-3 h-3" />
                     {t.share.quote_action || "Quote"}
                   </Button>
                   <div className="w-[1px] h-4 bg-black/10" />
                   <button
                     onMouseDown={(e) => e.preventDefault()}
                     onClick={() => {
                       window.getSelection()?.removeAllRanges();
                     }}
                     className="p-1 hover:bg-black/5 rounded-full"
                     title={t.chat.cancel_select || "Cancel"}
                   >
                     <X className="w-3 h-3 opacity-50" />
                   </button>
                 </div>
              )}
              
              <button 
                  onClick={toggleSelectionMode}
                  className="p-2 hover:bg-black/5 rounded-full transition-colors bg-white/50 backdrop-blur-sm group"
                  title={t.chat.share_button || "Share"}
              >
                  <Share2 className="w-4 h-4 opacity-50 group-hover:opacity-80 transition-opacity" />
              </button>
            </div>
        )}
        
        <button 
            onClick={onClose}
            className="p-2 hover:bg-black/5 rounded-full transition-colors bg-white/50 backdrop-blur-sm"
          >
            <X className="w-4 h-4 opacity-50" />
          </button>
      </div>

      {/* Messages Area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 flex flex-col mask-image-gradient"
      >
        <div className="w-full space-y-6 pb-4">
          {messages.map((m) => (
            <div key={m.id} className="flex gap-3 w-full group">
               {isSelectionMode && (
                   <div className="pt-2 pl-1 animate-in fade-in slide-in-from-left-2 duration-200">
                     <Checkbox 
                        checked={selectedMessageIds.has(m.id)}
                        onCheckedChange={() => toggleMessageSelection(m.id)}
                        className="data-[state=checked]:bg-black data-[state=checked]:border-black"
                     />
                   </div>
               )}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex flex-col gap-2 w-full items-start transition-all duration-300", isSelectionMode && "cursor-pointer hover:opacity-80")}
                  onClick={() => isSelectionMode && toggleMessageSelection(m.id)}
                >
                  <div className={cn(
                    "py-2 text-sm leading-relaxed text-left max-w-none w-full",
                    m.role === "user" 
                      ? "text-black font-medium font-serif whitespace-pre-wrap px-4 py-3 bg-[#faf9f6] border border-black/5 rounded-2xl rounded-tr-sm italic text-black/60" 
                      : "text-black/80 prose prose-neutral prose-sm max-w-none prose-p:font-serif prose-headings:font-serif prose-headings:font-normal prose-strong:font-medium prose-a:text-black prose-a:underline prose-li:marker:text-black/40 px-2"
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
            </div>
          ))}
          {isLoadingHistory && (
             <div className="flex justify-center py-4 w-full">
               <Loader2 className="w-5 h-5 animate-spin text-black/20" />
             </div>
          )}
          {isLoading && (
             <div className="flex items-center justify-center gap-1 py-8 opacity-50">
               <motion.div 
                 animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }} 
                 transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                 className="w-2 h-2 bg-[#D4AF37] rounded-full blur-[1px]" 
               />
               <motion.div 
                 animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }} 
                 transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                 className="w-2 h-2 bg-[#D4AF37] rounded-full blur-[1px]" 
               />
               <motion.div 
                 animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }} 
                 transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                 className="w-2 h-2 bg-[#D4AF37] rounded-full blur-[1px]" 
               />
               <span className="ml-3 text-xs font-serif text-[#D4AF37] tracking-widest uppercase">
                 {language === 'zh' ? "正在连接流明..." : "Consulting Lumin..."}
               </span>
             </div>
          )}
          
          {/* Suggested Questions */}
          {suggestedQuestions.length > 0 && !isLoading && !isSelectionMode && (
            <div className="flex flex-wrap gap-2 w-full justify-start pt-2 pb-4">
               
               {suggestedQuestions.map((q, idx) => (
                 <motion.button
                   initial={{ opacity: 0, y: 5 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: idx * 0.1 }}
                   key={idx}
                   onClick={() => handleSuggestionClick(q)}
                   className="text-sm text-left bg-white/40 border border-black/5 hover:bg-white/80 hover:border-black/10 text-black/70 px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow-md backdrop-blur-sm"
                 >
                   {q}
                 </motion.button>
               ))}
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input - At Bottom */}
      {!isSelectionMode && (
          <div className="p-4 pt-2 lg:p-6 lg:pt-2">
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleFormSubmit} 
              className="relative flex flex-col gap-2"
            >
              <div className="relative">
                <textarea
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleFormSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
                    }
                  }}
                  placeholder={isReading ? t.chat.placeholder_followup : t.chat.placeholder_start}
                  className="w-full h-24 p-4 bg-transparent focus:outline-none resize-none text-sm font-light placeholder:text-black/40"
                />
                
                {/* Custom Bottom Border */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-black/20 to-transparent" />

                <Button 
                  type="submit"
                  size="icon"
                  disabled={isLoading || !input.trim()}
                  className="absolute right-3 bottom-3 h-8 w-8 rounded-lg bg-black text-white hover:bg-black/80 shadow-md transition-all"
                >
                  <ArrowUp className="w-4 h-4" />
                </Button>
              </div>
            </motion.form>
          </div>
      )}
      
      {/* Login Reminder */}
      <Dialog open={showLoginReminder} onOpenChange={setShowLoginReminder}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t.auth?.login_required || "Sign in to Consult"}</DialogTitle>
            <DialogDescription>
              {t.auth?.login_message || "Please sign in to start the AI interpretation of your spread."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowLoginReminder(false)}>
              {t.auth?.cancel || "Cancel"}
            </Button>
            <Button onClick={() => {
              setShowLoginReminder(false);
              setShowAuthModal(true);
            }}>
              {t.auth?.login_action || "Sign In"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      
      <ShareModal 
        open={showShareModal} 
        onOpenChange={setShowShareModal}
        selectedMessages={messages.filter(m => selectedMessageIds.has(m.id))}
        placedCards={placedCards}
        spread={selectedSpread}
        question={currentQuestion}
      />



      <QuoteShareModal 
        open={showQuoteModal} 
        onOpenChange={setShowQuoteModal}
        quote={quoteToShare}
        question={currentQuestion}
      />
    </div>
  );
}
