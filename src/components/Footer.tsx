import Link from 'next/link';
import React from 'react';
import { FaFacebook, FaInstagram, FaLine, FaTelegram, FaWeixin } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6'; 

export default function Footer() {
  // 獲取當前年份
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { href: 'https://twitter.com/YourAccount', icon: FaXTwitter, label: 'X (Twitter)' },
    { href: 'https://facebook.com/YourAccount', icon: FaFacebook, label: 'Facebook' },
    { href: 'https://instagram.com/YourAccount', icon: FaInstagram, label: 'Instagram' },
    { href: 'https://line.me/ti/p/~YourLineID', icon: FaLine, label: 'Line' },
    { href: 'https://t.me/YourAccount', icon: FaTelegram, label: 'Telegram' },
    { href: 'weixin://dl/chat?YourWeChatID', icon: FaWeixin, label: 'WeChat' },
  ];

  const customerServiceEmail = 'service@yourwebsite.com';

  return (
    // 使用 DaisyUI 的 footer 組件並應用您的主題顏色
    <footer className="footer footer-center p-[24px] card bg-primary text-[var(--foreground)] mt-[20px] max-w-[1150px] mx-auto">
      <nav className="grid grid-flow-col gap-[10px] ">
        <a href={`mailto:${customerServiceEmail}`} className="link link-hover text-[var(--foreground)]">
          Customer Service
        </a>
        <Link href="/terms" className="link link-hover text-[var(--foreground)] ">Terms of Service</Link>
        <Link href="/privacy" className="link link-hover text-[var(--foreground)] ">Privacy Policy</Link>
        <Link href="/moderation" className="link link-hover text-[var(--foreground)] ">Content Moderation & Suspension Policy</Link>
        <Link href="/disclaimer" className="link link-hover text-[var(--foreground)] ">Disclaimer</Link>
      </nav> 

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
              {/* 動態渲染圖標組件 */}
              <link.icon className="w-6 h-6 text-[var(--foreground)]" />
            </a>
          ))}
        </div>
      </nav>

      <aside>
        <p >
          Copyright © {currentYear} - All right reserved by AoFiw.com
          <br />
          This website is only for users aged 18 and over.
        </p>
      </aside>
    </footer>
  );
}