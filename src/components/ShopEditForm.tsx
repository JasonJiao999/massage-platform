// src/components/ShopEditForm.tsx (已恢复所有字段的最终版)
'use client';

import { updateShopSettings, deleteShopVideo } from '@/lib/actions';
import { useFormState, useFormStatus } from 'react-dom';

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

function SubmitButton({ text }: { text: string }) {
    const { pending } = useFormStatus();
    return <button type="submit" disabled={pending} className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:bg-gray-400">{pending ? '保存中...' : text}</button>;
}

function DeleteVideoButton() {
    const { pending } = useFormStatus();
    return <button type="submit" disabled={pending} className="text-xs font-medium text-red-500 hover:underline disabled:text-gray-400">{pending ? '删除中...' : '删除当前视频'}</button>;
}

export default function ShopEditForm({ settings }: { settings: ShopSettings }) {
  const [updateState, updateAction] = useFormState(updateShopSettings, { message: '' });
  const [deleteState, deleteAction] = useFormState(deleteShopVideo, { message: '' });

  return (
    
    <form action={updateAction} className="space-y-8 max-w-2xl">
      <input type="hidden" name="shop_id" value={settings.shop_id} />
      {/* --- 基础信息 --- */}
      <div className="p-6 bg-card rounded-lg border border-border space-y-4">
          <h3 className="text-lg font-semibold text-white">基础信息</h3>
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
      </div>

      {/* --- 专属页面内容 --- */}
      <div className="p-6 bg-card rounded-lg border border-border space-y-4">
        <h3 className="text-lg font-semibold text-white">专属页面内容</h3>
        <div>
            <label htmlFor="background_image" className="block text-sm font-medium text-white">背景图</label>
            {settings.bg_image_url && <img src={settings.bg_image_url} alt="Current background" className="mt-2 w-48 h-auto rounded-md" />}
            <input type="file" id="background_image" name="background_image" accept="image/*" className="mt-2 block w-full text-sm text-gray-300"/>
            <p className="text-xs text-gray-400 mt-1">上传新图片替换背景。留空则不修改。</p>
        </div>
        <div>
            <label htmlFor="hero_image" className="block text-sm font-medium text-white">广告横幅</label>
            {settings.hero_image_url && <img src={settings.hero_image_url} alt="Current hero banner" className="mt-2 w-full h-auto rounded-md" />}
            <input type="file" id="hero_image" name="hero_image" accept="image/*" className="mt-2 block w-full text-sm text-gray-300"/>
            <p className="text-xs text-gray-400 mt-1">上传新图片替换横幅。留空则不修改。</p>
        </div>
        {/* 特色视频管理 */}
        {settings.featured_video_url ? (
            <div className="space-y-2">
                <label className="block text-sm font-medium text-white">当前特色视频</label>
                <video src={settings.featured_video_url} controls className="w-full rounded-md" />
                <form action={deleteAction}>
                    <input type="hidden" name="shop_id" value={settings.shop_id} />
                    <DeleteVideoButton />
                </form>
                {deleteState?.message && <p className="text-xs text-green-400 mt-1">{deleteState.message}</p>}
            </div>
        ) : (
            <div>
                <label htmlFor="featured_video" className="block text-sm font-medium text-white">上传新视频 (限1个, 50MB以内)</label>
                <input type="file" id="featured_video" name="featured_video" accept="video/mp4,video/webm" className="mt-2 block w-full text-sm text-gray-300"/>
            </div>
        )}
      </div>

      <SubmitButton text="保存所有更改" />
      {updateState?.message && <p className={`mt-2 text-sm ${updateState.message.includes('失败') ? 'text-red-400' : 'text-green-400'}`}>{updateState.message}</p>}
    </form>
  );
}