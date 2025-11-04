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
import { FaTwitter, FaInstagram, FaFacebook, FaLine,FaTiktok } from 'react-icons/fa';

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
    <button type="submit" disabled={pending} className="btn">
      {pending ? 'Processing...' : text}
    </button>
  );
}

// 主组件
export function MyProfileForm({ profile }: { profile: Profile }) {
  // 状态管理：个人资料更新
  const [profileState, profileDispatch] = useFormState(updateMyProfile, { message: '', success: false });
  const formRef = useRef<HTMLFormElement>(null);

  // 状态管理：头像上传
  const [avatarState, avatarFormAction] = useFormState(updateAvatar, { success: false, message: '', url: '' });
  const avatarFormRef = useRef<HTMLFormElement>(null);

  // 状态管理：照片上传
  const [photosState, photosFormAction] = useFormState(uploadMultipleMyProfilePhotos, { success: false, message: '' });
  const photosFormRef = useRef<HTMLFormElement>(null);

  // 新增：照片文件选择状态
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  
  // 新增：处理文件选择变化的函数
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    setSelectedFiles(files);
  };

  // 状态管理：地址选择器
  const [addressIds, setAddressIds] = useState({
      province_id: profile.province_id,
      district_id: profile.district_id,
      sub_district_id: profile.sub_district_id
  });

  const handleAddressChange = (ids: { province_id: number | null; district_id: number | null; sub_district_id: number | null }) => {
      setAddressIds(ids);
  };

  // 个人资料表单提交处理
  const handleProfileFormAction = (formData: FormData) => {
      formData.set('province_id', addressIds.province_id?.toString() || '');
      formData.set('district_id', addressIds.district_id?.toString() || '');
      formData.set('sub_district_id', addressIds.sub_district_id?.toString() || '');
      profileDispatch(formData);
  };
  
  // Effect：处理表单提交后的反馈
  useEffect(() => {
    if (profileState.message) {
        if (profileState.success) {
            alert("Profile updated successfully!");
        } else {
            alert(`Error: ${profileState.message}`);
        }
    }
  }, [profileState]);

  useEffect(() => {
    if (avatarState.message) {
        alert(avatarState.message);
        if (avatarState.success) {
            avatarFormRef.current?.reset(); // 成功后清空文件输入框
        }
    }
  }, [avatarState]);

  useEffect(() => {
    if (photosState.message) {
        alert(photosState.message);
        if (photosState.success) {
            photosFormRef.current?.reset(); // 成功后清空文件输入框
        }
    }
  }, [photosState]);

  // 将数组转换为逗号分隔的字符串用于 input 显示
  const tagsString = profile.tags?.join(', ') || '';
  const featuresString = profile.feature?.join(', ') || '';

  return (
    <div className="space-y-8">
      {/* 个人资料表单 */}
<form 
  ref={formRef} 
  action={handleProfileFormAction} 
  className="max-w-6xl mx-auto p-6 bg-gray-800 rounded-lg shadow-md"
>
  <div className='flex flex-row flex-wrap justify-between gap-6 items-center px-[24px]'>
  <h2 className="text-2xl font-bold text-white text-left mb-8">Edit Profile</h2>
  <SubmitButton text="Save" />
  </div>
  <div className="flex flex-row flex-wrap text-[var(--foreground)]">
    {/* Nickname and Age Card */}
    <div className="card bg-primary flex-1 min-w-[300px] w-[450px] p-[24px] m-[10px]">
      <h3 className="text-xl font-semibold mb-4">My Profile</h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="nickname" className="block text-sm font-medium  mb-2">Nickname</label>
          <input 
            type="text" 
            id="nickname" 
            name="nickname" 
            defaultValue={profile.nickname ?? ''} 
            className="input m-[10px] w-[90%]"
          />
        </div>
        <div>
          <label htmlFor="years" className="block text-sm font-medium  mb-2">Age</label>
          <input 
            type="number" 
            id="years" 
            name="years" 
            defaultValue={profile.years ?? ''} 
            className="input m-[10px] w-[90%]"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="tags" className="block text-sm font-medium  mb-2">Tags (separate with commas)</label>
          <input 
            type="text" 
            id="tags" 
            name="tags" 
            defaultValue={tagsString} 
            className="input m-[10px] w-[90%]" 
            placeholder="e.g. Thai Massage, Oil Massage"
          />
        </div>
        <div>
          <label htmlFor="feature" className="block text-sm font-medium  mb-2">Features (separate with commas)</label>
          <input 
            type="text" 
            id="feature" 
            name="feature" 
            defaultValue={featuresString} 
            className="input m-[10px] w-[90%]" 
            placeholder="e.g. Friendly, Strong hands"
          />
        </div>
      </div>
    </div>

<div className="card bg-primary flex-1 min-w-[300px] w-[450px] p-[24px] m-[10px]">
  <h3 className="text-xl font-semibold  mb-4">Social Media Links</h3>
      <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
      <textarea 
        id="bio" 
        name="bio" 
        rows={4} 
        defaultValue={profile.bio ?? ''} 
        className="textarea m-[10px] h-[70%] w-[90%]"
      ></textarea>
</div>

</div>

    {/* 第二行：两个容器左右对齐 */}
<div className="flex flex-row flex-wrap justify-between text-[var(--foreground)]">
    {/* Social Media Card */}
<div className="card bg-primary flex-1 min-w-[300px] w-[450px] p-[24px] m-[10px]">
  <h3 className="text-xl font-semibold  mb-4">Social Media Links</h3>
  <div className="space-y-4">
    <div className="flex items-center">
      <FaFacebook className="text-2xl  mr-3 flex-shrink-0"/>
      <input 
        type="url" 
        name="social_facebook" 
        placeholder="https://facebook.com/..." 
        defaultValue={profile.social_links?.facebook || ''} 
        className="input m-[10px] w-[85%]"
      />
    </div>
    <div className="flex items-center">
      <FaInstagram className="text-2xl  mr-3 flex-shrink-0"/>
      <input 
        type="url" 
        name="social_instagram" 
        placeholder="https://instagram.com/..." 
        defaultValue={profile.social_links?.instagram || ''} 
        className="input m-[10px] w-[85%]"
      />
    </div>
    <div className="flex items-center">
      <FaTwitter className="text-2xl  mr-3 flex-shrink-0"/>
      <input 
        type="url" 
        name="social_twitter" 
        placeholder="https://twitter.com/..." 
        defaultValue={profile.social_links?.twitter || ''} 
        className="input m-[10px] w-[85%]"
      />
    </div>
    <div className="flex items-center">
      <FaLine className="text-2xl  mr-3 flex-shrink-0"/>
      <input 
        type="text" 
        name="social_line" 
        placeholder="Line ID or Line Alink" 
        defaultValue={profile.social_links?.line || ''} 
        className="input m-[10px] w-[85%]"
      />
    </div>
    <div className="flex items-center">
      <FaTiktok className="text-2xl  mr-3 flex-shrink-0"/>
      <input 
        type="url" 
        name="social_tiktok" 
        placeholder="https://tiktok.com/..." 
        defaultValue={profile.social_links?.tiktok || ''} 
        className="input m-[10px] w-[85%]"
      />
    </div>
  </div>
</div>

    {/* Address Card */}
    <div className="card bg-primary flex-1 min-w-[300px] w-[450px] p-[24px] m-[10px]">
      <h3 className="text-xl font-semibold  mb-4">Detailed address</h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="address_detail" className="block text-sm font-medium  mb-2">
            Building Name
          </label>
          <input 
            id="address_detail" 
            name="address_detail" 
            type="text" 
            defaultValue={profile.address_detail || ''} 
            className="input m-[10px] w-[90%]" 
            placeholder="e.g., 123 Beach Road, Building A"
          />
        </div>
        <AddressSelector
          initialProvinceId={profile.province_id}
          initialDistrictId={profile.district_id}
          initialSubDistrictId={profile.sub_district_id}
          onAddressChange={handleAddressChange}
        />
      </div>
    </div>
  </div>

</form>

      {/* 头像上传表单 
      <div className="p-6 bg-gray-800 rounded-lg shadow-md space-y-4">
        <h3 className="text-xl font-bold text-white">头像</h3>
        <div className="flex items-center space-x-4">
          <Image src={profile.avatar_url || '/default-avatar.png'} alt="Avatar" width={80} height={80} className="rounded-full" />
          <form ref={avatarFormRef} action={avatarFormAction}>
            <input type="file" name="avatar" accept="image/*" required className="text-sm" />
            <SubmitButton text="上传头像" />
          </form>
        </div>
      </div>
      */}
      
      {/* 照片库管理 */}
      <div className="p-6 bg-gray-800 rounded-lg shadow-md space-y-4">

<div className="flex flex-row justify-between items-center px-6 p-[24px]">
  <h2 className="text-2xl font-bold text-white flex-shrink-0">My Photos</h2>
  <form ref={photosFormRef} action={photosFormAction} className='flex items-center gap-4'>
    <div className="relative">
      <input 
        type="file" 
        name="photos" 
        accept="image/*" 
        multiple 
        required
        onChange={handleFileChange}
        className="file-input file-input-ghost absolute opacity-0 w-full h-full cursor-pointer" 
      />
      <button type="button" className="btn cursor-pointer">
        Choose Files
      </button>
    </div>
    {selectedFiles && selectedFiles.length > 0 && (
      <span className="text-sm text-gray-300 mx-4">
        {selectedFiles.length} file(s) selected
      </span>
    )}
    <SubmitButton text="Upload photos" />
  </form>
</div>
<div className="max-w-[1200px] mx-auto flex flex-row flex-wrap justify-start gap-4">
  {profile.photo_urls?.map(url => (
    <div key={url} className="relative group aspect-[3/4] rounded-lg overflow-hidden min-w-[330px] flex-1 max-w-[calc(33.333%-12px)] p-[10px] m-auto">
      <Image 
        src={url} 
        alt="Profile photo" 
        width={300}
        height={400}
        quality={95}
        unoptimized
        className="card w-full h-full object-cover rounded-lg "
      />
      <form action={deleteMyProfilePhoto.bind(null, url)} className="absolute top-[20px] right-[20px]">
        <button type="submit" className="p-1 bg-red-600 text-white rounded-full opacity-75 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center text-sm">&times;</button>
      </form>
    </div>
  ))}
</div>



      </div>

      {/* 视频库管理 */}
      <div className="p-6 bg-gray-800 rounded-lg shadow-md space-y-4">
        <div className='flex flex-row flex-wrap justify-between gap-6 items-stretch p-[24px]'>
  <h2 className="text-xl font-bold text-white">My Videos</h2>
  <form action={uploadMultipleMyProfileVideos} className='flex items-center gap-4'>
    <div className="relative">
      <input 
        type="file" 
        name="videos" 
        accept="video/*" 
        multiple 
        required 
        className="file-input file-input-ghost absolute opacity-0 w-full h-full cursor-pointer" 
      />
      <button type="button" className="btn cursor-pointer">
        Choose Files
      </button>
    </div>
    {/* 如果需要显示选中文件数量，可以在这里添加类似的逻辑 */}
    <SubmitButton text="Upload videos" />
  </form>
</div>




        <div className="max-w-[1200px] mx-auto flex flex-row flex-wrap justify-start gap-4r">
          {profile.video_urls?.map(url => (
            <div key={url} className="rounded-lg overflow-hidden min-w-[330px] flex-1 max-w-[calc(33.333%-12px)] p-[10px] m-auto items-center">
              <video src={url} controls preload="metadata" className="card w-full rounded-lg bg-black object-cover">
                Your browser does not support playing the video.
              </video>


                <form action={deleteMyProfileVideo.bind(null, url)}>
                  <button type="submit" className="btn mx-auto]">
                    Delete
                  </button>
                </form>

            </div>
          ))}
        </div>



      </div>
    </div>
  );
}