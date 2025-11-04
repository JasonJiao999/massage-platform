// 文件路徑: app/admin/users/[id]/edit/page.tsx

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import UserEditForm from './UserEditForm'; // 我們將在下一步創建這個表單組件

export default async function UserEditPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 根據 URL 中的 ID 查詢特定用戶的完整 profile
  const { data: user, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single();

  // 如果找不到用戶或查詢出錯，則顯示 404 頁面
  if (error || !user) {
    notFound();
  }

  return (
    <div className="max-w-[1150px] mx-auto gap-4r p-[24px] my-[10px]">
      <header className="mb-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800">編輯用戶信息</h1>
        <p className="text-gray-600 mt-1">
          正在編輯用戶: <span className="font-semibold">{user.nickname || user.email || user.id}</span>
        </p>
      </header>
      
      {/* 將獲取到的用戶數據作為 prop 傳遞給客戶端表單組件 */}
      <UserEditForm user={user} />
    </div>
  );
}