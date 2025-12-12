// src/app/worker/[id]/WorkerDetailClient.tsx
'use client'; 

import Image from 'next/image';
import Link from 'next/link';
import { useState, useMemo, useEffect, FC, Suspense } from "react";
import { format, parseISO, isSameDay } from 'date-fns';
import { createBooking } from '@/lib/actions';
import { FaTwitter, FaInstagram, FaFacebook, FaMapMarkerAlt,FaLine,FaTiktok,FaComments } from 'react-icons/fa';
import { getOrCreateChatRoom } from '@/lib/actions';
import { Tweet, TweetSkeleton } from 'react-tweet';

// --- 接口定義 ---
interface Profile {
  id: string;
  nickname: string | null;
  bio: string | null;
  address_detail: string | null;
  tags: string[] | null;
  years: number | null;
  photo_urls: string[] | null;
  video_urls: string[] | null;
  feature: string[] | null;
  social_links: { [key: string]: string } | null;
  gender: string | null;
  nationality: string | null;
  qr_url: string[] | null;
}
interface Service {
  id: string;
  name: string | null;
  description: string | null;
  price: number | null;
  duration_value: number | null;
  duration_unit: 'minutes' | 'hours' | 'days' | null;
}
interface Shop {
  id: string;
  name: string | null;
  address: string | null;
  slug: string | null;
}
interface TimeSlot {
  start: string;
  end: string;
}
interface Availability {
  [key: string]: TimeSlot[];
}
interface Booking {
  start_time: string;
  end_time: string;
}
interface AvailabilityRule {
  id: string;
  created_at: string;
  worker_profile_id: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  days_of_week: number[];
}
interface AvailabilityOverride {
  id: string;
  created_at: string;
  worker_profile_id: string;
  override_date: string;
  type: 'available' | 'unavailable';
  start_time: string | null;
  end_time: string | null;
}

export interface WorkerDetailProps {
  worker: Profile;
  services: Service[];
  shop: Shop | null;
  initialAvailability: Availability;
  existingBookings: Booking[];
  fullAddress: string;
  availabilityRules: AvailabilityRule[];
  availabilityOverrides: AvailabilityOverride[];
}
// --- 辅助组件：处理 Tweet 渲染和错误 ---
const TweetEmbed: FC<{ url: string }> = ({ url }) => {
    // X/Twitter URL 格式: https://x.com/username/status/TWEET_ID
    const match = url.match(/\/status\/(\d+)/);
    const tweetId = match ? match[1] : null;

    if (!tweetId) {
        return <div className="text-red-400 p-4 border border-red-400 rounded">Invalid Tweet URL format: {url}</div>;
    }

    // 将 Tweet 包裹在 Suspense 中，提供骨架屏
    return (

            <div className="w-full ">
                <Suspense fallback={<TweetSkeleton />}>
                    <Tweet id={tweetId} />
                </Suspense>
            </div>

    );
};

