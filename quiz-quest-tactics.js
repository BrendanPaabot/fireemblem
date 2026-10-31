const SAMPLE_QUESTIONS = {
  easy: [
    { id: 'e1', question: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyperlink and Text Markup', 'Home Tool Markup Language'], correct: 0, hint: 'It marks up hyper text.' },
    { id: 'e2', question: 'Which company developed JavaScript?', options: ['Microsoft', 'Netscape', 'Google', 'Apple'], correct: 1, hint: 'Think of the Navigator browser.' },
    { id: 'e3', question: 'In gaming, what does NPC stand for?', options: ['New Player Character', 'Non-Playable Character', 'Next Phase Combat', 'Network Protocol Controller'], correct: 1, hint: 'Characters you cannot control.' }
  ],
  medium: [
    { id: 'm1', question: 'Which data structure uses LIFO?', options: ['Queue', 'Tree', 'Stack', 'Linked List'], correct: 2, hint: 'Think of a pile of plates.' },
    { id: 'm2', question: 'What is the time complexity of binary search?', options: ['O(1)', 'O(n)', 'O(n log n)', 'O(log n)'], correct: 3, hint: 'It halves the search space each time.' },
    { id: 'm3', question: 'Which protocol is used to securely browse the web?', options: ['HTTP', 'FTP', 'HTTPS', 'SMTP'], correct: 2, hint: 'The S stands for Secure.' }
  ],
  hard: [
    { id: 'h1', question: 'In Git, what command saves your changes to the local repository?', options: ['git push', 'git commit', 'git add', 'git save'], correct: 1, hint: 'You are committing to the changes.' },
    { id: 'h2', question: 'What is the main purpose of a Docker container?', options: ['To design UI', 'To virtualize OS', 'To package apps with dependencies', 'To compile code'], correct: 2, hint: 'It makes it run anywhere.' },
    { id: 'h3', question: 'Which design pattern restricts a class to a single instance?', options: ['Factory', 'Observer', 'Singleton', 'Decorator'], correct: 2, hint: 'Single.' }
  ],
  impossible: [
    { id: 'imp1', type: 'fill', question: 'In Python, the keyword used to define a function is ___.', answer: 'def', hint: 'Three letters.' },
    { id: 'imp2', type: 'fill', question: 'In SQL, the clause used to filter records is called _____.', answer: 'where', hint: 'It specifies a condition.' },
    { id: 'imp3', type: 'fill', question: 'The CSS property to change text color is simply called _____.', answer: 'color', hint: 'Very straightforward.' },
    { id: 'imp4', type: 'fill', question: 'In React, the hook for side effects is use_____.', answer: 'Effect', hint: 'CamelCase, ends with Effect.' }
  ]
};

const state = {
  currentScreen: 'LOGIN',
  player: {
    username: 'Commander',
    level: 1,
    xp: 0,
    maxXp: 100,
    gold: 0,
    gems: 0,
    wins: 0,
    losses: 0
  },
  settings: {
    sfx: true,
    volume: 0.5
  },
  tacticalState: {
    gridSize: 6,
    units: [],
    phase: 'PLAYER_PHASE_BANNER',
    selectedUnitId: null,
    moveOptions: [],
    attackOptions: [],
    enemyQueue: [],
    logs: ['Encounter started! Position your units.']
  },
  combatState: {
    isActive: false,
    attackerId: null,
    defenderId: null,
    question: null,
    advantage: 0,
    isDefense: false,
    timeRemaining: 15
  },
  blankInput: '',
  timerRef: null,
  combatLock: false,
  showSettings: false
};

const refs = {};

function cacheRefs() {
  refs.loginScreen = document.getElementById('login-screen');
  refs.menuScreen = document.getElementById('menu-screen');
  refs.gameScreen = document.getElementById('game-screen');
  refs.gameOverScreen = document.getElementById('game-over-screen');
  refs.phaseBanner = document.getElementById('phase-banner');
  refs.battleGrid = document.getElementById('battle-grid');
  refs.questionPanel = document.getElementById('question-panel');
  refs.answerArea = document.getElementById('answer-area');
  refs.battleLog = document.getElementById('battle-log');
  refs.phaseLabel = document.getElementById('phase-label');
  refs.endTurnButton = document.getElementById('end-turn-button');
  refs.playerNameInput = document.getElementById('player-name');
  refs.profileName = document.getElementById('profile-name');
  refs.xpText = document.getElementById('xp-text');
  refs.xpFill = document.getElementById('xp-fill');
  refs.goldCount = document.getElementById('gold-count');
  refs.gemCount = document.getElementById('gem-count');
  refs.resultTitle = document.getElementById('result-title');
  refs.resultMessage = document.getElementById('result-message');
  refs.settingsDialog = document.getElementById('settings-dialog');
  refs.sfxToggle = document.getElementById('sfx-toggle');
  refs.volumeSlider = document.getElementById('volume-slider');
  refs.questionText = document.getElementById('question-text');
  refs.questionDifficulty = document.getElementById('question-difficulty');
  refs.combatTimer = document.getElementById('combat-timer');
  refs.settingsButton = document.getElementById('settings-button');
  refs.closeSettings = document.getElementById('close-settings');
  refs.retreatButton = document.getElementById('retreat-button');
  refs.startLogin = document.getElementById('start-login');
  refs.launchBattle = document.getElementById('launch-battle');
  refs.playAgain = document.getElementById('play-again');
  refs.endTurnButton = document.getElementById('end-turn-button');
}

function setScreen(name) {
  state.currentScreen = name;
  const screens = {
    LOGIN: refs.loginScreen,
    MAIN_MENU: refs.menuScreen,
    GAME: refs.gameScreen,
    GAME_OVER: refs.gameOverScreen
  };

  Object.entries(screens).forEach(([key, el]) => {
    el.classList.toggle('active', key === name);
  });
}

function updateProfile() {
  refs.profileName.textContent = state.player.username || 'Commander';
  refs.xpText.textContent = `${state.player.xp} / ${state.player.maxXp}`;
  refs.xpFill.style.width = `${(state.player.xp / state.player.maxXp) * 100}%`;
  refs.goldCount.textContent = state.player.gold;
  refs.gemCount.textContent = state.player.gems;
}

function setSettingsVisible(visible) {
  refs.settingsDialog.classList.toggle('hidden', !visible);
  state.showSettings = visible;
}

function playSound(type) {
  if (!state.settings.sfx) return;

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const volume = state.settings.volume || 0.5;

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.08 * volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    } else if (type === 'hit') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.16 * volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    } else if (type === 'correct') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.12 * volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    } else if (type === 'wrong') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.12 * volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
    } else if (type === 'phase') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.setValueAtTime(450, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12 * volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    }

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (error) {
    console.log('Audio error:', error);
  }
}

