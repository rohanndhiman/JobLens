const API = "http://localhost:5000";

const STATUS_OPTIONS = ["Applied", "Interview", "Offer", "Rejected", "Ghosted", "Withdrawn"];
const PRIORITY_OPTIONS = ["High", "Medium", "Low"];

let allJobs = [];
let editingJobId = null;
let chartInstances = {};

function toast(msg, type = "success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = msg;
  container.appendChild(el);

  setTimeout(() => {
    el.style.animation = "slideDown 0.3s ease forwards";
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

function getToken() {
  return localStorage.getItem("jl_token");
}

function getUser() {
  return JSON.parse(localStorage.getItem("jl_user") || "null");
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

function showPage(id) {
  document.getElementById("loginPage").style.display = "none";
  document.getElementById("registerPage").style.display = "none";
  document.getElementById(id).style.display = "flex";
}

function switchPage(id, el) {
  document.querySelectorAll(".page").forEach((page) => page.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));

  document.getElementById(id).classList.add("active");
  if (el) el.classList.add("active");

  if (id === "analyticsPage") renderAnalytics();
  if (id === "jobsPage") filterJobs();
  if (id === "dashPage") renderDash();

  document.getElementById("sidebar").classList.remove("open");
}

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
}

async function doLogin() {
  const email = document.getElementById("loginEmail").value.trim();
  const pass = document.getElementById("loginPassword").value;

  if (!email || !pass) {
    toast("Please fill all fields", "error");
    return;
  }

  try {
    const response = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pass }),
    });

    const data = await response.json();
    if (!response.ok) {
      toast(data.error || "Login failed", "error");
      return;
    }

    localStorage.setItem("jl_token", data.token);
    localStorage.setItem("jl_user", JSON.stringify(data.user));
    initApp();
  } catch {
    toast("Cannot connect to server. Loading demo mode instead.", "info");
    demoMode();
  }
}

