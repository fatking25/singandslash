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

export default function GameScreen({
  onGameOver,
  onHit,
  onBackToTitle,
  onBossWaveChange,
}) {
  const [hud, setHud] = useState(initialHud);
  const [upgradePrompt, setUpgradePrompt] = useState(null);
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
    <main className="play-card">
      <div className="play-layout">
        <section className="play-main">
          <Hud
            hud={hud}
            onPauseToggle={handlePauseToggle}
            pauseDisabled={Boolean(upgradePrompt)}
          />
          <GameCanvas
            onStateChange={setHud}
            onGameOver={handleGameOver}
            onHit={onHit}
            onUpgradePrompt={handleUpgradePrompt}
            onReady={handleEngineReady}
          />
        </section>

        <aside className="side-panel">
          <section className="side-section side-section-emphasis">
            <div className="section-row">
              <h3>상태창</h3>
              <span className="danger-chip">{hud.dangerLabel}</span>
            </div>

            <p>
              {hud.bossName
                ? `${hud.bossName}: ${hud.bossPatternText}`
                : '웨이브가 오를수록 적이 더 빠르고 거칠게 몰려옵니다.'}
            </p>

            <div className="roster-wrap">
              {hud.enemyRoster.map((label) => (
                <span key={label} className="roster-chip">
                  {label}
                </span>
              ))}
            </div>

            <ul>
              <li>
                현재 압박: 적 {hud.enemiesRemaining}기 / 탄환 {hud.projectilesInAir}개
              </li>
              <li>다음 회복까지: {hud.killsToNextHeal} 처치</li>
              <li>
                다음 강화:{' '}
                {hud.nextUpgradeWave
                  ? `${hud.nextUpgradeWave}웨이브 진입 전`
                  : '모든 강화 획득'}
              </li>
              <li>
                다음 보스:{' '}
                {hud.nextBossWave
                  ? `${hud.nextBossWave}웨이브`
                  : '최종보스 돌파 완료'}
              </li>
            </ul>
          </section>

          <section className="side-section">
            <h3>자동공격 빌드</h3>

            <div className="side-stat-grid">
              <div className="side-stat">
                <span>공격속도</span>
                <strong>{hud.attackSpeed.toFixed(2)}회/초</strong>
              </div>
              <div className="side-stat">
                <span>공격력</span>
                <strong>{hud.attackDamage}</strong>
              </div>
              <div className="side-stat">
                <span>공격범위</span>
                <strong>{hud.attackRadius}</strong>
              </div>
              <div className="side-stat">
                <span>공격사정거리</span>
                <strong>{hud.attackReach}</strong>
              </div>
            </div>

            <div className="upgrade-levels">
              <span>공속 +{hud.upgradeLevels.attackSpeed}</span>
              <span>공격력 +{hud.upgradeLevels.attackDamage}</span>
              <span>범위 +{hud.upgradeLevels.attackRadius}</span>
              <span>사거리 +{hud.upgradeLevels.attackReach}</span>
            </div>
          </section>
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
