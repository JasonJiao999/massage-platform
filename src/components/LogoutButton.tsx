// src/components/LogoutButton.tsx
"use client";

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function LogoutButton({ logoutText }: { logoutText: string }) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="py-2 px-4 rounded-md no-underline bg-red-500 hover:bg-red-600 text-white font-semibold"
    >
      {logoutText}
    </button>
  );
}