async function doRegister() {
  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const pass = document.getElementById("regPassword").value;

  if (!name || !email || !pass) {
    toast("Please fill all fields", "error");
    return;
  }

  if (pass.length < 6) {
    toast("Password must be at least 6 characters", "error");
    return;
  }

  try {
    const response = await fetch(`${API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password: pass }),
    });

    const data = await response.json();
    if (!response.ok) {
      toast(data.error || "Registration failed", "error");
      return;
    }

    localStorage.setItem("jl_token", data.token);
    localStorage.setItem("jl_user", JSON.stringify(data.user));
    initApp();
  } catch {
    toast("Cannot connect to server", "error");
  }
}

function doLogout() {
  localStorage.removeItem("jl_token");
  localStorage.removeItem("jl_user");
  allJobs = [];

  document.getElementById("appWrap").style.display = "none";
  document.getElementById("authWrap").style.display = "block";
  showPage("loginPage");
}

function demoMode() {
  const demoUser = { id: "demo", name: "Demo User", email: "demo@joblens.app" };

  localStorage.setItem("jl_user", JSON.stringify(demoUser));
  localStorage.setItem("jl_token", "demo");

  allJobs = [
    { _id: "1", company: "Google", role: "Software Engineer L4", status: "Interview", priority: "High", location: "Mountain View, CA", salary: "$180k-$220k", dateApplied: new Date(Date.now() - 2 * 86400000), notes: "Phone screen done. Onsite scheduled.", url: "https://careers.google.com" },
    { _id: "2", company: "Stripe", role: "Backend Engineer", status: "Applied", priority: "High", location: "Remote", salary: "$160k-$200k", dateApplied: new Date(Date.now() - 5 * 86400000), notes: "Applied via referral from Alice." },
    { _id: "3", company: "Notion", role: "Full Stack Engineer", status: "Rejected", priority: "Medium", location: "San Francisco, CA", dateApplied: new Date(Date.now() - 10 * 86400000) },
    { _id: "4", company: "Linear", role: "Frontend Engineer", status: "Applied", priority: "High", location: "Remote", salary: "$140k-$170k", dateApplied: new Date(Date.now() - 3 * 86400000) },
    { _id: "5", company: "Vercel", role: "Developer Relations", status: "Interview", priority: "Medium", location: "Remote", dateApplied: new Date(Date.now() - 7 * 86400000), notes: "2nd round with eng team." },
    { _id: "6", company: "Figma", role: "Product Engineer", status: "Ghosted", priority: "Low", location: "San Francisco, CA", dateApplied: new Date(Date.now() - 20 * 86400000) },
    { _id: "7", company: "Anthropic", role: "Software Engineer", status: "Offer", priority: "High", location: "San Francisco, CA", salary: "$200k-$250k", dateApplied: new Date(Date.now() - 15 * 86400000), notes: "Offer received. Deadline to respond next Friday." },
    { _id: "8", company: "Arc", role: "iOS Engineer", status: "Applied", priority: "Medium", location: "Remote", dateApplied: new Date(Date.now() - 1 * 86400000) },
  ];

  initApp(true);
  toast("Running in demo mode.", "info");
}

function initApp(isDemo = false) {
  document.getElementById("authWrap").style.display = "none";
  document.getElementById("appWrap").style.display = "block";

  const user = getUser();
  if (!user) return;

  const initials = (user.name || "?")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  document.getElementById("avatarInitials").textContent = initials || "?";
  document.getElementById("sidebarName").textContent = user.name || "-";
  document.getElementById("sidebarEmail").textContent = user.email || "-";

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  document.getElementById("dashGreeting").textContent = `${greeting}, ${(user.name || "there").split(" ")[0]}`;

  if (isDemo) {
    renderDash();
    renderJobs(allJobs);
    return;
  }

  loadJobs();
}

async function loadJobs() {
  try {
    const response = await fetch(`${API}/jobs`, { headers: authHeaders() });
    if (!response.ok) throw new Error("Failed to load jobs");

    allJobs = await response.json();
    renderDash();
    renderJobs(allJobs);
  } catch {
    toast("Failed to load jobs", "error");
  }
}

async function saveJob(data) {
  const isEdit = Boolean(editingJobId);

  if (getToken() === "demo") {
    if (isEdit) {
      const index = allJobs.findIndex((job) => job._id === editingJobId);
      if (index !== -1) {
        allJobs[index] = { ...allJobs[index], ...data };
      }
    } else {
      allJobs.unshift({ _id: Date.now().toString(), ...data, dateApplied: new Date() });
    }
    return true;
  }

  try {
    const url = isEdit ? `${API}/jobs/${editingJobId}` : `${API}/jobs`;
    const method = isEdit ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: authHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Save failed");

    await loadJobs();
    return true;
  } catch {
    toast("Failed to save", "error");
    return false;
  }
}

async function deleteJob(id) {
  if (!confirm("Remove this application?")) return;

  if (getToken() === "demo") {
    allJobs = allJobs.filter((job) => job._id !== id);
    renderDash();
    filterJobs();
    toast("Removed");
    return;
  }

  try {
    const response = await fetch(`${API}/jobs/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    if (!response.ok) throw new Error("Delete failed");

    toast("Removed");
    await loadJobs();
  } catch {
    toast("Delete failed", "error");
  }
}

async function quickUpdateStatus(id, status) {
  if (getToken() === "demo") {
    const job = allJobs.find((item) => item._id === id);
    if (job) job.status = status;
    renderDash();
    filterJobs();
    toast("Status updated");
    return;
  }

  try {
    const response = await fetch(`${API}/jobs/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) throw new Error("Update failed");

    toast("Status updated");
    await loadJobs();
  } catch {
    toast("Update failed", "error");
  }
}

async function quickUpdate(id, field, value) {
  if (getToken() === "demo") {
    const job = allJobs.find((item) => item._id === id);
    if (job) job[field] = value;
    renderDash();
    filterJobs();
    return;
  }

  try {
    const response = await fetch(`${API}/jobs/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ [field]: value }),
    });

    if (!response.ok) throw new Error("Update failed");

    await loadJobs();
  } catch {
    toast("Update failed", "error");
  }
}

