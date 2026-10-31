/**
 * Craque Hero - 100% Futebol Brasileiro (Soccer)
 * Mobile-First, Controle Livre 2D, Câmera Lenta (Slow-Mo),
 * Zagueiros Naturais com Marcação de Futebol e Pênalti Realista.
 */

// ========================================================
// SISTEMA DE ÁUDIO SINTETIZADO (Web Audio API)
// ========================================================
class SoccerAudio {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.ctx = new AudioCtx();
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
            osc.frequency.setValueAtTime(160, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(32, this.ctx.currentTime + 0.14);
            gain.gain.setValueAtTime(0.65, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.14);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.15);
        } catch (e) {}
    }

    playSlowMoSound(active) {
        if (!this.enabled || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            const startF = active ? 360 : 180;
            const endF = active ? 180 : 360;
            osc.frequency.setValueAtTime(startF, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(endF, this.ctx.currentTime + 0.12);
            gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.13);
        } catch (e) {}
    }

    playSpinWhoosh() {
        if (!this.enabled || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(320, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.18);
            gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.19);
        } catch (e) {}
    }

    playAlertBeep() {
        if (!this.enabled || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(880, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.08);
        } catch (e) {}
    }

    playWhistle(isDouble = false) {
        if (!this.enabled || !this.ctx) return;
        try {
            const playTone = (t, dur) => {
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
            playTone(now, 0.2);
            if (isDouble) playTone(now + 0.25, 0.32);
        } catch (e) {}
    }

    playGoalTriumph() {
        if (!this.enabled || !this.ctx) return;
        try {
            const notes = [392, 523.25, 659.25, 783.99, 1046.5];
            notes.forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.08);
                gain.gain.setValueAtTime(0.25, this.ctx.currentTime + i * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.8 + i * 0.08);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(this.ctx.currentTime + i * 0.08);
                osc.stop(this.ctx.currentTime + 0.9 + i * 0.08);
            });
        } catch (e) {}
    }
}

const sfx = new SoccerAudio();

// ========================================================
// ELEMENTOS DO DOM
// ========================================================
const container = document.getElementById('game-container');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const arcadeHud = document.getElementById('arcade-hud');
const staminaBar = document.getElementById('stamina-bar');
const metersTxt = document.getElementById('meters-txt');
const scoreTxt = document.getElementById('score-txt');
const goalsTxt = document.getElementById('goals-txt');
const soundBtn = document.getElementById('sound-btn');
const comboPopup = document.getElementById('combo-popup');

const actionControls = document.getElementById('action-controls');
const slowmoBtn = document.getElementById('slowmo-btn');
const spinBtn = document.getElementById('spin-btn');
const spinCooldownShade = document.getElementById('spin-cooldown-shade');

const penaltyUi = document.getElementById('penalty-ui');
const penaltyKickBtn = document.getElementById('penalty-kick-btn');
const hintBubble = document.getElementById('hint-bubble');

const gameOverScreen = document.getElementById('game-over-screen');
const overEmoji = document.getElementById('over-emoji');
const overDesc = document.getElementById('over-desc');
const resMeters = document.getElementById('res-meters');
const resScore = document.getElementById('res-score');
const resGoals = document.getElementById('res-goals');
const resDribbles = document.getElementById('res-dribbles');
const resBest = document.getElementById('res-best');
const retryBtn = document.getElementById('retry-btn');

// ========================================================
// MODOS DE JOGO
// ========================================================
const MODE = {
    RUNNER: 'RUNNER',               // Corrida no campo com dribles
    PENALTY_AIM: 'PENALTY_AIM',     // Jogador PARADO mirando na trave
    PENALTY_RUNUP: 'PENALTY_RUNUP', // Corrida de aproximação até a bola
    PENALTY_SHOT: 'PENALTY_SHOT',   // Chute com bola voando em 3D
    CELEBRATION: 'CELEBRATION',     // Comemoração de gol
    GAME_OVER: 'GAME_OVER'
};

let currentMode = MODE.RUNNER;
let animationFrameId = null;

let logicalWidth = 0;
let logicalHeight = 0;
let pitchMargin = 38;

// Métricas de Partida
let meters = 0;
let targetMeters = 1000;
let score = 0;
let goalsCount = 0;
let dribblesCount = 0;
let highScore = parseInt(localStorage.getItem('craque_touchdown_highscore') || '0', 10);

// Câmera Lenta (Slow-Mo) e Stamina
let isSlowMoActive = false;
let slowMoStamina = 100;
const SLOWMO_DRAIN_RATE = 28;
const SLOWMO_RECOVERY_RATE = 18;
let timeScale = 1.0;

// Velocidade do Campo
let baseScrollSpeed = 2.2;
let currentScrollSpeed = 2.2;
let fieldScrollY = 0;
let screenShake = 0;
let lastTimestamp = 0;

// ========================================================
// CRAQUE DO FUTEBOL (JOGADOR)
// ========================================================
const player = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    radius: 17,
    runCycle: 0,
    ballRotation: 0,
    isSpinning: false,
    spinAngle: 0,
    isInvulnerable: false,
    invulnerableTimer: 0,

    // Pênalti
    runUpProgress: 0
};

