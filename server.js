require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// --- MONGODB CONNECTION ---
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// --- MONGOOSE SCHEMA ---
const thoughtSchema = new mongoose.Schema({
  content: String,
  ip: String,
  city: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
  comments: [
    {
      text: String,
      timestamp: { type: Date, default: Date.now }
    }
  ]
});
const Thought = mongoose.model('Thought', thoughtSchema);

// --- MIDDLEWARE ---
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- DDoS PROTECTION ---
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: "Too many requests from this IP, please try again later."
});
app.use(limiter);

// --- ROUTES ---

// Post a thought
app.post('/api/thoughts', async (req, res) => {
  try {
    const { content } = req.body;
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    let city = "unknown";
    try {
      const geo = await fetch(`http://ip-api.com/json/${ip}`);
      const data = await geo.json();
      city = data.city || "unknown";
    } catch (err) {
      console.warn("🌐 IP lookup failed:", err.message);
    }

    const newThought = new Thought({ content, ip, city, userAgent });
    await newThought.save();
    res.status(201).json({ message: 'Thought saved!' });
  } catch (err) {
    console.error("❌ Failed to post:", err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all thoughts
app.get('/api/thoughts', async (req, res) => {
  try {
    const thoughts = await Thought.find().sort({ timestamp: -1 });
    res.json(thoughts);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch thoughts' });
  }
});

// Like a thought
app.post('/api/like/:id', async (req, res) => {
  try {
    const thought = await Thought.findById(req.params.id);
    if (!thought) return res.status(404).json({ error: 'Not found' });
    thought.likes += 1;
    await thought.save();
    res.json({ message: 'Liked!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to like' });
  }
});

// Comment on a thought
app.post('/api/comment/:id', async (req, res) => {
  try {
    const thought = await Thought.findById(req.params.id);
    if (!thought) return res.status(404).json({ error: 'Not found' });
    const { text } = req.body;
    thought.comments.push({ text });
    await thought.save();
    res.json({ message: 'Comment added!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to comment' });
  }
});

// Delete a thought
app.delete('/api/thoughts/:id', async (req, res) => {
  try {
    const deleted = await Thought.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Thought deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

// Fallback to serve index.html
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
