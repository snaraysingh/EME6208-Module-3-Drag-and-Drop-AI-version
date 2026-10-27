/* ==========================================================
   DATA DEFINITIONS
   ========================================================== */
const ACTORS = [
  {
    id: 'denzel',
    name: 'Denzel Washington',
    image: 'Denzel_Washington.jpg',
    titles: ['Othello', 'Malcolm X', 'Fences']
  },
  {
    id: 'idris',
    name: 'Idris Elba',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    titles: ['Cats', 'Troilus and Cressida', 'Mandela']
  },
  {
    id: 'hugh',
    name: 'Hugh Jackman',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
    titles: ['The Boy from Oz', 'Les Misérables', 'The Greatest Showman']
  },
  {
    id: 'viola',
    name: 'Viola Davis',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    titles: ['Seven Guitars', 'The Woman King', 'Ma Rainey’s Black Bottom']
  },
  {
    id: 'cynthia',
    name: 'Cynthia Erivo',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    titles: ['The Color Purple', 'Sister Act', 'Harriet']
  },
  {
    id: 'meryl',
    name: 'Meryl Streep',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    titles: ['Mamma Mia', 'The Iron Lady', 'The Taming of the Shrew']
  }
];

const DECOYS = [
  'A Beautiful Mind',
  'Pocahontas',
  'Ali',
  'Ray',
  'Gandhi',
  'Braveheart'
];

/* ==========================================================
   SYNTHETIC AUDIO SYSTEM (Web Audio API & Speech Synthesis)
   ========================================================== */
class SoundEngine {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // 1. Correct Title Ding
  playDing() {
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  // 2. Incorrect Title Buzz
  playBuzz() {
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.linearRampToValueAtTime(85, now + 0.28);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  // 3. Audience Claps
  playApplause() {
    this.init();
    const bufferSize = this.ctx.sampleRate * 2.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 1.6));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1100;
    filter.Q.value = 1.2;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.65, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 2.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
  }

  // 4. Audience Aww (Loss)
  playAww() {
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 1.2);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 1.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 1.2);
  }
}

const sound = new SoundEngine();

function speakHost(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.1;
    const voices = window.speechSynthesis.getVoices();
    const energeticVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Natural')) || voices.find(v => v.lang.startsWith('en'));
    if (energeticVoice) utterance.voice = energeticVoice;
    window.speechSynthesis.speak(utterance);
  }
}

/* ==========================================================
   GAME STATE & DOM ELEMENTS
   ========================================================== */
let score = 0;
let timeLeft = 180;
let timerInterval = null;
let isGameRunning = false;
let completedActorsCount = 0;

const scoreDisplay = document.getElementById('scoreDisplay');
const timerDisplay = document.getElementById('timerDisplay');
const hostMessage = document.getElementById('hostMessage');
const actorColumns = document.getElementById('actorColumns');
const wordBank = document.getElementById('wordBank');
const bankCount = document.getElementById('bankCount');
const toastPopup = document.getElementById('toastPopup');
const gameModal = document.getElementById('gameModal');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalActionBtn = document.getElementById('modalActionBtn');

/* ==========================================================
   STAGE SETUP
   ========================================================== */
function initStage() {
  actorColumns.innerHTML = '';
  ACTORS.forEach(actor => {
    const col = document.createElement('div');
    col.className = 'actor-card';
    col.id = `actor-card-${actor.id}`;
    col.dataset.actorId = actor.id;

    col.innerHTML = `
      <div class="actor-photo-frame">
        <img class="actor-photo" src="${actor.image}" alt="${actor.name}" />
      </div>
      <div class="actor-name">${actor.name}</div>
      <div class="slots-container">
        <div class="drop-slot" data-actor="${actor.id}" data-slot="1">Drop Production</div>
        <div class="drop-slot" data-actor="${actor.id}" data-slot="2">Drop Production</div>
        <div class="drop-slot" data-actor="${actor.id}" data-slot="3">Drop Production</div>
      </div>
    `;
    actorColumns.appendChild(col);
  });

  populateWordBank();
}

function populateWordBank() {
  wordBank.innerHTML = '';
  let allTitles = [];
  ACTORS.forEach(actor => {
    actor.titles.forEach(t => allTitles.push({ text: t, correctActor: actor.id }));
  });
  DECOYS.forEach(decoy => {
    allTitles.push({ text: decoy, correctActor: null });
  });

  // Fisher-Yates shuffle
  for (let i = allTitles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allTitles[i], allTitles[j]] = [allTitles[j], allTitles[i]];
  }

  allTitles.forEach(item => {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.textContent = item.text;
    tile.dataset.text = item.text;
    tile.dataset.actor = item.correctActor || 'decoy';
    attachDragEvents(tile);
    wordBank.appendChild(tile);
  });

  updateRemainingCount();
}

function updateRemainingCount() {
  const remaining = wordBank.querySelectorAll('.tile').length;
  bankCount.textContent = `${remaining} TITLES REMAINING`;
}

/* ==========================================================
   UNIVERSAL POINTER DRAG & DROP ENGINE
   ========================================================== */
let currentDragTile = null;
let ghostElement = null;

