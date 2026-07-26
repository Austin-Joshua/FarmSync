import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, X, Send, Bot, User, 
  Sparkles, Minimize2, Maximize2, 
  Mic
} from 'lucide-react';
import ApiService from '../services/api';

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
        text: (response as any).data?.response || (response as any).response || "I'm sorry, I couldn't process that request.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat failed:', error);
      
      // Fallback local expert chatbot response
      const lowercaseInput = input.toLowerCase();
      let reply = "I'm sorry, the connection to our server is currently unstable. How else can I assist you with your crops or IoT sensors?";
      if (lowercaseInput.includes("hello") || lowercaseInput.includes("hi") || lowercaseInput.includes("hey")) {
        reply = "Hello! I'm your local fallback agricultural assistant. How can I help you today?";
      } else if (lowercaseInput.includes("crop") || lowercaseInput.includes("sow") || lowercaseInput.includes("plant")) {
        reply = "For optimal crop growth, ensure you check the local weather forecasts and match your soil moisture level. You can use our Crop Recommendation tool in the ML panel for precise analytics.";
      } else if (lowercaseInput.includes("pest") || lowercaseInput.includes("insect") || lowercaseInput.includes("bug")) {
        reply = "Pests can quickly damage yields. I recommend checking our Pest Risk Prediction tool, ensuring proper field aeration, or applying organic neem oil solutions if threat levels are medium.";
      } else if (lowercaseInput.includes("disease") || lowercaseInput.includes("leaf") || lowercaseInput.includes("spot")) {
        reply = "Leaf spotting or yellowing could indicate a fungal infection or nutrient deficiency. Try uploading a picture of the leaves to our Disease Detection tool for an automated scan.";
      } else if (lowercaseInput.includes("weather") || lowercaseInput.includes("rain") || lowercaseInput.includes("temperature")) {
        reply = "Keeping tabs on weather is crucial. Make sure your fields have proper drainage to handle excess rainfall, and schedule irrigation during cooler early morning hours to minimize evaporation.";
      } else if (lowercaseInput.includes("iot") || lowercaseInput.includes("sensor") || lowercaseInput.includes("telemetry")) {
        reply = "Our IoT Dashboard displays live telemetry (soil moisture, temperature, and NPK levels). Ensure your physical nodes are calibrated and transmitting properly.";
      } else if (lowercaseInput.includes("yield") || lowercaseInput.includes("predict")) {
        reply = "Yield prediction depends on several parameters: crop variety, acreage, fertilizer input, and climate conditions. Please check out the Yield Predictor feature for precise estimates.";
      }
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: reply,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open AI Assistant"
        className="fixed bottom-24 right-8 w-16 h-16 rounded-full bg-accent hover:bg-accent text-white shadow-2xl shadow-accent/40 flex items-center justify-center hover:animate-none transition-all z-50 group"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-primary-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <MessageSquare size={28} />
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent border-4 border-white dark:border-gray-900 rounded-full" />
      </button>
    );
  }

  return (
    <div 
      className={`
        fixed bottom-24 right-8 w-[380px] sm:w-[420px] max-w-[calc(100vw-2rem)] flex flex-col bg-white dark:bg-[#0d1510] rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-border overflow-hidden transition-all duration-500 z-50
        ${isMinimized ? 'h-[80px]' : 'h-[600px] max-h-[80vh]'}
      `}
    >
      {/* Header */}
      <div className="bg-accent p-5 flex items-center justify-between text-white relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/50 to-emerald-500/50 opacity-30" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Bot size={22} className="animate-pulse" />
          </div>
          <div>
            <h3 className="font-black font-medium text-sm">FarmSync AI</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Assistant Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 relative z-10">
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            aria-label={isMinimized ? "Maximize AI Assistant" : "Minimize AI Assistant"}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            aria-label="Close AI Assistant"
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
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-primary-100 text-accent' : 'bg-gray-100 dark:bg-white/5 text-accent'}`}>
                  {msg.sender === 'user' ? <User size={16} /> : <Sparkles size={16} />}
                </div>
                <div className={`
                  max-w-[80%] p-4 rounded-2xl text-sm font-medium leading-relaxed
                  ${msg.sender === 'user' 
                    ? 'bg-accent text-white rounded-tr-none shadow-lg shadow-accent/10' 
                    : 'bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-tl-none border border-border'}
                `}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 text-accent flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div className="bg-white dark:bg-white/5 p-4 rounded-2xl rounded-tl-none border border-border flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-accent rounded-full [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-5 bg-white dark:bg-[#0d1510] border-t border-border">
            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-2 flex items-center gap-2 border border-border">
              <button aria-label="Voice input" className="p-2.5 text-gray-400 hover:text-accent transition-all">
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
                aria-label="Send message"
                className="p-2.5 bg-accent hover:bg-accent disabled:bg-gray-400 text-white rounded-xl shadow-lg shadow-accent/20 transition-all flex items-center justify-center active:scale-90"
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
