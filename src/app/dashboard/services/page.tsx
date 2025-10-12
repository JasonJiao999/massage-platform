// src/app/dashboard/services/page.tsx
'use client'; 

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState, useCallback } from 'react'; // 1. 导入 useCallback
import { createL2Category, deleteL2Category, updateL2Category } from '@/lib/actions';
import { useFormState, useFormStatus } from 'react-dom';

type Category = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  shop_id: string;
};

function SubmitButton({ text, pendingText }: { text: string; pendingText: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:bg-gray-400">
      {pending ? pendingText : text}
    </button>
  );
}

// 2. EditModal 现在接收一个新的 onUpdateSuccess 函数
function EditModal({ category, onClose, onUpdateSuccess }: { category: Category; onClose: () => void; onUpdateSuccess: () => void; }) {
  const [state, formAction] = useFormState(updateL2Category, { message: '' });

  useEffect(() => {
    if (state.message === '分类更新成功！') {
      onUpdateSuccess(); // 3. 更新成功后，调用父组件传来的刷新函数
      onClose();
    }
  }, [state, onClose, onUpdateSuccess]);

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold text-white">编辑分类</h2>
        <form action={formAction}>
          <input type="hidden" name="categoryId" value={category.id} />
          <div className="space-y-4 text-black">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white">分类名称</label>
              <input type="text" id="name" name="name" defaultValue={category.name} required className="mt-1 block w-full rounded-md"/>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-white">分类描述</label>
              <input type="text" id="description" name="description" defaultValue={category.description || ''} className="mt-1 block w-full rounded-md"/>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-4">
            <button type="button" onClick={onClose} className="text-gray-300">取消</button>
            <SubmitButton text="保存更改" pendingText="保存中..." />
          </div>
          {state.message && <p className={`mt-2 text-sm ${state.message.includes('失败') ? 'text-red-400' : 'text-green-400'}`}>{state.message}</p>}
        </form>
      </div>
    </div>
  );
}

export default function ServiceManagementPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [shopId, setShopId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const supabase = createClient();

  // 4. 将数据获取逻辑封装成一个可复用的函数
  const fetchCategories = useCallback(async (currentShopId: string) => {
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('service_categories_L2')
      .select('*')
      .eq('shop_id', currentShopId)
      .order('created_at', { ascending: false });

    if (categoriesError) {
      console.error("查询分类失败:", categoriesError);
      setError("加载服务分类失败。");
    } else {
      setCategories(categoriesData);
    }
  }, [supabase]);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/login'; return; }
      
      const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single();
      if (!shop) { setError("找不到您的店铺信息。"); setIsLoading(false); return; }
      
      setShopId(shop.id);
      await fetchCategories(shop.id);
      setIsLoading(false);
    };
    initialize();
  }, [supabase, fetchCategories]);


  if (isLoading) return <div className="p-8">正在加载...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  const createCategoryWithShopId = createL2Category.bind(null, shopId!);

  return (
    <div>
      {/* 5. 将刷新函数传递给 EditModal */}
      {editingCategory && (
        <EditModal 
          category={editingCategory} 
          onClose={() => setEditingCategory(null)}
          onUpdateSuccess={() => fetchCategories(shopId!)}
        />
      )}
      
      <h1 className="text-2xl font-bold text-white mb-6">服务分类管理</h1>
      
      <form action={createCategoryWithShopId} className="flex flex-col sm:flex-row items-stretch gap-4 p-4 bg-card border border-border rounded-lg mb-8">
        {/* ... 创建表单部分保持不变 ... */}
      </form>

      <div className="space-y-4">
        {categories.length > 0 ? (
          categories.map((category) => (
            <div key={category.id} className="bg-card border border-border rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="font-bold text-lg text-foreground">{category.name}</p>
                
              </div>
              <div>
                <p className="text-sm text-foreground/70 mt-1">{category.description || '暂无描述'}</p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setEditingCategory(category)} className="text-indigo-400 hover:text-indigo-600 text-sm font-medium">编辑</button>
                <form action={deleteL2Category.bind(null, category.id)}>
                   <button type="submit" className="text-red-400 hover:text-red-600 text-sm font-medium">删除</button>
                </form>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-card border border-border rounded-lg p-8 text-center text-foreground/60">
            <p>暂无服务分类，请在上方添加。</p>
          </div>
        )}
      </div>
    </div>
  );
}