function openAddModal() {
  editingJobId = null;

  document.getElementById("modalTitle").textContent = "Add Application";
  document.getElementById("modalSubmitBtn").textContent = "Add Application";

  ["fCompany", "fRole", "fLocation", "fSalary", "fUrl", "fContactName", "fContactEmail", "fNotes", "fDeadline"].forEach((id) => {
    document.getElementById(id).value = "";
  });

  document.getElementById("fStatus").value = "Applied";
  document.getElementById("fPriority").value = "Medium";
  document.getElementById("jobModal").classList.add("open");
}

function openEditModal(job) {
  editingJobId = job._id;

  document.getElementById("modalTitle").textContent = "Edit Application";
  document.getElementById("modalSubmitBtn").textContent = "Save Changes";
  document.getElementById("fCompany").value = job.company || "";
  document.getElementById("fRole").value = job.role || "";
  document.getElementById("fStatus").value = job.status || "Applied";
  document.getElementById("fPriority").value = job.priority || "Medium";
  document.getElementById("fLocation").value = job.location || "";
  document.getElementById("fSalary").value = job.salary || "";
  document.getElementById("fUrl").value = job.url || "";
  document.getElementById("fContactName").value = job.contactName || "";
  document.getElementById("fContactEmail").value = job.contactEmail || "";
  document.getElementById("fNotes").value = job.notes || "";
  document.getElementById("fDeadline").value = job.deadline ? job.deadline.split("T")[0] : "";
  document.getElementById("jobModal").classList.add("open");
}

function closeModal() {
  document.getElementById("jobModal").classList.remove("open");
}

async function submitJob() {
  const company = document.getElementById("fCompany").value.trim();
  const role = document.getElementById("fRole").value.trim();

  if (!company || !role) {
    toast("Company and role are required", "error");
    return;
  }

  const data = {
    company,
    role,
    status: document.getElementById("fStatus").value,
    priority: document.getElementById("fPriority").value,
    location: document.getElementById("fLocation").value.trim(),
    salary: document.getElementById("fSalary").value.trim(),
    url: document.getElementById("fUrl").value.trim(),
    contactName: document.getElementById("fContactName").value.trim(),
    contactEmail: document.getElementById("fContactEmail").value.trim(),
    notes: document.getElementById("fNotes").value.trim(),
    deadline: document.getElementById("fDeadline").value || undefined,
  };

  const wasEditing = Boolean(editingJobId);
  const saved = await saveJob(data);
  if (!saved) return;

  closeModal();
  renderDash();
  filterJobs();
  toast(wasEditing ? "Application updated!" : "Application added!");
}

function renderDash() {
  const jobs = allJobs;
  const total = jobs.length;
  const interviews = jobs.filter((job) => job.status === "Interview").length;
  const offers = jobs.filter((job) => job.status === "Offer").length;
  const rejected = jobs.filter((job) => job.status === "Rejected").length;
  const rate = total ? Math.round((interviews / total) * 100) : 0;

  document.getElementById("statsGrid").innerHTML = `
    <div class="stat-card" style="--color: var(--accent)">
      <div class="stat-num">${total}</div>
      <div class="stat-label">Total Applications</div>
    </div>
    <div class="stat-card" style="--color: var(--green)">
      <div class="stat-num">${interviews}</div>
      <div class="stat-label">In Interview</div>
    </div>
    <div class="stat-card" style="--color: var(--purple)">
      <div class="stat-num">${offers}</div>
      <div class="stat-label">Offers</div>
    </div>
    <div class="stat-card" style="--color: var(--red)">
      <div class="stat-num">${rejected}</div>
      <div class="stat-label">Rejected</div>
    </div>
    <div class="stat-card" style="--color: var(--yellow)">
      <div class="stat-num">${rate}%</div>
      <div class="stat-label">Interview Rate</div>
    </div>
  `;

  const colors = {
    Applied: "var(--yellow)",
    Interview: "var(--green)",
    Offer: "var(--purple)",
  };

  document.getElementById("funnelBar").innerHTML = ["Applied", "Interview", "Offer"]
    .map((status) => {
      const count = jobs.filter((job) => job.status === status).length;
      return `
        <div class="funnel-step">
          <div class="funnel-bar" style="background:${colors[status]}; opacity:0.7"></div>
          <div class="funnel-count">${count}</div>
          <div class="funnel-label">${status}</div>
        </div>
      `;
    })
    .join("");

  const recent = [...jobs]
    .sort((a, b) => new Date(b.dateApplied || b.createdAt) - new Date(a.dateApplied || a.createdAt))
    .slice(0, 5);

  const recentEl = document.getElementById("recentJobs");
  if (!recent.length) {
    recentEl.innerHTML = '<div class="empty-state"><div class="empty-icon">No items</div><h3>No applications yet</h3><p>Add your first application to get started.</p></div>';
    return;
  }

  recentEl.innerHTML = recent.map((job) => jobCardHTML(job)).join("");
}

