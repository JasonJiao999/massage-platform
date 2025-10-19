// src/app/dashboard/page.tsx
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

// 这是一个专门为商户展示的组件，保持不变
function MerchantDashboard({ shop }: { shop: { name: string } | null }) {
  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold mb-4">商户后台</h1>
      {shop ? (
        <p>欢迎回来, {shop.name}！</p>
      ) : (
        <div>
          <p>您还没有创建店铺。</p>
          <Link href="/dashboard/shop" className="text-primary hover:underline">
            立即创建并设置您的店铺
          </Link>
        </div>
      )}
      <div className="mt-8">
        <h2 className="text-xl font-semibold">管理您的店铺</h2>
        <ul className="list-disc list-inside mt-4 space-y-2">
          <li>
            <Link href="/dashboard/shop" className="text-primary hover:underline">
              编辑店铺信息与主题
            </Link>
          </li>
          <li>
            <Link href="/dashboard/services" className="text-primary hover:underline">
              管理服务分类
            </Link>
          </li>
          <li>
            <Link href="/dashboard/staff" className="text-primary hover:underline">
              管理员工
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

// 主页面 - 角色路由器 (带诊断日志)
export default async function DashboardRedirectPage() {
  console.log('--- [Dashboard Router] Execution Started ---');
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.log('LOG: User not found. Redirecting to /login.');
    return redirect('/login');
  }
  console.log(`LOG: User found. User ID: ${user.id}`);

  // 获取用户的角色信息
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // 【核心诊断】: 打印从数据库获取的原始 profile 数据
  if (error) {
    console.error('LOG: Error fetching profile:', error.message);
  }
  console.log('LOG: Fetched profile object:', JSON.stringify(profile, null, 2));

  // 关键判断点：在 switch 之前打印出我们将用于判断的 role 值
  const userRole = profile?.role;
  console.log(`LOG: Role for switch statement is: "${userRole}" (Type: ${typeof userRole})`);

  switch (userRole) {
    case 'customer':
      console.log('LOG: Role is "customer". Redirecting to /dashboard/profile.');
      redirect('/dashboard/profile');
    
    case 'staff':
    case 'freeman':
      console.log(`LOG: Role is "${userRole}". Redirecting to /staff-dashboard.`);
      redirect('/staff-dashboard');
      
    case 'admin':
      console.log('LOG: Role is "admin". Redirecting to /admin/shops.');
      redirect('/admin/shops');

    case 'merchant':
      console.log('LOG: Role is "merchant". Rendering MerchantDashboard.');
      const { data: shop } = await supabase.from('shops').select('name').eq('owner_id', user.id).single();
      return <MerchantDashboard shop={shop} />;

    default:
      console.log(`LOG: Role "${userRole}" did not match any case. Redirecting to homepage.`);
      return redirect('/');
  }
}