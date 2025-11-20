// src/utils/video-embed.ts

/**
 * 提取 TikTok 视频 ID 或返回 null (如果它是短链接)
 */
export function getTikTokVideoId(url: string | null): string | null {
    if (!url) return null;
    
    // 匹配 tiktok.com/@user/video/VIDEO_ID 格式的完整链接
    const match = url.match(/tiktok\.com\/@([a-zA-Z0-9._-]+)\/video\/(\d+)/);
    if (match && match[2]) {
        return match[2]; // 返回视频 ID
    }

    return null; // 如果是短链接，返回 null
}

/**
 * 转换 TikTok URL 为嵌入 URL
 */
export function getTikTokEmbedUrl(url: string): string {
    const videoId = getTikTokVideoId(url);

    if (videoId) {
        // 如果是长链接，返回 v2 嵌入链接
        return `https://www.tiktok.com/embed/v2/${videoId}`; 
    }

    return url; // 返回原始 URL，我们将在 Client 组件中尝试使用它。
}