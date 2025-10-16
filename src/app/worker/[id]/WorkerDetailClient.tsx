// src/app/worker/[id]/WorkerDetailClient.tsx (最终版 - 包含日期选择和所有信息展示)

'use client'; // 关键：定义为客户端组件以处理交互

import Image from 'next/image';
import Link from 'next/link';
import { useState } from "react";
import { format, parseISO } from 'date-fns';
import { createBooking } from '@/lib/actions'; // 导入创建预约的 Action

// 导入社交媒体图标 (请确保已安装 react-icons: pnpm install react-icons)
import { FaTwitter, FaInstagram, FaFacebook } from 'react-icons/fa';

// --- 定义我们需要的所有数据类型 ---
// 这些类型应与从服务器传递的数据结构完全匹配
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
  start: Date; 
  end: Date; 
}

// 主客户端组件
export default function WorkerDetailClient({ 
    worker, 
    services, 
    shop, 
    availabilityByDate 
}: { 
    worker: Profile, 
    services: Service[], 
    shop: Shop | null, 
    // 数据结构为 { '2025-10-16': [{ start: '...', end: '...' }], ... }
    availabilityByDate: Record<string, { start: string, end: string }[]> 
}) {
  
  // --- 状态管理 (State Management) ---
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState<{success: boolean, message: string} | null>(null);

  // --- 事件处理 (Event Handlers) ---
  const handleDateSelect = (dateKey: string) => {
    setSelectedDateKey(dateKey);
    setSelectedTime(null); // 切换日期时，重置已选时间
    setBookingResult(null);
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setSelectedTime(null); // 切换服务时，重置已选时间
    setBookingResult(null);
  }

  const handleTimeSelect = (time: Date) => {
    setSelectedTime(time);
    setBookingResult(null);
  }

  // 【新增】重置按钮的逻辑
  const handleReset = () => {
    setSelectedService(null);
    setSelectedDateKey(null);
    setSelectedTime(null);
    setBookingResult(null);
  };

  const handleBooking = async () => {
    if (!selectedService || !selectedTime) {
      alert("请先选择服务和预约时间。");
      return;
    }
    setIsLoading(true);
    setBookingResult(null);
    try {
      const result = await createBooking(selectedService.id, worker.id, selectedTime.toISOString());
      setBookingResult(result);
      if (result.success) {
        // 预约成功后，可以选择清空选择或显示成功信息
        handleReset();
        alert("预约成功！您可以在“我的预约”中查看详情。");
        // 刷新页面以更新可用时间 (可选)
        window.location.reload();
      }
    } catch (error: any) {
      setBookingResult({ success: false, message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // --- 辅助与计算函数 (Helpers & Computations) ---
  const generateSelectableTimes = () => {
    if (!selectedService || !selectedDateKey || !selectedService.duration_value || !selectedService.duration_unit) return [];
    
    const availabilityForDate = availabilityByDate[selectedDateKey]?.map(s => ({ start: parseISO(s.start), end: parseISO(s.end) })) || [];
    if (availabilityForDate.length === 0) return [];

    let durationInMinutes = selectedService.duration_value;
    if (selectedService.duration_unit === 'hours') durationInMinutes *= 60;

    const times: Date[] = [];
    availabilityForDate.forEach(slot => {
        let currentTime = new Date(slot.start);
        while (currentTime.getTime() + durationInMinutes * 60 * 1000 <= slot.end.getTime()) {
            times.push(new Date(currentTime));
            currentTime.setMinutes(currentTime.getMinutes() + 15); // 每 15 分钟一个可选时间点
        }
    });
    return times;
  };
  
  const selectableTimes = generateSelectableTimes();
  const translateUnit = (unit: string | null) => {
    if (unit === 'minutes') return '分钟';
    if (unit === 'hours') return '小时';
    if (unit === 'days') return '天';
    return '';
  };

  // --- 渲染 (Render) ---
  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* --- 个人资料头部 (完整版) --- */}
        <section className="bg-white p-8 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row items-center gap-8">
                <Image src={worker.avatar_url || '/default-avatar.png'} alt={worker.nickname || 'Worker'} width={150} height={150} className="rounded-full object-cover border-4 border-blue-500" />
                <div className="text-center md:text-left">
                    <h1 className="text-4xl font-bold text-gray-900">{worker.nickname}</h1>
                    {worker.years && worker.years > 0 && <p className="text-md text-gray-600 mt-1">从业 {worker.years} 年</p>}
                    <p className="text-gray-700 mt-4">{worker.bio}</p>
                    <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                        {worker.tags?.map((tag: string) => (
                            <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">{tag}</span>
                        ))}
                    </div>
                </div>
            </div>
            <div className="mt-8 border-t pt-6 space-y-4">
                {worker.feature && worker.feature.length > 0 && (
                    <div>
                        <h3 className="font-semibold text-lg mb-2">个人特色</h3>
                        <ul className="list-disc list-inside text-gray-600 space-y-1">
                            {worker.feature.map((f: string) => <li key={f}>{f}</li>)}
                        </ul>
                    </div>
                )}
                {worker.social_links && Object.values(worker.social_links).some(link => link) && (
                    <div>
                        <h3 className="font-semibold text-lg mb-2">关注我</h3>
                        <div className="flex gap-4">
                            {worker.social_links.twitter && <a href={worker.social_links.twitter} target="_blank" rel="noopener noreferrer"><FaTwitter size={24} className="text-gray-500 hover:text-blue-400" /></a>}
                            {worker.social_links.instagram && <a href={worker.social_links.instagram} target="_blank" rel="noopener noreferrer"><FaInstagram size={24} className="text-gray-500 hover:text-pink-500" /></a>}
                            {worker.social_links.facebook && <a href={worker.social_links.facebook} target="_blank" rel="noopener noreferrer"><FaFacebook size={24} className="text-gray-500 hover:text-blue-600" /></a>}
                        </div>
                    </div>
                )}
            </div>
        </section>

        {/* --- 店铺信息 --- */}
        {shop && (
            <section className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-3">所属店铺</h2>
                <Link href={`/shops/${shop.slug}`} className="group">
                <div className="p-4 border rounded-lg hover:bg-gray-50">
                    <h3 className="text-xl font-bold text-blue-600 group-hover:underline">{shop.name}</h3>
                    <p className="text-gray-600 mt-1">{shop.address}</p>
                </div>
                </Link>
            </section>
        )}

        {/* --- 预约流程 (完整版) --- */}
        <section className="bg-white p-6 rounded-lg shadow-md space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">立即预约</h2>
                {(selectedService || selectedDateKey || selectedTime) && (
                    <button onClick={handleReset} className="text-sm text-gray-500 hover:text-red-500 underline font-medium">重置选择</button>
                )}
            </div>
            
            {/* 步骤 1: 选择服务 */}
            <div>
                <label className="block text-lg font-medium mb-3">1. 选择服务项目</label>
                <div className="space-y-3">
                    {services.map(service => (
                        <button key={service.id} onClick={() => handleServiceSelect(service)} className={`w-full text-left p-4 border rounded-lg transition-all ${selectedService?.id === service.id ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-300' : 'hover:bg-gray-50'}`}>
                            <div className="flex justify-between items-center">
                                <span className="font-semibold">{service.name}</span>
                                <span className="font-bold text-green-600">¥{service.price}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{service.duration_value} {translateUnit(service.duration_unit)}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* 步骤 2: 选择日期 */}
            {selectedService && (
                <div>
                    <label className="block text-lg font-medium mb-3">2. 选择预约日期</label>
                    <div className="flex flex-wrap gap-2">
                        {Object.keys(availabilityByDate).map(dateKey => (
                            <button key={dateKey} onClick={() => handleDateSelect(dateKey)} className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${selectedDateKey === dateKey ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100'}`}>
                                {format(parseISO(dateKey), 'MM月dd日')}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* 步骤 3: 选择时间 */}
            {selectedDateKey && (
                <div>
                    <label className="block text-lg font-medium mb-3">3. 选择预约时间</label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                        {selectableTimes.map((time: Date) => (
                            <button key={time.toISOString()} onClick={() => handleTimeSelect(time)} className={`p-2 border rounded-md text-sm transition-colors ${selectedTime?.getTime() === time.getTime() ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100'}`}>
                                {format(time, 'HH:mm')}
                            </button>
                        ))}
                    </div>
                    {selectableTimes.length === 0 && <p className="text-sm text-gray-500">此服务在该日期已无可用时间。</p>}
                </div>
            )}

            {/* 步骤 4: 确认预订 */}
            {selectedTime && (
                <div className="text-center pt-6 border-t mt-6">
                    <button onClick={handleBooking} disabled={isLoading} className="w-full md:w-auto px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-400 text-lg">
                        {isLoading ? '正在确认...' : `确认预约 ${format(selectedTime, 'MM月dd日 HH:mm')}`}
                    </button>
                    {bookingResult && <p className={`mt-4 text-sm font-semibold ${bookingResult.success ? 'text-green-600' : 'text-red-600'}`}>{bookingResult.message}</p>}
                </div>
            )}
        </section>

        {/* --- 照片和视频集 --- */}
        <section className="space-y-8">
            {worker.photo_urls && worker.photo_urls.length > 0 && (
                <div>
                    <h2 className="text-2xl font-semibold mb-4">照片集</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {worker.photo_urls.map((url: string) => (
                            <Image key={url} src={url} alt="Photo of the worker" width={300} height={300} className="rounded-lg object-cover w-full h-full aspect-square" />
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
      </main>
    </div>
  );
}