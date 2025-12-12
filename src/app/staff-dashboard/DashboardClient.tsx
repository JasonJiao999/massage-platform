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
  FaShieldAlt,
  FaDownload, 
  FaCopy      
} from 'react-icons/fa';
import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import USDTPaymentButton from '@/components/payment/USDTPaymentButton';

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
  subscription_status: string | null;     
  subscription_expires_at: string | null; 
} | null; 

export default function DashboardClient({ stats, profile }: { stats: DashboardStats, profile: Profile }) {
  
  // 2. (新增) 用於控制教程窗口的 State
  const [showTutorialModal, setShowTutorialModal] = useState(false);
// --- (*** 1. 為兩個分享功能設置獨立的 State ***) ---
  const [referralUrl, setReferralUrl] = useState('');
  const [referralCopied, setReferralCopied] = useState(false);
  
  const [profileShareUrl, setProfileShareUrl] = useState('');
  const [profileCopied, setProfileCopied] = useState(false);
  
  useEffect(() => {
    const tutorialSeen = getCookie('worker_tutorial_seen');
    if (tutorialSeen !== 'true') {
      setShowTutorialModal(true); 
    }

    // 在客戶端組件加載時生成兩個 URL
    if (profile?.referral_code) {
      setReferralUrl(`${window.location.origin}/register?ref=${profile.referral_code}`);
    }
    if (profile?.id) {
      setProfileShareUrl(`${window.location.origin}/worker/${profile.id}`);
    }
  }, [profile]); // 依賴 profile 對象

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

// 【步驟 5.A.4】: 新增訂閱狀態計算邏輯
  const getDaysRemaining = () => {
    if (!profile?.subscription_expires_at) return 0;
    const expiryDate = new Date(profile.subscription_expires_at);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    // 使用 Math.ceil 確保剩餘 1.1 天也算作 2 天
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays < 0 ? 0 : diffDays; // 如果已過期，返回 0
  };

  const daysRemaining = getDaysRemaining();
  // 判斷是否活躍：狀態為 'active' 且 剩餘天數 > 0
  const isActive = profile?.subscription_status === 'active' && daysRemaining > 0;


// --- (*** 2. 創建兩組獨立的輔助函數 ***) ---

  // 推薦碼的輔助函數
  const handleDownloadReferralQR = () => {
    const canvas = document.getElementById('referral-qr-canvas') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = "aofiw-referral-qr.png";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const handleCopyReferralUrl = () => {
    if (!referralUrl) return;
    navigator.clipboard.writeText(referralUrl).then(() => {
      setReferralCopied(true);
      setTimeout(() => setReferralCopied(false), 2000); 
    });
  };

  // 個人主頁的輔助函數
  const handleDownloadProfileQR = () => {
    const canvas = document.getElementById('profile-share-qr-canvas') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = "aofiw-profile-qr.png"; // 不同的文件名
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const handleCopyProfileUrl = () => {
    if (!profileShareUrl) return;
    navigator.clipboard.writeText(profileShareUrl).then(() => {
      setProfileCopied(true);
      setTimeout(() => setProfileCopied(false), 2000); 
    });
  };

return (
<div className="flex w-full max-w-[1200px] justify-center flex-col">
  
{/* --- (*** 新增：訂閱狀態橫幅 ***) --- */}
      {!isActive && (
        <div className="card bg-[var(--color-third)] text-white text-center w-full my-[10px]">
          <h2 className="font-bold text-xl">การสมัครสมาชิกของคุณหมดอายุแล้ว!</h2>
          <p>ข้อมูลของคุณจะไม่สามารถเข้าถึงได้โดยผู้เยี่ยมชมเว็บไซต์อีกต่อไป</p>
          <p className="mt-2">กรุณาติดต่อฝ่ายบริการลูกค้า Telegram ( https://t.me/aofiwvip ) </p>
        </div>
      )}
      {isActive && daysRemaining <= 7 && (
        <div className="card bg-[var(--color-third)] text-white  text-center w-full my-[10px]">
          <h2 className="font-bold text-xl">การสมัครสมาชิกของคุณกำลังจะหมดอายุ!</h2>
          <p>การสมัครของคุณเหลือเวลาอีก {daysRemaining} วัน</p>
        </div>
      )}
      {/* 【新增】情況 3：訂閱活躍且剩餘時間大於 7 天 */}
      {isActive && daysRemaining > 7 && (
        <div className="card bg-[var(--color-third)] text-white  text-center w-full my-[10px]">
          <h2 className="font-bold text-xl px-[10px] ">สถานะการสมัคร: ใช้งานอยู่ | การสมัครของคุณเหลือเวลาอีก {daysRemaining} วัน</h2>
        </div>
      )}
      {/* --- (*** 橫幅結束 ***) --- */}



  {/* --- (新增) 首次訪問的教程窗口 --- */}
  {showTutorialModal && (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 mx-[auto]">
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


  <div className="grid grid-cols-1 min-[768px]:grid-cols-3 gap-[20px] w-full text-[var(--foreground)] my-[10px] max-w-[1200px]">
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
    {/* 
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
     */}
  </div>

  <div className="grid grid-cols-1 min-[768px]:grid-cols-2 gap-[20px] w-full text-[var(--foreground)] my-[10px]">
{/* --- (*** 3. 更新 JSX：使用 flex-wrap 讓兩個卡片並排或換行 ***) --- */}
 

    {/* --- 卡片 1：推薦分享卡片 (Referral) --- */}
    {profile?.referral_code && referralUrl && (
      <div className="card bg-primary text-[var(--foreground)] w-full">
        <div className="p-[20px] flex flex-col items-center">
        <h3 className="text-xl font-bold mb-4">แชร์รหัสอ้างอิงของคุณ (Share Your Code)</h3>
        
        <div className="bg-white p-4 rounded-lg">
          <QRCodeCanvas 
            id="referral-qr-canvas" // 獨立 ID
            value={referralUrl} 
            size={200} 
            bgColor={"#ffffff"} 
            fgColor={"#000000"} 
            level={"H"}
          />
        </div>
        
        <button onClick={handleDownloadReferralQR} className="btn btn-wide mt-4">
          <FaDownload className="mr-2" />
          ดาวน์โหลด QR Code (Download)
        </button>
        
        <label className="block text-sm font-medium mt-6  w-full">ลิงก์แนะนำของคุณ (Your Referral Link)</label>
        <div className="flex w-full">
          <input 
            type="text" 
            value={referralUrl} 
            readOnly 
            className="input w-full"
          />
          <button onClick={handleCopyReferralUrl} className="btn btn-square ml-2">
            {referralCopied ? '✓' : <FaCopy />}
          </button>
        </div>
        {referralCopied && <p className="text-green-400 text-sm mt-2">คัดลอกแล้ว! (Copied!)</p>}
        </div>
      </div>
    )}
    {/* --- 推薦卡片結束 --- */}


    {/* --- 卡片 2：個人主頁分享 (Profile) --- */}
    {profile?.id && profileShareUrl && (
      <div className="card bg-primary text-[var(--foreground)] w-full">
        <div className="p-[20px] flex flex-col items-center">
        <h3 className="text-xl font-bold mb-4">แชร์โปรไฟล์ของคุณ (Share Your Profile)</h3>
        
        {/* QR 碼 */}
        <div className="bg-white">
          <QRCodeCanvas 
            id="profile-share-qr-canvas" // 獨立 ID
            value={profileShareUrl} 
            size={200} 
            bgColor={"#ffffff"} 
            fgColor={"#000000"} 
            level={"H"}
          />
        </div>
        
        {/* 下載按鈕 */}
        <button onClick={handleDownloadProfileQR} className="btn btn-wide w-full">
          <FaDownload className="mr-2" />
          ดาวน์โหลด QR โปรไฟล์ (Download Profile QR)
        </button>
        
        {/* 推薦連結 */}
        <label className="block text-sm font-medium   w-full">ลิงก์โปรไฟล์ของคุณ (Your Profile Link)</label>
        <div className="flex w-full">
          <input 
            type="text" 
            value={profileShareUrl} 
            readOnly 
            className="input w-full"
          />
          <button onClick={handleCopyProfileUrl} className="btn btn-square ml-2">
            {profileCopied ? '✓' : <FaCopy />}
          </button>
        </div>
        {profileCopied && <p className="text-green-400 text-sm mt-2">คัดลอกแล้ว! (Copied!)</p>}
        </div>
      </div>
    )}
    {/* --- 個人主頁卡片結束 --- */}
    
  </div>

  <div className="grid grid-cols-1 min-[768px]:grid-cols-2 gap-[20px] w-full text-[var(--foreground)] my-[10px]">
    

      {/* Monthly Plan */}
      <div className="card bg-primary w-full">
        <div className="p-[20px]">
          <div>
            <h3 className="font-bold text-xl">แผนรายเดือน (Monthly)</h3>
            <p className="text-sm">การเข้าถึงทุกคุณลักษณะเป็นเวลา 30 วัน</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">$10</p>
            <p className="text-sm">USDT</p>
            <p className="text-xs line-through opacity-75">$15</p>
          </div>
          <USDTPaymentButton plan="monthly" className="btn btn-secondary text-[var(--foreground)] w-full" />
        </div>
        
      </div>

      {/* Yearly Plan */}
      <div className="card bg-primary w-full">
        <div className="p-[20px]">
          <div>
            <h3 className="font-bold text-xl">แผนรายปี (Yearly) 🔥</h3>
            <p className="text-sm">การเข้าถึงทุกคุณลักษณะเป็นเวลา 365 วัน ประหยัด 16%!</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">$100</p>
            <p className="text-sm">USDT</p>
            <p className="text-xs line-through opacity-75">$120</p>
          </div>
          <USDTPaymentButton plan="yearly" className="btn btn-secondary text-[var(--foreground)] w-full" />
        </div>
        
      </div>

  </div>

</div>
);
}