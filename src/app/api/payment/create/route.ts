import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import {
  CreatePaymentRequest,
  PaymentError,
  PaymentErrorCode,
  PaymentOrderResponse,
  ChainType,
  SubscriptionPlan,
} from '@/lib/payment/types';
import {
  getChainConfig,
  getPlanConfig,
  getRecipientAddress,
  calculateUSDTAmount,
} from '@/lib/payment/chains.config';

/**
 * 生成订单号
 */
function generateOrderNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD${timestamp}${random}`;
}

/**
 * POST /api/payment/create
 * 创建支付订单
 */
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body: CreatePaymentRequest = await request.json();
    const { plan, chain, paymentMethod } = body;

    // 验证参数
    if (!plan || !chain || !paymentMethod) {
      throw new PaymentError(
        PaymentErrorCode.VALIDATION_ERROR,
        'Missing required fields: plan, chain, paymentMethod'
      );
    }

    // 验证用户登录
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new PaymentError(
        PaymentErrorCode.UNAUTHORIZED,
        'User not authenticated'
      );
    }

    // 获取配置
    const chainConfig = getChainConfig(chain);
    const planConfig = getPlanConfig(plan);
    const recipientAddress = getRecipientAddress(chain);

    // 计算USDT数量（显示用，不是链上的wei值）
    const amountUSDT = planConfig.amountUSD.toString();

    // 生成订单号
    const orderNumber = generateOrderNumber();

    // 订单过期时间（30分钟）
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    // TODO: 将订单信息保存到数据库
    // await supabase.from('payment_orders').insert({
    //   order_number: orderNumber,
    //   user_id: user.id,
    //   plan,
    //   chain,
    //   amount_usd: planConfig.amountUSD,
    //   recipient_address: recipientAddress,
    //   payment_method: paymentMethod,
    //   status: 'pending',
    //   expires_at: expiresAt,
    // });

    // 构建响应
    const response: PaymentOrderResponse = {
      orderNumber,
      recipientAddress,
      amount: amountUSDT,
      usdtAddress: chainConfig.usdtAddress,
      chainId: chainConfig.chainId,
      chainName: chainConfig.name,
      explorerUrl: chainConfig.explorerUrl,
      expiresAt,
    };

    return NextResponse.json({
      success: true,
      data: response,
    });

  } catch (error: any) {
    console.error('Payment creation error:', error);

    if (error instanceof PaymentError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: error.code === PaymentErrorCode.UNAUTHORIZED ? 401 : 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: PaymentErrorCode.INTERNAL_ERROR,
          message: 'Internal server error',
        },
      },
      { status: 500 }
    );
  }
}
