
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Difficulty } from '../types';

interface PlinkoProps {
  balance: number;
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  onWin: (amount: number) => void;
  onBet: (amount: number) => boolean;
}

const PlinkoGame: React.FC<PlinkoProps> = ({ balance, difficulty, setDifficulty, onWin, onBet }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bet, setBet] = useState(10);
  const [activeBalls, setActiveBalls] = useState<number>(0);
  const ballsRef = useRef<any[]>([]);

  const getRows = () => {
    switch (difficulty) {
      case Difficulty.EASY: return 8;
      case Difficulty.MEDIUM: return 12;
      case Difficulty.HARD: return 16;
    }
  };

  const getMultipliers = () => {
    const rows = getRows();
    // Simplified multipliers based on binomial distribution
    // Center is low, edges are high
    if (difficulty === Difficulty.EASY) {
      return [5, 2, 1.2, 0.5, 0.2, 0.5, 1.2, 2, 5];
    } else if (difficulty === Difficulty.MEDIUM) {
      return [18, 10, 5, 2, 0.5, 0.2, 0.2, 0.5, 2, 5, 10, 18, 50].slice(0, rows + 1);
    } else {
      return [100, 50, 25, 10, 5, 2, 0.5, 0.2, 0.2, 0.2, 0.2, 0.5, 2, 5, 10, 25, 50, 100].slice(0, rows + 1);
    }
  };

  const dropBall = () => {
    if (onBet(bet)) {
      const rows = getRows();
      const newBall = {
        x: 400, // Center of 800px canvas
        y: 20,
        vx: 0,
        vy: 0,
        row: 0,
        bet: bet,
        targetRow: rows,
        path: [] as number[],
      };
      
      // Pre-calculate path for smooth deterministic visuals
      let currentXIndex = 0; // Relative to center
      for (let i = 0; i < rows; i++) {
        const move = Math.random() > 0.5 ? 1 : -1;
        currentXIndex += move;
        newBall.path.push(move);
      }
      
      ballsRef.current.push(newBall);
      setActiveBalls(prev => prev + 1);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const rows = getRows();
    const multipliers = getMultipliers();
    const pegRadius = 4;
    const ballRadius = 6;
    const spacingX = 40;
    const spacingY = 35;
    const startY = 60;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Multipliers
      const multiWidth = 36;
      const totalWidth = multipliers.length * multiWidth;
      const startXMulti = (canvas.width - totalWidth) / 2;
      
      multipliers.forEach((m, i) => {
        const color = m >= 1 ? (m >= 10 ? '#ef4444' : '#f59e0b') : '#3f3f46';
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(startXMulti + i * multiWidth + 2, canvas.height - 40, multiWidth - 4, 30, 4);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(`${m}x`, startXMulti + i * multiWidth + multiWidth / 2, canvas.height - 20);
      });

      // Draw Pegs
      ctx.fillStyle = '#71717a';
      for (let r = 0; r < rows; r++) {
        const pegsInRow = r + 3;
        const rowWidth = (pegsInRow - 1) * spacingX;
        const startX = (canvas.width - rowWidth) / 2;
        for (let p = 0; p < pegsInRow; p++) {
          ctx.beginPath();
          ctx.arc(startX + p * spacingX, startY + r * spacingY, pegRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Update and Draw Balls
      ballsRef.current.forEach((ball, index) => {
        const currentTargetRow = Math.floor((ball.y - startY) / spacingY) + 1;
        
        if (currentTargetRow > ball.row && ball.row < rows) {
          const move = ball.path[ball.row];
          ball.vx = move * 1.5;
          ball.row = currentTargetRow;
        }

        ball.vy = 2.5;
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.vx *= 0.95; // Friction

        // Draw ball
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.Radius || ballRadius, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, ballRadius);
        gradient.addColorStop(0, '#a78bfa');
        gradient.addColorStop(1, '#7c3aed');
        ctx.fillStyle = gradient;
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(124, 58, 237, 0.5)';
        ctx.fill();
        ctx.shadowBlur = 0;

        // Cleanup ball
        if (ball.y > canvas.height - 50) {
          // Find which multiplier it hit
          const finalX = ball.x;
          const multiIndex = Math.floor((finalX - startXMulti) / multiWidth);
          const safeIndex = Math.max(0, Math.min(multipliers.length - 1, multiIndex));
          const multi = multipliers[safeIndex];
          onWin(ball.bet * multi);
          ballsRef.current.splice(index, 1);
          setActiveBalls(prev => prev - 1);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [difficulty]);

  return (
    <div className="lg:col-span-8 flex flex-col gap-6">
      <div className="glass-panel p-4 rounded-2xl flex flex-col items-center">
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={600} 
          className="w-full h-auto rounded-xl bg-zinc-900/50"
        />
      </div>

      <div className="glass-panel p-6 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-zinc-500 uppercase">Difficulty</label>
          <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            {(Object.keys(Difficulty) as Array<keyof typeof Difficulty>).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(Difficulty[d])}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${difficulty === Difficulty[d] ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-zinc-500 uppercase">Bet Amount</label>
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2">
            <i className="fa-solid fa-coins text-yellow-500 text-sm"></i>
            <input 
              type="number" 
              value={bet} 
              onChange={(e) => setBet(Math.max(1, Math.min(balance, Number(e.target.value))))}
              className="bg-transparent border-none text-white font-bold w-full focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-end">
          <button 
            onClick={dropBall}
            disabled={balance < bet}
            className={`w-full py-3 rounded-xl font-bold uppercase tracking-widest transition-all ${balance < bet ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:scale-[1.02] active:scale-95 text-white shadow-lg shadow-violet-500/20'}`}
          >
            Drop Ball
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlinkoGame;