function getDistance(x1, y1, x2, y2) {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

function getWeaponAdvantage(atkType, defType) {
  if (atkType === 'Sword' && defType === 'Axe') return 1;
  if (atkType === 'Axe' && defType === 'Lance') return 1;
  if (atkType === 'Lance' && defType === 'Sword') return 1;
  if (atkType === 'Sword' && defType === 'Lance') return -1;
  if (atkType === 'Axe' && defType === 'Sword') return -1;
  if (atkType === 'Lance' && defType === 'Axe') return -1;
  return 0;
}

function addTacticalLog(msg) {
  state.tacticalState.logs = [msg, ...state.tacticalState.logs].slice(0, 5);
  renderBattleLog();
}

function renderBattleLog() {
  refs.battleLog.innerHTML = '';
  state.tacticalState.logs.slice(0, 5).forEach((log) => {
    const div = document.createElement('div');
    div.className = 'entry';
    div.textContent = log;
    refs.battleLog.appendChild(div);
  });
}

function startBattle() {
  playSound('click');
  const initialUnits = [
    { id: 'p1', x: 1, y: 5, hp: 100, maxHp: 100, type: 'Sword', isPlayer: true, hasAction: true, icon: '⚔️', name: 'Hero' },
    { id: 'p2', x: 3, y: 5, hp: 100, maxHp: 100, type: 'Axe', isPlayer: true, hasAction: true, icon: '🪓', name: 'Fighter' },
    { id: 'p3', x: 2, y: 4, hp: 100, maxHp: 100, type: 'Lance', isPlayer: true, hasAction: true, icon: '🔱', name: 'Knight' },
    { id: 'e1', x: 1, y: 0, hp: 80, maxHp: 80, type: 'Axe', isPlayer: false, hasAction: true, icon: '👹', name: 'Bandit' },
    { id: 'e2', x: 4, y: 1, hp: 80, maxHp: 80, type: 'Sword', isPlayer: false, hasAction: true, icon: '👺', name: 'Mercenary' },
    { id: 'e3', x: 2, y: 1, hp: 80, maxHp: 80, type: 'Lance', isPlayer: false, hasAction: true, icon: '🦇', name: 'Gargoyle' }
  ];

  state.tacticalState = {
    gridSize: 6,
    units: initialUnits,
    phase: 'PLAYER_PHASE_BANNER',
    selectedUnitId: null,
    moveOptions: [],
    attackOptions: [],
    enemyQueue: [],
    logs: ['Battle Commences! Player Phase starts.']
  };

  state.combatState = {
    isActive: false,
    attackerId: null,
    defenderId: null,
    question: null,
    advantage: 0,
    isDefense: false,
    timeRemaining: 15
  };

  state.combatLock = false;
  clearTimer();
  setScreen('GAME');
  render();
  playSound('phase');

  showPhaseBanner('PLAYER PHASE');
  setTimeout(() => {
    state.tacticalState.phase = 'PLAYER';
    refs.phaseLabel.textContent = 'PLAYER TURN';
    render();
  }, 1800);
}

function showPhaseBanner(text) {
  refs.phaseBanner.textContent = text;
  refs.phaseBanner.classList.remove('hidden');
  setTimeout(() => {
    refs.phaseBanner.classList.add('hidden');
  }, 1400);
}

function render() {
  updateProfile();
  renderGrid();
  renderQuestion();
  renderBattleLog();
  updatePhaseUI();
}

function updatePhaseUI() {
  const phase = state.tacticalState.phase;
  const phaseMap = {
    PLAYER: 'PLAYER TURN',
    ENEMY: 'ENEMY TURN',
    PLAYER_PHASE_BANNER: 'PLAYER TURN',
    ENEMY_PHASE_BANNER: 'ENEMY TURN'
  };
  refs.phaseLabel.textContent = phaseMap[phase] || 'PLAYER TURN';
  refs.endTurnButton.classList.toggle('hidden', !(phase === 'PLAYER' && !state.combatState.isActive));
}

function renderGrid() {
  refs.battleGrid.innerHTML = '';

  const { gridSize, units, selectedUnitId, moveOptions, attackOptions } = state.tacticalState;

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const cell = document.createElement('div');
      cell.className = `grid-cell ${(x + y) % 2 === 0 ? 'even' : ''}`;

      const isMove = moveOptions.some((opt) => opt.x === x && opt.y === y);
      const isAttack = attackOptions.some((opt) => opt.x === x && opt.y === y);
      const unit = units.find((u) => u.x === x && u.y === y);
      const isSelected = selectedUnitId && unit && unit.id === selectedUnitId;

      if (isMove) cell.classList.add('move-option');
      if (isAttack) cell.classList.add('attack-option');
      if (isSelected) cell.classList.add('selected');

      if (unit) {
        const token = document.createElement('div');
        token.className = `unit-token ${unit.isPlayer ? 'player' : 'enemy'} ${!unit.hasAction && unit.isPlayer ? 'dimmed' : ''}`;
        token.textContent = unit.icon;

        const weapon = document.createElement('span');
        weapon.className = 'weapon-mark';
        weapon.textContent = unit.type[0];
        token.appendChild(weapon);

        const hpBar = document.createElement('div');
        hpBar.className = 'hp-bar';
        const hpFill = document.createElement('span');
        hpFill.style.width = `${(unit.hp / unit.maxHp) * 100}%`;
        hpBar.appendChild(hpFill);
        token.appendChild(hpBar);

        cell.appendChild(token);
      }

      cell.addEventListener('click', () => handleGridClick(x, y));
      refs.battleGrid.appendChild(cell);
    }
  }
}

