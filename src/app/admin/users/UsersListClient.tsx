// 文件路徑: app/admin/users/UsersListClient.tsx

'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toggleUserAccountStatus } from '@/lib/actions';

type UserProfile = {
  id: string;
  nickname: string | null;
  email: string | null;
  role: string | null;
  acc_active: boolean;
};

export default function UsersListClient({ initialUsers }: { initialUsers: UserProfile[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [filter, setFilter] = useState(searchParams.get('filter') || 'nickname');
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/admin/users?query=${query.trim()}&filter=${filter}`);
    }
  };

  const handleToggleStatus = (user: UserProfile) => {
    startTransition(async () => {
      const result = await toggleUserAccountStatus(user.id, user.acc_active);
      if (!result.success) {
        alert(result.message);
      }
    });
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">用戶信息管理</h1>
      
      <form onSubmit={handleSearch} className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-grow p-2 border border-gray-300 rounded-md"
            placeholder="輸入搜索關鍵字..."
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded-md bg-white"
          >
            <option value="nickname">用戶暱稱</option>
            <option value="email">用戶郵箱</option>
          </select>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
            搜索
          </button>
        </div>
      </form>

      <div className="bg-white p-6 rounded-lg shadow-md">
        {searchParams.get('query') ? (
          initialUsers.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {initialUsers.map((user) => (
                <li key={user.id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div>
                    <p className="font-bold text-lg">{user.nickname || '未命名'}</p>
                    <p className="text-sm text-gray-500">{user.email || '無郵箱'}</p>
                    <p className="text-sm text-gray-500">角色: {user.role || 'N/A'}</p>
                  </div>
                  <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${user.acc_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.acc_active ? '賬號激活' : '賬號暫停'}
                    </span>
                    <button onClick={() => handleToggleStatus(user)} disabled={isPending} className="text-sm bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md disabled:opacity-50">
                      {isPending ? '處理中...' : (user.acc_active ? '暫停賬號' : '激活賬號')}
                    </button>
                    <Link href={`/admin/users/${user.id}/edit`} className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-md">
                      編輯
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500">未找到符合條件的用戶。</p>
          )
        ) : (
          <p className="text-center text-gray-500">請輸入關鍵字並選擇篩選條件開始搜索。</p>
        )}
      </div>
    </div>
  );
}