// src/app/staff-dashboard/messages/StaffChatWindow.tsx (已更新)
'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import ReactLinkify from 'react-linkify';
import { Database } from '@/lib/database.types';
// 【修改 1】: 导入 FaArrowLeft
import { FaPaperPlane, FaPlus, FaArrowLeft } from 'react-icons/fa'; 

// (类型定义保持不变)
type Message = Database['public']['Tables']['messages']['Row'];
type StaffProfile = {
  id: string;
  social_links: any | null;
} | null;

// 【修改 2】: 添加 onGoBack 属性
type StaffChatWindowProps = {
  roomId: string;
  staffProfile: StaffProfile;
  onGoBack: () => void; // 新增的回调函数
};

// (ChatBubble 子组件保持不变)
function ChatBubble({ message, isSender }: { message: Message, isSender: boolean }) {
  const bubbleClass = isSender ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black';
  const justifyClass = isSender ? 'justify-end' : 'justify-start';

  return (
    <div className={`flex ${justifyClass} w-full`}>
      <div className={`max-w-xs md:max-w-md p-3 rounded-lg break-words ${bubbleClass}`}>
        <ReactLinkify
          componentDecorator={(decoratedHref, decoratedText, key) => (
            <a 
              target="_blank" 
              rel="noopener noreferrer" 
              href={decoratedHref} 
              key={key} 
              className={isSender ? "text-white underline hover:text-blue-200" : "text-blue-600 underline hover:text-blue-800"}
            >
              {decoratedText}
            </a>
          )}
        >
          {message.content}
        </ReactLinkify>
        <div className={`text-xs mt-1 text-right ${isSender ? 'opacity-70' : 'opacity-60'}`}>
          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

// 【修改 3】: 解构 onGoBack 属性
export default function StaffChatWindow({ roomId, staffProfile, onGoBack }: StaffChatWindowProps) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showLinks, setShowLinks] = useState(false);
  const [customerNickname, setCustomerNickname] = useState('Loading...');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const linksPopupRef = useRef<HTMLDivElement>(null);

  // (所有 useEffect 和 handleSendMessage/handleLinkSend 逻辑保持不变)
  useEffect(() => {
    async function loadChatRoom() {
      setIsLoading(true);
      setMessages([]); 

      if (!roomId) return;

      const { data: initialMessages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(50);
      
      if (messagesError) console.error('Error fetching messages:', messagesError);
      else setMessages(initialMessages || []);

      const { data: roomData, error: roomError } = await supabase
        .from('chat_rooms')
        .select('customer:profiles!customer_id(nickname)')
        .eq('id', roomId)
        .single();
      
      if (roomData?.customer && Array.isArray(roomData.customer) && roomData.customer.length > 0) {
        setCustomerNickname(roomData.customer[0].nickname || 'Customer');
      } else if (roomData?.customer && !Array.isArray(roomData.customer)) {
        setCustomerNickname((roomData.customer as any).nickname || 'Customer');
      } else if (roomError) {
        console.error('Error fetching customer nickname:', roomError);
        setCustomerNickname('Error');
      }
      
      setIsLoading(false);
    }
    loadChatRoom();
  }, [roomId, supabase]);

  useEffect(() => {
    const channel = supabase
      .channel(`staff_chat_room:${roomId}`) 
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_room_id=eq.${roomId}` },
        (payload) => {
          if (payload.new.sender_id !== staffProfile?.id) {
             setMessages((currentMessages) => [...currentMessages, payload.new as Message]);
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, roomId, staffProfile]);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (linksPopupRef.current && !linksPopupRef.current.contains(event.target as Node)) {
        setShowLinks(false);
      }
    }
    if (showLinks) document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showLinks]);

  const handleSendMessage = async (content: string) => {
    if (content.trim().length === 0 || !staffProfile) return;
    const optimisticMessage: Message = {
      id: Math.random(),
      chat_room_id: roomId,
      sender_id: staffProfile.id,
      content: content.trim(),
      created_at: new Date().toISOString(),
    };
    setMessages(currentMessages => [...currentMessages, optimisticMessage]);
    setNewMessage('');
    const { error } = await supabase.from('messages').insert({
        chat_room_id: roomId,
        sender_id: staffProfile.id,
        content: content.trim(),
    });
    if (error) {
      console.error('Error sending message:', error);
      setNewMessage(content);
      setMessages(currentMessages => currentMessages.filter(m => m.id !== optimisticMessage.id));
    }
  };

  const handleLinkSend = (url: string) => {
    const trimmedUrl = url ? url.trim() : '';
    if (trimmedUrl.length === 0) {
      setShowLinks(false);
      return;
    }
    handleSendMessage(trimmedUrl);
    setShowLinks(false);
  };
  
  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center"><p>Loading messages...</p></div>;
  }
  
  return (
    <div className="flex-1 flex flex-col h-full ">
      {/* 【修改 4】: 聊天室頭部添加 flex 和返回按鈕 */}
      <header className="shadow-md p-4 sticky top-0 z-10 flex items-center bg-white">
        {/* 这个按钮只在 md (768px) 以下的屏幕显示 */}
        <button 
          onClick={onGoBack} 
          className="btn btn-ghost btn-circle md:hidden mr-2" 
          aria-label="Go back to list"
        >
          <FaArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-center w-full">
          Chat with {customerNickname}
        </h2>
      </header>

      {/* (消息列表和输入框保持不变) */}
      <main className="flex-1 overflow-y-auto p-[24px] space-y-[12px]">
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg}
            isSender={msg.sender_id === staffProfile?.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </main>

      <footer className=" sticky bottom-0 z-10 border-t p-[10px]">
        {showLinks && (
          <div 
            ref={linksPopupRef} 
            className="absolute bottom-full left-0 right-0 card bg-[var(--color-third)] p-[12px] rounded-t-lg"
          >
            <div className="flex flex-col gap-2">
              {staffProfile?.social_links && Object.entries(staffProfile.social_links).map(([key, value]) => (
                (value && typeof value === 'string') && (
                  <button 
                    type="button" 
                    key={key} 
                    onClick={() => handleLinkSend(value)}
                    className="btn btn-sm btn-outline text-center justify-start my-[5px]"
                  >
                     {key.replace('_', ' ')}
                  </button>
                )
              ))}
            </div>
          </div>
        )}
        
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(newMessage); }} 
          className="flex items-center gap-2"
        >
          <button 
            type="button" 
            onClick={() => setShowLinks(!showLinks)}
            className="btn bg-[var(--color-third)] p-[10px]]"
          >
            <FaPlus />
          </button>
          
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message or paste a link..."
            className="flex-1 input input-bordered"
          />
          <button type="submit" className="btn btn-primary text-[var(--foreground)]">
            <FaPaperPlane />
          </button>
        </form>
      </footer>
    </div>
  );
}