# Emerging Technologies Exploration & Assessment Dashboard (ETIEF)

## 🌐 Introduction
This project provides an interactive web dashboard to **explore and assess emerging technologies** expected to shape 2025 and beyond.

It is structured into two part, a theoretical discussion and two tools each developed as a **React-based** application and combined into a single containerized web solution.

---
### Landing page
The landing page describes the theoretical aspect of the framework, namely: framework objectives and exploration and assessment steps and stages. 

### 🚀 Technologies Exploration Tool
These lists **potential emerging technologies** proposed by various Large Language Models (LLMs) such as:
- ChatGPT  
- Claude.ai  
- Google Gemini  
- DeepSeek

It allows users to **navigate, filter, and explore** technologies interactively. These lists can be extended by adding the new list as CSV file into the data folder under the public path.  

---

### 🔍 Technologies Assessment Tool
The assessment tool presents the **assessment and evaluation** of a fixed set of emerging technologies, as analyzed by different LLMs.  
It enables users to **compare insights** and view aggregated assessments across multiple AI models. A new dataset of the emerging technologies can be added similar to the exploration dataset. The corresponding component shall be extended too. 

---

## 🐳 Run as a Docker Container

Both projects can be started together inside a single **Docker container**, or each can be run independently using **Node.js**.

---

### 🔧 Clean and Rebuild the Docker Image

```bash
docker build -t etief-dashboard .
```

### Run the Container

```bash 
docker run -d -p 8080:8080 etief-dashboard
```

Then open the following URLs in your browser:

| Component	| URL |
| ------------- |:-------------:|
| Landing Page |	`http://localhost:8080` |

### 🏗️ Project Construction & Structure
The Docker build process follows a multi-stage setup:

**Stage 1 – Build React Applications**
Build the application which is is based on Node.js and Vite.
Static assets are generated under their respective dist/ directories.

**Stage 2 – Assemble Final Web Server**
All files including the HTML and the JavaScripts are copied to /app/html 
A lightweight Python HTTP server is started on port 8080 to serve the combined structure.

## 🧩 Run the Project without Docker
If you want to run the project locally without Docker:

Run the following command: 

1. Install dependencies:

```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

4. Open the provided local URL (usually `http://localhost:5173`) in your browser.

## 🏗️ Project Structure

```lua
etief-dashboard/
├── index.html   # Landing page
├── package.json
├── vite.config.js
└── src/                

```

## 🧱 Technology Stack
- **React 18 + Vite** — for front-end rendering and fast builds
- **Python HTTP Server** — for lightweight static hosting
- **Docker** — for environment consistency and portability
