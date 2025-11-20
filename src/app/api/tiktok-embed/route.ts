// src/app/api/tiktok-embed/route.ts
// 这是一个 Next.js 13+ 的 App Router API 路由

import { NextResponse } from 'next/server';

/**
 * 处理 GET 请求，用于调用 TikTok oEmbed API 获取视频嵌入 HTML。
 * * @param req Next.js Request 对象
 * @returns 包含嵌入 HTML 或错误信息的 JSON 响应
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tiktokUrl = searchParams.get('url');

  if (!tiktokUrl) {
    return NextResponse.json({ success: false, message: 'Missing TikTok URL parameter.' }, { status: 400 });
  }

  // 1. 构造 TikTok oEmbed API 端点
  const oembedEndpoint = `https://www.tiktok.com/oembed?url=${encodeURIComponent(tiktokUrl)}`;

  try {
    // 2. 发起服务器端请求
    const response = await fetch(oembedEndpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // 避免 Vercel 缓存旧的 TikTok 响应
      cache: 'no-store', 
    });

    if (!response.ok) {
      console.error(`TikTok oEmbed API failed: ${response.status} - ${response.statusText}`);
      return NextResponse.json({ success: false, message: `Failed to fetch TikTok embed HTML from API. Status: ${response.status}` }, { status: 500 });
    }

    // 3. 解析 JSON 响应
    const data = await response.json();
    const htmlEmbed = data.html; // 获取完整的 HTML 嵌入代码

    if (htmlEmbed) {
      // <--- 关键修改点 --->
      // 不再尝试提取 iframe src，直接返回完整的 HTML 片段
      return NextResponse.json({ success: true, html: htmlEmbed });
      // <--- 结束关键修改点 --->
    }

    return NextResponse.json({ success: false, message: 'Could not retrieve embed HTML from TikTok response.' }, { status: 500 });

  } catch (error: any) {
    console.error('Error in /api/tiktok-embed:', error);
    return NextResponse.json({ success: false, message: `Internal server error: ${error.message}` }, { status: 500 });
  }
}