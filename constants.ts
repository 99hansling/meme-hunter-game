import { EventType, GameEvent } from './types';

// Pre-defined scenarios mimicking the math model
export const SCENARIOS: GameEvent[] = [
  {
    id: '1',
    name: '马斯克发了一只仓鼠',
    type: EventType.GLOBAL,
    description: '全球级事件。受众极广，能涨很久。',
    maxDuration: 25, 
    params: {
      P0: 2000, // High potential
      beta: 0.1, // Very low trust decay (It's Elon)
      gamma: 1.0,
      R: 0.1,    // Hard to replicate
      lambda: 0.05, // Very wide audience curve (Global)
      delta: 0.5, // Gentle wealth decay
      d_peak_est: 5.5 // Peaks late
    }
  },
  {
    id: '2',
    name: 'V神穿了恐龙装',
    type: EventType.CRYPTO,
    description: '币圈推特疯传。标准的金狗曲线。',
    maxDuration: 18,
    params: {
      P0: 500,
      beta: 0.2,
      gamma: 1.0,
      R: 0.2,
      lambda: 0.15, // Medium circle
      delta: 0.8,
      d_peak_est: 3.5 // Peaks in the middle
    }
  },
  {
    id: '3',
    name: '随机青蛙币 #882',
    type: EventType.MEME,
    description: '普通土狗。快进快出，手慢无。',
    maxDuration: 12,
    params: {
      P0: 100,
      beta: 0.5, // Trust drops fast
      gamma: 1.0,
      R: 0.6, // Easy to copy
      lambda: 0.4, // Sharp, narrow peak
      delta: 1.2, // Wealth drops fast
      d_peak_est: 2.0 // Peaks early
    }
  },
  {
    id: '4',
    name: '超级安全月亮 (Trust Me)',
    type: EventType.SCAM,
    description: '看起来在涨，但崩盘就在一瞬间。',
    maxDuration: 10,
    params: {
      P0: 50,
      beta: 0.1, // Initial trust seems ok...
      gamma: 0.5,
      R: 0.1,
      lambda: 0.8, // Very narrow
      delta: 0.2, // "Wealth" seems stable (artificial)
      d_peak_est: 1.2 // Peaks very early then dies
    }
  }
];

export const SOCIAL_SIGNALS = [
  { d: 0.2, text: "🕵️ Dev正在部署合约...", source: "Etherscan" },
  { d: 0.5, text: "🤫 'Alpha God' 私密群提到了", source: "Telegram" },
  { d: 1.2, text: "🗣️ 大V 'CryptoChad' 发推喊单", source: "Twitter/X" },
  { d: 2.0, text: "🚀 DexScreener 热门榜 #5", source: "DexScreener" },
  { d: 3.5, text: "📰 Coindesk 发文报道", source: "News" },
  { d: 4.5, text: "🕺 抖音小孩开始模仿", source: "TikTok" },
  { d: 6.0, text: "👵 你大姨问你怎么买", source: "WhatsApp/WeChat" },
  { d: 8.0, text: "💀 社区接管 (Dev已跑路)", source: "Bagholders" },
];