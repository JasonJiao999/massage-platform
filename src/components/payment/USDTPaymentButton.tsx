'use client';

import { useState } from 'react';
import ScanPaymentModal from './ScanPaymentModal';
import WalletPaymentModal from './WalletPaymentModal';
import { SubscriptionPlan } from '@/lib/payment/types';

interface USDTPaymentButtonProps {
  plan: SubscriptionPlan;
  className?: string;
}

export default function USDTPaymentButton({ plan, className = '' }: USDTPaymentButtonProps) {
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'scan' | 'wallet' | null>(null);

  const handlePaymentSelect = (method: 'scan' | 'wallet') => {
    setPaymentMethod(method);
    setShowPaymentOptions(false);
  };

  return (
    <>
      <button
        onClick={() => setShowPaymentOptions(true)}
        className={`btn btn-primary ${className}`}
      >
        ชำระด้วย USDT (Pay with USDT)
      </button>

      {/* 支付方式选择弹窗 */}
      {showPaymentOptions && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 justify-center z-50">
          <div className="card bg-[var(--color-third)] text-white max-w-md w-[300px] p-[20px]">
            <h3 className="text-xl font-bold mb-4 text-center">เลือกวิธีการชำระเงิน <br/> (Select Payment Method)</h3>
            <div className="space-y-[10px]">
              <button
                onClick={() => handlePaymentSelect('scan')}
                className="w-full btn "
              >
                📱 สแกน QR Code (Scan QR Code)
              </button>
              <button
                onClick={() => handlePaymentSelect('wallet')}
                className="w-full btn "
              >
                👛 เชื่อมต่อกระเป๋าเงิน (Connect Wallet)
              </button>
              <button
                onClick={() => setShowPaymentOptions(false)}
                className="w-full btn "
              >
                ยกเลิก (Cancel)
              </button>
            </div>
          </div>
        </div>
      )}
 
      {/* 扫码支付弹窗 */}
      {paymentMethod === 'scan' && (
        <ScanPaymentModal
          plan={plan}
          onClose={() => setPaymentMethod(null)}
        />
      )}

      {/* 钱包支付弹窗 */}
      {paymentMethod === 'wallet' && (
        <WalletPaymentModal
          plan={plan}
          onClose={() => setPaymentMethod(null)}
        />
      )}
    </>
  );
}
