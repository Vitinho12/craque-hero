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

    playBuy() {
        if (!this.enabled || !this.ctx) return;
        try {
            [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.05);
                gain.gain.setValueAtTime(0.2, this.ctx.currentTime + i * 0.05);
                gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2 + i * 0.05);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(this.ctx.currentTime + i * 0.05);
                osc.stop(this.ctx.currentTime + 0.22 + i * 0.05);
            });
        } catch (e) {}
    }

    playPostHit() {
        if (!this.enabled || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(440, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.4);
            gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.42);
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
const stadiumNameEl = document.getElementById('stadium-name');
const progTxtEl = document.getElementById('prog-txt');
const progFillEl = document.getElementById('prog-fill');
const progBallEl = document.getElementById('prog-ball');
const scoreEl = document.getElementById('score');
const coinsEl = document.getElementById('coins');
const slowFillEl = document.getElementById('slow-fill');
const powerPillEl = document.getElementById('power-pill');
const powerFillEl = document.getElementById('power-fill');
const powerNameEl = document.getElementById('power-name');
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
const shopBtn = document.getElementById('shop-btn');
const shopModal = document.getElementById('shop-modal');
const shopCloseBtn = document.getElementById('shop-close-btn');
const overShopBtn = document.getElementById('over-shop-btn');
const shopCoinsValEl = document.getElementById('shop-coins-val');
const menuTotalCoinsEl = document.getElementById('menu-total-coins');
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
// PERFIL DO JOGADOR E UPGRADES (SALVO NO LOCALSTORAGE)
// =========================================================
const UPGRADE_COSTS = [50, 100, 200, 350, 500];

const profile = {
    name: 'VICENTE',
    number: 10,
    teamId: 'brasil',
    skin: SKINS[0],
    hair: HAIRS[0],
    highScore: 0,
    totalCoins: 0,
    upgrades: {
        slow: 1,    // max 5
        spin: 1,    // max 5
        magnet: 1,  // max 5
        boot: 1,    // max 5
        penalty: 1  // max 5
    },
    load() {
        try {
            const data = JSON.parse(localStorage.getItem('craque_hero_profile') || '{}');
            if (data.name) this.name = data.name;
            if (data.number) this.number = data.number;
            if (data.teamId) this.teamId = data.teamId;
            if (data.skin) this.skin = data.skin;
            if (data.hair) this.hair = data.hair;
            if (data.highScore) this.highScore = data.highScore;
            if (typeof data.totalCoins === 'number') this.totalCoins = data.totalCoins;
            if (data.upgrades) this.upgrades = Object.assign({ slow: 1, spin: 1, magnet: 1, boot: 1, penalty: 1 }, data.upgrades);
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
                totalCoins: this.totalCoins,
                upgrades: this.upgrades
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
let pitchMargin = 16; // Campo aproveita 100% da tela (sem barras pretas de torcida)

// Banco de Estádios e Ambientes por Fase
const STADIUMS = [
    { id: 'maracana', name: '☀️ MARACANÃ (SOL)', grassLight: '#27ae60', grassDark: '#1e824c', line: 'rgba(255, 255, 255, 0.82)', weather: 'clear' },
    { id: 'night', name: '💡 NOITE SOB REFLETORES', grassLight: '#1f7a4d', grassDark: '#145c38', line: 'rgba(255, 255, 255, 0.92)', weather: 'night' },
    { id: 'rain', name: '🌧️ CLÁSSICO NA CHUVA', grassLight: '#166534', grassDark: '#0e4424', line: 'rgba(255, 255, 255, 0.78)', weather: 'rain' },
    { id: 'derby', name: '🔥 SINALIZADORES', grassLight: '#229954', grassDark: '#196f3d', line: 'rgba(255, 255, 255, 0.88)', weather: 'smoke' },
    { id: 'final', name: '🏆 GRANDE FINAL', grassLight: '#2ecc71', grassDark: '#27ae60', line: 'rgba(254, 240, 138, 0.95)', weather: 'final' }
];

function getCurrentStadium() {
    const idx = (stage - 1) % STADIUMS.length;
    return STADIUMS[idx];
}

// Helpers dinâmicos das melhorias do jogador
function getSlowDrainRate() {
    return Math.max(14, 28 - (profile.upgrades.slow - 1) * 3);
}
function getSpinCooldownMax() {
    return Math.max(2.0, 4.0 - (profile.upgrades.spin - 1) * 0.45);
}
function getMagnetRadius() {
    if (magnetTimer > 0) return 260;
    return profile.upgrades.magnet > 1 ? 40 + (profile.upgrades.magnet - 1) * 25 : 0;
}
function getSuperSpeedDuration() {
    return 6.0 + (profile.upgrades.boot - 1) * 1.2;
}
function getPenaltyAimSpeed() {
    return Math.max(1.6, 2.8 - (profile.upgrades.penalty - 1) * 0.25);
}

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

// Ímã de moedas
let magnetTimer = 0;

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

// Jogador (hitbox equilibrada, sprite visual maior estilo Touchdown Hero)
const player = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    radius: 20,
    runCycle: 0,
    ballRot: 0
};

// Zagueiros
let defenders = [];

// Coletáveis no campo (isotônico, chuteira de ouro, moedas, ímã)
let pickups = [];

// Partículas e Clima
let particles = [];
let rainDrops = [];

// Pênalti (Close-up épico)
const goalPost = { y: 110, width: 340, height: 140, postThickness: 7 };
const goalie = { x: 0, y: 0, vx: 140, diveDir: 0, diveProgress: 0 };
const penaltyAim = { x: 0, y: 0, sweep: 0, isManual: false };
const penBall = { x: 0, y: 0, scale: 1.1, vx: 0, vy: 0 };
let penRunUp = 0;

// =========================================================
// BOLA DE FUTEBOL 3D REALISTA
// =========================================================
function drawBallSprite(c, bx, by, radius, rot = 0) {
    c.save();
    c.translate(bx, by);
    c.rotate(rot);

    // Sombra da bola no chão
    c.beginPath();
    c.ellipse(0, radius * 0.75, radius * 0.9, radius * 0.45, 0, 0, Math.PI * 2);
    c.fillStyle = 'rgba(0, 0, 0, 0.35)';
    c.fill();

    // Esfera base da bola
    c.beginPath();
    c.arc(0, 0, radius, 0, Math.PI * 2);
    c.fillStyle = '#ffffff';
    c.fill();
    c.strokeStyle = '#0f172a';
    c.lineWidth = 1.8;
    c.stroke();

    // Pentágono preto no centro
    c.fillStyle = '#0f172a';
    c.beginPath();
    const pr = radius * 0.42;
    for (let i = 0; i < 5; i++) {
        const a = (i * 72 - 90) * Math.PI / 180;
        const px = Math.cos(a) * pr;
        const py = Math.sin(a) * pr;
        if (i === 0) c.moveTo(px, py);
        else c.lineTo(px, py);
    }
    c.closePath();
    c.fill();

    // Linhas de costura conectando os gomos externos
    c.strokeStyle = '#0f172a';
    c.lineWidth = 1.5;
    for (let i = 0; i < 5; i++) {
        const a = (i * 72 - 90) * Math.PI / 180;
        c.beginPath();
        c.moveTo(Math.cos(a) * pr, Math.sin(a) * pr);
        c.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
        c.stroke();
    }

    // Brilho 3D suave de iluminação esférica
    c.beginPath();
    c.arc(-radius * 0.35, -radius * 0.35, radius * 0.35, 0, Math.PI * 2);
    c.fillStyle = 'rgba(255, 255, 255, 0.45)';
    c.fill();

    c.restore();
}

// =========================================================
// RENDERIZAÇÃO DOS PERSONAGENS (ESTILO TOUCHDOWN HERO CARTOON-ATLÉTICO)
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

    // Sombra oval no chão (proporcional ao tamanho atlético)
    c.beginPath();
    c.ellipse(0, 26, 24, 8, 0, 0, Math.PI * 2);
    c.fillStyle = 'rgba(0, 0, 0, 0.38)';
    c.fill();

    // Rastro / Aura da Chuteira de Ouro
    if (isGolden) {
        c.beginPath();
        c.arc(0, 4, 34, 0, Math.PI * 2);
        c.fillStyle = 'rgba(250, 204, 21, 0.32)';
        c.fill();
        c.strokeStyle = '#fef08a';
        c.lineWidth = 2;
        c.stroke();
    }

    if (isSliding) {
        // Pose realista de carrinho deslizando no gramado
        c.save();
        c.rotate(-0.35);

        // Perna traseira dobrada
        c.fillStyle = isGoalkeeper ? '#0f172a' : team.shorts;
        c.fillRect(-18, 2, 14, 11);
        c.fillStyle = isGoalkeeper ? '#facc15' : team.socks;
        c.fillRect(-24, 8, 10, 8);
        c.fillStyle = '#0f172a';
        c.fillRect(-27, 8, 8, 9);

        // Perna dianteira esticada no carrinho com travas
        c.fillStyle = isGoalkeeper ? '#0f172a' : team.shorts;
        c.fillRect(0, 8, 26, 10);
        c.fillStyle = isGoalkeeper ? '#facc15' : team.socks;
        c.fillRect(22, 8, 18, 9);
        c.fillStyle = isGolden ? '#facc15' : '#0f172a';
        c.fillRect(38, 7, 10, 11);
        c.fillStyle = '#ffffff';
        c.fillRect(44, 16, 4, 3); // Travas brancas da chuteira

        // Tronco inclinado no carrinho
        c.fillStyle = isGoalkeeper ? '#facc15' : team.primary;
        c.beginPath();
        c.roundRect(-14, -16, 34, 24, 6);
        c.fill();

        // Braços no chão apoiando o carrinho
        c.fillStyle = skin;
        c.fillRect(-12, -22, 8, 14);
        c.fillRect(16, -6, 12, 8);

        // Cabeça
        c.beginPath();
        c.arc(-4, -24, 12, 0, Math.PI * 2);
        c.fillStyle = skin;
        c.fill();
        c.fillStyle = hair;
        c.beginPath();
        c.arc(-4, -28, 11, Math.PI, Math.PI * 2);
        c.fill();

        c.restore();
        c.restore();
        return;
    }

    // ---------------- CORRIDA REALISTA / CARTOON ----------------
    const legSwing = Math.sin(runCycle) * 10;
    const armSwing = Math.sin(runCycle) * 9;

    // 1. BRAÇOS (Balançam alternadamente em sprint)
    // Braço Esquerdo
    c.save();
    c.translate(-20, -10);
    c.rotate(armSwing * 0.08);
    // Manga
    c.fillStyle = isGoalkeeper ? '#facc15' : team.primary;
    c.beginPath();
    c.roundRect(-4, 0, 8, 12, 3);
    c.fill();
    // Antebraço e mão
    c.fillStyle = skin;
    c.beginPath();
    c.roundRect(-3, 10 + armSwing, 6, 12, 3);
    c.fill();
    c.restore();

    // Braço Direito
    c.save();
    c.translate(20, -10);
    c.rotate(-armSwing * 0.08);
    c.fillStyle = isGoalkeeper ? '#facc15' : team.primary;
    c.beginPath();
    c.roundRect(-4, 0, 8, 12, 3);
    c.fill();
    c.fillStyle = skin;
    c.beginPath();
    c.roundRect(-3, 10 - armSwing, 6, 12, 3);
    c.fill();
    c.restore();

    // 2. PERNAS E CHUTEIRAS (Meiões com listra e chuteira detalhada)
    // Perna Esquerda
    c.fillStyle = isGoalkeeper ? '#0f172a' : team.shorts;
    c.fillRect(-14, 6 + legSwing, 10, 10);
    c.fillStyle = isGoalkeeper ? '#facc15' : team.socks;
    c.fillRect(-14, 15 + legSwing, 10, 11);
    c.fillStyle = 'rgba(255, 255, 255, 0.7)';
    c.fillRect(-14, 15 + legSwing, 10, 2.5);
    c.fillStyle = isGolden ? '#facc15' : '#0f172a';
    c.beginPath();
    c.roundRect(-16, 24 + legSwing, 13, 6, 2);
    c.fill();

    // Perna Direita
    c.fillStyle = isGoalkeeper ? '#0f172a' : team.shorts;
    c.fillRect(4, 6 - legSwing, 10, 10);
    c.fillStyle = isGoalkeeper ? '#facc15' : team.socks;
    c.fillRect(4, 15 - legSwing, 10, 11);
    c.fillStyle = 'rgba(255, 255, 255, 0.7)';
    c.fillRect(4, 15 - legSwing, 10, 2.5);
    c.fillStyle = isGolden ? '#facc15' : '#0f172a';
    c.beginPath();
    c.roundRect(3, 24 - legSwing, 13, 6, 2);
    c.fill();

    // 3. TRONCO / CAMISA ATLÉTICA
    c.fillStyle = isGoalkeeper ? '#facc15' : team.primary;
    c.beginPath();
    c.roundRect(-20, -18, 40, 28, 7);
    c.fill();

    // Painéis laterais da camisa para dar volume muscular
    c.fillStyle = 'rgba(0, 0, 0, 0.15)';
    c.fillRect(-20, -14, 4, 22);
    c.fillRect(16, -14, 4, 22);

    // Listras e detalhes autênticos do clube
    if (!isGoalkeeper) {
        if (team.stripes === 'vertical') {
            c.fillStyle = team.secondary;
            c.fillRect(-11, -18, 7, 28);
            c.fillRect(4, -18, 7, 28);
        } else if (team.stripes === 'horizontal') {
            c.fillStyle = team.secondary;
            c.fillRect(-20, -11, 40, 6);
            c.fillRect(-20, 0, 40, 6);
        } else if (team.stripes === 'chest') {
            c.fillStyle = '#dc2626';
            c.fillRect(-20, -9, 40, 5);
            c.fillStyle = '#0f172a';
            c.fillRect(-20, -4, 40, 5);
        } else if (team.stripes === 'sash') {
            // Faixa diagonal cruzando a camisa (Vasco da Gama)
            c.save();
            c.beginPath();
            c.roundRect(-20, -18, 40, 28, 7);
            c.clip();
            c.strokeStyle = team.secondary;
            c.lineWidth = 8;
            c.beginPath();
            c.moveTo(-22, 12);
            c.lineTo(22, -18);
            c.stroke();
            // Cruz de Malta vermelha no peito
            c.fillStyle = '#dc2626';
            c.fillRect(-3, -7, 6, 6);
            c.restore();
        } else {
            // Detalhes elegantes nos ombros (tipo Adidas/Nike)
            c.fillStyle = team.secondary;
            c.fillRect(-19, -18, 5, 12);
            c.fillRect(14, -18, 5, 12);
        }
    }

    // Contorno suave da camisa
    c.strokeStyle = 'rgba(0, 0, 0, 0.28)';
    c.lineWidth = 1.4;
    c.stroke();

    // Número nas costas
    const numColor = (team.primary === '#ffffff' && team.stripes !== 'horizontal') ? '#0f172a' : '#ffffff';
    c.fillStyle = numColor;
    c.font = 'bold 13px sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(number.toString(), 0, -3);

    // Gola da camisa
    c.fillStyle = team.secondary || '#ffffff';
    c.beginPath();
    c.arc(0, -18, 5, 0, Math.PI);
    c.fill();

    // 4. PESCOÇO E CABEÇA
    c.fillStyle = skin;
    c.fillRect(-4, -24, 8, 7);

    c.beginPath();
    c.arc(0, -25, 12, 0, Math.PI * 2);
    c.fillStyle = skin;
    c.fill();

    // Cabelo
    c.fillStyle = hair;
    c.beginPath();
    c.arc(0, -30, 11.5, Math.PI, Math.PI * 2);
    c.fill();

    // Luvas (se for goleiro)
    if (isGoalkeeper) {
        c.font = '22px sans-serif';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText('🧤', -22, -8);
        c.fillText('🧤', 22, -8);
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
    pCtx.arc(65, 170, 48, Math.PI, 0);
    pCtx.stroke();

    // Jogador animando suavemente
    const t = performance.now() * 0.004;
    drawSoccerPlayer(pCtx, 65, 88, {
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
    pCtx.fillText(profile.name, 65, 50);

    // Bola aos pés 3D
    drawBallSprite(pCtx, 65, 126, 12, t * 2.2);
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

    pitchMargin = 16; // 100% largura do campo (sem barras laterais de torcida)
    goalPost.width = Math.min(width * 0.90, 390);
    goalPost.y = 85;
    goalPost.height = 145;
    goalPost.postThickness = 8;

    initWeatherParticles();
}

function initWeatherParticles() {
    rainDrops = [];
    for (let i = 0; i < 45; i++) {
        rainDrops.push({
            x: Math.random() * (width || 400),
            y: Math.random() * (height || 800),
            len: Math.random() * 16 + 12,
            spd: Math.random() * 260 + 520
        });
    }
}

// =========================================================
// PARTÍCULAS E EFEITOS ESPECIAIS
// =========================================================
function addGrassDust(x, y, count = 3) {
    for (let i = 0; i < count; i++) {
        particles.push({
            type: 'grass',
            x: x + (Math.random() - 0.5) * 10,
            y: y + (Math.random() - 0.5) * 8,
            vx: (Math.random() - 0.5) * 70,
            vy: (Math.random() - 0.5) * 60 + 25,
            size: Math.random() * 3 + 2,
            color: Math.random() < 0.5 ? '#86efac' : '#22c55e',
            life: 1.0,
            decay: 2.2
        });
    }
}

function addWaterSplash(x, y, count = 4) {
    for (let i = 0; i < count; i++) {
        particles.push({
            type: 'water',
            x: x + (Math.random() - 0.5) * 14,
            y: y + (Math.random() - 0.5) * 8,
            vx: (Math.random() - 0.5) * 100,
            vy: -Math.random() * 80 - 20,
            size: Math.random() * 3.5 + 2,
            color: 'rgba(224, 242, 254, 0.85)',
            life: 0.7,
            decay: 2.0
        });
    }
}

function addGoldTrail(x, y) {
    particles.push({
        type: 'gold',
        x: x + (Math.random() - 0.5) * 18,
        y: y + (Math.random() - 0.5) * 18,
        vx: (Math.random() - 0.5) * 45,
        vy: 90,
        size: Math.random() * 5 + 3,
        color: '#facc15',
        life: 0.8,
        decay: 1.8
    });
}

function addCoinSparkle(x, y, count = 6) {
    for (let i = 0; i < count; i++) {
        particles.push({
            type: 'sparkle',
            x: x + (Math.random() - 0.5) * 14,
            y: y + (Math.random() - 0.5) * 14,
            vx: (Math.random() - 0.5) * 100,
            vy: (Math.random() - 0.5) * 100,
            size: Math.random() * 4 + 2,
            color: '#fef08a',
            life: 0.6,
            decay: 2.0
        });
    }
}

function addConfetti(count = 90) {
    const colors = ['#facc15', '#22c55e', '#38bdf8', '#ef4444', '#e879f9', '#ffffff'];
    for (let i = 0; i < count; i++) {
        particles.push({
            type: 'confetti',
            x: width / 2 + (Math.random() - 0.5) * 160,
            y: goalPost.y + 40,
            vx: (Math.random() - 0.5) * 280,
            vy: -Math.random() * 260 - 120,
            gravity: 440,
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
// RENDERIZAÇÃO DO CAMPO E CLIMA (100% FULL-WIDTH, SEM BARRAS)
// =========================================================
function drawPitch(dt = 0.016) {
    const stadium = getCurrentStadium();

    // 1. Fundo do gramado moderno
    ctx.fillStyle = stadium.grassDark;
    ctx.fillRect(0, -10, width, height + 30);

    // 2. Faixas verticais elegantes de corte (Estilo Premier League)
    const stripeCount = 6;
    const stripeW = width / stripeCount;
    for (let i = 0; i < stripeCount; i++) {
        if (i % 2 === 0) {
            ctx.fillStyle = stadium.grassLight;
            ctx.fillRect(i * stripeW, -10, stripeW, height + 30);
        }
    }

    // 3. Efeito Parallax de corte da grama descendo (sem círculos repetitivos)
    const mowingSpacing = 160;
    const mowOffset = fieldY % mowingSpacing;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
    for (let y = -mowingSpacing + mowOffset; y < height + mowingSpacing; y += mowingSpacing) {
        ctx.fillRect(0, y, width, mowingSpacing * 0.45);
    }

    // 4. Linhas laterais brancas do campo
    ctx.strokeStyle = stadium.line;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(pitchMargin, -10);
    ctx.lineTo(pitchMargin, height + 20);
    ctx.moveTo(width - pitchMargin, -10);
    ctx.lineTo(width - pitchMargin, height + 20);
    ctx.stroke();

    // 5. Marcações discretas de distância no gramado (250m, 500m, 750m)
    const distInterval = 250;
    const currentQuarter = Math.floor(stageDist / distInterval);
    const nextMarkerDist = (currentQuarter + 1) * distInterval;
    if (nextMarkerDist < STAGE_GOAL_METERS) {
        const markerMetersAhead = nextMarkerDist - stageDist;
        const markerPixelY = player.y - (markerMetersAhead / (scrollSpeed * 0.22)) * scrollSpeed;
        if (markerPixelY > -60 && markerPixelY < height + 60) {
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.lineWidth = 2;
            ctx.setLineDash([12, 10]);
            ctx.beginPath();
            ctx.moveTo(pitchMargin, markerPixelY);
            ctx.lineTo(width - pitchMargin, markerPixelY);
            ctx.stroke();
            ctx.setLineDash([]);

            // Badge central com a quilometragem/metragem
            ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
            ctx.beginPath();
            ctx.roundRect(width / 2 - 38, markerPixelY - 12, 76, 24, 6);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${nextMarkerDist}m`, width / 2, markerPixelY);
            ctx.restore();
        }
    }

    // 6. A partir de 820m da fase, a Grande Área e o Gol aproximam-se!
    if (stageDist >= 820) {
        const goalDistAhead = STAGE_GOAL_METERS - stageDist;
        const goalScreenY = (player.y - 120) - (goalDistAhead / 180) * (height * 0.65);
        if (goalScreenY > -240) {
            drawApproachingPenaltyArea(goalScreenY, stadium);
        }
    }

    // 7. Efeitos climáticos do estádio
    drawWeather(stadium, dt);
}

function drawApproachingPenaltyArea(boxY, stadium) {
    ctx.save();
    const boxW = Math.min(width * 0.88, 360);
    const boxL = (width - boxW) / 2;
    const boxH = 140;

    // Grande Área
    ctx.strokeStyle = stadium.line;
    ctx.lineWidth = 3;
    ctx.strokeRect(boxL, boxY, boxW, boxH);

    // Marca do Pênalti
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(width / 2, boxY + boxH * 0.75, 5, 0, Math.PI * 2);
    ctx.fill();

    // Meia-lua
    ctx.beginPath();
    ctx.arc(width / 2, boxY + boxH * 0.75, 42, 0, Math.PI);
    ctx.stroke();

    // Trave visível ao fundo
    const goalL = (width - Math.min(width * 0.78, 280)) / 2;
    const goalR = width - goalL;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 7;
    ctx.strokeRect(goalL, boxY - 30, goalR - goalL, 30);
    ctx.restore();
}

function drawWeather(stadium, dt) {
    if (stadium.weather === 'rain') {
        // Chuva dinâmica e respingos no gramado molhado
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.42)';
        ctx.lineWidth = 1.6;
        for (let drop of rainDrops) {
            drop.y += drop.spd * dt;
            drop.x += 60 * dt;
            if (drop.y > height + 20) {
                drop.y = -20;
                drop.x = Math.random() * width;
                if (Math.random() < 0.25) {
                    addWaterSplash(drop.x, height * Math.random(), 2);
                }
            }
            ctx.beginPath();
            ctx.moveTo(drop.x, drop.y);
            ctx.lineTo(drop.x + 3, drop.y + drop.len);
            ctx.stroke();
        }
        ctx.restore();
    } else if (stadium.weather === 'night') {
        // Vinheta de noite sob refletores
        ctx.save();
        const grad = ctx.createRadialGradient(width / 2, height / 2, width * 0.25, width / 2, height / 2, width * 0.75);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(1, 'rgba(15, 23, 42, 0.38)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Fachos de iluminação dos refletores
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(width * 0.5, height * 0.6); ctx.lineTo(0, height * 0.4); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(width, 0); ctx.lineTo(width * 0.5, height * 0.6); ctx.lineTo(width, height * 0.4); ctx.fill();
        ctx.restore();
    } else if (stadium.weather === 'smoke') {
        // Sinalizadores da torcida (névoa avermelhada e quente)
        ctx.save();
        const t = performance.now() * 0.0015;
        const alpha = 0.10 + Math.sin(t) * 0.03;
        ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`;
        ctx.fillRect(0, 0, width, height);

        const flareGrad = ctx.createLinearGradient(0, 0, 0, 180);
        flareGrad.addColorStop(0, 'rgba(245, 158, 11, 0.22)');
        flareGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = flareGrad;
        ctx.fillRect(0, 0, width, 180);
        ctx.restore();
    } else if (stadium.weather === 'final') {
        // Grande Final Dourada
        ctx.save();
        const t = performance.now() * 0.002;
        const grad = ctx.createRadialGradient(width / 2, height * 0.35, 20, width / 2, height * 0.35, width * 0.8);
        grad.addColorStop(0, `rgba(254, 240, 138, ${0.12 + Math.sin(t) * 0.04})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
    }
}

// =========================================================
// POWER-UPS E COLETÁVEIS (TRILHAS DE MOEDAS 3D, ÍMÃ, ISOTÔNICO, CHUTEIRA)
// =========================================================
function drawCoinSprite(c, x, y, bob) {
    c.save();
    c.translate(x, y + Math.sin(bob) * 4);

    // Sombra oval no gramado
    c.beginPath();
    c.ellipse(0, 16, 14, 6, 0, 0, Math.PI * 2);
    c.fillStyle = 'rgba(0, 0, 0, 0.28)';
    c.fill();

    // Aura dourada pulsante
    c.beginPath();
    c.arc(0, 0, 18, 0, Math.PI * 2);
    c.fillStyle = 'rgba(250, 204, 21, 0.28)';
    c.fill();

    // Borda exterior 3D
    c.beginPath();
    c.arc(0, 0, 14, 0, Math.PI * 2);
    c.fillStyle = '#f59e0b';
    c.fill();
    c.strokeStyle = '#b45309';
    c.lineWidth = 2.2;
    c.stroke();

    // Face interna da moeda
    c.beginPath();
    c.arc(0, 0, 11, 0, Math.PI * 2);
    c.fillStyle = '#facc15';
    c.fill();

    // Estrela dourada no centro
    c.fillStyle = '#92400e';
    c.font = 'bold 12px sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('★', 0, 0.5);

    // Brilho de reflexo
    c.beginPath();
    c.arc(-4, -4, 4, 0, Math.PI * 2);
    c.fillStyle = 'rgba(255, 255, 255, 0.65)';
    c.fill();

    c.restore();
}

function drawDrinkSprite(c, x, y, bob) {
    c.save();
    c.translate(x, y + Math.sin(bob) * 4);

    // Sombra
    c.beginPath();
    c.ellipse(0, 16, 12, 5, 0, 0, Math.PI * 2);
    c.fillStyle = 'rgba(0, 0, 0, 0.28)';
    c.fill();

    // Aura azul
    c.beginPath();
    c.arc(0, 0, 20, 0, Math.PI * 2);
    c.fillStyle = 'rgba(56, 189, 248, 0.32)';
    c.fill();

    // Garrafa esportiva
    c.fillStyle = '#0284c7';
    c.beginPath();
    c.roundRect(-8, -12, 16, 26, 4);
    c.fill();

    // Bico e tampa
    c.fillStyle = '#ffffff';
    c.fillRect(-5, -16, 10, 4);
    c.fillStyle = '#ef4444';
    c.fillRect(-3, -19, 6, 3);

    // Rótulo de raio
    c.fillStyle = '#38bdf8';
    c.fillRect(-8, -4, 16, 12);
    c.fillStyle = '#facc15';
    c.font = 'bold 11px sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('⚡', 0, 2);

    c.restore();
}

function drawBootSprite(c, x, y, bob) {
    c.save();
    c.translate(x, y + Math.sin(bob) * 4);

    // Sombra
    c.beginPath();
    c.ellipse(0, 16, 15, 6, 0, 0, Math.PI * 2);
    c.fillStyle = 'rgba(0, 0, 0, 0.28)';
    c.fill();

    // Aura dourada
    c.beginPath();
    c.arc(0, 0, 22, 0, Math.PI * 2);
    c.fillStyle = 'rgba(250, 204, 21, 0.38)';
    c.fill();

    // Chuteira de Ouro
    c.fillStyle = '#facc15';
    c.beginPath();
    c.roundRect(-14, -6, 28, 14, 5);
    c.fill();
    c.fillStyle = '#d97706';
    c.fillRect(-14, 4, 28, 4);
    // Travas brancas
    c.fillStyle = '#ffffff';
    c.fillRect(-10, 8, 4, 3);
    c.fillRect(-2, 8, 4, 3);
    c.fillRect(6, 8, 4, 3);

    // Asas / Turbo
    c.fillStyle = '#ffffff';
    c.font = 'bold 12px sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('💨', 10, -8);

    c.restore();
}

function drawMagnetSprite(c, x, y, bob) {
    c.save();
    c.translate(x, y + Math.sin(bob) * 4);

    // Sombra
    c.beginPath();
    c.ellipse(0, 16, 13, 5, 0, 0, Math.PI * 2);
    c.fillStyle = 'rgba(0, 0, 0, 0.28)';
    c.fill();

    // Aura vermelha
    c.beginPath();
    c.arc(0, 0, 20, 0, Math.PI * 2);
    c.fillStyle = 'rgba(239, 68, 68, 0.32)';
    c.fill();

    // Ferradura
    c.strokeStyle = '#dc2626';
    c.lineWidth = 6;
    c.beginPath();
    c.arc(0, -2, 10, 0, Math.PI);
    c.stroke();

    // Hastes
    c.fillStyle = '#dc2626';
    c.fillRect(-13, -12, 6, 10);
    c.fillRect(7, -12, 6, 10);

    // Polos prateados
    c.fillStyle = '#ffffff';
    c.fillRect(-13, -16, 6, 5);
    c.fillRect(7, -16, 6, 5);

    c.restore();
}

function spawnPickups(dist) {
    if (gameState !== STATE.RUNNING) return;

    const laneW = (width - pitchMargin * 2) / 3;
    const lane = Math.floor(Math.random() * 3);
    const posX = pitchMargin + (lane + 0.5) * laneW;

    const rand = Math.random();

    if (rand < 0.22) {
        // Power-up Especial (Isotônico, Chuteira ou Ímã)
        let type = 'drink';
        const pRand = Math.random();
        if (pRand < 0.40) type = 'drink';
        else if (pRand < 0.75) type = 'boot';
        else type = 'magnet';

        pickups.push({
            type,
            x: posX,
            y: -50,
            radius: 18,
            bob: Math.random() * Math.PI * 2
        });
    } else {
        // Trilha de 3 a 5 Moedas Douradas (serve como guia visual da rota segura!)
        const count = Math.floor(Math.random() * 3) + 3; // 3, 4 ou 5
        const spacing = 42;
        for (let i = 0; i < count; i++) {
            pickups.push({
                type: 'coin',
                x: posX + (Math.random() - 0.5) * 6,
                y: -50 - (i * spacing),
                radius: 14,
                bob: (i * 0.4) + Math.random() * 0.5
            });
        }
    }
}

function updatePickups(dt) {
    const magRadius = getMagnetRadius();

    for (let i = pickups.length - 1; i >= 0; i--) {
        const p = pickups[i];
        p.y += scrollSpeed * timeScale * dt;
        p.bob += 4 * dt;

        // Ímã puxa moedas com força magnética realista
        if (p.type === 'coin' && magRadius > 0) {
            const dx = player.x - p.x;
            const dy = (player.y + 10) - p.y;
            const d = Math.hypot(dx, dy);
            if (d < magRadius) {
                const pullSpd = 550 * (1 - d / magRadius) + 320;
                p.x += (dx / d) * pullSpd * dt;
                p.y += (dy / d) * pullSpd * dt;
            }
        }

        // Renderiza
        if (p.type === 'coin') {
            drawCoinSprite(ctx, p.x, p.y, p.bob);
        } else if (p.type === 'drink') {
            drawDrinkSprite(ctx, p.x, p.y, p.bob);
        } else if (p.type === 'boot') {
            drawBootSprite(ctx, p.x, p.y, p.bob);
        } else if (p.type === 'magnet') {
            drawMagnetSprite(ctx, p.x, p.y, p.bob);
        }

        // Coleta
        const distToPlayer = Math.hypot(player.x - p.x, player.y - p.y);
        if (distToPlayer < player.radius + p.radius) {
            collectPickup(p);
            pickups.splice(i, 1);
            continue;
        }

        if (p.y > height + 80) pickups.splice(i, 1);
    }
}

function collectPickup(p) {
    if (p.type === 'coin') {
        audio.playCoin();
        coinsSession++;
        profile.totalCoins++;
        profile.save();
        coinsEl.textContent = coinsSession;
        score += 50;
        addCoinSparkle(p.x, p.y, 6);
        showToast('MOEDA! +50', '');
    } else if (p.type === 'drink') {
        audio.playPowerup();
        slowEnergy = 100;
        showToast('ISOTÔNICO!', 'SLOW-MO 100% CHEIO');
    } else if (p.type === 'boot') {
        audio.playPowerup();
        const duration = getSuperSpeedDuration();
        superSpeedTimer = duration;
        invulnerableTimer = duration;
        powerPillEl.classList.remove('hidden');
        powerNameEl.textContent = 'CHUTEIRA TURBO';
        showToast('CHUTEIRA DE OURO!', 'SUPERVELOCIDADE!');
    } else if (p.type === 'magnet') {
        audio.playPowerup();
        magnetTimer = 8.0;
        powerPillEl.classList.remove('hidden');
        powerNameEl.textContent = 'ÍMÃ DE MOEDAS';
        showToast('ÍMÃ DE MOEDAS!', 'PUXANDO TUDO!');
    }
}

// =========================================================
// ZAGUEIROS (MOVIMENTAÇÃO ESTATÉGICA DE FUTEBOL)
// =========================================================
function spawnDefendersIfNeeded() {
    if (gameState !== STATE.RUNNING) return;

    if (stageDist >= nextSpawnDist) {
        // Quantidade amigável na fase 1 e calibrada gradativamente
        const maxOnScreen = stage === 1 ? 2 : (stage === 2 ? 3 : 4);

        if (defenders.length < maxOnScreen) {
            const laneW = (width - pitchMargin * 2) / 3;
            const lane = Math.floor(Math.random() * 3);
            const posX = pitchMargin + (lane + 0.5) * laneW;

            let style = 'JOCKEY';
            const rand = Math.random();
            const stadium = getCurrentStadium();

            if (stadium.weather === 'rain' && rand < 0.65) {
                style = 'SLIDER';
            } else if (stageDist > 300 && rand < 0.45) {
                style = 'SLIDER';
            } else if (stageDist > 150 && rand < 0.75) {
                style = 'CHASER';
            }

            // Uniforme rival contrastante
            const rivalTeam = profile.teamId === 'flamengo' ? TEAMS.find(t => t.id === 'corinthians') : TEAMS.find(t => t.id === 'flamengo');

            defenders.push({
                x: posX,
                y: -70,
                radius: 20,
                style,
                state: 'NORMAL',
                stateTimer: 0,
                vx: (Math.random() < 0.5 ? 1 : -1) * (55 + Math.min(stage, 6) * 12),
                tackleVx: 0,
                tackleVy: 0,
                runCycle: 0,
                team: rivalTeam,
                number: [3, 4, 5, 2][Math.floor(Math.random() * 4)],
                dodged: false
            });
        }

        const spacing = Math.max(90, 140 - Math.min(stage, 5) * 8);
        nextSpawnDist = stageDist + spacing;
        spawnPickups(stageDist);
    }
}

function updateDefenders(dt) {
    const stadium = getCurrentStadium();

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
                if (distToPlayer < 240 && d.y < player.y) {
                    d.state = 'ALERT';
                    d.stateTimer = 0.38;
                    audio.playAlert();
                }
            } else if (d.state === 'ALERT') {
                d.stateTimer -= dt * timeScale;
                if (d.stateTimer <= 0) {
                    d.state = 'TACKLING';
                    const angle = Math.atan2(player.y - d.y, player.x - d.x);
                    const spd = 210 + Math.min(stage, 6) * 15;
                    d.tackleVx = Math.cos(angle) * spd;
                    d.tackleVy = Math.sin(angle) * spd;
                    d.stateTimer = 0.85;
                }
            } else if (d.state === 'TACKLING') {
                d.x += d.tackleVx * timeScale * dt;
                d.y += d.tackleVy * timeScale * dt;
                if (stadium.weather === 'rain') addWaterSplash(d.x, d.y + 12, 2);
                else addGrassDust(d.x, d.y + 10, 1);
                d.stateTimer -= dt * timeScale;
                if (d.stateTimer <= 0) {
                    d.state = 'STUMBLED';
                    d.stateTimer = 0.8;
                }
            }
        } else if (d.style === 'SLIDER') {
            if (d.state === 'NORMAL') {
                if (distToPlayer < 210 && Math.abs(player.y - d.y) < 170) {
                    d.state = 'ALERT';
                    d.stateTimer = 0.32;
                    audio.playAlert();
                }
            } else if (d.state === 'ALERT') {
                d.stateTimer -= dt * timeScale;
                if (d.stateTimer <= 0) {
                    d.state = 'TACKLING';
                    const dirX = player.x > d.x ? 1 : -1;
                    d.tackleVx = dirX * (250 + Math.min(stage, 6) * 15);
                    d.stateTimer = 0.65;
                }
            } else if (d.state === 'TACKLING') {
                d.x += d.tackleVx * timeScale * dt;
                if (stadium.weather === 'rain') addWaterSplash(d.x, d.y + 14, 3);
                else addGrassDust(d.x, d.y + 12, 2);
                d.stateTimer -= dt * timeScale;
                if (d.stateTimer <= 0) {
                    d.state = 'STUMBLED';
                    d.stateTimer = 0.8;
                }
            }
        }

        // Drible bem sucedido
        if (!d.dodged && (d.y > player.y + 26 || d.state === 'STUMBLED')) {
            d.dodged = true;
            dribbles++;
            score += 150;
            scoreEl.textContent = score;
            showToast('⚽ DRIBLE!', '+150 PTS');
        }

        // Colisão
        if (gameState === STATE.RUNNING) {
            if (distToPlayer < player.radius + d.radius - 4) {
                if (superSpeedTimer > 0) {
                    d.state = 'STUMBLED';
                    d.vx *= -2;
                    addGrassDust(d.x, d.y, 6);
                    audio.playWhoosh();
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
            ctx.arc(d.x, d.y - 42, 13, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.2;
            ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('!', d.x, d.y - 41);
            ctx.restore();
        }

        if (d.state === 'STUMBLED') {
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('💫', d.x, d.y - 40);
        }

        if (d.y > height + 80) defenders.splice(i, 1);
    }
}

// =========================================================
// O JOGADOR (MOVIMENTAÇÃO 2D E ROTAÇÃO DA BOLA)
// =========================================================
function updatePlayer(dt) {
    if (gameState === STATE.RUNNING) {
        const lerpFactor = 16 * dt;
        player.x += (player.targetX - player.x) * Math.min(1, lerpFactor);
        player.y += (player.targetY - player.y) * Math.min(1, lerpFactor);

        const minX = pitchMargin + player.radius + 6;
        const maxX = width - pitchMargin - player.radius - 6;
        player.x = Math.max(minX, Math.min(maxX, player.x));

        const minY = height * 0.16;
        const maxY = height - player.radius - 20;
        player.y = Math.max(minY, Math.min(maxY, player.y));

        player.runCycle += 14 * dt * timeScale;
        player.ballRot += (scrollSpeed * 0.035) * dt * timeScale;

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

        // Bola aos pés 3D
        const ballOffset = 22 + Math.sin(player.runCycle) * 3;
        drawBallSprite(ctx, player.x, player.y + ballOffset, 14, player.ballRot);
    } else if (gameState === STATE.PENALTY_RUNUP) {
        penRunUp += 3.6 * dt;
        player.runCycle += 18 * dt;
        player.x += (penBall.x - player.x) * 0.22;
        player.y += ((penBall.y + 16) - player.y) * 0.22;

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
// DISPUTA DE PÊNALTI DRAMÁTICA (CLOSE-UP NA CARA DO GOL)
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

    // Trave Gigante em Close-Up
    goalPost.y = 85;
    goalPost.height = 145;
    goalPost.width = Math.min(width * 0.90, 390);
    goalPost.postThickness = 8;

    // Jogador PARADO na marca da cal
    player.x = width / 2;
    player.y = height - 125;
    player.targetX = player.x;
    player.targetY = player.y;

    // Bola parada na marca do pênalti
    penBall.x = width / 2;
    penBall.y = height - 180;
    penBall.scale = 1.25;
    penBall.vx = 0;
    penBall.vy = 0;

    // Goleiro na linha da trave
    goalie.x = width / 2;
    goalie.y = goalPost.y + goalPost.height - 20;
    goalie.vx = 90 + Math.min(stage - 1, 6) * 18;
    goalie.diveProgress = 0;
    goalie.diveDir = 0;

    // Mira inicial oscilando
    penaltyAim.sweep = 0;
    penaltyAim.x = width / 2;
    penaltyAim.y = goalPost.y + goalPost.height * 0.45;
    penaltyAim.isManual = false;

    audio.playWhistle(true);
    penaltyUiEl.classList.remove('hidden');
}

function updatePenalty(dt) {
    if (gameState === STATE.PENALTY_AIM) {
        if (!penaltyAim.isManual) {
            const aimSpeed = getPenaltyAimSpeed();
            penaltyAim.sweep += aimSpeed * dt;
            const goalL = (width - goalPost.width) / 2 + 30;
            const goalR = goalL + goalPost.width - 60;
            const center = (goalL + goalR) / 2;
            const radius = (goalR - goalL) / 2;
            penaltyAim.x = center + Math.sin(penaltyAim.sweep) * radius;
            penaltyAim.y = goalPost.y + 25 + (Math.sin(penaltyAim.sweep * 1.6) + 1) * 26;
        }

        goalie.x += goalie.vx * dt;
        const gkMinX = (width - goalPost.width) / 2 + 35;
        const gkMaxX = gkMinX + goalPost.width - 70;
        if (goalie.x < gkMinX) { goalie.x = gkMinX; goalie.vx = Math.abs(goalie.vx); }
        else if (goalie.x > gkMaxX) { goalie.x = gkMaxX; goalie.vx = -Math.abs(goalie.vx); }
    } else if (gameState === STATE.PENALTY_KICK) {
        penBall.x += penBall.vx * dt;
        penBall.y += penBall.vy * dt;
        penBall.scale = Math.max(0.72, penBall.scale - 0.75 * dt);
        addGrassDust(penBall.x, penBall.y, 1);

        goalie.x += goalie.diveDir * (190 + Math.min(stage, 6) * 20) * dt;

        checkPenaltyCollision();
    }
}

function startPenaltyShot() {
    const dx = penaltyAim.x - penBall.x;
    const dy = penaltyAim.y - penBall.y;
    const dist = Math.hypot(dx, dy) || 1;
    const speed = 720;

    penBall.vx = (dx / dist) * speed;
    penBall.vy = (dy / dist) * speed;

    const aimSide = penaltyAim.x > width / 2 ? 1 : -1;
    const guessChance = Math.min(0.55, 0.22 + (stage - 1) * 0.07);
    const gkGuessedRight = Math.random() < guessChance;
    goalie.diveDir = gkGuessedRight ? aimSide : -aimSide;
}

function checkPenaltyCollision() {
    const distToGk = Math.hypot(penBall.x - goalie.x, penBall.y - goalie.y);
    const saveRadius = Math.min(28, 22 + (stage - 1) * 1.2);
    if (distToGk < saveRadius) {
        screenShake = 16;
        audio.playWhistle(true);
        triggerGameOver('O GOLEIRO ESPALMOU NO ÂNGULO!');
        return;
    }

    const goalL = (width - goalPost.width) / 2;
    const goalR = goalL + goalPost.width;

    if (penBall.y <= goalPost.y + goalPost.height - 10) {
        const isNearLeftPost = Math.abs(penBall.x - goalL) < 14;
        const isNearRightPost = Math.abs(penBall.x - goalR) < 14;
        const isNearCrossbar = Math.abs(penBall.y - goalPost.y) < 14;

        if (isNearLeftPost || isNearRightPost || isNearCrossbar) {
            screenShake = 22;
            audio.playPostHit();
            audio.playWhistle(true);
            triggerGameOver('💥 CHUTOU NA TRAVE! QUE PENA!');
            return;
        }

        if (penBall.x >= goalL + 12 && penBall.x <= goalR - 12) {
            handleGoalSuccess();
        } else {
            screenShake = 14;
            audio.playWhistle(true);
            triggerGameOver('CHUTOU PRA FORA!');
        }
    }
}

function handleGoalSuccess() {
    gameState = STATE.CELEBRATION;
    goals++;
    score += 500;
    scoreEl.textContent = score;

    audio.playGoalFanfare();
    addConfetti(120);
    screenShake = 18;

    showBanner('goal', 'GOLAÇO!', 'GOOOOOOL!', '+500 PONTOS!');

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

    const stadium = getCurrentStadium();
    stageNumEl.textContent = `FASE ${stage}`;
    if (stadiumNameEl) stadiumNameEl.textContent = stadium.name;
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

    showBanner('stage', stadium.name, `FASE ${stage}`, 'Drible a zaga e avance ao próximo gol!');
}

function drawPenaltyScene() {
    if (gameState === STATE.RUNNING || gameState === STATE.MENU) return;

    const goalL = (width - goalPost.width) / 2;
    const goalR = goalL + goalPost.width;

    ctx.save();

    // 1. Grande Área em Close-Up
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 3.5;
    const boxW = Math.min(width * 0.96, goalPost.width + 50);
    ctx.strokeRect((width - boxW) / 2, goalPost.y + 15, boxW, height - goalPost.y - 120);

    // Marca da Cal
    ctx.beginPath();
    ctx.arc(width / 2, height - 180, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Meia-lua
    ctx.beginPath();
    ctx.arc(width / 2, height - 180, 50, Math.PI, 0);
    ctx.stroke();

    // 2. Rede 3D com Profundidade
    ctx.fillStyle = 'rgba(255, 255, 255, 0.20)';
    ctx.fillRect(goalL, goalPost.y, goalPost.width, goalPost.height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.40)';
    ctx.lineWidth = 1.2;
    for (let x = goalL; x <= goalR; x += 16) {
        ctx.beginPath();
        ctx.moveTo(x, goalPost.y);
        ctx.lineTo(x, goalPost.y + goalPost.height);
        ctx.stroke();
    }
    for (let y = goalPost.y; y <= goalPost.y + goalPost.height; y += 14) {
        ctx.beginPath();
        ctx.moveTo(goalL, y);
        ctx.lineTo(goalR, y);
        ctx.stroke();
    }

    // Postes e Travessão Brancos e Espessos
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = goalPost.postThickness;
    ctx.beginPath();
    ctx.moveTo(goalL, goalPost.y + goalPost.height);
    ctx.lineTo(goalL, goalPost.y);
    ctx.lineTo(goalR, goalPost.y);
    ctx.lineTo(goalR, goalPost.y + goalPost.height);
    ctx.stroke();

    // Rótulos de Canto / Gaveta
    if (gameState === STATE.PENALTY_AIM) {
        ctx.font = 'bold 10px sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.textAlign = 'left';
        ctx.fillText('GAVETA ESQ', goalL + 10, goalPost.y + 20);
        ctx.textAlign = 'right';
        ctx.fillText('GAVETA DIR', goalR - 10, goalPost.y + 20);
        ctx.textAlign = 'left';
        ctx.fillText('CANTO ESQ', goalL + 10, goalPost.y + goalPost.height - 15);
        ctx.textAlign = 'right';
        ctx.fillText('CANTO DIR', goalR - 10, goalPost.y + goalPost.height - 15);
    }

    ctx.restore();

    // 3. Goleiro Imponente
    drawSoccerPlayer(ctx, goalie.x, goalie.y, {
        team: TEAMS[0],
        skin: SKINS[0],
        hair: HAIRS[0],
        number: 1,
        isGoalkeeper: true
    });

    // 4. Bola de Futebol 3D
    drawBallSprite(ctx, penBall.x, penBall.y, 16 * penBall.scale);

    // 5. Jogador e Alvo
    if (gameState === STATE.PENALTY_AIM) {
        drawSoccerPlayer(ctx, player.x, player.y, {
            team: profile.getTeam(),
            skin: profile.skin,
            hair: profile.hair,
            number: profile.number,
            runCycle: 0
        });

        // Laser de Trajetória
        ctx.save();
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.85)';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(penBall.x, penBall.y);
        ctx.lineTo(penaltyAim.x, penaltyAim.y);
        ctx.stroke();

        // Alvo Reticular
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(penaltyAim.x, penaltyAim.y, 16, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(penaltyAim.x, penaltyAim.y, 6, 0, Math.PI * 2);
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
// LOJA DO CRAQUE (UPGRADES COM MOEDAS)
// =========================================================
const UPGRADE_CONFIG = {
    slow: { name: 'Fôlego do Slow-Mo', icon: '⏱️', baseCost: 50, mult: 1.8 },
    spin: { name: 'Giro Ágil', icon: '🔄', baseCost: 60, mult: 1.8 },
    magnet: { name: 'Ímã de Moedas', icon: '🧲', baseCost: 75, mult: 1.8 },
    boot: { name: 'Chuteira Turbo', icon: '👟', baseCost: 80, mult: 1.8 },
    penalty: { name: 'Chute Preciso', icon: '🎯', baseCost: 100, mult: 1.8 }
};

function getUpgradeCost(upId, currentLvl) {
    const cfg = UPGRADE_CONFIG[upId];
    if (!cfg || currentLvl >= 5) return 0;
    return Math.round(cfg.baseCost * Math.pow(cfg.mult, currentLvl - 1));
}

function renderShopUI() {
    if (shopCoinsValEl) shopCoinsValEl.textContent = profile.totalCoins;
    if (menuTotalCoinsEl) menuTotalCoinsEl.textContent = profile.totalCoins;

    Object.keys(UPGRADE_CONFIG).forEach(upId => {
        const lvl = profile.upgrades[upId] || 1;
        const lvlEl = document.getElementById(`lvl-${upId}`);
        const barEl = document.getElementById(`bar-${upId}`);
        const btnEl = document.getElementById(`btn-up-${upId}`);

        if (lvlEl) {
            lvlEl.textContent = lvl >= 5 ? 'MÁXIMO' : `NV ${lvl}`;
            lvlEl.classList.toggle('max', lvl >= 5);
        }
        if (barEl) {
            barEl.style.width = `${Math.min(100, lvl * 20)}%`;
        }
        if (btnEl) {
            if (lvl >= 5) {
                btnEl.textContent = 'MÁX';
                btnEl.classList.add('disabled');
            } else {
                const cost = getUpgradeCost(upId, lvl);
                btnEl.textContent = `🪙 ${cost}`;
                btnEl.classList.toggle('disabled', profile.totalCoins < cost);
            }
        }
    });
}

function buyUpgrade(upId) {
    const lvl = profile.upgrades[upId] || 1;
    if (lvl >= 5) return;

    const cost = getUpgradeCost(upId, lvl);
    if (profile.totalCoins < cost) {
        showToast('MOEDAS INSUFICIENTES!', 'Jogue partidas para juntar mais!');
        return;
    }

    profile.totalCoins -= cost;
    profile.upgrades[upId] = lvl + 1;
    profile.save();

    audio.playBuy();
    renderShopUI();
    const cfg = UPGRADE_CONFIG[upId];
    showToast('MELHORIA DESBLOQUEADA!', `${cfg.name} NV ${profile.upgrades[upId]}!`);
}

function openShop() {
    renderShopUI();
    if (shopModal) shopModal.classList.remove('hidden');
}

function closeShop() {
    if (shopModal) shopModal.classList.add('hidden');
    if (menuTotalCoinsEl) menuTotalCoinsEl.textContent = profile.totalCoins;
}

function initShopUI() {
    if (shopBtn) shopBtn.addEventListener('click', openShop);
    if (overShopBtn) overShopBtn.addEventListener('click', openShop);
    if (shopCloseBtn) shopCloseBtn.addEventListener('click', closeShop);

    Object.keys(UPGRADE_CONFIG).forEach(upId => {
        const btn = document.getElementById(`btn-up-${upId}`);
        if (btn) {
            btn.addEventListener('click', () => buyUpgrade(upId));
        }
    });

    renderShopUI();
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
    const drainRate = getSlowDrainRate();
    if (isSlowMo && slowEnergy > 0) {
        slowEnergy -= drainRate * dt;
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

    spinCooldown = getSpinCooldownMax();
    isSpinning = true;
    spinAngle = 0;
    invulnerableTimer = 0.5;

    audio.playWhoosh();
    showToast('🔄 GIRO 360°!', 'DRIBLE ESPETACULAR');
}

function updateCooldowns(dt) {
    const maxSpin = getSpinCooldownMax();
    if (spinCooldown > 0) {
        spinCooldown = Math.max(0, spinCooldown - dt);
        const pct = (spinCooldown / maxSpin) * 100;
        spinShadeEl.style.height = `${pct}%`;
        spinBtn.classList.toggle('disabled', spinCooldown > 0);
    }
    if (invulnerableTimer > 0) {
        invulnerableTimer -= dt;
    }
    if (superSpeedTimer > 0) {
        superSpeedTimer -= dt;
        const totalDur = getSuperSpeedDuration();
        const pct = (superSpeedTimer / totalDur) * 100;
        powerFillEl.style.width = `${pct}%`;
        scrollSpeed = 340;
        if (superSpeedTimer <= 0) {
            powerPillEl.classList.add('hidden');
            scrollSpeed = 220;
        }
    }
    if (magnetTimer > 0) {
        magnetTimer -= dt;
        if (magnetTimer <= 0 && superSpeedTimer <= 0) {
            powerPillEl.classList.add('hidden');
        }
    }
}

// =========================================================
// LOOP PRINCIPAL DE ANIMAÇÃO (DELTA-TIME BASE)
// =========================================================
function update(dt) {
    if (gameState === STATE.RUNNING) {
        const meterRate = (scrollSpeed * 0.22) * timeScale;
        stageDist += meterRate * dt;
        totalDist += meterRate * dt;
        score += Math.floor(meterRate * dt * 2);

        progTxtEl.textContent = `${Math.floor(stageDist)}m / ${STAGE_GOAL_METERS}m`;
        scoreEl.textContent = score;

        const progPct = Math.min(100, (stageDist / STAGE_GOAL_METERS) * 100);
        progFillEl.style.width = `${progPct}%`;
        progBallEl.style.left = `${progPct}%`;

        // Pênalti a cada 1000m!
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

let lastTimestamp = 0;
let animationFrameId = null;

function gameLoop(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
    lastTimestamp = timestamp;

    ctx.save();
    if (screenShake > 0) {
        const sx = (Math.random() - 0.5) * screenShake * 2;
        const sy = (Math.random() - 0.5) * screenShake * 2;
        ctx.translate(sx, sy);
    }

    ctx.clearRect(0, 0, width, height);

    drawPitch(dt);
    drawPenaltyScene();

    update(dt);

    ctx.restore();

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
    magnetTimer = 0;
    spinCooldown = 0;
    scrollSpeed = 220;
    nextSpawnDist = 40;

    const stadium = getCurrentStadium();
    stageNumEl.textContent = 'FASE 1';
    if (stadiumNameEl) stadiumNameEl.textContent = stadium.name;
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
    renderShopUI();
}

// =========================================================
// EVENTOS DE TOQUE E CONTROLE 2D LIVRE
// =========================================================
let touchOriginX = 0;
let touchOriginY = 0;
let playerOriginX = 0;
let playerOriginY = 0;
let isTouching = false;

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

// Global release
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
// INICIALIZAÇÃO GERAL
// =========================================================
function init() {
    resize();
    initMenuUI();
    initShopUI();
    renderPreview();
    lastTimestamp = performance.now();
    animationFrameId = requestAnimationFrame(gameLoop);
}

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
