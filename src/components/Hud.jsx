import { formatDuration } from '../game/format.js';

export default function Hud({ hud, onPauseToggle, pauseDisabled }) {
  const hpRate = `${(hud.hp / hud.maxHp) * 100}%`;

  let subtitle = '자동공격 핵앤슬래시 모드';

  if (hud.isPaused) {
    subtitle = '전투가 잠시 멈춰 있습니다';
  } else if (hud.isBossWave) {
    subtitle = '보스 웨이브 진행 중';
  }

  return (
    <section className="hud-panel">
      <div className="hud-header">
        <div>
          <h2 className="hud-title">현재 런</h2>
          <p className="hud-subtitle">{subtitle}</p>
        </div>

        <div className="hud-actions">
          <div className="danger-tag">{hud.dangerLabel}</div>
          <button
            className="hud-menu-button"
            type="button"
            onClick={onPauseToggle}
            disabled={pauseDisabled}
          >
            {hud.isPaused ? '계속하기' : '일시정지'}
          </button>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-item">
          <span className="stat-label">HP</span>
          <span className="stat-value">
            {hud.hp} / {hud.maxHp}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">처치 수</span>
          <span className="stat-value">{hud.kills}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">생존 시간</span>
          <span className="stat-value">{formatDuration(hud.elapsedMs)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">웨이브</span>
          <span className="stat-value">{hud.wave}</span>
        </div>
      </div>

      <div className="hp-bar" aria-hidden="true">
        <div className="hp-fill" style={{ width: hpRate }} />
      </div>
    </section>
  );
}
