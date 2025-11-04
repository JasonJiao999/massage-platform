// src/components/ToggleActiveStatusButton.tsx
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { toggleMyActiveStatus } from '@/lib/actions';

function ButtonContent({ isActive }: { isActive: boolean }) {
    const { pending } = useFormStatus();

    if (pending) {
        return <>Updating...</>;
    }
    
    return isActive ? <>Start Resting</> : <>Start Working</>;
}

export default function ToggleActiveStatusButton({ isActive }: { isActive: boolean }) {
  const [state, formAction] = useFormState(toggleMyActiveStatus, { success: false, message: '' });

  // 根据当前状态决定按钮的样式
  const buttonClass = isActive
    ? "bg-yellow-500 hover:bg-yellow-600 text-white"
    : "bg-green-500 hover:bg-green-600 text-white";

  return (
    <div className='mx-[20px] px-[24px]'>
      <form action={formAction.bind(null, isActive)}>
        <button type="submit" className={`btn ${buttonClass}`}>
          <ButtonContent isActive={isActive} />
        </button>
      </form>
      {state.message && (
        <p className={`mt-2 text-sm ${state.success ? 'text-green-600' : 'text-red-500'}`}>
          {state.message}
        </p>
      )}
    </div>
  );
}