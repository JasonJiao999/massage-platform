// src/app/shops/[slug]/page.tsx
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

export default async function ShopPage({ params }: { params: { slug: string } }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: shop } = await supabase
    .from('shops')
    .select('id, name, description, tags, social_links')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single();

  if (!shop) {
    notFound(); // 使用 Next.js 内置的 notFound 函数来显示标准404页面
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-bold text-primary mb-2">{shop.name}</h1>
        <p className="text-lg text-foreground/80 mb-6">{shop.description || '店主很懒，还没有写简介...'}</p>

        <div className="flex flex-wrap gap-2 mb-8">
          {shop.tags?.map((tag: string) => (
            <span key={tag} className="bg-primary/20 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        {/* 未来可以在这里添加员工和服务的列表 */}
        <h2 className="text-2xl font-semibold border-b border-border pb-2 mb-4">我们的团队</h2>
        {/* ...查询并展示 staff 列表... */}

        <h2 className="text-2xl font-semibold border-b border-border pb-2 my-4">服务项目</h2>
        {/* ...查询并展示 services 列表... */}

      </div>
    </div>
  );
}