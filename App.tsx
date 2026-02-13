
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import PlinkoGame from './components/PlinkoGame';
import MinesGame from './components/MinesGame';
import Auth from './components/Auth';
import Leaderboard from './components/Leaderboard';
import { GameMode, Difficulty, User, LeaderboardEntry } from './types';
import { getGameCommentary } from './services/geminiService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.FREE);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [activeTab, setActiveTab] = useState<'plinko' | 'mines'>('plinko');
  const [dealerMessage, setDealerMessage] = useState<string>("Welcome to Zenith Casino. Sign in to place your bets.");
  const [isTyping, setIsTyping] = useState(false);
  const [leaderboards, setLeaderboards] = useState<{ [key: string]: any }>({
    'plinko_FREE': [],
    'plinko_CHALLENGE': [],
    'mines_FREE': [],
    'mines_CHALLENGE': [],
    'lastResetDate': ''
  });

  const getPacificDateString = () => {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Los_Angeles',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());
  };

  // Load state and leaderboards on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('zenith_current_user');
    if (savedUser) setUser(JSON.parse(savedUser));

    const savedLB = localStorage.getItem('zenith_leaderboards');
    const currentPacificDate = getPacificDateString();

    if (savedLB) {
      const parsedLB = JSON.parse(savedLB);
      // Check if the leaderboard needs a daily reset (Pacific Time 12:00 AM)
      if (parsedLB.lastResetDate !== currentPacificDate) {
        const resetLB = {
          'plinko_FREE': [],
          'plinko_CHALLENGE': [],
          'mines_FREE': [],
          'mines_CHALLENGE': [],
          'lastResetDate': currentPacificDate
        };
        setLeaderboards(resetLB);
        localStorage.setItem('zenith_leaderboards', JSON.stringify(resetLB));
      } else {
        setLeaderboards(parsedLB);
      }
    } else {
      // Initialize if never existed
      const initialLB = {
        'plinko_FREE': [],
        'plinko_CHALLENGE': [],
        'mines_FREE': [],
        'mines_CHALLENGE': [],
        'lastResetDate': currentPacificDate
      };
      setLeaderboards(initialLB);
      localStorage.setItem('zenith_leaderboards', JSON.stringify(initialLB));
    }
  }, []);

  // Persist user and update leaderboards
  const updateUserState = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('zenith_current_user', JSON.stringify(updatedUser));

    // Update global users list
    const allUsers = JSON.parse(localStorage.getItem('zenith_users') || '[]');
    const idx = allUsers.findIndex((u: any) => u.email === updatedUser.email);
    if (idx !== -1) {
      allUsers[idx] = updatedUser;
      localStorage.setItem('zenith_users', JSON.stringify(allUsers));
    }
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('zenith_current_user', JSON.stringify(newUser));
    setDealerMessage(`Welcome back, ${newUser.email.split('@')[0]}. Feeling lucky?`);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('zenith_current_user');
  };

  const handleRefill = () => {
    if (user && gameMode === GameMode.FREE) {
      const updated = { ...user, balances: { ...user.balances, [GameMode.FREE]: user.balances[GameMode.FREE] + 5000 } };
      updateUserState(updated);
      setDealerMessage("Refilled! Use them wisely, or don't. I'm just the dealer.");
    }
  };

  const handleBet = useCallback((amount: number) => {
    if (user && user.balances[gameMode] >= amount) {
      const updated = { ...user, balances: { ...user.balances, [gameMode]: user.balances[gameMode] - amount } };
      updateUserState(updated);
      return true;
    }
    return false;
  }, [user, gameMode, updateUserState]);

  const handleWin = useCallback(async (amount: number) => {
    if (!user) return;

    const newBalance = user.balances[gameMode] + amount;
    const isHighPayout = amount > user.highestPayouts[activeTab];

    const updatedUser = {
      ...user,
      balances: { ...user.balances, [gameMode]: newBalance },
      highestPayouts: {
        ...user.highestPayouts,
        [activeTab]: isHighPayout ? amount : user.highestPayouts[activeTab]
      }
    };
    updateUserState(updatedUser);

    // Update Leaderboard
    const lbKey = `${activeTab}_${gameMode}`;
    const currentPacificDate = getPacificDateString();
    
    setLeaderboards(prev => {
      let updatedLB = { ...prev };
      
      // Secondary check for mid-session date change
      if (updatedLB.lastResetDate !== currentPacificDate) {
        updatedLB = {
          'plinko_FREE': [],
          'plinko_CHALLENGE': [],
          'mines_FREE': [],
          'mines_CHALLENGE': [],
          'lastResetDate': currentPacificDate
        };
      }

      const existingEntry = updatedLB[lbKey].find((e: LeaderboardEntry) => e.email === user.email);
      if (existingEntry) {
        if (amount > existingEntry.score) existingEntry.score = amount;
      } else {
        updatedLB[lbKey].push({ email: user.email, score: amount });
      }

      updatedLB[lbKey].sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.score - a.score);
      localStorage.setItem('zenith_leaderboards', JSON.stringify(updatedLB));
      return updatedLB;
    });

    // AI Commentary
    setIsTyping(true);
    const msg = await getGameCommentary(activeTab, amount > 0 ? 'win' : 'loss', amount, newBalance);
    setDealerMessage(msg);
    setIsTyping(false);
  }, [user, gameMode, activeTab, updateUserState]);

  if (!user) return <Auth onLogin={handleLogin} />;

  return (
    <Layout
      balance={user.balances[gameMode]}
      gameMode={gameMode}
      setGameMode={setGameMode}
      onRefill={handleRefill}
    >
      <div className="lg:col-span-12 mb-4 flex flex-col md:flex-row gap-4">
        <div className="glass-panel flex-1 p-4 rounded-2xl flex items-center justify-between gap-4 border border-zinc-800/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
              <i className="fa-solid fa-user-secret text-zinc-400 text-xl"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Dealer Pro</p>
                <span className="text-[10px] text-zinc-600 font-bold">•</span>
                <button onClick={handleLogout} className="text-[10px] text-zinc-500 hover:text-red-400 font-bold uppercase transition-colors">Sign Out</button>
              </div>
              <p className={`text-sm font-medium text-zinc-200 italic leading-tight ${isTyping ? 'animate-pulse' : ''}`}>
                "{dealerMessage}"
              </p>
            </div>
          </div>

          <nav className="flex bg-zinc-900/50 p-1.5 rounded-xl border border-zinc-800">
            <button
              onClick={() => setActiveTab('plinko')}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-extrabold transition-all ${activeTab === 'plinko' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
            >
              <i className="fa-solid fa-circle-nodes"></i>
              PLINKO
            </button>
            <button
              onClick={() => setActiveTab('mines')}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-extrabold transition-all ${activeTab === 'mines' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
            >
              <i className="fa-solid fa-bomb"></i>
              MINES
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'plinko' ? (
        <PlinkoGame
          balance={user.balances[gameMode]}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          onWin={handleWin}
          onBet={handleBet}
        />
      ) : (
        <MinesGame
          balance={user.balances[gameMode]}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          onWin={handleWin}
          onBet={handleBet}
        />
      )}

      {/* Side Panel for Leaderboards */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <Leaderboard
          game={activeTab}
          mode={gameMode}
          entries={leaderboards[`${activeTab}_${gameMode}`] || []}
        />

        <div className="glass-panel p-6 rounded-2xl border border-zinc-800/50">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xs font-extrabold text-zinc-500 uppercase tracking-wider">Your Session Stats</h4>
            <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 font-bold bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
              <i className="fa-solid fa-clock"></i>
              RESETS DAILY (PT)
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-400">Best Payout ({activeTab})</span>
              <span className="text-xs font-bold text-white tabular-nums">{Math.floor(user.highestPayouts[activeTab]).toLocaleString()} <i className="fa-solid fa-coins text-yellow-500 ml-1"></i></span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-400">Current Mode</span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${gameMode === GameMode.CHALLENGE ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                {gameMode}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default App;
