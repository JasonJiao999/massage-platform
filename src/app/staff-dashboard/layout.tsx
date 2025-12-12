// 文件路徑: src/app/staff-dashboard/layout.tsx
import HeaderStaff from '@/components/HeaderStaff';
import { Providers } from '@/components/Providers';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="container mx-auto ">
        <HeaderStaff />
        <main>{children}</main>
      </div>
    </Providers>
  );
}