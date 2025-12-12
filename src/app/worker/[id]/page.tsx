// 文件路徑: app/worker/[id]/page.tsx (最終修復版 - 正確的地址邏輯)

import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { addMinutes, isBefore, isAfter, parse, format, startOfDay, addDays, getDay, isEqual } from 'date-fns';
import WorkerDetailClient from './WorkerDetailClient';

// (接口定義 TimeRange 保持不變)
interface TimeRange { start: Date; end: Date; }


async function generateAvailability(
  workerId: string,
  serviceDuration: number,
  daysToCheck: number = 3
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
 
  const availability: { [key: string]: { start: string; end: string }[] } = {};
  const today = startOfDay(new Date());
  const endDate = addDays(today, daysToCheck);
  const [{ data: rules }, { data: overrides }, { data: existingBookings }] = await Promise.all([
    supabase.from('availability_rules').select('*').eq('worker_profile_id', workerId),
    supabase.from('availability_overrides').select('*').eq('worker_profile_id', workerId).gte('override_date', format(today, 'yyyy-MM-dd')).lte('override_date', format(endDate, 'yyyy-MM-dd')),
    supabase.from('schedules').select('start_time, end_time').eq('worker_profile_id', workerId).gte('start_time', today.toISOString()).lt('start_time', endDate.toISOString())
  ]);
  const bookedSlots: TimeRange[] = existingBookings?.map(b => ({ start: new Date(b.start_time), end: new Date(b.end_time) })) || [];
  const dayMap = [7, 1, 2, 3, 4, 5, 6];
  for (let i = 0; i < daysToCheck; i++) {
    const currentDate = addDays(today, i);
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const dayOfWeekForDb = dayMap[getDay(currentDate)];
    let workingHours: TimeRange[] = [];
    const override = overrides?.find(o => o.override_date === dateStr);
    if (override) {
      if (override.is_available) {
        workingHours.push({ start: parse(`${dateStr} ${override.start_time}`, 'yyyy-MM-dd HH:mm:ss', new Date()), end: parse(`${dateStr} ${override.end_time}`, 'yyyy-MM-dd HH:mm:ss', new Date()) });
      }
    } else {
      const rule = rules?.find(r => Array.isArray(r.days_of_week) && r.days_of_week.includes(dayOfWeekForDb));
      if (rule && rule.start_time && rule.end_time) {
        workingHours.push({ start: parse(`${dateStr} ${rule.start_time}`, 'yyyy-MM-dd HH:mm:ss', new Date()), end: parse(`${dateStr} ${rule.end_time}`, 'yyyy-MM-dd HH:mm:ss', new Date()) });
      }
    }
    if (workingHours.length === 0) {
      availability[dateStr] = [];
      continue;
    }
    const allPossibleSlots: TimeRange[] = [];
    for (const wh of workingHours) {
      let currentTime = wh.start;
      while (isBefore(currentTime, wh.end)) {
        const slotEnd = addMinutes(currentTime, serviceDuration);
        if (isAfter(slotEnd, wh.end) && !isEqual(slotEnd, wh.end)) break;
        allPossibleSlots.push({ start: new Date(currentTime), end: slotEnd });
        currentTime = addMinutes(currentTime, serviceDuration);
      }
    }
    const availableSlots = allPossibleSlots.filter(slot => !bookedSlots.some(bookedSlot => (isBefore(slot.start, bookedSlot.end) && isAfter(slot.end, bookedSlot.start))));
    availability[dateStr] = availableSlots.map(slot => ({ start: slot.start.toISOString(), end: slot.end.toISOString() }));
  }
  return { availability, existingBookings: existingBookings || [] };
}

// 這是您的頁面主組件
export default async function WorkerDetailPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  // 1. 並行獲取技師、服務、店鋪信息以及可用性規則和覆蓋
  const [
    { data: worker, error: workerError },
    { data: services, error: servicesError },
    { data: shop, error: shopError },
    { data: availabilityRules },
    { data: availabilityOverrides }
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', params.id).single(),
    supabase.from('services')
            .select('*')
            .eq('owner_id', params.id)
            .eq('is_active', true), // <-- 【关键修复】: 仅获取活跃的服务
    supabase.from('shops').select('*, staff!inner(*)').eq('staff.user_id', params.id).single(),
    supabase.from('availability_rules').select('*').eq('worker_profile_id', params.id),
    supabase.from('availability_overrides').select('*').eq('worker_profile_id', params.id)
  ]);

  if (workerError || !worker) {
    notFound();
  }

  // 2. 【核心修復】: 根據 profiles 表中的 ID 獲取地址
  let fullAddress = '暫無地址信息';
  const locationIds = [worker.province_id, worker.district_id, worker.sub_district_id].filter(Boolean); // 過濾掉 null 或 0 的 ID

  if (locationIds.length > 0) {
    const { data: locations, error: locationsError } = await supabase
      .from('locations')
      .select('id, name_en')
      .in('id', locationIds);

    if (locations) {
      const province = locations.find(loc => loc.id === worker.province_id)?.name_en || '';
      const district = locations.find(loc => loc.id === worker.district_id)?.name_en || '';
      const subDistrict = locations.find(loc => loc.id === worker.sub_district_id)?.name_en || '';
      
      // 按照常見順序拼接地址，並過濾掉空的部分
      fullAddress = [subDistrict, district, province].filter(Boolean).join(', ');
    }
  }

  // 3. 獲取可用時間 (邏輯不變)
  const serviceDuration = services?.[0]?.duration_value ?? 60;
  const { availability: initialAvailability, existingBookings } = await generateAvailability(params.id, serviceDuration, 3);
  
  // 4. 將所有正確的數據傳遞給客戶端
  return (
    <WorkerDetailClient
      worker={worker}
      services={services || []}
      shop={shop}
      initialAvailability={initialAvailability}
      existingBookings={existingBookings}
      fullAddress={fullAddress}
      availabilityRules={availabilityRules || []}
      availabilityOverrides={availabilityOverrides || []}
    />
  );
}