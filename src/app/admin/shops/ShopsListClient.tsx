// src/app/admin/shops/ShopsListClient.tsx
'use client';

import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTransition } from 'react';
import { toggleShopStatus, deleteShopByAdmin } from '@/lib/actions';

// 搜索栏组件
function SearchBar({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = formData.get('query') as string;
    const params = new URLSearchParams();
    if (query) {
      params.set('query', query);
    } else {
      params.delete('query');
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2 mb-6">
      <input
        type="text"
        name="query"
        defaultValue={initialQuery}
        placeholder="Search by shop name..."
        className="flex-grow rounded-md border-gray-300 shadow-sm text-black px-3 h-10"
      />
      <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md h-10">Search</button>
    </form>
  );
}

// 状态切换按钮组件
function ToggleStatusButton({ shopId, isActive }: { shopId: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = () => {
    startTransition(async () => {
      await toggleShopStatus(shopId, isActive);
      router.refresh();
    });
  };

  return (
    <button onClick={handleClick} disabled={isPending} className={`text-xs font-semibold px-2.5 py-1 rounded-full disabled:opacity-50 ${isActive ? 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300' : 'bg-green-200 text-green-800 hover:bg-green-300'}`}>
      {isPending ? '...' : (isActive ? 'Deactivate' : 'Activate')}
    </button>
  );
}

// 删除按钮组件
function DeleteShopButton({ shopId }: { shopId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (confirm('警告：您确定要永久删除这家店铺及其所有相关数据吗？此操作不可逆！')) {
      startTransition(async () => {
        await deleteShopByAdmin(shopId);
        router.refresh();
      });
    }
  };

  return <button onClick={handleDelete} disabled={isPending} className="text-red-400 hover:text-red-600 disabled:opacity-50">{isPending ? '...' : 'Delete'}</button>;
}

// 列表显示的主组件
export default function ShopsListClient({ shops, initialQuery }: { shops: any[], initialQuery: string }) {
  return (
    <div>
      <SearchBar initialQuery={initialQuery} />
      <div className="space-y-4">
        {shops && shops.length > 0 ? shops.map((shop) => {
          const ownerEmail = shop.profiles?.email || 'N/A';
          return (
            <div key={shop.id} className="bg-card border border-border rounded-lg p-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-2 items-center">

                <div className="lg:hidden font-semibold text-sm text-foreground/80">Shop Name</div>
                <div className="col-span-2 lg:col-span-1 text-sm font-medium text-foreground">{shop.name}</div>

                <div className="lg:hidden font-semibold text-sm text-foreground/80">Owner Email</div>
                <div className="col-span-2 lg:col-span-1 text-sm text-foreground/80">{ownerEmail}</div>

                <div className="lg:hidden font-semibold text-sm text-foreground/80">Status</div>
                <div className="col-span-2 lg:col-span-1">
                  {shop.is_active ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Inactive</span>
                  )}
                </div>

                <div className="col-span-2 lg:col-span-1 flex items-center justify-start lg:justify-end gap-4 text-sm font-medium mt-2 lg:mt-0">
                   <ToggleStatusButton shopId={shop.id} isActive={shop.is_active} />
                   <Link href={`/admin/shops/${shop.id}/edit`} className="text-indigo-400 hover:text-indigo-600">
                     Edit
                   </Link>
                   <DeleteShopButton shopId={shop.id} />
                </div>

              </div>
            </div>
          );
        }) : <p className="text-center text-gray-400 py-8">No shops found for your search.</p>}
      </div>
    </div>
  );
}
