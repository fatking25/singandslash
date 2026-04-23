export default function PauseOverlay({ onResume, onBackToTitle }) {
  return (
    <div className="overlay-backdrop">
      <div className="upgrade-modal pause-modal">
        <div className="hero-kicker">일시정지</div>
        <h2 className="overlay-title">숨을 고를 시간입니다</h2>
        <p className="overlay-copy pause-copy">
          잠깐 멈춰도 괜찮습니다. 준비가 되면 다시 전장으로 돌아가거나, 타이틀
          화면으로 빠져나갈 수 있습니다.
        </p>

        <div className="button-row pause-actions">
          <button className="primary-button" type="button" onClick={onResume}>
            계속하기
          </button>
          <button
            className="secondary-button"
            type="button"
            onClick={onBackToTitle}
          >
            타이틀로
          </button>
        </div>
      </div>
    </div>
  );
}
