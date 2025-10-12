// src/lib/actions.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { Resend } from 'resend';

export async function updateShopSettings(prevState: any, formData: FormData) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: "Error: User not logged in" };
  const { data: shop, error: shopError } = await supabase.from('shops').select('id, slug').eq('owner_id', user.id).single();
  if (shopError || !shop) return { message: "Error: Could not find shop or permission denied" };
  const shopId = shop.id;
  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const description = formData.get('description') as string;
  const phone_number = formData.get('phone_number') as string;
  const tags = formData.get('tags') as string;
  const facebookUrl = formData.get('facebook_url') as string;
  const instagramUrl = formData.get('instagram_url') as string;
  const primaryColor = formData.get('primary_color') as string;
  const backgroundColor = formData.get('background_color') as string;
  const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
  const socialLinksObject = { facebook: facebookUrl, instagram: instagramUrl };
  const { error: updateShopError } = await supabase.from('shops').update({ name, slug, description, phone_number, tags: tagsArray, social_links: socialLinksObject }).eq('id', shopId);
  if (updateShopError) {
    console.error('Failed to update shop:', updateShopError);
    return { message: `Failed to update shop info: ${updateShopError.message}` };
  }
  const { error: upsertThemeError } = await supabase.from('shop_themes').upsert({ shop_id: shopId, primary_color: primaryColor, background_color: backgroundColor, });
  if (upsertThemeError) {
    console.error('Failed to update theme:', upsertThemeError);
    return { message: `Failed to update shop theme: ${upsertThemeError.message}` };
  }
  revalidatePath('/dashboard/shop');
  revalidatePath(`/shops/${slug}`);
  return { message: 'Shop info updated successfully!' };
}

/**
 * 【最终完整版】商户批量邀请员工 (使用 Resend 发送邮件)
 */
export async function inviteStaffMembers(prevState: any, formData: FormData) {
  'use server';

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. 验证商户身份并获取店铺信息
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: "Error: User is not logged in." };

  const { data: shop } = await supabase.from('shops').select('id, name').eq('owner_id', user.id).single();
  if (!shop) return { message: "Error: Could not find your shop." };

  // 2. 初始化 Resend 客户端
  const resend = new Resend(process.env.RESEND_API_KEY);

  const emailsString = formData.get('emails') as string;
  if (!emailsString) return { message: "Error: Email addresses cannot be empty." };
  
  const emails = emailsString.split(/[\n,]+/).map(email => email.trim()).filter(Boolean);
  const results = [];

  for (const email of emails) {
    try {
      console.log(`[Action] Processing invitation for: ${email}`);

      // 3. 在 'invitations' 表中创建邀请记录
      const { data: invitation, error: createError } = await supabase
        .from('invitations')
        .insert({
          shop_id: shop.id,
          email: email,
          status: 'pending'
        })
        .select()
        .single();

      if (createError) throw createError;
      console.log(`[DB] Created invitation record with ID: ${invitation.id}`);


      // 4. 【核心改动】使用 Resend 发送我们自己的邀请邮件
      const invitationLink = `${process.env.NEXT_PUBLIC_SITE_URL}/invitation/${invitation.id}`;
      
      const { data, error: mailError } = await resend.emails.send({
        from: `Invitation <noreply@${process.env.RESEND_VERIFIED_DOMAIN}>`, // 需要一个已验证的域名
        to: email,
        subject: `You have been invited to join ${shop.name}`,
        html: `
          <h1>Invitation to Join ${shop.name}</h1>
          <p>You have been invited to join ${shop.name}'s team on our platform.</p>
          <p>Please click the link below to accept the invitation:</p>
          <a href="${invitationLink}">Accept Invitation</a>
          <p>If you did not expect this invitation, you can safely ignore this email.</p>
        `,
      });

      if (mailError) {
        // 如果邮件发送失败，删除刚才创建的邀请记录
        await supabase.from('invitations').delete().eq('id', invitation.id);
        throw mailError;
      }
      
      console.log(`[Email] Successfully sent invitation to ${email}. Message ID: ${data?.id}`);
      results.push({ email, status: 'success', message: 'Invitation email sent successfully.' });

    } catch (error: any) {
      console.error(`Error processing email ${email}:`, error);
      results.push({ email, status: 'error', message: error.message });
    }
  }

  revalidatePath('/dashboard/staff/new');
  return { message: `${results.length} invitations processed.`, results };
}


