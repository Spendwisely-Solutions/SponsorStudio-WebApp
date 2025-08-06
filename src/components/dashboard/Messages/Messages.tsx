import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

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
  title?: string; // Use title for event name
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
  const adminId = '172a05a3-5b62-4565-8ef8-fa6277af4022'; // Replace with actual admin UUID

  // Fetch current user ID from Supabase Auth
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
        setError('Failed to authenticate user');
        setLoading(false);
        return;
      }
      if (user) {
        console.log('Authenticated user:', user.id);
        setCurrentUserId(user.id);
      } else {
        console.error('No authenticated user found');
        setError('Please log in to view matches');
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Fetch matches when currentUserId is available
  useEffect(() => {
    if (!currentUserId) return;

    const fetchMatches = async () => {
      setLoading(true);
      console.log('Fetching matches for user:', currentUserId);
      try {
        const { data: brandMatches, error: brandError } = await supabase
          .from('matches')
          .select(`
            id,
            brand_id,
            opportunity_id,
            status,
            opportunities:opportunity_id (creator_id, title)
          `)
          .eq('status', 'accepted')
          .eq('brand_id', currentUserId);

        if (brandError) {
          console.error('Error fetching brand matches:', brandError);
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
            opportunities:opportunity_id (creator_id, title)
          `)
          .eq('status', 'accepted')
          .eq('opportunities.creator_id', currentUserId);

        if (creatorError) {
          console.error('Error fetching creator matches:', creatorError);
          setError('Failed to load creator matches: ' + creatorError.message);
          setLoading(false);
          return;
        }

        console.log('Brand matches:', brandMatches);
        console.log('Creator matches:', creatorMatches);

        const combinedMatches = [...(brandMatches || []), ...(creatorMatches || [])];

        const formattedMatches = combinedMatches
          .filter((match: any) => match.opportunities?.creator_id && match.status === 'accepted')
          .map((match: any) => ({
            id: match.id,
            brand_id: match.brand_id,
            opportunity_id: match.opportunity_id,
            creator_id: match.opportunities.creator_id,
            brand_name: `Brand_${match.brand_id.slice(0, 8)}`,
            creator_name: `Creator_${match.opportunities.creator_id.slice(0, 8)}`,
            title: match.opportunities.title || `Event_${match.opportunity_id.slice(0, 8)}`, // Fallback if title is missing
          }))
          .filter((match, index, self) => 
            index === self.findIndex((m) => m.id === match.id)
          );

        console.log('Formatted matches:', formattedMatches);
        setMatches(formattedMatches);
        setError(null);
        setLoading(false);
      } catch (err) {
        console.error('Unexpected error in fetchMatches:', err);
        setError('Unexpected error while loading matches');
        setLoading(false);
      }
    };

    fetchMatches();
  }, [currentUserId]);

  // Initialize real-time channel and track users
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
          const updated = new Set([match.brand_id, match.creator_id, adminId]);
          updated.add(payload.sender_id);
          console.log('Updated chatUsers after new message:', Array.from(updated));
          return updated;
        });
      })
      .on('presence', { event: 'sync' }, () => {
        const presenceState = chatChannel.presenceState();
        const activeUsers = Object.keys(presenceState);
        console.log('Active users in channel:', activeUsers);
        setChatUsers((prev) => {
          const match = matches.find((m) => m.id === selectedMatchId);
          if (!match) return prev;
          const updated = new Set([match.brand_id, match.creator_id, adminId]);
          activeUsers.forEach((userId) => updated.add(userId));
          console.log('Updated chatUsers after presence sync:', Array.from(updated));
          return updated;
        });
      })
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to channel:', `private:${selectedMatchId}`);
          chatChannel.track({ user_id: currentUserId });
        }
      });

    setChannel(chatChannel);
    loadMessages(selectedMatchId);

    return () => {
      chatChannel.unsubscribe();
    };
  }, [selectedMatchId, currentUserId, matches, adminId]);

  // Load messages for the selected match
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
        console.error('Error loading messages:', error);
        setError('Failed to load messages: ' + error.message);
        return;
      }

      console.log('Loaded messages:', data);
      setMessages(data || []);
      const match = matches.find((m) => m.id === matchId);
      if (match) {
        const users = new Set([match.brand_id, match.creator_id, adminId]);
        data.forEach((msg: Message) => users.add(msg.sender_id));
        console.log('Updated chatUsers after loading messages:', Array.from(users));
        setChatUsers(users);
      }
    } catch (err) {
      console.error('Unexpected error in loadMessages:', err);
      setError('Unexpected error while loading messages');
    }
  };

  // Send new message
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
      console.error('Error saving message:', dbError);
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
      const updated = new Set([match.brand_id, match.creator_id, adminId]);
      updated.add(currentUserId);
      console.log('Updated chatUsers after sending message:', Array.from(updated));
      return updated;
    });
  };

  // Determine chat name based on user role
  const getChatName = () => {
    const match = matches.find((m) => m.id === selectedMatchId);
    if (!match) return 'Chat';
    if (currentUserId === adminId) {
      return `Event: ${match.title} with ${match.brand_name}`;
    } else if (currentUserId === match.brand_id) {
      return `Event: ${match.title}`;
    } else {
      return `Event: ${match.title} with ${match.brand_name}`;
    }
  };

  if (!currentUserId) {
    return <div className="p-4 text-red-500">Please log in to view matches</div>;
  }

  return (
    <div className="max-w-4xl mx-auto border border-gray-200 rounded-lg overflow-hidden flex h-[600px]">
      <div className="w-1/3 border-r border-gray-200 bg-gray-50">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Matches</h2>
        </div>
        <div className="overflow-y-auto h-full">
          {loading ? (
            <p className="p-4 text-gray-500">Loading matches...</p>
          ) : error ? (
            <p className="p-4 text-red-500">{error}</p>
          ) : matches.length === 0 ? (
            <p className="p-4 text-gray-500">No matches found</p>
          ) : (
            matches.map((match) => (
              <div
                key={match.id}
                onClick={() => setSelectedMatchId(match.id)}
                className={`p-4 cursor-pointer hover:bg-gray-100 ${
                  selectedMatchId === match.id ? 'bg-blue-100' : ''
                }`}
              >
                <p className="font-medium">
                  {match.brand_id === currentUserId ? 'Creator' : 'Brand'}:{' '}
                  {match.brand_id === currentUserId ? match.creator_name : match.brand_name}
                </p>
                <p className="text-sm text-gray-500">Event: {match.title}</p>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        {selectedMatchId ? (
          <>
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold">{getChatName()}</h2>
              <p className="text-sm text-gray-500">
                Users in chat: {chatUsers.size} (Brand, Creator, Admin)
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-white">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex mb-4 ${
                    message.sender_id === currentUserId ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.sender_id === currentUserId
                        ? 'bg-blue-600 text-white'
                        : message.sender_id === adminId
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200'
                    }`}
                  >
                    <span className="block text-xs font-semibold mb-1">
                      {message.sender_id === currentUserId
                        ? 'You'
                        : message.sender_id === adminId
                        ? 'Admin'
                        : `User_${message.sender_id.slice(0, 8)}`}
                    </span>
                    <p>{message.content}</p>
                    <span className="block text-xs opacity-70 mt-1">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <form className="flex" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  disabled={!selectedMatchId}
                  className="flex-1 p-2 border border-gray-300 rounded-l disabled:bg-gray-100"
                />
                <button
                  type="submit"
                  disabled={!selectedMatchId}
                  className="p-2 bg-blue-600 text-white rounded-r disabled:bg-gray-400"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white">
            <p className="text-gray-500">Select a match to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSystem;