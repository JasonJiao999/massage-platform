// 文件路徑: app/admin/media/page.tsx

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import MediaUploadForm from './MediaUploadForm';
import MediaList from './MediaList'; // 導入我們的新組件

export default async function AdminMediaPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 【核心修改】: 在伺服器端獲取所有已上傳的媒體數據
  const { data: mediaItems, error } = await supabase
    .from('img_admin')
    .select('*')
    .order('created_at', { ascending: false }); // 按創建時間倒序排列

  if (error) {
    console.error("獲取媒體列表失敗:", error);
  }

  return (
    <div className="max-w-[1150px] mx-auto gap-4r p-[24px] my-[10px]">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">媒體管理</h1>
        <p className="text-gray-600 mt-1">在這裡上傳和管理網站的 Logo、廣告等媒體資產。</p>
      </header>
      
      {/* 【核心修改】: 使用 Grid 佈局將上傳和列表分開 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* 左側：上傳表單 */}
        <div className="lg:col-span-1">
          <div className="card bg-primary rounded-lg p-[24px] my-[20px] text-[var(--foreground)]">
            <h2 className="text-2xl font-semibold mb-6">上傳新媒體</h2>
            <MediaUploadForm />
          </div>
        </div>

        {/* 右側：媒體列表 */}
        <div className="lg:col-span-2">
          {/* 將伺服器獲取的數據傳遞給客戶端組件 */}
          <MediaList initialMedia={mediaItems || []} />
        </div>

      </div>
    </div>
  );
}