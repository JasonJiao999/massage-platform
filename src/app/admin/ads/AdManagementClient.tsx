'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { setActiveBanner } from '@/lib/actions';

type Banner = {
  id: string;
  url: string;
  name: string | null;
  is_active: boolean;
};

export default function AdManagementClient({ initialBanners }: { initialBanners: Banner[] }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSetActive = (bannerId: string) => {
    startTransition(async () => {
      const res = await setActiveBanner(bannerId);
      setResult(res);
    });
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialBanners.map((banner) => (
          <div key={banner.id} className={`card p-[10px] border-2 rounded-lg shadow-sm overflow-hidden flex flex-col ${banner.is_active ? 'border-green-500' : 'border-gray-200'}`}>
            
            {/* 【核心修改】: 我們重構了圖片的顯示方式 */}
            <div className="w-full bg-gray-100">
              <Image
                src={banner.url}
                alt={banner.name || 'Promotional Banner'}
                // 提供一個較大的基礎尺寸，Next.js 會依此進行優化
                width={600}
                height={400}
                // 使用 className 來控制實際顯示樣式
                className="w-full h-auto object-cover" // 寬度100%，高度自動
              />
            </div>

            <div className="p-4 bg-white flex flex-col flex-grow">
              <div className="flex-grow">
                <p className="font-semibold truncate">{banner.name}</p>
                 {banner.is_active && (
                  <p className="text-xs font-bold text-green-600 mt-1">
                    當前激活
                  </p>
                )}
              </div>
              <button
                onClick={() => handleSetActive(banner.id)}
                disabled={isPending || banner.is_active}
                className="btn"
              >
                {isPending ? '設置中...' : '設為激活廣告'}
              </button>
            </div>
          </div>
        ))}
      </div>
      {result && (
        <p className={`mt-6 text-center text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
          {result.message}
        </p>
      )}
    </div>
  );
}