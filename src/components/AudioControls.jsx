import { useEffect, useState } from 'react';

function percent(value) {
  return `${Math.round(value * 100)}%`;
}

export default function AudioControls({
  bgmVolume,
  sfxVolume,
  onBgmDown,
  onBgmUp,
  onSfxDown,
  onSfxUp,
  screen,
}) {
  const [isOpen, setIsOpen] = useState(screen !== 'playing');

  useEffect(() => {
    setIsOpen(screen !== 'playing');
  }, [screen]);

  return (
    <section className="audio-controls" aria-label="오디오 설정">
      <button
        className={`audio-toggle-button${isOpen ? ' is-open' : ''}`}
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
        aria-controls="audio-panel"
      >
        {isOpen ? '사운드 닫기' : '사운드'}
      </button>

      {isOpen && (
        <div id="audio-panel" className="audio-panel">
          <div className="audio-control-card">
            <span className="audio-label">배경음악</span>
            <div className="audio-buttons">
              <button
                className="audio-step-button"
                type="button"
                onClick={onBgmDown}
                disabled={bgmVolume <= 0}
                aria-label="배경음악 줄이기"
              >
                -
              </button>
              <strong className="audio-value">{percent(bgmVolume)}</strong>
              <button
                className="audio-step-button"
                type="button"
                onClick={onBgmUp}
                disabled={bgmVolume >= 1}
                aria-label="배경음악 키우기"
              >
                +
              </button>
            </div>
          </div>

          <div className="audio-control-card">
            <span className="audio-label">효과음</span>
            <div className="audio-buttons">
              <button
                className="audio-step-button"
                type="button"
                onClick={onSfxDown}
                disabled={sfxVolume <= 0}
                aria-label="효과음 줄이기"
              >
                -
              </button>
              <strong className="audio-value">{percent(sfxVolume)}</strong>
              <button
                className="audio-step-button"
                type="button"
                onClick={onSfxUp}
                disabled={sfxVolume >= 1}
                aria-label="효과음 키우기"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
