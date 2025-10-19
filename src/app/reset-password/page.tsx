// src/app/reset-password/page.tsx (已修复版)
'use client';

import { useFormState } from 'react-dom';
import { resetPassword } from '@/lib/actions';

export default function ResetPasswordPage() {
  // 保持 useFormState 的初始状态不变
  const [state, formAction] = useFormState(resetPassword, { success: false, message: '' });

  return (
    <div className="flex justify-center items-center h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg border border-border shadow-md">
        <h1 className="text-2xl font-bold text-center text-card-foreground">输入您的新密码</h1>
        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-card-foreground/80">新密码</label>
            <input
              id="password" name="password" type="password" required minLength={6}
              className="w-full px-3 py-2 mt-1 text-foreground bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button type="submit" className="w-full px-4 py-2 font-semibold text-primary-foreground bg-primary rounded-md hover:bg-primary/90">
            重置密码
          </button>
        </form>
        {/* 【核心修复】: 使用可选链 ?. 来安全地访问 message */}
        {state?.message && (
          <p className={`text-center text-sm ${state.success ? 'text-green-400' : 'text-red-400'}`}>
            {state.message}
          </p>
        )}
      </div>
    </div>
  );
}