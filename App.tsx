import React, { useState, useEffect, useRef } from 'react';
import { GameState, GameEvent, TradeResult, EventType } from './types';
import { SCENARIOS, SOCIAL_SIGNALS } from './constants';
import { calculatePriceAtDistance, getSocialSignal } from './utils/math';
import { Button } from './components/Button';
import { ResultChart } from './components/Chart';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  AlertTriangle, 
  DollarSign, 
  Zap, 
  RefreshCw,
  Clock,
  Target,
  ArrowRight
} from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [balance, setBalance] = useState<number>(1000);
  const [currentScenario, setCurrentScenario] = useState<GameEvent | null>(null);
  
  // Game Loop State
  const [d, setD] = useState<number>(0);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [startPrice, setStartPrice] = useState<number>(0); // Track opening price for multiplier
  const [isHolding, setIsHolding] = useState<boolean>(false);
  const [entryPrice, setEntryPrice] = useState<number>(0);
  const [entryD, setEntryD] = useState<number>(0);
  const [tradeResult, setTradeResult] = useState<TradeResult | null>(null);
  
  const gameLoopRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // --- Game Logic ---

  const startGame = (scenario: GameEvent) => {
    setCurrentScenario(scenario);
    setGameState(GameState.PLAYING);
    setD(0);
    setIsHolding(false);
    setTradeResult(null);
    setEntryPrice(0);
    setEntryD(0);
    
    // Calculate initial prices
    const initialP = calculatePriceAtDistance(0, scenario.params);
    setStartPrice(initialP);
    setCurrentPrice(initialP);
    
    startTimeRef.current = Date.now();

    // Start Loop
    if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    gameLoopRef.current = requestAnimationFrame(loop);
  };

  const loop = () => {
    if (!currentScenario) return;

    const now = Date.now();
    const elapsedSeconds = (now - startTimeRef.current) / 1000;
    
    // Map time to D (Distance). 
    const speed = 8 / currentScenario.maxDuration;
    const newD = elapsedSeconds * speed;

    // Dynamic price calculation
    const price = calculatePriceAtDistance(newD, currentScenario.params);
    
    setD(newD);
    setCurrentPrice(price);

    if (newD > 10) {
      // Force sell or end game if went too long
      handleEndRound(newD, price, true, currentScenario);
      return;
    }

    gameLoopRef.current = requestAnimationFrame(loop);
  };

  const handleBuy = () => {
    setIsHolding(true);
    setEntryPrice(currentPrice);
    setEntryD(d);
  };

  const handleSell = () => {
    if (!currentScenario) return;
    handleEndRound(d, currentPrice, false, currentScenario);
  };

  const handleEndRound = (finalD: number, finalPrice: number, forced: boolean, scenario: GameEvent) => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }

    let exitPrice = finalPrice;
    let exitD = finalD;
    let profitPercent = 0;

    // If player never bought
    if (!isHolding && !forced) {
        // Case: Manual exit without buying (Skip)
    }

    if (isHolding) {
      profitPercent = ((exitPrice - entryPrice) / entryPrice) * 100;
      setBalance(prev => prev + (prev * (profitPercent / 100)));
    } else {
      // If never bought, no PnL change
      exitPrice = 0; // Marker for no trade
      exitD = 0;
    }

    // Calculate Peak for reference
    let peakP = 0;
    let peakDLoc = 0;
    for(let i=0; i<10; i+=0.1) {
        const p = calculatePriceAtDistance(i, scenario.params);
        if (p > peakP) {
            peakP = p;
            peakDLoc = i;
        }
    }

    let reason = "";
    if (!isHolding && forced) reason = "你观望了一整场，错失了所有机会。";
    else if (!isHolding) reason = "你选择了跳过。";
    else if (forced) reason = "流动性枯竭，你也跑不掉了（归零）！";
    else if (profitPercent > 0) reason = `漂亮的止盈！赚了 ${profitPercent.toFixed(0)}%`;
    else reason = "高位接盘，割肉离场。";

    setTradeResult({
      entryD: isHolding ? entryD : 0,
      entryPrice: isHolding ? entryPrice : 0,
      exitD: isHolding ? exitD : null,
      exitPrice: isHolding ? exitPrice : null,
      profitPercent: isHolding ? profitPercent : 0,
      peakD: peakDLoc,
      peakPrice: peakP,
      reason: reason
    });

    setGameState(GameState.RESULT);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, []);


  // --- Render Components ---

  const renderSignal = () => {
    const signal = getSocialSignal(d, SOCIAL_SIGNALS);
    return (
      <div className="flex items-center gap-3 bg-slate-800/80 p-4 rounded-lg border-l-4 border-yellow-400 mb-4 animate-pulse backdrop-blur-sm shadow-lg">
        <div className="text-3xl shrink-0">📢</div>
        <div className="min-w-0">
          <div className="text-xs text-gray-400 uppercase font-bold tracking-wider flex justify-between">
             <span>当前信号</span>
             <span>D ≈ {d.toFixed(1)}</span>
          </div>
          <div className="text-lg font-bold text-white truncate">{signal.text}</div>
          <div className="text-xs text-blue-400">{signal.source}</div>
        </div>
      </div>
    );
  };

  const renderMenu = () => (
    <div className="max-w-md mx-auto p-6 space-y-8 animate-fade-in pt-20">
      <div className="text-center space-y-2">
        <h1 className="text-6xl font-pixel text-yellow-400 drop-shadow-[0_4px_0_rgba(0,0,0,0.5)]">土狗猎人</h1>
        <p className="text-gray-400 tracking-widest text-sm uppercase">传播定价模型模拟器</p>
        <div className="inline-block bg-slate-800 px-6 py-2 rounded-full font-mono text-green-400 border border-slate-700 mt-4 shadow-inner">
          当前资金: <span className="font-bold text-xl">${balance.toFixed(2)}</span>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-gray-300 text-center flex items-center justify-center gap-2">
           <Target size={16} /> 选择一个交易场景:
        </p>
        {SCENARIOS.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => startGame(scenario)}
            className="w-full text-left p-4 bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 hover:border-blue-500 rounded-xl transition-all group relative overflow-hidden shadow-lg active:translate-y-1"
          >
            <div className="flex justify-between items-start mb-1 relative z-10">
              <span className="font-bold text-lg text-gray-100 group-hover:text-blue-400">{scenario.name}</span>
              <span className={`text-xs px-2 py-1 rounded font-bold ${
                scenario.type === EventType.SCAM ? 'bg-red-900 text-red-200' : 'bg-slate-900 text-gray-400'
              }`}>{scenario.type}</span>
            </div>
            <p className="text-xs text-gray-500 relative z-10">{scenario.description}</p>
          </button>
        ))}
      </div>
      
      <div className="bg-slate-900/50 p-4 rounded-lg text-xs text-gray-500 space-y-2 font-mono border border-slate-800">
        <p className="font-bold text-gray-400">高玩指南:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><span className="text-yellow-500">P(d) 模型</span>：价格随传播距离(d)变化。</li>
          <li><span className="text-green-400">早期入场</span>：在 d &lt; 1.5 (内幕/大V阶段) 买入。</li>
          <li><span className="text-red-400">及时止盈</span>：在大众狂热 (d > 3.5) 前跑路。</li>
        </ul>
      </div>
    </div>
  );

  const renderGame = () => (
    <div className="max-w-md mx-auto p-4 h-screen flex flex-col justify-between py-8">
      {/* Top Bar */}
      <div className="flex justify-between items-start bg-slate-900/90 p-4 rounded-xl border border-slate-700 shadow-lg z-10 backdrop-blur-md">
        <div>
          <div className="text-xs text-gray-500 font-bold uppercase tracking-wide">当前价格</div>
          <div className="text-4xl font-pixel text-white tracking-widest">${currentPrice.toFixed(2)}</div>
          <div className={`text-xs font-mono mt-1 ${currentPrice >= startPrice ? 'text-green-500' : 'text-red-500'}`}>
             开盘: x{(currentPrice / startPrice).toFixed(2)}
          </div>
        </div>
        <div className={`text-right ${isHolding ? (currentPrice >= entryPrice ? 'text-green-400' : 'text-red-400') : 'text-gray-600'}`}>
          <div className="text-xs font-bold uppercase">未实现盈亏</div>
          <div className="text-2xl font-bold font-mono">
            {isHolding ? `${((currentPrice - entryPrice) / entryPrice * 100).toFixed(1)}%` : '---'}
          </div>
          {isHolding && (
             <div className="text-xs text-gray-500">
                入场: ${entryPrice.toFixed(2)}
             </div>
          )}
        </div>
      </div>

      {/* Visual Area */}
      <div className="flex-1 flex flex-col justify-center space-y-8 relative">
        {/* Signal */}
        {renderSignal()}

        {/* Progress/Distance Bar */}
        <div className="space-y-2">
           <div className="flex justify-between text-xs text-gray-400 font-mono">
              <span>内幕期 (d=0)</span>
              <span>大众期 (d=5)</span>
              <span>崩盘期 (d=8)</span>
           </div>
           <div className="h-6 bg-slate-800 rounded-full overflow-hidden border border-slate-700 relative shadow-inner">
              {/* Zones */}
              <div className="absolute left-0 w-[20%] h-full bg-green-900/40 flex items-center justify-center text-[10px] text-green-200/50 font-bold">Smart</div>
              <div className="absolute left-[20%] w-[30%] h-full bg-blue-900/40 flex items-center justify-center text-[10px] text-blue-200/50 font-bold">Alpha</div>
              <div className="absolute left-[50%] w-[30%] h-full bg-orange-900/40 flex items-center justify-center text-[10px] text-orange-200/50 font-bold">FOMO</div>
              <div className="absolute left-[80%] w-[20%] h-full bg-red-900/40 flex items-center justify-center text-[10px] text-red-200/50 font-bold">Rekt</div>
              
              {/* Indicator */}
              <div 
                className="h-full w-1 bg-yellow-400 absolute top-0 bottom-0 z-10 transition-all duration-100 ease-linear shadow-[0_0_15px_rgba(250,204,21,1)]"
                style={{ left: `${Math.min(100, (d / 8) * 100)}%` }}
              ></div>
           </div>
           <div className="text-center text-xs text-gray-500 font-mono">
             传播深度: {d.toFixed(2)} 层
           </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Button 
          variant="success" 
          size="lg" 
          onClick={handleBuy}
          disabled={isHolding}
          className="w-full h-20 text-2xl shadow-[0_4px_0_rgb(21,128,61)] active:shadow-none active:translate-y-1 transition-all"
        >
          <DollarSign className="w-6 h-6" /> 买入
        </Button>
        <Button 
          variant="danger" 
          size="lg" 
          onClick={handleSell}
          disabled={!isHolding}
          className="w-full h-20 text-2xl shadow-[0_4px_0_rgb(185,28,28)] active:shadow-none active:translate-y-1 transition-all"
        >
          <TrendingUp className="w-6 h-6" /> 卖出
        </Button>
      </div>
    </div>
  );

  const renderResult = () => {
    if (!tradeResult || !currentScenario) return null;
    const isWin = tradeResult.profitPercent > 0;

    return (
      <div className="max-w-md mx-auto p-6 pt-12 animate-fade-in space-y-6 pb-20">
        <div className="text-center space-y-2">
            <h2 className="text-4xl font-pixel text-white mb-4">交易总结</h2>
            <div className={`text-6xl font-bold ${isWin ? 'text-green-400' : 'text-red-500'}`}>
                {tradeResult.profitPercent > 0 ? '+' : ''}{tradeResult.profitPercent.toFixed(1)}%
            </div>
            <p className="text-gray-400 italic">"{tradeResult.reason}"</p>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-xl">
            <ResultChart 
                params={currentScenario.params} 
                entryD={tradeResult.entryD}
                exitD={tradeResult.exitD}
            />
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm font-mono">
                <div>
                    <div className="text-gray-500">你的买入点</div>
                    <div className="text-white">d = {tradeResult.entryD.toFixed(2)} (${tradeResult.entryPrice.toFixed(2)})</div>
                </div>
                <div>
                    <div className="text-gray-500">理论最高点</div>
                    <div className="text-yellow-400">d ≈ {tradeResult.peakD.toFixed(1)} (${tradeResult.peakPrice.toFixed(2)})</div>
                </div>
            </div>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-lg text-sm space-y-2 border-l-4 border-blue-500">
            <h3 className="font-bold text-blue-400 flex items-center gap-2"><Zap size={16}/> 复盘分析</h3>
            <p className="text-gray-300">
                {tradeResult.entryD < 1.5 
                    ? "你在极早期(内幕/大V)阶段入场，不仅成本低，而且享受了完整的传播红利。"
                    : tradeResult.entryD < currentScenario.params.d_peak_est 
                        ? "你在趋势中期追涨，虽然有利润，但风险回报比(R/R)已经开始下降。"
                        : "你在大众狂热期接盘，典型的FOMO行为，成为了别人的退出流动性。"
                }
            </p>
        </div>

        <div className="flex gap-4 pt-4">
            <Button variant="neutral" className="flex-1" onClick={() => setGameState(GameState.MENU)}>
                <RefreshCw size={20} /> 返回菜单
            </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans relative overflow-hidden selection:bg-green-500 selection:text-black">
      {/* CRT Scanline Overlay - pointer-events-none IS CRITICAL HERE */}
      <div className="fixed inset-0 z-50 pointer-events-none scan-line opacity-30 mix-blend-overlay"></div>
      
      {/* Background Glow */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950/50 to-slate-950 z-0 pointer-events-none"></div>

      {/* Main Content Container */}
      <div className="relative z-10 h-full overflow-y-auto min-h-screen">
        {gameState === GameState.MENU && renderMenu()}
        {gameState === GameState.PLAYING && renderGame()}
        {gameState === GameState.RESULT && renderResult()}
      </div>
    </div>
  );
};

export default App;