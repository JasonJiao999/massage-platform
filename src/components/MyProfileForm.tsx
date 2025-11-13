// src/components/MyProfileForm.tsx (已更新响应式布局)
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Image from 'next/image';
import {
  updateMyProfile,
  updateQrUrl,
  uploadMultipleMyProfilePhotos,
  deleteMyProfilePhoto,
  uploadMultipleMyProfileVideos,
  deleteMyProfileVideo
} from '@/lib/actions';
import { useState, useRef, useEffect } from 'react';
import AddressSelector from './AddressSelector';
import {  
  FaInstagram, 
  FaFacebook, 
  FaLine,
  FaTiktok,
  FaImages,
  FaMapMarkedAlt
} from 'react-icons/fa';
import { deleteQrUrl } from '@/lib/actions'; 
import { FaXTwitter } from 'react-icons/fa6'; 

// (类型定义 Profile 和 SubmitButton 保持不变)
type Profile = {
  id: string;
  nickname: string | null;
  bio: string | null;
  qr_url: string[] | null;         
  gender: string | null;         
  nationality: string | null;  
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
  points: number | null;
  referral_code: string | null;
};
function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn">
      {pending ? 'Processing...' : text}
    </button>
  );
}
// (ImageUploader 函数保持不变)
function ImageUploader({ 
  currentQrUrl, 
  formAction, 
  formRef, 
  fieldName, 
  profileId,
  qrUrlState
}: {
  currentQrUrl?: string | null;
  formAction: (formData: FormData) => void;
  formRef: React.RefObject<HTMLFormElement>;
  fieldName: string;
  profileId: string;
  qrUrlState: { success: boolean; message: string; url?: string };
}) {
  const [preview, setPreview] = useState<string | null>(currentQrUrl ?? null);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (qrUrlState.success) {
      setFile(null); 
      setPreview(currentQrUrl ?? null);
    }
  }, [qrUrlState, currentQrUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <form action={formAction} ref={formRef} className="flex flex-col items-center gap-4">
      <input
        type="file"
        name={fieldName}
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden" 
      />
      <input type="hidden" name="profileId" value={profileId} />
      {!file && (
          <button 
            type="button" 
            onClick={triggerFileSelect} 
            className="btn"
          >
            Choose QR Code
          </button>
      )}
      {file && (
        <div className='flex flex-col items-center gap-2'>
          <span className="text-gray-300">已選擇: {file.name}</span>
          <SubmitButton text="Upload QR Code" /> 
        </div>
      )}
    </form>
  );
}


