// src/components/ImageUploader.tsx
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { uploadMultipleStaffPhotos, deleteStaffPhotos } from '@/lib/actions';
import Image from 'next/image';
import { useState } from 'react';

const initialState = { message: '' };

function UploadSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="text-sm bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded-md disabled:bg-gray-400">
      {pending ? '上传中...' : '上传选中照片'}
    </button>
  );
}

function DeleteSubmitButton({ count }: { count: number }) {
    const { pending } = useFormStatus();
    return (
      <button type="submit" disabled={pending} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-400">
        {pending ? '删除中...' : `删除选中的 ${count} 张照片`}
      </button>
    );
}


function DeleteForm({ staffId, photoUrls }: { staffId: string; photoUrls: string[] }) {
  const [state, formAction] = useFormState(deleteStaffPhotos, initialState);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

  const handleSelectionChange = (url: string) => {
    setSelectedPhotos(prev => 
      prev.includes(url) ? prev.filter(p => p !== url) : [...prev, url]
    );
  };

  return (
    <form action={formAction}>
      <input type="hidden" name="staffId" value={staffId} />
      {selectedPhotos.map(url => <input key={url} type="hidden" name="photoUrlsToDelete" value={url} />)}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {photoUrls.map((url, index) => (
          <div key={index} className="relative aspect-square group cursor-pointer" onClick={() => handleSelectionChange(url)}>
            {/* ↓↓↓ 核心修正区域 ↓↓↓ */}
            <Image 
              src={url} 
              alt={`员工照片 ${index + 1}`} 
              fill 
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              className="rounded-md object-cover" 
            />
            {/* ↑↑↑ 核心修正区域 ↑↑↑ */}
            <div className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity ${selectedPhotos.includes(url) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              <div className={`h-6 w-6 rounded border-2 flex items-center justify-center ${selectedPhotos.includes(url) ? 'bg-indigo-600 border-indigo-600' : 'bg-gray-500/50 border-white'}`}>
                {selectedPhotos.includes(url) && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedPhotos.length > 0 && (
        <div className="mt-4"><DeleteSubmitButton count={selectedPhotos.length} /></div>
      )}
      {state?.message && <p className="mt-2 text-sm text-green-400">{state.message}</p>}
    </form>
  );
}

// ... (主组件 ImageUploader 保持不变)
export default function ImageUploader({ staffId, photoUrls }: { staffId: string; photoUrls: string[] | null }) {
    const [uploadState, uploadFormAction] = useFormState(uploadMultipleStaffPhotos, initialState);
  
    return (
      <div className="space-y-4 p-4 border border-border rounded-lg bg-card/50">
        <h3 className="text-lg font-semibold text-white">员工照片管理</h3>
        
        {photoUrls && photoUrls.length > 0 ? (
          <DeleteForm staffId={staffId} photoUrls={photoUrls} />
        ) : (
          <p className="text-sm text-gray-400">暂无已上传的照片。</p>
        )}
  
        <form action={uploadFormAction} className="space-y-2 border-t border-border pt-4">
          <input type="hidden" name="staffId" value={staffId} />
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
  
        {uploadState?.message && (
          <p className={`mt-2 text-sm ${uploadState.message.includes('失败') || uploadState.message.includes('错误') ? 'text-red-400' : 'text-green-400'}`}>
            {uploadState.message}
          </p>
        )}
      </div>
    );
  }
  