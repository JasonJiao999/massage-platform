// src/app/staff-dashboard/schedule/ScheduleClient.tsx (最终的、功能完备的完整版)

'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { 
  createAvailabilityRule, 
  createAvailabilityOverride,
  createSchedule,
  deleteAvailabilityRule,
  deleteAvailabilityOverride
} from '@/lib/actions';
import { useEffect, useRef, useState } from 'react';

// 1. 【修复】: 提供了完整的类型定义
interface AvailabilityRule { 
  id: string; 
  start_date: string; 
  end_date: string; 
  start_time: string; 
  end_time: string; 
  days_of_week: number[]; 
}
interface AvailabilityOverride { 
  id: string; 
  override_date: string; 
  type: 'available' | 'unavailable'; 
  start_time: string | null; 
  end_time: string | null; 
}
interface Schedule { 
  id: string; 
  start_time: string; 
  end_time: string; 
}

// 2. 【修复】: 提供了完整的 SubmitButton 组件
function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400">{pending ? '保存中...' : text}</button>;
}

// --- 表单组件 ---

// 3. 【修复】: 提供了完整的 CreateRuleForm 组件
function CreateRuleForm() {
    const [state, dispatch] = useFormState(createAvailabilityRule, { message: '', success: false });
    const weekDays = [{val: 1, label: '一'}, {val: 2, label: '二'}, {val: 3, label: '三'}, {val: 4, label: '四'}, {val: 5, label: '五'}, {val: 6, label: '六'}, {val: 7, label: '日'}];
    return (
        <form action={dispatch} className="p-6 border rounded-lg space-y-4 bg-white">
            <h3 className="text-lg font-semibold">1. 添加长期工作规则</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="start_date" className="block text-sm font-medium">开始日期</label>
                    <input type="date" id="start_date" name="start_date" required className="mt-1 block w-full input" />
                </div>
                <div>
                    <label htmlFor="end_date" className="block text-sm font-medium">结束日期</label>
                    <input type="date" id="end_date" name="end_date" required className="mt-1 block w-full input" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="start_time" className="block text-sm font-medium">每日开始时间</label>
                    <input type="time" id="start_time" name="start_time" required className="mt-1 block w-full input" />
                </div>
                <div>
                    <label htmlFor="end_time" className="block text-sm font-medium">每日结束时间</label>
                    <input type="time" id="end_time" name="end_time" required className="mt-1 block w-full input" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium">重复星期</label>
                <div className="mt-2 flex gap-2 flex-wrap">
                    {weekDays.map(day => (
                        <label key={day.val} className="flex items-center gap-1 text-sm">
                            <input type="checkbox" name="days_of_week" value={day.val} className="rounded" /> {day.label}
                        </label>
                    ))}
                </div>
            </div>
            <SubmitButton text="保存规则" />
            {state?.message && <p className={`mt-2 text-sm ${state.success ? 'text-green-600' : 'text-red-600'}`}>{state.message}</p>}
        </form>
    );
}

