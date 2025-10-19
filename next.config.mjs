// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // 【核心修复】: 使用 remotePatterns 来声明所有外部图片源
    remotePatterns: [
      {
        protocol: 'https',
        // 请确保这个域名和您Supabase项目的URL完全一致
        hostname: 'lwtvwliusnzjjrrhjyeq.supabase.co', 
        port: '',
        // 允许加载 public 存储桶下的所有图片
        pathname: '/storage/v1/object/public/**', 
      },
    ],
  },
  
  // 保留您为谷歌翻译设置的 headers 配置
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            // 注意：一个更安全的CSP会包含 img-src。暂时我们先保持原样。
            value: "script-src 'self' 'unsafe-inline' 'unsafe-eval' translate.google.com translate.googleapis.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;