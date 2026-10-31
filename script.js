/**
 * CRAQUE HERO — Jogo de Futebol Mobile
 * Mobile-First, Física delta-time (60/120Hz consistente),
 * Personalização de Times/Nome/Número, Power-ups no campo,
 * Zagueiros com movimentação natural e Disputa de Pênalti realista.
 */

// =========================================================
// BANCO DE DADOS DE TIMES E CORES
// =========================================================
const TEAMS = [
    { id: 'brasil', name: 'Brasil', primary: '#facc15', secondary: '#15803d', shorts: '#1d4ed8', socks: '#ffffff', stripes: false },
    { id: 'flamengo', name: 'Flamengo', primary: '#dc2626', secondary: '#0f172a', shorts: '#ffffff', socks: '#dc2626', stripes: 'horizontal' },
    { id: 'vasco', name: 'Vasco', primary: '#0f172a', secondary: '#ffffff', shorts: '#ffffff', socks: '#0f172a', stripes: 'sash' },
    { id: 'corinthians', name: 'Corinthians', primary: '#ffffff', secondary: '#0f172a', shorts: '#0f172a', socks: '#ffffff', stripes: false },
    { id: 'palmeiras', name: 'Palmeiras', primary: '#15803d', secondary: '#ffffff', shorts: '#ffffff', socks: '#15803d', stripes: false },
    { id: 'saopaulo', name: 'São Paulo', primary: '#ffffff', secondary: '#dc2626', shorts: '#ffffff', socks: '#ffffff', stripes: 'chest' },
    { id: 'santos', name: 'Santos', primary: '#ffffff', secondary: '#0f172a', shorts: '#ffffff', socks: '#0f172a', stripes: false },
    { id: 'realmadrid', name: 'Real Madrid', primary: '#ffffff', secondary: '#3b82f6', shorts: '#ffffff', socks: '#ffffff', stripes: false },
    { id: 'barcelona', name: 'Barcelona', primary: '#1e3a8a', secondary: '#991b1b', shorts: '#1e3a8a', socks: '#991b1b', stripes: 'vertical' },
    { id: 'argentina', name: 'Argentina', primary: '#38bdf8', secondary: '#ffffff', shorts: '#0f172a', socks: '#ffffff', stripes: 'vertical' },
    { id: 'portugal', name: 'Portugal', primary: '#b91c1c', secondary: '#15803d', shorts: '#15803d', socks: '#ffffff', stripes: false }
];

const SKINS = ['#fde68a', '#f59e0b', '#d97706', '#92400e', '#592911', '#3b1706'];
const HAIRS = ['#1e293b', '#451a03', '#78350f', '#eab308', '#f87171', '#94a3b8'];

// =========================================================
// SISTEMA DE ÁUDIO PROCEDURAL (Web Audio API)
// =========================================================
class AudioManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        if (!this.ctx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (AC) this.ctx = new AC();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    playKick() {
        if (!this.enabled || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(170, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.13);
            gain.gain.setValueAtTime(0.7, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.13);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.14);
        } catch (e) {}
    }

    playCoin() {
        if (!this.enabled || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(987, this.ctx.currentTime);
            osc.frequency.setValueAtTime(1318, this.ctx.currentTime + 0.08);
            gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.26);
        } catch (e) {}
    }

    playPowerup() {
        if (!this.enabled || !this.ctx) return;
        try {
            [440, 554, 659, 880].forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.06);
                gain.gain.setValueAtTime(0.25, this.ctx.currentTime + i * 0.06);
                gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3 + i * 0.06);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(this.ctx.currentTime + i * 0.06);
                osc.stop(this.ctx.currentTime + 0.35 + i * 0.06);
            });
        } catch (e) {}
    }

    playWhoosh() {
        if (!this.enabled || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(320, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.16);
            gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.16);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.17);
        } catch (e) {}
    }

    playAlert() {
        if (!this.enabled || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(900, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.09);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.09);
        } catch (e) {}
    }

    playWhistle(double = false) {
        if (!this.enabled || !this.ctx) return;
        try {
            const tone = (t, dur) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(2800, t);
                osc.frequency.linearRampToValueAtTime(3100, t + dur * 0.5);
                osc.frequency.linearRampToValueAtTime(2600, t + dur);
                gain.gain.setValueAtTime(0.2, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + dur);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(t);
                osc.stop(t + dur);
            };
            const now = this.ctx.currentTime;
            tone(now, 0.2);
            if (double) tone(now + 0.25, 0.32);
        } catch (e) {}
    }

    playGoalFanfare() {
        if (!this.enabled || !this.ctx) return;
        try {
            [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.09);
                gain.gain.setValueAtTime(0.3, this.ctx.currentTime + i * 0.09);
                gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.8 + i * 0.09);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(this.ctx.currentTime + i * 0.09);
                osc.stop(this.ctx.currentTime + 0.9 + i * 0.09);
            });
        } catch (e) {}
    }
}

const audio = new AudioManager();

// =========================================================
// ELEMENTOS DO DOM
// =========================================================
const appEl = document.getElementById('app');
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const previewCanvas = document.getElementById('preview');
const pCtx = previewCanvas.getContext('2d');

const hudEl = document.getElementById('hud');
const stageNumEl = document.getElementById('stage-num');
const progTxtEl = document.getElementById('prog-txt');
const progFillEl = document.getElementById('prog-fill');
const progBallEl = document.getElementById('prog-ball');
const scoreEl = document.getElementById('score');
const coinsEl = document.getElementById('coins');
const slowFillEl = document.getElementById('slow-fill');
const powerPillEl = document.getElementById('power-pill');
const powerFillEl = document.getElementById('power-fill');
const pauseBtn = document.getElementById('pause-btn');

const controlsEl = document.getElementById('controls');
const slowBtn = document.getElementById('slow-btn');
const spinBtn = document.getElementById('spin-btn');
const spinShadeEl = document.getElementById('spin-shade');

const toastEl = document.getElementById('toast');
const toastTitleEl = document.getElementById('toast-title');
const toastSubEl = document.getElementById('toast-sub');
const bannerEl = document.getElementById('banner');
const bannerKickerEl = document.getElementById('banner-kicker');
const bannerTitleEl = document.getElementById('banner-title');
const bannerSubEl = document.getElementById('banner-sub');

const penaltyUiEl = document.getElementById('penalty-ui');
const shootBtn = document.getElementById('shoot-btn');
const tutorialModal = document.getElementById('tutorial-modal');
const startMatchBtn = document.getElementById('start-match-btn');
const howToPlayBtn = document.getElementById('how-to-play-btn');
const fadeEl = document.getElementById('fade');

const menuScreen = document.getElementById('menu');
const nameInput = document.getElementById('name-input');
const numValEl = document.getElementById('num-val');
const numMinusBtn = document.getElementById('num-minus');
const numPlusBtn = document.getElementById('num-plus');
const skinRow = document.getElementById('skin-row');
const hairRow = document.getElementById('hair-row');
const teamGrid = document.getElementById('team-grid');
const playBtn = document.getElementById('play-btn');
const menuRecordEl = document.getElementById('menu-record');
const menuSoundBtn = document.getElementById('menu-sound');

const pauseScreen = document.getElementById('pause-screen');
const resumeBtn = document.getElementById('resume-btn');
const pauseSoundBtn = document.getElementById('pause-sound');
const pauseMenuBtn = document.getElementById('pause-menu');

const overScreen = document.getElementById('over-screen');
const newRecordEl = document.getElementById('new-record');
const overReasonEl = document.getElementById('over-reason');
const oScoreEl = document.getElementById('o-score');
const oStageEl = document.getElementById('o-stage');
const oDistEl = document.getElementById('o-dist');
const oGoalsEl = document.getElementById('o-goals');
const oDribblesEl = document.getElementById('o-dribbles');
const oCoinsEl = document.getElementById('o-coins');
const oBestEl = document.getElementById('o-best');
const againBtn = document.getElementById('again-btn');
const overMenuBtn = document.getElementById('over-menu');

