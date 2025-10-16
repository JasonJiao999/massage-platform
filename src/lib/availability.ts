// src/lib/availability.ts

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { add, format, parseISO, startOfDay, endOfDay, isWithinInterval } from 'date-fns';

// 定义时间段的接口
interface TimeSlot {
  start: Date;
  end: Date;
}

/**
 * 核心算法：获取某个工作者在特定一天的最终可用时间段
 * @param workerId - 工作者的 Profile ID
 * @param targetDate - 目标日期 (Date 对象)
 * @returns 一个包含可用时间段 { start: Date, end: Date } 的数组
 */
export async function getAvailability(workerId: string, targetDate: Date): Promise<TimeSlot[]> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const dayOfWeek = targetDate.getDay(); // 0=周日, 1=周一, ..., 6=周六
  const isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek; // 转换为 1=周一, ..., 7=周日
  const dateStr = format(targetDate, 'yyyy-MM-dd');
  const startOfTargetDay = startOfDay(targetDate);
  const endOfTargetDay = endOfDay(targetDate);

  // --- 算法开始：分层计算 ---

  let potentialSlots: TimeSlot[] = [];

  // 1. 基础层: 从 `availability_rules` 获取基础工作时间
  const { data: rules } = await supabase
    .from('availability_rules')
    .select('start_time, end_time')
    .eq('worker_profile_id', workerId)
    .lte('start_date', dateStr)
    .gte('end_date', dateStr)
    .contains('days_of_week', [isoDayOfWeek]);

  if (rules) {
    rules.forEach(rule => {
      potentialSlots.push({
        start: parseISO(`${dateStr}T${rule.start_time}`),
        end: parseISO(`${dateStr}T${rule.end_time}`),
      });
    });
  }
  
  // 2. 补充层: 添加 `schedules` 表中的一次性排班
  const { data: oneOffSchedules } = await supabase
    .from('schedules')
    .select('start_time, end_time')
    .eq('worker_profile_id', workerId)
    .gte('start_time', startOfTargetDay.toISOString())
    .lte('end_time', endOfTargetDay.toISOString());

  if (oneOffSchedules) {
    oneOffSchedules.forEach(schedule => {
      potentialSlots.push({
        start: parseISO(schedule.start_time),
        end: parseISO(schedule.end_time),
      });
    });
  }

  // 3. 例外层: 应用 `availability_overrides`
  const { data: overrides } = await supabase
    .from('availability_overrides')
    .select('type, start_time, end_time')
    .eq('worker_profile_id', workerId)
    .eq('override_date', dateStr);

  if (overrides && overrides.length > 0) {
    const override = overrides[0];
    if (override.type === 'unavailable') {
      // 如果当天休息，直接清空所有可用时间
      potentialSlots = [];
    } else if (override.type === 'available') {
      // 如果是加班，则用加班时间覆盖当天的所有排班
      potentialSlots = [{
        start: parseISO(`${dateStr}T${override.start_time}`),
        end: parseISO(`${dateStr}T${override.end_time}`),
      }];
    }
  }

  // 如果到此为止没有任何可用时间，直接返回空数组
  if (potentialSlots.length === 0) {
    return [];
  }

  // 4. 占用层: 减去 `bookings` 表中已预订的时间
  const { data: bookings } = await supabase
    .from('bookings')
    .select('start_time, end_time')
    .eq('worker_profile_id', workerId)
    .in('status', ['confirmed', 'in_progress'])
    .gte('start_time', startOfTargetDay.toISOString())
    .lte('end_time', endOfTargetDay.toISOString());

  if (bookings) {
    bookings.forEach(booking => {
      const bookingStart = parseISO(booking.start_time);
      const bookingEnd = parseISO(booking.end_time);
      
      let newSlots: TimeSlot[] = [];
      potentialSlots.forEach(slot => {
        // 检查 booking 是否与当前 slot 重叠
        if (bookingEnd > slot.start && bookingStart < slot.end) {
          // 情况1: booking 在 slot 之前，切掉 slot 的前半部分
          if (bookingStart > slot.start) {
            newSlots.push({ start: slot.start, end: bookingStart });
          }
          // 情况2: booking 在 slot 之后，切掉 slot 的后半部分
          if (bookingEnd < slot.end) {
            newSlots.push({ start: bookingEnd, end: slot.end });
          }
        } else {
          // 没有重叠，保留原 slot
          newSlots.push(slot);
        }
      });
      potentialSlots = newSlots;
    });
  }

  return potentialSlots;
}