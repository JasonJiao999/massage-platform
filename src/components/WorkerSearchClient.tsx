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
      <div className="flex flex-wrap justify-center gap-1 mx-[30px] my-[10px]">
        <div className="space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 my-[10px]">
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by nickname or tag..."
              className="input"
            />
            <button type="submit" className="btn">
              <FaSearch className="mr-2"/>
              AoFiw
            </button>
          </form>

          {/* 推荐标签 */}
          <div className="flex flex-wrap items-center gap-2 my-[10px]">
            <span className="text-sm font-medium ">Recommended:</span>
            {adminTags.map(({ tag }) => (
              <button 
                key={tag} 
                onClick={() => { setSearchTerm(tag); updateFilter({ type: 'q', value: tag }); }}
                className="btn"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* 热门城市 */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium ">Popular Cities:</span>
            {popularCities.map(({ name, location_id }) => (
              <button 
                key={name} 
                onClick={() => updateFilter({ type: 'city', value: location_id })}
                className="btn"
              >
                {name}
              </button>
            ))}
          </div>

          {/* 热门地区 */}
          <div className="flex flex-wrap items-center gap-2 my-[10px]">
            <span className="text-sm font-medium ">Popular Areas:</span>
            {popularAreas.map(({ name, location_id }) => (
              <button 
                key={name} 
                onClick={() => updateFilter({ type: 'area', value: location_id })}
                className="btn"
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
          // 核心修改：使用 flex 和 flex-wrap 来实现横向排列和自动换行
          <div className="flex flex-wrap justify-center max-w-[1200px] mx-auto">
            <div className='card w-full min-[500px]:max-w-[400px] min-[1200px]:max-w-[1200px] '>
            <div className='flex flex-wrap justify-start gap-[10px]'>
            {initialWorkers.map(worker => (
              <WorkerCard 
                key={worker.id} 
                worker={worker} 
                isLoggedIn={isLoggedIn} 
                isFavorited={favoritesSet.has(worker.id)} 
              />
            ))}
            </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-medium text-gray-700">No data matching the criteria was found.</h3>
            <p className="text-gray-500 mt-2">Please try adjusting your search terms or filter criteria.</p>
          </div>
        )}
      </div>



      <PaginationControls currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}