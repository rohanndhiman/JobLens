<div align="center">

# ⚡ JobLens

**📌 Track Applications + 🔐 Secure Auth + 📊 Analytics Dashboard**  
*Organize your job hunt. Follow every lead. Turn chaos into clarity.*

---

<p>
  <a href="https://nodejs.org/">
    <img alt="Node.js" src="https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white" />
  </a>
  <a href="https://expressjs.com/">
    <img alt="Express" src="https://img.shields.io/badge/Backend-Express-000000?logo=express&logoColor=white" />
  </a>
  <a href="https://www.mongodb.com/">
    <img alt="MongoDB" src="https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white" />
  </a>
  <a href="https://jwt.io/">
    <img alt="JWT" src="https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white" />
  </a>
  <a href="https://www.chartjs.org/">
    <img alt="Chart.js" src="https://img.shields.io/badge/Charts-Chart.js-FF6384?logo=chartdotjs&logoColor=white" />
  </a>
</p>

</div>

---

## 🌍 Overview

**JobLens** is a full-stack job application tracker built to help users manage every stage of their job search.

It brings together **secure authentication**, **persistent MongoDB storage**, **application management**, and **visual analytics** in one clean dashboard.

No messy spreadsheets. No forgotten follow-ups.  
Just one focused place to track your career pipeline.

---

## 🧩 How It Works

```text
👤 User → 🔐 Register / Login → 🎫 JWT Token
                         │
                         ├── 📌 Create Job Applications
                         ├── 🔎 Search, Filter, Sort
                         ├── ✏️ Update Status / Priority
                         └── 📊 View Dashboard + Analytics

MongoDB stores users and jobs securely by userId.
```

🧠 This flow ensures:

- Each user only sees their own job applications.
- Passwords are hashed before being stored.
- Job data persists in MongoDB.
- Analytics update from real application data.

---

## ✨ Key Features

| 🚀 Feature | 💡 Description |
|-------------|----------------|
| 🔐 **User Authentication** | Register and log in securely with JWT-based auth. |
| 🧂 **Password Hashing** | Passwords are hashed using `bcryptjs` before storage. |
| 📌 **Application Tracking** | Add, edit, delete, search, filter, and sort job applications. |
| 🏷️ **Status Management** | Track jobs as `Applied`, `Interview`, `Offer`, `Rejected`, `Ghosted`, or `Withdrawn`. |
| 🎯 **Priority Tracking** | Mark applications as `High`, `Medium`, or `Low` priority. |
| 📊 **Analytics Dashboard** | View totals, interview rate, offer count, status charts, and activity trends. |
| 🧪 **Demo Mode** | Explore the UI even when the backend is unavailable. |
| 📱 **Responsive UI** | Mobile-friendly layout with sidebar navigation. |

---

## 🧱 Tech Stack

| Layer | Technology |
|--------|-------------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| Charts | Chart.js |
| Deployment | Render or any Node.js hosting platform |

---

## 📁 Project Structure

```text
job-tracker-v2/
|-- frontend/
|   |-- index.html
|   |-- style.css
|   `-- app.js
|-- backend/
|   |-- server.js
|   |-- seed.js
|   |-- package.json
|   `-- package-lock.json
|-- docs/
|   |-- JobLens_Viva_Guide.html
|   `-- JobLens_Viva_Guide.pdf
|-- .env.example
|-- .gitignore
|-- package.json
`-- README.md
```

---

## ⚙️ Installation

```powershell
# Clone repository
git clone https://github.com/rohanndhiman/JobLens.git
cd JobLens

# Install dependencies
npm install

# Optional: install from backend folder directly
cd backend
npm install
cd ..
```

---

## 🔑 Environment Variables

Create a `.env` file or add these variables in your deployment platform:

```text
PORT=5000
MONGO_URI=mongodb://localhost:27017/jobtracker
JWT_SECRET=replace-with-a-long-random-secret
```

For MongoDB Atlas:

```text
MONGO_URI=mongodb+srv://username:password@cluster-name.mongodb.net/jobtracker?retryWrites=true&w=majority
```

⚠️ Never commit your real `.env` file. Use `.env.example` as the safe template.

---

## ▶️ Running the Application

```powershell
# Start the full app
npm start
```

Open:

```text
http://localhost:5000
```

The Express backend serves the frontend automatically, so there is no separate frontend build step.

---

## 🌱 Seed Demo Data

```powershell
npm run seed
```

Demo account:

```text
Email: demo@joblens.app
Password: demo123
```

---

## 🧠 Workflow Explained

1. **Register / Login**  
   - User creates an account or signs in.  
   - Backend validates credentials and returns a JWT.  
   - Frontend stores the token in `localStorage`.

2. **Add Application**  
   - User enters company, role, status, priority, salary, notes, URL, and contact details.  
   - Backend stores the application in MongoDB with the current user's `userId`.

3. **Manage Pipeline**  
   - User can update status and priority quickly.  
   - Applications can be searched, filtered, sorted, edited, or deleted.

4. **Analyze Progress**  
   - Dashboard calculates totals, interviews, offers, rejections, and interview rate.  
   - Chart.js displays status, timeline, and priority breakdowns.

---

## 🧰 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | No | Create a new account |
| `POST` | `/login` | No | Log in and receive a JWT |
| `GET` | `/jobs` | Yes | Get current user's applications |
| `POST` | `/jobs` | Yes | Create a new application |
| `PUT` | `/jobs/:id` | Yes | Update an application |
| `DELETE` | `/jobs/:id` | Yes | Delete an application |
| `GET` | `/stats` | Yes | Get summary stats |

`GET /jobs` supports:

```text
status
priority
search
sort
```

---

## ☁️ Deployment

### Render Setup

1. Push this repository to GitHub.
2. Create a new **Web Service** on Render.
3. Connect your GitHub repository.
4. Use these settings:

```text
Runtime: Node
Build Command: npm install
Start Command: npm start
```

5. Add environment variables:

```text
MONGO_URI=your MongoDB Atlas connection string
JWT_SECRET=your long random production secret
```

6. Deploy and open your Render URL.

---

## 🧭 Troubleshooting

| Problem | Possible Solution |
|----------|------------------|
| ❌ *Login/Register fails* | Check that the backend is running and MongoDB is connected. |
| ⚠️ *MongoDB connection error* | Verify `MONGO_URI`, Atlas password, and network access settings. |
| ⛔ *Unauthorized request* | Log in again so the frontend gets a fresh JWT token. |
| 📡 *Frontend cannot reach API* | Locally, use `http://localhost:5000`; deployed app uses the deployed origin automatically. |
| 🧩 *Missing packages* | Run `npm install` from the project root. |
| 🧪 *No database available* | Use demo mode to preview the UI without backend data. |

---

## 👥 Collaborators

| Name | Role |
|------|------|
| Rohan Dhiman | Project owner and developer |
| Add teammate name | Collaborator |

To add collaborators on GitHub:

```text
Repository → Settings → Collaborators and teams → Add people
```

---

## 🔐 Security Notes

- Passwords are hashed with `bcryptjs`.
- JWT tokens are required for protected job routes.
- Users can only access jobs linked to their own account.
- Production deployments should use a strong `JWT_SECRET`.
- Never commit `.env`, database passwords, or secrets.

---

## 🧾 License

This project is open for learning, modification, and contribution.

<div align="center">

💙 Built for students, developers, and job seekers who want a clearer application pipeline.  
_“Track smarter. Follow up faster. Land better.”_

</div>
