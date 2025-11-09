// src/app/customer-dashboard/messages/CustomerChatWindow.tsx
// (這是 StaffChatWindow.tsx [文件 1] 的「鏡像」版本)
'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import ReactLinkify from 'react-linkify';
import { Database } from '@/lib/database.types'; 
import { FaPaperPlane, FaPlus } from 'react-icons/fa';

// 類型定義
type Message = Database['public']['Tables']['messages']['Row'];
type CustomerProfile = {
  id: string;
  social_links: any | null;
} | null;

type CustomerChatWindowProps = {
  roomId: string;
  customerProfile: CustomerProfile;
  initialWorkerNickname: string;
};

// 聊天氣泡 (ChatBubble) 子組件 (複製而來)
function ChatBubble({ message, isSender }: { message: Message, isSender: boolean }) {
  const bubbleClass = isSender ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black';
  const justifyClass = isSender ? 'justify-end' : 'justify-start';

  return (
    <div className={`flex ${justifyClass} w-full`}>
      <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${bubbleClass}`}>
        <ReactLinkify
          componentDecorator={(decoratedHref, decoratedText, key) => (
            <a target="_blank" rel="noopener noreferrer" href={decoratedHref} key={key} 
               className={isSender ? "text-white underline hover:text-blue-200" : "text-blue-600 underline hover:text-blue-800"}>
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

// 主聊天窗口
export default function CustomerChatWindow({ roomId, customerProfile, initialWorkerNickname }: CustomerChatWindowProps) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showLinks, setShowLinks] = useState(false);
  const [workerNickname, setWorkerNickname] = useState('Loading...'); 
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const linksPopupRef = useRef<HTMLDivElement>(null);

  // 效果 1：獲取歷史消息和 *工作者* 昵稱
  useEffect(() => {
    async function loadMessages() {
      setIsLoading(true);
      setMessages([]); // 清空上一房間的消息
      if (!roomId) return;

      // 1. 只獲取初始消息
      const { data: initialMessages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(50);
      
      if (messagesError) console.error('Error fetching messages:', messagesError);
      else setMessages(initialMessages || []);

      // 2. (獲取昵稱的邏輯已被*移除*，因為我們有 prop 了)
      setIsLoading(false);
    }

    loadMessages();
  }, [roomId, supabase]); // 依賴 roomId

  // 效果 2：監聽 Realtime
  useEffect(() => {
    const channel = supabase
      .channel(`customer_chat_room:${roomId}`) 
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_room_id=eq.${roomId}` },
        (payload) => {
          // (反轉) 檢查是否 *不是我* (客戶) 發送的
          if (payload.new.sender_id !== customerProfile?.id) {
             setMessages((currentMessages) => [...currentMessages, payload.new as Message]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, roomId, customerProfile]);

  // 效果 3 & 4：(複製)
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  // 處理消息發送 (反轉)
  const handleSendMessage = async (content: string) => {
    if (content.trim().length === 0 || !customerProfile) return;

    const optimisticMessage: Message = {
      id: Math.random(),
      chat_room_id: roomId,
      sender_id: customerProfile.id, 
      content: content.trim(),
      created_at: new Date().toISOString(),
    };
    
    setMessages(currentMessages => [...currentMessages, optimisticMessage]);
    setNewMessage('');

    const { error } = await supabase
      .from('messages')
      .insert({
        chat_room_id: roomId,
        sender_id: customerProfile.id, 
        content: content.trim(),
      });

    if (error) {
      console.error('Error sending message:', error);
      setNewMessage(content);
      setMessages(currentMessages => currentMessages.filter(m => m.id !== optimisticMessage.id));
    }
  };

  // 處理快捷鏈接發送 (反轉)
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
      {/* 1. 聊天室頭部 (顯示 *工作者* 昵稱) */}
      <header className="shadow-md p-4 sticky top-0 z-10">
        <h2 className="text-xl font-bold text-center">
          Chat with {initialWorkerNickname}
        </h2>
      </header>

      {/* 2. 消息列表 */}
      <main className="flex-1 overflow-y-auto p-[24px] space-y-[12px]">
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg}
            isSender={msg.sender_id === customerProfile?.id} 
          />
        ))}
        <div ref={messagesEndRef} />
      </main>

      {/* 3. 消息輸入框 (V4 功能) */}
      <footer className="sticky bottom-0 z-10 border-t p-[10px]">
        {showLinks && (
          <div 
            ref={linksPopupRef} 
            className="absolute bottom-full left-0 right-0 card bg-[var(--color-third)] p-[12px] rounded-t-lg"
          >
            
            <div className="flex flex-col gap-2">
              {/* (反轉) 顯示 *客戶* 的快捷鏈接 */}
              {customerProfile?.social_links && Object.entries(customerProfile.social_links).map(([key, value]) => (
                (value && typeof value === 'string') && (
                  <button 
                    type="button" 
                    key={key} 
                    onClick={() => handleLinkSend(value)}
                    className="btn btn-sm btn-outline text-left justify-start my-[5px]"
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
          {/* (反轉) '+' 按鈕總是顯示，因為這是客戶界面 */}
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