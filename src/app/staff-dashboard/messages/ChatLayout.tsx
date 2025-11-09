// src/app/staff-dashboard/messages/ChatLayout.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Database } from '@/lib/database.types';
import { type RoomWithCustomer } from './page'; // 導入自 page.tsx
import StaffChatWindow from './StaffChatWindow'; 

// 類型：從 page.tsx 傳入的 Staff Profile
type StaffProfile = {
  id: string;
  social_links: any | null;
} | null;

// ----------------------------------------------------------------
// 輔助函數：實現你要求的「只顯示@之前的字符」
// ----------------------------------------------------------------
function getEmailUsername(email: string | null): string {
  if (!email) return 'Unknown User';
  return email.split('@')[0];
}

// ----------------------------------------------------------------
// 主佈局組件
// ----------------------------------------------------------------
export default function ChatLayout({ initialRooms, staffProfile }: {
  initialRooms: RoomWithCustomer[];
  staffProfile: StaffProfile;
}) {
  const supabase = createClient();
  const [rooms, setRooms] = useState(initialRooms);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  
  // (*** 這是你的「紅色提醒」功能的狀態 ***)
  // 這是一個 Set，存儲所有有新消息的 chat_room_id
  const [newMessageAlerts, setNewMessageAlerts] = useState(new Set<string>());

  // 效果 1：監聽 Realtime 以獲取新消息提醒
  useEffect(() => {
    // 監聽 `messages` 表中的所有新插入
    const channel = supabase
      .channel('staff-new-messages')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages' 
        },
        (payload) => {
          const newMessage = payload.new as Database['public']['Tables']['messages']['Row'];
          
          // 檢查這條新消息是否發往 *我* 的聊天室之一
          const targetRoom = rooms.find(room => room.id === newMessage.chat_room_id);
          
          if (targetRoom && newMessage.sender_id !== staffProfile?.id) {
            // 這是一條發給我的、且不是我發送的新消息
            
            // 如果我當前 *沒有* 選中這個聊天室，就添加提醒
            if (newMessage.chat_room_id !== selectedRoomId) {
              setNewMessageAlerts(prevAlerts => {
                const newAlerts = new Set(prevAlerts);
                newAlerts.add(newMessage.chat_room_id);
                return newAlerts;
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, rooms, staffProfile, selectedRoomId]);

  // 處理聊天室點擊
  const handleRoomSelect = (roomId: string) => {
    setSelectedRoomId(roomId);
    
    // (*** 實現你的「點擊後移除紅色提醒」功能 ***)
    setNewMessageAlerts(prevAlerts => {
      const newAlerts = new Set(prevAlerts);
      newAlerts.delete(roomId); // 從提醒中移除
      return newAlerts;
    });
  };

  return (
    <div className="flex flex-row card min-[1200px]:w-[1200px] h-[800px] justify-between border mx-auto ">
      
      {/* ---------------------------------- */}
      {/* 1. 左側聊天列表 */}
      {/* ---------------------------------- */}
      <aside className="w-[30%] max-w-sm overflow-y-auto h-full">
        <header className="text-center">
          <h2 className="text-2xl font-bold">My Messages</h2>
          {/* 你可以在這裡添加一個搜索框 */}
        </header>
        <nav className="flex-1  gap-[10px]">
          {rooms.map((room) => {
            // (*** 實現你的「紅色/默認」顏色邏輯 ***)
            const isSelected = selectedRoomId === room.id;
            const hasNewMessage = newMessageAlerts.has(room.id);
            
            let bgColorClass = 'hover:bg-white-100'; // 默認
            if (isSelected) {
              bgColorClass = 'bg-[--color-secondary] text-[var(--foreground)]'; // 正在使用
            } else if (hasNewMessage) {
              bgColorClass = 'bg-red-200 hover:bg-red-300'; // 新消息
            }

            return (
              <button
                key={room.id}
                onClick={() => handleRoomSelect(room.id)}
                className={`flex items-center w-[95%] p-4 text-left ${bgColorClass} transition-colors m-[10px] `}
              >
                <div className="flex-1 truncate ">
                  <h3 className="font-semibold ">
                    {/* (*** 實現你的「顯示@之前字符」功能 ***) */}
                    Email:{getEmailUsername(room.customer.email)}
                  </h3>
                  <p className="text-sm  truncate">
                    Name:{room.customer.nickname || 'Customer'}
                  </p>
                </div>
                {hasNewMessage && (
                  <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0 ml-2"></div>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ---------------------------------- */}
      {/* 2. 右側對話框主體 */}
      {/* ---------------------------------- */}
      <main className="w-[70%] border-l overflow-y-auto h-full">
        {selectedRoomId ? (

          <StaffChatWindow
            key={selectedRoomId} // (重要!) key 使得切換房間時組件會重置
            roomId={selectedRoomId}
            staffProfile={staffProfile}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <h1 className="text-2xl text-gray-500">Select a chat to start</h1>
          </div>
        )}
      </main>
    </div>
  );
}