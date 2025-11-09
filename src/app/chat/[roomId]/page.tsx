// src/app/chat/[roomId]/page.tsx
// 這是服務器組件 (Server Component)

import { createClient } from '@/utils/supabase/server'; // 服務器 Supabase Client
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ChatRoomClient from './ChatRoomClient'; // 我們下一步要創建的客戶端組件
import { Database } from '@/lib/database.types'; // 假設你已在 types/supabase.ts 中定義了類型
import { User } from '@supabase/supabase-js';

// ----------------------------------------------------------------
// 類型定義 (Type Definitions)
// ----------------------------------------------------------------

// 定義 Message (消息) 的類型
type Message = Database['public']['Tables']['messages']['Row'];

// 定義我們將要傳遞給 Client 組件的 ChatRoom 類型
// 這包含了聊天室信息 + 參與者的信息
export type ChatRoomProps = {
  roomId: string;
  currentUser: User;
  roomInfo: {
    id: string;
    customer_id: string;
    worker_id: string;
    customer_nickname: string | null;
    customer_social_links: any | null; 
    worker_nickname: string | null;
    worker_social_links: any | null; // 用於 V4 方案的 "+" 按鈕
  };
  initialMessages: Message[];
};

// ----------------------------------------------------------------
// 頁面組件 (Page Component)
// ----------------------------------------------------------------
export default async function ChatRoomPage({ params }: { params: { roomId: string } }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { roomId } = params;

  // 1. 獲取當前用戶
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login'); // 未登錄，跳轉
  }

  // 2. (*** 關鍵查詢 ***)
  // 獲取聊天室信息，並同時 JOIN (關聯) 獲取客戶和工作者的 profile
  const { data: chatRoom, error: roomError } = await supabase
    .from('chat_rooms')
    .select(`
      id,
      customer_id,
      worker_id,
      customer:profiles!customer_id(nickname,social_links),
      worker:profiles!worker_id(nickname, social_links)
    `)
    .eq('id', roomId)
    .single(); // .single() 確保只返回一行

  if (roomError || !chatRoom) {
    console.error('Error fetching chat room:', roomError);
    return redirect('/dashboard'); // 房間不存在，跳轉到儀表板
  }

  // 3. (*** 關鍵的安全檢查 ***)
  // 驗證當前用戶是否是這個聊天室的參與者
  // RLS 策略已經阻止了 *讀取*，這是一個雙重保險
  if (user.id !== chatRoom.customer_id && user.id !== chatRoom.worker_id) {
    console.warn(`Security violation: User ${user.id} tried to access room ${roomId}`);
    return redirect('/dashboard'); // 不是參與者，踢走
  }

  // 4. 獲取初始聊天記錄 (例如：最新的 50 條)
  const { data: initialMessages, error: messagesError } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_room_id', roomId)
    .order('created_at', { ascending: true }) // 按時間升序
    .limit(50); // 只加載最新的 50 條

  if (messagesError) {
    console.error('Error fetching messages:', messagesError);
    // 即使消息加載失敗，也繼續加載聊天室
  }

// 5. 準備要傳遞給客戶端組件的 props
  const props: ChatRoomProps = {
    roomId: chatRoom.id,
    currentUser: user,
    roomInfo: {
      id: chatRoom.id,
      customer_id: chatRoom.customer_id,
      worker_id: chatRoom.worker_id,
      
      // (*** 這是關鍵修復 ***)
      // 安全地從數組 [0] 中獲取數據
      customer_nickname: (chatRoom.customer && Array.isArray(chatRoom.customer) && chatRoom.customer.length > 0)
                         ? chatRoom.customer[0].nickname ?? null
                         : null,
                         
      customer_social_links: (chatRoom.customer && Array.isArray(chatRoom.customer) && chatRoom.customer.length > 0) // <-- (3) 在這裡添加
                           ? chatRoom.customer[0].social_links ?? null
                           : null,
                         
      worker_nickname: (chatRoom.worker && Array.isArray(chatRoom.worker) && chatRoom.worker.length > 0)
                       ? chatRoom.worker[0].nickname ?? null
                       : null,
                       
      worker_social_links: (chatRoom.worker && Array.isArray(chatRoom.worker) && chatRoom.worker.length > 0)
                           ? chatRoom.worker[0].social_links ?? null
                           : null,
    },
    initialMessages: initialMessages || [], // 如果為 null，傳遞空數組
  };

  // 6. 將所有數據傳遞給客戶端組件
  return <ChatRoomClient {...props} />;
}