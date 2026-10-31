/**
 * Touchdown Craque Hero - JavaScript Engine
 * Estilo Retro Arcade 16-Bit inspirado no Touchdown Hero
 * Controle Livre 2D, Câmera Lenta (Slow-Mo), Fintas Telegrafadas,
 * Disputa de Pênalti Real com Jogador Parado na Marca da Cal.
 */

// ========================================================
// SISTEMA DE ÁUDIO RETRÔ PROCEDURAL (Web Audio API)
// ========================================================
class RetroAudio {
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
            osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.14);
            gain.gain.setValueAtTime(0.6, this.ctx.currentTime);
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
            const startF = active ? 400 : 200;
            const endF = active ? 200 : 400;
            osc.frequency.setValueAtTime(startF, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(endF, this.ctx.currentTime + 0.12);
            gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
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
            osc.frequency.exponentialRampToValueAtTime(850, this.ctx.currentTime + 0.18);
            gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
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
            osc.frequency.setValueAtTime(950, this.ctx.currentTime);
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

const sfx = new RetroAudio();

// ========================================================
// ELEMENTOS DO DOM
// ========================================================
const container = document.getElementById('game-container');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const staminaBar = document.getElementById('stamina-bar');
const metersTxt = document.getElementById('meters-txt');
const scoreTxt = document.getElementById('score-txt');
const goalsTxt = document.getElementById('goals-txt');
const soundBtn = document.getElementById('sound-btn');
const comboPopup = document.getElementById('combo-popup');

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
// ESTADO GLOBAL DO JOGO
// ========================================================
const GAME_MODE = {
    RUNNER: 'RUNNER',               // Corrida com fintas
    PENALTY_SETUP: 'PENALTY_SETUP', // Transição e posicionamento na marca da cal
    PENALTY_AIM: 'PENALTY_AIM',     // Jogador PARADO mirando na trave
    PENALTY_RUNUP: 'PENALTY_RUNUP', // Corrida do jogador até a bola
    PENALTY_SHOT: 'PENALTY_SHOT',   // Bola voando em 3D rumo ao gol
    CELEBRATION: 'CELEBRATION',     // Comemoração de gol
    GAME_OVER: 'GAME_OVER'          // Derrota
};

let currentMode = GAME_MODE.RUNNER;
let animationFrameId = null;

let logicalWidth = 0;
let logicalHeight = 0;
let pitchMargin = 38;

// Progresso e Dificuldade Equilibrada
let meters = 0;
let targetMeters = 1000; // Objetivo do Pênalti
let score = 0;
let goalsCount = 0;
let dribblesCount = 0;
let highScore = parseInt(localStorage.getItem('craque_touchdown_highscore') || '0', 10);

// Câmera Lenta (Slow-Mo) e Stamina
let isSlowMoActive = false;
let slowMoStamina = 100; // 0 a 100
const SLOWMO_DRAIN_RATE = 28; // % por segundo
const SLOWMO_RECOVERY_RATE = 18; // % por segundo de recarga
let timeScale = 1.0;

// Velocidade Base de Rolagem
let baseScrollSpeed = 2.2;
let currentScrollSpeed = 2.2;
let fieldScrollY = 0;
let screenShake = 0;

let lastTimestamp = 0;

// ========================================================
// JOGADOR (CRAQUE DO DRIBLE)
// ========================================================
const player = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    radius: 17,
    runCycle: 0,
    isSpinning: false,
    spinAngle: 0,
    isInvulnerable: false,
    invulnerableTimer: 0,

    // Pênalti: Posição do chute e mira
    penaltyStartX: 0,
    penaltyStartY: 0,
    runUpProgress: 0
};

// Habilidade Especial de Giro (Spin Move)
const SPIN_COOLDOWN_MS = 4500;
let lastSpinTime = -9999;

// ========================================================
// ZAGUEIROS (COM IA DE PERSEGUIÇÃO E FINTA)
// ========================================================
let defenders = [];
let nextDefenderSpawnMeters = 70; // Próximo spawn calculado

const DEFENDER_TYPES = {
    PATROL: 'PATROL',   // Zagueiro de posicionamento tático lateral
    CHASER: 'CHASER',   // Zagueiro perseguidor (alerta '!' e bote com inércia)
    SLIDER: 'SLIDER'    // Zagueiro que dá carrinho rasgando a grama
};

