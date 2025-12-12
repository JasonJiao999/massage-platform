// src/components/WorkerSearchClient.tsx (最终修复版 - 确保筛选逻辑正确)

'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import WorkerCard from './WorkerCard';
import PaginationControls from './PaginationControls';
import { FaSearch } from 'react-icons/fa';
import Link from 'next/link'; // <-- (新增) 導入 Link 組件


// --- (新增) 用於操作 Cookie 的輔助函數 ---
const setCookie = (name: string, value: string, days: number) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  // 確保在瀏覽器環境下才設置 cookie
  if (typeof document !== 'undefined') {
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
  }
};

const getCookie = (name: string): string | null => {
  // 確保在瀏覽器環境下才讀取 cookie
  if (typeof document === 'undefined') {
    return null;
  }
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for(let i=0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};
// --- 輔助函數結束 ---

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
  
// --- (新增) 用於控制提示窗口的 State ---
  const [showAgeModal, setShowAgeModal] = useState(false);
  
  useEffect(() => { setSearchTerm(searchParams.get('q') || ''); }, [searchParams]);

  // --- (新增) 檢查 Cookie 並決定是否顯示窗口 ---
  useEffect(() => {
    const ageVerified = getCookie('age_verified');
    if (ageVerified !== 'true') {
      setShowAgeModal(true); // 如果 cookie 不存在或不是 'true'，則顯示窗口
    }
  }, []); // 空依賴數組，確保只在組件加載時運行一次

  // --- (新增) 關閉窗口並設置 Cookie 的處理函數 ---
  const handleAgeConfirm = () => {
    setCookie('age_verified', 'true', 365); // 設置 cookie，有效期 1 年
    setShowAgeModal(false); // 關閉窗口
  };
  // --- (已更新) 退出按鈕的處理函數 ---
  const handleExit = () => {

    window.location.href = 'about:blank';
  };

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
    <div className="space-y-8 ">

{/* --- (已更新) 年齡提示窗口的 JSX --- */}
      {showAgeModal && (

  <div 
    className="fixed inset-0 z-50 p-4 bg-black bg-opacity-50"
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    }}
  >

          <div className="card bg-primary text-[var(--foreground)] rounded-lg p-[24px] text-center shadow-2xl max-w-md w-[500px]">
            <h2 className="text-2xl font-bold mb-4">Welcome to the Aofiw website</h2>
            <h2 className="text-2xl font-bold mb-4">Legal Notice</h2>
            <div className="text-md mb-6 text-left space-y-2">
              <p>AoFiw is a lawful social companionship platform for adults only. </p>
              <p>Any form of sexual or illegal activity is strictly prohibited. </p>
              <p>AoFiw is not involved in or responsible for any offline interactions. </p>
              <p>By using this platform, you confirm you are 18+ and agree to our{' '}
                <Link href="/terms" target="_blank" className="underline hover:text-blue-400">Terms</Link> &{' '}
                <Link href="/privacy" target="_blank" className="underline hover:text-blue-400">Privacy Policy</Link>. 
              </p>
            </div>
            
            {/* 2. 按鈕容器 (需求 1) */}
            <div className="flex flex-col sm:flex-row justify-center gap-[10px] ">
              {/* 退出按鈕 */}
              <button 
                onClick={handleExit}
                className="btn btn-error text-[var(--color-secondary)]" // 使用 'btn-outline' 樣式以區分
              >
                Exit
              </button>
              
              {/* 確認按鈕 */}
              <button 
                onClick={handleAgeConfirm}
                className="btn " // 使用主要的 'btn' 樣式
              >
                Confirm
              </button>
            </div>
          </div>

        </div>
      )}
      {/* --- 提示窗口結束 --- */}

      <div className="flex flex-wrap justify-center w-full my-[10px] ">
        <div className="card bg-[var(--color-third)] w-full p-[10px]">
          <form onSubmit={handleSearchSubmit} className="flex items-center p-[24px] my-[10px]">
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by nickname or tag..."
              className="input w-[90%]"
            />
            <button type="submit" className="btn">
              <FaSearch className="mr-2"/>
              AoFiw
            </button>
          </form>

          {/* 推荐标签 */}
          <div className="flex flex-wrap items-center gap-[5px] p-[10px]">
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
          <div className="flex flex-wrap items-center gap-[5px] p-[10px]">
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
          <div className="flex flex-wrap items-center gap-[5px] p-[10px]">
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
          <div className="flex flex-wrap justify-center  mx-auto">
            <div className='card w-full  '>
              <div className='grid grid-cols-2 
                        min-[768px]:grid-cols-4   {/* 屏幕宽度 >= 768px 时显示 4 列 */}
                        min-[1024px]:grid-cols-5 {/* 屏幕宽度 >= 1024px 时显示 5 列 */}
                        gap-[10px]
                        w-full'>
              
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