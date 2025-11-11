// 文件路徑: app/admin/users/[id]/edit/UserEditForm.tsx

'use client';

import { useState, useTransition } from 'react';
import { useFormState, useFormStatus } from 'react-dom'; 
import { updateUserDetails, deleteUser, adminGrantSubscriptionTime } from '@/lib/actions';

// 擴展 UserProfile 類型以包含所有字段
type UserProfile = {
  id: string;
  nickname: string | null;
  email: string | null;
  bio: string | null;
  role: string | null;
  tel: string | null;
  qr_url: string | null;
  is_active: boolean;
  acc_active: boolean;
  province_id: number | null;
  district_id: number | null;
  sub_district_id: number | null;
  [key: string]: any; 
};

// 您系統中定義的所有用戶角色
const roles = ['customer', 'staff', 'freeman', 'merchant', 'admin'];

// (新增) 提交按鈕組件
function SubmitButton({ text, pendingText }: { text: string, pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn">
      {pending ? (pendingText || '處理中...') : text}
    </button>
  );
}

export default function UserEditForm({ user }: { user: UserProfile }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [grantState, grantAction] = useFormState(adminGrantSubscriptionTime, { success: false, message: '' });
  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const res = await updateUserDetails(formData);
      setResult(res);
    });
  };

  const handleDelete = () => {
    if (confirm(`您確定要刪除用戶 "${user.nickname || user.id}" 的 Profile 嗎？\n此操作無法撤銷！`)) {
      startTransition(async () => {
        try {
          await deleteUser(user.id);
        } catch (error: any) {
          setResult({ success: false, message: error.message });
        }
      });
    }
  };

  return (
  <div className="space-y-6">
    <form action={handleSubmit} className="card bg-primary rounded-lg p-[24px] my-[20px] text-[var(--foreground)]">
      <input type="hidden" name="id" value={user.id} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 暱稱 */}
        <div>
          <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">用戶暱稱</label>
          <input type="text" id="nickname" name="nickname" defaultValue={user.nickname || ''} className="input my-[20px] w-[90%]" />
        </div>

        {/* 郵箱 */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">郵箱</label>
          <input type="email" id="email" name="email" defaultValue={user.email || ''} className="input my-[20px] w-[90%]" />
        </div>

        {/* 電話 */}
        <div>
          <label htmlFor="tel" className="block text-sm font-medium text-gray-700">電話</label>
          <input type="tel" id="tel" name="tel" defaultValue={user.tel || ''} className="input my-[20px] w-[90%]" />
        </div>

        {/* 角色 */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">用戶角色</label>
          <select id="role" name="role" defaultValue={user.role || ''} className="select my-[20px] w-[90%] text-[var(--color-secondary)]">
            {roles.map(role => (<option key={role} value={role}>{role}</option>))}
          </select>
        </div>

        {/* 頭像 URL */}


        {/* 個人簡介 */}
        <div className="md:col-span-2">
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">個人簡介</label>
          <textarea id="bio" name="bio" rows={4} defaultValue={user.bio || ''} className="textarea my-[20px] w-[90%]" />
        </div>

        {/* 地址 ID */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="province_id" className="block text-sm font-medium text-gray-700">省份 ID</label>
            <input type="number" id="province_id" name="province_id" defaultValue={user.province_id || ''} className="input my-[20px] w-[90%]" />
          </div>
          <div>
            <label htmlFor="district_id" className="block text-sm font-medium text-gray-700">區域 ID</label>
            <input type="number" id="district_id" name="district_id" defaultValue={user.district_id || ''} className="input my-[20px] w-[90%]" />
          </div>
          <div>
            <label htmlFor="sub_district_id" className="block text-sm font-medium text-gray-700">街道 ID</label>
            <input type="number" id="sub_district_id" name="sub_district_id" defaultValue={user.sub_district_id || ''} className="input my-[20px] w-[90%]" />
          </div>
        </div>

        {/* 狀態開關 */}
        <div className="md:col-span-2 flex items-center space-x-8 pt-4">
          <div className="relative flex items-start">
            <div className="flex h-6 items-center">
              <input id="acc_active" name="acc_active" type="checkbox" defaultChecked={user.acc_active} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
            </div>
            <div className="ml-3 text-sm leading-6">
              <label htmlFor="acc_active" className="font-medium text-gray-900">賬號激活狀態</label>
              <p className="text-gray-500">控制用戶是否可以登錄和訪問。</p>
            </div>
          </div>
          <div className="relative flex items-start">
            <div className="flex h-6 items-center">
              <input id="is_active" name="is_active" type="checkbox" defaultChecked={user.is_active} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
            </div>
            <div className="ml-3 text-sm leading-6">
              <label htmlFor="is_active" className="font-medium text-gray-900">工作者工作狀態</label>
              <p className="text-gray-500">控制工作者是否可被預約。</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 border-t">
        <button type="submit" disabled={isPending} className="btn">
          {isPending ? '正在保存...' : '保存更改'}
        </button>
        <button type="button" onClick={handleDelete} disabled={isPending} className="btn">
          {isPending ? '處理中...' : '刪除用戶'}
        </button>
      </div>

      {result && (
        <p className={`mt-4 text-sm font-medium ${result.success ? 'text-green-600' : 'text-red-600'}`}>{result.message}</p>
      )}
    </form>

{/* --- (*** 新增) 表單 2: 手動訂閱管理 *** --- */}
      {/* (僅當用戶是工作者時顯示此表單) */}
      {(user.role === 'freeman' || user.role === 'staff') && (
        <form action={grantAction} className="card bg-primary rounded-lg p-[24px] my-[10px] text-[var(--foreground)]">
          <h2 className="text-xl font-bold mb-4">手動訂閱管理</h2>
          <input type="hidden" name="userId" value={user.id} />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 授予天數 */}
            <div>
              <label htmlFor="daysToAdd" className="block text-sm font-medium">授予天數 (必填)</label>
              <input type="number" id="daysToAdd" name="daysToAdd" required defaultValue="30" className="input my-[10px] w-[90%]" />
            </div>
            
            {/* 支付金額 (可選) */}
            <div>
              <label htmlFor="amountPaid" className="block text-sm font-medium">支付金額 (THB)</label>
              <input type="number" id="amountPaid" name="amountPaid" defaultValue="0" step="0.01" className="input my-[10px] w-[90%]" />
            </div>

            {/* 支付方式 */}
            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium">支付/贈送方式</label>
              <select id="paymentMethod" name="paymentMethod" defaultValue="admin_gift" className="select my-[10px] w-[90%] text-[var(--color-secondary)]">
                <option value="admin_gift">管理員贈送 (Gift)</option>
                <option value="bank_transfer">銀行轉帳 (Bank)</option>
                <option value="cash">現金 (Cash)</option>
              </select>
            </div>
          </div>

          {/* 備註 */}
          <div className="mt-4">
            <label htmlFor="notes" className="block text-sm font-medium">備註 (可選)</label>
            <input type="text" id="notes" name="notes" placeholder="例如PromptPay 截圖已確認" className="input my-[10px] w-[95%]" />
          </div>

          {/* 提交按鈕 */}
          <div className="mt-6">
            <SubmitButton text="確認添加訂閱" pendingText="正在授予..." />
          </div>

          {/* 顯示結果 */}
          {grantState?.message && (
            <p className={`mt-4 text-sm font-medium ${grantState.success ? 'text-green-600' : 'text-red-600'}`}>
              {grantState.message}
            </p>
          )}
        </form>
      )}


    </div>
  );
}