// src/app/dashboard/staff/page.tsx (最终调试版)
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import StaffTableDiv from '@/components/StaffTableDiv';

export default async function StaffPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/login');

  const { data: shop } = await supabase
    .from('shops')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (!shop) {
    return <div className="p-8">Your team information cannot be found. Please create a team first.</div>;
  }
  
  // 【核心修复】: 使用 let 声明变量，并添加更明确的错误捕获
  let staffList = [];
  try {
    const { data, error } = await supabase
      .from('staff')
      .select(`
        id,
        is_active,
        profiles (
          nickname,
          email
        )
      `)
      .eq('shop_id', shop.id);

    // 强制抛出任何 Supabase 返回的错误
    if (error) {
      throw error;
    }

    staffList = data || [];

  } catch (error) {
    // 捕获并打印详细的错误信息到 VS Code 终端
    console.error("!!! Critical error fetching staff with profiles:", error);
    // 在页面上直接显示错误，而不是通用提示
    return <div className="p-8 text-red-500">加载员工信息失败。请检查 VS Code 终端获取详细错误。</div>;
  }



  return (
    <div className="max-w-[1200px] mx-auto gap-[10px]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white mx-[10px]">Team Management</h1>

      </div>

      <div className="card w-[full-20px] text-[var(--foreground)] mx-[10px]">
        <StaffTableDiv staffList={staffList} />
      </div>
    </div>
  );
}