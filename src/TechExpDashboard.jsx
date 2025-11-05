import React, { useState, useRef } from "react";
import {
  Download,
  Settings,
  Save,
  RefreshCw,
  PieChart,
  Grid,
  FileText,
  Database,
  ArrowLeft,
} from "lucide-react";

// Import all technology datasets
import {
  technologiesClaude,
  technologiesGPT,
  technologiesGemini,
  technologiesDeepSeek,
  smartCityRoboticTechnologies,
  dataSources,
} from "./techExplorationData";

const TechExpDashboard = ({ setCurrentPage }) => {
  const [dataSource, setDataSource] = useState("claude");
  const [technologies, setTechnologies] = useState(technologiesClaude);
  const [selectedTech, setSelectedTech] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [activeView, setActiveView] = useState("hype");
  const [weights, setWeights] = useState({
    trl: 0.3,
    impact: 0.3,
    strategicFit: 0.2,
    barriers: -0.1,
    sustainability: 0.1,
  });
  const [filterCategory, setFilterCategory] = useState("all");
  const svgRef = useRef(null);

  // Handle data source change
  const handleDataSourceChange = (source) => {
    setDataSource(source);
    switch (source) {
      case "claude":
        setTechnologies(technologiesClaude);
        break;
      case "gpt":
        setTechnologies(technologiesGPT);
        break;
      case "gemini":
        setTechnologies(technologiesGemini);
        break;
      case "deepSeek":
        setTechnologies(technologiesDeepSeek);
        break;
      case "smartCityRobotic":
        setTechnologies(smartCityRoboticTechnologies);
        break;
      default:
        setTechnologies(technologiesClaude);
    }
    setSelectedTech(null);
    setFilterCategory("all");
  };

  const categories = ["all", ...new Set(technologies.map((t) => t.category))];

  const calculateTIS = (tech) => {
    const score =
      tech.trl * weights.trl +
      tech.impact * weights.impact +
      tech.strategicFit * weights.strategicFit +
      (10 - tech.barriers) * Math.abs(weights.barriers) +
      (10 - tech.sustainability) * weights.sustainability;
      
    return Math.max(0, Math.min(10, score)).toFixed(2);
  };

  const phases = [
    { name: "Innovation Trigger", x: 0, width: 20 },
    { name: "Peak of Inflated Expectations", x: 20, width: 15 },
    { name: "Trough of Disillusionment", x: 35, width: 15 },
    { name: "Slope of Enlightenment", x: 50, width: 25 },
    { name: "Plateau of Productivity", x: 75, width: 25 },
  ];

  const getMatrixQuadrant = (tech) => {
    const tis = parseFloat(calculateTIS(tech));
    const timeToMarket = tech.trl >= 7 ? "short" : "long";

    if (tis >= 7 && timeToMarket === "short") return "Quick Wins";
    if (tis >= 7 && timeToMarket === "long") return "Strategic Bets";
    if (tis < 7 && timeToMarket === "short") return "Incremental";
    return "Exploratory";
  };

  const hypeCurvePath =
    "M 50,400 Q 150,100 250,50 Q 350,20 450,150 Q 500,250 550,230 Q 700,200 850,180";

  const handleMouseDown = (tech) => {
    if (activeView === "hype") {
      setDragging(tech.id);
      setSelectedTech(tech);
    }
  };

  const handleMouseMove = (e) => {
    if (dragging && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      setTechnologies((prev) =>
        prev.map((t) =>
          t.id === dragging
            ? {
                ...t,
                x: Math.max(0, Math.min(100, x)),
                y: Math.max(0, Math.min(100, y)),
              }
            : t
        )
      );
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const exportToCSV = () => {
    const headers = [
      "Name",
      "Category",
      "TRL",
      "Impact",
      "Barriers",
      "Sustainability",
      "TIS",
      "Quadrant",
      "Source",
      "Notes",
    ];
    const rows = technologies.map((t) => [
      t.name,
      t.category,
      t.trl,
      t.impact,
      t.strategicFit,
      t.barriers,
      t.sustainability,
      calculateTIS(t),
      getMatrixQuadrant(t),
      t.source,
      t.notes,
    ]);

    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${c}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tech-exploration-2025.csv";
    a.click();
  };

  const exportSnapshot = () => {
    const data = {
      technologies,
      weights,
      exportDate: new Date().toISOString(),
      version: "2025.1",
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exploration-snapshot.json";
    a.click();
  };

  const filteredTech =
    filterCategory === "all"
      ? technologies
      : technologies.filter((t) => t.category === filterCategory);

  // QMIC-inspired color palette matching App.jsx
  const qmicColors = {
    primary: "#00A651", // QMIC Green from App.jsx
    secondary: "#1e40af", // Blue from gradient
    accent: "#7e22ce", // Purple from gradient
    darkBg: "#1a1a1a",
    lightBg: "#f8fafc",
    textDark: "#1f2937",
    textLight: "#ffffff",
    border: "#e5e7eb",
    cardBg: "#ffffff",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header matching App.jsx style */}
      <header className="bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 text-white py-4 px-6 shadow-xl">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-4xl font-bold mb-2 leading-tight">
                Technology Exploration
              </h2>
              <p className="text-xl text-blue-50 max-w-3xl">
                Explore emerging technologies via various LLM models
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs matching App.jsx */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex overflow-x-auto gap-2 py-3">
            {[
              { id: "hype", label: "Hype Cycle", icon: RefreshCw },
               { id: "table", label: "Impact Assessment", icon: FileText },
              { id: "matrix", label: "Strategic Matrix", icon: Grid },
            ].map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-lg whitespace-nowrap transition-all font-medium ${
                  activeView === view.id
                    ? "bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-lg scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102"
                }`}
              >
                <view.icon className="w-5 h-5" />
                <span>{view.label}</span>
              </button>
            ))}
            <button
              onClick={() => setCurrentPage("landing")}
              className="flex items-center gap-2 px-6 py-3 bg-gray/20 hover:bg-gray/50 rounded-lg font-semibold transition-all backdrop-blur-sm text-green-800"
            >
              <ArrowLeft size={20} /> Back to Home
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Filter Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-200">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <label className="font-semibold text-gray-700">
                Data Source:
              </label>
              <select
                value={dataSource}
                onChange={(e) => handleDataSourceChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="claude">Claude Dataset</option>
                <option value="gpt">GPT Dataset</option>
                <option value="gemini">Gemini Dataset</option>
                <option value="deepSeek">DeepSeek Dataset</option>
                <option value="smartCityRobotic">
                  Smart City & Robotics Dataset
                </option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="font-semibold text-gray-700">
                Filter Category:
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-gray-500 text-sm ml-auto">
              Showing {filteredTech.length} of {technologies.length}{" "}
              technologies
            </span>

            <div className="flex gap-3">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-green rounded-md hover:bg-teal-700 transition-colors"
              >
                <Download size={16} />
                Export CSV
              </button>
              <button
                onClick={exportSnapshot}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-green rounded-md hover:bg-blue-700 transition-colors"
              >
                <Save size={16} />
                Save Snapshot
              </button>
            </div>
          </div>
        </div>

        {/* HYPE CYCLE VIEW */}
        {activeView === "hype" && (
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-3xl font-bold mb-2 text-gray-900">
              Gartner-Style Hype Cycle
            </h2>
            <p className="text-gray-600 mb-6">
              Drag markers to adjust positions • Click for details
            </p>

            <div className="relative bg-gray-50 rounded-lg border border-gray-300 p-4">
              <svg
                ref={svgRef}
                viewBox="0 0 900 450"
                className="w-full h-96 cursor-move"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <defs>
                  <pattern
                    id="grid"
                    width="50"
                    height="50"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 50 0 L 0 0 0 50"
                      fill="none"
                      stroke="rgba(0, 166, 81, 0.1)"
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>
                <rect width="900" height="450" fill="url(#grid)" />

                <path
                  d={hypeCurvePath}
                  fill="none"
                  stroke="#00A651"
                  strokeWidth="4"
                />

                {phases.map((phase, i) => (
                  <g key={i}>
                    <rect
                      x={phase.x * 9}
                      y="420"
                      width={phase.width * 9}
                      height="30"
                      fill="#f8fafc"
                      stroke="#e5e7eb"
                      strokeWidth="1"
                    />
                    <text
                      x={phase.x * 9 + (phase.width * 9) / 2}
                      y="437"
                      textAnchor="middle"
                      className="text-xs font-semibold fill-gray-900"
                    >
                      {phase.name}
                    </text>
                  </g>
                ))}

                {filteredTech.map((tech) => (
                  <g
                    key={tech.id}
                    onMouseDown={() => handleMouseDown(tech)}
                    onClick={() => setSelectedTech(tech)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={tech.x * 9}
                      cy={tech.y * 4}
                      r={dragging === tech.id ? 10 : 8}
                      fill={
                        tech.id === selectedTech?.id ? "#00A651" : "#1e40af"
                      }
                      stroke="#fff"
                      strokeWidth="2"
                    />
                    <text
                      x={tech.x * 9}
                      y={tech.y * 4 - 12}
                      textAnchor="middle"
                      className="text-xs font-semibold fill-gray-900 pointer-events-none"
                    >
                      {tech.name}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            {selectedTech && (
              <div className="mt-6 p-6 bg-teal-50 rounded-lg border-l-4 border-teal-500">
                <h3 className="text-2xl font-bold mb-4 text-teal-700">
                  {selectedTech.name}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-gray-600">
                      Category:
                    </span>{" "}
                    {selectedTech.category}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">TRL:</span>{" "}
                    {selectedTech.trl}/9
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">Impact:</span>{" "}
                    {selectedTech.impact}/10
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">
                      Strategic Fit:
                    </span>{" "}
                    {selectedTech.strategicFit}/10
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">TIS:</span>{" "}
                    {calculateTIS(selectedTech)}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">Source:</span>{" "}
                    {selectedTech.source}
                  </div>
                  <div className="col-span-2 md:col-span-3">
                    <span className="font-semibold text-gray-600">Notes:</span>{" "}
                    {selectedTech.notes}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STRATEGIC MATRIX VIEW */}
        {activeView === "matrix" && (
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">
              Four-Quadrant Strategic Matrix
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {[
                {
                  title: "Quick Wins",
                  desc: "High impact, near-term deployment",
                  color: "border-green-500 bg-green-50",
                  techs: filteredTech.filter(
                    (t) => getMatrixQuadrant(t) === "Quick Wins"
                  ),
                },
                {
                  title: "Strategic Bets",
                  desc: "High impact, long-term investment",
                  color: "border-blue-500 bg-blue-50",
                  techs: filteredTech.filter(
                    (t) => getMatrixQuadrant(t) === "Strategic Bets"
                  ),
                },
                {
                  title: "Incremental Innovations",
                  desc: "Moderate impact, quick gains",
                  color: "border-yellow-500 bg-yellow-50",
                  techs: filteredTech.filter(
                    (t) => getMatrixQuadrant(t) === "Incremental"
                  ),
                },
                {
                  title: "Exploratory Research",
                  desc: "Early-stage, requires monitoring",
                  color: "border-purple-500 bg-purple-50",
                  techs: filteredTech.filter(
                    (t) => getMatrixQuadrant(t) === "Exploratory"
                  ),
                },
              ].map((quadrant, idx) => (
                <div
                  key={idx}
                  className={`p-6 border-2 ${quadrant.color} rounded-lg h-96 overflow-y-auto`}
                >
                  <h4 className="font-bold text-lg mb-2 text-gray-900">
                    {quadrant.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">{quadrant.desc}</p>
                  <div className="space-y-3">
                    {quadrant.techs.map((tech) => (
                      <div
                        key={tech.id}
                        className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setSelectedTech(tech)}
                      >
                        <div className="font-semibold text-gray-900">
                          {tech.name}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          TIS: {calculateTIS(tech)} | TRL: {tech.trl}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="flex flex-wrap justify-between gap-4 text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>Quick Wins (TIS ≥7, TRL ≥7)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span>Strategic Bets (TIS ≥7, TRL &lt;7)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span>Incremental (TIS &lt;7, TRL ≥7)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span>Exploratory (TIS &lt;7, TRL &lt;7)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* IMPACT ASSESSMENT TABLE */}
        {activeView === "table" && (
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-2 text-gray-900">
                  Business Impact Assessment
                </h2>
                <p className="text-gray-600">
                  Comprehensive technology evaluation metrics
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Settings size={20} className="text-teal-600" />
                  <span className="font-semibold text-gray-700">
                    Weight Controls
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                  {[
                    { key: "trl", label: "TRL", min: 0, max: 1, step: 0.1 },
                    {
                      key: "impact",
                      label: "Impact",
                      min: 0,
                      max: 1,
                      step: 0.1,
                    },
                    {
                      key: "strategicFit",
                      label: "Strategic Fit",
                      min: 0,
                      max: 1,
                      step: 0.05,
                    },
                    {
                      key: "barriers",
                      label: "Barriers",
                      min: -0.5,
                      max: 0,
                      step: 0.05,
                    },
                    {
                      key: "sustainability",
                      label: "Sustainability",
                      min: 0,
                      max: 0.3,
                      step: 0.05,
                    },
                  ].map((param) => (
                    <div key={param.key} className="flex flex-col gap-1">
                      <label className="font-medium text-gray-700 text-xs">
                        {param.label}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min={param.min}
                          max={param.max}
                          step={param.step}
                          value={weights[param.key]}
                          onChange={(e) =>
                            setWeights({
                              ...weights,
                              [param.key]: parseFloat(e.target.value),
                            })
                          }
                          className="w-20"
                        />
                        <span className="text-xs font-semibold text-teal-600 w-8">
                          {weights[param.key].toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gradient-to-r from-teal-500 to-blue-500 text-white">
                  <tr>
                    <th className="p-3 text-left font-semibold">Technology</th>
                    <th className="p-3 text-left font-semibold">Category</th>
                    <th className="p-3 text-center font-semibold">TRL</th>
                    <th className="p-3 text-center font-semibold">Impact</th>
                    <th className="p-3 text-center font-semibold">
                      Strategic Fit
                    </th>
                    <th className="p-3 text-center font-semibold">Barriers</th>
                    <th className="p-3 text-center font-semibold">
                      Sustainability
                    </th>
                    <th className="p-3 text-center font-semibold">TIS</th>
                    <th className="p-3 text-left font-semibold">Quadrant</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTech
                    .sort(
                      (a, b) =>
                        parseFloat(calculateTIS(b)) -
                        parseFloat(calculateTIS(a))
                    )
                    .map((tech) => {
                      const tis = parseFloat(calculateTIS(tech));
                      return (
                        <tr
                          key={tech.id}
                          onClick={() => setSelectedTech(tech)}
                          className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <td className="p-3 font-semibold text-gray-900">
                            {tech.name}
                          </td>
                          <td className="p-3 text-gray-600">{tech.category}</td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                tech.trl >= 7
                                  ? "bg-green-100 text-green-800 border border-green-300"
                                  : "bg-orange-100 text-orange-800 border border-orange-300"
                              }`}
                            >
                              {tech.trl}/9
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                tech.impact >= 8
                                  ? "bg-green-100 text-green-800 border border-green-300"
                                  : tech.impact >= 6
                                  ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                                  : "bg-red-100 text-red-800 border border-red-300"
                              }`}
                            >
                              {tech.impact}/10
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                tech.strategicFit >= 8
                                  ? "bg-green-100 text-green-800 border border-green-300"
                                  : tech.strategicFit >= 6
                                  ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                                  : "bg-red-100 text-red-800 border border-red-300"
                              }`}
                            >
                              {tech.strategicFit}/10
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                tech.barriers <= 3
                                  ? "bg-green-100 text-green-800 border border-green-300"
                                  : tech.barriers <= 6
                                  ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                                  : "bg-red-100 text-red-800 border border-red-300"
                              }`}
                            >
                              {tech.barriers}/10
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                tech.sustainability <= 3
                                  ? "bg-green-100 text-green-800 border border-green-300"
                                  : tech.sustainability <= 6
                                  ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                                  : "bg-red-100 text-red-800 border border-red-300"
                              }`}
                            >
                              {tech.sustainability}/10
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                                tis >= 8
                                  ? "bg-green-500"
                                  : tis >= 6
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                            >
                              {tis}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-gray-700">
                            {getMatrixQuadrant(tech)}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-6 bg-teal-50 rounded-lg border-l-4 border-teal-500">
              <h3 className="text-lg font-bold mb-3 text-teal-700">
                Tech Impact Score (TIS) Formula:
              </h3>
              <div className="bg-white p-4 rounded border border-gray-300 font-mono text-sm">
                TIS = (TRL × {weights.trl.toFixed(2)}) + (Impact ×{" "}
                {weights.impact.toFixed(2)}) + (Strategic Fit ×{" "}
                {weights.strategicFit.toFixed(2)}) + ((10 - Barriers) ×{" "}
                {Math.abs(weights.barriers).toFixed(2)}) + ((10 -
                Sustainability) × {weights.sustainability.toFixed(2)})
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Adjust the weight controls above to re-score technologies in
                real-time. A higher TIS indicates greater strategic value and
                deployment readiness.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer matching App.jsx */}
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

export default TechExpDashboard;