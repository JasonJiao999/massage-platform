// next.config.mjs (最终修复版)

/** @type {import('next').NextConfig} */
const nextConfig = {
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
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/8.x/initials/svg/**',
      },
    ],
  },
  // 【核心修复】: 完善 CSP 头部配置
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            // 在 script-src 中添加 'unsafe-inline' 以允许内联脚本执行
            // 这是 Next.js 正常运行和谷歌翻译初始化所必需的
            value: "script-src 'self' 'unsafe-inline' 'unsafe-eval' translate.google.com translate.googleapis.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;