function handleGridClick(x, y) {
  if (state.tacticalState.phase !== 'PLAYER' || state.combatState.isActive) return;

  const clickedUnit = state.tacticalState.units.find((u) => u.x === x && u.y === y);
  const { selectedUnitId, units, moveOptions, attackOptions } = state.tacticalState;

  if (attackOptions.some((opt) => opt.x === x && opt.y === y)) {
    initiateCombat(selectedUnitId, clickedUnit.id, units);
    return;
  }

  if (moveOptions.some((opt) => opt.x === x && opt.y === y)) {
    playSound('click');
    const newUnits = units.map((u) => (u.id === selectedUnitId ? { ...u, x, y } : u));
    const attacker = newUnits.find((u) => u.id === selectedUnitId);
    const newAttackOps = newUnits
      .filter((u) => !u.isPlayer && getDistance(attacker.x, attacker.y, u.x, u.y) === 1)
      .map((u) => ({ x: u.x, y: u.y, targetId: u.id }));

    const finalUnits = newAttackOps.length === 0
      ? newUnits.map((u) => (u.id === selectedUnitId ? { ...u, hasAction: false } : u))
      : newUnits;

    state.tacticalState.units = finalUnits;
    state.tacticalState.selectedUnitId = null;
    state.tacticalState.moveOptions = [];
    state.tacticalState.attackOptions = newAttackOps.length === 0 ? [] : newAttackOps;

    if (newAttackOps.length === 0) {
      checkEndPlayerPhase(finalUnits);
    }

    render();
    return;
  }

  if (clickedUnit && clickedUnit.isPlayer && clickedUnit.hasAction) {
    playSound('click');
    const moves = [];
    for (let i = 0; i < state.tacticalState.gridSize; i += 1) {
      for (let j = 0; j < state.tacticalState.gridSize; j += 1) {
        if (getDistance(clickedUnit.x, clickedUnit.y, i, j) <= 2 && !units.some((u) => u.x === i && u.y === j)) {
          moves.push({ x: i, y: j });
        }
      }
    }

    const attacks = units
      .filter((u) => !u.isPlayer && getDistance(clickedUnit.x, clickedUnit.y, u.x, u.y) === 1)
      .map((u) => ({ x: u.x, y: u.y, targetId: u.id }));

    state.tacticalState.selectedUnitId = clickedUnit.id;
    state.tacticalState.moveOptions = moves;
    state.tacticalState.attackOptions = attacks;
    render();
    return;
  }

  state.tacticalState.selectedUnitId = null;
  state.tacticalState.moveOptions = [];
  state.tacticalState.attackOptions = [];
  render();
}

