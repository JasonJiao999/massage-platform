// src/lib/actions.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { Resend } from 'resend';
import sharp from 'sharp'; 
import { v4 as uuidv4 } from 'uuid';
import { format, parseISO, addMinutes } from 'date-fns';
import { isValidSocialVideoUrl } from '@/utils/validation';




// Helper function to get the current user and their profile
async function getUserAndProfile(supabase: any) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('User not authenticated.');
  
  const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profileError || !profile) throw new Error('User profile not found.');
  
  return { user, profile };
}


/**
 * 接受邀请成为店铺员工
 */
export async function acceptInvitation(invitationId: string) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { user } = await getUserAndProfile(supabase);

  const { data: invitation, error: invitationError } = await supabase.from('invitations').select('id, shop_id, status').eq('id', invitationId).single();
  if (invitationError || !invitation || invitation.status !== 'pending') {
    throw new Error('Invalid or expired invitation.');
  }

  // 【核心修改】: 插入 staff 表时，不再包含 nickname
  // 只插入关系数据：user_id 和 shop_id
  const { error: insertStaffError } = await supabase.from('staff').insert({
    user_id: user.id,
    shop_id: invitation.shop_id,
  });
  if (insertStaffError) throw insertStaffError;

  const { error: updateProfileError } = await supabase.from('profiles').update({ role: 'staff' }).eq('id', user.id);
  if (updateProfileError) throw updateProfileError;

  const { error: updateInvitationError } = await supabase.from('invitations').update({ status: 'accepted' }).eq('id', invitation.id);
  if (updateInvitationError) throw updateInvitationError;

  revalidatePath('/dashboard/applications');
  redirect('/staff-dashboard');
}

/**
 * 【最终修复版】更新当前用户的个人资料 (包含所有字段 + 地址信息 + 必要的 level 字段)
 */
export async function updateMyProfile(prevState: any, formData: FormData) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 首先，安全地获取已认证的用户和他们的现有 profile
  const { user, profile } = await getUserAndProfile(supabase); // 使用你已有的辅助函数
  
  if (!user || !profile) {
    return { message: 'Authentication required. Please log in.', success: false };
  }
  
  // 1. 获取所有用户可以修改的表单字段
  const nickname = formData.get('nickname') as string;
  const bio = formData.get('bio') as string;
  const years = formData.get('years') ? parseInt(formData.get('years') as string, 10) : null;
  // 注意：我们不再从表单获取 level，因为用户不能修改它
  const tags = formData.get('tags') as string;
  const feature = formData.get('feature') as string;
  const address_detail = formData.get('address_detail') as string;
  const province_id = formData.get('province_id') ? Number(formData.get('province_id')) : null;
  const district_id = formData.get('district_id') ? Number(formData.get('district_id')) : null;
  const sub_district_id = formData.get('sub_district_id') ? Number(formData.get('sub_district_id')) : null;
  const genderValue = formData.get('gender') as string;
  const nationalityValue = formData.get('nationality') as string;

  // 將 "" (空字符串) 轉換為你指定的默認值
  const gender = genderValue === "" ? 'female' : genderValue;
  const nationality = nationalityValue === "" ? 'Thailand' : nationalityValue;

  // 2. 组装 social_links JSON 对象
  const socialLinks = {
    twitter: formData.get('social_twitter') as string,
    instagram: formData.get('social_instagram') as string,
    facebook: formData.get('social_facebook') as string,
    line: formData.get('social_line') as string, 
    tiktok: formData.get('social_tiktok') as string,
    google_photos: formData.get('social_google_photos') as string,
    google_maps: formData.get('social_google_maps') as string,
    wechat: formData.get('social_wechat') as string,
    whatsapp: formData.get('social_whatsapp') as string,
  };

  // 3. 将字符串转换为数组
  const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
  const featureArray = feature ? feature.split(',').map(f => f.trim()) : [];
  
  // 4. 组装包含所有字段的更新对象
  const profileUpdateData = { 
      nickname,
      bio,
      years,
      gender: gender,
      nationality: nationality,   
      level: profile.level, 
      tags: tagsArray,
      feature: featureArray,
      social_links: socialLinks,
      address_detail,
      province_id,
      district_id,
      sub_district_id,
  };

  // 5. 更新 profiles 表
  const { error } = await supabase
    .from('profiles')
    .update(profileUpdateData)
    .eq('id', user.id);

  if (error) {
    console.error("Error updating profile:", error);
    return { message: `Update failed: ${error.message}`, success: false };
  }

  revalidatePath('/staff-dashboard/profile');
  return { message: 'Successfully updated!', success: true, url: '...' };
}


/**
 * 【重命名版】为当前用户删除一张照片
 */
export async function deleteMyProfilePhoto(photoUrl: string) {
    'use server';
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { user } = await getUserAndProfile(supabase);
  
    // 从 URL 中提取文件路径 (例如: user_id/photos/filename.jpg)
    const filePath = photoUrl.substring(photoUrl.indexOf(`/${user.id}/`)).substring(1);
    if (!filePath) throw new Error('Invalid photo URL');
  
    // 【核心修改】: 从 'web-media' Bucket 中删除
    const { error: storageError } = await supabase.storage.from('web-media').remove([filePath]);
    if (storageError) throw storageError;
  
    const { data: profileData, error: profileError } = await supabase.from('profiles').select('photo_urls').eq('id', user.id).single();
    if (profileError) throw profileError;
  
    const updatedUrls = (profileData.photo_urls || []).filter((url: string) => url !== photoUrl);
  
    const { error: updateError } = await supabase.from('profiles').update({ photo_urls: updatedUrls }).eq('id', user.id);
    if (updateError) throw updateError;
  
    revalidatePath('/staff-dashboard/profile');
}



/**
 * 【重命名版】为当前用户上传多个视频 (已修复, 匹配 useFormState 签名)
 */
export async function uploadMultipleMyProfileVideos(prevState: any, formData: FormData): Promise<{ success: boolean; message: string; }> {
    'use server';
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    try { // <-- 【修复 A】: 包裹在 try/catch 中
        const { user } = await getUserAndProfile(supabase);
    
        const files = formData.getAll('videos') as File[];
        // 【修复 B】: 检查空文件并返回状态
        if (!files || files.length === 0 || (files.length === 1 && files[0].size === 0)) {
            return { success: false, message: 'No documents were provided.' };
        }
    
        const { data: profileData, error: profileError } = await supabase.from('profiles').select('video_urls').eq('id', user.id).single();
        if (profileError) throw profileError; // 将被 catch 捕获
        const existingUrls = profileData.video_urls || [];
    
        // 【核心修改】: 使用 'web-media' Bucket 和 'videos' 子文件夹
        const uploadPromises = files.map(file => 
          supabase.storage.from('web-media').upload(`${user.id}/videos/${Date.now()}_${file.name}`, file)
        );
        const uploadResults = await Promise.all(uploadPromises);
    
        const newUrls = [];
        for (const result of uploadResults) {
             if (result.error) throw result.error; // 将被 catch 捕获
             const { data } = supabase.storage.from('web-media').getPublicUrl(result.data.path);
             newUrls.push(data.publicUrl);
        }
    
        const allUrls = [...existingUrls, ...newUrls];
    
        const { error: updateError } = await supabase.from('profiles').update({ video_urls: allUrls }).eq('id', user.id);
        if (updateError) throw updateError; // 将被 catch 捕获
    
        revalidatePath('/staff-dashboard/profile');
        // 【修复 C】: 返回成功的状态
        return { success: true, message: 'Video uploaded successfully!' };
    
    } catch (error: any) {
        // 【修复 D】: 在出错时返回失败的状态
        return { success: false, message: error.message || 'An error has occurred.' };
    }
}





/**
 * 更新用户的嵌入视频链接列表 (最多 3 个)
 */
export async function updateMyProfileVideoLinks(
    updatedVideoUrls: string[] // 接收一个字符串数组
): Promise<{ success: boolean; message: string; }> {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, message: 'User not authenticated.' };
        }

        // 1. 清理和校验数据
        const cleanedUrls = updatedVideoUrls
            .map((url: string) => url.trim()) 
            .filter((url: string) => url.length > 0) 
            .map((url: string) => url.split('?')[0]); 

        // 2. 数量限制校验
        const MAX_VIDEOS = 3;
        if (cleanedUrls.length > MAX_VIDEOS) {
            return { success: false, message: `You can only add up to ${MAX_VIDEOS} video links.` };
        }

        // 3. 链接有效性校验 (仅 TikTok)
        for (const url of cleanedUrls) {
            if (!isValidSocialVideoUrl(url)) {
              return { success: false, message: `Invalid link: ${url}. Only valid X/Twitter status URLs are accepted.` };
            }
        }
        
        // 4. 更新数据库
        // 注意：video_urls 是 TEXT[] 类型，需要一个字符串数组
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ video_urls: cleanedUrls }) // 直接更新为清理和验证后的数组
            .eq('id', user.id);

        if (updateError) {
            console.error('Database update error:', updateError);
            throw updateError;
        }

        revalidatePath('/staff-dashboard/profile');
        return { success: true, message: 'Video links updated successfully!' };

    } catch (error: any) {
        return { success: false, message: error.message || 'An unexpected error occurred while saving links.' };
    }
}
/**
 * 【重命名版】为当前用户删除一个视频
 */
