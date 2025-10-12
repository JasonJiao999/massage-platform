// src/app/staff-dashboard/profile/page.tsx
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { joinShopByMerchantEmail, leaveShop } from '@/lib/actions';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

// ... (SubmitButton 组件保持不变) ...
function JoinSubmitButton() { /* ... */ }

export default function ProfilePage() {
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        setRole(profile?.role || null);
      }
      setIsLoading(false);
    };
    fetchProfile();
  }, [supabase]);

  const [joinState, joinFormAction] = useFormState(joinShopByMerchantEmail, { message: '', success: false });

  if (isLoading) {
    return <p>Loading profile...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">My Profile</h1>

      {role === 'freeman' && (
        <div className="max-w-xl p-6 bg-card border border-border rounded-lg">
          <h2 className="text-lg font-semibold text-white mb-4">Join a Shop</h2>
          <p className="text-sm text-foreground/80 mb-4">You are currently a freelance technician. Join a shop by entering the merchant's email address below.</p>
          <form action={joinFormAction} className="space-y-4">
            {/* ... "Join Shop" 表单内容保持不变 ... */}
          </form>
        </div>
      )}

      {role === 'staff' && (
         <div className="max-w-xl p-6 bg-card border border-border rounded-lg mt-8">
           <h2 className="text-lg font-semibold text-white mb-4">Leave Current Shop</h2>
           <p className="text-sm text-foreground/80 mb-4">Click the button below to leave your current shop and become a freelance technician.</p>
           <form action={leaveShop}>
              <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md">Leave Shop</button>
           </form>
         </div>
      )}

    </div>
  );
}