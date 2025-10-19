// src/components/CustomerProfileForm.tsx
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { updateCustomerProfile } from '@/lib/actions';
import Image from 'next/image';

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null; // 确保类型定义中包含 bio
};

function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex justify-center rounded-md border border-transparent bg-primary py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary/90 disabled:bg-gray-400"
    >
      {pending ? '保存中...' : text}
    </button>
  );
}

export default function CustomerProfileForm({ profile }: { profile: Profile }) {
  const [updateState, updateAction] = useFormState(updateCustomerProfile, {
    success: false,
    message: '',
  });

  return (
    <div className="space-y-10">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">您的头像</h3>
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24 rounded-full overflow-hidden">
            <Image
              src={'/default-avatar.png'}
              alt="Default avatar"
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
           <p className="text-sm text-gray-400">所有用户均使用默认头像。</p>
        </div>
      </div>

      <form action={updateAction} className="space-y-6">
        <h3 className="text-lg font-semibold text-white">基础信息</h3>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">
            邮箱地址 (不可修改)
          </label>
          <div className="mt-1">
            <input type="email" name="email" id="email" defaultValue={profile.email || ''} disabled className="block w-full rounded-md border-gray-600 bg-gray-700 text-gray-400 shadow-sm sm:text-sm" />
          </div>
        </div>

        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-white">
            姓名
          </label>
          <div className="mt-1">
            <input type="text" name="full_name" id="full_name" defaultValue={profile.full_name || ''} required className="block w-full rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
          </div>
        </div>
        
        {/* 【核心修改】: 添加联系方式/Bio的输入框 */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-white">
            联系方式 (手机号, LINE ID等)
          </label>
          <div className="mt-1">
            <textarea
              name="bio"
              id="bio"
              rows={3}
              defaultValue={profile.bio || ''}
              className="block w-full rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              placeholder="请留下您的联系方式，方便技师与您确认预约信息"
            />
          </div>
        </div>
        
        <SubmitButton text="保存更改" />
        {updateState?.message && (
          <p className={`mt-2 text-sm ${updateState.success ? 'text-green-400' : 'text-red-400'}`}>
            {updateState.message}
          </p>
        )}
      </form>
    </div>
  );
}