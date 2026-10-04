import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  ChevronDown,
  CornerDownLeft,
  Loader2,
  Maximize2,
  Minimize2,
  RefreshCw,
  Send,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { aiService } from "../../services/aiService";

const SUGGESTED_PROMPTS = [
  "What local shops are available on NearMart?",
  "How fast is local delivery?",
  "What products or categories can I browse?",
  "How do return policies work?",
];

const ChatBotModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! 👋 I'm your **NearMart Assistant**. How can I help you discover nearby stores, products, or answer shopping questions today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, loading]);

  const handleSend = async (customPrompt) => {
    const textToSend = typeof customPrompt === "string" ? customPrompt : inputMessage;
    const prompt = textToSend.trim();
    if (!prompt || loading) return;

    setError(null);
    setInputMessage("");

    const userMsg = {
      id: `user-${Date.now()}`,
      role: "user",
      content: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Format session history for API
      const historyPayload = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await aiService.sendMessage(prompt, historyPayload);

      const botReply = res?.reply || "I'm sorry, I couldn't generate a response. Please try again.";

      const assistantMsg = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        provider: res?.provider,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setError("Unable to connect to AI Assistant. Please check your connection.");
      const errorMsg = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: "Sorry! Something went wrong while getting an answer. You can try asking again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content:
          "Chat session reset! How else can I assist your NearMart shopping today?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setError(null);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsOpen((prev) => !prev)}
          className="group relative flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-r from-(--color-primary) to-(--color-primary-dark) text-white shadow-[0_10px_25px_-5px_rgba(6,78,59,0.5)] transition-all hover:shadow-[0_15px_30px_-5px_rgba(6,78,59,0.7)]"
          aria-label="Open NearMart AI Assistant"
        >
          {isOpen ? (
            <ChevronDown className="h-7 w-7 transition-transform" />
          ) : (
            <>
              <Bot className="h-7 w-7 transition-transform group-hover:scale-110" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400">
                <span className="h-2 w-2 animate-ping rounded-full bg-white" />
              </span>
            </>
          )}
        </motion.button>
      </div>

      {/* Chat Window Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`fixed bottom-24 right-4 z-50 flex flex-col overflow-hidden rounded-3xl border border-(--color-green-soft)/40 bg-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] transition-all sm:right-6 ${
              isExpanded
                ? "h-[80vh] w-[92vw] max-w-3xl sm:w-[700px]"
                : "h-[560px] w-[calc(100vw-2rem)] sm:w-[420px]"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 bg-linear-to-r from-(--color-primary-dark) to-(--color-primary) px-4 py-3.5 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-xs">
                  <Sparkles className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold tracking-tight">NearMart AI Assistant</h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-200/90">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Always Online · Powered by Local AI</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-white/80">
                <button
                  type="button"
                  onClick={clearChat}
                  title="Reset conversation"
                  className="rounded-lg p-1.5 hover:bg-white/15 hover:text-white"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpanded((prev) => !prev)}
                  title={isExpanded ? "Collapse" : "Expand"}
                  className="hidden rounded-lg p-1.5 hover:bg-white/15 hover:text-white sm:block"
                >
                  {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  className="rounded-lg p-1.5 hover:bg-white/15 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto bg-slate-50/60 p-4 space-y-4 text-xs sm:text-sm">
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isUser
                          ? "bg-slate-800 text-white"
                          : "bg-emerald-100 text-(--color-primary-dark) border border-emerald-300/60"
                      }`}
                    >
                      {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>

                    <div
                      className={`group relative max-w-[80%] rounded-2xl px-4 py-3 shadow-xs ${
                        isUser
                          ? "rounded-tr-xs bg-(--color-primary) text-white"
                          : msg.isError
                            ? "rounded-tl-xs bg-red-50 text-red-800 border border-red-200"
                            : "rounded-tl-xs bg-white text-slate-800 border border-slate-200/80"
                      }`}
                    >
                      <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
                      <span
                        className={`mt-1.5 block text-[10px] ${
                          isUser ? "text-emerald-100/80 text-right" : "text-slate-400"
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {loading && (
                <div className="flex items-start gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-(--color-primary-dark) border border-emerald-300/60">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl rounded-tl-xs bg-white border border-slate-200/80 px-4 py-3 shadow-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                      <span className="ml-1 text-xs text-slate-400 font-medium">NearMart AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompts */}
            {messages.length <= 2 && !loading && (
              <div className="border-t border-slate-100 bg-white px-3 py-2">
                <p className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Suggested Questions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleSend(prompt)}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-(--color-primary) hover:bg-emerald-50 hover:text-(--color-primary)"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="border-t border-slate-200 bg-white p-3"
            >
              <div className="relative flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about shops, products, delivery..."
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-3.5 pr-11 text-xs text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-(--color-primary) focus:bg-white focus:ring-2 focus:ring-(--color-primary)/15 sm:text-sm"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || loading}
                  className="absolute right-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-(--color-primary) text-white transition-all hover:bg-(--color-primary-dark) disabled:opacity-40 disabled:hover:bg-(--color-primary)"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBotModal;
