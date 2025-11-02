import React, { useState } from "react";

import TechAssessment from "./TechAssessment.jsx";
import TechExpDashboard from "./TechExpDashboard.jsx";
import LandingPage from "./LandingPage.jsx";

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
        <TechExpDashboard setCurrentPage={setCurrentPage} />
      )}
    </div>
  );
};

export default App;