function renderJobs(jobs) {
  const countEl = document.getElementById("jobsCount");
  if (countEl) {
    countEl.textContent = `${jobs.length} application${jobs.length !== 1 ? "s" : ""}`;
  }

  const listEl = document.getElementById("jobsList");
  if (!jobs.length) {
    listEl.innerHTML = '<div class="empty-state"><div class="empty-icon">Search</div><h3>No applications found</h3><p>Try adjusting your filters.</p></div>';
    return;
  }

  listEl.innerHTML = jobs.map((job) => jobCardHTML(job)).join("");
}

function jobCardHTML(job) {
  const dateStr = job.dateApplied
    ? new Date(job.dateApplied).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "";
  const priClass = { High: "priority-high", Medium: "priority-medium", Low: "priority-low" }[job.priority] || "priority-medium";
  const editPayload = encodeInlineJob(job);

  return `
    <div class="job-card" onclick="toggleJobDetail('${job._id}')" id="card-${job._id}">
      <div class="job-priority-dot ${priClass}"></div>
      <div class="job-main">
        <div class="job-company">${escHtml(job.company)}</div>
        <div class="job-role">${escHtml(job.role)}</div>
      </div>
      <div class="job-meta-row">
        ${job.location ? `<span class="job-location">${escHtml(job.location)}</span>` : ""}
        ${job.salary ? `<span class="tag">${escHtml(job.salary)}</span>` : ""}
        <span class="job-date">${dateStr}</span>
        <span class="status-badge badge-${job.status}">${job.status}</span>
      </div>
    </div>
    <div class="job-detail" id="detail-${job._id}">
      <div class="detail-grid">
        <div class="detail-field">
          <label>Status</label>
          <select onchange="quickUpdateStatus('${job._id}', this.value)" onclick="event.stopPropagation()">
            ${STATUS_OPTIONS.map((status) => `<option ${status === job.status ? "selected" : ""}>${status}</option>`).join("")}
          </select>
        </div>
        <div class="detail-field">
          <label>Priority</label>
          <select onchange="quickUpdate('${job._id}', 'priority', this.value)" onclick="event.stopPropagation()">
            ${PRIORITY_OPTIONS.map((priority) => `<option ${priority === job.priority ? "selected" : ""}>${priority}</option>`).join("")}
          </select>
        </div>
        ${job.location ? `<div class="detail-field"><label>Location</label><input readonly value="${escAttr(job.location)}"></div>` : ""}
        ${job.salary ? `<div class="detail-field"><label>Salary</label><input readonly value="${escAttr(job.salary)}"></div>` : ""}
        ${job.contactName ? `<div class="detail-field"><label>Contact</label><input readonly value="${escAttr(job.contactName)}${job.contactEmail ? ` (${escAttr(job.contactEmail)})` : ""}"></div>` : ""}
        ${job.url ? `<div class="detail-field"><label>Job URL</label><input readonly value="${escAttr(job.url)}"></div>` : ""}
        ${job.notes ? `<div class="detail-field" style="grid-column:1/-1"><label>Notes</label><textarea readonly style="min-height:60px">${escHtml(job.notes)}</textarea></div>` : ""}
      </div>
      <div class="detail-actions" onclick="event.stopPropagation()">
        <button class="btn btn-sm" onclick='openEditModal(JSON.parse(decodeURIComponent("${editPayload}")))'>Edit</button>
        ${job.url ? `<a href="${escAttr(job.url)}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()"><button class="btn btn-sm btn-ghost" type="button">Open Listing</button></a>` : ""}
        <button class="btn-danger btn-sm" onclick="deleteJob('${job._id}')">Remove</button>
      </div>
    </div>
  `;
}

