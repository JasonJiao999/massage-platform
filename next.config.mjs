// next.config.mjs (已修复 ERR_INVALID_CHAR 和完整的 TikTok CSP 规则)

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
    ],
  },
  
  async headers() {
    // -----------------------------------------------------------------------
    // 定义完整的 Content Security Policy (CSP) 规则
    // -----------------------------------------------------------------------
    const cspDirectives = [
        // 默认策略：阻止未显式允许的任何资源
        "default-src 'self'",
        
        // 核心 X/Twitter 脚本源：platform.twitter.com (用于 widgets.js)
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' translate.google.com translate.googleapis.com https://platform.twitter.com",
        
        // 框架：允许在 iframe 中嵌入 X/Twitter 内容 (核心 iframe 源)
        "frame-src 'self' https://platform.twitter.com https://syndication.twitter.com",
        
        // 连接：允许脚本进行必要的 API 连接 (用于加载数据)
        "connect-src 'self' https://api.twitter.com https://syndication.twitter.com", 

        // 图片：允许自身、data:、Supabase 和 X/Twitter CDN
        "img-src 'self' data: https://lwtvwliusnzjjrrhjyeq.supabase.co https://pbs.twimg.com", // pbs.twimg.com 是 X 的 CDN

        "style-src 'self' 'unsafe-inline'",
    ];

    // 使用数组 join(';') 来构建 CSP 字符串，确保分隔符正确且无换行
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