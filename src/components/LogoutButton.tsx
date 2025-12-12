// src/components/LogoutButton.tsx (修正版)
'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

// 1. 在 Props 接口中添加 className
interface LogoutButtonProps {
  logoutText: string;
  className?: string; // <-- 添加這一行 (设为可选)
}

export default function LogoutButton({ logoutText, className }: LogoutButtonProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh(); // 刷新頁面以更新用戶狀態
  };

  return (
    // 2. 將傳入的 className 應用到 button 元素上
    //    我們使用模板字符串来合并默认样式和传入样式
    <button 
      onClick={handleLogout}
      // 如果没有传入 className，则使用一个空字符串
      className={`btn ${className || ''}`}
    >
      {logoutText}
    </button>
  );
}