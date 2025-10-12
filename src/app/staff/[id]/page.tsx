// src/app/staff/[id]/page.tsx
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default async function StaffPublicProfilePage({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. 获取员工的详细信息，同时关联查询他所属的店铺信息
  const { data: staff, error: staffError } = await supabase
    .from('staff')
    .select(`
      nickname,
      bio,
      level,
      years,
      feature,
      tags,
      photo_urls,
      video_urls,
      shops ( name, slug )
    `)
    .eq('id', params.id)
    .eq('is_active', true) // 只显示活跃的员工
    .single();

  if (staffError || !staff) {
    notFound(); // 如果找不到员工或员工不活跃，显示404页面
  }

  // 2. 获取该员工创建的所有服务项目
  const { data: services, error: servicesError } = await supabase
    .from('services')
    .select('*')
    .eq('creator_staff_id', params.id);

  const shopInfo = staff.shops as { name: string, slug: string } | null;

  return (
    <div className="w-full max-w-4xl p-4 sm:p-6 lg:p-8">
      {/* 员工个人信息部分 */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="md:w-1/3">
          {/* 这里可以放员工头像，暂时用占位符 */}

          <h1 className="text-3xl font-bold text-center mt-4">{staff.nickname}</h1>
          <p className="text-center text-primary font-semibold">{staff.level || 'Technician'}</p>
          {shopInfo && (
            <Link href={`/shops/${shopInfo.slug}`} className="block text-center text-foreground/70 hover:underline mt-1">
              @{shopInfo.name}
            </Link>
          )}
        </div>
        <div className="md:w-2/3">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">About Me</h2>
          <p className="mt-4 text-foreground/90">{staff.bio || 'No biography provided.'}</p>

          <h3 className="text-lg font-semibold mt-6">Info</h3>
          <div className="flex flex-wrap gap-4 mt-2">
            {staff.years && <div className="bg-card p-2 rounded-md text-sm">Experience: {staff.years} years</div>}
            {staff.feature && staff.feature.length > 0 && (
              <div className="bg-card p-2 rounded-md text-sm">Features: {staff.feature.join(', ')}</div>
            )}
          </div>

          {/* 在这里展示员工的照片和视频 */}
          {/* ... */}
        </div>
      </div>

      {/* 员工提供的服务列表 */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold border-b border-border pb-2 mb-6">Services Offered</h2>
        <div className="space-y-4">
          {services && services.length > 0 ? (
            services.map(service => (
              <div key={service.id} className="bg-card border border-border rounded-lg p-4 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-lg text-foreground">{service.name}</h4>
                  <p className="text-sm text-foreground/70 mt-1">{service.description || 'No description'}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-xl font-semibold text-primary">${service.price}</p>
                  <button className="mt-1 text-sm bg-indigo-600 text-white py-1 px-3 rounded-md hover:bg-indigo-700">Book</button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-foreground/60">This staff member has not listed any services yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}