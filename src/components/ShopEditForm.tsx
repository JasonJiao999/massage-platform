// src/components/ShopEditForm.tsx
'use client';

import { 
  updateShopTextSettings, 
  uploadShopImage,
  uploadShopVideo,
  deleteShopVideo 
} from '@/lib/actions';
import { useFormState, useFormStatus } from 'react-dom';
import { useRef } from 'react';


type ShopSettings = {
  shop_id: string;
  name: string;
  slug: string;
  description: string;
  phone_number: string;
  tags: string[];
  social_links: { [key: string]: string; };
  theme: { primary_color: string | null; background_color: string | null; } | null;
  bg_image_url?: string | null;
  hero_image_url?: string | null;
  featured_video_url?: string | null;
};

// --- 通用的提交/状态管理组件 ---
function SubmitButton({ text, pendingText = 'Saving...' }: { text: string, pendingText?: string }) {
    const { pending } = useFormStatus();
    return <button type="submit" disabled={pending} className="btn my-[10px] mx-auto">{pending ? pendingText : text}</button>;
}

function DeleteVideoButton() {
    const { pending } = useFormStatus();
    return <button type="submit" disabled={pending} className="btn">{pending ? 'Deleting...' : 'Delete current video'}</button>;
}

function FormStateMessage({ state }: { state: { message: string } | null }) {
    if (!state?.message) return null;
    const isError = state.message.includes('Fail') || state.message.includes('Error');
    return <p className={`mt-2 text-sm ${isError ? 'text-red-400' : 'text-green-400'}`}>{state.message}</p>;
}


export default function ShopEditForm({ settings }: { settings: ShopSettings }) {
  const [textState, textAction] = useFormState(updateShopTextSettings, { message: '' });
  const [bgImageState, bgImageAction] = useFormState(uploadShopImage, { message: '' });
  const [heroImageState, heroImageAction] = useFormState(uploadShopImage, { message: '' });
  const [videoState, videoAction] = useFormState(uploadShopVideo, { message: '' });
  const [deleteState, deleteAction] = useFormState(deleteShopVideo, { message: '' });
  
  // 使用 ref 来在提交后清空文件输入框
  const bgInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);


  return (
    <div className="card bg-primary p-[24px]">
      {/* --- 基础信息表单 --- */}
      <form action={textAction} className="p-6 bg-card   space-y-4">
        <h3 className="text-lg font-semibold text-white">Basic Information</h3>
        <input type="hidden" name="shop_id" value={settings.shop_id} />
        <div className="space-y-[10px] text-black">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white">Team Name</label>
            <input type="text" id="name" name="name" defaultValue={settings.name} required className="input w-[95%] my-[10px]"/>
          </div>
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-white">Team Slug</label>
            <input type="text" id="slug" name="slug" defaultValue={settings.slug} required className="input w-[95%] my-[10px]"/>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-white">Team Introduction</label>
            <textarea id="description" name="description" rows={4} defaultValue={settings.description} className="textarea w-[95%] my-[10px]"></textarea>
          </div>
          <div>
            <label htmlFor="phone_number" className="block text-sm font-medium text-white">TEL</label>
            <input type="tel" id="phone_number" name="phone_number" defaultValue={settings.phone_number} className="input w-[95%] my-[10px]"/>
          </div>
        </div>
        <SubmitButton text="Save" />
        <FormStateMessage state={textState} />
      </form>

      {/* --- 专属页面内容 --- */}
      <div className="p-6 bg-card rounded-lg space-y-8">
        <h3 className="text-lg font-semibold text-white">Team Page</h3>

        {/* 背景图表单 */}
        <form action={bgImageAction} className="space-y-2 border-b-2 py-[10px]" onSubmit={() => setTimeout(() => bgInputRef.current?.form?.reset(), 100)}>
            <input type="hidden" name="shop_id" value={settings.shop_id} />
            {/* 关键修改 (1): 告诉后台要更新哪个字段 */}
            <input type="hidden" name="image_type" value="bg_image_url" />
            <label htmlFor="background_image" className="block text-sm font-medium text-white">Team photos</label>
            {settings.bg_image_url && <img src={settings.bg_image_url} alt="Current background" className="card w-[100%] h-auto rounded-md mx-auto my-[10px]" />}
            {/* 关键修改 (2): 文件本身的 name 改为 'image_file' */}
            <input ref={bgInputRef} type="file" id="background_image" name="image_file" accept="image/*" required className="mt-2 block text-sm text-gray-300"/>
            <p className="text-xs text-gray-400 mt-1">Uploading a new image will replace the existing photo.</p>
            <SubmitButton text="Upload Team Photos" pendingText="Uploading..." />
            <FormStateMessage state={bgImageState} />
        </form>

        {/* 广告横幅表单 */}
        <form action={heroImageAction} className="space-y-2 border-b-2 py-[10px]" onSubmit={() => setTimeout(() => heroInputRef.current?.form?.reset(), 100)}>
            <input type="hidden" name="shop_id" value={settings.shop_id} />
            {/* 关键修改 (1): 告诉后台要更新哪个字段 */}
            <input type="hidden" name="image_type" value="hero_image_url" />
            <label htmlFor="hero_image" className="block text-sm font-medium text-white">Banner</label>
            {settings.hero_image_url && <img src={settings.hero_image_url} alt="Current hero banner" className="card w-[100%] h-auto rounded-md my-[10px]" />}
            {/* 关键修改 (2): 文件本身的 name 改为 'image_file' */}
            <input ref={heroInputRef} type="file" id="hero_image" name="image_file" accept="image/*" required className="mt-2 block w-full text-sm text-gray-300"/>
            <p className="text-xs text-gray-400 mt-1">Uploading a new image will replace the existing banner.</p>
            <SubmitButton text="Upload banner" pendingText="Uploading..." />
            <FormStateMessage state={heroImageState} />
        </form>

        {/* 特色视频管理 */}
        <div className="space-y-2 py-[10px]">
            <label className="block text-sm font-medium text-white">Team Video</label>
            {settings.featured_video_url ? (
                <div className="space-y-2">
                    <video src={settings.featured_video_url} controls className="card w-[400px] rounded-md my-[10px]" />
                    <form action={deleteAction}>
                        <input type="hidden" name="shop_id" value={settings.shop_id} />
                        <DeleteVideoButton />
                        <FormStateMessage state={deleteState} />
                    </form>
                </div>
            ) : (
                <form action={videoAction} className="space-y-2" onSubmit={() => setTimeout(() => videoInputRef.current?.form?.reset(), 100)}>
                     <input type="hidden" name="shop_id" value={settings.shop_id} />
                    <label htmlFor="featured_video" className="block text-sm font-medium text-white">Upload a new video (limited to 1, under 50MB)</label>
                    <input ref={videoInputRef} type="file" id="featured_video" name="featured_video" accept="video/mp4,video/webm" required className="mt-2 block  text-sm text-gray-300"/>
                    <SubmitButton text="Upload video" pendingText="Uploading..." />
                    <FormStateMessage state={videoState} />
                </form>
            )}
        </div>
      </div>
    </div>
  );
}