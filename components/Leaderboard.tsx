
import React from 'react';
import { GameMode, LeaderboardEntry } from '../types';

interface LeaderboardProps {
  game: 'plinko' | 'mines';
  mode: GameMode;
  entries: LeaderboardEntry[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ game, mode, entries }) => {
  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-zinc-800/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-yellow-500/10 rounded-lg">
          <i className="fa-solid fa-trophy text-yellow-500"></i>
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">{game} Rankings</h3>
          <p className="text-[10px] text-zinc-500 font-bold uppercase">{mode} MODE</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 overflow-y-auto max-h-[400px] pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
        {entries.length > 0 ? entries.sort((a,b) => b.score - a.score).slice(0, 10).map((entry, idx) => (
          <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border ${idx === 0 ? 'bg-yellow-500/5 border-yellow-500/30' : 'bg-zinc-900/50 border-zinc-800'}`}>
            <div className="flex items-center gap-3 overflow-hidden">
              <span className={`text-xs font-bold w-5 ${idx < 3 ? 'text-yellow-500' : 'text-zinc-600'}`}>#{idx + 1}</span>
              <span className="text-xs text-zinc-300 font-medium truncate max-w-[120px]">{entry.email.split('@')[0]}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-white tabular-nums">{Math.floor(entry.score).toLocaleString()}</span>
              <i className="fa-solid fa-coins text-[10px] text-yellow-500"></i>
            </div>
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-600">
            <i className="fa-solid fa-ghost text-3xl mb-2 opacity-20"></i>
            <p className="text-xs">No records yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
