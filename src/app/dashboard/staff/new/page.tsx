// src/app/dashboard/staff/new/page.tsx
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { inviteStaffMembers } from '@/lib/actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:bg-gray-400"
    >
      {pending ? 'Sending...' : 'Send Invitations'}
    </button>
  );
}

export default function NewStaffPage() {
  const initialState = { message: '' };
  const [state, formAction] = useFormState(inviteStaffMembers, initialState);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Invite New Staff</h1>

      <form action={formAction} className="space-y-6 max-w-lg">
        <div>
          <label htmlFor="emails" className="block text-sm font-medium text-white">
            Staff Email Addresses
          </label>
          <textarea
            id="emails"
            name="emails"
            rows={5}
            required
            placeholder="You can enter multiple emails, separated by commas or new lines."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm text-black"
          />
           <p className="mt-2 text-xs text-gray-400">An invitation record will be created for each email address.</p>
        </div>

        <SubmitButton />

        {/* 显示服务器返回的处理结果 */}
        {state?.message && (
            <p className={`mt-4 text-sm ${state.message.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
            {state.message}
            </p>
        )}
      </form>
    </div>
  );
}