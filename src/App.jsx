import { useCallback, useEffect, useRef, useState } from 'react';
import AudioControls from './components/AudioControls.jsx';
import GameOverScreen from './components/GameOverScreen.jsx';
import GameScreen from './components/GameScreen.jsx';
import StartScreen from './components/StartScreen.jsx';
import {
  isBetterRecord,
  loadBestRecord,
  saveBestRecord,
} from './game/storage.js';

const emptyRun = {
  kills: 0,
  wave: 1,
  survivedMs: 0,
  outcome: 'defeat',
};

const normalBgmUrl = `${import.meta.env.BASE_URL}audio/bgm.mp3`;
const bossBgmUrl = `${import.meta.env.BASE_URL}audio/boss.mp3`;

function clampVolume(value) {
  return Math.min(1, Math.max(0, value));
}

export default function App() {
  const [screen, setScreen] = useState('title');
  const [bestRecord, setBestRecord] = useState(() => loadBestRecord());
  const [lastRun, setLastRun] = useState(emptyRun);
  const [wasNewBest, setWasNewBest] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);
  const [bgmVolume, setBgmVolume] = useState(0.34);
  const [sfxVolume, setSfxVolume] = useState(0.42);
  const bgmRef = useRef(null);
  const bgmTrackRef = useRef('normal');
  const bgmVolumeRef = useRef(bgmVolume);
  const hitPoolRef = useRef([]);
  const hitCursorRef = useRef(0);
  const sfxVolumeRef = useRef(sfxVolume);

  useEffect(() => {
    document.title = '띵앤슬래시';
  }, []);

  useEffect(() => {
    bgmVolumeRef.current = bgmVolume;
  }, [bgmVolume]);

  useEffect(() => {
    sfxVolumeRef.current = sfxVolume;
  }, [sfxVolume]);

  useEffect(() => {
    if (typeof Audio === 'undefined') {
      return undefined;
    }

    const bgm = new Audio(normalBgmUrl);
    bgm.loop = true;
    bgm.preload = 'auto';
    bgm.volume = bgmVolume;
    bgmRef.current = bgm;
    bgmTrackRef.current = 'normal';

    hitPoolRef.current = Array.from({ length: 6 }, () => {
      const audio = new Audio(`${import.meta.env.BASE_URL}audio/hit.ogg`);
      audio.preload = 'auto';
      audio.volume = sfxVolumeRef.current;
      return audio;
    });

    return () => {
      bgm.pause();
      bgm.currentTime = 0;
      bgmRef.current = null;
      hitPoolRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (bgmRef.current) {
      bgmRef.current.volume = bgmVolume;
    }
  }, [bgmVolume]);

  useEffect(() => {
    hitPoolRef.current.forEach((audio) => {
      audio.volume = sfxVolume;
    });
  }, [sfxVolume]);

  const setBgmTrack = useCallback((track) => {
    const bgm = bgmRef.current;

    if (!bgm || bgmTrackRef.current === track) {
      return;
    }

    const wasPaused = bgm.paused;
    const nextSource = track === 'boss' ? bossBgmUrl : normalBgmUrl;

    bgm.pause();
    bgm.src = nextSource;
    bgm.load();
    bgm.volume = bgmVolumeRef.current;
    bgmTrackRef.current = track;

    if (wasPaused) {
      return;
    }

    const playPromise = bgm.play();

    if (playPromise?.catch) {
      playPromise.catch(() => {
        // Ignore autoplay restrictions until the next user gesture.
      });
    }
  }, []);

  useEffect(() => {
    if (screen !== 'playing') {
      setBgmTrack('normal');
    }
  }, [screen, setBgmTrack]);

  const startBgmLoop = useCallback(() => {
    const bgm = bgmRef.current;

    if (!bgm) {
      return;
    }

    setBgmTrack('normal');

    if (!bgm.paused) {
      return;
    }

    const playPromise = bgm.play();

    if (playPromise?.catch) {
      playPromise.catch(() => {
        // Ignore autoplay restrictions until the next user gesture.
      });
    }
  }, [setBgmTrack]);

  const playHitSound = useCallback(() => {
    const pool = hitPoolRef.current;

    if (pool.length === 0 || sfxVolumeRef.current === 0) {
      return;
    }

    const audio = pool[hitCursorRef.current % pool.length];
    hitCursorRef.current += 1;
    audio.currentTime = 0;

    const playPromise = audio.play();

    if (playPromise?.catch) {
      playPromise.catch(() => {
        // Ignore rapid playback conflicts.
      });
    }
  }, []);

  const changeBgmVolume = useCallback((delta) => {
    setBgmVolume((value) => clampVolume(Number((value + delta).toFixed(2))));
  }, []);

  const changeSfxVolume = useCallback((delta) => {
    setSfxVolume((value) => clampVolume(Number((value + delta).toFixed(2))));
  }, []);

  const startRun = useCallback(() => {
    startBgmLoop();
    setWasNewBest(false);
    setSessionKey((value) => value + 1);
    setScreen('playing');
  }, [startBgmLoop]);

  const returnToTitle = useCallback(() => {
    setScreen('title');
  }, []);

  const handleBossWaveChange = useCallback(
    (isBossWave) => {
      setBgmTrack(isBossWave ? 'boss' : 'normal');
    },
    [setBgmTrack],
  );

  const handleGameOver = useCallback(
    (summary) => {
      setLastRun(summary);

      if (isBetterRecord(summary, bestRecord)) {
        saveBestRecord(summary);
        setBestRecord(summary);
        setWasNewBest(true);
      } else {
        setWasNewBest(false);
      }

      setScreen('gameover');
    },
    [bestRecord],
  );

  return (
    <div className="app-shell">
      <div className="app-background app-background-top" />
      <div className="app-background app-background-bottom" />

      <AudioControls
        bgmVolume={bgmVolume}
        sfxVolume={sfxVolume}
        onBgmDown={() => changeBgmVolume(-0.1)}
        onBgmUp={() => changeBgmVolume(0.1)}
        onSfxDown={() => changeSfxVolume(-0.1)}
        onSfxUp={() => changeSfxVolume(0.1)}
      />

      {screen === 'title' && (
        <StartScreen bestRecord={bestRecord} onStart={startRun} />
      )}

      {screen === 'playing' && (
        <GameScreen
          key={sessionKey}
          onGameOver={handleGameOver}
          onHit={playHitSound}
          onBackToTitle={returnToTitle}
          onBossWaveChange={handleBossWaveChange}
        />
      )}

      {screen === 'gameover' && (
        <GameOverScreen
          bestRecord={bestRecord}
          runSummary={lastRun}
          wasNewBest={wasNewBest}
          onRestart={startRun}
          onBackToTitle={returnToTitle}
        />
      )}
    </div>
  );
}
