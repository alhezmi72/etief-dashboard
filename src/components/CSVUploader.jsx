import { useState, useRef, useCallback } from "react";

// ── Minimal CSV parser (quoted fields + numeric coercion) ─────────────────
const parseCSV = (text) => {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1)
    .filter((line) => line.trim() !== "")
    .map((line) => {
      const values = [];
      let current = "";
      let inQuotes = false;
      for (const ch of line) {
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

// ── Design tokens ─────────────────────────────────────────────────────────
const C = {
  primary:   "#3525cd",
  secondary: "#006a61",
  surface:   "#f8f9ff",
  outlineVariant: "#c7c4d8",
};

/**
 * CSVUploader
 *
 * Modal panel that lets users pick a CSV file (drag-and-drop or click),
 * previews its contents, then either:
 *   • "Add as New Source"     — registers the file stem as a new dataset key
 *   • "Update Existing Source" — overwrites one of the current dataset keys
 *
 * Props
 * ─────
 * @param {string[]}  existingKeys   – Current dataset keys shown in the replace dropdown.
 * @param {Function}  onAdd          – (key: string, rows: object[]) => void  — new source.
 * @param {Function}  onUpdate       – (key: string, rows: object[]) => void  — replace source.
 * @param {Function}  onClose        – () => void  — close the panel.
 */
const CSVUploader = ({ existingKeys = [], onAdd, onUpdate, onClose }) => {
  const [file,          setFile]          = useState(null);
  const [rows,          setRows]          = useState([]);
  const [parseError,    setParseError]    = useState(null);
  const [isDragging,    setIsDragging]    = useState(false);
  const [replaceKey,    setReplaceKey]    = useState(existingKeys[0] ?? "");
  const [mode,          setMode]          = useState("add");   // "add" | "update"
  const [customName,    setCustomName]    = useState("");
  const [committed,     setCommitted]     = useState(false);
  const inputRef = useRef(null);

  // ── File ingestion ───────────────────────────────────────────────────────
  const ingest = useCallback((f) => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".csv")) {
      setParseError("Only .csv files are accepted.");
      return;
    }
    setFile(f);
    setParseError(null);
    setCommitted(false);
    // Default custom name to the file stem (minus extension)
    setCustomName(f.name.replace(/\.csv$/i, ""));

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = parseCSV(e.target.result);
        if (parsed.length === 0) throw new Error("No data rows found in the file.");
        setRows(parsed);
      } catch (err) {
        setParseError(err.message);
        setRows([]);
      }
    };
    reader.readAsText(f);
  }, []);

  // ── Drag events ──────────────────────────────────────────────────────────
  const onDragOver  = (e) => { e.preventDefault(); setIsDragging(true);  };
  const onDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const onDrop      = (e) => {
    e.preventDefault();
    setIsDragging(false);
    ingest(e.dataTransfer.files[0]);
  };
  const onFileInput = (e) => ingest(e.target.files[0]);

  // ── Commit ───────────────────────────────────────────────────────────────
  const handleCommit = () => {
    if (!rows.length) return;
    if (mode === "add") {
      const key = (customName.trim() || file.name.replace(/\.csv$/i, "")).replace(/\s+/g, "-");
      onAdd(key, rows);
    } else {
      onUpdate(replaceKey, rows);
    }
    setCommitted(true);
  };

  // ── Preview columns (first 6 keys of first row, max) ────────────────────
  const previewCols = rows.length ? Object.keys(rows[0]).slice(0, 7) : [];
  const previewRows = rows.slice(0, 6);

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(18,28,42,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Panel */}
      <div
        className="relative w-full max-w-2xl mx-4 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ background: C.surface, maxHeight: "90vh" }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b"
             style={{ borderColor: `${C.outlineVariant}40` }}>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[22px]" style={{ color: C.primary }}>
              upload_file
            </span>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Upload CSV Dataset</h2>
              <p className="text-[11px] text-slate-400" style={{ fontFamily: "Manrope, sans-serif" }}>
                Add a new data source or replace an existing one
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-slate-400 text-[20px]">close</span>
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ── Drop zone ── */}
          {!committed && (
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-all py-10 px-6 text-center select-none"
              style={{
                borderColor: isDragging ? C.primary : `${C.outlineVariant}80`,
                background:  isDragging ? "#eff4ff" : "#f8f9ff",
              }}
            >
              <span
                className="material-symbols-outlined text-[40px]"
                style={{ color: isDragging ? C.primary : C.outlineVariant }}
              >
                upload_file
              </span>
              <div>
                <p className="font-semibold text-slate-700 text-sm">
                  {isDragging ? "Drop to upload" : "Drag & drop a CSV file here"}
                </p>
                <p className="text-[11px] text-slate-400 mt-1" style={{ fontFamily: "Manrope, sans-serif" }}>
                  or <span className="underline" style={{ color: C.primary }}>click to browse</span>
                </p>
              </div>
              {file && !parseError && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                     style={{ background: "#e2dfff", color: C.primary }}>
                  <span className="material-symbols-outlined text-[14px]">description</span>
                  {file.name}
                  <span className="text-[10px] opacity-60">· {rows.length} rows</span>
                </div>
              )}
              <input
                ref={inputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={onFileInput}
              />
            </div>
          )}

          {/* ── Parse error ── */}
          {parseError && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
                 style={{ background: "#fff1f2", color: "#be123c" }}>
              <span className="material-symbols-outlined text-[18px]">error</span>
              {parseError}
            </div>
          )}

          {/* ── Success banner ── */}
          {committed && (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <span className="material-symbols-outlined text-[48px]" style={{ color: C.secondary }}>
                check_circle
              </span>
              <p className="font-bold text-slate-800">
                Dataset {mode === "add" ? "added" : "updated"} successfully!
              </p>
              <p className="text-xs text-slate-400" style={{ fontFamily: "Manrope, sans-serif" }}>
                The source selector has been updated. Select it from the dropdown to explore.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2.5 rounded-full text-sm font-bold text-white"
                style={{ background: C.primary }}
              >
                Done
              </button>
            </div>
          )}

          {/* ── Mode + name controls (only if file is ready) ── */}
          {rows.length > 0 && !committed && (
            <>
              {/* Mode toggle */}
              <div className="flex rounded-xl overflow-hidden border"
                   style={{ borderColor: `${C.outlineVariant}40` }}>
                {[
                  { id: "add",    icon: "add_circle",  label: "Add as New Source"      },
                  { id: "update", icon: "sync",         label: "Update Existing Source" },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold transition-all"
                    style={{
                      background: mode === m.id ? C.primary : "#ffffff",
                      color:      mode === m.id ? "#ffffff" : "#64748b",
                      fontFamily: "Manrope, sans-serif",
                    }}
                  >
                    <span className="material-symbols-outlined text-[16px]">{m.icon}</span>
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Add mode: custom dataset name */}
              {mode === "add" && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400"
                         style={{ fontFamily: "Manrope, sans-serif" }}>
                    Dataset Name
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. My-Custom-Dataset"
                    className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 transition-shadow"
                    style={{
                      borderColor: `${C.outlineVariant}80`,
                      fontFamily: "Inter, sans-serif",
                    }}
                    onFocus={(e) => e.target.style.boxShadow = `0 0 0 3px rgba(53,37,205,.15)`}
                    onBlur={(e)  => e.target.style.boxShadow = "none"}
                  />
                  <p className="text-[10px] text-slate-400" style={{ fontFamily: "Manrope, sans-serif" }}>
                    This name will appear in the data source selector. Spaces are replaced with hyphens.
                  </p>
                </div>
              )}

              {/* Update mode: pick which key to overwrite */}
              {mode === "update" && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400"
                         style={{ fontFamily: "Manrope, sans-serif" }}>
                    Replace Dataset
                  </label>
                  {existingKeys.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No existing datasets available to replace.</p>
                  ) : (
                    <select
                      value={replaceKey}
                      onChange={(e) => setReplaceKey(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                      style={{
                        borderColor: `${C.outlineVariant}80`,
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      {existingKeys.map((k) => (
                        <option key={k} value={k}>{k}</option>
                      ))}
                    </select>
                  )}
                  <p className="text-[10px] text-slate-400" style={{ fontFamily: "Manrope, sans-serif" }}>
                    The selected dataset will be replaced with the uploaded file's contents.
                  </p>
                </div>
              )}

              {/* ── Data preview table ── */}
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400"
                   style={{ fontFamily: "Manrope, sans-serif" }}>
                  Preview — first {previewRows.length} of {rows.length} rows
                </p>
                <div className="overflow-x-auto rounded-xl border"
                     style={{ borderColor: `${C.outlineVariant}40` }}>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr style={{ background: "#eff4ff" }}>
                        {previewCols.map((col) => (
                          <th key={col}
                              className="px-3 py-2 font-bold uppercase tracking-wider whitespace-nowrap"
                              style={{ color: C.primary, fontFamily: "Manrope, sans-serif", fontSize: "9px" }}>
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: `${C.outlineVariant}20` }}>
                      {previewRows.map((row, i) => (
                        <tr key={i}
                            style={{ background: i % 2 === 0 ? "#ffffff" : "#f8f9ff" }}>
                          {previewCols.map((col) => (
                            <td key={col} className="px-3 py-2 text-slate-600 whitespace-nowrap max-w-[140px] truncate">
                              {String(row[col] ?? "—")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {rows.length > previewRows.length && (
                  <p className="text-[10px] text-slate-400 text-right"
                     style={{ fontFamily: "Manrope, sans-serif" }}>
                    … and {rows.length - previewRows.length} more rows
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Footer actions ── */}
        {rows.length > 0 && !committed && (
          <div className="flex items-center justify-between px-6 py-4 border-t"
               style={{ borderColor: `${C.outlineVariant}40`, background: "#f8f9ff" }}>
            <p className="text-[11px] text-slate-400" style={{ fontFamily: "Manrope, sans-serif" }}>
              {rows.length} rows · {Object.keys(rows[0] ?? {}).length} columns
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-full text-xs font-bold border transition-colors"
                style={{ borderColor: `${C.outlineVariant}80`, color: "#64748b" }}
              >
                Cancel
              </button>
              <button
                onClick={handleCommit}
                disabled={mode === "update" && existingKeys.length === 0}
                className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: C.primary, fontFamily: "Manrope, sans-serif" }}
              >
                <span className="material-symbols-outlined text-[15px]">
                  {mode === "add" ? "add_circle" : "sync"}
                </span>
                {mode === "add" ? "Add Source" : `Replace "${replaceKey}"`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CSVUploader;