// =========================================================
// PERFIL DO JOGADOR (SALVO NO LOCALSTORAGE)
// =========================================================
const profile = {
    name: 'VICENTE',
    number: 10,
    teamId: 'brasil',
    skin: SKINS[0],
    hair: HAIRS[0],
    highScore: 0,
    totalCoins: 0,
    load() {
        try {
            const data = JSON.parse(localStorage.getItem('craque_hero_profile') || '{}');
            if (data.name) this.name = data.name;
            if (data.number) this.number = data.number;
            if (data.teamId) this.teamId = data.teamId;
            if (data.skin) this.skin = data.skin;
            if (data.hair) this.hair = data.hair;
            if (data.highScore) this.highScore = data.highScore;
            if (data.totalCoins) this.totalCoins = data.totalCoins;
        } catch (e) {}
    },
    save() {
        try {
            localStorage.setItem('craque_hero_profile', JSON.stringify({
                name: this.name,
                number: this.number,
                teamId: this.teamId,
                skin: this.skin,
                hair: this.hair,
                highScore: this.highScore,
                totalCoins: this.totalCoins
            }));
        } catch (e) {}
    },
    getTeam() {
        return TEAMS.find(t => t.id === this.teamId) || TEAMS[0];
    }
};

profile.load();

// =========================================================
// ESTADO DO JOGO
// =========================================================
const STATE = {
    MENU: 'MENU',
    RUNNING: 'RUNNING',
    PAUSED: 'PAUSED',
    PENALTY_SETUP: 'PENALTY_SETUP',
    PENALTY_AIM: 'PENALTY_AIM',
    PENALTY_KICK: 'PENALTY_KICK',
    CELEBRATION: 'CELEBRATION',
    GAME_OVER: 'GAME_OVER'
};

let gameState = STATE.MENU;
let width = 0;
let height = 0;
let pitchMargin = 38;

// Partida
let stage = 1;
let stageDist = 0; // 0m a 1000m na fase atual
const STAGE_GOAL_METERS = 1000;
let totalDist = 0;
let score = 0;
let coinsSession = 0;
let dribbles = 0;
let goals = 0;

// Câmera lenta
let slowEnergy = 100;
let isSlowMo = false;
let timeScale = 1.0;
const SLOWMO_DRAIN_RATE = 28;     // Drena ~28% por segundo de slow-mo
const SLOWMO_RECOVERY_RATE = 22;  // Recupera ~22% por segundo

// Super velocidade (Chuteira de ouro)
let superSpeedTimer = 0;
const SUPER_SPEED_DURATION = 6.0;

// Giro (Spin move)
let spinCooldown = 0;
const SPIN_COOLDOWN_MAX = 4.0;
let isSpinning = false;
let spinAngle = 0;
let invulnerableTimer = 0;

// Rolagem e cenário
let scrollSpeed = 220; // pixels por segundo
let fieldY = 0;
let screenShake = 0;
let nextSpawnDist = 40;

// Jogador
const player = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    radius: 17,
    runCycle: 0,
    ballRot: 0
};

// Zagueiros
let defenders = [];

// Coletáveis no campo (isotônico, chuteira de ouro, moedas)
let pickups = [];

// Partículas
let particles = [];
let crowd = [];

// Pênalti
const goalPost = { y: 70, width: 280, height: 90, postThickness: 6 };
const goalie = { x: 0, y: 0, vx: 140, diveDir: 0, diveProgress: 0 };
const penaltyAim = { x: 0, y: 0, sweep: 0, isManual: false };
const penBall = { x: 0, y: 0, scale: 1.0, vx: 0, vy: 0 };
let penRunUp = 0;

// =========================================================
// RENDERIZAÇÃO DOS PERSONAGENS (SPRITES DE FUTEBOL)
// =========================================================
function drawSoccerPlayer(c, x, y, opts = {}) {
    const {
        team = profile.getTeam(),
        skin = profile.skin,
        hair = profile.hair,
        number = profile.number,
        runCycle = 0,
        rotation = 0,
        isGoalkeeper = false,
        isSliding = false,
        isGolden = false
    } = opts;

    c.save();
    c.translate(x, y);
    if (rotation) c.rotate(rotation);

    // Sombra oval
    c.beginPath();
    c.ellipse(0, 18, 18, 7, 0, 0, Math.PI * 2);
    c.fillStyle = 'rgba(0, 0, 0, 0.35)';
    c.fill();

    // Rastro da Chuteira de Ouro
    if (isGolden) {
        c.beginPath();
        c.arc(0, 0, 26, 0, Math.PI * 2);
        c.fillStyle = 'rgba(250, 204, 21, 0.28)';
        c.fill();
    }

    if (isSliding) {
        // Pose realista de carrinho de futebol na grama
        c.save();
        c.rotate(-0.35);
        // Perna flexionada de apoio
        c.fillStyle = team.shorts;
        c.fillRect(-14, 0, 10, 8);
        c.fillStyle = team.socks;
        c.fillRect(-18, 5, 8, 5);
        // Perna esticada no carrinho
        c.fillStyle = team.shorts;
        c.fillRect(0, 6, 20, 7);
        c.fillStyle = team.socks;
        c.fillRect(16, 6, 12, 6);
        c.fillStyle = '#0f172a';
        c.fillRect(26, 6, 6, 7); // Chuteira
        // Tronco inclinado
        c.fillStyle = team.primary;
        c.beginPath();
        c.roundRect(-10, -12, 24, 18, 4);
        c.fill();
        // Cabeça
        c.beginPath();
        c.arc(-4, -18, 8, 0, Math.PI * 2);
        c.fillStyle = skin;
        c.fill();
        c.restore();
        c.restore();
        return;
    }

    // Pernas animadas (calção, meião e chuteiras)
    const legSwing = Math.sin(runCycle) * 7;
    // Calção
    c.fillStyle = isGoalkeeper ? '#0f172a' : team.shorts;
    c.fillRect(-10, 4 + legSwing, 7, 7);
    c.fillRect(3, 4 - legSwing, 7, 7);
    // Meiões
    c.fillStyle = isGoalkeeper ? '#facc15' : team.socks;
    c.fillRect(-10, 10 + legSwing, 7, 7);
    c.fillRect(3, 10 - legSwing, 7, 7);
    // Chuteiras
    c.fillStyle = isGolden ? '#facc15' : '#0f172a';
    c.fillRect(-11, 16 + legSwing, 9, 4);
    c.fillRect(2, 16 - legSwing, 9, 4);

    // Tronco / Camisa
    c.fillStyle = isGoalkeeper ? '#facc15' : team.primary;
    c.beginPath();
    c.roundRect(-14, -14, 28, 20, 5);
    c.fill();

    // Detalhes da camisa (listras do clube)
    if (!isGoalkeeper) {
        if (team.stripes === 'vertical') {
            c.fillStyle = team.secondary;
            c.fillRect(-8, -14, 6, 20);
            c.fillRect(2, -14, 6, 20);
        } else if (team.stripes === 'horizontal') {
            c.fillStyle = team.secondary;
            c.fillRect(-14, -8, 28, 5);
            c.fillRect(-14, 0, 28, 5);
        } else if (team.stripes === 'chest') {
            c.fillStyle = '#dc2626';
            c.fillRect(-14, -6, 28, 4);
            c.fillStyle = '#0f172a';
            c.fillRect(-14, -2, 28, 4);
        } else if (team.stripes === 'sash') {
            // Faixa diagonal cruzando a camisa (Vasco da Gama)
            c.save();
            c.beginPath();
            c.roundRect(-14, -14, 28, 20, 5);
            c.clip();
            c.strokeStyle = team.secondary;
            c.lineWidth = 6;
            c.beginPath();
            c.moveTo(-16, 8);
            c.lineTo(16, -14);
            c.stroke();
            // Cruz de Malta vermelha no peito
            c.fillStyle = '#dc2626';
            c.fillRect(-2, -5, 4, 4);
            c.restore();
        } else {
            // Detalhe elegante nos ombros
            c.fillStyle = team.secondary;
            c.fillRect(-14, -14, 4, 10);
            c.fillRect(10, -14, 4, 10);
        }
    }

    // Contorno suave da camisa
    c.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    c.lineWidth = 1.2;
    c.stroke();

    // Número nas costas
    c.fillStyle = team.primary === '#ffffff' && team.stripes !== 'horizontal' ? '#0f172a' : '#ffffff';
    c.font = 'bold 11px sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(number.toString(), 0, -3);

    // Cabeça
    c.beginPath();
    c.arc(0, -18, 9, 0, Math.PI * 2);
    c.fillStyle = skin;
    c.fill();

    // Cabelo
    c.fillStyle = hair;
    c.beginPath();
    c.arc(0, -22, 8.5, Math.PI, Math.PI * 2);
    c.fill();

    // Luvas (se for goleiro)
    if (isGoalkeeper) {
        c.font = '16px sans-serif';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText('🧤', -16, 0);
        c.fillText('🧤', 16, 0);
    }

    c.restore();
}

