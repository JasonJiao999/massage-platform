// src/app/dashboard/staff/page.tsx
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';


export default async function StaffPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/login');

  // 1. 先找到当前商户的店铺 ID
  const { data: shop } = await supabase
    .from('shops')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (!shop) {
    return <div className="p-8">找不到您的店铺信息，请先创建店铺。</div>;
  }

  // 2. 根据店铺 ID，查询所有属于该店铺的员工
  const { data: staffList, error } = await supabase
    .from('staff')
    .select('*') // 查询所有字段
    .eq('shop_id', shop.id);

  if (error) {
    console.error("Error fetching staff:", error);
    return <div className="p-8 text-red-500">加载员工信息失败。</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">员工管理</h1>
        <Link
          href="/dashboard/staff/new" // 未来我们将创建这个页面用于添加新员工
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
        >
          + 添加新员工
        </Link>
      </div>

      {/* 员工列表表格 */}
      <div className="overflow-x-auto bg-card rounded-lg border border-border">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-background/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-foreground/80 uppercase tracking-wider">姓名 (Nickname)</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-foreground/80 uppercase tracking-wider">等级 (Level)</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-foreground/80 uppercase tracking-wider">状态 (Status)</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">编辑</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {staffList && staffList.length > 0 ? (
              staffList.map((staffMember) => (
                <tr key={staffMember.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{staffMember.nickname}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/80">{staffMember.level || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {staffMember.is_active ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        启用
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        停用
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/dashboard/staff/${staffMember.id}/edit`} className="text-indigo-400 hover:text-indigo-600">
                       编辑
                      </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-foreground/60">
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