import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Download,
  Save,
  Settings,
  RefreshCw,
  Grid,
  FileText,
  PieChart,
} from "lucide-react";

// Tech Assessment Dashboard — Single-file React component
// Features:
// - Interactive drag-and-drop Hype Cycle with autosave (localStorage)
// - Four-quadrant strategic matrix derived from TIS & TRL
// - Business Impact table (sortable, filterable)
// - Risk report with maturity assessment and recommendations
// - Live TIS weighting controls, CSV export, JSON snapshot
// Styling: QMIC-inspired color system (approximation) — replace with official QMIC CSS when available

export default function TechAssessmentDashboard() {
  // ---------- Configuration & Colors (QMIC-inspired) ----------
  const qmic = {
    primary: "#8B1538", // maroon
    secondary: "#00A651",
    accent: "#F7941D",
    dark: "#111827",
    lightBg: "#f7f7f9",
    card: "#ffffff",
    border: "#e6e6e6",
    text: "#1f2937",
  };

  // ---------- Utilities ----------
  const uid = (n) =>
    `${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 2 + (n || 6))}`;

  // ---------- Pre-populated technologies (25+) ----------
  // These are curated from Gartner, WEF, McKinsey, CB Insights (2024/2025 reports)
  const defaultTechs = [
    {
      id: "t1",
      name: "Generative AI & Foundation Models",
      category: "AI & Automation",
      horizon: "1y",
      phase: "Peak",
      x: 18,
      y: 22,
      TRL: 8,
      impact: 9,
      barriers: 4,
      sustainability: 4,
      source: "Gartner 2024, McKinsey 2025",
      notes: "Large impact across content, code, and design automation.",
    },
    {
      id: "t2",
      name: "Agentic AI (Autonomous Agents)",
      category: "AI & Automation",
      horizon: "1y",
      phase: "Innovation",
      x: 16,
      y: 14,
      TRL: 6,
      impact: 9,
      barriers: 6,
      sustainability: 3,
      source: "Gartner 2024, CB Insights 2025",
      notes: "Autonomous agents executing tasks on behalf of users.",
    },
    {
      id: "t3",
      name: "AI Safety & Governance Tooling",
      category: "Trust & Security",
      horizon: "1y",
      phase: "Slope",
      x: 36,
      y: 40,
      TRL: 7,
      impact: 7,
      barriers: 4,
      sustainability: 5,
      source: "WEF 2025",
      notes: "Monitoring, alignment and regulatory compliance tools.",
    },
    {
      id: "t4",
      name: "Synthetic Data & Privacy-preserving AI",
      category: "AI & Automation",
      horizon: "1y",
      phase: "Slope",
      x: 46,
      y: 38,
      TRL: 7,
      impact: 7,
      barriers: 3,
      sustainability: 6,
      source: "McKinsey 2025",
      notes: "Generates privacy-safe datasets for training.",
    },
    {
      id: "t5",
      name: "Edge AI & Federated Intelligence",
      category: "IoT & Edge",
      horizon: "1y",
      phase: "Slope",
      x: 58,
      y: 46,
      TRL: 7,
      impact: 7,
      barriers: 3,
      sustainability: 7,
      source: "Gartner 2024",
      notes: "On-device ML enabling low-latency and privacy.",
    },
    {
      id: "t6",
      name: "Application-specific Semiconductors (AI accelerators)",
      category: "Computing",
      horizon: "1-3y",
      phase: "Slope",
      x: 62,
      y: 50,
      TRL: 8,
      impact: 8,
      barriers: 5,
      sustainability: 5,
      source: "McKinsey 2025",
      notes: "Chips optimized for AI workloads.",
    },
    {
      id: "t7",
      name: "Digital Twins & Simulation (Cognitive Twins)",
      category: "Industrial & Ops",
      horizon: "3-5y",
      phase: "Trough",
      x: 42,
      y: 30,
      TRL: 5,
      impact: 8,
      barriers: 6,
      sustainability: 6,
      source: "WEF 2025",
      notes: "Operational optimization via simulation.",
    },
    {
      id: "t8",
      name: "Quantum Computing & Simulation",
      category: "Computing",
      horizon: "5y",
      phase: "Trigger",
      x: 10,
      y: 20,
      TRL: 3,
      impact: 9,
      barriers: 9,
      sustainability: 4,
      source: "McKinsey 2025",
      notes: "Long-term potential for optimization.",
    },
    {
      id: "t9",
      name: "Post-Quantum Cryptography",
      category: "Trust & Security",
      horizon: "3-5y",
      phase: "Slope",
      x: 55,
      y: 48,
      TRL: 5,
      impact: 9,
      barriers: 5,
      sustainability: 5,
      source: "NIST/WEF 2025",
      notes: "Protects long-lived data from quantum attacks.",
    },
    {
      id: "t10",
      name: "Neuromorphic & Low-power AI Chips",
      category: "Computing",
      horizon: "3-5y",
      phase: "Trigger",
      x: 14,
      y: 28,
      TRL: 3,
      impact: 6,
      barriers: 8,
      sustainability: 8,
      source: "McKinsey 2025",
      notes: "Energy-efficient neural hardware.",
    },
    {
      id: "t11",
      name: "Spatial & Mixed Reality Computing",
      category: "Experience Tech",
      horizon: "3-5y",
      phase: "Trough",
      x: 44,
      y: 34,
      TRL: 5,
      impact: 7,
      barriers: 6,
      sustainability: 5,
      source: "Gartner 2024",
      notes: "AR/VR for enterprise productivity.",
    },
    {
      id: "t12",
      name: "AI-Augmented Software Engineering (DevTools)",
      category: "Developer Tools",
      horizon: "1y",
      phase: "Peak",
      x: 24,
      y: 18,
      TRL: 8,
      impact: 8,
      barriers: 3,
      sustainability: 6,
      source: "Gartner 2024",
      notes: "AI assistants for coding and CI/CD.",
    },
    {
      id: "t13",
      name: "GitOps & Declarative Infra",
      category: "Developer Tools",
      horizon: "1y",
      phase: "Plateau",
      x: 80,
      y: 60,
      TRL: 9,
      impact: 7,
      barriers: 2,
      sustainability: 7,
      source: "Gartner 2024",
      notes: "Production-grade infra-as-code practices.",
    },
    {
      id: "t14",
      name: "Liquid-cooling & Energy-efficient Data Centers",
      category: "Infrastructure",
      horizon: "1-3y",
      phase: "Slope",
      x: 66,
      y: 52,
      TRL: 8,
      impact: 7,
      barriers: 4,
      sustainability: 9,
      source: "CB Insights 2025",
      notes: "Reduces data center power usage.",
    },
    {
      id: "t15",
      name: "Green Hydrogen & Green Nitrogen Fixation",
      category: "Climate Tech",
      horizon: "3-5y",
      phase: "Slope",
      x: 52,
      y: 42,
      TRL: 5,
      impact: 8,
      barriers: 7,
      sustainability: 10,
      source: "WEF 2025",
      notes: "Decarbonization of heavy industry.",
    },
    {
      id: "t16",
      name: "Next-gen Nuclear (SMRs)",
      category: "Energy",
      horizon: "3-5y",
      phase: "Slope",
      x: 50,
      y: 45,
      TRL: 6,
      impact: 9,
      barriers: 8,
      sustainability: 9,
      source: "WEF 2025",
      notes: "Small modular reactors for steady clean power.",
    },
    {
      id: "t17",
      name: "Engineered Living Therapeutics",
      category: "Healthcare",
      horizon: "3-5y",
      phase: "Slope",
      x: 48,
      y: 46,
      TRL: 5,
      impact: 9,
      barriers: 8,
      sustainability: 6,
      source: "WEF 2025",
      notes: "Programmable biological therapeutics.",
    },
    {
      id: "t18",
      name: "RNA & mRNA Therapeutics",
      category: "Healthcare",
      horizon: "1-3y",
      phase: "Slope",
      x: 56,
      y: 50,
      TRL: 7,
      impact: 9,
      barriers: 6,
      sustainability: 7,
      source: "CB Insights 2025",
      notes: "Next-gen vaccines and therapies.",
    },
    {
      id: "t19",
      name: "Collaborative Sensing & Digital Infrastructure",
      category: "IoT & Edge",
      horizon: "1-3y",
      phase: "Slope",
      x: 60,
      y: 48,
      TRL: 6,
      impact: 7,
      barriers: 5,
      sustainability: 8,
      source: "WEF 2025",
      notes: "Sensor networks for cities and logistics.",
    },
    {
      id: "t20",
      name: "Satellite Constellation Services (LEO connectivity)",
      category: "Space Tech",
      horizon: "1-3y",
      phase: "Plateau",
      x: 76,
      y: 56,
      TRL: 9,
      impact: 8,
      barriers: 4,
      sustainability: 5,
      source: "CB Insights 2025",
      notes: "Global low-latency connectivity.",
    },
    {
      id: "t21",
      name: "Superapps & Composable Platforms",
      category: "Experience Tech",
      horizon: "1-3y",
      phase: "Slope",
      x: 64,
      y: 54,
      TRL: 7,
      impact: 7,
      barriers: 4,
      sustainability: 6,
      source: "Gartner 2024",
      notes: "Integrated user experiences across services.",
    },
    {
      id: "t22",
      name: "Machine Customers / Economic Agents",
      category: "AI & Automation",
      horizon: "3-5y",
      phase: "Innovation",
      x: 20,
      y: 30,
      TRL: 4,
      impact: 7,
      barriers: 7,
      sustainability: 6,
      source: "Gartner 2025",
      notes: "Autonomous purchasing agents in marketplaces.",
    },
    {
      id: "t23",
      name: "Cybersecurity: Generative Watermarking & Provenance",
      category: "Trust & Security",
      horizon: "1y",
      phase: "Innovation",
      x: 26,
      y: 24,
      TRL: 6,
      impact: 6,
      barriers: 4,
      sustainability: 6,
      source: "WEF 2025",
      notes: "Proving origin and integrity of AI content.",
    },
    {
      id: "t24",
      name: "AI-driven Disease Management & Diagnostics",
      category: "Healthcare",
      horizon: "1-3y",
      phase: "Slope",
      x: 54,
      y: 48,
      TRL: 7,
      impact: 9,
      barriers: 5,
      sustainability: 8,
      source: "CB Insights 2025",
      notes: "Early detection and population health.",
    },
    {
      id: "t25",
      name: "Circular Materials & Structural Battery Composites",
      category: "Energy & Materials",
      horizon: "3-5y",
      phase: "Slope",
      x: 58,
      y: 50,
      TRL: 6,
      impact: 7,
      barriers: 6,
      sustainability: 9,
      source: "WEF 2025",
      notes: "Integrated structural energy storage for EVs.",
    },
    {
      id: "t26",
      name: "6G Research & Advanced Connectivity",
      category: "Connectivity",
      horizon: "5y",
      phase: "Innovation",
      x: 12,
      y: 26,
      TRL: 2,
      impact: 7,
      barriers: 9,
      sustainability: 5,
      source: "Gartner 2024",
      notes: "Next-gen wireless research and standards.",
    },
  ];

  // Load from localStorage if present (auto-save positions & weights)
  const LS_KEY = "etief_dashboard_v1";
  const loadState = () => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw)
        return {
          techs: defaultTechs,
          weights: {
            TRL: 0.25,
            impact: 0.4,
            barriers: -0.15,
            sustainability: 0.2,
          },
        };
      const parsed = JSON.parse(raw);
      return {
        techs: parsed.techs || defaultTechs,
        weights: parsed.weights || {
          TRL: 0.25,
          impact: 0.4,
          barriers: -0.15,
          sustainability: 0.2,
        },
      };
    } catch (e) {
      console.warn("Failed to load saved state", e);
      return {
        techs: defaultTechs,
        weights: {
          TRL: 0.25,
          impact: 0.4,
          barriers: -0.15,
          sustainability: 0.2,
        },
      };
    }
  };

  const initialState = loadState();

  const [techs, setTechs] = useState(initialState.techs);
  const [weights, setWeights] = useState(initialState.weights);
  const [activeView, setActiveView] = useState("hype");
  const [selected, setSelected] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const svgRef = useRef(null);
  const [filterCat, setFilterCat] = useState("all");
  const [sortKey, setSortKey] = useState("TIS");
  const [sortDir, setSortDir] = useState("desc");

  // Auto-save whenever techs or weights change
  useEffect(() => {
    const payload = { techs, weights, lastSaved: new Date().toISOString() };
    localStorage.setItem(LS_KEY, JSON.stringify(payload));
  }, [techs, weights]);

  // ---------- Compute TIS ----------
  // Normalize inputs: TRL /9 -> 0-1 scale; impact/10 -> 0-1; barriers (higher worse) convert to inverse
  const computeTIS = (t, w = weights) => {
    const trlScore = t.TRL || t.TRL === 0 ? t.TRL / 9 : (t.TRL || 0) / 9;
    const impactScore = (t.impact || 0) / 10;
    const barScore = 1 - (t.barriers || 0) / 10; // higher barriers => lower score
    const sustainScore = (t.sustainability || 0) / 10;

    // Weighted sum
    const raw =
      trlScore * w.TRL +
      impactScore * w.impact +
      barScore * Math.abs(w.barriers) +
      sustainScore * w.sustainability;
    // Scale to 0-10 range for easier interpretation
    const scaled = Math.max(0, Math.min(10, raw * 10));
    return Number(scaled.toFixed(2));
  };

  // Attach computed TIS to tech objects (memoized)
  const techsWithTIS = useMemo(
    () => techs.map((t) => ({ ...t, TIS: computeTIS(t) })),
    [techs, weights]
  );

  // ---------- Drag & Drop handlers for Hype Cycle ----------
  const startDrag = (id) => (e) => {
    e.preventDefault();
    setDraggingId(id);
  };
  const onMove = (e) => {
    if (!draggingId || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const xPct = Math.max(
      0,
      Math.min(100, ((clientX - rect.left) / rect.width) * 100)
    );
    const yPct = Math.max(
      0,
      Math.min(100, ((clientY - rect.top) / rect.height) * 100)
    );
    setTechs((prev) =>
      prev.map((t) => (t.id === draggingId ? { ...t, x: xPct, y: yPct } : t))
    );
  };
  const endDrag = () => setDraggingId(null);

  useEffect(() => {
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", endDrag);
    window.addEventListener("touchend", endDrag);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", endDrag);
      window.removeEventListener("touchend", endDrag);
    };
  });

  // ---------- Matrix Quadrant ----------
  const getQuadrant = (t) => {
    const tis = t.TIS ?? computeTIS(t);
    const highTIS = tis >= 7; // threshold
    const highTRL = (t.TRL || 0) >= 7;
    if (highTIS && highTRL) return "Quick Wins";
    if (highTIS && !highTRL) return "Strategic Bets";
    if (!highTIS && highTRL) return "Incremental";
    return "Exploratory";
  };

  // ---------- Exports ----------
  const exportCSV = () => {
    const headers = [
      "id",
      "name",
      "category",
      "horizon",
      "phase",
      "TRL",
      "impact",
      "barriers",
      "sustainability",
      "TIS",
      "x",
      "y",
      "source",
      "notes",
    ];
    const rows = techsWithTIS.map((t) => [
      t.id,
      t.name,
      t.category,
      t.horizon,
      t.phase,
      t.TRL,
      t.impact,
      t.barriers,
      t.sustainability,
      t.TIS,
      t.x,
      t.y,
      t.source || "",
      t.notes || "",
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "etief_tech_assessment.csv";
    a.click();
  };

  const exportJSON = () => {
    const payload = {
      techs: techsWithTIS,
      weights,
      exportedAt: new Date().toISOString(),
      version: "2025.1",
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "etief_snapshot.json";
    a.click();
  };

  // ---------- Sorting & Filtering ----------
  const categories = [
    "all",
    ...Array.from(new Set(techs.map((t) => t.category))),
  ];
  const filtered = techsWithTIS.filter((t) =>
    filterCat === "all" ? true : t.category === filterCat
  );

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const key = sortKey;
    arr.sort((a, b) => {
      const av = key === "name" ? a.name.toLowerCase() : a[key] ?? 0;
      const bv = key === "name" ? b.name.toLowerCase() : b[key] ?? 0;
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  // ---------- UI helpers ----------
  const toggleSort = (k) => {
    if (k === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("desc");
    }
  };

  // ---------- Risk Report Content (static) ----------
  const riskSummary = {
    title: "Agentic AI Executive Summary",
    summary:
      "Agentic AI is maturing rapidly. Organizations should treat it as strategic but manage critical risks: safety, governance, liability, and integration complexity. Early pilots can deliver ROI, while robust control frameworks must be in place.",
    risks: [
      { name: "Safety & Alignment", level: "Critical" },
      { name: "Regulatory & Compliance", level: "Critical" },
      { name: "Data Privacy", level: "High" },
      { name: "Integration Complexity", level: "High" },
      { name: "Vendor Lock-in", level: "Medium" },
    ],
    maturity: [
      { dim: "Technical Capability", score: 65 },
      { dim: "Scalability", score: 45 },
      { dim: "Security & Governance", score: 35 },
      { dim: "Ecosystem Maturity", score: 50 },
      { dim: "Talent Availability", score: 40 },
      { dim: "Cost Efficiency", score: 55 },
    ],
    recommendations: {
      short: [
        "Run pilot projects in defined domains",
        "Set up safety & governance board",
        "Invest in monitoring and red-teaming",
      ],
      mid: [
        "Scale successful pilots",
        "Integrate with core systems",
        "Form strategic partnerships",
      ],
      long: [
        "Architect enterprise agent platform",
        "Invest in multi-agent orchestration",
        "Shape industry standards & policy",
      ],
    },
  };

  // ---------- Render ----------
  return (
    <div
      style={{
        fontFamily: "Inter, Arial, sans-serif",
        background: qmic.lightBg,
        minHeight: "100vh",
        color: qmic.text,
      }}
    >
      <header
        style={{
          background: `linear-gradient(135deg, ${qmic.primary}, #5a0f26)`,
          color: "white",
          padding: "28px 20px",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 28 }}>
              Technology Assessment Dashboard
            </h1>
            <div style={{ opacity: 0.9, marginTop: 6 }}>
              Emerging Technologies Hype Cycle • Strategic Matrix • Business
              Impact
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={exportCSV}
              style={{
                background: qmic.secondary,
                color: "white",
                border: "none",
                padding: "10px 14px",
                borderRadius: 6,
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <Download size={16} /> CSV
            </button>
            <button
              onClick={exportJSON}
              style={{
                background: qmic.accent,
                color: "white",
                border: "none",
                padding: "10px 14px",
                borderRadius: 6,
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <Save size={16} /> Snapshot
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "20px auto", padding: "0 16px" }}>
        {/* Controls */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 16,
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 8,
              background: "white",
              padding: 10,
              borderRadius: 8,
              border: `1px solid ${qmic.border}`,
            }}
          >
            {[
              { id: "hype", label: "Hype Cycle", icon: RefreshCw },
              { id: "matrix", label: "Matrix", icon: Grid },
              { id: "table", label: "Table", icon: FileText },
              { id: "report", label: "Report", icon: PieChart },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setActiveView(v.id)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 6,
                  border:
                    activeView === v.id
                      ? `2px solid ${qmic.primary}`
                      : "2px solid transparent",
                  background: activeView === v.id ? "#fff" : "transparent",
                  cursor: "pointer",
                }}
              >
                <v.icon
                  size={14}
                  style={{ verticalAlign: "middle", marginRight: 6 }}
                />{" "}
                {v.label}
              </button>
            ))}
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              style={{
                padding: 8,
                borderRadius: 8,
                border: `1px solid ${qmic.border}`,
              }}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                background: "white",
                padding: 8,
                borderRadius: 8,
                border: `1px solid ${qmic.border}`,
              }}
            >
              <div style={{ fontWeight: 700, marginRight: 8 }}>Weights</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <label style={{ fontSize: 12 }}>TRL</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={weights.TRL}
                  onChange={(e) =>
                    setWeights((w) => ({
                      ...w,
                      TRL: parseFloat(e.target.value),
                    }))
                  }
                />
                <span style={{ width: 36, textAlign: "right" }}>
                  {weights.TRL}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <label style={{ fontSize: 12 }}>Impact</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={weights.impact}
                  onChange={(e) =>
                    setWeights((w) => ({
                      ...w,
                      impact: parseFloat(e.target.value),
                    }))
                  }
                />
                <span style={{ width: 36, textAlign: "right" }}>
                  {weights.impact}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <label style={{ fontSize: 12 }}>Barriers</label>
                <input
                  type="range"
                  min="-0.3"
                  max="0"
                  step="0.01"
                  value={weights.barriers}
                  onChange={(e) =>
                    setWeights((w) => ({
                      ...w,
                      barriers: parseFloat(e.target.value),
                    }))
                  }
                />
                <span style={{ width: 36, textAlign: "right" }}>
                  {weights.barriers}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <label style={{ fontSize: 12 }}>Sustain</label>
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.05"
                  value={weights.sustainability}
                  onChange={(e) =>
                    setWeights((w) => ({
                      ...w,
                      sustainability: parseFloat(e.target.value),
                    }))
                  }
                />
                <span style={{ width: 36, textAlign: "right" }}>
                  {weights.sustainability}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Views */}
        {activeView === "hype" && (
          <section
            style={{
              background: "white",
              padding: 16,
              borderRadius: 10,
              boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
              border: `1px solid ${qmic.border}`,
            }}
          >
            <h2 style={{ marginTop: 0, color: qmic.primary }}>
              Interactive Hype Cycle
            </h2>
            <p style={{ marginTop: 6, color: "#6b7280" }}>
              Drag markers to reposition; changes are autosaved. Click a marker
              to view details.
            </p>
            <div style={{ marginTop: 12 }}>
              <svg
                ref={svgRef}
                viewBox="0 0 1000 420"
                style={{
                  width: "100%",
                  height: 420,
                  background: "#fbfbfd",
                  borderRadius: 8,
                }}
              >
                {/* simplified hype curve */}
                <path
                  d="M40,300 C180,50 300,50 420,140 C540,240 660,200 780,220 C880,230 940,240 980,250"
                  fill="none"
                  stroke={qmic.secondary}
                  strokeWidth={3}
                />

                {/* Phase labels across bottom */}
                {[
                  "Innovation Trigger",
                  "Peak of Inflated Expectations",
                  "Trough of Disillusionment",
                  "Slope of Enlightenment",
                  "Plateau of Productivity",
                ].map((label, i) => (
                  <g key={label} transform={`translate(${50 + i * 180}, 380)`}>
                    <rect
                      x={-80}
                      y={6}
                      width={160}
                      height={26}
                      fill={"#fff"}
                      stroke={qmic.border}
                      rx={6}
                    />
                    <text
                      x={0}
                      y={24}
                      textAnchor="middle"
                      style={{ fontSize: 12, fill: qmic.text, fontWeight: 700 }}
                    >
                      {label}
                    </text>
                  </g>
                ))}

                {/* Tech markers */}
                {techsWithTIS
                  .filter((t) =>
                    filterCat === "all" ? true : t.category === filterCat
                  )
                  .map((t) => (
                    <g
                      key={t.id}
                      transform={`translate(${(t.x / 100) * 960 + 20}, ${
                        (t.y / 100) * 320 + 30
                      })`}
                      onMouseDown={startDrag(t.id)}
                      onTouchStart={startDrag(t.id)}
                      onClick={() => setSelected(t)}
                      style={{ cursor: "pointer" }}
                    >
                      <circle
                        r={10}
                        fill={
                          t.TIS >= 8
                            ? qmic.secondary
                            : t.TIS >= 6
                            ? qmic.accent
                            : qmic.primary
                        }
                        stroke="#fff"
                        strokeWidth={2}
                      ></circle>
                      <text
                        x={0}
                        y={-14}
                        textAnchor="middle"
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          fill: qmic.text,
                        }}
                      >
                        {t.name}
                      </text>
                    </g>
                  ))}
              </svg>
            </div>

            {selected && (
              <div
                style={{
                  marginTop: 12,
                  padding: 12,
                  borderRadius: 8,
                  background: "#fff",
                  border: `1px solid ${qmic.border}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <h3 style={{ margin: 0 }}>{selected.name}</h3>
                    <div style={{ color: "#6b7280", fontSize: 13 }}>
                      {selected.category} • {selected.phase} • Horizon:{" "}
                      {selected.horizon}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800, color: qmic.primary }}>
                      {selected.TIS ?? computeTIS(selected)}
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>TIS</div>
                  </div>
                </div>
                <div
                  style={{
                    marginTop: 8,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                  }}
                >
                  <div>
                    <strong>TRL:</strong> {selected.TRL}/9
                  </div>
                  <div>
                    <strong>Impact:</strong> {selected.impact}/10
                  </div>
                  <div>
                    <strong>Barriers:</strong> {selected.barriers}/10
                  </div>
                  <div>
                    <strong>Sustainability:</strong> {selected.sustainability}
                    /10
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <strong>Notes:</strong> {selected.notes}
                  </div>
                </div>
                <div style={{ marginTop: 10, textAlign: "right" }}>
                  <button
                    onClick={() => setSelected(null)}
                    style={{
                      padding: 8,
                      borderRadius: 6,
                      border: "none",
                      background: "#efefef",
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {activeView === "matrix" && (
          <section
            style={{
              background: "white",
              padding: 16,
              borderRadius: 10,
              boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
              border: `1px solid ${qmic.border}`,
            }}
          >
            <h2 style={{ marginTop: 0, color: qmic.primary }}>
              Four-Quadrant Strategic Matrix
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginTop: 12,
              }}
            >
              {[
                "Quick Wins",
                "Strategic Bets",
                "Incremental",
                "Exploratory",
              ].map((q, i) => {
                const items = techsWithTIS.filter(
                  (t) =>
                    getQuadrant(t) === q &&
                    (filterCat === "all" ? true : t.category === filterCat)
                );
                const bg =
                  i === 0
                    ? "#f0faf4"
                    : i === 1
                    ? "#f0f7ff"
                    : i === 2
                    ? "#fff9f0"
                    : "#faf0f3";
                return (
                  <div
                    key={q}
                    style={{
                      background: bg,
                      padding: 12,
                      borderRadius: 8,
                      border: `1px solid ${qmic.border}`,
                      minHeight: 160,
                    }}
                  >
                    <h3 style={{ margin: 0, color: qmic.primary }}>{q}</h3>
                    <div
                      style={{ color: "#6b7280", marginTop: 6, fontSize: 13 }}
                    >
                      {q === "Quick Wins"
                        ? "High TIS, High TRL"
                        : q === "Strategic Bets"
                        ? "High TIS, Low TRL"
                        : q === "Incremental"
                        ? "Lower TIS, High TRL"
                        : "Lower TIS, Low TRL"}
                    </div>
                    <div
                      style={{
                        marginTop: 10,
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      {items.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => setSelected(t)}
                          style={{
                            padding: 10,
                            borderRadius: 6,
                            background: "white",
                            border: `1px solid ${qmic.border}`,
                            cursor: "pointer",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <div style={{ fontWeight: 700 }}>{t.name}</div>
                            <div style={{ color: "#6b7280" }}>{t.TIS}</div>
                          </div>
                          <div style={{ color: "#6b7280", fontSize: 12 }}>
                            {t.category} • TRL {t.TRL}
                          </div>
                        </div>
                      ))}
                      {items.length === 0 && (
                        <div style={{ color: "#9ca3af" }}>— none</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {activeView === "table" && (
          <section
            style={{
              background: "white",
              padding: 16,
              borderRadius: 10,
              boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
              border: `1px solid ${qmic.border}`,
            }}
          >
            <h2 style={{ marginTop: 0, color: qmic.primary }}>
              Business Impact Assessment
            </h2>
            <p style={{ color: "#6b7280" }}>
              Click column headers to sort. Click a row for details.
            </p>
            <div style={{ overflowX: "auto", marginTop: 12 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th
                      onClick={() => toggleSort("name")}
                      style={{
                        textAlign: "left",
                        padding: 10,
                        borderBottom: `2px solid ${qmic.border}`,
                        cursor: "pointer",
                      }}
                    >
                      Technology
                    </th>
                    <th
                      onClick={() => toggleSort("category")}
                      style={{
                        padding: 10,
                        borderBottom: `2px solid ${qmic.border}`,
                        cursor: "pointer",
                      }}
                    >
                      Category
                    </th>
                    <th
                      onClick={() => toggleSort("TRL")}
                      style={{
                        padding: 10,
                        borderBottom: `2px solid ${qmic.border}`,
                        cursor: "pointer",
                      }}
                    >
                      TRL
                    </th>
                    <th
                      onClick={() => toggleSort("impact")}
                      style={{
                        padding: 10,
                        borderBottom: `2px solid ${qmic.border}`,
                        cursor: "pointer",
                      }}
                    >
                      Impact
                    </th>
                    <th
                      onClick={() => toggleSort("barriers")}
                      style={{
                        padding: 10,
                        borderBottom: `2px solid ${qmic.border}`,
                        cursor: "pointer",
                      }}
                    >
                      Barriers
                    </th>
                    <th
                      onClick={() => toggleSort("sustainability")}
                      style={{
                        padding: 10,
                        borderBottom: `2px solid ${qmic.border}`,
                        cursor: "pointer",
                      }}
                    >
                      Sustainability
                    </th>
                    <th
                      onClick={() => toggleSort("TIS")}
                      style={{
                        padding: 10,
                        borderBottom: `2px solid ${qmic.border}`,
                        cursor: "pointer",
                      }}
                    >
                      TIS
                    </th>
                    <th
                      style={{
                        padding: 10,
                        borderBottom: `2px solid ${qmic.border}`,
                      }}
                    >
                      Quadrant
                    </th>
                    <th
                      style={{
                        padding: 10,
                        borderBottom: `2px solid ${qmic.border}`,
                      }}
                    >
                      Source
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => setSelected(t)}
                      style={{
                        cursor: "pointer",
                        borderBottom: `1px solid ${qmic.border}`,
                      }}
                    >
                      <td style={{ padding: 10, fontWeight: 700 }}>{t.name}</td>
                      <td style={{ padding: 10 }}>{t.category}</td>
                      <td style={{ padding: 10, textAlign: "center" }}>
                        {t.TRL}
                      </td>
                      <td style={{ padding: 10, textAlign: "center" }}>
                        {t.impact}
                      </td>
                      <td style={{ padding: 10, textAlign: "center" }}>
                        {t.barriers}
                      </td>
                      <td style={{ padding: 10, textAlign: "center" }}>
                        {t.sustainability}
                      </td>
                      <td
                        style={{
                          padding: 10,
                          textAlign: "center",
                          fontWeight: 800,
                        }}
                      >
                        {t.TIS}
                      </td>
                      <td style={{ padding: 10 }}>{getQuadrant(t)}</td>
                      <td style={{ padding: 10, color: "#6b7280" }}>
                        {t.source}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeView === "report" && (
          <section
            style={{
              background: "white",
              padding: 16,
              borderRadius: 10,
              boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
              border: `1px solid ${qmic.border}`,
            }}
          >
            <h2 style={{ marginTop: 0, color: qmic.primary }}>
              Risk & Maturity Report
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div
                style={{
                  padding: 12,
                  borderRadius: 8,
                  border: `1px solid ${qmic.border}`,
                  background: "#fff",
                }}
              >
                <h3 style={{ marginTop: 0 }}>{riskSummary.title}</h3>
                <p style={{ color: "#6b7280" }}>{riskSummary.summary}</p>
                <h4 style={{ marginBottom: 6 }}>Critical Risks</h4>
                <ul>
                  {riskSummary.risks.map((r) => (
                    <li key={r.name}>
                      <strong>{r.level}:</strong> {r.name}
                    </li>
                  ))}
                </ul>
              </div>
              <div
                style={{
                  padding: 12,
                  borderRadius: 8,
                  border: `1px solid ${qmic.border}`,
                  background: "#fff",
                }}
              >
                <h4 style={{ marginTop: 0 }}>Maturity Assessment</h4>
                {riskSummary.maturity.map((m) => (
                  <div key={m.dim} style={{ marginBottom: 10 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>{m.dim}</div>
                      <div style={{ fontWeight: 700 }}>{m.score}%</div>
                    </div>
                    <div
                      style={{
                        height: 8,
                        background: "#eee",
                        borderRadius: 6,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${m.score}%`,
                          height: 8,
                          background:
                            m.score >= 60
                              ? qmic.secondary
                              : m.score >= 40
                              ? qmic.accent
                              : "#dc2626",
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 8,
                border: `1px solid ${qmic.border}`,
                background: "#fff",
              }}
            >
              <h4>Strategic Recommendations</h4>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <h5>Short-term (0-12 months)</h5>
                  <ul>
                    {riskSummary.recommendations.short.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
                <div style={{ flex: 1 }}>
                  <h5>Mid-term (1-2 years)</h5>
                  <ul>
                    {riskSummary.recommendations.mid.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
                <div style={{ flex: 1 }}>
                  <h5>Long-term (2-5 years)</h5>
                  <ul>
                    {riskSummary.recommendations.long.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer
        style={{
          marginTop: 30,
          padding: "24px 16px",
          textAlign: "center",
          color: "#6b7280",
        }}
      >
        <div>
          Data sources: Gartner 2024, WEF 2025, McKinsey 2025, CB Insights 2025
        </div>
        <div style={{ marginTop: 6 }}>
          Dashboard auto-saves to browser storage. Use the Snapshot button to
          export full state.
        </div>
      </footer>
    </div>
  );
}
