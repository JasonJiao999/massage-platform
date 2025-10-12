// src/app/login/page.tsx
"use client";

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert('登录失败: ' + error.message);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    // 使用了 --background 变量
    <div className="flex justify-center items-center h-screen bg-background">
      {/* 使用了 --card 和 --border 变量 */}
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg border border-border shadow-md">
        {/* 使用了 --card-foreground 变量 */}
        <h1 className="text-2xl font-bold text-center text-card-foreground">登录您的账户</h1>
        <form onSubmit={handleSignIn} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-card-foreground/80" // 使用了带透明度的文字颜色
            >
              邮箱地址
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              // 使用了 --background, --foreground, --border 变量
              className="w-full px-3 py-2 mt-1 text-foreground bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-card-foreground/80"
            >
              密码
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 text-foreground bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            // 使用了 --primary 和 --primary-foreground 变量
            className="w-full px-4 py-2 font-semibold text-primary-foreground bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            登录
          </button>
          <div className="text-center mt-4">
            <Link href="/forgot-password" 
              className="text-sm text-gray-400 hover:underline"
            >
              忘记密码？
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}