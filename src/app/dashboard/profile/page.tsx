// src/app/dashboard/profile/page.tsx

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CustomerProfileForm from '@/components/CustomerProfileForm';

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
    .select('id, full_name, email, avatar_url, bio') // <-- 添加 bio
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    return (
      <div className="container mx-auto p-8 text-white">
        无法加载您的个人信息，请稍后再试。
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-white">我的信息</h1>
        <p className="text-foreground/70 mt-2">
          在这里管理您的账户信息。
        </p>
      </header>

      <div className="p-8 bg-card rounded-lg border border-border">
        <CustomerProfileForm profile={profile} />
      </div>
    </div>
  );
}