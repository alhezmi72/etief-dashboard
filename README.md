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
