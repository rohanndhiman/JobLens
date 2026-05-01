const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/jobtracker";

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

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Job = mongoose.models.Job || mongoose.model("Job", JobSchema);

const SAMPLE_USER = {
  name: "Demo User",
  email: "demo@joblens.app",
  password: "demo123",
};

const now = Date.now();

const sampleJobs = [
  {
    company: "Google",
    role: "Software Engineer L4",
    status: "Interview",
    priority: "High",
    location: "Mountain View, CA",
    salary: "$180k-$220k",
    dateApplied: new Date(now - 2 * 86400000),
    notes: "Phone screen done. Onsite scheduled.",
    url: "https://careers.google.com",
    contactName: "Alex Morgan",
    contactEmail: "alex@google.com",
    tags: ["backend", "onsite"],
  },
  {
    company: "Stripe",
    role: "Backend Engineer",
    status: "Applied",
    priority: "High",
    location: "Remote",
    salary: "$160k-$200k",
    dateApplied: new Date(now - 5 * 86400000),
    notes: "Applied via referral from Alice.",
    contactName: "Alicia Reed",
    contactEmail: "alice@stripe.com",
    tags: ["payments", "referral"],
  },
  {
    company: "Notion",
    role: "Full Stack Engineer",
    status: "Rejected",
    priority: "Medium",
    location: "San Francisco, CA",
    dateApplied: new Date(now - 10 * 86400000),
    notes: "Strong process, but role closed after final shortlist.",
    tags: ["fullstack"],
  },
  {
    company: "Linear",
    role: "Frontend Engineer",
    status: "Applied",
    priority: "High",
    location: "Remote",
    salary: "$140k-$170k",
    dateApplied: new Date(now - 3 * 86400000),
    url: "https://linear.app/careers",
    tags: ["frontend", "remote"],
  },
  {
    company: "Vercel",
    role: "Developer Relations",
    status: "Interview",
    priority: "Medium",
    location: "Remote",
    dateApplied: new Date(now - 7 * 86400000),
    notes: "Second round with engineering team.",
    tags: ["devrel"],
  },
  {
    company: "Figma",
    role: "Product Engineer",
    status: "Ghosted",
    priority: "Low",
    location: "San Francisco, CA",
    dateApplied: new Date(now - 20 * 86400000),
    tags: ["design-tools"],
  },
  {
    company: "Anthropic",
    role: "Software Engineer",
    status: "Offer",
    priority: "High",
    location: "San Francisco, CA",
    salary: "$200k-$250k",
    dateApplied: new Date(now - 15 * 86400000),
    notes: "Offer received. Deadline to respond next Friday.",
    deadline: new Date(now + 6 * 86400000),
    tags: ["ai", "offer"],
  },
  {
    company: "Arc",
    role: "iOS Engineer",
    status: "Applied",
    priority: "Medium",
    location: "Remote",
    dateApplied: new Date(now - 1 * 86400000),
    tags: ["ios"],
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected for seeding");

    const hashedPassword = await bcrypt.hash(SAMPLE_USER.password, 10);

    const user = await User.findOneAndUpdate(
      { email: SAMPLE_USER.email },
      {
        name: SAMPLE_USER.name,
        email: SAMPLE_USER.email,
        password: hashedPassword,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    await Job.deleteMany({ userId: user._id });

    await Job.insertMany(
      sampleJobs.map((job) => ({
        ...job,
        userId: user._id,
      }))
    );

    console.log("Sample data created successfully");
    console.log(`User email: ${SAMPLE_USER.email}`);
    console.log(`User password: ${SAMPLE_USER.password}`);
    console.log(`Inserted jobs: ${sampleJobs.length}`);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

seed();
