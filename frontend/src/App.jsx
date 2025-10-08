import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Checklist from "./pages/checklist";
import Machine from "./pages/machine";
import Human from "./pages/human";
import History from "./pages/history";
import ImmediateAction from "./pages/immediate_action";
import Location from "./pages/location";
import Maintenance from "./pages/maintenance";
import Location1 from "./pages/location1";
import Location2 from "./pages/location2";
import Location3 from "./pages/location3";
import Location5 from "./pages/location5";
import Location4 from "./pages/location4";
import Location6 from "./pages/location6";
import LocationE from "./pages/electrical_location/e_location.jsx";
import LocationE1 from "./pages/electrical_location/e_location1.jsx";
import LocationE2 from "./pages/electrical_location/e_location2.jsx";
import LocationE3 from "./pages/electrical_location/e_location3.jsx";
import LocationE4 from "./pages/electrical_location/e_location4.jsx";
import LocationE5 from "./pages/electrical_location/e_location5.jsx";
import LocationE6 from "./pages/electrical_location/e_location6.jsx";
import Hero from "./pages/hero.jsx";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checklist"
            element={
              <ProtectedRoute>
                <Checklist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/machine"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Machine />
              </ProtectedRoute>
            }
          />
          <Route
            path="/human"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Human />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "ENGINEER"]}>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/immediate_action"
            element={
              <ProtectedRoute>
                <ImmediateAction />
              </ProtectedRoute>
            }
          />
          <Route
            path="/location"
            element={
              <ProtectedRoute>
                <Location />
              </ProtectedRoute>
            }
          />
          <Route
            path="/maintenance"
            element={
              <ProtectedRoute>
                <Maintenance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/location/:id"
            element={
              <ProtectedRoute>
                <Location />
              </ProtectedRoute>
            }
          />
          <Route
            path="/location1"
            element={
              <ProtectedRoute>
                <Location1 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/location2"
            element={
              <ProtectedRoute>
                <Location2 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/location3"
            element={
              <ProtectedRoute>
                <Location3 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/location4"
            element={
              <ProtectedRoute>
                <Location4 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/location5"
            element={
              <ProtectedRoute>
                <Location5 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/location6"
            element={
              <ProtectedRoute>
                <Location6 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/e_location"
            element={
              <ProtectedRoute>
                <LocationE />
              </ProtectedRoute>
            }
          />
          <Route
            path="/e_location/e_location1"
            element={
              <ProtectedRoute>
                <LocationE1 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/e_location/e_location2"
            element={
              <ProtectedRoute>
                <LocationE2 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/e_location/e_location3"
            element={
              <ProtectedRoute>
                <LocationE3 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/e_location/e_location4"
            element={
              <ProtectedRoute>
                <LocationE4 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/e_location/e_location5"
            element={
              <ProtectedRoute>
                <LocationE5 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/e_location/e_location6"
            element={
              <ProtectedRoute>
                <LocationE6 />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;