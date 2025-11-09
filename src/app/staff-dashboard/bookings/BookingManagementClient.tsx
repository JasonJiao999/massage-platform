// src/app/staff-dashboard/bookings/BookingManagementClient.tsx
'use client';

import { useTransition } from 'react';
import { startService, completeService, cancelBooking } from '@/lib/actions';
import { useRouter, useSearchParams } from 'next/navigation';
import PaginationControls from './PaginationControls';

export default function BookingManagementClient({
  bookings,
  totalCount,
  currentPage,
  limit,
}: {
  bookings: any[];
  totalCount: number;
  currentPage: number;
  limit: number;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleAction = (action: (bookingId: string) => Promise<any>, bookingId: string) => {
    startTransition(async () => {
      try {
        await action(bookingId);
      } catch (error: any) {
        alert(`Operation failed: ${error.message}`);
      }
    });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFilter = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set('filter', newFilter);
    params.set('page', '1'); // Reset to first page on filter change
    router.push(`?${params.toString()}`);
  };
  
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-6">

      <div className="bg-card  rounded-lg shadow-md max-w-[1200px] min-w-[500px] mx-auto text-[var(--foreground)] my-[10px]">
        <div className="card overflow-x-auto">
        <select
          onChange={handleFilterChange}
          defaultValue={searchParams.get('filter') || 'all'}
          className="dropdown w-[200px]"
        >
          <option value="all">All Type</option>
          <option value="confirmed">Confirmed</option>
          <option value="in_progress">In_progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled_by_customer">Cancelled_by_customer</option>
          <option value="cancelled_by_worker">Cancelled_by_worker</option>
        </select>
          <table className="table bg-primary">
            <thead className="text-[var(--foreground)]">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium  uppercase tracking-wider">Service Name
                <p>ชื่อบริการ</p>  
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium  uppercase tracking-wider">Customer Info
                  <p>ข้อมูลลูกค้า</p>
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium  uppercase tracking-wider">Appointment Time
                  <p>เวลานัดหมาย</p>
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium  uppercase tracking-wider">Appointment State
                  <p>สถานะการนัดหมาย</p>
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium  uppercase tracking-wider">Working Status
                  <p>ความคืบหน้าในการทำงาน</p>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-white">{booking.services?.name || 'Unknown Service'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    {/* 【核心修改】: 显示顾客姓名和联系方式 */}
                    <div className="font-medium text-white">{booking.customer?.full_name || 'Anonymous customer'}</div>
                    {booking.customer?.bio && (
                      <div className="text-xs text-gray-400 mt-1">
                        Info: {booking.customer.bio}
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-300">
                    {new Date(booking.start_time).toLocaleString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-300">{booking.status}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium space-x-2">
                    {booking.status === 'confirmed' && (
                      <button onClick={() => handleAction(startService, booking.id)} disabled={isPending} className="btn">Start</button>
                    )}
                    {booking.status === 'in_progress' && (
                      <button onClick={() => handleAction(completeService, booking.id)} disabled={isPending} className="btn">Complete</button>
                    )}
                    {booking.status === 'confirmed' && (
                       <button onClick={() => { if(confirm('Are you sure you want to cancel this appointment?')) handleAction((id) => cancelBooking(null, id), booking.id) }} disabled={isPending} className="btn btn-warning">Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        pageParamName="page"
      />
    </div>
  );
}