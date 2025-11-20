export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  RESULT = 'RESULT',
  GAME_OVER = 'GAME_OVER'
}

export enum EventType {
  GLOBAL = '全球级 (Trump/Musk)',
  CRYPTO = '币圈级 (Vitalik/Hacks)',
  MEME = '纯Meme (Cats/Dogs)',
  SCAM = '杀猪盘 (Rug Pull)'
}

// The core math parameters from the user's prompt
export interface PropagationParams {
  P0: number;          // Initial theoretical max price
  beta: number;        // Trust decay
  gamma: number;       // Scarcity sensitivity
  R: number;           // Scarcity decay
  lambda: number;      // Audience decay (circle size)
  delta: number;       // Wealth decay
  d_peak_est: number;  // Estimated peak d position
}

export interface GameEvent {
  id: string;
  name: string;
  type: EventType;
  description: string;
  params: PropagationParams;
  maxDuration: number; // In seconds
}

export interface TradeResult {
  entryD: number;
  entryPrice: number;
  exitD: number | null;
  exitPrice: number | null;
  profitPercent: number;
  peakD: number;
  peakPrice: number;
  reason: string;
}