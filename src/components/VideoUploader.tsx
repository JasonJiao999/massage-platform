// src/components/VideoUploader.tsx (已完全修复)
'use client';

import { useFormState, useFormStatus } from 'react-dom';
// 【修复 1】: 导入您 actions.ts 中真实存在的函数
import { uploadMultipleMyProfileVideos, deleteMyProfileVideo } from '@/lib/actions';
// 【修复 2】: 移除 useTransition，因为我们将使用 useFormStatus
// import { useTransition } from 'react';

const initialState = { message: '' };

function UploadSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="text-sm bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded-md disabled:bg-gray-400">
      {pending ? '上传中...' : '上传选中视频'}
    </button>
  );
}

// 【修复 3】: 新增一个用于删除表单的状态按钮
function DeleteSubmitButton() {
    const { pending } = useFormStatus();
    return (
      <button 
        type="submit" 
        disabled={pending}
        className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 rounded-md disabled:bg-gray-500"
      >
        {pending ? '删除中...' : '删除此视频'}
      </button>
    );
}


// 视频预览卡片组件
function VideoCard({ staffId, url }: { staffId: string; url: string; }) {
  // 【修复 4】: 移除旧的 onClick 逻辑 (useTransition, startTransition, handleDelete)
  // const [isPending, startTransition] = useTransition();
  // const handleDelete = () => { ... };

  return (
    <div className="flex flex-col gap-2">
      <div className="aspect-video bg-black rounded-md overflow-hidden">
        <video 
          src={url} 
          className="w-full h-full object-cover"
          playsInline 
          controls 
        />
      </div>
      
      {/* 【修复 5】: 将删除按钮改为一个 Form Action */}
      {/* 它调用 deleteMyProfileVideo 并仅绑定 URL，这与 actions.ts 中的函数签名匹配 */}
      <form action={deleteMyProfileVideo.bind(null, url)}>
        <DeleteSubmitButton />
      </form>
    </div>
  );
}

// 主组件 (简化版)
export default function VideoUploader({ staffId, videoUrls }: { staffId: string; videoUrls: string[] | null }) {
  // 【修复 6】: 使用正确的 action 函数
  const [uploadState, uploadFormAction] = useFormState(uploadMultipleMyProfileVideos, initialState);

  return (
    <div className="space-y-4 p-4 border border-border rounded-lg bg-card/50">
      <h3 className="text-lg font-semibold text-white">员工视频管理</h3>
      
      {videoUrls && videoUrls.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {videoUrls.map((url) => (
            <VideoCard
              key={url}
              staffId={staffId} // staffId 属性保留，以防将来使用
              url={url}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400">暂无已上传的视频。</p>
      )}

      <form action={uploadFormAction} className="space-y-2 border-t border-border pt-4">
        {/* 【修复 7】: uploadMultipleMyProfileVideos 会自动从会话中获取用户ID，
          因此不再需要 staffId 这个隐藏字段。
        */}
        {/* <input type="hidden" name="staffId" value={staffId} /> */}
        <div>
          <label htmlFor="videos" className="block text-sm font-medium text-white mb-1">选择一个或多个新视频</label>
          <input 
            type="file" 
            id="videos" 
            name="videos"
            accept="video/mp4, video/webm" 
            required
            multiple
            className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file-sm font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
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