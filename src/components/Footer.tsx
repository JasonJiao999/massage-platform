// 文件路徑: src/components/Footer.tsx (已修復 JSX 語法錯誤)

import Link from 'next/link';
import React from 'react';
import { FaTwitter, FaFacebook, FaInstagram, FaLine, FaTelegram, FaWeixin } from 'react-icons/fa';



export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  const socialLinks = [
    { href: 'https://twitter.com/YourAccount', icon: FaTwitter, label: 'X (Twitter)' },
    { href: 'https://facebook.com/YourAccount', icon: FaFacebook, label: 'Facebook' },
    { href: 'https://instagram.com/YourAccount', icon: FaInstagram, label: 'Instagram' },
    { href: 'https://line.me/ti/p/~YourLineID', icon: FaLine, label: 'Line' },
    { href: 'https://t.me/YourAccount', icon: FaTelegram, label: 'Telegram' },
    { href: 'weixin://dl/chat?YourWeChatID', icon: FaWeixin, label: 'WeChat' },
  ];

  const customerServiceEmail = 'service@yourwebsite.com';

  // 【修復】: 整個 JSX 內容必須放在 return() 語句內部
  return (
    
    // 這是您需要的響應式 Footer 容器
    <footer className="footer p-[24px] card bg-primary text-[var(--foreground)] mt-[20px] max-w-[1150px] mx-auto mb-[20px] flex flex-col min-[1200px]:flex-row min-[1200px]:justify-between min-[1200px]:items-center w-full">
   
      {/* 1. 法律條款 (在手機上會自動堆疊) */}
      <nav className="grid grid-flow-col gap-[10px] ">
        <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
        <li><a href={`mailto:${customerServiceEmail}`} className="link link-hover text-[var(--foreground)]">
          Customer Service
        </a></li>
        <li><Link href="/terms" className="link link-hover text-[var(--foreground)] ">Terms of Service</Link></li>
        <li><Link href="/privacy" className="link link-hover text-[var(--foreground)] ">Privacy Policy</Link></li>
        <li><Link href="/moderation" className="link link-hover text-[var(--foreground)] ">Content Moderation & Suspension Policy</Link></li>
        <li><Link href="/disclaimer" className="link link-hover text-[var(--foreground)] ">Disclaimer</Link></li>
        </ul>
      </nav> 

      {/* 2. 社交媒體 (在手機上會自動堆疊) */}
      <nav>
        <div className="grid grid-flow-col gap-[10px] ">
          {socialLinks.map((link) => (
            <a 
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              className="link link-hover"
            >
              <link.icon className="w-6 h-6 text-[var(--foreground)]" />
            </a>
          ))}
        </div>
      </nav>

      {/* 3. 版權和翻譯 (在手機上會自動堆疊) */}
      <aside>
        <p >
          Copyright © {currentYear} - All right reserved by AoFiw.com
          <br />
          This website is only for users aged 18 and over.
        </p>
        <div className='mx-auto'>

        </div>
      </aside>

    </footer>
  );
}