function toggleJobDetail(id) {
  const detail = document.getElementById(`detail-${id}`);
  const card = document.getElementById(`card-${id}`);
  if (!detail || !card) return;

  const isOpen = detail.classList.contains("open");

  document.querySelectorAll(".job-detail.open").forEach((node) => {
    node.classList.remove("open");
    const currentId = node.id.replace("detail-", "");
    document.getElementById(`card-${currentId}`)?.classList.remove("expanded");
  });

  if (!isOpen) {
    detail.classList.add("open");
    card.classList.add("expanded");
  }
}

function filterJobs() {
  const q = document.getElementById("searchInput")?.value.toLowerCase() || "";
  const status = document.getElementById("filterStatus")?.value || "";
  const priority = document.getElementById("filterPriority")?.value || "";
  const sort = document.getElementById("sortSelect")?.value || "-dateApplied";

  let jobs = allJobs.filter((job) => {
    const company = (job.company || "").toLowerCase();
    const role = (job.role || "").toLowerCase();
    const notes = (job.notes || "").toLowerCase();

    const matchesText = !q || company.includes(q) || role.includes(q) || notes.includes(q);
    const matchesStatus = !status || job.status === status;
    const matchesPriority = !priority || job.priority === priority;

    return matchesText && matchesStatus && matchesPriority;
  });

  jobs = sortJobs(jobs, sort);
  renderJobs(jobs);
}

function sortJobs(jobs, sort) {
  const descending = sort.startsWith("-");
  const field = descending ? sort.slice(1) : sort;
  const direction = descending ? -1 : 1;

  return [...jobs].sort((a, b) => {
    const av = a[field] || "";
    const bv = b[field] || "";

    if (field === "dateApplied") {
      return direction * (new Date(av) - new Date(bv));
    }

    return direction * String(av).localeCompare(String(bv));
  });
}

