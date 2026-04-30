# Emerging Technologies Exploration & Assessment Dashboard (ETIEF)

## 🌐 Introduction
This project provides an interactive web dashboard to **explore and assess emerging technologies** expected to shape 2025 and beyond. Built with React and Vite, it combines a theoretical framework with practical tools for technology evaluation.

### 📑 Dashboard Sections

#### 1. **Landing Page** (`LandingPage.jsx`)
Presents the theoretical foundation of the framework, including:
- Framework objectives and methodology
- Exploration and assessment stages
- Integration of Gartner's Hype Cycle concepts
- Overview of the exploration and assessment tools

#### 2. **Technologies Exploration Tool** (`TechExploration.jsx`, `TechExploration-7.jsx`)
Interactive visualization of emerging technologies from multiple LLM sources:
- **Data Sources**: ChatGPT, Claude, DeepSeek, Google Gemini
- **Integrated Dataset**: Consolidated view combining all four sources
- **Features**: Navigate, filter, and explore technologies by category and hype cycle phase
- **Extensibility**: Add new technology lists by placing CSV files in `public/data/Exploration/`

#### 3. **Technologies Assessment Tool** (`DatasetConsolidation.jsx`)
Comparative evaluation and analysis component:
- Compare technology assessments across different LLM models
- View aggregated scores and metrics
- Analyze insights from multiple AI perspectives
- Extensible dataset support for new assessments

#### 4. **Supporting Components**
- **HypeCyclePreview.jsx** — Visual preview of the Gartner Hype Cycle framework
- **CSVUploader.jsx** — Utility for uploading and managing CSV datasets
- **useCSVExplorationDatasets.js** — Custom React hook for CSV data handling

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

## ⚙️ Run the project on Github Page 
You can deploy the web page on GitHub infrastructure and let GitHub run it as a Github page following `https://docs.github.com/en/pages`. 

1. Ensure that the path `./dist` is defined in the `.github/workflows/static.yml` file under the upload-pages-artifact step. Update the path to point to this directory:

```bash
- name: Upload artifact
  uses: actions/upload-pages-artifact@v3
  with:
    # Point this to your public directory
    path: ./dist
``` 

Run the following command: 

2. Install dependencies:

```bash
npm install
```  
3. Build the project:

```bash
npm run build
```
4. Commit the project 
5. Open the following URL `https://alhezmi72.github.io/etief-dashboard/`, where `alhezmi72` is the name of the repository owner and the `etief-dashboard` is the project name.

## 🏗️ Project Structure

```
etief-dashboard/
├── Dockerfile              # Docker configuration for containerized deployment
├── eslint.config.js        # ESLint configuration
├── index.html              # Main HTML entry point
├── package.json            # Project dependencies and scripts
├── vite.config.js          # Vite build configuration
├── README.md               # Project documentation
├── public/
│   └── data/
│       └── Exploration/    # CSV datasets for exploration tool
│           ├── ChatGPT.csv
│           ├── Claude.csv
│           ├── DeepSeek.csv
│           ├── Gemini.csv
│           ├── Integrated-gpt.csv
│           └── Integrated.csv
└── src/
    ├── main.jsx            # React entry point
    ├── App.jsx             # Main application component
    ├── App.css             # Global styles
    ├── index.css           # Base styles
    ├── framework-presentation.html  # Framework documentation
    ├── assets/             # Static assets
    └── components/
        ├── LandingPage.jsx                 # Landing page with framework overview
        ├── TechExploration.jsx             # Interactive technology exploration tool
        ├── TechExploration-7.jsx           # Alternative exploration component
        ├── HypeCyclePreview.jsx            # Hype Cycle visualization preview
        ├── DatasetConsolidation.jsx        # Data consolidation component
        ├── CSVUploader.jsx                 # CSV data uploader utility
        └── useCSVExplorationDatasets.js    # Custom hook for handling CSV datasets
```

## LLM Prompts 
### Exploration Dataset Retrieval  
The framework tools relays on the datasets retrieved from the LLMs: ChatGPT, Claude, DeepSeek and Gemini. The following prompt can be used to retrieve the data: 

