## 🚀 Setup Instructions

### 1️⃣ Clone the Repository

Clone the project to your local system using:

```bash
git clone https://github.com/Eyeronical/Discussion-Forum.git
cd Discussion-Forum
```

---

### 2️⃣ Create a `.env` File in the Root Directory

In the root folder, create a file named `.env` and add the following:

```bash
JWT_SECRET=changeme
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
```

> ⚠️ **Note:** Make sure this file is **not committed** to GitHub — it’s already listed in `.gitignore`.

---

### 3️⃣ Build and Run Using Docker

Use Docker Compose to build and start all services together:

```bash
docker compose up --build
```

This will automatically start:
- 🗄️ **PostgreSQL** (as the database)
- ⚙️ **Node.js Backend API** (on port **4000**)
- 💻 **React Frontend** (on port **3000**)

Once everything builds successfully, open your browser and go to:

👉 [http://localhost:3000](http://localhost:3000)

You can now create posts, reply, upvote, and test real-time updates locally.
