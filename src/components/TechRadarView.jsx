import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
//import { getCategoryColor } from "./HypeCyclePreview.jsx";

// ─── Layout constants ─────────────────────────────────────────────────────────
const CX = 500;          // SVG centre-x
const CY = 500;          // SVG centre-y
const R_INNER = 60;      // tiny dead-zone around centre
const R_DEPLOY  = 160;   // ring 0 boundary
const R_ADOPT   = 270;   // ring 1 boundary
const R_TRIAL   = 370;   // ring 2 boundary
const R_EXPLORE = 460;   // ring 3 boundary (outermost data ring)
const R_LABEL   = 510;   // tech label starts here (dotted spoke extension)
const R_CAT_LABEL = 540; // category name arc radius
const SVG_SIZE  = 1100;

const RINGS = [
  { label: "Deploy",  rInner: R_INNER,  rOuter: R_DEPLOY,  stroke: "#059669", fill: "rgba(5,150,105,0.06)",  textColor: "#065f46", dash: "none" },
  { label: "Adopt",   rInner: R_DEPLOY, rOuter: R_ADOPT,   stroke: "#2563eb", fill: "rgba(37,99,235,0.05)",  textColor: "#1e40af", dash: "6 4" },
  { label: "Trial",   rInner: R_ADOPT,  rOuter: R_TRIAL,   stroke: "#d97706", fill: "rgba(217,119,6,0.05)",  textColor: "#92400e", dash: "4 4" },
  { label: "Explore", rInner: R_TRIAL,  rOuter: R_EXPLORE, stroke: "#7c3aed", fill: "rgba(124,58,237,0.05)", textColor: "#5b21b6", dash: "2 4" },
];

// ─── Category palette – 8 vivid, fully distinct hues ──────────────────────────
const CAT_PALETTE = [
  { stroke: "#0ea5e9", fill: "rgba(14,165,233,0.07)",  dark: "#075985" },
  { stroke: "#10b981", fill: "rgba(16,185,129,0.07)",  dark: "#065f46" },
  { stroke: "#f59e0b", fill: "rgba(245,158,11,0.07)",  dark: "#78350f" },
  { stroke: "#ef4444", fill: "rgba(239,68,68,0.07)",   dark: "#7f1d1d" },
  { stroke: "#8b5cf6", fill: "rgba(139,92,246,0.07)",  dark: "#4c1d95" },
  { stroke: "#ec4899", fill: "rgba(236,72,153,0.07)",  dark: "#831843" },
  { stroke: "#14b8a6", fill: "rgba(20,184,166,0.07)",  dark: "#134e4a" },
  { stroke: "#f97316", fill: "rgba(249,115,22,0.07)",  dark: "#7c2d12" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const deg2rad = (d) => (d * Math.PI) / 180;

const getRingIndex = (tech, calculateTIS) => {
  const tis = parseFloat(calculateTIS(tech));
  const trl = tech.trl;
  if (tis >= 8 && trl >= 7) return 0;
  if (tis >= 6 || trl >= 5) return 1;
  if (tis >= 4 || trl >= 3) return 2;
  return 3;
};

// Radius from centre for a tech based on its ring (middle of that band, with small jitter)
const getRingRadius = (ringIdx, techIdxInRing, totalInRing) => {
  const band = [
    [R_INNER + 8,  R_DEPLOY - 8],
    [R_DEPLOY + 8, R_ADOPT  - 8],
    [R_ADOPT  + 8, R_TRIAL  - 8],
    [R_TRIAL  + 8, R_EXPLORE - 8],
  ][ringIdx];
  if (totalInRing === 1) return (band[0] + band[1]) / 2;
  const step = (band[1] - band[0]) / Math.max(totalInRing - 1, 1);
  return band[0] + step * techIdxInRing;
};

// Polar → Cartesian
const polar = (cx, cy, r, angle) => ({
  x: cx + Math.cos(angle) * r,
  y: cy + Math.sin(angle) * r,
});

// Arc path for a filled sector band
const sectorArcPath = (cx, cy, r1, r2, a1, a2) => {
  const p1 = polar(cx, cy, r2, a1);
  const p2 = polar(cx, cy, r2, a2);
  const p3 = polar(cx, cy, r1, a2);
  const p4 = polar(cx, cy, r1, a1);
  const large = a2 - a1 > Math.PI ? 1 : 0;
  return [
    `M ${p1.x} ${p1.y}`,
    `A ${r2} ${r2} 0 ${large} 1 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${r1} ${r1} 0 ${large} 0 ${p4.x} ${p4.y}`,
    "Z",
  ].join(" ");
};

// Curved text along an arc (uses textPath)
const arcId = (i) => `cat-arc-${i}`;

// ─── Tooltip ──────────────────────────────────────────────────────────────────
const Tooltip = ({ tech, mx, my, calculateTIS }) => {
  if (!tech) return null;
  const tis = parseFloat(calculateTIS(tech));
  const priority = tis >= 7 && (tech.trl ?? 0) >= 7 ? "Immediate" : tis >= 5 ? "Near-term" : "Long-term";

  const TW = 230;
  let left = mx + 16;
  let top  = my - 12;
  if (left + TW > window.innerWidth  - 12) left = mx - TW - 12;
  if (top  + 130 > window.innerHeight - 12) top  = my - 130;

  return (
    <div style={{
      position: "fixed", left, top, width: TW, zIndex: 400,
      background: "#ffffff",
      border: "1px solid #e2e8f0",
      borderRadius: 10,
      padding: "11px 14px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
      pointerEvents: "none",
    }}>
      <div style={{ fontWeight: 600, fontSize: 13, color: "#0f172a", marginBottom: 6, lineHeight: 1.35 }}>
        {tech.name}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: 12, color: "#475569" }}>
        <Row label="Category"    value={tech.category} />
        <Row label="Impact"      value={`${tech.impact ?? "–"}/10`} />
        <Row label="Priority"    value={priority} />
        <Row label="TIS"         value={tis.toFixed(1)} />
        <Row label="Time to mkt" value={tech.trl >= 7 ? "Short" : tech.trl >= 4 ? "Medium" : "Long"} />
      </div>
    </div>
  );
};

