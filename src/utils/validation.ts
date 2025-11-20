// src/utils/validation.ts (新建或更新)

/**
 * 验证链接是否为有效的 TikTok 或 X/Twitter 视频 URL
 * @param url 待验证的 URL 字符串
 * @returns {boolean} 如果 URL 有效，则返回 true
 */
export function isValidSocialVideoUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    


    // 2. X/Twitter 状态 URL 匹配 (x.com/user/status/id 或 twitter.com/user/status/id)
    // 状态ID (\d+) 对于嵌入是至关重要的
    const twitterRegex = /^(https?:\/\/(?:www\.)?(?:x|twitter)\.com\/\w+\/status\/(\d+))/i;

    return twitterRegex.test(url);
}

// 导出此函数，用于在 Server Action 中调用