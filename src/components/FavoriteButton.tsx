// src/components/FavoriteButton.tsx
'use client';

import { useState, useTransition } from 'react';
import { addFavoriteWorker, removeFavoriteWorker } from '@/lib/actions';
import Image from 'next/image';

export default function FavoriteButton({
  workerProfileId,
  isInitiallyFavorited,
  isLoggedIn, // 1. 新增一个 prop 来判断用户是否登录
  className,
}: {
  workerProfileId: string;
  isInitiallyFavorited: boolean;
  isLoggedIn: boolean; // 1. 新增 prop 类型
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [isFavorited, setIsFavorited] = useState(isInitiallyFavorited);

  // 2. 将原来的 onClick 逻辑重命名为 handleClick
  const handleClick = () => {
    // 如果用户未登录，弹出提示并立即返回
    if (!isLoggedIn) {
      alert('Unable to click, please register.');
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
      className={`flex items-center justify-center card bg-[var(--color-secondary)]  ${className || ''}`}
      aria-label={isFavorited ? 'Dislike' : 'Like'}
      
    >
      {/* 【核心修复】: 移除父级 div 和 fill, 添加 width 和 height   bg-[var(--color-secondary)] */}
      <Image
        src={isFavorited ? '/icons/heart-solid.svg' : '/icons/heart-outline.svg'}
        alt="Like"
        width={24} // 明确指定宽度 (24px)
        height={24} // 明确指定高度 (24px)
        className={`${isFavorited ? 'text-red-500' : 'text-gray-400'} `}
      />
    </button>
  );
}