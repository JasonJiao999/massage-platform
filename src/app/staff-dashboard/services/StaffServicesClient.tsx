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
    <button type="submit" disabled={pending} className="btn w-[200px] mx-auto">
      {pending ? 'Submitting...' : text}
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
        <form ref={formRef} action={dispatch} className="card bg-primary max-w-[1150px] mx-auto gap-4r p-[24px] text-[var(--foreground)]">
            <h3 className="text-lg font-semibold">Creating a New Service</h3>
            <div>
                <label htmlFor="name" className="block text-sm font-medium">Service Name</label>
                <input type="text" id="name" name="name" required className="input m-[10px] w-[95%]" />
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium">Service Description</label>
                <textarea id="description" name="description" rows={3} className="textarea m-[10px] h-[150px] w-[95%]"></textarea>
            </div>
            <div className="flex flex-wrap gap-4">

                  <div className="flex-1 min-w-[200px]">
                    <label htmlFor="price" className="block text-sm font-medium">Price(THB)</label>
                    <input type="number" id="price" name="price" required step="0.01" className="input m-[10px] h-[42px] max-w-[80%]" />
                  </div>
                    <div className="flex-1 min-w-[200px]">
                        <label htmlFor="duration_value" className="block text-sm font-medium">Duration value</label>
                        <input type="number" id="duration_value" name="duration_value" required className="input m-[10px] h-[42px] max-w-[80%]" />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label htmlFor="duration_unit" className="block text-sm font-medium">Time unit</label>
                        <select id="duration_unit" name="duration_unit" required className="select m-[10px] h-[42px] max-w-[80%] text-[var(--color-secondary)]">
                            <option value="minutes">Minute</option>
                            <option value="hours">Hour</option>
                            
                        </select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                <label htmlFor="type" className="block text-sm font-medium">Create My Category</label>
                <input type="text" id="type" name="type" className="input m-[10px] h-[42px] max-w-[80%]" />
                     </div>
                
            </div>

            <SubmitButton text="Creating a Service"/>
            {state?.message && <p className={`mt-2 text-sm ${state.success ? 'text-green-600' : 'text-red-600'}`}>{state.message}</p>}
        </form>
    );
}

// 主客户端组件
export default function StaffServicesClient({ services }: { services: Service[] }) {
  const [editingService, setEditingService] = useState<Service | null>(null);

  const translateUnit = (unit: string | null) => {
    if (unit === 'minutes') return 'Minutes';
    if (unit === 'hours') return 'Hours';
    if (unit === 'days') return 'Days';
    return '';
  };

  return (
    <div className=" mx-auto">
      <div className="mx-auto min-w-[500px] max-w-[1200px]">
      <div className='flex flex-row flex-wrap justify-between gap-6 items-stretch'>
      <h2 className="text-xl font-bold text-white">My Service Management</h2>
      </div>
      </div>
      
      <CreateServiceForm />

<div className="p-6 mx-auto space-y-8 min-w-[500px] max-w-[1200px]">
      <div className='flex flex-row flex-wrap justify-between gap-6 items-stretch'>
      <h2 className="text-xl font-bold text-white">My Service List</h2>
      </div>
      </div>
      <div className="space-y-4">
  
        {services && services.length > 0 ? (
          services.map(service => (
  
            
            
            <div key={service.id} className="card bg-[var(--color-third)] max-w-[1150px] mx-auto gap-4r p-[24px] my-[10px]">

<div className="flex items-center justify-between gap-4 mt-2 text-sm ">

  {/* 左侧内容：服务名称 */}
  <h3 className="font-bold text-lg ">
    Serviec Name: {service.name}
  </h3>

  {/* 右侧容器：包裹所有按钮，实现水平排列 */}
  <div className="flex items-center gap-2 flex-shrink-0">
    
    {/* 编辑按钮 */}
    <button 
      onClick={() => setEditingService(service)}
      className="btn"
    >
      Edit
    </button>

    {/* 删除按钮的表单 */}
    <form action={async () => {
        const confirmed = window.confirm(`Are you sure you want to permanently delete the service "${service.name}"? This action cannot be undone.`);
        if (confirmed) {
            // 建议在这里处理返回的状态，例如显示一个通知
            const result = await deleteMyService(service.id);
            if (result && !result.success) {
              alert(`Error: ${result.message}`);
            }
        }
    }}>
      <button type="submit" className="btn btn-warning">Delete</button>
    </form>

  </div>

</div>


<div className="flex-grow ">


  {/* 主容器：使用 flex 和 flex-wrap 来实现水平排列和自动换行 */}
  <div className="flex flex-wrap items-stretch gap-4 mt-2 text-sm ">

    {/* Price - 每个项目都设置为 flex-1 和 min-w-[120px] */}
    <div className="flex-1 min-w-[120px] p-2 rounded-lg flex items-center justify-center bg-[var(--color-third)]">
      <span>Price: {service.price} THB</span>
    </div>

    {/* Time */}
    {service.duration_value && service.duration_unit && (
      <div className="flex-1 min-w-[120px] p-2  rounded-lg flex items-center justify-center bg-[var(--color-third)]">
        <span>Time: {service.duration_value} {translateUnit(service.duration_unit)}</span>
      </div>
    )}

    {/* Type */}
    {service.type && (
      <div className="flex-1 min-w-[120px] p-2  rounded-lg flex items-center justify-center bg-[var(--color-third)]">
        <span>Type: {service.type}</span>
      </div>
    )}


    
  </div>
</div>

<div className="flex-grow m-[10px]">
<p className="text-sm  mt-1">{service.description}</p>
</div>




            </div>
          ))
        ) : (
          <p className="text-gray-500 py-4">You haven't created any services yet.</p>
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


