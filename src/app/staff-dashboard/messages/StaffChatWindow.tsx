// src/app/staff-dashboard/messages/StaffChatWindow.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import ReactLinkify from 'react-linkify';
import { Database } from '@/lib/database.types'; // <-- 確保這是你正確的路徑
import { FaPaperPlane, FaPlus } from 'react-icons/fa';

// ----------------------------------------------------------------
// 類型定義
// ----------------------------------------------------------------
type Message = Database['public']['Tables']['messages']['Row'];
type StaffProfile = {
  id: string;
  social_links: any | null;
} | null;

type StaffChatWindowProps = {
  roomId: string;
  staffProfile: StaffProfile;
};

// ----------------------------------------------------------------
// 聊天氣泡 (ChatBubble) 子組件
// (與 ChatRoomClient.tsx 中的完全相同)
// ----------------------------------------------------------------
function ChatBubble({ message, isSender }: { message: Message, isSender: boolean }) {
  const bubbleClass = isSender ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black';
  const justifyClass = isSender ? 'justify-end' : 'justify-start';

  return (
    <div className={`flex ${justifyClass} w-full`}>
      <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${bubbleClass}`}>
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

// ----------------------------------------------------------------
// 主聊天窗口 (StaffChatWindow) 組件
// ----------------------------------------------------------------
export default function StaffChatWindow({ roomId, staffProfile }: StaffChatWindowProps) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showLinks, setShowLinks] = useState(false);
  const [customerNickname, setCustomerNickname] = useState('Loading...'); // <-- 新增
  const [isLoading, setIsLoading] = useState(true); // <-- 新增
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const linksPopupRef = useRef<HTMLDivElement>(null);

  // 效果 1：(*** 關鍵區別 ***)
  // 當 roomId 改變時，獲取該房間的歷史消息和客戶昵稱
  useEffect(() => {
    async function loadChatRoom() {
      setIsLoading(true);
      setMessages([]); // 清空上一房間的消息

      if (!roomId) return;

      // 1. 獲取初始消息
      const { data: initialMessages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(50);
      
      if (messagesError) console.error('Error fetching messages:', messagesError);
      else setMessages(initialMessages || []);

      // 2. 獲取客戶昵稱用於標題
      const { data: roomData, error: roomError } = await supabase
        .from('chat_rooms')
        .select('customer:profiles!customer_id(nickname)')
        .eq('id', roomId)
        .single();
      
      if (roomData?.customer && Array.isArray(roomData.customer) && roomData.customer.length > 0) {
        // 如果它是一個非空數組
        setCustomerNickname(roomData.customer[0].nickname || 'Customer');
      } else if (roomData?.customer && !Array.isArray(roomData.customer)) {
        // (安全備案) 如果在某些情況下它是一個對象 (例如類型推斷正確時)
        setCustomerNickname((roomData.customer as any).nickname || 'Customer');
      } else if (roomError) {
        // 如果查詢出錯
        console.error('Error fetching customer nickname:', roomError);
        setCustomerNickname('Error');
      }
      
      setIsLoading(false);
    }

    loadChatRoom();
  }, [roomId, supabase]); // 依賴 roomId

  // 效果 2：監聽 Realtime 新消息
  useEffect(() => {
    const channel = supabase
      .channel(`staff_chat_room:${roomId}`) // 確保頻道名稱唯一
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, roomId, staffProfile]);

  // 效果 3 & 4：(從 ChatRoomClient.tsx 複製)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
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

  // 處理消息發送
  const handleSendMessage = async (content: string) => {
    if (content.trim().length === 0 || !staffProfile) return;

    const optimisticMessage: Message = {
      id: Math.random(),
      chat_room_id: roomId,
      sender_id: staffProfile.id,
      content: content.trim(),
      created_at: new Date().toISOString(),
      // (message_type 已被移除，這是正確的)
    };
    
    setMessages(currentMessages => [...currentMessages, optimisticMessage]);
    setNewMessage('');

    const { error } = await supabase
      .from('messages')
      .insert({
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

  // 處理快捷鏈接發送
  const handleLinkSend = (url: string) => {
    const trimmedUrl = url ? url.trim() : '';
    if (trimmedUrl.length === 0) {
      setShowLinks(false);
      return;
    }
    handleSendMessage(trimmedUrl);
    setShowLinks(false);
  };

  // ----------------------
  // JSX 渲染
  // ----------------------
  
  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center"><p>Loading messages...</p></div>;
  }
  
  return (
    // 這是 flex-1，它會填充 ChatLayout 中的右側
    <div className="flex-1 flex flex-col h-full ">
      {/* 1. 聊天室頭部 (沒有返回按鈕) */}
      <header className="shadow-md p-4 sticky top-0 z-10">
        <h2 className="text-xl font-bold text-center">
          Chat with {customerNickname}
        </h2>
      </header>

      {/* 2. 消息列表 */}
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

      {/* 3. 消息輸入框 (V4 功能) */}
      <footer className=" sticky bottom-0 z-10 border-t p-[10px]">
        {showLinks && (
          <div 
            ref={linksPopupRef} 
            className="absolute bottom-full left-0 right-0 card bg-[var(--color-third)] p-[12px] rounded-t-lg"
          >
           {/*  <h4 className="font-bold mb-2">My Quick Links</h4> */}
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
              {/* ... (沒有鏈接的提示) ... */}
            </div>
          </div>
        )}
        
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(newMessage); }} 
          className="flex items-center gap-2"
        >
          {/* (*** 簡化 ***) '+' 按鈕總是顯示，因為這是員工界面 */}
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