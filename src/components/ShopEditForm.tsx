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
function SubmitButton({ text, pendingText = '保存中...' }: { text: string, pendingText?: string }) {
    const { pending } = useFormStatus();
    return <button type="submit" disabled={pending} className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:bg-gray-400">{pending ? pendingText : text}</button>;
}

function DeleteVideoButton() {
    const { pending } = useFormStatus();
    return <button type="submit" disabled={pending} className="text-xs font-medium text-red-500 hover:underline disabled:text-gray-400">{pending ? '删除中...' : '删除当前视频'}</button>;
}

function FormStateMessage({ state }: { state: { message: string } | null }) {
    if (!state?.message) return null;
    const isError = state.message.includes('失败') || state.message.includes('错误');
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
    <div className="space-y-8 max-w-2xl">
      {/* --- 基础信息表单 --- */}
      <form action={textAction} className="p-6 bg-card rounded-lg border border-border space-y-4">
        <h3 className="text-lg font-semibold text-white">基础信息</h3>
        <input type="hidden" name="shop_id" value={settings.shop_id} />
        <div className="space-y-4 text-black">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white">店铺名称</label>
            <input type="text" id="name" name="name" defaultValue={settings.name} required className="mt-1 block w-full rounded-md"/>
          </div>
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-white">店铺网址 (Slug)</label>
            <input type="text" id="slug" name="slug" defaultValue={settings.slug} required className="mt-1 block w-full rounded-md"/>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-white">店铺简介</label>
            <textarea id="description" name="description" rows={4} defaultValue={settings.description} className="mt-1 block w-full rounded-md"></textarea>
          </div>
          <div>
            <label htmlFor="phone_number" className="block text-sm font-medium text-white">联系电话</label>
            <input type="tel" id="phone_number" name="phone_number" defaultValue={settings.phone_number} className="mt-1 block w-full rounded-md"/>
          </div>
        </div>
        <SubmitButton text="保存基础信息" />
        <FormStateMessage state={textState} />
      </form>

      {/* --- 专属页面内容 --- */}
      <div className="p-6 bg-card rounded-lg border border-border space-y-8">
        <h3 className="text-lg font-semibold text-white">专属页面内容</h3>

        {/* 背景图表单 */}
        <form action={bgImageAction} className="space-y-2" onSubmit={() => setTimeout(() => bgInputRef.current?.form?.reset(), 100)}>
            <input type="hidden" name="shop_id" value={settings.shop_id} />
            {/* 关键修改 (1): 告诉后台要更新哪个字段 */}
            <input type="hidden" name="image_type" value="bg_image_url" />
            <label htmlFor="background_image" className="block text-sm font-medium text-white">背景图</label>
            {settings.bg_image_url && <img src={settings.bg_image_url} alt="Current background" className="mt-2 w-48 h-auto rounded-md" />}
            {/* 关键修改 (2): 文件本身的 name 改为 'image_file' */}
            <input ref={bgInputRef} type="file" id="background_image" name="image_file" accept="image/*" required className="mt-2 block w-full text-sm text-gray-300"/>
            <p className="text-xs text-gray-400 mt-1">上传新图片将会替换现有背景。</p>
            <SubmitButton text="上传背景图" pendingText="上传中..." />
            <FormStateMessage state={bgImageState} />
        </form>

        {/* 广告横幅表单 */}
        <form action={heroImageAction} className="space-y-2" onSubmit={() => setTimeout(() => heroInputRef.current?.form?.reset(), 100)}>
            <input type="hidden" name="shop_id" value={settings.shop_id} />
            {/* 关键修改 (1): 告诉后台要更新哪个字段 */}
            <input type="hidden" name="image_type" value="hero_image_url" />
            <label htmlFor="hero_image" className="block text-sm font-medium text-white">广告横幅</label>
            {settings.hero_image_url && <img src={settings.hero_image_url} alt="Current hero banner" className="mt-2 w-full h-auto rounded-md" />}
            {/* 关键修改 (2): 文件本身的 name 改为 'image_file' */}
            <input ref={heroInputRef} type="file" id="hero_image" name="image_file" accept="image/*" required className="mt-2 block w-full text-sm text-gray-300"/>
            <p className="text-xs text-gray-400 mt-1">上传新图片将会替换现有横幅。</p>
            <SubmitButton text="上传广告横幅" pendingText="上传中..." />
            <FormStateMessage state={heroImageState} />
        </form>

        {/* 特色视频管理 */}
        <div className="space-y-2">
            <label className="block text-sm font-medium text-white">特色视频</label>
            {settings.featured_video_url ? (
                <div className="space-y-2">
                    <video src={settings.featured_video_url} controls className="w-full rounded-md" />
                    <form action={deleteAction}>
                        <input type="hidden" name="shop_id" value={settings.shop_id} />
                        <DeleteVideoButton />
                        <FormStateMessage state={deleteState} />
                    </form>
                </div>
            ) : (
                <form action={videoAction} className="space-y-2" onSubmit={() => setTimeout(() => videoInputRef.current?.form?.reset(), 100)}>
                     <input type="hidden" name="shop_id" value={settings.shop_id} />
                    <label htmlFor="featured_video" className="block text-sm font-medium text-white">上传新视频 (限1个, 50MB以内)</label>
                    <input ref={videoInputRef} type="file" id="featured_video" name="featured_video" accept="video/mp4,video/webm" required className="mt-2 block w-full text-sm text-gray-300"/>
                    <SubmitButton text="上传视频" pendingText="上传中..." />
                    <FormStateMessage state={videoState} />
                </form>
            )}
        </div>
      </div>
    </div>
  );
}