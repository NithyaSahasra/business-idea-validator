import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import MockBanner from "./components/MockBanner";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Validate from "./pages/Validate";
import Research from "./pages/Research";
import MyReports from "./pages/MyReports";
import Report from "./pages/Report";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <MockBanner />
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected Routes */}
              <Route
                path="/validate"
                element={
                  <ProtectedRoute>
                    <Validate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/research/:jobId"
                element={
                  <ProtectedRoute>
                    <Research />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <MyReports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports/:reportId"
                element={
                  <ProtectedRoute>
                    <Report />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <footer style={{
            borderTop: "1px solid var(--border)",
            backgroundColor: "#FFFFFF",
            padding: "24px 0",
            fontSize: "13px",
            color: "var(--secondary-text)",
            textAlign: "center"
          }}>
            <div className="container">
              <span>IdeaLens — Evidence-Driven AI Business Idea Validation Platform</span>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
