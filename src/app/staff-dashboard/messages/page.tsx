// src/app/staff-dashboard/messages/page.tsx

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Database } from '@/lib/database.types'; // 確保這是你正確的路徑
import ChatLayout from './ChatLayout'; // 我們下一步要創建的

// 1. 定義我們將要獲取的數據類型
// 我們需要聊天室，以及關聯的客戶 email 和昵稱
export type RoomWithCustomer = Database['public']['Tables']['chat_rooms']['Row'] & {
  customer: {
    email: string | null;
    nickname: string | null;
  }
};

// 2. 服務器組件
export default async function StaffChatPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 3. 獲取當前登錄的工作者
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login'); // 未登錄
  }

  // 4. 獲取該工作者的所有聊天室，並 JOIN (關聯) 客戶的信息
  const { data: initialRooms, error } = await supabase
    .from('chat_rooms')
    .select(`
      *,
      customer:profiles!customer_id (email, nickname)
    `)
    .eq('worker_id', user.id) // <-- 只獲取 *屬於我* 的聊天室
    .order('created_at', { ascending: false }); // 按最新創建的排序

  if (error) {
    console.error('Error fetching staff chat rooms:', error);
    // 即使出錯，也繼續渲染，但傳遞一個空數組
  }

  // 5. 獲取工作者自己的 Profile (為了 Realtime 驗證和 V4 快捷按鈕)
  const { data: staffProfile } = await supabase
    .from('profiles')
    .select('id, social_links')
    .eq('id', user.id)
    .single();
    
  // 6. 將初始數據傳遞給客戶端佈局
  return (
    <ChatLayout
      initialRooms={initialRooms as RoomWithCustomer[] || []}
      staffProfile={staffProfile}
    />
  );
}