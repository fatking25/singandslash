import {
  ATTACK_BASE_COOLDOWN,
  ATTACK_BASE_DAMAGE,
  ATTACK_BASE_RADIUS,
  ATTACK_BASE_REACH,
  ATTACK_DURATION,
  BOSS_WAVES,
  ENEMY_BASE_SPEED,
  ENEMY_CONTACT_DAMAGE,
  ENEMY_RADIUS,
  FINAL_WAVE,
  GAME_HEIGHT,
  GAME_WIDTH,
  PLAYER_INVULNERABLE_TIME,
  PLAYER_MAX_HP,
  PLAYER_RADIUS,
  PLAYER_SPEED,
  UPGRADE_WAVES,
} from './constants.js';

const UPGRADE_DEFS = {
  attackSpeed: {
    type: 'attackSpeed',
    title: '공격속도',
    description: '자동공격 주기가 18% 빨라집니다.',
    apply(engine, bonusLevels = 1) {
      for (let index = 0; index < bonusLevels; index += 1) {
        engine.attack.cooldown = Math.max(0.16, engine.attack.cooldown * 0.76);
      }
    },
  },
  attackDamage: {
    type: 'attackDamage',
    title: '공격력',
    description: '한 번에 주는 피해가 1 증가합니다.',
    apply(engine, bonusLevels = 1) {
      engine.attack.damage += bonusLevels;
    },
  },
  attackRadius: {
    type: 'attackRadius',
    title: '공격범위',
    description: '베기 판정 반경이 12 증가합니다.',
    apply(engine, bonusLevels = 1) {
      engine.attack.radius += 18 * bonusLevels;
    },
  },
  attackReach: {
    type: 'attackReach',
    title: '공격사정거리',
    description: '공격 거리와 자동 추적 거리가 더 길어집니다.',
    apply(engine, bonusLevels = 1) {
      engine.attack.reach += 16 * bonusLevels;
      engine.attack.autoRange += 24 * bonusLevels;
    },
  },
};

const INSTANT_KILL_WARNING_TEXT =
  '\uac15\ub825\ud55c \uacf5\uaca9\uc740 \ub9de\uc73c\uba74 \ud55c\ubc88\uc5d0 \ud130\uc9c8\uac83\uac19\uc544.';
const HEALTH_PICKUP_NOTICE_TEXT = '\uc0dd\uba85\ub825 \ud68c\ubcf5 +1';
const HEALTH_PICKUP_DROP_CHANCE = 0.09;
const HEALTH_PICKUP_RADIUS = 11;
const HEALTH_PICKUP_LIFETIME = 9;
const HEALTH_PICKUP_HEAL_AMOUNT = 1;

function getUpgradeDescription(type, bonusLevels) {
  if (type === 'attackSpeed') {
    return bonusLevels > 1
      ? '자동공격 주기가 두 단계 연속으로 빨라집니다.'
      : '자동공격 주기가 24% 빨라집니다.';
  }

  if (type === 'attackDamage') {
    return `한 번에 주는 피해가 ${bonusLevels} 증가합니다.`;
  }

  if (type === 'attackRadius') {
    return `베기 반경이 ${18 * bonusLevels} 증가합니다.`;
  }

  return `공격 거리와 자동 추적 범위가 ${bonusLevels}단계 늘어납니다.`;
}

function getUpgradePromptMeta(nextWave, kind, bonusLevels) {
  if (kind === 'boss') {
    return {
      kicker: '보스 전리품',
      title: `${nextWave}웨이브 진입 전 고급 강화`,
      copy: `보스를 쓰러뜨린 보상입니다. 이번 선택은 강화 +${bonusLevels}가 한 번에 적용됩니다.`,
      noticeText: '보스 전리품',
    };
  }

  return {
    kicker: '강화 선택',
    title: `${nextWave}웨이브 진입 전 파워업`,
    copy: '2웨이브마다 한 번씩 찾아오는 랜덤 강화입니다. 세 가지 중 하나를 골라 자동공격 빌드를 키우세요.',
    noticeText: '강화 선택',
  };
}

const ENEMY_TYPES = {
  chaser: {
    type: 'chaser',
    label: '씨앗도깨비',
    tint: '#8857b2',
    accent: '#e4b8ff',
    core: '#f7ddb3',
    radius: ENEMY_RADIUS,
    baseHp: 1,
    hpScale: 0.22,
    baseSpeed: ENEMY_BASE_SPEED + 14,
    speedScale: 4.3,
    contactDamage: ENEMY_CONTACT_DAMAGE,
  },
  dasher: {
    type: 'dasher',
    label: '돌진 껍질이',
    tint: '#cc5548',
    accent: '#ffba6b',
    core: '#fff3d9',
    radius: ENEMY_RADIUS - 1,
    baseHp: 2,
    hpScale: 0.26,
    baseSpeed: ENEMY_BASE_SPEED + 26,
    speedScale: 5.2,
    contactDamage: ENEMY_CONTACT_DAMAGE,
  },
  spitter: {
    type: 'spitter',
    label: '씨앗포자',
    tint: '#4f9a57',
    accent: '#b7f07a',
    core: '#efffda',
    radius: ENEMY_RADIUS + 1,
    baseHp: 2,
    hpScale: 0.3,
    baseSpeed: ENEMY_BASE_SPEED - 4,
    speedScale: 3.1,
    contactDamage: ENEMY_CONTACT_DAMAGE,
  },
  brute: {
    type: 'brute',
    label: '껍질골렘',
    tint: '#b8742d',
    accent: '#ffd26a',
    core: '#fff0c9',
    radius: ENEMY_RADIUS + 8,
    baseHp: 4,
    hpScale: 0.38,
    baseSpeed: ENEMY_BASE_SPEED - 10,
    speedScale: 2.5,
    contactDamage: ENEMY_CONTACT_DAMAGE + 1,
  },
  hexer: {
    type: 'hexer',
    label: '붉은술사',
    tint: '#7b365c',
    accent: '#ff7a8f',
    core: '#ffe3ea',
    radius: ENEMY_RADIUS + 2,
    baseHp: 3,
    hpScale: 0.34,
    baseSpeed: ENEMY_BASE_SPEED - 2,
    speedScale: 3.6,
    contactDamage: ENEMY_CONTACT_DAMAGE,
  },
};

