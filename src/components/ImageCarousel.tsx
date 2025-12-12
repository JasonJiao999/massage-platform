'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ImageCarouselProps {
  images: { url: string; name: string | null }[];
}

export default function ImageCarousel({ images }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); 
    return () => clearInterval(interval);
  }, [images.length]);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full max-w-[1200px] mx-auto mb-8 aspect-[12/5] overflow-hidden shadow-lg" 
    style={{ borderRadius: '0.5rem' }} // '0.5rem' 是 Tailwind 'rounded-lg' 对应的默认值
    >
      
      {/* 图片背景部分 (保持不变) */}
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out w-full ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={image.url}
            alt={image.name || `Promo Image ${index + 1}`}
            width={1280}
            height={720}
            className="w-full h-full object-cover rounded-lg card "
            priority={index === 0}
          />
        </div>
      ))}
      
      {/* --- 核心修改 START --- */}
      {/* 文字浮层 (已修复垂直居中) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center bg-black/30 p-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white shadow-lg"> {/* --- 主标题--- */}
           
        </h1>
        <p className="mt-4 text-lg text-gray-200 max-w-2xl mx-auto">  {/* --- 副标题 --- */}
          
        </p>
      </div>
      {/* --- 核心修改 END --- */}
      
 
    </div>
  );
}