// ========================================================
// TRAVE, MIRA E GOLEIRO (DISPUTA DE PÊNALTI)
// ========================================================
const goalPost = {
    y: 85,
    width: 260,
    height: 75,
    postThickness: 8
};

const penaltyAim = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    sweepAngle: 0
};

const goalkeeper = {
    x: 0,
    y: 0,
    vx: 2.2,
    state: 'READY', // READY, DIVING
    diveDir: 0,     // -1 (esq), 1 (dir)
    diveProgress: 0
};

// Bola no Pênalti
const penaltyBall = {
    x: 0,
    y: 0,
    scale: 1.0,
    targetX: 0,
    targetY: 0,
    vx: 0,
    vy: 0
};

// Partículas e Torcida Pixel
let particles = [];
let spectators = [];

// ========================================================
// REDIMENSIONAMENTO E INICIALIZAÇÃO DO CANVAS
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

    pitchMargin = Math.max(34, Math.round(logicalWidth * 0.11));

    if (currentMode === GAME_MODE.RUNNER && !player.x) {
        player.x = logicalWidth / 2;
        player.y = logicalHeight - 130;
        player.targetX = player.x;
        player.targetY = player.y;
    }

    goalPost.width = Math.min(290, logicalWidth * 0.74);

    initSpectators();
}

function initSpectators() {
    spectators = [];
    const colors = ['#facc15', '#38bdf8', '#22c55e', '#ef4444', '#ffffff', '#fb923c'];
    const count = 30;
    for (let i = 0; i < count; i++) {
        // Arquibancada esquerda
        spectators.push({
            side: 'left',
            x: Math.random() * (pitchMargin - 16) + 8,
            baseY: i * 36,
            color: colors[Math.floor(Math.random() * colors.length)],
            offset: Math.random() * Math.PI * 2
        });
        // Arquibancada direita
        spectators.push({
            side: 'right',
            x: logicalWidth - pitchMargin + 8 + Math.random() * (pitchMargin - 16),
            baseY: i * 36,
            color: colors[Math.floor(Math.random() * colors.length)],
            offset: Math.random() * Math.PI * 2
        });
    }
}

// ========================================================
// SISTEMA DE PARTÍCULAS (GRAMA E CONFETES)
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
// RENDERIZAÇÃO RETRÔ DO CAMPO (ESTILO TOUCHDOWN HERO)
// ========================================================
function drawPitch() {
    // 1. Gramado Arcade Verde
    ctx.fillStyle = '#1e824c';
    ctx.fillRect(0, 0, logicalWidth, logicalHeight);

    // 2. Faixas de Corte da Grama Verticais
    const stripeCount = 6;
    const stripeW = (logicalWidth - pitchMargin * 2) / stripeCount;
    for (let i = 0; i < stripeCount; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#1b7845' : '#229954';
        ctx.fillRect(pitchMargin + i * stripeW, 0, stripeW, logicalHeight);
    }

    // 3. Arquibancada e Torcida
    drawSpectators();

    // 4. Linhas Laterais Brancas (Touchlines)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(pitchMargin, 0);
    ctx.lineTo(pitchMargin, logicalHeight);
    ctx.moveTo(logicalWidth - pitchMargin, 0);
    ctx.lineTo(logicalWidth - pitchMargin, logicalHeight);
    ctx.stroke();

    // 5. Linhas de Jardas/Metros e Hash Marks (Estilo Touchdown Hero)
    const meterSpacing = 160;
    const offset = fieldScrollY % meterSpacing;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 2;

    for (let y = -meterSpacing + offset; y < logicalHeight + meterSpacing; y += meterSpacing) {
        // Linha contínua
        ctx.beginPath();
        ctx.moveTo(pitchMargin, y);
        ctx.lineTo(logicalWidth - pitchMargin, y);
        ctx.stroke();

        // Hash marks pontilhadas no centro
        const hashW = 8;
        const centerX = logicalWidth / 2;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(centerX - 35, y - 2, hashW, 4);
        ctx.fillRect(centerX + 35 - hashW, y - 2, hashW, 4);

        // Número do metro pintado na grama (ex: 100m, 200m...)
        const lineMeters = Math.floor((meters + (logicalHeight - y) * 0.4) / 50) * 50;
        if (lineMeters > 0 && lineMeters < targetMeters) {
            ctx.save();
            ctx.font = 'bold 15px "Impact", sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${lineMeters}`, pitchMargin + 26, y - 10);
            ctx.fillText(`${lineMeters}`, logicalWidth - pitchMargin - 26, y - 10);
            ctx.restore();
        }
    }
}

