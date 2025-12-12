// 推薦路徑: src/components/AutoPlayCarousel.tsx

'use client'; // 由於使用了 hooks (useRef, useEffect, useState)，這必須是客戶端組件

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

// 定義傳入圖片的類型
interface CarouselImage {
  src: string;
  alt: string;
}

// 定義組件的 props
interface AutoPlayCarouselProps {
  images: CarouselImage[];
  intervalMs?: number; // 將間隔時間設為可選 prop，默認為 30 秒
}

export default function AutoPlayCarousel({ 
  images, 
  intervalMs = 30000 // 默認 30000ms = 30 秒
}: AutoPlayCarouselProps) {
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      // 計算下一張幻燈片的索引
      // 使用 (prev + 1) % images.length 確保循環播放
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, intervalMs); // 使用您要求的 30 秒 (或傳入的) 間隔

    return () => {
      // 組件卸載時清除定時器
      clearInterval(timer);
    };
  }, [images.length, intervalMs]);

  useEffect(() => {
    // 當 currentSlide 變化時，滾動到相應的圖片
    if (carouselRef.current) {
      const slideWidth = carouselRef.current.clientWidth;
      carouselRef.current.scrollLeft = slideWidth * currentSlide;
    }
  }, [currentSlide]);

  return (
    <div 
      ref={carouselRef}
      className="carousel w-full scroll-smooth rounded-box"
      style={{ scrollSnapType: 'x mandatory' }} // 確保滾動停在邊緣
    >
      {images.map((image, index) => (
        <div 
          key={index}
          id={`slide${index}`} // 為了語義化
          className="carousel-item w-full relative aspect-[4/3]"
        >
          {/* 使用 Next.js 的 Image 組件來優化圖片 */}
          
            <Image
              src={image.src}
              alt={image.alt}
              fill
              style={{ objectFit: 'cover' }}
              priority={index === 0} // 優先加載第一張圖
            />
          
        </div>
      ))}
    </div>
  );
}