function checkEndPlayerPhase(currentUnits) {
  if (!currentUnits.some((unit) => unit.isPlayer && unit.hasAction)) {
    triggerEnemyPhase(currentUnits);
  }
}

function triggerEnemyPhase(currentUnits) {
  playSound('phase');
  state.tacticalState.phase = 'ENEMY_PHASE_BANNER';
  state.tacticalState.enemyQueue = currentUnits.filter((u) => !u.isPlayer && u.hp > 0).map((u) => u.id);
  render();
  showPhaseBanner('ENEMY PHASE');

  setTimeout(() => {
    state.tacticalState.phase = 'ENEMY';
    render();
  }, 1700);
}

function processNextEnemy() {
  const q = [...state.tacticalState.enemyQueue];
  const enemyId = q.shift();
  const units = [...state.tacticalState.units];
  const enemy = units.find((u) => u.id === enemyId);

  if (!enemy || enemy.hp <= 0) {
    state.tacticalState.enemyQueue = q;
    render();
    return;
  }

  let targetPlayer = null;
  let minDistance = Infinity;

  units.filter((u) => u.isPlayer && u.hp > 0).forEach((playerUnit) => {
    const d = getDistance(enemy.x, enemy.y, playerUnit.x, playerUnit.y);
    if (d < minDistance) {
      minDistance = d;
      targetPlayer = playerUnit;
    }
  });

  if (!targetPlayer) {
    state.tacticalState.enemyQueue = q;
    render();
    return;
  }

  let newX = enemy.x;
  let newY = enemy.y;

  if (minDistance > 1) {
    let testX = enemy.x + (targetPlayer.x > enemy.x ? 1 : targetPlayer.x < enemy.x ? -1 : 0);
    let testY = enemy.y;
    if (testX !== enemy.x && !units.some((u) => u.x === testX && u.y === testY)) {
      newX = testX;
    } else {
      testX = enemy.x;
      testY = enemy.y + (targetPlayer.y > enemy.y ? 1 : targetPlayer.y < enemy.y ? -1 : 0);
      if (testY !== enemy.y && !units.some((u) => u.x === testX && u.y === testY)) {
        newY = testY;
      }
    }
  }

  const updatedUnits = units.map((u) => (u.id === enemyId ? { ...u, x: newX, y: newY, hasAction: false } : u));
  const newDistance = getDistance(newX, newY, targetPlayer.x, targetPlayer.y);

  state.tacticalState.units = updatedUnits;
  state.tacticalState.enemyQueue = q;

  if (newDistance === 1) {
    setTimeout(() => initiateCombat(enemyId, targetPlayer.id, updatedUnits), 100);
  }

  render();
}

