import { formatDuration } from '../game/format.js';

export default function GameOverScreen({
  bestRecord,
  runSummary,
  wasNewBest,
  onRestart,
  onBackToTitle,
}) {
  const isVictory = runSummary.outcome === 'victory';

  return (
    <main className="screen-card">
      <div className="hero-kicker">{isVictory ? '최종 승리' : '런 종료'}</div>
      <h1 className="hero-title">
        {isVictory ? '멸망의 감귤황 격파' : '띵이가 쓰러졌습니다.'}
      </h1>
      <p className="death-copy">
        {isVictory
          ? '30웨이브 최종보스를 쓰러뜨리고 띵앤슬래시를 완주했습니다.'
          : '몰려드는 적과 패턴의 포위에 당해 이번 판 진행은 모두 사라졌습니다.'}
      </p>

      {wasNewBest && <div className="best-badge">새 최고 기록 달성</div>}

      <div className="info-grid">
        <section className="info-panel">
          <p className="panel-label">이번 판 기록</p>
          <p className="record-emphasis">
            웨이브 {runSummary.wave} / 처치 {runSummary.kills}
          </p>
          <ul className="record-lines">
            <li>생존 시간: {formatDuration(runSummary.survivedMs)}</li>
            <li>
              {isVictory
                ? '최종보스를 쓰러뜨려 승리로 종료했습니다.'
                : '이번 진행 데이터는 저장되지 않습니다.'}
            </li>
          </ul>
        </section>

        <section className="info-panel">
          <p className="panel-label">최고 기록</p>
          <p className="record-emphasis">
            {bestRecord
              ? `웨이브 ${bestRecord.wave} / 처치 ${bestRecord.kills}`
              : '기록 없음'}
          </p>
          <ul className="record-lines">
            <li>
              생존 시간:{' '}
              {bestRecord ? formatDuration(bestRecord.survivedMs) : '00:00'}
            </li>
            <li>최고 기록만 `localStorage`에 남습니다.</li>
          </ul>
        </section>
      </div>

      <div className="button-row">
        <button className="primary-button" type="button" onClick={onRestart}>
          다시하기
        </button>
        <button
          className="secondary-button"
          type="button"
          onClick={onBackToTitle}
        >
          타이틀로
        </button>
      </div>
    </main>
  );
}
