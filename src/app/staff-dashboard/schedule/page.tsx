// src/app/staff-dashboard/schedule/page.tsx (高级排班版)

import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ScheduleClient from './ScheduleClient'; // 导入我们更新后的客户端组件

export default async function SchedulePage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // 【核心修改】: 使用 Promise.all 并行获取所有三种排班数据
  const [
    { data: rules },
    { data: overrides },
    { data: schedules }
  ] = await Promise.all([
    supabase.from('availability_rules').select('*').eq('worker_profile_id', user.id),
    supabase.from('availability_overrides').select('*').eq('worker_profile_id', user.id),
    supabase.from('schedules').select('*').eq('worker_profile_id', user.id)
  ]);

  return (
    <ScheduleClient 
      rules={rules || []}
      overrides={overrides || []}
      schedules={schedules || []}
    />
  );
}