function attachDragEvents(tile) {
  tile.addEventListener('pointerdown', (e) => {
    if (!isGameRunning || tile.classList.contains('locked')) return;
    sound.init();

    currentDragTile = tile;
    tile.style.opacity = '0.3';

    ghostElement = tile.cloneNode(true);
    ghostElement.className = 'tile dragging-ghost';
    document.body.appendChild(ghostElement);
    positionGhost(e.clientX, e.clientY);

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  });
}

function positionGhost(x, y) {
  if (ghostElement) {
    ghostElement.style.left = `${x}px`;
    ghostElement.style.top = `${y}px`;
  }
}

function onPointerMove(e) {
  if (!currentDragTile) return;
  positionGhost(e.clientX, e.clientY);

  const targetSlot = getDropSlotUnderPointer(e.clientX, e.clientY);
  document.querySelectorAll('.drop-slot').forEach(slot => {
    slot.classList.toggle('drag-over', slot === targetSlot && !slot.classList.contains('filled'));
  });
}

function onPointerUp(e) {
  if (!currentDragTile) return;

  const dropSlot = getDropSlotUnderPointer(e.clientX, e.clientY);
  document.querySelectorAll('.drop-slot').forEach(s => s.classList.remove('drag-over'));

  if (dropSlot && !dropSlot.classList.contains('filled')) {
    handleDropAttempt(currentDragTile, dropSlot);
  } else {
    currentDragTile.style.opacity = '1';
  }

  if (ghostElement) {
    ghostElement.remove();
    ghostElement = null;
  }
  currentDragTile = null;

  window.removeEventListener('pointermove', onPointerMove);
  window.removeEventListener('pointerup', onPointerUp);
  window.removeEventListener('pointercancel', onPointerUp);
}

function getDropSlotUnderPointer(x, y) {
  const elements = document.elementsFromPoint(x, y);
  return elements.find(el => el.classList && el.classList.contains('drop-slot'));
}

/* ==========================================================
   EVALUATION & DROP LOGIC
   ========================================================== */
function handleDropAttempt(tile, slot) {
  const correctActor = tile.dataset.actor;
  const targetActor = slot.dataset.actor;

  if (correctActor === targetActor) {
    // CORRECT
    sound.playDing();
    score += 100;
    scoreDisplay.textContent = score;

    slot.innerHTML = '';
    slot.classList.add('filled');
    tile.classList.add('locked');
    tile.style.opacity = '1';
    slot.appendChild(tile);

    updateRemainingCount();
    checkActorCompletion(targetActor);
  } else {
    // INCORRECT OR DECOY
    sound.playBuzz();
    tile.style.opacity = '1';
    tile.classList.add('shake');
    showToast("TRY AGAIN!");

    setTimeout(() => {
      tile.classList.remove('shake');
    }, 500);
  }
}

function showToast(msg) {
  toastPopup.textContent = msg;
  toastPopup.classList.add('show');
  setTimeout(() => {
    toastPopup.classList.remove('show');
  }, 700);
}

function checkActorCompletion(actorId) {
  const card = document.getElementById(`actor-card-${actorId}`);
  const filledSlots = card.querySelectorAll('.drop-slot.filled');

  if (filledSlots.length === 3 && !card.classList.contains('completed')) {
    card.classList.add('completed');
    completedActorsCount++;

    hostMessage.textContent = '🌟 "SHOWSTOPPER!"';
    speakHost("Showstopper!");
    sound.playApplause();

    if (completedActorsCount === ACTORS.length) {
      endGame(true);
    }
  }
}

/* ==========================================================
   TIMER & GAME RUNTIME
   ========================================================== */
function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      endGame(false);
    }
  }, 1000);
}

function startGame() {
  score = 0;
  timeLeft = 180;
  completedActorsCount = 0;
  isGameRunning = true;
  scoreDisplay.textContent = score;
  timerDisplay.textContent = timeLeft;
  hostMessage.textContent = '"Place 3 correct films for each actor!"';

  gameModal.classList.add('hidden');
  initStage();
  startTimer();
  speakHost("Place 3 correct films for each actor!");
}

function endGame(hasWon) {
  isGameRunning = false;
  clearInterval(timerInterval);

  if (hasWon) {
    sound.playApplause();
    modalTitle.textContent = "🏆 STANDING OVATION!";
    modalDesc.innerHTML = `You completed all 6 Triple Threat legends!<br><br><strong>Final Score: ${score + timeLeft * 2} points</strong> (Includes Time Bonus)`;
    speakHost("Sensational performance! What a showstopper!");
  } else {
    sound.playAww();
    modalTitle.textContent = "🎭 CURTAIN CALL!";
    modalDesc.innerHTML = `Time ran out before the performance finished.<br><br><strong>Final Score: ${score} points</strong>`;
    speakHost("The curtain has fallen! Try again for an encore!");
  }

  modalActionBtn.textContent = "ENCORE!";
  gameModal.classList.remove('hidden');
}

/* ==========================================================
   EVENT LISTENERS
   ========================================================== */
modalActionBtn.addEventListener('click', () => {
  sound.init();
  startGame();
});

document.addEventListener('click', () => sound.init(), { once: true });
