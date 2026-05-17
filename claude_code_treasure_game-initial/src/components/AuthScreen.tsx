import { useState, FormEvent } from 'react';
import { Button } from './ui/button';
import API_BASE from '../lib/api';

interface User {
  username: string;
  token: string;
}

interface AuthScreenProps {
  onAuth: (user: User) => void;
  onGuest: () => void;
}

type Tab = 'signin' | 'signup';

export default function AuthScreen({ onAuth, onGuest }: AuthScreenProps) {
  const [tab, setTab] = useState<Tab>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const switchTab = (t: Tab) => {
    setTab(t);
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}${tab === 'signin' ? '/api/auth/signin' : '/api/auth/signup'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
      } else {
        onAuth({ username: data.username, token: data.token });
      }
    } catch {
      setError('Cannot connect to server. Make sure the API server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col items-center justify-center p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl mb-2 text-amber-900">🏴‍☠️ Treasure Hunt Game</h1>
        <p className="text-amber-700">Sign in to track your scores, or play as a guest</p>
      </div>

      <div className="w-full max-w-sm bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border-2 border-amber-300 p-6">
        <div className="flex mb-6 border-b-2 border-amber-100">
          {(['signin', 'signup'] as Tab[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => switchTab(t)}
              className={`flex-1 pb-3 text-sm font-semibold transition-colors ${
                tab === t
                  ? 'text-amber-700 border-b-2 border-amber-600 -mb-[2px]'
                  : 'text-amber-400 hover:text-amber-600'
              }`}
            >
              {t === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Enter username"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Enter password"
              autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold"
          >
            {loading ? 'Loading…' : tab === 'signin' ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="flex-1 border-t border-amber-200" />
          <span className="text-xs text-amber-400 uppercase tracking-wide">or</span>
          <div className="flex-1 border-t border-amber-200" />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={onGuest}
          className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
        >
          Play as Guest
        </Button>
      </div>
    </div>
  );
}
