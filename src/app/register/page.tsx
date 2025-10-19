// src/app/register/page.tsx (最终修复版)
"use client";

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const router = useRouter();
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 【核心修复】: 使用官方的 supabase.auth.signUp 方法
    // 并将用户选择的角色放在 options.data (即 raw_user_meta_data) 中
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: role,
        }
      }
    });

    if (error) {
      alert('注册失败: ' + error.message);
    } else {
      alert('注册成功！请检查您的邮箱以完成验证。');
      router.push('/login');
    }
  };

  return (
    // ... JSX 部分保持不变，无需修改 ...
    <div className="flex justify-center items-center h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg border border-border shadow-md">
        <h1 className="text-2xl font-bold text-center text-card-foreground">创建您的账户</h1>
        <form onSubmit={handleSignUp} className="space-y-6">
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-card-foreground/80">
              选择您的身份
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 text-foreground bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="customer">顾客 (Customer)</option>
              <option value="freeman">自由工作者 (Freeman)</option>
              <option value="staff">店铺员工 (Staff)</option>
              <option value="merchant">商户 (Merchant)</option>
            </select>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-card-foreground/80">
              邮箱地址
            </label>
            <input
              id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-3 py-2 mt-1 text-foreground bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-card-foreground/80">
              密码
            </label>
            <input
              id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full px-3 py-2 mt-1 text-foreground bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button type="submit" className="w-full px-4 py-2 font-semibold text-primary-foreground bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            注册
          </button>
        </form>
      </div>
    </div>
  );
}