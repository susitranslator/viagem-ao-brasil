const VALID_CODES = ["BRASIL2026", "LINGUASAT", "VIAGEM"];
const TEACHER_CODES = ["PROFESSORA2026"];
const ACCESS_KEY = "vab-access";
const ROLE_KEY = "vab-role";
const PROGRESS_KEY = "vab-progress";

const ETAPAS = [
  { etapa: 1, name: "Chegada ao Brasil", emoji: "🛬" },
  { etapa: 2, name: "As grandes cidades", emoji: "🏙️" }
];

const LESSONS = [
  {
    id: "aeroporto",
    etapa: 1,
    aula: 1,
    emoji: "✈️",
    name: "No aeroporto",
    subtitle: "Aula 1",
    desc: "Vocabulário do aeroporto, saudações e os verbos SER e ESTAR.",
    file: "aeroporto.html",
    ready: true
  },
  {
    id: "imigracao",
    etapa: 1,
    aula: 2,
    emoji: "🛂",
    name: "Na imigração",
    subtitle: "Aula 2",
    desc: "Diálogo com o oficial de imigração e os verbos IR e VIR.",
    file: "imigracao.html",
    ready: true
  },
  {
    id: "hotel",
    etapa: 1,
    aula: 3,
    emoji: "🏨",
    name: "No hotel",
    subtitle: "Aula 3",
    desc: "Vocabulário do quarto de hotel e o verbo TER.",
    file: "hotel.html",
    ready: true
  },
  {
    id: "saopaulo",
    etapa: 2,
    aula: 1,
    emoji: "🏙️",
    name: "São Paulo",
    subtitle: "Aula 4",
    desc: "Pontos turísticos, pratos típicos e curiosidades culturais.",
    file: "saopaulo.html",
    ready: false
  },
  {
    id: "rio",
    etapa: 2,
    aula: 2,
    emoji: "🏖️",
    name: "Rio de Janeiro",
    subtitle: "Aula 5",
    desc: "Pontos turísticos, pratos típicos e curiosidades culturais.",
    file: "rio.html",
    ready: false
  }
];

function isAuthenticated() {
  return !!localStorage.getItem(ACCESS_KEY);
}

function isTeacher() {
  return localStorage.getItem(ROLE_KEY) === "teacher";
}

function authenticate(code) {
  const normalized = code.toUpperCase().trim();
  if (TEACHER_CODES.includes(normalized)) {
    localStorage.setItem(ACCESS_KEY, "1");
    localStorage.setItem(ROLE_KEY, "teacher");
    return true;
  }
  if (VALID_CODES.includes(normalized)) {
    localStorage.setItem(ACCESS_KEY, "1");
    localStorage.setItem(ROLE_KEY, "student");
    return true;
  }
  return false;
}

function logout() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(ROLE_KEY);
  window.location.href = "index.html";
}

function getProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {};
  } catch {
    return {};
  }
}

function setLessonDone(id) {
  const p = getProgress();
  p[id] = true;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
}

function readyLessons() {
  return LESSONS.filter(l => l.ready);
}

function countDone(progress) {
  return readyLessons().filter(l => progress[l.id]).length;
}

function isUnlocked(lesson, progress) {
  if (isTeacher()) return true;
  const ready = readyLessons();
  const index = ready.findIndex(l => l.id === lesson.id);
  if (index <= 0) return true;
  return !!progress[ready[index - 1].id];
}

function injectTeacherBadge() {
  if (!isTeacher()) return;
  const header = document.querySelector(".vab-header, .lesson-header");
  if (!header || header.querySelector(".teacher-badge")) return;
  const badge = document.createElement("span");
  badge.className = "badge teacher-badge";
  badge.textContent = "👩‍🏫 Modo profesor";
  header.insertBefore(badge, header.lastElementChild);
}

