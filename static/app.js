/**
 * Quiz Generator – Flash Card UI
 * Handles category selection, API calls, and flash card navigation.
 */

const CATEGORY_META = {
  science:   { icon: "\u{1F52C}", label: "Science" },
  art:       { icon: "\u{1F3A8}", label: "Art" },
  geography: { icon: "\u{1F30D}", label: "Geography" },
};

// ── State ──
let selectedCategory = null;
let currentCardIndex = 0;
let quizQuestions = [];
let currentCategoryClass = "";

// ── DOM Refs ──
const selectView      = document.getElementById("select-view");
const loadingView     = document.getElementById("loading-view");
const quizView        = document.getElementById("quiz-view");
const categoryCards   = document.querySelectorAll(".category-card");
const generateBtn     = document.getElementById("generate-btn");
const backBtn         = document.getElementById("back-btn");
const quizIcon        = document.getElementById("quiz-icon");
const quizTitle       = document.getElementById("quiz-title");
const quizCount       = document.getElementById("quiz-count");
const rawToggleBtn    = document.getElementById("raw-toggle-btn");
const rawResponse     = document.getElementById("raw-response");
const rawPre          = document.getElementById("raw-pre");
const loadingCategory = document.getElementById("loading-category");

// Flash card refs
const flashcardViewport = document.getElementById("flashcard-viewport");
const flashcardDots     = document.getElementById("flashcard-dots");
const flashcardCounter  = document.getElementById("flashcard-counter");
const prevBtn           = document.getElementById("nav-prev");
const nextBtn           = document.getElementById("nav-next");

// ══════════════════════════════════════════════
//  CATEGORY SELECTION
// ══════════════════════════════════════════════

categoryCards.forEach((card) => {
  card.addEventListener("click", () => {
    const cat = card.dataset.category;

    if (selectedCategory === cat) {
      selectedCategory = null;
      card.classList.remove("selected");
      card.setAttribute("aria-pressed", "false");
    } else {
      categoryCards.forEach((c) => {
        c.classList.remove("selected");
        c.setAttribute("aria-pressed", "false");
      });
      card.classList.add("selected");
      card.setAttribute("aria-pressed", "true");
      selectedCategory = cat;
    }

    generateBtn.disabled = !selectedCategory;
  });

  // Keyboard support
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      card.click();
    }
  });
});

// ══════════════════════════════════════════════
//  GENERATE QUIZ
// ══════════════════════════════════════════════

generateBtn.addEventListener("click", async () => {
  if (!selectedCategory) return;

  showView("loading");
  loadingCategory.textContent = CATEGORY_META[selectedCategory].label;

  try {
    const res = await fetch("/api/generate-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: selectedCategory }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || "Something went wrong.");
      return;
    }

    renderQuiz(data);
  } catch (err) {
    showError("Could not reach the server. Is Ollama running?");
  }
});

// ══════════════════════════════════════════════
//  BACK / RAW TOGGLE
// ══════════════════════════════════════════════

backBtn.addEventListener("click", () => {
  showView("select");
  rawResponse.classList.remove("visible");
});

rawToggleBtn.addEventListener("click", () => {
  rawResponse.classList.toggle("visible");
  rawToggleBtn.textContent = rawResponse.classList.contains("visible")
    ? "\u25B2 Hide raw response"
    : "\u25BC Show raw response";
});

// ══════════════════════════════════════════════
//  VIEW MANAGEMENT
// ══════════════════════════════════════════════

function showView(name) {
  selectView.classList.remove("active");
  loadingView.classList.remove("active");
  quizView.classList.remove("active");

  const target =
    name === "select" ? selectView :
    name === "loading" ? loadingView : quizView;

  requestAnimationFrame(() => target.classList.add("active"));
}

// ══════════════════════════════════════════════
//  RENDER QUIZ → FLASH CARDS
// ══════════════════════════════════════════════