// Mini preview do card de escolha de time
function drawMiniJersey(team, c) {
    c.clearRect(0, 0, 38, 38);
    c.save();
    c.translate(19, 19);
    c.fillStyle = team.primary;
    c.beginPath();
    c.roundRect(-12, -12, 24, 20, 4);
    c.fill();
    if (team.stripes === 'vertical') {
        c.fillStyle = team.secondary;
        c.fillRect(-7, -12, 5, 20);
        c.fillRect(2, -12, 5, 20);
    } else if (team.stripes === 'horizontal') {
        c.fillStyle = team.secondary;
        c.fillRect(-12, -7, 24, 4);
        c.fillRect(-12, 0, 24, 4);
    } else if (team.stripes === 'sash') {
        c.save();
        c.beginPath();
        c.roundRect(-12, -12, 24, 20, 4);
        c.clip();
        c.strokeStyle = team.secondary;
        c.lineWidth = 5;
        c.beginPath();
        c.moveTo(-14, 8);
        c.lineTo(14, -12);
        c.stroke();
        c.fillStyle = '#dc2626';
        c.fillRect(-2, -4, 4, 4);
        c.restore();
    } else {
        c.fillStyle = team.secondary;
        c.fillRect(-12, -12, 4, 8);
        c.fillRect(8, -12, 4, 8);
    }
    c.fillStyle = team.shorts;
    c.fillRect(-8, 8, 7, 7);
    c.fillRect(1, 8, 7, 7);
    c.restore();
}

// =========================================================
// INICIALIZAÇÃO DA INTERFACE DO MENU
// =========================================================
function initMenuUI() {
    nameInput.value = profile.name;
    numValEl.textContent = profile.number;
    menuRecordEl.textContent = `🏆 Recorde: ${profile.highScore}`;

    // Swatches de Pele
    skinRow.innerHTML = '';
    SKINS.forEach(color => {
        const div = document.createElement('div');
        div.className = 'swatch' + (color === profile.skin ? ' sel' : '');
        div.style.background = color;
        div.addEventListener('click', () => {
            profile.skin = color;
            document.querySelectorAll('#skin-row .swatch').forEach(s => s.classList.remove('sel'));
            div.classList.add('sel');
            profile.save();
            renderPreview();
        });
        skinRow.appendChild(div);
    });

    // Swatches de Cabelo
    hairRow.innerHTML = '';
    HAIRS.forEach(color => {
        const div = document.createElement('div');
        div.className = 'swatch' + (color === profile.hair ? ' sel' : '');
        div.style.background = color;
        div.addEventListener('click', () => {
            profile.hair = color;
            document.querySelectorAll('#hair-row .swatch').forEach(s => s.classList.remove('sel'));
            div.classList.add('sel');
            profile.save();
            renderPreview();
        });
        hairRow.appendChild(div);
    });

    // Grid de Times
    teamGrid.innerHTML = '';
    TEAMS.forEach(team => {
        const chip = document.createElement('div');
        chip.className = 'team-chip' + (team.id === profile.teamId ? ' sel' : '');
        const miniC = document.createElement('canvas');
        miniC.width = 38;
        miniC.height = 38;
        drawMiniJersey(team, miniC.getContext('2d'));
        const span = document.createElement('span');
        span.textContent = team.name;
        chip.appendChild(miniC);
        chip.appendChild(span);
        chip.addEventListener('click', () => {
            profile.teamId = team.id;
            document.querySelectorAll('#team-grid .team-chip').forEach(c => c.classList.remove('sel'));
            chip.classList.add('sel');
            profile.save();
            renderPreview();
        });
        teamGrid.appendChild(chip);
    });

    // Nome
    nameInput.addEventListener('input', () => {
        profile.name = nameInput.value.toUpperCase().slice(0, 10) || 'CRAQUE';
        profile.save();
        renderPreview();
    });

    // Número
    numMinusBtn.addEventListener('click', () => {
        profile.number = Math.max(1, profile.number - 1);
        numValEl.textContent = profile.number;
        profile.save();
        renderPreview();
    });
    numPlusBtn.addEventListener('click', () => {
        profile.number = Math.min(99, profile.number + 1);
        numValEl.textContent = profile.number;
        profile.save();
        renderPreview();
    });

    // Som no menu
    menuSoundBtn.addEventListener('click', () => {
        audio.init();
        const on = audio.toggle();
        menuSoundBtn.textContent = on ? '🔊 Som' : '🔇 Mudo';
    });
}

function renderPreview() {
    previewCanvas.width = 130;
    previewCanvas.height = 170;
    pCtx.clearRect(0, 0, 130, 170);

    // Linhas de grama no preview
    pCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    pCtx.lineWidth = 2;
    pCtx.beginPath();
    pCtx.arc(65, 170, 45, Math.PI, 0);
    pCtx.stroke();

    // Jogador animando suavemente
    const t = performance.now() * 0.004;
    drawSoccerPlayer(pCtx, 65, 80, {
        team: profile.getTeam(),
        skin: profile.skin,
        hair: profile.hair,
        number: profile.number,
        runCycle: t
    });

    // Nome nas costas (em cima do boneco no preview)
    pCtx.font = 'bold 11px sans-serif';
    pCtx.fillStyle = '#ffffff';
    pCtx.textAlign = 'center';
    pCtx.fillText(profile.name, 65, 48);

    // Bola aos pés
    pCtx.font = '22px sans-serif';
    pCtx.fillText('⚽', 65, 114);
}

// =========================================================
// REDIMENSIONAMENTO DO CANVAS PRINCIPAL
// =========================================================
function resize() {
    const rect = appEl.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.ceil(rect.width);
    height = Math.ceil(rect.height);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    pitchMargin = Math.max(30, Math.round(width * 0.1));
    goalPost.width = Math.min(300, width * 0.82);
    goalPost.postThickness = 6;

    initCrowd();
}

function initCrowd() {
    crowd = [];
    const colors = ['#facc15', '#38bdf8', '#22c55e', '#ef4444', '#ffffff', '#fb923c'];
    for (let i = 0; i < 30; i++) {
        crowd.push({ side: 'left', x: Math.random() * (pitchMargin - 16) + 8, baseY: i * 36, color: colors[i % colors.length], offset: Math.random() * Math.PI * 2 });
        crowd.push({ side: 'right', x: width - pitchMargin + 8 + Math.random() * (pitchMargin - 16), baseY: i * 36, color: colors[(i + 2) % colors.length], offset: Math.random() * Math.PI * 2 });
    }
}

