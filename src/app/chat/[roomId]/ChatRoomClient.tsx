// src/app/chat/[roomId]/ChatRoomClient.tsx
'use client'; // <-- 標記為客戶端組件

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client'; // 瀏覽器 Supabase Client
import { User } from '@supabase/supabase-js';
import ReactLinkify from 'react-linkify';
import { Database } from '@/lib/database.types'; // <-- 導入你更正後的 Database 類型路徑
import { FaPaperPlane, FaPlus, FaArrowLeft } from 'react-icons/fa'; // 導入圖標
import { useRouter } from 'next/navigation'; 

// ----------------------------------------------------------------
// 類型定義 (Type Definitions)
// ----------------------------------------------------------------
// 導入我們在 page.tsx 中導出的類型
import { type ChatRoomProps } from './page'; 
// 從 ChatRoomProps 中提取 Message 類型
type Message = ChatRoomProps['initialMessages'][number];

// ----------------------------------------------------------------
// 聊天氣泡 (ChatBubble) 子組件
// ----------------------------------------------------------------
function ChatBubble({ message, isSender }: { message: Message, isSender: boolean }) {
  // 樣式
  const bubbleClass = isSender ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black';
  const justifyClass = isSender ? 'justify-end' : 'justify-start';

  // 這就是你的「超鏈接」方案實現的地方
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
              // 根據發送者調整鏈接顏色
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
// 主聊天室 (ChatRoom) 組件
// ----------------------------------------------------------------
export default function ChatRoomClient({ roomId, currentUser, roomInfo, initialMessages }: ChatRoomProps) {
  const supabase = createClient();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [showLinks, setShowLinks] = useState(false); // <-- 用於 V4 方案 "+" 按鈕的狀態
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const linksPopupRef = useRef<HTMLDivElement>(null); 

  // 效果 1：監聽 Realtime 新消息
  useEffect(() => {
    // 訂閱 `messages` 表中與此 `chat_room_id` 相關的 INSERT 事件
    const channel = supabase
      .channel(`chat_room:${roomId}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages', 
          filter: `chat_room_id=eq.${roomId}` // 只監聽這個房間的消息
        },
        (payload) => {
          // 當新消息到來時，將其添加到 state 中
          // (做一個額外檢查，確保不是自己剛發送的消息又被推送回來)
          if (payload.new.sender_id !== currentUser.id) {
             setMessages((currentMessages) => [...currentMessages, payload.new as Message]);
          }
        }
      )
      .subscribe();

    // 組件卸載時，清理訂閱
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, roomId, currentUser.id]);

  // 效果 2：當新消息添加時，滾動到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // (*** 這是新添加的 useEffect，用於實現「點擊外部關閉」 ***)
 // Hook 3：監聽「點擊外部」以關閉快捷鏈接窗口
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (linksPopupRef.current && !linksPopupRef.current.contains(event.target as Node)) {
        setShowLinks(false);
      }
    }
    if (showLinks) {
      document.addEventListener('click', handleClickOutside); // <-- 已修改為 'click'
    }
    return () => {
      document.removeEventListener('click', handleClickOutside); // <-- 已修改為 'click'
    };
  }, [showLinks]); // 這個 effect 依賴於 showLinks 的狀態


  // 判斷聊天對象是誰
  const otherPerson = roomInfo.customer_id === currentUser.id 
    ? { nickname: roomInfo.worker_nickname } 
    : { nickname: roomInfo.customer_nickname };

  // 滾動到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  // 處理消息發送
  const handleSendMessage = async (content: string) => {
    if (content.trim().length === 0) return;

    // (樂觀更新 Optimistic Update)
    // 1. 立即將消息添加到 UI，使其看起來很快
    const tempId = Math.random(); // 臨時 ID 用於 React key
    const optimisticMessage: Message = {
      id: tempId,
      chat_room_id: roomId,
      sender_id: currentUser.id,
      content: content.trim(),
      created_at: new Date().toISOString(),

    };
    


    // (注意：如果你 V3 簡化版的 messages 表中沒有 message_type，請從上面對象中刪除它)
    setMessages(currentMessages => [...currentMessages, optimisticMessage]);
    
    // 2. 清空輸入框
    setNewMessage('');

    // 3. 將消息插入數據庫
    const { error } = await supabase
      .from('messages')
      .insert({
        chat_room_id: roomId,
        sender_id: currentUser.id,
        content: content.trim(),
      });

    // 4. 如果發送失敗...
    if (error) {
      console.error('Error sending message:', error);
      // (將消息從 UI 中移除，並放回輸入框，標記為錯誤)
      setNewMessage(content); // 將未發送的消息放回輸入框
      setMessages(currentMessages => currentMessages.filter(m => m.id !== tempId));
    }
    // 如果發送成功，Realtime 會廣播給其他人
    // 我們不需要做任何事
  };

  // 處理 "+" 按鈕點擊，發送預存的鏈接
  const handleLinkSend = (url: string) => {
    // 1. (*** 這是關鍵修復 ***)
    // 檢查 url 是否為 null, undefined, "" 或 "   "
    const trimmedUrl = url ? url.trim() : '';
    
    if (trimmedUrl.length === 0) {
      // 如果鏈接是空的，我們什麼都不做，只關閉窗口
      setShowLinks(false);
      return;
    }

    // 2. 只有在 url 有效時才發送
    handleSendMessage(trimmedUrl); // 發送已清理過的 URL
    setShowLinks(false); // 關閉彈出窗口
  };
  const mySocialLinks = (currentUser.id === roomInfo.worker_id) 
    ? roomInfo.worker_social_links 
    : roomInfo.customer_social_links;

  return (
    <div className="flex flex-col card min-[1200px]:w-[1200px] h-[800px] justify-between border mx-auto ">
      {/* 1. 聊天室頭部 */}
      <header className="bg-white shadow-md p-4 sticky top-0 z-10 flex justify-between items-center">
        <button 
          onClick={() => router.back()} // <-- 點擊時返回上一頁
          className="btn m-[10px]"
          aria-label="Go back"
        >
          <FaArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-10"></div> 
        <h2 className="text-xl font-bold text-center w-full">
          Chat with {otherPerson.nickname || 'User'}
        </h2>
        <div className="w-10"></div>
      </header>

      {/* 2. 消息列表 */}
      <main className="flex-1 overflow-y-auto p-[24px] space-y-[12px]">
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg}
            isSender={msg.sender_id === currentUser.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </main>

      {/* 3. 消息輸入框 (包含 V4 功能) */}
      <footer className="sticky bottom-0 z-10 border-t p-[10px]">
        
        {/* --- 你的 V4 方案：快捷鏈接彈出窗口 --- */}
        {showLinks && (
          <div className="absolute bottom-full left-0 right-0 card bg-[var(--color-third)] p-[12px] rounded-t-lg">
            <div 
            ref={linksPopupRef} 
            className="absolute bottom-full left-0 right-0  border-t rounded-t-lg"
            ></div>
            <h4 className="font-bold mb-2">My Quick Links</h4>
            <div className="flex flex-col gap-2">
              {/* 我們映射 social_links JSON 對象 */}
              {mySocialLinks && Object.entries(mySocialLinks).map(([key, value]) => (
                (value && typeof value === 'string') && ( // 確保它有值且是字符串
                  <button 
                    type="button" 
                    key={key} 
                    onClick={() => handleLinkSend(value)}
                    className="btn btn-sm  text-left justify-start"
                  >
                    Send {key.replace('_', ' ')}
                  </button>
                )
              ))}
              {/* 如果沒有鏈接 */}
              {!roomInfo.worker_social_links || Object.keys(roomInfo.worker_social_links).length === 0 && (
                <p className="text-sm text-gray-500">No links.</p>
              )}
            </div>
          </div>
        )}
        {/* --- 彈出窗口結束 --- */}

        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(newMessage); }} 
          className="flex items-center gap-2"
        >
          {/* "+" 按鈕 */}

            <button 
              type="button" 
              onClick={() => setShowLinks(!showLinks)} // 切換彈出窗口
              className="card bg-[var(--color-third)] p-[10px]"
            >
              <FaPlus />
            </button>

          
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message or paste a link..."
            className="flex-1 input input-bordered " // 假設你使用 DaisyUI
          />
          <button type="submit" className="btn btn-primary text-[var(--foreground)]">
            <FaPaperPlane />
          </button>
        </form>
      </footer>
    </div>
  );
}