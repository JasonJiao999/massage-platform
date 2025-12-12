// src/components/MyProfileForm.tsx (最终修复版 - 包含所有字段)
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Image from 'next/image';
import {
  updateMyProfile,
  updateQrUrl,
  uploadMultipleMyProfilePhotos,
  deleteMyProfilePhoto,
  updateMyProfileVideoLinks,
  deleteMyProfileVideo
} from '@/lib/actions';
import { useState, useRef, useEffect } from 'react';
import AddressSelector from './AddressSelector';
import {  
  FaInstagram, 
  FaFacebook, 
  FaLine,
  FaTiktok,
  FaImages,         // <-- 新增
  FaMapMarkedAlt    // <-- 新增
} from 'react-icons/fa';
import { deleteQrUrl } from '@/lib/actions'; 
import { FaXTwitter } from 'react-icons/fa6'; 
import { useRouter } from 'next/navigation';

// 定义完整的 Profile 类型
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
  points: number | null;         // <-- (积分)
  referral_code: string | null;  // <-- (推荐码)
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


// (*** 用這個完整、已修復的函數替換你舊的 ImageUploader 函數 ***)

function ImageUploader({ 
  currentQrUrl, 
  formAction, 
  formRef, 
  fieldName, 
  profileId,
  qrUrlState // <-- (1. 在 props 解構中接收它)
}: {
  currentQrUrl?: string | null;
  formAction: (formData: FormData) => void;
  formRef: React.RefObject<HTMLFormElement>;
  fieldName: string;
  profileId: string;
  qrUrlState: { success: boolean; message: string; url?: string }; // <-- (2. 在類型定義中聲明它)
}) {
  const [preview, setPreview] = useState<string | null>(currentQrUrl ?? null);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // (*** 3. 將 useEffect 放在這裡，在所有 Hook 之後 ***)
  useEffect(() => {
    // 如果父組件的 useFormState 狀態變為 'success: true'
    if (qrUrlState.success) {
      setFile(null); // <-- 重置 React 狀態
      setPreview(currentQrUrl ?? null); // 重置預覽
    }
    // 我們只在 'qrUrlState' 變化時運行此 effect
  }, [qrUrlState, currentQrUrl]); // <-- 依賴項是 qrUrlState


  // (*** 4. 常規函數定義 ***)
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

  
  // (*** 5. JSX return 語句 ***)
  return (
    <form action={formAction} ref={formRef} className="flex flex-col items-center gap-4">
      
      {/* 隐藏的 file input，由按钮触发 */}
      <input
        type="file"
        name={fieldName}
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden" 
      />
      <input type="hidden" name="profileId" value={profileId} />
      
      {/* 3. 新增：可见的“选择文件”按钮 */}
      {!file && (
          <button 
            type="button" 
            onClick={triggerFileSelect} 
            className="btn" // 使用你的 'btn' 样式
          >
            Choose QR Code
          </button>
      )}

      {/* 4. 确认和上传 */}
      {/* 当文件被选中时，显示文件名和“上传”按钮 */}
      {file && (
        <div className='flex flex-col items-center gap-2'>
          <span className="text-gray-300">已選擇: {file.name}</span>
          {/* (注意: 確保 SubmitButton 組件已導入) */}
          <SubmitButton text="Upload QR Code" /> 
        </div>
      )}
    </form>
  );
}

const MAX_VIDEO_SLOTS = 3; // 限制最多 3 个视频

// 主组件
export function MyProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter(); 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  // 状态管理：个人资料更新
  const [profileState, profileDispatch] = useFormState(updateMyProfile, { message: '', success: false });
  const formRef = useRef<HTMLFormElement>(null);

// 状态管理：QR Code 上传 (*** 修复点 1：重命名变量 ***)
  const [qrUrlState, qrUrlFormAction] = useFormState(updateQrUrl, { success: false, message: '', url: '' });
  const qrUrlFormRef = useRef<HTMLFormElement>(null);
  const MAX_QR_CODES = 3;
  const currentQrCount = profile.qr_url?.length || 0;

  // 状态管理：照片上传
  const [photosState, photosFormAction] = useFormState(uploadMultipleMyProfilePhotos, { success: false, message: '' });
  const photosFormRef = useRef<HTMLFormElement>(null);
  
