// src/app/customer-dashboard/messages/CustomerChatLayout.tsx (已更新)
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Database } from '@/lib/database.types'; 
import { type RoomWithWorker } from './page';
import CustomerChatWindow from './CustomerChatWindow'; 

// (类型定义和辅助函数不变)
type CustomerProfile = {
  id: string;
  social_links: any | null;
} | null;

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

  // (Realtime 提醒的 useEffect 不变)
  useEffect(() => {
    const channel = supabase
      .channel('customer-new-messages') 
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMessage = payload.new as Database['public']['Tables']['messages']['Row'];
          const targetRoom = rooms.find(room => room.id === newMessage.chat_room_id);
          
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
    return () => { supabase.removeChannel(channel); };
  }, [supabase, rooms, customerProfile, selectedRoomId]);

  // (不变) 處理聊天室點擊
  const handleRoomSelect = (roomId: string) => {
    setSelectedRoomId(roomId);
    setNewMessageAlerts(prevAlerts => {
      const newAlerts = new Set(prevAlerts);
      newAlerts.delete(roomId); 
      return newAlerts;
    });
  };

  // 【新增】: 處理移動端返回按鈕點擊
  const handleGoBack = () => {
    setSelectedRoomId(null);
  };

  return (
    // 【修改】: 移除 max-[800px]:w-[300px]，使用 max-w-[1200px] 和 w-full 确保响应式
    <div className="flex flex-row card w-[full-20px] h-[800px] justify-between border mx-[10px]">
      
      {/* 1. 左側聊天列表 (顯示 *工作者*) */}
      {/* 【修改】: 添加响应式类 */}
      <aside 
        className={`
          w-full md:w-[30%] md:max-w-sm overflow-y-auto h-full 
          ${selectedRoomId ? 'hidden' : 'block'} md:block
        `}
      >
        <header className="text-center">
          <h2 className="text-2xl font-bold">My Messages</h2>
        </header>
        <nav className="flex-1 gap-[10px]">
          {rooms.map((room) => {
            const isSelected = selectedRoomId === room.id;
            const hasNewMessage = newMessageAlerts.has(room.id);
            
            let bgColorClass = 'hover:bg-gray-100';
            if (isSelected) bgColorClass = 'bg-[--color-secondary] text-[var(--foreground)]';
            else if (hasNewMessage) bgColorClass = 'bg-red-200 hover:bg-red-300'; 

            return (
              <button
                key={room.id}
                onClick={() => handleRoomSelect(room.id)}
                className={`flex items-center w-full p-4 text-left ${bgColorClass} transition-colors`}
              >
                <div className="flex-1 truncate">
                  <h3 className="font-semibold ">
                    Email:{getEmailUsername(room.worker.email)}
                  </h3>
                  <p className="text-sm truncate">
                    Name:{room.worker.nickname || 'Staff'} 
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
      {/* 【修改】: 添加响应式类 */}
      <main 
        className={`
          w-full md:w-[70%] border-l overflow-y-auto h-full 
          ${selectedRoomId ? 'block' : 'hidden'} md:block
        `}
      >
        {selectedRoomId ? (
          (() => {
            const selectedRoom = rooms.find(r => r.id === selectedRoomId);
            return selectedRoom ? (
              <CustomerChatWindow
                key={selectedRoom.id} 
                roomId={selectedRoom.id}
                customerProfile={customerProfile}
                initialWorkerNickname={selectedRoom.worker.nickname || 'Staff'}
                onGoBack={handleGoBack} // 【新增】: 传递返回函数
              />
            ) : (
              <div className="">
                <h1>Loading room...</h1>
              </div>
            );
          })()
        ) : (
          <div className="flex items-center justify-center h-full">
            <h1 className="text-2xl text-gray-500">Select a chat to start</h1>
          </div>
        )}
      </main>
    </div>
  );
}