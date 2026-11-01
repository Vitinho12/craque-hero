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

    
    playCombo(level) {
        if (!this.enabled || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            const baseFreq = 440;
            const freq = Math.min(1350, baseFreq * Math.pow(1.15, Math.min(10, level)));
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.28, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.19);
        } catch (e) {}
    }

    playThunder() {
        if (!this.enabled || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(80, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(28, this.ctx.currentTime + 0.7);
            gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.75);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.8);
        } catch (e) {}
    }

    playCheckpoint() {
        if (!this.enabled || !this.ctx) return;
        try {
            [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.08);
                gain.gain.setValueAtTime(0.25, this.ctx.currentTime + i * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4 + i * 0.08);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(this.ctx.currentTime + i * 0.08);
                osc.stop(this.ctx.currentTime + 0.45 + i * 0.08);
            });
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

const comboPillEl = document.getElementById('combo-pill');
const comboCountEl = document.getElementById('combo-count');
const missionBarEl = document.getElementById('mission-bar');
const missionTxtEl = document.getElementById('mission-txt');
const missionRewardEl = document.getElementById('mission-reward');
const oComboEl = document.getElementById('o-combo');

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
    missionIdx: 0,
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
            if (typeof data.missionIdx === 'number') this.missionIdx = data.missionIdx;
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
                missionIdx: this.missionIdx || 0,
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

// =========================================================
// BANCO DE ESTÁDIOS E AMBIENTES (PISOS TEMÁTICOS AUTÊNTICOS)
// =========================================================
const STADIUMS = [
    {
        id: 'maracana',
        name: '☀️ MARACANÃ (SOL)',
        type: 'classic',
        grassLight: '#27ae60',
        grassDark: '#1e824c',
        line: 'rgba(255, 255, 255, 0.90)',
        sidelineTrack: '#0f172a',
        dirtTexture: false,
        weather: 'clear'
    },
    {
        id: 'terrao',
        name: '🏜️ TERRÃO DA VÁRZEA',
        type: 'dirt',
        grassLight: '#9a582c',
        grassDark: '#834720',
        line: 'rgba(254, 243, 199, 0.70)',
        sidelineTrack: '#542d14',
        dirtTexture: true,
        weather: 'dust'
    },
    {
        id: 'chuva',
        name: '🌧️ CLÁSSICO NA TEMPESTADE',
        type: 'rain',
        grassLight: '#145c32',
        grassDark: '#0d4022',
        line: 'rgba(255, 255, 255, 0.75)',
        sidelineTrack: '#071d10',
        dirtTexture: false,
        weather: 'rain'
    },
    {
        id: 'inverno',
        name: '❄️ CHAMPIONS NA NEVE',
        type: 'snow',
        grassLight: '#e0f2fe',
        grassDark: '#bae6fd',
        line: '#f97316', // Linhas laranjas de inverno europeu!
        sidelineTrack: '#0284c7',
        dirtTexture: false,
        weather: 'snow'
    },
    {
        id: 'final',
        name: '🏆 GRANDE FINAL DE GALA',
        type: 'final',
        grassLight: '#22c55e',
        grassDark: '#15803d',
        line: '#fef08a', // Linhas douradas de decisão!
        sidelineTrack: '#0f172a',
        dirtTexture: false,
        weather: 'final'
    }
];

function getCurrentStadium() {
    const idx = (stage - 1) % STADIUMS.length;
    return STADIUMS[idx];
}

// CÂMERA DINÂMICA (CAMPO ABRE EM SLOW-MO IGUAL AO TOUCHDOWN HERO)
const camera = {
    zoom: 1.0,
    targetZoom: 1.0,
    offsetY: 0,
    targetOffsetY: 0
};

