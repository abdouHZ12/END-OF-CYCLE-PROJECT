"use client"

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { motion } from "framer-motion";
import { apiPost, apiGet, type ApiError } from "@/lib/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useRouter } from "next/navigation";

type Worker = {
  id: number;
  name: string;
  username: string;
};

type DocumentResponse = {
  message?: string;
  document: {
    id: number;
    type: string;
    status: string;
  };
};

export default function MissionOrderPage() {
  const [destination, setDestination] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [purpose, setPurpose] = useState<string>("");
  const [travelMethod, setTravelMethod] = useState<string>("");
  const [assignedToId, setAssignedToId] = useState<string>("");
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [workersLoading, setWorkersLoading] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const toastTimerRef = useRef<number | null>(null);
  const user = useCurrentUser();
  const managerId = user ? Number(user.id) : null;
  const router = useRouter();

  // Fetch workers list on mount
useEffect(() => {
  let mounted = true;

  async function fetchWorkers() {
    setWorkersLoading(true);
    try {
      const data = await apiGet<Worker[]>("/api/employees/workers");
      if (mounted) setWorkers(data);
    } catch {
      if (mounted) setError("Failed to load workers list.");
    } finally {
      if (mounted) setWorkersLoading(false);
    }
  }

  fetchWorkers();
  return () => { mounted = false; };
}, []);

  function showToast(message: string, durationMs: number) {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToast(message);
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, durationMs);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!managerId) {
      setError("Please sign in.");
      return;
    }
    if (!assignedToId) {
      setError("Please select a worker to assign this mission to.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await apiPost<DocumentResponse>("/api/documents/MissionOrder", {
        Type: "MISSION_ORDER",
        EmployeeId: managerId,
        assignedToId: parseInt(assignedToId),
        destination,
        duration: parseInt(duration),
        purpose,
        travelMethod,
      });

      showToast("Mission Order assigned successfully", 2500);

      setDestination("");
      setDuration("");
      setPurpose("");
      setTravelMethod("");
      setAssignedToId("");
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(
        apiErr?.message || "An error occurred while submitting the mission order"
      );
    } finally {
      setIsLoading(false);
    }
  }

  const handleCancel = () => {
    router.push("/manager");
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    backgroundColor: "rgb(10, 22, 40)",
    borderRadius: "5px",
    fontSize: "16px",
    marginTop: "4px",
    marginBottom: "12px",
    paddingTop: "8px",
    paddingBottom: "8px",
    paddingLeft: "10px",
    paddingRight: "10px",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.08)",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    color: "#cbd5e1",
    fontSize: "14px",
    fontWeight: 500,
    marginBottom: "4px",
    display: "block",
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        mt: "70px",
        backgroundColor: "rgb(10, 22, 40)",
        display: "grid",
        gridTemplateRows: "1fr auto",
        pt: "20px",
        pb: "20px",
        pr: { md: "20px", lg: "350px" },
        pl: { md: "20px", lg: "350px" },
        minHeight: "100vh",
      }}
    >
      <Box sx={{ width: "100%" }}>
        {/* Header */}
        <h1 style={{ fontSize: "35px", fontWeight: "bold", color: "#fff", margin: 0 }}>
          Mission Order
        </h1>
        <p
          style={{
            fontSize: "20px",
            color: "gray",
            fontWeight: "bold",
            marginBottom: "24px",
            marginTop: "6px",
          }}
        >
          Assign a mission order to a worker
        </p>

        {/* Tab-style header bar to match worker page aesthetic */}
        <Box
          sx={{
            backgroundColor: "#1a2742",
            borderRadius: "12px 12px 0 0",
            padding: "12px 16px",
            borderBottom: "2px solid #ffa500",
            display: "inline-block",
            minWidth: "180px",
            textAlign: "center",
          }}
        >
          <span style={{ color: "#fff", fontWeight: 600, fontSize: "15px" }}>
            New Mission Order
          </span>
        </Box>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: "100%" }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              padding: "24px",
              backgroundColor: "#20314E",
              borderRadius: "0 12px 12px 12px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {/* Toast */}
            {toast && (
              <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200" style={{ marginBottom: "16px" }}>
                {toast}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200" style={{ marginBottom: "16px" }}>
                {error}
              </div>
            )}

            {/* Assign to Worker */}
            <label style={labelStyle}>Assign to Worker *</label>
            <select
              value={assignedToId}
              onChange={(e) => setAssignedToId(e.target.value)}
              required
              disabled={workersLoading}
              style={{
                ...inputStyle,
                color: assignedToId ? "#fff" : "gray",
                cursor: workersLoading ? "not-allowed" : "pointer",
              }}
            >
              <option value="" disabled>
                {workersLoading ? "Loading workers..." : "Select a worker"}
              </option>
              {workers.map((worker) => (
                <option key={worker.id} value={worker.id} style={{ color: "#fff", backgroundColor: "rgb(10, 22, 40)" }}>
                  {worker.name} — @{worker.username}
                </option>
              ))}
            </select>

            {/* Destination */}
            <label style={labelStyle}>Destination *</label>
            <input
              type="text"
              placeholder="Ex: Alger"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              style={inputStyle}
            />

            {/* Duration + Purpose */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <label style={labelStyle}>Duration (days) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Number of days"
                  style={inputStyle}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <label style={labelStyle}>Purpose *</label>
                <input
                  type="text"
                  required
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Purpose of the mission"
                  style={inputStyle}
                />
              </Grid>
            </Grid>

            {/* Travel Method */}
            <label style={labelStyle}>Travel Method *</label>
            <select
              value={travelMethod}
              onChange={(e) => setTravelMethod(e.target.value)}
              required
              style={{
                ...inputStyle,
                color: travelMethod ? "#fff" : "gray",
                cursor: "pointer",
              }}
            >
              <option value="" disabled>
                Select Travel Method
              </option>
              <option value="PERSONAL" style={{ color: "#fff", backgroundColor: "rgb(10, 22, 40)" }}>
                Personal
              </option>
              <option value="COMPANY" style={{ color: "#fff", backgroundColor: "rgb(10, 22, 40)" }}>
                Company
              </option>
              <option value="AIRPLANE" style={{ color: "#fff", backgroundColor: "rgb(10, 22, 40)" }}>
                Airplane
              </option>
            </select>

            {/* Action Buttons */}
            <Grid container spacing={2} sx={{ marginTop: "24px" }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Button
                  disabled={isLoading}
                  type="submit"
                  sx={{
                    backgroundColor: "#ffa500",
                    color: "black",
                    fontWeight: "bold",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    width: "100%",
                    textTransform: "none",
                    fontSize: "15px",
                    "&:hover": {
                      backgroundColor: "#ffb733",
                    },
                    "&:disabled": {
                      backgroundColor: "#7a5200",
                      color: "#aaa",
                    },
                  }}
                >
                  {isLoading ? "Assigning..." : "Assign Mission Order"}
                </Button>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Button
                  onClick={handleCancel}
                  sx={{
                    backgroundColor: "transparent",
                    color: "white",
                    fontWeight: "bold",
                    padding: "12px 24px",
                    border: "1px solid white",
                    borderRadius: "8px",
                    width: "100%",
                    textTransform: "none",
                    fontSize: "15px",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                >
                  Cancel
                </Button>
              </Grid>
            </Grid>
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
}