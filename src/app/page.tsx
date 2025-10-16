// src/app/page.tsx (最终版 - 展示 photo_urls[0], nickname, years)

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';

export default async function Home() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 数据查询逻辑保持不变，因为它已经获取了所有需要的字段 ('*')
  const { data: workers, error } = await supabase
    .from('profiles')
    .select('*')
    .in('role', ['freeman', 'staff'])
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching workers list:", error);
    return <p className="text-center text-red-500">加载技师列表时出错。</p>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold">探索我们的专业技师</h1>
        <p className="text-lg text-gray-600 mt-4">找到最适合您的疗愈专家</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl">
        {workers && workers.length > 0 ? (
          workers.map((worker) => (
            // 1. 【核心修改】: 更新 Link 的 href 路径
            <Link href={`/worker/${worker.id}`} key={worker.id} className="group">
              <div className="bg-white rounded-lg shadow-md border overflow-hidden transform transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2">
                <Image
                  // 2. 【核心修改】: 图片来源变为 photo_urls 的第一张
                  // 使用可选链 (?.) 和 || 操作符来安全地处理
                  // 如果 photo_urls 不存在或为空，则使用默认图片
                  src={worker.photo_urls?.[0] || '/default-avatar.png'}
                  alt={worker.nickname || 'Worker'}
                  width={400}
                  height={400}
                  className="w-full h-64 object-cover" // 调整了图片高度以获得更好的视觉效果
                />
                <div className="p-5 text-center">
                  <h2 className="text-xl font-bold text-gray-800">
                    {worker.nickname}
                  </h2>
                  {/* 3. 【核心修改】: 新增显示从业年限的元素 */}
                  {/* 使用条件渲染，只有当 years 存在且大于0时才显示 */}
                  {worker.years && worker.years > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      从业 {worker.years} 年
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p>当前平台还没有可用的技师。</p>
        )}
      </div>
    </main>
  );
}