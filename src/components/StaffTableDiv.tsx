// src/components/StaffTableDiv.tsx
import Link from 'next/link';

// 定义 StaffMember 的类型，以提高代码可读性和类型安全
interface StaffMember {
  id: string;
  is_active: boolean;
  profiles: {
    nickname: string | null;
    email: string | null;
  } | Array<{ nickname: string | null; email: string | null }>; // 考虑到 profiles 可能是数组也可能是单个对象
}

export default function StaffTableDiv({ staffList }: { staffList: StaffMember[] }) {
  return (
    <div className="card bg-primary  divide-y divide-border p-[20px] gap-[10px]">
      {/* Table Header */}
      <div className="bg-background/50 grid grid-cols-3 gap-4 px-6 py-3 text-left text-xs font-medium text-foreground/80 uppercase tracking-wider">
        <div>Nickname</div>
        <div>Status</div>
        <div className="sr-only">Edit</div> {/* Keep sr-only for accessibility if it makes sense for a hidden column */}
      </div>

      {/* Table Body */}
      <div className="divide-y divide-border">
        {staffList && staffList.length > 0 ? (
          staffList.map((staffMember) => { // 类型已经通过接口定义，这里不需要 any
            // 确保 profile 总是单个对象
            const profile = Array.isArray(staffMember.profiles) ? staffMember.profiles[0] : staffMember.profiles;
            return (
              <div key={staffMember.id} className="grid grid-cols-3 my-[10px] items-center ">
                <div className="whitespace-nowrap text-sm font-medium text-foreground">
                  {profile?.nickname || profile?.email || 'N/A'}
                </div>
                <div className="whitespace-nowrap">
                  {staffMember.is_active ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full  ">Enable</span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full  ">Disable</span>
                  )}
                </div>
                <div className="whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/dashboard/staff/${staffMember.id}/edit`} className="btn">Edit</Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className="px-6 py-4 text-center text-sm text-foreground/60">
            No information available. Please click the top right corner to add a new member.
          </div>
        )}
      </div>
    </div>
  );
}