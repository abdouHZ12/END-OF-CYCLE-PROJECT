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
    backgroundColor: "var(--naftal-bg)",
    borderRadius: "5px",
    fontSize: "16px",
    marginTop: "4px",
    marginBottom: "12px",
    paddingTop: "8px",
    paddingBottom: "8px",
    paddingLeft: "10px",
    paddingRight: "10px",
    color: "var(--naftal-text-primary)",
    border: "1px solid var(--naftal-border-subtle)",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    color: "var(--naftal-text-secondary)",
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
        backgroundColor: "var(--naftal-bg)",
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

        <h1 style={{ fontSize: "35px", fontWeight: "bold", color: "var(--naftal-text-primary)", margin: 0 }}>
          Mission Order
        </h1>
        <p
          style={{
            fontSize: "20px",
            color: "var(--naftal-text-muted)",
            fontWeight: "bold",
            marginBottom: "24px",
            marginTop: "6px",
          }}
        >
          Assigne une nouvelle mission a un employee
        </p>

        {/* Tab-style header bar to match worker page aesthetic */}
        <Box
          sx={{
            backgroundColor: "var(--naftal-surface-1)",
            borderRadius: "12px 12px 0 0",
            padding: "12px 16px",
            borderBottom: "2px solid var(--naftal-brand)",
            display: "inline-block",
            minWidth: "180px",
            textAlign: "center",
          }}
        >

          <span style={{ color: "var(--naftal-text-primary)", fontWeight: 600, fontSize: "15px" }}>
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
              backgroundColor: "var(--naftal-surface-3)",
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
            <label style={labelStyle}>Assigné un Employee *</label>
            <select
              value={assignedToId}
              onChange={(e) => setAssignedToId(e.target.value)}
              required
              disabled={workersLoading}
              style={{
                ...inputStyle,
                color: assignedToId ? "var(--naftal-text-primary)" : "gray",
                cursor: workersLoading ? "not-allowed" : "pointer",
              }}
            >
              <option value="" disabled>
                {workersLoading ? "Loading workers..." : "Choisir un employé"}
              </option>
              {workers.map((worker) => (
                <option key={worker.id} value={worker.id} style={{ color: "var(--naftal-text-primary)", backgroundColor: "var(--naftal-bg)" }}>
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
                <label style={labelStyle}>Durré (jours) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Nombre de jours"
                  style={inputStyle}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <label style={labelStyle}>Motif *</label>
                <input
                  type="text"
                  required
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Motif de la mission"
                  style={inputStyle}
                />
              </Grid>
            </Grid>

            {/* Travel Method */}
            <label style={labelStyle}>Méthode de Transport *</label>
            <select
              value={travelMethod}
              onChange={(e) => setTravelMethod(e.target.value)}
              required
              style={{
                ...inputStyle,
                color: travelMethod ? "var(--naftal-text-primary)" : "gray",
                cursor: "pointer",
              }}
            >
              <option value="" disabled>
                Sélectionner la méthode de transport
              </option>

              <option value="PERSONAL" style={{ color: "var(--naftal-text-primary)", backgroundColor: "var(--naftal-bg)" }}>
                Personal
              </option>
              <option value="COMPANY" style={{ color: "var(--naftal-text-primary)", backgroundColor: "var(--naftal-bg)" }}>
                Company
              </option>
              <option value="AIRPLANE" style={{ color: "var(--naftal-text-primary)", backgroundColor: "var(--naftal-bg)" }}>
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
                    backgroundColor: "var(--naftal-brand)",
                    color: "var(--naftal-on-brand)",
                    fontWeight: "bold",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    width: "100%",
                    textTransform: "none",
                    fontSize: "15px",
                    "&:hover": {
                      backgroundColor: "var(--naftal-brand-hover)",
                    },
                    "&:disabled": {
                      backgroundColor: "var(--naftal-brand-border-strong)",
                      color: "var(--naftal-text-muted)",
                    },
                  }}
                >
                  {isLoading ? "Assigning..." : "Assigné l'Ordre de Mission"}
                </Button>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Button
                  onClick={handleCancel}
                  sx={{
                    backgroundColor: "transparent",
                    color: "var(--naftal-text-secondary)",
                    fontWeight: "bold",
                    padding: "12px 24px",
                    border: "1px solid var(--naftal-border)",
                    borderRadius: "8px",
                    width: "100%",
                    textTransform: "none",
                    fontSize: "15px",
                    "&:hover": {
                      backgroundColor: "var(--naftal-hover)",
                    },
                  }}
                >
                  Annuler
                </Button>
              </Grid>
            </Grid>
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
}