// src/components/WorkerSearchClient.tsx (最终修复版 - 确保筛选逻辑正确)

'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import WorkerCard from './WorkerCard';
import PaginationControls from './PaginationControls';
import { FaSearch } from 'react-icons/fa';

// 定义类型
type Worker = any;
type Tag = { tag: string };
type Location = { name: string; location_id: number; };

interface WorkerSearchClientProps {
  initialWorkers: Worker[];
  adminTags: Tag[];
  popularCities: Location[];
  popularAreas: Location[];
  currentPage: number;
  totalPages: number;
  isLoggedIn: boolean;
  favoritesSet: Set<string>;
}

export default function WorkerSearchClient({ 
  initialWorkers, 
  adminTags,
  popularCities,
  popularAreas,
  currentPage, 
  totalPages, 
  isLoggedIn, 
  favoritesSet 
}: WorkerSearchClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  
  useEffect(() => { setSearchTerm(searchParams.get('q') || ''); }, [searchParams]);

  // 【核心修复】统一的筛选更新函数，确保筛选互斥
  const updateFilter = ({ type, value }: { type: 'q' | 'city' | 'area', value: string | number | null }) => {
    const params = new URLSearchParams(); // 创建一个全新的参数对象
    params.set('page', '1'); // 每次筛选都回到第一页
    
    // 只设置当前点击的筛选类型，从而自动清除其他筛选
    if (value) {
      params.set(type, String(value));
    }
    
    router.replace(`${pathname}?${params.toString()}`);
  };
  
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateFilter({ type: 'q', value: searchTerm });
  };

  return (
    <div className="space-y-8">
      <div className="p-6 bg-gray-50 rounded-lg border">
        <div className="space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索昵称或标签..."
              className="w-full p-3 text-lg border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <button type="submit" className="px-5 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">
              <FaSearch className="mr-2"/>
              搜索
            </button>
          </form>

          {/* 推荐标签 */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-600">推荐标签:</span>
            {adminTags.map(({ tag }) => (
              <button 
                key={tag} 
                onClick={() => { setSearchTerm(tag); updateFilter({ type: 'q', value: tag }); }}
                className="px-3 py-1 bg-white border border-gray-300 text-sm text-gray-700 rounded-full hover:bg-gray-100"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* 热门城市 */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-600">热门城市:</span>
            {popularCities.map(({ name, location_id }) => (
              <button 
                key={name} 
                onClick={() => updateFilter({ type: 'city', value: location_id })}
                className="px-3 py-1 bg-white border border-gray-300 text-sm text-gray-700 rounded-full hover:bg-gray-100"
              >
                {name}
              </button>
            ))}
          </div>

          {/* 热门地区 */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-600">热门地区:</span>
            {popularAreas.map(({ name, location_id }) => (
              <button 
                key={name} 
                onClick={() => updateFilter({ type: 'area', value: location_id })}
                className="px-3 py-1 bg-white border border-gray-300 text-sm text-gray-700 rounded-full hover:bg-gray-100"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 搜索结果列表 */}
      <div>
        {initialWorkers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {initialWorkers.map(worker => (
              <WorkerCard 
                key={worker.id} 
                worker={worker} 
                isLoggedIn={isLoggedIn} 
                isFavorited={favoritesSet.has(worker.id)} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-medium text-gray-700">没有找到符合条件的工作者</h3>
            <p className="text-gray-500 mt-2">请尝试调整您的搜索词或筛选条件。</p>
          </div>
        )}
      </div>

      <PaginationControls currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}