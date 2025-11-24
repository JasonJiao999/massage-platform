// src/components/WorkerCard.tsx (最终版 - 全新卡片设计)

import Image from 'next/image';
import Link from 'next/link';
import FavoriteButton from './FavoriteButton';

// 定义类型
type Worker = {
  id: string;
  nickname: string | null;
  qr_url: string | null;
  photo_urls: string[] | null;
  years: number | null;
  tags: string[] | null;
  province_name: string | null;
  district_name: string | null;
  cover_image_url: string | null;
};

interface WorkerCardProps {
  worker: Worker;
  isLoggedIn: boolean;
  isFavorited: boolean;
}

// 增强版本 - 更明确的样式控制
// WorkerCard.tsx - 强样式版本
export default function WorkerCard({ worker, isLoggedIn, isFavorited }: WorkerCardProps) {
  const cardImage = worker.cover_image_url;

if (!cardImage) {
    return null;
  }
  
  return (
    <div 
      className="card  bg-white rounded-lg shadow-md overflow-hidden flex flex-col max-w-[228px]"
      style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        margin: '10px'
      }}
    >
      
      {/* 图片区域 */}
      <Link 
        href={`/worker/${worker.id}`} 
        className="relative block w-full h-[400px] flex-shrink-0"
        style={{ position: 'relative', display: 'block', width: '100%', height: '400px', flexShrink: 0 }}
      >
        <Image
          src={cardImage}
          alt={worker.nickname || 'Worker'}
          fill
          style={{ objectFit: 'cover' }}
          className="hover:scale-105 transition-transform duration-300"
        />
      </Link>

      {/* 收藏按钮 */}
      <div 
        className="absolute top-3 right-3 z-10"
        style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10 }}
      >
        <FavoriteButton 
          workerProfileId={worker.id}
          isInitiallyFavorited={isFavorited}
          isLoggedIn={isLoggedIn}
        />
      </div>

      {/* 信息容器 */}
      <div 
        className="p-3 flex flex-col flex-grow text-center"
        style={{
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          textAlign: 'center',
          backgroundColor: 'white',
          color: '#1f2937' // gray-800
        }}
      >
        <Link href={`/worker/${worker.id}`} className="block">
          <h3 
            className="text-lg font-bold truncate"
            style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: '#111827' // gray-900
            }}
          >
            {worker.nickname}
          </h3>
          {worker.years != null && (
            <p 
              className="text-xs mt-1"
              style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }} // gray-500
            >
              {worker.years} Age
            </p>
          )}
        </Link>
        
        <div 
          className="flex flex-wrap justify-center mt-auto pt-2"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '4px',
            marginTop: 'auto',
            paddingTop: '8px'
          }}
        >
          {worker.tags?.slice(0, 3).map(tag => (
            <span 
              key={tag}
              style={{
                backgroundColor: '#e5e7eb', // gray-200
                color: '#374151', // gray-700
                fontSize: '12px',
                fontWeight: '600',
                padding: '2px 8px',
                borderRadius: '9999px'
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}