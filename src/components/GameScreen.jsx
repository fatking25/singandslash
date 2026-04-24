import { useCallback, useEffect, useRef, useState } from 'react';
import GameCanvas from './GameCanvas.jsx';
import Hud from './Hud.jsx';
import PauseOverlay from './PauseOverlay.jsx';
import UpgradeOverlay from './UpgradeOverlay.jsx';

const initialHud = {
  hp: 5,
  maxHp: 5,
  kills: 0,
  killsToNextHeal: 10,
  elapsedMs: 0,
  wave: 1,
  enemiesRemaining: 0,
  projectilesInAir: 0,
  attackDamage: 2,
  attackSpeed: 2.38,
  attackRadius: 50,
  attackReach: 62,
  upgradeLevels: {
    attackSpeed: 0,
    attackDamage: 0,
    attackRadius: 0,
    attackReach: 0,
  },
  nextUpgradeWave: 2,
  nextBossWave: 5,
  bossName: null,
  bossHp: 0,
  bossMaxHp: 0,
  bossPatternText: null,
  isBossWave: false,
  isFinalBoss: false,
  isUpgradePaused: false,
  isPaused: false,
  enemyRoster: ['씨앗도깨비'],
  dangerLabel: '워밍업',
};

function FlowPanel({ hud }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section
      className={`support-panel support-panel-emphasis${isExpanded ? '' : ' support-panel-collapsed'}`}
    >
      <div className="support-header">
        <div className="support-heading-inline">
          <h3>스테이지 정보</h3>
        </div>
        <button
          className={`support-toggle-button${isExpanded ? ' is-open' : ''}`}
          type="button"
          onClick={() => setIsExpanded((value) => !value)}
          aria-expanded={isExpanded}
        >
          {isExpanded ? '접기' : '펼치기'}
        </button>
      </div>

      {isExpanded && (
        <>
          <p className="support-copy support-copy-compact">
            {hud.bossName
              ? `${hud.bossName}: ${hud.bossPatternText}`
              : '적을 흘리듯 피하면서 강화 타이밍까지 버티는 것이 핵심입니다.'}
          </p>

          <div className="support-metric-grid">
            <div className="support-metric-card">
              <span className="support-metric-label">현재 압박</span>
              <strong className="support-metric-value">
                적 {hud.enemiesRemaining}
              </strong>
              <span className="support-metric-meta">
                탄환 {hud.projectilesInAir}
              </span>
            </div>
            <div className="support-metric-card">
              <span className="support-metric-label">회복까지</span>
              <strong className="support-metric-value">
                {hud.killsToNextHeal}
              </strong>
              <span className="support-metric-meta">처치 필요</span>
            </div>
            <div className="support-metric-card">
              <span className="support-metric-label">다음 강화</span>
              <strong className="support-metric-value">
                {hud.nextUpgradeWave ? `${hud.nextUpgradeWave}W` : '완료'}
              </strong>
              <span className="support-metric-meta">진입 시 선택</span>
            </div>
            <div className="support-metric-card">
              <span className="support-metric-label">다음 보스</span>
              <strong className="support-metric-value">
                {hud.nextBossWave ? `${hud.nextBossWave}W` : '격파'}
              </strong>
              <span className="support-metric-meta">결전 준비</span>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function BuildPanel({ hud, includeEnemies = false }) {
  return (
    <section className="support-panel">
      <div className="support-header">
        <h3>빌드 요약</h3>
      </div>

      <div className="build-mini-grid build-mini-grid-side">
        <div className="build-mini-item">
          <span className="build-mini-label">공격속도</span>
          <strong className="build-mini-value">
            {hud.attackSpeed.toFixed(2)}회/초
          </strong>
          <span className="build-mini-meta">
            강화 +{hud.upgradeLevels.attackSpeed}
          </span>
        </div>
        <div className="build-mini-item">
          <span className="build-mini-label">공격력</span>
          <strong className="build-mini-value">{hud.attackDamage}</strong>
          <span className="build-mini-meta">
            강화 +{hud.upgradeLevels.attackDamage}
          </span>
        </div>
        <div className="build-mini-item">
          <span className="build-mini-label">공격범위</span>
          <strong className="build-mini-value">{hud.attackRadius}</strong>
          <span className="build-mini-meta">
            강화 +{hud.upgradeLevels.attackRadius}
          </span>
        </div>
        <div className="build-mini-item">
          <span className="build-mini-label">사정거리</span>
          <strong className="build-mini-value">{hud.attackReach}</strong>
          <span className="build-mini-meta">
            강화 +{hud.upgradeLevels.attackReach}
          </span>
        </div>
      </div>

      {includeEnemies && (
        <div className="mobile-build-roster">
          <div className="support-header support-header-subtle">
            <h3>등장 적</h3>
          </div>

          <div className="support-chip-row support-chip-column">
            {hud.enemyRoster.map((label) => (
              <span key={label} className="support-chip">
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      {!includeEnemies && (
        <div className="desktop-build-roster">
          <div className="support-header support-header-subtle">
            <h3>등장 적</h3>
          </div>

          <div className="support-chip-row support-chip-column">
            {hud.enemyRoster.map((label) => (
              <span key={label} className="support-chip">
                {label}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default function GameScreen({
  onGameOver,
  onHit,
  onBackToTitle,
  onBossWaveChange,
}) {
  const [hud, setHud] = useState(initialHud);
  const [upgradePrompt, setUpgradePrompt] = useState(null);
  const [mobilePanel, setMobilePanel] = useState('flow');
  const engineRef = useRef(null);

  const handleUpgradePrompt = useCallback((prompt) => {
    setUpgradePrompt(prompt);
  }, []);

  const handleEngineReady = useCallback((engine) => {
    engineRef.current = engine;
  }, []);

  const handleUpgradeSelect = useCallback((type) => {
    engineRef.current?.applyUpgrade(type);
    setUpgradePrompt(null);
  }, []);

  const handlePauseToggle = useCallback(() => {
    if (upgradePrompt) {
      return;
    }

    engineRef.current?.togglePause();
  }, [upgradePrompt]);

  const handleResume = useCallback(() => {
    engineRef.current?.resume();
  }, []);

  const handleGameOver = useCallback(
    (summary) => {
      setUpgradePrompt(null);
      onGameOver(summary);
    },
    [onGameOver],
  );

  const showPauseOverlay = hud.isPaused && !upgradePrompt;

  useEffect(() => {
    onBossWaveChange?.(hud.isBossWave);
  }, [hud.isBossWave, onBossWaveChange]);

  useEffect(() => {
    return () => {
      onBossWaveChange?.(false);
    };
  }, [onBossWaveChange]);

  return (
    <main className="play-card play-card-layout">
      <div className="play-stage-layout">
        <aside className="play-side-column play-side-column-desktop">
          <Hud
            hud={hud}
            onPauseToggle={handlePauseToggle}
            pauseDisabled={Boolean(upgradePrompt)}
          />
          <FlowPanel hud={hud} />
        </aside>

        <section className="play-center-column">
          <div className="mobile-hud">
            <Hud
              hud={hud}
              onPauseToggle={handlePauseToggle}
              pauseDisabled={Boolean(upgradePrompt)}
            />
          </div>

          <GameCanvas
            onStateChange={setHud}
            onGameOver={handleGameOver}
            onHit={onHit}
            onUpgradePrompt={handleUpgradePrompt}
            onReady={handleEngineReady}
          />

          <section className="mobile-info-dock">
            <div className="mobile-info-tabs">
              <button
                className={`mobile-info-tab${mobilePanel === 'flow' ? ' is-active' : ''}`}
                type="button"
                onClick={() => setMobilePanel('flow')}
              >
                스테이지
              </button>
              <button
                className={`mobile-info-tab${mobilePanel === 'build' ? ' is-active' : ''}`}
                type="button"
                onClick={() => setMobilePanel('build')}
              >
                빌드
              </button>
            </div>

            <div className="mobile-info-panel">
              {mobilePanel === 'flow' ? (
                <FlowPanel hud={hud} />
              ) : (
                <BuildPanel hud={hud} includeEnemies />
              )}
            </div>
          </section>
        </section>

        <aside className="play-side-column play-side-column-desktop">
          <BuildPanel hud={hud} />
        </aside>
      </div>

      {upgradePrompt && (
        <UpgradeOverlay prompt={upgradePrompt} onSelect={handleUpgradeSelect} />
      )}
      {showPauseOverlay && (
        <PauseOverlay
          onResume={handleResume}
          onBackToTitle={onBackToTitle}
        />
      )}
    </main>
  );
}
