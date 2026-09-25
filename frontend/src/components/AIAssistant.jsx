import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const quickPrompts = [
  'Find second-hand engineering textbooks',
  'What events are happening today?',
  'Show dorm furniture under ₹1000',
  'Find students interested in hackathons'
];

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hi there! I am your CampusLoop AI Assistant. How can I help you find items, events, or student communities today?'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const navigate = useNavigate();

  const handleSend = (userText) => {
    const textToSend = userText || query;
    if (!textToSend.trim()) return;

    // Add user message
    const newMessages = [...messages, { sender: 'user', text: textToSend }];
    setMessages(newMessages);
    setQuery('');
    setIsTyping(true);

    // AI Intent parsing response logic
    setTimeout(() => {
      let aiReply = '';
      let actionLink = null;
      const lower = textToSend.toLowerCase();

      if (lower.includes('textbook') || lower.includes('book') || lower.includes('engineering')) {
        aiReply = "Here are the latest second-hand engineering & academic textbooks listed by your peers:";
        actionLink = { label: "View Textbooks in Marketplace", url: "/marketplace?category=Textbooks" };
      } else if (lower.includes('furniture') || lower.includes('dorm') || lower.includes('bed')) {
        aiReply = "Found available dorm furniture and essentials listed for quick pickup:";
        actionLink = { label: "View Furniture Listings", url: "/marketplace?category=Furniture" };
      } else if (lower.includes('event') || lower.includes('workshop') || lower.includes('today')) {
        aiReply = "Check out upcoming campus events, hackathons, and workshops:";
        actionLink = { label: "Explore Campus Events", url: "/marketplace?search=Event" };
      } else {
        aiReply = `Searching CampusLoop for "${textToSend}"... Here are matching listings:`;
        actionLink = { label: `Search "${textToSend}"`, url: `/marketplace?search=${encodeURIComponent(textToSend)}` };
      }

      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: aiReply, actionLink }
      ]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white font-semibold text-sm shadow-xl flex items-center gap-2 border border-white/20 hover:shadow-indigo-500/25 transition-all"
      >
        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          auto_awesome
        </span>
        <span>Ask CampusLoop</span>
      </motion.button>

      {/* Assistant Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 bg-slate-950/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="w-full max-w-lg bg-surface-container-lowest dark:bg-slate-900 border border-outline-variant/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 bg-primary/5 border-b border-outline-variant/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-sm font-bold text-on-surface">CampusLoop Assistant</h3>
                    <p className="text-xs text-on-surface-variant">Ask anything about campus items or events</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Chat Body */}
              <div className="p-6 flex-1 overflow-y-auto space-y-4 custom-scrollbar min-h-[280px]">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${
                        msg.sender === 'user'
                          ? 'bg-primary text-white rounded-br-none'
                          : 'bg-surface-container-high dark:bg-slate-800 text-on-surface rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                    {msg.actionLink && (
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          navigate(msg.actionLink.url);
                        }}
                        className="mt-2 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        {msg.actionLink.label}
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </button>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-container-high w-fit text-xs text-on-surface-variant animate-pulse">
                    <span>CampusLoop AI is thinking...</span>
                  </div>
                )}
              </div>

              {/* Quick Prompts */}
              <div className="px-6 py-2 border-t border-outline-variant/10 flex flex-wrap gap-2 bg-surface-container-low/30">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    className="text-xs px-3 py-1.5 rounded-full bg-surface-container dark:bg-slate-800 hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-colors border border-outline-variant/10"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="p-4 border-t border-outline-variant/10 flex items-center gap-2 bg-surface-container-lowest dark:bg-slate-900"
              >
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask about textbooks, dorm gear, events..."
                  className="flex-1 bg-surface-container dark:bg-slate-800 text-on-surface text-sm px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  type="submit"
                  className="p-2.5 rounded-xl bg-primary text-white hover:bg-primary-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
