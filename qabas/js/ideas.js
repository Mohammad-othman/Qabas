// ========================================
// Load ideas from Supabase
// ========================================

async function loadIdeas() {
  const ideasGrid = document.querySelector(".ideas-grid");
  const featuredIdeaCard = document.querySelector(".featured-idea");

  if (!ideasGrid && !featuredIdeaCard) return;

  try {
    const { data: ideas, error } = await supabaseClient
      .from("ideas")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading ideas:", error);
      return;
    }

    if (!ideas || ideas.length === 0) {
      console.log("No ideas found.");
      return;
    }

    const featuredIdea = ideas.find((idea) => idea.is_featured === true);
    const regularIdeas = ideas.filter((idea) => idea.is_featured !== true);

    // Render featured idea
    if (featuredIdea && featuredIdeaCard) {
      featuredIdeaCard.setAttribute("data-idea-id", featuredIdea.id);

      const featuredText = featuredIdeaCard.querySelector(".idea-text");
      const featuredTags = featuredIdeaCard.querySelector(".idea-tags");

      if (featuredText) {
        featuredText.textContent = featuredIdea.text;
      }

      if (featuredTags) {
        featuredTags.innerHTML = "";
        featuredIdea.tags.forEach((tag) => {
          const span = document.createElement("span");
          span.textContent = tag;
          featuredTags.appendChild(span);
        });
      }
    }

    // Render regular ideas
    if (ideasGrid) {
      ideasGrid.innerHTML = "";

      regularIdeas.forEach((idea) => {
        const article = document.createElement("article");
        article.className = "idea-card";
        article.setAttribute("data-idea-id", idea.id);

        article.innerHTML = `
          <p class="idea-text">${idea.text}</p>

          <div class="idea-tags">
            ${(idea.tags || [])
              .map((tag) => `<span>${tag}</span>`)
              .join("")}
          </div>

          <div class="idea-actions">
            <button class="agree-btn" type="button" data-action="agree">أتفق</button>
            <button class="disagree-btn" type="button" data-action="disagree">أختلف</button>
          </div>

          <div class="idea-comment">
            <p>أضف فكرتك</p>
            <textarea placeholder="ما رأيك في هذه الفكرة؟"></textarea>
            <button class="send-comment" type="button">إرسال</button>
          </div>
        `;

        ideasGrid.appendChild(article);
      });
    }

    // After rendering, activate reactions logic
    setupIdeaReactions();
  } catch (err) {
    console.error("Unexpected error while loading ideas:", err);
  }
}

// ========================================
// Save idea reaction to Supabase
// ========================================

function setupIdeaReactions() {
  const ideaCards = document.querySelectorAll(".idea-card[data-idea-id]");
  const sessionId = getSessionId();

  ideaCards.forEach((card) => {
    const ideaId = card.dataset.ideaId;
    const buttons = card.querySelectorAll(".idea-actions button");

    if (!ideaId || buttons.length === 0) return;

    buttons.forEach((button) => {
      button.addEventListener("click", async () => {
        const action = button.dataset.action;

        if (action !== "agree" && action !== "disagree") return;

        // Update button styles
        buttons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");

        try {
          // Check if this visitor already reacted to this idea
          const { data: existingReaction, error: selectError } = await supabaseClient
            .from("idea_reactions")
            .select("id")
            .eq("idea_id", ideaId)
            .eq("session_id", sessionId)
            .maybeSingle();

          if (selectError) {
            console.error("Error checking existing reaction:", selectError);
            return;
          }

          if (existingReaction) {
            // Update existing reaction
            const { error: updateError } = await supabaseClient
              .from("idea_reactions")
              .update({ reaction_type: action })
              .eq("id", existingReaction.id);

            if (updateError) {
              console.error("Error updating reaction:", updateError);
            }
          } else {
            // Insert new reaction
            const { error: insertError } = await supabaseClient
              .from("idea_reactions")
              .insert([
                {
                  idea_id: ideaId,
                  session_id: sessionId,
                  reaction_type: action,
                },
              ]);

            if (insertError) {
              console.error("Error inserting reaction:", insertError);
            }
          }
        } catch (err) {
          console.error("Unexpected error while saving reaction:", err);
        }
      });
    });
  });
}

// ========================================
// Run when page is ready
// ========================================

document.addEventListener("DOMContentLoaded", loadIdeas);