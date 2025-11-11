// src/app/register/page.tsx (最终修复版)
"use client";

import { useState,useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link'; // <-- 導入 Link 組件

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const router = useRouter();
  const supabase = createClient();
  const [referralCode, setReferralCode] = useState('');
  const searchParams = useSearchParams();

// 3. (新增) 使用 useEffect 在組件加載時讀取推薦碼
  useEffect(() => {
    // 我們將推薦碼參數命名為 'ref'
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode); // 將 URL 中的推薦碼設置到 state 中
    }
  }, [searchParams]); // 依賴 searchParams

// --- (新增) 用於管理複選框的 State ---
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
// --- (新增) 檢查是否同意條款 ---
    if (!agreedToTerms) {
      alert('You must agree to the User Agreement to create an account.');
      return;
    }
    // 并将用户选择的角色放在 options.data (即 raw_user_meta_data) 中
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: role,
          referral_code: referralCode,
        }
      }
    });

    if (error) {
      alert('Registration failed: ' + error.message);
    } else {
      alert('Registration successful! Please check your email to complete the verification.');
      router.push('/login');
    }
  };

  return (
  
    <div className="flex justify-center items-center h-screen ">
      <div className="card w-[350px] shadow-sm bg-[var(--color-third)] items-center text-[var(--foreground)] p-[24px]">
        <h1 className="text-2xl font-bold text-center text-card-foreground">Create Account</h1>
        <form onSubmit={handleSignUp} className='w-[300px]'>
          <div>
            <label htmlFor="role" className="block text-sm font-medium ">
              Select character
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="select text-[var(--color-secondary)] w-[93%] my-[10px]"
            >
              <option value="customer">Customer</option>
              <option value="freeman">Freeman</option>
              <option value="merchant">Merchant</option>
            </select>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-card-foreground/80">
              Email
            </label>
            <input
              id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="input w-[93%] my-[10px]"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-card-foreground/80">
              Password
            </label>
            <input
              id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="input w-[93%] my-[10px]"
            />
          </div>
          {/* 3. *** 新增的推薦碼輸入框 *** */}
          <div>
            <label htmlFor="referral_code" className="block text-sm font-medium text-card-foreground/80">
              Referral Code (Optional)
            </label>
            <input
              id="referral_code" 
              type="text" 
              value={referralCode} 
              onChange={(e) => setReferralCode(e.target.value)}
              className="input w-[93%] my-[10px]"
            />
          </div>
{/* --- (新增) 同意條款複選框 --- */}
          <div className="flex items-center space-x-2 my-[10px]">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="checkbox border m-[10px]" // 使用 DaisyUI 樣式
            />
            <label htmlFor="terms" className="text-sm">
              I agree to the{' '}
              <Link href="/terms" target="_blank" className="underline hover:text-blue-400">
                User Agreement
              </Link>
            </label>
          </div>
          {/* --- 複選框結束 --- */}


          <div className='flex justify-center items-center my-[10px]'>
{/* --- (修改) 按鈕現在會根據 'agreedToTerms' 狀態來啟用/禁用 --- */}
            <button 
              type="submit" 
              className="btn btn-wide"
              disabled={!agreedToTerms}
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}