function renderQuiz(data) {
  const meta = CATEGORY_META[data.category] || { icon: "\u2753", label: data.category };
  quizQuestions = data.questions || [];
  currentCategoryClass = data.category;
  currentCardIndex = 0;

  quizIcon.textContent = meta.icon;
  quizTitle.textContent = `${meta.label} Quiz`;
  quizCount.textContent = `${quizQuestions.length} question${quizQuestions.length !== 1 ? "s" : ""} generated`;

  // Raw response
  rawPre.textContent = data.raw || "";
  rawToggleBtn.textContent = "\u25BC Show raw response";
  rawResponse.classList.remove("visible");

  // Category color on dots container
  flashcardDots.className = "flashcard-dots " + data.category;

  if (quizQuestions.length === 0) {
    showRefusal(data.raw);
    return;
  }

  // Build dots
  flashcardDots.innerHTML = "";
  quizQuestions.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "flashcard-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", `Go to question ${i + 1}`);
    dot.addEventListener("click", () => goToCard(i));
    flashcardDots.appendChild(dot);
  });

  showCard(0, "none");
  showView("quiz");
}

// ══════════════════════════════════════════════
//  FLASH CARD NAVIGATION
// ══════════════════════════════════════════════

function showCard(index, direction) {
  if (index < 0 || index >= quizQuestions.length) return;

  const q = quizQuestions[index];
  const animClass =
    direction === "next" ? "flashcard--enter" :
    direction === "prev" ? "flashcard--enter-reverse" : "flashcard--enter";

  flashcardViewport.innerHTML = "";

  const card = document.createElement("div");
  card.className = `flashcard glass ${currentCategoryClass} ${animClass}`;
  card.innerHTML = `
    <div class="flashcard__accent"></div>
    <div class="flashcard__number">${String(index + 1).padStart(2, "0")}</div>
    <p class="flashcard__text">${escapeHtml(q)}</p>
  `;

  flashcardViewport.appendChild(card);

  // Update counter
  flashcardCounter.textContent = `${index + 1} / ${quizQuestions.length}`;

  // Update dots
  const dots = flashcardDots.querySelectorAll(".flashcard-dot");
  dots.forEach((d, i) => d.classList.toggle("active", i === index));

  // Update arrows
  prevBtn.disabled = index === 0;
  nextBtn.disabled = index === quizQuestions.length - 1;

  currentCardIndex = index;
}

function goToCard(index) {
  const direction = index > currentCardIndex ? "next" : "prev";
  showCard(index, direction);
}

prevBtn.addEventListener("click", () => {
  if (currentCardIndex > 0) showCard(currentCardIndex - 1, "prev");
});

nextBtn.addEventListener("click", () => {
  if (currentCardIndex < quizQuestions.length - 1) showCard(currentCardIndex + 1, "next");
});

// Keyboard navigation
document.addEventListener("keydown", (e) => {
  if (!quizView.classList.contains("active")) return;
  if (e.key === "ArrowLeft")  prevBtn.click();
  if (e.key === "ArrowRight") nextBtn.click();
});

// ══════════════════════════════════════════════
//  ERROR / REFUSAL
// ══════════════════════════════════════════════

function showRefusal(rawText) {
  flashcardViewport.innerHTML = `
    <div class="error-card">
      <span class="error-card__icon">\u{1F914}</span>
      <p class="error-card__title">No quiz could be generated</p>
      <p class="error-card__message">${escapeHtml(rawText || "The model did not return any quiz questions for this category.")}</p>
    </div>
  `;
  flashcardDots.innerHTML = "";
  flashcardCounter.textContent = "";
  prevBtn.disabled = true;
  nextBtn.disabled = true;
  showView("quiz");
}

function showError(message) {
  quizIcon.textContent = "\u26A0\uFE0F";
  quizTitle.textContent = "Error";
  quizCount.textContent = "";
  flashcardViewport.innerHTML = `
    <div class="error-card">
      <span class="error-card__icon">\u26A0\uFE0F</span>
      <p class="error-card__title">Something went wrong</p>
      <p class="error-card__message">${escapeHtml(message)}</p>
    </div>
  `;
  flashcardDots.innerHTML = "";
  flashcardCounter.textContent = "";
  prevBtn.disabled = true;
  nextBtn.disabled = true;
  rawPre.textContent = "";
  showView("quiz");
}

// ── Helpers ──
function escapeHtml(text) {
  const el = document.createElement("div");
  el.textContent = text;
  return el.innerHTML;
}