export async function deleteMyProfileVideo(videoUrl: string) {
    'use server';
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { user } = await getUserAndProfile(supabase);
  
    // 从 URL 中提取文件路径
    const filePath = videoUrl.substring(videoUrl.indexOf(`/${user.id}/`)).substring(1);
    if (!filePath) throw new Error('Invalid video URL');
  
    // 【核心修改】: 从 'web-media' Bucket 中删除
    const { error: storageError } = await supabase.storage.from('web-media').remove([filePath]);
    if (storageError) throw storageError;
  
    const { data: profileData, error: profileError } = await supabase.from('profiles').select('video_urls').eq('id', user.id).single();
    if (profileError) throw profileError;
  
    const updatedUrls = (profileData.video_urls || []).filter((url: string) => url !== videoUrl);
  
    const { error: updateError } = await supabase.from('profiles').update({ video_urls: updatedUrls }).eq('id', user.id);
    if (updateError) throw updateError;
  
    revalidatePath('/staff-dashboard/profile');
}

export async function createL2Category(shopId: string, formData: FormData) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not logged in");
  const { data: shop, error: shopError } = await supabase.from('shops').select('id').eq('owner_id', user.id).eq('id', shopId).single();
  if (shopError || !shop) throw new Error("Permission denied or shop does not exist");
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  if (!name) throw new Error("Category name cannot be empty");
  const { error } = await supabase.from('service_categories_L2').insert({ name, description, shop_id: shop.id });
  if (error) {
    console.error("Failed to create L2 category:", error);
    throw new Error("Failed to create category.");
  }
  revalidatePath('/dashboard/services');
}

export async function deleteL2Category(categoryId: string) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not logged in");
  const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single();
  if (!shop) { throw new Error("Permission denied or shop does not exist"); }
  const { error } = await supabase.from('service_categories_L2').delete().eq('id', categoryId).eq('shop_id', shop.id);
  if (error) {
    console.error("Failed to delete L2 category:", error);
    throw new Error("Failed to delete category.");
  }
  revalidatePath('/dashboard/services');
}

export async function updateL2Category(prevState: any, formData: FormData) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: "Error: User not logged in" };
  const categoryId = formData.get('categoryId') as string;
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  if (!categoryId || !name) { return { message: "Error: Category ID and name cannot be empty" }; }
  const { data, error: checkError } = await supabase.from('service_categories_L2').select('shops(owner_id)').eq('id', categoryId).single();
  let ownerId: string | undefined;
  const shopData = data?.shops;
  if (Array.isArray(shopData) && shopData.length > 0) {
    ownerId = shopData[0].owner_id;
  } else if (shopData && !Array.isArray(shopData)) {
    ownerId = (shopData as { owner_id: string }).owner_id;
  }
  if (checkError || !ownerId || ownerId !== user.id) {
    return { message: "Error: Permission denied or category not found" };
  }
  const { error } = await supabase.from('service_categories_L2').update({ name, description }).eq('id', categoryId);
  if (error) {
    console.error("Failed to update L2 category:", error);
    return { message: `Update failed: ${error.message}` };
  }
  revalidatePath('/dashboard/services');
  return { message: 'Category updated successfully!' };
}



export async function updateShopByAdmin(prevState: any, formData: FormData) {
  'use server';
  const shopId = formData.get('shopId') as string;
  if (!shopId) return { message: "Error: Missing Shop ID" };
  const supabaseAdmin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const badges = formData.get('badges') as string;
  const isActive = formData.get('is_active') === 'on';
  const badgesArray = badges ? badges.split(',').map(b => b.trim()) : [];
  const { error } = await supabaseAdmin.from('shops').update({ name, slug, badges: badgesArray, is_active: isActive, }).eq('id', shopId);
  if (error) {
    console.error("Admin failed to update shop:", error);
    return { message: `Update failed: ${error.message}` };
  }
  revalidatePath('/admin/shops');
  revalidatePath(`/admin/shops/${shopId}/edit`);
  return { message: 'Shop updated successfully by admin!' };
}



export async function createService(prevState: any, formData: FormData) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: "Error: User not logged in" };
  const { data: staffProfile } = await supabase.from('staff').select('id, shop_id').eq('user_id', user.id).single();
  if (!staffProfile) {
    return { message: "Error: Could not find staff profile for the current user." };
  }
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const price = parseFloat(formData.get('price') as string);
  const categoryL2Id = formData.get('category_L2_id') as string;
  if (!name || !price || !categoryL2Id) {
    return { message: "Error: Name, price, and category are required." };
  }
  const { error } = await supabase.from('services').insert({ name, description, price, category_L2_id: categoryL2Id, creator_staff_id: staffProfile.id, shop_id: staffProfile.shop_id, });
  if (error) {
    console.error("Error creating service:", error);
    return { message: `Error creating service: ${error.message}` };
  }
  revalidatePath('/staff-dashboard/services');
  return { message: `Service "${name}" created successfully!` };
}

/**
 * 【新架构版】自由人通过商户邮箱加入店铺
 */
export async function joinShopByMerchantEmail(prevState: any, formData: FormData) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { user, profile } = await getUserAndProfile(supabase);
  if (profile.role !== 'freeman') {
    return { message: "Error: Only freelance staff can join a new shop.", success: false };
  }

  const merchantEmail = formData.get('merchant_email') as string;
  if (!merchantEmail) return { message: "Error: Merchant email is required.", success: false };

  const { data: merchantProfile } = await supabase.from('profiles').select('id, role').eq('email', merchantEmail).single();
  if (!merchantProfile || merchantProfile.role !== 'merchant') {
    return { message: "Error: No merchant found with that email address.", success: false };
  }

  const { data: shop } = await supabase.from('shops').select('id, name').eq('owner_id', merchantProfile.id).single();
  if (!shop) return { message: "Error: This merchant does not own a shop.", success: false };

  // 【核心修改】: upsert 操作不再包含 nickname
  // 我们只在 staff 表中建立关系
  const { error: upsertStaffError } = await supabase.from('staff').upsert({
    user_id: user.id,
    shop_id: shop.id,
    is_active: true
  }, { onConflict: 'user_id' });
  if (upsertStaffError) {
    console.error("Failed to join shop:", upsertStaffError);
    return { message: `Error: ${upsertStaffError.message}`, success: false };
  }

  const { error: updateProfileError } = await supabase.from('profiles').update({ role: 'staff' }).eq('id', user.id);
  if (updateProfileError) {
    console.error("Failed to update role:", updateProfileError);
    return { message: `Error: ${updateProfileError.message}`, success: false };
  }

  revalidatePath('/staff-dashboard/profile');
  return { message: `Successfully joined ${shop.name}!`, success: true };
}

/**
 * 【新架构版】员工离开店铺，成为自由职业者 (删除方案)
 */
export async function leaveShop(prevState: any, formData: FormData) {
    'use server';
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
  
    const { user } = await getUserAndProfile(supabase);
  
    try {
      // 步骤1: 删除 staff 表中的“雇佣关系”记录
      const { error: deleteStaffError } = await supabase
        .from('staff')
        .delete()
        .eq('user_id', user.id);
      if (deleteStaffError) throw deleteStaffError;
  
      // 步骤2: 更新 profiles 表中的角色
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({ role: 'freeman' })
        .eq('id', user.id);
      if (updateProfileError) throw updateProfileError;
  
    } catch (error: any) {
      return { message: `Operation failed: ${error.message}`, success: false };
    }
  
    revalidatePath('/staff-dashboard/profile');
    return { message: 'Successfully left the shop! You are now a freelancer.', success: true };
}

//创建服务信息
export async function createMyService(prevState: any, formData: FormData) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. Get current user's profile
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { message: "Error: You must be logged in.", success: false };
  }

  // 2. Check if the user is currently a staff member to get their shop_id
  const { data: staffEntry } = await supabase
    .from('staff')
    .select('id, shop_id')
    .eq('user_id', user.id)
    .single();

  // 3. Get all service data from the form
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const price = parseFloat(formData.get('price') as string);
  const durationValue = parseInt(formData.get('duration_value') as string, 10);
  const durationUnit = formData.get('duration_unit') as string;
  const type = formData.get('type') as string;

  if (!name || isNaN(price) || isNaN(durationValue) || !durationUnit) {
    return { message: "Error: Please fill in all required fields.", success: false };
  }

  // 4. [CORE LOGIC] Insert into the database using the new schema
  const { error } = await supabase.from('services').insert({
    name,
    description,
    price,
    duration_value: durationValue,    // New duration field
    duration_unit: durationUnit,      // New duration field
    type,
    owner_id: user.id,                // [CRITICAL] The service is owned by the user
    shop_id: staffEntry?.shop_id || null, // Optional: The shop it's associated with, if any
  });

  if (error) {
    console.error('Create Service Error:', error);
    return { message: `Creation failed: ${error.message}`, success: false };
  }

  revalidatePath('/staff-dashboard/services');
  return { message: 'Service created successfully!', success: true };
}

