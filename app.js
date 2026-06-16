const VALID_CODES = ["BRASIL2026", "LINGUASAT", "VIAGEM"];
const ACCESS_KEY = "vab-access";
const PROGRESS_KEY = "vab-progress";

const DESTINATIONS = [
  {
    id: "aeroporto",
    emoji: "✈️",
    name: "Aeroporto",
    subtitle: "Llegada a São Paulo",
    desc: "Vocabulario de viaje, saludos y trámites en inmigración.",
    file: "aeroporto.html"
  },
  {
    id: "saopaulo",
    emoji: "🏙️",
    name: "São Paulo",
    subtitle: "Negocios y reuniones",
    desc: "Vocabulario empresarial, citas y comunicación profesional.",
    file: "saopaulo.html"
  },
  {
    id: "restaurante",
    emoji: "🍽️",
    name: "Restaurante",
    subtitle: "Gastronomía brasileña",
    desc: "Pedir comida, preguntar ingredientes y cultura gastronómica.",
    file: "restaurante.html"
  },
  {
    id: "reuniao",
    emoji: "🤝",
    name: "Reunião de Negócios",
    subtitle: "Lenguaje profesional",
    desc: "Negociaciones, presentaciones y vocabulario corporativo.",
    file: "reuniao.html"
  },
  {
    id: "rio",
    emoji: "🏖️",
    name: "Rio de Janeiro",
    subtitle: "Cultura y ocio",
    desc: "Conversación informal, turismo y vida carioca.",
    file: "rio.html"
  },
  {
    id: "mercado",
    emoji: "🛒",
    name: "Mercado",
    subtitle: "Compras y transacciones",
    desc: "Números, precios, regateo y vocabulario de comercio.",
    file: "mercado.html"
  }
];

function isAuthenticated() {
  return !!localStorage.getItem(ACCESS_KEY);
}

function authenticate(code) {
  if (VALID_CODES.includes(code.toUpperCase().trim())) {
    localStorage.setItem(ACCESS_KEY, "1");
    return true;
  }
  return false;
}

function logout() {
  localStorage.removeItem(ACCESS_KEY);
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

function countDone(progress) {
  return DESTINATIONS.filter(d => progress[d.id]).length;
}

function isUnlocked(index, progress) {
  if (index === 0) return true;
  return !!progress[DESTINATIONS[index - 1].id];
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
  const grid = document.getElementById("destinations-grid");

  if (!gate) return;

  if (!isAuthenticated()) {
    gate.style.display = "flex";
  } else {
    gate.style.display = "none";
    renderDestinations();
  }

  codeForm.addEventListener("submit", e => {
    e.preventDefault();
    const val = codeInput.value;
    if (authenticate(val)) {
      gate.style.display = "none";
      renderDestinations();
    } else {
      codeInput.classList.add("error");
      codeError.textContent = "Código incorrecto. Inténtalo de nuevo.";
      setTimeout(() => codeInput.classList.remove("error"), 600);
    }
  });

  if (logoutBtn) logoutBtn.addEventListener("click", logout);

  function renderDestinations() {
    const progress = getProgress();
    const done = countDone(progress);
    const pct = Math.round((done / DESTINATIONS.length) * 100);

    if (progressBar) progressBar.style.width = pct + "%";
    if (progressText) progressText.textContent = `${done}/${DESTINATIONS.length} destinos`;

    grid.innerHTML = "";

    DESTINATIONS.forEach((dest, i) => {
      const isDone = !!progress[dest.id];
      const unlocked = isUnlocked(i, progress);

      const card = document.createElement("div");
      card.className = "dest-card" + (isDone ? " done" : "") + (!unlocked ? " locked" : "");

      let badge;
      if (isDone) {
        badge = `<span class="badge done-badge">✓ Completado</span>`;
      } else if (unlocked) {
        badge = `<a class="badge start-badge" href="${dest.file}">Empezar →</a>`;
      } else {
        badge = `<span class="badge locked-badge">🔒 Bloqueado</span>`;
      }

      card.innerHTML = `
        <div class="dest-number">Destino ${i + 1}</div>
        <div class="dest-emoji">${dest.emoji}</div>
        <div class="dest-info">
          <h3>${dest.name}</h3>
          <p class="dest-subtitle">${dest.subtitle}</p>
          <p class="dest-desc">${dest.desc}</p>
        </div>
        <div class="dest-status">${badge}</div>
      `;

      grid.appendChild(card);
    });
  }
}

// ── LESSON PAGE ──────────────────────────────────────────
function initLesson(lessonId) {
  if (!isAuthenticated()) {
    window.location.href = "index.html";
    return;
  }
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
