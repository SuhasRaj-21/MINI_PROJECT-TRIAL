import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am EcoTracker AI Copilot. How can I assist you with urban pollution analytics today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response delay based on enterprise grade backend
    setTimeout(() => {
      let aiResponse = "I'm analyzing the real-time sensor streams and historical models. Please check the Predictive Forecast tab for detailed hotspot probabilities.";
      
      const lowerInput = userMessage.toLowerCase();
      if (lowerInput.includes('aqi near') || lowerInput.includes('aqi in')) {
        aiResponse = "Current simulation models predict AQI levels will spike to 142 (Unhealthy for Sensitive Groups) in that zone due to peak traffic hours between 6 PM and 8 PM.";
      } else if (lowerInput.includes('route') || lowerInput.includes('divert')) {
        aiResponse = "I recommend taking the Outer Ring Road. While it adds 2.4km to your journey, it reduces your PM2.5 exposure by 45%.";
      } else if (lowerInput.includes('health') || lowerInput.includes('score')) {
        aiResponse = "The City Health Index is currently at Grade B. Sustained traffic congestion in Zone A is negatively impacting our overall sustainability metrics.";
      }

      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-xl hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all z-50 flex items-center justify-center hover:scale-105 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
      >
        <Sparkles className="absolute top-2 right-2 text-white w-3 h-3 animate-ping" />
        <MessageSquare size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-80 md:w-96 h-[500px] bg-[#1E293B] border border-slate-700 shadow-2xl rounded-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-[#0F172A] border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 p-0.5">
                  <div className="w-full h-full bg-[#0F172A] rounded-full flex items-center justify-center">
                    <Bot size={16} className="text-sky-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">AI Copilot</h3>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] text-slate-400 font-medium tracking-wide">ONLINE</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-100 transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#0F172A]/50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-sm shadow-md' 
                        : 'bg-[#1E293B] text-slate-200 border border-slate-700 rounded-bl-sm shadow-sm leading-relaxed'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-[#1E293B] border border-slate-700 px-4 py-3 rounded-2xl rounded-bl-sm flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-[#0F172A] border-t border-slate-700">
              <form onSubmit={handleSend} className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about hotspots or routes..."
                  className="w-full bg-[#1E293B] border border-slate-700 text-slate-200 text-sm rounded-xl pl-4 pr-10 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-500"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="absolute right-2 p-1.5 text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
