// next.config.mjs (已修复 X/Twitter 和 Supabase 的最终 CSP 版本)

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['sharp'],
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lwtvwliusnzjjrrhjyeq.supabase.co', 
        port: '',
        pathname: '/storage/v1/object/public/**', 
      },
      {
        protocol: 'https',
        hostname: '**.tiktokcdn.com', 
      },
      {
        protocol: 'https',
        hostname: 'p16-sign-va.tiktokcdn.com', 
      },
      // 确保 images 允许 twimg 域名
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com', 
      },
    ],
  },
  
  async headers() {
    // 根据您的存储 URL，假设 Supabase API 域名为 lwtvwliusnzjjrrhjyeq.supabase.co
    const SUPABASE_DOMAIN = 'lwtvwliusnzjjrrhjyeq.supabase.co';
    
    // -----------------------------------------------------------------------
    // 定义涵盖 X/Twitter 和 Supabase 的 Content Security Policy (CSP) 规则
    // -----------------------------------------------------------------------
    const cspDirectives = [
        "default-src 'self'",
        
        // 脚本：确保 platform.twitter.com 被允许
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' translate.google.com translate.googleapis.com https://platform.twitter.com",
        
        // 框架：允许 iframe 源，包括静态内容和 X/Twitter 的主要 CDN
        "frame-src 'self' https://platform.twitter.com https://syndication.twitter.com https://cdn.syndication.twimg.com https://static.twitter.com https://x.com",
        
        // 连接 (核心修复): NEEDS Supabase API 和 X/Twitter 动态数据
        // 1. Supabase API (解决日志中的 connect-src 违规)
        // 2. X/Twitter 核心连接域 (abs.twimg.com 是关键)
        `connect-src 'self' https://${SUPABASE_DOMAIN} https://api.twitter.com https://syndication.twitter.com https://cdn.syndication.twimg.com https://x.com https://abs.twimg.com`, 

        // 图片：允许加载图片、缩略图和 blob: (视频预览/GIF)
        "img-src 'self' data: https://lwtvwliusnzjjrrhjyeq.supabase.co https://pbs.twimg.com https://syndication.twimg.com blob:",

        "style-src 'self' 'unsafe-inline'",
    ];

    const cspValue = cspDirectives.join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspValue,
          },
        ],
      },
    ];
  },
};

export default nextConfig;