const Row = ({ label, value }) => (
  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
    <span style={{ color: "#94a3b8" }}>{label}</span>
    <span style={{ fontWeight: 500, color: "#1e293b" }}>{value}</span>
  </div>
);

// ─── Detail modal ─────────────────────────────────────────────────────────────
const DetailModal = ({ tech, calculateTIS, onClose, catColor }) => {
  if (!tech) return null;
  const tis = parseFloat(calculateTIS(tech)).toFixed(2);
  const fields = [
    ["TRL",           `${tech.trl} / 9`],
    ["Impact",        `${tech.impact} / 10`],
    ["Strategic Fit", `${tech.strategicFit} / 10`],
    ["Barriers",      `${tech.barriers} / 10`],
    ["Sustainability",`${tech.sustainability} / 10`],
    ["TIS Score",     tis],
    ["Source",        tech.source   || "—"],
    ["Category",      tech.category || "—"],
  ];

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 500,
      background: "rgba(15,23,42,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#ffffff",
        borderRadius: 16,
        border: `1px solid ${catColor}55`,
        padding: "0 0 24px",
        maxWidth: 540, width: "100%",
        maxHeight: "88vh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
        position: "relative",
      }}>
        {/* Coloured header band */}
        <div style={{
          background: catColor, borderRadius: "16px 16px 0 0",
          padding: "18px 24px 16px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.75)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
                {tech.category}
              </div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#ffffff", lineHeight: 1.25 }}>
                {tech.name}
              </h2>
            </div>
            <button onClick={onClose} style={{
              background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8,
              color: "#fff", cursor: "pointer", padding: "5px 12px", fontSize: 13, fontWeight: 500,
            }}>✕ Close</button>
          </div>
        </div>

        <div style={{ padding: "20px 24px 0" }}>
          {/* Metric grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
            {fields.map(([label, value]) => (
              <div key={label} style={{
                background: "#f8fafc", borderRadius: 8,
                border: "1px solid #e2e8f0", padding: "9px 13px",
              }}>
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Description */}
          {tech.description && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Description</div>
              <p style={{ margin: 0, fontSize: 13, color: "#334155", lineHeight: 1.65 }}>{tech.description}</p>
            </div>
          )}

          {/* Notes */}
          {tech.notes && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Notes</div>
              <p style={{ margin: 0, fontSize: 13, color: "#334155", lineHeight: 1.65 }}>{tech.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const TechRadarView = ({ filteredTech, calculateTIS, categoryList }) => {
  const [hovered, setHovered]     = useState(null);
  const [clicked, setClicked]     = useState(null);
  const [mouse, setMouse]         = useState({ x: 0, y: 0 });
  const [activeRing, setActiveRing] = useState(null);
  const containerRef = useRef(null);

  // ── Derive category list from actual data (max 8) ─────────────────────────
  const categories = useMemo(() => {
    const seen = [];
    filteredTech.forEach(t => { if (t.category && !seen.includes(t.category)) seen.push(t.category); });
    return seen.slice(0, 8);
  }, [filteredTech]);

  const N = categories.length || 1;
  const SECTOR_ANGLE = (2 * Math.PI) / N;  // radians per sector
  const GAP_FRACTION = 0.08;               // gap between sectors (fraction of sector angle)

  // ── Position every tech ───────────────────────────────────────────────────
  const techData = useMemo(() => {
    // Group techs by [categoryIdx][ringIdx]
    const grid = categories.map(() => RINGS.map(() => []));
    filteredTech.forEach(tech => {
      const ci = categories.indexOf(tech.category);
      if (ci < 0) return;
      const ri = getRingIndex(tech, calculateTIS);
      grid[ci][ri].push(tech);
    });

    const result = {};
    categories.forEach((cat, ci) => {
      // Central angle for this category's spoke
      const spokeAngle = ci * SECTOR_ANGLE - Math.PI / 2;
      // Half-width of the angular "lane" available to techs in this sector
      const halfLane = (SECTOR_ANGLE / 2) * (1 - GAP_FRACTION);

      RINGS.forEach((_, ri) => {
        const techs = grid[ci][ri];
        const total = techs.length;
        techs.forEach((tech, ti) => {
          // Each tech gets its own sub-angle, evenly spread inside the half-lane
          let angle;
          if (total === 1) {
            angle = spokeAngle; // single tech → exactly on the spoke
          } else {
            // Distribute [−halfLane … +halfLane] uniformly
            const step = (2 * halfLane) / (total - 1);
            angle = spokeAngle - halfLane + step * ti;
          }

          const r = getRingRadius(ri, ti, total);
          result[tech.id] = {
            x: CX + Math.cos(angle) * r,
            y: CY + Math.sin(angle) * r,
            angle,
            radius: r,
            spokeAngle,
            catIdx: ci,
            ringIdx: ri,
          };
        });
      });
    });
    return result;
  }, [filteredTech, categories, calculateTIS]);

  const handleMouseMove = useCallback(e => {
    setMouse({ x: e.clientX, y: e.clientY });
  }, []);

  const anyHovered = hovered !== null;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} style={{ position: "relative", userSelect: "none" }} onMouseMove={handleMouseMove}>

      {/* ── Ring filter pills ── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14, alignItems: "center" }}>
        {RINGS.map((ring, i) => (
          <button key={ring.label} onClick={() => setActiveRing(activeRing === i ? null : i)} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "4px 12px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: 500,
            border: `1.5px solid ${ring.stroke}`,
            background: activeRing === i ? ring.stroke : "transparent",
            color: activeRing === i ? "#fff" : ring.textColor,
            transition: "all 0.13s",
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: activeRing === i ? "#fff" : ring.stroke }} />
            {ring.label}
          </button>
        ))}
        {activeRing !== null && (
          <button onClick={() => setActiveRing(null)} style={{
            padding: "4px 12px", borderRadius: 20, cursor: "pointer", fontSize: 12,
            border: "1px solid #cbd5e1", background: "transparent", color: "#64748b",
          }}>Clear</button>
        )}
        <span style={{ marginLeft: "auto", fontSize: 11, color: "#94a3b8" }}>
          Bubble size = business impact · Distance from centre = urgency
        </span>
      </div>

      {/* ── SVG ── */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden" }}>
        <svg viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} width="100%" style={{ display: "block" }}>
          <defs>
            {/* Arc paths for category labels */}
            {categories.map((cat, ci) => {
              const a1 = ci * SECTOR_ANGLE - Math.PI / 2 - SECTOR_ANGLE * 0.45;
              const a2 = ci * SECTOR_ANGLE - Math.PI / 2 + SECTOR_ANGLE * 0.45;
              const r  = R_CAT_LABEL;
              const p1 = polar(CX, CY, r, a1);
              const p2 = polar(CX, CY, r, a2);
              const large = a2 - a1 > Math.PI ? 1 : 0;
              return (
                <path key={ci} id={arcId(ci)}
                  d={`M ${p1.x} ${p1.y} A ${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y}`}
                  fill="none" />
              );
            })}

            {/* Arrow markers, one per category colour */}
            {categories.map((cat, ci) => {
              const c = CAT_PALETTE[ci % CAT_PALETTE.length];
              return (
                <marker key={ci} id={`arr-${ci}`}
                  viewBox="0 0 10 10" refX="9" refY="5"
                  markerWidth="5" markerHeight="5" orient="auto">
                  <path d="M1 1L9 5L1 9" fill="none"
                    stroke={c.stroke} strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" />
                </marker>
              );
            })}
          </defs>

          {/* ── Sector background arcs ── */}
          {categories.map((cat, ci) => {
            const c = CAT_PALETTE[ci % CAT_PALETTE.length];
            const a1 = ci * SECTOR_ANGLE - Math.PI / 2 - SECTOR_ANGLE / 2 + SECTOR_ANGLE * GAP_FRACTION / 2;
            const a2 = ci * SECTOR_ANGLE - Math.PI / 2 + SECTOR_ANGLE / 2 - SECTOR_ANGLE * GAP_FRACTION / 2;
            return (
              <path key={ci}
                d={sectorArcPath(CX, CY, R_INNER, R_EXPLORE, a1, a2)}
                fill={c.fill} stroke={c.stroke} strokeWidth={0.5} strokeOpacity={0.35} />
            );
          })}

          {/* ── Concentric ring circles ── */}
          {RINGS.map((ring, ri) => (
            <circle key={ri} cx={CX} cy={CY} r={ring.rOuter}
              fill="none" stroke={ring.stroke} strokeWidth={ri === 0 ? 1.5 : 1}
              strokeDasharray={ring.dash} strokeOpacity={0.5} />
          ))}
          {/* Inner dead-zone boundary */}
          <circle cx={CX} cy={CY} r={R_INNER} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={1} />

          {/* ── Ring band labels (at 10° off vertical so they don't clash with spokes) ── */}
          {RINGS.map((ring, ri) => {
            const midR = (ring.rInner + ring.rOuter) / 2;
            const angle = -Math.PI / 2 + 0.18;
            const p = polar(CX, CY, midR, angle);
            return (
              <text key={ri} x={p.x} y={p.y}
                textAnchor="middle" dominantBaseline="central"
                fontSize={11} fontWeight={700} fill={ring.stroke} opacity={0.8}
                style={{ pointerEvents: "none" }}>
                {ring.label}
              </text>
            );
          })}

          {/* ── Category spokes (coloured radii with arrow tips) ── */}
          {categories.map((cat, ci) => {
            const c = CAT_PALETTE[ci % CAT_PALETTE.length];
            const angle = ci * SECTOR_ANGLE - Math.PI / 2;
            const p1 = polar(CX, CY, R_INNER + 2, angle);
            const p2 = polar(CX, CY, R_EXPLORE + 20, angle);
            return (
              <line key={ci}
                x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                stroke={c.stroke} strokeWidth={1.8} strokeOpacity={0.75}
                markerEnd={`url(#arr-${ci})`} />
            );
          })}

          {/* ── Category arc text labels ── */}
          {categories.map((cat, ci) => {
            const c = CAT_PALETTE[ci % CAT_PALETTE.length];
            return (
              <text key={ci} fontSize={11.5} fontWeight={700} fill={c.dark}
                style={{ pointerEvents: "none" }}>
                <textPath href={`#${arcId(ci)}`} startOffset="50%" textAnchor="middle">
                  {cat.toUpperCase()}
                </textPath>
              </text>
            );
          })}

          {/* ── Centre hub ── */}
          <circle cx={CX} cy={CY} r={R_INNER} fill="#f1f5f9" stroke="#94a3b8" strokeWidth={1} />
          <text x={CX} y={CY - 6} textAnchor="middle" dominantBaseline="central"
            fontSize={10} fontWeight={700} fill="#64748b" style={{ pointerEvents: "none" }}>TECH</text>
          <text x={CX} y={CY + 8} textAnchor="middle" dominantBaseline="central"
            fontSize={10} fontWeight={700} fill="#64748b" style={{ pointerEvents: "none" }}>RADAR</text>

          {/* ── Technology spokes + bubbles ── */}
          {filteredTech.map((tech) => {
            const pos = techData[tech.id];
            if (!pos) return null;

            const ci      = pos.catIdx;
            const ri      = pos.ringIdx;
            const c       = CAT_PALETTE[ci % CAT_PALETTE.length];
            const isHov   = hovered?.id === tech.id;
            const isClick = clicked?.id  === tech.id;
            const isFade  = (anyHovered && !isHov) || (activeRing !== null && ri !== activeRing);
            const bubR    = 5 + ((tech.impact ?? 5) / 10) * 11; // 5–16px

            // Dotted spoke from Deploy ring outward to the bubble
            const spokeStart = polar(CX, CY, R_DEPLOY, pos.angle);

            // Label endpoint (outside the last ring)
            const labelR = R_LABEL + bubR + 4;
            const lp     = polar(CX, CY, labelR, pos.angle);
            // Text anchor depends on which half of the circle
            const rightHalf = Math.cos(pos.angle) >= 0;
            const anchor    = rightHalf ? "start" : "end";
            // Small horizontal nudge so text doesn't touch the bubble
            const lx = lp.x + (rightHalf ? 4 : -4);

            return (
              <g key={tech.id} style={{ cursor: "pointer" }}
                onMouseEnter={() => setHovered(tech)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setClicked(tech)}>

                {/* Dotted spoke from Deploy ring to bubble */}
                <line
                  x1={spokeStart.x} y1={spokeStart.y}
                  x2={pos.x} y2={pos.y}
                  stroke={c.stroke}
                  strokeWidth={isHov ? 1.2 : 0.7}
                  strokeDasharray="3 3"
                  strokeOpacity={isFade ? 0.12 : 0.55} />

                {/* Halo on hover */}
                {isHov && (
                  <circle cx={pos.x} cy={pos.y} r={bubR + 8}
                    fill={c.stroke} opacity={0.15} />
                )}

                {/* Main bubble */}
                <circle
                  cx={pos.x} cy={pos.y} r={isHov ? bubR + 2 : bubR}
                  fill={c.stroke}
                  opacity={isFade ? 0.1 : isHov ? 1 : 0.85}
                  stroke="#ffffff" strokeWidth={isHov ? 2 : 1}
                  style={{ transition: "r 0.1s, opacity 0.15s" }} />

                {/* Dotted extension from bubble out to label */}
                <line
                  x1={pos.x} y1={pos.y}
                  x2={lp.x}  y2={lp.y}
                  stroke={c.stroke}
                  strokeWidth={isHov ? 1.2 : 0.6}
                  strokeDasharray="3 3"
                  strokeOpacity={isFade ? 0.08 : isHov ? 0.9 : 0.45} />

                {/* Technology name label */}
                <text
                  x={lx} y={lp.y}
                  textAnchor={anchor}
                  dominantBaseline="central"
                  fontSize={isHov ? 11.5 : 10}
                  fontWeight={isHov ? 700 : 400}
                  fill={isFade ? "#cbd5e1" : isHov ? c.dark : "#475569"}
                  style={{ pointerEvents: "none", transition: "font-size 0.1s" }}>
                  {tech.name.length > 26 ? tech.name.slice(0, 24) + "…" : tech.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* ── Hover tooltip ── */}
      <Tooltip tech={hovered} mx={mouse.x} my={mouse.y} calculateTIS={calculateTIS} />

      {/* ── Click detail modal ── */}
      {clicked && (
        <DetailModal
          tech={clicked}
          calculateTIS={calculateTIS}
          onClose={() => setClicked(null)}
          catColor={CAT_PALETTE[categories.indexOf(clicked.category) % CAT_PALETTE.length]?.stroke ?? "#64748b"}
        />
      )}

      {/* ── Legend ── */}
      <div style={{
        marginTop: 14, padding: "12px 16px",
        background: "#f8fafc", borderRadius: 10,
        border: "1px solid #e2e8f0",
        display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center",
      }}>
        {categories.map((cat, ci) => {
          const c = CAT_PALETTE[ci % CAT_PALETTE.length];
          return (
            <span key={cat} style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontSize: 12, fontWeight: 500, padding: "3px 10px", borderRadius: 20,
              background: c.stroke, color: "#fff",
            }}>
              {cat}
            </span>
          );
        })}
        <span style={{ marginLeft: "auto", fontSize: 11, color: "#94a3b8" }}>
          Spoke colour = category · Ring = urgency zone
        </span>
      </div>
    </div>
  );
};

export default TechRadarView;
