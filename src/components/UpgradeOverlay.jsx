export default function UpgradeOverlay({ prompt, onSelect }) {
  return (
    <div className="overlay-backdrop">
      <div className="upgrade-modal">
        <div className="hero-kicker">{prompt.kicker ?? '강화 선택'}</div>
        <h2 className="overlay-title">
          {prompt.title ?? `${prompt.wave}웨이브 진입 전 파워업`}
        </h2>
        <p className="overlay-copy">
          {prompt.copy ??
            '2웨이브마다 한 번씩 찾아오는 랜덤 강화입니다. 하나를 골라 띵띵이의 공격을 강화하세요.'}
        </p>

        <div className="upgrade-grid">
          {prompt.choices.map((choice) => {
            const bonusLevels = choice.bonusLevels ?? 1;

            return (
              <button
                key={`${prompt.wave}-${choice.type}`}
                className="upgrade-card"
                type="button"
                onClick={() => onSelect(choice.type)}
              >
                <span className="upgrade-label">{choice.title}</span>
                <strong className="upgrade-value">강화 +{bonusLevels}</strong>
                <span className="upgrade-level">
                  현재 +{choice.level} {'->'} 적용 후 +{choice.level + bonusLevels}
                </span>
                <span className="upgrade-description">{choice.description}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
