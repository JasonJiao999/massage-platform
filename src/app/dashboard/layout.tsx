// 文件路徑: src/app/dashboard/layout.tsx
import HeaderMerchant from '@/components/HeaderMerchant';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
export default async function MerchantLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  const { data: shop } = user ? await supabase.from('shops').select('slug').eq('owner_id', user.id).single() : { data: null };
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <HeaderMerchant shopSlug={shop?.slug || null} />
      <main>{children}</main>
    </div>
  );
}