// src/app/dashboard/layout.tsx
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 【核心修复】: 移除所有UI组件，只保留children。
  // 顶部的导航栏由根布局 (src/app/layout.tsx) 统一提供，这里不再需要。
  return <>{children}</>;
}