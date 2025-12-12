// src/app/register/page.tsx (最终修复版，支持 Merchant 注册并带店铺名称)
"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// 静态翻译字典
const translations = {
  en: {
    createAccount: 'Create Account',
    selectCharacter: 'Select character',
    customer: 'Customer',
    freeman: 'Freeman',
    merchant: 'Merchant',
    shopName: 'Shop Name',
    email: 'Email',
    password: 'Password',
    referralCode: 'Referral Code (Optional)',
    agreeToTerms: 'I agree to the',
    userAgreement: 'User Agreement',
    register: 'Register',
    registering: 'Registering...',
    mustAgree: 'You must agree to the User Agreement to create an account.',
    enterShopName: 'Please enter your shop name.',
    registrationFailed: 'Registration failed: ',
    registrationSuccessful: 'Registration successful! Please check your email to complete the verification.',
    registrationInitiated: 'Registration initiated. Check your email for verification.'
  },
  th: {
    createAccount: 'สร้างบัญชี',
    selectCharacter: 'เลือกบทบาท',
    customer: 'ลูกค้า',
    freeman: 'พนักงานอิสระ',
    merchant: 'ผู้ประกอบการ',
    shopName: 'ชื่อร้านค้า',
    email: 'อีเมล',
    password: 'รหัสผ่าน',
    referralCode: 'รหัสอ้างอิง (ถ้ามี)',
    agreeToTerms: 'ฉันยอมรับ',
    userAgreement: 'ข้อตกลงผู้ใช้',
    register: 'ลงทะเบียน',
    registering: 'กำลังลงทะเบียน...',
    mustAgree: 'คุณต้องยอมรับข้อตกลงผู้ใช้เพื่อสร้างบัญชี',
    enterShopName: 'กรุณากรอกชื่อร้านค้า',
    registrationFailed: 'การลงทะเบียนล้มเหลว: ',
    registrationSuccessful: 'ลงทะเบียนสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันการลงทะเบียน',
    registrationInitiated: 'เริ่มต้นการลงทะเบียนแล้ว กรุณาตรวจสอบอีเมลเพื่อยืนยัน'
  },
  'zh-TW': {
    createAccount: '建立帳號',
    selectCharacter: '選擇角色',
    customer: '客戶',
    freeman: '自由工作者',
    merchant: '商家',
    shopName: '商店名稱',
    email: '電子郵件',
    password: '密碼',
    referralCode: '推薦碼 (選填)',
    agreeToTerms: '我同意',
    userAgreement: '使用者協議',
    register: '註冊',
    registering: '註冊中...',
    mustAgree: '您必須同意使用者協議才能建立帳號',
    enterShopName: '請輸入商店名稱',
    registrationFailed: '註冊失敗: ',
    registrationSuccessful: '註冊成功！請檢查您的電子郵件以完成驗證',
    registrationInitiated: '註冊已開始。請檢查您的電子郵件以進行驗證'
  }
};

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [shopName, setShopName] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const router = useRouter();
  const supabase = createClient();
  const [referralCode, setReferralCode] = useState('');
  const searchParams = useSearchParams();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
    }
  }, [searchParams]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const t = translations[currentLanguage as keyof typeof translations];

    if (!agreedToTerms) {
      setMessage(t.mustAgree);
      setLoading(false);
      return;
    }

    if (role === 'merchant' && !shopName.trim()) {
      setMessage(t.enterShopName);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: role,
          referral_code: referralCode,
          shop_name_on_signup: role === 'merchant' ? shopName : null, 
        },
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      }
    });

    if (error) {
      setMessage(t.registrationFailed + error.message);
    } else if (data.user) {
      setMessage(t.registrationSuccessful);
      router.push('/login');
    } else {
      setMessage(t.registrationInitiated);
      router.push('/login');
    }
    setLoading(false);
  };

  const t = translations[currentLanguage as keyof typeof translations];

  return (
    <div className="flex justify-center">
      <div className="card shadow-sm bg-[var(--color-third)] h-auto text-[var(--color-secondary)] w-[full-20px] mx-[10px] p-[20px]">
        <h1 className="text-2xl font-bold text-center text-card-foreground">{t.createAccount}</h1>
        <form onSubmit={handleSignUp} className='w-[300px]'>
          <div>
            <label htmlFor="role" className="block text-sm font-medium ">
              {t.selectCharacter}
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                if (e.target.value !== 'merchant') {
                  setShopName('');
                }
              }}
              required
              className="select text-[var(--foreground)] w-[93%] my-[10px] "
            >
              <option value="customer">{t.customer}</option>
              <option value="freeman">{t.freeman}</option>
              <option value="merchant">{t.merchant}</option>
            </select>
          </div>
          
          {role === 'merchant' && (
            <div>
              <label htmlFor="shopName" className="block text-sm font-medium text-card-foreground/80">
                {t.shopName}
              </label>
              <input
                id="shopName"
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                required
                className="input w-[93%] my-[10px] "
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-card-foreground/80">
              {t.email}
            </label>
            <input
              id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="input w-[93%] my-[10px] "
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-card-foreground/80">
              {t.password}
            </label>
            <input
              id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="input w-[93%] my-[10px] "
            />
          </div>
          <div>
            <label htmlFor="referral_code" className="block text-sm font-medium text-card-foreground/80">
              {t.referralCode}
            </label>
            <input
              id="referral_code"
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              className="input w-[93%] my-[10px] "
            />
          </div>
          <div className="flex items-center space-x-2 my-[10px]">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="checkbox border m-[10px]"
            />
            <label htmlFor="terms" className="text-sm">
              {t.agreeToTerms}{' '}
              <Link href="/terms" target="_blank" className="underline hover:text-blue-400">
                {t.userAgreement}
              </Link>
            </label>
          </div>

          <div className='flex justify-center items-center my-[10px]'>
            <button
              type="submit"
              className="btn btn-wide"
              disabled={!agreedToTerms || loading}
            >
              {loading ? t.registering : t.register}
            </button>
          </div>
          {message && <p className="text-sm text-red-500 text-center mt-2">{message}</p>}
        </form>
      </div>
    </div>
  );
}