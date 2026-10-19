import React from "react";
import { useAuth } from "../context/AuthContext";

export default function MockBanner() {
  const { isMockMode } = useAuth();

  if (!isMockMode) return null;

  return (
    <div className="mock-banner" role="alert">
      DEVELOPMENT MODE — MOCK RESEARCH DATA ACTIVE
    </div>
  );
}
