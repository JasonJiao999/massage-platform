// src/components/CustomerProfileForm.tsx
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { updateCustomerProfile } from '@/lib/actions';
import Image from 'next/image';

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  bio: string | null; // 确保类型定义中包含 bio
};

function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn"
    >
      {pending ? 'Saving...' : text}
    </button>
  );
}

export default function CustomerProfileForm({ profile }: { profile: Profile }) {
  const [updateState, updateAction] = useFormState(updateCustomerProfile, {
    success: false,
    message: '',
  });

  return (
    <div className="card bg-primary p-[24px] text-[var(--foreground)]">
      

      <form action={updateAction} className="space-y-6">
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">
            Email address (cannot be modified)
          </label>
          <div className="mt-1">
            <input type="email" name="email" id="email" defaultValue={profile.email || ''} disabled className="block w-[95%] my-[10px] rounded-md border-gray-600 bg-gray-700 text-gray-400 shadow-sm sm:text-sm input" />
          </div>
        </div>

        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-white">
            Name
          </label>
          <div className="mt-1">
            <input type="text" name="full_name" id="full_name" defaultValue={profile.full_name || ''} required className="input w-[95%] my-[10px]" />
          </div>
        </div>
        
        {/* 【核心修改】: 添加联系方式/Bio的输入框 */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-white">
            Contact information (phone number, LINE ID, etc.)
          </label>
          <div className="mt-1">
            <textarea
              name="bio"
              id="bio"
              rows={10}
              defaultValue={profile.bio || ''}
              className="textarea block w-[95%] my-[10px] rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              placeholder="Please leave your contact information so that our staff can confirm your appointment details.Please leave your contact information so that our staff can confirm your appointment details."
            />
          </div>
        </div>
        
        <SubmitButton text="Save" />
        {updateState?.message && (
          <p className={`mt-2 text-sm ${updateState.success ? 'text-green-400' : 'text-red-400'}`}>
            {updateState.message}
          </p>
        )}
      </form>
    </div>
  );
}