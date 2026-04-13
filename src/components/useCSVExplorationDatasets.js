import { useState, useEffect } from "react";

/**
 * Custom hook that reads all CSV files from a local directory path and
 * returns datasets in the same shape as useExplorationDatasets, making
 * it a drop-in replacement for local-file use cases.
 *
 * @param {string} directoryPath - Relative path to the CSV directory,
 *                                 e.g. "./data/Exploration".
 * @param {string[]} fileNames   - Explicit list of CSV file names to load,
 *                                 e.g. ["Claude-AI.csv", "ChatGPT.csv"].
 *                                 The bare file stem (without extension) is
 *                                 used as the dataset key.
 *
 * Returns:
 *   datasetsMap  – { [key: string]: any[] }  e.g. { "Claude-AI": [...] }
 *   sourceKeys   – string[]  ordered list of keys derived from fileNames
 *   createdDate  – null  (not available from local CSV files)
 *   loading      – boolean
 *   error        – string | null
 */

// Minimal CSV parser: handles quoted fields and converts numeric strings.
const parseCSV = (text) => {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));

  return lines.slice(1).map((line) => {
    // Split respecting quoted commas
    const values = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    values.push(current.trim());

    return headers.reduce((obj, header, idx) => {
      const raw = (values[idx] ?? "").replace(/^"|"$/g, "");
      // Coerce to number when the value is purely numeric
      obj[header] = raw !== "" && !isNaN(raw) ? parseFloat(raw) : raw;
      return obj;
    }, {});
  });
};

const useCSVExplorationDatasets = (directoryPath, fileNames) => {
  const [datasetsMap, setDatasetsMap] = useState({});
  const [sourceKeys, setSourceKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!fileNames || fileNames.length === 0) {
      setLoading(false);
      return;
    }

    const loadAll = async () => {
      try {
        setLoading(true);
        setError(null);

        const entries = await Promise.all(
          fileNames.map(async (fileName) => {
            const url = `${directoryPath}/${fileName}`;
            const res = await fetch(url);
            if (!res.ok)
              throw new Error(`Failed to load "${fileName}": ${res.statusText}`);
            const text = await res.text();
            const key = fileName.replace(/\.csv$/i, "");
            return [key, parseCSV(text)];
          })
        );

        const map = Object.fromEntries(entries);
        setDatasetsMap(map);
        setSourceKeys(entries.map(([key]) => key));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [directoryPath, JSON.stringify(fileNames)]);

  // createdDate is not available from local CSV files; returned as null
  // to preserve interface compatibility with useExplorationDatasets.
  return { datasetsMap, sourceKeys, createdDate: null, loading, error };
};

export default useCSVExplorationDatasets;
