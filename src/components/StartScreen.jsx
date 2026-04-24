import { formatDuration } from '../game/format.js';

function BestRecord({ bestRecord }) {
  if (!bestRecord) {
    return (
      <>
        <p className="record-emphasis">첫 기록을 남겨 보세요</p>
        <ul className="record-lines">
          <li>처음 도전에서 어디까지 버틸 수 있는지 확인해 보세요.</li>
          <li>죽으면 최고 기록만 남고 이번 판은 사라집니다.</li>
        </ul>
      </>
    );
  }

  return (
    <>
      <p className="record-emphasis">
        웨이브 {bestRecord.wave} / 처치 {bestRecord.kills}
      </p>
      <ul className="record-lines">
        <li>생존 시간: {formatDuration(bestRecord.survivedMs)}</li>
        <li>30웨이브 최종보스까지 돌파해 보세요.</li>
      </ul>
    </>
  );
}

export default function StartScreen({ bestRecord, onStart }) {
  return (
    <main className="screen-card">
      <div className="hero-kicker">하데스 팬게임 · 귀여운 하드코어 핵앤슬래시</div>
      <h1 className="hero-title">띵앤슬래시</h1>
      <p className="hero-subtitle">
        랜덤 강화를 고르고 몰려오는 적을 베어 넘기며, 30웨이브 끝에서 기다리는
        최종보스까지 돌파하세요.
      </p>

      <div className="info-grid">
        <section className="info-panel">
          <p className="panel-label">최고 기록</p>
          <BestRecord bestRecord={bestRecord} />
        </section>

        <section className="info-panel">
          <p className="panel-label">조작법</p>
          <p className="record-emphasis">강화로 버티고, 보스를 무너뜨리세요</p>
          <ul className="record-lines">
            <li>이동: WASD 또는 방향키</li>
            <li>공격: 자동공격</li>
            <li>모바일: 왼쪽 하단 스틱 드래그</li>
            <li>ESC: 일시정지 메뉴</li>
          </ul>
        </section>
      </div>

      <div className="button-row">
        <button className="primary-button" type="button" onClick={onStart}>
          시작하기
        </button>
      </div>
    </main>
  );
}
