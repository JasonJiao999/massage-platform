'use client'; 

import Image from 'next/image';
import Link from 'next/link';
import { useState, useMemo, useEffect, FC } from "react";
import { format, parseISO, isSameDay } from 'date-fns';
import { createBooking } from '@/lib/actions';
import { FaTwitter, FaInstagram, FaFacebook, FaMapMarkerAlt } from 'react-icons/fa';
import { HiH2 } from 'react-icons/hi2';

// --- 接口定義 ---
interface Profile {
  id: string;
  nickname: string | null;
  avatar_url: string | null;
  bio: string | null;
  address_detail: string | null;
  tags: string[] | null;
  years: number | null;
  photo_urls: string[] | null;
  video_urls: string[] | null;
  feature: string[] | null;
  social_links: { [key: string]: string } | null;
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
interface WorkerDetailProps {
  worker: Profile;
  services: Service[];
  shop: Shop | null;
  initialAvailability: Availability;
  existingBookings: Booking[];
  fullAddress: string;
}

const WorkerDetailClient: FC<WorkerDetailProps> = ({ worker, services, shop, initialAvailability, existingBookings, fullAddress }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(Object.keys(initialAvailability)[0] || null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [selectedMinute, setSelectedMinute] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<{ success: boolean; message: string } | null>(null);
  const [windowWidth, setWindowWidth] = useState(0);

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

  // 使用内联样式确保布局工作
  const layoutStyle = {
    display: 'flex' as const,
    flexDirection: (windowWidth >= 1024 ? 'row' : 'column') as 'row' | 'column',
    gap: '32px'
  };

  const leftPanelStyle = {
    width: windowWidth >= 1024 ? '33.333%' : '100%'
  };

  const rightPanelStyle = {
    width: windowWidth >= 1024 ? '66.667%' : '100%'
  };

  return (
    <div className="container mx-auto px-4 py-8 text-gray-800 max-w-[1200px]">
      <div style={layoutStyle}>
        
        
        <div style={leftPanelStyle}>
          
          {worker.photo_urls && worker.photo_urls.length > 0 && (
            <div>
              
              <div className="flex flex-col items-center">
                <div className="carousel w-full max-w-[450px] rounded-box mx-[10px] my-[10px]">
                  {worker.photo_urls.map((url: string, index: number) => (
                    <div 
                      key={url} 
                      id={`slide${index + 1}`} 
                      className="carousel-item relative w-full"
                    >
                      <div className="relative w-full aspect-[3/4] max-h-[600px]">
                        <Image
                          src={url}
                          alt={`Photo ${index + 1} of the worker`}
                          fill
                          sizes="450px"
                          className="object-cover"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center w-full max-w-[500px] py-2 gap-2">
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

          
          {worker.video_urls && worker.video_urls.length > 0 && (
            <div>
              
              <div className="grid grid-cols-1 gap-6 justify-items-center my-[10px]">
                {worker.video_urls.map((url: string) => (
                  <div 
                    key={url} 
                    className="
                      shadow-md
                      overflow-hidden
                      w-full
                      max-w-[450px]
                      max-h-[600px]
                      aspect-[3/4]
                      flex items-center justify-center
                    "
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '0.5rem'
                    }}
                  >
                    <video 
                      src={url} 
                      controls 
                      preload="metadata" 
                      className="
                        w-full
                        h-full
                        object-cover
                      " 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        
        <div style={rightPanelStyle}>
         
<div className='flex flex-wrap justify-center gap-6 text-[var(--foreground)]' data-theme="mytheme">


<div className="card bg-primary w-[300px] mx-[10px] my-[10px] text-center mb-12">
  <div className="card-body">
    <h1 className="card-title">Name</h1>
    <h2>{worker.nickname}</h2>
  </div>
</div>
<div className="card bg-primary  w-[300px] mx-[10px] my-[10px] text-center mb-12">
  <div className="card-body">
    <h1 className="card-title">Age</h1>
    {worker.years && <h2> {worker.years} Y</h2>}
  </div>
</div>
<div className="card bg-primary  w-[300px] mx-[10px] my-[10px] text-center mb-12">
  <div className="card-body">
    <h1 className="card-title">Work In</h1>
      {shop && (
    <h2>
      <Link href={`/shops/${shop.slug}`}>{shop.name}</Link>
    </h2>
  )}
  </div>
</div>
<div className="card bg-primary w-[300px] mx-[10px] my-[10px] text-center mb-12">
  <div className="card-body">
    <h1 className="card-title">Building</h1>
    <h2>{worker.address_detail}</h2>
  </div>
</div>
{fullAddress && (
<div className="card bg-primary  w-[620px] mx-[10px] my-[10px] text-center mb-12">
  <div className="card-body">
    <h1 className="card-title">District</h1>
    <h2> {fullAddress}</h2> 
  </div>
</div>
  )}
<div className="card bg-primary w-[620px] mx-[10px] my-[10px] text-center mb-12">
  <div className="card-body">
    <h1 className="card-title">Bio</h1>
    <h2>{worker.bio}</h2>
    <div>
    {socialLinks.facebook && <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer"><FaFacebook /></a>}
    {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"><FaInstagram /></a>}
    {socialLinks.twitter && <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer"><FaTwitter /></a>}
  </div>
  </div>
</div>
<div className="card bg-primary w-[620px] mx-[10px] my-[10px] text-center mb-12">
  <div className="card-body">
    <h1 className="card-title">Tags</h1>
    <h2>{worker.tags?.map(tag => <span key={tag}>{tag}</span>)}</h2> 
  </div>
</ div>

  

</div>




{/* 服务列表 */}
<ul className="menu bg-base-200 rounded-box w-[610px] flex flex-wrap justify-center gap-6 mx-auto">
  <li className="menu-title">Service List</li>
  <li>
    {services.map(service => (
      <div 
        key={service.id} 
        onClick={() => {
          setSelectedService(service);
          const modal = document.getElementById('booking_modal') as HTMLDialogElement | null;
          if (modal) {
            modal.showModal();
          }
        }}
        style={{ cursor: 'pointer' }}
      >
        <h3 className="w-[100px]">{service.name}</h3>
        <p>{service.description}</p>
        <div className="w-[100px]">
          <p>Time: {service.duration_value} {service.duration_unit}</p>
          <p>{service.price} THB</p>
        </div>
      </div>
    ))}
  </li>
</ul>

{/* 预约对话框 */}
<dialog id="booking_modal" className="modal">
  <div className="modal-box px-[30px]" style={{ maxWidth: '400px' }}>
    <h3 className="font-bold text-lg">Booking</h3>
    
    {selectedService && (
      <div>
        {/* 显示选择的服务信息 */}
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

        {/* 日期選擇 */}
        <div className="flex justify-evenly gap-2 mb-4 overflow-x-auto items-center">
          {Object.keys(initialAvailability).map(date => (
            <button 
              key={date} 
              onClick={() => setSelectedDate(date)}
              className={`btn ${
                selectedDate === date ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {format(parseISO(date), 'MMM dd, yyyy')}
            </button>
          ))}
        </div>
        
        {/* 預約時間顯示區 */}
        {selectedDate && (initialAvailability[selectedDate]?.length > 0) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 左側：選擇時間 */}
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
            
            {/* 右側：顯示已預約時間 */}
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
        
        {/* 確認按鈕 */}
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


        </div>
      </div>
    </div>
  );
}

export default WorkerDetailClient;