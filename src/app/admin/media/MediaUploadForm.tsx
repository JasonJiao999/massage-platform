// 文件路徑: app/admin/media/MediaUploadForm.tsx

'use client';

import { useState, useRef } from 'react';
import { uploadMedia } from '@/lib/actions'; // 導入我們創建的 Server Action

export default function MediaUploadForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    const formData = new FormData(event.currentTarget);
    const response = await uploadMedia(formData);
    
    setResult(response);
    setIsSubmitting(false);

    // 如果成功，清空表單
    if (response.success) {
      formRef.current?.reset();
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium ">
          媒體名稱
        </label>
        <input
          type="text"
          name="name"
          id="name"
          required
          className="input my-[20px] w-[90%]"
          placeholder="例如：網站主 Logo"
        />
      </div>

      <div>
        <label htmlFor="asset_type" className="block text-sm font-medium ">
          图片類型
        </label>
        <select
          id="asset_type"
          name="asset_type"
          required
          className="select my-[20px] w-[90%] text-[var(--foreground)]"
        >
          <option value="logo">Logo</option>
          <option value="promo_banner">推廣橫幅 (Promo Banner)</option>
          <option value="promo_image">推廣圖片 (Promo Image)</option>
          <option value="promo_video">推廣視頻 (Promo Video)</option>
          <option value="pm_guest">访客页广告</option>
          <option value="pm_merchants">商户页广告</option>
          <option value="pm_worker">工作者页广告</option>
        </select>
      </div>

      <div>
        <label htmlFor="file" className="block text-sm font-medium ">
          選擇文件
        </label>
        <input
          type="file"
          name="file"
          id="file"
          required
          className=" my-[20px] w-[90%]"
        />
      </div>

      <div className="flex items-center">
        <input
          id="is_active"
          name="is_active"
          type="checkbox"
          defaultChecked
          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
          立即啟用
        </label>
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-wide"
        >
          {isSubmitting ? '正在上傳...' : '上傳'}
        </button>
      </div>

      {result && (
        <div className={`p-4 rounded-md text-sm ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {result.message}
        </div>
      )}
    </form>
  );
}