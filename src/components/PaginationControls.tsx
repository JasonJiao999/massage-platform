// src/components/PaginationControls.tsx
'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function PaginationControls({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) {
    return null; // 如果总页数小于等于1，不显示分页
  }

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <div className="flex items-center justify-center space-x-4 mt-12">
      <Link
        href={createPageURL(currentPage - 1)}
        className={`px-4 py-2 text-sm font-medium rounded-md ${isFirstPage ? 'bg-gray-200 text-gray-400 pointer-events-none' : 'bg-white text-gray-700 border hover:bg-gray-50'}`}
        aria-disabled={isFirstPage}
      >
        Previous
      </Link>
      <span className="text-sm text-gray-600">
         {currentPage}  /  {totalPages} 
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