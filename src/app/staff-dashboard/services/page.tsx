// src/app/staff-dashboard/services/page.tsx
'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { createService } from '@/lib/actions';

// 定义需要的数据类型
type Service = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  service_categories_L2: { name: string } | null;
};
type Category = {
  id: string;
  name: string;
};

// 提交按钮
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="inline-flex justify-center rounded-md border bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-gray-400">
      {pending ? 'Saving...' : 'Create Service'}
    </button>
  );
}

// 新增服务的表单组件
function CreateServiceForm({ categories, onFormSubmit }: { categories: Category[]; onFormSubmit: () => void }) {
  const [state, formAction] = useFormState(createService, { message: '' });

  useEffect(() => {
    if (state.message.includes('successfully')) {
      onFormSubmit(); // 成功后重置表单或执行其他操作
    }
  }, [state, onFormSubmit]);

  return (
    <form action={formAction} className="space-y-4 p-4 bg-card border border-border rounded-lg">
      <h2 className="text-lg font-semibold text-white">Add New Service</h2>
      <div className="text-black">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white">Service Name</label>
            <input type="text" id="name" name="name" required className="mt-1 block w-full rounded-md"/>
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-white">Price</label>
            <input type="number" id="price" name="price" step="0.01" required className="mt-1 block w-full rounded-md"/>
          </div>
        </div>
        <div>
          <label htmlFor="category_L2_id" className="block text-sm font-medium text-white">Category</label>
          <select id="category_L2_id" name="category_L2_id" required className="mt-1 block w-full rounded-md">
            <option value="">Select a category</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-white">Description</label>
          <textarea id="description" name="description" rows={3} className="mt-1 block w-full rounded-md"></textarea>
        </div>
      </div>
      <SubmitButton />
      {state?.message && <p className="mt-2 text-sm text-green-400">{state.message}</p>}
    </form>
  );
}

// 主页面组件
export default function MyServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = '/login'; return; }

    const { data: staffProfile } = await supabase.from('staff').select('id, shop_id').eq('user_id', user.id).single();
    if (!staffProfile) {
      setError("Your staff profile could not be found.");
      setIsLoading(false);
      return;
    }

    // 获取该员工店铺下的所有二级分类，用于表单下拉选择
    const { data: categoriesData, error: categoriesError } = await supabase.from('service_categories_L2').select('id, name').eq('shop_id', staffProfile.shop_id);
    if (categoriesError) { setError("Failed to load categories."); } else { setCategories(categoriesData); }

    // 获取该员工已创建的所有服务
    const { data: servicesData, error: servicesError } = await supabase.from('services').select(`id, name, description, price, service_categories_L2(name)`).eq('creator_staff_id', staffProfile.id);
    if (servicesError) { setError("Failed to load services."); } else { setServices(servicesData as any); }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) return <p className="p-8 text-white">Loading...</p>;
  if (error) return <p className="p-8 text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">My Service Management</h1>

      <div className="mb-8">
        <CreateServiceForm categories={categories} onFormSubmit={fetchData} />
      </div>

      <div className="space-y-4">
        {services.map((service) => (
          <div key={service.id} className="bg-card border border-border rounded-lg p-4 flex justify-between items-center">
            <div>
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                {service.service_categories_L2?.name || 'Uncategorized'}
              </span>
              <p className="font-bold text-lg text-foreground mt-2">{service.name}</p>
              <p className="text-sm text-foreground/70 mt-1">{service.description || 'No description'}</p>
              <p className="text-lg font-semibold text-primary mt-2">${service.price}</p>
            </div>
            <div className="flex gap-4">
              <button className="text-indigo-400 hover:text-indigo-600 text-sm font-medium">Edit</button>
              <button className="text-red-400 hover:text-red-600 text-sm font-medium">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}