// src/components/AddressSelector.tsx (修复完成版)
'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState, useTransition } from 'react';

// 类型定义
interface Location {
  id: number;
  name_en: string;
}

interface AddressSelectorProps {
  initialProvinceId?: number | null;
  initialDistrictId?: number | null;
  initialSubDistrictId?: number | null;
  onAddressChange: (ids: { province_id: number | null; district_id: number | null; sub_district_id: number | null }) => void;
}

export default function AddressSelector({
  initialProvinceId,
  initialDistrictId,
  initialSubDistrictId,
  onAddressChange,
}: AddressSelectorProps) {
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();

  // State 定义
  const [provinces, setProvinces] = useState<Location[]>([]);
  const [districts, setDistricts] = useState<Location[]>([]);
  const [subDistricts, setSubDistricts] = useState<Location[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<string>(initialProvinceId?.toString() || '');
  const [selectedDistrict, setSelectedDistrict] = useState<string>(initialDistrictId?.toString() || '');
  const [selectedSubDistrict, setSelectedSubDistrict] = useState<string>(initialSubDistrictId?.toString() || '');

  // 1. 初始加载省份列表
  useEffect(() => {
    startTransition(async () => {
      const { data } = await supabase
        .from('locations')
        .select('id, name_en')
        .eq('level', 1)
        .order('name_en');
      if (data) setProvinces(data);
    });
  }, [supabase]);

  // 2. 加载初始数据（用于编辑模式）
  useEffect(() => {
    const loadInitialData = async () => {
      if (initialProvinceId) {
        const { data: districtData } = await supabase
          .from('locations')
          .select('id, name_en')
          .eq('level', 2)
          .eq('parent_id', initialProvinceId)
          .order('name_en');
        if (districtData) setDistricts(districtData);
      }
      if (initialDistrictId) {
        const { data: subDistrictData } = await supabase
          .from('locations')
          .select('id, name_en')
          .eq('level', 3)
          .eq('parent_id', initialDistrictId)
          .order('name_en');
        if (subDistrictData) setSubDistricts(subDistrictData);
      }
    };

    if (initialProvinceId || initialDistrictId) {
      startTransition(() => {
        loadInitialData();
      });
    }
  }, [initialProvinceId, initialDistrictId, supabase]);

  // 3. 处理省份选择变化
  const handleProvinceChange = async (provinceIdStr: string) => {
    setSelectedProvince(provinceIdStr);
    setSelectedDistrict('');
    setSelectedSubDistrict('');
    setDistricts([]);
    setSubDistricts([]);

    onAddressChange({
      province_id: provinceIdStr ? Number(provinceIdStr) : null,
      district_id: null,
      sub_district_id: null,
    });

    if (provinceIdStr) {
      startTransition(async () => {
        const { data } = await supabase
          .from('locations')
          .select('id, name_en')
          .eq('level', 2)
          .eq('parent_id', Number(provinceIdStr))
          .order('name_en');
        setDistricts(data || []);
      });
    }
  };

  // 4. 处理市/区选择变化
  const handleDistrictChange = async (districtIdStr: string) => {
    setSelectedDistrict(districtIdStr);
    setSelectedSubDistrict('');
    setSubDistricts([]);

    onAddressChange({
      province_id: selectedProvince ? Number(selectedProvince) : null,
      district_id: districtIdStr ? Number(districtIdStr) : null,
      sub_district_id: null,
    });

    if (districtIdStr) {
      startTransition(async () => {
        const { data } = await supabase
          .from('locations')
          .select('id, name_en')
          .eq('level', 3)
          .eq('parent_id', Number(districtIdStr))
          .order('name_en');
        setSubDistricts(data || []);
      });
    }
  };

  // 5. 处理分区选择变化
  const handleSubDistrictChange = (subDistrictIdStr: string) => {
    setSelectedSubDistrict(subDistrictIdStr);
    onAddressChange({
      province_id: selectedProvince ? Number(selectedProvince) : null,
      district_id: selectedDistrict ? Number(selectedDistrict) : null,
      sub_district_id: subDistrictIdStr ? Number(subDistrictIdStr) : null,
    });
  };

  // JSX 渲染部分
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
      {/* 省份选择 */}
      <div>
        <label htmlFor="province" className="block text-sm font-medium  mb-2 text-[var(--foreground)]">
          Province(จังหวัดหรือเมือง)
        </label>
        <select
          id="province"
          value={selectedProvince}
          onChange={(e) => handleProvinceChange(e.target.value)}
          className="select m-[10px] w-[94%]"
        >
          <option value="">Select Province</option>
          {provinces.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name_en}
            </option>
          ))}
        </select>
      </div>

      {/* 市/区选择 */}
      <div>
        <label htmlFor="district" className="block text-sm font-medium  mb-2 text-[var(--foreground)]">
          District(เขต)
        </label>
        <select
          id="district"
          value={selectedDistrict}
          onChange={(e) => handleDistrictChange(e.target.value)}
          disabled={!selectedProvince || isPending}
          className="select m-[10px] w-[94%]"
        >
          <option value="">Select District</option>
          {districts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name_en}
            </option>
          ))}
        </select>
      </div>

      {/* 分区选择 */}
      <div>
        <label htmlFor="sub_district" className="block text-sm font-medium mb-2 text-[var(--foreground)]">
          Sub-district(ตำบล)
        </label>
        <select
          id="sub_district"
          value={selectedSubDistrict}
          onChange={(e) => handleSubDistrictChange(e.target.value)}
          disabled={!selectedDistrict || isPending}
          className="select m-[10px] w-[94%] "
        >
          <option value="">Select Sub-district</option>
          {subDistricts.map((sd) => (
            <option key={sd.id} value={sd.id}>
              {sd.name_en}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}