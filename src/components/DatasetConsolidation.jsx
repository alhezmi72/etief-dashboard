import React, { useMemo } from 'react';

import {
  ExternalLink,
} from "lucide-react";

// Technology name mapping for deduplication
const nameMapping = {
  // AI
  "Cognitive Autonomous Agents": "Agentic AI",
  "Multiagent Systems": "Multi-Agent Systems",
  "Swarm Intelligence + Multi-Agent Systems": "Multi-Agent Systems",
  "Generative AI": "Generative AI & Multimodal Systems",
  "Generative AI for City Management": "Generative AI & Multimodal Systems",
  "AI-Augmented Robotics Programming": "AI-Augmented Engineering",
  // Edge AI
  "Edge AI": "Edge AI & Federated Learning",
  "Edge AI for Computer Vision": "Edge AI & Federated Learning",
  // Satellite
  "Satellite Internet Constellations": "Satellite Connectivity (LEO)",
  "Satellite Constellation Tech": "Satellite Connectivity (LEO)",
  "Low-Earth Orbit Comms (LEO)": "Satellite Connectivity (LEO)",
  // Robotics
  "Collaborative (Co-) Robots": "Advanced & Collaborative Robotics",
  "Advanced Robotics": "Advanced & Collaborative Robotics",
  "Autonomous Last-Mile Delivery Bots": "Autonomous Delivery Robots",
  "Agricultural Robotics (AgBots)": "Agricultural Robotics",
  // Energy
  "Next-Gen Nuclear Energy": "Small Modular Reactors (SMRs)",
  "Next-Gen Nuclear (SMRs)": "Small Modular Reactors (SMRs)",
  // Identity
  "Decentralized Identity (DID)": "Decentralized Digital Identity (DID)",
  // Bio
  "RNA Therapeutics": "RNA & Epigenetic Therapies",
  // IoT
  "Collaborative Sensing": "Collaborative Sensing Networks",
  "Multi-Modal Fusion Sensing": "Collaborative Sensing Networks",
};

// Calculate TIS (Tech Impact Score) for a single technology
const calculateTIS = (tech) => {
  const weights = {
    impact: 0.35,
    strategicFit: 0.30,
    barriers: 0.20,
    sustainability: 0.15
  };
  
  const impact = parseFloat(tech.impact) || 5;
  const barriers = parseFloat(tech.barriers) || 5;
  const sustainability = parseFloat(tech.sustainability) || 5;
  const strategicFit = parseFloat(tech.strategicFit) || 5;
  
  const tis = (
    weights.impact * impact +
    weights.strategicFit * strategicFit +
    weights.barriers * (10 - barriers) +
    weights.sustainability * (10 - sustainability)
  );
  
  return Math.max(0, Math.min(10, tis));
};

// Normalize technology names across datasets
const normalizeTechName = (name) => {
  return nameMapping[name] || name;
};

// Calculate average and standard deviation
const calculateStats = (values) => {
  const validValues = values.filter(v => !isNaN(v) && v !== null);
  if (validValues.length === 0) return { avg: 0, std: 0 };
  
  const avg = validValues.reduce((sum, v) => sum + v, 0) / validValues.length;
  const variance = validValues.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / validValues.length;
  const std = Math.sqrt(variance);
  
  return { avg, std };
};

// Determine Gartner Hype Cycle phase based on original phase data and TRL
const determinePhase = (techs) => {
  // Collect all phases from the cluster
  const phases = techs.map(t => t.phase).filter(Boolean);
  const phaseCount = {};
  
  phases.forEach(phase => {
    phaseCount[phase] = (phaseCount[phase] || 0) + 1;
  });
  
  // Get most common phase (consensus)
  const consensusPhase = Object.keys(phaseCount).sort((a, b) => 
    phaseCount[b] - phaseCount[a]
  )[0];
  
  // If no consensus, derive from TRL
  if (!consensusPhase) {
    const avgTRL = techs.reduce((sum, t) => sum + parseFloat(t.trl || 5), 0) / techs.length;
    if (avgTRL <= 4) return "Innovation Trigger";
    if (avgTRL <= 5) return "Peak of Inflated Expectations";
    if (avgTRL <= 6) return "Trough of Disillusionment";
    if (avgTRL <= 8) return "Slope of Enlightenment";
    return "Plateau of Productivity";
  }
  
  return consensusPhase;
};

