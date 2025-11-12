import React, { useState } from "react";

import TechAssessment from "./components/TechAssessment.jsx";
//import TechExpDashboard from "./TechExpDashboard.jsx";
import LandingPage from "./components/LandingPage.jsx";
//import TechnologyDataComponent from "./TechnologyDataComponent.jsx";
import TechExploration from "./components/TechExploration.jsx";  

// Main App Component
const App = () => {
  const [currentPage, setCurrentPage] = useState("landing");

  return (
    <div>
      {currentPage === "landing" && (
        <LandingPage setCurrentPage={setCurrentPage} />
      )}
      {currentPage === "assessment" && (
        <TechAssessment setCurrentPage={setCurrentPage} />
      )}
      {currentPage === "exploration" && (
        <TechExploration setCurrentPage={setCurrentPage} />
      )}

    </div>
  );
};

export default App;
