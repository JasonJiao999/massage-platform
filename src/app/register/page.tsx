// src/app/register/page.tsx (最终修复版，支持 Merchant 注册并带店铺名称)
"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [shopName, setShopName] = useState(''); // <--- 新增: 商户名称的 state
  const router = useRouter();
  const supabase = createClient();
  const [referralCode, setReferralCode] = useState('');
  const searchParams = useSearchParams();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false); // <--- 新增: 注册加载状态
  const [message, setMessage] = useState(''); // <--- 新增: 注册消息提示

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
    }
  }, [searchParams]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // 开始加载
    setMessage(''); // 清空旧消息

    if (!agreedToTerms) {
      setMessage('You must agree to the User Agreement to create an account.'); // 使用 message 状态
      setLoading(false);
      return;
    }

    // <--- 关键修改: 如果角色是 merchant，检查 shopName 是否填写 --->
    if (role === 'merchant' && !shopName.trim()) {
      setMessage('Please enter your shop name.');
      setLoading(false);
      return;
    }

    // 并将用户选择的角色和店铺名称放在 options.data (即 raw_user_meta_data) 中
    const { data, error } = await supabase.auth.signUp({ // <--- 之前没有接收 data 对象，现在加上
      email,
      password,
      options: {
        data: {
          role: role,
          referral_code: referralCode,
          // <--- 关键修改: 如果是 merchant 角色，将 shopName 传递过去 --->
          shop_name_on_signup: role === 'merchant' ? shopName : null, 
        },
        emailRedirectTo: `${window.location.origin}/auth/confirm`, // 假设这是您的邮箱确认回调 URL
      }
    });

    if (error) {
      setMessage('Registration failed: ' + error.message);
    } else if (data.user) { // <--- 检查 data.user 是否存在
      setMessage('Registration successful! Please check your email to complete the verification.');
      router.push('/login'); // 成功后跳转到登录页
    } else {
      // 这通常发生在 emailRedirectTo 没有正确处理时，或 Confirm email 是 OFF 且用户直接登录
      // 这里的逻辑可能需要根据您的具体认证流程微调
      setMessage('Registration initiated. Check your email for verification.');
      router.push('/login');
    }
    setLoading(false); // 结束加载
  };

  return (
    <div className="flex justify-center">
      <div className="card shadow-sm bg-[var(--color-third)] h-auto text-[var(--color-secondary)] w-[full-20px] mx-[10px] p-[20px]">
        <h1 className="text-2xl font-bold text-center text-card-foreground">Create Account</h1>
        <form onSubmit={handleSignUp} className='w-[300px]'>
          <div>
            <label htmlFor="role" className="block text-sm font-medium ">
              Select character
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                if (e.target.value !== 'merchant') {
                  setShopName(''); // 如果不是 Merchant，清空 Shop Name
                }
              }}
              required
              className="select text-[var(--foreground)] w-[93%] my-[10px] "
            >
              <option value="customer">Customer</option>
              <option value="freeman">Freeman</option>
              <option value="merchant">Merchant</option>
            </select>
          </div>
          {/* <--- 新增: Shop Name 输入框，仅在角色为 'merchant' 时显示 ---> */}
          {role === 'merchant' && (
            <div>
              <label htmlFor="shopName" className="block text-sm font-medium text-card-foreground/80">
                Shop Name
              </label>
              <input
                id="shopName"
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                required // 商户名称为必填
                className="input w-[93%] my-[10px] "
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-card-foreground/80">
              Email
            </label>
            <input
              id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="input w-[93%] my-[10px] "
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-card-foreground/80">
              Password
            </label>
            <input
              id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="input w-[93%] my-[10px] "
            />
          </div>
          <div>
            <label htmlFor="referral_code" className="block text-sm font-medium text-card-foreground/80">
              Referral Code (Optional)
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
              I agree to the{' '}
              <Link href="/terms" target="_blank" className="underline hover:text-blue-400">
                User Agreement
              </Link>
            </label>
          </div>

          <div className='flex justify-center items-center my-[10px]'>
            <button
              type="submit"
              className="btn btn-wide"
              disabled={!agreedToTerms || loading} // <--- 禁用条件增加 loading 状态
            >
              {loading ? 'Registering...' : 'Register'} {/* <--- 按钮文本根据 loading 状态变化 */}
            </button>
          </div>
          {message && <p className="text-sm text-red-500 text-center mt-2">{message}</p>} {/* <--- 显示消息提示 */}
        </form>
      </div>
    </div>
  );
}