const WorkerDetailClient: FC<WorkerDetailProps> = ({ worker, services, shop, initialAvailability, existingBookings, fullAddress, availabilityRules, availabilityOverrides }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(Object.keys(initialAvailability)[0] || null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [selectedMinute, setSelectedMinute] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<{ success: boolean; message: string } | null>(null);
  const [windowWidth, setWindowWidth] = useState(0);
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);


  useEffect(() => {
    // 设置初始窗口宽度
    setWindowWidth(window.innerWidth);
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const availableHours = useMemo(() => {
    if (!selectedDate || !initialAvailability[selectedDate]) return [];
    const hours = new Set(initialAvailability[selectedDate].map(slot => parseISO(slot.start).getHours()));
    return Array.from(hours).sort((a, b) => a - b);
  }, [selectedDate, initialAvailability]);

  const availableMinutes = useMemo(() => {
    if (selectedHour === null || !selectedDate || !initialAvailability[selectedDate]) return [];
    const minutes = new Set(
      initialAvailability[selectedDate]
        .filter(slot => parseISO(slot.start).getHours() === selectedHour)
        .map(slot => parseISO(slot.start).getMinutes())
    );
    return Array.from(minutes).sort((a, b) => a - b);
  }, [selectedHour, selectedDate, initialAvailability]);

  const todaysBookedSlots = useMemo(() => {
    if (!selectedDate) return [];
    return existingBookings
      .filter(booking => isSameDay(parseISO(booking.start_time), parseISO(selectedDate)))
      .sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime());
  }, [selectedDate, existingBookings]);

  useEffect(() => {
    setSelectedHour(null);
    setSelectedMinute(null);
    setSelectedTime(null);
  }, [selectedDate]);

  useEffect(() => {
    setSelectedMinute(null);
    setSelectedTime(null);
  }, [selectedHour]);

  useEffect(() => {
    if (selectedHour !== null && selectedMinute !== null && selectedDate) {
      const finalTimeSlot = initialAvailability[selectedDate]?.find(slot => {
        const d = parseISO(slot.start);
        return d.getHours() === selectedHour && d.getMinutes() === selectedMinute;
      });
      setSelectedTime(finalTimeSlot?.start || null);
    }
  }, [selectedHour, selectedMinute, selectedDate, initialAvailability]);

  const handleBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      setBookingResult({ success: false, message: "請先選擇服務、日期和時間。" });
      return;
    }
    try {
      const result = await createBooking(selectedService.id, selectedDate, selectedTime);
      setBookingResult(result);
    } catch (error: any) {
      setBookingResult({ success: false, message: error.message || "發生未知錯誤。" });
    }
  };

  const socialLinks = worker.social_links || {};

  // 星期映射（用于显示）
  const dayNames: { [key: number]: string } = {
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
    7: 'Sunday'
  };

  // 使用内联样式确保布局工作
  const layoutStyle = {
    display: 'flex' as const,
    flexDirection: (windowWidth >= 1024 ? 'row' : 'column') as 'row' | 'column',
    gap: '32px'
  };

  const leftPanelStyle = {
    width: windowWidth >= 1024 ? '35%' : '100%'
  };

  const rightPanelStyle = {
    width: windowWidth >= 1024 ? '65%' : '100%'
  };


  return (
    <div className="container max-w-[1200px] py-[20px]">
      <div style={layoutStyle}>
        
        
        <div style={leftPanelStyle}>
<div className='flex flex-wrap justify-center gap-[10px] text-[var(--foreground)]'>


<div className="card bg-primary text-start mx-[10px] w-full">
  <div className="flex flex-col gap-[10px] p-[24px] justify-start">
    <h3>{worker.nickname}</h3>
{/* --- (*** 這是更新後的列表 ***) --- */}
    <ul className="list-none pl-0">
      {worker.years && <li>Age: {worker.years} Y</li>}
      {shop && shop.slug && shop.name && (
        <li>
          Team: <Link 
                  href={`/shops/${shop.slug}`}
                  className='text-[var(--foreground)]'
                >{shop.name}
                </Link>
        </li>
      )}
     
      {worker.gender && <li>Gender: {worker.gender}</li>}
      {worker.nationality && <li>Nationality: {worker.nationality}</li>}
    
      <li>District:{fullAddress}</li>
      <li>Address:{worker.address_detail}</li>

      {worker.tags && worker.tags.length > 0 && (
        <li>Tags: {worker.tags.join(' / ')}</li>
      )}

      {worker.feature && worker.feature.length > 0 && (
        <li>Service Type: {worker.feature.join(' / ')}</li>
      )}
    </ul>
    {/* --- (*** 列表結束 ***) --- */}

{/* --- (*** 這是新添加的聊天按鈕 ***) --- 
<form action={getOrCreateChatRoom.bind(null, worker.id)}>
  <button 
    type="submit" 
    className="btn flex items-center mx-auto" 
  >
    <FaComments />
    <span>Chat with {worker.nickname}</span>
  </button>
</form> */}


  </div>
</div>

<div className="card bg-primary w-full text-start mx-[10px]">
  <div className="card-body">

    <p>Bio:{worker.bio}</p>
<div  className="flex items-center gap-[10px]">


    {socialLinks.facebook && (
      <a 
        href={socialLinks.facebook} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-[var(--foreground)] hover:text-[var(--color-third)] transition-colors"
      >

        <FaFacebook size={24} />
      </a>
    )}

    {socialLinks.instagram && (
      <a 
        href={socialLinks.instagram} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-[var(--foreground)] hover:text-[var(--color-third)] transition-colors"
      >

        <FaInstagram size={24} />
      </a>
    )}

    {socialLinks.twitter && (
      <a 
        href={socialLinks.twitter} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-[var(--foreground)] hover:text-[var(--color-third)]  transition-colors"
      >

        <FaTwitter size={24} />
      </a>
    )}

      {/* --- 新增：Tiktok --- */}
      {socialLinks.tiktok && (
        <a 
          href={socialLinks.tiktok} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[var(--foreground)] hover:text-[var(--color-third)] transition-colors"
        >
          <FaTiktok size={24} />
        </a>
      )}

    {/* --- 新增：Line --- */}
      {socialLinks.line && (
        <a 
          href={socialLinks.line} // 假設 'social_links.line' 是一個可點擊的 URL 或 Line ID
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[var(--foreground)] hover:text-[var(--color-third)] transition-colors"
        >
          <FaLine size={24} />
        </a>
      )}


    </div>
  </div>
</div>

{/* --- (*** 這是新添加的 QR 碼卡片 ***) --- */}
{worker.qr_url && worker.qr_url.length > 0 && (
  <div className="card bg-primary w-full text-start mx-[10px]">
    <div className="card-body">
      <h3 className="text-xl font-semibold mb-4">QR Codes</h3>
      <div className="flex flex-wrap justify-center gap-[5px]">
        {worker.qr_url.map((url, index) => (
          <div key={index} className="relative ">
            <Image
              src={url}
              alt={`QR Code ${index + 1}`}
              width={100}
              height={100}
              className="object-cover card"
            />
          </div>
        ))}
      </div>
    </div>
  </div>
)}
{/* --- (*** QR 碼卡片結束 ***) --- */}

{/* 服务列表 */}
{services.length > 0 && (
  <div className="card bg-[var(--color-third)] w-full mx-[10px] text-[var(--color-secondary)]">
    <div className="card-body">
      <h3 className="text-xl font-semibold mb-4">Service List</h3>
      <div className="space-y-3">
        {services.map(service => (
          <div key={service.id} className="w-full">
            <div
              onClick={() => setExpandedServiceId(expandedServiceId === service.id ? null : service.id)}
              style={{ cursor: 'pointer' }}
              className="flex items-center justify-between p-3  text-[var(--color-secondary)] rounded-lg hover:opacity-80 transition-opacity"
            >
              <h3 className="">{service.name}</h3>
              <span className="text-xl">{expandedServiceId === service.id ? '−' : '+'}</span>
            </div>

            {expandedServiceId === service.id && (
              <div className="card mt-2 p-[10px] bg-[var(--color-secondary)] text-[var(--foreground)] rounded-lg space-y-2">
                {service.name && (
                  <div>
                    <span className="font-semibold">Service Name: </span>
                    {service.name}
                  </div>
                )}
                {service.description && (
                  <div>
                    <span className="font-semibold">Description: </span>
                    {service.description}
                  </div>
                )}
                {service.duration_value && service.duration_unit && (
                  <div>
                    <span className="font-semibold">Duration: </span>
                    {service.duration_value} {service.duration_unit}
                  </div>
                )}
                {service.price && (
                  <div>
                    <span className="font-semibold">Price: </span>
                    {service.price} THB
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
)}

{/* Availability Rules 卡片 */}
{availabilityRules.length > 0 && (
  <div className="card bg-[var(--color-third)] w-full text-start mx-[10px] text-[var(--color-secondary)]">
    <div className="card-body">
      <h3 className="text-xl font-semibold mb-4">Work Schedule</h3>
      <div className="space-y-3">
        {availabilityRules.map((rule) => (
          <div key={rule.id} className="border border-[var(--color-third)] rounded-lg p-3">
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div>
                <span className="font-semibold">Period: </span>
                {format(parseISO(rule.start_date), 'MMM dd, yyyy')} - {format(parseISO(rule.end_date), 'MMM dd, yyyy')}
              </div>
              <div>
                <span className="font-semibold">Time: </span>
                {rule.start_time} - {rule.end_time}
              </div>
              <div>
                <span className="font-semibold">Days: </span>
                {rule.days_of_week.map(day => dayNames[day]).join(', ')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}

{/* Availability Overrides 卡片 */}
{availabilityOverrides.length > 0 && (
  <div className="card bg-[var(--color-third)] w-full text-start mx-[10px] text-[var(--color-secondary)]">
    <div className="card-body">
      <h3 className="text-xl font-semibold mb-4">Temporary Schedule</h3>
      <div className="space-y-3">
        {availabilityOverrides.map((override) => (
          <div key={override.id} className="border-b border-[var(--color-secondary)] rounded-lg p-[10px]">
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div>
                <span className="font-semibold">Date: </span>
                {format(parseISO(override.override_date), 'MMM dd, yyyy')}
              </div>
              <div>
                <span className="font-semibold">Type: </span>
                <span className={override.type === 'available' ? 'text-green-600' : 'text-red-600'}>
                  {override.type.toUpperCase()}
                </span>
              </div>
              {override.type === 'available' && override.start_time && override.end_time && (
                <div>
                  <span className="font-semibold">Time: </span>
                  {override.start_time} - {override.end_time}
                </div>
              )}

            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}

</div>






{/* 预约对话框 
<dialog id="booking_modal" className="modal">
  <div className="modal-box px-[30px] bg-[var(--color-third)]" style={{ maxWidth: '400px' }}>
    <h3 className="font-bold text-lg">Booking</h3>
    
    {selectedService && (
      <div>
        
        <div>
          <p>
           Making an appointment: <span>{selectedService.name}</span>
          </p>
          <div className="flex justify-between gap-2 mb-4 overflow-x-auto items-center">
          <p>Price: {selectedService.price} THB</p>
          <p>Time: {selectedService.duration_value} {selectedService.duration_unit}</p>
          </div>
        </div>

        <h3>Select Date</h3>

        
        <div className="flex justify-evenly gap-2 mb-4 overflow-x-auto items-center">
          {Object.keys(initialAvailability).map(date => (
            <button 
              key={date} 
              onClick={() => setSelectedDate(date)}
              className={`btn ${
                selectedDate === date ? 'btn-warning' : 'btn-neutral'
              }`}
            >
              {format(parseISO(date), 'MMM dd, yyyy')}
            </button>
          ))}
        </div>
        
       
        {selectedDate && (initialAvailability[selectedDate]?.length > 0) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px] ">
            
            <div>
              <h3 className="font-semibold mb-2">Select Time(24H)</h3>
              <div className="flex items-center gap-2">
                <div className="flex-1 mx-[10px]">
                  <label htmlFor="hour-select" className="block text-sm mb-1">HH</label>
                  <select 
                    id="hour-select" 
                    value={selectedHour ?? ''} 
                    onChange={(e) => setSelectedHour(e.target.value ? parseInt(e.target.value) : null)}
                    className="select select-primary"
                  >
                    <option value="">--</option>
                    {availableHours.map(hour => (
                      <option key={hour} value={hour}>{String(hour).padStart(2, '0')}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex-1 mx-[10px]">
                  <label htmlFor="minute-select" className="block text-sm mb-1">MM</label>
                  <select 
                    id="minute-select" 
                    value={selectedMinute ?? ''} 
                    onChange={(e) => setSelectedMinute(e.target.value ? parseInt(e.target.value) : null)} 
                    disabled={selectedHour === null}
                    className="select select-primary"
                  >
                    <option value="">--</option>
                    {availableMinutes.map(minute => (
                      <option key={minute} value={minute}>{String(minute).padStart(2, '0')}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            
            <div>
              <h3>Today's Scheduled Time</h3>
              <div className="space-y-1 p-3 bg-gray-50 rounded max-h-32 overflow-y-auto">
                {todaysBookedSlots.length > 0 ? (
                  todaysBookedSlots.map(booking => (
                    <div key={booking.start_time} className="text-sm text-gray-600 bg-gray-200 px-2 py-1 rounded">
                      {format(parseISO(booking.start_time), 'HH:mm')} - {format(parseISO(booking.end_time), 'HH:mm')}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 text-center py-1">There are no reservations for today.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 my-4">
           {selectedDate ? `Sorry, ${format(parseISO(selectedDate), 'MM/dd/yyyy')} is unavailable.` : 'Please select a date'}
          </p>
        )}
        
        
        <button 
          onClick={handleBooking} 
          disabled={!selectedTime}
          className="btn mx-auto block"
        >
          {selectedTime ? `Confirm Booking - ${format(parseISO(selectedTime), 'MM/dd/yyyy HH:mm')}` : 'Please select complete time'}
        </button>
        {bookingResult && (
          <p className={`mt-4 text-sm font-semibold ${bookingResult.success ? 'text-green-600' : 'text-red-600'}`}>
            {bookingResult.message}
          </p>
        )}
      </div>
    )}

    <div className="modal-action">
      <form method="dialog">
        <button className="btn">Close</button>
      </form>
    </div>
  </div>
</dialog> 
*/}

        </div>

        
        <div style={rightPanelStyle} className="w-full">
          <div className='flex flex-wrap justify-center text-[var(--foreground)]'>




          {worker.photo_urls && worker.photo_urls.length > 0 && (
            <div className="w-full">
              
              <div className="flex flex-col items-center ">
                <div className="carousel w-full rounded-box">
                  {worker.photo_urls.map((url: string, index: number) => (
                    <div 
                      key={url} 
                      id={`slide${index + 1}`} 
                      className="carousel-item relative w-full"
                    >
                      <div className="relative  aspect-[3/4] max-h-full w-[95%] mx-auto ">
                        <Image
                          src={url}
                          alt={`Photo ${index + 1} of the worker`}
                          fill
                          sizes=""
                          className="object-cover card"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center w-full">
                  {worker.photo_urls.map((url: string, index: number) => (
                    <a 
                      key={`button-${url}`} 
                      href={`#slide${index + 1}`} 
                      className="btn btn-xs"
                    >
                      {index + 1}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
{/* --- X/Twitter 视频嵌入区域 (使用 react-tweet) --- */}
          {worker.video_urls && worker.video_urls.length > 0 && (
            <div className="flex justify-center w-full ">
              {worker.video_urls.map((url, index) => {
                  
                  const cleanedUrl = url.split('?')[0]; 
                  
                  return (
                    <div key={index} className="flex m-[10px] max-w-[90%]">
                      
                      {/* 【核心修复】使用 TweetEmbed 组件 */}
                      <TweetEmbed url={cleanedUrl} />

                    </div>
                  );
              })}
            </div>
          )}
          {/* --- 结束 X/Twitter 视频 --- */}
          </div>



        </div>
      </div>
    </div>
  );
}

export default WorkerDetailClient;