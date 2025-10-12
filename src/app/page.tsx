// src/app/page.tsx
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';

// 为员工卡片定义一个清晰的 TypeScript 类型
type StaffForCard = {
  id: string;
  nickname: string;
  years: number | null;
  photo_urls: string[] | null;
  level: string | null;
};

export default async function HomePage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 【核心修正】查询语句已简化，不再关联 profiles 表
  const { data: staffList, error } = await supabase
    .from('staff')
    .select(`
      id,
      nickname,
      years,
      photo_urls,
      level,
      shops ( is_active )
    `)
    .eq('is_active', true)
    .eq('shops.is_active', true)
    .limit(20);

  if (error) {
    console.error('Error fetching staff list:', error);
    return <div className="text-center p-8"><p className="text-red-500">Failed to load staff list.</p></div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-background text-foreground">
      <header className="text-center my-8">
        <h1 className="text-4xl font-bold text-primary">Meet Our Professionals</h1>
        <p className="mt-2 text-lg text-foreground/80">Choose your preferred technician</p>
      </header>

      {staffList && staffList.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {staffList.map((staff) => (
            <StaffCard key={staff.id} staff={staff as StaffForCard} />
          ))}
        </div>
      ) : (
        <p className="text-center text-foreground/60">No technicians are available at the moment.</p>
      )}
    </div>
  );
}

// StaffCard 组件保持不变
function StaffCard({ staff }: { staff: StaffForCard }) {
  const cardImageSrc = 
    staff.photo_urls && staff.photo_urls.length > 0
    ? staff.photo_urls[0]
    : `https://api.dicebear.com/8.x/initials/svg?seed=${staff.nickname}`;

  return (
    <Link href={`/staff/${staff.id}`} className="group block">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg border border-border shadow-lg transition-all duration-300 group-hover:shadow-primary/30 group-hover:scale-105">
        <Image
          src={cardImageSrc}
          alt={staff.nickname || 'Technician'}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
          <h3 className="font-bold text-md truncate">{staff.nickname}</h3>
          {staff.years && (
            <p className="text-xs text-gray-300">{staff.years} {staff.years > 1 ? 'years' : 'year'} exp.</p>
          )}
        </div>
      </div>
    </Link>
  );
}