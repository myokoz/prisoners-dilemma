"use client";

import React, { useState, useEffect } from 'react';
import { Timer, Users, History, Settings } from 'lucide-react';

const PrisonersDilemma = () => {
  // ゲーム設定
  const [gameSettings, setGameSettings] = useState({
    roundDuration: 60, // 秒単位
    totalRounds: 15,
    points: {
      bothCooperate: 3,
      bothBetray: 1,
      betraySuccess: 4,
      betrayedPenalty: 0
    }
  });

  // 設定変更モードのステート
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // ゲーム状態
  const [gameState, setGameState] = useState({
    currentRound: 1,
    timeRemaining: gameSettings.roundDuration,
    isRoundActive: false,
    gameStatus: 'standby' // standby, playing, finished
  });

  // プレイヤー状態
  const [players, setPlayers] = useState([
    { id: 1, name: 'Player 1', choice: null, totalPoints: 0, history: [] },
    { id: 2, name: 'Player 2', choice: null, totalPoints: 0, history: [] }
  ]);

  // ゲーム履歴
  const [gameHistory, setGameHistory] = useState([]);

  // タイマー効果
  useEffect(() => {
    let timer;
    if (gameState.isRoundActive && gameState.timeRemaining > 0) {
      timer = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        }));
      }, 1000);
    } else if (gameState.timeRemaining === 0 && gameState.isRoundActive) {
      evaluateRound();
    }

    return () => clearInterval(timer);
  }, [gameState.isRoundActive, gameState.timeRemaining]);

  // 設定変更ハンドラー
  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setGameSettings(prev => ({
      ...prev,
      [name]: parseInt(value)
    }));
  };

  // ポイント設定変更ハンドラー
  const handlePointsChange = (e) => {
    const { name, value } = e.target;
    setGameSettings(prev => ({
      ...prev,
      points: {
        ...prev.points,
        [name]: parseInt(value)
      }
    }));
  };

  // 設定を適用してゲームをリセット
  const applySettings = () => {
    startNewGame();
    setIsSettingsOpen(false);
  };

  // ラウンドの評価
  const evaluateRound = () => {
    const player1Choice = players[0].choice || 'betray';
    const player2Choice = players[1].choice || 'betray';
    let points = calculatePoints(player1Choice, player2Choice);

    const roundResult = {
      round: gameState.currentRound,
      choices: [player1Choice, player2Choice],
      points: points
    };

    setGameHistory(prev => [...prev, roundResult]);

    setPlayers(prev => [
      {
        ...prev[0],
        totalPoints: prev[0].totalPoints + points[0],
        history: [...prev[0].history, player1Choice],
        choice: null
      },
      {
        ...prev[1],
        totalPoints: prev[1].totalPoints + points[1],
        history: [...prev[1].history, player2Choice],
        choice: null
      }
    ]);

    if (gameState.currentRound >= gameSettings.totalRounds) {
      setGameState(prev => ({
        ...prev,
        isRoundActive: false,
        gameStatus: 'finished'
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        currentRound: prev.currentRound + 1,
        timeRemaining: gameSettings.roundDuration,
        isRoundActive: false
      }));
    }
  };

  // ポイント計算
  const calculatePoints = (choice1, choice2) => {
    if (choice1 === 'cooperate' && choice2 === 'cooperate') {
      return [gameSettings.points.bothCooperate, gameSettings.points.bothCooperate];
    } else if (choice1 === 'betray' && choice2 === 'betray') {
      return [gameSettings.points.bothBetray, gameSettings.points.bothBetray];
    } else if (choice1 === 'betray' && choice2 === 'cooperate') {
      return [gameSettings.points.betraySuccess, gameSettings.points.betrayedPenalty];
    } else {
      return [gameSettings.points.betrayedPenalty, gameSettings.points.betraySuccess];
    }
  };

  // プレイヤーの選択を処理
  const handleChoice = (playerId, choice) => {
    if (!gameState.isRoundActive) return;

    setPlayers(prev => prev.map(player =>
      player.id === playerId ? { ...player, choice } : player
    ));
  };

  // ラウンドの開始
  const startRound = () => {
    setGameState(prev => ({
      ...prev,
      isRoundActive: true,
      gameStatus: 'playing'
    }));
  };

  // 新しいゲームの開始
  const startNewGame = () => {
    setPlayers([
      { id: 1, name: 'Player 1', choice: null, totalPoints: 0, history: [] },
      { id: 2, name: 'Player 2', choice: null, totalPoints: 0, history: [] }
    ]);
    setGameHistory([]);
    setGameState({
      currentRound: 1,
      timeRemaining: gameSettings.roundDuration,
      isRoundActive: false,
      gameStatus: 'standby'
    });
  };

  // タイマーを見やすい形式に整形する関数
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-8">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Prisoner's Dilemma Game</h2>
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold text-gray-900">
              Round {gameState.currentRound}/{gameSettings.totalRounds}
            </span>
            <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-lg">
              <Timer className="w-5 h-5 text-blue-600" />
              <span className="text-lg font-semibold text-blue-600">
                {formatTime(gameState.timeRemaining)}
              </span>
            </div>
            {/* 設定ボタン - ゲーム開始前のみ表示 */}
            {gameState.gameStatus === 'standby' && (
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <Settings className="w-6 h-6 text-gray-700" />
              </button>
            )}
          </div>
        </div>

        {/* 設定パネル */}
        {isSettingsOpen && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Game Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col gap-2">
                <label className="text-gray-900 font-medium">Thinking Time (seconds)</label>
                <input
                  type="number"
                  name="roundDuration"
                  value={gameSettings.roundDuration}
                  onChange={handleSettingsChange}
                  min="10"
                  max="300"
                  className="border-2 rounded-md p-2 text-gray-900"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-gray-900 font-medium">Total Rounds</label>
                <input
                  type="number"
                  name="totalRounds"
                  value={gameSettings.totalRounds}
                  onChange={handleSettingsChange}
                  min="1"
                  max="50"
                  className="border-2 rounded-md p-2 text-gray-900"
                />
              </div>
            </div>

            <h4 className="text-lg font-semibold text-gray-900 mb-2">Point Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <div className="flex flex-col gap-2">
                <label className="text-gray-900 font-medium">Both Cooperate</label>
                <input
                  type="number"
                  name="bothCooperate"
                  value={gameSettings.points.bothCooperate}
                  onChange={handlePointsChange}
                  min="0"
                  max="10"
                  className="border-2 rounded-md p-2 text-gray-900"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-gray-900 font-medium">Both Betray</label>
                <input
                  type="number"
                  name="bothBetray"
                  value={gameSettings.points.bothBetray}
                  onChange={handlePointsChange}
                  min="0"
                  max="10"
                  className="border-2 rounded-md p-2 text-gray-900"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col gap-2">
                <label className="text-gray-900 font-medium">Betrayer Reward</label>
                <input
                  type="number"
                  name="betraySuccess"
                  value={gameSettings.points.betraySuccess}
                  onChange={handlePointsChange}
                  min="0"
                  max="10"
                  className="border-2 rounded-md p-2 text-gray-900"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-gray-900 font-medium">Betrayed Penalty</label>
                <input
                  type="number"
                  name="betrayedPenalty"
                  value={gameSettings.points.betrayedPenalty}
                  onChange={handlePointsChange}
                  min="0"
                  max="10"
                  className="border-2 rounded-md p-2 text-gray-900"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={applySettings}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Apply Settings
              </button>
            </div>
          </div>
        )}

        {/* プレイヤーセクション */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          {players.map(player => (
            <div key={player.id} className="bg-gray-50 p-6 rounded-lg shadow">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-gray-800" />
                    <span className="text-lg font-semibold text-gray-900">{player.name}</span>
                  </div>
                  <span className="text-xl font-bold text-blue-600">
                    Points: {player.totalPoints}
                  </span>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleChoice(player.id, 'cooperate')}
                    disabled={!gameState.isRoundActive || player.choice === 'cooperate'}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold
                      ${player.choice === 'cooperate'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-green-100'}
                      disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    Cooperate
                  </button>
                  <button
                    onClick={() => handleChoice(player.id, 'betray')}
                    disabled={!gameState.isRoundActive || player.choice === 'betray'}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold
                      ${player.choice === 'betray'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-red-100'}
                      disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    Betray
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* アクションボタン */}
        {!gameState.isRoundActive && gameState.gameStatus !== 'finished' && (
          <button
            onClick={startRound}
            className="w-full mb-6 px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700"
          >
            {gameState.gameStatus === 'standby' ? 'Start Game' : 'Start Next Round'}
          </button>
        )}

        {/* ゲーム終了メッセージ */}
        {gameState.gameStatus === 'finished' && (
          <div className="mb-6 p-6 bg-yellow-100 border-l-4 border-yellow-400 rounded-lg">
            <p className="text-xl font-semibold text-yellow-800">
              Game Over! 
              {players[0].totalPoints === players[1].totalPoints 
                ? " It's a tie!"
                : ` ${players[0].totalPoints > players[1].totalPoints ? 'Player 1' : 'Player 2'} wins!`}
            </p>
            <button
              onClick={startNewGame}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Start New Game
            </button>
          </div>
        )}

        {/* ゲーム履歴 */}
        {gameHistory.length > 0 && (
          <div className="mt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Game History</h3>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-4 text-left text-gray-900 font-semibold border-b">Round</th>
                    <th className="p-4 text-left text-gray-900 font-semibold border-b">Player 1</th>
                    <th className="p-4 text-left text-gray-900 font-semibold border-b">Player 2</th>
                    <th className="p-4 text-left text-gray-900 font-semibold border-b">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {gameHistory.map((history, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="p-4 text-gray-900">{history.round}</td>
                      <td className="p-4 text-gray-900">
                        <span className={history.choices[0] === 'cooperate' ? 'text-green-600' : 'text-red-600'}>
                          {history.choices[0].charAt(0).toUpperCase() + history.choices[0].slice(1)}
                        </span>
                      </td>
                      <td className="p-4 text-gray-900">
                        <span className={history.choices[1] === 'cooperate' ? 'text-green-600' : 'text-red-600'}>
                          {history.choices[1].charAt(0).toUpperCase() + history.choices[1].slice(1)}
                        </span>
                      </td>
                      <td className="p-4 text-gray-900">{history.points[0]} - {history.points[1]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrisonersDilemma;
