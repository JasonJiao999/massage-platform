// src/components/AdminShopEditForm.tsx
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { updateShopByAdmin } from '@/lib/actions';

const initialState = { message: '' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="inline-flex justify-center rounded-md border bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700">
      {pending ? 'Saving...' : 'Save Changes'}
    </button>
  );
}

export default function AdminShopEditForm({ shop }: { shop: any }) {
  const [state, formAction] = useFormState(updateShopByAdmin, initialState);

  return (
    <form action={formAction} className="space-y-6 max-w-2xl text-black">
      <input type="hidden" name="shopId" value={shop.id} />

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-white">Shop Name</label>
        <input type="text" id="name" name="name" defaultValue={shop.name} required className="mt-1 block w-full rounded-md"/>
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-white">Shop Slug</label>
        <input type="text" id="slug" name="slug" defaultValue={shop.slug} required className="mt-1 block w-full rounded-md"/>
      </div>

      <div>
        <label htmlFor="badges" className="block text-sm font-medium text-white">Admin Badges (comma-separated)</label>
        <input type="text" id="badges" name="badges" defaultValue={shop.badges?.join(', ') || ''} className="mt-1 block w-full rounded-md"/>
      </div>

      <div className="flex items-center">
        <input id="is_active" name="is_active" type="checkbox" defaultChecked={shop.is_active} className="h-4 w-4 rounded"/>
        <label htmlFor="is_active" className="ml-2 block text-sm text-white">Is Active</label>
      </div>

      <SubmitButton />
      {state?.message && <p className="mt-2 text-sm text-green-400">{state.message}</p>}
    </form>
  );
}