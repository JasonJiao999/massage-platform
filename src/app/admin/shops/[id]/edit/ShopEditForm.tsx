// 文件路徑: app/admin/shops/[id]/edit/ShopEditForm.tsx

'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateShopDetails, deleteShop } from '@/lib/actions';

// 假設的 Shop 類型
type Shop = {
  id: string;
  name: string | null;
  address_detail: string | null; 
  phone_number: string | null;
  description: string | null;
  slug: string | null;
  tags: string | null;
};

export default function ShopEditForm({ shop }: { shop: Shop }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const res = await updateShopDetails(formData);
      setResult(res);
    });
  };

  const handleDelete = () => {
    if (confirm(`您確定要永久刪除店鋪 "${shop.name}" 嗎？此操作無法撤銷！`)) {
      startTransition(async () => {
        try {
          await deleteShop(shop.id);
          // 刪除成功後，Server Action 會自動跳轉
        } catch (error: any) {
          setResult({ success: false, message: error.message });
        }
      });
    }
  };

  return (
    <form action={handleSubmit} className="card bg-primary rounded-lg p-[24px] my-[20px] text-[var(--foreground)]">
      <input type="hidden" name="id" value={shop.id} />
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">店鋪名稱</label>
        <input
          type="text"
          id="name"
          name="name"
          defaultValue={shop.name || ''}
          className="input my-[20px] w-[90%]"
        />
      </div>
      
      <div>
        <label htmlFor="address_detail" className="block text-sm font-medium text-gray-700">地址</label>
        <input
          type="text"
          id="address_detail"
          name="address_detail"
          defaultValue={shop.address_detail || ''}
          className="input my-[20px] w-[90%]"
        />
      </div>
      
      <div>
        <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">電話</label>
        <input
          type="text"
          id="phone_number"
          name="phone_number"
          defaultValue={shop.phone_number || ''}
          className="input my-[20px] w-[90%]"
        />
      </div>
<div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700">Slug (網址代稱)</label>
        <input
          type="text"
          id="slug"
          name="slug"
          defaultValue={shop.slug || ''}
          className="input my-[20px] w-[90%]"
        />
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">標籤 (請用逗號分隔)</label>
        <input
          type="text"
          id="tags"
          name="tags"
          defaultValue={shop.tags || ''}
          className="input my-[20px] w-[90%]"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">描述</label>
        <textarea
          id="description"
          name="description"
          defaultValue={shop.description || ''}
          className="textarea textarea-bordered my-[20px] w-[90%] h-24"
        />
      </div>


      {/* ... 在這裡添加其他您需要編輯的字段 ... */}
      
      <div className="flex justify-between items-center pt-6">
        <button
          type="submit"
          disabled={isPending}
          className="btn"
        >
          {isPending ? '正在保存...' : '保存更改'}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="btn"
        >
          {isPending ? '處理中...' : '刪除店鋪'}
        </button>
      </div>

      {result && (
        <p className={`mt-4 text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
          {result.message}
        </p>
      )}
    </form>
  );
}