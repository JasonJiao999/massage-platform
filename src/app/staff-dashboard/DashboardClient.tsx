// src/app/staff-dashboard/DashboardClient.tsx (已更新，包含首次訪問的教程窗口)
'use client';

// 1. 導入 useState 和 useEffect
import { useState, useEffect } from 'react';
import StatCard from '@/components/StatCard';
import { 
  FaCalendarCheck, 
  FaCalendarDay, 
  FaDollarSign, 
  FaBan, 
  FaRegChartBar, 
  FaRegCalendarAlt,
  FaTrophy, 
  FaShareAlt,
  FaShieldAlt
} from 'react-icons/fa';
import React from 'react';

// --- (新增) 用於操作 Cookie 的輔助函數 ---
const setCookie = (name: string, value: string, days: number) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  // 確保在瀏覽器環境下才設置 cookie
  if (typeof document !== 'undefined') {
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
  }
};

const getCookie = (name: string): string | null => {
  // 確保在瀏覽器環境下才讀取 cookie
  if (typeof document === 'undefined') {
    return null;
  }
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for(let i=0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};
// --- 輔助函數結束 ---

// 类型定义保持不变
export type DashboardStats = {
  today_bookings_count: number;
  tomorrow_bookings_count: number;
  today_revenue: number;
  this_month_revenue: number;
  completed_bookings_count: number;
  cancelled_by_customer_count: number;
};

export type Profile = {
  id: string; 
  points: number | null;
  referral_code: string | null;
  level: string | null; 
} | null; 

export default function DashboardClient({ stats, profile }: { stats: DashboardStats, profile: Profile }) {
  
  // 2. (新增) 用於控制教程窗口的 State
  const [showTutorialModal, setShowTutorialModal] = useState(false);

  // 3. (新增) 檢查 Cookie 並決定是否顯示窗口
  useEffect(() => {
    const tutorialSeen = getCookie('worker_tutorial_seen');
    if (tutorialSeen !== 'true') {
      setShowTutorialModal(true); // 如果 cookie 不存在或不是 'true'，則顯示窗口
    }
  }, []); // 空依賴數組，確保只在組件加載時運行一次

  // 4. (新增) 關閉窗口並設置 Cookie 的處理函數
  const handleTutorialConfirm = () => {
    setCookie('worker_tutorial_seen', 'true', 365); // 設置 cookie，有效期 1 年
    setShowTutorialModal(false); // 關閉窗口
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { 
      style: 'currency', 
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

return (
<div className="flex w-full min-[500px]:max-w-[500px] min-[1200px]:max-w-[1200px] justify-center mb-[200px]">

  {/* --- (新增) 首次訪問的教程窗口 --- */}
  {showTutorialModal && (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="card bg-[var(--color-secondary)] text-[var(--foreground)] rounded-lg shadow-2xl max-w-lg w-[500px] p-[24px]">
        <h2 className="text-2xl font-bold mb-4 text-center">ยินดีต้อนรับสู่คอนโซลการทำงาน</h2>
        <p className="text-md mb-6 text-left">
          บทนำเกี่ยวกับฟังก์ชันคอนโซลหลัก
        </p>
        <ul className="list-disc list-inside text-left space-y-2 mb-8">
          <li><strong>My Profile:</strong> อัปเดตข้อมูลของคุณ คิวอาร์โค้ดบันทึกภาพ Line/WeChat/WhatsApp ของคุณเพื่อให้ติดต่อลูกค้าได้ง่าย ลิงก์โซเชียลบันทึกลิงก์โซเชียลของคุณ ซึ่งคุณสามารถส่งให้ลูกค้าในห้องแชทได้อย่างรวดเร็ว</li>
          <li><strong>My Services:</strong> สร้างและจัดการบริการที่คุณให้</li>
          <li><strong>My schedule:</strong> กำหนดตารางการทำงานและแผนวันหยุดของคุณ</li>
          <li><strong>Customer Management:</strong> ดูและจัดการการนัดหมายจากลูกค้าของคุณ คุณจะได้รับอีเมลแจ้งเตือนจาก AoFiw เมื่อลูกค้านัดหมายเข้ารับบริการของคุณ โปรดตรวจสอบทันที</li>
          <li><strong>My Messages:</strong> นี่คือห้องแชทที่ AoFiw จัดทำขึ้น ช่วยให้คุณสื่อสารกับลูกค้าได้อย่างรวดเร็ว ห้องแชททั้งหมดจะถูกเก็บไว้เพียง 7 วันเท่านั้น หลังจาก 7 วัน ระบบจะลบห้องแชทโดยอัตโนมัติ</li>
        </ul>
        <p className="text-2xl font-bold mb-4 text-center">สังเกต! ห้ามอัพโหลดรูปภาพและวิดีโอเปลือย</p>
        <button 
          onClick={handleTutorialConfirm}
          className="btn btn-wide mx-auto" // 確保按鈕在彈窗中居中
        >
          ฉันเข้าใจ
        </button>
      </div>
    </div>
  )}
  {/* --- 教程窗口結束 --- */}


  <div className="flex w-full flex-wrap text-[var(--foreground)] gap-[10px] mx-auto justify-evenly">
    <StatCard 
          title="ระดับ" 
          value={profile?.level ?? '1'} 
          icon={<FaShieldAlt className="text-[var(--foreground)]" />}
        />
    <StatCard 
          title="คะแนน" 
          value={profile?.points ?? 0}
          icon={<FaTrophy className="text-[var(--foreground)]" />}
        />
    <StatCard 
          title="รหัสอ้างอิง" 
          value={profile?.referral_code ?? 'N/A'}
          icon={<FaShareAlt className="text-[var(--foreground)]" />}
        />
    <StatCard 
      title="นัดวันนี้" 
      value={stats.today_bookings_count}
      icon={<FaCalendarDay className="text-[var(--foreground)]" />} 
    />
    <StatCard 
      title="การจองพรุ่งนี้" 
      value={stats.tomorrow_bookings_count}
      icon={<FaRegCalendarAlt className="text-[var(--foreground)]" />}
    />
    <StatCard 
      title="รายได้วันนี้" 
      value={formatCurrency(stats.today_revenue)}
      icon={<FaDollarSign className="text-[var(--foreground)]" />}
    />
    <StatCard 
      title="รายได้เดือนนี้" 
      value={formatCurrency(stats.this_month_revenue)}
      icon={<FaRegChartBar className="text-[var(--foreground)]" />}
    />
    <StatCard 
      title="นัดหมายเสร็จสิ้น" 
      value={stats.completed_bookings_count}
      icon={<FaCalendarCheck className="text-[var(--foreground)]" />}
    />
    <StatCard 
      title="ยกเลิกการนัดหมาย" 
      value={stats.cancelled_by_customer_count}
      icon={<FaBan className="text-[var(--foreground)]" />}
    />
  </div>

</div>
);
}