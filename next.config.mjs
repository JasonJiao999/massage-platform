/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // 这是我们之前为 Supabase 添加的规则
      {
        protocol: 'https',
        hostname: 'lwtvwliusnzjjrrhjyeq.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      // 【核心修正】在这里添加 dicebear.com 的新规则
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/8.x/initials/svg/**',
      },
    ],
  },
};

export default nextConfig;