// 【updateMyService】: 更新成功后添加公开页面刷新
export async function updateMyService(prevState: any, formData: FormData) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { message: "Error: You must be logged in.", success: false };
  }

  // 从隐藏字段中获取 service_id
  const serviceId = formData.get('service_id') as string;
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const price = parseFloat(formData.get('price') as string);
  const durationValue = parseInt(formData.get('duration_value') as string, 10);
  const durationUnit = formData.get('duration_unit') as string;
  const type = formData.get('type') as string;

  if (!serviceId || !name || isNaN(price) || isNaN(durationValue) || !durationUnit) {
    return { message: "Error: Invalid data provided.", success: false };
  }
  
  // 安全检查：确保用户拥有此服务的所有权
  const { data: service, error: ownerError } = await supabase
    .from('services')
    .select('owner_id')
    .eq('id', serviceId)
    .single();

  if (ownerError || service?.owner_id !== user.id) {
    return { message: "Error: You do not have permission to edit this service.", success: false };
  }

  const { error } = await supabase
    .from('services')
    .update({ name, description, price, duration_value: durationValue, duration_unit: durationUnit, type })
    .eq('id', serviceId);

  if (error) {
    return { message: `Update failed: ${error.message}`, success: false };
  }

  revalidatePath('/staff-dashboard/services');
  revalidatePath(`/worker/${user.id}`); // 刷新工作者公开页面缓存
  return { message: 'Successfully updated!', success: true };
}



// 【deleteMyService】: 软删除/归档逻辑 (假设 is_active 存在以满足业务需求)
export async function deleteMyService(serviceId: string) {
    'use server';
    const supabase = createClient(cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: 'Authentication required. You must be logged in.' };
    }

    try {
        // 1. 安全检查：确保用户拥有此服务的所有权
        const { data: service, error: ownerError } = await supabase
            .from('services')
            .select('owner_id')
            .eq('id', serviceId)
            .single();

        if (ownerError || service?.owner_id !== user.id) {
            return { success: false, message: 'You do not have permission to delete this service.' };
        }

        // 2. 【修复 TS 警告】: 检查关联订单数量 (用于消息中提示)
        const { count, error: bookingCheckError } = await supabase
            .from('bookings') 
            .select('id', { count: 'exact', head: true }) 
            .eq('service_id', serviceId);
        
        // 声明并初始化 bookingCount，消除 TypeScript 警告
        const bookingCount: number = count || 0; 
        
        if (bookingCheckError) {
            console.error('Booking Check Error:', bookingCheckError);
        }
        
        // 3. 【核心修改】: 执行软删除/归档 (假设 is_active 字段已添加)
        // **如果你没有 is_active 字段，这一步会失败。请务必添加该字段。**
        const { error: updateError } = await supabase
            .from('services')
            .update({ is_active: false }) // 执行软删除
            .eq('id', serviceId);

        if (updateError) {
             // 只有在无法归档时才阻止操作，并返回数据库错误
            return { success: false, message: `归档失败: ${updateError.message} (请确保services表有is_active字段)` };
        }

        // 4. 成功后，刷新路径并返回成功信息
        revalidatePath('/staff-dashboard/services');
        revalidatePath(`/worker/${user.id}`); 
        
        const message = bookingCount > 0
            ? `服务已归档。注意: 此服务有 ${bookingCount} 个现有订单，已保留历史记录。`
            : '服务已成功归档。';
            
        return { success: true, message: message };

    } catch (error: any) {
        console.error('Unexpected error in deleteMyService:', error);
        return { success: false, message: error.message || 'An unexpected error occurred.' };
    }
}

/**
 * 顾客或员工取消预约 (更新为月度计数逻辑)
 */
export async function cancelBooking(prevState: any, bookingId: string) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { user, profile } = await getUserAndProfile(supabase);

  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('customer_id, worker_profile_id, status')
    .eq('id', bookingId)
    .single();

  if (fetchError || !booking) {
    return { success: false, message: 'No appointment record found.' };
  }

  const isCustomer = profile.role === 'customer' && booking.customer_id === user.id;
  const isWorker = ['staff', 'freeman'].includes(profile.role) && booking.worker_profile_id === user.id;

  if (!isCustomer && !isWorker) {
    return { success: false, message: 'You do not have the right to cancel this reservation.' };
  }
  
  if (booking.status !== 'confirmed') {
      return { success: false, message: 'Only confirmed reservations can be cancelled.' };
  }

  // 更新预约状态
  const newStatus = isCustomer ? 'cancelled_by_customer' : 'cancelled_by_worker';
  const { error: updateError } = await supabase
    .from('bookings')
    .update({ status: newStatus })
    .eq('id', bookingId);

  if (updateError) {
    return { success: false, message: `取消失败: ${updateError.message}` };
  }
  
  // 【核心修改】: 为取消方增加月度取消次数
  const userIdToIncrement = isCustomer ? booking.customer_id : booking.worker_profile_id;
  
  if (userIdToIncrement) {
      const { error: incrementError } = await supabase.rpc('increment_monthly_cancellation_count', {
          user_id_to_update: userIdToIncrement
      });

      if (incrementError) {
          // 即使计数失败，也应认为取消是成功的
          console.error('Failed to increment cancellation count:', incrementError);
      }
  }

  revalidatePath('/my-bookings');
  revalidatePath('/staff-dashboard/bookings');
  
  return { success: true, message: 'The appointment was successfully canceled.' };
}

/**
 * 工作者创建自己的排班 (最终版 - 同时支持 Freeman 和 Staff)
 */
export async function createSchedule(prevState: any, formData: FormData) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { user } = await getUserAndProfile(supabase);

  // 【核心修改】: 不再需要查询 staff 表，我们直接使用 user.id
  
  const startTime = formData.get('start_time') as string;
  const endTime = formData.get('end_time') as string;

  if (!startTime || !endTime) {
    return { message: "Error: Start and end times cannot be empty.", success: false };
  }

  // 【核心修改】: 插入数据时，使用 worker_profile_id
  const { error } = await supabase.from('schedules').insert({
    worker_profile_id: user.id, // <-- 排班直接归属于当前登录的用户
    start_time: startTime,
    end_time: endTime,
  });

  if (error) {
    return { message: `Failed to create a shift schedule: ${error.message}`, success: false };
  }

  revalidatePath('/staff-dashboard/schedule');
  return { message: 'Schedule added successfully！', success: true };
}

/**
 * 工作者删除自己的排班 (最终版 - 同时支持 Freeman 和 Staff)
 */
export async function deleteSchedule(scheduleId: string) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { user } = await getUserAndProfile(supabase);
  
  // 【核心修改】: 不再需要查询 staff 表

  // 【核心修改】: 安全检查现在基于 worker_profile_id
  // 确保该排班记录属于当前登录的用户
  const { data: schedule, error: fetchError } = await supabase
    .from('schedules')
    .select('worker_profile_id')
    .eq('id', scheduleId)
    .single();

  if (fetchError || !schedule || schedule.worker_profile_id !== user.id) {
    throw new Error('You do not have permission to delete this schedule');
  }

  const { error } = await supabase.from('schedules').delete().eq('id', scheduleId);
  if (error) {
    throw new Error(`Failed to delete the schedule: ${error.message}`);
  }

  revalidatePath('/staff-dashboard/schedule');
}


/**
 * 工作者开始服务 (最终版 - 支持 Freeman 和 Staff)
 */
export async function startService(bookingId: string) {
    'use server';
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    const { user } = await getUserAndProfile(supabase);

    // 【核心修正】: 添加安全检查
    // 1. 获取预约信息，确认它属于当前登录的工作者
    const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select('worker_profile_id, status')
        .eq('id', bookingId)
        .single();

    if (fetchError || !booking) {
        throw new Error('The appointment record cannot be found.');
    }
    if (booking.worker_profile_id !== user.id) {
        throw new Error('You do not have permission to operate this reservation.');
    }
    if (booking.status !== 'confirmed') {
        throw new Error('Only confirmed reservations can start service.');
    }

    // 2. 更新预约状态和实际开始时间
    const { error } = await supabase.from('bookings').update({
        status: 'in_progress',
        actual_start_time: new Date().toISOString()
    }).eq('id', bookingId);

    if (error) throw new Error(error.message);
    revalidatePath('/staff-dashboard/bookings');
}

/**
 * 工作者完成服务 (并触发积分) (最终版 - 支持 Freeman 和 Staff)
 */
export async function completeService(bookingId: string) {
    'use server';
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { user } = await getUserAndProfile(supabase);

    // 【核心修正】: 获取预约信息，我们现在直接使用 worker_profile_id
    const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select('worker_profile_id, status')
        .eq('id', bookingId)
        .single();

if (fetchError || !booking) {
    throw new Error('Booking record not found.');
}

if (booking.worker_profile_id !== user.id) {
    throw new Error('You do not have permission to modify this booking.');
}

if (booking.status !== 'in_progress') {
    // Only bookings with "in_progress" status can be completed to prevent duplicate actions.
    throw new Error('Only bookings with "in_progress" status can be marked as completed.');
}

    // 【核心修正】: 不再需要查询 staff 表
    const { error } = await supabase.from('bookings').update({
        status: 'completed',
        actual_end_time: new Date().toISOString()
    }).eq('id', bookingId);

    if (error) throw new Error(error.message);

    // 【核心修正】: 调用“积分网关”时，直接使用 booking.worker_profile_id
    await supabase.rpc('add_contribution_points', {
        target_user_id: booking.worker_profile_id,
        points_to_add: 10, // 假设完成一次服务加 10 分
        reason: 'COMPLETED_BOOKING',
        booking_ref_id: bookingId
    });

    revalidatePath('/staff-dashboard/bookings');
}

