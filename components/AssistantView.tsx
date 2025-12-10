import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, Loader2 } from 'lucide-react';
import { askGeminiAssistant } from '../services/geminiService';
import { Ingredient, Product } from '../types';

interface AssistantViewProps {
  ingredients: Ingredient[];
  products: Product[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AssistantView: React.FC<AssistantViewProps> = ({ ingredients, products }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Xin chào! Mình là Bếp Phó AI. Bạn cần giúp gì hôm nay? Mình có thể gợi ý công thức, tính giá cost, hoặc viết caption bán hàng giúp bạn.' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Prepare context
    const context = JSON.stringify({
      availableIngredients: ingredients.map(i => `${i.name} (${i.currentStock} ${i.unit})`),
      currentProducts: products.map(p => `${p.name} - Giá: ${p.sellingPrice}`),
    });

    const responseText = await askGeminiAssistant(userMsg.content, context);

    setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
    setIsLoading(false);
  };

  return (
    <div className="h-screen flex flex-col p-4 md:p-6 max-w-5xl mx-auto pb-20 md:pb-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-rose-500 to-pink-500 text-white flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold">Bếp Phó AI</h2>
            <p className="text-xs text-rose-100">Hỗ trợ bởi Google Gemini</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-gray-800 text-white' : 'bg-rose-100 text-rose-600'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user' 
                  ? 'bg-gray-800 text-white rounded-tr-none' 
                  : 'bg-white border border-gray-100 text-gray-700 shadow-sm rounded-tl-none'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                 <Bot size={16} />
              </div>
              <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                 <Loader2 size={16} className="animate-spin text-rose-500" />
                 <span className="text-sm text-gray-500">Đang suy nghĩ...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-100">
           <div className="relative flex items-center gap-2">
             <input 
               type="text" 
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
               placeholder="Hỏi về công thức, giá vốn, hoặc ý tưởng bánh mới..."
               className="flex-1 bg-gray-100 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none transition-all"
             />
             <button 
               onClick={handleSend}
               disabled={isLoading || !input.trim()}
               className="bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors shadow-md shadow-rose-200"
             >
               <Send size={18} />
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AssistantView;