function startEnemyTurnLoop() {
  const { phase, enemyQueue, units } = state.tacticalState;
  if (phase !== 'ENEMY' || state.combatState.isActive) return;

  if (enemyQueue.length > 0) {
    setTimeout(() => processNextEnemy(), 700);
    return;
  }

  const activeEnemies = units.filter((u) => !u.isPlayer && u.hp > 0);
  if (activeEnemies.length === 0) return;

  playSound('phase');
  state.tacticalState.phase = 'PLAYER_PHASE_BANNER';
  render();
  showPhaseBanner('PLAYER PHASE');

  setTimeout(() => {
    state.tacticalState.phase = 'PLAYER';
    state.tacticalState.units = state.tacticalState.units.map((u) => (u.isPlayer ? { ...u, hasAction: true } : u));
    render();
  }, 1700);
}

function initiateCombat(attackerId, defenderId, units = state.tacticalState.units) {
  if (!attackerId || !defenderId || state.combatLock) return;

  const attacker = units.find((u) => u.id === attackerId);
  const defender = units.find((u) => u.id === defenderId);
  if (!attacker || !defender || attacker.hp <= 0 || defender.hp <= 0) return;

  playSound('hit');
  const advantage = getWeaponAdvantage(attacker.type, defender.type);
  let pool = SAMPLE_QUESTIONS.medium;
  if (advantage === 1) pool = SAMPLE_QUESTIONS.easy;
  else if (advantage === -1) pool = SAMPLE_QUESTIONS.impossible;
  else pool = [...SAMPLE_QUESTIONS.medium, ...SAMPLE_QUESTIONS.hard];

  const question = pool[Math.floor(Math.random() * pool.length)];

  state.combatState = {
    isActive: true,
    attackerId,
    defenderId,
    question,
    advantage,
    isDefense: !attacker.isPlayer,
    timeRemaining: advantage === -1 ? 20 : 15
  };

  state.blankInput = '';
  state.combatLock = false;
  addTacticalLog(`⚔️ ${attacker.name} attacks ${defender.name}! Advantage: ${advantage > 0 ? 'YES' : advantage < 0 ? 'DISADVANTAGE' : 'NEUTRAL'}`);
  renderQuestion();
  startTimer();
}