export async function acceptInvitation(invitationId: string) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { throw new Error("You must be logged in to accept an invitation."); }
  const { data: invitation, error: invitationError } = await supabase.from('invitations').select('id, shop_id, email, status').eq('id', invitationId).single();
  if (invitationError || !invitation) { throw new Error("This invitation is invalid or has expired."); }
  if (invitation.status !== 'pending') { throw new Error("This invitation has already been processed."); }
  if (invitation.email !== user.email) { throw new Error("This invitation is intended for a different user."); }
  const { error: staffInsertError } = await supabase.from('staff').insert({ user_id: user.id, shop_id: invitation.shop_id, nickname: user.email?.split('@')[0] || 'New Staff', is_active: true });
  if (staffInsertError && staffInsertError.code !== '23505') { throw staffInsertError; }
  const { error: updateInvitationError } = await supabase.from('invitations').update({ status: 'accepted' }).eq('id', invitationId);
  if (updateInvitationError) { throw updateInvitationError; }
  revalidatePath('/dashboard/staff');
  revalidatePath('/staff-dashboard/services');
  redirect('/staff-dashboard/services');
}

export async function updateStaffMember(prevState: any, formData: FormData) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: "Error: User not logged in" };
  const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single();
  if (!shop) return { message: "Error: Could not find your shop, permission denied" };
  const staffId = formData.get('staffId') as string;
  const nickname = formData.get('nickname') as string;
  const level = formData.get('level') as string;
  const bio = formData.get('bio') as string;
  const years = formData.get('years') as string;
  const feature = formData.get('feature') as string;
  const tags = formData.get('tags') as string;
  const isActive = formData.get('is_active') === 'on';
  if (!staffId) return { message: "Error: Missing staff ID" };
  const featureArray = feature ? feature.split(',').map(s => s.trim()) : [];
  const tagsArray = tags ? tags.split(',').map(t => t.trim()) : [];
  const yearsNumber = years ? parseInt(years, 10) : null;
  const { error } = await supabase.from('staff').update({ nickname, level, bio, years: yearsNumber, feature: featureArray, tags: tagsArray, is_active: isActive, }).eq('id', staffId).eq('shop_id', shop.id);
  if (error) { console.error("Failed to update staff member:", error); return { message: `Update failed: ${error.message}` }; }
  revalidatePath('/dashboard/staff');
  revalidatePath(`/dashboard/staff/${staffId}/edit`);
  return { message: 'Staff member updated successfully!' };
}

export async function uploadMultipleStaffPhotos(prevState: any, formData: FormData) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: "Error: User not logged in" };
  const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single();
  if (!shop) return { message: "Error: Could not find your shop" };
  const staffId = formData.get('staffId') as string;
  const files = formData.getAll('photos') as File[];
  if (!staffId || !files || files.length === 0 || files[0].size === 0) return { message: "Error: Missing staff ID or no files selected" };
  try {
    const { data: staff, error: staffError } = await supabase.from('staff').select('photo_urls').eq('id', staffId).eq('shop_id', shop.id).single();
    if (staffError || !staff) return { message: "Error: Could not find staff member or permission denied" };
    const currentPhotos = staff.photo_urls || [];
    const PHOTO_LIMIT = 5;
    if (currentPhotos.length + files.length > PHOTO_LIMIT) return { message: `Error: Photo limit exceeded (${PHOTO_LIMIT})` };
    const uploadPromises = files.map(file => { const fileExt = file.name.split('.').pop(); const fileName = `${staffId}-${Date.now()}-${Math.random()}.${fileExt}`; const filePath = `staff-photos/${fileName}`; return supabase.storage.from('web-media').upload(filePath, file); });
    const uploadResults = await Promise.all(uploadPromises);
    const newUrls: string[] = [];
    for (const result of uploadResults) { if (result.error) throw result.error; const { data: { publicUrl } } = supabase.storage.from('web-media').getPublicUrl(result.data.path); newUrls.push(publicUrl); }
    const updatedPhotos = [...currentPhotos, ...newUrls];
    const { error: updateDbError } = await supabase.from('staff').update({ photo_urls: updatedPhotos }).eq('id', staffId);
    if (updateDbError) throw updateDbError;
    revalidatePath(`/dashboard/staff/${staffId}/edit`);
    return { message: `${files.length} photo(s) uploaded successfully!` };
  } catch (error: any) { console.error("Failed to upload photos:", error); return { message: `Upload failed: ${error.message}` }; }
}

