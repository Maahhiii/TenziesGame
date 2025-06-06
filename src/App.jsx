import { useState, useRef, useEffect } from "react"
import { nanoid } from "nanoid"
import "./App.css"
import Confetti from "react-confetti"

function Die({ value, isHeld, hold, isGameWon }) {
    const renderDieContent = () => {
        const dotPositions = {
            1: [[50, 50]],
            2: [[25, 25], [75, 75]],
            3: [[25, 25], [50, 50], [75, 75]],
            4: [[25, 25], [75, 25], [25, 75], [75, 75]],
            5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
            6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]]
        }

        return (
            <svg className="die-svg" viewBox="0 0 100 100">
                {dotPositions[value].map((pos, index) => (
                    <circle
                        key={index}
                        cx={pos[0]}
                        cy={pos[1]}
                        r="8"
                        fill="currentColor"
                    />
                ))}
            </svg>
        )
    }

    return (
        <button
            className={`die-button ${isHeld ? 'held' : ''} ${isGameWon ? 'disabled' : ''}`}
            onClick={hold}
            disabled={isGameWon}
            aria-pressed={isHeld}
            aria-label={`Die with value ${value}. ${isHeld ? 'Currently held' : 'Click to hold'}`}
        >
            {renderDieContent()}
        </button>
    )
}

