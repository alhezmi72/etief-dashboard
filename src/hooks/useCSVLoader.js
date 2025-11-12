import { useState, useEffect } from 'react';
import Papa from 'papaparse';

export const useCSVLoader = (filePaths) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAllCSVFiles = async () => {
      try {
        const promises = Object.entries(filePaths).map(async ([key, filePath]) => {
          const response = await fetch(filePath);
          const text = await response.text();
          const results = Papa.parse(text, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true
          });
          
          return {
            key,
            data: results.data.map(row => ({
              id: parseInt(row.id) || 0,
              name: row.name || '',
              phase: row.phase || '',
              x: parseFloat(row.x) || 0,
              y: parseFloat(row.y) || 0,
              trl: parseInt(row.trl) || 0,
              impact: parseFloat(row.impact) || 0,
              barriers: parseFloat(row.barriers) || 0,
              sustainability: parseFloat(row.sustainability) || 0,
              strategicFit: parseFloat(row.strategicFit) || 0,
              category: row.category || '',
              notes: row.notes || '',
              source: row.source || ''
            })).filter(item => item.id !== 0)
          };
        });

        const results = await Promise.all(promises);
        const dataObject = {};
        results.forEach(({ key, data }) => {
          dataObject[key] = data;
        });

        setData(dataObject);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadAllCSVFiles();
  }, [filePaths]);

  return { data, loading, error };
};