// =========================================================
// PARTÍCULAS E EFEITOS
// =========================================================
function addGrassDust(x, y, count = 3) {
    for (let i = 0; i < count; i++) {
        particles.push({
            type: 'grass',
            x: x + (Math.random() - 0.5) * 8,
            y: y + (Math.random() - 0.5) * 6,
            vx: (Math.random() - 0.5) * 60,
            vy: (Math.random() - 0.5) * 60 + 20,
            size: Math.random() * 3 + 2,
            color: Math.random() < 0.5 ? '#86efac' : '#22c55e',
            life: 1.0,
            decay: 2.2
        });
    }
}

function addGoldTrail(x, y) {
    particles.push({
        type: 'gold',
        x: x + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 16,
        vx: (Math.random() - 0.5) * 40,
        vy: 80,
        size: Math.random() * 5 + 3,
        color: '#facc15',
        life: 0.8,
        decay: 1.8
    });
}

function addConfetti(count = 90) {
    const colors = ['#facc15', '#22c55e', '#38bdf8', '#ef4444', '#e879f9', '#ffffff'];
    for (let i = 0; i < count; i++) {
        particles.push({
            type: 'confetti',
            x: width / 2 + (Math.random() - 0.5) * 140,
            y: goalPost.y + 40,
            vx: (Math.random() - 0.5) * 260,
            vy: -Math.random() * 240 - 100,
            gravity: 420,
            size: Math.random() * 6 + 4,
            color: colors[i % colors.length],
            angle: Math.random() * Math.PI * 2,
            vAngle: (Math.random() - 0.5) * 8,
            life: 1.0,
            decay: 0.35
        });
    }
}

function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= p.decay * dt;

        if (p.type === 'confetti') {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += p.gravity * dt;
            p.angle += p.vAngle * dt;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
            ctx.restore();
        } else {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        if (p.life <= 0) particles.splice(i, 1);
    }
}

