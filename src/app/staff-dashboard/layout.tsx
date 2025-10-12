// src/app/staff-dashboard/layout.tsx
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function StaffDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

  // 【核心修改】如果角色不是 'staff' 也不是 'freeman'，则重定向
  const allowedRoles = ['staff', 'freeman'];
  if (!profile || !allowedRoles.includes(profile.role)) {
    return redirect('/');
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="w-64 bg-card border-r border-border p-6 flex flex-col">
        <h1 className="text-xl font-bold mb-8">Staff Console</h1>
        <nav className="flex-grow">
          <ul className="space-y-2">
            <li><Link href="/staff-dashboard/services" className="block py-2 px-3 rounded-md hover:bg-primary/10">My Services</Link></li>
            <li><Link href="/staff-dashboard/profile" className="block py-2 px-3 rounded-md hover:bg-primary/10">My Profile</Link></li>
            <li><Link href="/staff-dashboard/schedule" className="block py-2 px-3 rounded-md hover:bg-primary/10 text-gray-500 cursor-not-allowed">My Schedule <span className="text-xs ml-2 bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">Soon</span></Link></li>
          </ul>
        </nav>
        <div className="mt-auto">
            <p className="text-xs text-foreground/60">Logged in as:</p>
            <p className="text-sm font-medium truncate">{user.email}</p>
        </div>
      </aside>
      <main className="flex-1 p-6 lg:p-8">{children}</main>
    </div>
  );
}