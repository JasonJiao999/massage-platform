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
        <h1 className="text-2xl font-bold text-white">Team Management</h1>

      </div>

      <div className="card bg-primary p-[24px]">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-background/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-foreground/80 uppercase tracking-wider">Nickname</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-foreground/80 uppercase tracking-wider">Status</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Edit</span>
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
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Enable</span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Disable</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/dashboard/staff/${staffMember.id}/edit`} className="btn">Edit</Link>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-sm text-foreground/60">
                  No information available. Please click the top right corner to add a new member.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}