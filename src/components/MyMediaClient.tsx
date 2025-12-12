// src/components/MyMediaClient.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import Image from 'next/image';
import { 
  uploadMultipleMyProfilePhotos, 
  deleteMyProfilePhoto, 
  updateMyProfileVideoLinks, 
  uploadMyCoverImage // 导入新 Action
} from '@/lib/actions';
import { FaTrash, FaCloudUploadAlt, FaVideo, FaImages, FaImage } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

// 定义需要的 Props 类型
type MediaProps = {
  profile: {
    id: string;
    photo_urls: string[] | null;
    video_urls: string[] | null;
    cover_image_url?: string | null; // 新增字段
    level: number | null;
  };
};

const MAX_VIDEO_SLOTS = 3;

function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn">
      {pending ? <span className="loading loading-spinner"></span> : <><FaCloudUploadAlt className="mr-2"/> {text}</>}
    </button>
  );
}

export default function MyMediaClient({ profile }: MediaProps) {
  const router = useRouter();
  
  // --- 1. 封面图状态 ---
  const [coverState, coverAction] = useFormState(uploadMyCoverImage, { success: false, message: '' });
  
  // --- 2. 照片上传状态 ---
  const [photosState, photosFormAction] = useFormState(uploadMultipleMyProfilePhotos, { success: false, message: '' });
  const photosFormRef = useRef<HTMLFormElement>(null);
  const [selectedPhotoFiles, setSelectedPhotoFiles] = useState<FileList | null>(null);

  // --- 3. 视频链接状态 ---
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoMessage, setVideoMessage] = useState('');
  const [videoUrls, setVideoUrls] = useState<string[]>(
    (profile.video_urls || []).concat(Array(MAX_VIDEO_SLOTS).fill('')).slice(0, MAX_VIDEO_SLOTS)
  );

  // 处理视频输入变化
  const handleVideoUrlChange = (index: number, value: string) => {
    const newVideoUrls = [...videoUrls];
    newVideoUrls[index] = value;
    setVideoUrls(newVideoUrls);
  };

  // 提交视频链接
  const handleVideoLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVideoLoading(true);
    const { success, message } = await updateMyProfileVideoLinks(videoUrls);
    setVideoMessage(message);
    if (success) router.refresh();
    setVideoLoading(false);
  };

  // 监听 Server Action 反馈
  useEffect(() => {
    if (photosState.message) {
      alert(photosState.message);
      if (photosState.success) {
        photosFormRef.current?.reset();
        setSelectedPhotoFiles(null);
      }
    }
  }, [photosState]);

  return (
    <div className="max-w-[1200px] mx-auto gap-[10px] flex flex-col">
      
      {/* --- Section 1: 封面图管理 (升级功能) --- */}
      <div className="card bg-[var(--color-third)] text-[var(--foreground)] shadow-xl w-full">
        <div className="card-body">
          <h2 className="card-title flex items-center text-white">
            <FaImage /> Cover Image (New Feature)
          </h2>
          <p className="text-sm opacity-80">Please upload a cover image; your information will not be displayed on the website without a cover image. <br />
                  กรุณาอัพโหลดภาพปก ข้อมูลของคุณจะไม่ปรากฏบนเว็บไซต์หากไม่มีภาพปก
          </p>
          
          <div className="flex flex-col md:flex-row gap-6 items-start mt-4">
          
            <div className="w-full md:w-1/3 max-h-[300px] aspect-[3/4] bg-black/20 rounded-lg overflow-hidden relative border-2 border-dashed border-white/30 flex items-center justify-center">
              {profile.cover_image_url ? (
                <Image 
                  src={profile.cover_image_url} 
                  alt="Cover Image Thumbnail" 
                  fill 
                  className="object-contain" 
                />
              ) : (
                <span className="text-white/50">No cover image set</span>
              )}
            </div>

            {/* 上传表单 */}
            <form action={coverAction} className="w-full md:w-1/3 flex flex-col gap-[10px] items-center ">
              <input 
                type="file" 
                name="cover_image" 
                accept="image/*" 
                required 
                className="w-[95%] justify-center file-input"
              />
              <SubmitButton text="Upload Cover" />
              {coverState.message && (
                <p className={`text-sm ${coverState.success ? 'text-green-300' : 'text-red-300'}`}>
                  {coverState.message}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* --- Section 2: 照片库管理 (迁移内容) --- */}
      <div className="card bg-primary text-[var(--foreground)] shadow-xl w-full">
        <div className="card-body">
          <div className="flex justify-between items-center flex-wrap gap-[10px]">
            <h2 className="card-title text-white"><FaImages /> My Photo Gallery</h2>
            
            {/* 照片上传表单 */}
            <form ref={photosFormRef} action={photosFormAction} className="flex gap-[10px] items-center w-full md:w-auto bg-primary ">
              <input 
                type="file" 
                name="photos" 
                accept="image/*" 
                multiple 
                required
                onChange={(e) => setSelectedPhotoFiles(e.target.files)}
                className="file-input file-input-sm file-input-bordered w-full max-w-xs" 
              />
              <SubmitButton text="Upload" />
            </form>
          </div>
          
          {selectedPhotoFiles && selectedPhotoFiles.length > 0 && (
            <p className="text-sm text-gray-400">{selectedPhotoFiles.length} file(s) selected</p>
          )}

          <div className="divider"></div>

          {/* 照片网格 */}
          <div className="grid grid-cols-3 max-[800px]:grid-cols-2  gap-[10px] ">
            {profile.photo_urls?.map((url, index) => (
              <div key={url} className="relative group aspect-[3/4] rounded-lg overflow-hidden shadow-md bg-black">
                <Image 
                  src={url} 
                  alt={`Photo ${index}`} 
                  fill 
                  className="object-cover"
                />
                {/* 删除按钮 */}
                <form action={deleteMyProfilePhoto.bind(null, url)}>
                  <button className="absolute top-2 right-2 btn btn-xs btn-circle btn-error opacity-80 hover:opacity-100">
                    <FaTrash className="w-3 h-3 text-white"/>
                  </button>
                </form>
              </div>
            ))}
            {(!profile.photo_urls || profile.photo_urls.length === 0) && (
              <div className="col-span-full text-center p-[10px] text-gray-500">
                No photos uploaded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- Section 3: 视频库管理 (迁移内容) --- */}
      <div className="card bg-primary text-[var(--foreground)] shadow-xl w-full">
        <div className="card-body">
          <h2 className="card-title text-white"><FaVideo /> X/Twitter Video Links</h2>
          <p className="text-sm opacity-80">Paste links from X (Twitter) to embed videos on your profile.</p>

          <form onSubmit={handleVideoLinkSubmit} className="mt-4 space-y-[10px]">
            {videoUrls.map((url, index) => (
              <div key={index} className="form-control flex gap-[10px]">
                <label className="label">
                  <span className="label-text ">Video Link {index + 1}</span>
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => handleVideoUrlChange(index, e.target.value)}
                  className="input input-bordered w-[80%]"
                  placeholder="https://x.com/user/status/..." 
                />
              </div>
            ))}
            
            <div className="flex justify-end ">
              <button type="submit" className="btn btn-wide my-[10px]" disabled={videoLoading}>
                {videoLoading ? 'Saving...' : 'Save Video Links'}
              </button>
            </div>
            {videoMessage && (
              <p className={`text-center mt-2 ${videoMessage.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
                {videoMessage}
              </p>
            )}
          </form>

          {/* 视频预览状态 */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-[10px]">
            {profile.video_urls?.filter(u => u.trim() !== '').map((url, index) => (
              <div key={index} className="alert alert-success text-sm py-2">
                <span>Video {index + 1} Saved</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}