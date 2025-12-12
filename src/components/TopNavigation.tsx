// src/components/TopNavigation.tsx

import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

// 这是一个异步的 React 服务器组件
export default async function TopNavigation({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="bg-gray-100 border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-2">
          <div className="flex items-center gap-4">
            {!user && (
              <>
                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600">
                  登录
                </Link>
                <Link href="/register" className="text-sm font-medium bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700">
                  注册
                </Link>
              </>
            )}
            
          </div>
          
        </div>
      </div>
      
      {/* 3. 【核心】在这里渲染从 layout.tsx 传递进来的、角色专属的 Header */}
      {children}

    </div>
  );
}