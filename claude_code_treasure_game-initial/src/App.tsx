import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './components/ui/button';
import AuthScreen from './components/AuthScreen';
import closedChest from './assets/treasure_closed.png';
import keyImg from './assets/key.png';
import treasureChest from './assets/treasure_opened.png';
import skeletonChest from './assets/treasure_opened_skeleton.png';
import chestOpenSound from './audios/chest_open.mp3';
import evilLaughSound from './audios/chest_open_with_evil_laugh.mp3';

interface Box {
  id: number;
  isOpen: boolean;
  hasTreasure: boolean;
}

interface User {
  username: string;
  token: string;
}

export default function App() {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [score, setScore] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);

  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('treasure_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isGuest, setIsGuest] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [personalBest, setPersonalBest] = useState<number | null>(null);

  const initializeGame = () => {
    const treasureBoxIndex = Math.floor(Math.random() * 3);
    setBoxes(Array.from({ length: 3 }, (_, i) => ({
      id: i,
      isOpen: false,
      hasTreasure: i === treasureBoxIndex,
    })));
    setScore(0);
    setGameEnded(false);
    setScoreSaved(false);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const fetchPersonalBest = async (token: string) => {
    try {
      const res = await fetch('/api/scores/best', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPersonalBest(data.best);
      }
    } catch {}
  };

  // Fetch personal best on initial load if already signed in
  useEffect(() => {
    if (user) fetchPersonalBest(user.token);
  }, []);

  // Save score when game ends for authenticated users
  useEffect(() => {
    if (!gameEnded || !user) return;
    fetch('/api/scores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({ score }),
    })
      .then(res => {
        if (res.ok) {
          setScoreSaved(true);
          setPersonalBest(prev => (prev === null || score > prev ? score : prev));
        }
      })
      .catch(() => {});
  }, [gameEnded]);

  const openBox = (boxId: number) => {
    if (gameEnded) return;
    setBoxes(prevBoxes => {
      const updatedBoxes = prevBoxes.map(box => {
        if (box.id === boxId && !box.isOpen) {
          new Audio(box.hasTreasure ? chestOpenSound : evilLaughSound).play();
          const newScore = box.hasTreasure ? score + 100 : score - 50;
          setScore(newScore);
          return { ...box, isOpen: true };
        }
        return box;
      });
      const treasureFound = updatedBoxes.some(box => box.isOpen && box.hasTreasure);
      const allOpened = updatedBoxes.every(box => box.isOpen);
      if (treasureFound || allOpened) setGameEnded(true);
      return updatedBoxes;
    });
  };

  const handleAuth = (userData: User) => {
    localStorage.setItem('treasure_user', JSON.stringify(userData));
    setUser(userData);
    fetchPersonalBest(userData.token);
  };

  const handleGuest = () => setIsGuest(true);

  const handleSignOut = () => {
    localStorage.removeItem('treasure_user');
    setUser(null);
    setIsGuest(false);
    setPersonalBest(null);
    setScoreSaved(false);
    initializeGame();
  };

  if (!user && !isGuest) {
    return <AuthScreen onAuth={handleAuth} onGuest={handleGuest} />;
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col items-center justify-center p-8">

      {/* User info bar */}
      <div className="absolute top-4 right-4 flex items-center gap-3 text-sm">
        {user ? (
          <>
            <span className="text-amber-700 font-medium">👤 {user.username}</span>
            {personalBest !== null && (
              <span className="text-amber-600">Best: <span className="font-semibold">${personalBest}</span></span>
            )}
            <button
              onClick={handleSignOut}
              className="text-amber-500 hover:text-amber-700 underline underline-offset-2"
            >
              Sign out
            </button>
          </>
        ) : (
          <span className="text-amber-500 italic">Guest mode</span>
        )}
      </div>

      <div className="text-center mb-8">
        <h1 className="text-4xl mb-4 text-amber-900">🏴‍☠️ Treasure Hunt Game 🏴‍☠️</h1>
        <p className="text-amber-800 mb-4">
          Click on the treasure chests to discover what's inside!
        </p>
        <p className="text-amber-700 text-sm">
          💰 Treasure: +$100 | 💀 Skeleton: -$50
        </p>
      </div>

      <div className="mb-8 flex items-center gap-4">
        <div className="text-2xl text-center p-4 bg-amber-200/80 backdrop-blur-sm rounded-lg shadow-lg border-2 border-amber-400">
          <span className="text-amber-900">Current Score: </span>
          <span className={score >= 0 ? 'text-green-600' : 'text-red-600'}>${score}</span>
        </div>
        {boxes.some(b => b.isOpen) && (
          <div className={`text-2xl font-bold p-4 rounded-lg shadow-lg border-2 ${
            score > 0
              ? 'bg-green-100 text-green-700 border-green-400'
              : score < 0
              ? 'bg-red-100 text-red-700 border-red-400'
              : 'bg-amber-100 text-amber-700 border-amber-400'
          }`}>
            {score > 0 ? 'Win' : score < 0 ? 'Loss' : 'Tie'}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {boxes.map((box) => (
          <motion.div
            key={box.id}
            className="flex flex-col items-center"
            style={{ cursor: box.isOpen ? 'default' : `url(${keyImg}) 16 16, pointer` }}
            whileHover={{ scale: box.isOpen ? 1 : 1.05 }}
            whileTap={{ scale: box.isOpen ? 1 : 0.95 }}
            onClick={() => openBox(box.id)}
          >
            <motion.div
              initial={{ rotateY: 0 }}
              animate={{ rotateY: box.isOpen ? 180 : 0, scale: box.isOpen ? 1.1 : 1 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="relative"
            >
              <img
                src={box.isOpen ? (box.hasTreasure ? treasureChest : skeletonChest) : closedChest}
                alt={box.isOpen ? (box.hasTreasure ? 'Treasure!' : 'Skeleton!') : 'Treasure Chest'}
                className="w-48 h-48 object-contain drop-shadow-lg"
              />
              {box.isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                >
                  {box.hasTreasure
                    ? <div className="text-2xl animate-bounce">✨💰✨</div>
                    : <div className="text-2xl animate-pulse">💀👻💀</div>}
                </motion.div>
              )}
            </motion.div>

            <div className="mt-4 text-center">
              {box.isOpen ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  className={`text-lg p-2 rounded-lg ${
                    box.hasTreasure
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}
                >
                  {box.hasTreasure ? '+$100' : '-$50'}
                </motion.div>
              ) : (
                <div className="text-amber-700 p-2">Click to open!</div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {gameEnded && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="mb-4 p-6 bg-amber-200/80 backdrop-blur-sm rounded-xl shadow-lg border-2 border-amber-400">
            <h2 className="text-2xl mb-2 text-amber-900">Game Over!</h2>
            <p className="text-lg text-amber-800">
              Final Score:{' '}
              <span className={score >= 0 ? 'text-green-600' : 'text-red-600'}>${score}</span>
            </p>
            <p className="text-sm text-amber-600 mt-2">
              {boxes.some(box => box.isOpen && box.hasTreasure)
                ? 'Treasure found! Well done, treasure hunter! 🎉'
                : 'No treasure found this time! Better luck next time! 💀'}
            </p>
            {user && (
              <p className={`text-sm mt-2 font-medium ${scoreSaved ? 'text-green-600' : 'text-amber-500'}`}>
                {scoreSaved ? '✓ Score saved' : 'Saving score…'}
              </p>
            )}
            {isGuest && (
              <p className="text-sm mt-2 text-amber-500">
                Sign in to save your scores!
              </p>
            )}
          </div>

          <Button
            onClick={initializeGame}
            className="text-lg px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white"
          >
            Play Again
          </Button>
        </motion.div>
      )}
    </div>
  );
}
