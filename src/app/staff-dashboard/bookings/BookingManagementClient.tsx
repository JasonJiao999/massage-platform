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

      <div className="bg-card rounded-lg shadow-md w-[full-20px] mx-[10px] text-[var(--foreground)] my-[10px] border">
       
        <select
          onChange={handleFilterChange}
          defaultValue={searchParams.get('filter') || 'all'}
          className="dropdown w-[200px] mb-[24px]"
        >
          <option value="all">All Type</option>
          <option value="confirmed">Confirmed</option>
          <option value="in_progress">In_progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled_by_customer">Cancelled_by_customer</option>
          <option value="cancelled_by_worker">Cancelled_by_worker</option>
        </select>
        
        
        <div className="grid grid-cols-1 min-[768px]:grid-cols-2 min-[1024px]:grid-cols-3 gap-[10px]">
          {bookings.map((booking) => (
           
            <div key={booking.id} className="card bg-primary rounded-lg shadow-lg ">
             
              <div className=" ">
                
                
                <ul className="space-y-[16px]">
                  
                  
                  <li>
                    <label className="text-xs font-medium text-[var(--foreground)] opacity-70 uppercase tracking-wider">
                      ชื่อบริการ
                    </label>
                    <div className="text-sm text-white">{booking.services?.name || 'Unknown Service'}</div>
                  </li>

                
                  <li>
                    <label className="text-xs font-medium text-[var(--foreground)] opacity-70 uppercase tracking-wider">
                      ข้อมูลลูกค้า
                    </label>
                    <div className="font-medium text-white">{booking.customer?.full_name || 'Anonymous customer'}</div>
                    {booking.customer?.bio && (
                      <div className="text-xs text-gray-400 mt-[4px]">
                        Info: {booking.customer.bio}
                      </div>
                    )}
                  </li>

                
                  <li>
                    <label className="text-xs font-medium text-[var(--foreground)] opacity-70 uppercase tracking-wider">
                      เวลานัดหมาย
                    </label>
                    <div className="text-sm text-gray-300">
                      {new Date(booking.start_time).toLocaleString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </li>

                
                  <li>
                    <label className="text-xs font-medium text-[var(--foreground)] opacity-70 uppercase tracking-wider">
                      สถานะการนัดหมาย
                    </label>
                    <div className="text-sm text-gray-300">{booking.status}</div>
                  </li>
                </ul>
                
             
                <div className="border-t border-gray-700  pt-[10px] flex justify-center pb-[10px]">
                  <div>
                    <label className="text-xs font-medium text-[var(--foreground)] opacity-70 uppercase tracking-wider">
                      ความคืบหน้าในการทำงาน
                    </label>
                    <div className=" text-sm font-medium space-x-[8px]">
                      {booking.status === 'confirmed' && (
                        <button onClick={() => handleAction(startService, booking.id)} disabled={isPending} className="btn">Start</button>
                      )}
                      {booking.status === 'in_progress' && (
                        <button onClick={() => handleAction(completeService, booking.id)} disabled={isPending} className="btn">Complete</button>
                      )}
                      {booking.status === 'confirmed' && (
                         <button onClick={() => { if(confirm('Are you sure you want to cancel this appointment?')) handleAction((id) => cancelBooking(null, id), booking.id) }} disabled={isPending} className="btn btn-warning">Cancel</button>
                      )}
                      {booking.status !== 'confirmed' && booking.status !== 'in_progress' && (
                        <p className="text-gray-400 italic text-sm">No actions available.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* กรณีไม่มีข้อมูล */}
          {bookings.length === 0 && (
            <div className="text-center text-gray-400 py-[48px]">
              <p>No bookings found for the selected filter.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* ส่วนควบคุมหน้า (ไม่เปลี่ยนแปลง) */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        pageParamName="page"
      />
    </div>
  );
}