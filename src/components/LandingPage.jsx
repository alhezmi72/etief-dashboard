import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  Target,
  Scan,
  ClipboardCheck,
  Map,
  Activity,
  ArrowRight,
  ExternalLink,
  PieChart,
  Wrench,
  BarChart3,
} from "lucide-react";
import {
  consolidateDatasets,
  ConsolidatedDatasetPreview,
} from "./DatasetConsolidation";

import HypeCyclePreview from "./HypeCyclePreview";

const LandingPage = ({ setCurrentPage }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [datasets, setDatasets] = useState([]);
  const [consolidatedData, setConsolidatedData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllDatasets();
  }, []);

  const loadAllDatasets = async () => {
    try {
      setLoading(true);

      // Load all CSV files from Exploration folder
      const [claudeData, chatgptData, geminiData, deepseekData] =
        await Promise.all([
          loadCSV("./data/Exploration/Claude.csv"),
          loadCSV("./data/Exploration/ChatGPT.csv"),
          loadCSV("./data/Exploration/Gemini.csv"),
          loadCSV("./data/Exploration/DeepSeek.csv"),
        ]);

      const datasetsArray = [claudeData, chatgptData, geminiData, deepseekData];
      setDatasets(datasetsArray);

      // Generate consolidated dataset
      const consolidated = consolidateDatasets(datasetsArray);
      setConsolidatedData(consolidated);

      setLoading(false);
    } catch (error) {
      console.error("Error loading datasets:", error);
      setLoading(false);
    }
  };

  const loadCSV = async (filepath) => {
    const response = await fetch(filepath);
    const text = await response.text();
    return parseCSV(text);
  };

  const parseCSV = (text) => {
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length === 0) return [];

    const headers = lines[0]
      .split(",")
      .map((h) => h.trim().replace(/^"|"$/g, ""));

    return lines
      .slice(1)
      .map((line) => {
        const values = [];
        let current = "";
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === "," && !inQuotes) {
            values.push(current.trim().replace(/^"|"$/g, ""));
            current = "";
          } else {
            current += char;
          }
        }
        values.push(current.trim().replace(/^"|"$/g, ""));

        const obj = {};
        headers.forEach((header, index) => {
          const value = values[index];
          // Parse numeric fields
          if (
            [
              "id",
              "x",
              "y",
              "trl",
              "impact",
              "barriers",
              "sustainability",
              "strategicFit",
            ].includes(header)
          ) {
            obj[header] = parseFloat(value) || 0;
          } else {
            obj[header] = value || "";
          }
        });
        return obj;
      })
      .filter((obj) => obj.name);
  };

  const motivations = [
    {
      title: "Strategic Motivation",
      desc: "Anticipate disruption instead of reacting to it",
    },
    {
      title: "Operational Motivation",
      desc: "Reduce uncertainty in technology adoption",
    },
    {
      title: "Innovation Motivation",
      desc: "Stimulate a culture of foresight and experimentation",
    },
    {
      title: "Business & Economic Motivation",
      desc: "Drive competence and attract strategic partners",
    },
    {
      title: "Governance & Risk Motivation",
      desc: "Establish an evidence-based innovation governance model",
    },
  ];

  const objectives = [
    "Develop a framework to explore and evaluate emerging technologies for the next 5 to 10 years",
    "Systematically identify short-term (1-year) and long-term (5-year) emerging technologies",
    "Evaluate their potential business, operational, and societal impact",
    "Prioritize technologies for R&D, partnerships, and innovation investments",
    "Guide strategic decision-making for competitive differentiation and efficiency",
  ];

  const assessmentCriteria = [
    {
      dimension: "Technology Maturity",
      criteria: "TRL, time to market, research activity",
      purpose: "Distinguish short-term vs long-term",
    },
    {
      dimension: "Business Impact",
      criteria: "Cost reduction, revenue growth, new business models",
      purpose: "Quantify strategic and financial benefits",
    },
    {
      dimension: "Strategic Fit",
      criteria: "Alignment with vision, ecosystem relevance",
      purpose: "Ensure relevance to mission",
    },
    {
      dimension: "Adoption Barriers",
      criteria: "Regulatory, skills gap, infrastructure",
      purpose: "Estimate feasibility and readiness",
    },
    {
      dimension: "Sustainability & Ethics",
      criteria: "ESG impact, data privacy, circular economy",
      purpose: "Ensure responsible innovation",
    },
  ];

  const MatrixQuadrant = ({ title, desc, color }) => (
    <div className={`p-6 border-2 ${color} rounded-lg`}>
      <h4 className="font-bold text-lg mb-2">{title}</h4>
      <p className="text-sm">{desc}</p>
    </div>
  );

  // Hype Cycle Component for Header
  const HypeCycleVisualization = ({ technologies }) => {
    const [clickedTech, setClickedTech] = React.useState(null);

    const phases = [
      { name: "Innovation Trigger", x: 0, width: 20 },
      { name: "Peak of Inflated Expectations", x: 20, width: 15 },
      { name: "Trough of Disillusionment", x: 35, width: 15 },
      { name: "Slope of Enlightenment", x: 50, width: 25 },
      { name: "Plateau of Productivity", x: 75, width: 25 },
    ];

    const hypeCurvePath =
      "M 50,400 Q 150,100 250,50 Q 350,20 450,150 Q 500,250 550,230 Q 700,200 850,180";

    const CATEGORY_PALETTE = [
      { fill: "#4f46e5", stroke: "#312e81" }, // indigo
      { fill: "#0891b2", stroke: "#155e75" }, // cyan
      { fill: "#16a34a", stroke: "#14532d" }, // green
      { fill: "#ea580c", stroke: "#7c2d12" }, // orange
      { fill: "#9333ea", stroke: "#581c87" }, // purple
      { fill: "#db2777", stroke: "#831843" }, // pink
      { fill: "#ca8a04", stroke: "#713f12" }, // yellow
      { fill: "#0f766e", stroke: "#134e4a" }, // teal
      { fill: "#dc2626", stroke: "#7f1d1d" }, // red
      { fill: "#2563eb", stroke: "#1e3a8a" }, // blue
    ];

    const catList = Array.from(
      new Set(technologies.map((t) => t.category).filter(Boolean)),
    ).sort();

    const getCategoryColor = (cat) =>
      CATEGORY_PALETTE[catList.indexOf(cat) % CATEGORY_PALETTE.length] ||
      CATEGORY_PALETTE[0];

    const handleTechClick = (tech) => {
      if (clickedTech?.id === tech.id) {
        setClickedTech(null);
      } else {
        setClickedTech(tech);
      }
    };

    return (
      <div className="w-full h-full bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 relative">
        <svg
          viewBox="0 0 900 450"
          className="w-full h-full"
          style={{ minHeight: "350px" }}
        >
          <defs>
            <pattern
              id="grid-header"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="900" height="450" fill="url(#grid-header)" />

          <path
            d={hypeCurvePath}
            fill="none"
            stroke="#ffffff"
            strokeWidth="4"
            opacity="0.8"
          />

          {phases.map((phase, i) => (
            <g key={i}>
              <rect
                x={phase.x * 9}
                y="420"
                width={phase.width * 9}
                height="30"
                fill="rgba(255, 255, 255, 0.1)"
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth="1"
              />
              <text
                x={phase.x * 9 + (phase.width * 9) / 2}
                y="437"
                textAnchor="middle"
                className="text-[9px] font-semibold fill-white"
              >
                {phase.name}
              </text>
            </g>
          ))}

          {technologies.map((tech) => {
            const col = getCategoryColor(tech.category);
            const isClicked = clickedTech?.id === tech.id;
            return (
              <g
                key={tech.id}
                onClick={() => handleTechClick(tech)}
                className="cursor-pointer"
              >
                {isClicked && (
                  <circle
                    cx={tech.x * 9}
                    cy={tech.y * 4}
                    r={10}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2"
                    opacity="0.6"
                  />
                )}
                <circle
                  cx={tech.x * 9}
                  cy={tech.y * 4}
                  r={isClicked ? 7 : 6}
                  fill={col.fill}
                  stroke="#ffffff"
                  strokeWidth={isClicked ? 2 : 1.5}
                  opacity="0.9"
                />
              </g>
            );
          })}
        </svg>

        {/* Technology details tooltip - shown outside SVG */}
        {clickedTech && (
          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
            style={{ minWidth: 200 }}
          >
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 shadow-xl text-center">
              <p className="text-white font-bold text-sm leading-tight">
                {clickedTech.name}
              </p>
              {clickedTech.trl != null && (
                <p className="text-indigo-200 text-[10px] mt-1">
                  TRL: {clickedTech.trl}/9
                </p>
              )}
              {clickedTech.impact != null && (
                <p className="text-indigo-200 text-[10px]">
                  Impact: {clickedTech.impact}/10
                </p>
              )}
              {clickedTech.category && (
                <p className="text-indigo-200 text-[10px]">
                  {clickedTech.category}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderOverview = () => (
    <div className="space-y-12">
      <section>
        <h2 className="text-3xl font-bold mb-6 text-gray-900">
          Framework Motivation
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {motivations.map((m, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-lg border-l-4 border-teal-500 shadow-sm hover:shadow-md transition-all"
            >
              <h3 className="font-bold text-lg mb-3 text-teal-700">
                {m.title}
              </h3>
              <p className="text-gray-700 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-6 text-gray-900">
          Purpose and Objectives
        </h2>
        <div className="bg-white p-8 rounded-lg shadow-sm border-t-4 border-teal-500">
          <ul className="space-y-4">
            {objectives.map((obj, i) => (
              <li key={i} className="flex items-start">
                <ChevronRight className="w-6 h-6 text-teal-600 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-gray-700 text-lg">{obj}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-50 p-10 rounded-xl">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">
          Framework Stages
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Scan,
              title: "Stage 1",
              subtitle: "Scanning & Identification",
              color: "from-teal-500 to-teal-600",
            },
            {
              icon: ClipboardCheck,
              title: "Stage 2",
              subtitle: "Assessment & Classification",
              color: "from-blue-500 to-blue-600",
            },
            {
              icon: Map,
              title: "Stage 3",
              subtitle: "Prioritization & Roadmapping",
              color: "from-indigo-500 to-indigo-600",
            },
            {
              icon: Activity,
              title: "Stage 4",
              subtitle: "Action & Monitoring",
              color: "from-purple-500 to-purple-600",
            },
          ].map((stage, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all hover:-translate-y-2 cursor-pointer group"
            >
              <div
                className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${stage.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
              >
                <stage.icon className="w-8 h-8 text-white" />
              </div>
              <div className="font-bold text-gray-900 text-center mb-1">
                {stage.title}
              </div>
              <div className="text-sm text-gray-600 text-center leading-tight">
                {stage.subtitle}
              </div>
            </div>
          ))}
        </div>
      </section>
      <div>{renderTools()}</div>
    </div>
  );

  const renderConsolidatedSummary = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
          <BarChart3 className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">
          Consolidated Technology Portfolio
        </h2>
      </div>
     
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-lg border-l-4 border-yellow-500">
          <p className="text-gray-700 text-lg">
            Multi-source consensus analysis integrating insights from{" "}
            <strong className="text-yellow-700">
              Claude, ChatGPT, Gemini, and DeepSeek
            </strong>{" "}
            to provide a comprehensive view of emerging technologies in 2026.
          </p>
    
        
      </div>

      {consolidatedData ? (
        <ConsolidatedDatasetPreview datasets={datasets} />
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading consolidated analysis...</p>
        </div>
      )}
      <section className="bg-white p-8 rounded-lg shadow-md border-l-4 border-indigo-500">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Framework Tools</h2>
      
      <div className="grid gap-6">
        <button
          onClick={() => setCurrentPage("exploration")}
          className="group block p-6 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow-md hover:shadow-xl transition-all hover:-translate-y-1 text-white text-left border-none cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-bold">Technology Exploration</h3>
            <ExternalLink className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </div>
          <p className="text-teal-50">
            Explore emerging technologies with interactive visualizations and multi-source insights from leading AI models
          </p>
        </button>
      </div>
    </section>
    </div>
  );

  const renderStage1 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
          <Scan className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">
          Stage 1: Scanning & Identification
        </h2>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md border-t-4 border-teal-500">
        <h3 className="text-2xl font-bold mb-5 text-teal-700">Inputs</h3>
        <ul className="space-y-3 text-gray-700">
          <li className="flex items-start">
            <ChevronRight className="w-5 h-5 text-teal-600 mr-3 mt-0.5 flex-shrink-0" />
            Scientific publications, patents, and R&D trends
          </li>
          <li className="flex items-start">
            <ChevronRight className="w-5 h-5 text-teal-600 mr-3 mt-0.5 flex-shrink-0" />
            Startup and VC investment signals
          </li>
          <li className="flex items-start">
            <ChevronRight className="w-5 h-5 text-teal-600 mr-3 mt-0.5 flex-shrink-0" />
            Market analyses and technology radars (e.g., Gartner Hype Cycle, CB
            Insights)
          </li>
          <li className="flex items-start">
            <ChevronRight className="w-5 h-5 text-teal-600 mr-3 mt-0.5 flex-shrink-0" />
            Academic and industrial collaborations
          </li>
          <li className="flex items-start">
            <ChevronRight className="w-5 h-5 text-teal-600 mr-3 mt-0.5 flex-shrink-0" />
            Policy and standardization developments
          </li>
        </ul>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md border-t-4 border-teal-500">
        <h3 className="text-2xl font-bold mb-5 text-teal-700">Process</h3>
        <div className="space-y-5">
          <div className="border-l-4 border-teal-600 pl-6 py-2">
            <h4 className="font-bold text-lg text-gray-900 mb-2">
              Technology Horizon Scanning (THS)
            </h4>
            <p className="text-gray-700">
              AI-driven data mining to identify emerging trends
            </p>
          </div>
          <div className="border-l-4 border-teal-600 pl-6 py-2">
            <h4 className="font-bold text-lg text-gray-900 mb-2">
              Expert Consultation
            </h4>
            <p className="text-gray-700">
              Delphi sessions or focus groups with domain specialists
            </p>
          </div>
          <div className="border-l-4 border-teal-600 pl-6 py-2">
            <h4 className="font-bold text-lg text-gray-900 mb-2">
              Clustering Techniques
            </h4>
            <p className="text-gray-700">
              LDA topic modeling, keyword mapping to identify emerging clusters
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStage2 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
          <ClipboardCheck className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">
          Stage 2: Assessment & Classification
        </h2>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-lg border-l-4 border-blue-500">
        <p className="text-gray-700 text-lg">
          Each technology is evaluated using a weighted scoring model (0–10
          scale) for each criterion, producing a{" "}
          <strong className="text-blue-700">Tech Impact Score (TIS)</strong>.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <tr>
              <th className="p-5 text-left font-bold">Dimension</th>
              <th className="p-5 text-left font-bold">Criteria Examples</th>
              <th className="p-5 text-left font-bold">Purpose</th>
            </tr>
          </thead>
          <tbody>
            {assessmentCriteria.map((item, i) => (
              <tr
                key={i}
                className={`${
                  i % 2 === 0 ? "bg-blue-50" : "bg-white"
                } hover:bg-blue-100 transition-colors`}
              >
                <td className="p-5 font-bold text-gray-900">
                  {item.dimension}
                </td>
                <td className="p-5 text-gray-700">{item.criteria}</td>
                <td className="p-5 text-gray-600">{item.purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderStage3 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
          <Map className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">
          Stage 3: Prioritization & Roadmapping
        </h2>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md border-t-4 border-indigo-500">
        <h3 className="text-2xl font-bold mb-5 text-indigo-700">
          Technology Portfolio Matrix
        </h3>
        <p className="text-gray-700 mb-8 text-lg">
          Technologies are classified into four quadrants based on business
          impact and time horizon:
        </p>

        <div className="grid grid-cols-2 gap-5 mb-8 text-gray-700">
          <MatrixQuadrant
            title="Quick Wins"
            desc="Short-term, high impact - Adopt soon"
            color="border-green-500 bg-green-50"
          />
          <MatrixQuadrant
            title="Strategic Bets"
            desc="Long-term, high impact - Monitor & invest selectively"
            color="border-blue-500 bg-blue-50"
          />
          <MatrixQuadrant
            title="Incremental Innovations"
            desc="Short-term, low impact - Consider for efficiency"
            color="border-yellow-500 bg-yellow-50"
          />
          <MatrixQuadrant
            title="Exploratory Research"
            desc="Long-term, low impact - Watch and learn"
            color="border-purple-500 bg-purple-50"
          />
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md border-t-4 border-indigo-500">
        <h3 className="text-2xl font-bold mb-5 text-indigo-700">
          Technology Roadmap
        </h3>
        <div className="space-y-5">
          <div className="flex items-start gap-5">
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white font-bold px-6 py-3 rounded-lg whitespace-nowrap shadow-md">
              1 Year
            </div>
            <div className="flex-1 bg-green-50 p-5 rounded-lg border-l-4 border-green-500">
              <p className="text-gray-700 text-lg">
                Pilot and integrate mature emerging technologies
              </p>
            </div>
          </div>
          <div className="flex items-start gap-5">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold px-6 py-3 rounded-lg whitespace-nowrap shadow-md">
              2-3 Years
            </div>
            <div className="flex-1 bg-blue-50 p-5 rounded-lg border-l-4 border-blue-500">
              <p className="text-gray-700 text-lg">
                Scale selected technologies and build capability
              </p>
            </div>
          </div>
          <div className="flex items-start gap-5">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white font-bold px-6 py-3 rounded-lg whitespace-nowrap shadow-md">
              5+ Years
            </div>
            <div className="flex-1 bg-purple-50 p-5 rounded-lg border-l-4 border-purple-500">
              <p className="text-gray-700 text-lg">
                Invest in disruptive and transformative innovations
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStage4 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
          <Activity className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">
          Stage 4: Action & Monitoring
        </h2>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md border-t-4 border-purple-500">
        <h3 className="text-2xl font-bold mb-5 text-purple-700">
          Action Planning
        </h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <Target className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
            <p className="text-gray-700 text-lg">
              Define innovation projects or proofs of concept (PoCs)
            </p>
          </div>
          <div className="flex items-start gap-4">
            <Target className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
            <p className="text-gray-700 text-lg">
              Establish strategic partnerships with startups, universities, and
              R&D centers
            </p>
          </div>
          <div className="flex items-start gap-4">
            <Target className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
            <p className="text-gray-700 text-lg">
              Define KPIs such as ROI on innovation, adoption rate, or cost
              efficiency
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md border-t-4 border-purple-500">
        <h3 className="text-2xl font-bold mb-5 text-purple-700">Monitoring</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <ChevronRight className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
            <p className="text-gray-700 text-lg">
              Maintain a living "Emerging Technology Radar" updated quarterly or
              biannually
            </p>
          </div>
          <div className="flex items-start gap-4">
            <ChevronRight className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
            <p className="text-gray-700 text-lg">
              Include a feedback loop for lessons learned and changes in market
              dynamics
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-8 rounded-xl border-l-4 border-purple-500">
        <h3 className="text-2xl font-bold mb-5 text-gray-900">
          Governance and Sustainability
        </h3>
        <p className="text-gray-700 mb-6 text-lg">To ensure continuity:</p>
        <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-start gap-4">
            <ArrowRight className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
            <p className="text-gray-700 text-lg">
              Create an{" "}
              <strong className="text-purple-700">
                Emerging Technology Board (ETB)
              </strong>{" "}
              to steer strategy
            </p>
          </div>
          <div className="flex items-start gap-4">
            <ArrowRight className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
            <p className="text-gray-700 text-lg">
              Maintain a{" "}
              <strong className="text-purple-700">
                Technology Intelligence Unit
              </strong>{" "}
              (cross-functional: R&D, strategy, IT, business units)
            </p>
          </div>
          <div className="flex items-start gap-4">
            <ArrowRight className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
            <p className="text-gray-700 text-lg">
              Link framework outcomes to corporate innovation KPIs and budget
              allocation
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReport = () => (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-6">
        Risk & Maturity Report
      </h2>

      <div className="mb-8 p-8 bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-50 rounded-xl border-2 border-teal-300">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Executive Summary: Agentic AI Landscape
        </h3>
        <div className="space-y-4 text-gray-700">
          <p>
            <strong className="text-teal-700">Market Position:</strong> Agentic
            AI represents the next evolution of artificial intelligence, moving
            from assistive tools to autonomous decision-making systems.
            Currently positioned at the Innovation Trigger phase, with
            significant investment from major tech companies seeking automation
            advantages.
          </p>
          <p>
            <strong className="text-teal-700">Technology Readiness:</strong> The
            sector exhibits a Technology Readiness Level (TRL) of 4-5,
            indicating laboratory validation with some early field
            demonstrations. Multiple competing architectures are emerging.
          </p>
          <p>
            <strong className="text-teal-700">
              Critical Risks Identified:
            </strong>
          </p>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              <strong>Safety & Control:</strong> Autonomous agents may take
              unexpected actions with limited oversight mechanisms
            </li>
            <li>
              <strong>Liability & Accountability:</strong> Legal frameworks lag
              technological capabilities
            </li>
            <li>
              <strong>Data Privacy:</strong> Agents accessing sensitive data
              pose compliance risks
            </li>
            <li>
              <strong>Integration Complexity:</strong> Significant technical
              debt in legacy environments
            </li>
            <li>
              <strong>Workforce Disruption:</strong> Potential displacement
              requires careful change management
            </li>
          </ul>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 bg-red-50 rounded-xl border-2 border-red-300">
          <h4 className="text-xl font-bold text-red-700 mb-4">
            High-Priority Risks
          </h4>
          <div className="space-y-3">
            {[
              {
                name: "Safety & Alignment",
                level: "CRITICAL",
                color: "bg-red-600",
              },
              {
                name: "Regulatory Compliance",
                level: "CRITICAL",
                color: "bg-red-600",
              },
              {
                name: "Cost Overruns",
                level: "HIGH",
                color: "bg-orange-500",
              },
              {
                name: "Vendor Lock-in",
                level: "HIGH",
                color: "bg-orange-500",
              },
            ].map((risk, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200"
              >
                <span className="font-semibold text-gray-900">{risk.name}</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold text-white ${risk.color}`}
                >
                  {risk.level}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-teal-50 rounded-xl border-2 border-teal-300">
          <h4 className="text-xl font-bold text-teal-700 mb-4">
            Opportunity Areas
          </h4>
          <div className="space-y-3">
            {[
              {
                name: "Process Automation",
                roi: "HIGH ROI",
                color: "bg-teal-600",
              },
              {
                name: "Customer Service",
                roi: "HIGH ROI",
                color: "bg-teal-600",
              },
              {
                name: "Research & Development",
                roi: "MEDIUM ROI",
                color: "bg-blue-500",
              },
              {
                name: "Supply Chain Optimization",
                roi: "MEDIUM ROI",
                color: "bg-blue-500",
              },
            ].map((opp, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200"
              >
                <span className="font-semibold text-gray-900">{opp.name}</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold text-white ${opp.color}`}
                >
                  {opp.roi}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-8 bg-white rounded-xl border border-gray-200 mb-8">
        <h4 className="text-xl font-bold text-gray-900 mb-6">
          Technology Maturity Assessment
        </h4>
        <div className="space-y-6">
          {[
            {
              dimension: "Technical Capability",
              score: 65,
              desc: "Core functionality demonstrated but reliability issues remain",
            },
            {
              dimension: "Scalability",
              score: 45,
              desc: "Limited to controlled environments; production scaling unproven",
            },
            {
              dimension: "Security & Governance",
              score: 35,
              desc: "Minimal frameworks; industry standards still emerging",
            },
            {
              dimension: "Ecosystem Maturity",
              score: 50,
              desc: "Growing tooling and platforms; fragmented landscape",
            },
            {
              dimension: "Talent Availability",
              score: 40,
              desc: "Specialized skills required; significant talent gap",
            },
            {
              dimension: "Cost Efficiency",
              score: 55,
              desc: "Decreasing but still high operational costs",
            },
          ].map((item, i) => (
            <div key={i}>
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-gray-900">
                  {item.dimension}
                </span>
                <span className="font-bold text-teal-600">{item.score}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className={`h-3 rounded-full transition-all ${
                    item.score >= 60
                      ? "bg-teal-500"
                      : item.score >= 40
                        ? "bg-blue-500"
                        : "bg-red-500"
                  }`}
                  style={{ width: `${item.score}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-8 bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl border-2 border-teal-300">
        <h4 className="text-xl font-bold text-gray-900 mb-6">
          Strategic Recommendations
        </h4>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              period: "Short-Term (0-12 months)",
              color: "border-teal-500",
              items: [
                "Pilot projects in low-risk domains",
                "Establish governance frameworks",
                "Build internal expertise",
                "Monitor regulatory developments",
              ],
            },
            {
              period: "Mid-Term (1-2 years)",
              color: "border-blue-500",
              items: [
                "Scale successful pilots",
                "Develop custom agent frameworks",
                "Integrate with core systems",
                "Implement monitoring systems",
              ],
            },
            {
              period: "Long-Term (2-5 years)",
              color: "border-indigo-500",
              items: [
                "Enterprise-wide agent ecosystem",
                "Multi-agent orchestration",
                "Autonomous decision systems",
                "Competitive differentiation",
              ],
            },
          ].map((phase, i) => (
            <div
              key={i}
              className={`p-6 bg-white rounded-xl border-2 ${phase.color}`}
            >
              <h5 className="font-bold text-gray-900 mb-4">{phase.period}</h5>
              <ul className="space-y-2 text-sm text-gray-700">
                {phase.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <span className="text-teal-600 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 p-6 bg-white rounded-xl border border-gray-200">
        <h4 className="text-lg font-bold text-gray-900 mb-4">
          Market Intelligence Sources
        </h4>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          {[
            {
              source: "Gartner Analysis",
              text: "Positioned agentic AI at Innovation Trigger with 5-10 year horizon to plateau",
            },
            {
              source: "McKinsey Outlook",
              text: "Projects $4.4T annual economic impact from generative AI; agentic systems could double this",
            },
            {
              source: "CB Insights Tracking",
              text: "$12.3B invested in AI agents/automation startups in 2024; 43% YoY growth",
            },
            {
              source: "WEF Perspective",
              text: "Highlights ethical considerations and workforce transformation as critical success factors",
            },
          ].map((intel, i) => (
            <div key={i}>
              <strong className="text-teal-700">{intel.source}:</strong>
              <p className="text-gray-600 mt-1">{intel.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: "overview", label: "Overview", icon: Target },
    { id: "stage1", label: "Stage 1", icon: Scan },
    { id: "stage2", label: "Stage 2", icon: ClipboardCheck },
    { id: "stage3", label: "Stage 3", icon: Map },
    { id: "stage4", label: "Stage 4", icon: Activity },
    { id: "report", label: "Risk Report", icon: PieChart },
    { id: "portfolio", label: "Consolidated Portfolio", icon: BarChart3 },
  ];

  const renderTools = () => (
    <section className="bg-white p-8 rounded-lg shadow-md border-l-4 border-indigo-500">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Framework Tools</h2>
      <p className="text-gray-700 mb-6">
        Explore our interactive tools to apply this framework:
      </p>
      <div>
        <button
          onClick={() => setCurrentPage("exploration")}
          className="group block p-6 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow-md hover:shadow-xl transition-all hover:-translate-y-1 text-white text-left border-none cursor-pointer w-full"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-bold">Technology Exploration</h3>
            <ExternalLink className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </div>
          <p className="text-teal-50">
            Explore emerging technologies via various Machine Learning Language
            models with consolidated multi-source analysis
          </p>
        </button>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header>
        <section
          className="relative overflow-hidden py-10 px-12 text-white text-left"
          style={{
            background: "linear-gradient(135deg, #4839cc 0%, #4f46e5 100%)",
          }}
        >
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
            {/* Left side - Text content */}
            <div className="flex-1 max-w-3xl">
              <p className="uppercase text-xs font-bold tracking-[0.3em] mb-4 text-indigo-200">
                Foundational Overview
              </p>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-none">
                Emerging Technology Exploration Framework
              </h1>
              <p className="text-xl leading-relaxed text-indigo-100 font-light">
                A structured, intelligence-driven architecture for identifying,
                analyzing, and deploying transformative technologies within
                enterprise ecosystems
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <button
                  onClick={() => setCurrentPage("exploration")}
                  className="bg-white text-white px-8 py-4 rounded-full font-bold text-sm shadow-xl hover:bg-indigo-50 transition-all duration-300 hover:scale-105 inline-flex items-center gap-2.5 group"
                  style={{
                    background:
                      "linear-gradient(135deg, #3a70cd 0%, #4f46e5 100%)",
                  }}
                >
                  <Wrench className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                  <span className="leading-tight">Technology Exploration Tools</span>
                </button>
              </div>
            </div>

            {/* Right side - Live Hype Cycle Graph */}
            <div className="flex-1 flex justify-center lg:justify-end">
              <div className="w-full min-w-[280px] max-w-[480px]">
                <HypeCyclePreview
                  directoryPath="./data/Exploration"
                  fileName="Integrated.csv"
                  category=""
                  className="rounded-xl shadow-2xl"
                />
              </div>
            </div>
          </div>

          {/* Background decorative elements */}
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute right-40 bottom-0 w-64 h-64 bg-teal-400 opacity-10 rounded-full blur-3xl pointer-events-none"></div>
        </section>
      </header>

      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex overflow-x-auto gap-2 py-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-lg whitespace-nowrap transition-all font-medium ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {activeTab === "overview" && renderOverview()}
        {activeTab === "portfolio" && renderConsolidatedSummary()}
        {activeTab === "stage1" && renderStage1()}
        {activeTab === "stage2" && renderStage2()}
        {activeTab === "stage3" && renderStage3()}
        {activeTab === "stage4" && renderStage4()}
        {activeTab === "report" && renderReport()}
        {activeTab === "tools" && renderTools()}
      </main>

      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-8 px-6 mt-16">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-300">
            &copy; 2025 Qatar Mobility Innovations Center (QMIC)
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Enabling Smart & Safe Living through Innovation
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
