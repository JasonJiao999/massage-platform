// src/app/dashboard/staff/page.tsx (最终调试版)
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';


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
    return <div className="p-8">找不到您的店铺信息，请先创建店铺。</div>;
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">员工管理</h1>

      </div>

      <div className="overflow-x-auto bg-card rounded-lg border border-border">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-background/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-foreground/80 uppercase tracking-wider">姓名 (Nickname)</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-foreground/80 uppercase tracking-wider">状态 (Status)</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">编辑</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {staffList && staffList.length > 0 ? (
              staffList.map((staffMember: any) => { // 使用 any 临时避免类型错误，专注于运行时问题
                const profile = Array.isArray(staffMember.profiles) ? staffMember.profiles[0] : staffMember.profiles;
                return (
                  <tr key={staffMember.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      {profile?.nickname || profile?.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {staffMember.is_active ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">启用</span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">停用</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/dashboard/staff/${staffMember.id}/edit`} className="text-indigo-400 hover:text-indigo-600">编辑</Link>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-sm text-foreground/60">
                  暂无员工信息，请点击右上角添加新员工。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}