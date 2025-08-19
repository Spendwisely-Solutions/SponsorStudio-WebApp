import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, User, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

// Define types
interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  owner_id: string;
  content: string;
  created_at: string;
}

interface Match {
  id: string;
  brand_id: string;
  opportunity_id: string;
  creator_id: string;
  brand_name?: string;
  creator_name?: string;
  title?: string;
}

const ChatSystem: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [channel, setChannel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [chatUsers, setChatUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const adminId = '172a05a3-5b62-4565-8ef8-fa6277af4022';

  // Scroll to the bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  // Fetch current user ID from Supabase Auth
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        setError('Failed to authenticate user');
        setLoading(false);
        return;
      }
      if (user) {
        setCurrentUserId(user.id);
      } else {
        setError('Please log in to view matches');
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Fetch matches and profile data
  useEffect(() => {
    if (!currentUserId) return;

    const fetchMatches = async () => {
      setLoading(true);
      try {
        const { data: brandMatches, error: brandError } = await supabase
          .from('matches')
          .select(`
            id,
            brand_id,
            opportunity_id,
            status,
            opportunities:opportunity_id (
              creator_id,
              title,
              profiles:creator_id (company_name)
            ),
            profiles:brand_id (company_name)
          `)
          .eq('status', 'accepted')
          .eq('brand_id', currentUserId);

        if (brandError) {
          setError('Failed to load brand matches: ' + brandError.message);
          setLoading(false);
          return;
        }

        const { data: creatorMatches, error: creatorError } = await supabase
          .from('matches')
          .select(`
            id,
            brand_id,
            opportunity_id,
            status,
            opportunities:opportunity_id (
              creator_id,
              title,
              profiles:creator_id (company_name)
            ),
            profiles:brand_id (company_name)
          `)
          .eq('status', 'accepted')
          .eq('opportunities.creator_id', currentUserId);

        if (creatorError) {
          setError('Failed to load creator matches: ' + creatorError.message);
          setLoading(false);
          return;
        }

        const combinedMatches = [...(brandMatches || []), ...(creatorMatches || [])];

        const formattedMatches = combinedMatches
          .filter((match: any) => match.opportunities?.creator_id && match.status === 'accepted')
          .map((match: any) => ({
            id: match.id,
            brand_id: match.brand_id,
            opportunity_id: match.opportunity_id,
            creator_id: match.opportunities.creator_id,
            brand_name: match.profiles?.company_name || `Brand_${match.brand_id.slice(0, 8)}`,
            creator_name: match.opportunities.profiles?.company_name || `Creator_${match.opportunities.creator_id.slice(0, 8)}`,
            title: match.opportunities.title || `Event_${match.opportunity_id.slice(0, 8)}`,
          }))
          .filter((match, index, self) => 
            index === self.findIndex((m) => m.id === match.id)
          );

        setMatches(formattedMatches);
        setError(null);
        setLoading(false);
      } catch (err) {
        setError('Unexpected error while loading matches');
        setLoading(false);
      }
    };

    fetchMatches();
  }, [currentUserId]);

  // Initialize real-time channel
  useEffect(() => {
    if (!selectedMatchId || !currentUserId) return;

    const chatChannel = supabase.channel(`private:${selectedMatchId}`, {
      config: {
        broadcast: { self: true },
        private: true,
        presence: { key: currentUserId },
      },
    });

    chatChannel
      .on('broadcast', { event: 'new_message' }, ({ payload }: { payload: Message }) => {
        setMessages((prevMessages) => {
          if (prevMessages.some((msg) => msg.id === payload.id)) return prevMessages;
          return [...prevMessages, payload];
        });
        setChatUsers((prev) => {
          const match = matches.find((m) => m.id === selectedMatchId);
          if (!match) return prev;
          const updated = new Set<string>([match.brand_id, match.creator_id, adminId]);
          updated.add(payload.sender_id);
          return updated;
        });
      })
      .on('presence', { event: 'sync' }, () => {
        const presenceState = chatChannel.presenceState();
        const activeUsers = Object.keys(presenceState);
        setChatUsers((prev) => {
          const match = matches.find((m) => m.id === selectedMatchId);
          if (!match) return prev;
          const updated = new Set<string>([match.brand_id, match.creator_id, adminId]);
          activeUsers.forEach((userId) => updated.add(userId));
          return updated;
        });
      })
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          chatChannel.track({ user_id: currentUserId });
        }
      });

    setChannel(chatChannel);
    loadMessages(selectedMatchId);

    return () => {
      chatChannel.unsubscribe();
    };
  }, [selectedMatchId, currentUserId, matches, adminId]);

  // Load messages
  const loadMessages = async (matchId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          match_id,
          sender_id,
          owner_id,
          content,
          created_at
        `)
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });

      if (error) {
        setError('Failed to load messages: ' + error.message);
        return;
      }

      setMessages(data || []);
      const match = matches.find((m) => m.id === matchId);
      if (match) {
        const users = new Set<string>([match.brand_id, match.creator_id, adminId]);
        data.forEach((msg: Message) => users.add(msg.sender_id));
        setChatUsers(users);
      }
    } catch (err) {
      setError('Unexpected error while loading messages');
    }
  };

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedMatchId || !currentUserId) return;

    const message: Message = {
      id: uuidv4(),
      match_id: selectedMatchId,
      sender_id: currentUserId,
      owner_id: currentUserId,
      content: newMessage,
      created_at: new Date().toISOString(),
    };

    const { error: dbError } = await supabase.from('messages').insert([message]);

    if (dbError) {
      setError('Failed to send message: ' + dbError.message);
      return;
    }

    await channel.send({
      type: 'broadcast',
      event: 'new_message',
      payload: message,
    });

    setNewMessage('');
    setChatUsers((prev) => {
      const match = matches.find((m) => m.id === selectedMatchId);
      if (!match) return prev;
      const updated = new Set<string>([match.brand_id, match.creator_id, adminId]);
      updated.add(currentUserId);
      return updated;
    });
  };

  // Get chat name
  const getChatName = () => {
    const match = matches.find((m) => m.id === selectedMatchId);
    if (!match) return 'Chat';
    if (currentUserId === adminId) {
      return `${match.brand_name} & ${match.creator_name}`;
    } else if (currentUserId === match.brand_id) {
      return match.creator_name;
    } else {
      return match.brand_name;
    }
  };

  // Get display name
  const getDisplayName = (senderId: string) => {
    const match = matches.find((m) => m.id === selectedMatchId);
    if (!match) return `User_${senderId.slice(0, 8)}`;
    if (senderId === currentUserId) return 'You';
    if (senderId === adminId) return 'Admin';
    if (senderId === match.brand_id) return match.brand_name;
    if (senderId === match.creator_id) return match.creator_name;
    return `User_${senderId.slice(0, 8)}`;
  };

  // Handle back to match list
  const handleBackToMatches = () => {
    setSelectedMatchId(null);
  };

  if (!currentUserId) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center p-4 h-full bg-gray-100"
      >
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center text-red-500 max-w-md w-full">
          <AlertCircle className="w-10 h-10 mx-auto mb-4 text-red-500" />
          <p className="text-lg font-medium">Please log in to view matches</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-1 h-full flex-col min-h-0 bg-white/95 backdrop-blur-sm">
      <div className="flex flex-1 min-h-0">
        {/* Mobile and Desktop Match List */}
        <AnimatePresence>
          {!selectedMatchId && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="w-full sm:w-1/3 sm:max-w-xs bg-white sm:border-r sm:border-gray-200"
            >
              <div className="p-4 bg-[#2B4B9B] text-white sticky top-0 z-10 rounded-t-2xl shadow-sm">
                <h2 className="text-xl font-semibold flex items-center">
                  <MessageCircle className="w-6 h-6 mr-2" />
                  Chats
                </h2>
              </div>
              <div className="overflow-y-auto max-h-[calc(100vh-4rem)] p-4 bg-gray-50">
                {loading ? (
                  <div className="text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading chats...
                  </div>
                ) : error ? (
                  <div className="text-center text-red-500">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                    {error}
                  </div>
                ) : matches.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <MessageCircle className="w-10 h-10 mx-auto mb-4 text-gray-400" />
                    No chats found
                  </div>
                ) : (
                  matches.map((match, index) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      onClick={() => setSelectedMatchId(match.id)}
                      className="p-4 cursor-pointer hover:bg-blue-50/60 rounded-lg transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="w-6 h-6 text-[#2B4B9B]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {match.brand_id === currentUserId ? match.creator_name : match.brand_name}
                          </p>
                          <p className="text-sm text-gray-500 truncate">{match.title}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Area */}
        <AnimatePresence>
          {selectedMatchId && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex-1 flex flex-col bg-white min-h-0"
            >
              <div className="p-4 bg-[#2B4B9B] text-white flex items-center justify-between sticky top-0 z-10 rounded-t-2xl shadow-sm">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleBackToMatches}
                    className="p-2 rounded-full hover:bg-blue-700 transition-colors duration-200"
                    aria-label="Back to chats"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <div>
                    <h2 className="text-lg font-semibold">{getChatName()}</h2>
                    <p className="text-xs flex items-center">
                      <span className="w-2 h-2 rounded-full bg-green-400 mr-1" />
                      {chatUsers.size} online
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto max-h-[calc(100vh-4rem-4rem)] p-4 bg-gray-100">
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className={`flex mb-4 ${
                        message.sender_id === currentUserId ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${
                          message.sender_id === currentUserId
                            ? 'bg-[#2B4B9B] text-white'
                            : message.sender_id === adminId
                            ? 'bg-purple-600 text-white'
                            : 'bg-white text-gray-900'
                        }`}
                      >
                        <p className="text-sm font-medium">{getDisplayName(message.sender_id)}</p>
                        <p className="text-sm mt-1">{message.content}</p>
                        <span className="block text-xs opacity-70 mt-1 text-right">
                          {new Date(message.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 bg-white border-t border-gray-200 sticky bottom-0">
                <form className="flex items-center max-w-2xl mx-auto">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    disabled={!selectedMatchId}
                    className="flex-1 p-3 border border-gray-300 rounded-full text-sm text-gray-700 focus:ring-2 focus:ring-[#2B4B9B] focus:border-[#2B4B9B] transition-colors duration-200 disabled:bg-gray-100"
                    aria-label="Type a message"
                  />
                  <motion.button
                    type="submit"
                    disabled={!selectedMatchId || !newMessage.trim()}
                    className="ml-2 p-3 bg-[#2B4B9B] text-white rounded-full disabled:bg-gray-400 transition-colors duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSendMessage}
                    aria-label="Send message"
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChatSystem;