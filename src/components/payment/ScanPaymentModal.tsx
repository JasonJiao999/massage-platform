'use client';

import { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { SubscriptionPlan, ChainType, PaymentOrderResponse } from '@/lib/payment/types';

interface ScanPaymentModalProps {
  plan: SubscriptionPlan;
  onClose: () => void;
}

export default function ScanPaymentModal({ plan, onClose }: ScanPaymentModalProps) {
  const [selectedChain, setSelectedChain] = useState<ChainType>('BSC');
  const [orderData, setOrderData] = useState<PaymentOrderResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // 创建支付订单
  const createOrder = async (chain: ChainType) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          chain,
          paymentMethod: 'scan',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to create order');
      }

      setOrderData(data.data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    createOrder(selectedChain);
  }, [selectedChain]);

  const handleCopyAddress = () => {
    if (orderData) {
      navigator.clipboard.writeText(orderData.recipientAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
      <div className="card bg-[var(--color-third)] text-text-[var(--foreground)] w-full max-h-[90vh] overflow-y-auto p-[20px] gap-[10px]">
        <div className="flex justify-between items-center ">
          <h3 className="text-xl font-bold text-black">สแกน QR Code เพื่อชำระเงิน</h3>
          <button onClick={onClose} className="text-2xl text-black">&times;</button>
        </div>

        {/* 链选择 */}
        <div className="gap-[10px]">
          <label className="block text-sm font-medium ">เลือกเครือข่าย (Select Network)</label>
          <div className="flex gap-[10px]">
            <button
              onClick={() => setSelectedChain('BSC')}
              className={`flex-1 text-[var(--foreground)] btn ${selectedChain === 'BSC' ? 'btn-primary' : 'btn'}`}
            >
              BSC
            </button>
            <button
              onClick={() => setSelectedChain('Polygon')}
              className={`flex-1 text-[var(--foreground)] btn ${selectedChain === 'Polygon' ? 'btn-primary' : 'btn'}`}
            >
              Polygon
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="loading loading-spinner loading-lg"></div>
            <p className="mt-2 text-black">กำลังสร้างคำสั่งซื้อ...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-error ">
            <span>{error}</span>
          </div>
        )}

        {orderData && !loading && (
          <div className="space-y-[10px]">
            {/* QR Code */}
            <div className="flex justify-center bg-white  rounded">
              <QRCodeCanvas
                value={orderData.recipientAddress}
                size={200}
                level="H"
              />
            </div>

            {/* 收款地址 */}
            <div>
              <label className="block text-sm font-medium mb-1 text-black">ที่อยู่กระเป๋าเงิน (Wallet Address)</label>
              <div className="flex gap-[10px]">
                <input
                  type="text"
                  value={orderData.recipientAddress}
                  readOnly
                  className="input input-bordered flex-1 text-sm"
                />
                <button onClick={handleCopyAddress} className="btn btn-square">
                  {copied ? '✓' : '📋'}
                </button>
              </div>
            </div>

            {/* 支付金额 */}
            <div>
              <label className="block text-sm font-medium mb-1 text-black">จำนวนเงิน (Amount)</label>
              <div className="text-2xl font-bold text-black">{orderData.amount} USDT</div>
            </div>

            {/* 订单信息 */}
            <div className="bg-gray-100 p-3 rounded text-sm space-y-1">
              <div className="flex justify-between">
                <span >เลขคำสั่งซื้อ:</span>
                <span className="font-mono text-black">{orderData.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span >เครือข่าย:</span>
                <span className="text-black">{orderData.chainName}</span>
              </div>
              <div className="flex justify-between">
                <span >หมดอายุ:</span>
                <span className="text-black">{new Date(orderData.expiresAt).toLocaleString('th-TH')}</span>
              </div>
            </div>

            {/* 重要提示 */}
            <div className="alert alert-warning">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <div className="text-sm">
                <p className="font-bold">คำเตือนสำคัญ!</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>ส่ง USDT เท่านั้น บนเครือข่าย {orderData.chainName}</li>
                  <li>ส่งจำนวนเงินที่ถูกต้อง: {orderData.amount} USDT</li>
                  <li>การชำระเงินจะหมดอายุภายใน 30 นาที</li>
                  <li>หลังโอนเสร็จ รอ 5-10 นาทีเพื่อยืนยัน</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-[10px]">

          {orderData && (
            <a
              href={`${orderData.explorerUrl}/address/${orderData.recipientAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn mx-auto no-underline"
            >
              ตรวจสอบการชำระเงิน | Check payment
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
