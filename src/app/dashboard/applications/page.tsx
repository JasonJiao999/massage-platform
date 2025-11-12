// src/app/dashboard/applications/page.tsx
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
// import { approveApplication, rejectApplication } from '@/lib/actions';

export default async function ApplicationsPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/login');

  const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single();
  if (!shop) return <div className="p-8">Could not find your shop.</div>;

  const { data: applications, error } = await supabase
    .from('shop_applications')
    .select(`
      id,
      created_at,
      profiles ( nickname, email )
    `)
    .eq('shop_id', shop.id)
    .eq('status', 'pending');

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Manage Join Applications</h1>

      <div className="space-y-4">
        {/*
        {applications && applications.length > 0 ? (
          applications.map((app) => {
            const profile = app.profiles as { nickname: string, email: string };
            return (
              <div key={app.id} className="bg-card border border-border rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-foreground">{profile.nickname || profile.email}</p>
                  <p className="text-sm text-foreground/70">Applied on: {new Date(app.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-4">
                  <form action={rejectApplication.bind(null, app.id)}>
                    <button type="submit" className="bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium py-1 px-3 rounded">Reject</button>
                  </form>
                  <form action={approveApplication.bind(null, app.id)}>
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-1 px-3 rounded">Approve</button>
                  </form>
                </div>
              </div>
            );
          })
        ) : (*/}
          <div className="bg-card border border-border rounded-lg p-8 text-center text-foreground/60">
            <p>There are no pending applications.</p>
          </div>
      {/*  )} */}
      </div>
    </div>
  );
}