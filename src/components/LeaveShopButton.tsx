// src/components/LeaveShopButton.tsx (替换整个文件内容)

'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { leaveShop } from '@/lib/actions';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const initialState = { message: '', success: false };

function ButtonContent() {
    const { pending } = useFormStatus();
    return <>{pending ? 'Leaving...' : 'End of partnership'}</>;
}

export function LeaveShopButton() {
  const [state, dispatch] = useFormState(leaveShop, initialState);
  const router = useRouter();

  // 使用 useEffect 监听状态变化，如果成功则刷新页面
  useEffect(() => {
    if (state.success) {
      // 也可以用 router.push('/some-other-page') 跳转到其他页面
      router.refresh(); 
    }
  }, [state, router]);

  return (
    <div>
      <form 
        action={(formData) => {
          const confirmed = window.confirm(
            'Do you want to end the partnership? After that, you will become a freelance worker.'
          );
          if (confirmed) {
            dispatch(formData);
          }
        }}
      >
        <button 
          type="submit" 
          className="btn"
        >
          <ButtonContent />
        </button>
      </form>

      {/* 显示成功或错误消息 */}
      {state?.message && (
        <p className={`mt-4 text-sm ${state.success ? 'text-green-600' : 'text-red-600'}`}>
          {state.message}
        </p>
      )}
    </div>
  );
}