// Habilidade de Giro 360°
const SPIN_COOLDOWN_MS = 4500;
let lastSpinTime = -9999;

// ========================================================
// ZAGUEIROS (IA DE MARCAÇÃO DE FUTEBOL)
// ========================================================
let defenders = [];
let nextDefenderSpawnMeters = 70;

const DEFENDER_STYLES = {
    JOCKEY: 'JOCKEY',     // Volante/zagueiro cercando e fechando a linha de passe
    CHASER: 'CHASER',     // Zagueiro que persegue com inércia e alerta '!'
    SLIDER: 'SLIDER'      // Zagueiro de carrinho deslizante na grama
};

// ========================================================
// TRAVE DO GOL, GOLEIRO E PÊNALTI REALISTA
// ========================================================
const goalPost = {
    y: 65,            // Posição no topo (totalmente visível!)
    width: 270,
    height: 85,
    postThickness: 8
};

const penaltyAim = {
    x: 0,
    y: 0,
    sweepAngle: 0
};

const goalkeeper = {
    x: 0,
    y: 0,
    vx: 2.3,
    state: 'READY',
    diveDir: 0,
    diveProgress: 0
};

const penaltyBall = {
    x: 0,
    y: 0,
    scale: 1.0,
    vx: 0,
    vy: 0
};

let particles = [];
let crowdSupporters = [];

// ========================================================
// INICIALIZAÇÃO E RESPONSIVIDADE
// ========================================================
function resizeCanvas() {
    const rect = container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    logicalWidth = rect.width;
    logicalHeight = rect.height;

    canvas.width = logicalWidth * dpr;
    canvas.height = logicalHeight * dpr;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    pitchMargin = Math.max(32, Math.round(logicalWidth * 0.1));

    if (currentMode === MODE.RUNNER && !player.x) {
        player.x = logicalWidth / 2;
        player.y = logicalHeight - 130;
        player.targetX = player.x;
        player.targetY = player.y;
    }

    goalPost.width = Math.min(300, logicalWidth * 0.82);

    initCrowd();
}

function initCrowd() {
    crowdSupporters = [];
    const colors = ['#facc15', '#38bdf8', '#22c55e', '#ef4444', '#ffffff', '#fb923c'];
    const rows = 32;
    for (let i = 0; i < rows; i++) {
        crowdSupporters.push({
            side: 'left',
            x: Math.random() * (pitchMargin - 16) + 8,
            baseY: i * 36,
            color: colors[Math.floor(Math.random() * colors.length)],
            offset: Math.random() * Math.PI * 2
        });
        crowdSupporters.push({
            side: 'right',
            x: logicalWidth - pitchMargin + 8 + Math.random() * (pitchMargin - 16),
            baseY: i * 36,
            color: colors[Math.floor(Math.random() * colors.length)],
            offset: Math.random() * Math.PI * 2
        });
    }
}

// ========================================================
// PARTÍCULAS VISUAIS (GRAMA E CONFETES)
// ========================================================
function spawnGrassDust(x, y, count = 3) {
    for (let i = 0; i < count; i++) {
        particles.push({
            type: 'grass',
            x: x + (Math.random() - 0.5) * 8,
            y: y + (Math.random() - 0.5) * 6,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3 + 1,
            size: Math.random() * 3 + 2,
            color: Math.random() < 0.5 ? '#86efac' : '#22c55e',
            life: 1.0,
            decay: 0.05
        });
    }
}

function spawnSpinTrail(x, y) {
    particles.push({
        type: 'ghost',
        x: x,
        y: y,
        size: player.radius * 2,
        life: 0.5,
        decay: 0.08
    });
}

function spawnGoalConfetti(count = 90) {
    const colors = ['#facc15', '#22c55e', '#38bdf8', '#ef4444', '#e879f9', '#ffffff'];
    for (let i = 0; i < count; i++) {
        particles.push({
            type: 'confetti',
            x: logicalWidth / 2 + (Math.random() - 0.5) * 140,
            y: goalPost.y + 40,
            vx: (Math.random() - 0.5) * 11,
            vy: -Math.random() * 10 - 4,
            gravity: 0.22,
            size: Math.random() * 6 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            angle: Math.random() * Math.PI * 2,
            vAngle: (Math.random() - 0.5) * 0.25,
            life: 1.0,
            decay: 0.012
        });
    }
}

function updateAndDrawParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= p.decay;

        if (p.type === 'confetti') {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.angle += p.vAngle;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
            ctx.restore();
        } else if (p.type === 'ghost') {
            ctx.save();
            ctx.globalAlpha = p.life * 0.35;
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        } else {
            p.x += p.vx;
            p.y += p.vy;
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
            ctx.restore();
        }

        if (p.life <= 0) particles.splice(i, 1);
    }
}