/**
 * 工作者创建长期、可重复的工作规则
 */
export async function createAvailabilityRule(prevState: any, formData: FormData) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { user } = await getUserAndProfile(supabase);

  // 1. 从表单获取所有数据
  const startDate = formData.get('start_date') as string;
  const endDate = formData.get('end_date') as string;
  const startTime = formData.get('start_time') as string;
  const endTime = formData.get('end_time') as string;
  // getAll() 用于获取所有同名（days_of_week）的复选框的值
  const daysOfWeek = formData.getAll('days_of_week').map(day => parseInt(day as string, 10));

  // 2. 数据验证
  if (!startDate || !endDate || !startTime || !endTime || daysOfWeek.length === 0) {
    return { message: "错误：所有字段均为必填项。", success: false };
  }
  if (new Date(endDate) < new Date(startDate)) {
    return { message: "错误：结束日期不能早于开始日期。", success: false };
  }
  if (endTime <= startTime) {
    return { message: "错误：每日结束时间必须晚于开始时间。", success: false };
  }

  // 3. 将数据插入数据库
  const { error } = await supabase.from('availability_rules').insert({
    worker_profile_id: user.id,
    start_date: startDate,
    end_date: endDate,
    start_time: startTime,
    end_time: endTime,
    days_of_week: daysOfWeek,
  });

  if (error) {
    console.error('Create Rule Error:', error);
    return { message: `Failed to create rule: ${error.message}`, success: false };
  }

  revalidatePath('/staff-dashboard/schedule');
  return { message: 'New work plan added successfully！', success: true };
}


/**
 * 工作者为特定日期创建例外（请假或加班）
 */
export async function createAvailabilityOverride(prevState: any, formData: FormData) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { user } = await getUserAndProfile(supabase);

  // 1. 从表单获取数据
  const overrideDate = formData.get('override_date') as string;
  const type = formData.get('type') as 'unavailable' | 'available';
  const startTime = formData.get('start_time') as string | null;
  const endTime = formData.get('end_time') as string | null;

  // 2. 数据验证
if (!overrideDate || !type) {
    return { message: "Error: Date and exception type are required.", success: false };
  }

  if (type === 'available' && (!startTime || !endTime || endTime <= startTime)) {
      return { message: "Error: For 'available' type, a valid start and end time must be provided where the end time is after the start time.", success: false };
  }

  // 3. 准备要插入的数据
  const dataToInsert = {
    worker_profile_id: user.id,
    override_date: overrideDate,
    type,
    start_time: type === 'available' ? startTime : null,
    end_time: type === 'available' ? endTime : null,
  };

  // 4. 将数据插入数据库
  // 使用 upsert 确保一个用户在一天只能有一个例外规则，新的会覆盖旧的
  const { error } = await supabase
    .from('availability_overrides')
    .upsert(dataToInsert, { onConflict: 'worker_profile_id, override_date' });

if (error) {
    console.error('Create Override Error:', error);
    return { message: `Failed to create exception: ${error.message}`, success: false };
  }

  revalidatePath('/staff-dashboard/schedule');
  return { message: `Exception for date ${overrideDate} has been set successfully!`, success: true };
}

export async function getAvailability(workerId: string, targetDate: string) {
    'use server';
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // 在真实应用中，这里将执行我们讨论过的复杂分层逻辑：
    // 1. 查询 availability_rules
    // 2. 查询 availability_overrides
    // 3. 查询 schedules (一次性排班)
    // 4. 查询 bookings
    // 5. 整合计算，返回最终可用的时间段数组
    
    // 作为一个简单的起点，我们先只查询一次性排班
    const { data: oneOffSchedules, error } = await supabase
        .from('schedules')
        .select('start_time, end_time')
        .eq('worker_profile_id', workerId)
        // 此处需要添加日期过滤逻辑...

    if (error) {
        console.error("Get Availability Error:", error);
        return [];
    }

    // 返回时间段数组，例如: [{ start: "2025-10-16T09:00:00", end: "2025-10-16T12:00:00" }]
    return oneOffSchedules || [];
}


/**
 * 删除一条长期工作规则 (带安全检查)
 */
export async function deleteAvailabilityRule(prevState: any, ruleId: string) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { user } = await getUserAndProfile(supabase);

// 1. Permission Check: Ensure the rule belongs to the current user
const { data: rule } = await supabase.from('availability_rules').select('worker_profile_id').eq('id', ruleId).single();
if (!rule || rule.worker_profile_id !== user.id) {
    return { message: "Error: You do not have permission to delete this rule.", success: false };
}

// 2. [Core Security Check]: Call the database function to check for conflicting bookings
const { data: bookingCount, error: checkError } = await supabase.rpc('check_bookings_in_rule', { rule_id: ruleId });
if (checkError || (bookingCount != null && bookingCount > 0)) {
    return { message: `Cannot delete: There are ${bookingCount || ''} active bookings within this rule.`, success: false };
}

// 3. Execute Deletion
const { error } = await supabase.from('availability_rules').delete().eq('id', ruleId);
if (error) {
    return { message: `Deletion failed: ${error.message}`, success: false };
}

revalidatePath('/staff-dashboard/schedule');
return { message: 'The availability rule has been successfully deleted.', success: true };
}


/**
 * 删除一个例外日期 (带安全检查)
 */
export async function deleteAvailabilityOverride(prevState: any, overrideId: string) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { user } = await getUserAndProfile(supabase);

  // 1. 权限检查
  const { data: override } = await supabase.from('availability_overrides').select('worker_profile_id, override_date').eq('id', overrideId).single();
  if (!override || override.worker_profile_id !== user.id) {
    return { message: "Error: You do not have permission to delete this data.", success: false };
  }

  // 2. 【核心安全检查】: 检查该例外日期当天是否存在有效预约
  const { count, error: checkError } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('worker_profile_id', user.id)
    .in('status', ['confirmed', 'in_progress'])
    .gte('start_time', `${override.override_date}T00:00:00Z`)
    .lt('start_time', `${override.override_date}T23:59:59Z`);

  if (checkError || (count != null && count > 0)) {
    return { message: `Deletion failed: ${count} active booking(s) found in the selected date range.`, success: false };
  }
  
  // 3. 执行删除
  const { error } = await supabase.from('availability_overrides').delete().eq('id', overrideId);
  if (error) {
    return { message: `Deletion failed: ${error.message}`, success: false };
  }

  revalidatePath('/staff-dashboard/schedule');
  return { message: 'Special date deleted successfully.', success: true };
}


/**
 * 工作者（技师/自由人）切换自己的在线/休息状态
 */
export async function toggleMyActiveStatus(prevState: any, currentStatus: boolean) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. 获取当前登录的用户信息
  const { user } = await getUserAndProfile(supabase);

  // 2. 更新 profiles 表中 is_active 字段为当前状态的相反值
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: !currentStatus })
    .eq('id', user.id);

  if (error) {
    return { success: false, message: `Update Failed ${error.message}` };
  }

  // 3. 刷新相关页面的缓存，确保状态立即生效
  revalidatePath('/staff-dashboard/profile'); // 刷新技师自己的档案页
  revalidatePath(`/worker/${user.id}`);      // 刷新该技师的公开预约页

  return { success: true, message: 'Status updated successfully!' };
}


export async function resetPassword(prevState: any, formData: FormData) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: '用户未登录或会话已过期。' };
  }

  const password = formData.get('password') as string;
  if (!password || password.length < 6) {
    return { success: false, message: '密码不能为空且至少需要6位。' };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { success: false, message: `密码重置失败: ${error.message}` };
  }

  await supabase.auth.signOut();
  
  // 【核心修复】: 在 redirect 之前，对中文消息进行 URL 编码
  const message = encodeURIComponent('密码已成功重置，请重新登录。');
  redirect(`/login?message=${message}`);
}


export async function deleteShopVideo(prevState: any, formData: FormData) {
    'use server';
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { message: "用户未登录" };

    const shopId = formData.get('shop_id') as string;
    if (!shopId) return { message: "缺少店铺ID" };

    // 【核心修复】: 在查询时，同时 select 'id' 和 'slug'
    const { data: shop } = await supabase
        .from('shops')
        .select('id, slug') // <-- 修改了这里
        .eq('owner_id', user.id)
        .eq('id', shopId)
        .single();
        
    if (!shop) return { message: "权限不足或找不到店铺" };

    // 1. 从数据库获取旧视频URL并删除
    const { data: pageData } = await supabase.from('shop_pages').select('featured_video_url').eq('shop_id', shopId).single();
    if (pageData?.featured_video_url) {
        const oldFilePath = pageData.featured_video_url.split('/web-media/')[1]; // 更稳健地解析路径
        if(oldFilePath) {
            await supabase.storage.from('web-media').remove([oldFilePath]);
        }
    }

    // 2. 将数据库中的URL字段设置为空
    await supabase.from('shop_pages').update({ featured_video_url: null }).eq('shop_id', shopId);

    revalidatePath('/dashboard/shop');
    // 现在 shop.slug 存在了，这一行可以正常工作
    revalidatePath(`/shops/${shop.slug}`); 
    return { message: "视频已成功删除。" };
}



/**
 * 【新】只更新店铺的文本信息
 */
