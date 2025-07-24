const thoughtForm = document.getElementById('thoughtForm');
const thoughtInput = document.getElementById('thoughtInput');
const thoughtsContainer = document.getElementById('thoughtsContainer');

async function fetchThoughts() {
  thoughtsContainer.innerHTML = "Loading thoughts...";
  try {
    const res = await fetch('/api/thoughts');
    const thoughts = await res.json();
    renderThoughts(thoughts);
  } catch (err) {
    thoughtsContainer.innerHTML = "Error loading thoughts.";
    console.error(err);
  }
}

function renderThoughts(thoughts) {
  thoughtsContainer.innerHTML = '';
  thoughts.forEach(thought => {
    const div = document.createElement('div');
    div.className = 'thought';

    div.innerHTML = `
      <p>${thought.content}</p>
      <div class="thought-meta">
        <button onclick="likeThought('${thought._id}')">👍 ${thought.likes}</button>
        <button onclick="deleteThought('${thought._id}')">🗑️</button>
      </div>
      <div class="comments">
        ${thought.comments.map(c => `<div class="comment">💬 ${c.text}</div>`).join('')}
        <form onsubmit="commentThought(event, '${thought._id}')">
          <input type="text" placeholder="Write a comment..." required>
          <button>Reply</button>
        </form>
      </div>
    `;
    thoughtsContainer.appendChild(div);
  });
}

thoughtForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const content = thoughtInput.value.trim();
  if (!content) return;
  try {
    await fetch('/api/thoughts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    thoughtInput.value = '';
    fetchThoughts();
  } catch (err) {
    alert("Failed to post.");
  }
});

async function likeThought(id) {
  try {
    await fetch(`/api/like/${id}`, { method: 'POST' });
    fetchThoughts();
  } catch (err) {
    alert("Failed to like.");
  }
}

async function deleteThought(id) {
  if (!confirm("Delete this thought?")) return;
  try {
    const res = await fetch(`/api/thoughts/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) {
      fetchThoughts();
    } else {
      alert(data.error || "Failed to delete.");
    }
  } catch (err) {
    alert("Server error deleting thought.");
  }
}

async function commentThought(e, id) {
  e.preventDefault();
  const input = e.target.querySelector('input');
  const text = input.value.trim();
  if (!text) return;
  try {
    await fetch(`/api/comment/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    fetchThoughts();
  } catch (err) {
    alert("Failed to comment.");
  }
}
