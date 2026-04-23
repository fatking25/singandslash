import { useEffect, useRef } from 'react';
import { GAME_HEIGHT, GAME_WIDTH } from '../game/constants.js';
import { GameEngine } from '../game/engine.js';

export default function GameCanvas({
  onStateChange,
  onGameOver,
  onHit,
  onUpgradePrompt,
  onReady,
}) {
  const canvasRef = useRef(null);
  const callbacksRef = useRef({
    onStateChange,
    onGameOver,
    onHit,
    onUpgradePrompt,
    onReady,
  });

  useEffect(() => {
    callbacksRef.current = {
      onStateChange,
      onGameOver,
      onHit,
      onUpgradePrompt,
      onReady,
    };
  }, [onStateChange, onGameOver, onHit, onUpgradePrompt, onReady]);

  useEffect(() => {
    const engine = new GameEngine({
      canvas: canvasRef.current,
      onStateChange: (state) => callbacksRef.current.onStateChange?.(state),
      onGameOver: (summary) => callbacksRef.current.onGameOver?.(summary),
      onHit: () => callbacksRef.current.onHit?.(),
      onUpgradePrompt: (prompt) => callbacksRef.current.onUpgradePrompt?.(prompt),
    });

    callbacksRef.current.onReady?.(engine);
    engine.start();

    return () => {
      callbacksRef.current.onReady?.(null);
      engine.stop();
    };
  }, []);

  return (
    <div className="canvas-frame">
      <canvas
        ref={canvasRef}
        className="game-canvas"
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
      />
    </div>
  );
}
