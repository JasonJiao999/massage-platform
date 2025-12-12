// src/app/staff-dashboard/services/StaffServicesClient.tsx 

'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createMyService, deleteMyService, updateMyService } from '@/lib/actions'; 
import { useEffect, useRef, useState } from 'react';
import EditServiceModal from '@/components/EditServiceModal';
import { useRouter } from 'next/navigation';

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
        <form ref={formRef} action={dispatch} className="card bg-primary w-full text-[var(--foreground)] py-[20px]">
          
            <h3 className="text-lg font-semibold px-[24px]">Creating a New Service</h3>
            <div className="px-[24px]">
                <label htmlFor="name" className="block text-sm font-medium">Service Name(ชื่อบริการ เช่น นวด ดูหนัง หรือดื่มกาแฟ)</label>
                <input type="text" id="name" name="name" required className="input m-[10px] w-[95%]" />
            </div>
            <div className="px-[24px]">
                <label htmlFor="description" className="block text-sm font-medium">Service Description(การแนะนำเนื้อหาบริการ)</label>
                <textarea id="description" name="description" rows={3} className="textarea m-[10px] h-[150px] w-[95%]"></textarea>
            </div>
            <div className="flex flex-wrap p-[24px]">

                  <div className="flex-1 min-w-[200px]">
                    <label htmlFor="price" className="block text-sm font-medium">Price(ราคา THB)</label>
                    <input type="number" id="price" name="price" required step="0.01" className="input m-[10px] h-[42px] max-w-[80%]" />
                  </div>
                    <div className="flex-1 min-w-[200px]">
                        <label htmlFor="duration_value" className="block text-sm font-medium">Duration value(ชั่วโมงทำงาน)</label>
                        <input type="number" id="duration_value" name="duration_value" required className="input m-[10px] h-[42px] max-w-[80%]" />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label htmlFor="duration_unit" className="block text-sm font-medium">Time unit(หน่วยเวลา)</label>
                        <select id="duration_unit" name="duration_unit" required className="select m-[10px] h-[42px] max-w-[80%] text-[var(--color-secondary)]">
                            <option value="minutes">Minute</option>
                            <option value="hours">Hour</option>
                            
                        </select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                <label htmlFor="type" className="block text-sm font-medium">Category(ประเภทบริการ)</label>
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
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const router = useRouter(); 

  const translateUnit = (unit: string | null) => {
    if (unit === 'minutes') return 'Minutes';
    if (unit === 'hours') return 'Hours';
    if (unit === 'days') return 'Days';
    return '';
  };

  const handleRefreshAndClose = () => {
    setEditingServiceId(null);
    router.refresh(); 
  };
  
  // 4. 处理删除/隐藏操作
  const handleDeleteAction = async (serviceId: string, serviceName: string | null) => {
      // 修改提示语
      const confirmed = window.confirm(
          `Are you sure you want to archive/hide the service "${serviceName}"? \nThis will remove it from public view but keep booking history.`
      );
      if (confirmed) {
          const result = await deleteMyService(serviceId); // 调用修改后的软删除 action
          if (result && !result.success) {
            // 只有当 action 明确返回错误时才弹窗
            alert(`Error: ${result.message}`);
          } else {
            // 成功隐藏后，强制刷新
            alert(result.message);
            router.refresh();
          }
      }
  };

  return (
    <div className=" mx-auto">
      <div className="mx-auto max-w-[1200px]">
      <div className='flex flex-row flex-wrap justify-between gap-6 items-stretch'>
      <h2 className="text-xl font-bold text-white w-[full-20px] mx-[10px]">My Service Management</h2>
      </div>
      </div>
      
      <CreateServiceForm />

<div className="mx-auto  min-w-[500px] max-w-[1200px]">
      <div className='flex flex-row flex-wrap justify-between gap-6 items-stretch'>
      <h2 className="text-xl font-bold text-white w-[full-20px] mx-[10px]">My Service List</h2>
      </div>
      </div>
      <div className="space-y-4">
  
        {services && services.length > 0 ? (
          services.map(service => (
  
            
            
            <div key={service.id} className="card bg-[var(--color-third)] w-full  my-[10px]">

<div className="flex items-center justify-between text-sm p-[20px]">

  {/* 左侧内容：服务名称 */}
  <h3 className="font-bold text-lg ">
    Serviec Name: {service.name}
  </h3>

  {/* 右侧容器：包裹所有按钮，实现水平排列 */}
  <div className="flex items-center gap-2 flex-shrink-0">
    
    {/* 编辑按钮 */}
                    <button 
                      onClick={() => 
                          setEditingServiceId(prevId => (prevId === service.id ? null : service.id))
                      }
                      className="btn"
                    >
                      {editingServiceId === service.id ? 'Close Edit' : 'Edit'}
                    </button>

    {/* 删除按钮的表单 */}
    <form action={() => handleDeleteAction(service.id, service.name)}>
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
<div className="flex-1 min-w-[120px] p-2 rounded-lg flex items-center justify-center bg-[var(--color-third)]">
        <span>Time: {service.duration_value} {translateUnit(service.duration_unit)}</span>
      </div>
    )}

    {/* Type */}
    {service.type && (
  <div className="flex-1 min-w-[120px] p-2 rounded-lg flex items-center justify-center bg-[var(--color-third)]">
        <span>Type: {service.type}</span>
      </div>
    )}


    
  </div>
</div>

<div className="flex-grow m-[10px]">
<p className="text-sm mt-1">{service.description}</p>
</div>

                {/* 【核心修改 4】：内联编辑表单 - 根据 ID 匹配显示 */}
                {editingServiceId === service.id && (
                    <EditServiceModal 
                        service={service} 
                        onCancel={handleRefreshAndClose} // 取消按钮也刷新并关闭
                        onSaveSuccess={handleRefreshAndClose}
                    />
                )}


            </div>
          ))
        ) : (
          <p className="text-gray-500 py-4">You haven't created any services yet.</p>
        )}
      </div>


    </div>
  );
}


