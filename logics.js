(function () {
  "use strict";

  const CONFIG = {
    SESSION_KEY: "decide_portal_session",
    SAKURA_COUNT: 28,
    STAR_COUNT: 120,
    TOAST_DURATION: 5000,
    AUTH_START_DELAY: 700,
    LOGIN_PREFIXES: ["Yonex", "Phoenix", "Decide", "Staff", "Core", "Nova", "Raven", "Sakura"],
    PASSWORD_LENGTH: 14,
  };

  const IconSet = {
    home: '<svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M4 10.5L12 4l8 6.5V19a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-8.5z" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/></svg>',
    book: '<svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M5 19.5A2.5 2.5 0 0 1 7.5 17H19V5H7.5A2.5 2.5 0 0 0 5 7.5v12z" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/><path d="M5 7.5A2.5 2.5 0 0 1 7.5 5H19v12H7.5A2.5 2.5 0 0 0 5 19.5" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/></svg>',
    clipboard: '<svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="8" y="2" width="8" height="4" rx="1" stroke="currentColor" stroke-width="1.75"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/><path d="M9 12h6M9 16h6" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>',
    success: '<svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.75"/><path d="M8 12.5l2.5 2.5L16 9.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    error: '<svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.75"/><path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>',
    warning: '<svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 4.5L20.5 19H3.5L12 4.5z" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/><path d="M12 10v4M12 17h.01" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>',
    info: '<svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.75"/><path d="M12 11v5M12 8h.01" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>',
    close: '<svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>',
    logout: '<svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M10 7V5a1 1 0 0 1 1-1h8v16h-8a1 1 0 0 1-1-1v-2" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/><path d="M13 12H4m0 0l3-3M4 12l3 3" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };

  const IconModule = {
    get(name) {
      return IconSet[name] || IconSet.info;
    },

    init() {
      document.querySelectorAll("[data-icon]").forEach((el) => {
        const name = el.dataset.icon;
        if (IconSet[name]) {
          el.innerHTML = IconSet[name];
        }
      });
    },
  };

  const Utils = {
    
    $(selector, context = document) {
      return context.querySelector(selector);
    },

    
    $$(selector, context = document) {
      return context.querySelectorAll(selector);
    },

    
    randomBetween(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    randomItem(list) {
      return list[Utils.randomBetween(0, list.length - 1)];
    },

    generateLogin() {
      const prefix = Utils.randomItem(CONFIG.LOGIN_PREFIXES);
      const suffix = Utils.randomBetween(1000, 9999);
      return `${prefix}_${suffix}`;
    },
  };

  
  const SessionManager = {
    
    save(sessionData) {
      const payload = {
        ...sessionData,
        authenticatedAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };
      try {
        localStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(payload));
      } catch (error) {
        console.warn("[Decide] Не удалось сохранить сессию:", error);
      }
    },

    
    load() {
      try {
        const raw = localStorage.getItem(CONFIG.SESSION_KEY);
        if (!raw) return null;

        const session = JSON.parse(raw);

        if (session.expiresAt && Date.now() > session.expiresAt) {
          this.clear();
          return null;
        }

        return session;
      } catch (error) {
        console.warn("[Decide] Ошибка чтения сессии:", error);
        return null;
      }
    },

    
    isAuthenticated() {
      return this.load() !== null;
    },

    
    clear() {
      try {
        localStorage.removeItem(CONFIG.SESSION_KEY);
      } catch (error) {
        console.warn("[Decide] Не удалось очистить сессию:", error);
      }
    },
  };

  
  const ToastManager = {
    container: null,

    
    init() {
      if (this.container) return;

      this.container = document.createElement("div");
      this.container.className = "toast-container";
      this.container.setAttribute("role", "region");
      this.container.setAttribute("aria-label", "Уведомления");
      document.body.appendChild(this.container);
    },

    
    show({ type = "info", title, message, duration = CONFIG.TOAST_DURATION }) {
      this.init();

      const toast = document.createElement("div");
      toast.className = `toast toast--${type}`;
      toast.setAttribute("role", "alert");
      toast.innerHTML = `
        <span class="toast__icon" aria-hidden="true">${IconModule.get(type)}</span>
        <div class="toast__content">
          <div class="toast__title">${title}</div>
          ${message ? `<div class="toast__message">${message}</div>` : ""}
        </div>
        <button class="toast__close" type="button" aria-label="Закрыть уведомление">${IconModule.get("close")}</button>
      `;

      const closeBtn = toast.querySelector(".toast__close");
      const remove = () => {
        toast.classList.add("toast--exiting");
        toast.addEventListener("animationend", () => toast.remove(), { once: true });
      };

      closeBtn.addEventListener("click", remove);
      this.container.appendChild(toast);

      if (duration > 0) {
        setTimeout(remove, duration);
      }
    },
  };

  
  const ModalManager = {
    overlay: null,
    previousFocus: null,

    
    init() {
      if (this.overlay) return;

      this.overlay = document.createElement("div");
      this.overlay.className = "modal-overlay";
      this.overlay.setAttribute("role", "dialog");
      this.overlay.setAttribute("aria-modal", "true");
      this.overlay.setAttribute("aria-hidden", "true");
      this.overlay.innerHTML = `
        <div class="modal">
          <div class="modal__header">
            <h2 class="modal__title" id="modal-title"></h2>
            <button class="modal__close" type="button" aria-label="Закрыть окно">${IconModule.get("close")}</button>
          </div>
          <div class="modal__body" id="modal-body"></div>
          <div class="modal__footer" id="modal-footer"></div>
        </div>
      `;

      document.body.appendChild(this.overlay);

      this.overlay.querySelector(".modal__close").addEventListener("click", () => {
        this.close();
      });

      this.overlay.addEventListener("click", (event) => {
        if (event.target === this.overlay) {
          this.close();
        }
      });

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && this.overlay.classList.contains("modal-overlay--visible")) {
          this.close();
        }
      });
    },

    
    open({ title, body, buttons = [] }) {
      this.init();
      this.previousFocus = document.activeElement;

      const titleEl = Utils.$("#modal-title", this.overlay);
      const bodyEl = Utils.$("#modal-body", this.overlay);
      const footerEl = Utils.$("#modal-footer", this.overlay);

      titleEl.textContent = title;
      bodyEl.innerHTML = body;
      footerEl.innerHTML = "";

      buttons.forEach((btn) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = btn.primary ? "btn-primary" : "btn-secondary";
        button.textContent = btn.label;
        button.addEventListener("click", () => {
          if (btn.onClick) btn.onClick();
          if (btn.close !== false) this.close();
        });
        footerEl.appendChild(button);
      });

      this.overlay.classList.add("modal-overlay--visible");
      this.overlay.setAttribute("aria-hidden", "false");

      const focusTarget = footerEl.querySelector("button") || Utils.$(".modal__close", this.overlay);
      focusTarget?.focus();
    },

    
    close() {
      if (!this.overlay) return;

      this.overlay.classList.remove("modal-overlay--visible");
      this.overlay.setAttribute("aria-hidden", "true");

      if (this.previousFocus && typeof this.previousFocus.focus === "function") {
        this.previousFocus.focus();
      }
    },
  };

  
  const StarsBackground = {
    
    init() {
      const existing = Utils.$(".stars-container");
      if (existing) return;

      const container = document.createElement("div");
      container.className = "stars-container";
      container.setAttribute("aria-hidden", "true");

      for (let i = 0; i < CONFIG.STAR_COUNT; i++) {
        const star = document.createElement("div");
        const isBright = Math.random() > 0.85;

        star.className = `star-particle${isBright ? " star-particle--bright" : ""}`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.setProperty("--flicker-duration", `${Utils.randomBetween(3, 7)}s`);
        star.style.setProperty("--flicker-delay", `${Math.random() * 5}s`);

        container.appendChild(star);
      }

      document.body.insertBefore(container, document.body.firstChild);

      const grid = document.createElement("div");
      grid.className = "bg-grid-overlay";
      grid.setAttribute("aria-hidden", "true");
      document.body.insertBefore(grid, document.body.firstChild.nextSibling);

      const glow = document.createElement("div");
      glow.className = "bg-radial-glow";
      glow.setAttribute("aria-hidden", "true");
      document.body.insertBefore(glow, document.body.firstChild.nextSibling?.nextSibling);
    },
  };

  const SakuraBackground = {
    initialized: false,

    init() {
      if (this.initialized || Utils.$(".sakura-container")) return;

      const container = document.createElement("div");
      container.className = "sakura-container";
      container.setAttribute("aria-hidden", "true");

      for (let i = 0; i < CONFIG.SAKURA_COUNT; i++) {
        const petal = document.createElement("div");
        petal.className = "sakura-petal";
        petal.style.left = `${Math.random() * 100}%`;
        petal.style.setProperty("--fall-duration", `${Utils.randomBetween(6, 14)}s`);
        petal.style.setProperty("--fall-delay", `${Math.random() * 8}s`);
        petal.style.setProperty("--drift", `${Utils.randomBetween(-60, 60)}px`);
        petal.style.width = `${Utils.randomBetween(8, 14)}px`;
        petal.style.height = petal.style.width;
        container.appendChild(petal);
      }

      document.body.appendChild(container);
      this.initialized = true;
    },
  };

  const CinematicLoader = {
    async typeIntoField(fieldEl, text, speed = 85) {
      if (!fieldEl) return;

      const cursor = fieldEl.querySelector(".auth-cinematic__cursor");
      fieldEl.classList.add("auth-cinematic__input--typing");
      if (cursor) cursor.classList.remove("auth-cinematic__cursor--hidden");

      let displayed = "";
      const textNode = document.createTextNode("");
      fieldEl.insertBefore(textNode, cursor);

      for (const char of text) {
        displayed += char;
        textNode.textContent = displayed;
        await delay(speed);
      }

      fieldEl.classList.remove("auth-cinematic__input--typing");
      if (cursor) cursor.classList.add("auth-cinematic__cursor--hidden");
    },

    async typeEncryptedPassword(fieldEl, length, speed = 70) {
      if (!fieldEl) return;

      const cursor = fieldEl.querySelector(".auth-cinematic__cursor");
      const hexChars = "0123456789abcdef";
      fieldEl.classList.add("auth-cinematic__input--typing");
      if (cursor) cursor.classList.remove("auth-cinematic__cursor--hidden");

      let displayed = "";
      const textNode = document.createTextNode("");
      fieldEl.insertBefore(textNode, cursor);

      for (let i = 0; i < length; i++) {
        const flash = hexChars[Utils.randomBetween(0, hexChars.length - 1)];
        displayed += flash;
        textNode.textContent = displayed;
        await delay(speed * 0.55);
        displayed = `${displayed.slice(0, -1)}•`;
        textNode.textContent = displayed;
        await delay(speed * 0.45);
      }

      fieldEl.classList.remove("auth-cinematic__input--typing");
      if (cursor) cursor.classList.add("auth-cinematic__cursor--hidden");
    },

    reset() {
      const form = Utils.$("#cinematic-form");
      const phase = Utils.$("#cinematic-phase");
      const loginEl = Utils.$("#cinematic-login");
      const passwordEl = Utils.$("#cinematic-password");
      const btn = Utils.$("#cinematic-btn");

      form?.classList.remove("auth-cinematic__card--exit");
      if (form) form.hidden = false;
      if (phase) phase.hidden = true;

      [loginEl, passwordEl].forEach((el) => {
        if (!el) return;
        el.classList.remove("auth-cinematic__input--typing");
        el.innerHTML = '<span class="auth-cinematic__cursor" aria-hidden="true"></span>';
      });

      if (btn) {
        btn.disabled = true;
        btn.classList.remove("auth-cinematic__btn--press", "auth-cinematic__btn--success");
        btn.textContent = "Войти в портал";
      }
    },

    async play(credentials) {
      this.reset();

      const form = Utils.$("#cinematic-form");
      const phase = Utils.$("#cinematic-phase");
      const loginEl = Utils.$("#cinematic-login");
      const passwordEl = Utils.$("#cinematic-password");
      const btn = Utils.$("#cinematic-btn");
      const status = Utils.$("#cinematic-status");

      await this.typeIntoField(loginEl, credentials.login, 68);
      await delay(280);
      await this.typeEncryptedPassword(passwordEl, CONFIG.PASSWORD_LENGTH, 65);
      await delay(380);

      if (btn) {
        btn.disabled = false;
        await delay(220);
        btn.classList.add("auth-cinematic__btn--press");
        await delay(200);
        btn.classList.remove("auth-cinematic__btn--press");
        btn.classList.add("auth-cinematic__btn--success");
        btn.textContent = "Вход выполнен";
        await delay(480);
      }

      form?.classList.add("auth-cinematic__card--exit");
      await delay(520);

      if (form) form.hidden = true;
      if (phase) phase.hidden = false;

      const steps = [
        "Проверка доступа…",
        "Расшифровка сессии…",
        "Подключение к порталу Decide…",
        "Загрузка сакурной среды…",
        "Открытие веб-портала…",
      ];

      for (const step of steps) {
        if (status) status.textContent = step;
        await delay(750);
      }
    },
  };

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const AuthModule = {
    isRunning: false,

    init() {
      if (!Utils.$("#auth-screen")) return;

      const logoutBtn = Utils.$("#logout-btn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => this.handleLogout());
      }

      if (SessionManager.isAuthenticated()) {
        this.showDashboard(SessionManager.load());
      } else {
        this.showScreen("auth");
        setTimeout(() => this.startAutoAuth(), CONFIG.AUTH_START_DELAY);
      }
    },

    buildSession(login) {
      const displayName = login.split("_")[0];
      return {
        userId: login,
        displayName,
        role: "Staff",
      };
    },

    async startAutoAuth() {
      if (this.isRunning) return;
      this.isRunning = true;

      const login = Utils.generateLogin();
      const credentials = { login };

      this.showScreen("auth");
      this.announceToScreenReader("Автоматическая авторизация в портале Decide.");

      await CinematicLoader.play(credentials);

      const session = this.buildSession(login);
      SessionManager.save(session);
      this.announceToScreenReader("Портал Decide открыт.");
      this.showDashboard(session);

      this.isRunning = false;
    },

    showDashboard(session) {
      SakuraBackground.init();
      this.showScreen("dashboard");
      this.updateHeaderForAuth(true);

      const greetingEl = Utils.$("#dashboard-greeting-name");
      if (greetingEl && session?.displayName) {
        greetingEl.textContent = session.displayName;
      }

      const roleEl = Utils.$("#dashboard-user-role");
      if (roleEl && session?.role) {
        roleEl.textContent = session.role;
      }
    },

    
    handleLogout() {
      ModalManager.open({
        title: "Выход из портала",
        body: "<p>Завершить сессию и вернуться к экрану авторизации?</p>",
        buttons: [
          { label: "Отмена", close: true },
          {
            label: "Выйти",
            primary: true,
            onClick: () => {
              SessionManager.clear();
              CinematicLoader.reset();
              this.showScreen("auth");
              this.updateHeaderForAuth(false);

              ToastManager.show({
                type: "info",
                title: "Сессия завершена",
                message: "Вы вышли из портала Decide.",
              });

              this.announceToScreenReader("Вы вышли из портала.");
              setTimeout(() => this.startAutoAuth(), CONFIG.AUTH_START_DELAY);
            },
          },
        ],
      });
    },

    
    showScreen(screenName) {
      const screens = Utils.$$(".screen");
      screens.forEach((screen) => {
        const isTarget = screen.dataset.screen === screenName;
        screen.classList.toggle("screen--active", isTarget);
        screen.setAttribute("aria-hidden", isTarget ? "false" : "true");
      });
    },

    
    updateHeaderForAuth(isAuthenticated) {
      const header = Utils.$(".site-header");
      const logoutBtn = Utils.$("#logout-btn");

      if (header) {
        header.classList.toggle("site-header--auth-only", !isAuthenticated);
      }

      if (logoutBtn) {
        logoutBtn.classList.toggle("hidden", !isAuthenticated);
      }
    },

    
    announceToScreenReader(message) {
      const liveRegion = Utils.$("#live-region");
      if (liveRegion) {
        liveRegion.textContent = "";
        requestAnimationFrame(() => {
          liveRegion.textContent = message;
        });
      }
    },

    
  };

  
  const PageGuard = {
    
    init() {
      const isProtectedPage = document.body.dataset.page === "protected";
      if (!isProtectedPage) return;

      if (!SessionManager.isAuthenticated()) {
        window.location.href = "index.html";
        return;
      }

      const session = SessionManager.load();
      this.updateHeader(session);
      this.bindLogout();
    },

    
    updateHeader(session) {
      const logoutBtn = Utils.$("#logout-btn");
      if (logoutBtn) {
        logoutBtn.classList.remove("hidden");
        logoutBtn.addEventListener("click", () => {
          ModalManager.open({
            title: "Выход из портала",
            body: "<p>Завершить текущую сессию и вернуться на страницу входа?</p>",
            buttons: [
              { label: "Отмена", close: true },
              {
                label: "Выйти",
                primary: true,
                onClick: () => {
                  SessionManager.clear();
                  window.location.href = "index.html";
                },
              },
            ],
          });
        });
      }
    },

  
    bindLogout() {
      
    },
  };

  
  const ManualModule = {
    init() {
      const tocLinks = Utils.$$(".manual-toc__link");
      const roleCards = Utils.$$(".role-card");

      if (!tocLinks.length || !roleCards.length) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.id;
              tocLinks.forEach((link) => {
                link.classList.toggle(
                  "manual-toc__link--active",
                  link.getAttribute("href") === `#${id}`
                );
              });
            }
          });
        },
        { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
      );

      roleCards.forEach((card) => observer.observe(card));

      tocLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
          event.preventDefault();
          const targetId = link.getAttribute("href").slice(1);
          const target = document.getElementById(targetId);
          if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
            history.replaceState(null, "", `#${targetId}`);
          }
        });
      });
    },
  };

  
  const RulesModule = {
    init() {
      const triggers = Utils.$$(".tooltip-trigger");
      if (!triggers.length) return;

      triggers.forEach((trigger) => {
        trigger.addEventListener("click", (event) => {
          event.stopPropagation();
          const isOpen = trigger.classList.contains("tooltip-trigger--open");
          triggers.forEach((t) => t.classList.remove("tooltip-trigger--open"));
          if (!isOpen) {
            trigger.classList.add("tooltip-trigger--open");
          }
        });

        trigger.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            trigger.click();
          }
        });
      });

      document.addEventListener("click", () => {
        triggers.forEach((t) => t.classList.remove("tooltip-trigger--open"));
      });

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          triggers.forEach((t) => t.classList.remove("tooltip-trigger--open"));
        }
      });
    },
  };

  
  const NavigationModule = {
    init() {
      const currentPage = document.body.dataset.currentPage;
      if (!currentPage) return;

      const navLinks = Utils.$$(".site-nav__link");
      navLinks.forEach((link) => {
        const linkPage = link.dataset.page;
        link.classList.toggle("site-nav__link--active", linkPage === currentPage);
        if (linkPage === currentPage) {
          link.setAttribute("aria-current", "page");
        }
      });
    },
  };

  
  function initPortal() {
    IconModule.init();
    StarsBackground.init();
    if (SessionManager.isAuthenticated()) {
      SakuraBackground.init();
    }
    ToastManager.init();
    ModalManager.init();
    NavigationModule.init();
    PageGuard.init();
    AuthModule.init();
    ManualModule.init();
    RulesModule.init();

    console.info(
      "%c Decide Web Portal %c v1.0 ",
      "background:#e8192c;color:#fff;padding:2px 6px;border-radius:3px;",
      "color:#a8a8b8;"
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPortal);
  } else {
    initPortal();
  }

  window.DecidePortal = {
    CONFIG,
    SessionManager,
    ToastManager,
    ModalManager,
    AuthModule,
    CinematicLoader,
    SakuraBackground,
    IconModule,
    IconSet,
  };
})();
