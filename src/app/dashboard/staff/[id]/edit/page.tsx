// src/app/dashboard/staff/[id]/edit/page.tsx
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import StaffEditForm from '@/components/StaffEditForm';

export default async function EditStaffPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/login');

  const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single();
  if (!shop) return <p>找不到您的店铺。</p>;

  // 使用 select('*') 来获取员工的所有字段信息
  const { data: staffMember } = await supabase
    .from('staff')
    .select('*')
    .eq('id', params.id)
    .eq('shop_id', shop.id)
    .single();

  if (!staffMember) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">
        编辑员工信息: {staffMember.nickname}
      </h1>
      {/* 将完整的员工数据传递给表单组件 */}
      <StaffEditForm staff={staffMember} />
    </div>
  );
}