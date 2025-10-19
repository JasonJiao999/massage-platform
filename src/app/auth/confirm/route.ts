// src/app/auth/confirm/route.ts
import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  const redirectTo = request.nextUrl.clone()
  redirectTo.pathname = next

  if (token_hash && type) {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      // 验证成功，重定向到目标页面（例如 /reset-password）
      return NextResponse.redirect(redirectTo)
    }
  }

  // 验证失败，重定向到一个错误页面
  redirectTo.pathname = '/login'
  redirectTo.searchParams.set('message', 'Could not verify token. Link may be invalid or expired.')
  return NextResponse.redirect(redirectTo)
}