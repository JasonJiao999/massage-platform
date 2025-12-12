// supabase/functions/send-booking-notification/index.ts (V3 - 最終修復)

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Resend } from 'https://esm.sh/resend@3.2.0';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('PROJECT_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('MY_SERVICE_ROLE_KEY');
const FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') || 'noreply@aofiw.com';

type Profile = { email?: string; nickname?: string; };

serve(async (req: Request) => {
  // *** 版本標記更新為 V3 ***
  console.log('--- Running Function V3 (Fetching service_id, then service_name) ---');
  
  let supabaseAdmin: SupabaseClient;

  try {
    const { booking_id } = await req.json();
    if (!booking_id) throw new Error('No booking_id provided');

    if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !FROM_EMAIL) {
      throw new Error('Missing environment variables (Secrets)');
    }
    const resend = new Resend(RESEND_API_KEY);
    supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. (*** 這是第 1 個修改 ***)
    // 獲取預約信息 (現在獲取 service_id 而不是 service_name)
    const { data: bookingData, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select('start_time, service_id, worker_profile_id, customer_id') // <-- 已修改
      .eq('id', booking_id)
      .single();

    if (bookingError) throw new Error(`Booking query error: ${bookingError.message}`);
    if (!bookingData) throw new Error(`Booking ${booking_id} not found.`);

    // 2. 獲取員工信息 (不變)
    const { data: staffData, error: staffError } = await supabaseAdmin
      .from('profiles')
      .select('email, nickname')
      .eq('id', bookingData.worker_profile_id)
      .single<Profile>();

    if (staffError) throw new Error(`Staff profile query error: ${staffError.message}`);
    if (!staffData?.email) {
      console.warn(`Staff profile ${bookingData.worker_profile_id} has no email. Skipping.`);
      return new Response(JSON.stringify({ success: true, message: 'Staff has no email.' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // 3. 獲取客戶信息 (不變)
    const { data: customerData, error: customerError } = await supabaseAdmin
      .from('profiles')
      .select('nickname')
      .eq('id', bookingData.customer_id)
      .single<Profile>();

    if (customerError) console.warn(`Could not fetch customer nickname: ${customerError.message}`);

    // 4. (*** 這是第 2 個修改 ***)
    // 新增：使用 bookingData.service_id 獲取服務名稱
    const { data: serviceData, error: serviceError } = await supabaseAdmin
      .from('services')
      .select('name') // 假設服務名稱列叫 'name'
      .eq('id', bookingData.service_id)
      .single();

    if (serviceError) console.warn(`Could not fetch service name: ${serviceError.message}`);

    // 5. 準備郵件內容
    const staffEmail = staffData.email;
    const staffName = staffData.nickname || 'Staff';
    const customerName = customerData?.nickname || 'a customer';
    const serviceName = serviceData?.name || 'a service'; // <-- 使用從 services 表獲取的新名稱
    
    const bookingTime = new Date(bookingData.start_time).toLocaleString('en-US', { 
        dateStyle: 'full', 
        timeStyle: 'short' 
    });

    // 6. 發送郵件 (不變)
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: `Your Booking Platform <${FROM_EMAIL}>`,
      to: [staffEmail],
      subject: `New Booking! You have an appointment with ${customerName}`,
      html: `
        <h1>New Booking Notification</h1>
        <p>Hi ${staffName},</p>
        <p>You have a new booking from <strong>${customerName}</strong>.</p>
        <br>
        <strong>Booking Details:</strong>
        <ul>
          <li><strong>Service:</strong> ${serviceName}</li>
          <li><strong>Time:</strong> ${bookingTime}</li>
        </ul>
        <br>
        <p>Please log in to your staff dashboard to confirm or view details.</p>
      `,
    });

    if (emailError) throw new Error(`Resend error: ${emailError.message}`);

    // 7. 成功返回 (不變)
    return new Response(JSON.stringify({ success: true, email: emailData }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = (error instanceof Error) ? error.message : 'Unknown error occurred';
    console.error('Error in Edge Function:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});