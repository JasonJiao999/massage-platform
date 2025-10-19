// src/components/FavoriteButton.tsx
'use client';

import { useState, useTransition } from 'react';
import { addFavoriteWorker, removeFavoriteWorker } from '@/lib/actions';
import Image from 'next/image';

export default function FavoriteButton({
  workerProfileId,
  isInitiallyFavorited,
  isLoggedIn, // 1. 新增一个 prop 来判断用户是否登录
}: {
  workerProfileId: string;
  isInitiallyFavorited: boolean;
  isLoggedIn: boolean; // 1. 新增 prop 类型
}) {
  const [isPending, startTransition] = useTransition();
  const [isFavorited, setIsFavorited] = useState(isInitiallyFavorited);

  // 2. 将原来的 onClick 逻辑重命名为 handleClick
  const handleClick = () => {
    // 如果用户未登录，弹出提示并立即返回
    if (!isLoggedIn) {
      alert('无法收藏，请注册');
      return;
    }

    // --- 以下是针对已登录用户的逻辑 ---
    if (isPending) return;

    startTransition(async () => {
      const action = isFavorited ? removeFavoriteWorker : addFavoriteWorker;
      const result = await action(workerProfileId);
      if (result.success) {
        setIsFavorited(!isFavorited);
      } else {
        console.error(result.message);
      }
    });
  };

  return (
<button
      onClick={handleClick}
      disabled={isPending}
      // 保持 40x40px 尺寸，并居中内部元素
      className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
      aria-label={isFavorited ? '取消收藏' : '添加收藏'}
    >
      {/* 【核心修复】: 移除父级 div 和 fill, 添加 width 和 height */}
      <Image
        src={isFavorited ? '/icons/heart-solid.svg' : '/icons/heart-outline.svg'}
        alt="收藏图标"
        width={24} // 明确指定宽度 (24px)
        height={24} // 明确指定高度 (24px)
        className={isFavorited ? 'text-red-500' : 'text-gray-400'}
      />
    </button>
  );
}