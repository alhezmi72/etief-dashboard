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
} from "lucide-react";

// Import all technology datasets
import {
  technologiesClaude,
  technologiesGPT,
  technologiesGemini,
  technologiesDeepSeek,
  dataSources,
} from "./initialTechnologies";

const TechDashboard = () => {
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
      (10 - tech.barriers) * Math.abs(weights.barriers) +
      (10 - tech.sustainability) * weights.sustainability +
      tech.strategicFit * weights.strategicFit;
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
    a.download = "tech-assessment-2025.csv";
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
    a.download = "dashboard-snapshot.json";
    a.click();
  };

  const filteredTech =
    filterCategory === "all"
      ? technologies
      : technologies.filter((t) => t.category === filterCategory);

  // QMIC-inspired color palette and styling
  const qmicColors = {
    primary: "#8B1538", // QMIC Maroon/Burgundy
    secondary: "#00A651", // QMIC Green
    accent: "#F7941D", // QMIC Orange
    darkBg: "#1a1a1a",
    lightBg: "#f5f5f5",
    textDark: "#333333",
    textLight: "#ffffff",
    border: "#e0e0e0",
    cardBg: "#ffffff",
  };

  const styles = {
    container: {
      minHeight: "100vh",
      background: "#ffffff",
      color: qmicColors.textDark,
      fontFamily: '"Helvetica Neue", Arial, sans-serif',
      lineHeight: "1.6",
    },
    headerBanner: {
      background: `linear-gradient(135deg, ${qmicColors.primary} 0%, #5a0f26 100%)`,
      color: qmicColors.textLight,
      padding: "40px 24px",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    },
    wrapper: {
      maxWidth: "1280px",
      margin: "0 auto",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    title: {
      fontSize: "42px",
      fontWeight: "700",
      marginBottom: "8px",
      letterSpacing: "-0.5px",
    },
    subtitle: {
      fontSize: "16px",
      opacity: "0.9",
      fontWeight: "300",
    },
    exportBtns: {
      display: "flex",
      gap: "12px",
    },
    btn: {
      padding: "12px 24px",
      borderRadius: "4px",
      border: "none",
      color: "white",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "14px",
      fontWeight: "600",
      transition: "all 0.3s ease",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    btnPrimary: {
      backgroundColor: qmicColors.secondary,
    },
    btnAccent: {
      backgroundColor: qmicColors.accent,
    },
    contentWrapper: {
      padding: "32px 24px",
      maxWidth: "1280px",
      margin: "0 auto",
    },
    navTabs: {
      display: "flex",
      gap: "0",
      marginBottom: "32px",
      borderBottom: `3px solid ${qmicColors.primary}`,
      backgroundColor: qmicColors.lightBg,
    },
    tab: {
      padding: "16px 32px",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "15px",
      fontWeight: "600",
      transition: "all 0.3s ease",
      backgroundColor: "transparent",
      color: qmicColors.textDark,
      borderBottom: "3px solid transparent",
      marginBottom: "-3px",
    },
    tabActive: {
      backgroundColor: qmicColors.cardBg,
      color: qmicColors.primary,
      borderBottomColor: qmicColors.secondary,
    },
    filterSection: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
      marginBottom: "24px",
      padding: "20px",
      backgroundColor: qmicColors.lightBg,
      borderRadius: "4px",
      border: `1px solid ${qmicColors.border}`,
    },
    select: {
      padding: "10px 16px",
      backgroundColor: qmicColors.cardBg,
      border: `2px solid ${qmicColors.border}`,
      borderRadius: "4px",
      color: qmicColors.textDark,
      fontSize: "14px",
      fontWeight: "500",
    },
    techCount: {
      color: "#666",
      fontSize: "14px",
      marginLeft: "auto",
      fontWeight: "500",
    },
    card: {
      backgroundColor: qmicColors.cardBg,
      borderRadius: "4px",
      padding: "32px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      border: `1px solid ${qmicColors.border}`,
    },
    sectionTitle: {
      fontSize: "28px",
      fontWeight: "700",
      marginBottom: "8px",
      color: qmicColors.primary,
    },
    sectionSubtitle: {
      color: "#666",
      marginBottom: "24px",
      fontSize: "15px",
    },
    svg: {
      width: "100%",
      height: "500px",
      backgroundColor: "#fafafa",
      borderRadius: "4px",
      cursor: "move",
      border: `1px solid ${qmicColors.border}`,
    },
    phaseLabel: {
      fontSize: "11px",
      fill: qmicColors.textDark,
      fontWeight: "600",
    },
    techMarker: {
      cursor: "pointer",
    },
    techLabel: {
      fontSize: "11px",
      fill: qmicColors.textDark,
      fontWeight: "600",
      pointerEvents: "none",
    },
    techDetails: {
      marginTop: "24px",
      padding: "24px",
      backgroundColor: qmicColors.lightBg,
      borderRadius: "4px",
      border: `2px solid ${qmicColors.secondary}`,
    },
    techName: {
      fontSize: "22px",
      fontWeight: "700",
      color: qmicColors.primary,
      marginBottom: "16px",
    },
    techInfoGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "16px",
      fontSize: "14px",
    },
    infoLabel: {
      color: "#666",
      fontWeight: "600",
    },
    matrixGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "20px",
      height: "600px",
    },
    quadrant: {
      border: "2px solid",
      borderRadius: "4px",
      padding: "20px",
      overflowY: "auto",
      backgroundColor: qmicColors.lightBg,
    },
    quadrantGreen: {
      borderColor: qmicColors.secondary,
      backgroundColor: "#f0faf4",
    },
    quadrantBlue: {
      borderColor: "#0066cc",
      backgroundColor: "#f0f7ff",
    },
    quadrantYellow: {
      borderColor: qmicColors.accent,
      backgroundColor: "#fff9f0",
    },
    quadrantPurple: {
      borderColor: qmicColors.primary,
      backgroundColor: "#faf0f3",
    },
    quadrantTitle: {
      fontSize: "20px",
      fontWeight: "700",
      marginBottom: "12px",
      color: qmicColors.primary,
    },
    quadrantDesc: {
      fontSize: "13px",
      color: "#666",
      marginBottom: "16px",
      lineHeight: "1.5",
    },
    quadrantTechs: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    },
    quadrantTechCard: {
      padding: "16px",
      backgroundColor: qmicColors.cardBg,
      borderRadius: "4px",
      border: `1px solid ${qmicColors.border}`,
      cursor: "pointer",
      transition: "all 0.3s ease",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    },
    quadrantTechName: {
      fontWeight: "600",
      fontSize: "14px",
      color: qmicColors.textDark,
    },
    quadrantTechMeta: {
      fontSize: "12px",
      color: "#666",
      marginTop: "6px",
    },
    matrixLegend: {
      marginTop: "24px",
      padding: "20px",
      backgroundColor: qmicColors.lightBg,
      borderRadius: "4px",
      border: `1px solid ${qmicColors.border}`,
      display: "flex",
      justifyContent: "space-between",
      fontSize: "13px",
      flexWrap: "wrap",
      gap: "16px",
    },
    legendItem: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontWeight: "500",
    },
    legendColor: {
      width: "20px",
      height: "20px",
      borderRadius: "3px",
    },
    tableHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "24px",
      gap: "24px",
    },
    weightControls: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
      backgroundColor: qmicColors.lightBg,
      padding: "20px",
      borderRadius: "4px",
      border: `1px solid ${qmicColors.border}`,
    },
    weightSliders: {
      fontSize: "13px",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    },
    sliderRow: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    sliderLabel: {
      width: "120px",
      fontWeight: "600",
      color: qmicColors.textDark,
    },
    slider: {
      width: "100px",
    },
    sliderValue: {
      width: "50px",
      textAlign: "right",
      fontWeight: "600",
      color: qmicColors.primary,
    },
    tableContainer: {
      overflowX: "auto",
    },
    table: {
      width: "100%",
      fontSize: "14px",
      borderCollapse: "collapse",
    },
    th: {
      textAlign: "left",
      padding: "16px 12px",
      fontWeight: "700",
      borderBottom: `3px solid ${qmicColors.primary}`,
      backgroundColor: qmicColors.lightBg,
      color: qmicColors.textDark,
    },
    thCenter: {
      textAlign: "center",
    },
    td: {
      padding: "14px 12px",
      borderBottom: `1px solid ${qmicColors.border}`,
    },
    tdCenter: {
      textAlign: "center",
    },
    tr: {
      cursor: "pointer",
      transition: "background-color 0.2s",
    },
    badge: {
      padding: "6px 12px",
      borderRadius: "3px",
      fontSize: "12px",
      fontWeight: "700",
      display: "inline-block",
    },
    badgeGreen: {
      backgroundColor: "#d4f4dd",
      color: "#0d5721",
      border: `1px solid ${qmicColors.secondary}`,
    },
    badgeOrange: {
      backgroundColor: "#fff3e0",
      color: "#e65100",
      border: `1px solid ${qmicColors.accent}`,
    },
    badgeTis: {
      padding: "6px 14px",
      borderRadius: "3px",
      fontWeight: "700",
      display: "inline-block",
    },
    tisHigh: {
      backgroundColor: qmicColors.secondary,
      color: "white",
    },
    tisMedium: {
      backgroundColor: qmicColors.accent,
      color: "white",
    },
    tisLow: {
      backgroundColor: qmicColors.primary,
      color: "white",
    },
    formulaBox: {
      marginTop: "24px",
      padding: "20px",
      backgroundColor: qmicColors.lightBg,
      borderRadius: "4px",
      border: `2px solid ${qmicColors.secondary}`,
    },
    formulaTitle: {
      fontSize: "16px",
      fontWeight: "700",
      color: qmicColors.primary,
      marginBottom: "12px",
    },
    formulaText: {
      fontSize: "13px",
      color: qmicColors.textDark,
      fontFamily: '"Courier New", monospace',
      backgroundColor: "white",
      padding: "12px",
      borderRadius: "3px",
      border: `1px solid ${qmicColors.border}`,
    },
    formulaNote: {
      fontSize: "13px",
      color: "#666",
      marginTop: "12px",
      lineHeight: "1.6",
    },
    footer: {
      maxWidth: "1280px",
      margin: "40px auto 0",
      padding: "32px 24px",
      borderTop: `3px solid ${qmicColors.primary}`,
      textAlign: "center",
      fontSize: "13px",
      color: "#666",
      backgroundColor: qmicColors.lightBg,
    },
  };

  return (
    <div style={styles.container}>
      {/* QMIC-style Header Banner */}
      <div style={styles.headerBanner}>
        <div style={styles.wrapper}>
          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>Technology Assessment Dashboard 2025</h1>
              <p style={styles.subtitle}>
                Strategic Technology Evaluation & Hype Cycle Analysis
              </p>
            </div>
            <div style={styles.exportBtns}>
              <button
                onClick={exportToCSV}
                style={{ ...styles.btn, ...styles.btnPrimary }}
                onMouseEnter={(e) => (e.target.style.opacity = "0.9")}
                onMouseLeave={(e) => (e.target.style.opacity = "1")}
              >
                <Download size={18} /> Export CSV
              </button>
              <button
                onClick={exportSnapshot}
                style={{ ...styles.btn, ...styles.btnAccent }}
                onMouseEnter={(e) => (e.target.style.opacity = "0.9")}
                onMouseLeave={(e) => (e.target.style.opacity = "1")}
              >
                <Save size={18} /> Save Snapshot
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={styles.contentWrapper}>
        {/* Navigation Tabs */}
        <div style={styles.navTabs}>
          {[
            { id: "hype", label: "Hype Cycle", icon: RefreshCw },
            { id: "matrix", label: "Strategic Matrix", icon: Grid },
            { id: "table", label: "Impact Assessment", icon: FileText },
            { id: "report", label: "Risk Report", icon: PieChart },
          ].map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              style={{
                ...styles.tab,
                ...(activeView === view.id ? styles.tabActive : {}),
              }}
              onMouseEnter={(e) => {
                if (activeView !== view.id) {
                  e.target.style.backgroundColor = "#eeeeee";
                }
              }}
              onMouseLeave={(e) => {
                if (activeView !== view.id) {
                  e.target.style.backgroundColor = "transparent";
                }
              }}
            >
              <view.icon size={18} /> {view.label}
            </button>
          ))}
        </div>

        {/* Filter Section */}
        <div className="flex items-center gap-4 mb-6">
          <label
            style={{
              fontWeight: "600",
              color: qmicColors.textDark,
              marginLeft: "24px",
            }}
          >
            Data Source:
          </label>
          <select
            value={dataSource}
            onChange={(e) => handleDataSourceChange(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
          >
            <option value="claude">Claude Dataset</option>
            <option value="gpt">GPT Dataset</option>
            <option value="gemini">Gemini Dataset</option>
            <option value="deepSeek">DeepSeek Dataset</option>
          </select>

          <label
            style={{
              fontWeight: "600",
              color: qmicColors.textDark,
              marginLeft: "24px",
            }}
          >
            Filter Category:
          </label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat}
              </option>
            ))}
          </select>

          <span className="text-slate-400 text-sm ml-auto">
            Showing {filteredTech.length} of {technologies.length} technologies
          </span>
        </div>

        {/* HYPE CYCLE VIEW */}
        {activeView === "hype" && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Gartner-Style Hype Cycle</h2>
            <p style={styles.sectionSubtitle}>
              Drag markers to adjust positions • Click for details
            </p>

            <svg
              ref={svgRef}
              viewBox="0 0 900 450"
              style={styles.svg}
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
                    stroke="rgba(139, 21, 56, 0.1)"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="900" height="450" fill="url(#grid)" />

              <path
                d={hypeCurvePath}
                fill="none"
                stroke={qmicColors.secondary}
                strokeWidth="4"
              />

              {phases.map((phase, i) => (
                <g key={i}>
                  <rect
                    x={phase.x * 9}
                    y="420"
                    width={phase.width * 9}
                    height="30"
                    fill={qmicColors.lightBg}
                    stroke={qmicColors.border}
                    strokeWidth="1"
                  />
                  <text
                    x={phase.x * 9 + (phase.width * 9) / 2}
                    y="437"
                    textAnchor="middle"
                    style={styles.phaseLabel}
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
                  style={styles.techMarker}
                >
                  <circle
                    cx={tech.x * 9}
                    cy={tech.y * 4}
                    r={dragging === tech.id ? 10 : 8}
                    fill={
                      tech.id === selectedTech?.id
                        ? qmicColors.secondary
                        : qmicColors.primary
                    }
                    stroke="#fff"
                    strokeWidth="2"
                  />
                  <text
                    x={tech.x * 9}
                    y={tech.y * 4 - 12}
                    textAnchor="middle"
                    style={styles.techLabel}
                  >
                    {tech.name}
                  </text>
                </g>
              ))}
            </svg>

            {selectedTech && (
              <div style={styles.techDetails}>
                <h3 style={styles.techName}>{selectedTech.name}</h3>
                <div style={styles.techInfoGrid}>
                  <div>
                    <span style={styles.infoLabel}>Category:</span>{" "}
                    {selectedTech.category}
                  </div>
                  <div>
                    <span style={styles.infoLabel}>TRL:</span>{" "}
                    {selectedTech.trl}/9
                  </div>
                  <div>
                    <span style={styles.infoLabel}>Impact:</span>{" "}
                    {selectedTech.impact}/10
                  </div>
                  <div>
                    <span style={styles.infoLabel}>Strategic Fit:</span>{" "}
                    {selectedTech.strategicFit}/10
                  </div>
                  <div>
                    <span style={styles.infoLabel}>TIS:</span>{" "}
                    {calculateTIS(selectedTech)}
                  </div>
                  <div style={{ gridColumn: "1 / 1" }}>
                    <span style={styles.infoLabel}>Source:</span>{" "}
                    {selectedTech.source}
                  </div>
                  <div>
                    <span style={styles.infoLabel}>Notes:</span>{" "}
                    {selectedTech.notes}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STRATEGIC MATRIX VIEW */}
        {activeView === "matrix" && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Four-Quadrant Strategic Matrix</h2>

            <div style={styles.matrixGrid}>
              {[
                "Quick Wins",
                "Strategic Bets",
                "Incremental",
                "Exploratory",
              ].map((quadrant, idx) => {
                const techsInQuadrant = filteredTech.filter(
                  (t) => getMatrixQuadrant(t) === quadrant
                );
                const quadrantStyles = [
                  styles.quadrantGreen,
                  styles.quadrantBlue,
                  styles.quadrantYellow,
                  styles.quadrantPurple,
                ];

                return (
                  <div
                    key={quadrant}
                    style={{ ...styles.quadrant, ...quadrantStyles[idx] }}
                  >
                    <h3 style={styles.quadrantTitle}>{quadrant}</h3>
                    <p style={styles.quadrantDesc}>
                      {quadrant === "Quick Wins" &&
                        "High impact, near-term deployment"}
                      {quadrant === "Strategic Bets" &&
                        "High impact, long-term investment"}
                      {quadrant === "Incremental" &&
                        "Moderate impact, quick gains"}
                      {quadrant === "Exploratory" &&
                        "Early-stage, requires monitoring"}
                    </p>
                    <div style={styles.quadrantTechs}>
                      {techsInQuadrant.map((tech) => (
                        <div
                          key={tech.id}
                          style={styles.quadrantTechCard}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.boxShadow =
                              "0 4px 8px rgba(0,0,0,0.15)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.boxShadow =
                              "0 1px 3px rgba(0,0,0,0.05)")
                          }
                        >
                          <div style={styles.quadrantTechName}>{tech.name}</div>
                          <div style={styles.quadrantTechMeta}>
                            TIS: {calculateTIS(tech)} | TRL: {tech.trl}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={styles.matrixLegend}>
              <div style={styles.legendItem}>
                <div
                  style={{
                    ...styles.legendColor,
                    backgroundColor: qmicColors.secondary,
                  }}
                ></div>
                <span>Quick Wins (TIS ≥7, TRL ≥7)</span>
              </div>
              <div style={styles.legendItem}>
                <div
                  style={{ ...styles.legendColor, backgroundColor: "#0066cc" }}
                ></div>
                <span>Strategic Bets (TIS ≥7, TRL &lt;7)</span>
              </div>
              <div style={styles.legendItem}>
                <div
                  style={{
                    ...styles.legendColor,
                    backgroundColor: qmicColors.accent,
                  }}
                ></div>
                <span>Incremental (TIS &lt;7, TRL ≥7)</span>
              </div>
              <div style={styles.legendItem}>
                <div
                  style={{
                    ...styles.legendColor,
                    backgroundColor: qmicColors.primary,
                  }}
                ></div>
                <span>Exploratory (TIS &lt;7, TRL &lt;7)</span>
              </div>
            </div>
          </div>
        )}

        {/* IMPACT ASSESSMENT TABLE */}
        {activeView === "table" && (
          <div style={styles.card}>
            <div style={styles.tableHeader}>
              <div>
                <h2 style={styles.sectionTitle}>Business Impact Assessment</h2>
                <p style={styles.sectionSubtitle}>
                  Comprehensive technology evaluation metrics
                </p>
              </div>

              <div style={styles.weightControls}>
                <Settings size={20} style={{ color: qmicColors.primary }} />
                <div style={styles.weightSliders}>
                  <div style={styles.sliderRow}>
                    <label style={styles.sliderLabel}>TRL Weight:</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={weights.trl}
                      onChange={(e) =>
                        setWeights({
                          ...weights,
                          trl: parseFloat(e.target.value),
                        })
                      }
                      style={styles.slider}
                    />
                    <span style={styles.sliderValue}>
                      {weights.trl.toFixed(1)}
                    </span>
                  </div>
                  <div style={styles.sliderRow}>
                    <label style={styles.sliderLabel}>Impact Weight:</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={weights.impact}
                      onChange={(e) =>
                        setWeights({
                          ...weights,
                          impact: parseFloat(e.target.value),
                        })
                      }
                      style={styles.slider}
                    />
                    <span style={styles.sliderValue}>
                      {weights.impact.toFixed(1)}
                    </span>
                  </div>
                  <div style={styles.sliderRow}>
                    <label style={styles.sliderLabel}>Strategic Fit:</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={weights.strategicFit}
                      onChange={(e) =>
                        setWeights({
                          ...weights,
                          strategicFit: parseFloat(e.target.value),
                        })
                      }
                      style={styles.slider}
                    />
                    <span style={styles.sliderValue}>
                      {weights.strategicFit.toFixed(2)}
                    </span>
                  </div>
                  <div style={styles.sliderRow}>
                    <label style={styles.sliderLabel}>Barrier Factor:</label>
                    <input
                      type="range"
                      min="-0.5"
                      max="0"
                      step="0.05"
                      value={weights.barriers}
                      onChange={(e) =>
                        setWeights({
                          ...weights,
                          barriers: parseFloat(e.target.value),
                        })
                      }
                      style={styles.slider}
                    />
                    <span style={styles.sliderValue}>
                      {weights.barriers.toFixed(2)}
                    </span>
                  </div>
                  <div style={styles.sliderRow}>
                    <label style={styles.sliderLabel}>Sustainability:</label>
                    <input
                      type="range"
                      min="0"
                      max="0.3"
                      step="0.05"
                      value={weights.sustainability}
                      onChange={(e) =>
                        setWeights({
                          ...weights,
                          sustainability: parseFloat(e.target.value),
                        })
                      }
                      style={styles.slider}
                    />
                    <span style={styles.sliderValue}>
                      {weights.sustainability.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Technology</th>
                    <th style={styles.th}>Category</th>
                    <th style={{ ...styles.th, ...styles.thCenter }}>TRL</th>
                    <th style={{ ...styles.th, ...styles.thCenter }}>Impact</th>
                    <th style={{ ...styles.th, ...styles.thCenter }}>
                      Strategic Fit
                    </th>
                    <th style={{ ...styles.th, ...styles.thCenter }}>
                      Barriers
                    </th>
                    <th style={{ ...styles.th, ...styles.thCenter }}>
                      Sustainability
                    </th>
                    <th style={{ ...styles.th, ...styles.thCenter }}>TIS</th>
                    <th style={styles.th}>Quadrant</th>
                    <th style={styles.th}>Source</th>
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
                          style={styles.tr}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              qmicColors.lightBg)
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                        >
                          <td
                            style={{
                              ...styles.td,
                              fontWeight: "600",
                              color: qmicColors.primary,
                            }}
                          >
                            {tech.name}
                          </td>
                          <td style={{ ...styles.td, color: "#666" }}>
                            {tech.category}
                          </td>
                          <td style={{ ...styles.td, ...styles.tdCenter }}>
                            <span
                              style={{
                                ...styles.badge,
                                ...(tech.trl >= 7
                                  ? styles.badgeGreen
                                  : styles.badgeOrange),
                              }}
                            >
                              {tech.trl}/9
                            </span>
                          </td>
                          <td style={{ ...styles.td, ...styles.tdCenter }}>
                            {tech.impact}/10
                          </td>
                          <td style={{ ...styles.td, ...styles.tdCenter }}>
                            <span
                              style={{
                                padding: "6px 12px",
                                borderRadius: "3px",
                                fontSize: "12px",
                                fontWeight: "700",
                                display: "inline-block",
                                backgroundColor:
                                  tech.strategicFit >= 8
                                    ? "#d4f4dd"
                                    : tech.strategicFit >= 6
                                    ? "#fff3e0"
                                    : "#fce4ec",
                                color:
                                  tech.strategicFit >= 8
                                    ? "#0d5721"
                                    : tech.strategicFit >= 6
                                    ? "#e65100"
                                    : "#c62828",
                                border: `1px solid ${
                                  tech.strategicFit >= 8
                                    ? qmicColors.secondary
                                    : tech.strategicFit >= 6
                                    ? qmicColors.accent
                                    : "#e57373"
                                }`,
                              }}
                            >
                              {tech.strategicFit}/10
                            </span>
                          </td>
                          <td style={{ ...styles.td, ...styles.tdCenter }}>
                            {tech.barriers}/10
                          </td>
                          <td style={{ ...styles.td, ...styles.tdCenter }}>
                            {tech.sustainability}/10
                          </td>
                          <td style={{ ...styles.td, ...styles.tdCenter }}>
                            <span
                              style={{
                                ...styles.badgeTis,
                                ...(tis >= 8
                                  ? styles.tisHigh
                                  : tis >= 6
                                  ? styles.tisMedium
                                  : styles.tisLow),
                              }}
                            >
                              {tis}
                            </span>
                          </td>
                          <td style={{ ...styles.td, fontWeight: "600" }}>
                            {getMatrixQuadrant(tech)}
                          </td>
                          <td
                            style={{
                              ...styles.td,
                              fontSize: "12px",
                              color: "#888",
                            }}
                          >
                            {tech.source}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            <div style={styles.formulaBox}>
              <h3 style={styles.formulaTitle}>
                Tech Impact Score (TIS) Formula:
              </h3>
              <p style={styles.formulaText}>
                TIS = (TRL × {weights.trl.toFixed(2)}) + (Impact ×{" "}
                {weights.impact.toFixed(2)}) + ((10 - Barriers) ×{" "}
                {Math.abs(weights.barriers).toFixed(2)}) + ((10 -
                Sustainability) × {weights.sustainability.toFixed(2)}) +
                (Strategic Fit × {weights.strategicFit.toFixed(2)})
              </p>
              <p style={styles.formulaNote}>
                Adjust the weight controls above to re-score technologies in
                real-time. A higher TIS indicates greater strategic value and
                deployment readiness.
              </p>
              <br></br>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse border border-gray-300 text-sm text-gray-800">
                    <thead className="bg-qmic-lightgray text-gray-700">
                      <tr>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                          Parameter
                        </th>
                        
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                          1 =
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                          10 =
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-3 font-medium">
                          Impact
                        </td>
                        
                        <td className="border border-gray-300 px-4 py-3">
                          Minimal impact
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          Transformative / disruptive
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3 font-medium">
                          Barriers
                        </td>
                        
                        <td className="border border-gray-300 px-4 py-3">
                          Easy adoption
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          Very difficult adoption
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-3 font-medium">
                          Strategic Fit
                        </td>
                        
                        <td className="border border-gray-300 px-4 py-3">
                          Low relevance to QMIC strategy
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          High relevance (Smart City / Robotics /
                          Sustainability)
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3 font-medium">
                          Sustainability & Ethics
                        </td>
                        
                        <td className="border border-gray-300 px-4 py-3">
                          Best (eco-friendly, ethical)
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          Worst (high environmental / ethical cost)
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
        
        )}

        {/* RISK REPORT VIEW */}
        {activeView === "report" && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>
              Reuters-Style Risk & Maturity Report
            </h2>

            <div
              style={{
                marginBottom: "32px",
                padding: "28px",
                background: `linear-gradient(to right, ${qmicColors.lightBg}, #ffffff)`,
                borderRadius: "4px",
                border: `2px solid ${qmicColors.primary}`,
              }}
            >
              <h3
                style={{
                  fontSize: "22px",
                  fontWeight: "700",
                  color: qmicColors.primary,
                  marginBottom: "16px",
                }}
              >
                Executive Summary: Agentic AI Project Landscape
              </h3>
              <div
                style={{
                  fontSize: "14px",
                  lineHeight: "1.8",
                  color: qmicColors.textDark,
                }}
              >
                <p style={{ marginBottom: "12px" }}>
                  <strong style={{ color: qmicColors.primary }}>
                    Market Position:
                  </strong>{" "}
                  Agentic AI represents the next evolution of artificial
                  intelligence, moving from assistive tools to autonomous
                  decision-making systems. Currently positioned at the
                  Innovation Trigger phase of the hype cycle, with significant
                  investment from major tech companies and enterprises seeking
                  automation advantages.
                </p>
                <p style={{ marginBottom: "12px" }}>
                  <strong style={{ color: qmicColors.primary }}>
                    Technology Readiness:
                  </strong>{" "}
                  The sector exhibits a Technology Readiness Level (TRL) of 4-5,
                  indicating laboratory validation with some early field
                  demonstrations. Multiple competing architectures are emerging,
                  with no clear standard yet established. Key players include
                  OpenAI, Anthropic, Google DeepMind, and numerous startups.
                </p>
                <p style={{ marginBottom: "8px" }}>
                  <strong style={{ color: qmicColors.primary }}>
                    Critical Risks Identified:
                  </strong>
                </p>
                <ul style={{ marginLeft: "24px", listStyleType: "disc" }}>
                  <li style={{ marginBottom: "6px" }}>
                    <strong>Safety & Control:</strong> Autonomous agents may
                    take unexpected actions with limited oversight mechanisms
                  </li>
                  <li style={{ marginBottom: "6px" }}>
                    <strong>Liability & Accountability:</strong> Legal
                    frameworks lag technological capabilities; unclear
                    responsibility chains
                  </li>
                  <li style={{ marginBottom: "6px" }}>
                    <strong>Data Privacy:</strong> Agents accessing sensitive
                    data across organizational boundaries pose compliance risks
                  </li>
                  <li style={{ marginBottom: "6px" }}>
                    <strong>Integration Complexity:</strong> Significant
                    technical debt and system integration challenges in legacy
                    environments
                  </li>
                  <li>
                    <strong>Workforce Disruption:</strong> Potential
                    displacement of knowledge workers requires careful change
                    management
                  </li>
                </ul>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
                marginBottom: "32px",
              }}
            >
              <div
                style={{
                  padding: "24px",
                  backgroundColor: "#fff5f5",
                  borderRadius: "4px",
                  border: "2px solid #dc2626",
                }}
              >
                <h4
                  style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    marginBottom: "16px",
                    color: "#dc2626",
                  }}
                >
                  High-Priority Risks
                </h4>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    fontSize: "14px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px",
                      backgroundColor: "white",
                      borderRadius: "4px",
                      border: "1px solid #fca5a5",
                    }}
                  >
                    <span style={{ fontWeight: "600" }}>
                      Safety & Alignment
                    </span>
                    <span
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#dc2626",
                        fontSize: "11px",
                        borderRadius: "3px",
                        fontWeight: "700",
                        color: "white",
                      }}
                    >
                      CRITICAL
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px",
                      backgroundColor: "white",
                      borderRadius: "4px",
                      border: "1px solid #fca5a5",
                    }}
                  >
                    <span style={{ fontWeight: "600" }}>
                      Regulatory Compliance
                    </span>
                    <span
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#dc2626",
                        fontSize: "11px",
                        borderRadius: "3px",
                        fontWeight: "700",
                        color: "white",
                      }}
                    >
                      CRITICAL
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px",
                      backgroundColor: "white",
                      borderRadius: "4px",
                      border: "1px solid #fed7aa",
                    }}
                  >
                    <span style={{ fontWeight: "600" }}>Cost Overruns</span>
                    <span
                      style={{
                        padding: "6px 12px",
                        backgroundColor: qmicColors.accent,
                        fontSize: "11px",
                        borderRadius: "3px",
                        fontWeight: "700",
                        color: "white",
                      }}
                    >
                      HIGH
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px",
                      backgroundColor: "white",
                      borderRadius: "4px",
                      border: "1px solid #fed7aa",
                    }}
                  >
                    <span style={{ fontWeight: "600" }}>Vendor Lock-in</span>
                    <span
                      style={{
                        padding: "6px 12px",
                        backgroundColor: qmicColors.accent,
                        fontSize: "11px",
                        borderRadius: "3px",
                        fontWeight: "700",
                        color: "white",
                      }}
                    >
                      HIGH
                    </span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: "24px",
                  backgroundColor: "#f0faf4",
                  borderRadius: "4px",
                  border: `2px solid ${qmicColors.secondary}`,
                }}
              >
                <h4
                  style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    marginBottom: "16px",
                    color: qmicColors.secondary,
                  }}
                >
                  Opportunity Areas
                </h4>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    fontSize: "14px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px",
                      backgroundColor: "white",
                      borderRadius: "4px",
                      border: `1px solid ${qmicColors.secondary}`,
                    }}
                  >
                    <span style={{ fontWeight: "600" }}>
                      Process Automation
                    </span>
                    <span
                      style={{
                        padding: "6px 12px",
                        backgroundColor: qmicColors.secondary,
                        fontSize: "11px",
                        borderRadius: "3px",
                        fontWeight: "700",
                        color: "white",
                      }}
                    >
                      HIGH ROI
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px",
                      backgroundColor: "white",
                      borderRadius: "4px",
                      border: `1px solid ${qmicColors.secondary}`,
                    }}
                  >
                    <span style={{ fontWeight: "600" }}>Customer Service</span>
                    <span
                      style={{
                        padding: "6px 12px",
                        backgroundColor: qmicColors.secondary,
                        fontSize: "11px",
                        borderRadius: "3px",
                        fontWeight: "700",
                        color: "white",
                      }}
                    >
                      HIGH ROI
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px",
                      backgroundColor: "white",
                      borderRadius: "4px",
                      border: "1px solid #93c5fd",
                    }}
                  >
                    <span style={{ fontWeight: "600" }}>
                      Research & Development
                    </span>
                    <span
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#0066cc",
                        fontSize: "11px",
                        borderRadius: "3px",
                        fontWeight: "700",
                        color: "white",
                      }}
                    >
                      MEDIUM ROI
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px",
                      backgroundColor: "white",
                      borderRadius: "4px",
                      border: "1px solid #93c5fd",
                    }}
                  >
                    <span style={{ fontWeight: "600" }}>
                      Supply Chain Optimization
                    </span>
                    <span
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#0066cc",
                        fontSize: "11px",
                        borderRadius: "3px",
                        fontWeight: "700",
                        color: "white",
                      }}
                    >
                      MEDIUM ROI
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                padding: "28px",
                backgroundColor: qmicColors.lightBg,
                borderRadius: "4px",
                border: `1px solid ${qmicColors.border}`,
                marginBottom: "32px",
              }}
            >
              <h4
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  marginBottom: "20px",
                  color: qmicColors.primary,
                }}
              >
                Technology Maturity Assessment
              </h4>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
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
                ].map((item, idx) => (
                  <div key={idx}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "6px",
                        fontSize: "15px",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: "600",
                          color: qmicColors.textDark,
                        }}
                      >
                        {item.dimension}
                      </span>
                      <span
                        style={{ color: qmicColors.primary, fontWeight: "700" }}
                      >
                        {item.score}%
                      </span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        backgroundColor: "#e0e0e0",
                        borderRadius: "4px",
                        height: "10px",
                        marginBottom: "6px",
                      }}
                    >
                      <div
                        style={{
                          height: "10px",
                          borderRadius: "4px",
                          width: `${item.score}%`,
                          backgroundColor:
                            item.score >= 60
                              ? qmicColors.secondary
                              : item.score >= 40
                              ? qmicColors.accent
                              : "#dc2626",
                          transition: "width 0.3s ease",
                        }}
                      ></div>
                    </div>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#666",
                        lineHeight: "1.5",
                      }}
                    >
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                padding: "28px",
                background: `linear-gradient(to right, ${qmicColors.lightBg}, #ffffff)`,
                borderRadius: "4px",
                border: `2px solid ${qmicColors.secondary}`,
              }}
            >
              <h4
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  marginBottom: "20px",
                  color: qmicColors.primary,
                }}
              >
                Strategic Recommendations
              </h4>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "20px",
                  fontSize: "14px",
                }}
              >
                <div
                  style={{
                    padding: "20px",
                    backgroundColor: "white",
                    borderRadius: "4px",
                    border: `2px solid ${qmicColors.secondary}`,
                  }}
                >
                  <h5
                    style={{
                      fontWeight: "700",
                      color: qmicColors.secondary,
                      marginBottom: "12px",
                      fontSize: "16px",
                    }}
                  >
                    Short-Term (0-12 months)
                  </h5>
                  <ul
                    style={{
                      marginLeft: "18px",
                      listStyleType: "disc",
                      fontSize: "13px",
                      lineHeight: "1.8",
                    }}
                  >
                    <li>Pilot projects in low-risk domains</li>
                    <li>Establish governance frameworks</li>
                    <li>Build internal expertise</li>
                    <li>Monitor regulatory developments</li>
                  </ul>
                </div>

                <div
                  style={{
                    padding: "20px",
                    backgroundColor: "white",
                    borderRadius: "4px",
                    border: "2px solid #0066cc",
                  }}
                >
                  <h5
                    style={{
                      fontWeight: "700",
                      color: "#0066cc",
                      marginBottom: "12px",
                      fontSize: "16px",
                    }}
                  >
                    Mid-Term (1-2 years)
                  </h5>
                  <ul
                    style={{
                      marginLeft: "18px",
                      listStyleType: "disc",
                      fontSize: "13px",
                      lineHeight: "1.8",
                    }}
                  >
                    <li>Scale successful pilots</li>
                    <li>Develop custom agent frameworks</li>
                    <li>Integrate with core systems</li>
                    <li>Implement monitoring systems</li>
                  </ul>
                </div>

                <div
                  style={{
                    padding: "20px",
                    backgroundColor: "white",
                    borderRadius: "4px",
                    border: `2px solid ${qmicColors.primary}`,
                  }}
                >
                  <h5
                    style={{
                      fontWeight: "700",
                      color: qmicColors.primary,
                      marginBottom: "12px",
                      fontSize: "16px",
                    }}
                  >
                    Long-Term (2-5 years)
                  </h5>
                  <ul
                    style={{
                      marginLeft: "18px",
                      listStyleType: "disc",
                      fontSize: "13px",
                      lineHeight: "1.8",
                    }}
                  >
                    <li>Enterprise-wide agent ecosystem</li>
                    <li>Multi-agent orchestration</li>
                    <li>Autonomous decision systems</li>
                    <li>Competitive differentiation</li>
                  </ul>
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: "32px",
                padding: "24px",
                backgroundColor: qmicColors.lightBg,
                borderRadius: "4px",
                border: `1px solid ${qmicColors.border}`,
              }}
            >
              <h4
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  marginBottom: "16px",
                  color: qmicColors.textDark,
                }}
              >
                Market Intelligence Sources
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                  fontSize: "13px",
                }}
              >
                <div>
                  <strong style={{ color: qmicColors.primary }}>
                    Gartner Analysis:
                  </strong>
                  <p
                    style={{
                      color: "#666",
                      marginTop: "6px",
                      lineHeight: "1.6",
                    }}
                  >
                    Positioned agentic AI at Innovation Trigger with 5-10 year
                    horizon to plateau. Emphasizes governance and safety
                    frameworks.
                  </p>
                </div>
                <div>
                  <strong style={{ color: qmicColors.primary }}>
                    McKinsey Outlook:
                  </strong>
                  <p
                    style={{
                      color: "#666",
                      marginTop: "6px",
                      lineHeight: "1.6",
                    }}
                  >
                    Projects $4.4T annual economic impact from generative AI;
                    agentic systems could double this through automation.
                  </p>
                </div>
                <div>
                  <strong style={{ color: qmicColors.primary }}>
                    CB Insights Tracking:
                  </strong>
                  <p
                    style={{
                      color: "#666",
                      marginTop: "6px",
                      lineHeight: "1.6",
                    }}
                  >
                    $12.3B invested in AI agents/automation startups in 2024;
                    43% YoY growth in enterprise pilots.
                  </p>
                </div>
                <div>
                  <strong style={{ color: qmicColors.primary }}>
                    WEF Perspective:
                  </strong>
                  <p
                    style={{
                      color: "#666",
                      marginTop: "6px",
                      lineHeight: "1.6",
                    }}
                  >
                    Highlights ethical considerations and workforce
                    transformation as critical success factors for deployment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <p style={{ fontWeight: "600", marginBottom: "8px" }}>
          Data Sources: Gartner Hype Cycle 2024/2025 • WEF Top 10 Emerging
          Technologies 2025 • McKinsey Technology Trends 2025 • CB Insights 2025
          Tech Trends
        </p>
        <p>Dashboard Version 2025.1 • Last Updated: October 2025</p>
        <p style={{ marginTop: "12px", fontSize: "12px" }}>
          Powered by Qatar Mobility Innovations Center (QMIC) Design System
        </p>
      </div>
    </div>
  );
};

export default TechDashboard;
