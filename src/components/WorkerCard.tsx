// src/components/WorkerCard.tsx (最终版 - 全新卡片设计)

import Image from 'next/image';
import Link from 'next/link';
import FavoriteButton from './FavoriteButton';

// 定义类型
type Worker = {
  id: string;
  nickname: string | null;
  avatar_url: string | null;
  photo_urls: string[] | null;
  years: number | null;
  tags: string[] | null;
  province_name: string | null;
  district_name: string | null;
};

interface WorkerCardProps {
  worker: Worker;
  isLoggedIn: boolean;
  isFavorited: boolean;
}

export default function WorkerCard({ worker, isLoggedIn, isFavorited }: WorkerCardProps) {
  const cardImage = worker.photo_urls?.[0] || worker.avatar_url || '/default-avatar.png';

  return (
    <div className="block group w-[300px] h-[600px]">
      {/* 【核心修改】1. 容器结构调整为上图下文
        - 使用 flex 和 flex-col 将卡片设为垂直布局。
        - Link 标签现在只包裹图片，让交互更清晰。
      */}
      <div className="relative w-full h-full bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
        
        {/* 图片区域 */}
        <Link href={`/worker/${worker.id}`} className="relative block w-full h-[400px] flex-shrink-0">
          <Image
            src={cardImage}
            alt={worker.nickname || 'Worker'}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* 收藏按钮 (保持在右上角) */}
        <div className="absolute top-3 right-3 z-10">
            <FavoriteButton 
              workerProfileId={worker.id}
              isInitiallyFavorited={isFavorited}
              isLoggedIn={isLoggedIn}
            />
        </div>

        {/* 【核心修改】2. 白色文字信息容器
          - 不再使用绝对定位，作为 flex 布局的第二个子元素自然排列在图片下方。
          - flex-grow 让它自动填满剩余空间。
          - text-gray-800 设置深色文字。
          - rounded-b-lg 添加底部圆角。
        */}
        <div className="p-3 flex flex-col flex-grow text-gray-800">
          <Link href={`/worker/${worker.id}`} className="block">
            <h3 className="text-lg font-bold truncate">{worker.nickname}</h3>
            {worker.years != null && (
              <p className="text-xs text-gray-500 mt-1">{worker.years} 年从业经验</p>
            )}
                      {/* 【核心修改】3. 添加 Tags 显示，并推至容器底部 */}
          <div className="flex flex-wrap gap-1 mt-auto pt-2">
            {worker.tags?.slice(0, 3).map(tag => (
              <span key={tag} className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
          </Link>


        </div>
      </div>
    </div>
  );
}