export default function App() {
    const [dice, setDice] = useState(() => generateAllNewDice())
    const [rollCount, setRollCount] = useState(0)
    const [startTime, setStartTime] = useState(null)
    const [elapsedTime, setElapsedTime] = useState(0)
    const [bestRolls, setBestRolls] = useState(null)
    const [bestTime, setBestTime] = useState(null)
    const [gameHistory, setGameHistory] = useState([])
    const buttonRef = useRef(null)

    const gameWon = dice.every(die => die.isHeld) &&
        dice.every(die => die.value === dice[0].value)

    // Start timer on first roll
    useEffect(() => {
        if (rollCount === 1 && !startTime) {
            setStartTime(Date.now())
        }
    }, [rollCount, startTime])

    // Handle game completion
    useEffect(() => {
        if (gameWon && startTime) {
            const time = ((Date.now() - startTime) / 1000).toFixed(2)
            setElapsedTime(time)

            // Update best scores and history
            const newGame = { rolls: rollCount, time: parseFloat(time) }
            setGameHistory(prev => [...prev, newGame])

            if (!bestRolls || rollCount < bestRolls) {
                setBestRolls(rollCount)
            }
            if (!bestTime || parseFloat(time) < parseFloat(bestTime)) {
                setBestTime(time)
            }
        }
    }, [gameWon, startTime, rollCount, bestRolls, bestTime])

    // Live timer update
    useEffect(() => {
        let interval = null

        if (!gameWon && startTime) {
            interval = setInterval(() => {
                setElapsedTime(((Date.now() - startTime) / 1000).toFixed(2))
            }, 100)
        }

        return () => clearInterval(interval)
    }, [gameWon, startTime])

    // Focus button when game is won
    useEffect(() => {
        if (gameWon) {
            buttonRef.current?.focus()
        }
    }, [gameWon])

    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
    
        useEffect(() => {
            function handleResize() {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
            }
            handleResize(); // Set initial size on mount
            window.addEventListener("resize", handleResize);
            return () => window.removeEventListener("resize", handleResize);
        }, []);

    function generateNewDie() {
        return {
            value: Math.ceil(Math.random() * 6),
            isHeld: false,
            id: nanoid()
        }
    }

    function generateAllNewDice() {
        return Array.from({ length: 10 }, generateNewDie)
    }

    function rollDice() {
        if (!gameWon) {
            setDice(oldDice =>
                oldDice.map(die =>
                    die.isHeld ? die : generateNewDie()
                )
            )
            setRollCount(prev => prev + 1)
        } else {
            // Start new game
            setDice(generateAllNewDice())
            setRollCount(0)
            setStartTime(null)
            setElapsedTime(0)
        }
    }

    function hold(id) {
        if (!gameWon) {
            setDice(oldDice =>
                oldDice.map(die =>
                    die.id === id ? { ...die, isHeld: !die.isHeld } : die
                )
            )
        }
    }

    const diceElements = dice.map(die => (
        <Die
            key={die.id}
            value={die.value}
            isHeld={die.isHeld}
            hold={() => hold(die.id)}
            isGameWon={gameWon}
        />
    ))

    const averageRolls = gameHistory.length > 0 
        ? (gameHistory.reduce((sum, game) => sum + game.rolls, 0) / gameHistory.length).toFixed(1)
        : null

    const averageTime = gameHistory.length > 0 
        ? (gameHistory.reduce((sum, game) => sum + game.time, 0) / gameHistory.length).toFixed(2)
        : null

    return (
        <div className="app-container">
            {gameWon && 
                <Confetti
                    recycle={false}
                    numberOfPieces={1000}
                    width={windowSize.width}
                    height={windowSize.height}
                    style={{ position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 9999 }}
                />
            }
            
            <div className="game-header">
                <h1 className="title">
                    <span className="title-icon">🎲</span>
                    TENZIES
                    <span className="title-icon">🎲</span>
                </h1>
                <p className="subtitle">The Ultimate Dice Game Challenge</p>
            </div>

            <main className="main-game">
                <div className="instructions-card">
                    <p className="instructions">
                        Roll until all dice show the same number. Click each die to freeze it at its current value between rolls.
                    </p>
                </div>

                <div className="stats-section">
                    <div className="current-stats">
                        <div className="stat-card primary">
                            <span className="stat-label">Rolls</span>
                            <span className="stat-value">{rollCount}</span>
                        </div>
                        <div className="stat-card primary">
                            <span className="stat-label">Time</span>
                            <span className="stat-value">{elapsedTime}s</span>
                        </div>
                    </div>

                    {(bestRolls || bestTime || gameHistory.length > 0) && (
                        <div className="best-stats">
                            {bestRolls && (
                                <div className="stat-card best">
                                    <span className="stat-label">🏆 Best Rolls</span>
                                    <span className="stat-value">{bestRolls}</span>
                                </div>
                            )}
                            {bestTime && (
                                <div className="stat-card best">
                                    <span className="stat-label">⚡ Best Time</span>
                                    <span className="stat-value">{bestTime}s</span>
                                </div>
                            )}
                            {averageRolls && (
                                <div className="stat-card average">
                                    <span className="stat-label">📊 Avg Rolls</span>
                                    <span className="stat-value">{averageRolls}</span>
                                </div>
                            )}
                            {averageTime && (
                                <div className="stat-card average">
                                    <span className="stat-label">📊 Avg Time</span>
                                    <span className="stat-value">{averageTime}s</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="dice-section">
                    <div className="dice-container">
                        {diceElements}
                    </div>
                </div>

                <div className="controls-section">
                    <button 
                        ref={buttonRef} 
                        className={`roll-button ${gameWon ? 'won' : ''}`}
                        onClick={rollDice}
                    >
                        {gameWon ? (
                            <>
                                <span className="button-icon"></span>
                                Start New Game
                                <span className="button-icon"></span>
                            </>
                        ) : (
                            <>
                                <span className="button-icon">🎲</span>
                                Roll Dice
                                <span className="button-icon">🎲</span>
                            </>
                        )}
                    </button>
                </div>

                {gameWon && (
                    <div className="victory-card">
                        <div className="victory-content">
                            <h2 className="victory-title">🎉 VICTORY! 🎉</h2>
                            <p className="victory-text">
                                Completed in <strong>{rollCount}</strong> rolls and <strong>{elapsedTime}</strong> seconds!
                            </p>
                            {(rollCount <= bestRolls || parseFloat(elapsedTime) <= parseFloat(bestTime)) && (
                                <div className="new-record">
                                    ⭐ NEW PERSONAL BEST! ⭐
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}