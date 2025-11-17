// src/app/dashboard/profile/page.tsx (已修改，添加了修改密码组件)

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CustomerProfileForm from '@/components/CustomerProfileForm';
import ChangePasswordForm from '@/components/ChangePasswordForm'; // <-- 1. 导入 ChangePasswordForm

export default async function CustomerProfilePage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }

  // 【核心修复】: 在 select 查询中添加 bio 字段
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, bio') // <-- 添加 bio
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    return (
      <div className="container mx-auto p-8 text-white">
        Unable to load your personal information, please try again later.
      </div>
    );
  }

  return (
    // <--- 2. 修改: 将 'gap-[10px]' 替换为 'space-y-6' 以便在卡片之间添加垂直间距
    <div className="max-w-[500px] mx-auto space-y-[10px]">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-white">My Profile</h1>
        <p className="text-foreground/70 mt-2">
          Manage your account information here.
        </p>
      </header>

      {/* 客户个人资料卡片 */}
      <div className="p-8 bg-card rounded-lg">
        <CustomerProfileForm profile={profile} />
      </div>

      {/* --- 3. 新增: 修改密码卡片 --- */}
      <div className="p-8 bg-card rounded-lg">
        <ChangePasswordForm />
      </div>
      {/* --- 结束新增 --- */}

    </div>
  );
}