// <--- 新增: 视频链接数组状态 (确保 video_urls 是数组) --->
  const [videoUrls, setVideoUrls] = useState<string[]>(
    (profile.video_urls || []).concat(Array(MAX_VIDEO_SLOTS).fill('')).slice(0, MAX_VIDEO_SLOTS)
  );

  const handleVideoUrlChange = (index: number, value: string) => {
    const newVideoUrls = [...videoUrls];
    newVideoUrls[index] = value;
    setVideoUrls(newVideoUrls);
  };
  
  // <--- 新增: 提交视频链接的 Server Action 处理器 --->
  const handleVideoLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    // 调用新的 Server Action，传递清理过的链接数组
    const { success, message: msg } = await updateMyProfileVideoLinks(videoUrls);
    
    setMessage(msg);
    if (success) {
        // 如果成功，强制刷新页面以确保数据一致性
        router.refresh(); 
    }
    setLoading(false);
  };


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

// (*** 修复点 2：更新 useEffect 以使用新变量名 ***)
  useEffect(() => {
    if (qrUrlState.message) {
        alert(qrUrlState.message);
        if (qrUrlState.success) {
            qrUrlFormRef.current?.reset(); // 成功后清空文件输入框
        }
    }
  }, [qrUrlState]); // 依赖项也更新为 qrUrlState

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
    <div className="max-w-[1200px]">
      {/* 个人资料表单 */}
<form 
  ref={formRef} 
  action={handleProfileFormAction} 
  className="max-w-6xl mx-auto rounded-lg shadow-md">
  <div className='flex flex-row flex-wrap justify-between  items-center '>
  <h2 className="text-2xl font-bold text-white text-left ">Edit Profile</h2>
  <SubmitButton text="Save" />
  </div>

  <div className="grid grid-cols-1 min-[768px]:grid-cols-2 gap-[20px] w-full text-[var(--foreground)]">
    {/* Nickname and Age Card */}
    <div className="card bg-primary w-full">
      <h3 className="text-xl font-semibold m-[20px]">My Profile</h3>
      <div className="px-[20px]">
        <div>
          <label htmlFor="nickname" className="block text-sm font-medium  ">Nickname(ชื่อเล่น)</label>
          <input 
            type="text" 
            id="nickname" 
            name="nickname" 
            defaultValue={profile.nickname ?? ''} 
            className="input m-[10px] w-[90%]"
          />
        </div>
        <div>
          <label htmlFor="years" className="block text-sm font-medium  ">Age(อายุ)</label>
          <input 
            type="number" 
            id="years" 
            name="years" 
            defaultValue={profile.years ?? ''} 
            className="input m-[10px] w-[90%]"
          />
        </div>
      </div>

    <div className="px-[20px]">
  
      <label htmlFor="gender" className="block text-sm font-medium">Gender(เพศ)</label>
      <select 
        id="gender" 
        name="gender" 
        defaultValue={profile.gender ?? ''}
        className="select m-[10px] w-[90%]"
      >
        <option value="">Choose...</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
        <option value="prefer_not_to_say">Prefer not to say</option>
      </select>
    </div>

    {/* --- 新增：Nationality (下拉选择) --- */}
    <div className="px-[20px]">
      <label htmlFor="nationality" className="block text-sm font-medium ">Nationality(สัญชาติ)</label>
      <select 
        id="nationality" 
        name="nationality" 
        defaultValue={profile.nationality ?? ''}
        className="select m-[10px] w-[90%] "
      >
        <option value="">Choose...</option>
        <option value="Thailand">Thailand</option>
        <option value="Laos">Laos</option>
        <option value="Cambodia">Cambodia</option>
        <option value="Vietnam">Vietnam</option>
        <option value="Myanmar">Myanmar</option>
        <option value="Europe">Europe</option>
        <option value="North America">North America</option>
        <option value="South America">South America</option>
        <option value="Africa">Africa</option>
        <option value="Other">Other</option>
      </select>
    </div>

    

      <div className="px-[20px]">
        <div>
          <label htmlFor="tags" className="block text-sm font-medium  ">Tags (สามลักษณะคั่นด้วยเครื่องหมายจุลภาค เช่น รูปร่างดี)</label>
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
          <label htmlFor="feature" className="block text-sm font-medium  ">Features (ประเภทบริการ เช่น นวด)</label>
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

<div className="card bg-primary w-full min-h-[400px]">
  <div className="px-[20px]">
  <h3 className="text-xl font-semibold  mb-4">Personal Profile</h3>
      <label htmlFor="bio" className="block text-sm font-medium ">Bio(โปรไฟล์ส่วนตัว)</label>
      <textarea 
        id="bio" 
        name="bio" 
        rows={4} 
        defaultValue={profile.bio ?? ''} 
        className="textarea m-[10px] h-full w-[90%]"
      ></textarea>
    </div>
</div>

</div>

    {/* 第二行：两个容器左右对齐 */}
<div className="grid grid-cols-1 min-[768px]:grid-cols-2 gap-[20px] w-full text-[var(--foreground)] my-[20px]">
    {/* Social Media Card */}
