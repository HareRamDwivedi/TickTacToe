import { useState, useEffect } from 'react';
import './App.css';

const winningConditions = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

const themes = {
  light: 'theme-light',
  dark: 'theme-dark',
  neon: 'theme-neon',
  pastel: 'theme-pastel',
};

function App() {
  const [gameState, setGameState] = useState(Array(9).fill(''));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [gameActive, setGameActive] = useState(true);
  const [status, setStatus] = useState("Player X's turn");
  const [history, setHistory] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('ticTacToeHistory'));
    return saved || [];
  });
  const [lastWinner, setLastWinner] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('ticTacToeTheme') || 'light');

  // For cell click animation
  const [clickedCell, setClickedCell] = useState(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('ticTacToeGame'));
    if (saved) {
      setGameState(saved.gameState);
      setCurrentPlayer(saved.currentPlayer);
      setGameActive(saved.gameActive);
      setStatus(saved.status);
      setLastWinner(saved.lastWinner || null);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ticTacToeGame', JSON.stringify({
      gameState,
      currentPlayer,
      gameActive,
      status,
      lastWinner,
    }));
  }, [gameState, currentPlayer, gameActive, status, lastWinner]);

  useEffect(() => {
    localStorage.setItem('ticTacToeHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    document.body.className = themes[theme];
    localStorage.setItem('ticTacToeTheme', theme);
  }, [theme]);

  // For background animation
  useEffect(() => {
    // Animate background gradient
    let angle = 0;
    let raf;
    function animateBg() {
      angle = (angle + 0.1) % 360;
      document.body.style.background = `linear-gradient(${angle}deg, #a1c4fd 0%, #c2e9fb 100%)`;
      raf = requestAnimationFrame(animateBg);
    }
    animateBg();
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.background = '';
    };
  }, []);

  const handleClick = (index) => {
    if (gameState[index] || !gameActive) return;
    setClickedCell(index);
    setTimeout(() => setClickedCell(null), 200);

    const newGameState = [...gameState];
    newGameState[index] = currentPlayer;

    setGameState(newGameState);

    if (checkWin(newGameState, currentPlayer)) {
      setStatus(`🎉 Player ${currentPlayer} wins!`);
      setGameActive(false);
      setHistory([`Player ${currentPlayer} won`, ...history]);
      setLastWinner(currentPlayer);
    } else if (!newGameState.includes('')) {
      setStatus('🤝 Game ended in a draw!');
      setGameActive(false);
      setHistory(['Draw', ...history]);
      setLastWinner(null);
    } else {
      const next = currentPlayer === 'X' ? 'O' : 'X';
      setCurrentPlayer(next);
      setStatus(`Player ${next}'s turn`);
    }
  };

  const checkWin = (state, player) =>
    winningConditions.some(([a, b, c]) => state[a] === player && state[b] === player && state[c] === player);

  const resetGame = () => {
    let next = 'X';
    if (lastWinner === 'X') next = 'O';
    else if (lastWinner === 'O') next = 'X';

    setGameState(Array(9).fill(''));
    setCurrentPlayer(next);
    setGameActive(true);
    setStatus(`Player ${next}'s turn`);
  };

  const changeTheme = () => {
    const themeKeys = Object.keys(themes);
    const nextIndex = (themeKeys.indexOf(theme) + 1) % themeKeys.length;
    setTheme(themeKeys[nextIndex]);
  };

  return (
    <div className="main-container">
      {/* Dynamic Animated Background */}
      <div className="animated-bg"></div>
      {/* Theme Selector Top Right */}
      <div className="theme-dropdown">
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="light">🌤 Light</option>
          <option value="dark">🌙 Dark</option>
          <option value="neon">🌈 Neon</option>
          <option value="pastel">🍧 Pastel</option>
        </select>
      </div>
      {/* Game Section */}
      <div className="left-section">
        <h1 style={{letterSpacing: '2px', fontSize: '2.5rem', marginBottom: '20px', textShadow: '0 2px 8px #a1c4fd'}}>Tic Tac Toe</h1>
        <div className="status" style={{fontWeight: 'bold', fontSize: '1.3rem', marginBottom: '18px'}}>{status}</div>
        <div className="board">
          {gameState.map((val, idx) => (
            <div
              key={idx}
              className={`cell ${val.toLowerCase()} ${!gameActive ? 'disabled' : ''} ${clickedCell === idx ? 'cell-pressed' : ''}`}
              onClick={() => handleClick(idx)}
              style={{
                boxShadow: val ? '0 4px 20px rgba(59,130,246,0.15)' : '0 2px 8px rgba(0,0,0,0.08)',
                background: val ? (val === 'X' ? 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)' : 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)') : 'rgba(255,255,255,0.7)',
                border: val ? '2px solid #60a5fa' : '2px solid #e0e7ef',
                transition: 'all 0.2s cubic-bezier(.4,2,.6,1)',
                transform: clickedCell === idx ? 'scale(0.93)' : 'scale(1)',
                cursor: gameActive && !val ? 'pointer' : 'not-allowed',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <span className="cell-content" style={{
                display: 'inline-block',
                transform: clickedCell === idx ? 'scale(1.2) rotate(-8deg)' : 'scale(1)',
                transition: 'transform 0.18s cubic-bezier(.4,2,.6,1)',
                textShadow: val ? '0 2px 12px #a1c4fd' : 'none',
              }}>{val}</span>
              {/* Ripple effect */}
              {clickedCell === idx && <span className="ripple"></span>}
            </div>
          ))}
        </div>
        <button className="reset-btn" onClick={resetGame} style={{marginTop: '10px', fontSize: '1.1rem', letterSpacing: '1px', boxShadow: '0 2px 8px #a1c4fd'}}>🔄 Reset Game</button>
      </div>
      {/* History Section */}
      <div className="right-section">
        <h2 style={{fontWeight: 'bold', fontSize: '1.2rem', letterSpacing: '1px'}}>Game History</h2>
        <div className="history">
          {history.length === 0 ? (
            <p className="empty-history">No games played yet.</p>
          ) : (
            history.map((item, index) => (
              <div
                key={index}
                className="history-item"
                style={{ fontWeight: index === 0 ? 'bold' : 'normal', transition: 'background 0.3s' }}
              >
                Game {history.length - index}: {item}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
