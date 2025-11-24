// src/app/login/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// 静态翻译字典
const translations = {
  en: {
    loginAccount: 'Login Account',
    email: 'Email',
    password: 'Password',
    login: 'Login',
    forgetPassword: 'Forget Password',
    loginFailed: 'Login failed: '
  },
  th: {
    loginAccount: 'เข้าสู่ระบบบัญชี',
    email: 'อีเมล',
    password: 'รหัสผ่าน',
    login: 'เข้าสู่ระบบ',
    forgetPassword: 'ลืมรหัสผ่าน',
    loginFailed: 'เข้าสู่ระบบล้มเหลว: '
  },
  'zh-TW': {
    loginAccount: '登入帳號',
    email: '電子郵件',
    password: '密碼',
    login: '登入',
    forgetPassword: '忘記密碼',
    loginFailed: '登入失敗: '
  }
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const router = useRouter();
  const supabase = createClient();

  // 根据浏览器语言自动设置语言
  useEffect(() => {
    const browserLanguage = navigator.language;
    
    if (browserLanguage.startsWith('th')) {
      setCurrentLanguage('th');
    } else if (browserLanguage.startsWith('zh-TW')) {
      setCurrentLanguage('zh-TW');
    } else {
      setCurrentLanguage('en');
    }
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(translations[currentLanguage as keyof typeof translations].loginFailed + error.message);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  const t = translations[currentLanguage as keyof typeof translations];

  return (
    <div className="flex justify-center">
      <div className="card shadow-sm bg-primary h-[400] text-[var(--foreground)] w-[full-20px] mx-[10px] p-[20px]">
        <h1 className="text-2xl font-bold text-center">{t.loginAccount}</h1>
        <form onSubmit={handleSignIn} className="w-[300px]">
          <div>
            <label 
              htmlFor="email"
              className="block text-sm font-medium" 
            >
              {t.email}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input w-[93%] my-[10px]"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium"
            >
              {t.password}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input w-[93%] bg-pink my-[10px]"
            />
          </div>
          <div className='flex justify-center items-center my-[10px]'>
            <button
              type="submit"
              className="btn btn-wide"
            >
              {t.login}
            </button>
          </div>
          <div className="text-center mt-4 my-[10px]">
            <Link href="/forgot-password" 
              className="text-sm hover:underline text-[var(--foreground)]"
            >
              {t.forgetPassword}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}