<div className="card bg-primary w-full">
  <div className="px-[20px]">
  <h3 className="text-xl font-semibold  mb-4">Social Media Links</h3>
  <div className="space-y-4">
    <div className="flex items-center">
      <FaFacebook className="text-2xl  mr-3 flex-shrink-0"/>
      <input 
        type="url" 
        name="social_facebook" 
        placeholder="https://facebook.com/..." 
        defaultValue={profile.social_links?.facebook || ''} 
        className="input m-[10px] w-[80%]"
      />
    </div>
    <div className="flex items-center">
      <FaInstagram className="text-2xl  mr-3 flex-shrink-0"/>
      <input 
        type="url" 
        name="social_instagram" 
        placeholder="https://instagram.com/..." 
        defaultValue={profile.social_links?.instagram || ''} 
        className="input m-[10px] w-[80%]"
      />
    </div>
    <div className="flex items-center">
      <FaXTwitter className="text-2xl  mr-3 flex-shrink-0"/>
      <input 
        type="url" 
        name="social_twitter" 
        placeholder="https://X.com/..." 
        defaultValue={profile.social_links?.twitter || ''} 
        className="input m-[10px] w-[80%]"
      />
    </div>
    <div className="flex items-center">
      <FaLine className="text-2xl  mr-3 flex-shrink-0"/>
      <input 
        type="text" 
        name="social_line" 
        placeholder="Line ID or Line Alink" 
        defaultValue={profile.social_links?.line || ''} 
        className="input m-[10px] w-[80%]"
      />
    </div>
    <div className="flex items-center">
      <FaTiktok className="text-2xl  mr-3 flex-shrink-0"/>
      <input 
        type="url" 
        name="social_tiktok" 
        placeholder="https://tiktok.com/..." 
        defaultValue={profile.social_links?.tiktok || ''} 
        className="input m-[10px] w-[80%]"
      />
    </div>
{/* --- 這是新添加的：Google Photos --- */}
<div>
  <FaImages className="text-2xl mr-3 flex-shrink-0" />
  <input 
    type="url" 
    id="social_google_photos" 
    name="social_google_photos" 
    defaultValue={profile.social_links?.google_photos ?? ''} 
    className="input m-[10px] w-[80%]"
    placeholder="https://photos.app.goo.gl/..."
  />
</div>

{/* --- 這是新添加的：Google Maps --- */}
<div>
  <FaMapMarkedAlt className="text-2xl mr-3 flex-shrink-0" />
  <input 
    type="url" 
    id="social_google_maps" 
    name="social_google_maps" 
    defaultValue={profile.social_links?.google_maps ?? ''} 
    className="input m-[10px] w-[80%]"
    placeholder="https://maps.app.goo.gl/..."
  />
</div>


  </div>
  </div>
</div>

    {/* Address Card */}
    <div className="card bg-primary w-full text-[var(--foreground)]">
      <div className="px-[20px]">
      <h3 className="text-xl font-semibold  mb-4">Detailed address</h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="address_detail" className="block text-sm font-medium  ">
            Building Name(ที่อยู่ที่ทำงาน)
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
  </div>

</form>
<div className="card bg-primary text-[var(--foreground)] w-full">
{/* --- 這是「QR 碼管理」的完整卡片 (已更新，帶有 3 個限制) --- */}
  <div className="flex flex-col min-[800px]:flex-row gap-[10px] w-full h-full p-[20px]">
    <div className="flex flex-col text-center flex-1 min-w-[300px] md:min-w-0">
      {currentQrCount < MAX_QR_CODES ? (
        <>
          <h3 className="text-xl font-semibold mb-[50px]">Upload New QR Code ({MAX_QR_CODES - currentQrCount} remaining)</h3>
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
    <div className="flex flex-col text-center flex-1 min-w-[300px] md:min-w-0">
      <h3 className="text-xl font-semibold mb-4">Current QR Codes ({currentQrCount}/{MAX_QR_CODES})</h3>
      <div className="flex flex-wrap justify-center gap-[20px]">
        

        {profile.qr_url && profile.qr_url.length > 0 ? (
          profile.qr_url.map((qrUrl: string, index: number) => (
            <div key={index} className="relative flex justify-center ">
              <Image
                src={qrUrl}
                alt={`QR Code ${index + 1}`}
                width={120}
                height={120}
                className="card object-cover rounded-md"
              />
              
       
              <form action={deleteQrUrl.bind(null, qrUrl)}>
                <button 
                  type="submit"
                  className="absolute bottom-0  -translate-x-1/2 btn btn-xs"
                  aria-label="Delete QR Code"
                >
                  &times;
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
    {/* --- 卡片結束 --- */}
</div>



    </div>
  );
}