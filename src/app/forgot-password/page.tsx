// src/app/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const supabase = createClient();

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // 这是用户点击邮件链接后将被重定向到的页面
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError('Reset failed: ' + error.message);
    } else {
      setMessage('A password reset email has been sent. Please check your inbox.');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg- ">
      <div className="card w-[350px] shadow-sm bg-[var(--color-third)] items-center text-[var(--foreground)] p-[24px]">
        <h1 className="text-2xl font-bold text-center text-card-foreground">Reset password</h1>
        <p className="text-left text-sm text-card-foreground/80">
          Please enter your email address and we will send you a link to reset your password.
        </p>
        <form onSubmit={handlePasswordReset} className="gap-[10px] ">
          <div className="flex flex-col justify-center  gap-[15px]">
            <label htmlFor="email" className="block text-sm font-medium text-card-foreground/80">Email</label>
            <input
              id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="input w-[230px]"
            />
          
          <button type="submit" className="btn btn-wide mx-auto">
            Send
          </button>
          </div>
        </form>
        {message && <p className="text-green-400 text-center text-sm">{message}</p>}
        {error && <p className="text-red-400 text-center text-sm">{error}</p>}
        <div className="text-center mt-[10px]">
          <Link href="/login" className="text-sm text-gray-400 hover:underline">Return to Login</Link>
        </div>
      </div>
    </div>
  );
}