// ── INDEX PAGE ───────────────────────────────────────────
function initIndex() {
  const gate = document.getElementById("access-gate");
  const codeInput = document.getElementById("code-input");
  const codeForm = document.getElementById("code-form");
  const codeError = document.getElementById("code-error");
  const logoutBtn = document.getElementById("logout-btn");
  const progressBar = document.getElementById("progress-bar");
  const progressText = document.getElementById("progress-text");
  const container = document.getElementById("etapas-container");

  if (!gate) return;

  if (!isAuthenticated()) {
    gate.style.display = "flex";
  } else {
    gate.style.display = "none";
    injectTeacherBadge();
    renderEtapas();
  }

  codeForm.addEventListener("submit", e => {
    e.preventDefault();
    const val = codeInput.value;
    if (authenticate(val)) {
      gate.style.display = "none";
      injectTeacherBadge();
      renderEtapas();
    } else {
      codeInput.classList.add("error");
      codeError.textContent = "Código incorrecto. Inténtalo de nuevo.";
      setTimeout(() => codeInput.classList.remove("error"), 600);
    }
  });

  if (logoutBtn) logoutBtn.addEventListener("click", logout);

  function renderEtapas() {
    const progress = getProgress();
    const ready = readyLessons();
    const done = countDone(progress);
    const pct = ready.length ? Math.round((done / ready.length) * 100) : 0;

    if (progressBar) progressBar.style.width = pct + "%";
    if (progressText) progressText.textContent = `${done}/${ready.length} aulas`;

    container.innerHTML = "";

    ETAPAS.forEach(etapa => {
      const lessons = LESSONS.filter(l => l.etapa === etapa.etapa);

      const block = document.createElement("section");
      block.className = "etapa-block";
      block.innerHTML = `
        <h2 class="etapa-heading">${etapa.emoji} Etapa ${etapa.etapa}: ${etapa.name}</h2>
        <div class="destinations-grid" data-etapa="${etapa.etapa}"></div>
      `;
      const grid = block.querySelector(".destinations-grid");

      lessons.forEach(lesson => {
        const card = document.createElement("div");

        if (!lesson.ready) {
          card.className = "dest-card locked";
          card.innerHTML = `
            <div class="dest-number">Aula ${lesson.aula}</div>
            <div class="dest-emoji">${lesson.emoji}</div>
            <div class="dest-info">
              <h3>${lesson.name}</h3>
              <p class="dest-subtitle">${lesson.subtitle}</p>
              <p class="dest-desc">${lesson.desc}</p>
            </div>
            <div class="dest-status"><span class="badge locked-badge">🚧 Em construção</span></div>
          `;
          grid.appendChild(card);
          return;
        }

        const isDone = !!progress[lesson.id];
        const unlocked = isUnlocked(lesson, progress);

        card.className = "dest-card" + (isDone ? " done" : "") + (!unlocked ? " locked" : "");

        let badge;
        if (isDone) {
          badge = `<a class="badge done-badge" href="${lesson.file}">✓ Completado · Revisar</a>`;
        } else if (unlocked) {
          badge = `<a class="badge start-badge" href="${lesson.file}">Empezar →</a>`;
        } else {
          badge = `<span class="badge locked-badge">🔒 Bloqueado</span>`;
        }

        card.innerHTML = `
          <div class="dest-number">Aula ${lesson.aula}</div>
          <div class="dest-emoji">${lesson.emoji}</div>
          <div class="dest-info">
            <h3>${lesson.name}</h3>
            <p class="dest-subtitle">${lesson.subtitle}</p>
            <p class="dest-desc">${lesson.desc}</p>
          </div>
          <div class="dest-status">${badge}</div>
        `;

        grid.appendChild(card);
      });

      container.appendChild(block);
    });
  }
}

// ── LESSON PAGE ──────────────────────────────────────────
function initLesson(lessonId) {
  if (!isAuthenticated()) {
    window.location.href = "index.html";
    return;
  }
  injectTeacherBadge();
}

// Check which page we're on and init accordingly
document.addEventListener("DOMContentLoaded", () => {
  const bodyId = document.body.dataset.page;
  if (bodyId === "index") {
    initIndex();
  } else if (bodyId === "lesson") {
    const lessonId = document.body.dataset.lesson;
    initLesson(lessonId);

    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) logoutBtn.addEventListener("click", logout);
  }
});
