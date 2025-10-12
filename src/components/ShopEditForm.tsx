// src/components/ShopEditForm.tsx
'use client';

import { updateShopSettings } from '@/lib/actions';

type ShopSettings = {
  name: string;
  slug: string;
  description: string;
  phone_number: string;
  tags: string[];
  social_links: { facebook?: string; instagram?: string; };
  theme: { primary_color: string | null; background_color: string | null; } | null;
};

export default function ShopEditForm({ settings }: { settings: ShopSettings }) {

  const defaultTags = settings.tags.join(', ');
  const defaultFacebookUrl = settings.social_links?.facebook || '';
  const defaultInstagramUrl = settings.social_links?.instagram || '';

  return (
    <form action={updateShopSettings} className="space-y-6 max-w-2xl text-black">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-white">店铺名称</label>
        <input type="text" id="name" name="name" defaultValue={settings.name} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"/>
      </div>
      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-white">店铺网址 (Slug)</label>
        <input type="text" id="slug" name="slug" defaultValue={settings.slug} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"/>
      </div>

      {/* 新增 Description Textarea */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-white">店铺简介</label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={settings.description}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        ></textarea>
      </div>

      {/* 新增 Phone Number Input */}
      <div>
        <label htmlFor="phone_number" className="block text-sm font-medium text-white">联系电话</label>
        <input type="tel" id="phone_number" name="phone_number" defaultValue={settings.phone_number} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"/>
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-white">店铺标签 (用逗号分隔)</label>
        <input type="text" id="tags" name="tags" defaultValue={defaultTags} placeholder="例如: 环境优雅, 情侣推荐" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"/>
      </div>
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-white">社交媒体链接</h3>
        <div>
          <label htmlFor="facebook_url" className="block text-xs font-medium text-gray-300">Facebook</label>
          <input type="url" id="facebook_url" name="facebook_url" defaultValue={defaultFacebookUrl} placeholder="https://facebook.com/yourpage" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"/>
        </div>
        <div>
          <label htmlFor="instagram_url" className="block text-xs font-medium text-gray-300">Instagram</label>
          <input type="url" id="instagram_url" name="instagram_url" defaultValue={defaultInstagramUrl} placeholder="https://instagram.com/yourprofile" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"/>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="primary_color" className="block text-sm font-medium text-white">主题主色调</label>
          <input type="color" id="primary_color" name="primary_color" defaultValue={settings.theme?.primary_color || '#ffffff'} className="mt-1 block h-10 w-full rounded-md border-gray-300"/>
        </div>
        <div>
          <label htmlFor="background_color" className="block text-sm font-medium text-white">主题背景色</label>
          <input type="color" id="background_color" name="background_color" defaultValue={settings.theme?.background_color || '#000000'} className="mt-1 block h-10 w-full rounded-md border-gray-300"/>
        </div>
      </div>
      <button
        type="submit"
        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        保存更改
      </button>
    </form>
  );
}
