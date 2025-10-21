// src/components/MyProfileForm.tsx (最终修复版 - 包含所有字段)
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Image from 'next/image';
import { 
  updateMyProfile, 
  updateAvatar, 
  uploadMultipleMyProfilePhotos, 
  deleteMyProfilePhoto,
  uploadMultipleMyProfileVideos,
  deleteMyProfileVideo
} from '@/lib/actions';
import { useState, useRef, useEffect } from 'react';
import AddressSelector from './AddressSelector';
import { FaTwitter, FaInstagram, FaFacebook } from 'react-icons/fa';

// 定义完整的 Profile 类型
type Profile = {
  id: string;
  nickname: string | null;
  bio: string | null;
  avatar_url: string | null;
  photo_urls: string[] | null;
  video_urls: string[] | null;
  years: number | null;
  feature: string[] | null;
  tags: string[] | null;
  social_links: { [key: string]: string } | null;
  level: string | null;
  address_detail: string | null;
  province_id: number | null;
  district_id: number | null;
  sub_district_id: number | null;
};

// 通用提交按钮
function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400">
      {pending ? '处理中...' : text}
    </button>
  );
}

// 主组件
export function MyProfileForm({ profile }: { profile: Profile }) {
  const [state, dispatch] = useFormState(updateMyProfile, { message: '', success: false });
  const formRef = useRef<HTMLFormElement>(null);

  const [addressIds, setAddressIds] = useState({
      province_id: profile.province_id,
      district_id: profile.district_id,
      sub_district_id: profile.sub_district_id
  });

  const handleAddressChange = (ids: { province_id: number | null; district_id: number | null; sub_district_id: number | null }) => {
      setAddressIds(ids);
  };

  const handleFormAction = (formData: FormData) => {
      formData.set('province_id', addressIds.province_id?.toString() || '');
      formData.set('district_id', addressIds.district_id?.toString() || '');
      formData.set('sub_district_id', addressIds.sub_district_id?.toString() || '');
      dispatch(formData);
  };
  
  useEffect(() => {
    if (state.message) {
        if (state.success) {
            alert("个人资料已成功更新!");
        } else {
            alert(`错误: ${state.message}`);
        }
    }
  }, [state]);

  // 将数组转换为逗号分隔的字符串用于 input 显示
  const tagsString = profile.tags?.join(', ') || '';
  const featuresString = profile.feature?.join(', ') || '';

  return (
    <div className="space-y-8">
      {/* 个人资料表单 */}
      <form ref={formRef} action={handleFormAction} className="p-6 bg-gray-800 rounded-lg shadow-md space-y-6">
        <h2 className="text-2xl font-bold text-white">编辑个人资料</h2>
        
        {/* -- 【核心修复】重新加入所有字段的输入框 -- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="nickname" className="block text-sm font-medium text-gray-300">昵称</label>
                <input type="text" id="nickname" name="nickname" defaultValue={profile.nickname ?? ''} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div>
                <label htmlFor="years" className="block text-sm font-medium text-gray-300">从业年限</label>
                <input type="number" id="years" name="years" defaultValue={profile.years ?? ''} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>
        </div>
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-300">简介</label>
          <textarea id="bio" name="bio" rows={3} defaultValue={profile.bio ?? ''} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
        </div>
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-300">标签 (请用英文逗号分隔)</label>
          <input type="text" id="tags" name="tags" defaultValue={tagsString} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white" placeholder="e.g. Thai Massage, Oil Massage"/>
        </div>
        <div>
          <label htmlFor="feature" className="block text-sm font-medium text-gray-300">特色 (请用英文逗号分隔)</label>
          <input type="text" id="feature" name="feature" defaultValue={featuresString} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white" placeholder="e.g. Friendly, Strong hands"/>
        </div>

        {/* -- 【核心修复】增加社交媒体链接的输入框 -- */}
        <div className="border-t border-gray-700 pt-6">
            <h3 className="text-xl font-semibold text-white">社交媒体链接</h3>
            <div className="mt-4 space-y-4">
                <div className="flex items-center">
                    <FaFacebook className="text-2xl text-gray-400 mr-3"/>
                    <input type="url" name="social_facebook" placeholder="https://facebook.com/..." defaultValue={profile.social_links?.facebook || ''} className="flex-1 bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"/>
                </div>
                <div className="flex items-center">
                    <FaInstagram className="text-2xl text-gray-400 mr-3"/>
                    <input type="url" name="social_instagram" placeholder="https://instagram.com/..." defaultValue={profile.social_links?.instagram || ''} className="flex-1 bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"/>
                </div>
                <div className="flex items-center">
                    <FaTwitter className="text-2xl text-gray-400 mr-3"/>
                    <input type="url" name="social_twitter" placeholder="https://twitter.com/..." defaultValue={profile.social_links?.twitter || ''} className="flex-1 bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"/>
                </div>
            </div>
        </div>

        {/* 地址信息部分 (保持不变) */}
        <div className="border-t border-gray-700 pt-6">
            <h3 className="text-xl font-semibold text-white">地址信息</h3>
            <div className="mt-4 space-y-4">
                <div>
                    <label htmlFor="address_detail" className="block text-sm font-medium text-gray-300 mb-2">
                        Address Detail (街道门牌)
                    </label>
                    <input id="address_detail" name="address_detail" type="text" defaultValue={profile.address_detail || ''} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5" placeholder="e.g., 123 Beach Road, Building A"/>
                </div>
                <AddressSelector
                    initialProvinceId={profile.province_id}
                    initialDistrictId={profile.district_id}
                    initialSubDistrictId={profile.sub_district_id}
                    onAddressChange={handleAddressChange}
                />
            </div>
        </div>

        <div className="flex justify-end">
          <SubmitButton text="保存资料" />
        </div>
      </form>

      {/* 头像上传表单 (保持不变) */}
      <div className="p-6 bg-gray-800 rounded-lg shadow-md space-y-4">
        <h3 className="text-xl font-bold text-white">头像</h3>
        <div className="flex items-center space-x-4">
          <Image src={profile.avatar_url || '/default-avatar.png'} alt="Avatar" width={80} height={80} className="rounded-full" />
          <form action={updateAvatar}>
            <input type="file" name="avatar" accept="image/*" required className="text-sm" />
            <SubmitButton text="上传头像" />
          </form>
        </div>
      </div>
      
      {/* 照片库管理 (保持不变) */}
      <div className="p-6 bg-gray-800 rounded-lg shadow-md space-y-4">
        <h3 className="text-xl font-bold text-white">照片库</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {profile.photo_urls?.map(url => (
            <div key={url} className="relative group">
              <Image 
                src={url} 
                alt="Profile photo" 
                width={200} 
                height={200}
                quality={95}
                unoptimized
                className="rounded-md object-cover w-full h-full"
              />
              <form action={deleteMyProfilePhoto.bind(null, url)} className="absolute top-1 right-1">
                <button type="submit" className="p-1 bg-red-600 text-white rounded-full opacity-75 group-hover:opacity-100">&times;</button>
              </form>
            </div>
          ))}
        </div>
        <form action={handlePhotosSubmit}>
          <label className="block text-sm font-medium">上传新照片 (可多选)</label>
          <input type="file" name="photos" accept="image/*" multiple required className="mt-1 text-sm" />
          <SubmitButton text="上传照片" />
        </form>
      </div>

      {/* 视频库管理 (保持不变) */}
      <div className="p-6 bg-gray-800 rounded-lg shadow-md space-y-4">
        <h3 className="text-xl font-bold text-white">视频库</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profile.video_urls?.map(url => (
            <div key={url} className="space-y-2 border p-3 rounded-lg">
              <video src={url} controls preload="metadata" className="w-full rounded-md bg-black">
                您的浏览器不支持播放视频。
              </video>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <a href={url} target="_blank" rel="noopener noreferrer" className="truncate hover:underline">
                  {url.split('/').pop()}
                </a>
                <form action={deleteMyProfileVideo.bind(null, url)}>
                  <button type="submit" className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                    删除
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
        <form action={uploadMultipleMyProfileVideos}>
          <label className="block text-sm font-medium">上传新视频 (可多选)</label>
          <input type="file" name="videos" accept="video/*" multiple required className="mt-1 text-sm" />
          <SubmitButton text="上传视频" />
        </form>
      </div>
    </div>
  );
}