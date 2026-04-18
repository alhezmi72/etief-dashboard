import { useState, useEffect } from "react";

// ── Minimal CSV parser (quoted fields + numeric coercion) ─────────────────
const parseCSV = (text) => {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const values = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuotes = !inQuotes; }
      else if (ch === "," && !inQuotes) { values.push(current.trim()); current = ""; }
      else { current += ch; }
    }
    values.push(current.trim());
    return headers.reduce((obj, header, idx) => {
      const raw = (values[idx] ?? "").replace(/^"|"$/g, "");
      obj[header] = raw !== "" && !isNaN(raw) ? parseFloat(raw) : raw;
      return obj;
    }, {});
  });
};

/**
 * HypeCyclePreview
 *
 * A self-contained, read-only hype-cycle SVG built from a single CSV file.
 * Markers are non-draggable and sized for an inline header display.
 *
 * Props
 * ─────
 * @param {string}  directoryPath  – Base path to the data directory,
 *                                   e.g. "./data/Exploration"
 * @param {string}  fileName       – CSV file name, e.g. "Integrated.csv"
 * @param {string}  category       – Category value to filter rows by,
 *                                   e.g. "AI Automation".
 *                                   Pass null / "" to show all rows.
 * @param {string}  [className]    – Optional extra Tailwind classes on the
 *                                   root wrapper.
 */
