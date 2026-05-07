import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, X, Send, Bot, User, Loader2, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { useTrades } from "../features/trades/TradeContext";
import { useAuth } from "../features/auth/AuthContext";
import { getChatResponse } from "../services/geminiService";
import { cn } from "../lib/utils";
import { Paywall } from "./Paywall";
import { Lock } from "lucide-react";

interface Message {
  role: "user" | "model";
  text: string;
}

export function ChatBot() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<Message[]>([
    { role: "model", text: "Hello! I'm your Black Oak AI Assistant. How can I help you with your trading today?" }
  ]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [paywallOpen, setPaywallOpen] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  
  // DRAG AND POSITION LOGIC
  const constraintsRef = React.useRef(null);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  
  const { trades } = useTrades();
  const { profile } = useAuth();

  const isElite = profile?.plan === 'ELITE';
  const isEnabled = profile?.floatingChatbotEnabled ?? true;

  // Initialize position from localStorage
  React.useEffect(() => {
    const savedPos = localStorage.getItem('chatbot-position');
    if (savedPos) {
      try {
        setPosition(JSON.parse(savedPos));
      } catch (e) {
        console.error("Failed to parse chatbot position", e);
      }
    }
  }, []);

  const toggleChat = () => {
    if (isDragging) return; // Don't toggle if we were just dragging
    if (!isElite) {
      setPaywallOpen(true);
      return;
    }
    setIsOpen(!isOpen);
  };

  const handleDragEnd = (event: any, info: any) => {
    // Small delay to prevent tap triggering toggleChat after drag
    setTimeout(() => setIsDragging(false), 50);

    const screenWidth = window.innerWidth;
    const snapThreshold = screenWidth / 2;
    const currentX = info.point.x;
    const currentY = info.point.y;
    
    // Calculate snap destination
    // info.offset is the drag distance from start
    // info.point is absolute coordinates
    
    // For snapping, we update the position state to trigger the animate prop
    const finalX = currentX < snapThreshold ? -info.point.x + 20 : screenWidth - info.point.x - 80;
    
    const finalPos = { x: info.offset.x + (currentX < snapThreshold ? -currentX + 20 : screenWidth - currentX - 80), y: info.offset.y };
    setPosition(finalPos);
    localStorage.setItem('chatbot-position', JSON.stringify(finalPos));
  };

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setIsLoading(true);

    // Prepare history for API
    const history = messages.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    const response = await getChatResponse(userMessage, history, trades, profile);
    
    setMessages(prev => [...prev, { role: "model", text: response || "I couldn't generate a response." }]);
    setIsLoading(false);
  };

  if (!isEnabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]" ref={constraintsRef}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              height: isMinimized ? "64px" : "500px"
            }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn(
              "fixed bottom-24 right-6 mb-4 w-[350px] md:w-[400px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-950 flex flex-col transition-all duration-300 pointer-events-auto",
              isMinimized && "w-[200px]"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-blue-600 p-4 text-white cursor-grab active:cursor-grabbing">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5" />
                <span className="font-bold text-sm uppercase tracking-wider">Black Oak AI</span>
              </div>
              <div className="flex items-center space-x-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-gray-900/50"
                >
                  {messages.map((msg, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "flex w-full",
                        msg.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div className={cn(
                        "flex max-w-[85%] space-x-2",
                        msg.role === "user" ? "flex-row-reverse space-x-reverse" : "flex-row"
                      )}>
                        <div className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                          msg.role === "user" ? "bg-blue-100 dark:bg-blue-900/30" : "bg-slate-200 dark:bg-gray-800"
                        )}>
                          {msg.role === "user" ? (
                            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <Bot className="h-4 w-4 text-slate-600 dark:text-gray-400" />
                          )}
                        </div>
                        <div className={cn(
                          "rounded-2xl px-4 py-2 text-sm shadow-sm",
                          msg.role === "user" 
                            ? "bg-blue-600 text-white rounded-tr-none" 
                            : "bg-white text-slate-700 dark:bg-gray-800 dark:text-gray-200 rounded-tl-none border border-slate-100 dark:border-gray-700"
                        )}>
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex space-x-2">
                        <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-gray-800 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-slate-600 dark:text-gray-400" />
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none px-4 py-2 border border-slate-100 dark:border-gray-700 shadow-sm">
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-100 dark:border-gray-800 bg-white dark:bg-gray-950">
                  <form 
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex items-center space-x-2"
                  >
                    <input 
                      type="text" 
                      placeholder="Ask about your trades..." 
                      className="flex-1 bg-slate-100 dark:bg-gray-900 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                    />
                    <Button 
                      size="icon" 
                      className="rounded-full h-9 w-9 bg-blue-600 hover:bg-blue-700"
                      disabled={!input.trim() || isLoading}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        dragMomentum={false}
        initial={position}
        animate={isDragging ? {} : position}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 right-6 md:bottom-28 md:right-8 z-[101] pointer-events-auto"
      >
        <button
          onClick={toggleChat}
          className={cn(
            "h-14 w-14 rounded-full shadow-[0_10px_30px_rgba(59,130,246,0.4)] flex items-center justify-center transition-all duration-300 relative overflow-hidden group",
            isOpen ? "bg-slate-200 text-slate-600 dark:bg-gray-800 dark:text-gray-200" : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
          )}
        >
          {/* Glow Effect */}
          {!isOpen && (
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 bg-blue-400 blur-xl mix-blend-overlay"
            />
          )}
          
          <div className="relative z-10">
            {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
          </div>
          
          {!isElite && !isOpen && (
            <div className="absolute -top-1 -right-1 z-20">
              <Lock className="h-5 w-5 bg-white rounded-full p-1 text-slate-400 border border-slate-100 shadow-sm" />
            </div>
          )}
        </button>
      </motion.div>

      <Paywall 
        isOpen={paywallOpen} 
        onClose={() => setPaywallOpen(false)} 
        featureName="AI Performance Assistant" 
        requiredPlan="ELITE" 
      />
    </div>
  );
}