export async function deleteStaffPhotos(prevState: any, formData: FormData) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: "Error: User not logged in" };
  const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single();
  if (!shop) return { message: "Error: Could not find your shop" };
  const staffId = formData.get('staffId') as string;
  const photoUrlsToDelete = formData.getAll('photoUrlsToDelete') as string[];
  if (!staffId || photoUrlsToDelete.length === 0) return { message: "Error: No photos selected for deletion" };
  try {
    const filePaths = photoUrlsToDelete.map(url => new URL(url).pathname.substring(new URL(url).pathname.indexOf('web-media/') + 'web-media/'.length));
    const { error: storageError } = await supabase.storage.from('web-media').remove(filePaths);
    if (storageError) throw new Error('Failed to delete files from storage.');
    const { data: staff, error: staffError } = await supabase.from('staff').select('photo_urls').eq('id', staffId).single();
    if (staffError || !staff) return { message: "Error: Could not find staff member" };
    const updatedPhotos = (staff.photo_urls || []).filter((url: string) => !photoUrlsToDelete.includes(url));
    const { error: dbError } = await supabase.from('staff').update({ photo_urls: updatedPhotos }).eq('id', staffId);
    if (dbError) throw new Error('Failed to update database.');
    revalidatePath(`/dashboard/staff/${staffId}/edit`);
    return { message: `${photoUrlsToDelete.length} photo(s) deleted successfully!` };
  } catch (error: any) { console.error("Failed to delete photos:", error); return { message: `Deletion failed: ${error.message}` }; }
}

export async function uploadMultipleStaffVideos(prevState: any, formData: FormData) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: "Error: User not logged in" };
  const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single();
  if (!shop) return { message: "Error: Could not find your shop" };
  const staffId = formData.get('staffId') as string;
  const files = formData.getAll('videos') as File[];
  if (!staffId || !files || files.length === 0 || files[0].size === 0) return { message: "Error: Missing staff ID or no video files selected" };
  try {
    const { data: staff, error: staffError } = await supabase.from('staff').select('video_urls').eq('id', staffId).eq('shop_id', shop.id).single();
    if (staffError || !staff) return { message: "Error: Could not find staff member or permission denied" };
    const currentVideos = staff.video_urls || [];
    const VIDEO_LIMIT = 2;
    if (currentVideos.length + files.length > VIDEO_LIMIT) return { message: `Error: Video limit exceeded (${VIDEO_LIMIT})` };
    const uploadPromises = files.map(file => { const fileExt = file.name.split('.').pop(); const fileName = `${staffId}-${Date.now()}-${Math.random()}.${fileExt}`; const filePath = `staff-videos/${fileName}`; return supabase.storage.from('web-media').upload(filePath, file); });
    const uploadResults = await Promise.all(uploadPromises);
    const newUrls: string[] = [];
    for (const result of uploadResults) { if (result.error) throw result.error; const { data: { publicUrl } } = supabase.storage.from('web-media').getPublicUrl(result.data.path); newUrls.push(publicUrl); }
    const updatedVideos = [...currentVideos, ...newUrls];
    const { error: updateDbError } = await supabase.from('staff').update({ video_urls: updatedVideos }).eq('id', staffId);
    if (updateDbError) throw updateDbError;
    revalidatePath(`/dashboard/staff/${staffId}/edit`);
    return { message: `${files.length} video(s) uploaded successfully!` };
  } catch (error: any) { console.error("Failed to upload videos:", error); return { message: `Upload failed: ${error.message}` }; }
}

