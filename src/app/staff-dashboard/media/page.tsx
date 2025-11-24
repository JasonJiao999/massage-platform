// src/app/staff-dashboard/media/page.tsx
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import MyMediaClient from '@/components/MyMediaClient'; // 导入刚才创建的组件

export default async function MyMediaPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 获取个人资料，包含新的 cover_image_url
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, photo_urls, video_urls, cover_image_url, level') 
    .eq('id', user.id)
    .single();

  if (!profile) {
    return <div>Profile not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mx-[10px] text-white">My Media Library</h1>
      <MyMediaClient profile={profile} />
    </div>
  );
}