// next.config.mjs (已恢复)

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['sharp'],
  },
  
  images: {
    // 这里不应该有 quality 属性
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lwtvwliusnzjjrrhjyeq.supabase.co', 
        port: '',
        pathname: '/storage/v1/object/public/**', 
      },
    ],
  },
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'unsafe-inline' 'unsafe-eval' translate.google.com translate.googleapis.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;