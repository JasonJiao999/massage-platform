// 文件路徑: src/app/staff-dashboard/layout.tsx
import HeaderStaff from '@/components/HeaderStaff';
export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto ">
      <HeaderStaff />
      <main>{children}</main>
    </div>
  );
}