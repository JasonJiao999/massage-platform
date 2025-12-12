// next.config.mjs (最终修复版 - 允许视频播放)

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
    const SUPABASE_DOMAIN = 'lwtvwliusnzjjrrhjyeq.supabase.co';
    
    const cspDirectives = [
        "default-src 'self'",

        "script-src 'self' 'unsafe-inline' 'unsafe-eval' translate.google.com translate.googleapis.com https://translate-pa.googleapis.com https://platform.twitter.com",

        "frame-src 'self' https://platform.twitter.com https://syndication.twitter.com https://cdn.syndication.twimg.com https://static.twitter.com https://x.com",

        // Connect-src: 允许所有 API 域名 (包含 Google Translate)
        `connect-src 'self' https://${SUPABASE_DOMAIN} https://api.twitter.com https://syndication.twitter.com https://cdn.syndication.twimg.com https://x.com https://abs.twimg.com https://api.react-tweet.dev https://react-tweet.vercel.app https://translate.googleapis.com https://translate-pa.googleapis.com`,

        "img-src 'self' data: https://lwtvwliusnzjjrrhjyeq.supabase.co https://pbs.twimg.com https://syndication.twimg.com https://fonts.gstatic.com blob:",

        // 【核心修复】: 添加 media-src 以允许 Twitter 视频流
        "media-src 'self' https://video.twimg.com",

        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.gstatic.com",

        "font-src 'self' https://fonts.gstatic.com",
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