export async function updateShopTextSettings(prevState: any, formData: FormData) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: "错误: 用户未登录" };

  const shopId = formData.get('shop_id') as string;
  if (!shopId) return { message: "错误: 缺少店铺ID" };

  const { data: shop, error: shopError } = await supabase
    .from('shops')
    .select('id, slug')
    .eq('owner_id', user.id)
    .eq('id', shopId)
    .single();

  if (shopError || !shop) {
    return { message: "错误: 找不到店铺或权限不足" };
  }

  const shopUpdateData = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    description: formData.get('description') as string,
    phone_number: formData.get('phone_number') as string,
  };

  const { error: updateShopError } = await supabase.from('shops').update(shopUpdateData).eq('id', shopId);

  if (updateShopError) {
    return { message: `Update Failed: ${updateShopError.message}` };
  }

  revalidatePath('/dashboard/shop');
  revalidatePath(`/shops/${shopUpdateData.slug}`);
  return { message: 'Team information has been successfully updated!' };
}


/**
 * 【新】上传或更新店铺特色视频
 */
export async function uploadShopVideo(prevState: any, formData: FormData) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: "Error: User not logged in." };
  
  const shopId = formData.get('shop_id') as string;
  const videoFile = formData.get('featured_video') as File;

  if (!shopId || !videoFile || videoFile.size === 0) {
    return { message: "Error: ID or video file missing." };
  }

  if (videoFile.size > 50 * 1024 * 1024) {
    return { message: 'Video upload failed: File size cannot exceed 50MB.' };
  }

  const { data: shop } = await supabase.from('shops').select('slug').eq('id', shopId).single();
  if (!shop) return { message: "Error: Data not found" };
  
  // 先删除旧视频
  const { data: oldPageData } = await supabase.from('shop_pages').select('featured_video_url').eq('shop_id', shopId).single();
  if (oldPageData?.featured_video_url) {
    const oldFilePath = oldPageData.featured_video_url.split('/web-media/')[1];
    if(oldFilePath) await supabase.storage.from('web-media').remove([oldFilePath]);
  }

  // 上传新视频
  const filePath = `${user.id}/${shopId}/featured-video-${Date.now()}`;
  const { data, error } = await supabase.storage.from('web-media').upload(filePath, videoFile);
  if (error) return { message: `Update Failed: ${error.message}` };
  
  const publicUrl = supabase.storage.from('web-media').getPublicUrl(data.path).data.publicUrl;

  // 更新数据库
  const { error: upsertPageError } = await supabase.from('shop_pages').upsert({ shop_id: shopId, featured_video_url: publicUrl }, { onConflict: 'shop_id' });
  if (upsertPageError) return { message: `Update Failed: ${upsertPageError.message}` };

  revalidatePath('/dashboard/shop');
  revalidatePath(`/shops/${shop.slug}`);
  return { message: '特色视频已成功更新！' };
}


/**
 * 【带诊断日志的重构版】上传或更新店铺图片
 * 所有图片URL都保存在 shop_pages 表中
 */
export async function uploadShopImage(prevState: any, formData: FormData) {
  'use server';
  console.log('--- [Action Start] uploadShopImage ---');

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. 验证用户身份
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('LOG: User not authenticated.');
    return { message: "Error: User not logged in" };
  }
  console.log(`LOG: Authenticated user ID: ${user.id}`);

  // 2. 从表单获取并记录数据
  const shopId = formData.get('shop_id') as string;
  const imageType = formData.get('image_type') as string;
  const imageFile = formData.get('image_file') as File;

  console.log(`LOG: Received shop_id: "${shopId}"`);
  console.log(`LOG: Received image_type: "${imageType}"`);
  console.log(`LOG: Received file name: "${imageFile?.name}", size: ${imageFile?.size}`);

  if (!shopId || !imageType || !imageFile || imageFile.size === 0) {
    console.error('LOG: Missing required form data.');
    return { message: "Error: Required information missing" };
  }
  
  // 3. 验证店铺所有权 (这是RLS策略的核心)
  const { data: shop, error: shopFetchError } = await supabase
    .from('shops')
    .select('slug, owner_id') // <-- 同时获取 owner_id 用于日志记录
    .eq('id', shopId)
    .single();

  if (shopFetchError || !shop) {
    console.error(`LOG: Shop not found or fetch error for shop_id "${shopId}". Error:`, shopFetchError?.message);
    return { message: "Error: Data not found" };
  }
  console.log(`LOG: Verified shop owner ID: ${shop.owner_id}. Current user ID is ${user.id}.`);

  // 4. 上传文件到 Storage
  const filePath = `${user.id}/${shopId}/${imageType}-${Date.now()}`;
  console.log(`LOG: Uploading to storage path: ${filePath}`);
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('web-media')
    .upload(filePath, imageFile, { upsert: true });

  if (uploadError) {
    console.error('LOG: Storage upload failed.', uploadError);
    return { message: `图片上传失败: ${uploadError.message}` };
  }
  console.log('LOG: Storage upload successful.');

  const publicUrl = supabase.storage.from('web-media').getPublicUrl(uploadData.path).data.publicUrl;
  console.log(`LOG: Public URL generated: ${publicUrl}`);

  // 5. 准备并记录将要写入数据库的数据
  const dataToUpsert = { 
    shop_id: shopId, 
    [imageType]: publicUrl 
  };
  console.log('LOG: Preparing to upsert into "shop_pages" with data:', JSON.stringify(dataToUpsert, null, 2));

  // 6. 将URL更新到 shop_pages 表
  const { error: upsertError } = await supabase
    .from('shop_pages')
    .upsert(dataToUpsert, { onConflict: 'shop_id' });

  // 7. 详细记录最终结果
  if (upsertError) {
    console.error('LOG: Database upsert failed! This is the source of the RLS error.', upsertError);
    // 关键错误分析：打印出详细的错误信息
    console.error(`RLS Error Details: ${upsertError.message}`);
    
    // 自动清理上传失败的文件
    await supabase.storage.from('web-media').remove([filePath]);
    console.log(`LOG: Rolled back storage upload for path: ${filePath}`);
    
    return { message: `Update Failed: ${upsertError.message}` };
  }

  console.log('LOG: Database upsert successful.');
  
  // 8. 刷新缓存
  revalidatePath('/dashboard/shop');
  revalidatePath(`/shops/${shop.slug}`);
  console.log('--- [Action End] uploadShopImage ---');

  const imageTypeMap: { [key: string]: string } = {
    'bg_image_url': 'Team Photos',
    'hero_image_url': 'Advertising banner',
    'cover_image_url': 'Cover image'
  };
  const imageTypeText = imageTypeMap[imageType] || 'Photo';
  return { message: `${imageTypeText}Updated successfully!` };
}


/**
 * 将一个工作者添加到用户的收藏列表
 */
export async function addFavoriteWorker(workerProfileId: string) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // 在实际应用中，前端应该阻止未登录用户点击按钮
    // 但后端验证是必须的
    return { success: false, message: '用户未登录' };
  }

  const { error } = await supabase.from('favorite_workers').insert({
    user_id: user.id,
    worker_profile_id: workerProfileId,
  });

  if (error) {
    // 可能是因为已经收藏过了 (违反主键约束)
    console.error('Add favorite error:', error.message);
    return { success: false, message: '收藏失败' };
  }

  // 刷新首页和后台页面的缓存
  revalidatePath('/');
  revalidatePath('/dashboard');
  return { success: true, message: '已收藏' };
}

/**
 * 从用户的收藏列表中移除一个工作者
 */
export async function removeFavoriteWorker(workerProfileId: string) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: '用户未登录' };
  }

  const { error } = await supabase
    .from('favorite_workers')
    .delete()
    .eq('user_id', user.id)
    .eq('worker_profile_id', workerProfileId);

  if (error) {
    console.error('Remove favorite error:', error.message);
    return { success: false, message: '取消收藏失败' };
  }

  revalidatePath('/');
  revalidatePath('/dashboard');
  return { success: true, message: '已取消收藏' };
}
export async function updateCustomerProfile(prevState: any, formData: FormData) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. 身份驗證 (使用 getUserAndProfile 會更安全，但我們先用 getUser)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'User is not logged in.' };

  // 2. 獲取「客戶」表單中的所有字段
  const fullName = formData.get('full_name') as string;
  const bio = formData.get('bio') as string;
  const tel = formData.get('tel') as string;
  const gender = formData.get('gender') as string;
  const nationality = formData.get('nationality') as string;

  if (!fullName) {
    return { success: false, message: 'Name (full_name) cannot be empty.' };
  }

  // 3. (*** 這是關鍵修復 ***)
  // 组装 social_links JSON 对象 (包含客戶的所有字段)
  const socialLinks = {
    line: formData.get('social_line') as string, 
    wechat: formData.get('social_wechat') as string,
    whatsapp: formData.get('social_whatsapp') as string,
    google_maps: formData.get('social_google_maps') as string,
  };

  // 4. 组装更新对象
  const profileUpdateData = { 
      full_name: fullName,
      bio: bio,
      tel: tel,
      gender: gender,
      nationality: nationality,
      social_links: socialLinks,
      // (我們不更新 level, tags, feature 等字段)
  };

  // 5. 更新 profiles 表
  const { error } = await supabase
    .from('profiles')
    .update(profileUpdateData) // <-- 使用包含所有數據的對象
    .eq('id', user.id); 

  if (error) {
    console.error("Error updating customer profile:", error);
    return { success: false, message: `Update Failed: ${error.message}` };
  }

  // 6. 重新驗證正確的儀表板路徑
  revalidatePath('/customer-dashboard/profile'); // <-- 確保這是客戶的個人資料路徑
  return { success: true, message: 'Updated successfully!' };
}


