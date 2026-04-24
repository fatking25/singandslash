import { formatDuration } from '../game/format.js';

export default function Hud({ hud }) {
  const hpRate = `${(hud.hp / hud.maxHp) * 100}%`;

  let subtitle = '';

  if (hud.isPaused) {
    subtitle = '전투가 잠시 멈춰 있습니다';
  } else if (hud.isBossWave) {
    subtitle = '보스 웨이브 진행 중';
  }

  return (
    <section className="hud-panel hud-panel-compact">
      <div className="hud-topline">
        <div className="hud-identity hud-identity-compact">
          <span className="danger-tag">{hud.dangerLabel}</span>
          <div>
            <h2 className="hud-title">웨이브 {hud.wave}</h2>
            {subtitle ? <p className="hud-subtitle">{subtitle}</p> : null}
          </div>
        </div>
      </div>

      <div className="hud-stat-strip">
        <div className="hud-stat-pill">
          <span className="hud-pill-label">처치</span>
          <strong className="hud-pill-value">{hud.kills}</strong>
        </div>
        <div className="hud-stat-pill">
          <span className="hud-pill-label">생존</span>
          <strong className="hud-pill-value">{formatDuration(hud.elapsedMs)}</strong>
        </div>
      </div>

      <div className="hud-health-row">
        <div className="hud-health-copy">
          <span className="hud-health-label">생명력</span>
          <strong className="hud-health-value">
            {hud.hp} / {hud.maxHp}
          </strong>
        </div>
        <div className="hp-bar" aria-hidden="true">
          <div className="hp-fill" style={{ width: hpRate }} />
        </div>
      </div>
    </section>
  );
}
