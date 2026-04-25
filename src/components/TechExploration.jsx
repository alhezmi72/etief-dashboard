import React, { useState, useRef, useEffect } from "react";
import {
  Download,
  Settings,
  Save,
  RefreshCw,
  PieChart,
  Grid,
  FileText,
  ArrowLeft, 
  Wrench
} from "lucide-react";

import useCSVExplorationDatasets from "./useCSVExplorationDatasets";
import CSVUploader from "./CSVUploader";

const TechExploration = ({ setCurrentPage }) => {
  const { datasetsMap, sourceKeys, createdDate, loading, error } =
    useCSVExplorationDatasets("./data/Exploration", [
      "Integrated.csv",
      "Claude.csv",
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
  const [categoryLocked, setCategoryLocked] = useState(false);
  // ── uploaded datasets (client-side additions / overrides) ────────────
  const [uploadedDatasetsMap, setUploadedDatasetsMap] = useState({});
  const [showUploader, setShowUploader] = useState(false);
  const svgRef = useRef(null);

  // ── merged view: uploaded entries override / extend the hook datasets ──
  const mergedDatasetsMap = { ...datasetsMap, ...uploadedDatasetsMap };
  const mergedSourceKeys = [
    ...sourceKeys,
    ...Object.keys(uploadedDatasetsMap).filter((k) => !sourceKeys.includes(k)),
  ];

  // Initialize dataSource and technologies once datasets are loaded
  useEffect(() => {
    if (mergedSourceKeys.length === 0) return;
    const defaultKey = mergedSourceKeys.includes("Integrated")
      ? "Integrated"
      : mergedSourceKeys[0];
    setDataSource(defaultKey);
    setTechnologies(mergedDatasetsMap[defaultKey] || []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceKeys, datasetsMap, uploadedDatasetsMap]);

  // Now safe to do conditional returns
  if (loading) return <div>Loading technology data...</div>;
  if (error) return <div>Error: {error}</div>;

  // Handle data source change
  const handleDataSourceChange = (source) => {
    setDataSource(source);
    setTechnologies(mergedDatasetsMap[source] || []);
    setSelectedTech(null);
    // Only reset the category filter when it is not locked by the user.
    if (!categoryLocked) setFilterCategory("all");
  };

  // Derive categories from ALL datasets so the list is stable across source
  // switches and the fixed category option always shows a complete menu.
  const categories = [
    "all",
    ...Array.from(
      new Set(
        Object.values(mergedDatasetsMap)
          .flat()
          .map((t) => t.category)
          .filter(Boolean),
      ),
    ).sort(),
  ];

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
            : t,
        ),
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

  // Download current dataset including updated x/y positions
  const exportUpdatedDataset = () => {
    const headers = [
      "id","name","category","trl","impact","strategicFit",
      "barriers","sustainability","x","y","source","notes",
    ];
    const rows = technologies.map((t) => [
      t.id ?? "", t.name ?? "", t.category ?? "",
      t.trl ?? "", t.impact ?? "", t.strategicFit ?? "",
      t.barriers ?? "", t.sustainability ?? "",
      typeof t.x === "number" ? t.x.toFixed(2) : (t.x ?? ""),
      typeof t.y === "number" ? t.y.toFixed(2) : (t.y ?? ""),
      t.source ?? "", t.notes ?? "",
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${c}"`).join(","))
      .join("\n");
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })),
      download: `${dataSource}-updated.csv`,
    });
    a.click();
  };

  const filteredTech =
    filterCategory === "all"
      ? technologies
      : technologies.filter((t) => t.category === filterCategory);

  // ── Category color palette ─────────────────────────────────────────────────
  // Each category gets a distinct, accessible color. The palette cycles for
  // datasets that have more categories than palette entries.
  const CATEGORY_PALETTE = [
    { fill: "#4f46e5", stroke: "#312e81", light: "#eef2ff", text: "#3730a3" }, // indigo
    { fill: "#0891b2", stroke: "#155e75", light: "#ecfeff", text: "#0e7490" }, // cyan
    { fill: "#16a34a", stroke: "#14532d", light: "#f0fdf4", text: "#15803d" }, // green
    { fill: "#ea580c", stroke: "#7c2d12", light: "#fff7ed", text: "#c2410c" }, // orange
    { fill: "#9333ea", stroke: "#581c87", light: "#faf5ff", text: "#7e22ce" }, // purple
    { fill: "#db2777", stroke: "#831843", light: "#fdf2f8", text: "#be185d" }, // pink
    { fill: "#ca8a04", stroke: "#713f12", light: "#fefce8", text: "#a16207" }, // yellow
    { fill: "#0f766e", stroke: "#134e4a", light: "#f0fdfa", text: "#0f766e" }, // teal
    { fill: "#dc2626", stroke: "#7f1d1d", light: "#fef2f2", text: "#b91c1c" }, // red
    { fill: "#2563eb", stroke: "#1e3a8a", light: "#eff6ff", text: "#1d4ed8" }, // blue
  ];

  // Build a stable mapping from category name → palette entry.
  const catList = Array.from(
    new Set(technologies.map((t) => t.category).filter(Boolean))
  ).sort();
  const getCategoryColor = (cat) =>
    CATEGORY_PALETTE[catList.indexOf(cat) % CATEGORY_PALETTE.length] ||
    CATEGORY_PALETTE[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header matching App.jsx style */}
      <header className="bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 text-white py-14 px-6 shadow-xl">
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
          <div className="w-px h-4 bg-[#c7c4d8]/30 my-auto" />
          <div class="mt-10 flex gap-4">
            <button
              onClick={() => setCurrentPage("assessment")}
              class="flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-full font-bold text-sm shadow-xl hover:bg-indigo-50 transition-colors"
              style={{
                background: "linear-gradient(135deg, #4839cc 0%, #4f46e5 100%)",
              }}
            >
              <Wrench size={20} />
              Assessment
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
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Filter Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-200">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex bg-gray-50 rounded-full p-1 border border-[#c7c4d8]/15 gap-1">
              {/* Data source */}
              <label className="bg-transparent border-none text-s font-label text-slate-700 py-1.5 pl-3 pr-8 focus:ring-0">
                Data Source:
              </label>
              <select
                value={dataSource}
                onChange={(e) => handleDataSourceChange(e.target.value)}
                className="bg-transparent border-none text-s text-slate-700 py-1.5 pl-3 pr-8 focus:ring-0 outline-none"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                {mergedSourceKeys.map((key) => (
                  <option key={key} value={key}>
                    {key}{uploadedDatasetsMap[key] ? " ★" : ""}
                  </option>
                ))}
              </select>
              <div className="w-px h-4 bg-[#c7c4d8]/30 my-auto" />
              {/* Category */}
              <div className="flex items-center gap-1 pl-2">
                {/* All / Fixed radios */}
                <label
                  className="flex items-center gap-1 text-[14px] text-slate-700 cursor-pointer"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  <input
                    type="radio"
                    name="catMode"
                    checked={!categoryLocked}
                    onChange={() => {
                      setCategoryLocked(false);
                      setFilterCategory("all");
                    }}
                    className="w-3 h-3 accent-indigo-600"
                  />
                  All
                </label>
                <label
                  className="flex items-center gap-1 text-[15px] text-slate-700 cursor-pointer ml-1"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  <input
                    type="radio"
                    name="catMode"
                    checked={categoryLocked}
                    onChange={() => setCategoryLocked(true)}
                    className="w-3 h-3 accent-indigo-600"
                  />
                  Fixed
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => {
                    setFilterCategory(e.target.value);
                    if (e.target.value !== "all") setCategoryLocked(true);
                    else setCategoryLocked(false);
                  }}
                  className="bg-transparent border-none text-s text-slate-700 py-1.5 pl-2 pr-6 focus:ring-0 outline-none"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === "all" ? "All Categories" : cat}
                    </option>
                  ))}
                </select>
                {categoryLocked && filterCategory !== "all" && (
                  <span className="text-xs font-medium px-2 py-1 bg-teal-100 text-teal-700 rounded-full border border-teal-300">
                    📌 Pinned
                  </span>
                )}
              </div>
            </div>
            <span className="text-gray-500 text-sm ml-auto">
              Showing {filteredTech.length} of {technologies.length}{" "}
              technologies{createdDate ? `, created on ${createdDate}` : ""}
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

              {/* ── Upload CSV ── */}
              <button
                onClick={() => setShowUploader(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-green rounded-md hover:bg-indigo-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Upload CSV
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

                {filteredTech.map((tech) => {
                  const col = getCategoryColor(tech.category);
                  const isSelected = tech.id === selectedTech?.id;
                  const isDrag = dragging === tech.id;
                  return (
                    <g
                      key={tech.id}
                      onMouseDown={() => handleMouseDown(tech)}
                      onClick={() => setSelectedTech(tech)}
                      className="cursor-pointer"
                    >
                      {/* Selection ring */}
                      {isSelected && (
                        <circle
                          cx={tech.x * 9}
                          cy={tech.y * 4}
                          r={16}
                          fill="none"
                          stroke={col.fill}
                          strokeWidth="2"
                          opacity="0.4"
                        />
                      )}
                      <circle
                        cx={tech.x * 9}
                        cy={tech.y * 4}
                        r={isDrag ? 11 : isSelected ? 10 : 8}
                        fill={col.fill}
                        stroke={isSelected ? "#fff" : col.stroke}
                        strokeWidth={isSelected ? 3 : 1.5}
                      />
                      <text
                        x={tech.x * 9}
                        y={tech.y * 4 - 13}
                        textAnchor="middle"
                        style={{
                          fontSize: "9px",
                          fontWeight: 700,
                          fill: "#1e293b",
                          pointerEvents: "none",
                        }}
                      >
                        {tech.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* ── Category Legend ── */}
            {catList.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {catList.map((cat) => {
                  const col = getCategoryColor(cat);
                  return (
                    <div key={cat} className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full border"
                         style={{ background: col.light, color: col.text, borderColor: col.fill + "55" }}>
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: col.fill }} />
                      {cat}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Selected tech info + position editor ── */}
            {selectedTech && (() => {
              const col = getCategoryColor(selectedTech.category);
              return (
                <div className="mt-5 rounded-xl border-l-4 overflow-hidden shadow-sm"
                     style={{ borderColor: col.fill }}>
                  {/* Header strip */}
                  <div className="px-5 py-3 flex items-center justify-between"
                       style={{ background: col.light }}>
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full" style={{ background: col.fill }} />
                      <h3 className="text-lg font-bold" style={{ color: col.text }}>
                        {selectedTech.name}
                      </h3>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full border"
                            style={{ background: "#fff", color: col.text, borderColor: col.fill + "55" }}>
                        {selectedTech.category}
                      </span>
                    </div>
                    <button
                      onClick={exportUpdatedDataset}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow transition-opacity hover:opacity-90"
                      style={{ background: col.fill }}
                      title="Download current dataset with updated positions"
                    >
                      <Download size={13} />
                      Download Updated Dataset
                    </button>
                  </div>

                  <div className="bg-white px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: tech attributes */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {[
                        { label: "TRL",          value: `${selectedTech.trl}/9`          },
                        { label: "Impact",        value: `${selectedTech.impact}/10`       },
                        { label: "Strategic Fit", value: `${selectedTech.strategicFit}/10` },
                        { label: "TIS",           value: calculateTIS(selectedTech)        },
                        { label: "Source",        value: selectedTech.source || "—"        },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
                          <p className="font-semibold text-gray-800 mt-0.5">{value}</p>
                        </div>
                      ))}
                      {selectedTech.notes && (
                        <div className="col-span-2">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Notes</span>
                          <p className="text-gray-700 mt-0.5 text-xs leading-relaxed">{selectedTech.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Right: position editor */}
                    <div className="border-t md:border-t-0 md:border-l border-gray-100 md:pl-6 pt-4 md:pt-0">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                        Position on Hype Curve
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        {/* X position */}
                        <div>
                          <label className="text-xs font-semibold text-gray-600 mb-1 block">
                            X — Maturity (0 – 100)
                          </label>
                          <input
                            type="number"
                            min={0} max={100} step={0.1}
                            value={typeof selectedTech.x === "number" ? +selectedTech.x.toFixed(1) : 50}
                            onChange={(e) => {
                              const val = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
                              setTechnologies((prev) =>
                                prev.map((t) => t.id === selectedTech.id ? { ...t, x: val } : t)
                              );
                              setSelectedTech((prev) => ({ ...prev, x: val }));
                            }}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          />
                          <input
                            type="range"
                            min={0} max={100} step={0.1}
                            value={typeof selectedTech.x === "number" ? selectedTech.x : 50}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setTechnologies((prev) =>
                                prev.map((t) => t.id === selectedTech.id ? { ...t, x: val } : t)
                              );
                              setSelectedTech((prev) => ({ ...prev, x: val }));
                            }}
                            className="w-full mt-2 accent-indigo-600"
                          />
                        </div>
                        {/* Y position */}
                        <div>
                          <label className="text-xs font-semibold text-gray-600 mb-1 block">
                            Y — Visibility (0 – 100)
                          </label>
                          <input
                            type="number"
                            min={0} max={100} step={0.1}
                            value={typeof selectedTech.y === "number" ? +selectedTech.y.toFixed(1) : 50}
                            onChange={(e) => {
                              const val = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
                              setTechnologies((prev) =>
                                prev.map((t) => t.id === selectedTech.id ? { ...t, y: val } : t)
                              );
                              setSelectedTech((prev) => ({ ...prev, y: val }));
                            }}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          />
                          <input
                            type="range"
                            min={0} max={100} step={0.1}
                            value={typeof selectedTech.y === "number" ? selectedTech.y : 50}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setTechnologies((prev) =>
                                prev.map((t) => t.id === selectedTech.id ? { ...t, y: val } : t)
                              );
                              setSelectedTech((prev) => ({ ...prev, y: val }));
                            }}
                            className="w-full mt-2 accent-indigo-600"
                          />
                        </div>
                      </div>

                      {/* Phase quick-select */}
                      <div className="mt-4">
                        <p className="text-xs font-semibold text-gray-500 mb-2">Jump to Phase</p>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { label: "Trigger",    x: 10, y: 70 },
                            { label: "Peak",       x: 27, y: 12 },
                            { label: "Trough",     x: 42, y: 65 },
                            { label: "Slope",      x: 62, y: 50 },
                            { label: "Plateau",    x: 88, y: 45 },
                          ].map(({ label, x, y }) => (
                            <button
                              key={label}
                              onClick={() => {
                                setTechnologies((prev) =>
                                  prev.map((t) => t.id === selectedTech.id ? { ...t, x, y } : t)
                                );
                                setSelectedTech((prev) => ({ ...prev, x, y }));
                              }}
                              className="px-2.5 py-1 text-[11px] font-bold rounded-full border transition-colors hover:opacity-90"
                              style={{ background: col.light, color: col.text, borderColor: col.fill + "66" }}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
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
                    (t) => getMatrixQuadrant(t) === "Quick Wins",
                  ),
                },
                {
                  title: "Strategic Bets",
                  desc: "High impact, long-term investment",
                  color: "border-blue-500 bg-blue-50",
                  techs: filteredTech.filter(
                    (t) => getMatrixQuadrant(t) === "Strategic Bets",
                  ),
                },
                {
                  title: "Incremental Innovations",
                  desc: "Moderate impact, quick gains",
                  color: "border-yellow-500 bg-yellow-50",
                  techs: filteredTech.filter(
                    (t) => getMatrixQuadrant(t) === "Incremental",
                  ),
                },
                {
                  title: "Exploratory Research",
                  desc: "Early-stage, requires monitoring",
                  color: "border-purple-500 bg-purple-50",
                  techs: filteredTech.filter(
                    (t) => getMatrixQuadrant(t) === "Exploratory",
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
                        parseFloat(calculateTIS(a)),
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
              <div className="bg-white p-4 rounded border border-gray-300 text-gray-700 font-mono text-sm">
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
      {/* ── CSV Uploader modal ──────────────────────────────────────── */}
      {showUploader && (
        <CSVUploader
          existingKeys={mergedSourceKeys}
          onAdd={(key, rows) => {
            setUploadedDatasetsMap((prev) => ({ ...prev, [key]: rows }));
            handleDataSourceChange(key);
            setShowUploader(false);
          }}
          onUpdate={(key, rows) => {
            setUploadedDatasetsMap((prev) => ({ ...prev, [key]: rows }));
            handleDataSourceChange(key);
            setShowUploader(false);
          }}
          onClose={() => setShowUploader(false)}
        />
      )}
    </div>
  );
};

export default TechExploration;
