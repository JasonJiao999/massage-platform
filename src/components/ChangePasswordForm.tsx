// src/components/ChangePasswordForm.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client'; // 确保您有客户端 Supabase

export default function ChangePasswordForm() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // 1. 基本验证
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    
    // 2. 初始化客户端 Supabase
    // (因为修改密码是一个 Auth 操作，通常在客户端处理更直接)
    const supabase = createClient();

    // 3. 调用 Supabase Auth 更新用户密码
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setError('Failed to update password: ' + updateError.message);
    } else {
      setMessage('Password updated successfully!');
      // 清空输入框
      setNewPassword('');
      setConfirmPassword('');
    }
    
    setLoading(false);
  };

  return (
    // 您可以自定义卡片样式，使其与 MyProfileForm 协调
    <form onSubmit={handleSubmit} className="card bg-primary p-[20px] text-[var(--foreground)] mx-auto">
      <h2 className="text-xl font-bold text-white mb-4">Change Password</h2>
      <div className="flex flex-col gap-[10px] p-[24px]">
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-foreground/80">
            New Password
          </label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="input w-[80%]" // 使用您项目中的 input 样式
            placeholder="Enter new password"
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground/80">
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="input w-[80%]" // 使用您项目中的 input 样式
            placeholder="Confirm new password"
          />
        </div>
        <button type="submit" className="btn btn-wide" disabled={loading}>
          {loading ? 'Updating...' : 'Update Password'}
        </button>
        
        {/* 显示成功或失败的消息 */}
        {message && <p className="text-green-500 text-sm">{message}</p>}
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </form>
  );
}