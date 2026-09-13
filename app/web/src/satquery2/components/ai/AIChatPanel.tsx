'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Plus, Search, MapPin, Menu, Paperclip } from 'lucide-react';
import { useAIContext } from '../../services/aiContextBridge';
import { aiProvider, ChatMessage } from '../../services/aiProvider';

export default function AIChatPanel() {
  const { mapContext, watchZoneContext } = useAIContext();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [attachedZone, setAttachedZone] = useState<any>(null);
  const [showZoneDropdown, setShowZoneDropdown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image exceeds the supported size (5MB).");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAttachZone = (zoneType: string) => {
    setShowZoneDropdown(false);
    if (zoneType === 'current') {
      if (mapContext && mapContext.center) {
        setAttachedZone({ type: 'current', center: mapContext.center });
      } else {
        alert("Please pan or zoom the map on the right to load location data first.");
      }
    } else if (zoneType === 'aravalli') {
      setAttachedZone({ type: 'saved', name: 'Aravalli Range', center: { lat: 27.5, lng: 76.5 } });
    } else if (zoneType === 'yamuna') {
      setAttachedZone({ type: 'saved', name: 'Yamuna Flood Zone', center: { lat: 28.6, lng: 77.2 } });
    }
  };

  const handleSend = async (quickPrompt?: string) => {
    const messageText = quickPrompt || input;
    if (!messageText.trim() && !imageFile && !attachedZone) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText || (attachedZone ? 'Attached map zone.' : ''),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setIsThinking(true);

    try {
      const reply = await aiProvider.analyzeConversation({
        message: messageText,
        mapContext: attachedZone || mapContext,
        watchZoneContext: watchZoneContext,
        image: imageFile,
      });
      
      const aiReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        timestamp: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, aiReply]);
      setImageFile(null);
      setImagePreview(null);
      setAttachedZone(null);
    } catch (error) {
      const errReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Error: Intelligence service is temporarily unavailable.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errReply]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setImageFile(null);
    setImagePreview(null);
    setAttachedZone(null);
  };

  const quickPrompts = [
    { title: "Explain this legal provision", action: "Explain this legal provision" },
    { title: "Summarize this document", action: "Summarize this document" },
    { title: "Compare these two provisions", action: "Compare these two provisions" },
    { title: "Explain this in simple language", action: "Explain this in simple language" },
  ];

  return (
    <div className="flex h-full w-full bg-transparent text-slate-200 font-sans">
      
      {/* Sidebar - History */}
      <div className="w-[260px] flex-shrink-0 flex flex-col border-r border-white/5 bg-[#05070A]/50 backdrop-blur-sm h-full p-3 pt-6 gap-4 hidden md:flex">
        
        {/* Workspace selector mock */}
        <div className="bg-[#0f1420] border border-white/5 rounded-lg p-2.5 flex items-center justify-between cursor-pointer hover:bg-[#141a2a] transition-colors">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">S</div>
            <span className="text-sm font-semibold">SAT Reading Prep</span>
          </div>
          <Menu size={14} className="text-slate-400" />
        </div>

        {/* New Chat Button */}
        <button 
          onClick={clearChat}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium text-sm transition-colors shadow-lg shadow-blue-900/20"
        >
          <Plus size={18} />
          New Chat
        </button>

        {/* Search */}
        <div className="relative mt-2">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search history..." 
            className="w-full bg-[#0a0d14] border border-white/5 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500/50"
          />
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto mt-2">
          <p className="text-[10px] text-slate-500 text-center mt-10">No history yet</p>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative">
        <div className="px-6 py-4 border-b border-white/5 hidden md:flex">
          <span className="text-sm font-medium text-slate-400">New Conversation</span>
        </div>

        <div className="flex-1 overflow-y-auto w-full flex flex-col relative custom-scrollbar">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20 w-full max-w-3xl mx-auto h-full mt-[-10vh]">
              {/* Robot Icon */}
              <div className="w-20 h-20 rounded-full flex items-center justify-center border border-blue-500/20 mb-6 shadow-[0_0_30px_rgba(59,130,246,0.3)] relative overflow-hidden group bg-transparent">
                 <div className="absolute inset-0 bg-blue-500/10 group-hover:bg-blue-500/30 transition-colors animate-pulse" />
                 <img src="/robot-logo.png" alt="SatQuery AI" className="w-full h-full object-cover z-10" />
              </div>

              <h2 className="text-3xl font-bold text-white mb-2 text-center tracking-tight">How can SATQuery help you today?</h2>
              <p className="text-slate-400 text-sm mb-10 text-center max-w-md">
                Ask a satellite question, analyze a location, or explore insights.
              </p>

              {/* Suggestions 2x2 Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => void handleSend(prompt.action)}
                    className="p-4 rounded-xl bg-[#0a0d14]/80 border border-white/5 hover:bg-[#141a2a] hover:border-white/10 text-left transition-all group flex flex-col gap-1"
                  >
                    <span className="text-sm text-slate-300 group-hover:text-white font-medium">{prompt.title}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 w-full max-w-3xl mx-auto py-8 px-4 flex flex-col gap-8 pb-32">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-blue-500/20 overflow-hidden bg-black/20">
                       <img src="/robot-logo.png" alt="AI" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-transparent text-slate-200'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isThinking && (
                <div className="flex gap-4 justify-start">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-blue-500/30 overflow-hidden bg-black/20 animate-pulse">
                     <img src="/robot-logo.png" alt="AI" className="w-full h-full object-cover" />
                  </div>
                  <div className="rounded-2xl p-4 text-sm bg-transparent text-slate-400 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area Center Bottom */}
        <div className="absolute bottom-0 left-0 right-0 pt-10 pb-6 px-4 bg-gradient-to-t from-[#05070A] via-[#05070A]/80 to-transparent pointer-events-none flex justify-center">
          <div className="w-full max-w-3xl pointer-events-auto flex flex-col gap-2">
            
            {/* Attachment Previews */}
            <div className="flex flex-wrap gap-2">
              {attachedZone && (
                <div className="flex items-center gap-2 mb-2 px-3 py-1.5 bg-blue-900/40 backdrop-blur-md rounded-lg border border-blue-500/30 text-xs z-10">
                  <MapPin size={14} className="text-blue-400" />
                  <span className="text-blue-200">
                    Attached Zone: {attachedZone.name ? attachedZone.name : `[${attachedZone.center?.lat?.toFixed(2)}, ${attachedZone.center?.lng?.toFixed(2)}]`}
                  </span>
                  <button 
                    onClick={() => setAttachedZone(null)}
                    className="ml-2 text-slate-400 hover:text-white"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              {imagePreview && (
                <div className="mb-2 relative inline-block">
                  <img src={imagePreview} alt="Upload preview" className="h-12 rounded-lg border border-white/20 object-cover" />
                  <button 
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="absolute -top-2 -right-2 bg-slate-800 border border-white/10 rounded-full p-1 text-slate-400 hover:text-white shadow-lg"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>

            <div className="relative flex items-center bg-[#0a0d14]/90 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl overflow-hidden focus-within:border-blue-500/50 transition-colors">
              <label className="p-3 pl-4 cursor-pointer text-slate-400 hover:text-white transition-colors">
                <Paperclip size={18} />
                <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={handleImageUpload} />
              </label>
              
              <div className="relative">
                <button 
                  onClick={() => setShowZoneDropdown(!showZoneDropdown)}
                  className="p-3 pr-4 text-slate-400 hover:text-blue-400 transition-colors"
                  title="Attach map zone"
                >
                  <MapPin size={18} />
                </button>
                
                {showZoneDropdown && (
                  <div className="absolute bottom-full mb-2 left-0 w-48 bg-[#0f1420] border border-white/10 rounded-xl shadow-2xl py-1 z-50">
                    <button 
                      onClick={() => handleAttachZone('current')}
                      className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      Current Map View
                    </button>
                    <button 
                      onClick={() => handleAttachZone('aravalli')}
                      className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      Aravalli Range
                    </button>
                    <button 
                      onClick={() => handleAttachZone('yamuna')}
                      className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      Yamuna Flood Zone
                    </button>
                  </div>
                )}
              </div>
              
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1 bg-transparent py-4 text-sm text-white focus:outline-none resize-none h-[54px] max-h-32"
                rows={1}
              />
              
              <button
                onClick={() => void handleSend()}
                disabled={!input.trim() && !imageFile && !attachedZone}
                className={`p-4 transition-colors ${
                  (!input.trim() && !imageFile && !attachedZone) 
                    ? 'text-slate-600' 
                    : 'text-blue-500 hover:text-blue-400'
                }`}
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-center text-[10px] text-slate-500 mt-2">
              SATQuery AI can make mistakes. Consider verifying important information.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
