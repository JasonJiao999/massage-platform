// src/components/JoinShopForm.tsx (请创建此文件)

'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { joinShopByMerchantEmail } from '@/lib/actions';

const initialState = { message: '', success: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn">
      {pending ? 'Waiting...' : 'Join the team'}
    </button>
  );
}

export function JoinShopForm() {
  const [state, dispatch] = useFormState(joinShopByMerchantEmail, initialState);

  return (
    <div className=" card p-[24px] mx-auto  max-w-[1200px]">
    <div className="rounded-lg shadow mx-[10px] text-center">
      <h2 className="text-2xl font-bold text-center">Join the team(ร่วมทีมกับเรา)</h2>
      <form action={dispatch}>
        <div>
          <label htmlFor="merchant_email" className="block text-sm font-medium">
            Team email (อีเมลของทีม)
          </label>
          <input
            id="merchant_email"
            name="merchant_email"
            type="email"
            required
            className="input my-[10px]"
            placeholder="team@example.com"
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
    </div>
  );
}