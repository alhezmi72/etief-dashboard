# Emerging Technologies Exploration & Assessment Dashboard (ETIEF)

## 🌐 Introduction
This project provides an interactive web dashboard to **explore and assess emerging technologies** expected to shape 2025 and beyond.

It is structured into two sub-projects, each developed as a **React-based** application and combined into a single containerized web solution.

---

### 🚀 technologies-exploration
This sub-project lists **potential emerging technologies** proposed by various Large Language Models (LLMs) such as:
- ChatGPT  
- Claude.ai  
- Google Gemini  
- DeepSeek  

It allows users to **navigate, filter, and explore** technologies interactively.

---

### 🔍 technologies-assessment
This sub-project presents the **assessment and evaluation** of a fixed set of emerging technologies, as analyzed by different LLMs.  
It enables users to **compare insights** and view aggregated assessments across multiple AI models.

---

## 🐳 Run as a Docker Container

Both projects can be started together inside a single **Docker container**, or each can be run independently using **Node.js**.

---

### 🔧 Clean and Rebuild the Docker Image
```bash
docker build -t etief-dashboard .

Run the Container
docker run -d -p 8080:8080 etief-dashboard

Then open the following URLs in your browser:
Component	URL
Landing Page	http://localhost:8080
technologies-exploration	http://localhost:8080/page1/
technologies-assessment	http://localhost:8080/page2/
🏗️ Project Construction & Structure
The Docker build process follows a multi-stage setup:
Stage 1 – Build React Applications
Each sub-project (tech-dashboard-qmic and tech-dashboard-comp) is built using Node.js and Vite.
Static assets are generated under their respective dist/ directories.
Stage 2 – Assemble Final Web Server
The landing page (html/index.html) is copied to /app/html.
The built React apps are placed under /app/html/page1 and /app/html/page2.
A lightweight Python HTTP server is started on port 8080 to serve the combined structure.
The final directory layout inside the container looks like this:
/app/html/
├── index.html                 # Main landing page
├── page1/                     # React app: technologies-exploration
│   ├── index.html
│   └── assets/
└── page2/                     # React app: technologies-assessment
    ├── index.html
    └── assets/
This ensures both React dashboards and the landing page are accessible from the same container.
🧩 Run Each Project Independently
If you want to run a specific sub-project locally without Docker:
Change to the corresponding directory:
cd technologies-exploration
# or
cd technologies-assessment
Install dependencies:
npm install
Start the development server:
npm run dev
Open the provided local URL (usually http://localhost:5173) in your browser.
🧱 Technology Stack
React 18 + Vite — for front-end rendering and fast builds
Python HTTP Server — for lightweight static hosting
Docker (multi-stage) — for environment consistency and minimal runtime footprint