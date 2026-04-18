import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Download,
  Settings,
  Save,
  RefreshCw,
  PieChart,
  Grid,
  FileText,
  Database,
  BarChart3,
  Wrench,
} from "lucide-react";

import useCSVExplorationDatasets from "./useCSVExplorationDatasets";

// Technology Assessment Component
const TechAssessment = ({ setCurrentPage }) => {
  const { datasetsMap, sourceKeys, createdDate, loading, error } =
    useCSVExplorationDatasets("./data/Assessment", [
      "ClaudeAI.csv",
      "ChatGPT.csv",
      "Gemini.csv",
      "DeepSeek.csv",
    ]);

  const [dataSource, setDataSource] = useState("");
  const [technologies, setTechnologies] = useState([]);
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

  // Initialize dataSource and technologies once datasets are loaded
  useEffect(() => {
    if (sourceKeys.length === 0) return;
    const defaultKey = sourceKeys.includes("ClaudeAI")
      ? "ClaudeAI"
      : sourceKeys[0];
    setDataSource(defaultKey);
    setTechnologies(datasetsMap[defaultKey] || []);
  }, [sourceKeys, datasetsMap]);

  // Now safe to do conditional returns
  if (loading) return <div>Loading technology data...</div>;
  if (error) return <div>Error: {error}</div>;

  const handleDataSourceChange = (source) => {
    setDataSource(source);
    setTechnologies(datasetsMap[source] || []);
    setSelectedTech(null);
    // filterCategory is intentionally preserved so the user's chosen
    // category stays active when switching between data sources.
  };

  // Derive categories from ALL datasets so the list stays stable and the
  // selected category persists when the user switches data sources.
  const categories = [
    "all",
    ...Array.from(
      new Set(
        Object.values(datasetsMap)
          .flat()
          .map((t) => t.category)
          .filter(Boolean),
      ),
    ).sort(),
  ];

  // Build dataSources metadata dynamically from fetched sourceKeys
  const dataSources = Object.fromEntries(
    sourceKeys.map((key) => [
      key,
      {
        name: key,
        count: (datasetsMap[key] || []).length,
      },
    ]),
  );

  // Palette cycles for the comparison badges
  const badgeColors = [
    "#8B5CF6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#3B82F6",
    "#EC4899",
  ];

  const calculateTIS = (tech) => {
    const score =
      tech.trl * weights.trl +
      tech.impact * weights.impact +
      (10 - tech.barriers) * Math.abs(weights.barriers) +
      (10 - tech.sustainability) * weights.sustainability +
      tech.strategicFit * weights.strategicFit;
    return Math.max(0, Math.min(10, score)).toFixed(2);
  };

  const calculateTISForAllDatasets = (techName) => {
    const results = {};
    Object.entries(datasetsMap).forEach(([key, dataset]) => {
      const tech = dataset.find((t) => t.name === techName);
      if (tech) {
        results[key] = {
          tis: calculateTIS(tech),
          phase: tech.phase,
          category: tech.category,
        };
      }
    });
    return results;
  };

  const getAllTechnologyNames = () => {
    const allNames = new Set();
    Object.values(datasetsMap).forEach((dataset) => {
      dataset.forEach((tech) => {
        // When a category is selected, only include technologies that belong
        // to that category in at least one dataset.
        if (filterCategory === "all" || tech.category === filterCategory) {
          allNames.add(tech.name);
        }
      });
    });
    return Array.from(allNames).sort();
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
            : t,
        ),
      );
    }
  };

  const handleMouseUp = () => setDragging(null);

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
    a.download = "tech-assessment-2025.csv";
    a.click();
  };

  const filteredTech =
    filterCategory === "all"
      ? technologies
      : technologies.filter((t) => t.category === filterCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 text-white py-16 px-6 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2 leading-tight">
                Technology Assessment Dashboard
              </h1>
              <p className="text-lg text-blue-50">
                Compare emerging technologies across different AI model
                assessments
              </p>
            </div>
          </div>
        </div>
        <div className="w-px h-4 bg-[#c7c4d8]/30 my-auto" />
        <div class="mt-10 flex gap-4">
            <button
              onClick={() => setCurrentPage("exploration")}
              class="flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-full font-bold text-sm shadow-xl hover:bg-indigo-50 transition-colors"
              style={{
                background: "linear-gradient(135deg, #4839cc 0%, #4f46e5 100%)",
              }}
            >
              <Wrench className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
              Exploration
            </button>
            <button
              onClick={() => setCurrentPage("landing")}
              class="flex items-center gap-2 bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-full font-bold text-sm hover:bg-white/20 transition-colors"
              style={{
                background: "linear-gradient(135deg, #4839cc 0%, #4f46e5 100%)",
              }}
            >
              <ArrowLeft size={20} /> Back to Home
            </button>
          </div>
      </header>

      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex overflow-x-auto gap-2 py-3">
            {[
              { id: "hype", label: "Hype Cycle", icon: RefreshCw },
              { id: "table", label: "Impact Assessment", icon: FileText },
              {
                id: "comparison",
                label: "Dataset Comparison",
                icon: BarChart3,
              },
              { id: "matrix", label: "Strategic Matrix", icon: Grid },
            ].map((view) => {
              const Icon = view.icon;
              return (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-lg whitespace-nowrap transition-all font-medium ${
                    activeView === view.id
                      ? "bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{view.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex bg-gray-50 rounded-full p-1 border border-[#c7c4d8]/15 gap-1">
              <label className="bg-transparent border-none text-s font-label text-slate-700 py-1.5 pl-3 pr-8 focus:ring-0">
                Data Source:
              </label>
              <select
                value={dataSource}
                onChange={(e) => handleDataSourceChange(e.target.value)}
                className="bg-transparent border-none text-s text-slate-700 py-1.5 pl-3 pr-8 focus:ring-0 outline-none"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                {sourceKeys.map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>

              <div className="w-px h-4 bg-[#c7c4d8]/30 my-auto" />

              <label className="bg-transparent border-none text-s font-label text-slate-700 py-1.5 pl-3 pr-8 focus:ring-0">
                Category:
              </label>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-transparent border-none text-s text-slate-700 py-1.5 pl-2 pr-6 focus:ring-0 outline-none"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </option>
                ))}
              </select>
            </div>
            <span className="ml-auto text-sm text-gray-500 font-medium">
              Showing {filteredTech.length} of {technologies.length}{" "}
              technologies{createdDate ? `, created on ${createdDate}` : ""}
            </span>

            <div className="flex gap-3 ">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-3 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-all"
              >
                <Download size={16} /> Export CSV
              </button>
              <button
                onClick={() => {
                  /* Export snapshot */
                }}
                className="flex items-center gap-3 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-all"
              >
                <Save size={16} /> Save
              </button>
            </div>
          </div>
        </div>

        {activeView === "hype" && (
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Gartner-Style Hype Cycle
              </h2>
              <p className="text-gray-600">
                Drag markers to adjust positions • Click for details
              </p>
            </div>

            <svg
              ref={svgRef}
              viewBox="0 0 900 450"
              className="w-full h-[500px] bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg cursor-move border border-gray-200"
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
                    stroke="rgba(20, 184, 166, 0.1)"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="900" height="450" fill="url(#grid)" />
              <path
                d={hypeCurvePath}
                fill="none"
                stroke="#14b8a6"
                strokeWidth="4"
              />

              {phases.map((phase, i) => (
                <g key={i}>
                  <rect
                    x={phase.x * 9}
                    y="420"
                    width={phase.width * 9}
                    height="30"
                    fill="white"
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                  <text
                    x={phase.x * 9 + (phase.width * 9) / 2}
                    y="437"
                    textAnchor="middle"
                    className="text-xs font-semibold fill-gray-700"
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
                  style={{ cursor: "pointer" }}
                >
                  <circle
                    cx={tech.x * 9}
                    cy={tech.y * 4}
                    r={dragging === tech.id ? 10 : 8}
                    fill={tech.id === selectedTech?.id ? "#14b8a6" : "#3b82f6"}
                    stroke="#fff"
                    strokeWidth="2"
                  />
                  <text
                    x={tech.x * 9}
                    y={tech.y * 4 - 12}
                    textAnchor="middle"
                    className="text-xs font-semibold fill-gray-700"
                    style={{ pointerEvents: "none" }}
                  >
                    {tech.name}
                  </text>
                </g>
              ))}
            </svg>

            {selectedTech && (
              <div className="mt-6 p-6 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border-2 border-teal-500">
                <h3 className="text-2xl font-bold text-teal-700 mb-4">
                  {selectedTech.name}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">
                      Category:
                    </span>{" "}
                    {selectedTech.category}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">TRL:</span>{" "}
                    {selectedTech.trl}/9
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Impact:</span>{" "}
                    {selectedTech.impact}/10
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">
                      Strategic Fit:
                    </span>{" "}
                    {selectedTech.strategicFit}/10
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">TIS:</span>{" "}
                    {calculateTIS(selectedTech)}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Source:</span>{" "}
                    {selectedTech.source}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeView === "matrix" && (
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Four-Quadrant Strategic Matrix
            </h2>

            <div className="grid grid-cols-2 gap-6 h-[600px]">
              {[
                {
                  title: "Quick Wins",
                  desc: "High impact, near-term deployment",
                  color: "border-teal-500 bg-teal-50",
                },
                {
                  title: "Strategic Bets",
                  desc: "High impact, long-term investment",
                  color: "border-blue-500 bg-blue-50",
                },
                {
                  title: "Incremental",
                  desc: "Moderate impact, quick gains",
                  color: "border-indigo-400 bg-indigo-50",
                },
                {
                  title: "Exploratory",
                  desc: "Early-stage, requires monitoring",
                  color: "border-purple-500 bg-purple-50",
                },
              ].map((quadrant, idx) => {
                const techsInQuadrant = filteredTech.filter(
                  (t) => getMatrixQuadrant(t) === quadrant.title,
                );
                return (
                  <div
                    key={quadrant.title}
                    className={`border-2 rounded-xl p-6 overflow-y-auto ${quadrant.color}`}
                  >
                    <h3 className="text-xl font-bold mb-2 text-gray-900">
                      {quadrant.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {quadrant.desc}
                    </p>
                    <div className="space-y-3">
                      {techsInQuadrant.map((tech) => (
                        <div
                          key={tech.id}
                          className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        >
                          <div className="font-semibold text-gray-900">
                            {tech.name}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            TIS: {calculateTIS(tech)} | TRL: {tech.trl}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeView === "table" && (
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Business Impact Assessment
                  </h2>
                  <p className="text-gray-600">
                    Comprehensive technology evaluation metrics
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-teal-50 to-blue-50 p-6 rounded-xl border border-teal-200">
                <div className="flex items-center gap-3 mb-4">
                  <Settings size={20} className="text-teal-600" />
                  <span className="font-semibold text-gray-700">
                    Adjust Weights
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-6">
                  {Object.entries(weights).map(([key, value]) => (
                    <div key={key} className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, " $1")}
                      </label>
                      <input
                        type="range"
                        min={key === "barriers" ? "-0.5" : "0"}
                        max={
                          key === "sustainability"
                            ? "0.3"
                            : key === "barriers"
                              ? "0"
                              : "1"
                        }
                        step="0.05"
                        value={value}
                        onChange={(e) =>
                          setWeights({
                            ...weights,
                            [key]: parseFloat(e.target.value),
                          })
                        }
                        className="w-full"
                      />
                      <span className="text-center font-bold text-teal-600">
                        {value.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-teal-500 to-blue-500 text-white">
                  <tr>
                    <th className="p-4 text-left font-bold">Technology</th>
                    <th className="p-4 text-left font-bold">Category</th>
                    <th className="p-4 text-center font-bold">TRL</th>
                    <th className="p-4 text-center font-bold">Impact</th>
                    <th className="p-4 text-center font-bold">Strategic Fit</th>
                    <th className="p-4 text-center font-bold">TIS</th>
                    <th className="p-4 text-left font-bold">Quadrant</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTech
                    .sort(
                      (a, b) =>
                        parseFloat(calculateTIS(b)) -
                        parseFloat(calculateTIS(a)),
                    )
                    .map((tech, idx) => {
                      const tis = parseFloat(calculateTIS(tech));
                      return (
                        <tr
                          key={tech.id}
                          className={`${
                            idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                          } hover:bg-teal-50 transition-colors cursor-pointer`}
                        >
                          <td className="p-4 font-semibold text-teal-700">
                            {tech.name}
                          </td>
                          <td className="p-4 text-gray-600">{tech.category}</td>
                          <td className="p-4 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                tech.trl >= 7
                                  ? "bg-teal-100 text-teal-700"
                                  : "bg-indigo-100 text-indigo-700"
                              }`}
                            >
                              {tech.trl}/9
                            </span>
                          </td>
                          <td className="p-4 text-center text-gray-700">
                            {tech.impact}/10
                          </td>
                          <td className="p-4 text-center text-gray-700">
                            {tech.strategicFit}/10
                          </td>
                          <td className="p-4 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                tis >= 8
                                  ? "bg-teal-500 text-white"
                                  : tis >= 6
                                    ? "bg-blue-500 text-white"
                                    : "bg-indigo-500 text-white"
                              }`}
                            >
                              {tis}
                            </span>
                          </td>
                          <td className="p-4 font-semibold text-gray-700">
                            {getMatrixQuadrant(tech)}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeView === "comparison" && (
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Dataset Comparison Analysis
                  </h2>
                  <p className="text-gray-600">
                    Compare TIS scores across all AI assistant datasets using
                    consistent weighting
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-teal-50 to-blue-50 p-6 rounded-xl border border-teal-200 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Settings size={20} className="text-teal-600" />
                  <span className="font-semibold text-gray-700">
                    Adjust Weights
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-6">
                  {Object.entries(weights).map(([key, value]) => (
                    <div key={key} className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, " $1")}
                      </label>
                      <input
                        type="range"
                        min={key === "barriers" ? "-0.5" : "0"}
                        max={
                          key === "sustainability"
                            ? "0.3"
                            : key === "barriers"
                              ? "0"
                              : "1"
                        }
                        step="0.05"
                        value={value}
                        onChange={(e) =>
                          setWeights({
                            ...weights,
                            [key]: parseFloat(e.target.value),
                          })
                        }
                        className="w-full"
                      />
                      <span className="text-center font-bold text-teal-600">
                        {value.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 mb-6 flex-wrap">
              {sourceKeys.map((key, idx) => (
                <div
                  key={key}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm text-white"
                  style={{
                    backgroundColor: badgeColors[idx % badgeColors.length],
                  }}
                >
                  <Database size={16} />
                  {key} ({(datasetsMap[key] || []).length})
                </div>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-teal-500 to-blue-500 text-white">
                  <tr>
                    <th className="p-3 text-left font-bold">Technology</th>
                    <th className="p-3 text-left font-bold">Category</th>
                    {sourceKeys.map((key) => (
                      <th key={key} className="p-3 text-center font-bold">
                        {key}
                      </th>
                    ))}
                    <th className="p-3 text-center font-bold">Avg TIS</th>
                    <th className="p3 text-center font-bold">Consistency</th>
                  </tr>
                </thead>
                <tbody>
                  {getAllTechnologyNames().map((techName, idx) => {
                    const results = calculateTISForAllDatasets(techName);
                    const tisValues = Object.values(results).map((r) =>
                      parseFloat(r.tis),
                    );
                    const avgTIS =
                      tisValues.length > 0
                        ? (
                            tisValues.reduce((a, b) => a + b, 0) /
                            tisValues.length
                          ).toFixed(2)
                        : "N/A";
                    const consistency =
                      tisValues.length > 1
                        ? Math.sqrt(
                            tisValues.reduce(
                              (acc, val) =>
                                acc + Math.pow(val - parseFloat(avgTIS), 2),
                              0,
                            ) / tisValues.length,
                          ).toFixed(2)
                        : "N/A";

                    return (
                      <tr
                        key={techName}
                        className={`${
                          idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                        } hover:bg-teal-50 transition-colors`}
                      >
                        <td className="p-3 font-semibold text-gray-900">
                          {techName}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                            {results[Object.keys(results)[0]]?.category ||
                              "N/A"}
                          </span>
                        </td>
                        {sourceKeys.map((key) => {
                          const result = results[key];
                          if (!result) {
                            return (
                              <td
                                key={key}
                                className="p-3 text-center text-gray-400"
                              >
                                -
                              </td>
                            );
                          }
                          const tis = parseFloat(result.tis);
                          return (
                            <td key={key} className="p-3 text-center">
                              <div>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    tis >= 8
                                      ? "bg-teal-500 text-white"
                                      : tis >= 6
                                        ? "bg-blue-500 text-white"
                                        : "bg-indigo-500 text-white"
                                  }`}
                                >
                                  {result.tis}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {result.phase}
                              </div>
                            </td>
                          );
                        })}
                        <td className="p-3 text-center">
                          {avgTIS !== "N/A" && (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                parseFloat(avgTIS) >= 8
                                  ? "bg-teal-600 text-white"
                                  : parseFloat(avgTIS) >= 6
                                    ? "bg-blue-600 text-white"
                                    : "bg-indigo-600 text-white"
                              }`}
                            >
                              {avgTIS}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {consistency !== "N/A" ? (
                            <span
                              className={`font-semibold ${
                                parseFloat(consistency) <= 1.0
                                  ? "text-teal-600"
                                  : parseFloat(consistency) <= 2.0
                                    ? "text-blue-600"
                                    : "text-indigo-600"
                              }`}
                            >
                              {consistency}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl border-2 border-teal-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Tech Impact Score (TIS) Formula
              </h3>
              <div className="font-mono text-sm bg-white p-4 rounded-lg border border-gray-200 mb-3">
                TIS = (TRL × {weights.trl.toFixed(2)}) + (Impact ×{" "}
                {weights.impact.toFixed(2)}) + ((10 - Barriers) ×{" "}
                {Math.abs(weights.barriers).toFixed(2)}) + ((10 -
                Sustainability) × {weights.sustainability.toFixed(2)}) +
                (Strategic Fit × {weights.strategicFit.toFixed(2)})
              </div>
              <p className="text-sm text-gray-700">
                <strong>Consistency</strong> shows standard deviation of TIS
                scores across datasets. Lower values indicate higher agreement
                between AI assistants.
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-8 px-6 mt-16">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-300 font-medium mb-2">
            Data Sources: Gartner Hype Cycle 2024/2025 • WEF Top 10 Emerging
            Technologies 2025
          </p>
          <p className="text-sm text-gray-400">
            Dashboard Version 2025.1 • Last Updated: November 2025
          </p>
          <p className="text-sm text-gray-500 mt-3">
            Qatar Mobility Innovations Center (QMIC)
          </p>
        </div>
      </footer>
    </div>
  );
};

export default TechAssessment;
