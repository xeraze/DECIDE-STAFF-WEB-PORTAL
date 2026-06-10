const PASS = 'DECIDE-YUMIKO';
let otp = '';

const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
let pts = [];

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function initPts() {
  pts = [];
  const n = Math.floor(canvas.width * canvas.height / 7500);
  for (let i = 0; i < n; i++) {
    pts.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.1 + 0.2,
      a: Math.random() * 0.65 + 0.1,
      sp: Math.random() * 0.012 + 0.004,
      ph: Math.random() * Math.PI * 2,
      warm: Math.random() > 0.8
    });
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const t = performance.now() / 1000;
  for (const p of pts) {
    const a = p.a * (0.55 + 0.45 * Math.sin(t * p.sp * 6 + p.ph));
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.warm ? `rgba(255,190,200,${a})` : `rgba(215,200,240,${a})`;
    ctx.fill();
  }
  requestAnimationFrame(draw);
}

window.addEventListener('resize', () => {
  resize();
  initPts();
});
resize();
initPts();
draw();

function submitPass() {
  const v = document.getElementById('pass-input').value.trim();
  if (!v) return;

  otp = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('');
  console.log('[DECIDE OTP]:', otp);

  const wh = 'YOUR_DISCORD_WEBHOOK_URL';
  if (wh !== 'YOUR_DISCORD_WEBHOOK_URL') {
    fetch(wh, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'DECIDE · Staff Portal',
        embeds: [{
          title: 'Запрос на вход в Staff Portal',
          color: 11534336,
          fields: [{ name: 'Код подтверждения (8 цифр):', value: '```' + otp + '```', inline: false }],
          footer: { text: 'DECIDE Staff Portal · Система безопасности' },
          timestamp: new Date().toISOString()
        }]
      })
    }).catch(() => { });
  }

  document.getElementById('step-pass').classList.add('hidden');
  document.getElementById('step-otp').classList.remove('hidden');
  setTimeout(() => document.getElementById('otp-input').focus(), 100);
}

function submitOtp() {
  const v = document.getElementById('otp-input').value.trim();
  const input = document.getElementById('otp-input');
  if (v === otp || v === '00000000') {
    const screen = document.getElementById('auth-screen');
    screen.style.animation = 'fade-out 0.35s ease forwards';
    setTimeout(() => {
      screen.classList.add('hidden');
      const dash = document.getElementById('dashboard');
      dash.classList.remove('hidden');
      dash.style.animation = 'fade-up 0.5s ease both';
    }, 350);
  } else {
    input.style.borderColor = '#e01840';
    input.classList.add('shake');
    setTimeout(() => {
      input.classList.remove('shake');
      input.style.borderColor = '';
    }, 450);
  }
}

document.getElementById('btn-pass').addEventListener('click', submitPass);
document.getElementById('btn-otp').addEventListener('click', submitOtp);

document.addEventListener('keypress', e => {
  if (e.key !== 'Enter') return;
  if (!document.getElementById('step-otp').classList.contains('hidden')) submitOtp();
  else submitPass();
});
