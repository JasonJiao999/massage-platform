// src/app/forgot-password/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

// 静态翻译字典
const translations = {
  en: {
    resetPassword: 'Reset password',
    resetInstructions: 'Please enter your email address and we will send you a link to reset your password.',
    email: 'Email',
    send: 'Send',
    resetFailed: 'Reset failed: ',
    resetEmailSent: 'A password reset email has been sent. Please check your inbox.',
    returnToLogin: 'Return to Login'
  },
  th: {
    resetPassword: 'รีเซ็ตรหัสผ่าน',
    resetInstructions: 'กรุณากรอกอีเมลของคุณ และเราจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านให้คุณ',
    email: 'อีเมล',
    send: 'ส่ง',
    resetFailed: 'การรีเซ็ตล้มเหลว: ',
    resetEmailSent: 'ส่งอีเมลรีเซ็ตรหัสผ่านแล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ',
    returnToLogin: 'กลับไปที่หน้าเข้าสู่ระบบ'
  },
  'zh-TW': {
    resetPassword: '重設密碼',
    resetInstructions: '請輸入您的電子郵件地址，我們將向您發送重設密碼的連結。',
    email: '電子郵件',
    send: '發送',
    resetFailed: '重設失敗: ',
    resetEmailSent: '已發送密碼重設電子郵件。請檢查您的收件匣。',
    returnToLogin: '返回登入頁面'
  }
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('en');
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

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const t = translations[currentLanguage as keyof typeof translations];

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(t.resetFailed + error.message);
    } else {
      setMessage(t.resetEmailSent);
    }
  };

  const t = translations[currentLanguage as keyof typeof translations];

  return (
    <div className="flex justify-center items-center h-[500px]">
      <div className="card w-[350px] shadow-sm bg-[var(--color-third)] items-center text-[var(--foreground)] p-[24px]">
        <h1 className="text-2xl font-bold text-center ">{t.resetPassword}</h1>
        <p className="text-left text-sm ">
          {t.resetInstructions}
        </p>
        <form onSubmit={handlePasswordReset} className="gap-[10px] ">
          <div className="flex flex-col justify-center  gap-[15px]">
            <label htmlFor="email" className="block text-sm font-medium ">{t.email}</label>
            <input
              id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="input w-[230px] text-[var(--foreground)]"
            />
          
          <button type="submit" className="btn btn-wide mx-auto">
            {t.send}
          </button>
          </div>
        </form>
        {message && <p className="text-green-400 text-center text-sm">{message}</p>}
        {error && <p className="text-red-400 text-center text-sm">{error}</p>}
        <div className="text-center mt-[10px]">
          <Link href="/login" className="text-sm text-gray-400 hover:underline">{t.returnToLogin}</Link>
        </div>
      </div>
    </div>
  );
}