```text
Update the list of potential emerging technologies for the next 5 to 10 years. Limit the list to the top 30 technologies.  The technologies can be sourced from recent publications and information from Gartner, WEF, McKinsey, and CB Insights, possibly from this year 2026. 
Each technology should be assigned to a specific phase as defined by Gartner’s Hype Cycle: Innovation Trigger, Peak of Inflated Expectations, Trough of Disillusionment, Slope of Enlightenment, and Plateau of Productivity.
Each technology should include the following parameters: id,name,phase,x,y,trl,impact,barriers,sustainability,strategicFit,category,notes,source. 
Put the string of each string parameter of each technology between two double quotation marks  

The x and y coordinates for each Gartner’s Hype Cycle phase should be within the following specified range:
  -	Innovation Trigger:  x_start = 0, x_end = 20  and y ≈ 100 down to 29
  -	Peak of Inflated Expectations: x_start = 20,  x_end = 35 and y ≈ 11 to 28
  -	Trough of Disillusionment: x_start = 35 and x_end = 50 and y ≈ 12 to 37
  -	Slope of Enlightenment: x_start = 50 and x_end = 75 and y ≈ 38 to 58
  -	Plateau of Productivity: x_start = 75 and x_end = 100 and y ≈ 45 to 52
The strategicFit should align with QMIC’s vision, mission, and available R&D topics on their website (www.qmic.com).
The technologies should be categorized under the following categories:
  - AI & Automation
  - Connectivity & IoT
  - Security, Trust & Privacy
  - Energy, Climate & Materials
  - Computing & Infrastructure
  - Quantum Technologies
  - Robotics & Physical Systems
  - Health, Bio & Experience Tech
Use CSV format to plot the list of parameters in the order specified above.
```
### Integrated Dataset Retrieval
Data consolidation is automatically created based on the four datasets retrieved via the previous prompt. However, it can be computed via any LLMs by performing the following prompt optionally: 

```text
Create a react component that shall consolidate and combine the four datasets: ChatGPT.csv, Claud.csv, Gemini.csv, and DeepSeek.csv, in one integrated dataset. 
This integrated dataset should be added to the list of data sources in the TechExploration.jsx file. It should also be displayed at the top of the technology exploration data source list and considered as the default dataset.
This dataset should be calculated in a separate component so that it can be rendered in the header section of the LeadingPage.jsx and replace the HypeCyclePreview component. Additionally, it should be included as a new data source in the TechExploration.jsx file in addition to the four data source, ChatGPT, Claud, Gemini, and DeepSeek.
The consolidation should consider the following steps:
  -	Compute TIS per Technology per Dataset: calculate TIS for every entry in: Claude, ChatGPT, Gemini and DeepSeek. Result: multiple TIS values for “similar” technologies across datasets
  -	Technology Clustering / Deduplication following the following mapping as defined in the following JavaScritp:
  -	Aggregate Scores Across Datasets: For each clustered technology: Compute Average TIS and Standard deviation (confidence indicator)
  -	Category Coverage Constraint: Ensure each category has at least one technology: Preferably:
    o	3–5 technologies per category (balanced portfolio)
    o	If missing: Add highest-TIS candidate from that category even if below threshold
  -	Ensure each category has at least one technology
  -	Preferably:
  -	3-5 technologies per category (balanced portfolio)
  -	If missing:
  -	Add highest-TIS candidate from that category even if below threshold
  -	Ranking and Filtering: Rank all aggregated technologies by TIS_avg. Apply filters: Remove very low TRL (e.g., TRL < 3) unless strategic and Remove redundant entries within same cluster
```

## 🧱 Technology Stack
- **React 19** — modern UI library for interactive components
- **Vite** — lightning-fast build tool and development server
- **Tailwind CSS** — utility-first CSS framework for styling
- **Lucide React** — icon library for UI components
- **PapaParse** — CSV parser for handling technology datasets
- **ESLint** — code quality and style enforcement
- **Python HTTP Server** — lightweight static file hosting (in Docker)
- **Docker** — containerization for consistent deployment across environments

## 📋 Available Scripts

Run these commands in the project root:

```bash
npm run dev       # Start development server (http://localhost:5173)
npm run build     # Build for production (creates dist/)
npm run lint      # Check code quality with ESLint
npm run preview   # Preview production build locally
```
