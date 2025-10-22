'use client'; 

import Image from 'next/image';
import Link from 'next/link';
import { useState, useMemo, useEffect, FC } from "react";
import { format, parseISO, isSameDay } from 'date-fns';
import { createBooking } from '@/lib/actions';
import { FaTwitter, FaInstagram, FaFacebook, FaMapMarkerAlt } from 'react-icons/fa';

// --- 接口定義 ---
interface Profile {
  id: string;
  nickname: string | null;
  avatar_url: string | null;
  bio: string | null;
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
      // 这里可以添加成功后的逻辑，比如刷新数据或跳转页面
    } catch (error: any) {
      setBookingResult({ success: false, message: error.message || "發生未知錯誤。" });
    }
  };

  const socialLinks = worker.social_links || {};

  return (
    <div className="container mx-auto px-4 py-8 text-gray-800">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* 左側：個人信息 */}
        <div className="md:col-span-1 space-y-6 text-center md:text-left">
            <div className="relative w-48 h-48 mx-auto md:mx-0">
                <Image 
                  src={worker.avatar_url || '/default-avatar.png'} 
                  alt={worker.nickname || 'Worker Avatar'} 
                  fill 
                  className="rounded-full object-cover shadow-lg" 
                />
            </div>
            <h1 className="text-4xl font-bold">{worker.nickname}</h1>
            
            {shop && (
              <p className="text-md">
                屬於: <Link href={`/shops/${shop.slug}`} className="text-blue-600 hover:underline">{shop.name}</Link>
              </p>
            )}

            <p className="text-gray-600">{worker.bio}</p>

            <div className="flex justify-center md:justify-start space-x-4">
              {socialLinks.facebook && <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer"><FaFacebook className="text-2xl text-gray-600 hover:text-blue-800"/></a>}
              {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"><FaInstagram className="text-2xl text-gray-600 hover:text-pink-600"/></a>}
              {socialLinks.twitter && <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer"><FaTwitter className="text-2xl text-gray-600 hover:text-blue-500"/></a>}
            </div>

            {worker.years && <p className="text-sm text-gray-500">從業經驗: {worker.years} 年</p>}

            <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
              {worker.tags?.map(tag => <span key={tag} className="bg-gray-200 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full">{tag}</span>)}
            </div>
            
            {fullAddress && (
              <div className="mt-6 text-left p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start">
                      <FaMapMarkerAlt className="text-xl text-gray-500 mr-3 mt-1 flex-shrink-0" />
                      <div>
                          <h3 className="font-semibold text-gray-800">地址</h3>
                          <p className="text-gray-600">{fullAddress}</p>
                      </div>
                  </div>
              </div>
            )}
        </div>

        {/* 右側：服務和預約 */}
        <div className="md:col-span-2 space-y-8">
            <section>
                <h2 className="text-2xl font-semibold mb-4">提供的服務</h2>
                <div className="space-y-4">
                    {services.map(service => (
                        <div key={service.id} onClick={() => setSelectedService(service)} className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedService?.id === service.id ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-400'}`}>
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg">{service.name}</h3>
                                <p className="font-semibold text-blue-600">{service.price} THB</p>
                            </div>
                            <p className="text-gray-600 text-sm mt-1">{service.description}</p>
                            <p className="text-gray-500 text-xs mt-2">時長: {service.duration_value} {service.duration_unit}</p>
                        </div>
                    ))}
                </div>
            </section>
            
            {selectedService && (
                <section className="p-6 bg-white rounded-lg shadow-lg border border-gray-200">
                    <h2 className="text-2xl font-semibold mb-4">選擇預約時間</h2>
                    {/* 日期選擇 */}
                    <div className="flex gap-4 mb-4 border-b pb-4 overflow-x-auto">
                        {Object.keys(initialAvailability).map(date => (
                            <button key={date} onClick={() => setSelectedDate(date)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${selectedDate === date ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                                {format(parseISO(date), 'MM月dd日')}
                            </button>
                        ))}
                    </div>
                    
                    {/* 預約時間顯示區 */}
                    {selectedDate && (initialAvailability[selectedDate]?.length > 0) ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                          {/* 左側：選擇時間 */}
                          <div>
                              <h3 className="font-semibold text-lg mb-2">選擇可用時間</h3>
                              <div className="flex items-center gap-4">
                                <div className="flex-1">
                                  <label htmlFor="hour-select" className="block text-sm font-medium text-gray-700 mb-1">小時</label>
                                  <select id="hour-select" value={selectedHour ?? ''} onChange={(e) => setSelectedHour(e.target.value ? parseInt(e.target.value) : null)} className="w-full p-2 border border-gray-300 rounded-md bg-white shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                    <option value="">--</option>
                                    {availableHours.map(hour => (<option key={hour} value={hour}>{String(hour).padStart(2, '0')}</option>))}
                                  </select>
                                </div>
                                <span className="text-2xl font-bold mt-6">:</span>
                                <div className="flex-1">
                                  <label htmlFor="minute-select" className="block text-sm font-medium text-gray-700 mb-1">分鐘</label>
                                  <select id="minute-select" value={selectedMinute ?? ''} onChange={(e) => setSelectedMinute(e.target.value ? parseInt(e.target.value) : null)} className="w-full p-2 border border-gray-300 rounded-md bg-white shadow-sm focus:ring-blue-500 focus:border-blue-500" disabled={selectedHour === null}>
                                    <option value="">--</option>
                                    {availableMinutes.map(minute => (<option key={minute} value={minute}>{String(minute).padStart(2, '0')}</option>))}
                                  </select>
                                </div>
                              </div>
                          </div>
                          {/* 右側：顯示已預約時間 */}
                          <div>
                              <h3 className="font-semibold text-lg mb-2">本日已預約</h3>
                              <div className="space-y-2 p-3 bg-gray-50 rounded-md max-h-32 overflow-y-auto">
                                  {todaysBookedSlots.length > 0 ? (
                                    todaysBookedSlots.map(booking => (
                                      <div key={booking.start_time} className="text-sm text-gray-600 bg-gray-200 px-2 py-1 rounded">
                                        {format(parseISO(booking.start_time), 'HH:mm')} - {format(parseISO(booking.end_time), 'HH:mm')}
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-sm text-gray-400 text-center py-1">本日尚無預約</p>
                                  )}
                              </div>
                          </div>
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 mt-6 font-semibold">
                        {selectedDate ? `抱歉，${format(parseISO(selectedDate), 'MM月dd日')} 為休息日或已約滿。` : '請先選擇日期'}
                      </p>
                    )}
                    
                    {/* 確認按鈕 */}
                    <button onClick={handleBooking} disabled={!selectedTime} className="mt-6 w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors">
                        {selectedTime ? `確認預約 - ${format(parseISO(selectedTime), 'MM月dd日 HH:mm')}` : '請選擇完整時間'}
                    </button>
                    {bookingResult && <p className={`mt-4 text-sm font-semibold ${bookingResult.success ? 'text-green-600' : 'text-red-600'}`}>{bookingResult.message}</p>}
                </section>
            )}
        </div>
        
        {/* 照片和視頻集 */}
        <section className="md:col-span-3 space-y-8">
            {worker.photo_urls && worker.photo_urls.length > 0 && (
                <div>
                    <h2 className="text-2xl font-semibold mb-4">照片集</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {worker.photo_urls.map((url: string) => (
                            <div key={url} className="relative aspect-square">
                                <Image 
                                  src={url} 
                                  alt="Photo of the worker" 
                                  fill
                                  sizes="(max-width: 768px) 50vw, 25vw"
                                  className="rounded-lg object-cover" 
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {worker.video_urls && worker.video_urls.length > 0 && (
                <div>
                    <h2 className="text-2xl font-semibold mb-4">視頻集</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {worker.video_urls.map((url: string) => (
                            <video key={url} src={url} controls preload="metadata" className="w-full rounded-lg bg-black" />
                        ))}
                    </div>
                </div>
            )}
        </section>

      </div>
    </div>
  );
}

export default WorkerDetailClient;