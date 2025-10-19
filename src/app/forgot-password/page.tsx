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
      setError('重置失败: ' + error.message);
    } else {
      setMessage('密码重置邮件已发送，请检查您的收件箱。');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg border border-border shadow-md">
        <h1 className="text-2xl font-bold text-center text-card-foreground">重置您的密码</h1>
        <p className="text-center text-sm text-card-foreground/80">
          请输入您的邮箱地址，我们将向您发送重置密码的链接。
        </p>
        <form onSubmit={handlePasswordReset} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-card-foreground/80">邮箱地址</label>
            <input
              id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-3 py-2 mt-1 text-foreground bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button type="submit" className="w-full px-4 py-2 font-semibold text-primary-foreground bg-primary rounded-md hover:bg-primary/90">
            发送重置链接
          </button>
        </form>
        {message && <p className="text-green-400 text-center text-sm">{message}</p>}
        {error && <p className="text-red-400 text-center text-sm">{error}</p>}
        <div className="text-center">
          <Link href="/login" className="text-sm text-gray-400 hover:underline">返回登录</Link>
        </div>
      </div>
    </div>
  );
}