// --- 辅助函数：处理图片并上传 ---
async function processAndUploadImage(supabase: any, file: File, bucket: string, path: string): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  const image = sharp(buffer);
  const metadata = await image.metadata();

  // 设置3:4比例的目标尺寸
  const targetAspectRatio = 3/4; // 宽高比 3:4
  
  let targetWidth: number;
  let targetHeight: number;

  if (metadata.width && metadata.height) {
    const originalAspectRatio = metadata.width / metadata.height;
    
    if (originalAspectRatio > targetAspectRatio) {
      // 原图比3:4更宽，以高度为基准
      targetHeight = Math.max(720, Math.min(metadata.height, 1600));
      targetWidth = Math.round(targetHeight * targetAspectRatio);
    } else if (originalAspectRatio < targetAspectRatio) {
      // 原图比3:4更高，以宽度为基准
      targetWidth = Math.max(540, Math.min(metadata.width, 1200));
      targetHeight = Math.round(targetWidth / targetAspectRatio);
    } else {
      // 原图正好是3:4比例
      targetWidth = Math.max(540, Math.min(metadata.width, 1200));
      targetHeight = Math.max(720, Math.min(metadata.height, 1600));
    }
  } else {
    // 默认尺寸：900x1200 (3:4)
    targetWidth = 900;
    targetHeight = 1200;
  }

  const webpBuffer = await image
    .rotate()
    .resize({
      width: targetWidth,
      height: targetHeight,
      fit: 'cover', // 使用 cover 来确保填充整个3:4区域，可能会裁剪
      position: 'centre' // 裁剪时居中对齐
    })
    // 【超高质量压缩】
    .webp({ 
      quality: 90,
      lossless: false,
      effort: 4,
      alphaQuality: 90,
      smartSubsample: true
    })
    .toBuffer();

  console.log(`3:4比例输出: ${targetWidth}x${targetHeight}, 大小: ${(webpBuffer.length / 1024).toFixed(0)}KB`);

  // 为文件生成一个新的、带 .webp 后缀的名称
  const fileName = `${uuidv4()}.webp`;
  const filePath = `${path}/${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, webpBuffer, {
      contentType: 'image/webp',
      upsert: false,
    });

  if (error) {
    console.error('Upload Error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // 返回新图片的公开 URL
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return publicUrl;
}

// --- QR - 包含 3 個的限制)

export async function updateQrUrl(prevState: any, formData: FormData) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. 身份驗證並獲取*當前*的 QR 碼數組
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: 'User not logged in' };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('qr_url') 
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('Fetch Profile Error:', profileError);
    return { success: false, message: `Could not fetch profile: ${profileError.message}` };
  }

  // (*** 這是你的新功能：檢查限制 ***)
  const MAX_QR_CODES = 3; // 設置你的限制
  const existingQrUrls: string[] = profile.qr_url || [];

  if (existingQrUrls.length >= MAX_QR_CODES) {
    return { 
      success: false, 
      message: `Upload failed: You have reached the maximum limit of ${MAX_QR_CODES} QR codes.` 
    };
  }
  // (*** 檢查結束 ***)


  // 2. 獲取文件 (不變)
  const file = formData.get('qr_url') as File; 
  if (!file || file.size === 0) {
    return { success: false, message: 'No file selected' };
  }

  // 3. 上傳新文件 (不變)
  const fileExt = file.name.split('.').pop();
  const filePath = `${user.id}/qr-${new Date().getTime()}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from('web-media')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Upload Error:', uploadError);
    return { success: false, message: uploadError.message };
  }

  // 4. 獲取新文件的公共 URL (不變)
  const { data: publicUrlData } = supabase.storage
    .from('web-media')
    .getPublicUrl(filePath);

  if (!publicUrlData.publicUrl) {
    return { success: false, message: 'Failed to get public URL' };
  }
  
  const newUrl = publicUrlData.publicUrl;

  // 5. 附加數組 (使用我們已獲取的 'existingQrUrls')
  const newQrUrls = [...existingQrUrls, newUrl];

  // 6. 更新 'qr_url' 字段 (不變)
  const { error: dbError } = await supabase
    .from('profiles')
    .update({ qr_url: newQrUrls })
    .eq('id', user.id);

  if (dbError) {
    console.error('DB Update Error:', dbError);
    return { success: false, message: dbError.message };
  }

  revalidatePath('/staff-dashboard/profile');
  return { success: true, message: 'QR Code added successfully!', url: newUrl }; 
}

// (已修復的 deleteQrUrl 函數)

export async function deleteQrUrl(urlToDelete: string) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. 身份驗證
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('Delete QR Error: User not logged in');
    return; // <-- 返回 void
  }

  // 2. 獲取當前的 QR 碼數組
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('qr_url')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('Fetch Profile Error:', profileError);
    return; // <-- 返回 void
  }

  const oldQrUrls: string[] = profile.qr_url || [];

  // 3. 過濾掉要刪除的 URL
  const newQrUrls = oldQrUrls.filter(url => url !== urlToDelete);

  // 4. 更新 'profiles' 表中的數組
  const { error: dbError } = await supabase
    .from('profiles')
    .update({ qr_url: newQrUrls })
    .eq('id', user.id);

  if (dbError) {
    console.error('DB Update Error:', dbError);
    return; // <-- 返回 void
  }

  // 5. (重要!) 從 Supabase Storage 中刪除文件
  try {
    const bucketName = 'web-media'; // 確保這是你的存儲桶名稱
    const urlObject = new URL(urlToDelete);
    const filePath = urlObject.pathname.split(`/${bucketName}/`)[1];

    if (filePath) {
      const { error: storageError } = await supabase.storage
        .from(bucketName)
        .remove([filePath]); 

      if (storageError) {
        throw new Error(storageError.message);
      }
    } else {
      throw new Error(`Could not parse filePath from URL: ${urlToDelete}`);
    }
  } catch (error: any) {
    console.warn(`DB updated, but failed to delete file: ${error.message}`);
    // 即使存儲刪除失敗，我們仍然繼續執行 revalidate
  }

  // 6. 成功 (只 revalidate，不 return)
  revalidatePath('/staff-dashboard/profile'); // 觸發頁面刷新
  // (沒有 return 語句)
}

export async function uploadMultipleMyProfilePhotos(prevState: any, formData: FormData) {
  'use server';
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: 'Authentication required.' };
  }

  const photoFiles = formData.getAll('photos') as File[];
  if (photoFiles.length === 0 || (photoFiles.length === 1 && photoFiles[0].size === 0)) {
    return { success: false, message: 'No files were provided.' };
  }

  try {
    // 1. 获取用户资料，这次同时查询 photo_urls 和 level 字段
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('photo_urls, level') // <-- 修改点: 同时获取 level
      .eq('id', user.id)
      .single();

    if (profileError) {
      throw new Error('Could not retrieve user profile to verify photo count and level.');
    }

    // 2. 【核心限制逻辑 - 第一部分】根据 level 决定照片上限
    const userLevel = profile?.level || 0; // 如果 level 为 null，则默认为 0
    const maxPhotos = userLevel > 10 ? 20 : 6; // <-- 新增: 动态设置上限

    const existingUrls = profile?.photo_urls || [];
    const totalPhotosAfterUpload = existingUrls.length + photoFiles.length;

    // 3. 【核心限制逻辑 - 第二部分】使用动态上限进行检查
    if (totalPhotosAfterUpload > maxPhotos) {
      return { 
        success: false, 
        message: `Upload failed. Your current level allows a maximum of ${maxPhotos} photos. You currently have ${existingUrls.length} and tried to upload ${photoFiles.length}.` 
      };
    }

    // 4. 如果检查通过，则继续执行上传流程
    const uploadPromises = photoFiles.map(file => 
      processAndUploadImage(supabase, file, 'web-media', `staff-photos/${user.id}`)
    );
    const newPhotoUrls = await Promise.all(uploadPromises);

    const updatedUrls = [...existingUrls, ...newPhotoUrls];

    // 5. 更新 profiles 表
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ photo_urls: updatedUrls })
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
    }
    
    revalidatePath('/staff-dashboard/profile');
    return { success: true, message: 'Photos uploaded successfully!' };
  } catch (error: any) {
    return { success: false, message: error.message || 'An unexpected error occurred.' };
  }
}



/**
 * 預約服務 (已升級版本)
 * - 允許 'freeman' (shop_id 為 null) 被預約
 * - 根據客戶 'level' 限制活躍預約數量
 */
