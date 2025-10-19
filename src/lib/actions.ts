// src/lib/actions.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { Resend } from 'resend';



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
 * 【升级版】更新当前用户的个人资料 (包含所有字段)
 */
export async function updateMyProfile(prevState: any, formData: FormData) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { user } = await getUserAndProfile(supabase);

  // 1. 获取所有表单字段
  const nickname = formData.get('nickname') as string;
  const bio = formData.get('bio') as string;
  const years = formData.get('years') ? parseInt(formData.get('years') as string, 10) : null;
  const level = formData.get('level') as string;
  const tags = formData.get('tags') as string;
  const feature = formData.get('feature') as string;
  
  // 2. 组装 social_links JSON 对象
  const socialLinks = {
    twitter: formData.get('social_twitter') as string,
    instagram: formData.get('social_instagram') as string,
    facebook: formData.get('social_facebook') as string,
  };

  // 3. 将字符串转换为数组
  const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
  const featureArray = feature ? feature.split(',').map(f => f.trim()) : [];
  
  // 4. 更新 profiles 表
  const { error } = await supabase
    .from('profiles')
    .update({ 
      nickname,
      bio,
      years,
      level,
      tags: tagsArray,
      feature: featureArray,
      social_links: socialLinks,
    })
    .eq('id', user.id);

  if (error) {
    return { message: `Update failed: ${error.message}`, success: false };
  }

  revalidatePath('/staff-dashboard/profile');
  return { message: '个人资料已成功更新!', success: true };
}

/**
 * 【新功能】更新当前用户的头像
 */
export async function updateAvatar(formData: FormData) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { user } = await getUserAndProfile(supabase);

  const file = formData.get('avatar') as File;
  if (!file || file.size === 0) throw new Error('No file provided.');

  // 【核心修改】: 使用更有条理的文件夹路径
  const filePath = `${user.id}/avatars/avatar-${Date.now()}`;

  // 【核心修改】: 使用 'web-media' Bucket
  const { error: uploadError } = await supabase.storage
    .from('web-media')
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('web-media')
    .getPublicUrl(filePath);

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id);

  if (updateError) throw updateError;
  
  revalidatePath('/staff-dashboard/profile');
}

/**
 * 【重命名版】为当前用户上传多张照片
 */
