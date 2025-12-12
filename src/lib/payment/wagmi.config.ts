/**
 * Wagmi 配置
 * 用于钱包直连支付
 */

import { http, createConfig, injected } from 'wagmi';
import { bsc, polygon } from 'wagmi/chains';

/**
 * Wagmi 配置
 */
export const wagmiConfig = createConfig({
  chains: [bsc, polygon],
  connectors: [
    // MetaMask, Trust Wallet, OKX Wallet 等浏览器钱包
    injected(),
  ],
  transports: {
    [bsc.id]: http('https://bsc-dataseed1.binance.org'),
    [polygon.id]: http('https://polygon-rpc.com'),
  },
});
