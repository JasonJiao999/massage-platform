// src/app/customer-dashboard/messages/CustomerChatLayout.tsx
// (這是 ChatLayout.tsx [文件 2] 的「鏡像」版本)
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Database } from '@/lib/database.types'; // <-- (重要) 確保這是你正確的路徑
import { type RoomWithWorker } from './page';
import CustomerChatWindow from './CustomerChatWindow'; // <-- 我們下一步要創建的

// 類型：從 page.tsx 傳入的 Customer Profile
type CustomerProfile = {
  id: string;
  social_links: any | null;
} | null;

// 輔助函數：獲取 Email 用戶名
function getEmailUsername(email: string | null): string {
  if (!email) return 'Unknown User';
  return email.split('@')[0];
}

export default function CustomerChatLayout({ initialRooms, customerProfile }: {
  initialRooms: RoomWithWorker[];
  customerProfile: CustomerProfile;
}) {
  const supabase = createClient();
  const [rooms, setRooms] = useState(initialRooms);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [newMessageAlerts, setNewMessageAlerts] = useState(new Set<string>());

  // 效果 1：監聽 Realtime 以獲取新消息提醒
  useEffect(() => {
    const channel = supabase
      .channel('customer-new-messages') 
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMessage = payload.new as Database['public']['Tables']['messages']['Row'];
          const targetRoom = rooms.find(room => room.id === newMessage.chat_room_id);
          
          // (反轉) 檢查消息是否發往我的房間，且 *不是我* (客戶) 發送的
          if (targetRoom && newMessage.sender_id !== customerProfile?.id) { 
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
  }, [supabase, rooms, customerProfile, selectedRoomId]);

  // 處理聊天室點擊
  const handleRoomSelect = (roomId: string) => {
    setSelectedRoomId(roomId);
    setNewMessageAlerts(prevAlerts => {
      const newAlerts = new Set(prevAlerts);
      newAlerts.delete(roomId); 
      return newAlerts;
    });
  };

  return (
    <div className="flex flex-row card min-[1200px]:w-[1200px] h-[800px] justify-between border mx-auto ">
      
      {/* 1. 左側聊天列表 (顯示 *工作者*) */}
      <aside className="w-[30%] max-w-sm overflow-y-auto h-full">
        <header className="text-center">
          <h2 className="text-2xl font-bold">My Messages</h2>
        </header>
        <nav className="flex-1 gap-[10px]">
          {rooms.map((room) => {
            const isSelected = selectedRoomId === room.id;
            const hasNewMessage = newMessageAlerts.has(room.id);
            
            let bgColorClass = 'hover:bg-gray-100';
            if (isSelected) bgColorClass = 'bg-[--color-secondary] text-[var(--foreground)]';
            else if (hasNewMessage) bgColorClass = 'bg-red-200 hover:bg-red-300'; // <-- 紅色提醒

            return (
              <button
                key={room.id}
                onClick={() => handleRoomSelect(room.id)}
                className={`flex items-center w-full p-4 text-left ${bgColorClass} transition-colors`}
              >
                <div className="flex-1 truncate">
                  <h3 className="font-semibold ">
                    {/* (反轉) 顯示工作者的 email 用戶名 */}
                    Email:{getEmailUsername(room.worker.email)}
                  </h3>
                  <p className="text-sm truncate">
                    Name:{room.worker.nickname || 'Staff'} {/* (反轉) 顯示工作者昵稱 */}
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

      {/* 2. 右側對話框主體 */}
      <main className="w-[70%] border-l overflow-y-auto h-full">
        {selectedRoomId ? (
          // (*** 這是新的 V2 邏輯 ***)
          // 1. 我們在渲染前，先從 'rooms' 狀態中找到被選中的房間對象
          (() => {
            const selectedRoom = rooms.find(r => r.id === selectedRoomId);
            
            // 2. 如果找到了，就渲染聊天窗口並傳入昵稱
            return selectedRoom ? (
              <CustomerChatWindow
                key={selectedRoom.id} 
                roomId={selectedRoom.id}
                customerProfile={customerProfile}
                // (*** 這是關鍵的新 prop ***)
                initialWorkerNickname={selectedRoom.worker.nickname || 'Staff'}
              />
            ) : (
              // 如果由於某種原因找不到 (例如列表正在刷新)，顯示提示
              <div className="">
                <h1>Loading room...</h1>
              </div>
            );
          })() // <-- 立即執行這個函數
        ) : (
          // (不變) 如果沒有選中房間，顯示提示
          <div className="">
            <h1>Select a chat to start</h1>
          </div>
        )}
      </main>
    </div>
  );
}