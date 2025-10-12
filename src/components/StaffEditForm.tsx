// src/components/StaffEditForm.tsx
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { updateStaffMember } from '@/lib/actions';
import ImageUploader from './ImageUploader'; // 1. 导入 ImageUploader 组件
import VideoUploader from './VideoUploader';

// 2. 更新 StaffMember 类型，加入 photo_urls
type StaffMember = {
  id: string;
  nickname: string;
  level: string | null;
  bio: string | null;
  years: number | null;
  feature: string[] | null;
  tags: string[] | null;
  is_active: boolean;
  photo_urls: string[] | null; 
  video_urls: string[] | null; 
};

const initialState = { message: '' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:bg-gray-400"
    >
      {pending ? '正在保存...' : '保存更改'}
    </button>
  );
}

export default function StaffEditForm({ staff }: { staff: StaffMember }) {
  const [state, formAction] = useFormState(updateStaffMember, initialState);
  
  return (
    // 3. 使用 React Fragment (<>) 来包裹两个并列的组件
    <>
      {/* 这是我们已有的主信息编辑表单 */}
      <form action={formAction} className="space-y-6 max-w-2xl text-black">
        <input type="hidden" name="staffId" value={staff.id} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-white">员工昵称</label>
              <input type="text" id="nickname" name="nickname" defaultValue={staff.nickname} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"/>
            </div>
            <div>
              <label htmlFor="level" className="block text-sm font-medium text-white">员工等级</label>
              <input type="text" id="level" name="level" defaultValue={staff.level || ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"/>
            </div>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-white">个人简介</label>
            <textarea id="bio" name="bio" rows={4} defaultValue={staff.bio || ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"></textarea>
          </div>
          
          <div>
            <label htmlFor="years" className="block text-sm font-medium text-white">年龄</label>
            <input type="number" id="years" name="years" defaultValue={staff.years || undefined} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"/>
          </div>

          <div>
            <label htmlFor="feature" className="block text-sm font-medium text-white">擅长特色 (用逗号分隔)</label>
            <input type="text" id="feature" name="feature" defaultValue={staff.feature?.join(', ') || ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"/>
          </div>
          
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-white">员工标签 (用逗号分隔)</label>
            <input type="text" id="tags" name="tags" defaultValue={staff.tags?.join(', ') || ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"/>
          </div>

          <div className="flex items-center">
            <input id="is_active" name="is_active" type="checkbox" defaultChecked={staff.is_active} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/>
            <label htmlFor="is_active" className="ml-2 block text-sm text-white">启用该员工 (Active)</label>
          </div>

        <SubmitButton />

        {state?.message && (
          <p className={`mt-4 text-sm ${state.message.includes('失败') ? 'text-red-400' : 'text-green-400'}`}>
            {state.message}
          </p>
        )}
      </form>

      {/* 4. 在主表单下方，添加我们的图片上传器 */}
      <div className="mt-8 border-t border-border pt-8">
        <ImageUploader staffId={staff.id} photoUrls={staff.photo_urls} />
      </div>
      {/* 5 在下方添加我们的视频上传器 */}
      <div className="mt-8 border-t border-border pt-8">
        <VideoUploader staffId={staff.id} videoUrls={staff.video_urls} />
      </div>
    </>
  );
}