// Assign Hype Cycle position based on phase and create variation
const assignHypeCyclePosition = (phase, index, total) => {
  const phaseRanges = {
    "Innovation Trigger": { xStart: 0, xEnd: 20, yStart: 70, yEnd: 100 },
    "Peak of Inflated Expectations": { xStart: 20, xEnd: 35, yStart: 11, yEnd: 28 },
    "Trough of Disillusionment": { xStart: 35, xEnd: 50, yStart: 12, yEnd: 37 },
    "Slope of Enlightenment": { xStart: 50, xEnd: 75, yStart: 38, yEnd: 58 },
    "Plateau of Productivity": { xStart: 75, xEnd: 100, yStart: 45, yEnd: 52 }
  };
  
  const range = phaseRanges[phase] || phaseRanges["Innovation Trigger"];
  
  // Create spread within the phase based on index
  const spreadFactor = total > 1 ? index / (total - 1) : 0.5;
  
  const x = range.xStart + (range.xEnd - range.xStart) * (0.2 + spreadFactor * 0.6);
  const y = range.yStart + (range.yEnd - range.yStart) * (0.3 + Math.random() * 0.4);
  
  return { phase, x, y };
};

// Main consolidation function
export const consolidateDatasets = (datasets) => {
  // Step 1: Normalize all datasets and calculate TIS
  const normalizedDatasets = datasets.map(dataset =>
    dataset.map(tech => ({
      ...tech,
      name: normalizeTechName(tech.name),
      tis: calculateTIS(tech)
    }))
  );

  // Step 2: Group technologies by normalized name
  const techGroups = {};
  
  normalizedDatasets.forEach((dataset, datasetIndex) => {
    dataset.forEach(tech => {
      if (!techGroups[tech.name]) {
        techGroups[tech.name] = [];
      }
      techGroups[tech.name].push({
        ...tech,
        datasetIndex
      });
    });
  });

  // Step 3: Aggregate scores for each technology cluster
  const aggregatedTechnologies = Object.entries(techGroups).map(([name, techs]) => {
    const tisValues = techs.map(t => t.tis);
    const trlValues = techs.map(t => parseFloat(t.trl)).filter(v => !isNaN(v));
    const impactValues = techs.map(t => parseFloat(t.impact)).filter(v => !isNaN(v));
    const barriersValues = techs.map(t => parseFloat(t.barriers)).filter(v => !isNaN(v));
    const sustainabilityValues = techs.map(t => parseFloat(t.sustainability)).filter(v => !isNaN(v));
    const strategicFitValues = techs.map(t => parseFloat(t.strategicFit)).filter(v => !isNaN(v));
    
    const tisStats = calculateStats(tisValues);
    const trlStats = calculateStats(trlValues);
    const impactStats = calculateStats(impactValues);
    const barriersStats = calculateStats(barriersValues);
    const sustainabilityStats = calculateStats(sustainabilityValues);
    const strategicFitStats = calculateStats(strategicFitValues);
    
    // Confidence score (inverse of variance)
    const confidence = 1 / (1 + tisStats.std);
    
    // Get most common category
    const categories = techs.map(t => t.category).filter(Boolean);
    const categoryCount = {};
    categories.forEach(cat => {
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
    const category = Object.keys(categoryCount).sort((a, b) => 
      categoryCount[b] - categoryCount[a]
    )[0] || "Uncategorized";
    
    // Determine consensus phase
    const phase = determinePhase(techs);
    
    // Combine notes and sources
    const notes = [...new Set(techs.map(t => t.notes).filter(Boolean))].join("; ");
    const sources = [...new Set(techs.map(t => t.source).filter(Boolean))].join(", ");
    
    return {
      name,
      category,
      phase,
      tis_avg: tisStats.avg,
      tis_std: tisStats.std,
      confidence,
      trl: Math.round(trlStats.avg * 10) / 10,
      impact: Math.round(impactStats.avg * 10) / 10,
      barriers: Math.round(barriersStats.avg * 10) / 10,
      sustainability: Math.round(sustainabilityStats.avg * 10) / 10,
      strategicFit: Math.round(strategicFitStats.avg * 10) / 10,
      notes,
      source: sources,
      datasetCount: techs.length,
      originalTechs: techs
    };
  });

  // Step 4: Apply filters
  const filteredTechs = aggregatedTechnologies.filter(tech => {
    // Remove very low TRL unless strategically important
    if (tech.trl < 3 && tech.strategicFit < 7) return false;
    // Remove low confidence with low impact
    if (tech.confidence < 0.5 && tech.impact < 6) return false;
    return true;
  });

  // Step 5: Sort by TIS average
  const sortedTechs = filteredTechs.sort((a, b) => b.tis_avg - a.tis_avg);

  // Step 6: Group by phase for balanced selection
  const phaseGroups = {
    "Innovation Trigger": [],
    "Peak of Inflated Expectations": [],
    "Trough of Disillusionment": [],
    "Slope of Enlightenment": [],
    "Plateau of Productivity": []
  };
  
  sortedTechs.forEach(tech => {
    if (phaseGroups[tech.phase]) {
      phaseGroups[tech.phase].push(tech);
    } else {
      // Fallback to Innovation Trigger if phase is unknown
      phaseGroups["Innovation Trigger"].push(tech);
    }
  });

  // Step 7: Category coverage - ensure each category has at least one tech
  const categoryGroups = {};
  sortedTechs.forEach(tech => {
    if (!categoryGroups[tech.category]) {
      categoryGroups[tech.category] = [];
    }
    categoryGroups[tech.category].push(tech);
  });

  const selectedTechs = [];
  const maxPerCategory = 12; // ~40% of 30
  const minPerCategory = 1;

  // First pass: ensure minimum category representation
  Object.entries(categoryGroups).forEach(([category, techs]) => {
    const topTech = techs[0];
    if (topTech && selectedTechs.length < 30) {
      selectedTechs.push(topTech);
    }
  });

  // Step 8: Phase-balanced selection (target ~6 per phase for 30 total)
  const targetPerPhase = 6;
  const phaseSelectionCount = {
    "Innovation Trigger": 0,
    "Peak of Inflated Expectations": 0,
    "Trough of Disillusionment": 0,
    "Slope of Enlightenment": 0,
    "Plateau of Productivity": 0
  };

  // Count already selected by phase
  selectedTechs.forEach(tech => {
    if (phaseSelectionCount[tech.phase] !== undefined) {
      phaseSelectionCount[tech.phase]++;
    }
  });

  // Second pass: fill remaining slots with phase balance
  const phases = Object.keys(phaseGroups);
  let currentPhaseIndex = 0;
  
  while (selectedTechs.length < 30 && phases.length > 0) {
    const phase = phases[currentPhaseIndex % phases.length];
    const phaseList = phaseGroups[phase];
    
    // Find next tech in this phase that's not already selected and respects category limits
    const nextTech = phaseList.find(tech => {
      if (selectedTechs.some(t => t.name === tech.name)) return false;
      
      const categoryCount = selectedTechs.filter(t => t.category === tech.category).length;
      return categoryCount < maxPerCategory;
    });
    
    if (nextTech && phaseSelectionCount[phase] < targetPerPhase + 2) {
      selectedTechs.push(nextTech);
      phaseSelectionCount[phase]++;
    }
    
    currentPhaseIndex++;
    
    // Prevent infinite loop
    if (currentPhaseIndex > phases.length * 20) break;
  }

  // Step 9: If still not 30, fill with highest TIS regardless of phase
  const categoryCounts = {};
  selectedTechs.forEach(tech => {
    categoryCounts[tech.category] = (categoryCounts[tech.category] || 0) + 1;
  });

  for (const tech of sortedTechs) {
    if (selectedTechs.length >= 30) break;
    if (selectedTechs.some(t => t.name === tech.name)) continue;
    
    const currentCount = categoryCounts[tech.category] || 0;
    if (currentCount < maxPerCategory) {
      selectedTechs.push(tech);
      categoryCounts[tech.category] = currentCount + 1;
    }
  }

  // Step 10: Assign final positions with phase-based distribution
  const finalPhaseGroups = {};
  selectedTechs.forEach(tech => {
    if (!finalPhaseGroups[tech.phase]) {
      finalPhaseGroups[tech.phase] = [];
    }
    finalPhaseGroups[tech.phase].push(tech);
  });

  const finalTechnologies = [];
  let globalId = 1;

  Object.entries(finalPhaseGroups).forEach(([phase, techs]) => {
    techs.forEach((tech, index) => {
      const position = assignHypeCyclePosition(phase, index, techs.length);
      
      finalTechnologies.push({
        id: globalId++,
        name: tech.name,
        phase: position.phase,
        x: Math.round(position.x * 10) / 10,
        y: Math.round(position.y * 10) / 10,
        trl: tech.trl,
        impact: tech.impact,
        barriers: tech.barriers,
        sustainability: tech.sustainability,
        strategicFit: tech.strategicFit,
        category: tech.category,
        notes: tech.notes || `Consolidated from ${tech.datasetCount} source(s)`,
        source: tech.source || "Multi-source consensus",
        tis: Math.round(tech.tis_avg * 100) / 100,
        confidence: Math.round(tech.confidence * 100) / 100
      });
    });
  });

  // Step 11: Sort by ID to maintain order
  finalTechnologies.sort((a, b) => a.id - b.id);

  // Calculate distribution metrics
  const phaseDistribution = {};
  finalTechnologies.forEach(tech => {
    phaseDistribution[tech.phase] = (phaseDistribution[tech.phase] || 0) + 1;
  });

  const trlDistribution = {
    shortTerm: finalTechnologies.filter(t => t.trl >= 7).length,
    midTerm: finalTechnologies.filter(t => t.trl >= 5 && t.trl < 7).length,
    longTerm: finalTechnologies.filter(t => t.trl < 5).length
  };

  return {
    technologies: finalTechnologies,
    metadata: {
      totalTechnologies: finalTechnologies.length,
      categoryDistribution: categoryCounts,
      phaseDistribution,
      trlDistribution,
      averageConfidence: Math.round(
        (finalTechnologies.reduce((sum, t) => sum + t.confidence, 0) / finalTechnologies.length) * 100
      ) / 100,
      sourceDatasets: datasets.length
    }
  };
};

// React component for preview/visualization
export const ConsolidatedDatasetPreview = ({ datasets }) => {
  const consolidated = useMemo(() => {
    if (!datasets || datasets.length === 0) return null;
    return consolidateDatasets(datasets);
  }, [datasets]);

  if (!consolidated) return null;

  const { technologies, metadata } = consolidated;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Consolidated Technology Portfolio
        </h3>
        <p className="text-gray-600">
          Integrated analysis from {metadata.sourceDatasets} data sources
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-lg">
          <div className="text-3xl font-bold text-teal-700">{metadata.totalTechnologies}</div>
          <div className="text-sm text-teal-600">Technologies</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
          <div className="text-3xl font-bold text-blue-700">{metadata.averageConfidence}</div>
          <div className="text-sm text-blue-600">Avg Confidence</div>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg">
          <div className="text-3xl font-bold text-indigo-700">
            {Object.keys(metadata.categoryDistribution).length}
          </div>
          <div className="text-sm text-indigo-600">Categories</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
          <div className="text-3xl font-bold text-purple-700">
            {Object.keys(metadata.phaseDistribution).length}
          </div>
          <div className="text-sm text-purple-600">Hype Phases</div>
        </div>
      </div>

      {/* Phase Distribution */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-bold text-gray-800 mb-3">Distribution Across Hype Cycle Phases</h4>
        <div className="space-y-2">
          {Object.entries(metadata.phaseDistribution).map(([phase, count]) => (
            <div key={phase} className="flex items-center gap-3">
              <div className="w-40 text-sm text-gray-700 font-medium">{phase}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-teal-500 to-blue-500 flex items-center justify-end px-2"
                  style={{ width: `${(count / metadata.totalTechnologies) * 100}%` }}
                >
                  <span className="text-xs font-bold text-white">{count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-bold text-gray-800 mb-3">Top Technologies by Impact Score</h4>
        <div className="space-y-2 max-h-100 overflow-y-auto">
          {technologies.slice(0, 10).map((tech) => (
            <div key={tech.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex-1">
                <div className="font-medium text-gray-900">{tech.name}</div>
                <div className="text-xs text-gray-500">{tech.category} • {tech.phase}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-bold text-teal-700">TIS: {tech.tis}</div>
                  <div className="text-xs text-gray-500">Conf: {tech.confidence}</div>
                </div>
                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-teal-500 to-blue-500"
                    style={{ width: `${(tech.tis / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    
  );
};

export default ConsolidatedDatasetPreview;