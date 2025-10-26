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
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">已上傳媒體</h2>
      {initialMedia.length === 0 ? (
        <p className="text-gray-500">暫無已上傳的媒體文件。</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialMedia.map((item) => (
            <div key={item.id} className="border rounded-lg overflow-hidden shadow-sm bg-white flex flex-col">
              
              {/* 【核心修復】: 我們重構了圖片的顯示方式 */}
              <div className="w-full bg-gray-100">
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
              
              <div className="p-4 flex flex-col flex-grow">
                <div className="flex-grow">
                  <p className="font-bold truncate" title={item.name || ''}>{item.name || '未命名'}</p>
                  <p className="text-sm text-gray-600 capitalize">{item.asset_type.replace('_', ' ')}</p>
                </div>
                <button
                  onClick={() => handleDelete(item)}
                  disabled={deletingId === item.id}
                  className="mt-4 w-full text-sm text-red-600 bg-red-100 hover:bg-red-200 py-2 px-3 rounded-md transition-colors disabled:bg-gray-200 disabled:text-gray-400"
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