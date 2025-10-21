// src/app/worker/[id]/WorkerDetailClient.tsx (最终修复版 - 已重新加入地址显示)

'use client'; 

import Image from 'next/image';
import Link from 'next/link';
import { useState } from "react";
import { format, parseISO } from 'date-fns';
import { createBooking } from '@/lib/actions';
import { FaTwitter, FaInstagram, FaFacebook, FaMapMarkerAlt } from 'react-icons/fa';

// --- 定义数据类型 (保持不变) ---
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
interface WorkerDetailProps {
  worker: Profile;
  services: Service[];
  shop: Shop | null;
  initialAvailability: Availability;
  fullAddress: string;
}

export default function WorkerDetailClient({ worker, services, shop, initialAvailability, fullAddress }: WorkerDetailProps) {
  console.log("--- [客户端日志 - WorkerDetailClient.tsx] ---");
  console.log("接收到的 fullAddress prop:", fullAddress);
  console.log("-----------------------------------------");

  const [selectedDate, setSelectedDate] = useState(Object.keys(initialAvailability)[0]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleBooking = async () => {
    if (!selectedService || !selectedTime) {
      setBookingResult({ success: false, message: "请先选择服务和时间。" });
      return;
    }
    const result = await createBooking(worker.id, selectedService.id, selectedTime);
    setBookingResult(result);
  };

  const socialLinks = worker.social_links || {};

  return (
    <div className="container mx-auto px-4 py-8 text-gray-800">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* 左侧：个人信息 */}
        <div className="md:col-span-1 space-y-6 text-center md:text-left">
            <div className="relative w-48 h-48 mx-auto md:mx-0">
                <Image src={worker.avatar_url || '/default-avatar.png'} alt={worker.nickname || 'Worker Avatar'} layout="fill" className="rounded-full object-cover shadow-lg" />
            </div>
            <h1 className="text-4xl font-bold">{worker.nickname}</h1>
            
            {shop && (
              <p className="text-md">
                属于: <Link href={`/shops/${shop.slug}`} className="text-blue-600 hover:underline">{shop.name}</Link>
              </p>
            )}

            <p className="text-gray-600">{worker.bio}</p>

            <div className="flex justify-center md:justify-start space-x-4">
              {socialLinks.facebook && <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer"><FaFacebook className="text-2xl text-gray-600 hover:text-blue-800"/></a>}
              {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"><FaInstagram className="text-2xl text-gray-600 hover:text-pink-600"/></a>}
              {socialLinks.twitter && <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer"><FaTwitter className="text-2xl text-gray-600 hover:text-blue-500"/></a>}
            </div>

            {worker.years && <p className="text-sm text-gray-500">从业经验: {worker.years} 年</p>}

            <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
              {worker.tags?.map(tag => <span key={tag} className="bg-gray-200 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full">{tag}</span>)}
            </div>
            
            {/* 【核心修复】重新加入地址显示模块 */}
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

        {/* 右侧：服务和预约 */}
        <div className="md:col-span-2 space-y-8">
            <section>
                <h2 className="text-2xl font-semibold mb-4">提供的服务</h2>
                <div className="space-y-4">
                    {services.map(service => (
                        <div key={service.id} onClick={() => setSelectedService(service)} className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedService?.id === service.id ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-400'}`}>
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg">{service.name}</h3>
                                <p className="font-semibold text-blue-600">{service.price} THB</p>
                            </div>
                            <p className="text-gray-600 text-sm mt-1">{service.description}</p>
                            <p className="text-gray-500 text-xs mt-2">时长: {service.duration_value} {service.duration_unit}</p>
                        </div>
                    ))}
                </div>
            </section>
            
            {selectedService && (
                <section className="p-6 bg-white rounded-lg shadow-lg border border-gray-200">
                    <h2 className="text-2xl font-semibold mb-4">选择预约时间</h2>
                    <div className="flex gap-4 mb-4 border-b pb-4">
                        {Object.keys(initialAvailability).map(date => (
                            <button key={date} onClick={() => { setSelectedDate(date); setSelectedTime(null); }} className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedDate === date ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                                {format(parseISO(date), 'MM月dd日')}
                            </button>
                        ))}
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {initialAvailability[selectedDate]?.map(slot => (
                            <button key={slot.start} onClick={() => setSelectedTime(slot.start)} disabled={!selectedService} className={`p-2 rounded-lg text-sm transition-colors ${selectedTime === slot.start ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50'}`}>
                                {format(parseISO(slot.start), 'HH:mm')}
                            </button>
                        ))}
                    </div>
                    
                    <button onClick={handleBooking} disabled={!selectedTime || !selectedService} className="mt-6 w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors">
                        {`确认预约 - ${selectedService?.price} THB - ${selectedTime ? format(parseISO(selectedTime), 'MM月dd日 HH:mm') : ''}`}
                    </button>
                    {bookingResult && <p className={`mt-4 text-sm font-semibold ${bookingResult.success ? 'text-green-600' : 'text-red-600'}`}>{bookingResult.message}</p>}
                </section>
            )}
        </div>

        {/* --- 照片和视频集 --- */}
        <section className="md:col-span-3 space-y-8">
            {worker.photo_urls && worker.photo_urls.length > 0 && (
                <div>
                    <h2 className="text-2xl font-semibold mb-4">照片集</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {worker.photo_urls.map((url: string) => (
                            <Image 
                              key={url} 
                              src={url} 
                              alt="Photo of the worker" 
                              width={300} 
                              height={400}
                              quality={95}
                              unoptimized
                              className="rounded-lg object-cover w-full h-full aspect-square" 
                            />
                        ))}
                    </div>
                </div>
            )}
            {worker.video_urls && worker.video_urls.length > 0 && (
                <div>
                    <h2 className="text-2xl font-semibold mb-4">视频集</h2>
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