// ========================================================
// RENDERIZAÇÃO DO CAMPO 100% FUTEBOL (SEM JARDAS AMERICANAS)
// ========================================================
function drawPitch() {
    // 1. Gramado de Futebol Verde
    ctx.fillStyle = '#1e824c';
    ctx.fillRect(0, 0, logicalWidth, logicalHeight);

    // 2. Faixas de Corte da Grama Verticais (Estilo Europeu)
    const stripeCount = 6;
    const stripeW = (logicalWidth - pitchMargin * 2) / stripeCount;
    for (let i = 0; i < stripeCount; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#1b7845' : '#229954';
        ctx.fillRect(pitchMargin + i * stripeW, 0, stripeW, logicalHeight);
    }

    // 3. Arquibancada e Torcida Lateral
    drawCrowd();

    // 4. Linhas Laterais Brancas (Touchlines)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(pitchMargin, 0);
    ctx.lineTo(pitchMargin, logicalHeight);
    ctx.moveTo(logicalWidth - pitchMargin, 0);
    ctx.lineTo(logicalWidth - pitchMargin, logicalHeight);
    ctx.stroke();

    // 5. Linhas de Futebol em Movimento: Círculo Central, Linhas de Meio-Campo e Áreas
    // (Apenas marcações autênticas de futebol, NADA de jardas de futebol americano!)
    const pitchSpacing = 380;
    const offset = fieldScrollY % pitchSpacing;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = 2.5;

    for (let y = -pitchSpacing + offset; y < logicalHeight + pitchSpacing; y += pitchSpacing) {
        // Linha de Meio-Campo
        ctx.beginPath();
        ctx.moveTo(pitchMargin, y);
        ctx.lineTo(logicalWidth - pitchMargin, y);
        ctx.stroke();

        // Círculo Central Oficial
        ctx.beginPath();
        ctx.arc(logicalWidth / 2, y, 48, 0, Math.PI * 2);
        ctx.stroke();

        // Ponto da Marca Central
        ctx.beginPath();
        ctx.arc(logicalWidth / 2, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fill();

        // Arcos de Escanteio nas laterais
        ctx.beginPath();
        ctx.arc(pitchMargin, y, 12, 0, Math.PI * 0.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(logicalWidth - pitchMargin, y, 12, Math.PI * 0.5, Math.PI);
        ctx.stroke();
    }
}

function drawCrowd() {
    ctx.fillStyle = '#0f1712';
    ctx.fillRect(0, 0, pitchMargin, logicalHeight);
    ctx.fillRect(logicalWidth - pitchMargin, 0, pitchMargin, logicalHeight);

    const t = performance.now() * 0.006;
    for (let fan of crowdSupporters) {
        const bob = Math.sin(t + fan.offset) * 4;
        const drawY = (fan.baseY + fieldScrollY * 0.8) % logicalHeight;

        ctx.fillStyle = fan.color;
        ctx.beginPath();
        ctx.arc(fan.x, drawY + bob, 4.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ========================================================
// O CRAQUE DO DRIBLE (JOGADOR COM ANIMAÇÃO DE FUTEBOL)
// ========================================================
function updatePlayer(delta) {
    if (currentMode === MODE.RUNNER) {
        const lerp = 0.28;
        player.x += (player.targetX - player.x) * lerp;
        player.y += (player.targetY - player.y) * lerp;

        const minX = pitchMargin + player.radius + 4;
        const maxX = logicalWidth - pitchMargin - player.radius - 4;
        player.x = Math.max(minX, Math.min(maxX, player.x));

        const minY = logicalHeight * 0.16;
        const maxY = logicalHeight - player.radius - 16;
        player.y = Math.max(minY, Math.min(maxY, player.y));

        player.runCycle += 0.24 * timeScale;
        player.ballRotation += (currentScrollSpeed * 0.06) * timeScale;

        if (player.isSpinning) {
            player.spinAngle += 0.45;
            spawnSpinTrail(player.x, player.y);
            if (performance.now() > player.invulnerableTimer) {
                player.isSpinning = false;
                player.isInvulnerable = false;
            }
        }
    } else if (currentMode === MODE.PENALTY_RUNUP) {
        // Corrida de aproximação até a marca da cal
        player.runUpProgress += 0.09;
        player.runCycle += 0.35;
        player.x += (penaltyBall.x - player.x) * 0.16;
        player.y += ((penaltyBall.y + 14) - player.y) * 0.16;

        if (player.runUpProgress >= 1.0) {
            currentMode = MODE.PENALTY_SHOT;
            sfx.playKick();
            startPenaltyShot();
        }
    }
}

function drawPlayer() {
    ctx.save();
    ctx.translate(player.x, player.y);

    if (player.isSpinning) {
        ctx.rotate(player.spinAngle);
    }

    // Sombra do jogador
    ctx.beginPath();
    ctx.ellipse(0, player.radius * 0.85, player.radius * 1.1, player.radius * 0.45, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fill();

    // Pernas animadas com calção e meiões
    const legSwing = (currentMode === MODE.PENALTY_AIM) ? 0 : Math.sin(player.runCycle) * 8;

    // Calção azul
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-10, 4 + legSwing, 6, 8);
    ctx.fillRect(4, 4 - legSwing, 6, 8);

    // Meiões brancos de futebol
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-10, 11 + legSwing, 6, 6);
    ctx.fillRect(4, 11 - legSwing, 6, 6);

    // Chuteiras pretas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-11, 15 + legSwing, 8, 4);
    ctx.fillRect(3, 15 - legSwing, 8, 4);

    // Camisa de Futebol (Azul com detalhes brancos e gola)
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.roundRect(-14, -14, 28, 20, 5);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Faixa no ombro / manga
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-14, -12, 4, 10);
    ctx.fillRect(10, -12, 4, 10);

    // Número 10 nas costas
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('10', 0, -3);

    // Cabeça
    ctx.beginPath();
    ctx.arc(0, -18, 9, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();

    // Cabelo do craque
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(0, -22, 8, Math.PI, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // A Bola ⚽ Rola nos pés do jogador na corrida
    if (currentMode === MODE.RUNNER) {
        const ballOffset = 18 + Math.sin(player.runCycle) * 3;
        ctx.save();
        ctx.translate(player.x, player.y + ballOffset);
        ctx.rotate(player.ballRotation);
        ctx.font = '26px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚽', 0, 0);
        ctx.restore();
    }
}

// ========================================================
// ZAGUEIROS ADVERSÁRIOS (MOVIMENTO NATURAL DE FUTEBOL)
// ========================================================
function spawnDefendersIfNeeded() {
    if (currentMode !== MODE.RUNNER) return;

    if (meters >= nextDefenderSpawnMeters) {
        const maxOnScreen = meters > 600 ? 4 : 3;

        if (defenders.length < maxOnScreen) {
            const laneWidth = (logicalWidth - pitchMargin * 2) / 3;
            const lane = Math.floor(Math.random() * 3);
            const posX = pitchMargin + (lane + 0.5) * laneWidth;

            let style = DEFENDER_STYLES.JOCKEY;
            const rand = Math.random();

            if (meters > 500 && rand < 0.45) {
                style = DEFENDER_STYLES.SLIDER;
            } else if (meters > 250 && rand < 0.75) {
                style = DEFENDER_STYLES.CHASER;
            }

            defenders.push({
                x: posX,
                y: -60,
                radius: 19,
                style: style,
                state: 'NORMAL',
                stateTimer: 0,
                vx: (Math.random() < 0.5 ? 1 : -1) * (1.2 + (meters / 1000) * 0.45),
                tackleVx: 0,
                tackleVy: 0,
                jerseyNumber: [3, 4, 5, 2][Math.floor(Math.random() * 4)],
                dodged: false
            });
        }

        const spacing = Math.max(140, 220 - (meters / 1000) * 80);
        nextDefenderSpawnMeters = meters + spacing;
    }
}

function updateDefenders(delta) {
    for (let i = defenders.length - 1; i >= 0; i--) {
        const d = defenders[i];
        d.y += currentScrollSpeed * timeScale;

        const distToPlayer = Math.hypot(player.x - d.x, player.y - d.y);

        // Movimento natural de marcação de futebol:
        if (d.style === DEFENDER_STYLES.JOCKEY) {
            // Marcação em linha / fechando o ângulo da bola
            d.x += d.vx * timeScale;
            if (d.x < pitchMargin + 24 || d.x > logicalWidth - pitchMargin - 24) {
                d.vx *= -1;
            }
        } else if (d.style === DEFENDER_STYLES.CHASER) {
            // Zagueiro de bote direto
            if (d.state === 'NORMAL') {
                if (distToPlayer < 240 && d.y < player.y) {
                    d.state = 'ALERT';
                    d.stateTimer = performance.now() + 380;
                    sfx.playAlertBeep();
                }
            } else if (d.state === 'ALERT') {
                if (performance.now() > d.stateTimer) {
                    d.state = 'TACKLING';
                    const angle = Math.atan2(player.y - d.y, player.x - d.x);
                    const spd = 3.6 + (meters / 1000) * 0.7;
                    d.tackleVx = Math.cos(angle) * spd;
                    d.tackleVy = Math.sin(angle) * spd;
                    d.stateTimer = performance.now() + 850;
                }
            } else if (d.state === 'TACKLING') {
                d.x += d.tackleVx * timeScale;
                d.y += d.tackleVy * timeScale;
                spawnGrassDust(d.x, d.y + 10, 2);

                if (performance.now() > d.stateTimer) {
                    d.state = 'STUMBLED';
                    d.stateTimer = performance.now() + 800;
                }
            }
        } else if (d.style === DEFENDER_STYLES.SLIDER) {
            // Zagueiro de carrinho lateral na bola
            if (d.state === 'NORMAL') {
                if (distToPlayer < 220 && Math.abs(player.y - d.y) < 180) {
                    d.state = 'ALERT';
                    d.stateTimer = performance.now() + 320;
                    sfx.playAlertBeep();
                }
            } else if (d.state === 'ALERT') {
                if (performance.now() > d.stateTimer) {
                    d.state = 'TACKLING';
                    const dirX = player.x > d.x ? 1 : -1;
                    d.tackleVx = dirX * (4.4 + (meters / 1000) * 0.7);
                    d.stateTimer = performance.now() + 650;
                }
            } else if (d.state === 'TACKLING') {
                d.x += d.tackleVx * timeScale;
                spawnGrassDust(d.x, d.y + 12, 3);
                if (performance.now() > d.stateTimer) {
                    d.state = 'STUMBLED';
                    d.stateTimer = performance.now() + 800;
                }
            }
        }

        // Finta / Drible
        if (!d.dodged && (d.y > player.y + 24 || d.state === 'STUMBLED')) {
            d.dodged = true;
            dribblesCount++;
            score += 150;
            scoreTxt.textContent = score;

            showComboPopup('⚡ DRIBLE! +150');
        }

        // Colisão com o zagueiro
        if (currentMode === MODE.RUNNER && !player.isInvulnerable) {
            if (distToPlayer < player.radius + d.radius - 4) {
                triggerGameOver('O ZAGUEIRO DESARMOU VOCÊ!', '💥');
                return;
            }
        }

        if (d.y > logicalHeight + 60) {
            defenders.splice(i, 1);
        }
    }
}

function drawDefenders() {
    ctx.save();
    for (let d of defenders) {
        ctx.beginPath();
        ctx.ellipse(d.x, d.y + 16, 20, 8, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fill();

        // Uniforme de Zagueiro (Vermelho e Preto listrado de clube)
        ctx.fillStyle = d.state === 'STUMBLED' ? '#7f1d1d' : '#dc2626';
        ctx.beginPath();
        ctx.roundRect(d.x - 16, d.y - 14, 32, 22, 5);
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Calção preto de futebol
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(d.x - 12, d.y + 8, 8, 7);
        ctx.fillRect(d.x + 4, d.y + 8, 8, 7);

        // Meiões vermelhos
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(d.x - 12, d.y + 15, 8, 4);
        ctx.fillRect(d.x + 4, d.y + 15, 8, 4);

        // Número da camisa
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(d.jerseyNumber, d.x, d.y - 2);

        // Cabeça
        ctx.beginPath();
        ctx.arc(d.x, d.y - 19, 9, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();

        // Balão de Alerta '!' quando acende
        if (d.state === 'ALERT') {
            ctx.save();
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(d.x, d.y - 38, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 15px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('!', d.x, d.y - 37);
            ctx.restore();
        }

        if (d.state === 'STUMBLED') {
            ctx.font = '15px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('💫', d.x, d.y - 35);
        }
    }
    ctx.restore();
}

// ========================================================
// RECURSOS RETRÔ: SLOW-MO E GIRO 360°
// ========================================================
function updateSlowMo(delta) {
    if (isSlowMoActive && slowMoStamina > 0) {
        slowMoStamina -= (SLOWMO_DRAIN_RATE * (delta / 1000));
        timeScale = 0.45;
        if (slowMoStamina <= 0) {
            slowMoStamina = 0;
            setSlowMo(false);
        }
    } else {
        timeScale = 1.0;
        if (slowMoStamina < 100) {
            slowMoStamina = Math.min(100, slowMoStamina + (SLOWMO_RECOVERY_RATE * (delta / 1000)));
        }
    }
    staminaBar.style.width = `${slowMoStamina}%`;
}

function setSlowMo(active) {
    if (currentMode !== MODE.RUNNER) return;
    if (active && slowMoStamina <= 10) return;

    if (isSlowMoActive !== active) {
        isSlowMoActive = active;
        sfx.playSlowMoSound(active);
    }
}

function triggerSpin() {
    if (currentMode !== MODE.RUNNER) return;
    const now = performance.now();
    if (now - lastSpinTime < SPIN_COOLDOWN_MS) return;

    lastSpinTime = now;
    player.isSpinning = true;
    player.isInvulnerable = true;
    player.invulnerableTimer = now + 480;

    sfx.playSpinWhoosh();
    showComboPopup('🌪️ GIRO 360°!');
}

function updateSpinCooldown() {
    const elapsed = performance.now() - lastSpinTime;
    const remain = Math.max(0, SPIN_COOLDOWN_MS - elapsed);
    const pct = (remain / SPIN_COOLDOWN_MS) * 100;
    spinCooldownShade.style.height = `${pct}%`;
}

// ========================================================
// PÊNALTI REALISTA (TOTALMENTE DESOBSTRUÍDO E VISÍVEL!)
// ========================================================
function startPenaltyPhase() {
    currentMode = MODE.PENALTY_AIM;
    setSlowMo(false);
    defenders = [];

    // Oculta HUD de corrida para não poluir
    arcadeHud.style.opacity = '0';
    actionControls.style.display = 'none';

    // Jogador PARADO na marca da cal
    player.x = logicalWidth / 2;
    player.y = logicalHeight - 125;
    player.targetX = player.x;
    player.targetY = player.y;

    // Bola parada na marca do pênalti
    penaltyBall.x = logicalWidth / 2;
    penaltyBall.y = logicalHeight - 170;
    penaltyBall.scale = 1.0;

    // Trave do Gol no topo com espaço livre
    goalPost.y = 65;

    // Goleiro na linha
    goalkeeper.x = logicalWidth / 2;
    goalkeeper.y = goalPost.y + goalPost.height - 18;
    goalkeeper.vx = 2.4 + Math.min(2.0, goalsCount * 0.45);
    goalkeeper.state = 'READY';

    // Alvo de mira inicial
    penaltyAim.sweepAngle = 0;
    penaltyAim.x = logicalWidth / 2;
    penaltyAim.y = goalPost.y + goalPost.height * 0.5;

    sfx.playWhistle(true);
    penaltyUi.classList.remove('hidden');
}

function updatePenaltyAim(delta) {
    if (currentMode === MODE.PENALTY_AIM) {
        // Alvo de mira oscila suavemente entre a gaveta esquerda e direita
        penaltyAim.sweepAngle += 0.045;
        const goalLeft = (logicalWidth - goalPost.width) / 2 + 25;
        const goalRight = goalLeft + goalPost.width - 50;
        const center = (goalLeft + goalRight) / 2;
        const radius = (goalRight - goalLeft) / 2;

        penaltyAim.x = center + Math.sin(penaltyAim.sweepAngle) * radius;
        penaltyAim.y = goalPost.y + 18 + (Math.sin(penaltyAim.sweepAngle * 1.5) + 1) * 22;

        // Goleiro se movimenta pulando de um lado para o outro na linha do gol
        goalkeeper.x += goalkeeper.vx;
        const gkMinX = (logicalWidth - goalPost.width) / 2 + 30;
        const gkMaxX = gkMinX + goalPost.width - 60;
        if (goalkeeper.x < gkMinX) {
            goalkeeper.x = gkMinX;
            goalkeeper.vx = Math.abs(goalkeeper.vx);
        } else if (goalkeeper.x > gkMaxX) {
            goalkeeper.x = gkMaxX;
            goalkeeper.vx = -Math.abs(goalkeeper.vx);
        }
    } else if (currentMode === MODE.PENALTY_SHOT) {
        penaltyBall.x += penaltyBall.vx;
        penaltyBall.y += penaltyBall.vy;
        penaltyBall.scale = Math.max(0.65, penaltyBall.scale - 0.015);
        spawnGrassDust(penaltyBall.x, penaltyBall.y, 1);

        goalkeeper.x += goalkeeper.diveDir * 4.2;

        checkPenaltyCollision();
    }
}

function executePenaltyKick() {
    if (currentMode !== MODE.PENALTY_AIM) return;

    // Jogador inicia a corrida de aproximação
    currentMode = MODE.PENALTY_RUNUP;
    player.runUpProgress = 0;
    penaltyUi.classList.add('hidden');
}

function startPenaltyShot() {
    const dx = penaltyAim.x - penaltyBall.x;
    const dy = penaltyAim.y - penaltyBall.y;
    const dist = Math.hypot(dx, dy);
    const speed = 13.5;

    penaltyBall.vx = (dx / dist) * speed;
    penaltyBall.vy = (dy / dist) * speed;

    const goalieDistToAim = penaltyAim.x - goalkeeper.x;
    goalkeeper.state = 'DIVING';
    goalkeeper.diveDir = goalieDistToAim > 0 ? 1 : -1;
}

function checkPenaltyCollision() {
    // 1. Defesa do Goleiro
    const distToGk = Math.hypot(penaltyBall.x - goalkeeper.x, penaltyBall.y - goalkeeper.y);
    if (distToGk < 32) {
        screenShake = 14;
        triggerGameOver('O GOLEIRO ESPALMOU NO ÂNGULO!', '🧤');
        return;
    }

    // 2. Trave e Linha do Gol
    const goalLeft = (logicalWidth - goalPost.width) / 2;
    const goalRight = goalLeft + goalPost.width;

    if (penaltyBall.y <= goalPost.y + goalPost.height) {
        if (penaltyBall.x >= goalLeft + 12 && penaltyBall.x <= goalRight - 12) {
            handleGoalSuccess();
        } else {
            screenShake = 12;
            triggerGameOver('CHUTOU NA TRAVE E FOI PRA FORA!', '🥅');
        }
    }
}

function handleGoalSuccess() {
    currentMode = MODE.CELEBRATION;

    goalsCount++;
    score += 500;
    goalsTxt.textContent = goalsCount;
    scoreTxt.textContent = score;

    sfx.playGoalTriumph();
    spawnGoalConfetti(100);
    screenShake = 16;

    showComboPopup('⚽ GOOOOOOL! +500 PTS');
    targetMeters += 1000;

    setTimeout(() => {
        resumeRunnerAfterPenalty();
    }, 2400);
}

function resumeRunnerAfterPenalty() {
    currentMode = MODE.RUNNER;
    arcadeHud.style.opacity = '1';
    actionControls.style.display = 'flex';

    player.x = logicalWidth / 2;
    player.y = logicalHeight - 130;
    player.targetX = player.x;
    player.targetY = player.y;
    defenders = [];
    nextDefenderSpawnMeters = meters + 120;
}

function drawPenaltyScene() {
    if (currentMode === MODE.RUNNER) return;

    const goalLeft = (logicalWidth - goalPost.width) / 2;
    const goalRight = goalLeft + goalPost.width;

    // 1. Grande Área de Futebol
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 3;
    const boxW = goalPost.width + 50;
    ctx.strokeRect((logicalWidth - boxW) / 2, goalPost.y, boxW, 200);

    // Marca da Cal (Pênalti)
    ctx.beginPath();
    ctx.arc(logicalWidth / 2, logicalHeight - 170, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Meia-lua da grande área
    ctx.beginPath();
    ctx.arc(logicalWidth / 2, logicalHeight - 170, 45, Math.PI, 0);
    ctx.stroke();

    // 2. Trave e Rede do Gol (100% Visível e Nítida!)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.fillRect(goalLeft, goalPost.y, goalPost.width, goalPost.height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1;
    for (let x = goalLeft; x <= goalRight; x += 15) {
        ctx.beginPath();
        ctx.moveTo(x, goalPost.y);
        ctx.lineTo(x, goalPost.y + goalPost.height);
        ctx.stroke();
    }
    for (let y = goalPost.y; y <= goalPost.y + goalPost.height; y += 12) {
        ctx.beginPath();
        ctx.moveTo(goalLeft, y);
        ctx.lineTo(goalRight, y);
        ctx.stroke();
    }

    // Postes Brancos
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = goalPost.postThickness;
    ctx.beginPath();
    ctx.moveTo(goalLeft, goalPost.y + goalPost.height);
    ctx.lineTo(goalLeft, goalPost.y);
    ctx.lineTo(goalRight, goalPost.y);
    ctx.lineTo(goalRight, goalPost.y + goalPost.height);
    ctx.stroke();
    ctx.restore();

    // 3. O Goleiro
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(goalkeeper.x, goalkeeper.y + 12, 22, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fill();

    // Uniforme Amarelo
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.roundRect(goalkeeper.x - 16, goalkeeper.y - 14, 32, 24, 6);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(goalkeeper.x, goalkeeper.y - 19, 9, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();

    // Luvas
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🧤', goalkeeper.x - 18, goalkeeper.y);
    ctx.fillText('🧤', goalkeeper.x + 18, goalkeeper.y);
    ctx.restore();

    // 4. A Bola Parada na Marca da Cal ou Voando no Chute
    ctx.save();
    ctx.font = `${Math.round(28 * penaltyBall.scale)}px "Segoe UI Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚽', penaltyBall.x, penaltyBall.y);
    ctx.restore();

    // 5. Retículo de Mira no Pênalti
    if (currentMode === MODE.PENALTY_AIM) {
        ctx.save();
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.75)';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(penaltyBall.x, penaltyBall.y);
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

// ========================================================
// NOTIFICAÇÃO DE COMBO FLUTUANTE
// ========================================================
let popupTimer = null;
function showComboPopup(text) {
    if (popupTimer) clearTimeout(popupTimer);
    comboPopup.textContent = text;
    comboPopup.classList.remove('hidden');

    popupTimer = setTimeout(() => {
        comboPopup.classList.add('hidden');
    }, 750);
}

// ========================================================
// LOOP PRINCIPAL DE ANIMAÇÃO
// ========================================================
function update(delta, timestamp) {
    if (currentMode === MODE.RUNNER) {
        const meterIncrement = 0.55 * timeScale;
        meters += meterIncrement;
        score += 1;
        metersTxt.innerHTML = `${Math.floor(meters)}m <small>/ ${targetMeters}m</small>`;
        scoreTxt.textContent = score;

        if (meters >= targetMeters) {
            startPenaltyPhase();
        }

        fieldScrollY += currentScrollSpeed * timeScale;

        spawnDefendersIfNeeded();
        updateDefenders(delta);
    }

    updatePlayer(delta);
    updatePenaltyAim(delta);
    updateSlowMo(delta);
    updateSpinCooldown();
    updateAndDrawParticles();

    if (screenShake > 0) {
        screenShake *= 0.9;
        if (screenShake < 0.2) screenShake = 0;
    }
}

function gameLoop(timestamp) {
    if (currentMode === MODE.GAME_OVER) return;

    if (!lastTimestamp) lastTimestamp = timestamp;
    const delta = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    ctx.save();
    if (screenShake > 0) {
        const sx = (Math.random() - 0.5) * screenShake * 2;
        const sy = (Math.random() - 0.5) * screenShake * 2;
        ctx.translate(sx, sy);
    }

    ctx.clearRect(0, 0, logicalWidth, logicalHeight);

    drawPitch();
    drawPenaltyScene();
    drawDefenders();
    drawPlayer();

    update(delta, timestamp);

    ctx.restore();

    if (currentMode !== MODE.GAME_OVER) {
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}

// ========================================================
// FIM DE JOGO E REINICIALIZAÇÃO
// ========================================================
function triggerGameOver(reason, emoji = '💥') {
    currentMode = MODE.GAME_OVER;
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    sfx.playWhistle(true);

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('craque_touchdown_highscore', highScore.toString());
    }

    overEmoji.textContent = emoji;
    overDesc.textContent = reason;
    resMeters.textContent = `${Math.floor(meters)}m`;
    resScore.textContent = score;
    resGoals.textContent = goalsCount;
    resDribbles.textContent = dribblesCount;
    resBest.textContent = `${highScore} PTS`;

    penaltyUi.classList.add('hidden');
    arcadeHud.style.opacity = '1';
    actionControls.style.display = 'flex';
    gameOverScreen.classList.remove('hidden');
}

function restartGame() {
    gameOverScreen.classList.add('hidden');
    penaltyUi.classList.add('hidden');
    arcadeHud.style.opacity = '1';
    actionControls.style.display = 'flex';

    currentMode = MODE.RUNNER;
    meters = 0;
    targetMeters = 1000;
    score = 0;
    goalsCount = 0;
    dribblesCount = 0;
    slowMoStamina = 100;
    isSlowMoActive = false;
    screenShake = 0;
    nextDefenderSpawnMeters = 70;

    metersTxt.innerHTML = '0m <small>/ 1000m</small>';
    scoreTxt.textContent = '0';
    goalsTxt.textContent = '0';

    defenders = [];
    particles = [];

    player.x = logicalWidth / 2;
    player.y = logicalHeight - 130;
    player.targetX = player.x;
    player.targetY = player.y;
    player.isSpinning = false;
    player.isInvulnerable = false;

    lastTimestamp = performance.now();
    sfx.playWhistle();

    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(gameLoop);
}

// ========================================================
// CONTROLES DE ENTRADA LIVRE 2D & TOQUE
// ========================================================
let touchOriginX = 0;
let touchOriginY = 0;
let playerOriginX = 0;
let playerOriginY = 0;
let isTouching = false;

// Toque Relativo
container.addEventListener('touchstart', (e) => {
    sfx.init();
    if (currentMode === MODE.GAME_OVER) return;

    if (e.touches && e.touches.length > 0) {
        isTouching = true;
        touchOriginX = e.touches[0].clientX;
        touchOriginY = e.touches[0].clientY;
        playerOriginX = player.x;
        playerOriginY = player.y;
    }
}, { passive: true });

container.addEventListener('touchmove', (e) => {
    if (!isTouching || e.touches.length === 0) return;
    const dx = e.touches[0].clientX - touchOriginX;
    const dy = e.touches[0].clientY - touchOriginY;
    player.targetX = playerOriginX + dx;
    player.targetY = playerOriginY + dy;
}, { passive: true });

container.addEventListener('touchend', () => {
    isTouching = false;
});

// Suporte a Mouse
let isMouseDown = false;
container.addEventListener('mousedown', (e) => {
    sfx.init();
    if (currentMode === MODE.GAME_OVER) return;
    isMouseDown = true;
    touchOriginX = e.clientX;
    touchOriginY = e.clientY;
    playerOriginX = player.x;
    playerOriginY = player.y;
});

window.addEventListener('mousemove', (e) => {
    if (!isMouseDown) return;
    const dx = e.clientX - touchOriginX;
    const dy = e.clientY - touchOriginY;
    player.targetX = playerOriginX + dx;
    player.targetY = playerOriginY + dy;
});

window.addEventListener('mouseup', () => {
    isMouseDown = false;
});

// Teclado
window.addEventListener('keydown', (e) => {
    sfx.init();
    const speed = 25;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') player.targetX -= speed;
    else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') player.targetX += speed;
    else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') player.targetY -= speed;
    else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') player.targetY += speed;
    else if (e.key === 'Shift') setSlowMo(true);
    else if (e.key === ' ' || e.key === 'Enter') {
        if (currentMode === MODE.PENALTY_AIM) executePenaltyKick();
        else triggerSpin();
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'Shift') setSlowMo(false);
});

// Ações
slowmoBtn.addEventListener('mousedown', () => setSlowMo(true));
slowmoBtn.addEventListener('mouseup', () => setSlowMo(false));
slowmoBtn.addEventListener('mouseleave', () => setSlowMo(false));
slowmoBtn.addEventListener('touchstart', (e) => {
    e.stopPropagation();
    setSlowMo(true);
});
slowmoBtn.addEventListener('touchend', (e) => {
    e.stopPropagation();
    setSlowMo(false);
});

spinBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    triggerSpin();
});
spinBtn.addEventListener('touchend', (e) => {
    e.stopPropagation();
    triggerSpin();
});

penaltyKickBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    executePenaltyKick();
});
penaltyKickBtn.addEventListener('touchend', (e) => {
    e.stopPropagation();
    executePenaltyKick();
});

retryBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    restartGame();
});
retryBtn.addEventListener('touchend', (e) => {
    e.stopPropagation();
    restartGame();
});

soundBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    sfx.init();
    const on = sfx.toggle();
    soundBtn.textContent = on ? '🔊' : '🔇';
});

setTimeout(() => {
    if (hintBubble) hintBubble.style.opacity = '0';
}, 4200);

window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', () => setTimeout(resizeCanvas, 150));

function init() {
    resizeCanvas();
    lastTimestamp = performance.now();
    if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
