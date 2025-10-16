// src/components/JoinShopForm.tsx (请创建此文件)

'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { joinShopByMerchantEmail } from '@/lib/actions';

const initialState = { message: '', success: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="...">
      {pending ? '正在加入...' : '加入店铺'}
    </button>
  );
}

export function JoinShopForm() {
  const [state, dispatch] = useFormState(joinShopByMerchantEmail, initialState);

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center">通过商户邮箱加入店铺</h2>
      <form action={dispatch}>
        <div>
          <label htmlFor="merchant_email" className="block text-sm font-medium">
            商户的邮箱地址
          </label>
          <input
            id="merchant_email"
            name="merchant_email"
            type="email"
            required
            className="mt-1 block w-full px-3 py-2 border rounded-md"
            placeholder="merchant@example.com"
          />
        </div>
        <SubmitButton />
        {state?.message && (
          <p className={`mt-4 text-sm text-center ${state.success ? 'text-green-600' : 'text-red-600'}`}>
            {state.message}
          </p>
        )}
      </form>
    </div>
  );
}