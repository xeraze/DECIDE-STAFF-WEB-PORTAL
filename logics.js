const loginScreen = document.getElementById('auth-screen');
const loadingScreen = document.getElementById('loading-screen');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('login-form');
const loginPassword = document.getElementById('login-password');
const errorMsg = document.getElementById('error-msg');
const loadingProgressFill = document.getElementById('loading-progress-fill');

const VALID_PASSWORD = 'DECIDE2026';

const scrollTopBtn = document.createElement('div');
scrollTopBtn.id = 'scroll-top';
scrollTopBtn.setAttribute('role', 'button');
scrollTopBtn.setAttribute('aria-label', 'Вернуться наверх');
scrollTopBtn.tabIndex = 0;
scrollTopBtn.style.cssText = `
  display: none;
  position: fixed;
  right: 32px;
  bottom: 48px;
  width: 48px;
  height: 48px;
  background-color: #c3183f;
  border-radius: 50%;
  box-shadow: 0 0 22px rgba(195,24,60,0.7);
  color: white;
  cursor: pointer;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  transition: background 0.3s ease;
`;
scrollTopBtn.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="3"
  viewBox="0 0 24 24" width="24" height="24" stroke-linecap="round" stroke-linejoin="round">
    <path d="M5 15l7-7 7 7"/>
  </svg>`;

document.body.appendChild(scrollTopBtn);

function showScreen(name) {
  loginScreen.style.display = (name === 'auth') ? 'flex' : 'none';
  loadingScreen.classList.toggle('active', name === 'loading');
  dashboard.classList.toggle('active', name === 'dashboard');
  dashboard.style.display = (name === 'dashboard') ? 'flex' : 'none';
  toggleScrollTopBtn(name === 'dashboard');
}

function toggleScrollTopBtn(show) {
  scrollTopBtn.style.display = show ? 'flex' : 'none';
  scrollTopBtn.style.opacity = '0';
  if (show) {
    setTimeout(() => {
      scrollTopBtn.style.opacity = '1';
    }, 100);
  }
}

function showError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.add('visible');
}

function clearError() {
  errorMsg.textContent = '';
  errorMsg.classList.remove('visible');
}

function simulateLoading(callback) {
  let progress = 0;
  loadingProgressFill.style.width = '0%';

  const intervalId = setInterval(() => {
    progress += Math.floor(Math.random() * 10) + 5;
    if (progress > 100) progress = 100;
    loadingProgressFill.style.width = progress + '%';

    if (progress >= 100) {
      clearInterval(intervalId);
      setTimeout(() => {
        callback();
      }, 600);
    }
  }, 250);
}

function isSessionLoggedIn() {
  return sessionStorage.getItem('decide_logged_in') === 'true';
}

function setSessionLoggedIn() {
  sessionStorage.setItem('decide_logged_in', 'true');
}

function logOut() {
  sessionStorage.removeItem('decide_logged_in');
  showScreen('auth');
  clearError();
  loginPassword.value = '';
  loginPassword.focus();
}

loginForm.addEventListener('submit', e => {
  e.preventDefault();
  clearError();
  const val = loginPassword.value.trim();

  if (!val) {
    showError('Пожалуйста, введите пароль.');
    loginPassword.focus();
    return;
  }
  if (val !== VALID_PASSWORD) {
    showError('Неверный пароль.');
    loginPassword.focus();
    return;
  }

  setSessionLoggedIn();
  showScreen('loading');
  simulateLoading(() => {
    showScreen('dashboard');
    setupDashboard();
  });
});

function setupDashboard() {
  const portalContent = dashboard.querySelector('.portal-content');

  portalContent.addEventListener('scroll', () => {
    if (portalContent.scrollTop > 100) {
      scrollTopBtn.style.opacity = '1';
      scrollTopBtn.style.pointerEvents = 'auto';
    } else {
      scrollTopBtn.style.opacity = '0';
      scrollTopBtn.style.pointerEvents = 'none';
    }
  });

  dashboard.focus();
}

scrollTopBtn.addEventListener('click', () => {
  const portalContent = dashboard.querySelector('.portal-content');
  if (portalContent) {
    portalContent.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

scrollTopBtn.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    scrollTopBtn.click();
  }
});

const modalBackdrop = document.createElement('div');
modalBackdrop.classList.add('modal-backdrop');
modalBackdrop.tabIndex = -1;
modalBackdrop.style.display = 'none';
modalBackdrop.innerHTML = `
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-desc" tabindex="0">
    <button class="close-btn" aria-label="Закрыть">&times;</button>
    <h4 id="modal-title">Пример модального окна</h4>
    <p id="modal-desc">Здесь отображается дополнительная информация.</p>
  </div>
`;
document.body.appendChild(modalBackdrop);

const modalCloseBtn = modalBackdrop.querySelector('.close-btn');

function openModal(title = 'Заголовок', content = 'Текст модального окна') {
  modalBackdrop.querySelector('#modal-title').textContent = title;
  modalBackdrop.querySelector('#modal-desc').textContent = content;
  modalBackdrop.style.display = 'flex';
  modalBackdrop.querySelector('.modal').focus();
}

function closeModal() {
  modalBackdrop.style.display = 'none';
}

modalCloseBtn.addEventListener('click', closeModal);

modalBackdrop.addEventListener('click', e => {
  if (e.target === modalBackdrop) closeModal();
});

document.addEventListener('keydown', e => {
  if ((e.key === 'Escape' || e.key === 'Esc') && modalBackdrop.style.display === 'flex') {
    closeModal();
  }
});

window.addEventListener('DOMContentLoaded', () => {
  if (isSessionLoggedIn()) {
    showScreen('dashboard');
    setupDashboard();
  } else {
    showScreen('auth');
    loginPassword.focus();
  }
});
