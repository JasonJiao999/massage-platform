// 文件路徑: app/admin/shops/ShopsListClient.tsx

'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toggleShopStatus } from '@/lib/actions';

// 假設的 Shop 類型，請根據您的數據庫進行調整
type ShopWithOwner = {
  id: string;
  name: string | null;
  is_active: boolean;
  owner_id: string;
  owner: {
    id: string;
    email: string | null;
    nickname: string | null;
  } | null;
  // ... 其他字段
};

export default function ShopsListClient({ initialShops }: { initialShops: ShopWithOwner[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [filter, setFilter] = useState(searchParams.get('filter') || 'name');
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/admin/shops?query=${query.trim()}&filter=${filter}`);
    }
  };

  const handleToggleStatus = async (shop: ShopWithOwner) => {
    startTransition(async () => {
      const result = await toggleShopStatus(shop.id, shop.is_active);
      if (!result.success) {
        alert(result.message);
      }
      // revalidatePath 會自動刷新數據
    });
  };

  return (
    <div className="max-w-[1150px] mx-auto gap-4r p-[24px] my-[10px]">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">商戶信息管理</h1>
      
      {/* 搜索欄 */}
      <form onSubmit={handleSearch} className="card bg-primary rounded-lg p-[24px] my-[20px]">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input my-[20px] w-[90%]"
            placeholder="輸入搜索關鍵字..."
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="select my-[20px] w-full text-[var(--foreground)]"
          >
            <option value="name">店鋪名稱</option>
            <option value="id">店鋪 ID</option>
            <option value="owner_id">擁有者 ID</option>
            <option value="email">擁有者郵箱</option>
          </select>
          <button type="submit" className="btn btn-wide">
            搜索
          </button>
        </div>
      </form>

      {/* 搜索結果 */}
      <div className="card bg-primary rounded-lg p-[24px] text-[var(--foreground)]">
        {searchParams.get('query') ? (
          initialShops.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {initialShops.map((shop) => (
                <li key={shop.id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div>
                    <p className="font-bold text-lg">{shop.name}</p>
                    <p className="text-sm text-gray-500">ID: {shop.id}</p>
                    <p className="text-sm text-gray-500">擁有者: {shop.owner?.nickname || shop.owner?.email || 'N/A'}</p>
                  </div>
                  <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${shop.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {shop.is_active ? '已激活' : '未激活'}
                    </span>
                    <button onClick={() => handleToggleStatus(shop)} disabled={isPending} className="btn h-[46px] mx-[10px]">
                      {isPending ? '處理中...' : (shop.is_active ? '設為未激活' : '設為激活')}
                    </button>
                    <Link href={`/admin/shops/${shop.id}/edit`} className="btn">
                      編輯
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500">未找到符合條件的店鋪。</p>
          )
        ) : (
          <p className="text-center text-gray-500">請輸入關鍵字並選擇篩選條件開始搜索。</p>
        )}
      </div>
    </div>
  );
}