function drawSpectators() {
    // Zona de arquibancada
    ctx.fillStyle = '#0f1712';
    ctx.fillRect(0, 0, pitchMargin, logicalHeight);
    ctx.fillRect(logicalWidth - pitchMargin, 0, pitchMargin, logicalHeight);

    // Torcedores pixelados pulando
    const t = performance.now() * 0.006;
    for (let fan of spectators) {
        const bob = Math.sin(t + fan.offset) * 4;
        const drawY = (fan.baseY + fieldScrollY * 0.8) % logicalHeight;

        ctx.fillStyle = fan.color;
        ctx.beginPath();
        ctx.arc(fan.x, drawY + bob, 4.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ========================================================
// CONTROLE E RENDERIZAÇÃO DO JOGADOR RETRÔ
// ========================================================
function updatePlayer(delta) {
    if (currentMode === GAME_MODE.RUNNER) {
        // Interpolação suave em direção ao alvo 2D
        const lerp = 0.28;
        player.x += (player.targetX - player.x) * lerp;
        player.y += (player.targetY - player.y) * lerp;

        // Limita dentro do campo
        const minX = pitchMargin + player.radius + 4;
        const maxX = logicalWidth - pitchMargin - player.radius - 4;
        player.x = Math.max(minX, Math.min(maxX, player.x));

        // Limites verticais
        const minY = logicalHeight * 0.16;
        const maxY = logicalHeight - player.radius - 16;
        player.y = Math.max(minY, Math.min(maxY, player.y));

        player.runCycle += 0.24 * timeScale;

        // Giro 360° (Spin Move)
        if (player.isSpinning) {
            player.spinAngle += 0.45;
            spawnSpinTrail(player.x, player.y);
            if (performance.now() > player.invulnerableTimer) {
                player.isSpinning = false;
                player.isInvulnerable = false;
            }
        }
    } else if (currentMode === GAME_MODE.PENALTY_RUNUP) {
        // Animação de corrida até a bola no pênalti
        player.runUpProgress += 0.08;
        player.runCycle += 0.35;
        // Avança até a bola
        player.x += (penaltyBall.x - player.x) * 0.15;
        player.y += ((penaltyBall.y + 14) - player.y) * 0.15;

        if (player.runUpProgress >= 1.0) {
            // Chute disparado!
            currentMode = GAME_MODE.PENALTY_SHOT;
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

    // Pernas animadas
    const legSwing = currentMode === GAME_MODE.PENALTY_AIM ? 0 : Math.sin(player.runCycle) * 8;
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-10, 4 + legSwing, 6, 12);
    ctx.fillRect(4, 4 - legSwing, 6, 12);

    // Chuteiras brancas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-11, 14 + legSwing, 8, 4);
    ctx.fillRect(3, 14 - legSwing, 8, 4);

    // Corpo / Camisa Azul do Craque
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.roundRect(-14, -14, 28, 22, 5);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Número 10 branco nas costas
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

    // Cabelo / Faixa
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(0, -22, 8, Math.PI, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // A Bola ⚽ na corrida normal
    if (currentMode === GAME_MODE.RUNNER) {
        const ballOffset = 18 + Math.sin(player.runCycle) * 3;
        ctx.save();
        ctx.font = '26px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚽', player.x, player.y + ballOffset);
        ctx.restore();
    }
}

// ========================================================
// IA DOS ZAGUEIROS (EQUILIBRADA & DESAFIADORA)
// ========================================================
function spawnDefendersIfNeeded() {
    if (currentMode !== GAME_MODE.RUNNER) return;

    if (meters >= nextDefenderSpawnMeters) {
        // Dificuldade progressiva conforme os metros avançam
        const maxOnScreen = meters > 600 ? 4 : 3;

        if (defenders.length < maxOnScreen) {
            const laneWidth = (logicalWidth - pitchMargin * 2) / 3;
            const lane = Math.floor(Math.random() * 3);
            const posX = pitchMargin + (lane + 0.5) * laneWidth;

            // Variedade de tipos baseada no progresso dos metros
            let type = DEFENDER_TYPES.PATROL;
            const rand = Math.random();

            if (meters > 500 && rand < 0.45) {
                type = DEFENDER_TYPES.SLIDER;
            } else if (meters > 250 && rand < 0.75) {
                type = DEFENDER_TYPES.CHASER;
            }

            defenders.push({
                x: posX,
                y: -60,
                radius: 19,
                type: type,
                state: 'NORMAL',
                stateTimer: 0,
                vx: (Math.random() < 0.5 ? 1 : -1) * (1.3 + (meters / 1000) * 0.5),
                tackleVx: 0,
                tackleVy: 0,
                jerseyNumber: [88, 52, 99, 44][Math.floor(Math.random() * 4)],
                dodged: false
            });
        }

        // Espaçamento calculado entre spawns para garantir jogabilidade justa
        const spacing = Math.max(140, 220 - (meters / 1000) * 80);
        nextDefenderSpawnMeters = meters + spacing;
    }
}

function updateDefenders(delta) {
    for (let i = defenders.length - 1; i >= 0; i--) {
        const d = defenders[i];

        // Descida com suporte ao Slow-Mo
        d.y += currentScrollSpeed * timeScale;

        const distToPlayer = Math.hypot(player.x - d.x, player.y - d.y);

        // LÓGICA DE IA
        if (d.type === DEFENDER_TYPES.PATROL) {
            d.x += d.vx * timeScale;
            if (d.x < pitchMargin + 24 || d.x > logicalWidth - pitchMargin - 24) {
                d.vx *= -1;
            }
        } else if (d.type === DEFENDER_TYPES.CHASER) {
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
                    const spd = 3.8 + (meters / 1000) * 0.8;
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
        } else if (d.type === DEFENDER_TYPES.SLIDER) {
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
                    d.tackleVx = dirX * (4.5 + (meters / 1000) * 0.8);
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

        // BÔNUS POR DRIBLE BEM SUCEDIDO
        if (!d.dodged && (d.y > player.y + 24 || d.state === 'STUMBLED')) {
            d.dodged = true;
            dribblesCount++;
            score += 150;
            scoreTxt.textContent = score;

            showComboPopup('⚡ DRIBLE! +150');
        }

        // COLISÃO
        if (currentMode === GAME_MODE.RUNNER && !player.isInvulnerable) {
            if (distToPlayer < player.radius + d.radius - 4) {
                triggerGameOver('O ZAGUEIRO ADVERSÁRIO DESARMOU VOCÊ!', '💥');
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
        // Sombra
        ctx.beginPath();
        ctx.ellipse(d.x, d.y + 16, 20, 8, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fill();

        // Camisa Vermelha com detalhes brancos estilo Touchdown Hero
        ctx.fillStyle = d.state === 'STUMBLED' ? '#7f1d1d' : '#dc2626';
        ctx.beginPath();
        ctx.roundRect(d.x - 16, d.y - 14, 32, 24, 6);
        ctx.fill();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Ombros / Detalhe Branco
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(d.x - 16, d.y - 14, 6, 8);
        ctx.fillRect(d.x + 10, d.y - 14, 6, 8);

        // Número da camisa
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(d.jerseyNumber, d.x, d.y - 1);

        // Cabeça
        ctx.beginPath();
        ctx.arc(d.x, d.y - 19, 9, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();

        // Alerta '!' quando detecta o jogador
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

        // Atordoado ao errar o bote
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
        timeScale = 0.45; // 50% de velocidade
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
    if (currentMode !== GAME_MODE.RUNNER) return;
    if (active && slowMoStamina <= 10) return; // Mínimo para ativar

    if (isSlowMoActive !== active) {
        isSlowMoActive = active;
        sfx.playSlowMoSound(active);
    }
}

function triggerSpin() {
    if (currentMode !== GAME_MODE.RUNNER) return;
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
// DISPUTA DE PÊNALTI REAL (JOGADOR PARADO NA MARCA DA CAL)
// ========================================================
function startPenaltySetup() {
    currentMode = GAME_MODE.PENALTY_SETUP;
    setSlowMo(false);
    defenders = [];

    // O jogador se posiciona exatamente atrás da marca da cal
    player.penaltyStartX = logicalWidth / 2;
    player.penaltyStartY = logicalHeight - 120;
    player.x = player.penaltyStartX;
    player.y = player.penaltyStartY;
    player.targetX = player.x;
    player.targetY = player.y;

    // A bola de futebol parada na marca do pênalti
    penaltyBall.x = logicalWidth / 2;
    penaltyBall.y = logicalHeight - 175;
    penaltyBall.scale = 1.0;

    // Trave no topo
    goalPost.y = 85;

    // Goleiro na linha
    goalkeeper.x = logicalWidth / 2;
    goalkeeper.y = goalPost.y + goalPost.height - 18;
    goalkeeper.vx = 2.4 + Math.min(2.2, goalsCount * 0.5);
    goalkeeper.state = 'READY';

    // Alvo de mira inicial
    penaltyAim.sweepAngle = 0;
    penaltyAim.x = logicalWidth / 2;
    penaltyAim.y = goalPost.y + goalPost.height * 0.4;

    sfx.playWhistle(true);

    // Mostra UI do Pênalti
    penaltyUi.classList.remove('hidden');
    currentMode = GAME_MODE.PENALTY_AIM;
}

function updatePenaltyAim(delta) {
    if (currentMode === GAME_MODE.PENALTY_AIM) {
        // Alvo de mira oscila suavemente de um canto ao outro da trave
        penaltyAim.sweepAngle += 0.045;
        const goalLeft = (logicalWidth - goalPost.width) / 2 + 35;
        const goalRight = goalLeft + goalPost.width - 70;
        const center = (goalLeft + goalRight) / 2;
        const radius = (goalRight - goalLeft) / 2;

        penaltyAim.x = center + Math.sin(penaltyAim.sweepAngle) * radius;
        // Altura oscila entre a gaveta e o chão
        penaltyAim.y = goalPost.y + 20 + (Math.sin(penaltyAim.sweepAngle * 1.5) + 1) * 20;

        // Goleiro se movimenta pulando de um lado para o outro na linha do gol
        goalkeeper.x += goalkeeper.vx;
        const gkMinX = (logicalWidth - goalPost.width) / 2 + 35;
        const gkMaxX = gkMinX + goalPost.width - 70;
        if (goalkeeper.x < gkMinX) {
            goalkeeper.x = gkMinX;
            goalkeeper.vx = Math.abs(goalkeeper.vx);
        } else if (goalkeeper.x > gkMaxX) {
            goalkeeper.x = gkMaxX;
            goalkeeper.vx = -Math.abs(goalkeeper.vx);
        }
    } else if (currentMode === GAME_MODE.PENALTY_SHOT) {
        // Bola voando rumo à trave
        penaltyBall.x += penaltyBall.vx;
        penaltyBall.y += penaltyBall.vy;
        penaltyBall.scale = Math.max(0.65, penaltyBall.scale - 0.015); // Efeito de profundidade 3D
        spawnGrassDust(penaltyBall.x, penaltyBall.y, 1);

        // Goleiro salta na direção prevista do chute
        goalkeeper.x += goalkeeper.diveDir * 4.2;

        checkPenaltyCollision();
    }
}

function executePenaltyKick() {
    if (currentMode !== GAME_MODE.PENALTY_AIM) return;

    // Jogador inicia a corrida até a bola
    currentMode = GAME_MODE.PENALTY_RUNUP;
    player.runUpProgress = 0;
    penaltyUi.classList.add('hidden');
}

function startPenaltyShot() {
    // Calcula vetor da bola em direção ao alvo mirado
    const dx = penaltyAim.x - penaltyBall.x;
    const dy = penaltyAim.y - penaltyBall.y;
    const dist = Math.hypot(dx, dy);
    const speed = 13.5;

    penaltyBall.vx = (dx / dist) * speed;
    penaltyBall.vy = (dy / dist) * speed;

    // Goleiro decide o lado do salto (com base na reação)
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
            // GOOOOOOOOOOOL!
            handleGoalSuccess();
        } else {
            // Fora / Trave
            screenShake = 12;
            triggerGameOver('CHUTOU NA TRAVE E FOI PRA FORA!', '🥅');
        }
    }
}

function handleGoalSuccess() {
    currentMode = GAME_MODE.CELEBRATION;

    goalsCount++;
    score += 500;
    goalsTxt.textContent = goalsCount;
    scoreTxt.textContent = score;

    sfx.playGoalTriumph();
    spawnGoalConfetti(100);
    screenShake = 16;

    showComboPopup('⚽ GOOOOOOL! +500 PTS');

    targetMeters += 1000; // Próximo aos 2000m, 3000m...

    setTimeout(() => {
        resumeRunnerAfterPenalty();
    }, 2400);
}

function resumeRunnerAfterPenalty() {
    currentMode = GAME_MODE.RUNNER;
    player.x = logicalWidth / 2;
    player.y = logicalHeight - 130;
    player.targetX = player.x;
    player.targetY = player.y;
    defenders = [];
    nextDefenderSpawnMeters = meters + 120;
}

function drawPenaltyScene() {
    if (currentMode === GAME_MODE.RUNNER) return;

    const goalLeft = (logicalWidth - goalPost.width) / 2;
    const goalRight = goalLeft + goalPost.width;

    // 1. Grande Área Branca
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 3;
    const boxW = goalPost.width + 50;
    ctx.strokeRect((logicalWidth - boxW) / 2, goalPost.y, boxW, 200);

    // Marca da Cal (Pênalti)
    ctx.beginPath();
    ctx.arc(logicalWidth / 2, logicalHeight - 175, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Meia-lua da área
    ctx.beginPath();
    ctx.arc(logicalWidth / 2, logicalHeight - 175, 45, Math.PI, 0);
    ctx.stroke();

    // 2. Trave e Rede do Gol
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
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

    // Postes Brancos Grossos
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

    // 5. Retículo / Alvo de Mira no Pênalti
    if (currentMode === GAME_MODE.PENALTY_AIM) {
        ctx.save();
        // Linha pontilhada da bola até a mira
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.7)';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(penaltyBall.x, penaltyBall.y);
        ctx.lineTo(penaltyAim.x, penaltyAim.y);
        ctx.stroke();

        // Alvo retículo giratório
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
// LOOP PRINCIPAL DE ANIMAÇÃO E ATUALIZAÇÃO
// ========================================================
function update(delta, timestamp) {
    if (currentMode === GAME_MODE.RUNNER) {
        // Metros avançam realisticamente de acordo com o tempo e velocidade
        const meterIncrement = 0.55 * timeScale;
        meters += meterIncrement;
        score += 1;
        metersTxt.innerHTML = `${Math.floor(meters)}m <small>/ ${targetMeters}m</small>`;
        scoreTxt.textContent = score;

        // Disparo do Pênalti aos 1.000 metros!
        if (meters >= targetMeters) {
            startPenaltySetup();
        }

        // Rolagem do campo
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
    if (currentMode === GAME_MODE.GAME_OVER) return;

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

    if (currentMode !== GAME_MODE.GAME_OVER) {
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}

// ========================================================
// FIM DE JOGO E RECOMEÇO
// ========================================================
function triggerGameOver(reason, emoji = '💥') {
    currentMode = GAME_MODE.GAME_OVER;
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
    gameOverScreen.classList.remove('hidden');
}

function restartGame() {
    gameOverScreen.classList.add('hidden');
    penaltyUi.classList.add('hidden');

    currentMode = GAME_MODE.RUNNER;
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
// CONTROLES DE ENTRADA LIVRE 2D & EVENTOS
// ========================================================
let touchOriginX = 0;
let touchOriginY = 0;
let playerOriginX = 0;
let playerOriginY = 0;
let isTouching = false;

// Toque Relativo
container.addEventListener('touchstart', (e) => {
    sfx.init();
    if (currentMode === GAME_MODE.GAME_OVER) return;

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

// Suporte com Mouse
let isMouseDown = false;
container.addEventListener('mousedown', (e) => {
    sfx.init();
    if (currentMode === GAME_MODE.GAME_OVER) return;
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

// Teclado (WASD / Setas / Espaço / Shift)
window.addEventListener('keydown', (e) => {
    sfx.init();
    const speed = 25;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') player.targetX -= speed;
    else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') player.targetX += speed;
    else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') player.targetY -= speed;
    else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') player.targetY += speed;
    else if (e.key === 'Shift') setSlowMo(true);
    else if (e.key === ' ' || e.key === 'Enter') {
        if (currentMode === GAME_MODE.PENALTY_AIM) executePenaltyKick();
        else triggerSpin();
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'Shift') setSlowMo(false);
});

// Botão de Slow-Mo (Segurar para ativar)
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

// Botão de Giro 360°
spinBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    triggerSpin();
});
spinBtn.addEventListener('touchend', (e) => {
    e.stopPropagation();
    triggerSpin();
});

// Botão do Pênalti
penaltyKickBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    executePenaltyKick();
});
penaltyKickBtn.addEventListener('touchend', (e) => {
    e.stopPropagation();
    executePenaltyKick();
});

// Botão Jogar Novamente
retryBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    restartGame();
});
retryBtn.addEventListener('touchend', (e) => {
    e.stopPropagation();
    restartGame();
});

// Áudio Mudo / Ativo
soundBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    sfx.init();
    const on = sfx.toggle();
    soundBtn.textContent = on ? '🔊' : '🔇';
});

// Oculta dica após 4 segundos
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
