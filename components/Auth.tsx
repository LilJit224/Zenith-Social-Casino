
import React, { useState } from 'react';
import { User, GameMode } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [view, setView] = useState<'LOGIN' | 'SIGNUP' | 'RECOVERY'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('zenith_users') || '[]');
    
    if (view === 'SIGNUP') {
      if (users.find((u: any) => u.email === email)) {
        setMessage("User already exists.");
        return;
      }
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        password,
        balances: { [GameMode.FREE]: 5000, [GameMode.CHALLENGE]: 1000 },
        highestPayouts: { plinko: 0, mines: 0 }
      };
      users.push(newUser);
      localStorage.setItem('zenith_users', JSON.stringify(users));
      onLogin(newUser);
    } else if (view === 'LOGIN') {
      const user = users.find((u: any) => u.email === email && u.password === password);
      if (user) {
        onLogin(user);
      } else {
        setMessage("Invalid credentials.");
      }
    } else if (view === 'RECOVERY') {
      setMessage("A recovery link has been sent to " + email + " (Simulation)");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="glass-panel w-full max-w-md p-8 rounded-3xl shadow-2xl border border-zinc-700/50">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/20 mb-4">
            <i className="fa-solid fa-diamond text-3xl text-white"></i>
          </div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">
            {view === 'LOGIN' ? 'Welcome Back' : view === 'SIGNUP' ? 'Join Zenith' : 'Reset Password'}
          </h2>
          <p className="text-zinc-500 text-sm">Experience the premium social casino</p>
        </div>

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Email Address</label>
            <div className="relative">
              <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"></i>
              <input 
                type="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-12 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="name@example.com"
              />
            </div>
          </div>

          {view !== 'RECOVERY' && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Password</label>
              <div className="relative">
                <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"></i>
                <input 
                  type="password" required
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-12 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          {message && <p className="text-violet-400 text-center text-xs font-medium">{message}</p>}

          <button type="submit" className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-violet-600/20 transition-all active:scale-95 mt-2 uppercase tracking-widest text-sm">
            {view === 'LOGIN' ? 'Enter Casino' : view === 'SIGNUP' ? 'Create Account' : 'Send Recovery'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-800 flex flex-col gap-3">
          {view === 'LOGIN' ? (
            <>
              <button onClick={() => setView('SIGNUP')} className="text-zinc-400 hover:text-white text-xs font-medium transition-colors">
                New here? <span className="text-violet-400">Sign Up</span>
              </button>
              <button onClick={() => setView('RECOVERY')} className="text-zinc-500 hover:text-white text-xs font-medium transition-colors">
                Forgot password?
              </button>
            </>
          ) : (
            <button onClick={() => setView('LOGIN')} className="text-zinc-400 hover:text-white text-xs font-medium transition-colors">
              Already have an account? <span className="text-violet-400">Log In</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
