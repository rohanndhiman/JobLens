const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "change-this-in-production";

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "../frontend")));

// ── DB ──────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/jobtracker")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("DB error:", err));

// ── MODELS ──────────────────────────────────────────────
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const JobSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["Applied", "Interview", "Offer", "Rejected", "Ghosted", "Withdrawn"],
      default: "Applied",
    },
    location: { type: String, trim: true },
    salary: { type: String, trim: true },
    url: { type: String, trim: true },
    notes: { type: String, trim: true, maxlength: 2000 },
    contactName: { type: String, trim: true },
    contactEmail: { type: String, trim: true },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    dateApplied: { type: Date, default: Date.now },
    deadline: { type: Date },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
const Job = mongoose.model("Job", JobSchema);

// ── MIDDLEWARE ──────────────────────────────────────────
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// ── AUTH ROUTES ─────────────────────────────────────────
app.get("/", (req, res) => res.json({ status: "ok", version: "2.0" }));

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields are required" });
    if (password.length < 6)
      return res.status(400).json({ error: "Password must be at least 6 characters" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const token = jwt.sign({ id: user._id, name: user.name }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid email or password" });

    const token = jwt.sign({ id: user._id, name: user.name }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch {
    res.status(500).json({ error: "Login failed" });
  }
});

// ── JOB ROUTES ──────────────────────────────────────────
app.get("/jobs", auth, async (req, res) => {
  try {
    const { status, priority, search, sort = "-dateApplied" } = req.query;
    const filter = { userId: req.user.id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { company: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
      ];
    }
    const jobs = await Job.find(filter).sort(sort).lean();
    res.json(jobs);
  } catch {
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

app.post("/jobs", auth, async (req, res) => {
  try {
    const { company, role } = req.body;
    if (!company || !role) return res.status(400).json({ error: "Company and role are required" });

    const job = await Job.create({ ...req.body, userId: req.user.id });
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ error: "Failed to add job" });
  }
});

app.put("/jobs/:id", auth, async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json(job);
  } catch {
    res.status(500).json({ error: "Failed to update job" });
  }
});

app.delete("/jobs/:id", auth, async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json({ message: "Deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete job" });
  }
});

// ── STATS ROUTE ─────────────────────────────────────────
app.get("/stats", auth, async (req, res) => {
  try {
    const jobs = await Job.find({ userId: req.user.id }).lean();
    const counts = {};
    jobs.forEach((j) => {
      counts[j.status] = (counts[j.status] || 0) + 1;
    });

    const now = new Date();
    const last30 = jobs.filter(
      (j) => (now - new Date(j.dateApplied)) / (1000 * 60 * 60 * 24) <= 30
    ).length;

    res.json({ total: jobs.length, byStatus: counts, last30days: last30 });
  } catch {
    res.status(500).json({ error: "Failed to get stats" });
  }
});

// ── START ────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
