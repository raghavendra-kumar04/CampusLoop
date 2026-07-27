import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import './Chat.css';

const Chat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  
  const [typingUser, setTypingUser] = useState('');
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(true);
  const [attachmentLoading, setAttachmentLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Fetch conversations list
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await axios.get('/api/chats');
        setConversations(res.data);
        
        const redirectedId = location.state?.activeConversationId;
        if (redirectedId) {
          const selected = res.data.find(c => c._id === redirectedId);
          if (selected) {
            handleSelectConversation(selected);
          }
        } else if (res.data.length > 0) {
          handleSelectConversation(res.data[0]);
        }
      } catch (err) {
        console.error('Error fetching conversations:', err);
      }
    };

    if (user) {
      fetchChats();
    }
  }, [user, location.state]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('new_message', (message) => {
      if (activeConversation && message.conversation === activeConversation._id) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }
      
      setConversations(prev =>
        prev.map(conv => {
          if (conv._id === message.conversation) {
            return {
              ...conv,
              lastMessage: message,
              updatedAt: new Date().toISOString()
            };
          }
          return conv;
        }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      );
    });

    socket.on('user_typing', ({ conversationId, userName }) => {
      if (activeConversation && conversationId === activeConversation._id) {
        setTypingUser(userName);
      }
    });

    socket.on('user_stop_typing', ({ conversationId }) => {
      if (activeConversation && conversationId === activeConversation._id) {
        setTypingUser('');
      }
    });

    return () => {
      socket.off('new_message');
      socket.off('user_typing');
      socket.off('user_stop_typing');
    };
  }, [socket, activeConversation]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const handleSelectConversation = async (conv) => {
    setActiveConversation(conv);
    setTypingUser('');
    
    if (socket) {
      if (activeConversation) {
        socket.emit('leave_chat', activeConversation._id);
      }
      socket.emit('join_chat', conv._id);
    }

    try {
      const res = await axios.get(`/api/chats/${conv._id}/messages`);
      setMessages(res.data);
      scrollToBottom();
    } catch (err) {
      console.error('Error fetching chat messages:', err);
    }
  };

  const handleSendText = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !socket || !activeConversation) return;

    socket.emit('send_message', {
      conversationId: activeConversation._id,
      content: messageText.trim()
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socket.emit('stop_typing', { conversationId: activeConversation._id });

    setMessageText('');
  };

  const handleInputChange = (e) => {
    setMessageText(e.target.value);
    if (!socket || !activeConversation) return;

    socket.emit('typing', {
      conversationId: activeConversation._id,
      userName: user.name
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { conversationId: activeConversation._id });
    }, 2000);
  };

  const handleImageAttachment = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeConversation) return;

    setAttachmentLoading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('content', 'Sent an image attachment');

    try {
      const res = await axios.post(`/api/chats/${activeConversation._id}/messages`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (socket) {
        socket.emit('send_message', {
          conversationId: activeConversation._id,
          content: '',
          image: res.data.image
        });
      }
    } catch (err) {
      console.error('Attachment upload failed:', err);
    } finally {
      setAttachmentLoading(false);
    }
  };

  const getRecipient = (conv) => {
    return conv.participants.find(p => p._id !== user._id) || { name: 'Student' };
  };

  const sendOfferMessage = () => {
    if (!socket || !activeConversation) return;
    const templateOffer = `Hi! I saw your listing for "${activeConversation.listing?.title}". I am interested in buying it! When and where on campus are you free to meet?`;
    socket.emit('send_message', {
      conversationId: activeConversation._id,
      content: templateOffer
    });
  };

  return (
    <main className="h-[calc(100vh-64px)] w-full max-w-container-max mx-auto md:px-lg flex overflow-hidden">
      
      {/* Left Pane: Conversation List */}
      <aside className={`flex flex-col w-full md:w-80 lg:w-96 border-r border-outline-variant bg-surface-container-lowest ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-sm flex flex-col gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full h-10 pl-10 pr-4 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-primary/20 text-body-md font-body-md placeholder:text-on-surface-variant/50 outline-none text-on-surface"
            />
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60">
              search
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {conversations.length === 0 ? (
            <div className="p-md text-center text-xs text-on-surface-variant">
              No conversations active.
            </div>
          ) : (
            conversations.map((conv) => {
              const recipient = getRecipient(conv);
              const isSelected = activeConversation && activeConversation._id === conv._id;
              const hasUnread = conv.lastMessage?.isRead === false && conv.lastMessage?.sender !== user._id;

              return (
                <div
                  key={conv._id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`p-sm flex gap-3 cursor-pointer transition-all border-l-4 ${
                    isSelected
                      ? 'bg-surface-container border-primary'
                      : 'border-transparent hover:bg-surface-container-high/50'
                  }`}
                >
                  <div className="relative shrink-0">
                    {recipient.avatar ? (
                      <img src={recipient.avatar} alt="avatar" className="w-12 h-12 rounded-full object-cover shadow-sm" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                        {recipient.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-surface-container-lowest rounded-full"></div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <h4 className="font-label-md text-label-md text-on-surface truncate">{recipient.name}</h4>
                      <span className="text-caption font-caption text-on-surface-variant/70">
                        {conv.lastMessage
                          ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : ''}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <p className={`font-body-md text-label-md truncate ${hasUnread ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                        {conv.lastMessage?.content || (conv.lastMessage?.image ? 'Sent an image attachment' : 'Listing Chat Started')}
                      </p>
                      {hasUnread && (
                        <span className="bg-primary text-on-primary text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-xs shrink-0">
                          1
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Middle Pane: Active Chat Window */}
      <section className={`flex-1 flex flex-col bg-surface relative min-w-0 ${activeConversation ? 'flex' : 'hidden md:flex'}`}>
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <header className="h-16 px-sm border-b border-outline-variant flex items-center justify-between glass-effect sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveConversation(null)} className="md:hidden p-2 -ml-2 text-on-surface">
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="relative">
                  {getRecipient(activeConversation).avatar ? (
                    <img
                      src={getRecipient(activeConversation).avatar}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover border border-outline-variant"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      {getRecipient(activeConversation).name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-surface rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-label-md text-label-md text-on-surface">{getRecipient(activeConversation).name}</h3>
                  <span className="text-caption font-caption text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Online
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-surface-container-high/50 rounded-full transition-all">
                  <span className="material-symbols-outlined text-on-surface-variant">call</span>
                </button>
                <button className="p-2 hover:bg-surface-container-high/50 rounded-full transition-all">
                  <span className="material-symbols-outlined text-on-surface-variant">info</span>
                </button>
              </div>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-sm md:p-md flex flex-col gap-6 custom-scrollbar">
              <div className="flex justify-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/40 bg-surface-container-low px-3 py-1 rounded-full">
                  Today
                </span>
              </div>

              {messages.map((msg, idx) => {
                const isMe = msg.sender?._id === user._id || msg.sender === user._id;

                return (
                  <div
                    key={msg._id || idx}
                    className={`flex items-end gap-2 max-w-[85%] md:max-w-[70%] ${
                      isMe ? 'ml-auto' : ''
                    }`}
                  >
                    <div
                      className={`p-sm rounded-2xl shadow-sm text-xs leading-relaxed ${
                        isMe
                          ? 'bg-primary-container text-on-primary chat-bubble-sender shadow-md shadow-primary/10'
                          : 'bg-surface-container-high text-on-surface chat-bubble-receiver'
                      }`}
                    >
                      {msg.content && <p className="font-body-md text-body-md leading-relaxed">{msg.content}</p>}
                      
                      {msg.image && (
                        <div className="mt-2 rounded-xl overflow-hidden max-w-[320px] aspect-square">
                          <img src={msg.image} alt="attachment" className="w-full h-full object-cover" />
                        </div>
                      )}

                      <div className="flex justify-end items-center gap-1 mt-1">
                        <span className={`text-[10px] ${isMe ? 'text-on-primary-container/85' : 'text-on-surface-variant/75'}`}>
                          {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMe && (
                          <span className="material-symbols-outlined text-[14px] text-on-primary-container/80" style={{ fontVariationSettings: "'FILL' 1" }}>
                            done_all
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {typingUser && (
                <div className="flex items-center gap-3 animate-pulse">
                  <div className="flex gap-1.5 bg-surface-container-low px-4 py-2.5 rounded-full">
                    <div className="w-1.5 h-1.5 bg-on-surface-variant/40 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-on-surface-variant/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1.5 h-1.5 bg-on-surface-variant/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Footer */}
            <footer className="p-sm md:p-md bg-surface border-t border-outline-variant">
              <form onSubmit={handleSendText} className="flex items-end gap-2 bg-surface-container-low rounded-2xl p-2 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageAttachment}
                  accept="image/*"
                  className="hidden"
                />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={attachmentLoading}
                  className="p-2 hover:bg-surface-container-high/50 rounded-xl text-on-surface-variant flex items-center justify-center shrink-0"
                >
                  <span className="material-symbols-outlined">add</span>
                </button>

                <textarea
                  value={messageText}
                  onChange={handleInputChange}
                  placeholder="Type a message..."
                  rows={1}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-body-md font-body-md py-2 resize-none max-h-32 custom-scrollbar outline-none text-on-surface"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendText(e);
                    }
                  }}
                />

                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="p-2 bg-primary text-on-primary rounded-xl hover:bg-primary-container transition-all active:scale-90 shadow-md flex items-center justify-center shrink-0 disabled:opacity-55"
                >
                  <span className="material-symbols-outlined">send</span>
                </button>
              </form>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-md text-on-surface-variant space-y-sm bg-surface-container-lowest/15">
            <span className="material-symbols-outlined text-[64px] text-outline">chat_bubble</span>
            <h3 className="font-headline-md text-on-surface">Your Messaging Box</h3>
            <p className="text-xs max-w-xs leading-relaxed">Select any conversation from the left thread list to start chatting.</p>
          </div>
        )}
      </section>

      {/* Right Pane: Item/Seller Info */}
      {activeConversation && activeConversation.listing && (
        <aside className="hidden lg:flex flex-col w-80 border-l border-outline-variant bg-surface-container-lowest overflow-y-auto custom-scrollbar">
          
          {/* Item Preview info */}
          <div className="p-sm border-b border-outline-variant">
            <h5 className="font-label-md text-caption uppercase tracking-widest text-on-surface-variant/60 mb-4">Item Details</h5>
            <div className="rounded-2xl overflow-hidden mb-4 shadow-sm border border-outline-variant/30 aspect-[4/3] bg-surface-container">
              <img
                src={activeConversation.listing.images?.[0]}
                alt="listing visual"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-1 truncate">{activeConversation.listing.title}</h2>
            <span className="font-headline-md text-headline-md text-emerald-600 block mb-3">
              {activeConversation.listing.price === 0 ? 'Free' : `$${activeConversation.listing.price}`}
            </span>
            
            <div className="flex gap-2 mb-6">
              <span className="bg-emerald-500/10 text-emerald-700 text-caption font-bold px-3 py-1 rounded-full border border-emerald-500/20">
                {activeConversation.listing.status}
              </span>
              <span className="bg-surface-container-high text-on-surface-variant text-caption font-bold px-3 py-1 rounded-full">
                {activeConversation.listing.condition}
              </span>
            </div>

            <button
              onClick={sendOfferMessage}
              className="w-full bg-secondary text-on-secondary font-label-md py-3 rounded-xl hover:opacity-90 transition-all active:scale-95 mb-3"
            >
              Offer to Buy
            </button>
            <button
              onClick={() => navigate(`/item/${activeConversation.listing._id}`)}
              className="w-full border border-outline text-on-surface font-label-md py-3 rounded-xl hover:bg-surface-container transition-all active:scale-95"
            >
              View Full Listing
            </button>
          </div>

          {/* Seller Summary */}
          <div className="p-sm">
            <h5 className="font-label-md text-caption uppercase tracking-widest text-on-surface-variant/60 mb-4">Seller Info</h5>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-outline-variant shrink-0 bg-surface-container">
                {getRecipient(activeConversation).avatar ? (
                  <img src={getRecipient(activeConversation).avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                    {getRecipient(activeConversation).name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h4 className="font-label-md text-label-md text-on-surface truncate">{getRecipient(activeConversation).name}</h4>
                <div className="flex items-center gap-1 text-yellow-500">
                  <span className="material-symbols-outlined text-sm fill-icon">star</span>
                  <span className="text-caption font-bold text-on-surface">{getRecipient(activeConversation).rating || '0.0'}</span>
                  <span className="text-caption text-on-surface-variant font-normal">({getRecipient(activeConversation).ratingsCount || '0'} reviews)</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 font-semibold text-xs text-on-surface-variant">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary fill-icon">verified_user</span>
                <span className="text-label-md">Verified Student</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">location_on</span>
                <span className="text-label-md truncate">{activeConversation.listing.location}</span>
              </div>
            </div>
          </div>

          {/* Safety Tip */}
          <div className="mt-auto p-sm">
            <div className="bg-surface-container p-4 rounded-xl border border-outline-variant/50">
              <div className="flex gap-3 text-on-surface-variant mb-2 items-center">
                <span className="material-symbols-outlined text-amber-500">security</span>
                <h6 className="font-label-md text-label-md">Safety Tip</h6>
              </div>
              <p className="text-caption text-on-surface-variant leading-relaxed font-medium">
                Always meet in a well-lit campus location, like the library or student union, for high-value exchanges.
              </p>
            </div>
          </div>

        </aside>
      )}

    </main>
  );
};

export default Chat;
