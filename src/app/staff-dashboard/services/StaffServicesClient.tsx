// src/app/staff-dashboard/services/StaffServicesClient.tsx (已修复 ReferenceError 的最终完整版)

'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createMyService, deleteMyService, updateMyService } from '@/lib/actions'; 
import { useEffect, useRef, useState } from 'react';
import EditServiceModal from '@/components/EditServiceModal';

// 1. 【核心修改】: 添加 'export' 关键字，让这个类型可以被外部文件导入
export interface Service {
  id: string;
  name: string | null;
  description: string | null;
  price: number | null;
  duration_value: number | null;
  duration_unit: string | null;
  type: string | null;
}

// 2. 【修复】: 重新添加 SubmitButton 组件定义
function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400">
      {pending ? '提交中...' : text}
    </button>
  );
}

// 3. 【修复】: 重新添加 CreateServiceForm 组件定义
function CreateServiceForm() {
    const [state, dispatch] = useFormState(createMyService, { message: '', success: false });
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state.success) {
            formRef.current?.reset();
        }
    }, [state]);

    return (
        <form ref={formRef} action={dispatch} className="p-6 border rounded-lg space-y-4 bg-white">
            <h3 className="text-lg font-semibold">创建新服务</h3>
            <div>
                <label htmlFor="name" className="block text-sm font-medium">服务名称</label>
                <input type="text" id="name" name="name" required className="mt-1 block w-full input" />
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium">服务描述</label>
                <textarea id="description" name="description" rows={3} className="mt-1 block w-full input"></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="price" className="block text-sm font-medium">价格</label>
                    <input type="number" id="price" name="price" required step="0.01" className="mt-1 block w-full input" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label htmlFor="duration_value" className="block text-sm font-medium">时长数值</label>
                        <input type="number" id="duration_value" name="duration_value" required className="mt-1 block w-full input" />
                    </div>
                    <div>
                        <label htmlFor="duration_unit" className="block text-sm font-medium">单位</label>
                        <select id="duration_unit" name="duration_unit" required className="mt-1 block w-full input">
                            <option value="minutes">分钟</option>
                            <option value="hours">小时</option>
                            <option value="days">天</option>
                        </select>
                    </div>
                </div>
            </div>
            <div>
                <label htmlFor="type" className="block text-sm font-medium">我的分类</label>
                <input type="text" id="type" name="type" className="mt-1 block w-full input" />
            </div>
            <SubmitButton text="创建服务" />
            {state?.message && <p className={`mt-2 text-sm ${state.success ? 'text-green-600' : 'text-red-600'}`}>{state.message}</p>}
        </form>
    );
}

// 主客户端组件
export default function StaffServicesClient({ services }: { services: Service[] }) {
  const [editingService, setEditingService] = useState<Service | null>(null);

  const translateUnit = (unit: string | null) => {
    if (unit === 'minutes') return '分钟';
    if (unit === 'hours') return '小时';
    if (unit === 'days') return '天';
    return '';
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">我的服务管理</h1>

      <CreateServiceForm />

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">我的服务列表</h2>
        {services && services.length > 0 ? (
          services.map(service => (
            <div key={service.id} className="p-4 border rounded-lg bg-white flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:shadow-md transition-shadow">
              <div className="flex-grow">
                <h3 className="font-bold text-lg">{service.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
                  <span className="font-semibold">价格: ¥{service.price}</span>
                  {service.duration_value && service.duration_unit && (
                    <span className="text-gray-700">时长: {service.duration_value} {translateUnit(service.duration_unit)}</span>
                  )}
                  {service.type && <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">{service.type}</span>}
                </div>
              </div>
              <div className="flex-shrink-0 flex items-center gap-4">
                <button 
                  onClick={() => setEditingService(service)}
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  编辑
                </button>
                <form action={async () => {
                    const confirmed = window.confirm(`您确定要永久删除服务 "${service.name}" 吗？此操作无法撤销。`);
                    if (confirmed) {
                        await deleteMyService(service.id);
                    }
                }}>
                    <button type="submit" className="text-sm text-red-600 hover:underline font-medium">删除</button>
                </form>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 py-4">您还没有创建任何服务。</p>
        )}
      </div>

      {editingService && (
        <EditServiceModal 
          service={editingService} 
          onClose={() => setEditingService(null)}
        />
      )}
    </div>
  );
}