export async function createBooking(
  serviceId: string,
  bookingDate: string, // 注意：您的舊函數並未使用此參數，但為保持簽名一致而保留
  startTime: string
) {
  'use server';

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. 身份验证
  // 假設 getUserAndProfile 會返回 'level' 字段
  const { user, profile } = await getUserAndProfile(supabase);
  if (!user || !profile) {
    return { success: false, message: 'Authentication required. Please log in.' };
  }
  if (profile.role !== 'customer') {
    return { success: false, message: 'Only customers can book the service.' };
  }

  //
  // *** 2. 【新增功能】：檢查預約限制 ***
  //
  
  // 假設 profile 對象中包含了 'level' 字段
  const customerLevel = profile.level || 0; // 如果 level 為 null，則默認為 0
  
  let bookingLimit: number;

  if (customerLevel > 10) {
    // 級別大於 10，限制 3 次
    bookingLimit = 1000;
  } else {
    // 級別小於等於 10 (包括 10)，限制 1 次
    bookingLimit = 100;
  }

  // 查詢客戶當前 "活躍" 的預約數
  // (定義 "活躍" 為：狀態為 confirmed 且尚未開始的預約)
  const now = new Date().toISOString();
  
  const { count, error: countError } = await supabase
    .from('bookings') //
    .select('*', { count: 'exact', head: true })
    .eq('customer_id', user.id)
    .eq('status', 'confirmed') // 只計算 'confirmed' 的預約
    .gt('start_time', now);     // 只計算 'future' (尚未開始) 的預約

  if (countError) {
    console.error('Error counting customer bookings:', countError.message);
    return { success: false, message: `Could not verify booking limit: ${countError.message}` };
  }

  // 檢查是否達到限制
  if (count !== null && count >= bookingLimit) {
    return { 
      success: false, 
      message: `Booking limit reached. Your level (${customerLevel}) allows ${bookingLimit} active booking(s). You currently have ${count}.` 
    };
  }

  //
  // *** 檢查結束，繼續執行原有邏輯 ***
  //

  // 3. 验证服务信息 (使用 Admin Client)
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data: service, error: serviceError } = await supabaseAdmin
    .from('services') //
    .select('*, owner_id, duration_value, price')
    .eq('id', serviceId)
    .single();

  if (serviceError || !service) {
    return { success: false, message: 'The specified service was not found.' };
  }

  // 4. 查詢店鋪ID (允許 freeman)
  const workerId = service.owner_id;
  const { data: staffInfo, error: staffError } = await supabaseAdmin
    .from('staff') //
    .select('shop_id')
    .eq('user_id', workerId)
    .single();

  // PGRST116 是 "未找到" 的代碼，我們忽略它
  if (staffError && staffError.code !== 'PGRST116') {
    console.error(`Error checking staff table for worker ${workerId}:`, staffError.message);
  }
  
  const shopId = staffInfo ? staffInfo.shop_id : null;

  // 5. 计算时间并创建预约
  const bookingStartTime = parseISO(startTime);
  const bookingEndTime = addMinutes(bookingStartTime, service.duration_value);

  // 6. 插入數據到 'bookings' 表
  const { error: insertError } = await supabase
    .from('bookings') //
    .insert({
      service_id: serviceId,
      customer_id: user.id,
      worker_profile_id: workerId,
      shop_id: shopId,
      start_time: bookingStartTime.toISOString(),
      end_time: bookingEndTime.toISOString(),
      status: 'confirmed',
      price_at_booking: service.price,
      duration_at_booking: service.duration_value,
    });

  if (insertError) {
    console.error('Appointment creation failed:', insertError);
    return { success: false, message: `Appointment creation failed: ${insertError.message}` };
  }

  // 7. 預約成功，清除緩存
  revalidatePath(`/worker/${workerId}`); ///page.tsx]
  revalidatePath('/customer-dashboard/my-bookings'); //

  return { success: true, message: `Reservation successful!` };
}


export async function uploadMedia(formData: FormData) {
  'use server';

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. 從 FormData 中獲取數據
  const file = formData.get('file') as File | null;
  const name = formData.get('name') as string;
  const asset_type = formData.get('asset_type') as string;
  const is_active = formData.get('is_active') === 'on'; // 複選框的值是 'on' 或 null

  if (!file || file.size === 0) {
    return { success: false, message: 'Please select a file to upload.' };
  }

  // 2. 將文件上傳到 Supabase Storage
  //    為避免文件名衝突，我們創建一個唯一的文件路徑
  const filePath = `public/${Date.now()}-${file.name}`;
  
  // ❗️ 重要提醒: 請確保您在 Supabase 中創建了一個名為 'media_assets' 的存儲桶 (Bucket)
  // 並且設置了相應的 RLS 策略允許上傳。
  const { error: uploadError } = await supabase.storage
    .from('media_assets')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Supabase Storage File Upload Failed.:', uploadError);
    return { success: false, message: `File upload failed.: ${uploadError.message}` };
  }

  // 3. 獲取上傳文件的公開 URL
  const { data: { publicUrl } } = supabase.storage
    .from('media_assets')
    .getPublicUrl(filePath);

  if (!publicUrl) {
    return { success: false, message: 'Unable to obtain the public URL of the file.' };
  }

  // 4. 將文件信息插入到 img_admin 表中
  const { error: insertError } = await supabase
    .from('img_admin')
    .insert({
      url: publicUrl,
      name,
      asset_type,
      is_active,
    });

  if (insertError) {
    console.error('Database insertion failed.:', insertError);
    return { success: false, message: `Database record creation failed.: ${insertError.message}` };
  }

  // 5. 清除路徑緩存，以便新數據可以立即顯示（如果有的話）
  revalidatePath('/admin/media');

  return { success: true, message: 'Media file uploaded and logged successfully!' };
}



export async function deleteMedia(media: { id: string; url: string }) {
  'use server';

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. 安全性檢查：確保只有管理員可以執行刪除
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: 'Unauthorized operation.' };
  }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') {
    return { success: false, message: 'Insufficient permissions.' };
  }

  // 2. 從 URL 中解析出文件在 Storage 中的路徑
  // Supabase URL 格式: .../storage/v1/object/public/media_assets/public/file.jpg
  // 我們需要 'public/file.jpg' 這部分
  const filePath = media.url.split('/media_assets/')[1];
  if (!filePath) {
    return { success: false, message: 'Invalid file URL format.' };
  }

  // 3. 從 Supabase Storage 中刪除文件
  const { error: storageError } = await supabase.storage
    .from('media_assets')
    .remove([filePath]);

  if (storageError) {
    console.error('Storage File deletion failed:', storageError);
    return { success: false, message: `File deletion failed.: ${storageError.message}` };
  }

  // 4. 從 img_admin 數據庫表中刪除記錄
  const { error: dbError } = await supabase
    .from('img_admin')
    .delete()
    .eq('id', media.id);

  if (dbError) {
    console.error('Database record deletion failed:', dbError);
    return { success: false, message: `Database record deletion failed: ${dbError.message}` };
  }

  // 5. 清除路徑緩存，觸發頁面數據重新加載
  revalidatePath('/admin/media');

  return { success: true, message: 'The media files have been successfully deleted!' };
}



// Action 1: 切換店鋪的激活狀態
export async function toggleShopStatus(shopId: string, currentStatus: boolean) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 安全性檢查
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single();
  if (profile?.role !== 'admin') {
    return { success: false, message: 'Insufficient permissions.' };
  }

  const { error } = await supabase
    .from('shops')
    .update({ is_active: !currentStatus }) // 將狀態反轉
    .eq('id', shopId);

  if (error) {
    return { success: false, message: `Update failed: ${error.message}` };
  }

  revalidatePath('/admin/shops'); // 刷新店鋪列表頁的緩存
  return { success: true, message: 'Update successful!' };
}

// Action 2: 更新店鋪的完整信息
export async function updateShopDetails(formData: FormData) {
  'use server';
  console.log('ACTION: updateShopDetails triggered.');
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 安全性檢查
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single();
  if (profile?.role !== 'admin') {
    console.warn('ACTION: Insufficient permissions.');
    return { success: false, message: 'Insufficient permissions.' };
  }

  const shopId = formData.get('id') as string;
  const rawData = Object.fromEntries(formData.entries());
  
  // 準備要更新的數據，這裡您可以根據您的表結構進行調整
  const shopDataToUpdate = {
    name: rawData.name,
    address_detail: rawData.address_detail,
    phone_number: rawData.phone_number,
    slug: rawData.slug,
    tags: rawData.tags,
    description: rawData.description,
    // ... 其他您允許管理員修改的字段
  };
console.log('ACTION: Attempting to update shop:', shopId, 'with data:', shopDataToUpdate);
  const { error } = await supabase
    .from('shops')
    .update(shopDataToUpdate)
    .eq('id', shopId);

  if (error) {
    console.error('ACTION: Supabase update error:', error.message);
    return { success: false, message: `Information update failed: ${error.message}` };
  }
console.log('ACTION: Update successful.');
  revalidatePath(`/admin/shops/${shopId}/edit`); // 刷新當前編輯頁
  revalidatePath('/admin/shops'); // 同時刷新列表頁
  return { success: true, message: 'The information has been successfully updated!' };
}


// Action 3: 刪除店鋪
export async function deleteShop(shopId: string) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 安全性檢查
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single();
  if (profile?.role !== 'admin') {
    throw new Error('Insufficient permissions.');
  }

  const { error } = await supabase
    .from('shops')
    .delete()
    .eq('id', shopId);

  if (error) {
    throw new Error(`Deleting the team failed: ${error.message}`);
  }

  // 刪除成功後，跳轉回店鋪列表主頁
  redirect('/admin/shops');
}


