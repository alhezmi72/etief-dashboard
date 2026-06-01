# Emerging Technologies Exploration & Assessment Dashboard (ETIEF)

## 🌐 Project Overview
ETIEF is an interactive dashboard built with **React 19** and **Vite** for exploring emerging technology trends, comparing multi-source assessments, and validating strategic innovation opportunities.

The app combines:
- A **framework-driven landing page** for motivation, objectives, and assessment stages
- An **interactive exploration dashboard** for technology datasets
- A **dataset consolidation engine** that clusters and normalizes technologies across multiple sources
- A **CSV uploader** for importing new datasets directly in the browser

## 🚀 What the App Does

### 1. Landing Page (`src/components/LandingPage.jsx`)
Provides the framework narrative for the dashboard:
- Strategic motivation and innovation objectives
- Assessment dimensions (TRL, impact, barriers, sustainability, strategic fit)
- Framework stages for scanning, assessment, prioritization, and monitoring
- Live dataset loading and consolidated summary via the `DatasetConsolidation` helper

### 2. Technology Exploration (`src/components/TechExploration.jsx`)
Core interactive tool for exploring technology datasets:
- Select among multiple sources: `Integrated`, `Claude`, `ChatGPT`, `Gemini`, `DeepSeek`
- Toggle a generated **Consolidated** dataset that merges the four primary sources
- Filter by technology category
- View technologies in a **radar-style ring view** powered by `TechRadarView.jsx`
- Drag and reposition entries in the hype curve view
- Export CSV snapshots and JSON dataset snapshots
- Add or replace dataset sources with `CSVUploader.jsx`

### 3. Dataset Consolidation (`src/components/DatasetConsolidation.jsx`)
Creates a consolidated dataset by:
- Normalizing similar technology names across source files
- Calculating a **Tech Impact Score (TIS)** for each entry
- Aggregating averages and standard deviations across source clusters
- Determining consensus Hype Cycle phase and category
- Filtering low-confidence or low-maturity entries
- Producing a balanced, ranked selection of candidate technologies

### 4. Supporting Components
- `TechRadarView.jsx` — renders an adoption radar with concentric rings and category sectors
- `HypeCyclePreview.jsx` — lightweight preview of technology positions on the hype curve
- `CSVUploader.jsx` — drag-and-drop CSV upload with preview and new-source / replace-source flow
- `useCSVExplorationDatasets.js` — hook for loading CSV files from `public/data/Exploration`

## 📁 Project Structure

```
etief-dashboard/
├── Dockerfile
├── eslint.config.js
├── index.html
├── package.json
├── vite.config.js
├── README.md
├── public/
│   └── data/
│       └── Exploration/
│           ├── ChatGPT.csv
│           ├── Claude.csv
│           ├── DeepSeek.csv
│           ├── Gemini.csv
│           ├── Integrated-gpt.csv
│           └── Integrated.csv
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── App.css
    ├── index.css
    ├── framework-presentation.html
    ├── assets/
    └── components/
        ├── LandingPage.jsx
        ├── TechExploration.jsx
        ├── TechRadarView.jsx
        ├── HypeCyclePreview.jsx
        ├── DatasetConsolidation.jsx
        ├── CSVUploader.jsx
        └── useCSVExplorationDatasets.js
```

## 🛠️ Installation

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Open the local URL shown by Vite (usually `http://localhost:5173`).

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## 🐳 Docker

Build the container:

```bash
docker build -t etief-dashboard .
```

Run the container:

```bash
docker run -d -p 8080:8080 etief-dashboard
```

Then open:

`http://localhost:8080`

## 🧩 Technology Stack
- React 19
- Vite
- Tailwind CSS
- Lucide React
- PapaParse
- ESLint
- Docker

## 📌 Notes
- The app loads CSV data from `public/data/Exploration/`
- The consolidated dataset is generated from `Claude.csv`, `ChatGPT.csv`, `Gemini.csv`, and `DeepSeek.csv`
- `Integrated.csv` is available as a built-in source
- The upload flow lets users add or replace sources without editing application code

## 📋 Available Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```
