// src/components/MyProfileForm.tsx (已修复语法错误的完整版本)

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

// 定义完整的 Profile 类型 (保持不变)
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
};

// 通用提交按钮 (保持不变)
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

  return (
    <div className="w-full max-w-4xl p-8 space-y-12 bg-white rounded-lg shadow-lg border">
      
      {/* --- 1. 头像上传 --- */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2">头像管理</h2>
        <div className="flex items-center gap-6">
          <Image 
            src={profile.avatar_url || '/default-avatar.png'}
            alt="User Avatar"
            width={100}
            height={100}
            className="rounded-full object-cover"
          />
          <form action={updateAvatar}>
            <input type="file" name="avatar" accept="image/*" required className="text-sm" />
            <SubmitButton text="上传新头像" />
          </form>
        </div>
      </div>

      {/* --- 2. 核心文本信息表单 --- */}
      <form action={dispatch} className="space-y-6">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2">基本资料</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">昵称</label>
            <input id="nickname" name="nickname" type="text" defaultValue={profile.nickname || ''} className="mt-1 block w-full input" />
          </div>
          <div>
            <label htmlFor="years" className="block text-sm font-medium text-gray-700">工作年限</label>
            <input id="years" name="years" type="number" defaultValue={profile.years || 0} className="mt-1 block w-full input" />
          </div>
          <div>
            <label htmlFor="level" className="block text-sm font-medium text-gray-700">等级/职称</label>
            <input id="level" name="level" type="text" defaultValue={profile.level || ''} className="mt-1 block w-full input" />
          </div>
        </div>
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">个人简介</label>
          <textarea id="bio" name="bio" rows={4} defaultValue={profile.bio || ''} className="mt-1 block w-full input" />
        </div>
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700">技能标签 (用逗号分隔)</label>
          <input id="tags" name="tags" type="text" defaultValue={profile.tags?.join(', ') || ''} className="mt-1 block w-full input" />
        </div>
        <div>
          <label htmlFor="feature" className="block text-sm font-medium text-gray-700">个人特色 (用逗号分隔)</label>
          <input id="feature" name="feature" type="text" defaultValue={profile.feature?.join(', ') || ''} className="mt-1 block w-full input" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 pt-4">社交链接</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
                <label htmlFor="social_twitter" className="block text-sm">Twitter</label>
                <input id="social_twitter" name="social_twitter" type="url" defaultValue={profile.social_links?.twitter || ''} className="mt-1 w-full input" placeholder="https://twitter.com/..." />
            </div>
            <div>
                <label htmlFor="social_instagram" className="block text-sm">Instagram</label>
                <input id="social_instagram" name="social_instagram" type="url" defaultValue={profile.social_links?.instagram || ''} className="mt-1 w-full input" placeholder="https://instagram.com/..." />
            </div>
            <div>
                <label htmlFor="social_facebook" className="block text-sm">Facebook</label>
                <input id="social_facebook" name="social_facebook" type="url" defaultValue={profile.social_links?.facebook || ''} className="mt-1 w-full input" placeholder="https://facebook.com/..." />
            </div>
        </div>
        <div className="pt-4">
            <SubmitButton text="保存所有更改" />
            {state?.message && <p className={`mt-4 text-sm ${state.success ? 'text-green-600' : 'text-red-600'}`}>{state.message}</p>}
        </div>
      </form>

      {/* --- 3. 照片集管理 --- */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2">照片集管理</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {profile.photo_urls?.map(url => (
            <div key={url} className="relative group">
              <Image src={url} alt="Staff photo" width={200} height={200} className="w-full h-full object-cover rounded-md" />
              <form action={deleteMyProfilePhoto.bind(null, url)} className="absolute top-1 right-1">
                <button type="submit" className="p-1 bg-red-600 text-white rounded-full text-xs opacity-50 group-hover:opacity-100">&times;</button>
              </form>
            </div>
          ))}
        </div>
        <form action={uploadMultipleMyProfilePhotos}>
          <label className="block text-sm font-medium">上传新照片 (可多选)</label>
          <input type="file" name="photos" accept="image/*" multiple required className="mt-1 text-sm" />
          <SubmitButton text="上传照片" />
        </form>
      </div>

      {/* --- 4. 视频集管理 --- */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2">视频集管理</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile.video_urls?.map(url => (
                <div key={url} className="space-y-2 border p-3 rounded-lg">
                    <video
                      src={url}
                      controls
                      preload="metadata"
                      className="w-full rounded-md bg-black"
                    >
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

    </div> // <-- 【修复】这是您的代码中缺失的结束标签
  ); // <-- 【修复】这是您的代码中缺失的结束括号
} // <-- 【修复】这是您的代码中缺失的结束大括号