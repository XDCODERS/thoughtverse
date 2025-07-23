document.getElementById("submitBtn").addEventListener("click", async () => {
  const text = document.getElementById("thoughtInput").value.trim();
  if (!text) return;

  try {
    const res = await fetch("/api/thoughts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text })
    });

    if (res.ok) {
      document.getElementById("thoughtInput").value = "";
      loadThoughts();
    } else {
      alert("❌ Failed to post");
    }
  } catch (err) {
    console.error("❌ Post error:", err);
  }
});

async function loadThoughts() {
  try {
    const res = await fetch("/api/thoughts");
    const thoughts = await res.json();

    const container = document.getElementById("thoughtsContainer");
    container.innerHTML = "";

    thoughts.forEach((thought) => {
      const div = document.createElement("div");
      div.className = "thought";
      div.innerHTML = `
        <p>${thought.content}</p>
        <small>${new Date(thought.timestamp).toLocaleString()}</small><br>
        <button class="upvoteBtn" data-id="${thought._id}">👍 ${thought.likes}</button>

        <div class="comments">
          <h4>Comments:</h4>
          <ul>
            ${thought.comments.map(comment => `<li>${comment.text} <small>(${new Date(comment.timestamp).toLocaleString()})</small></li>`).join('')}
          </ul>

          <input type="text" class="commentInput" placeholder="Write a comment..." data-id="${thought._id}" />
          <button class="commentBtn" data-id="${thought._id}">Reply</button>
        </div>
      `;
      container.appendChild(div);
    });

    document.querySelectorAll(".upvoteBtn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        await fetch(`/api/like/${id}`, { method: "POST" });
        loadThoughts();
      });
    });

    document.querySelectorAll(".commentBtn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        const input = document.querySelector(`.commentInput[data-id="${id}"]`);
        const text = input.value.trim();
        if (!text) return;

        await fetch(`/api/comment/${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text })
        });

        input.value = "";
        loadThoughts();
      });
    });

  } catch (err) {
    console.error("❌ Load error:", err);
  }
}

loadThoughts();
