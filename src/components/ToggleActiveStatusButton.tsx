// src/components/ToggleActiveStatusButton.tsx
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { toggleMyActiveStatus } from '@/lib/actions';

function ButtonContent({ isActive }: { isActive: boolean }) {
    const { pending } = useFormStatus();

    if (pending) {
        return <>正在更新...</>;
    }
    
    return isActive ? <>切换为休息状态</> : <>切换为工作状态</>;
}

export default function ToggleActiveStatusButton({ isActive }: { isActive: boolean }) {
  const [state, formAction] = useFormState(toggleMyActiveStatus, { success: false, message: '' });

  // 根据当前状态决定按钮的样式
  const buttonClass = isActive
    ? "bg-yellow-500 hover:bg-yellow-600 text-white"
    : "bg-green-500 hover:bg-green-600 text-white";

  return (
    <div>
      <form action={formAction.bind(null, isActive)}>
        <button type="submit" className={`font-bold py-2 px-4 rounded-md transition-colors disabled:bg-gray-400 ${buttonClass}`}>
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