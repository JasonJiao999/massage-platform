// src/app/customer-dashboard/ProfileFormClient.tsx
'use client'; 

import { useFormState } from 'react-dom';
import { updateCustomerProfile } from '@/lib/actions'; // <-- 確保路徑正確
import { ProfileData } from './page'; // 導入共享類型
import { 
  FaUser, 
  FaVenusMars, 
  FaPhone, 
  FaLine, 
  FaWeixin, 
  FaWhatsapp,
  FaMapMarkedAlt // <-- 新增
} from 'react-icons/fa';

// 定義表單狀態類型
interface FormState {
  success: boolean;
  message: string;
}

// 初始化表單狀態
const initialState: FormState = {
  success: false,
  message: '',
};

export default function ProfileFormClient({ initialData }: { initialData: ProfileData }) {
  

  const [state, formAction] = useFormState<FormState, FormData>(
    updateCustomerProfile, 
    initialState
  );

  return (
    <form action={formAction} className="card bg-primary w-[340px] p-[24px] items-stretch text-[var(--foreground)] gap-[10px] m-[10px]">
      
      {/* 昵称輸入 */}
      <div>
        <FaUser className="text-2xl mr-3 flex-shrink-0" />
        <label className=" text-sm font-medium ">Name</label>
        <input
          type="text"
          name="full_name"
          defaultValue={initialData.full_name || ''}
          className="input"
        />
      </div>

      {/* K- 个人简介 
      <div>
        <label className=" text-sm font-medium ">Bio</label>
        <textarea
          name="bio"
          defaultValue={initialData.bio || ''}
          rows={3}
          className="textarea"
        />
      </div>*/}

      {/* K- 电话 */}
      <div>
        <FaPhone className="text-2xl mr-3 flex-shrink-0" />
        <label className=" text-sm font-medium ">Tel</label>
        <input
          type="text"
          name="tel"
          defaultValue={initialData.tel || ''}
          className="input"
        />
      </div>
          {/* Line */}
          <div>

              <FaLine className="text-2xl mr-3 flex-shrink-0" />
              <label className=" text-sm font-medium ">Line</label>

            <input 
              type="text" 
              id="social_line" 
              name="social_line" 
              defaultValue={initialData.social_links?.line ?? ''} 
              className=" input"
              placeholder="Your Line ID or URL"
            />
          </div>

          {/* WeChat */}
          <div>

              <FaWeixin className="text-2xl mr-3 flex-shrink-0" />
              <label className=" text-sm font-medium ">WeChat</label>

            <input 
              type="text" 
              id="social_wechat" 
              name="social_wechat" 
              defaultValue={initialData.social_links?.wechat ?? ''} 
              className=" input"
              placeholder="Your WeChat ID"
            />
          </div>

          {/* WhatsApp */}
          <div>

              <FaWhatsapp className="text-2xl mr-3 flex-shrink-0" />
              <label className=" text-sm font-medium ">WhatsApp</label>

            <input 
              type="text" 
              id="social_whatsapp" 
              name="social_whatsapp" 
              defaultValue={initialData.social_links?.whatsapp ?? ''} 
              className=" input"
              placeholder="Your WhatsApp Number or URL"
            />
          </div>
 
          {/* --- (這是新添加的：Google Maps) --- */}
          <div>

              <FaMapMarkedAlt className="text-2xl mr-3 flex-shrink-0" />
              <label className=" text-sm font-medium ">Google Maps URL</label>
            <input 
              type="url" 
              id="social_google_maps" 
              name="social_google_maps" 
              defaultValue={initialData.social_links?.google_maps ?? ''} 
              className=" input"
              placeholder="https://maps.app.goo.gl/..."
            />
          </div>
      {/* 提交按钮 */}
      <button
        type="submit"
        className="btn btn-wide mx-auto mt-[30px]"
      >
        Save
      </button>

      {/* 顯示成功或錯誤消息 */}
      {state.message && (
        <p className={`mt-2 ${state.success ? 'text-green-600' : 'text-red-600'}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}