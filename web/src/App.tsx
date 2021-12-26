import React from "react";
import { Route, Routes } from "react-router-dom";
import MainPage from "./pages/MainPage";
import MeetPage from "./pages/MeetPage";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/meet/:meetId" element={<MeetPage />} />
    </Routes>
  );
};

export default App;