// =========================================================
// RENDERIZAÇÃO DO CAMPO (100% FUTEBOL, ZERO JARDAS)
// =========================================================
function drawPitch() {
    ctx.fillStyle = '#1e824c';
    ctx.fillRect(0, -10, width, height + 30);

    // Faixas verticais de corte da grama
    const stripeCount = 6;
    const stripeW = (width - pitchMargin * 2) / stripeCount;
    for (let i = 0; i < stripeCount; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#1b7845' : '#229954';
        ctx.fillRect(pitchMargin + i * stripeW, -10, stripeW, height + 30);
    }

    // Torcida
    drawCrowd();

    // Linhas laterais brancas
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(pitchMargin, -10);
    ctx.lineTo(pitchMargin, height + 20);
    ctx.moveTo(width - pitchMargin, -10);
    ctx.lineTo(width - pitchMargin, height + 20);
    ctx.stroke();

    // Linhas contínuas de futebol: meio-campo e círculo central
    const pitchSpacing = 380;
    const offset = fieldY % pitchSpacing;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = 2.5;

    for (let y = -pitchSpacing + offset; y < height + pitchSpacing; y += pitchSpacing) {
        ctx.beginPath();
        ctx.moveTo(pitchMargin, y);
        ctx.lineTo(width - pitchMargin, y);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(width / 2, y, 48, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(width / 2, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fill();
    }
}

function drawCrowd() {
    ctx.fillStyle = '#0f1712';
    ctx.fillRect(0, -10, pitchMargin, height + 30);
    ctx.fillRect(width - pitchMargin, -10, pitchMargin, height + 30);

    const t = performance.now() * 0.005;
    for (let fan of crowd) {
        const bob = Math.sin(t + fan.offset) * 4;
        const drawY = (fan.baseY + fieldY * 0.7) % height;
        ctx.fillStyle = fan.color;
        ctx.beginPath();
        ctx.arc(fan.x, drawY + bob, 4.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

// =========================================================
// POWER-UPS (ISOTÔNICO, CHUTEIRA DE OURO, MOEDAS)
// =========================================================
function spawnPickups(dist) {
    if (gameState !== STATE.RUNNING) return;
    // Spawna a cada ~80 metros aleatoriamente
    if (Math.random() < 0.28) {
        const laneW = (width - pitchMargin * 2) / 3;
        const lane = Math.floor(Math.random() * 3);
        const posX = pitchMargin + (lane + 0.5) * laneW;

        const rand = Math.random();
        let type = 'coin';
        if (rand < 0.35) type = 'drink';
        else if (rand < 0.55) type = 'boot';

        pickups.push({
            type,
            x: posX,
            y: -40,
            radius: 16,
            bob: Math.random() * Math.PI * 2
        });
    }
}

function updatePickups(dt) {
    for (let i = pickups.length - 1; i >= 0; i--) {
        const p = pickups[i];
        p.y += scrollSpeed * timeScale * dt;
        p.bob += 4 * dt;

        // Renderiza
        ctx.save();
        ctx.translate(p.x, p.y + Math.sin(p.bob) * 3);
        // Sombra
        ctx.beginPath();
        ctx.ellipse(0, 14, 12, 5, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fill();

        if (p.type === 'coin') {
            ctx.beginPath();
            ctx.arc(0, 0, 12, 0, Math.PI * 2);
            ctx.fillStyle = '#facc15';
            ctx.fill();
            ctx.strokeStyle = '#92400e';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.font = 'bold 12px sans-serif';
            ctx.fillStyle = '#78350f';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('$', 0, 0);
        } else if (p.type === 'drink') {
            ctx.font = '24px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🧃', 0, 0);
        } else if (p.type === 'boot') {
            ctx.font = '24px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('👟', 0, 0);
        }
        ctx.restore();

        // Coleta
        const distToPlayer = Math.hypot(player.x - p.x, player.y - p.y);
        if (distToPlayer < player.radius + p.radius) {
            collectPickup(p);
            pickups.splice(i, 1);
            continue;
        }

        if (p.y > height + 50) pickups.splice(i, 1);
    }
}

function collectPickup(p) {
    if (p.type === 'coin') {
        audio.playCoin();
        coinsSession++;
        coinsEl.textContent = coinsSession;
        score += 50;
        showToast('MOEDA! +50', '');
    } else if (p.type === 'drink') {
        audio.playPowerup();
        slowEnergy = 100;
        showToast('🧃 ISOTÔNICO!', 'SLOW-MO 100% CHEIO');
    } else if (p.type === 'boot') {
        audio.playPowerup();
        superSpeedTimer = SUPER_SPEED_DURATION;
        invulnerableTimer = SUPER_SPEED_DURATION;
        powerPillEl.classList.remove('hidden');
        showToast('👟 CHUTEIRA DE OURO!', 'SUPERVELOCIDADE!');
    }
}

// =========================================================
// ZAGUEIROS (MOVIMENTAÇÃO NATURAL DE FUTEBOL)
// =========================================================
function spawnDefendersIfNeeded() {
    if (gameState !== STATE.RUNNING) return;

    if (stageDist >= nextSpawnDist) {
        // Quantidade na tela calibrada pela fase (fase 1 é amigável!)
        const maxOnScreen = stage === 1 ? 2 : (stage === 2 ? 3 : 4);

        if (defenders.length < maxOnScreen) {
            const laneW = (width - pitchMargin * 2) / 3;
            const lane = Math.floor(Math.random() * 3);
            const posX = pitchMargin + (lane + 0.5) * laneW;

            let style = 'JOCKEY';
            const rand = Math.random();
            if (stageDist > 300 && rand < 0.45) style = 'SLIDER';
            else if (stageDist > 150 && rand < 0.75) style = 'CHASER';

            // Rival tem uniforme contrastante
            const rivalTeam = profile.teamId === 'flamengo' ? TEAMS.find(t => t.id === 'corinthians') : TEAMS.find(t => t.id === 'flamengo');

            defenders.push({
                x: posX,
                y: -60,
                radius: 18,
                style,
                state: 'NORMAL',
                stateTimer: 0,
                vx: (Math.random() < 0.5 ? 1 : -1) * (60 + stage * 10),
                tackleVx: 0,
                tackleVy: 0,
                runCycle: 0,
                team: rivalTeam,
                number: [3, 4, 5, 2][Math.floor(Math.random() * 4)],
                dodged: false
            });
        }

        // Espaçamento calculado para ser justo e estratégico
        const spacing = Math.max(90, 140 - stage * 8);
        nextSpawnDist = stageDist + spacing;
        spawnPickups(stageDist);
    }
}

function updateDefenders(dt) {
    for (let i = defenders.length - 1; i >= 0; i--) {
        const d = defenders[i];
        d.y += scrollSpeed * timeScale * dt;
        d.runCycle += 8 * dt * timeScale;

        const distToPlayer = Math.hypot(player.x - d.x, player.y - d.y);

        if (d.style === 'JOCKEY') {
            d.x += d.vx * timeScale * dt;
            if (d.x < pitchMargin + 24 || d.x > width - pitchMargin - 24) {
                d.vx *= -1;
            }
        } else if (d.style === 'CHASER') {
            if (d.state === 'NORMAL') {
                if (distToPlayer < 230 && d.y < player.y) {
                    d.state = 'ALERT';
                    d.stateTimer = 0.38; // 380ms de telegrafia justa
                    audio.playAlert();
                }
            } else if (d.state === 'ALERT') {
                d.stateTimer -= dt * timeScale;
                if (d.stateTimer <= 0) {
                    d.state = 'TACKLING';
                    const angle = Math.atan2(player.y - d.y, player.x - d.x);
                    const spd = 200 + stage * 15;
                    d.tackleVx = Math.cos(angle) * spd;
                    d.tackleVy = Math.sin(angle) * spd;
                    d.stateTimer = 0.85;
                }
            } else if (d.state === 'TACKLING') {
                d.x += d.tackleVx * timeScale * dt;
                d.y += d.tackleVy * timeScale * dt;
                addGrassDust(d.x, d.y + 10, 1);
                d.stateTimer -= dt * timeScale;
                if (d.stateTimer <= 0) {
                    d.state = 'STUMBLED';
                    d.stateTimer = 0.8;
                }
            }
        } else if (d.style === 'SLIDER') {
            if (d.state === 'NORMAL') {
                if (distToPlayer < 200 && Math.abs(player.y - d.y) < 160) {
                    d.state = 'ALERT';
                    d.stateTimer = 0.32;
                    audio.playAlert();
                }
            } else if (d.state === 'ALERT') {
                d.stateTimer -= dt * timeScale;
                if (d.stateTimer <= 0) {
                    d.state = 'TACKLING';
                    const dirX = player.x > d.x ? 1 : -1;
                    d.tackleVx = dirX * (240 + stage * 15);
                    d.stateTimer = 0.65;
                }
            } else if (d.state === 'TACKLING') {
                d.x += d.tackleVx * timeScale * dt;
                addGrassDust(d.x, d.y + 12, 2);
                d.stateTimer -= dt * timeScale;
                if (d.stateTimer <= 0) {
                    d.state = 'STUMBLED';
                    d.stateTimer = 0.8;
                }
            }
        }

        // Drible bem sucedido
        if (!d.dodged && (d.y > player.y + 24 || d.state === 'STUMBLED')) {
            d.dodged = true;
            dribbles++;
            score += 150;
            scoreEl.textContent = score;
            showToast('⚡ DRIBLE!', '+150 PTS');
        }

        // Colisão
        if (gameState === STATE.RUNNING) {
            if (distToPlayer < player.radius + d.radius - 4) {
                // Se estiver com a Chuteira de Ouro, empurra o zagueiro!
                if (superSpeedTimer > 0) {
                    d.state = 'STUMBLED';
                    d.vx *= -2;
                    addGrassDust(d.x, d.y, 6);
                    showToast('💥 ATROPELOU!', '+200 PTS');
                    score += 200;
                } else if (invulnerableTimer <= 0) {
                    triggerGameOver('O ZAGUEIRO DESARMOU VOCÊ!');
                    return;
                }
            }
        }

        // Renderiza Zagueiro
        drawSoccerPlayer(ctx, d.x, d.y, {
            team: d.team,
            skin: SKINS[1],
            hair: HAIRS[0],
            number: d.number,
            runCycle: d.runCycle,
            isSliding: d.state === 'TACKLING' && d.style === 'SLIDER'
        });

        // Balão de alerta '!'
        if (d.state === 'ALERT') {
            ctx.save();
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(d.x, d.y - 36, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 15px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('!', d.x, d.y - 35);
            ctx.restore();
        }

        if (d.state === 'STUMBLED') {
            ctx.font = '15px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('💫', d.x, d.y - 34);
        }

        if (d.y > height + 60) defenders.splice(i, 1);
    }
}

// =========================================================
// O JOGADOR (MOVIMENTAÇÃO E ROTAÇÃO)
// =========================================================
function updatePlayer(dt) {
    if (gameState === STATE.RUNNING) {
        // Interpolação suave 2D
        const lerpFactor = 16 * dt;
        player.x += (player.targetX - player.x) * Math.min(1, lerpFactor);
        player.y += (player.targetY - player.y) * Math.min(1, lerpFactor);

        const minX = pitchMargin + player.radius + 4;
        const maxX = width - pitchMargin - player.radius - 4;
        player.x = Math.max(minX, Math.min(maxX, player.x));

        const minY = height * 0.16;
        const maxY = height - player.radius - 16;
        player.y = Math.max(minY, Math.min(maxY, player.y));

        player.runCycle += 14 * dt * timeScale;
        player.ballRot += (scrollSpeed * 0.03) * dt * timeScale;

        // Giro 360°
        if (isSpinning) {
            spinAngle += 22 * dt;
            if (spinAngle >= Math.PI * 2) {
                isSpinning = false;
                spinAngle = 0;
            }
        }

        // Rastro dourado
        if (superSpeedTimer > 0) {
            addGoldTrail(player.x, player.y);
        }

        // Renderiza
        drawSoccerPlayer(ctx, player.x, player.y, {
            team: profile.getTeam(),
            skin: profile.skin,
            hair: profile.hair,
            number: profile.number,
            runCycle: player.runCycle,
            rotation: spinAngle,
            isGolden: superSpeedTimer > 0
        });

        // Bola aos pés rolando
        const ballOffset = 18 + Math.sin(player.runCycle) * 3;
        ctx.save();
        ctx.translate(player.x, player.y + ballOffset);
        ctx.rotate(player.ballRot);
        ctx.font = '26px "Segoe UI Emoji", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚽', 0, 0);
        ctx.restore();
    } else if (gameState === STATE.PENALTY_RUNUP) {
        // Corrida de aproximação até a bola
        penRunUp += 3.2 * dt;
        player.runCycle += 18 * dt;
        player.x += (penBall.x - player.x) * 0.2;
        player.y += ((penBall.y + 14) - player.y) * 0.2;

        drawSoccerPlayer(ctx, player.x, player.y, {
            team: profile.getTeam(),
            skin: profile.skin,
            hair: profile.hair,
            number: profile.number,
            runCycle: player.runCycle
        });

        if (penRunUp >= 1.0) {
            gameState = STATE.PENALTY_KICK;
            audio.playKick();
            startPenaltyShot();
        }
    }
}

// =========================================================
// DISPUTA DE PÊNALTI REALISTA (TOTALMENTE DESOBSTRUÍDA)
// =========================================================
function executePenaltyKick() {
    if (gameState !== STATE.PENALTY_AIM) return;
    gameState = STATE.PENALTY_RUNUP;
    penRunUp = 0;
    penaltyUiEl.classList.add('hidden');
    audio.playKick();
}

function startPenaltySetup() {
    gameState = STATE.PENALTY_AIM;
    isSlowMo = false;
    timeScale = 1.0;
    penRunUp = 0;
    defenders = [];
    pickups = [];

    // Oculta HUD de corrida
    hudEl.classList.add('hidden');
    controlsEl.classList.add('hidden');
    appEl.classList.add('pen');

    // Jogador PARADO na marca da cal
    player.x = width / 2;
    player.y = height - 125;
    player.targetX = player.x;
    player.targetY = player.y;

    // Bola parada na marca do pênalti
    penBall.x = width / 2;
    penBall.y = height - 170;
    penBall.scale = 1.0;
    penBall.vx = 0;
    penBall.vy = 0;

    // Trave visível no topo
    goalPost.y = 70;
    goalPost.postThickness = 6;

    // Goleiro na linha
    goalie.x = width / 2;
    goalie.y = goalPost.y + goalPost.height - 18;
    // Goleiro começa suave no nível 1 (amigável!) e fica mais ágil com o passar das fases
    goalie.vx = 75 + Math.min(stage - 1, 6) * 18;
    goalie.diveProgress = 0;
    goalie.diveDir = 0;

    // Mira inicial no centro
    penaltyAim.sweep = 0;
    penaltyAim.x = width / 2;
    penaltyAim.y = goalPost.y + goalPost.height * 0.5;
    penaltyAim.isManual = false;

    audio.playWhistle(true);
    penaltyUiEl.classList.remove('hidden');
}

function updatePenalty(dt) {
    if (gameState === STATE.PENALTY_AIM) {
        // Mira oscilando entre os cantos da trave se não for manual
        if (!penaltyAim.isManual) {
            penaltyAim.sweep += 2.8 * dt;
            const goalL = (width - goalPost.width) / 2 + 25;
            const goalR = goalL + goalPost.width - 50;
            const center = (goalL + goalR) / 2;
            const radius = (goalR - goalL) / 2;
            penaltyAim.x = center + Math.sin(penaltyAim.sweep) * radius;
            penaltyAim.y = goalPost.y + 20 + (Math.sin(penaltyAim.sweep * 1.5) + 1) * 22;
        }

        // Goleiro se movimentando na linha
        goalie.x += goalie.vx * dt;
        const gkMinX = (width - goalPost.width) / 2 + 30;
        const gkMaxX = gkMinX + goalPost.width - 60;
        if (goalie.x < gkMinX) { goalie.x = gkMinX; goalie.vx = Math.abs(goalie.vx); }
        else if (goalie.x > gkMaxX) { goalie.x = gkMaxX; goalie.vx = -Math.abs(goalie.vx); }
    } else if (gameState === STATE.PENALTY_KICK) {
        penBall.x += penBall.vx * dt;
        penBall.y += penBall.vy * dt;
        penBall.scale = Math.max(0.65, penBall.scale - 0.7 * dt);
        addGrassDust(penBall.x, penBall.y, 1);

        // Goleiro salta
        goalie.x += goalie.diveDir * (160 + Math.min(stage, 6) * 18) * dt;

        checkPenaltyCollision();
    }
}

function startPenaltyShot() {
    const dx = penaltyAim.x - penBall.x;
    const dy = penaltyAim.y - penBall.y;
    const dist = Math.hypot(dx, dy) || 1;
    const speed = 640;

    penBall.vx = (dx / dist) * speed;
    penBall.vy = (dy / dist) * speed;

    // Goleiro reage (tem um pequeno atraso humano!)
    const aimSide = penaltyAim.x > width / 2 ? 1 : -1;
    // No nível 1, goleiro quase sempre pula pro lado errado (20% de acerto). Fases mais altas aumentam até máx 60%.
    const guessChance = Math.min(0.60, 0.20 + (stage - 1) * 0.08);
    const gkGuessedRight = Math.random() < guessChance;
    goalie.diveDir = gkGuessedRight ? aimSide : -aimSide;
}

function checkPenaltyCollision() {
    const distToGk = Math.hypot(penBall.x - goalie.x, penBall.y - goalie.y);
    // Raio de defesa justo (22px na fase 1)
    const saveRadius = Math.min(26, 22 + (stage - 1) * 1);
    if (distToGk < saveRadius) {
        screenShake = 14;
        audio.playWhistle(true);
        triggerGameOver('O GOLEIRO ESPALMOU NO ÂNGULO!');
        return;
    }

    const goalL = (width - goalPost.width) / 2;
    const goalR = goalL + goalPost.width;

    if (penBall.y <= goalPost.y + goalPost.height) {
        if (penBall.x >= goalL + 10 && penBall.x <= goalR - 10) {
            handleGoalSuccess();
        } else {
            screenShake = 12;
            audio.playWhistle(true);
            triggerGameOver('CHUTOU NA TRAVE E FOI PRA FORA!');
        }
    }
}

function handleGoalSuccess() {
    gameState = STATE.CELEBRATION;
    goals++;
    score += 500;
    scoreEl.textContent = score;

    audio.playGoalFanfare();
    addConfetti(100);
    screenShake = 16;

    showBanner('goal', 'FASE VENCIDA!', 'GOOOOOOL!', '+500 PONTOS!');

    setTimeout(() => {
        advanceToNextStage();
    }, 2400);
}

function advanceToNextStage() {
    stage++;
    stageDist = 0;
    gameState = STATE.RUNNING;

    hudEl.classList.remove('hidden');
    controlsEl.classList.remove('hidden');
    penaltyUiEl.classList.add('hidden');
    appEl.classList.remove('pen');

    stageNumEl.textContent = `FASE ${stage}`;
    progTxtEl.textContent = `0m / 1000m`;
    progFillEl.style.width = '0%';
    progBallEl.style.left = '0%';

    player.x = width / 2;
    player.y = height - 130;
    player.targetX = player.x;
    player.targetY = player.y;

    defenders = [];
    pickups = [];
    nextSpawnDist = 40;

    showBanner('stage', `FASE ${stage}`, 'AVANCE AO ATAQUE!', 'Drible a zaga e marque outro gol!');
}

function drawPenaltyScene() {
    if (gameState === STATE.RUNNING || gameState === STATE.MENU) return;

    const goalL = (width - goalPost.width) / 2;
    const goalR = goalL + goalPost.width;

    // Grande Área
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 3;
    const boxW = goalPost.width + 50;
    ctx.strokeRect((width - boxW) / 2, goalPost.y, boxW, 200);

    // Marca da cal
    ctx.beginPath();
    ctx.arc(width / 2, height - 170, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Meia-lua
    ctx.beginPath();
    ctx.arc(width / 2, height - 170, 45, Math.PI, 0);
    ctx.stroke();

    // Rede 3D
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.fillRect(goalL, goalPost.y, goalPost.width, goalPost.height);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1;
    for (let x = goalL; x <= goalR; x += 15) {
        ctx.beginPath();
        ctx.moveTo(x, goalPost.y);
        ctx.lineTo(x, goalPost.y + goalPost.height);
        ctx.stroke();
    }
    for (let y = goalPost.y; y <= goalPost.y + goalPost.height; y += 12) {
        ctx.beginPath();
        ctx.moveTo(goalL, y);
        ctx.lineTo(goalR, y);
        ctx.stroke();
    }

    // Postes brancos
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = goalPost.postThickness;
    ctx.beginPath();
    ctx.moveTo(goalL, goalPost.y + goalPost.height);
    ctx.lineTo(goalL, goalPost.y);
    ctx.lineTo(goalR, goalPost.y);
    ctx.lineTo(goalR, goalPost.y + goalPost.height);
    ctx.stroke();
    ctx.restore();

    // Goleiro
    drawSoccerPlayer(ctx, goalie.x, goalie.y, {
        team: TEAMS[0],
        skin: SKINS[0],
        hair: HAIRS[0],
        number: 1,
        isGoalkeeper: true
    });

    // Bola parada ou em vôo
    ctx.save();
    ctx.font = `${Math.round(28 * penBall.scale)}px "Segoe UI Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚽', penBall.x, penBall.y);
    ctx.restore();

    // Jogador parado na marca
    if (gameState === STATE.PENALTY_AIM) {
        drawSoccerPlayer(ctx, player.x, player.y, {
            team: profile.getTeam(),
            skin: profile.skin,
            hair: profile.hair,
            number: profile.number,
            runCycle: 0
        });

        // Mira
        ctx.save();
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.75)';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(penBall.x, penBall.y);
        ctx.lineTo(penaltyAim.x, penaltyAim.y);
        ctx.stroke();

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(penaltyAim.x, penaltyAim.y, 14, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(penaltyAim.x, penaltyAim.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// =========================================================
// MENSAGENS E BANNERS
// =========================================================
let toastTimer = null;
function showToast(title, sub) {
    if (toastTimer) clearTimeout(toastTimer);
    toastTitleEl.textContent = title;
    toastSubEl.textContent = sub;
    toastEl.classList.remove('hidden', 'show');
    void toastEl.offsetWidth;
    toastEl.classList.add('show');
    toastTimer = setTimeout(() => toastEl.classList.add('hidden'), 1000);
}

let bannerTimer = null;
function showBanner(type, kicker, title, sub) {
    if (bannerTimer) clearTimeout(bannerTimer);
    bannerEl.className = `${type} show`;
    bannerKickerEl.textContent = kicker;
    bannerTitleEl.textContent = title;
    bannerSubEl.textContent = sub;
    bannerTimer = setTimeout(() => {
        bannerEl.className = 'hidden';
    }, 2200);
}

// =========================================================
// CONTROLES DE PARTIDA (SLOW-MO E GIRO)
// =========================================================
function setSlowMo(active) {
    if (active) {
        if (gameState !== STATE.RUNNING) return;
        if (slowEnergy <= 8) return;
        if (!isSlowMo) {
            isSlowMo = true;
            if (appEl) appEl.classList.add('slowmo');
            if (slowBtn) slowBtn.classList.add('held');
            audio.playWhoosh();
        }
    } else {
        if (isSlowMo) {
            isSlowMo = false;
            timeScale = 1.0;
            if (appEl) appEl.classList.remove('slowmo');
            if (slowBtn) slowBtn.classList.remove('held');
        }
    }
}

function updateSlowMoState(dt) {
    if (isSlowMo && slowEnergy > 0) {
        slowEnergy -= SLOWMO_DRAIN_RATE * dt;
        timeScale = 0.42;
        if (slowEnergy <= 0) {
            slowEnergy = 0;
            setSlowMo(false);
        }
    } else {
        timeScale = 1.0;
        if (slowEnergy < 100) {
            slowEnergy = Math.min(100, slowEnergy + SLOWMO_RECOVERY_RATE * dt);
        }
    }
    if (slowFillEl) slowFillEl.style.width = `${Math.max(0, Math.min(100, slowEnergy))}%`;
}

function triggerSpin() {
    if (gameState !== STATE.RUNNING) return;
    if (spinCooldown > 0) return;

    spinCooldown = SPIN_COOLDOWN_MAX;
    isSpinning = true;
    spinAngle = 0;
    invulnerableTimer = 0.5;

    audio.playWhoosh();
    showToast('🌀 GIRO 360°!', 'DRIBLE ESPETACULAR');
}

function updateCooldowns(dt) {
    if (spinCooldown > 0) {
        spinCooldown = Math.max(0, spinCooldown - dt);
        const pct = (spinCooldown / SPIN_COOLDOWN_MAX) * 100;
        spinShadeEl.style.height = `${pct}%`;
        spinBtn.classList.toggle('disabled', spinCooldown > 0);
    }
    if (invulnerableTimer > 0) {
        invulnerableTimer -= dt;
    }
    if (superSpeedTimer > 0) {
        superSpeedTimer -= dt;
        const pct = (superSpeedTimer / SUPER_SPEED_DURATION) * 100;
        powerFillEl.style.width = `${pct}%`;
        scrollSpeed = 340; // Super velocidade
        if (superSpeedTimer <= 0) {
            powerPillEl.classList.add('hidden');
            scrollSpeed = 220;
        }
    }
}

// =========================================================
// LOOP PRINCIPAL DE ANIMAÇÃO (DELTA-TIME BASE)
// =========================================================
function update(dt) {
    if (gameState === STATE.RUNNING) {
        // Metros avançam baseados no tempo (dt)
        const meterRate = (scrollSpeed * 0.22) * timeScale;
        stageDist += meterRate * dt;
        totalDist += meterRate * dt;
        score += Math.floor(meterRate * dt * 2);

        progTxtEl.textContent = `${Math.floor(stageDist)}m / ${STAGE_GOAL_METERS}m`;
        scoreEl.textContent = score;

        const progPct = Math.min(100, (stageDist / STAGE_GOAL_METERS) * 100);
        progFillEl.style.width = `${progPct}%`;
        progBallEl.style.left = `${progPct}%`;

        // Pênalti a cada 1000 metros da fase!
        if (stageDist >= STAGE_GOAL_METERS) {
            startPenaltySetup();
            return;
        }

        fieldY += scrollSpeed * timeScale * dt;

        spawnDefendersIfNeeded();
        updateDefenders(dt);
        updatePickups(dt);
    }

    updatePlayer(dt);
    updatePenalty(dt);
    updateSlowMoState(dt);
    updateCooldowns(dt);
    updateParticles(dt);

    if (screenShake > 0) {
        screenShake = Math.max(0, screenShake - 30 * dt);
    }
}

function gameLoop(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    // Delta-time em segundos, travado para evitar saltos após pausas
    const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
    lastTimestamp = timestamp;

    ctx.save();
    if (screenShake > 0) {
        const sx = (Math.random() - 0.5) * screenShake * 2;
        const sy = (Math.random() - 0.5) * screenShake * 2;
        ctx.translate(sx, sy);
    }

    ctx.clearRect(0, 0, width, height);

    drawPitch();
    drawPenaltyScene();

    update(dt);

    ctx.restore();

    // Loop contínuo (inclusive no menu para renderizar o fundo e preview)
    if (gameState === STATE.MENU) {
        renderPreview();
    }

    animationFrameId = requestAnimationFrame(gameLoop);
}

// =========================================================
// CONTROLES DE PARTIDA E TELAS
// =========================================================
function startGame() {
    audio.init();
    menuScreen.classList.add('hidden');
    overScreen.classList.add('hidden');
    pauseScreen.classList.add('hidden');
    hudEl.classList.remove('hidden');
    controlsEl.classList.remove('hidden');
    penaltyUiEl.classList.add('hidden');
    appEl.classList.remove('pen', 'slowmo');

    gameState = STATE.RUNNING;
    stage = 1;
    stageDist = 0;
    totalDist = 0;
    score = 0;
    coinsSession = 0;
    dribbles = 0;
    goals = 0;
    slowEnergy = 100;
    superSpeedTimer = 0;
    spinCooldown = 0;
    scrollSpeed = 220;
    nextSpawnDist = 40;

    stageNumEl.textContent = 'FASE 1';
    progTxtEl.textContent = '0m / 1000m';
    progFillEl.style.width = '0%';
    progBallEl.style.left = '0%';
    scoreEl.textContent = '0';
    coinsEl.textContent = '0';

    defenders = [];
    pickups = [];
    particles = [];

    player.x = width / 2;
    player.y = height - 130;
    player.targetX = player.x;
    player.targetY = player.y;

    audio.playWhistle();
}

function triggerGameOver(reason) {
    gameState = STATE.GAME_OVER;
    audio.playWhistle(true);

    const isNew = score > profile.highScore;
    if (isNew) {
        profile.highScore = score;
    }
    profile.totalCoins += coinsSession;
    profile.save();

    newRecordEl.classList.toggle('hidden', !isNew);
    overReasonEl.textContent = reason;
    oScoreEl.textContent = score;
    oStageEl.textContent = stage;
    oDistEl.textContent = `${Math.floor(totalDist)}m`;
    oGoalsEl.textContent = goals;
    oDribblesEl.textContent = dribbles;
    oCoinsEl.textContent = coinsSession;
    oBestEl.textContent = profile.highScore;

    hudEl.classList.add('hidden');
    controlsEl.classList.add('hidden');
    penaltyUiEl.classList.add('hidden');
    overScreen.classList.remove('hidden');
}

function openMenu() {
    gameState = STATE.MENU;
    menuScreen.classList.remove('hidden');
    overScreen.classList.add('hidden');
    pauseScreen.classList.add('hidden');
    hudEl.classList.add('hidden');
    controlsEl.classList.add('hidden');
    penaltyUiEl.classList.add('hidden');
    initMenuUI();
}

// =========================================================
// EVENTOS DE TOQUE E CONTROLE 2D LIVRE
// =========================================================
let touchOriginX = 0;
let touchOriginY = 0;
let playerOriginX = 0;
let playerOriginY = 0;
let isTouching = false;

// Toque relativo (não tampa a visão do boneco)
canvas.addEventListener('touchstart', (e) => {
    audio.init();
    if (gameState === STATE.RUNNING) {
        if (e.touches.length > 0) {
            isTouching = true;
            touchOriginX = e.touches[0].clientX;
            touchOriginY = e.touches[0].clientY;
            playerOriginX = player.x;
            playerOriginY = player.y;
        }
    } else if (gameState === STATE.PENALTY_AIM) {
        // No pênalti, tocar mira diretamente no local tocado!
        const rect = canvas.getBoundingClientRect();
        penaltyAim.x = e.touches[0].clientX - rect.left;
        penaltyAim.y = Math.min(goalPost.y + goalPost.height, Math.max(goalPost.y + 10, e.touches[0].clientY - rect.top));
        penaltyAim.isManual = true;
    }
}, { passive: true });

canvas.addEventListener('touchmove', (e) => {
    if (gameState === STATE.RUNNING && isTouching && e.touches.length > 0) {
        const dx = e.touches[0].clientX - touchOriginX;
        const dy = e.touches[0].clientY - touchOriginY;
        player.targetX = playerOriginX + dx;
        player.targetY = playerOriginY + dy;
    } else if (gameState === STATE.PENALTY_AIM && e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        penaltyAim.x = e.touches[0].clientX - rect.left;
        penaltyAim.y = Math.min(goalPost.y + goalPost.height, Math.max(goalPost.y + 10, e.touches[0].clientY - rect.top));
        penaltyAim.isManual = true;
    }
}, { passive: true });

canvas.addEventListener('touchend', () => {
    isTouching = false;
});

// Suporte com Mouse
let isMouseDown = false;
canvas.addEventListener('mousedown', (e) => {
    audio.init();
    if (gameState === STATE.RUNNING) {
        isMouseDown = true;
        touchOriginX = e.clientX;
        touchOriginY = e.clientY;
        playerOriginX = player.x;
        playerOriginY = player.y;
    } else if (gameState === STATE.PENALTY_AIM) {
        const rect = canvas.getBoundingClientRect();
        penaltyAim.x = e.clientX - rect.left;
        penaltyAim.y = Math.min(goalPost.y + goalPost.height, Math.max(goalPost.y + 10, e.clientY - rect.top));
        penaltyAim.isManual = true;
    }
});

window.addEventListener('mousemove', (e) => {
    if (gameState === STATE.RUNNING && isMouseDown) {
        const dx = e.clientX - touchOriginX;
        const dy = e.clientY - touchOriginY;
        player.targetX = playerOriginX + dx;
        player.targetY = playerOriginY + dy;
    } else if (gameState === STATE.PENALTY_AIM && isMouseDown) {
        const rect = canvas.getBoundingClientRect();
        penaltyAim.x = e.clientX - rect.left;
        penaltyAim.y = Math.min(goalPost.y + goalPost.height, Math.max(goalPost.y + 10, e.clientY - rect.top));
        penaltyAim.isManual = true;
    }
});

window.addEventListener('mouseup', () => { isMouseDown = false; });

// Teclado
window.addEventListener('keydown', (e) => {
    audio.init();
    const spd = 26;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') player.targetX -= spd;
    else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') player.targetX += spd;
    else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') player.targetY -= spd;
    else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') player.targetY += spd;
    else if (e.key === 'Shift') setSlowMo(true);
    else if (e.key === ' ' || e.key === 'Enter') {
        if (gameState === STATE.PENALTY_AIM) executePenaltyKick();
        else triggerSpin();
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'Shift') setSlowMo(false);
});

// Botões da Partida
let slowHeld = false;
let slowPressStartTime = 0;

function onSlowPress(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    slowHeld = true;
    slowPressStartTime = performance.now();
    setSlowMo(true);
}

function onSlowRelease(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    const duration = performance.now() - slowPressStartTime;
    // Se o usuário deu apenas um toque rápido (< 240ms), faz toggle
    if (duration > 240) {
        setSlowMo(false);
    }
    slowHeld = false;
}

if (slowBtn) {
    slowBtn.addEventListener('pointerdown', onSlowPress);
    slowBtn.addEventListener('pointerup', onSlowRelease);
    slowBtn.addEventListener('pointercancel', () => { slowHeld = false; setSlowMo(false); });
    slowBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        setSlowMo(!isSlowMo);
    });
}

if (spinBtn) {
    spinBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        triggerSpin();
    });
    spinBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        triggerSpin();
    });
}

if (shootBtn) {
    shootBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        executePenaltyKick();
    });
    shootBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        executePenaltyKick();
    });
}

// Global release para garantir que nunca fique congelado
window.addEventListener('pointerup', () => {
    isMouseDown = false;
    if (slowHeld) {
        slowHeld = false;
        setSlowMo(false);
    }
});
window.addEventListener('mouseup', () => {
    isMouseDown = false;
    if (slowHeld) {
        slowHeld = false;
        setSlowMo(false);
    }
});
window.addEventListener('touchend', () => {
    isTouching = false;
    if (slowHeld) {
        slowHeld = false;
        setSlowMo(false);
    }
});
window.addEventListener('touchcancel', () => {
    isTouching = false;
    slowHeld = false;
    setSlowMo(false);
});
window.addEventListener('blur', () => {
    slowHeld = false;
    setSlowMo(false);
});

pauseBtn.addEventListener('click', () => {
    if (gameState === STATE.RUNNING) {
        gameState = STATE.PAUSED;
        setSlowMo(false);
        pauseScreen.classList.remove('hidden');
    }
});
resumeBtn.addEventListener('click', () => {
    gameState = STATE.RUNNING;
    pauseScreen.classList.add('hidden');
});
pauseSoundBtn.addEventListener('click', () => {
    const on = audio.toggle();
    pauseSoundBtn.textContent = on ? '🔊 Som' : '🔇 Mudo';
});
pauseMenuBtn.addEventListener('click', openMenu);

function requestStartGame() {
    const seenTutorial = localStorage.getItem('craque_seen_tutorial');
    if (!seenTutorial && tutorialModal) {
        tutorialModal.classList.remove('hidden');
    } else {
        startGame();
    }
}

if (playBtn) playBtn.addEventListener('click', requestStartGame);
if (howToPlayBtn) {
    howToPlayBtn.addEventListener('click', () => {
        if (tutorialModal) tutorialModal.classList.remove('hidden');
    });
}
if (startMatchBtn) {
    startMatchBtn.addEventListener('click', () => {
        localStorage.setItem('craque_seen_tutorial', 'true');
        if (tutorialModal) tutorialModal.classList.add('hidden');
        startGame();
    });
}

againBtn.addEventListener('click', startGame);
overMenuBtn.addEventListener('click', openMenu);

window.addEventListener('resize', resize);
window.addEventListener('orientationchange', () => setTimeout(resize, 150));

// =========================================================
// INICIALIZAÇÃO
// =========================================================
function init() {
    resize();
    initMenuUI();
    renderPreview();
    lastTimestamp = performance.now();
    animationFrameId = requestAnimationFrame(gameLoop);
}

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
