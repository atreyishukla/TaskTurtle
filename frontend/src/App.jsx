import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { getSchedule } from "./api/schedulerAPI";   // ← FIXED IMPORT
import Navbar from "./components/Navbar";
import PennyModal from "./components/PennyModal";
import { Button } from "@mui/material";
import ScheduleView from "./pages/ScheduleView";


// Pages
import Games from "./pages/Games";
import Scheduler from "./pages/Scheduler";

function Home() {
  const [result, setResult] = useState(null);


  return (
    <div style={{ padding: "20px" }}>
      <PennyModal />

      <h1>Productivity App</h1>

    </div>
  );
}

function App() {
  return (
    <Router>
      <PennyModal />
      <Navbar />
      <div style={{ height: "40px" }}></div>

      <Routes>
  
        <Route path="/" element={<Scheduler />} />
        <Route path="/games" element={<Games />} />
        <Route path="/schedule" element={<ScheduleView />} />
      </Routes>
    </Router>
  );
}

export default App;
