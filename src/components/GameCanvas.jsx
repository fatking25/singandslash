import { useCallback, useEffect, useRef, useState } from 'react';
import { GAME_HEIGHT, GAME_WIDTH } from '../game/constants.js';
import { GameEngine } from '../game/engine.js';

const idleJoystick = {
  active: false,
  x: 0,
  y: 0,
};

export default function GameCanvas({
  onStateChange,
  onGameOver,
  onHit,
  onUpgradePrompt,
  onReady,
}) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const joystickRef = useRef(null);
  const activePointerIdRef = useRef(null);
  const callbacksRef = useRef({
    onStateChange,
    onGameOver,
    onHit,
    onUpgradePrompt,
    onReady,
  });
  const [showTouchControls, setShowTouchControls] = useState(false);
  const [joystick, setJoystick] = useState(idleJoystick);

  useEffect(() => {
    callbacksRef.current = {
      onStateChange,
      onGameOver,
      onHit,
      onUpgradePrompt,
      onReady,
    };
  }, [onStateChange, onGameOver, onHit, onUpgradePrompt, onReady]);

  const resetTouchInput = useCallback(() => {
    activePointerIdRef.current = null;
    setJoystick(idleJoystick);
    engineRef.current?.clearMoveInput();
  }, []);

  const updateTouchInput = useCallback((clientX, clientY) => {
    const joystickElement = joystickRef.current;

    if (!joystickElement) {
      return;
    }

    const rect = joystickElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxDistance = rect.width * 0.32;
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const distance = Math.hypot(deltaX, deltaY);
    const limitedDistance = Math.min(distance, maxDistance);
    const ratio = distance > 0 ? limitedDistance / distance : 0;
    const knobX = deltaX * ratio;
    const knobY = deltaY * ratio;
    const moveX = maxDistance > 0 ? knobX / maxDistance : 0;
    const moveY = maxDistance > 0 ? knobY / maxDistance : 0;

    setJoystick({
      active: distance > 6,
      x: knobX,
      y: knobY,
    });
    engineRef.current?.setMoveInput(moveX, moveY);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(pointer: coarse)');
    const syncTouchMode = () => {
      const coarsePointer = mediaQuery.matches;
      const touchPoints = navigator.maxTouchPoints > 0;
      const enabled = coarsePointer || touchPoints;

      setShowTouchControls(enabled);

      if (!enabled) {
        resetTouchInput();
      }
    };

    syncTouchMode();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', syncTouchMode);
    } else {
      mediaQuery.addListener(syncTouchMode);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', syncTouchMode);
      } else {
        mediaQuery.removeListener(syncTouchMode);
      }
    };
  }, [resetTouchInput]);

  useEffect(() => {
    const engine = new GameEngine({
      canvas: canvasRef.current,
      onStateChange: (state) => callbacksRef.current.onStateChange?.(state),
      onGameOver: (summary) => callbacksRef.current.onGameOver?.(summary),
      onHit: () => callbacksRef.current.onHit?.(),
      onUpgradePrompt: (prompt) => callbacksRef.current.onUpgradePrompt?.(prompt),
    });

    engineRef.current = engine;
    callbacksRef.current.onReady?.(engine);
    engine.start();

    return () => {
      resetTouchInput();
      callbacksRef.current.onReady?.(null);
      engineRef.current = null;
      engine.stop();
    };
  }, [resetTouchInput]);

  const handleJoystickPointerDown = useCallback(
    (event) => {
      activePointerIdRef.current = event.pointerId;
      event.preventDefault();
      event.currentTarget.setPointerCapture?.(event.pointerId);
      updateTouchInput(event.clientX, event.clientY);
    },
    [updateTouchInput],
  );

  const handleJoystickPointerMove = useCallback(
    (event) => {
      if (activePointerIdRef.current !== event.pointerId) {
        return;
      }

      event.preventDefault();
      updateTouchInput(event.clientX, event.clientY);
    },
    [updateTouchInput],
  );

  const handleJoystickPointerEnd = useCallback(
    (event) => {
      if (activePointerIdRef.current !== event.pointerId) {
        return;
      }

      if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      resetTouchInput();
    },
    [resetTouchInput],
  );

  return (
    <div className="game-canvas-shell">
      <div className="canvas-frame">
        <canvas
          ref={canvasRef}
          className="game-canvas"
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
        />
      </div>

      {showTouchControls && (
        <div className="touch-ui">
          <div className="touch-joystick-wrap">
            <div className="touch-badge">드래그로 이동</div>
            <div
              ref={joystickRef}
              className={`touch-joystick${joystick.active ? ' is-active' : ''}`}
              onPointerDown={handleJoystickPointerDown}
              onPointerMove={handleJoystickPointerMove}
              onPointerUp={handleJoystickPointerEnd}
              onPointerCancel={handleJoystickPointerEnd}
            >
              <div
                className="touch-joystick-knob"
                style={{
                  transform: `translate(calc(-50% + ${joystick.x}px), calc(-50% + ${joystick.y}px))`,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
