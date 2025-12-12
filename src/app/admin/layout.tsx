// 文件路徑: app/admin/layout.tsx
import HeaderAdmin from '@/components/HeaderAdmin';
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <HeaderAdmin />
      <main>{children}</main>
    </div>
  );
}