export async function uploadMultipleMyProfilePhotos(formData: FormData) {
    'use server';
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { user } = await getUserAndProfile(supabase);
  
    const files = formData.getAll('photos') as File[];
    if (!files || files.length === 0) throw new Error('No files to upload.');
  
    const { data: profileData, error: profileError } = await supabase.from('profiles').select('photo_urls').eq('id', user.id).single();
    if (profileError) throw profileError;
    const existingUrls = profileData.photo_urls || [];
  
    // 【核心修改】: 使用 'web-media' Bucket 和 'photos' 子文件夹
    const uploadPromises = files.map(file => 
      supabase.storage.from('web-media').upload(`${user.id}/photos/${Date.now()}_${file.name}`, file)
    );
    const uploadResults = await Promise.all(uploadPromises);
  
    const newUrls = uploadResults.map(result => {
      if (result.error) throw result.error;
      const { data } = supabase.storage.from('web-media').getPublicUrl(result.data.path);
      return data.publicUrl;
    });
  
    const allUrls = [...existingUrls, ...newUrls];
  
    const { error: updateError } = await supabase.from('profiles').update({ photo_urls: allUrls }).eq('id', user.id);
    if (updateError) throw updateError;
  
    revalidatePath('/staff-dashboard/profile');
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
 * 【重命名版】为当前用户上传多个视频
 */
export async function uploadMultipleMyProfileVideos(formData: FormData) {
    'use server';
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { user } = await getUserAndProfile(supabase);
  
    const files = formData.getAll('videos') as File[];
    if (!files || files.length === 0) throw new Error('No files to upload.');
  
    const { data: profileData, error: profileError } = await supabase.from('profiles').select('video_urls').eq('id', user.id).single();
    if (profileError) throw profileError;
    const existingUrls = profileData.video_urls || [];
  
    // 【核心修改】: 使用 'web-media' Bucket 和 'videos' 子文件夹
    const uploadPromises = files.map(file => 
      supabase.storage.from('web-media').upload(`${user.id}/videos/${Date.now()}_${file.name}`, file)
    );
    const uploadResults = await Promise.all(uploadPromises);
  
    const newUrls = uploadResults.map(result => {
      if (result.error) throw result.error;
      const { data } = supabase.storage.from('web-media').getPublicUrl(result.data.path);
      return data.publicUrl;
    });
  
    const allUrls = [...existingUrls, ...newUrls];
  
    const { error: updateError } = await supabase.from('profiles').update({ video_urls: allUrls }).eq('id', user.id);
    if (updateError) throw updateError;
  
    revalidatePath('/staff-dashboard/profile');
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

export async function toggleShopStatus(shopId: string, currentStatus: boolean) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not logged in");
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error("Permission denied: Only admins can perform this action");
  const supabaseAdmin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { error } = await supabaseAdmin.from('shops').update({ is_active: !currentStatus }).eq('id', shopId);
  if (error) {
    console.error("Failed to toggle shop status:", error);
    throw new Error("Operation failed.");
  }
  revalidatePath('/admin/shops');
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

export async function deleteShopByAdmin(shopId: string) {
  'use server';
  const supabaseAdmin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { error } = await supabaseAdmin.from('shops').delete().eq('id', shopId);
  if (error) {
    console.error("Admin failed to delete shop:", error);
    throw new Error("Failed to delete shop.");
  }
  revalidatePath('/admin/shops');
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

// 更新服务信息
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
  return { message: '服务已成功更新!', success: true };
}

// 删除服务信息
export async function deleteMyService(serviceId: string) {
    'use server';
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error('You must be logged in to delete a service.');
    }

    // Security Check: Ensure the user owns this service
    const { data: service, error: ownerError } = await supabase
        .from('services')
        .select('owner_id')
        .eq('id', serviceId)
        .single();

    if (ownerError || service?.owner_id !== user.id) {
        throw new Error('You do not have permission to delete this service.');
    }

    const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

    if (error) {
        console.error('Delete Service Error:', error);
        throw new Error('Failed to delete the service.');
    }

    revalidatePath('/staff-dashboard/services');
}


/**
 * 顾客创建新预约 (增加取消次数检查)
 */
export async function createBooking(
    serviceId: string,
    workerProfileId: string,
    startTimeStr: string
) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { user, profile } = await getUserAndProfile(supabase);
  if (profile.role !== 'customer') {
    throw new Error('只有顾客才能预订服务。');
  }

  // 【核心修改】: 在创建预约前，检查用户的月度取消次数
  const { data: customerProfile } = await supabase
    .from('profiles')
    .select('monthly_cancellation_count')
    .eq('id', user.id)
    .single();

  if (customerProfile && customerProfile.monthly_cancellation_count >= 3) {
      throw new Error('您的预约功能已被暂停，因为本月取消次数已达上限。次月将自动恢复。');
  }

  const { data: service } = await supabase
    .from('services')
    .select('duration_value, duration_unit, price, owner_id')
    .eq('id', serviceId)
    .single();

  if (!service || service.owner_id !== workerProfileId) {
    throw new Error('服务与技师不匹配。');
  }
  
  if (!service.duration_value) {
    throw new Error('服务时长信息不完整，无法计算结束时间。');
  }

  const { data: staffEntry } = await supabase.from('staff').select('id, shop_id').eq('user_id', workerProfileId).single();

  const startTime = new Date(startTimeStr);
  let endTime = new Date(startTime);

  switch (service.duration_unit) {
    case 'minutes':
      endTime.setMinutes(startTime.getMinutes() + service.duration_value);
      break;
    case 'hours':
      endTime.setHours(startTime.getHours() + service.duration_value);
      break;
    case 'days':
      endTime.setDate(startTime.getDate() + service.duration_value);
      break;
    default:
      throw new Error('不支持或无效的服务时长单位。');
  }
  
  const { data: hasConflict, error: conflictError } = await supabase.rpc('check_booking_conflict', {
    worker_id: workerProfileId,
    start_t: startTime.toISOString(),
    end_t: endTime.toISOString()
  });

  if (conflictError) {
      console.error('Booking conflict check error:', conflictError);
      throw new Error('检查时间冲突时发生错误。');
  }

  if (hasConflict) {
      throw new Error('抱歉，该时间段已被预订，请选择其他时间。');
  }

  const { error: createError } = await supabase.from('bookings').insert({
    customer_id: user.id,
    worker_profile_id: workerProfileId,
    staff_id: staffEntry?.id || null,
    service_id: serviceId,
    shop_id: staffEntry?.shop_id || null,
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    price_at_booking: service.price,
    duration_at_booking: service.duration_value || 0,
    status: 'confirmed'
  });

  if (createError) {
    throw new Error(`创建预约失败: ${createError.message}`);
  }

  revalidatePath(`/worker/${workerProfileId}`);
  return { success: true, message: '预约成功！' };
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
    return { success: false, message: '找不到预约记录。' };
  }

  const isCustomer = profile.role === 'customer' && booking.customer_id === user.id;
  const isWorker = ['staff', 'freeman'].includes(profile.role) && booking.worker_profile_id === user.id;

  if (!isCustomer && !isWorker) {
    return { success: false, message: '您无权取消此预约。' };
  }
  
  if (booking.status !== 'confirmed') {
      return { success: false, message: '只有“已确认”的预约才能被取消。' };
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
  
  return { success: true, message: '预约已成功取消。' };
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
    return { message: "错误：开始和结束时间不能为空。", success: false };
  }

  // 【核心修改】: 插入数据时，使用 worker_profile_id
  const { error } = await supabase.from('schedules').insert({
    worker_profile_id: user.id, // <-- 排班直接归属于当前登录的用户
    start_time: startTime,
    end_time: endTime,
  });

  if (error) {
    return { message: `创建排班失败: ${error.message}`, success: false };
  }

  revalidatePath('/staff-dashboard/schedule');
  return { message: '排班已成功添加！', success: true };
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
    throw new Error('您无权删除此排班。');
  }

  const { error } = await supabase.from('schedules').delete().eq('id', scheduleId);
  if (error) {
    throw new Error(`删除排班失败: ${error.message}`);
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
        throw new Error('找不到该预约记录。');
    }
    if (booking.worker_profile_id !== user.id) {
        throw new Error('您无权操作此预约。');
    }
    if (booking.status !== 'confirmed') {
        throw new Error('只有“已确认”的预约才能开始服务。');
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
        throw new Error('找不到预约记录。');
    }
    if (booking.worker_profile_id !== user.id) {
        throw new Error('您无权操作此预约。');
    }
    if (booking.status !== 'in_progress') {
        // 只有“服务中”的预约才能被完成，防止重复点击
        throw new Error('只有“服务中”的预约才能被标记为完成。');
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
    return { message: `创建规则失败: ${error.message}`, success: false };
  }

  revalidatePath('/staff-dashboard/schedule');
  return { message: '新的工作规则已成功添加！', success: true };
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
    return { message: "错误：日期和例外类型为必填项。", success: false };
  }
  if (type === 'available' && (!startTime || !endTime || endTime <= startTime)) {
      return { message: "错误：加班必须提供有效的开始和结束时间。", success: false };
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
    return { message: `创建例外失败: ${error.message}`, success: false };
  }

  revalidatePath('/staff-dashboard/schedule');
  return { message: `日期 ${overrideDate} 的例外已成功设置！`, success: true };
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

  // 1. 权限检查：确保规则属于当前用户
  const { data: rule } = await supabase.from('availability_rules').select('worker_profile_id').eq('id', ruleId).single();
  if (!rule || rule.worker_profile_id !== user.id) {
    return { message: "错误：您无权删除此规则。", success: false };
  }

  // 2. 【核心安全检查】: 调用数据库函数，检查是否存在冲突预约
  const { data: bookingCount, error: checkError } = await supabase.rpc('check_bookings_in_rule', { rule_id: ruleId });
  if (checkError || (bookingCount != null && bookingCount > 0)) {
    return { message: `无法删除：该规则内已存在 ${bookingCount || ''} 个有效预约。`, success: false };
  }

  // 3. 执行删除
  const { error } = await supabase.from('availability_rules').delete().eq('id', ruleId);
  if (error) {
    return { message: `删除失败: ${error.message}`, success: false };
  }

  revalidatePath('/staff-dashboard/schedule');
  return { message: '工作规则已成功删除。', success: true };
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
    return { message: "错误：您无权删除此例外。", success: false };
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
    return { message: `无法删除：该日期内已存在 ${count} 个有效预约。`, success: false };
  }
  
  // 3. 执行删除
  const { error } = await supabase.from('availability_overrides').delete().eq('id', overrideId);
  if (error) {
    return { message: `删除失败: ${error.message}`, success: false };
  }

  revalidatePath('/staff-dashboard/schedule');
  return { message: '例外日期已成功删除。', success: true };
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
    return { success: false, message: `状态更新失败: ${error.message}` };
  }

  // 3. 刷新相关页面的缓存，确保状态立即生效
  revalidatePath('/staff-dashboard/profile'); // 刷新技师自己的档案页
  revalidatePath(`/worker/${user.id}`);      // 刷新该技师的公开预约页

  return { success: true, message: '状态已成功更新！' };
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