// Helpers dinâmicos das melhorias do jogador
function getSlowDrainRate() {
    return Math.max(14, 28 - (profile.upgrades.slow - 1) * 3);
}
function getSlowRecoveryRate() {
    return 24 + (profile.upgrades.slow - 1) * 6;
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

// =========================================================
// MISSÕES / METAS ATIVAS DO CRAQUE
// =========================================================
const MISSIONS = [
    { id: 'dribble_3', text: 'Faça 3 dribles', target: 3, type: 'dribbles', reward: 50 },
    { id: 'combo_2', text: 'Atinja Combo x2', target: 2, type: 'combo', reward: 60 },
    { id: 'coins_20', text: 'Colete 20 moedas', target: 20, type: 'coins', reward: 50 },
    { id: 'stage_2', text: 'Alcance a Fase 2', target: 2, type: 'stage', reward: 100 },
    { id: 'combo_4', text: 'Atinja Combo x4', target: 4, type: 'combo', reward: 120 },
    { id: 'dribble_10', text: 'Faça 10 dribles na partida', target: 10, type: 'dribbles', reward: 150 },
    { id: 'stage_3', text: 'Alcance a Fase 3 (Chuva)', target: 3, type: 'stage', reward: 180 },
    { id: 'coins_50', text: 'Junte 50 moedas', target: 50, type: 'coins', reward: 120 },
    { id: 'stage_4', text: 'Alcance a Fase 4 (Sinalizadores)', target: 4, type: 'stage', reward: 250 }
];

function getCurrentMission() {
    const idx = (profile.missionIdx || 0) % MISSIONS.length;
    return MISSIONS[idx];
}

function updateMissionProgress() {
    const m = getCurrentMission();
    if (!m || !missionTxtEl) return;

    let currentVal = 0;
    if (m.type === 'dribbles') currentVal = dribbles;
    else if (m.type === 'combo') currentVal = maxComboSession;
    else if (m.type === 'coins') currentVal = coinsSession;
    else if (m.type === 'stage') currentVal = stage;

    missionTxtEl.textContent = `${m.text} (${Math.min(m.target, currentVal)}/${m.target})`;
    if (missionRewardEl) missionRewardEl.textContent = `🪙 +${m.reward}`;

    if (currentVal >= m.target) {
        const reward = m.reward;
        profile.totalCoins += reward;
        coinsSession += reward;
        if (coinsEl) coinsEl.textContent = coinsSession;
        profile.missionIdx = (profile.missionIdx || 0) + 1;
        profile.save();

        audio.playBuy();
        showToast('🏆 DESAFIO CUMPRIDO!', `+${reward} MOEDAS DE BÔNUS!`);

        const nextM = getCurrentMission();
        missionTxtEl.textContent = `${nextM.text} (0/${nextM.target})`;
        if (missionRewardEl) missionRewardEl.textContent = `🪙 +${nextM.reward}`;
    }
}

// Combos de Dribles
let comboCount = 0;
let comboTimer = 0;
let maxComboSession = 0;
let lightningTimer = 8.0;

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

// =========================================================
// GOLEIRO DRAMÁTICO (GINGA NA LINHA E SALTO ACROBÁTICO)
// =========================================================
function drawGoalkeeper(c, x, y, opts = {}) {
    const {
        state = 'IDLE', // 'IDLE', 'DIVING', 'SAVED', 'CONCEDED'
        diveDir = 0,    // -1 (left) or 1 (right)
        diveProgress = 0,
        bob = 0,
        skin = SKINS[0],
        hair = HAIRS[0]
    } = opts;

    c.save();
    c.translate(x, y);

    if (state === 'DIVING' || state === 'SAVED') {
        // SALTO ACROBÁTICO COMPLETO EM DIAGONAL
        const diveAngle = diveDir * (0.85 + Math.min(0.35, diveProgress * 0.4));
        c.rotate(diveAngle);

        // Sombra no gramado projetada
        c.beginPath();
        c.ellipse(0, 32, 28, 8, 0, 0, Math.PI * 2);
        c.fillStyle = 'rgba(0, 0, 0, 0.25)';
        c.fill();

        // Pernas esticadas em salto
        c.fillStyle = '#0f172a';
        c.fillRect(-18, 6, 12, 14);
        c.fillRect(-4, 8, 12, 16);
        c.fillStyle = '#22c55e'; // meias fluorescentes
        c.fillRect(-18, 20, 12, 14);
        c.fillRect(-4, 24, 12, 14);
        c.fillStyle = '#0f172a';
        c.fillRect(-20, 32, 14, 8);
        c.fillRect(-6, 36, 14, 8);

        // Tronco inclinado (Camisa neon de goleiro)
        c.fillStyle = '#eab308';
        c.beginPath();
        c.roundRect(-16, -18, 32, 28, 6);
        c.fill();
        c.fillStyle = '#ca8a04';
        c.fillRect(-16, 2, 32, 6);

        // Número 1 nas costas
        c.fillStyle = '#0f172a';
        c.font = 'bold 12px sans-serif';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText('1', 0, -4);

        // Cabeça
        c.fillStyle = skin;
        c.beginPath();
        c.arc(0, -26, 12, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = hair;
        c.beginPath();
        c.arc(0, -30, 11, Math.PI, Math.PI * 2);
        c.fill();

        // BRAÇOS TOTALMENTE ESTICADOS PARA PEGAR A BOLA
        c.fillStyle = '#eab308';
        c.fillRect(-26, -16, 10, 10);
        c.fillStyle = skin;
        c.fillRect(-34, -22, 10, 8);
        // Luva de Goleiro Gigante Esquerda
        c.fillStyle = '#22c55e';
        c.beginPath();
        c.roundRect(-46, -26, 14, 16, 4);
        c.fill();
        c.strokeStyle = '#ffffff';
        c.lineWidth = 1.5;
        c.stroke();

        c.fillStyle = '#eab308';
        c.fillRect(16, -16, 10, 10);
        c.fillStyle = skin;
        c.fillRect(24, -22, 10, 8);
        // Luva de Goleiro Gigante Direita
        c.fillStyle = '#22c55e';
        c.beginPath();
        c.roundRect(32, -26, 14, 16, 4);
        c.fill();
        c.strokeStyle = '#ffffff';
        c.lineWidth = 1.5;
        c.stroke();

        if (state === 'SAVED') {
            c.beginPath();
            c.arc(diveDir > 0 ? 38 : -38, -20, 24, 0, Math.PI * 2);
            c.fillStyle = 'rgba(250, 204, 21, 0.45)';
            c.fill();
        }
    } else if (state === 'CONCEDED') {
        // GOLEIRO NO CHÃO LAMENTANDO O GOL
        c.rotate(diveDir * 1.35);
        c.translate(0, 16);

        c.beginPath();
        c.ellipse(0, 12, 34, 10, 0, 0, Math.PI * 2);
        c.fillStyle = 'rgba(0, 0, 0, 0.35)';
        c.fill();

        c.fillStyle = '#eab308';
        c.beginPath();
        c.roundRect(-16, -12, 32, 22, 5);
        c.fill();
        c.fillStyle = '#0f172a';
        c.fillRect(-14, 8, 28, 12);

        c.fillStyle = '#22c55e';
        c.fillRect(-28, -6, 12, 12);
        c.fillRect(16, -6, 12, 12);

        c.fillStyle = skin;
        c.beginPath();
        c.arc(0, -20, 12, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = hair;
        c.beginPath();
        c.arc(0, -24, 11, Math.PI, Math.PI * 2);
        c.fill();
    } else {
        // GINGA DE GOLEIRO (READY / IDLE NA LINHA)
        const gBob = Math.sin(bob) * 3;
        c.translate(0, gBob);

        c.beginPath();
        c.ellipse(0, 26, 26, 9, 0, 0, Math.PI * 2);
        c.fillStyle = 'rgba(0, 0, 0, 0.35)';
        c.fill();

        // Pernas flexionadas
        c.fillStyle = '#0f172a';
        c.fillRect(-15, 6, 11, 12);
        c.fillRect(4, 6, 11, 12);
        c.fillStyle = '#22c55e';
        c.fillRect(-15, 17, 11, 11);
        c.fillRect(4, 17, 11, 11);
        c.fillStyle = '#0f172a';
        c.fillRect(-17, 26, 13, 7);
        c.fillRect(4, 26, 13, 7);

        // Tronco neon
        c.fillStyle = '#eab308';
        c.beginPath();
        c.roundRect(-17, -18, 34, 26, 6);
        c.fill();

        c.fillStyle = '#0f172a';
        c.font = 'bold 13px sans-serif';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText('1', 0, -4);

        // Cabeça
        c.fillStyle = skin;
        c.beginPath();
        c.arc(0, -25, 12, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = hair;
        c.beginPath();
        c.arc(0, -29, 11.5, Math.PI, Math.PI * 2);
        c.fill();

        // Braços abertos com Luvas Grandes
        c.fillStyle = '#eab308';
        c.fillRect(-24, -14, 8, 12);
        c.fillStyle = '#22c55e';
        c.beginPath();
        c.roundRect(-30, -8, 13, 14, 4);
        c.fill();
        c.strokeStyle = '#ffffff';
        c.lineWidth = 1.2;
        c.stroke();

        c.fillStyle = '#eab308';
        c.fillRect(16, -14, 8, 12);
        c.fillStyle = '#22c55e';
        c.beginPath();
        c.roundRect(17, -8, 13, 14, 4);
        c.fill();
        c.strokeStyle = '#ffffff';
        c.lineWidth = 1.2;
        c.stroke();
    }

    c.restore();
}

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

function addDustPuff(x, y, count = 2) {
    for (let i = 0; i < count; i++) {
        particles.push({
            type: 'dust',
            x: x + (Math.random() - 0.5) * 8,
            y: y + 16 + (Math.random() - 0.5) * 4,
            vx: (Math.random() - 0.5) * 25,
            vy: 35 + Math.random() * 25,
            size: Math.random() * 4 + 7,
            growth: 14,
            color: 'rgba(255, 255, 255, 0.75)',
            life: 0.45,
            decay: 1.8
        });
    }
}

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

                if (p.type === 'text') {
            p.y += p.vy * dt;
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color || '#ffffff';
            ctx.font = 'bold 15px var(--head), sans-serif';
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 4;
            ctx.fillText(p.text, p.x, p.y);
            ctx.restore();
        } else if (p.type === 'dust') {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.size += p.growth * dt;
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.life * 0.7);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        } else if (p.type === 'confetti') {
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
// RENDERIZAÇÃO REALISTA DO CAMPO (ESTILO TOUCHDOWN HERO + FUTEBOL)
// =========================================================
function drawPitch(dt = 0.016) {
    const stadium = getCurrentStadium();
    const margin = 28; // Linha lateral a 28px das bordas

    // Margens ampliadas para suportar o zoom-out (campo aberto) sem bordas pretas
    const extLeft = -width * 0.5;
    const extRight = width * 1.5;
    const extTop = -height * 0.5;
    const extBottom = height * 1.5;
    const fullW = extRight - extLeft;
    const fullH = extBottom - extTop;

    // 1. FUNDO DO GRAMADO / PISO TEMÁTICO
    ctx.fillStyle = stadium.grassDark;
    ctx.fillRect(extLeft, extTop, fullW, fullH);

    // 2. FAIXAS VERTICAIS DE CORTE DE GRAMA
    const stripeCount = 6;
    const stripeW = (width - margin * 2) / stripeCount;
    for (let i = 0; i < stripeCount; i++) {
        if (i % 2 === 0) {
            ctx.fillStyle = stadium.grassLight;
            ctx.fillRect(margin + i * stripeW, extTop, stripeW, fullH);
        }
    }

    // 3. FAIXAS HORIZONTAIS DE CORTE COM PARALLAX (SEM CÍRCULOS REPETITIVOS)
    const mowingSpacing = 140;
    const mowOffset = fieldY % mowingSpacing;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
    for (let y = extTop + mowOffset; y < extBottom; y += mowingSpacing) {
        ctx.fillRect(margin, y, width - margin * 2, mowingSpacing * 0.45);
    }

    // 4. TEXTURA DETALHADA DO PISO (TERRA BATIDA, NEVE OU CHUVA)
    if (stadium.type === 'dirt') {
        // Manchas de terra batida e grama gasta
        ctx.fillStyle = 'rgba(122, 62, 27, 0.45)';
        for (let i = 0; i < 18; i++) {
            const rx = margin + (Math.sin(i * 123) * 0.5 + 0.5) * (width - margin * 2);
            const ry = (extTop + (i * 95 + fieldY * 0.5)) % height;
            ctx.beginPath();
            ctx.ellipse(rx, ry, 28, 12, 0.2, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (stadium.type === 'snow') {
        // Cristais de gelo e neve acumulada
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        for (let i = 0; i < 20; i++) {
            const rx = margin + (Math.sin(i * 97) * 0.5 + 0.5) * (width - margin * 2);
            const ry = (extTop + (i * 85 + fieldY * 0.4)) % height;
            ctx.beginPath();
            ctx.arc(rx, ry, 3.5, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (stadium.type === 'rain') {
        // Poças d'água refletivas no gramado molhado
        ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
        for (let i = 0; i < 14; i++) {
            const rx = margin + (Math.sin(i * 77) * 0.5 + 0.5) * (width - margin * 2);
            const ry = (extTop + (i * 110 + fieldY * 0.6)) % height;
            ctx.beginPath();
            ctx.ellipse(rx, ry, 22, 9, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 5. LATERAIS COM BANCO DE RESERVAS E TORCIDA (IGUAL AO TOUCHDOWN HERO)
    drawSidelines(margin, extTop, fullH, stadium);

    // 6. LINHAS DE MARCAÇÃO DO CAMPO (BRANCAS OU LARANJAS NA NEVE)
    ctx.strokeStyle = stadium.line;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(margin, extTop);
    ctx.lineTo(margin, extBottom);
    ctx.moveTo(width - margin, extTop);
    ctx.lineTo(width - margin, extBottom);
    ctx.stroke();

    // 7. ESCUDO RETRÔ DE FUTEBOL PINTADO NO GRAMADO A CADA 500m
    const crestInterval = 500;
    const currentHalf = Math.floor(stageDist / crestInterval);
    const nextCrestDist = (currentHalf + 1) * crestInterval;
    if (nextCrestDist < STAGE_GOAL_METERS) {
        const crestAhead = nextCrestDist - stageDist;
        const crestY = player.y - (crestAhead / (scrollSpeed * 0.22)) * scrollSpeed;
        if (crestY > -120 && crestY < height + 120) {
            drawCenterPitchCrest(width / 2, crestY, nextCrestDist);
        }
    }

    // 8. FAIXA DE CELEBRAÇÃO / END ZONE PINTADA NO GRAMADO AOS 1000m
    if (stageDist >= 880) {
        const distAhead = STAGE_GOAL_METERS - stageDist;
        const lineY = (player.y - 70) - (distAhead / 120) * (height * 0.65);
        if (lineY > -140 && lineY < height + 80) {
            drawEndZoneCelebration(lineY, stage, stadium);
        }
    }

    // 9. EFEITOS CLIMÁTICOS
    drawWeather(stadium, dt);
}

// Laterais detalhadas com banco de reservas e torcedores
function drawSidelines(margin, topY, totalH, stadium) {
    ctx.save();
    // Pista lateral
    ctx.fillStyle = stadium.sidelineTrack;
    ctx.fillRect(-width * 0.5, topY, width * 0.5 + margin, totalH);
    ctx.fillRect(width - margin, topY, width * 0.5 + margin, totalH);

    // Banco de reservas e técnicos na lateral esquerda
    const t = performance.now() * 0.003;
    const benchSpacing = 280;
    const bOffset = (fieldY * 0.8) % benchSpacing;

    for (let y = topY + bOffset; y < topY + totalH; y += benchSpacing) {
        // Banco de reservas azul
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(4, y, 18, 54);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(4, y, 18, 54);

        // Jogadores reservas sentados (camisas coloridas)
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(7, y + 6, 12, 10);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(7, y + 22, 12, 10);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(7, y + 38, 12, 10);

        // Técnico em pé na área técnica gesticulando
        const coachBob = Math.sin(t + y * 0.01) * 3;
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(margin - 8, y + 27 + coachBob, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(margin - 11, y + 32 + coachBob, 6, 10);

        // Fotógrafo com colete e câmera na lateral direita
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(width - margin + 6, y + 16, 14, 18);
        ctx.fillStyle = '#334155';
        ctx.fillRect(width - margin + 2, y + 22, 6, 6);
    }
    ctx.restore();
}

// Escudo Clássico de Futebol Pintado no Gramado
function drawCenterPitchCrest(cx, cy, dist) {
    ctx.save();
    ctx.translate(cx, cy);

    // Círculo Central Suave
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, 56, 0, Math.PI * 2);
    ctx.stroke();

    // Emblema Central
    ctx.fillStyle = 'rgba(250, 204, 21, 0.22)';
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, Math.PI * 2);
    ctx.fill();

    // Estrela e Letreiro da Metragem
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = 'bold 16px var(--head), sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`★ ${dist}m ★`, 0, 0);

    ctx.restore();
}

// Faixa de Celebração / Chegada pintada na grama aos 1000m
function drawEndZoneCelebration(lineY, currentStage, stadium) {
    ctx.save();
    const margin = 28;
    const zoneW = width - margin * 2;

    // Faixa colorida no gramado
    ctx.fillStyle = stadium.id === 'final' ? 'rgba(250, 204, 21, 0.85)' : 'rgba(22, 163, 74, 0.85)';
    ctx.fillRect(margin, lineY - 32, zoneW, 54);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(margin, lineY - 32, zoneW, 54);

    // Padrão xadrez esportivo nas bordas da faixa
    const sqSize = 14;
    const cols = Math.floor(zoneW / sqSize);
    for (let c = 0; c < cols; c++) {
        ctx.fillStyle = c % 2 === 0 ? 'rgba(255, 255, 255, 0.9)' : 'rgba(15, 23, 42, 0.8)';
        ctx.fillRect(margin + c * sqSize, lineY + 14, sqSize, 8);
    }

    // Texto da Fase pintado na grama
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px var(--head), sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 6;
    ctx.fillText(`⚽ GOL! FASE ${currentStage + 1} ⚽`, width / 2, lineY - 8);

    ctx.restore();
}

function drawWeather(stadium, dt) {
    if (stadium.weather === 'rain') {
        // Trovão e relâmpago realista
        lightningTimer -= dt;
        if (lightningTimer <= 0) {
            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.48)';
            ctx.fillRect(-width * 0.5, -height * 0.5, width * 2, height * 2);
            ctx.restore();
            audio.playThunder();
            screenShake = 14;
            lightningTimer = Math.random() * 8 + 6;
        }

        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 1.6;
        for (let drop of rainDrops) {
            drop.y += drop.spd * dt;
            drop.x += 60 * dt;
            if (drop.y > height + 40) {
                drop.y = -30;
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
    } else if (stadium.weather === 'snow') {
        // Flocos de neve caindo suavemente
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        const t = performance.now() * 0.002;
        for (let i = 0; i < 35; i++) {
            const sx = ((i * 47 + Math.sin(t + i) * 30) % width + width) % width;
            const sy = ((i * 83 + performance.now() * 0.12) % height + height) % height;
            ctx.beginPath();
            ctx.arc(sx, sy, (i % 3) + 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    } else if (stadium.weather === 'dust') {
        // Poeira do Terrão da Várzea
        ctx.save();
        const t = performance.now() * 0.0015;
        ctx.fillStyle = `rgba(180, 107, 59, ${0.08 + Math.sin(t) * 0.03})`;
        ctx.fillRect(-width * 0.5, -height * 0.5, width * 2, height * 2);
        ctx.restore();
    } else if (stadium.weather === 'final') {
        // Grande Final Dourada
        ctx.save();
        const t = performance.now() * 0.002;
        const grad = ctx.createRadialGradient(width / 2, height * 0.35, 20, width / 2, height * 0.35, width * 0.8);
        grad.addColorStop(0, `rgba(254, 240, 138, ${0.12 + Math.sin(t) * 0.04})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(-width * 0.5, -height * 0.5, width * 2, height * 2);
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
// ZAGUEIROS ESTILO TOUCHDOWN HERO (PERSEGUIÇÃO E BOTES AGRESSIVOS)
// =========================================================
let playerPuffTimer = 0;

function spawnDefendersIfNeeded() {
    if (gameState !== STATE.RUNNING) return;

    if (stageDist >= nextSpawnDist) {
        const rivalTeam = profile.teamId === 'flamengo' ? TEAMS.find(t => t.id === 'corinthians') : TEAMS.find(t => t.id === 'flamengo');
        const laneW = (width - pitchMargin * 2) / 3;

        // Ondas táticas calibradas por fase
        const waveType = Math.random();

        if (waveType < 0.45 || defenders.length === 0) {
            // TIPO 1: BLITZ HUNTER (Caçador implacável que rastreia a posição X do jogador)
            const lane = Math.floor(Math.random() * 3);
            const posX = pitchMargin + (lane + 0.5) * laneW;
            defenders.push({
                x: posX,
                y: -75,
                radius: 20,
                type: 'HUNTER',
                state: 'NORMAL',
                stateTimer: 0,
                baseVy: scrollSpeed * 0.45 + (stage * 12),
                trackingSpd: 85 + Math.min(stage, 6) * 16,
                tackleVx: 0,
                tackleVy: 0,
                runCycle: 0,
                team: rivalTeam,
                number: [3, 4, 5, 2][Math.floor(Math.random() * 4)],
                dodged: false
            });
        } else if (waveType < 0.78) {
            // TIPO 2: PINÇA DAS PONTAS (Dois zagueiros fechando as pontas em direção ao centro)
            // A trilha de moedas no meio guia o caminho seguro!
            const d1X = pitchMargin + 25;
            const d2X = width - pitchMargin - 25;
            defenders.push({
                x: d1X,
                y: -75,
                radius: 20,
                type: 'PINCER',
                state: 'NORMAL',
                stateTimer: 0,
                baseVy: scrollSpeed * 0.40 + (stage * 10),
                pincerDir: 1, // fecha para a direita
                runCycle: 0,
                team: rivalTeam,
                number: 6,
                dodged: false
            });
            defenders.push({
                x: d2X,
                y: -95,
                radius: 20,
                type: 'PINCER',
                state: 'NORMAL',
                stateTimer: 0,
                baseVy: scrollSpeed * 0.40 + (stage * 10),
                pincerDir: -1, // fecha para a esquerda
                runCycle: 0,
                team: rivalTeam,
                number: 2,
                dodged: false
            });
        } else {
            // TIPO 3: CARRINHO DESLIZANTE (SLIDER)
            const lane = Math.floor(Math.random() * 3);
            const posX = pitchMargin + (lane + 0.5) * laneW;
            defenders.push({
                x: posX,
                y: -75,
                radius: 20,
                type: 'SLIDER',
                state: 'NORMAL',
                stateTimer: 0,
                baseVy: scrollSpeed * 0.35 + (stage * 10),
                tackleVx: 0,
                runCycle: 0,
                team: rivalTeam,
                number: 4,
                dodged: false
            });
        }

        // Espaçamento calculado
        const spacing = Math.max(85, 130 - Math.min(stage, 5) * 8);
        nextSpawnDist = stageDist + spacing;
        spawnPickups(stageDist);
    }
}

function updateDefenders(dt) {
    const stadium = getCurrentStadium();

    for (let i = defenders.length - 1; i >= 0; i--) {
        const d = defenders[i];
        d.runCycle += 10 * dt * timeScale;
        const distToPlayer = Math.hypot(player.x - d.x, player.y - d.y);

        if (d.type === 'HUNTER') {
            if (d.state === 'NORMAL') {
                // Desce no campo acompanhando o ritmo do Touchdown Hero
                d.y += (scrollSpeed + d.baseVy) * timeScale * dt;

                // Rastreia o jogador horizontalmente (Caçador ativo!)
                const dx = player.x - d.x;
                d.x += Math.sign(dx) * Math.min(Math.abs(dx), d.trackingSpd * timeScale * dt);

                // Quando chega na distância de ataque (~220px), prepara o bote!
                if (distToPlayer < 225 && d.y < player.y - 15) {
                    d.state = 'ALERT';
                    d.stateTimer = 0.30; // 300ms de reação rápida
                    audio.playAlert();
                }
            } else if (d.state === 'ALERT') {
                d.y += scrollSpeed * timeScale * dt;
                d.stateTimer -= dt * timeScale;
                if (d.stateTimer <= 0) {
                    d.state = 'TACKLING';
                    const angle = Math.atan2(player.y - d.y, player.x - d.x);
                    const spd = 270 + Math.min(stage, 6) * 20;
                    d.tackleVx = Math.cos(angle) * spd;
                    d.tackleVy = Math.sin(angle) * spd + scrollSpeed * 0.3;
                    d.stateTimer = 0.70;
                    addDustPuff(d.x, d.y + 12, 3);
                }
            } else if (d.state === 'TACKLING') {
                d.x += d.tackleVx * timeScale * dt;
                d.y += (d.tackleVy + scrollSpeed * 0.4) * timeScale * dt;
                addDustPuff(d.x, d.y + 12, 1);
                d.stateTimer -= dt * timeScale;
                if (d.stateTimer <= 0) {
                    d.state = 'STUMBLED';
                    d.stateTimer = 1.2;
                    addDustPuff(d.x, d.y, 4);
                }
            } else if (d.state === 'STUMBLED') {
                d.y += scrollSpeed * 0.7 * timeScale * dt;
                d.stateTimer -= dt * timeScale;
            }
        } else if (d.type === 'PINCER') {
            if (d.state === 'NORMAL') {
                d.y += (scrollSpeed + d.baseVy) * timeScale * dt;
                // Fecha o meio progressivamente
                d.x += d.pincerDir * (90 + stage * 12) * timeScale * dt;

                if (distToPlayer < 200 && d.y < player.y) {
                    d.state = 'ALERT';
                    d.stateTimer = 0.28;
                    audio.playAlert();
                }
            } else if (d.state === 'ALERT') {
                d.y += scrollSpeed * timeScale * dt;
                d.stateTimer -= dt * timeScale;
                if (d.stateTimer <= 0) {
                    d.state = 'TACKLING';
                    d.tackleVx = d.pincerDir * (240 + stage * 15);
                    d.tackleVy = 180;
                    d.stateTimer = 0.65;
                }
            } else if (d.state === 'TACKLING') {
                d.x += d.tackleVx * timeScale * dt;
                d.y += (d.tackleVy + scrollSpeed * 0.5) * timeScale * dt;
                addDustPuff(d.x, d.y + 12, 2);
                d.stateTimer -= dt * timeScale;
                if (d.stateTimer <= 0) {
                    d.state = 'STUMBLED';
                    d.stateTimer = 1.0;
                }
            } else if (d.state === 'STUMBLED') {
                d.y += scrollSpeed * 0.7 * timeScale * dt;
            }
        } else if (d.type === 'SLIDER') {
            if (d.state === 'NORMAL') {
                d.y += (scrollSpeed + d.baseVy) * timeScale * dt;
                if (distToPlayer < 210 && Math.abs(player.y - d.y) < 170) {
                    d.state = 'ALERT';
                    d.stateTimer = 0.28;
                    audio.playAlert();
                }
            } else if (d.state === 'ALERT') {
                d.y += scrollSpeed * timeScale * dt;
                d.stateTimer -= dt * timeScale;
                if (d.stateTimer <= 0) {
                    d.state = 'TACKLING';
                    const dirX = player.x > d.x ? 1 : -1;
                    d.tackleVx = dirX * (280 + Math.min(stage, 6) * 18);
                    d.stateTimer = 0.65;
                }
            } else if (d.state === 'TACKLING') {
                d.x += d.tackleVx * timeScale * dt;
                d.y += scrollSpeed * timeScale * dt;
                if (stadium.weather === 'rain') addWaterSplash(d.x, d.y + 14, 3);
                else addDustPuff(d.x, d.y + 12, 3);
                d.stateTimer -= dt * timeScale;
                if (d.stateTimer <= 0) {
                    d.state = 'STUMBLED';
                    d.stateTimer = 1.0;
                }
            } else if (d.state === 'STUMBLED') {
                d.y += scrollSpeed * 0.7 * timeScale * dt;
            }
        }

        // Drible no Limite! (Dodge do Touchdown Hero + Combo Multiplicador)
        if (!d.dodged && (d.y > player.y + 26 || d.state === 'STUMBLED')) {
            d.dodged = true;
            dribbles++;
            comboCount++;
            if (comboCount > maxComboSession) maxComboSession = comboCount;
            comboTimer = 3.6;

            const mult = Math.min(5, comboCount);
            const pts = 150 * mult;
            score += pts;
            if (scoreEl) scoreEl.textContent = score;

            audio.playCombo(comboCount);

            // Texto flutuante de pontuação
            particles.push({
                type: 'text',
                text: comboCount > 1 ? `x${comboCount} +${pts}` : `+${pts}`,
                x: d.x,
                y: d.y - 25,
                vy: -60,
                life: 0.9,
                color: comboCount >= 3 ? '#facc15' : '#ffffff'
            });

            if (comboPillEl) {
                comboPillEl.classList.remove('hidden');
                if (comboCountEl) comboCountEl.textContent = 'x' + comboCount;
            }

            if (comboCount >= 4) {
                showToast(`💥 EM CHAMAS x${comboCount}!`, `+${pts} PONTOS!`);
            } else if (comboCount === 3) {
                showToast('⚡ ESPETACULAR x3!', `+${pts} PONTOS!`);
            } else if (comboCount === 2) {
                showToast('🔥 COMBO x2!', `+${pts} PONTOS!`);
            } else {
                showToast('⚽ DRIBLE NO LIMITE!', '+150 PTS');
            }

            updateMissionProgress();
        }

        // Colisão com o Jogador
        if (gameState === STATE.RUNNING && d.state !== 'STUMBLED') {
            if (distToPlayer < player.radius + d.radius - 4) {
                if (superSpeedTimer > 0) {
                    d.state = 'STUMBLED';
                    d.vx = -d.vx;
                    addDustPuff(d.x, d.y, 6);
                    audio.playWhoosh();
                    showToast('💥 ATROPELOU!', '+200 PTS');
                    score += 200;
                } else if (invulnerableTimer <= 0) {
                    triggerGameOver('O ZAGUEIRO DESARMOU VOCÊ!');
                    return;
                }
            }
        }

        // Indicadores táticos em Slow-Mo (Estilo Touchdown Hero aos 00:34)
        if (isSlowMo) {
            ctx.save();
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.75)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 4]);
            ctx.beginPath();
            ctx.arc(d.x, d.y, 38, 0, Math.PI * 2);
            ctx.stroke();

            // Marcador tático X vermelho
            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 16px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('✕', d.x, d.y - 40);
            ctx.restore();
        }

        // Renderiza Zagueiro
        drawSoccerPlayer(ctx, d.x, d.y, {
            team: d.team,
            skin: SKINS[1],
            hair: HAIRS[0],
            number: d.number,
            runCycle: d.runCycle,
            isSliding: d.state === 'TACKLING' && (d.type === 'SLIDER' || d.type === 'PINCER')
        });

        // Balão de Alerta '!'
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

        if (d.y > height + 90) defenders.splice(i, 1);
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
        playerPuffTimer += dt;
        if (playerPuffTimer >= 0.09) {
            playerPuffTimer = 0;
            addDustPuff(player.x, player.y + 14, 1);
        }
        player.ballRot += (scrollSpeed * 0.035) * dt * timeScale;

        // Giro 360°
        if (isSpinning) {
            spinAngle += 22 * dt;
            if (spinAngle >= Math.PI * 2) {
                isSpinning = false;
                spinAngle = 0;
            }
        }

        // Rastro dourado e rastro de fogo em combos altos
        if (superSpeedTimer > 0 || comboCount >= 3) {
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
// DISPUTA DE PÊNALTI FLICK / SWIPE (OPÇÃO A)
// =========================================================
let penFlickStart = null;
let penFlickTrail = [];
let isPenFlicking = false;
let netBulgeX = 0;
let netBulgeTime = 0;

function executePenaltyKick() {
    if (gameState !== STATE.PENALTY_AIM) return;
    const targetX = width / 2 + (Math.random() < 0.5 ? -1 : 1) * (goalPost.width * 0.35);
    executeSwipeKick(targetX, 720, 0);
}

function executeSwipeKick(targetX, speed, curve) {
    if (gameState !== STATE.PENALTY_AIM) return;
    gameState = STATE.PENALTY_RUNUP;
    penRunUp = 0;
    if (penaltyUiEl) penaltyUiEl.classList.add('hidden');

    // Salva parâmetros do chute
    penBall.targetX = Math.max(goalPost.x + 15, Math.min(goalPost.x + goalPost.width - 15, targetX));
    penBall.flickSpeed = speed;
    penBall.curve = curve;
}

function startPenaltySetup() {
    gameState = STATE.PENALTY_AIM;
    isSlowMo = false;
    timeScale = 1.0;
    penRunUp = 0;
    defenders = [];
    pickups = [];
    penFlickStart = null;
    penFlickTrail = [];
    isPenFlicking = false;
    netBulgeTime = 0;

    hudEl.classList.add('hidden');
    controlsEl.classList.add('hidden');
    appEl.classList.add('pen');

    // Trave Próxima e Imponente
    goalPost.width = Math.min(width * 0.90, 390);
    goalPost.x = (width - goalPost.width) / 2;
    goalPost.y = 85;
    goalPost.height = 145;
    goalPost.postThickness = 8;

    // Jogador PARADO na cal
    player.x = width / 2;
    player.y = height - 125;
    player.targetX = player.x;
    player.targetY = player.y;

    // Bola na marca da cal
    penBall.x = width / 2;
    penBall.y = height - 180;
    penBall.z = 0;       // altitude 3D
    penBall.vz = 0;
    penBall.scale = 1.25;
    penBall.vx = 0;
    penBall.vy = 0;
    penBall.curve = 0;
    penBall.isGoal = false;

    // Goleiro em Ginga no centro da trave
    goalie.x = width / 2;
    goalie.y = goalPost.y + goalPost.height - 18;
    goalie.state = 'IDLE'; // 'IDLE', 'DIVING', 'SAVED', 'CONCEDED'
    goalie.diveDir = 0;
    goalie.diveProgress = 0;
    goalie.bob = 0;

    audio.playWhistle(true);
    if (penaltyUiEl) penaltyUiEl.classList.remove('hidden');
}

function startPenaltyShot() {
    const dx = penBall.targetX - penBall.x;
    const dy = (goalPost.y + goalPost.height - 15) - penBall.y;
    const dist = Math.hypot(dx, dy) || 1;
    const speed = penBall.flickSpeed || 720;

    penBall.vx = (dx / dist) * speed;
    penBall.vy = (dy / dist) * speed;
    penBall.vz = 280; // Elevação 3D no ar

    // Goleiro reage ao chute com salto acrobático real!
    const targetSide = penBall.targetX > width / 2 ? 1 : -1;

    // Chance do goleiro acertar o lado baseada na fase
    // Fase 1: apenas 28% de chance de adivinhar o canto certo!
    const guessChance = Math.min(0.55, 0.28 + (stage - 1) * 0.07);
    const gkGuessedRight = Math.random() < guessChance;

    goalie.state = 'DIVING';
    goalie.diveDir = gkGuessedRight ? targetSide : -targetSide;
    goalie.diveProgress = 0;
    goalie.targetJumpX = width / 2 + goalie.diveDir * (goalPost.width * 0.38);

    audio.playKick();
    addDustPuff(player.x, player.y + 12, 4);
}

function updatePenalty(dt) {
    if (gameState === STATE.PENALTY_AIM) {
        // Ginga de goleiro na linha
        goalie.bob += 5 * dt;
        goalie.x = width / 2 + Math.sin(goalie.bob) * 16;
    } else if (gameState === STATE.PENALTY_RUNUP) {
        penRunUp += 4.5 * dt;
        player.runCycle += 22 * dt;
        player.x += (penBall.x - player.x) * 0.28;
        player.y += ((penBall.y + 16) - player.y) * 0.28;

        if (penRunUp >= 1.0) {
            gameState = STATE.PENALTY_KICK;
            startPenaltyShot();
        }
    } else if (gameState === STATE.PENALTY_KICK) {
        // Bola em vôo 3D
        penBall.x += penBall.vx * dt;
        penBall.y += penBall.vy * dt;
        // Efeito curva
        penBall.x += (penBall.curve * 0.8) * dt;

        // Física de elevação vertical
        penBall.z = Math.max(0, penBall.z + penBall.vz * dt);
        penBall.vz -= 520 * dt;

        // Salto do goleiro
        goalie.diveProgress += 2.6 * dt;
        goalie.x += (goalie.targetJumpX - goalie.x) * Math.min(1, 8 * dt);

        checkPenaltyCollision();
    }

    if (netBulgeTime > 0) {
        netBulgeTime -= dt;
    }
}

function checkPenaltyCollision() {
    const goalL = goalPost.x;
    const goalR = goalL + goalPost.width;
    const goalLineY = goalPost.y + goalPost.height - 12;

    // Checa colisão quando a bola atinge a linha do gol
    if (penBall.y <= goalLineY) {
        const ballScreenX = penBall.x;

        // 1. Defesa do Goleiro
        const gkReachX = goalie.x + (goalie.diveDir * 28);
        const distToGloves = Math.abs(ballScreenX - gkReachX);

        if (goalie.state === 'DIVING' && distToGloves < 34) {
            goalie.state = 'SAVED';
            penBall.vx = -penBall.vx * 0.5;
            penBall.vy = 260; // rebate pra fora
            penBall.vz = 180;
            screenShake = 18;
            audio.playAlert();
            audio.playWhistle(true);
            triggerGameOver('O GOLEIRO ESPALMOU NO ÂNGULO!');
            return;
        }

        // 2. Trave e Travessão
        const isNearLeftPost = Math.abs(ballScreenX - goalL) < 14;
        const isNearRightPost = Math.abs(ballScreenX - goalR) < 14;
        const isNearCrossbar = penBall.z > 58 && Math.abs(penBall.y - goalPost.y) < 18;

        if (isNearLeftPost || isNearRightPost || isNearCrossbar) {
            screenShake = 24;
            audio.playPostHit();
            audio.playWhistle(true);
            penBall.vy = 200;
            triggerGameOver('💥 CHUTOU NA TRAVE! QUE PENA!');
            return;
        }

        // 3. Gol Válido!
        if (ballScreenX >= goalL + 14 && ballScreenX <= goalR - 14) {
            goalie.state = 'CONCEDED';
            netBulgeX = ballScreenX;
            netBulgeTime = 1.2;
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
    screenShake = 20;

    showBanner('goal', 'GOLAÇO NA GAVETA!', 'GOOOOOOL!', '+500 PONTOS!');

    setTimeout(() => {
        advanceToNextStage();
    }, 2400);
}


function advanceToNextStage() {
    stage++;
    stageDist = 0; // Reinicia a contagem de 0m para a nova fase

    const bonusScore = 1000 + (stage - 1) * 250;
    const bonusCoins = 50;
    score += bonusScore;
    coinsSession += bonusCoins;
    profile.totalCoins += bonusCoins;
    profile.save();

    audio.playCheckpoint();
    addConfetti(100);
    screenShake = 16;

    // Aumenta a velocidade e intensidade da corrida!
    scrollSpeed = Math.min(320, 220 + (stage - 1) * 16);
    nextSpawnDist = 35;

    const stadium = getCurrentStadium();
    if (stageNumEl) stageNumEl.textContent = `FASE ${stage}`;
    if (stadiumNameEl) stadiumNameEl.textContent = stadium.name;
    if (progTxtEl) progTxtEl.textContent = `0m / ${STAGE_GOAL_METERS}m`;
    if (progFillEl) progFillEl.style.width = '0%';
    if (progBallEl) progBallEl.style.left = '0%';
    if (coinsEl) coinsEl.textContent = coinsSession;
    if (scoreEl) scoreEl.textContent = score;

    showBanner('stage', '🏁 CHECKPOINT ATINGIDO!', `FASE ${stage}: ${stadium.name}`, `+${bonusScore} PTS & +${bonusCoins} MOEDAS DE BÔNUS!`);

    updateMissionProgress();
}

function drawPenaltyScene() {
    if (gameState === STATE.RUNNING || gameState === STATE.MENU) return;

    const goalL = goalPost.x;
    const goalR = goalL + goalPost.width;

    ctx.save();

    // 1. Torcida vibrando com bandeiras no fundo
    drawCrowdBanners(goalL, goalR, goalPost.y - 45);

    // 2. Grande Área em Close-Up
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

    // 3. Rede 3D com Efeito de Estufar no Gol
    ctx.fillStyle = 'rgba(255, 255, 255, 0.20)';
    ctx.fillRect(goalL, goalPost.y, goalPost.width, goalPost.height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.40)';
    ctx.lineWidth = 1.2;
    for (let x = goalL; x <= goalR; x += 16) {
        ctx.beginPath();
        let bulge = 0;
        if (netBulgeTime > 0 && Math.abs(x - netBulgeX) < 45) {
            bulge = (1 - Math.abs(x - netBulgeX) / 45) * 18 * Math.min(1, netBulgeTime * 2);
        }
        ctx.moveTo(x, goalPost.y - bulge);
        ctx.lineTo(x, goalPost.y + goalPost.height);
        ctx.stroke();
    }
    for (let y = goalPost.y; y <= goalPost.y + goalPost.height; y += 14) {
        ctx.beginPath();
        ctx.moveTo(goalL, y);
        ctx.lineTo(goalR, y);
        ctx.stroke();
    }

    // Postes e Travessão
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
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = 'rgba(250, 204, 21, 0.85)';
        ctx.textAlign = 'left';
        ctx.fillText('GAVETA ESQ', goalL + 12, goalPost.y + 22);
        ctx.textAlign = 'right';
        ctx.fillText('GAVETA DIR', goalR - 12, goalPost.y + 22);
        ctx.textAlign = 'left';
        ctx.fillText('CANTO ESQ', goalL + 12, goalPost.y + goalPost.height - 15);
        ctx.textAlign = 'right';
        ctx.fillText('CANTO DIR', goalR - 12, goalPost.y + goalPost.height - 15);
    }

    ctx.restore();

    // 4. Goleiro Dramático com Salto Real
    drawGoalkeeper(ctx, goalie.x, goalie.y, {
        state: goalie.state,
        diveDir: goalie.diveDir,
        diveProgress: goalie.diveProgress,
        bob: goalie.bob
    });

    // 5. Bola com Elevação 3D e Sombra Projetada
    const shadowAlpha = Math.max(0.08, 0.35 * (1 - (penBall.z || 0) / 90));
    ctx.beginPath();
    ctx.ellipse(penBall.x, penBall.y + 8, 14 * penBall.scale, 6 * penBall.scale, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
    ctx.fill();

    const ballVisualY = penBall.y - (penBall.z || 0);
    const ballVisualScale = penBall.scale * (1 + (penBall.z || 0) / 140);
    drawBallSprite(ctx, penBall.x, ballVisualY, 15 * ballVisualScale);

    // 6. Jogador Vicente
    drawSoccerPlayer(ctx, player.x, player.y, {
        team: profile.getTeam(),
        skin: profile.skin,
        hair: profile.hair,
        number: profile.number,
        runCycle: gameState === STATE.PENALTY_RUNUP ? player.runCycle : 0
    });

    // 7. Trajetória / Laser do Gesto de Chute (Flick Guidance)
    if (gameState === STATE.PENALTY_AIM) {
        drawFlickGuidance();
    }
}

function drawCrowdBanners(left, right, y) {
    ctx.save();
    const t = performance.now() * 0.003;
    const bannerW = (right - left) / 4;
    for (let i = 0; i < 4; i++) {
        const bx = left + i * bannerW;
        const wave = Math.sin(t + i) * 4;
        ctx.fillStyle = i % 2 === 0 ? '#0f172a' : '#dc2626';
        ctx.fillRect(bx + 4, y + wave, bannerW - 8, 20);
        // Cruz de Malta / Estrela no banner
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('CRVG', bx + bannerW / 2, y + wave + 14);
    }
    ctx.restore();
}

function drawFlickGuidance() {
    ctx.save();
    if (penFlickTrail.length > 1) {
        // Laser dinâmico acompanhando o dedo do jogador em tempo real!
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(penFlickTrail[0].x, penFlickTrail[0].y);
        for (let i = 1; i < penFlickTrail.length; i++) {
            ctx.lineTo(penFlickTrail[i].x, penFlickTrail[i].y);
        }
        ctx.stroke();

        // Alvo na ponta
        const tip = penFlickTrail[penFlickTrail.length - 1];
        ctx.beginPath();
        ctx.arc(tip.x, tip.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
    } else {
        // Seta suave convidando o jogador a arrastar
        const t = performance.now() * 0.004;
        const arrowOffset = Math.sin(t * 2) * 10;
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.7)';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(penBall.x, penBall.y - 20);
        ctx.lineTo(penBall.x, penBall.y - 90 + arrowOffset);
        ctx.stroke();

        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(penBall.x, penBall.y - 95 + arrowOffset, 6, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
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
    // Mantido por compatibilidade
}

function updateSlowMoState(dt) {
    const isHolding = isTouching || isMouseDown;

    if (gameState === STATE.RUNNING) {
        if (!isHolding) {
            // SOLTOU O DEDO: Câmera Lenta ativada e o campo abre (zoom-out)!
            if (slowEnergy > 5) {
                isSlowMo = true;
                timeScale = 0.28; // Bullet-time suave
                camera.targetZoom = 0.70; // O campo abre! Visão ampla!
                camera.targetOffsetY = height * 0.16; // Mostra muito mais à frente
                slowEnergy -= getSlowDrainRate() * dt;
                if (appEl) appEl.classList.add('slowmo');

                if (slowEnergy <= 0) {
                    slowEnergy = 0;
                    isSlowMo = false;
                    timeScale = 1.0;
                    camera.targetZoom = 1.0;
                    camera.targetOffsetY = 0;
                    if (appEl) appEl.classList.remove('slowmo');
                }
            } else {
                isSlowMo = false;
                timeScale = 1.0;
                camera.targetZoom = 1.0;
                camera.targetOffsetY = 0;
                if (appEl) appEl.classList.remove('slowmo');
            }
        } else {
            // SEGURANDO O DEDO: Corre normal, câmera foca no jogador e recarrega energia
            isSlowMo = false;
            timeScale = 1.0;
            camera.targetZoom = 1.0;
            camera.targetOffsetY = 0;
            if (appEl) appEl.classList.remove('slowmo');

            if (slowEnergy < 100) {
                slowEnergy = Math.min(100, slowEnergy + getSlowRecoveryRate() * dt);
            }
        }
    } else {
        isSlowMo = false;
        timeScale = 1.0;
        camera.targetZoom = 1.0;
        camera.targetOffsetY = 0;
        if (appEl) appEl.classList.remove('slowmo');
    }

    // Interpolação suave da câmera
    camera.zoom += (camera.targetZoom - camera.zoom) * Math.min(1, 8 * dt);
    camera.offsetY += (camera.targetOffsetY - camera.offsetY) * Math.min(1, 8 * dt);

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

        // Transição contínua para o próximo estádio aos 1000m!
        if (stageDist >= STAGE_GOAL_METERS) {
            advanceToNextStage();
        }

        fieldY += scrollSpeed * timeScale * dt;

        spawnDefendersIfNeeded();
        updateDefenders(dt);
        updatePickups(dt);
    }

    updatePlayer(dt);
    updateSlowMoState(dt);
    updateCooldowns(dt);
    updateParticles(dt);

    if (comboTimer > 0) {
        comboTimer -= dt;
        if (comboTimer <= 0) {
            comboCount = 0;
            if (comboPillEl) comboPillEl.classList.add('hidden');
        }
    }

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

    // Câmera dinâmica centralizada no jogador (zoom-out do Slow-Mo)
    if (camera.zoom !== 1.0 || camera.offsetY !== 0) {
        const pivotX = player.x;
        const pivotY = player.y;
        ctx.translate(pivotX, pivotY + camera.offsetY);
        ctx.scale(camera.zoom, camera.zoom);
        ctx.translate(-pivotX, -pivotY);
    }

    ctx.clearRect(-width * 0.5, -height * 0.5, width * 2, height * 2);

    drawPitch(dt);

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
    if (penaltyUiEl) penaltyUiEl.classList.add('hidden');
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
    comboCount = 0;
    comboTimer = 0;
    maxComboSession = 0;
    if (comboPillEl) comboPillEl.classList.add('hidden');
    updateMissionProgress();

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
    if (oComboEl) oComboEl.textContent = `${maxComboSession}x`;
    if (oGoalsEl) oGoalsEl.textContent = goals;
    oDribblesEl.textContent = dribbles;
    oCoinsEl.textContent = coinsSession;
    oBestEl.textContent = profile.highScore;

    hudEl.classList.add('hidden');
    controlsEl.classList.add('hidden');
    if (penaltyUiEl) penaltyUiEl.classList.add('hidden');
    overScreen.classList.remove('hidden');
}

function openMenu() {
    gameState = STATE.MENU;
    menuScreen.classList.remove('hidden');
    overScreen.classList.add('hidden');
    pauseScreen.classList.add('hidden');
    hudEl.classList.add('hidden');
    controlsEl.classList.add('hidden');
    if (penaltyUiEl) penaltyUiEl.classList.add('hidden');
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
    } else if (gameState === STATE.PENALTY_AIM && e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        const px = e.touches[0].clientX - rect.left;
        const py = e.touches[0].clientY - rect.top;
        isPenFlicking = true;
        penFlickStart = { x: px, y: py, t: performance.now() };
        penFlickTrail = [{ x: px, y: py }];
    }
}, { passive: true });

canvas.addEventListener('touchmove', (e) => {
    if (gameState === STATE.RUNNING && isTouching && e.touches.length > 0) {
        const dx = e.touches[0].clientX - touchOriginX;
        const dy = e.touches[0].clientY - touchOriginY;
        player.targetX = playerOriginX + dx;
        player.targetY = playerOriginY + dy;
    } else if (gameState === STATE.PENALTY_AIM && isPenFlicking && e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        const px = e.touches[0].clientX - rect.left;
        const py = e.touches[0].clientY - rect.top;
        penFlickTrail.push({ x: px, y: py });
    }
}, { passive: true });

canvas.addEventListener('touchend', (e) => {
    isTouching = false;
    if (gameState === STATE.PENALTY_AIM && isPenFlicking && penFlickTrail.length > 1) {
        isPenFlicking = false;
        const start = penFlickStart;
        const end = penFlickTrail[penFlickTrail.length - 1];
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        if (dy < -25) {
            const dtSec = Math.max(0.06, (performance.now() - start.t) / 1000);
            const rawSpeed = (Math.hypot(dx, dy) / dtSec) * 1.15;
            const flickSpeed = Math.min(950, Math.max(540, rawSpeed));

            let maxDeviation = 0;
            const strokeDist = Math.hypot(dx, dy) || 1;
            for (let p of penFlickTrail) {
                const dev = ((end.y - start.y) * p.x - (end.x - start.x) * p.y + end.x * start.y - end.y * start.x) / strokeDist;
                if (Math.abs(dev) > Math.abs(maxDeviation)) maxDeviation = dev;
            }
            const curve = Math.max(-180, Math.min(180, maxDeviation * 3.8));
            executeSwipeKick(end.x, flickSpeed, curve);
        }
    }
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
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;
        isPenFlicking = true;
        penFlickStart = { x: px, y: py, t: performance.now() };
        penFlickTrail = [{ x: px, y: py }];
    }
});

window.addEventListener('mousemove', (e) => {
    if (gameState === STATE.RUNNING && isMouseDown) {
        const dx = e.clientX - touchOriginX;
        const dy = e.clientY - touchOriginY;
        player.targetX = playerOriginX + dx;
        player.targetY = playerOriginY + dy;
    } else if (gameState === STATE.PENALTY_AIM && isPenFlicking) {
        const rect = canvas.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;
        penFlickTrail.push({ x: px, y: py });
    }
});

window.addEventListener('mouseup', () => {
    isMouseDown = false;
    if (gameState === STATE.PENALTY_AIM && isPenFlicking && penFlickTrail.length > 1) {
        isPenFlicking = false;
        const start = penFlickStart;
        const end = penFlickTrail[penFlickTrail.length - 1];
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        if (dy < -25) {
            const dtSec = Math.max(0.06, (performance.now() - start.t) / 1000);
            const rawSpeed = (Math.hypot(dx, dy) / dtSec) * 1.15;
            const flickSpeed = Math.min(950, Math.max(540, rawSpeed));

            let maxDeviation = 0;
            const strokeDist = Math.hypot(dx, dy) || 1;
            for (let p of penFlickTrail) {
                const dev = ((end.y - start.y) * p.x - (end.x - start.x) * p.y + end.x * start.y - end.y * start.x) / strokeDist;
                if (Math.abs(dev) > Math.abs(maxDeviation)) maxDeviation = dev;
            }
            const curve = Math.max(-180, Math.min(180, maxDeviation * 3.8));
            executeSwipeKick(end.x, flickSpeed, curve);
        }
    }
});

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
