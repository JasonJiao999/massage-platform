// src/app/staff-dashboard/messages/ChatLayout.tsx (已更新)
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Database } from '@/lib/database.types';
import { type RoomWithCustomer } from './page'; 
import StaffChatWindow from './StaffChatWindow'; 

// 保持类型定义不变
type StaffProfile = {
  id: string;
  social_links: any | null;
} | null;

function getEmailUsername(email: string | null): string {
  if (!email) return 'Unknown User';
  return email.split('@')[0];
}

export default function ChatLayout({ initialRooms, staffProfile }: {
  initialRooms: RoomWithCustomer[];
  staffProfile: StaffProfile;
}) {
  const supabase = createClient();
  const [rooms, setRooms] = useState(initialRooms);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [newMessageAlerts, setNewMessageAlerts] = useState(new Set<string>());

  // Realtime 提醒的 useEffect (保持不变)
  useEffect(() => {
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
          const targetRoom = rooms.find(room => room.id === newMessage.chat_room_id);
          
          if (targetRoom && newMessage.sender_id !== staffProfile?.id) {
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
    // 【修改】: 移除了 max-[800px]:w-[300px]，使用 max-w-[1200px] 和 w-full 确保响应式
    <div className="flex flex-row card w-[full-20px] h-[800px] justify-between border mx-[10px]">
      
      {/* ---------------------------------- */}
      {/* 1. 左側聊天列表 */}
      {/* ---------------------------------- */}
      {/* 【修改】: 添加响应式类 (在 md 断点以下，根据 selectedRoomId 隐藏) */}
      <aside 
        className={`
          w-full md:w-[30%] md:max-w-sm overflow-y-auto h-full 
          ${selectedRoomId ? 'hidden' : 'block'} md:block
        `}
      >
        <header className="text-center">
          <h2 className="text-2xl font-bold">My Messages</h2>
        </header>
        <nav className="flex-1  gap-[10px]">
          {rooms.map((room) => {
            const isSelected = selectedRoomId === room.id;
            const hasNewMessage = newMessageAlerts.has(room.id);
            
            let bgColorClass = 'hover:bg-white-100'; 
            if (isSelected) {
              bgColorClass = 'bg-[--color-secondary] text-[var(--foreground)]'; 
            } else if (hasNewMessage) {
              bgColorClass = 'bg-red-200 hover:bg-red-300'; 
            }

            return (
              <button
                key={room.id}
                onClick={() => handleRoomSelect(room.id)}
                className={`flex items-center w-[95%] p-4 text-left ${bgColorClass} transition-colors m-[10px] `}
              >
                <div className="flex-1 truncate ">
                  <h3 className="font-semibold ">
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
      {/* 【修改】: 添加响应式类 (在 md 断点以下，根据 selectedRoomId 显示) */}
      <main 
        className={`
          w-full md:w-[70%] border-l overflow-y-auto h-full 
          ${selectedRoomId ? 'block' : 'hidden'} md:block
        `}
      >
        {selectedRoomId ? (
          <StaffChatWindow
            key={selectedRoomId} 
            roomId={selectedRoomId}
            staffProfile={staffProfile}
            onGoBack={handleGoBack} // 【新增】: 传递返回函数
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