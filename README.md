# JobLens

JobLens is a full-stack job application tracker for organizing a job search from first application to offer. It includes authentication, application CRUD, status and priority tracking, dashboard stats, and analytics charts.

## Live Demo

Add your deployed URL here after publishing:

```text
https://your-joblens-site.onrender.com
```

## Features

- Register and log in with JWT-based authentication
- Store user accounts and applications in MongoDB
- Add, edit, delete, search, filter, and sort job applications
- Track status: `Applied`, `Interview`, `Offer`, `Rejected`, `Ghosted`, `Withdrawn`
- Track priority: `High`, `Medium`, `Low`
- Dashboard with totals, interview count, offer count, rejection count, and interview rate
- Analytics charts powered by Chart.js
- Demo mode when the backend is unavailable
- Responsive layout with a mobile sidebar

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Authentication: JWT and bcryptjs
- Charts: Chart.js

## Collaborators

- Rohan Dhiman - Project owner and developer
- Add teammate names here after inviting them to the GitHub repository

## Project Structure

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

## Local Setup

### 1. Prerequisites

Install these first:

- Node.js 18 or newer
- npm
- MongoDB locally, or a MongoDB Atlas connection string

### 2. Install Dependencies

From the project root:

```bash
npm install
```

You can also install from the backend folder:

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root or set environment variables in your hosting platform:

```text
PORT=5000
MONGO_URI=mongodb://localhost:27017/jobtracker
JWT_SECRET=replace-with-a-long-random-secret
```

For MongoDB Atlas, use a connection string like:

```text
mongodb+srv://username:password@cluster-name.mongodb.net/jobtracker?retryWrites=true&w=majority
```

### 4. Start the App

From the project root:

```bash
npm start
```

The app runs at:

```text
http://localhost:5000
```

The Express server also serves the frontend from the `frontend/` folder, so you do not need a separate frontend build step.

### 5. Seed Demo Data

Optional, but useful for testing:

```bash
npm run seed
```

Demo login:

```text
Email: demo@joblens.app
Password: demo123
```

## API Reference

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/register` | No | Create a new user account |
| `POST` | `/login` | No | Log in and receive a JWT |
| `GET` | `/jobs` | Yes | Get the current user's applications |
| `POST` | `/jobs` | Yes | Create an application |
| `PUT` | `/jobs/:id` | Yes | Update an application |
| `DELETE` | `/jobs/:id` | Yes | Delete an application |
| `GET` | `/stats` | Yes | Get summary stats |

`GET /jobs` supports these query parameters:

- `status`
- `priority`
- `search`
- `sort`

## Deployment

This project is ready to deploy as one Node.js web service because the backend serves the frontend.

### Recommended: Render

1. Push this project to GitHub.
2. Create a new Web Service on Render.
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

6. Deploy and open the generated Render URL.

### MongoDB Atlas Checklist

- Create a free Atlas cluster.
- Create a database user.
- Add your IP address, or use `0.0.0.0/0` for broad deploy access.
- Copy the connection string into `MONGO_URI`.
- Replace `<password>` with the database user's real password.

## Push to GitHub

If this folder is not already a Git repo, run:

```bash
git init
git add .
git commit -m "Initial JobLens app"
```

Then create an empty GitHub repository and connect it:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

Do not commit `.env` or `node_modules/`. They are ignored by `.gitignore`.

## Notes

- The frontend automatically uses `http://localhost:5000` during local development.
- After deployment, the frontend uses the deployed site URL as the API base.
- If the backend cannot be reached during login, the UI can load demo mode for presentation.
- Extra explanation files are available in `docs/` for viva, interview, or project walkthrough prep.
