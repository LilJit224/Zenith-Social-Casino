
import React, { useState, useEffect } from 'react';
import { Difficulty } from '../types';

interface MinesProps {
  balance: number;
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  onWin: (amount: number) => void;
  onBet: (amount: number) => boolean;
}

const MinesGame: React.FC<MinesProps> = ({ balance, difficulty, setDifficulty, onWin, onBet }) => {
  const [gridSize, setGridSize] = useState(3);
  const [mineCount, setMineCount] = useState(2);
  const [bet, setBet] = useState(10);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'GAMEOVER'>('IDLE');
  const [grid, setGrid] = useState<{isMine: boolean, revealed: boolean}[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [lastWin, setLastWin] = useState(0);

  useEffect(() => {
    switch(difficulty) {
      case Difficulty.EASY: setGridSize(3); setMineCount(2); break;
      case Difficulty.MEDIUM: setGridSize(5); setMineCount(5); break;
      case Difficulty.HARD: setGridSize(8); setMineCount(15); break;
    }
  }, [difficulty]);

  const startGame = () => {
    if (onBet(bet)) {
      const size = gridSize * gridSize;
      const newGrid = Array(size).fill(null).map(() => ({ isMine: false, revealed: false }));
      let placed = 0;
      while (placed < mineCount) {
        const idx = Math.floor(Math.random() * size);
        if (!newGrid[idx].isMine) {
          newGrid[idx].isMine = true;
          placed++;
        }
      }
      setGrid(newGrid);
      setGameState('PLAYING');
      setRevealedCount(0);
      setLastWin(0);
    }
  };

  const calculateMultiplier = (reveals: number) => {
    const total = gridSize * gridSize;
    const safeTotal = total - mineCount;
    if (reveals === 0) return 1;
    let multiplier = 1;
    for(let i=0; i < reveals; i++) {
        multiplier *= (total - i) / (safeTotal - i);
    }
    return Math.max(1, multiplier * 0.98);
  };

  const currentMultiplier = calculateMultiplier(revealedCount);
  const potentialWin = bet * currentMultiplier;

  const revealCell = (index: number) => {
    if (gameState !== 'PLAYING' || grid[index].revealed) return;
    const newGrid = [...grid];
    newGrid[index].revealed = true;
    if (newGrid[index].isMine) {
      setGameState('GAMEOVER');
      setGrid(newGrid.map(c => ({...c, revealed: true})));
      setLastWin(0);
    } else {
      setGrid(newGrid);
      const newCount = revealedCount + 1;
      setRevealedCount(newCount);
      if (newCount === (gridSize * gridSize - mineCount)) {
        cashOut(newCount);
      }
    }
  };

  const cashOut = (countOverride?: number) => {
    const count = countOverride !== undefined ? countOverride : revealedCount;
    if (count === 0) return;
    const win = bet * calculateMultiplier(count);
    onWin(win);
    setGameState('IDLE');
    setGrid(grid.map(c => ({...c, revealed: true})));
    setLastWin(win);
  };

  return (
    <div className="lg:col-span-8 flex flex-col gap-6">
      <div className="glass-panel p-8 rounded-3xl flex flex-col items-center justify-center min-h-[500px] border border-zinc-800/50">
        <div className="mb-6 flex items-center gap-4 bg-zinc-900/50 px-4 py-2 rounded-xl border border-zinc-800">
           <div className="flex flex-col items-center">
             <span className="text-[10px] text-zinc-500 font-bold uppercase">Mines</span>
             <span className="text-sm font-bold text-red-500">{mineCount}</span>
           </div>
           <div className="w-px h-6 bg-zinc-800"></div>
           <div className="flex flex-col items-center">
             <span className="text-[10px] text-zinc-500 font-bold uppercase">Grid</span>
             <span className="text-sm font-bold text-zinc-300">{gridSize}x{gridSize}</span>
           </div>
        </div>

        <div 
          className="grid gap-2 md:gap-3" 
          style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
        >
          {grid.length > 0 ? grid.map((cell, i) => (
            <button
              key={i}
              disabled={gameState !== 'PLAYING' || cell.revealed}
              onClick={() => revealCell(i)}
              className={`w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl transition-all flex items-center justify-center text-lg md:text-xl shadow-lg border-b-4 active:border-b-0 active:translate-y-1
                ${!cell.revealed ? 'bg-zinc-800 hover:bg-zinc-700 border-zinc-900' : 
                  cell.isMine ? 'bg-red-500 text-white border-red-700' : 'bg-green-500/20 border-green-500/40 text-green-400'}
              `}
            >
              {cell.revealed && (cell.isMine ? <i className="fa-solid fa-bomb animate-bounce"></i> : <i className="fa-solid fa-gem scale-110"></i>)}
            </button>
          )) : (
            <div className="flex flex-col items-center py-20 text-zinc-600">
               <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mb-4 border border-zinc-800">
                 <i className="fa-solid fa-bomb text-4xl opacity-20"></i>
               </div>
               <p className="text-sm font-bold uppercase tracking-wider">Deploy Mines to Start</p>
            </div>
          )}
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6 border border-zinc-800/50">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Select Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(Difficulty) as Array<keyof typeof Difficulty>).map((d) => (
                <button
                  key={d}
                  disabled={gameState === 'PLAYING'}
                  onClick={() => setDifficulty(Difficulty[d])}
                  className={`py-3 rounded-xl text-xs font-extrabold transition-all border ${difficulty === Difficulty[d] ? 'bg-violet-600 border-violet-500 text-white shadow-lg' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white'}`}
                >
                  {d}
                  <div className="text-[8px] opacity-60 font-normal mt-1">
                    {d === 'EASY' ? '3x3' : d === 'MEDIUM' ? '5x5' : '8x8'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Wager</label>
            <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
              <i className="fa-solid fa-coins text-yellow-500"></i>
              <input 
                type="number" 
                value={bet} 
                disabled={gameState === 'PLAYING'}
                onChange={(e) => setBet(Math.max(1, Math.min(balance, Number(e.target.value))))}
                className="bg-transparent border-none text-white font-bold w-full focus:outline-none"
              />
            </div>
          </div>

          {gameState === 'PLAYING' ? (
            <button 
              onClick={() => cashOut()}
              className="w-full py-4 rounded-xl font-bold uppercase tracking-widest bg-green-600 hover:bg-green-500 text-white shadow-xl shadow-green-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              CASH OUT <span className="px-2 py-0.5 bg-white/20 rounded text-xs">{Math.floor(potentialWin)}</span>
            </button>
          ) : (
            <button 
              onClick={startGame}
              disabled={balance < bet}
              className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all ${balance < bet ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:scale-[1.01] active:scale-95 text-white shadow-xl shadow-violet-500/20'}`}
            >
              Start Game
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MinesGame;
