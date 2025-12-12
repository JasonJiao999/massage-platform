/**
 * 支付相关类型定义
 */

// 支持的区块链
export type ChainType = 'BSC' | 'Polygon';

// 支付方式
export type PaymentMethod = 'scan' | 'wallet';

// 订阅计划
export type SubscriptionPlan = 'monthly' | 'yearly';

// 支付计划配置
export interface PlanConfig {
  name: string;
  amountUSD: number;
  duration: number; // 天数
}

// 链配置
export interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  usdtAddress: string;
  explorerUrl: string;
}

// 创建支付请求
export interface CreatePaymentRequest {
  plan: SubscriptionPlan;
  chain: ChainType;
  paymentMethod: PaymentMethod;
}

// 支付订单响应
export interface PaymentOrderResponse {
  orderNumber: string;
  recipientAddress: string;
  amount: string;
  usdtAddress: string;
  chainId: number;
  chainName: string;
  explorerUrl: string;
  expiresAt: string;
}

// 支付错误
export enum PaymentErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  UNSUPPORTED_CHAIN = 'UNSUPPORTED_CHAIN',
  UNSUPPORTED_PLAN = 'UNSUPPORTED_PLAN',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export class PaymentError extends Error {
  constructor(
    public code: PaymentErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}
