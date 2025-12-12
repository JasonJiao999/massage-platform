'use client';

import { useState } from 'react';
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { SubscriptionPlan, ChainType } from '@/lib/payment/types';
import { CHAIN_CONFIGS } from '@/lib/payment/chains.config';

interface WalletPaymentModalProps {
  plan: SubscriptionPlan;
  onClose: () => void;
}

export default function WalletPaymentModal({ plan, onClose }: WalletPaymentModalProps) {
  const [selectedChain, setSelectedChain] = useState<ChainType>('BSC');
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const targetChainId = CHAIN_CONFIGS[selectedChain].chainId;

  const handleConnect = (connector: any) => {
    connect({ connector, chainId: targetChainId });
  };

  const handleSwitchChain = () => {
    switchChain({ chainId: targetChainId });
  };

  const isCorrectChain = chain?.id === targetChainId;

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
      <div className="card bg-[var(--color-third)] text-text-[var(--foreground)] max-w-lg w-full p-[20px] gap-[10px]">
        <div className="flex justify-between items-center ">
          <h3 className="text-xl font-bold text-black">เชื่อมต่อกระเป๋าเงิน</h3>
          <button onClick={onClose} className="text-2xl text-black">&times;</button>
        </div>

        {/* 链选择 */}
        <div className="space-y-[10px]">
          <label className="block text-sm font-medium mb-2 text-black">เลือกเครือข่าย (Select Network)</label>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedChain('BSC')}
              className={`flex-1 text-[var(--foreground)] btn ${selectedChain === 'BSC' ? 'btn-primary' : 'btn'}`}
              disabled={isConnected}
            >
              BSC
            </button>
            <button
              onClick={() => setSelectedChain('Polygon')}
              className={`flex-1 text-[var(--foreground)] btn ${selectedChain === 'Polygon' ? 'btn-primary' : 'btn'}`}
              disabled={isConnected}
            >
              Polygon
            </button>
          </div>
        </div>

        {/* 未连接钱包 */}
        {!isConnected && (
          <div className="space-y-[10px]">
            <p className="text-sm ">กรุณาเลือกกระเป๋าเงินที่ต้องการเชื่อมต่อ:</p>
            {connectors.map((connector) => (
              <button
                key={connector.id}
                onClick={() => handleConnect(connector)}
                className="w-full btn "
              >
                {connector.name}
              </button>
            ))}
          </div>
        )}

        {/* 已连接但链不正确 */}
        {isConnected && !isCorrectChain && (
          <div className="space-y-4">
            <div className="alert alert-warning">
              <span>กรุณาเปลี่ยนเครือข่ายเป็น {CHAIN_CONFIGS[selectedChain].name}</span>
            </div>
            <button onClick={handleSwitchChain} className="w-full btn btn-primary">
              เปลี่ยนเครือข่าย (Switch Network)
            </button>
          </div>
        )}

        {/* 已连接且链正确 */}
        {isConnected && isCorrectChain && (
          <div className="space-y-4">
            <div className="alert alert-success">
              <span>เชื่อมต่อสำเร็จ! ({address?.slice(0, 6)}...{address?.slice(-4)})</span>
            </div>

            <div className="bg-gray-100 p-4 rounded">
              <p className="text-sm text-gray-600 mb-2">รายละเอียดการชำระเงิน:</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>แผน:</span>
                  <span className="font-bold text-black">{plan === 'monthly' ? 'รายเดือน' : 'รายปี'}</span>
                </div>
                <div className="flex justify-between">
                  <span>จำนวนเงิน:</span>
                  <span className="font-bold text-black">{plan === 'monthly' ? '10' : '100'} USDT</span>
                </div>
                <div className="flex justify-between">
                  <span>เครือข่าย:</span>
                  <span className="font-bold text-black">{CHAIN_CONFIGS[selectedChain].name}</span>
                </div>
              </div>
            </div>

            <button className="w-full btn btn-primary">
              ยืนยันการชำระเงิน (Confirm Payment)
            </button>

            <button onClick={() => disconnect()} className="w-full btn btn-outline">
              ตัดการเชื่อมต่อ (Disconnect)
            </button>
          </div>
        )}

        <button onClick={onClose} className="w-full btn btn-ghost mt-4">
          ยกเลิก (Cancel)
        </button>
      </div>
    </div>
  );
}