export async function deleteSingleStaffVideo(staffId: string, videoUrl: string) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not logged in");
  const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single();
  if (!shop) throw new Error("Could not find your shop");
  try {
    const urlParts = new URL(videoUrl);
    const filePath = urlParts.pathname.substring(urlParts.pathname.indexOf('web-media/') + 'web-media/'.length);
    const { error: storageError } = await supabase.storage.from('web-media').remove([filePath]);
    if (storageError) throw storageError;
    const { data: staff, error: staffError } = await supabase.from('staff').select('video_urls').eq('id', staffId).single();
    if (staffError || !staff) throw new Error("Could not find staff member");
    const updatedVideos = (staff.video_urls || []).filter((url: string) => url !== videoUrl);
    const { error: dbError } = await supabase.from('staff').update({ video_urls: updatedVideos }).eq('id', staffId);
    if (dbError) throw dbError;
    revalidatePath(`/dashboard/staff/${staffId}/edit`);
    return { success: true, message: 'Video deleted successfully!' };
  } catch (error: any) { console.error("Failed to delete video:", error); return { success: false, message: `Deletion failed: ${error.message}` }; }
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
 * 【最终版】员工通过输入商户邮箱来加入店铺
 */
export async function joinShopByMerchantEmail(prevState: any, formData: FormData) {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: "Error: You must be logged in.", success: false };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'freeman') { // 使用小写 'freeman'
    return { message: "Error: Only freelance staff can join a new shop.", success: false };
  }

  const { data: staffProfile } = await supabase.from('staff').select('id').eq('user_id', user.id).single();
  if (!staffProfile) return { message: "Error: Your staff profile could not be found.", success: false };

  const merchantEmail = formData.get('merchant_email') as string;
  if (!merchantEmail) return { message: "Error: Merchant email is required.", success: false };

  // 【核心修正】我们直接查询 profiles 表来找商户，这更高效且类型安全
  const { data: merchantProfile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('email', merchantEmail)
    .single();

  if (profileError || !merchantProfile || merchantProfile.role !== 'merchant') {
    return { message: "Error: No merchant found with that email address.", success: false };
  }

  const { data: shop, error: shopError } = await supabase.from('shops').select('id, name').eq('owner_id', merchantProfile.id).single();
  if (shopError || !shop) return { message: "Error: This merchant does not own a shop.", success: false };

  const { error: updateStaffError } = await supabase.from('staff').update({ shop_id: shop.id }).eq('id', staffProfile.id);
  if (updateStaffError) { console.error("Failed to join shop:", updateStaffError); return { message: `Error: ${updateStaffError.message}`, success: false }; }

  const { error: updateProfileError } = await supabase.from('profiles').update({ role: 'staff' }).eq('id', user.id);
  if (updateProfileError) { console.error("Failed to update role:", updateProfileError); return { message: `Error: ${updateProfileError.message}`, success: false }; }

  revalidatePath('/staff-dashboard/profile');
  return { message: `Successfully joined ${shop.name}!`, success: true };
}

/**
 * 【新功能】员工离开店铺，成为自由职业者
 */
export async function leaveShop() {
  'use server';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in.");

  const { data: staffProfile } = await supabase.from('staff').select('id').eq('user_id', user.id).eq('is_active', true).single();
  if (!staffProfile) throw new Error("Your staff profile could not be found.");

  const { error: updateStaffError } = await supabase.from('staff').update({ shop_id: null }).eq('id', staffProfile.id);
  if (updateStaffError) throw updateStaffError;

  // 使用小写 'freeman'
  const { error: updateProfileError } = await supabase.from('profiles').update({ role: 'freeman' }).eq('id', user.id);
  if (updateProfileError) throw updateProfileError;

  revalidatePath('/staff-dashboard/profile');
  redirect('/staff-dashboard/profile');
}
