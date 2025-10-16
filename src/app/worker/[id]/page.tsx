// src/app/worker/[id]/page.tsx (已使用最终的、最明确的类型处理逻辑)

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { getAvailability } from '@/lib/availability';
import WorkerDetailClient from './WorkerDetailClient'; // 导入客户端组件
import { addDays, format } from 'date-fns';

export default async function WorkerDetailPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // --- 1. 并行获取所有需要的数据 ---
  const [
    { data: worker },
    { data: services },
    { data: staffEntry },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', params.id).in('role', ['freeman', 'staff']).single(),
    supabase.from('services').select('*').eq('owner_id', params.id).order('price'),
    supabase.from('staff').select('shops ( id, name, address, slug )').eq('user_id', params.id).single() // 使用 .single() 即可
  ]);

  // 如果找不到技师，显示 404
  if (!worker) {
    notFound();
  }

  // --- 2. 获取可用时间 ---
  const today = new Date();
  const datesToFetch = [today, addDays(today, 1), addDays(today, 2)];
  
  const availabilityPromises = datesToFetch.map(date => getAvailability(params.id, date));
  const availabilityResults = await Promise.all(availabilityPromises);

  const availabilityByDate: Record<string, { start: string, end: string }[]> = {};
  datesToFetch.forEach((date, index) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    availabilityByDate[dateKey] = availabilityResults[index].map(slot => ({
        start: slot.start.toISOString(),
        end: slot.end.toISOString()
    }));
  });

  // --- 3. 【核心修正】: 使用最明确、最安全的方式来处理 shop 数据 ---
  let shop = null; // 默认 shop 为 null

  // 检查 staffEntry.shops 是否存在并且是一个数组
  if (staffEntry?.shops && Array.isArray(staffEntry.shops)) {
    // 如果是数组，并且数组不为空，则取出第一个元素
    shop = staffEntry.shops.length > 0 ? staffEntry.shops[0] : null;
  } else if (staffEntry?.shops) {
    // 增加一个备用逻辑，以防万一 Supabase 返回的是单个对象 (虽然不常见，但更健壮)
    shop = staffEntry.shops as any; // 使用 as any 来告诉 TypeScript 我们确信这里的类型
  }

  // --- 4. 渲染客户端组件并传递数据 ---
  return (
    <WorkerDetailClient
      worker={worker}
      services={services || []}
      shop={shop} // 现在 shop 变量的类型绝对是 TypeScript 能理解的 Shop | null
      availabilityByDate={availabilityByDate}
    />
  );
}