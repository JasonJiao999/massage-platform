// filename: src/app/dashboard/DashboardClient.tsx

'use client';

import { useState, useEffect } from 'react';
import StatCard from '@/components/StatCard';
import { 
  FaCalendarCheck, FaCalendarDay, FaDollarSign, FaBan, 
  FaRegChartBar, FaRegCalendarAlt, FaUsers,
  FaTrophy, FaShareAlt, FaShieldAlt, // (新增)
  FaDownload, FaCopy, FaTelegram      // (新增)
} from 'react-icons/fa';
import React from 'react';
import { QRCodeCanvas } from 'qrcode.react'; // (新增)

// --- (新增) Cookie 輔助函數 ---
const setCookie = (name: string, value: string, days: number) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  if (typeof document !== 'undefined') {
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
  }
};

const getCookie = (name: string): string | null => {
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

// 2. (新增) 導入 Profile 類型 (與 staff dashboard 一致)
export type Profile = {
  id: string; 
  points: number | null;
  referral_code: string | null;
  level: string | null; 
} | null;

// 定义从服务器传来的商户统计数据类型
export type MerchantDashboardStats = {
  today_team_bookings_count: number;
  tomorrow_team_bookings_count: number;
  today_team_revenue: number;
  this_month_team_revenue: number;
  this_month_completed_bookings: number;
  this_month_cancelled_bookings: number;
  team_member_count: number;
};

interface DashboardClientProps {
  stats: MerchantDashboardStats;
  profile: Profile;
  shopSlug: string | null;
}

export default function DashboardClient({ stats, profile, shopSlug }: DashboardClientProps) {
  
  // 5. (新增) 添加所有 State
  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const [referralUrl, setReferralUrl] = useState('');
  const [referralCopied, setReferralCopied] = useState(false);
  const [profileShareUrl, setProfileShareUrl] = useState('');
  const [profileCopied, setProfileCopied] = useState(false);

  // 6. (新增) 添加 useEffect
  useEffect(() => {
    // 教程 Cookie (使用不同的名稱)
    const tutorialSeen = getCookie('merchant_tutorial_seen');
    if (tutorialSeen !== 'true') {
      setShowTutorialModal(true); 
    }
    
    // 生成分享 URL
    if (profile?.referral_code) {
      setReferralUrl(`${window.location.origin}/register?ref=${profile.referral_code}`);
    }
    if (shopSlug) {
      // (注意) 商戶分享的是 Shop 頁面
      setProfileShareUrl(`${window.location.origin}/shops/${shopSlug}`);
    }
  }, [profile, shopSlug]); 

  // 7. (新增) 添加所有輔助函數
  const handleTutorialConfirm = () => {
    setCookie('merchant_tutorial_seen', 'true', 365); // 使用新名稱
    setShowTutorialModal(false); 
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { 
      style: 'currency', 
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

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

  const handleDownloadProfileQR = () => {
    const canvas = document.getElementById('profile-share-qr-canvas') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = "aofiw-shop-qr.png"; // (新文件名)
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
    // 8. (修改) 更新 JSX 結構
    <div className="flex w-full justify-center flex-col items-center">

      {/* --- (新增) 商戶教程窗口 --- */}
      {showTutorialModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="card bg-[var(--color-secondary)] text-[var(--foreground)] rounded-lg shadow-2xl max-w-lg w-[500px] p-[24px]">
            <h2 className="text-2xl font-bold mb-4 text-center">歡迎來到您的商戶儀表板</h2>
            <p className="text-md mb-6 text-left">
              這是您管理店鋪和團隊的地方：
            </p>
            <ul className="list-disc list-inside text-left space-y-2 mb-8">
              <li><strong>Team Information:</strong> 設置您店鋪的主頁外觀和主題。</li>
              <li><strong>My Team:</strong> 管理您的員工，查看他們的狀態。</li>
              <li><strong>My Profile:</strong> 編輯您作為商戶的個人信息。</li>
            </ul>
            <button 
              onClick={handleTutorialConfirm}
              className="btn btn-wide mx-auto"
            >
              我明白了
            </button>
          </div>
        </div>
      )}
      {/* --- 教程窗口結束 --- */}

      {/* --- (修改) 統計卡片 (添加商戶積分/等級) --- */}
      <div className="flex w-full flex-wrap text-[var(--foreground)] gap-[10px] mx-auto justify-evenly">
        
        {/* (新增) 積分、等級、推薦碼 */}
        <StatCard 
              title="Account Level" 
              value={profile?.level ?? '1'} 
              icon={<FaShieldAlt className="text-[var(--foreground)]" />}
            />
        <StatCard 
              title="My Points" 
              value={profile?.points ?? 0}
              icon={<FaTrophy className="text-[var(--foreground)]" />}
            />
        <StatCard 
              title="Referral Code" 
              value={profile?.referral_code ?? 'N/A'}
              icon={<FaShareAlt className="text-[var(--foreground)]" />}
            />

        {/* (現有) 商戶統計數據 
        <StatCard 
          title="Today's team booking" 
          value={stats.today_team_bookings_count}
          icon={<FaCalendarDay className="text-blue-500" />} 
        />
        <StatCard 
          title="Tomorrow's team bookings" 
          value={stats.tomorrow_team_bookings_count}
          icon={<FaRegCalendarAlt className="text-blue-500" />}
        />
        <StatCard 
          title="Today's team income" 
          value={formatCurrency(stats.today_team_revenue)}
          icon={<FaDollarSign className="text-green-500" />}
        />
        <StatCard 
          title="Team income this month" 
          value={formatCurrency(stats.this_month_team_revenue)}
          icon={<FaRegChartBar className="text-green-500" />}
        />
        <StatCard 
          title="Complete appointments this month" 
          value={stats.this_month_completed_bookings}
          icon={<FaCalendarCheck className="text-purple-500" />}
        />
        <StatCard 
          title="Cancel appointments this month" 
          value={stats.this_month_cancelled_bookings}
          icon={<FaBan className="text-red-500" />}
        />
        <StatCard 
          title="Team size" 
          value={stats.team_member_count}
          icon={<FaUsers className="text-yellow-500" />}
        />
        */}
      </div>
<div className="flex w-full flex-wrap text-[var(--foreground)] gap-[10px] mx-auto">
      {/* --- (新增) 分享卡片網格 --- */}
      <div className="w-full flex flex-wrap justify-center items-start gap-6 mt-6">

        {/* --- 卡片 1：推薦分享卡片 (Referral) --- */}
        {profile?.referral_code && referralUrl && (
          <div className="card bg-primary text-[var(--foreground)] p-[24px] w-[500px] max-w-md items-center m-[20px]">
            <h3 className="text-xl font-bold mb-4">แชร์รหัสอ้างอิงของคุณ (Share Your Code)</h3>
            <div className="bg-white p-4 rounded-lg">
              <QRCodeCanvas 
                id="referral-qr-canvas"
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
            <label className="block text-sm font-medium mt-6 mb-2 w-full">ลิงก์แนะนำของคุณ (Your Referral Link)</label>
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
        )}
        {/* --- 推薦卡片結束 --- */}

        {/* --- 卡片 2：店鋪主頁分享 (Shop Profile) --- */}
        {shopSlug && profileShareUrl && (
          <div className="card bg-primary text-[var(--foreground)] p-[24px] w-[500px] max-w-md items-center m-[20px]">
            <h3 className="text-xl font-bold mb-4">แชร์โปรไฟล์ร้านค้าของคุณ (Share Your Shop Profile)</h3>
            <div className="bg-white p-4 rounded-lg">
              <QRCodeCanvas 
                id="profile-share-qr-canvas"
                value={profileShareUrl} 
                size={200} 
                bgColor={"#ffffff"} 
                fgColor={"#000000"} 
                level={"H"}
              />
            </div>
            <button onClick={handleDownloadProfileQR} className="btn btn-wide mt-4">
              <FaDownload className="mr-2" />
              ดาวน์โหลด QR โปรไฟล์ (Download Shop QR)
            </button>
            <label className="block text-sm font-medium mt-6 mb-2 w-full">ลิงก์โปรไฟล์ร้านค้า (Your Shop Link)</label>
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
        )}
        {/* --- 店鋪主頁卡片結束 --- */}
        
      </div>
</div>

      {/* --- (新增) 靜態 Telegram 客服卡片 
      <div className="w-full flex justify-center mt-6">
        <div className="card bg-primary text-[var(--foreground)] p-[24px] w-[1090px] max-w-md items-center">
          <h3 className="text-xl font-bold mb-4">聯繫運營客服 (Contact Support)</h3>
          <p className="text-sm mb-4">
            如果您在工作中遇到任何問題，請聯繫我們：
          </p>
          <a 
            href="https://t.me/@LSJ711_com" // <-- 替換為您的客服連結
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-wide" 
          >
            <FaTelegram className="mr-2" />
            聯繫 Telegram 客服
          </a>
        </div>
      </div> --- */}
    </div>
  );
}