const BOSS_PROFILES = {
  5: {
    name: '왕씨앗도깨비',
    shell: '#6e44ba',
    flesh: '#bf8eff',
    accent: '#ffd568',
    aura: 'rgba(165, 100, 255, 0.22)',
    radius: 40,
    hp: 58,
    speed: 60,
    contactDamage: 1,
    patternText: '돌진과 소환으로 밀어붙입니다.',
  },
  10: {
    name: '껍질장군',
    shell: '#2f8d6e',
    flesh: '#f7bd4a',
    accent: '#fff0af',
    aura: 'rgba(69, 214, 172, 0.22)',
    radius: 44,
    hp: 92,
    speed: 46,
    contactDamage: 1,
    patternText: '연속 사격과 원형 탄막으로 공간을 잠급니다.',
  },
  15: {
    name: '감귤 망령',
    shell: '#43adc0',
    flesh: '#d8ffff',
    accent: '#7ce4ff',
    aura: 'rgba(92, 224, 255, 0.24)',
    radius: 42,
    hp: 122,
    speed: 64,
    contactDamage: 2,
    patternText: '순간이동 후 부채꼴 탄막을 펼칩니다.',
  },
  20: {
    name: '흑귤 군주',
    shell: '#24222d',
    flesh: '#ff8b2a',
    accent: '#ff5243',
    aura: 'rgba(255, 109, 74, 0.28)',
    radius: 52,
    hp: 178,
    speed: 62,
    contactDamage: 2,
    patternText: '돌진, 소환, 나선 탄막을 모두 사용합니다.',
  },
  25: {
    name: '적안 군단장',
    shell: '#5d1d28',
    flesh: '#ffb17a',
    accent: '#ff4a57',
    aura: 'rgba(255, 73, 87, 0.24)',
    radius: 56,
    hp: 222,
    speed: 66,
    contactDamage: 2,
    patternText: '붉은 즉사 탄막과 소환을 섞어 압박합니다.',
  },
  30: {
    name: '멸망의 감귤황',
    shell: '#15141d',
    flesh: '#ffb24a',
    accent: '#ff2d3d',
    aura: 'rgba(255, 61, 61, 0.3)',
    radius: 60,
    hp: 280,
    speed: 72,
    contactDamage: 3,
    patternText: '전 패턴과 붉은 즉사 탄막을 모두 사용하는 최종보스입니다.',
  },
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function distanceSquared(ax, ay, bx, by) {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

function pointToSegmentDistanceSquared(px, py, ax, ay, bx, by) {
  const abx = bx - ax;
  const aby = by - ay;
  const abLengthSquared = abx * abx + aby * aby;

  if (abLengthSquared === 0) {
    return distanceSquared(px, py, ax, ay);
  }

  const apx = px - ax;
  const apy = py - ay;
  const projection = clamp(
    (apx * abx + apy * aby) / abLengthSquared,
    0,
    1,
  );
  const closestX = ax + abx * projection;
  const closestY = ay + aby * projection;

  return distanceSquared(px, py, closestX, closestY);
}

function normalize(x, y) {
  const length = Math.hypot(x, y) || 1;
  return { x: x / length, y: y / length };
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.lineTo(x + width - safeRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  ctx.lineTo(x + width, y + height - safeRadius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  ctx.lineTo(x + safeRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  ctx.lineTo(x, y + safeRadius);
  ctx.quadraticCurveTo(x, y, x + safeRadius, y);
  ctx.closePath();
}

function angleToVector(angle) {
  return {
    x: Math.cos(angle),
    y: Math.sin(angle),
  };
}

function shuffle(items) {
  const copied = [...items];

  for (let index = copied.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copied[index], copied[swapIndex]] = [copied[swapIndex], copied[index]];
  }

  return copied;
}

function weightedPick(entries) {
  const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const entry of entries) {
    roll -= entry.weight;

    if (roll <= 0) {
      return entry.type;
    }
  }

  return entries.at(-1).type;
}

function isBossWave(wave) {
  return BOSS_WAVES.includes(wave);
}

function isUpgradeWave(wave) {
  return UPGRADE_WAVES.includes(wave);
}

function getSpawnPoint(margin = 40) {
  const side = Math.floor(Math.random() * 4);

  if (side === 0) {
    return {
      x: -margin,
      y: 40 + Math.random() * (GAME_HEIGHT - 80),
    };
  }

  if (side === 1) {
    return {
      x: GAME_WIDTH + margin,
      y: 40 + Math.random() * (GAME_HEIGHT - 80),
    };
  }

  if (side === 2) {
    return {
      x: 40 + Math.random() * (GAME_WIDTH - 80),
      y: -margin,
    };
  }

  return {
    x: 40 + Math.random() * (GAME_WIDTH - 80),
    y: GAME_HEIGHT + margin,
  };
}

function getEnemyPool(wave) {
  const pool = [
    {
      type: 'chaser',
      weight: Math.max(4, 10 - Math.floor(wave / 4)),
    },
  ];

  if (wave >= 4) {
    pool.push({
      type: 'dasher',
      weight: 2 + Math.floor(wave / 4),
    });
  }

  if (wave >= 7) {
    pool.push({
      type: 'spitter',
      weight: 2 + Math.floor(wave / 5),
    });
  }

  if (wave >= 11) {
    pool.push({
      type: 'brute',
      weight: 1 + Math.floor(wave / 6),
    });
  }

  if (wave >= 18) {
    pool.push({
      type: 'hexer',
      weight: 1 + Math.floor(wave / 7),
    });
  }

  return pool;
}

function getEnemyRoster(wave) {
  const roster = [ENEMY_TYPES.chaser.label];

  if (wave >= 4) {
    roster.push(ENEMY_TYPES.dasher.label);
  }

  if (wave >= 7) {
    roster.push(ENEMY_TYPES.spitter.label);
  }

  if (wave >= 11) {
    roster.push(ENEMY_TYPES.brute.label);
  }

  if (wave >= 18) {
    roster.push(ENEMY_TYPES.hexer.label);
  }

  return roster;
}

function getDangerLabel(wave, waveType) {
  if (waveType === 'boss') {
    return wave === FINAL_WAVE ? '최종 결전' : '보스 경보';
  }

  if (wave < 4) {
    return '워밍업';
  }

  if (wave < 8) {
    return '긴장';
  }

  if (wave < 12) {
    return '위험';
  }

  if (wave < 16) {
    return '대혼전';
  }

  return '지옥';
}

function getWaveEnemyCount(wave) {
  return 8 + wave * 3 + Math.floor(wave * 0.8);
}

function getConcurrentSpawnCap(wave) {
  return Math.min(6 + Math.floor(wave / 2), 18);
}

function getSpawnInterval(wave) {
  return Math.max(0.06, 0.46 - wave * 0.016);
}

function getKillsToNextHeal(kills) {
  const remainder = kills % 10;
  return remainder === 0 ? 10 : 10 - remainder;
}

function createEnemy(type, wave, spawnPoint, overrides = {}) {
  const profile = ENEMY_TYPES[type];
  const radiusVariance = type === 'brute' ? 3 : 2;
  const radius = profile.radius + Math.random() * radiusVariance;
  const hp = Math.max(
    profile.baseHp,
    Math.round(profile.baseHp + (wave - 1) * profile.hpScale),
  );

  return {
    id: 0,
    type,
    label: profile.label,
    x: spawnPoint.x,
    y: spawnPoint.y,
    radius,
    hp,
    maxHp: hp,
    speed: profile.baseSpeed + wave * profile.speedScale + Math.random() * 8,
    hurtFlashTimer: 0,
    spawnFlashTimer: 0.28,
    wobbleSeed: Math.random() * Math.PI * 2,
    lastSwingHitId: -1,
    contactDamage: profile.contactDamage,
    isBoss: false,
    tint: profile.tint,
    accent: profile.accent,
    core: profile.core,
    dashCooldown: 1.3 + Math.random() * 1.4,
    dashWindup: 0,
    dashTimer: 0,
    dashVx: 0,
    dashVy: 0,
    shootCooldown: 0.9 + Math.random() * 0.9,
    burstCooldown: 1.8 + Math.random() * 1.2,
    castCooldown: 1.5 + Math.random() * 1.2,
    strafeDir: Math.random() < 0.5 ? -1 : 1,
    ...overrides,
  };
}

function createBoss(wave, spawnPoint) {
  const profile = BOSS_PROFILES[wave];

  return {
    id: 0,
    type: 'boss',
    wave,
    name: profile.name,
    label: profile.name,
    x: spawnPoint.x,
    y: spawnPoint.y,
    radius: profile.radius,
    hp: profile.hp,
    maxHp: profile.hp,
    speed: profile.speed,
    hurtFlashTimer: 0,
    spawnFlashTimer: 0.45,
    wobbleSeed: Math.random() * Math.PI * 2,
    lastSwingHitId: -1,
    contactDamage: profile.contactDamage,
    isBoss: true,
    isFinalBoss: wave === FINAL_WAVE,
    tint: profile.shell,
    accent: profile.accent,
    core: profile.flesh,
    aura: profile.aura,
    patternText: profile.patternText,
    dashCooldown: 1.6,
    dashWindup: 0,
    dashTimer: 0,
    dashVx: 0,
    dashVy: 0,
    shootCooldown: wave === 10 ? 1.55 : 1.1,
    ringCooldown: wave === 10 ? 3.2 : 2.5,
    summonCooldown: 4.8,
    teleportCooldown: wave === 15 ? 4.4 : 2.6,
    spiralCooldown: 3.8,
    doomCooldown: wave >= 25 ? 4.8 : 0,
    spiralTick: 0,
    spiralShotsRemaining: 0,
    spinAngle: Math.random() * Math.PI * 2,
    strafeDir: Math.random() < 0.5 ? -1 : 1,
  };
}

export class GameEngine {
  constructor({ canvas, onStateChange, onGameOver, onHit, onUpgradePrompt }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;
    this.onHit = onHit;
    this.onUpgradePrompt = onUpgradePrompt;

    this.player = {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT / 2,
      radius: PLAYER_RADIUS,
      speed: PLAYER_SPEED,
      hp: PLAYER_MAX_HP,
      maxHp: PLAYER_MAX_HP,
      facingX: 1,
      facingY: 0,
      invulnerableTimer: 0,
      hitFlashTimer: 0,
    };

    this.attack = {
      cooldown: ATTACK_BASE_COOLDOWN,
      damage: ATTACK_BASE_DAMAGE,
      radius: ATTACK_BASE_RADIUS,
      reach: ATTACK_BASE_REACH,
      autoRange: ATTACK_BASE_REACH + 86,
    };

    this.upgradeLevels = {
      attackSpeed: 0,
      attackDamage: 0,
      attackRadius: 0,
      attackReach: 0,
    };

    this.keys = new Set();
    this.moveInput = {
      x: 0,
      y: 0,
    };
    this.enemies = [];
    this.projectiles = [];
    this.pickups = [];
    this.kills = 0;
    this.healMilestones = 0;
    this.wave = 1;
    this.pendingWave = null;
    this.pendingSpawns = 0;
    this.concurrentSpawnCap = 5;
    this.clearCountdown = 0;
    this.spawnTimer = 0;
    this.waveTextTimer = 0;
    this.noticeText = '';
    this.noticeTimer = 0;
    this.elapsedMs = 0;
    this.isOver = false;
    this.isPaused = false;
    this.isUpgradePaused = false;
    this.rafId = 0;
    this.lastTick = 0;
    this.enemyId = 0;
    this.uiSyncTimer = 0;
    this.attackTimer = 0;
    this.attackCooldownTimer = 0;
    this.swingId = 0;
    this.waveType = 'normal';
    this.claimedUpgradeWaves = new Set();
    this.clearMinionsOnBossKill = false;
    this.pendingUpgradeBonusLevels = 1;
    this.pendingUpgradeKind = 'wave';
    this.hasShownInstantKillWarning = false;

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.frame = this.frame.bind(this);
  }

  start() {
    this.beginWave(1);
    this.emitState(true);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    this.lastTick = performance.now();
    this.rafId = window.requestAnimationFrame(this.frame);
  }

  stop() {
    window.cancelAnimationFrame(this.rafId);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.clearMoveInput();
  }

  handleKeyDown(event) {
    const key = event.key.toLowerCase();

    if (event.ctrlKey && key === 'k') {
      event.preventDefault();

      if (!this.isOver && !this.isUpgradePaused) {
        this.clearAllEnemiesCheat();
      }

      return;
    }

    if (
      ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'escape'].includes(
        key,
      )
    ) {
      event.preventDefault();
    }

    if (key === 'escape') {
      this.togglePause();
      return;
    }

    if (this.isPaused || this.isUpgradePaused || this.isOver) {
      return;
    }

    this.keys.add(key);
  }

  handleKeyUp(event) {
    const key = event.key.toLowerCase();

    if (
      ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'escape'].includes(
        key,
      )
    ) {
      event.preventDefault();
    }

    if (key === 'escape') {
      return;
    }

    this.keys.delete(key);
  }

  setMoveInput(x, y) {
    this.moveInput.x = clamp(x, -1, 1);
    this.moveInput.y = clamp(y, -1, 1);
  }

  clearMoveInput() {
    this.setMoveInput(0, 0);
  }

  clearAllEnemiesCheat() {
    const activeEnemies = [...this.enemies];
    const activeBoss = activeEnemies.find((enemy) => enemy.isBoss) ?? null;

    this.pendingSpawns = 0;
    this.projectiles = [];
    this.enemies = [];

    for (const enemy of activeEnemies) {
      if (enemy.isBoss || enemy === activeBoss) {
        continue;
      }

      this.handleEnemyDefeated(enemy);

      if (this.isOver) {
        return;
      }
    }

    if (activeBoss) {
      this.handleEnemyDefeated(activeBoss);

      if (!this.isOver) {
        this.noticeText = '치트: 보스 격파';
        this.noticeTimer = 1.2;
        this.emitState(true);
      }

      return;
    }

    this.noticeText = '치트: 전장 정리';
    this.noticeTimer = 1.2;
    this.emitState(true);
  }

  frame(timestamp) {
    const deltaSeconds = Math.min((timestamp - this.lastTick) / 1000, 0.033);
    this.lastTick = timestamp;

    this.update(deltaSeconds);
    this.render();

    if (!this.isOver) {
      this.rafId = window.requestAnimationFrame(this.frame);
    }
  }

  beginWave(nextWave) {
    this.wave = nextWave;
    this.pendingWave = null;
    this.clearCountdown = 0;
    this.waveType = isBossWave(nextWave) ? 'boss' : 'normal';
    this.waveTextTimer = 1.6;
    this.noticeText = '';
    this.noticeTimer = 0;
    this.hasShownInstantKillWarning = false;

    if (this.waveType === 'boss') {
      this.pendingSpawns = 1;
      this.concurrentSpawnCap = 2;
      this.spawnTimer = 0.75;
      return;
    }

    this.pendingSpawns = getWaveEnemyCount(nextWave);
    this.concurrentSpawnCap = getConcurrentSpawnCap(nextWave);
    this.spawnTimer = nextWave === 1 ? 0.25 : 0.52;
  }

  update(deltaSeconds) {
    if (this.isOver) {
      return;
    }

    if (this.isPaused) {
      return;
    }

    this.attackCooldownTimer = Math.max(
      0,
      this.attackCooldownTimer - deltaSeconds,
    );
    this.attackTimer = Math.max(0, this.attackTimer - deltaSeconds);
    this.player.invulnerableTimer = Math.max(
      0,
      this.player.invulnerableTimer - deltaSeconds,
    );
    this.player.hitFlashTimer = Math.max(
      0,
      this.player.hitFlashTimer - deltaSeconds,
    );
    this.waveTextTimer = Math.max(0, this.waveTextTimer - deltaSeconds);
    this.noticeTimer = Math.max(0, this.noticeTimer - deltaSeconds);

    if (this.noticeTimer === 0) {
      this.noticeText = '';
    }

    if (this.isUpgradePaused) {
      this.emitStateOnTimer(deltaSeconds);
      return;
    }

    this.elapsedMs += deltaSeconds * 1000;
    this.updatePlayer(deltaSeconds);
    this.updateSpawns(deltaSeconds);
    this.updateEnemies(deltaSeconds);
    this.updateProjectiles(deltaSeconds);
    this.updatePickups(deltaSeconds);
    this.updateAutoAttack();
    this.resolveCombat();

    if (
      !this.isOver &&
      this.pendingSpawns === 0 &&
      this.enemies.length === 0 &&
      this.projectiles.length === 0 &&
      this.clearCountdown <= 0
    ) {
      this.clearCountdown = this.waveType === 'boss' ? 1.4 : 1.0;
    }

    if (this.clearCountdown > 0) {
      this.clearCountdown = Math.max(0, this.clearCountdown - deltaSeconds);

      if (this.clearCountdown === 0 && !this.isOver) {
        this.handleWaveClear();
      }
    }

    this.emitStateOnTimer(deltaSeconds);
  }

  emitStateOnTimer(deltaSeconds) {
    this.uiSyncTimer += deltaSeconds;

    if (this.uiSyncTimer >= 0.08) {
      this.uiSyncTimer = 0;
      this.emitState();
    }
  }

  updatePlayer(deltaSeconds) {
    let moveX = 0;
    let moveY = 0;

    if (this.keys.has('w') || this.keys.has('arrowup')) {
      moveY -= 1;
    }

    if (this.keys.has('s') || this.keys.has('arrowdown')) {
      moveY += 1;
    }

    if (this.keys.has('a') || this.keys.has('arrowleft')) {
      moveX -= 1;
    }

    if (this.keys.has('d') || this.keys.has('arrowright')) {
      moveX += 1;
    }

    moveX += this.moveInput.x;
    moveY += this.moveInput.y;

    if (moveX !== 0 || moveY !== 0) {
      const direction = normalize(moveX, moveY);
      this.player.facingX = direction.x;
      this.player.facingY = direction.y;
      this.player.x += direction.x * this.player.speed * deltaSeconds;
      this.player.y += direction.y * this.player.speed * deltaSeconds;
    }

    this.player.x = clamp(
      this.player.x,
      this.player.radius + 12,
      GAME_WIDTH - this.player.radius - 12,
    );
    this.player.y = clamp(
      this.player.y,
      this.player.radius + 16,
      GAME_HEIGHT - this.player.radius - 16,
    );
  }

  updateSpawns(deltaSeconds) {
    if (this.pendingSpawns <= 0) {
      return;
    }

    this.spawnTimer -= deltaSeconds;

    if (this.spawnTimer > 0) {
      return;
    }

    if (this.enemies.length >= this.concurrentSpawnCap) {
      this.spawnTimer = 0.12;
      return;
    }

    if (this.waveType === 'boss') {
      this.spawnBoss();
      this.pendingSpawns = 0;
      return;
    }

    this.spawnEnemy();
    this.pendingSpawns -= 1;
    this.spawnTimer = getSpawnInterval(this.wave);
  }

  spawnEnemy(type = null, spawnPoint = getSpawnPoint(), wave = this.wave, overrides = {}) {
    const enemyType = type ?? weightedPick(getEnemyPool(wave));
    const enemy = createEnemy(enemyType, wave, spawnPoint, overrides);

    this.enemyId += 1;
    enemy.id = this.enemyId;
    this.enemies.push(enemy);
  }

  spawnBoss() {
    const boss = createBoss(this.wave, getSpawnPoint(72));

    this.enemyId += 1;
    boss.id = this.enemyId;
    this.enemies.push(boss);
  }

  spawnSummonRing(origin, types) {
    types.forEach((type, index) => {
      const angle = ((Math.PI * 2) / types.length) * index + Math.random() * 0.45;
      const distance = 56 + Math.random() * 18;
      const point = {
        x: origin.x + Math.cos(angle) * distance,
        y: origin.y + Math.sin(angle) * distance,
      };

      this.spawnEnemy(type, point, Math.max(1, this.wave - 1), {
        spawnFlashTimer: 0.18,
      });
    });
  }

  updateEnemies(deltaSeconds) {
    for (const enemy of this.enemies) {
      enemy.hurtFlashTimer = Math.max(0, enemy.hurtFlashTimer - deltaSeconds);
      enemy.spawnFlashTimer = Math.max(0, enemy.spawnFlashTimer - deltaSeconds);
      enemy.wobbleSeed += deltaSeconds * (enemy.isBoss ? 2.4 : 4.1);

      if (enemy.isBoss) {
        this.updateBoss(enemy, deltaSeconds);
        continue;
      }

      if (enemy.type === 'chaser') {
        this.updateChaser(enemy, deltaSeconds);
      } else if (enemy.type === 'dasher') {
        this.updateDasher(enemy, deltaSeconds);
      } else if (enemy.type === 'spitter') {
        this.updateSpitter(enemy, deltaSeconds);
      } else if (enemy.type === 'brute') {
        this.updateBrute(enemy, deltaSeconds);
      } else if (enemy.type === 'hexer') {
        this.updateHexer(enemy, deltaSeconds);
      }
    }
  }

  moveEntity(entity, directionX, directionY, speed, deltaSeconds) {
    entity.x += directionX * speed * deltaSeconds;
    entity.y += directionY * speed * deltaSeconds;
  }

  chasePlayer(entity, deltaSeconds, speedMultiplier = 1) {
    const direction = normalize(
      this.player.x - entity.x,
      this.player.y - entity.y,
    );

    this.moveEntity(
      entity,
      direction.x,
      direction.y,
      entity.speed * speedMultiplier,
      deltaSeconds,
    );
  }

  updateChaser(enemy, deltaSeconds) {
    this.chasePlayer(enemy, deltaSeconds, 1);
  }

  updateDasher(enemy, deltaSeconds) {
    const distanceToPlayer = Math.sqrt(
      distanceSquared(enemy.x, enemy.y, this.player.x, this.player.y),
    );

    if (enemy.dashWindup > 0) {
      enemy.dashWindup = Math.max(0, enemy.dashWindup - deltaSeconds);

      if (enemy.dashWindup === 0) {
        const direction = normalize(
          this.player.x - enemy.x,
          this.player.y - enemy.y,
        );
        enemy.dashVx = direction.x * (250 + this.wave * 5);
        enemy.dashVy = direction.y * (250 + this.wave * 5);
        enemy.dashTimer = 0.44;
      }

      return;
    }

    if (enemy.dashTimer > 0) {
      enemy.dashTimer = Math.max(0, enemy.dashTimer - deltaSeconds);
      enemy.x += enemy.dashVx * deltaSeconds;
      enemy.y += enemy.dashVy * deltaSeconds;
      return;
    }

    enemy.dashCooldown = Math.max(0, enemy.dashCooldown - deltaSeconds);
    this.chasePlayer(enemy, deltaSeconds, 0.86);

    if (enemy.dashCooldown === 0 && distanceToPlayer < 320) {
      enemy.dashWindup = 0.28;
      enemy.dashCooldown = Math.max(1.2, 2.5 - this.wave * 0.035);
    }
  }

  updateSpitter(enemy, deltaSeconds) {
    const toPlayerX = this.player.x - enemy.x;
    const toPlayerY = this.player.y - enemy.y;
    const distanceToPlayer = Math.sqrt(toPlayerX * toPlayerX + toPlayerY * toPlayerY);
    const towardPlayer = normalize(toPlayerX, toPlayerY);
    const sideStep = {
      x: -towardPlayer.y * enemy.strafeDir,
      y: towardPlayer.x * enemy.strafeDir,
    };

    let moveX = sideStep.x * 0.55;
    let moveY = sideStep.y * 0.55;

    if (distanceToPlayer > 250) {
      moveX += towardPlayer.x;
      moveY += towardPlayer.y;
    } else if (distanceToPlayer < 150) {
      moveX -= towardPlayer.x * 1.25;
      moveY -= towardPlayer.y * 1.25;
    }

    const movement = normalize(moveX, moveY);
    this.moveEntity(enemy, movement.x, movement.y, enemy.speed, deltaSeconds);

    enemy.shootCooldown = Math.max(0, enemy.shootCooldown - deltaSeconds);

    if (enemy.shootCooldown === 0 && distanceToPlayer < 380) {
      const projectileCount = this.wave >= 16 ? 3 : this.wave >= 10 ? 2 : 1;

      this.spawnAimedVolley(enemy.x, enemy.y, this.player.x, this.player.y, {
        count: projectileCount,
        spread: projectileCount === 1 ? 0 : 0.32,
        speed: 128,
        damage: 1,
        radius: 6,
        life: 2.4,
        color: enemy.accent,
        glow: enemy.tint,
      });

      enemy.shootCooldown = 1.55;
    }
  }

  updateBrute(enemy, deltaSeconds) {
    this.chasePlayer(enemy, deltaSeconds, 0.68);
    enemy.burstCooldown = Math.max(0, enemy.burstCooldown - deltaSeconds);

    if (
      enemy.burstCooldown === 0 &&
      distanceSquared(enemy.x, enemy.y, this.player.x, this.player.y) < 190 * 190
    ) {
      this.spawnRadialBurst(enemy.x, enemy.y, {
        count: this.wave >= 15 ? 10 : 8,
        speed: 82,
        damage: 2,
        radius: 6,
        life: 2,
        color: enemy.accent,
        glow: enemy.tint,
      });

      enemy.burstCooldown = 2.7;
      enemy.hurtFlashTimer = Math.max(enemy.hurtFlashTimer, 0.15);
    }
  }

  updateHexer(enemy, deltaSeconds) {
    const toPlayerX = this.player.x - enemy.x;
    const toPlayerY = this.player.y - enemy.y;
    const distanceToPlayer = Math.sqrt(toPlayerX * toPlayerX + toPlayerY * toPlayerY);
    const towardPlayer = normalize(toPlayerX, toPlayerY);
    const orbit = {
      x: -towardPlayer.y * enemy.strafeDir,
      y: towardPlayer.x * enemy.strafeDir,
    };

    let moveX = orbit.x * 0.8;
    let moveY = orbit.y * 0.8;

    if (distanceToPlayer > 290) {
      moveX += towardPlayer.x * 0.75;
      moveY += towardPlayer.y * 0.75;
    } else if (distanceToPlayer < 175) {
      moveX -= towardPlayer.x * 1.18;
      moveY -= towardPlayer.y * 1.18;
    }

    const movement = normalize(moveX, moveY);
    this.moveEntity(enemy, movement.x, movement.y, enemy.speed, deltaSeconds);

    enemy.castCooldown = Math.max(0, enemy.castCooldown - deltaSeconds);

    if (enemy.castCooldown === 0 && distanceToPlayer < 400) {
      this.spawnRadialBurst(enemy.x, enemy.y, {
        count: 4,
        speed: 96,
        damage: 1,
        radius: 6,
        life: 2.6,
        color: enemy.accent,
        glow: enemy.tint,
        startAngle: Math.atan2(toPlayerY, toPlayerX),
      });

      enemy.castCooldown = 2.1;
      enemy.hurtFlashTimer = Math.max(enemy.hurtFlashTimer, 0.12);
    }
  }

  updateBoss(boss, deltaSeconds) {
    const hpRatio = boss.hp / boss.maxHp;

    if (boss.wave === 5) {
      this.updateWave5Boss(boss, deltaSeconds, hpRatio);
    } else if (boss.wave === 10) {
      this.updateWave10Boss(boss, deltaSeconds, hpRatio);
    } else if (boss.wave === 15) {
      this.updateWave15Boss(boss, deltaSeconds, hpRatio);
    } else if (boss.wave === 20) {
      this.updateWave20Boss(boss, deltaSeconds, hpRatio);
    } else if (boss.wave === 25) {
      this.updateWave25Boss(boss, deltaSeconds, hpRatio);
    } else if (boss.wave === 30) {
      this.updateWave30Boss(boss, deltaSeconds, hpRatio);
    }
  }

  updateWave5Boss(boss, deltaSeconds, hpRatio) {
    boss.summonCooldown = Math.max(0, boss.summonCooldown - deltaSeconds);
    boss.dashCooldown = Math.max(0, boss.dashCooldown - deltaSeconds);

    if (boss.dashWindup > 0) {
      boss.dashWindup = Math.max(0, boss.dashWindup - deltaSeconds);

      if (boss.dashWindup === 0) {
        const direction = normalize(this.player.x - boss.x, this.player.y - boss.y);
        boss.dashVx = direction.x * (290 + (1 - hpRatio) * 70);
        boss.dashVy = direction.y * (290 + (1 - hpRatio) * 70);
        boss.dashTimer = 0.46;
      }
    } else if (boss.dashTimer > 0) {
      boss.dashTimer = Math.max(0, boss.dashTimer - deltaSeconds);
      boss.x += boss.dashVx * deltaSeconds;
      boss.y += boss.dashVy * deltaSeconds;
    } else {
      this.chasePlayer(boss, deltaSeconds, hpRatio < 0.55 ? 1.06 : 0.96);
    }

    if (boss.dashCooldown === 0) {
      boss.dashWindup = hpRatio < 0.55 ? 0.22 : 0.32;
      boss.dashCooldown = hpRatio < 0.55 ? 1.6 : 2.25;
    }

    if (boss.summonCooldown === 0) {
      this.spawnSummonRing(
        boss,
        hpRatio < 0.55 ? ['chaser', 'dasher', 'chaser'] : ['chaser', 'chaser'],
      );
      boss.summonCooldown = hpRatio < 0.55 ? 3.4 : 4.8;
    }
  }

  updateWave10Boss(boss, deltaSeconds, hpRatio) {
    const toPlayerX = this.player.x - boss.x;
    const toPlayerY = this.player.y - boss.y;
    const distanceToPlayer = Math.sqrt(toPlayerX * toPlayerX + toPlayerY * toPlayerY);
    const towardPlayer = normalize(toPlayerX, toPlayerY);
    const orbit = {
      x: -towardPlayer.y * boss.strafeDir,
      y: towardPlayer.x * boss.strafeDir,
    };

    let moveX = orbit.x * 0.56;
    let moveY = orbit.y * 0.56;

    if (distanceToPlayer > 280) {
      moveX += towardPlayer.x;
      moveY += towardPlayer.y;
    } else if (distanceToPlayer < 165) {
      moveX -= towardPlayer.x * 1.18;
      moveY -= towardPlayer.y * 1.18;
    }

    const movement = normalize(moveX, moveY);
    this.moveEntity(boss, movement.x, movement.y, boss.speed, deltaSeconds);

    boss.shootCooldown = Math.max(0, boss.shootCooldown - deltaSeconds);
    boss.ringCooldown = Math.max(0, boss.ringCooldown - deltaSeconds);

    if (boss.shootCooldown === 0) {
      const count = hpRatio < 0.5 ? 4 : 3;

      this.spawnAimedVolley(boss.x, boss.y, this.player.x, this.player.y, {
        count,
        spread: count === 3 ? 0.42 : 0.58,
        speed: 218,
        damage: 1,
        radius: 6,
        life: 2.9,
        color: boss.accent,
        glow: boss.tint,
      });

      boss.shootCooldown = 2.05;
      boss.ringCooldown = Math.max(boss.ringCooldown, 1.05);
    }

    if (boss.ringCooldown === 0) {
      this.spawnRadialBurst(boss.x, boss.y, {
        count: hpRatio < 0.5 ? 14 : 10,
        speed: 118,
        damage: 1,
        radius: 6,
        life: 2.6,
        color: boss.accent,
        glow: boss.tint,
      });

      boss.ringCooldown = 3.6;
      boss.shootCooldown = Math.max(boss.shootCooldown, 0.95);
    }
  }

  updateWave15Boss(boss, deltaSeconds, hpRatio) {
    boss.teleportCooldown = Math.max(0, boss.teleportCooldown - deltaSeconds);
    boss.shootCooldown = Math.max(0, boss.shootCooldown - deltaSeconds);
    boss.spinAngle += deltaSeconds * 1.8;

    if (boss.teleportCooldown === 0) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 150 + Math.random() * 80;
      boss.x = clamp(this.player.x + Math.cos(angle) * distance, 90, GAME_WIDTH - 90);
      boss.y = clamp(this.player.y + Math.sin(angle) * distance, 90, GAME_HEIGHT - 90);
      boss.spawnFlashTimer = 0.24;

      this.spawnAimedVolley(boss.x, boss.y, this.player.x, this.player.y, {
        count: hpRatio < 0.5 ? 7 : 5,
        spread: hpRatio < 0.5 ? 0.9 : 0.66,
        speed: 240,
        damage: 1,
        radius: 6,
        life: 2.8,
        color: boss.accent,
        glow: boss.tint,
      });

      boss.teleportCooldown = hpRatio < 0.5 ? 3.2 : 4.8;
    } else {
      const towardPlayer = normalize(this.player.x - boss.x, this.player.y - boss.y);
      const orbit = {
        x: -towardPlayer.y * boss.strafeDir,
        y: towardPlayer.x * boss.strafeDir,
      };

      this.moveEntity(
        boss,
        towardPlayer.x * 0.45 + orbit.x * 0.8,
        towardPlayer.y * 0.45 + orbit.y * 0.8,
        boss.speed,
        deltaSeconds,
      );
    }

    if (boss.shootCooldown === 0) {
      this.spawnRadialBurst(boss.x, boss.y, {
        count: hpRatio < 0.5 ? 8 : 6,
        speed: 105,
        damage: 1,
        radius: 5,
        life: 1.9,
        color: boss.core,
        glow: boss.tint,
        startAngle: boss.spinAngle,
      });

      boss.shootCooldown = 1.45;
    }
  }

  updateWave20Boss(boss, deltaSeconds, hpRatio) {
    boss.dashCooldown = Math.max(0, boss.dashCooldown - deltaSeconds);
    boss.ringCooldown = Math.max(0, boss.ringCooldown - deltaSeconds);
    boss.summonCooldown = Math.max(0, boss.summonCooldown - deltaSeconds);
    boss.spiralCooldown = Math.max(0, boss.spiralCooldown - deltaSeconds);
    boss.spinAngle += deltaSeconds * 2.2;

    if (boss.dashWindup > 0) {
      boss.dashWindup = Math.max(0, boss.dashWindup - deltaSeconds);

      if (boss.dashWindup === 0) {
        const direction = normalize(this.player.x - boss.x, this.player.y - boss.y);
        boss.dashVx = direction.x * (315 + (1 - hpRatio) * 70);
        boss.dashVy = direction.y * (315 + (1 - hpRatio) * 70);
        boss.dashTimer = 0.5;
      }
    } else if (boss.dashTimer > 0) {
      boss.dashTimer = Math.max(0, boss.dashTimer - deltaSeconds);
      boss.x += boss.dashVx * deltaSeconds;
      boss.y += boss.dashVy * deltaSeconds;
    } else {
      const towardPlayer = normalize(this.player.x - boss.x, this.player.y - boss.y);
      const orbit = {
        x: -towardPlayer.y * Math.sin(this.elapsedMs / 500),
        y: towardPlayer.x * Math.sin(this.elapsedMs / 500),
      };

      this.moveEntity(
        boss,
        towardPlayer.x * 0.9 + orbit.x * 0.35,
        towardPlayer.y * 0.9 + orbit.y * 0.35,
        boss.speed,
        deltaSeconds,
      );
    }

    if (boss.dashCooldown === 0) {
      boss.dashWindup = hpRatio < 0.45 ? 0.22 : 0.3;
      boss.dashCooldown = hpRatio < 0.45 ? 1.25 : 1.9;
    }

    if (boss.ringCooldown === 0) {
      this.spawnRadialBurst(boss.x, boss.y, {
        count: hpRatio < 0.45 ? 18 : 14,
        speed: 145,
        damage: 1,
        radius: 6,
        life: 2.8,
        color: boss.accent,
        glow: boss.tint,
        startAngle: boss.spinAngle,
      });

      boss.spiralShotsRemaining = hpRatio < 0.45 ? 12 : 8;
      boss.spiralTick = 0;
      boss.ringCooldown = 2.3;
    }

    if (boss.spiralShotsRemaining > 0) {
      boss.spiralTick = Math.max(0, boss.spiralTick - deltaSeconds);

      if (boss.spiralTick === 0) {
        this.spawnProjectileAtAngle({
          x: boss.x,
          y: boss.y,
          angle: boss.spinAngle,
          speed: 175,
          damage: 1,
          radius: 5,
          life: 2.5,
          color: boss.core,
          glow: boss.accent,
        });

        this.spawnProjectileAtAngle({
          x: boss.x,
          y: boss.y,
          angle: boss.spinAngle + Math.PI,
          speed: 175,
          damage: 1,
          radius: 5,
          life: 2.5,
          color: boss.core,
          glow: boss.accent,
        });

        boss.spiralTick = 0.12;
        boss.spiralShotsRemaining -= 1;
      }
    }

    if (boss.summonCooldown === 0) {
      this.spawnSummonRing(
        boss,
        hpRatio < 0.45
          ? ['dasher', 'spitter', 'brute']
          : ['dasher', 'spitter'],
      );
      boss.summonCooldown = 5.2;
    }
  }

  updateWave25Boss(boss, deltaSeconds, hpRatio) {
    const toPlayerX = this.player.x - boss.x;
    const toPlayerY = this.player.y - boss.y;
    const distanceToPlayer = Math.sqrt(toPlayerX * toPlayerX + toPlayerY * toPlayerY);
    const towardPlayer = normalize(toPlayerX, toPlayerY);
    const orbit = {
      x: -towardPlayer.y * boss.strafeDir,
      y: towardPlayer.x * boss.strafeDir,
    };

    let moveX = orbit.x * 0.82;
    let moveY = orbit.y * 0.82;

    if (distanceToPlayer > 280) {
      moveX += towardPlayer.x * 0.8;
      moveY += towardPlayer.y * 0.8;
    } else if (distanceToPlayer < 165) {
      moveX -= towardPlayer.x * 1.16;
      moveY -= towardPlayer.y * 1.16;
    }

    const movement = normalize(moveX, moveY);
    this.moveEntity(boss, movement.x, movement.y, boss.speed, deltaSeconds);

    boss.shootCooldown = Math.max(0, boss.shootCooldown - deltaSeconds);
    boss.doomCooldown = Math.max(0, boss.doomCooldown - deltaSeconds);
    boss.summonCooldown = Math.max(0, boss.summonCooldown - deltaSeconds);
    boss.spinAngle += deltaSeconds * 1.75;

    if (boss.shootCooldown === 0) {
      this.spawnAimedVolley(boss.x, boss.y, this.player.x, this.player.y, {
        count: hpRatio < 0.5 ? 7 : 5,
        spread: hpRatio < 0.5 ? 1.05 : 0.82,
        speed: 228,
        damage: 1,
        radius: 6,
        life: 3.1,
        color: boss.core,
        glow: boss.accent,
      });

      boss.shootCooldown = 1.9;
    }

    if (boss.doomCooldown === 0) {
      this.spawnRadialBurst(boss.x, boss.y, {
        count: hpRatio < 0.5 ? 10 : 8,
        speed: 108,
        damage: 99,
        radius: 8,
        life: 3.8,
        color: '#ff3344',
        glow: 'rgba(255, 64, 64, 0.75)',
        startAngle: boss.spinAngle,
        instantKill: true,
      });

      this.announceInstantKillWarning();

      boss.doomCooldown = 5;
    }

    if (boss.summonCooldown === 0) {
      this.spawnSummonRing(
        boss,
        hpRatio < 0.5
          ? ['hexer', 'spitter', 'brute']
          : ['hexer', 'spitter', 'dasher'],
      );
      boss.summonCooldown = 5.3;
    }
  }

  updateWave30Boss(boss, deltaSeconds, hpRatio) {
    boss.dashCooldown = Math.max(0, boss.dashCooldown - deltaSeconds);
    boss.ringCooldown = Math.max(0, boss.ringCooldown - deltaSeconds);
    boss.summonCooldown = Math.max(0, boss.summonCooldown - deltaSeconds);
    boss.spiralCooldown = Math.max(0, boss.spiralCooldown - deltaSeconds);
    boss.doomCooldown = Math.max(0, boss.doomCooldown - deltaSeconds);
    boss.spinAngle += deltaSeconds * 2.5;

    if (boss.dashWindup > 0) {
      boss.dashWindup = Math.max(0, boss.dashWindup - deltaSeconds);

      if (boss.dashWindup === 0) {
        const direction = normalize(this.player.x - boss.x, this.player.y - boss.y);
        boss.dashVx = direction.x * (330 + (1 - hpRatio) * 90);
        boss.dashVy = direction.y * (330 + (1 - hpRatio) * 90);
        boss.dashTimer = 0.56;
      }
    } else if (boss.dashTimer > 0) {
      boss.dashTimer = Math.max(0, boss.dashTimer - deltaSeconds);
      boss.x += boss.dashVx * deltaSeconds;
      boss.y += boss.dashVy * deltaSeconds;
    } else {
      const towardPlayer = normalize(this.player.x - boss.x, this.player.y - boss.y);
      const orbit = {
        x: -towardPlayer.y * Math.cos(this.elapsedMs / 420),
        y: towardPlayer.x * Math.cos(this.elapsedMs / 420),
      };

      this.moveEntity(
        boss,
        towardPlayer.x * 0.92 + orbit.x * 0.48,
        towardPlayer.y * 0.92 + orbit.y * 0.48,
        boss.speed,
        deltaSeconds,
      );
    }

    if (boss.dashCooldown === 0) {
      boss.dashWindup = hpRatio < 0.45 ? 0.2 : 0.28;
      boss.dashCooldown = hpRatio < 0.45 ? 1.05 : 1.65;
    }

    if (boss.ringCooldown === 0) {
      this.spawnRadialBurst(boss.x, boss.y, {
        count: hpRatio < 0.45 ? 22 : 16,
        speed: 152,
        damage: 1,
        radius: 6,
        life: 3,
        color: boss.accent,
        glow: boss.tint,
        startAngle: boss.spinAngle,
      });

      boss.ringCooldown = 2.1;
    }

    if (boss.spiralCooldown === 0) {
      this.spawnAimedVolley(boss.x, boss.y, this.player.x, this.player.y, {
        count: hpRatio < 0.45 ? 7 : 5,
        spread: hpRatio < 0.45 ? 1.2 : 0.84,
        speed: 250,
        damage: 1,
        radius: 6,
        life: 3.2,
        color: boss.core,
        glow: boss.accent,
      });

      boss.spiralCooldown = 1.45;
    }

    if (boss.doomCooldown === 0) {
      this.spawnRadialBurst(boss.x, boss.y, {
        count: hpRatio < 0.45 ? 14 : 10,
        speed: 120,
        damage: 99,
        radius: 8,
        life: 4,
        color: '#ff2432',
        glow: 'rgba(255, 59, 59, 0.82)',
        startAngle: boss.spinAngle + Math.PI / 10,
        instantKill: true,
      });

      this.announceInstantKillWarning();

      boss.doomCooldown = 4.2;
    }

    if (boss.summonCooldown === 0) {
      this.spawnSummonRing(
        boss,
        hpRatio < 0.45
          ? ['hexer', 'brute', 'spitter', 'dasher']
          : ['hexer', 'brute', 'spitter'],
      );
      boss.summonCooldown = 4.8;
    }
  }

  updateProjectiles(deltaSeconds) {
    const activeProjectiles = [];

    for (const projectile of this.projectiles) {
      projectile.x += projectile.vx * deltaSeconds;
      projectile.y += projectile.vy * deltaSeconds;
      projectile.life = Math.max(0, projectile.life - deltaSeconds);

      if (
        projectile.life === 0 ||
        projectile.x < -80 ||
        projectile.x > GAME_WIDTH + 80 ||
        projectile.y < -80 ||
        projectile.y > GAME_HEIGHT + 80
      ) {
        continue;
      }

      if (
        this.player.invulnerableTimer === 0 &&
        distanceSquared(
          projectile.x,
          projectile.y,
          this.player.x,
          this.player.y,
        ) <=
          (projectile.radius + this.player.radius - 3) *
            (projectile.radius + this.player.radius - 3)
      ) {
        this.takeDamage(
          projectile.instantKill ? this.player.maxHp : projectile.damage,
          projectile.x,
          projectile.y,
        );

        if (this.isOver) {
          return;
        }

        continue;
      }

      activeProjectiles.push(projectile);
    }

    this.projectiles = activeProjectiles;
  }

  updatePickups(deltaSeconds) {
    const activePickups = [];

    for (const pickup of this.pickups) {
      pickup.life = Math.max(0, pickup.life - deltaSeconds);
      pickup.spin += deltaSeconds * 3.8;
      pickup.bob += deltaSeconds * 4.4;

      if (pickup.life === 0) {
        continue;
      }

      if (
        this.player.hp < this.player.maxHp &&
        distanceSquared(this.player.x, this.player.y, pickup.x, pickup.y) <=
          (this.player.radius + pickup.radius + 2) *
            (this.player.radius + pickup.radius + 2)
      ) {
        this.player.hp = Math.min(
          this.player.maxHp,
          this.player.hp + HEALTH_PICKUP_HEAL_AMOUNT,
        );
        this.player.hitFlashTimer = Math.max(this.player.hitFlashTimer, 0.22);
        this.noticeText = HEALTH_PICKUP_NOTICE_TEXT;
        this.noticeTimer = 1.1;
        this.emitState(true);
        continue;
      }

      activePickups.push(pickup);
    }

    this.pickups = activePickups;
  }

  announceInstantKillWarning() {
    if (this.hasShownInstantKillWarning) {
      return;
    }

    this.hasShownInstantKillWarning = true;
    this.noticeText = INSTANT_KILL_WARNING_TEXT;
    this.noticeTimer = 2.4;
    this.emitState(true);
  }

  spawnProjectileAtAngle({
    x,
    y,
    angle,
    speed,
    damage,
    radius,
    life,
    color,
    glow,
    instantKill = false,
  }) {
    const vector = angleToVector(angle);

    this.projectiles.push({
      x,
      y,
      vx: vector.x * speed,
      vy: vector.y * speed,
      radius,
      damage,
      life,
      color,
      glow,
      instantKill,
    });
  }

  spawnHealthPickup(x, y) {
    this.pickups.push({
      x,
      y,
      radius: HEALTH_PICKUP_RADIUS,
      life: HEALTH_PICKUP_LIFETIME,
      spin: Math.random() * Math.PI * 2,
      bob: Math.random() * Math.PI * 2,
    });
  }

  spawnAimedVolley(
    x,
    y,
    targetX,
    targetY,
    { count, spread, speed, damage, radius, life, color, glow, instantKill = false },
  ) {
    const baseAngle = Math.atan2(targetY - y, targetX - x);

    for (let index = 0; index < count; index += 1) {
      const angleOffset =
        count === 1 ? 0 : (index / (count - 1) - 0.5) * spread;

      this.spawnProjectileAtAngle({
        x,
        y,
        angle: baseAngle + angleOffset,
        speed,
        damage,
        radius,
        life,
        color,
        glow,
        instantKill,
      });
    }
  }

  spawnRadialBurst(
    x,
    y,
    {
      count,
      speed,
      damage,
      radius,
      life,
      color,
      glow,
      startAngle = 0,
      instantKill = false,
    },
  ) {
    for (let index = 0; index < count; index += 1) {
      const angle = startAngle + (Math.PI * 2 * index) / count;

      this.spawnProjectileAtAngle({
        x,
        y,
        angle,
        speed,
        damage,
        radius,
        life,
        color,
        glow,
        instantKill,
      });
    }
  }

  updateAutoAttack() {
    const target = this.findNearestEnemy();

    if (!target) {
      return;
    }

    const toTargetX = target.x - this.player.x;
    const toTargetY = target.y - this.player.y;
    const direction = normalize(toTargetX, toTargetY);
    const autoRange = this.attack.autoRange + target.radius;

    if (
      distanceSquared(this.player.x, this.player.y, target.x, target.y) >
      autoRange * autoRange
    ) {
      return;
    }

    this.player.facingX = direction.x;
    this.player.facingY = direction.y;

    const triggerDistance =
      this.attack.reach + this.attack.radius + target.radius + 8;

    if (
      this.attackCooldownTimer === 0 &&
      distanceSquared(this.player.x, this.player.y, target.x, target.y) <=
        triggerDistance * triggerDistance
    ) {
      this.attackCooldownTimer = this.attack.cooldown;
      this.attackTimer = ATTACK_DURATION;
      this.swingId += 1;
    }
  }

  resolveCombat() {
    const attackStartX = this.player.x + this.player.facingX * (this.player.radius * 0.25);
    const attackStartY = this.player.y + this.player.facingY * (this.player.radius * 0.25);
    const attackEndX = this.player.x + this.player.facingX * this.attack.reach;
    const attackEndY = this.player.y + this.player.facingY * this.attack.reach;
    const survivors = [];
    let didLandHit = false;

    for (const enemy of this.enemies) {
      if (this.attackTimer > 0 && enemy.lastSwingHitId !== this.swingId) {
        const hitDistance = this.attack.radius + enemy.radius;

        if (
          pointToSegmentDistanceSquared(
            enemy.x,
            enemy.y,
            attackStartX,
            attackStartY,
            attackEndX,
            attackEndY,
          ) <=
          hitDistance * hitDistance
        ) {
          enemy.lastSwingHitId = this.swingId;
          enemy.hp -= this.attack.damage;
          enemy.hurtFlashTimer = 0.18;
          didLandHit = true;

          const knockback = normalize(enemy.x - this.player.x, enemy.y - this.player.y);
          const knockbackPower = enemy.isBoss ? 10 : enemy.type === 'brute' ? 8 : 16;
          enemy.x += knockback.x * knockbackPower;
          enemy.y += knockback.y * knockbackPower;
        }
      }

      if (enemy.hp <= 0) {
        this.handleEnemyDefeated(enemy);

        if (this.isOver) {
          return;
        }

        continue;
      }

      survivors.push(enemy);
    }

    if (didLandHit) {
      this.onHit?.();
    }

    this.enemies = this.clearMinionsOnBossKill ? [] : survivors;
    this.clearMinionsOnBossKill = false;

    if (this.player.invulnerableTimer > 0) {
      return;
    }

    for (const enemy of this.enemies) {
      const minDistance = enemy.radius + this.player.radius - 2;

      if (
        distanceSquared(this.player.x, this.player.y, enemy.x, enemy.y) <=
        minDistance * minDistance
      ) {
        this.takeDamage(enemy.contactDamage, enemy.x, enemy.y);
        break;
      }
    }
  }

  handleEnemyDefeated(enemy) {
    this.kills += enemy.isBoss ? 6 : 1;
    const healed = this.applyKillHeal();

    if (!enemy.isBoss) {
      if (
        this.player.hp < this.player.maxHp &&
        Math.random() < HEALTH_PICKUP_DROP_CHANCE
      ) {
        this.spawnHealthPickup(enemy.x, enemy.y);
      }

      if (healed) {
        this.emitState(true);
      }
      return;
    }

    this.player.maxHp += 1;
    this.player.hp = this.player.maxHp;
    this.player.hitFlashTimer = 0.32;
    this.pendingSpawns = 0;
    this.projectiles = [];
    this.clearCountdown = 0;
    this.clearMinionsOnBossKill = true;
    this.noticeText = enemy.isFinalBoss
      ? '최종보스 격파!'
      : '보스 격파! HP 완전 회복';
    this.noticeTimer = 1.9;

    if (enemy.isFinalBoss) {
      this.finishRun('victory');
    } else {
      this.pauseForUpgrade(this.wave + 1, {
        bonusLevels: 2,
        kind: 'boss',
      });
    }
  }

  applyKillHeal() {
    let healed = false;

    while (this.kills >= (this.healMilestones + 1) * 10) {
      this.healMilestones += 1;
      const previousHp = this.player.hp;
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + 1);

      if (this.player.hp > previousHp) {
        healed = true;
      }
    }

    if (healed) {
      this.noticeText = '처치 보상 +1 HP';
      this.noticeTimer = 1.15;
      this.player.hitFlashTimer = Math.max(this.player.hitFlashTimer, 0.18);
    }

    return healed;
  }

  takeDamage(amount, sourceX, sourceY) {
    this.player.hp = Math.max(0, this.player.hp - amount);
    this.player.invulnerableTimer = PLAYER_INVULNERABLE_TIME;
    this.player.hitFlashTimer = 0.24;

    const push = normalize(this.player.x - sourceX, this.player.y - sourceY);
    this.player.x += push.x * 28;
    this.player.y += push.y * 28;

    if (this.player.hp <= 0) {
      this.finishRun('defeat');
    } else {
      this.emitState(true);
    }
  }

  handleWaveClear() {
    const nextWave = this.wave + 1;

    if (nextWave > FINAL_WAVE) {
      this.finishRun('victory');
      return;
    }

    if (isUpgradeWave(nextWave) && !this.claimedUpgradeWaves.has(nextWave)) {
      this.pauseForUpgrade(nextWave);
      return;
    }

    this.beginWave(nextWave);
    this.emitState(true);
  }

  pauseForUpgrade(nextWave, options = {}) {
    const bonusLevels = options.bonusLevels ?? 1;
    const kind = options.kind ?? 'wave';
    const promptMeta = getUpgradePromptMeta(nextWave, kind, bonusLevels);
    const choices = shuffle(Object.values(UPGRADE_DEFS))
      .slice(0, 3)
      .map((upgrade) => ({
        type: upgrade.type,
        title: upgrade.title,
        description: getUpgradeDescription(upgrade.type, bonusLevels),
        level: this.upgradeLevels[upgrade.type],
        bonusLevels,
      }));

    this.claimedUpgradeWaves.add(nextWave);
    this.pendingWave = nextWave;
    this.pendingUpgradeBonusLevels = bonusLevels;
    this.pendingUpgradeKind = kind;
    this.isUpgradePaused = true;
    this.noticeText = '강화 선택';
    this.noticeTimer = 999;
    this.onUpgradePrompt?.({
      wave: nextWave,
      kicker: promptMeta.kicker,
      title: promptMeta.title,
      copy: promptMeta.copy,
      kind,
      bonusLevels,
      choices,
    });
    this.emitState(true);
  }

  applyUpgrade(type) {
    if (!this.isUpgradePaused || !this.pendingWave) {
      return;
    }

    const upgrade = UPGRADE_DEFS[type];

    if (!upgrade) {
      return;
    }

    const bonusLevels = this.pendingUpgradeBonusLevels ?? 1;

    this.upgradeLevels[type] += bonusLevels;
    upgrade.apply(this, bonusLevels);
    this.isUpgradePaused = false;
    this.noticeText = `${upgrade.title} 강화`;
    if (bonusLevels > 1) {
      this.noticeText = `${upgrade.title} 고급 강화`;
    }
    this.noticeTimer = 1.5;

    const nextWave = this.pendingWave;
    this.pendingWave = null;
    this.pendingUpgradeBonusLevels = 1;
    this.pendingUpgradeKind = 'wave';
    this.beginWave(nextWave);
    this.emitState(true);
  }

  pause() {
    if (this.isOver || this.isPaused || this.isUpgradePaused) {
      return;
    }

    this.isPaused = true;
    this.keys.clear();
    this.clearMoveInput();
    this.emitState(true);
  }

  resume() {
    if (this.isOver || !this.isPaused) {
      return;
    }

    this.isPaused = false;
    this.lastTick = performance.now();
    this.emitState(true);
  }

  togglePause() {
    if (this.isPaused) {
      this.resume();
      return;
    }

    this.pause();
  }

  findNearestEnemy() {
    let nearestEnemy = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const enemy of this.enemies) {
      const currentDistance = distanceSquared(
        this.player.x,
        this.player.y,
        enemy.x,
        enemy.y,
      );

      if (currentDistance < nearestDistance) {
        nearestDistance = currentDistance;
        nearestEnemy = enemy;
      }
    }

    return nearestEnemy;
  }

  emitState(force = false) {
    if (!this.onStateChange) {
      return;
    }

    if (!force && this.isOver) {
      return;
    }

    const activeBoss = this.enemies.find((enemy) => enemy.isBoss) ?? null;
    const nextUpgradeWave =
      this.pendingWave && isUpgradeWave(this.pendingWave)
        ? this.pendingWave
        : UPGRADE_WAVES.find((wave) => wave > this.wave) ?? null;
    const nextBossWave = BOSS_WAVES.find((wave) => wave > this.wave) ?? null;

    this.onStateChange({
      hp: this.player.hp,
      maxHp: this.player.maxHp,
      kills: this.kills,
      killsToNextHeal: getKillsToNextHeal(this.kills),
      elapsedMs: Math.floor(this.elapsedMs),
      wave: this.wave,
      enemiesRemaining: this.enemies.length + this.pendingSpawns,
      projectilesInAir: this.projectiles.length,
      attackDamage: this.attack.damage,
      attackSpeed: Number((1 / this.attack.cooldown).toFixed(2)),
      attackRadius: Math.round(this.attack.radius),
      attackReach: Math.round(this.attack.reach),
      upgradeLevels: { ...this.upgradeLevels },
      nextUpgradeWave,
      nextBossWave,
      bossName: activeBoss?.name ?? null,
      bossHp: activeBoss ? Math.max(0, Math.ceil(activeBoss.hp)) : 0,
      bossMaxHp: activeBoss?.maxHp ?? 0,
      bossPatternText: activeBoss?.patternText ?? null,
      isBossWave: this.waveType === 'boss',
      isFinalBoss: Boolean(activeBoss?.isFinalBoss),
      isPaused: this.isPaused,
      isUpgradePaused: this.isUpgradePaused,
      enemyRoster: getEnemyRoster(this.wave),
      dangerLabel: getDangerLabel(this.wave, this.waveType),
    });
  }

  finishRun(outcome) {
    if (this.isOver) {
      return;
    }

    this.isOver = true;
    this.keys.clear();
    this.clearMoveInput();
    this.emitState(true);
    this.onGameOver({
      kills: this.kills,
      wave: this.wave,
      survivedMs: Math.floor(this.elapsedMs),
      outcome,
    });
  }

  render() {
    const { ctx } = this;

    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.drawBackground(ctx);
    this.drawArenaDecorations(ctx);

    for (const pickup of this.pickups) {
      this.drawHealthPickup(ctx, pickup);
    }

    if (this.attackTimer > 0) {
      this.drawAttack(ctx);
    }

    for (const projectile of this.projectiles) {
      this.drawProjectile(ctx, projectile);
    }

    for (const enemy of this.enemies) {
      if (enemy.isBoss) {
        this.drawBoss(ctx, enemy);
      } else {
        this.drawEnemy(ctx, enemy);
      }
    }

    this.drawPlayer(ctx);
    this.drawWaveBanner(ctx);
  }

  drawBackground(ctx) {
    const time = this.elapsedMs / 1000;
    const activeBoss = this.enemies.find((enemy) => enemy.isBoss) ?? null;
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    let bannerText = '';

    if (activeBoss) {
      gradient.addColorStop(0, activeBoss.tint);
      gradient.addColorStop(0.45, '#231e20');
      gradient.addColorStop(1, '#111113');
    } else {
      const hue = Math.max(24, 116 - this.wave * 4);
      gradient.addColorStop(0, `hsl(${hue} 34% 31%)`);
      gradient.addColorStop(0.45, `hsl(${hue - 8} 32% 20%)`);
      gradient.addColorStop(1, '#0f1813');
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    if (this.waveType === 'boss' && this.wave === FINAL_WAVE) {
      bannerText = `${FINAL_WAVE}웨이브 최종보스`;
    }

    ctx.save();
    ctx.globalAlpha = activeBoss ? 0.22 : 0.12;
    ctx.fillStyle = activeBoss?.aura ?? 'rgba(255, 236, 184, 0.16)';

    for (let index = 0; index < 5; index += 1) {
      const x = (index * 220 + time * 38) % (GAME_WIDTH + 240) - 120;
      const y = 40 + (index % 2) * 110;
      ctx.beginPath();
      ctx.arc(x, y, 150 + index * 10, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    ctx.save();
    ctx.strokeStyle = activeBoss ? 'rgba(255, 168, 126, 0.08)' : 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 2;

    for (let index = 0; index < 14; index += 1) {
      const offset = ((index * 82 + time * 55) % (GAME_WIDTH + 180)) - 90;
      ctx.beginPath();
      ctx.moveTo(offset, 0);
      ctx.lineTo(offset - 160, GAME_HEIGHT);
      ctx.stroke();
    }

    ctx.restore();

    const vignette = ctx.createRadialGradient(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      80,
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      420,
    );
    vignette.addColorStop(0, 'rgba(255,255,255,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.42)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }

  drawArenaDecorations(ctx) {
    const time = this.elapsedMs / 1000;

    ctx.save();
    ctx.strokeStyle = 'rgba(255, 238, 199, 0.08)';
    ctx.lineWidth = 3;

    for (let radius = 120; radius <= 320; radius += 70) {
      ctx.beginPath();
      ctx.arc(GAME_WIDTH / 2, GAME_HEIGHT / 2, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();

    ctx.save();
    for (let index = 0; index < 26; index += 1) {
      const x = 40 + ((index * 83 + time * 20) % (GAME_WIDTH - 80));
      const y = 30 + ((index * 59 + time * 13) % (GAME_HEIGHT - 60));
      const alpha = 0.03 + (index % 4) * 0.012;
      ctx.fillStyle = `rgba(255, 230, 168, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, 2 + (index % 3), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawPlayer(ctx) {
    const blinking =
      this.player.invulnerableTimer > 0 &&
      Math.floor(this.player.invulnerableTimer * 12) % 2 === 0;
    const healthRate =
      this.player.maxHp > 0 ? this.player.hp / this.player.maxHp : 0;

    ctx.save();
    ctx.translate(this.player.x, this.player.y);
    ctx.rotate(Math.atan2(this.player.facingY, this.player.facingX));

    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.beginPath();
    ctx.ellipse(0, this.player.radius + 13, 20, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 196, 109, 0.16)';
    ctx.beginPath();
    ctx.arc(0, 0, this.player.radius + 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = blinking ? '#fff6d5' : '#ff962f';
    ctx.beginPath();
    ctx.arc(0, 0, this.player.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 245, 214, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, this.player.radius - 0.5, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#f77014';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, this.player.radius - 1.5, 0.35, Math.PI * 1.65);
    ctx.stroke();

    ctx.fillStyle = '#418c4a';
    ctx.beginPath();
    ctx.ellipse(4, -this.player.radius + 3, 12, 7, -0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#346c3b';
    ctx.fillRect(-2, -this.player.radius - 3, 4, 10);

    ctx.fillStyle = '#3e2a11';
    ctx.beginPath();
    ctx.arc(-7, -3, 3.2, 0, Math.PI * 2);
    ctx.arc(6, -2, 3.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#593214';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 6, 8, 0.2, Math.PI - 0.2);
    ctx.stroke();

    if (this.player.hitFlashTimer > 0) {
      ctx.strokeStyle = 'rgba(255, 245, 214, 0.85)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, this.player.radius + 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();

    const barWidth = 54;
    const barHeight = 8;
    const barX = this.player.x - barWidth / 2;
    const barY = this.player.y - this.player.radius - 34;
    const fillWidth = Math.max(0, barWidth * healthRate);

    ctx.save();
    ctx.fillStyle = 'rgba(8, 14, 10, 0.5)';
    drawRoundedRect(ctx, barX - 4, barY - 4, barWidth + 8, barHeight + 8, 8);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    drawRoundedRect(ctx, barX, barY, barWidth, barHeight, 999);
    ctx.fill();

    if (fillWidth > 0) {
      ctx.shadowColor = healthRate > 0.4 ? 'rgba(255, 182, 84, 0.45)' : 'rgba(255, 106, 82, 0.52)';
      ctx.shadowBlur = 10;
      ctx.fillStyle = healthRate > 0.4 ? '#ffb95a' : '#ff7e57';
      drawRoundedRect(ctx, barX, barY, fillWidth, barHeight, 999);
      ctx.fill();
    }

    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255, 240, 213, 0.2)';
    ctx.lineWidth = 1;
    drawRoundedRect(ctx, barX, barY, barWidth, barHeight, 999);
    ctx.stroke();
    ctx.restore();
  }

  drawAttack(ctx) {
    const attackCenterX = this.player.x + this.player.facingX * this.attack.reach;
    const attackCenterY = this.player.y + this.player.facingY * this.attack.reach;
    const direction = Math.atan2(this.player.facingY, this.player.facingX);
    const attackProgress = this.attackTimer / ATTACK_DURATION;

    ctx.save();
    ctx.translate(attackCenterX, attackCenterY);
    ctx.rotate(direction);
    ctx.globalAlpha = 0.3 + attackProgress * 0.34;

    ctx.fillStyle = '#ffe86d';
    ctx.beginPath();
    ctx.moveTo(-18, -18);
    ctx.quadraticCurveTo(
      this.attack.radius + 16,
      -this.attack.radius * 0.92,
      this.attack.radius + 22,
      -4,
    );
    ctx.quadraticCurveTo(
      this.attack.radius + 8,
      this.attack.radius * 0.84,
      -18,
      18,
    );
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = 0.82;
    ctx.strokeStyle = '#fff7b7';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(18, this.attack.radius - 9), -0.74, 0.74);
    ctx.stroke();

    ctx.restore();
  }

  drawProjectile(ctx, projectile) {
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = projectile.glow;
    ctx.beginPath();
    ctx.arc(projectile.x, projectile.y, projectile.radius + 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.fillStyle = projectile.color;
    ctx.beginPath();
    ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
    ctx.fill();

    if (projectile.instantKill) {
      ctx.strokeStyle = 'rgba(255, 246, 210, 0.92)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, projectile.radius + 2.5, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawHealthPickup(ctx, pickup) {
    const bobOffset = Math.sin(pickup.bob) * 3.2;
    const glowRadius = pickup.radius + 8 + Math.sin(pickup.spin * 1.35) * 1.8;
    const alpha = Math.min(1, pickup.life / 1.4);

    ctx.save();
    ctx.translate(pickup.x, pickup.y + bobOffset);
    ctx.globalAlpha = 0.78 * alpha;
    ctx.fillStyle = 'rgba(255, 245, 210, 0.72)';
    ctx.beginPath();
    ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#fff5e1';
    ctx.beginPath();
    ctx.arc(0, 0, pickup.radius + 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ff5b5b';
    ctx.fillRect(-3.2, -pickup.radius + 3, 6.4, pickup.radius * 2 - 6);
    ctx.fillRect(-pickup.radius + 3, -3.2, pickup.radius * 2 - 6, 6.4);

    ctx.strokeStyle = 'rgba(131, 18, 18, 0.42)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(0, -pickup.radius + 3);
    ctx.lineTo(0, pickup.radius - 3);
    ctx.moveTo(-pickup.radius + 3, 0);
    ctx.lineTo(pickup.radius - 3, 0);
    ctx.stroke();
    ctx.restore();
  }

  drawEnemy(ctx, enemy) {
    if (enemy.type === 'dasher') {
      this.drawDasher(ctx, enemy);
      return;
    }

    if (enemy.type === 'spitter') {
      this.drawSpitter(ctx, enemy);
      return;
    }

    if (enemy.type === 'brute') {
      this.drawBrute(ctx, enemy);
      return;
    }

    if (enemy.type === 'hexer') {
      this.drawHexer(ctx, enemy);
      return;
    }

    this.drawChaser(ctx, enemy);
  }

  drawChaser(ctx, enemy) {
    const blinking = enemy.hurtFlashTimer > 0;
    const scale = enemy.spawnFlashTimer > 0 ? 1.08 : 1;

    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    ctx.scale(scale, scale);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.beginPath();
    ctx.ellipse(0, enemy.radius + 11, 18, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = blinking ? '#fff0db' : enemy.tint;
    ctx.beginPath();
    ctx.arc(0, 0, enemy.radius + Math.sin(enemy.wobbleSeed * 1.6) * 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = enemy.accent;
    ctx.beginPath();
    ctx.arc(-6, -4, 4.8, 0, Math.PI * 2);
    ctx.arc(7, -3, 4.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#27162f';
    ctx.beginPath();
    ctx.arc(-6, -4, 2, 0, Math.PI * 2);
    ctx.arc(7, -3, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#3b1f51';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-11, -enemy.radius + 4);
    ctx.lineTo(-4, -enemy.radius - 8);
    ctx.lineTo(0, -enemy.radius + 2);
    ctx.moveTo(10, -enemy.radius + 5);
    ctx.lineTo(15, -enemy.radius - 6);
    ctx.lineTo(18, -enemy.radius + 4);
    ctx.stroke();

    ctx.strokeStyle = '#f8d489';
    ctx.beginPath();
    ctx.arc(0, 7, 7.5, 0.25, Math.PI - 0.25);
    ctx.stroke();

    ctx.restore();
  }

  drawDasher(ctx, enemy) {
    const blinking = enemy.hurtFlashTimer > 0;

    ctx.save();
    ctx.translate(enemy.x, enemy.y);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.beginPath();
    ctx.ellipse(0, enemy.radius + 10, 18, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    if (enemy.dashWindup > 0) {
      ctx.strokeStyle = 'rgba(255, 208, 117, 0.75)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, enemy.radius + 10, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = blinking ? '#fff3e0' : enemy.tint;
    ctx.beginPath();
    ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = enemy.accent;
    ctx.beginPath();
    ctx.moveTo(-enemy.radius + 2, 2);
    ctx.lineTo(-enemy.radius - 8, -6);
    ctx.lineTo(-enemy.radius + 4, -8);
    ctx.closePath();
    ctx.moveTo(enemy.radius - 2, 2);
    ctx.lineTo(enemy.radius + 8, -6);
    ctx.lineTo(enemy.radius - 4, -8);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = enemy.core;
    ctx.beginPath();
    ctx.arc(-4, -2, 3.8, 0, Math.PI * 2);
    ctx.arc(7, -1, 3.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2c110d';
    ctx.beginPath();
    ctx.arc(-4, -2, 1.8, 0, Math.PI * 2);
    ctx.arc(7, -1, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawSpitter(ctx, enemy) {
    const blinking = enemy.hurtFlashTimer > 0;

    ctx.save();
    ctx.translate(enemy.x, enemy.y);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
    ctx.beginPath();
    ctx.ellipse(0, enemy.radius + 12, 19, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = blinking ? '#f5ffeb' : enemy.tint;
    ctx.beginPath();
    ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = enemy.accent;
    ctx.beginPath();
    ctx.arc(0, -enemy.radius + 4, 8, 0, Math.PI * 2);
    ctx.fill();

    if (enemy.shootCooldown < 0.28) {
      ctx.strokeStyle = 'rgba(201, 255, 137, 0.75)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, -enemy.radius + 4, 12, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = enemy.core;
    ctx.beginPath();
    ctx.arc(-6, -3, 4, 0, Math.PI * 2);
    ctx.arc(6, -3, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#213717';
    ctx.beginPath();
    ctx.arc(-6, -3, 1.7, 0, Math.PI * 2);
    ctx.arc(6, -3, 1.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#355d20';
    ctx.beginPath();
    ctx.arc(0, 7, 6.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawBrute(ctx, enemy) {
    const blinking = enemy.hurtFlashTimer > 0;

    ctx.save();
    ctx.translate(enemy.x, enemy.y);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, enemy.radius + 13, 24, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    if (enemy.burstCooldown < 0.35) {
      ctx.strokeStyle = 'rgba(255, 214, 121, 0.78)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, enemy.radius + 12, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = blinking ? '#fff5e2' : enemy.tint;
    ctx.beginPath();
    ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#7e4513';
    ctx.beginPath();
    ctx.arc(0, 0, enemy.radius - 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = enemy.accent;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, enemy.radius - 12, 0.2, Math.PI * 1.8);
    ctx.stroke();

    ctx.fillStyle = enemy.core;
    ctx.beginPath();
    ctx.arc(-8, -5, 5, 0, Math.PI * 2);
    ctx.arc(8, -5, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2e180b';
    ctx.beginPath();
    ctx.arc(-8, -5, 2, 0, Math.PI * 2);
    ctx.arc(8, -5, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawHexer(ctx, enemy) {
    const blinking = enemy.hurtFlashTimer > 0;

    ctx.save();
    ctx.translate(enemy.x, enemy.y);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.beginPath();
    ctx.ellipse(0, enemy.radius + 12, 20, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    if (enemy.castCooldown < 0.38) {
      ctx.strokeStyle = 'rgba(255, 114, 140, 0.76)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, enemy.radius + 10, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = blinking ? '#fff1f5' : enemy.tint;
    ctx.beginPath();
    ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = enemy.accent;
    ctx.beginPath();
    for (let index = 0; index < 4; index += 1) {
      const angle = Math.PI / 2 * index + Math.PI / 4;
      const px = Math.cos(angle) * (enemy.radius - 3);
      const py = Math.sin(angle) * (enemy.radius - 3);
      ctx.moveTo(0, 0);
      ctx.lineTo(px, py);
    }
    ctx.strokeStyle = enemy.accent;
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = enemy.core;
    ctx.beginPath();
    ctx.arc(-7, -4, 4.6, 0, Math.PI * 2);
    ctx.arc(7, -4, 4.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2a1022';
    ctx.beginPath();
    ctx.arc(-7, -4, 1.8, 0, Math.PI * 2);
    ctx.arc(7, -4, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawBoss(ctx, boss) {
    const blinking = boss.hurtFlashTimer > 0;
    const pulse = Math.sin(boss.wobbleSeed * 1.35) * 4;
    const radius = boss.radius + pulse * 0.08;

    ctx.save();
    ctx.translate(boss.x, boss.y);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.beginPath();
    ctx.ellipse(0, radius + 16, 32, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = boss.aura;
    ctx.beginPath();
    ctx.arc(0, 0, radius + 18, 0, Math.PI * 2);
    ctx.fill();

    if (boss.wave === 5) {
      this.drawWave5BossShape(ctx, boss, radius, blinking);
    } else if (boss.wave === 10) {
      this.drawWave10BossShape(ctx, boss, radius, blinking);
    } else if (boss.wave === 15) {
      this.drawWave15BossShape(ctx, boss, radius, blinking);
    } else if (boss.wave === 20) {
      this.drawWave20BossShape(ctx, boss, radius, blinking);
    } else if (boss.wave === 25) {
      this.drawWave25BossShape(ctx, boss, radius, blinking);
    } else {
      this.drawWave30BossShape(ctx, boss, radius, blinking);
    }

    ctx.restore();
    this.drawBossHpBar(ctx, boss, radius);
  }

  drawBossHpBar(ctx, boss, radius) {
    const width = Math.max(124, radius * 2.9);
    const height = 10;
    const x = clamp(boss.x - width / 2, 10, GAME_WIDTH - width - 10);
    const y = Math.max(18, boss.y - radius - 30);
    const fillRate = boss.maxHp > 0 ? boss.hp / boss.maxHp : 0;

    ctx.save();
    ctx.fillStyle = 'rgba(10, 15, 12, 0.76)';
    ctx.fillRect(x - 2, y - 18, width + 4, 32);

    ctx.fillStyle = '#fff2c8';
    ctx.font = "700 12px 'Trebuchet MS', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText(boss.name, x + width / 2, y - 6);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(x, y, width, height);

    ctx.fillStyle = boss.accent;
    ctx.fillRect(x, y, width * fillRate, height);

    ctx.strokeStyle = 'rgba(255, 240, 204, 0.16)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
    ctx.restore();
  }

  drawWave5BossShape(ctx, boss, radius, blinking) {
    ctx.fillStyle = blinking ? '#fff0db' : boss.tint;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = boss.accent;
    ctx.beginPath();
    ctx.moveTo(-radius + 10, -radius + 14);
    ctx.lineTo(-8, -radius - 18);
    ctx.lineTo(0, -radius + 4);
    ctx.lineTo(14, -radius - 16);
    ctx.lineTo(radius - 12, -radius + 14);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = boss.core;
    ctx.beginPath();
    ctx.arc(-12, -8, 6, 0, Math.PI * 2);
    ctx.arc(12, -8, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2c123a';
    ctx.beginPath();
    ctx.arc(-12, -8, 2.5, 0, Math.PI * 2);
    ctx.arc(12, -8, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#3d1a56';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-18, 16);
    ctx.quadraticCurveTo(0, 30, 18, 16);
    ctx.stroke();
  }

  drawWave10BossShape(ctx, boss, radius, blinking) {
    ctx.strokeStyle = boss.accent;
    ctx.lineWidth = 5;

    for (let index = 0; index < 4; index += 1) {
      ctx.beginPath();
      ctx.arc(0, 0, radius + 10 + index * 4, index * 0.7, index * 0.7 + 0.95);
      ctx.stroke();
    }

    ctx.fillStyle = blinking ? '#fff7df' : boss.tint;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = boss.core;
    ctx.beginPath();
    ctx.arc(0, 4, radius - 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#355d20';
    ctx.beginPath();
    ctx.arc(-11, -8, 6, 0, Math.PI * 2);
    ctx.arc(11, -8, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#18260e';
    ctx.beginPath();
    ctx.arc(-11, -8, 2.4, 0, Math.PI * 2);
    ctx.arc(11, -8, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }

  drawWave15BossShape(ctx, boss, radius, blinking) {
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = blinking ? '#f2ffff' : boss.tint;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.55;
    ctx.fillStyle = boss.core;
    ctx.beginPath();
    ctx.arc(0, 0, radius - 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.strokeStyle = boss.accent;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, radius + 8, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#245861';
    ctx.beginPath();
    ctx.arc(-10, -7, 5.5, 0, Math.PI * 2);
    ctx.arc(10, -7, 5.5, 0, Math.PI * 2);
    ctx.fill();
  }

  drawWave20BossShape(ctx, boss, radius, blinking) {
    ctx.fillStyle = blinking ? '#fff2df' : boss.tint;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = boss.core;
    ctx.beginPath();
    ctx.arc(0, 4, radius - 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = boss.accent;
    ctx.beginPath();
    ctx.moveTo(-18, -radius - 8);
    ctx.lineTo(-7, -radius + 6);
    ctx.lineTo(0, -radius - 14);
    ctx.lineTo(8, -radius + 6);
    ctx.lineTo(18, -radius - 8);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 120, 88, 0.9)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, radius + 14, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#fff5dc';
    ctx.beginPath();
    ctx.arc(-13, -9, 6, 0, Math.PI * 2);
    ctx.arc(13, -9, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#251416';
    ctx.beginPath();
    ctx.arc(-13, -9, 2.7, 0, Math.PI * 2);
    ctx.arc(13, -9, 2.7, 0, Math.PI * 2);
    ctx.fill();
  }

  drawWave25BossShape(ctx, boss, radius, blinking) {
    ctx.fillStyle = blinking ? '#ffe6df' : boss.tint;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = boss.core;
    ctx.beginPath();
    ctx.arc(0, 5, radius - 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = boss.accent;
    ctx.lineWidth = 4;
    for (let index = 0; index < 5; index += 1) {
      const angle = boss.spinAngle + (Math.PI * 2 * index) / 5;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * (radius - 4), Math.sin(angle) * (radius - 4));
      ctx.lineTo(Math.cos(angle) * (radius + 14), Math.sin(angle) * (radius + 14));
      ctx.stroke();
    }

    ctx.fillStyle = '#fff0da';
    ctx.beginPath();
    ctx.arc(-14, -8, 6.5, 0, Math.PI * 2);
    ctx.arc(14, -8, 6.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#3c1218';
    ctx.beginPath();
    ctx.arc(-14, -8, 2.6, 0, Math.PI * 2);
    ctx.arc(14, -8, 2.6, 0, Math.PI * 2);
    ctx.fill();
  }

  drawWave30BossShape(ctx, boss, radius, blinking) {
    ctx.fillStyle = blinking ? '#fff0e3' : boss.tint;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = boss.core;
    ctx.beginPath();
    ctx.arc(0, 4, radius - 11, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 57, 72, 0.92)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, radius + 16, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = boss.accent;
    ctx.beginPath();
    for (let index = 0; index < 6; index += 1) {
      const angle = (Math.PI * 2 * index) / 6;
      ctx.moveTo(Math.cos(angle) * (radius - 2), Math.sin(angle) * (radius - 2));
      ctx.lineTo(Math.cos(angle + 0.18) * (radius + 18), Math.sin(angle + 0.18) * (radius + 18));
      ctx.lineTo(Math.cos(angle - 0.18) * (radius + 18), Math.sin(angle - 0.18) * (radius + 18));
      ctx.closePath();
    }
    ctx.fill();

    ctx.fillStyle = '#fff4de';
    ctx.beginPath();
    ctx.arc(-15, -10, 7, 0, Math.PI * 2);
    ctx.arc(15, -10, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#280d10';
    ctx.beginPath();
    ctx.arc(-15, -10, 2.8, 0, Math.PI * 2);
    ctx.arc(15, -10, 2.8, 0, Math.PI * 2);
    ctx.fill();
  }

  drawWaveBanner(ctx) {
    if (
      !this.isUpgradePaused &&
      this.noticeTimer <= 0 &&
      this.waveTextTimer <= 0 &&
      this.clearCountdown <= 0
    ) {
      return;
    }

    let bannerText = '';

    if (this.isUpgradePaused && this.pendingWave) {
      bannerText = `${this.pendingWave}웨이브 강화 선택`;
    } else if (this.noticeTimer > 0 && this.noticeText) {
      bannerText = this.noticeText;
    } else if (this.clearCountdown > 0 && this.enemies.length === 0) {
      bannerText = this.wave === FINAL_WAVE ? '결전 종료' : '다음 웨이브 준비 중';
    } else if (this.waveType === 'boss') {
      bannerText =
        this.wave === FINAL_WAVE ? '20웨이브 최종보스' : `${this.wave}웨이브 보스`;
    } else {
      bannerText = `웨이브 ${this.wave}`;
    }

    ctx.save();
    ctx.globalAlpha = this.isUpgradePaused ? 0.96 : 0.88;
    ctx.fillStyle = 'rgba(11, 21, 15, 0.62)';
    ctx.fillRect(GAME_WIDTH / 2 - 170, 20, 340, 46);
    ctx.fillStyle = '#fff2c8';
    ctx.font = "700 22px 'Trebuchet MS', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText(bannerText, GAME_WIDTH / 2, 50);
    ctx.restore();
  }
}
