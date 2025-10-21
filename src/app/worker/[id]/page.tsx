// src/app/worker/[id]/page.tsx (已添加服务器端日志)

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { getAvailability } from '@/lib/availability';
import WorkerDetailClient from './WorkerDetailClient';
import { addDays, format } from 'date-fns';

export default async function WorkerDetailPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // --- 1. 查询技师数据，包括关联的地址 ---
  const { data: worker, error: workerError } = await supabase
    .from('profiles')
    .select(`
      *,
      province: locations!province_id (name_en),
      district: locations!district_id (name_en),
      sub_district: locations!sub_district_id (name_en)
    `)
    .eq('id', params.id)
    .in('role', ['freeman', 'staff'])
    .single();
  
  if (workerError || !worker) {
    console.error("Error fetching worker profile:", workerError);
    notFound();
  }

  // --- 并行获取其他数据 (逻辑不变) ---
  const [
    { data: services },
    { data: staffEntry },
  ] = await Promise.all([
    supabase.from('services').select('*').eq('owner_id', params.id).order('price'),
    supabase.from('staff').select('shops ( id, name, address, slug )').eq('user_id', params.id).single()
  ]);

  if (!worker.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{worker.nickname || '该技师'}</h1>
          <p className="text-lg text-yellow-600">当前正在休息中，暂不接受预约。</p>
        </div>
      </div>
    );
  }
  
  // --- 获取可用性 (逻辑不变) ---
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

  // --- 处理 shop 数据 (逻辑不变) ---
  let shop = null;
  if (staffEntry?.shops) {
      if (Array.isArray(staffEntry.shops)) {
          shop = staffEntry.shops.length > 0 ? staffEntry.shops[0] : null;
      } else {
          shop = staffEntry.shops;
      }
  }

  // --- 拼接完整地址字符串 ---
  const locationParts = [
      worker.address_detail,
      worker.sub_district?.name_en,
      worker.district?.name_en,
      worker.province?.name_en
  ].filter(Boolean);
  const fullAddress = locationParts.join(', ');

  // --- 【调试日志 1】在 VS Code 终端查看这个日志 ---
  console.log("\n--- [服务器端日志 - page.tsx] ---");
  console.log("查询到的 worker.address_detail:", worker.address_detail);
  console.log("查询到的省份:", worker.province?.name_en);
  console.log("查询到的市/区:", worker.district?.name_en);
  console.log("查询到的分区:", worker.sub_district?.name_en);
  console.log("最终拼接的 fullAddress:", fullAddress);
  console.log("----------------------------------\n");

  // --- 将所有数据传递给客户端组件 ---
  return (
    <WorkerDetailClient
      worker={worker}
      services={services || []}
      shop={shop}
      initialAvailability={availabilityByDate}
      fullAddress={fullAddress}
    />
  );
}