// 4. 【修复】: 提供了完整的 CreateOverrideForm 组件
function CreateOverrideForm() {
    const [state, dispatch] = useFormState(createAvailabilityOverride, { message: '', success: false });
    const [type, setType] = useState<'unavailable' | 'available'>('unavailable');
    return (
        <form action={dispatch} className="p-6 border rounded-lg space-y-4 bg-white">
            <h3 className="text-lg font-semibold">2. 设置例外日期 (节假日/加班)</h3>
            <div>
                <label htmlFor="override_date" className="block text-sm font-medium">选择日期</label>
                <input type="date" id="override_date" name="override_date" required className="mt-1 block w-full input" />
            </div>
            <div>
                <label className="block text-sm font-medium">例外类型</label>
                <div className="mt-2 flex gap-4">
                    <label className="flex items-center gap-1"><input type="radio" name="type" value="unavailable" checked={type === 'unavailable'} onChange={() => setType('unavailable')} /> 休息</label>
                    <label className="flex items-center gap-1"><input type="radio" name="type" value="available" checked={type === 'available'} onChange={() => setType('available')} /> 加班</label>
                </div>
            </div>
            {type === 'available' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border-l-4 border-blue-500 bg-blue-50">
                    <div>
                        <label htmlFor="override_start_time" className="block text-sm font-medium">加班开始时间</label>
                        <input type="time" id="override_start_time" name="start_time" required className="mt-1 block w-full input" />
                    </div>
                    <div>
                        <label htmlFor="override_end_time" className="block text-sm font-medium">加班结束时间</label>
                        <input type="time" id="override_end_time" name="end_time" required className="mt-1 block w-full input" />
                    </div>
                </div>
            )}
            <SubmitButton text="设置例外" />
            {state?.message && <p className={`mt-2 text-sm ${state.success ? 'text-green-600' : 'text-red-600'}`}>{state.message}</p>}
        </form>
    );
}

// --- 新增的删除按钮组件 ---
function DeleteButton() {
    const { pending } = useFormStatus();
    return <button type="submit" disabled={pending} className="text-sm text-red-600 hover:underline disabled:text-gray-400">{pending ? '删除中...' : '删除'}</button>;
}

function DeleteRuleButton({ ruleId }: { ruleId: string }) {
    const [state, dispatch] = useFormState(deleteAvailabilityRule, { message: '', success: false });
    return (
        <div>
            <form action={dispatch.bind(null, ruleId)}>
                <DeleteButton />
            </form>
            {state?.message && !state.success && <p className="text-xs text-red-500 mt-1">{state.message}</p>}
        </div>
    );
}

function DeleteOverrideButton({ overrideId }: { overrideId: string }) {
    const [state, dispatch] = useFormState(deleteAvailabilityOverride, { message: '', success: false });
    return (
        <div>
            <form action={dispatch.bind(null, overrideId)}>
                <DeleteButton />
            </form>
            {state?.message && !state.success && <p className="text-xs text-red-500 mt-1">{state.message}</p>}
        </div>
    );
}

// --- 主客户端组件 ---
export default function ScheduleClient({ rules, overrides, schedules }: { rules: AvailabilityRule[], overrides: AvailabilityOverride[], schedules: Schedule[] }) {
  
  // 5. 【修复】: 提供了完整的 formatDays 辅助函数
  const formatDays = (days: number[]) => {
    const dayMap = ['一','二','三','四','五','六','日'];
    return days.sort().map(d => `周${dayMap[d-1]}`).join(', ');
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-12">
      <h1 className="text-3xl font-bold">高级排班管理</h1>
      
      <CreateRuleForm />
      <CreateOverrideForm />

      {/* --- 显示已有规则 --- */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">我的工作规则列表</h2>
        {rules.map(rule => (
            <div key={rule.id} className="p-4 border rounded-lg bg-white flex justify-between items-start">
                <div>
                    <p><strong>日期范围:</strong> {rule.start_date} 至 {rule.end_date}</p>
                    <p><strong>每日时段:</strong> {rule.start_time} - {rule.end_time}</p>
                    <p><strong>重复:</strong> {formatDays(rule.days_of_week)}</p>
                </div>
                <DeleteRuleButton ruleId={rule.id} />
            </div>
        ))}
      </div>
      
      {/* --- 显示已有例外 --- */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">我的例外日期列表</h2>
        {overrides.map(override => (
            <div key={override.id} className="p-4 border rounded-lg bg-white flex justify-between items-start">
                <div>
                    <p><strong>日期:</strong> {override.override_date}</p>
                    <p><strong>类型:</strong> {override.type === 'available' ? `加班 (${override.start_time} - ${override.end_time})` : '休息'}</p>
                </div>
                <DeleteOverrideButton overrideId={override.id} />
            </div>
        ))}
      </div>
    </div>
  );
}