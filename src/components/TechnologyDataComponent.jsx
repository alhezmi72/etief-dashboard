import React from 'react';
import { useCSVLoader } from '../hooks/useCSVLoader.js';

const TechnologyDataComponent = () => {
  const filePaths = {
    technologiesClaude: '/data/Claude-AI.csv',
    technologiesGPT: '/data/ChatGPT.csv',
    technologiesGemini: '/data/Gemini.csv',
    technologiesDeepSeek: '/data/DeepSeek.csv'
  };

  const { data, loading, error } = useCSVLoader(filePaths);

  if (loading) return <div>Loading technology data...</div>;
  if (error) return <div>Error: {error}</div>;

  // Now you can access each dataset as:
  // data.technologiesClaude, data.technologiesGPT, etc.
  
  return (
    <div>
      <h2>Technology Data Loaded</h2>
      <p>Claude: {data.technologiesClaude?.length} items</p>
      <p>GPT: {data.technologiesGPT?.length} items</p>
      <p>Gemini: {data.technologiesGemini?.length} items</p>
      <p>DeepSeek: {data.technologiesDeepSeek?.length} items</p>
    </div>
  );
};

export default TechnologyDataComponent;