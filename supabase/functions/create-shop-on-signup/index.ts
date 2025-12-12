// supabase/functions/create-shop-on-signup/index.ts
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// ------------------- Helper: 生成 slug -------------------
// 这个函数会把店铺名称转换成 URL 友好的 slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // 移除所有非字母、数字、空格和连字符的字符
    .replace(/[\s_-]+/g, '-')     // 将所有空格、下划线和多个连字符替换为单个连字符
    .replace(/^-+|-+$/g, '');     // 移除开头和结尾的连字符
}
// --------------------------------------------------------

serve(async (req: Request) => {
  // 仅接受 POST 请求
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const payload = await req.json();
    console.log('Webhook Payload (Received):', JSON.stringify(payload, null, 2));

    // 检查 Payload 是否是我们期望的 auth.users 表的 INSERT 事件
    if (payload.type !== 'INSERT' || !payload.record || payload.table !== 'users') {
      console.log('Skipping: Not an auth.users INSERT event.');
      return new Response('Not an auth.users INSERT event, skipping.', { status: 200 });
    }

    const newUser = payload.record; // 新创建的用户记录
    const userRole = newUser.raw_user_meta_data?.role; // 从用户元数据中获取角色
    const shopNameOnSignup = newUser.raw_user_meta_data?.shop_name_on_signup; // 从用户元数据中获取店铺名称

    console.log(`Processing user: ${newUser.id}, Role: ${userRole}, Shop Name (from signup): ${shopNameOnSignup}`);

    // 只有当用户角色是 'merchant' 且提供了店铺名称时才创建店铺
    if (userRole === 'merchant' && shopNameOnSignup) { // 注意这里是 'merchant' 小写，与前端保持一致
      const SUPABASE_URL = Deno.env.get('NEXT_PUBLIC_SUPABASE_URL'); // 使用您前端也在使用的公共 URL
      const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'); // <-- ⚠️ 这是 Admin Key

      if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        console.error('Missing Supabase environment variables for Admin Client.');
        return new Response(JSON.stringify({ error: 'Missing Supabase environment variables' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // 使用 Supabase Admin 客户端，因为它需要绕过 RLS 来写入 shops 表
      const supabaseAdmin: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      const newShop = {
        name: shopNameOnSignup,
        slug: generateSlug(shopNameOnSignup), // 自动生成 slug
        owner_id: newUser.id, // 关联店铺到新用户的 ID
        // 如果您的 shops 表有其他默认字段，可以在这里添加
      };

      console.log('Attempting to create shop with data:', newShop);

      const { data: shopData, error: shopError } = await supabaseAdmin
        .from('shops')
        .insert([newShop])
        .select() // 返回创建的记录
        .single(); // 期望只插入一条，所以使用 single

      if (shopError) {
        console.error('Error creating shop in Supabase:', shopError);
        return new Response(JSON.stringify({ error: shopError.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      console.log('Shop created successfully:', shopData);

      // (可选) 如果您在 public.profiles 表中也有 role 字段，可以在这里更新
      // 假设 public.profiles 表的 ID 也是用户的 ID
      const { error: profileUpdateError } = await supabaseAdmin
        .from('profiles')
        .update({ role: userRole }) // 更新 profile 表的 role 字段
        .eq('id', newUser.id);

      if (profileUpdateError) {
        console.error('Error updating user profile role in public.profiles:', profileUpdateError);
      } else {
        console.log('Profile role updated successfully.');
      }

      return new Response(JSON.stringify({ success: true, shop: shopData }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('Skipping: User is not a Merchant or no shop name provided.');
    return new Response('User is not a Merchant or no shop name provided, skipping shop creation.', { status: 200 });

  } catch (error: any) {
    console.error('Edge Function runtime error:', error.message, error.stack);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});