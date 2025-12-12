'use client';

import { useState } from 'react';
import Image from 'next/image';
import { deleteMedia } from '@/lib/actions';

type MediaItem = {
  id: string;
  url: string;
  name: string | null;
  asset_type: string;
  is_active: boolean;
};

interface MediaListProps {
  initialMedia: MediaItem[];
}

export default function MediaList({ initialMedia }: MediaListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (item: MediaItem) => {
    if (!confirm(`您確定要刪除 "${item.name || '此媒體'}" 嗎？此操作無法撤銷。`)) {
      return;
    }
    setDeletingId(item.id);
    const result = await deleteMedia(item);
    if (!result.success) {
      alert(`刪除失敗: ${result.message}`);
    }
    setDeletingId(null);
  };

  return (
    <div className="card rounded-lg p-[24px] my-[20px]">
      <h2 className="text-2xl font-semibold">已上傳媒體</h2>
      {initialMedia.length === 0 ? (
        <p className="text-gray-500">暫無已上傳的媒體文件。</p>
      ) : (
        <div className="mx-auto flex flex-wrap justify-center">
          {initialMedia.map((item) => (
            <div key={item.id} className="card bg-primary w-[320px] text-[var(--foreground)] flex m-[10px] p-[10px]">
              
              {/* 【核心修復】: 我們重構了圖片的顯示方式 */}
              <div className="w-full">
                <Image
                  src={item.url}
                  alt={item.name || 'Media asset'}
                  // 提供一個較大的基礎尺寸，Next.js 會依此進行優化
                  width={500} 
                  height={500}
                  // 使用 className 來控制實際顯示樣式
                  className="w-full h-auto object-cover max-h-64" // 寬度100%，高度自動，最多不超過64(256px)
                />
              </div>
              
              <div className="p-[10px]">
                <div className="flex-grow">
                  <p className="font-bold truncate" title={item.name || ''}>图片名称：{item.name || '未命名'}</p>
                  <p className="text-sm capitalize">图片类型：{item.asset_type.replace('_', ' ')}</p>
                </div>
                <button
                  onClick={() => handleDelete(item)}
                  disabled={deletingId === item.id}
                  className="btn"
                >
                  {deletingId === item.id ? '正在刪除...' : '刪除'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}