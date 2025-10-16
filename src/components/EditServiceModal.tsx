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
    <button type="submit" disabled={pending} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400">
      {pending ? '保存中...' : text}
    </button>
  );
}

// 主模态框组件
export default function EditServiceModal({ service, onClose }: { service: Service, onClose: () => void }) {
  const [state, dispatch] = useFormState(updateMyService, { message: '', success: false });

  // 当表单成功提交后，显示成功消息并自动关闭模态框
  useEffect(() => {
    if (state.success) {
      alert(state.message); // 或者使用更美观的 Toast 通知
      onClose();
    }
  }, [state, onClose]);

  return (
    // 背景遮罩层
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      {/* 模态框容器 */}
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">编辑服务</h2>
          <button onClick={onClose} className="text-2xl font-bold hover:text-red-500">&times;</button>
        </div>

        <form action={dispatch} className="space-y-4">
          {/* 1. 【核心】将 service ID 作为隐藏字段传递给 Server Action */}
          <input type="hidden" name="service_id" value={service.id} />

          <div>
            <label htmlFor="name" className="block text-sm font-medium">服务名称</label>
            <input type="text" id="name" name="name" required defaultValue={service.name || ''} className="mt-1 block w-full input" />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium">服务描述</label>
            <textarea id="description" name="description" rows={3} defaultValue={service.description || ''} className="mt-1 block w-full input"></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium">价格</label>
              <input type="number" id="price" name="price" required step="0.01" defaultValue={service.price || 0} className="mt-1 block w-full input" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="duration_value" className="block text-sm font-medium">时长数值</label>
                <input type="number" id="duration_value" name="duration_value" required defaultValue={service.duration_value || 0} className="mt-1 block w-full input" />
              </div>
              <div>
                <label htmlFor="duration_unit" className="block text-sm font-medium">单位</label>
                <select id="duration_unit" name="duration_unit" required defaultValue={service.duration_unit || 'minutes'} className="mt-1 block w-full input">
                  <option value="minutes">分钟</option>
                  <option value="hours">小时</option>
                  <option value="days">天</option>
                </select>
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium">我的分类</label>
            <input type="text" id="type" name="type" defaultValue={service.type || ''} className="mt-1 block w-full input" />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">取消</button>
            <SubmitButton text="保存更改" />
          </div>
          {state?.message && !state.success && <p className="mt-2 text-sm text-red-600">{state.message}</p>}
        </form>
      </div>
    </div>
  );
}