// Action 1: 切換用戶的賬號狀態
export async function toggleUserAccountStatus(userId: string, currentStatus: boolean) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 安全性檢查
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single();
  if (profile?.role !== 'admin') {
    return { success: false, message: 'Insufficient permissions.' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ acc_active: !currentStatus }) // 確保操作的是 acc_active 字段
    .eq('id', userId);

  if (error) {
    return { success: false, message: `Update Failed: ${error.message}` };
  }

  revalidatePath('/admin/users');
  return { success: true, message: 'Update successful!' };
}


// Action 3: 刪除用戶 Profile
export async function deleteUser(userId: string) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 安全性檢查
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single();
  if (profile?.role !== 'admin') {
    throw new Error('Insufficient permissions.');
  }

  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (error) {
    throw new Error(`Failed to delete user profile: ${error.message}`);
  }

  redirect('/admin/users');
}



// Action 2: 更新用戶的詳細信息
export async function updateUserDetails(formData: FormData) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 安全性檢查
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single();
  if (profile?.role !== 'admin') {
    return { success: false, message: 'Insufficient permissions.' };
  }

  const userId = formData.get('id') as string;
  
  // 【核心修改】: 從 formData 中獲取所有字段的數據
  const userDataToUpdate = {
    nickname: formData.get('nickname'),
    bio: formData.get('bio'),
    role: formData.get('role'),
    email: formData.get('email'),
    tel: formData.get('tel'),
    qr_url: formData.get('qr_url'),
    // 處理布爾值 (checkbox)
    is_active: formData.get('is_active') === 'on',
    acc_active: formData.get('acc_active') === 'on',
    // 處理可能為空的數字 ID
    province_id: formData.get('province_id') || null,
    district_id: formData.get('district_id') || null,
    sub_district_id: formData.get('sub_district_id') || null,
  };

  const { error } = await supabase
    .from('profiles')
    .update(userDataToUpdate)
    .eq('id', userId);

  if (error) {
    console.error('User information update failed:', error);
    return { success: false, message: `User information update failed: ${error.message}` };
  }

  revalidatePath(`/admin/users/${userId}/edit`);
  revalidatePath('/admin/users');

  return { success: true, message: 'Updated successfully!' };
}



// Action: 設置當前激活的推廣橫幅
export async function setActiveBanner(bannerId: string) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. 安全性檢查：確保只有管理員可以操作
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single();
  if (profile?.role !== 'admin') {
    return { success: false, message: 'Insufficient permissions.' };
  }

  // 2. 使用數據庫事務，確保操作的原子性
  //    首先，將所有舊的橫幅廣告設為 'is_active = false'
  const { error: deactivateError } = await supabase
    .from('img_admin')
    .update({ is_active: false })
    .eq('asset_type', 'promo_banner');

  if (deactivateError) {
    return { success: false, message: `Deactivation of old banner failed: ${deactivateError.message}` };
  }

  //    然後，將選定的橫幅廣告設為 'is_active = true'
  const { error: activateError } = await supabase
    .from('img_admin')
    .update({ is_active: true })
    .eq('id', bannerId);

  if (activateError) {
    return { success: false, message: `Activation of new banner failed: ${activateError.message}` };
  }

  // 3. 刷新廣告管理頁面的緩存
  revalidatePath('/admin/ads');
  // 4. （重要）刷新根佈局的緩存，讓所有頁面都能看到新的廣告
  revalidatePath('/', 'layout');

  return { success: true, message: 'Promotion banner updated successfully!' };
}


// (*** 這是已更正的 V3 函數 ***)
export async function getOrCreateChatRoom(workerId: string) {
  'use server';

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. 獲取當前登錄的客戶
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login'); 
  }

  // 2. (*** V3 邏輯 - 步驟 A ***)
  // 首先，只執行 Upsert (插入或忽略)。
  // 我們不鏈式調用 .select()。
  const { error: upsertError } = await supabase
    .from('chat_rooms')
    .upsert(
      { customer_id: user.id, worker_id: workerId },
      { 
        onConflict: 'customer_id, worker_id', // 依賴我們創建的唯一約束
        ignoreDuplicates: true 
      }
    );

  if (upsertError) {
    // 這只會在發生真實的數據庫錯誤時觸發 (例如 RLS 權限問題)
    console.error('Error upserting chat room:', upsertError.message);
    return redirect(`/worker/${workerId}?error=chat_upsert_failed`);
  }

  // 3. (*** V3 邏輯 - 步驟 B ***)
  // 現在我們 100% 確定聊天室已存在 (無論是剛剛創建的還是本已存在的)
  // 我們執行一個獨立的、乾淨的查詢來獲取它的 ID。
  const { data: room, error: selectError } = await supabase
    .from('chat_rooms')
    .select('id')
    .eq('customer_id', user.id)
    .eq('worker_id', workerId)
    .single(); // <-- .single() 現在是安全的，因為 RLS 允許我們讀取它

  if (selectError) {
    // 如果這裡仍然出錯 (例如 RLS 權限問題)
    console.error('Error selecting chat room after upsert:', selectError.message);
    return redirect(`/worker/${workerId}?error=chat_select_failed`);
  }

  if (!room) {
    // 雖然這幾乎不可能發生
    console.error('Error: Room was not found after upsert and select.');
    return redirect(`/worker/${workerId}?error=chat_room_not_found`);
  }

  // 4. 成功！
  revalidatePath('/messages'); 
  redirect(`/chat/${room.id}`); // 將用戶重定向到聊天室
}

/**
 * 【步驟 3】管理員手動贈送/續費訂閱時間
 * 此函數僅限管理員調用
 */
export async function adminGrantSubscriptionTime(
  prevState: any, // 用於 useFormState
  formData: FormData  // 使用 FormData 來獲取參數
) {
  'use server';

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. 從 FormData 獲取參數
  const userId = formData.get('userId') as string;
  const daysToAdd = Number(formData.get('daysToAdd') as string);
  const amountPaid = Number(formData.get('amountPaid') as string);
  const notes = formData.get('notes') as string;
  const paymentMethod = formData.get('paymentMethod') as string || 'admin_gift';

  // 2. 安全檢查：確保操作者是管理員
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'Authentication failed.' };
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  
  if (profile?.role !== 'admin') {
    return { success: false, message: 'Insufficient permissions.' };
  }

  // 3. 使用 Service Role Key (繞過 RLS) 來安全地更新*其他*用戶
  // (確保您在 actions.ts 頂部有: import { createClient as createAdminClient } from '@supabase/supabase-js';)
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 4. 獲取用戶當前的到期時間
  const { data: targetProfile, error: fetchError } = await supabaseAdmin
    .from('profiles')
    .select('subscription_expires_at')
    .eq('id', userId)
    .single();

  if (fetchError || !targetProfile) {
    return { success: false, message: `User not found: ${fetchError?.message || ''}` };
  }

  // 5. 計算新的到期時間
  const currentExpiry = targetProfile.subscription_expires_at ? new Date(targetProfile.subscription_expires_at) : new Date();
  const now = new Date();
  
  // 確保我們從 "現在" 或 "未來的到期日" 開始計算，以較晚者為準
  const baseDate = currentExpiry > now ? currentExpiry : now;
  
  const newExpiryDate = new Date(baseDate.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));

  // 6. 更新 profiles 表
  const { error: updateError } = await supabaseAdmin
    .from('profiles')
    .update({
      subscription_status: 'active', // 設為 "active"
      subscription_expires_at: newExpiryDate.toISOString() // 設置新的到期日
    })
    .eq('id', userId);

  if (updateError) {
    return { success: false, message: `Update profile failed: ${updateError.message}` };
  }

  // 7. (關鍵) 寫入訂單日誌 (subscription_logs)
  const { error: logError } = await supabaseAdmin
    .from('subscription_logs')
    .insert({
      worker_profile_id: userId,
      admin_id: user.id, // 記錄是哪個管理員操作的
      days_granted: daysToAdd,
      amount_paid: amountPaid,
      payment_method: paymentMethod, 
      notes: notes
    });

  if (logError) {
    // 即使日誌失敗，訂閱也已成功，但應返回警告
    console.warn(`Subscription granted for ${userId}, but failed to write log: ${logError.message}`);
    // 為了簡單起見，我們仍然返回成功
  }

  // 8. 刷新緩存
  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${userId}/edit`);
  
  return { success: true, message: `成功為用戶添加了 ${daysToAdd} 天訂閱。` };
}



// 1. 新增：上传个人封面图 Action
export async function uploadMyCoverImage(prevState: any, formData: FormData) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'Authentication required.' };

  const file = formData.get('cover_image') as File;
  if (!file || file.size === 0) {
    return { success: false, message: 'No file selected.' };
  }

  try {

    
    // 生成路径
    const fileExt = file.name.split('.').pop();
    const fileName = `cover-${Date.now()}.${fileExt}`;
    const filePath = `staff-photos/${user.id}/${fileName}`;

    // 上传到 Storage (假设 bucket 是 web-media)
    const { error: uploadError } = await supabase.storage
      .from('web-media')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('web-media')
      .getPublicUrl(filePath);

    // 更新数据库
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ cover_image_url: publicUrl })
      .eq('id', user.id);

    if (updateError) throw updateError;

    revalidatePath('/staff-dashboard/media'); // 刷新新页面
    revalidatePath(`/worker/${user.id}`);     // 刷新公开页
    
    return { success: true, message: 'Cover image updated successfully!' };
  } catch (error: any) {
    console.error('Cover upload error:', error);
    return { success: false, message: `Upload failed: ${error.message}` };
  }
}

