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
  return <button type="submit" disabled={pending} className="btn w-[150px] mx-auto my-[10px]">{pending ? 'Saving...' : text}</button>;
}

// --- 表单组件 ---

// 3. 【修复】: 提供了完整的 CreateRuleForm 组件
function CreateRuleForm() {
    const [state, dispatch] = useFormState(createAvailabilityRule, { message: '', success: false });
    const weekDays = [{val: 1, label: 'Mon'}, {val: 2, label: 'Tue'}, {val: 3, label: 'Wed'}, {val: 4, label: 'Thu'}, {val: 5, label: 'Fri'}, {val: 6, label: 'Sat'}, {val: 7, label: 'Sun'}];
    return (
        <form action={dispatch} className="card bg-primary text-[var(--foreground)] w-full">
            <div className="p-[20px]">
            <h3 className="text-lg font-semibold">1. Create a Long-term Plan(แผนระยะยาว)</h3>
   
<div className="flex flex-wrap ">
    <div className="flex-1 min-w-[150px]">
        <label htmlFor="start_date" className="block text-sm font-medium">Start Date(วันที่เริ่มต้น)</label>
        <input type="date" id="start_date" name="start_date" required className="input m-[10px] w-[100px]" />
    </div>
    <div className="flex-1 min-w-[150px]">
        <label htmlFor="end_date" className="block text-sm font-medium">End Date(วันที่สิ้นสุด)</label>
        <input type="date" id="end_date" name="end_date" required className="input m-[10px] w-[100px]" />
    </div>
</div>
<div className="flex flex-wrap ">
    <div className="flex-1 min-w-[150px]">
        <label htmlFor="start_time" className="block text-sm font-medium">Start Time(เวลาเริ่มต้น)</label>
        <input type="time" id="start_time" name="start_time" required className="input m-[10px] w-[100px]" />
    </div>
    <div className="flex-1 min-w-[150px]">
        <label htmlFor="end_time" className="block text-sm font-medium">End Time(เวลาสิ้นสุด)</label>
        <input type="time" id="end_time" name="end_time" required className="input m-[10px] w-[100px]" />
    </div>
</div>  

            <div>
                <label className="block text-sm font-medium">Repeat Week(กำหนดวันทำงานรายสัปดาห์)</label>
                <div className=" flex gap-2 flex-wrap">
                    {weekDays.map(day => (
                        <label key={day.val} className="flex items-center gap-1 text-sm">
                            <input type="checkbox" name="days_of_week" value={day.val} className="checkbox bg-secondary m-[5px] text-[var(--foreground)]" /> {day.label}
                        </label>
                    ))}
                </div>
            </div>
            </div>
            <SubmitButton text="Save" />
            {state?.message && <p className={` text-sm ${state.success ? 'text-green-600' : 'text-red-600'}`}>{state.message}</p>}
        </form>
    );
}

// 4. 【修复】: 提供了完整的 CreateOverrideForm 组件
function CreateOverrideForm() {
    const [state, dispatch] = useFormState(createAvailabilityOverride, { message: '', success: false });
    const [type, setType] = useState<'unavailable' | 'available'>('unavailable');
    return (
        <form action={dispatch} className="card bg-primary w-full text-[var(--foreground)]">
            <div className="p-[20px]">
            <h3 className="text-lg font-semibold">2. Set Holidays/Overtime</h3>
            <p>(กำหนดวันพักผ่อน/วันล่วงเวลา)</p>
            <div>
                <label htmlFor="override_date" className="block text-sm font-medium">Select Date(เลือกวันที่)</label>
                <input type="date" id="override_date" name="override_date" required className="input mx-auto my-[10px] w-[150px]" />
            </div>
            <div>
                <label className="block text-sm font-medium">Type(พิมพ์)</label>
                <div className=" flex gap-4 my-[10px]">
                    <label className="flex items-center gap-1 m-[10px]"><input type="radio" name="type" value="unavailable" checked={type === 'unavailable'} onChange={() => setType('unavailable')} />Holiday(วันพักผ่อน)</label>
                    <label className="flex items-center gap-1 m-[10px]"><input type="radio" name="type" value="available" checked={type === 'available'} onChange={() => setType('available')} /> Overtime(วันล่วงเวลา)</label>
                </div>
            </div>
            {type === 'available' && (
                <div className="flex flex-wrap gap-4 p-4 bg-blue-50">
                    <div className="flex-1 min-w-[150px]">
                        <label htmlFor="override_start_time" className="block text-sm font-medium">Start time</label>
                        <input type="time" id="override_start_time" name="start_time" required className="input mt-[10px] w-[100px]" />
                    </div>
                    <div className="flex-1 min-w-[150px]">
                        <label htmlFor="override_end_time" className="block text-sm font-medium">End time</label>
                        <input type="time" id="override_end_time" name="end_time" required className="input mt-[10px] w-[100px]" />
                    </div>
                </div>
            )}
            </div>
            <SubmitButton text="Save" />
            {state?.message && <p className={` text-sm ${state.success ? 'text-green-600' : 'text-red-600'}`}>{state.message}</p>}
        </form>
    );
}

// --- 新增的删除按钮组件 ---
function DeleteButton() {
    const { pending } = useFormStatus();
    return <button type="submit" disabled={pending} className="btn btn-warning">{pending ? 'Delete...' : 'Delete'}</button>;
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
    const dayMap = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    return days.sort().map(d => `${dayMap[d-1]}`).join(', ');
  }

  return (

    <div className="mx-auto  max-w-[1200px]">
      <div className='flex flex-row flex-wrap justify-between gap-6 items-stretch '>
      <h2 className="text-xl font-bold text-white w-[full-20px] mx-[10px]">Working time plan</h2>
      </div>
<div className="flex flex-wrap gap-4 p-4 bg-blue-50 ">
    <div className="grid grid-cols-1 min-[768px]:grid-cols-2 gap-[20px] w-full text-[var(--foreground)] my-[10px]">
      
      <CreateRuleForm />
      <CreateOverrideForm />

        
    </div>

    <div className="card bg-[var(--color-third)] w-full">
        <div className="p-[20px]">

      {/* --- 显示已有规则 --- */}
      <div className="gap-[10px]">
        <h2 className="text-2xl font-semibold ">My Work Plan</h2>
        {rules.map(rule => (
            <div key={rule.id} className="border-b flex flex-col min-[768px]:flex-row min-[768px]:items-center justify-between w-full">
                
                    <div><strong>Date:</strong> {rule.start_date} ~ {rule.end_date}&nbsp; <br className="max-[800px]:inline hidden" />
                    <strong>Time:</strong> {rule.start_time} ~ {rule.end_time}&nbsp; <br className="max-[800px]:inline hidden" />
                    <strong>Week:</strong> {formatDays(rule.days_of_week)}</div>
                
                <DeleteRuleButton ruleId={rule.id} />
            </div>
        ))}
      </div>
      
      {/* --- 显示已有例外 --- */}
      <div className="gap-[10px]">
        <h2 className="text-2xl font-semibold ">My Holiday/Overtime</h2>
        {overrides.map(override => (
            <div key={override.id} className="border-b  flex flex-col min-[768px]:flex-row min-[768px]:items-center justify-between w-full">
                
                    <p><strong>Date:</strong> {override.override_date} &nbsp; <br className="max-[800px]:inline hidden" />
                    <strong>Type:</strong> {override.type === 'available' ? `OT (${override.start_time} - ${override.end_time})` : 'Holiday'}</p>
                
                <DeleteOverrideButton overrideId={override.id} />
            </div>
        ))}
      </div>
      </div>

    </div>
</div>














    </div>







  );
}