const HypeCyclePreview = ({
  directoryPath,
  fileName,
  category = null,
  className = "",
}) => {
  const [technologies, setTechnologies] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [hovered, setHovered]           = useState(null);

  // ── Load & parse CSV ────────────────────────────────────────────────────
  useEffect(() => {
    if (!directoryPath || !fileName) return;
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${directoryPath}/${fileName}`);
        if (!res.ok) throw new Error(`Cannot load "${fileName}": ${res.statusText}`);
        const text = await res.text();
        const rows = parseCSV(text);
        if (!cancelled) {
          const filtered = category
            ? rows.filter((r) => r.category === category || r.Category === category)
            : rows;
          setTechnologies(filtered);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [directoryPath, fileName, category]);

  // ── SVG constants ────────────────────────────────────────────────────────
  const W = 900;
  const H = 400;
  const CURVE = "M 50,370 Q 150,80 250,30 Q 350,5 450,130 Q 500,230 550,215 Q 700,185 870,165";

  const PHASES = [
    { name: "Innovation Trigger",            x: 0,  width: 20 },
    { name: "Peak of Expectations",          x: 20, width: 15 },
    { name: "Trough of Disillusionment",     x: 35, width: 15 },
    { name: "Slope of Enlightenment",        x: 50, width: 25 },
    { name: "Plateau of Productivity",       x: 75, width: 25 },
  ];

  // Marker colours cycle through indigo shades so all dots are legible on
  // the dark header gradient without needing a separate colour-per-category.
  const MARKER_COLORS = [
    "#a5b4fc", "#c4b5fd", "#93c5fd", "#6ee7b7",
    "#fde68a", "#fca5a5", "#fbcfe8", "#bae6fd",
  ];

  // ── Loading / error states (small, inline-friendly) ───────────────────
  if (loading) return (
    <div className={`flex items-center justify-center rounded-lg ${className}`}
         style={{ minHeight: 180, background: "rgba(255,255,255,0.08)" }}>
      <p className="text-indigo-200 text-sm animate-pulse">Loading hype cycle…</p>
    </div>
  );

  if (error) return (
    <div className={`flex items-center justify-center rounded-lg ${className}`}
         style={{ minHeight: 180, background: "rgba(255,255,255,0.08)" }}>
      <p className="text-red-300 text-xs text-center px-4">{error}</p>
    </div>
  );

  if (technologies.length === 0) return (
    <div className={`flex items-center justify-center rounded-lg ${className}`}
         style={{ minHeight: 180, background: "rgba(255,255,255,0.08)" }}>
      <p className="text-indigo-300 text-sm">No data for category "{category}"</p>
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      {/* ── Category label ── */}
      {category && (
        <div className="absolute top-2 left-3 z-10">
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300 bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-sm">
            {category}
          </span>
        </div>
      )}

      {/* ── SVG ── */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        style={{ maxHeight: 320 }}
        aria-label={`Hype cycle chart${category ? ` for ${category}` : ""}`}
      >
        <defs>
          {/* subtle grid */}
          <pattern id="hcpGrid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          </pattern>
          {/* gradient curve */}
          <linearGradient id="hcpCurve" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%"   stopColor="#818cf8" />
            <stop offset="50%"  stopColor="#34d399" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
          {/* glow filter for selected marker */}
          <filter id="hcpGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* grid background */}
        <rect width={W} height={H} fill="url(#hcpGrid)" />

        {/* axes */}
        <path d={`M 40 ${H - 20} H ${W - 20}`} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <path d={`M 40 10 V ${H - 20}`}         stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

        {/* hype curve */}
        <path
          d={CURVE}
          fill="none"
          stroke="url(#hcpCurve)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* phase labels at bottom */}
        {PHASES.map((phase, i) => (
          <text
            key={i}
            x={phase.x * (W / 100) + (phase.width * (W / 100)) / 2}
            y={H - 4}
            textAnchor="middle"
            style={{
              fontSize: "9px",
              fontFamily: "Manrope, Inter, sans-serif",
              fontWeight: 700,
              fill: "rgba(199,210,254,0.6)",
              letterSpacing: "0.03em",
            }}
          >
            {phase.name}
          </text>
        ))}

        {/* tech markers */}
        {technologies.map((tech, i) => {
          // x,y are stored as 0-100 percentages in the CSV (same convention
          // as TechExploration).  Guard against missing values gracefully.
          const cx = typeof tech.x === "number" ? tech.x * (W / 100) : W / 2;
          const cy = typeof tech.y === "number" ? tech.y * ((H - 30) / 100) : (H - 30) / 2;
          const color   = MARKER_COLORS[i % MARKER_COLORS.length];
          const isHov   = hovered === i;
          const techName = tech.name || tech.Name || `Tech ${i + 1}`;

          return (
            <g
              key={tech.id ?? i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "default" }}
            >
              {/* outer glow ring on hover */}
              {isHov && (
                <circle cx={cx} cy={cy} r={14} fill={color} opacity={0.2} />
              )}

              {/* marker dot */}
              <circle
                cx={cx} cy={cy}
                r={isHov ? 9 : 7}
                fill={color}
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="2"
                filter={isHov ? "url(#hcpGlow)" : undefined}
                style={{ transition: "r 0.15s ease" }}
              />

              {/* label – show always if ≤6 techs, else only on hover */}
              {(technologies.length <= 6 || isHov) && (
                <text
                  x={cx} y={cy - 13}
                  textAnchor="middle"
                  style={{
                    fontSize: isHov ? "10px" : "9px",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 700,
                    fill: "#e0e7ff",
                    pointerEvents: "none",
                    textShadow: "0 1px 3px rgba(0,0,0,0.6)",
                  }}
                >
                  {techName}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* ── Tooltip on hover (shown outside SVG so it can overflow) ── */}
      {hovered !== null && technologies[hovered] && (() => {
        const tech = technologies[hovered];
        const name = tech.name || tech.Name || "—";
        return (
          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
            style={{ minWidth: 160 }}
          >
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 shadow-xl text-center">
              <p className="text-white font-bold text-sm leading-tight">{name}</p>
              {tech.trl   != null && <p className="text-indigo-200 text-[10px] mt-1">TRL: {tech.trl}/9</p>}
              {tech.impact != null && <p className="text-indigo-200 text-[10px]">Impact: {tech.impact}/10</p>}
            </div>
          </div>
        );
      })()}

      {/* ── Legend (dots count) ── */}
      <p className="text-center text-[10px] text-indigo-300/70 mt-1" style={{ fontFamily: "Manrope, sans-serif" }}>
        {technologies.length} technolog{technologies.length === 1 ? "y" : "ies"} · hover for details
      </p>
    </div>
  );
};

export default HypeCyclePreview;
