// 文件路徑: src/app/customer-dashboard/layout.tsx
import HeaderCustomer from '@/components/HeaderCustomer';
export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <HeaderCustomer />
      <main>{children}</main>
    </div>
  );
}