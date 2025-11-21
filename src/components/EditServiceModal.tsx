// src/components/EditServiceModal.tsx

'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { updateMyService } from '@/lib/actions';
import { useEffect } from 'react';

// 定义 Service 类型，与 StaffServicesClient.tsx 中的保持一致
interface Service {
  id: string;
  name: string | null;
  description: string | null;
  price: number | null;
  duration_value: number | null;
  duration_unit: string | null;
  type: string | null;
}

// 提交按钮
function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn">
      {pending ? 'Save...' : text}
    </button>
  );
}

// 主编辑表单组件 (取代 Modal)
// 它现在接收 onCancel 和 onSaveSuccess 回调
export default function EditServiceModal({ service, onCancel, onSaveSuccess }: { service: Service, onCancel: () => void, onSaveSuccess: () => void }) {
  const [state, dispatch] = useFormState(updateMyService, { message: '', success: false });

  // 当表单成功提交后，通知父组件刷新并关闭表单
  useEffect(() => {
    if (state.success) {
      alert(state.message); 
      onSaveSuccess(); // 通知父组件刷新数据并关闭表单
    }
  }, [state, onSaveSuccess]);

  return (
    // 【核心修改】: 移除所有 Modal/Overlay/Positioning CSS，它现在只是一个容器
    <div className="card bg-primary p-[20px] w-[90%]  text-[var(--foreground)] mx-auto ">
        
        <h3 className="text-xl font-bold mb-4">บริการแก้ไข {service.name}</h3>

        <form action={dispatch} className="flex flex-col gap-[10px]">
          <input type="hidden" name="service_id" value={service.id} />

          <div>
            <label htmlFor="name" className="block text-sm font-medium">ชื่อบริการ</label>
            {/* 确保输入框中的文字在浅色背景下可见 */}
            <input type="text" id="name" name="name" required defaultValue={service.name || ''} className="w-[80%] input" />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium">การแนะนำบริการ</label>
            <textarea id="description" name="description" rows={3} defaultValue={service.description || ''} className="w-[80%] textarea"></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium">ราคา</label>
              <input type="number" id="price" name="price" required step="0.01" defaultValue={service.price || 0} className="w-[80%] input" />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-[10px]">
              <div>
                <label htmlFor="duration_value" className="block text-sm font-medium">ค่าตัวเลข</label>
                <input type="number" id="duration_value" name="duration_value" required defaultValue={service.duration_value || 0} className="w-[40%] input" />
              </div>
              <div >
                <label htmlFor="duration_unit" className="block text-sm font-medium">หน่วยเวลา</label>
                <select id="duration_unit" name="duration_unit" required defaultValue={service.duration_unit || 'minutes'} className="w-[40%] select">
                  <option value="minutes">นาที</option>
                  <option value="hours">ชั่วโมง</option>
                 
                </select>
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium">หมวดหมู่บริการ</label>
            <input type="text" id="type" name="type" defaultValue={service.type || ''} className="w-[80%] input" />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            {/* 使用 onCancel prop 来关闭内联表单 */}
            <button type="button" onClick={onCancel} className="btn">Cancel</button>
            <SubmitButton text="Save" />
          </div>
          {state?.message && <p className={`mt-2 text-sm ${state.success ? 'text-green-600' : 'text-red-600'}`}>{state.message}</p>}
        </form>
      </div>
  );
}