
import React from 'react';
import { GameMode } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  balance: number;
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  onRefill?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, balance, gameMode, setGameMode, onRefill }) => {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center p-4 md:p-8">
      <header className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-between mb-8 gap-4 glass-panel p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
            <i className="fa-solid fa-diamond text-2xl text-white"></i>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white uppercase">Zenith <span className="text-violet-400">Casino</span></h1>
            <p className="text-xs text-zinc-500 font-medium">PREMIUM SOCIAL GAMBLING</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button 
              onClick={() => setGameMode(GameMode.FREE)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${gameMode === GameMode.FREE ? 'bg-violet-600 text-white shadow-md' : 'text-zinc-500 hover:text-white'}`}
            >
              FREE
            </button>
            <button 
              onClick={() => setGameMode(GameMode.CHALLENGE)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${gameMode === GameMode.CHALLENGE ? 'bg-violet-600 text-white shadow-md' : 'text-zinc-500 hover:text-white'}`}
            >
              CHALLENGE
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl">
              <i className="fa-solid fa-coins text-yellow-500"></i>
              <span className="text-lg font-bold tabular-nums text-zinc-100">{Math.floor(balance).toLocaleString()}</span>
            </div>
            {gameMode === GameMode.FREE && (
              <button 
                onClick={onRefill}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 p-2 rounded-xl transition-colors border border-zinc-700"
                title="Add 1000 Coins"
              >
                <i className="fa-solid fa-plus"></i>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        {children}
      </main>

      <footer className="mt-auto py-8 text-zinc-600 text-sm">
        &copy; 2024 Zenith Social Casino. For entertainment purposes only. No real money gambling.
      </footer>
    </div>
  );
};

export default Layout;
