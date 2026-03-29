// ========================================
// Mobile navigation toggle
// ========================================

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    mainNav.classList.toggle("active");
  });
}

// ========================================
// Idea reactions: Agree / Disagree
// Save selection in localStorage
// ========================================

const ideaCards = document.querySelectorAll(".idea-card[data-idea-id]");

ideaCards.forEach((card) => {
  const ideaId = card.dataset.ideaId;
  const buttons = card.querySelectorAll(".idea-actions button");

  if (!ideaId || buttons.length === 0) return;

  const savedReaction = localStorage.getItem(`idea-reaction-${ideaId}`);

  if (savedReaction) {
    const savedButton = card.querySelector(
      `.idea-actions button[data-action="${savedReaction}"]`
    );

    if (savedButton) {
      savedButton.classList.add("active");
    }
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;

      if (action !== "agree" && action !== "disagree") return;

      buttons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      localStorage.setItem(`idea-reaction-${ideaId}`, action);
    });
  });
});

// ========================================
// Copy quote button
// ========================================

const copyQuoteButtons = document.querySelectorAll(".copy-quote-btn");

copyQuoteButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const quoteCard = button.closest(".quote-card");
    const quoteTextElement = quoteCard?.querySelector("blockquote p");

    if (!quoteTextElement) return;

    const quoteText = quoteTextElement.innerText.trim();

    try {
      await navigator.clipboard.writeText(quoteText);

      const originalText = button.textContent;
      button.textContent = "تم النسخ";
      button.classList.add("copied");

      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove("copied");
      }, 1500);
    } catch (error) {
      console.error("Failed to copy quote:", error);
    }
  });
});

// ========================================
// Get or create a local session ID
// ========================================

function getSessionId() {
  let sessionId = localStorage.getItem("qabas-session-id");

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("qabas-session-id", sessionId);
  }

  return sessionId;
}