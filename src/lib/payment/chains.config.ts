import { ChainConfig, ChainType, SubscriptionPlan, PlanConfig } from './types';

/**
 * 区块链配置
 */
export const CHAIN_CONFIGS: Record<ChainType, ChainConfig> = {
  BSC: {
    chainId: 56,
    name: 'BNB Smart Chain',
    rpcUrl: 'https://bsc-dataseed1.binance.org',
    usdtAddress: '0x55d398326f99059fF775485246999027B3197955', // BSC USDT
    explorerUrl: 'https://bscscan.com',
  },
  Polygon: {
    chainId: 137,
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    usdtAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // Polygon USDT
    explorerUrl: 'https://polygonscan.com',
  },
};

/**
 * 订阅计划配置
 */
export const PLAN_CONFIGS: Record<SubscriptionPlan, PlanConfig> = {
  monthly: {
    name: 'Monthly Plan',
    amountUSD: 10,
    duration: 30,
  },
  yearly: {
    name: 'Yearly Plan',
    amountUSD: 100,
    duration: 365,
  },
};

/**
 * 收款地址配置（从环境变量读取）
 */
export const RECIPIENT_ADDRESSES: Record<ChainType, string> = {
  BSC: process.env.NEXT_PUBLIC_BSC_RECIPIENT_ADDRESS || '0x0ba9bfc024f5e22d7e76240f930f453f33b7aa50',
  Polygon: process.env.NEXT_PUBLIC_POLYGON_RECIPIENT_ADDRESS || '0x0ba9bfc024f5e22d7e76240f930f453f33b7aa50',
};

/**
 * 辅助函数
 */
export function getChainConfig(chain: ChainType): ChainConfig {
  return CHAIN_CONFIGS[chain];
}

export function getPlanConfig(plan: SubscriptionPlan): PlanConfig {
  return PLAN_CONFIGS[plan];
}

export function getRecipientAddress(chain: ChainType): string {
  return RECIPIENT_ADDRESSES[chain];
}

/**
 * 计算USDT数量（考虑不同链的精度）
 */
export function calculateUSDTAmount(amountUSD: number, chain: ChainType): string {
  // USDT在BSC和Polygon都是18位小数
  const decimals = 18;
  const amount = BigInt(amountUSD) * BigInt(10 ** decimals);
  return amount.toString();
}
