// src/app/staff-dashboard/bookings/PaginationControls.tsx
'use client';

import { useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  pageParamName: string; // 【核心修改】将类型从 'activePage' | 'pastPage' 修改为 string
};

export default function PaginationControls({ currentPage, totalPages, pageParamName }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 如果总页数小于等于1，则不显示分页控件
  if (totalPages <= 1) {
    return null;
  }

  // 创建下一页和上一页的链接
  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    params.set(pageParamName, pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <div className="flex items-center justify-between mt-4">
      <Link
        href={createPageURL(currentPage - 1)}
        className={`px-4 py-2 text-sm font-medium rounded-md ${isFirstPage ? 'bg-gray-200 text-gray-400 pointer-events-none' : 'bg-white text-gray-700 border hover:bg-gray-50'}`}
        aria-disabled={isFirstPage}
      >
        Previous
      </Link>
      <span className="text-sm text-gray-600">
        Page {currentPage}  / Total {totalPages} 
      </span>
      <Link
        href={createPageURL(currentPage + 1)}
        className={`px-4 py-2 text-sm font-medium rounded-md ${isLastPage ? 'bg-gray-200 text-gray-400 pointer-events-none' : 'bg-white text-gray-700 border hover:bg-gray-50'}`}
        aria-disabled={isLastPage}
      >
        Next
      </Link>
    </div>
  );
}