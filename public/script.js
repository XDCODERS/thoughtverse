document.getElementById("submitBtn").addEventListener("click", async () => {
  const text = document.getElementById("thoughtInput").value.trim();
  if (!text) return;

  try {
    const res = await fetch("/thoughts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    if (res.ok) {
      document.getElementById("thoughtInput").value = "";
      loadThoughts();
    } else {
      alert("Failed to post");
    }
  } catch (err) {
    console.error(err);
  }
});

async function loadThoughts() {
  try {
    const res = await fetch("/thoughts");
    const thoughts = await res.json();

    const container = document.getElementById("thoughtsContainer");
    container.innerHTML = "";
    thoughts.forEach((thought) => {
      const div = document.createElement("div");
      div.className = "thought";
      div.innerHTML = `
        <p>${thought.text}</p>
        <small>${new Date(thought.createdAt).toLocaleString()}</small><br>
        <button class="upvoteBtn" data-id="${thought._id}">👍 ${thought.upvotes}</button>
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
  } catch (err) {
    console.error("Error loading thoughts:", err);
  }
}

loadThoughts();
