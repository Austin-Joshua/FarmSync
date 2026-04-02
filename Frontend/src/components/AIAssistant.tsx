import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, X, Send, Bot, User, 
  Sparkles, Minimize2, Maximize2, 
  Mic
} from 'lucide-react';
import ApiService from '../services/api';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your FarmSync AI Assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await ApiService.sendMessageToAI(input);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: (response as any).response || "I'm sorry, I couldn't process that request.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat failed:', error);
      toast.error('AI Assistant is currently unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-primary-600 hover:bg-primary-500 text-white shadow-2xl shadow-primary-500/40 flex items-center justify-center animate-bounce hover:animate-none transition-all z-50 group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-primary-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <MessageSquare size={28} />
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white dark:border-gray-900 rounded-full" />
      </button>
    );
  }

  return (
    <div 
      className={`
        fixed bottom-8 right-8 w-[380px] sm:w-[420px] max-w-[calc(100vw-2rem)] flex flex-col bg-white dark:bg-[#0d1510] rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-white/5 overflow-hidden transition-all duration-500 z-50
        ${isMinimized ? 'h-[80px]' : 'h-[600px] max-h-[80vh]'}
      `}
    >
      {/* Header */}
      <div className="bg-primary-600 p-5 flex items-center justify-between text-white relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/50 to-emerald-500/50 opacity-30" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Bot size={22} className="animate-pulse" />
          </div>
          <div>
            <h3 className="font-black uppercase tracking-tighter italic text-sm">FarmSync AI</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Assistant Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 relative z-10">
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-gray-50/50 dark:bg-black/20"
          >
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 dark:bg-white/5 text-emerald-500'}`}>
                  {msg.sender === 'user' ? <User size={16} /> : <Sparkles size={16} />}
                </div>
                <div className={`
                  max-w-[80%] p-4 rounded-2xl text-sm font-medium leading-relaxed
                  ${msg.sender === 'user' 
                    ? 'bg-primary-600 text-white rounded-tr-none shadow-lg shadow-primary-500/10' 
                    : 'bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-tl-none border border-gray-100 dark:border-white/5'}
                `}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 text-emerald-500 flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div className="bg-white dark:bg-white/5 p-4 rounded-2xl rounded-tl-none border border-gray-100 dark:border-white/5 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-5 bg-white dark:bg-[#0d1510] border-t border-gray-100 dark:border-white/5">
            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-2 flex items-center gap-2 border border-gray-100 dark:border-white/5">
              <button className="p-2.5 text-gray-400 hover:text-primary-500 transition-all">
                <Mic size={20} />
              </button>
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask your smart farming assistant..."
                className="flex-1 bg-transparent py-2.5 px-2 text-sm font-bold placeholder:text-gray-400 focus:outline-none"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-primary-600 hover:bg-primary-500 disabled:bg-gray-400 text-white rounded-xl shadow-lg shadow-primary-500/20 transition-all flex items-center justify-center active:scale-90"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AIAssistant;
