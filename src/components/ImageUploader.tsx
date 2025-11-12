// src/components/ImageUploader.tsx (已完全修复)
'use client';

import { useFormState, useFormStatus } from 'react-dom';
// 【修复 1】: 导入 actions.ts 中真实存在的函数
import { uploadMultipleMyProfilePhotos, deleteMyProfilePhoto } from '@/lib/actions'; 
import Image from 'next/image';
import { useState } from 'react';

const initialState = { message: '', success: false, url: '' }; // 确保初始状态匹配 action 的返回值
const deleteInitialState = { message: '', success: false }; // 为删除 action 提供一个单独的状态

function UploadSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="text-sm bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded-md disabled:bg-gray-400">
      {pending ? '上传中...' : '上传选中照片'}
    </button>
  );
}

// 【修复 2】: 这是一个新的、用于单个删除按钮的组件
function DeleteSubmitButton() {
    const { pending } = useFormStatus();
    return (
      <button 
        type="submit" 
        disabled={pending} 
        className="absolute top-2 right-2 btn btn-xs btn-circle btn-error" // 定位到右上角
        aria-label="Delete photo"
      >
        {pending ? '...' : '×'}
      </button>
    );
}

// 【修复 3】: 重构 DeleteForm，移除多选逻辑
function DeleteForm({ staffId, photoUrls }: { staffId: string; photoUrls: string[] }) {
  // 移除 useState 和 handleSelectionChange

  return (
    // <form> 被移动到了 map 内部
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {photoUrls.map((url, index) => (
        <div key={index} className="relative aspect-[3/4] group">
          <Image 
            src={url} 
            alt={`员工照片 ${index + 1}`} 
            fill 
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            className="rounded-md object-cover" 
          />
          {/* 【修复 4】: 每个图片都有自己的删除表单 */}
          <form action={deleteMyProfilePhoto.bind(null, url)}>
            <input type="hidden" name="staffId" value={staffId} />
            <DeleteSubmitButton />
          </form>
        </div>
      ))}
    </div>
  );
}

export default function ImageUploader({ staffId, photoUrls }: { staffId: string; photoUrls: string[] | null }) {
    // 【修复 5】: 使用正确的 action 函数
    const [uploadState, uploadFormAction] = useFormState(uploadMultipleMyProfilePhotos, initialState);
  
    return (
      <div className="space-y-4 p-4 border border-border rounded-lg bg-card/50">
        <h3 className="text-lg font-semibold text-white">员工照片管理</h3>
        
        {photoUrls && photoUrls.length > 0 ? (
          <DeleteForm staffId={staffId} photoUrls={photoUrls} />
        ) : (
          <p className="text-sm text-gray-400">暂无已上传的照片。</p>
        )}
  
        {/* 【修复 6】: action 已修正，移除 staffId，因为它会从 session 中获取 */}
        <form action={uploadFormAction} className="space-y-2 border-t border-border pt-4">
          {/* <input type="hidden" name="staffId" value={staffId} /> */}
          <div>
            <label htmlFor="photos" className="block text-sm font-medium text-white mb-1">选择一张或多张新照片</label>
            <input 
              type="file" 
              id="photos" 
              name="photos"
              accept="image/png, image/jpeg, image/webp" 
              required
              multiple
              className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
          </div>
          <UploadSubmitButton />
        </form>
  
        {/* 【修复 7】: uploadState 现在有正确的类型，可以安全访问 .message */}
        {uploadState?.message && (
          <p className={`mt-2 text-sm ${!uploadState.success ? 'text-red-400' : 'text-green-400'}`}>
            {uploadState.message}
          </p>
        )}
      </div>
    );
  }