function renderQuestion() {
  const { question } = state.combatState;
  if (!question) {
    refs.answerArea.innerHTML = '';
    refs.questionText.textContent = 'Choose a unit and attack.';
    refs.questionDifficulty.textContent = 'Ready';
    refs.combatTimer.textContent = '15s';
    return;
  }

  refs.questionDifficulty.textContent = question.type === 'fill' ? 'Impossible' : (state.combatState.advantage === 1 ? 'Easy' : state.combatState.advantage === -1 ? 'Impossible' : 'Medium');
  refs.questionText.textContent = question.question;
  refs.combatTimer.textContent = `${state.combatState.timeRemaining}s`;

  if (question.type === 'fill') {
    refs.answerArea.innerHTML = `
      <input id="fill-answer" class="answer-input" value="${state.blankInput}" placeholder="Type your answer..." />
      <button class="submit-answer" type="button" id="submit-answer">Submit</button>
    `;
    const input = document.getElementById('fill-answer');
    input.addEventListener('input', (event) => {
      state.blankInput = event.target.value;
    });
    document.getElementById('submit-answer').addEventListener('click', () => {
      handleAnswerSubmit(state.blankInput);
    });
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'answer-grid';
  question.options.forEach((option, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'answer-option';
    btn.textContent = option;
    btn.addEventListener('click', () => handleAnswerSubmit(index));
    grid.appendChild(btn);
  });
  refs.answerArea.innerHTML = '';
  refs.answerArea.appendChild(grid);
}

function startTimer() {
  clearTimer();
  state.timerRef = setInterval(() => {
    if (!state.combatState.isActive) {
      clearTimer();
      return;
    }

    state.combatState.timeRemaining -= 1;
    refs.combatTimer.textContent = `${state.combatState.timeRemaining}s`;

    if (state.combatState.timeRemaining <= 0) {
      clearTimer();
      resolveCombat(false);
    }
  }, 1000);
}

function clearTimer() {
  if (state.timerRef) {
    clearInterval(state.timerRef);
    state.timerRef = null;
  }
}

function handleAnswerSubmit(value) {
  if (!state.combatState.isActive || !state.combatState.question || state.combatLock) return;
  clearTimer();

  let isCorrect = false;
  if (state.combatState.question.type === 'fill') {
    isCorrect = String(value).trim().toLowerCase() === state.combatState.question.answer.toLowerCase();
  } else {
    isCorrect = value === state.combatState.question.correct;
  }

  resolveCombat(isCorrect);
}

function resolveCombat(isCorrect) {
  if (!state.combatState.isActive || state.combatLock) return;

  state.combatLock = true;
  const { attackerId, defenderId, isDefense, advantage } = state.combatState;
  let units = [...state.tacticalState.units];
  let attacker = units.find((u) => u.id === attackerId);
  let defender = units.find((u) => u.id === defenderId);

  if (!attacker || !defender) {
    state.combatLock = false;
    state.combatState = { isActive: false, attackerId: null, defenderId: null, question: null, advantage: 0, isDefense: false, timeRemaining: 15 };
    renderQuestion();
    return;
  }

  let logMsg = '';

  if (isDefense) {
    if (isCorrect) {
      playSound('correct');
      const dmg = 25 + advantage * 10;
      attacker.hp -= dmg;
      logMsg = `✨ PERFECT DEFENSE! ${defender.name} countered for ${dmg} damage!`;
    } else {
      playSound('wrong');
      const dmg = 35 + advantage * 10;
      defender.hp -= dmg;
      logMsg = `💥 HIT! ${defender.name} took ${dmg} damage!`;
    }
  } else {
    if (isCorrect) {
      playSound('correct');
      const isCrit = Math.random() < 0.2 || advantage === 1;
      const dmg = (30 + (advantage * 15)) * (isCrit ? 1.5 : 1);
      defender.hp -= Math.floor(dmg);
      logMsg = `🔥 ${isCrit ? 'CRITICAL ' : ''}STRIKE! ${attacker.name} dealt ${Math.floor(dmg)} damage!`;
    } else {
      playSound('wrong');
      const dmg = 20 - (advantage * 5);
      attacker.hp -= dmg;
      logMsg = `❌ MISS! ${defender.name} countered for ${dmg} damage!`;
    }
    attacker.hasAction = false;
  }

  units = units.filter((u) => u.hp > 0);
  state.tacticalState.units = units;
  state.tacticalState.selectedUnitId = null;
  state.tacticalState.moveOptions = [];
  state.tacticalState.attackOptions = [];
  addTacticalLog(logMsg);

  state.combatState = {
    isActive: false,
    attackerId: null,
    defenderId: null,
    question: null,
    advantage: 0,
    isDefense: false,
    timeRemaining: 15
  };

  state.combatLock = false;
  render();

  const remainingPlayers = units.filter((u) => u.isPlayer).length;
  const remainingEnemies = units.filter((u) => !u.isPlayer).length;

  setTimeout(() => {
    if (remainingPlayers === 0) {
      handleGameFinished(false);
    } else if (remainingEnemies === 0) {
      handleGameFinished(true);
    } else if (!isDefense) {
      checkEndPlayerPhase(units);
    }
  }, 500);
}

function handleGameFinished(isVictory) {
  const xpEarned = isVictory ? 250 : 50;
  const goldEarned = isVictory ? 150 : 25;

  state.player.gold += goldEarned;
  state.player.gems += isVictory ? 5 : 1;
  state.player.wins += isVictory ? 1 : 0;
  state.player.losses += isVictory ? 0 : 1;

  const updatedXp = state.player.xp + xpEarned;
  let level = state.player.level;
  let xpRemaining = updatedXp;

  while (xpRemaining >= state.player.maxXp) {
    xpRemaining -= state.player.maxXp;
    level += 1;
    state.player.maxXp = Math.round(state.player.maxXp * 1.3);
  }

  state.player.level = level;
  state.player.xp = xpRemaining;

  refs.resultTitle.textContent = isVictory ? 'Victory!' : 'Defeat';
  refs.resultMessage.textContent = isVictory
    ? `You won the battle and earned ${xpEarned} XP and ${goldEarned} gold.`
    : `You were defeated, but still earned ${xpEarned} XP.`;

  setScreen('GAME_OVER');
  updateProfile();
}

function endPlayerPhaseEarly() {
  playSound('click');
  const resetUnits = state.tacticalState.units.map((unit) => (unit.isPlayer ? { ...unit, hasAction: false } : unit));
  state.tacticalState.units = resetUnits;
  state.tacticalState.selectedUnitId = null;
  state.tacticalState.moveOptions = [];
  state.tacticalState.attackOptions = [];
  triggerEnemyPhase(resetUnits);
  render();
}

function attachEvents() {
  refs.startLogin.addEventListener('click', () => {
    const name = refs.playerNameInput.value.trim();
    state.player.username = name || 'Commander';
    setScreen('MAIN_MENU');
    updateProfile();
    playSound('click');
  });

  refs.launchBattle.addEventListener('click', () => {
    startBattle();
  });

  refs.retreatButton.addEventListener('click', () => {
    playSound('click');
    setScreen('MAIN_MENU');
  });

  refs.playAgain.addEventListener('click', () => {
    setScreen('MAIN_MENU');
    playSound('click');
  });

  refs.settingsButton.addEventListener('click', () => {
    setSettingsVisible(true);
    playSound('click');
  });

  refs.closeSettings.addEventListener('click', () => {
    setSettingsVisible(false);
  });

  refs.sfxToggle.addEventListener('change', (event) => {
    state.settings.sfx = event.target.checked;
  });

  refs.volumeSlider.addEventListener('input', (event) => {
    state.settings.volume = Number(event.target.value);
  });

  refs.endTurnButton.addEventListener('click', () => {
    endPlayerPhaseEarly();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setSettingsVisible(false);
  });
}

function boot() {
  cacheRefs();
  attachEvents();
  updateProfile();
  setScreen('LOGIN');
  renderBattleLog();
}

document.addEventListener('DOMContentLoaded', boot);

setInterval(() => {
  if (state.currentScreen === 'GAME' && state.tacticalState.phase === 'ENEMY' && !state.combatState.isActive) {
    startEnemyTurnLoop();
  }
}, 250);