function renderAnalytics() {
  const jobs = allJobs;
  const byStatus = {};
  const byPriority = {};
  const byDay = {};

  jobs.forEach((job) => {
    byStatus[job.status] = (byStatus[job.status] || 0) + 1;
    byPriority[job.priority || "Medium"] = (byPriority[job.priority || "Medium"] || 0) + 1;

    const date = new Date(job.dateApplied || job.createdAt);
    const key = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    byDay[key] = (byDay[key] || 0) + 1;
  });

  const total = jobs.length;
  const interviews = byStatus.Interview || 0;
  const offers = byStatus.Offer || 0;
  const progressRate = total ? Math.round(((interviews + offers) / total) * 100) : 0;
  const now = Date.now();
  const last7 = jobs.filter((job) => (now - new Date(job.dateApplied || job.createdAt).getTime()) / 86400000 <= 7).length;

  document.getElementById("analyticsStats").innerHTML = `
    <div class="stat-card" style="--color:var(--accent)"><div class="stat-num">${total}</div><div class="stat-label">Total</div></div>
    <div class="stat-card" style="--color:var(--yellow)"><div class="stat-num">${last7}</div><div class="stat-label">This Week</div></div>
    <div class="stat-card" style="--color:var(--green)"><div class="stat-num">${progressRate}%</div><div class="stat-label">Progress Rate</div></div>
    <div class="stat-card" style="--color:var(--purple)"><div class="stat-num">${offers}</div><div class="stat-label">Offers</div></div>
  `;

  buildChart("statusChart", "doughnut", {
    labels: Object.keys(byStatus),
    datasets: [{
      data: Object.values(byStatus),
      backgroundColor: ["#fbbf24", "#4ade80", "#c084fc", "#f87171", "#5a5a72", "#60a5fa"],
      borderWidth: 0,
    }],
  }, {
    cutout: "65%",
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#9090a8", font: { size: 11 } },
      },
    },
  });

  const days = [];
  const counts = [];
  for (let i = 13; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    days.push(key);
    counts.push(byDay[key] || 0);
  }

  buildChart("timelineChart", "bar", {
    labels: days,
    datasets: [{
      label: "Applications",
      data: counts,
      backgroundColor: "rgba(124,111,255,0.5)",
      borderColor: "var(--accent)",
      borderWidth: 1,
      borderRadius: 4,
    }],
  }, {
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: "#5a5a72", font: { size: 10 }, maxTicksLimit: 7 }, grid: { color: "#1c1c26" } },
      y: { ticks: { color: "#5a5a72", stepSize: 1 }, grid: { color: "#1c1c26" } },
    },
  });

  buildChart("priorityChart", "bar", {
    labels: PRIORITY_OPTIONS,
    datasets: [{
      data: [byPriority.High || 0, byPriority.Medium || 0, byPriority.Low || 0],
      backgroundColor: ["rgba(248,113,113,0.5)", "rgba(251,191,36,0.5)", "rgba(74,222,128,0.5)"],
      borderColor: ["#f87171", "#fbbf24", "#4ade80"],
      borderWidth: 1,
      borderRadius: 4,
    }],
  }, {
    indexAxis: "y",
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: "#5a5a72", stepSize: 1 }, grid: { color: "#1c1c26" } },
      y: { ticks: { color: "#9090a8" }, grid: { display: false } },
    },
  });

  const recentActivity = [...jobs]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || b.dateApplied) - new Date(a.updatedAt || a.createdAt || a.dateApplied))
    .slice(0, 8);

  const activityEl = document.getElementById("activityList");
  if (!recentActivity.length) {
    activityEl.innerHTML = '<p style="color:var(--text-muted);font-size:13px">No activity yet.</p>';
    return;
  }

  activityEl.innerHTML = recentActivity.map((job) => `
    <div class="timeline-item">
      <div class="timeline-dot" style="background:var(--accent)"></div>
      <div class="timeline-content">
        <div class="timeline-title">${escHtml(job.company)} - ${escHtml(job.role)}</div>
        <div class="timeline-meta">
          <span class="status-badge badge-${job.status}" style="font-size:10px;padding:2px 7px">${job.status}</span>
          . ${new Date(job.dateApplied || job.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </div>
      </div>
    </div>
  `).join("");
}

function buildChart(id, type, data, options = {}) {
  if (chartInstances[id]) {
    chartInstances[id].destroy();
  }

  const ctx = document.getElementById(id)?.getContext("2d");
  if (!ctx || typeof Chart === "undefined") return;

  chartInstances[id] = new Chart(ctx, {
    type,
    data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      ...options,
    },
  });
}

function escHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escAttr(str) {
  return escHtml(str).replace(/\n/g, " ");
}

function encodeInlineJob(job) {
  return encodeURIComponent(JSON.stringify(job));
}

window.onload = function onLoad() {
  if (getToken() && getUser()) {
    initApp(getToken() === "demo");
  }

  document.getElementById("jobModal").addEventListener("click", function onModalClick(event) {
    if (event.target === this) closeModal();
  });

  document.addEventListener("keydown", (event) => {
    const activeTag = document.activeElement?.tagName;

    if (event.key === "n" && !["INPUT", "TEXTAREA", "SELECT"].includes(activeTag)) {
      if (document.getElementById("appWrap").style.display !== "none") {
        openAddModal();
      }
    }

    if (event.key === "Escape") {
      closeModal();
    }
  });
};
