import React from "react";

export const CustomButton = () => {
  return (
    <div className="relative w-[150px] h-10">
      <div className="fixed top-[-470px] left-[784px] w-[152px] h-10">
        <div className="absolute top-0 left-0 w-[150px] h-10 bg-[#6155f5] rounded-[10px]" />

        <div className="absolute top-3 left-[53px] [font-family:'Inter-Bold',Helvetica] font-bold text-white text-sm tracking-[0] leading-[normal]">
          Button
        </div>
      </div>
    </div>
  );
};
