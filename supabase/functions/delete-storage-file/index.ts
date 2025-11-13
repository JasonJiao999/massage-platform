import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const { record } = await req.json() // 从触发器接收到的旧记录数据

  // 收集所有可能的文件路径
  const filePaths: string[] = []
  if (record?.photo_urls) {
    // 假设 photo_urls 是一个字符串，包含多个 URL，用逗号或特定分隔符分隔，或者是一个 JSON 数组
    // 如果是 JSON 数组：
    try {
      const urls = JSON.parse(record.photo_urls);
      if (Array.isArray(urls)) {
        filePaths.push(...urls);
      } else if (typeof record.photo_urls === 'string' && record.photo_urls.includes(',')) {
        // 如果是逗号分隔的字符串
        filePaths.push(...record.photo_urls.split(',').map((url: string) => url.trim()));
      } else {
        filePaths.push(record.photo_urls); // 单个 URL 字符串
      }
    } catch (e) {
      // 如果不是有效的 JSON，就当作单个 URL 或逗号分隔的字符串处理
      if (typeof record.photo_urls === 'string' && record.photo_urls.includes(',')) {
        filePaths.push(...record.photo_urls.split(',').map((url: string) => url.trim()));
      } else {
        filePaths.push(record.photo_urls); // 单个 URL 字符串
      }
    }
  }
  if (record?.video_urls) {
    // 同样处理 video_urls，假设它是单个 URL 或逗号分隔的字符串或 JSON 数组
    try {
      const urls = JSON.parse(record.video_urls);
      if (Array.isArray(urls)) {
        filePaths.push(...urls);
      } else if (typeof record.video_urls === 'string' && record.video_urls.includes(',')) {
        filePaths.push(...record.video_urls.split(',').map((url: string) => url.trim()));
      } else {
        filePaths.push(record.video_urls);
      }
    } catch (e) {
      if (typeof record.video_urls === 'string' && record.video_urls.includes(',')) {
        filePaths.push(...record.video_urls.split(',').map((url: string) => url.trim()));
      } else {
        filePaths.push(record.video_urls);
      }
    }
  }
  if (record?.qr_url) {
    filePaths.push(record.qr_url)
  }

  if (filePaths.length === 0) {
    return new Response('No file paths found in record for deletion.', { status: 200 })
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })

  const results: { path: string, status: string, error?: string }[] = []

  for (const filePath of filePaths) {
    if (!filePath) continue; // 跳过空的路径

    const storagePathParts = filePath.split('/public/');
    if (storagePathParts.length < 2) {
      console.warn(`Skipping invalid file URL format: ${filePath}`);
      results.push({ path: filePath, status: 'skipped', error: 'Invalid URL format' });
      continue;
    }
    const fullStoragePath = storagePathParts[1];
    const bucketName = fullStoragePath.split('/')[0];
    const pathInBucket = fullStoragePath.substring(bucketName.length + 1);

    try {
      const { error } = await supabaseAdmin.storage.from(bucketName).remove([pathInBucket]);

      if (error) {
        console.error(`Error deleting file ${filePath} from storage:`, error.message);
        results.push({ path: filePath, status: 'failed', error: error.message });
      } else {
        console.log(`Successfully deleted file: ${filePath}`);
        results.push({ path: filePath, status: 'success' });
      }
    } catch (e) {
      console.error(`Caught error deleting file ${filePath}:`, e.message);
      results.push({ path: filePath, status: 'failed', error: e.message });
    }
  }

  const failedDeletions = results.filter(r => r.status === 'failed');
  if (failedDeletions.length > 0) {
    return new Response(JSON.stringify({ message: 'Some files failed to delete', results }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  } else {
    return new Response(JSON.stringify({ message: 'All relevant files processed.', results }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
})