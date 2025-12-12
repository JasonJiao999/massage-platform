// src/app/customer-dashboard/messages/page.tsx
// (這是 Staff's page.tsx [文件 3] 的「鏡像」版本)

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Database } from '@/lib/database.types'; // <-- (重要) 確保這是你正確的路徑
import CustomerChatLayout from './CustomerChatLayout'; // <-- 我們下一步要創建的

// 1. 定義我們將要獲取的數據類型
// 我們需要聊天室，以及關聯的 *工作者* email 和昵稱
export type RoomWithWorker = Database['public']['Tables']['chat_rooms']['Row'] & {
  worker: { 
    email: string | null;
    nickname: string | null;
  }
};

// 2. 服務器組件
export default async function CustomerChatPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 3. 獲取當前登錄的 *客戶*
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }

  // 4. 獲取該 *客戶* 的所有聊天室，並 JOIN (關聯) *工作者* 的信息
  const { data: initialRooms, error } = await supabase
    .from('chat_rooms')
    .select(`
      *,
      worker:profiles!worker_id (email, nickname) 
    `)
    .eq('customer_id', user.id) 
    .order('created_at', { ascending: false }); 

  if (error) {
    console.error('Error fetching customer chat rooms:', error);
  }

  // 5. 獲取 *客戶自己* 的 Profile (為了 Realtime 驗證和 V4 快捷按鈕)
  const { data: customerProfile } = await supabase
    .from('profiles')
    .select('id, social_links') 
    .eq('id', user.id)
    .single();
    
  // 6. 將初始數據傳遞給客戶端佈局
  return (
    <CustomerChatLayout
      initialRooms={initialRooms as RoomWithWorker[] || []}
      customerProfile={customerProfile} 
    />
  );
}