// 主组件
export function MyProfileForm({ profile }: { profile: Profile }) {
  // (所有的 State, Ref, Effect 和 handle 函数保持不变)
  const [profileState, profileDispatch] = useFormState(updateMyProfile, { message: '', success: false });
  const formRef = useRef<HTMLFormElement>(null);
  const [qrUrlState, qrUrlFormAction] = useFormState(updateQrUrl, { success: false, message: '', url: '' });
  const qrUrlFormRef = useRef<HTMLFormElement>(null);
  const MAX_QR_CODES = 3;
  const currentQrCount = profile.qr_url?.length || 0;
  const [photosState, photosFormAction] = useFormState(uploadMultipleMyProfilePhotos, { success: false, message: '' });
  const photosFormRef = useRef<HTMLFormElement>(null);
  const [videoState, videoFormAction] = useFormState(uploadMultipleMyProfileVideos, { success: false, message: '' });
  const videoFormRef = useRef<HTMLFormElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    setSelectedFiles(files);
  };
  const [addressIds, setAddressIds] = useState({
      province_id: profile.province_id,
      district_id: profile.district_id,
      sub_district_id: profile.sub_district_id
  });
  const handleAddressChange = (ids: { province_id: number | null; district_id: number | null; sub_district_id: number | null }) => {
      setAddressIds(ids);
  };
  const handleProfileFormAction = (formData: FormData) => {
      formData.set('province_id', addressIds.province_id?.toString() || '');
      formData.set('district_id', addressIds.district_id?.toString() || '');
      formData.set('sub_district_id', addressIds.sub_district_id?.toString() || '');
      profileDispatch(formData);
  };
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
    if (qrUrlState.message) {
        alert(qrUrlState.message);
        if (qrUrlState.success) {
            qrUrlFormRef.current?.reset(); 
        }
    }
  }, [qrUrlState]);
  useEffect(() => {
    if (photosState.message) {
        alert(photosState.message);
        if (photosState.success) {
            photosFormRef.current?.reset(); 
        }
    }
  }, [photosState]);
  useEffect(() => {
    if (videoState.message) {
        alert(videoState.message);
        if (videoState.success) {
            videoFormRef.current?.reset(); 
        }
    }
  }, [videoState]);
  const tagsString = profile.tags?.join(', ') || '';
  const featuresString = profile.feature?.join(', ') || '';

  return (
    // 【修改】: 移除 max-w-[1200px]，让它继承父级的宽度
    <div className="w-full">
      {/* 个人资料表单 */}
<form 
  ref={formRef} 
  action={handleProfileFormAction} 
  // 【修改】: 移除 max-w-6xl，使用 w-full。简化 padding。
  className="w-full mx-auto p-2 md:p-6 bg-gray-800 rounded-lg shadow-md"
>
  {/* 【修改】: 在手机上 (flex-col) 垂直堆叠标题和保存按钮 */}
  <div className='flex flex-col sm:flex-row flex-wrap justify-between gap-4 items-center px-2 md:px-6'>
    <h2 className="text-2xl font-bold text-white text-left">Edit Profile</h2>
    <SubmitButton text="Save" />
  </div>

  {/* 【修改】: 默认垂直堆叠 (flex-col)，在中屏幕 (md) 以上才水平 (md:flex-row) */}
  <div className="flex flex-col md:flex-row flex-wrap text-[var(--foreground)]">
    
    {/* Nickname and Age Card */}
    {/* 【修改】: 移除 w-[450px]，使用 flex-1。移除 m-[10px]，使用 gap 控制间距。 */}
    <div className="card bg-primary flex-1 min-w-[280px] p-4 md:p-6 my-2">
      <h3 className="text-xl font-semibold mb-4">My Profile</h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="nickname" className="block text-sm font-medium  mb-2">Nickname(ชื่อเล่น)</label>
          {/* 【修改】: w-[90%] 改为 w-full */}
          <input 
            type="text" 
            id="nickname" 
            name="nickname" 
            defaultValue={profile.nickname ?? ''} 
            className="input w-full"
          />
        </div>
        <div>
          <label htmlFor="years" className="block text-sm font-medium  mb-2">Age(อายุ)</label>
          <input 
            type="number" 
            id="years" 
            name="years" 
            defaultValue={profile.years ?? ''} 
            className="input w-full"
            min="18" max="99" step="1"
          />
        </div>
      </div>
      <div>
        <label htmlFor="gender" className="block text-sm font-medium mb-2">Gender(เพศ)</label>
        <select 
          id="gender" 
          name="gender" 
          defaultValue={profile.gender ?? ''}
          className="select w-full text-[var(--color-secondary)]"
        >
          <option value="">Choose...</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="prefer_not_to_say">Prefer not to say</option>
        </select>
      </div>

      <div>
        <label htmlFor="nationality" className="block text-sm font-medium mb-2">Nationality(สัญชาติ)</label>
        <select 
          id="nationality" 
          name="nationality" 
          defaultValue={profile.nationality ?? ''}
          className="select w-full text-[var(--color-secondary)]"
        >
          <option value="">Choose...</option>
          <option value="Thailand">Thailand</option>
          {/* ... 其他选项 ... */}
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="space-y-4 mt-4">
        <div>
          <label htmlFor="tags" className="block text-sm font-medium  mb-2">Tags (e.g. good figure)</label>
          <input 
            type="text" 
            id="tags" 
            name="tags" 
            defaultValue={tagsString} 
            className="input w-full" 
            placeholder="e.g. Good figure, Cute"
          />
        </div>
        <div>
          <label htmlFor="feature" className="block text-sm font-medium  mb-2">Features (e.g. massage)</label>
          <input 
            type="text" 
            id="feature" 
            name="feature" 
            defaultValue={featuresString} 
            className="input w-full" 
            placeholder="e.g. PR, Massage"
          />
        </div>
      </div>
    </div>

    {/* Bio Card */}
    <div className="card bg-primary flex-1 min-w-[280px] p-4 md:p-6 my-2">
      <h3 className="text-xl font-semibold  mb-4">Personal Profile</h3>
      <label htmlFor="bio" className="block text-sm font-medium mb-2">Bio(โปรไฟล์ส่วนตัว)</label>
      {/* 【修改】: 移除固定高度 h-[70%]，使用 h-64 (或根据需要调整) */}
      <textarea 
        id="bio" 
        name="bio" 
        rows={4} 
        defaultValue={profile.bio ?? ''} 
        className="textarea w-full h-64"
      ></textarea>
    </div>
  </div>

    {/* 第二行 */}
  <div className="flex flex-col md:flex-row flex-wrap justify-between text-[var(--foreground)]">
    {/* Social Media Card */}
    <div className="card bg-primary flex-1 min-w-[280px] p-4 md:p-6 my-2">
      <h3 className="text-xl font-semibold  mb-4">Social Media Links</h3>
      <div className="space-y-4">
        {/* 【修改】: w-[85%] 改为 w-full */}
        <div className="flex items-center">
          <FaFacebook className="text-2xl  mr-3 flex-shrink-0"/>
          <input type="url" name="social_facebook" placeholder="https://facebook.com/..." defaultValue={profile.social_links?.facebook || ''} className="input w-full" />
        </div>
        <div className="flex items-center">
          <FaInstagram className="text-2xl  mr-3 flex-shrink-0"/>
          <input type="url" name="social_instagram" placeholder="https://instagram.com/..." defaultValue={profile.social_links?.instagram || ''} className="input w-full" />
        </div>
        <div className="flex items-center">
          <FaXTwitter className="text-2xl  mr-3 flex-shrink-0"/>
          <input type="url" name="social_twitter" placeholder="https://X.com/..." defaultValue={profile.social_links?.twitter || ''} className="input w-full" />
        </div>
        <div className="flex items-center">
          <FaLine className="text-2xl  mr-3 flex-shrink-0"/>
          <input type="text" name="social_line" placeholder="Line ID or Line Alink" defaultValue={profile.social_links?.line || ''} className="input w-full" />
        </div>
        <div className="flex items-center">
          <FaTiktok className="text-2xl  mr-3 flex-shrink-0"/>
          <input type="url" name="social_tiktok" placeholder="https://tiktok.com/..." defaultValue={profile.social_links?.tiktok || ''} className="input w-full" />
        </div>
        <div className="flex items-center">
          <FaImages className="text-2xl mr-3 flex-shrink-0" />
          <input type="url" id="social_google_photos" name="social_google_photos" defaultValue={profile.social_links?.google_photos ?? ''} className="input w-full" placeholder="https://photos.app.goo.gl/..." />
        </div>
        <div className="flex items-center">
          <FaMapMarkedAlt className="text-2xl mr-3 flex-shrink-0" />
          <input type="url" id="social_google_maps" name="social_google_maps" defaultValue={profile.social_links?.google_maps ?? ''} className="input w-full" placeholder="https://maps.app.goo.gl/..." />
        </div>
      </div>
    </div>

    {/* Address Card */}
    <div className="card bg-primary flex-1 min-w-[280px] p-4 md:p-6 my-2">
      <h3 className="text-xl font-semibold  mb-4">Detailed address</h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="address_detail" className="block text-sm font-medium  mb-2">
            Building Name(ที่อยู่ที่ทำงาน)
          </label>
          <input id="address_detail" name="address_detail" type="text" defaultValue={profile.address_detail || ''} className="input w-full" placeholder="e.g., 123 Beach Road, Building A" />
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

{/* QR 码管理 */}
{/* 【修改】: 移除 m-[10px]，使用 my-4 */}
<div className="card bg-primary text-[var(--foreground)] pt-[10px] pb-[20px] my-4">
  {/* 【修改】: 允许垂直堆叠 (flex-col)，在 min-[800px] 时才水平 */}
  <div className="flex flex-col min-[800px]:flex-row gap-[10px] w-full h-full p-4">
    {/* 【修改】: min-w-[300px] 改为 min-w-[280px] */}
    <div className="flex flex-col text-center flex-1 min-w-[280px] md:min-w-0">
      {currentQrCount < MAX_QR_CODES ? (
        <>
          <h3 className="text-xl font-semibold mb-4 md:mb-[50px]">Upload New QR Code ({MAX_QR_CODES - currentQrCount} remaining)</h3>
          <ImageUploader
            formAction={qrUrlFormAction} 
            formRef={qrUrlFormRef}       
            fieldName="qr_url"
            profileId={profile.id}
            qrUrlState={qrUrlState}
          />
          <div className="divider my-6"></div>
        </>
      ) : (
        <div className="mb-6 text-center">
          <p className="font-bold">Maximum QR Codes Reached</p>
          <p className="text-sm">Please delete an old QR code to upload a new one.</p>
        </div>
      )}
    </div>
    <div className="flex flex-col text-center flex-1 min-w-[280px] md:min-w-0">
      <h3 className="text-xl font-semibold mb-4">Current QR Codes ({currentQrCount}/{MAX_QR_CODES})</h3>
      <div className="flex flex-wrap justify-center gap-[20px]">
        {profile.qr_url && profile.qr_url.length > 0 ? (
          profile.qr_url.map((qrUrl: string, index: number) => (
            <div key={index} className="relative flex justify-center ">
              <Image src={qrUrl} alt={`QR Code ${index + 1}`} width={120} height={120} className="card object-cover rounded-md" />
              <form action={deleteQrUrl.bind(null, qrUrl)}>
                <button type="submit" className="absolute bottom-0  -translate-x-1/2 btn btn-xs" aria-label="Delete QR Code">
                  ×
                </button>
              </form>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No QR Codes uploaded yet.</p>
        )}
      </div>
    </div>
  </div>
</div>


      {/* 照片库管理 */}
      <div className="p-2 md:p-6 bg-gray-800 rounded-lg shadow-md space-y-4 my-4">
        {/* 【修改】: 允许垂直堆叠 (flex-col) */}
        <div className="flex flex-col md:flex-row justify-between items-center p-2 md:p-6 gap-4">
          <h2 className="text-2xl font-bold text-white flex-shrink-0">My Photos</h2>
          {/* 【修改】: 允许表单垂直堆叠 (flex-col) */}
          <form ref={photosFormRef} action={photosFormAction} className='flex flex-col sm:flex-row items-center gap-4'>
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
              <span className="text-sm text-gray-300">
                {selectedFiles.length} file(s) selected
              </span>
            )}
            <SubmitButton text="Upload photos" />
          </form>
        </div>

        {/* 【修改】: 移除 gap-4，使用 gap-2。调整 min-w-[330px] 为 min-w-[280px] 或更小 */}
        <div className="w-full mx-auto flex flex-row flex-wrap justify-start gap-2">
          {profile.photo_urls?.map(url => (
            // 【修改】: 移除 max-w-[calc(33.333%-12px)]，使用 w-full 或 flex-basis
            // 在小屏幕上 (w-full)，在中屏幕上 (sm:w-[calc(50%-4px)])，大屏幕 (lg:w-[calc(33.3%-4px)])
            <div key={url} className="relative group aspect-[3/4] rounded-lg overflow-hidden w-full sm:w-[calc(50%-4px)] lg:w-[calc(33.3%-4px)] p-1 m-auto">
              <Image 
                src={url} 
                alt="Profile photo" 
                width={300}
                height={400}
                quality={95}
                unoptimized
                className="card w-full h-full object-cover rounded-lg "
              />
              <form action={deleteMyProfilePhoto.bind(null, url)} className="absolute top-3 right-3 md:top-[20px] md:right-[20px]">
                <button type="submit" className="btn btn-xs">×</button>
              </form>
            </div>
          ))}
        </div>
      </div>

      {/* 视频库管理 */}
      <div className="p-2 md:p-6 bg-gray-800 rounded-lg shadow-md space-y-4 my-4">
        {/* 【修改】: 允许垂直堆叠 (flex-col) */}
        <div className='flex flex-col md:flex-row flex-wrap justify-between gap-6 items-stretch p-2 md:p-6'>
          <h2 className="text-xl font-bold text-white">My Videos</h2>
          {/* 【修改】: 允许表单垂直堆叠 (flex-col) */}
          <form ref={videoFormRef} action={videoFormAction} className='flex flex-col sm:flex-row items-center gap-4'>
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
            <SubmitButton text="Upload videos" />
          </form>

          {videoState?.message && (
            <p className={`mt-2 text-sm ${!videoState.success ? 'text-red-400' : 'text-green-400'}`}>
              {videoState.message}
            </p>
          )}
        </div>

        {/* 【修改】: 移除 gap-4r，使用 gap-2。调整 min-w-[330px] */}
        <div className="w-full mx-auto flex flex-row flex-wrap justify-start gap-2">
          {profile.video_urls?.map(url => (
            // 【修改】: 应用与照片相同的响应式宽度
            <div key={url} className="rounded-lg overflow-hidden w-full sm:w-[calc(50%-4px)] lg:w-[calc(33.3%-4px)] p-1 m-auto flex flex-col items-center gap-2">
              <video src={url} controls preload="metadata" className="card w-full rounded-lg bg-black object-cover">
                Your browser does not support playing the video.
              </video>
              <form action={deleteMyProfileVideo.bind(null, url)}>
                {/* 【修改】: 移除 mx-auto，使用 w-full 或 btn-wide */}
                <button type="submit" className="btn btn-wide">
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