export async function updateShopSettings(prevState: any, formData: FormData) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: "Error: User not logged in" };
  
  const shopId = formData.get('shop_id') as string;
  if (!shopId) {
      return { message: "Error: Shop ID is missing." };
  }

  const { data: shop, error: shopError } = await supabase
    .from('shops')
    .select('id, slug')
    .eq('owner_id', user.id)
    .eq('id', shopId)
    .single();

  if (shopError || !shop) {
    return { message: "Error: Could not find shop or permission denied" };
  }

  // --- 初始化要更新的数据对象 ---
  const shopUpdateData: { [key: string]: any } = {};
  const pageUpdateData: { [key: string]: any } = { shop_id: shopId };

  // --- 文件上传逻辑 (完整版) ---
  const backgroundImageFile = formData.get('background_image') as File;
  const heroImageFile = formData.get('hero_image') as File;
  const featuredVideoFile = formData.get('featured_video') as File;

  // 1. 处理背景图
  if (backgroundImageFile && backgroundImageFile.size > 0) {
    const filePath = `${user.id}/${shopId}/background-${Date.now()}`;
    const { data, error } = await supabase.storage.from('web-media').upload(filePath, backgroundImageFile, { upsert: true });
    if (error) return { message: `背景图上传失败: ${error.message}` };
    shopUpdateData.bg_image_url = supabase.storage.from('web-media').getPublicUrl(data.path).data.publicUrl;
  }

  // 2. 处理广告横幅
  if (heroImageFile && heroImageFile.size > 0) {
    const filePath = `${user.id}/${shopId}/hero-${Date.now()}`;
    const { data, error } = await supabase.storage.from('web-media').upload(filePath, heroImageFile, { upsert: true });
    if (error) return { message: `横幅图上传失败: ${error.message}` };
    pageUpdateData.hero_image_url = supabase.storage.from('web-media').getPublicUrl(data.path).data.publicUrl;
  }

  // 3. 处理特色视频
  if (featuredVideoFile && featuredVideoFile.size > 0) {
    if (featuredVideoFile.size > 50 * 1024 * 1024) {
      return { message: '视频上传失败：文件大小不能超过 50MB。' };
    }
    const { data: oldPageData } = await supabase.from('shop_pages').select('featured_video_url').eq('shop_id', shopId).single();
    if (oldPageData?.featured_video_url) {
      const oldFilePath = oldPageData.featured_video_url.split('/web-media/')[1];
      if(oldFilePath) await supabase.storage.from('web-media').remove([oldFilePath]);
    }
    const filePath = `${user.id}/${shopId}/featured-video-${Date.now()}`;
    const { data, error } = await supabase.storage.from('web-media').upload(filePath, featuredVideoFile);
    if (error) return { message: `视频上传失败: ${error.message}` };
    pageUpdateData.featured_video_url = supabase.storage.from('web-media').getPublicUrl(data.path).data.publicUrl;
  }
  
  // --- 文本和其他数据处理 (完整版) ---
  shopUpdateData.name = formData.get('name') as string;
  shopUpdateData.slug = formData.get('slug') as string;
  shopUpdateData.description = formData.get('description') as string;
  shopUpdateData.phone_number = formData.get('phone_number') as string;

  // --- 执行数据库更新 (完整版) ---
  // 只有在 shopUpdateData 不为空时才更新 shops 表
  if (Object.keys(shopUpdateData).length > 0) {
    const { error: updateShopError } = await supabase.from('shops').update(shopUpdateData).eq('id', shopId);
    if (updateShopError) return { message: `店铺信息更新失败: ${updateShopError.message}` };
  }

  // 只有在 pageUpdateData 有除了 shop_id 之外的其他字段时才更新 shop_pages 表
  if (Object.keys(pageUpdateData).length > 1) {
    const { error: upsertPageError } = await supabase.from('shop_pages').upsert(pageUpdateData, { onConflict: 'shop_id' });
    if (upsertPageError) return { message: `页面内容更新失败: ${upsertPageError.message}` };
  }

  revalidatePath('/dashboard/shop');
  revalidatePath(`/shops/${shop.slug}`);
  return { message: '店铺信息已成功更新！' };
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